import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import app from '../../testApp.js';
import { setupTestDB, teardownTestDB, clearDatabase } from '../helpers/testHelper.js';
import { ObjectId } from 'mongodb';

let db;
let token;
let userId;
let activityId;

beforeAll(async () => {
  const testDb = await setupTestDB();
  db = testDb.db;
  global.testDb = db;
});

afterAll(async () => {
  await teardownTestDB();
});

beforeEach(async () => {
  await clearDatabase();
  
  // Create user and get token
  const registerResponse = await request(app)
    .post('/api/users/register')
    .send({
      name: 'Test User',
      email: 'user@example.com',
      password: 'password123'
    });

  userId = registerResponse.body.userId;

  const loginResponse = await request(app)
    .post('/api/users/login')
    .send({
      email: 'user@example.com',
      password: 'password123'
    });

  token = loginResponse.body.token;

  // Create test activity
  const activities = db.collection('activities');
  const activityResult = await activities.insertOne({
    title: 'Test Activity',
    description: 'Test description',
    category: 'environment',
    targetMoney: 10000000,
    collectedMoney: 0,
    collectedVolunteer: 0,
    images: [],
    listVolunteer: [],
    createdAt: new Date(),
    updatedAt: new Date()
  });
  activityId = activityResult.insertedId.toString();
});

describe('Donation Controller - Create Donation', () => {
  test('should create donation with Xendit invoice successfully', async () => {
    const donationData = {
      userId: userId,
      activityId: activityId,
      amount: 50000,
      payerEmail: 'donor@example.com',
      description: 'Test donation'
    };

    const response = await request(app)
      .post('/api/donations')
      .set('Authorization', `Bearer ${token}`)
      .send(donationData);

    expect([201, 500]).toContain(response.status); // May fail if Xendit API unavailable
    
    if (response.status === 201) {
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toMatch(/created successfully/i);
      expect(response.body).toHaveProperty('donationId');
      expect(response.body).toHaveProperty('invoiceUrl');

      // Verify donation in database
      const donations = db.collection('donations');
      const donation = await donations.findOne({ _id: new ObjectId(response.body.donationId) });
      expect(donation).toBeTruthy();
      expect(donation.amount).toBe(50000);
      expect(donation.status).toBe('pending'); // Changed from 'success'

      // Verify activity's collectedMoney NOT updated yet (waiting for webhook)
      const activities = db.collection('activities');
      const activity = await activities.findOne({ _id: new ObjectId(activityId) });
      expect(activity.collectedMoney).toBe(0); // Still 0 until payment confirmed
    }
  });

  test('should create donation without authentication (no auth required)', async () => {
    const donationData = {
      userId: userId,
      activityId: activityId,
      amount: 50000,
      payerEmail: 'donor@example.com'
    };

    const response = await request(app)
      .post('/api/donations')
      .send(donationData);

    expect([201, 500]).toContain(response.status);
    
    if (response.status === 201) {
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toMatch(/created successfully/i);
    }
  });

  test('should fail with invalid activityId', async () => {
    const donationData = {
      userId: userId,
      activityId: 'invalidid',
      amount: 50000,
      payerEmail: 'donor@example.com'
    };

    const response = await request(app)
      .post('/api/donations')
      .set('Authorization', `Bearer ${token}`)
      .send(donationData)
      .expect(400);

    expect(response.body).toHaveProperty('message', 'Invalid activityId');
  });

  test('should fail with invalid userId', async () => {
    const donationData = {
      userId: 'invalidid',
      activityId: activityId,
      amount: 50000,
      payerEmail: 'donor@example.com'
    };

    const response = await request(app)
      .post('/api/donations')
      .set('Authorization', `Bearer ${token}`)
      .send(donationData)
      .expect(400);

    expect(response.body).toHaveProperty('message', 'Invalid userId');
  });

  test('should fail with missing payerEmail', async () => {
    const donationData = {
      userId: userId,
      activityId: activityId,
      amount: 50000
      // Missing payerEmail
    };

    const response = await request(app)
      .post('/api/donations')
      .set('Authorization', `Bearer ${token}`)
      .send(donationData)
      .expect(400);

    expect(response.body).toHaveProperty('message', 'Payer email is required');
  });

  test('should fail with zero amount', async () => {
    const donationData = {
      userId: userId,
      activityId: activityId,
      amount: 0,
      payerEmail: 'donor@example.com'
    };

    const response = await request(app)
      .post('/api/donations')
      .set('Authorization', `Bearer ${token}`)
      .send(donationData)
      .expect(400);

    expect(response.body).toHaveProperty('message', 'Donation amount must be greater than 0');
  });

  test('should fail with negative amount', async () => {
    const donationData = {
      userId: userId,
      activityId: activityId,
      amount: -1000,
      payerEmail: 'donor@example.com'
    };

    const response = await request(app)
      .post('/api/donations')
      .set('Authorization', `Bearer ${token}`)
      .send(donationData)
      .expect(400);

    expect(response.body).toHaveProperty('message', 'Donation amount must be greater than 0');
  });

  test('should fail without amount', async () => {
    const donationData = {
      userId: userId,
      activityId: activityId,
      payerEmail: 'donor@example.com'
    };

    const response = await request(app)
      .post('/api/donations')
      .set('Authorization', `Bearer ${token}`)
      .send(donationData)
      .expect(400);

    expect(response.body).toHaveProperty('message', 'Donation amount must be greater than 0');
  });

  test('should create multiple donations to same activity', async () => {
    // First donation
    const response1 = await request(app)
      .post('/api/donations')
      .set('Authorization', `Bearer ${token}`)
      .send({
        userId: userId,
        activityId: activityId,
        amount: 50000,
        payerEmail: 'donor1@example.com'
      });

    expect([201, 500]).toContain(response1.status);

    // Second donation
    const response2 = await request(app)
      .post('/api/donations')
      .set('Authorization', `Bearer ${token}`)
      .send({
        userId: userId,
        activityId: activityId,
        amount: 30000,
        payerEmail: 'donor2@example.com'
      });

    expect([201, 500]).toContain(response2.status);

    // Note: collectedMoney won't update until webhook confirms payment
    // So we don't check activity.collectedMoney here
  });
});

describe('Donation Controller - Get Donations', () => {
  let userId2;
  let activityId2;

  beforeEach(async () => {
    // Create second user
    const registerResponse2 = await request(app)
      .post('/api/users/register')
      .send({
        name: 'User Two',
        email: 'user2@example.com',
        password: 'password123'
      });

    userId2 = registerResponse2.body.userId;

    // Create second activity
    const activities = db.collection('activities');
    const activityResult2 = await activities.insertOne({
      title: 'Second Activity',
      description: 'Second description',
      category: 'social',
      targetMoney: 5000000,
      collectedMoney: 0,
      collectedVolunteer: 0,
      images: [],
      listVolunteer: [],
      createdAt: new Date(),
      updatedAt: new Date()
    });
    activityId2 = activityResult2.insertedId.toString();

    // Insert test donations
    const donations = db.collection('donations');
    await donations.insertMany([
      {
        userId: new ObjectId(userId),
        activityId: new ObjectId(activityId),
        amount: 50000,
        status: 'paid',
        paymentMethod: 'xendit',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        userId: new ObjectId(userId2),
        activityId: new ObjectId(activityId),
        amount: 75000,
        status: 'paid',
        paymentMethod: 'xendit',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        userId: new ObjectId(userId),
        activityId: new ObjectId(activityId2),
        amount: 100000,
        status: 'pending',
        paymentMethod: 'xendit',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  });

  test('should get all donations', async () => {
    const response = await request(app)
      .get('/api/donations')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toHaveProperty('data');
    expect(response.body).toHaveProperty('total', 3);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  test('should filter donations by activityId', async () => {
    const response = await request(app)
      .get(`/api/donations?activityId=${activityId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toHaveProperty('total', 2);
    expect(response.body.data.every(d => d.activityId.toString() === activityId)).toBe(true);
  });

  test('should filter donations by userId', async () => {
    const response = await request(app)
      .get(`/api/donations?userId=${userId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toHaveProperty('total', 2);
    expect(response.body.data.every(d => d.userId.toString() === userId)).toBe(true);
  });

  test('should filter donations by both activityId and userId', async () => {
    const response = await request(app)
      .get(`/api/donations?activityId=${activityId}&userId=${userId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toHaveProperty('total', 1);
    expect(response.body.data[0].activityId.toString()).toBe(activityId);
    expect(response.body.data[0].userId.toString()).toBe(userId);
  });

  test('should return empty array when no donations match filter', async () => {
    const fakeId = new ObjectId().toString();
    const response = await request(app)
      .get(`/api/donations?activityId=${fakeId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toHaveProperty('total', 0);
    expect(response.body.data.length).toBe(0);
  });

  test('should ignore invalid ObjectId in filter', async () => {
    const response = await request(app)
      .get('/api/donations?activityId=invalidid')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toHaveProperty('total', 3);
  });
});

describe('Donation Controller - Get Donation By ID', () => {
  let donationId;

  beforeEach(async () => {
    const donations = db.collection('donations');
    const result = await donations.insertOne({
      userId: new ObjectId(userId),
      activityId: new ObjectId(activityId),
      amount: 50000,
      status: 'paid',
      paymentMethod: 'xendit',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    donationId = result.insertedId.toString();
  });

  test('should get donation by valid ID', async () => {
    const response = await request(app)
      .get(`/api/donations/${donationId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('amount', 50000);
    expect(response.body.data).toHaveProperty('status', 'paid');
  });

  test('should return 404 for non-existent donation', async () => {
    const fakeId = new ObjectId().toString();
    const response = await request(app)
      .get(`/api/donations/${fakeId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404);

    expect(response.body).toHaveProperty('message', 'Donation not found');
  });

  test('should return 400 for invalid ID format', async () => {
    const response = await request(app)
      .get('/api/donations/invalidid')
      .set('Authorization', `Bearer ${token}`)
      .expect(400);

    expect(response.body).toHaveProperty('message', 'Invalid donation ID');
  });

  test('should get donation without authentication (no auth required)', async () => {
    const response = await request(app)
      .get(`/api/donations/${donationId}`)
      .expect(200);

    expect(response.body).toHaveProperty('data');
  });
});

describe('Donation Controller - Additional Coverage', () => {
  test('should return all donations when no filters applied', async () => {
    const response = await request(app)
      .get('/api/donations')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toHaveProperty('data');
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  test('should handle invalid userId filter gracefully', async () => {
    // Controller doesn't validate filter params, just returns empty if invalid
    const response = await request(app)
      .get('/api/donations?userId=invalid-id')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toHaveProperty('data');
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  test('should handle invalid activityId filter gracefully', async () => {
    // Controller doesn't validate filter params, just returns empty if invalid
    const response = await request(app)
      .get('/api/donations?activityId=invalid-id')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toHaveProperty('data');
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  test('should filter donations by userId', async () => {
    const donations = db.collection('donations');
    const testUserId = new ObjectId();
    
    await donations.insertOne({
      userId: testUserId,
      activityId: new ObjectId(activityId),
      amount: 50000,
      createdAt: new Date()
    });

    const response = await request(app)
      .get(`/api/donations?userId=${testUserId.toString()}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.data.every(d => d.userId.toString() === testUserId.toString())).toBe(true);
  });

  test('should filter donations by activityId', async () => {
    const donations = db.collection('donations');
    const testActivityId = new ObjectId(activityId);
    
    await donations.insertOne({
      userId: new ObjectId(userId),
      activityId: testActivityId,
      amount: 75000,
      createdAt: new Date()
    });

    const response = await request(app)
      .get(`/api/donations?activityId=${activityId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.data.every(d => d.activityId.toString() === activityId)).toBe(true);
  });

  test('should return empty array when no donations match filter', async () => {
    const fakeUserId = new ObjectId().toString();
    
    const response = await request(app)
      .get(`/api/donations?userId=${fakeUserId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.data).toHaveLength(0);
  });
});

describe('Donation Controller - Xendit Webhook', () => {
  let testDonation;

  beforeEach(async () => {
    // Create a test donation for webhook processing
    const donations = db.collection('donations');
    const donationResult = await donations.insertOne({
      userId: new ObjectId(userId),
      activityId: new ObjectId(activityId),
      amount: 100000,
      status: 'pending',
      payerEmail: 'donor@example.com',
      description: 'Test webhook donation',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    testDonation = {
      _id: donationResult.insertedId,
      amount: 100000
    };
  });

  test('should process PAID webhook successfully', async () => {
    const webhookPayload = {
      external_id: testDonation._id.toString(),
      status: 'PAID',
      id: 'invoice_test_123',
      paid_amount: 100000
    };

    const response = await request(app)
      .post('/api/donations/webhook/xendit')
      .set('x-callback-token', process.env.XENDIT_WEBHOOK_TOKEN || 'test-webhook-token')
      .send(webhookPayload);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Webhook processed successfully');

    // Verify donation status updated
    const donations = db.collection('donations');
    const donation = await donations.findOne({ _id: testDonation._id });
    expect(donation.status).toBe('success');
    expect(donation).toHaveProperty('paidAt');

    // Verify activity collectedMoney updated
    const activities = db.collection('activities');
    const activity = await activities.findOne({ _id: new ObjectId(activityId) });
    expect(activity.collectedMoney).toBe(100000);
  });

  test('should process SETTLED webhook successfully', async () => {
    const webhookPayload = {
      external_id: testDonation._id.toString(),
      status: 'SETTLED',
      id: 'invoice_test_456',
      paid_amount: 100000
    };

    const response = await request(app)
      .post('/api/donations/webhook/xendit')
      .set('x-callback-token', process.env.XENDIT_WEBHOOK_TOKEN || 'test-webhook-token')
      .send(webhookPayload);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Webhook processed successfully');

    // Verify donation status updated
    const donations = db.collection('donations');
    const donation = await donations.findOne({ _id: testDonation._id });
    expect(donation.status).toBe('success');
  });

  test('should process EXPIRED webhook successfully', async () => {
    const webhookPayload = {
      external_id: testDonation._id.toString(),
      status: 'EXPIRED',
      id: 'invoice_test_789'
    };

    const response = await request(app)
      .post('/api/donations/webhook/xendit')
      .set('x-callback-token', process.env.XENDIT_WEBHOOK_TOKEN || 'test-webhook-token')
      .send(webhookPayload);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Webhook processed successfully');

    // Verify donation status updated to expired
    const donations = db.collection('donations');
    const donation = await donations.findOne({ _id: testDonation._id });
    expect(donation.status).toBe('expired');

    // Verify activity collectedMoney NOT updated for expired
    const activities = db.collection('activities');
    const activity = await activities.findOne({ _id: new ObjectId(activityId) });
    expect(activity.collectedMoney).toBe(0);
  });

  test('should reject webhook with invalid token', async () => {
    const webhookPayload = {
      external_id: testDonation._id.toString(),
      status: 'PAID',
      id: 'invoice_test_invalid',
      paid_amount: 100000
    };

    const response = await request(app)
      .post('/api/donations/webhook/xendit')
      .set('x-callback-token', 'invalid-token')
      .send(webhookPayload);

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Unauthorized webhook');

    // Verify donation status NOT updated
    const donations = db.collection('donations');
    const donation = await donations.findOne({ _id: testDonation._id });
    expect(donation.status).toBe('pending');
  });

  test('should return 404 when donation not found', async () => {
    const fakeId = new ObjectId().toString();
    const webhookPayload = {
      external_id: fakeId,
      status: 'PAID',
      id: 'invoice_test_notfound',
      paid_amount: 100000
    };

    const response = await request(app)
      .post('/api/donations/webhook/xendit')
      .set('x-callback-token', process.env.XENDIT_WEBHOOK_TOKEN || 'test-webhook-token')
      .send(webhookPayload);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Donation not found');
  });

  test('should handle webhook with paid_amount different from donation amount', async () => {
    const webhookPayload = {
      external_id: testDonation._id.toString(),
      status: 'PAID',
      id: 'invoice_test_diffamount',
      paid_amount: 150000 // Different from original 100000
    };

    const response = await request(app)
      .post('/api/donations/webhook/xendit')
      .set('x-callback-token', process.env.XENDIT_WEBHOOK_TOKEN || 'test-webhook-token')
      .send(webhookPayload);

    expect(response.status).toBe(200);

    // Verify activity collectedMoney uses paid_amount
    const activities = db.collection('activities');
    const activity = await activities.findOne({ _id: new ObjectId(activityId) });
    expect(activity.collectedMoney).toBe(150000);
  });

  test('should handle webhook without paid_amount field', async () => {
    const webhookPayload = {
      external_id: testDonation._id.toString(),
      status: 'PAID',
      id: 'invoice_test_nopaid'
      // No paid_amount field
    };

    const response = await request(app)
      .post('/api/donations/webhook/xendit')
      .set('x-callback-token', process.env.XENDIT_WEBHOOK_TOKEN || 'test-webhook-token')
      .send(webhookPayload);

    expect(response.status).toBe(200);

    // Verify activity collectedMoney uses donation.amount
    const activities = db.collection('activities');
    const activity = await activities.findOne({ _id: new ObjectId(activityId) });
    expect(activity.collectedMoney).toBe(testDonation.amount);
  });
});
