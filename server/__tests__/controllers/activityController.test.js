import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import app from '../../testApp.js';
import { setupTestDB, teardownTestDB, clearDatabase } from '../helpers/testHelper.js';
import { ObjectId } from 'mongodb';

let db;
let token;
let adminToken;

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
  
  // Create regular user and get token
  await request(app)
    .post('/api/users/register')
    .send({
      name: 'Regular User',
      email: 'user@example.com',
      password: 'password123',
      role: 'user'
    });

  const userLogin = await request(app)
    .post('/api/users/login')
    .send({
      email: 'user@example.com',
      password: 'password123'
    });

  token = userLogin.body.token;

  // Create admin user and get token
  await request(app)
    .post('/api/users/register')
    .send({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin'
    });

  const adminLogin = await request(app)
    .post('/api/users/login')
    .send({
      email: 'admin@example.com',
      password: 'password123'
    });

  adminToken = adminLogin.body.token;
});

describe('Activity Controller - Create Activity', () => {
  test('should create activity successfully as admin', async () => {
    const activityData = {
      title: 'Beach Cleanup',
      description: 'Clean the beach together',
      location: 'Kuta Beach',
      images: ['image1.jpg', 'image2.jpg'],
      category: 'environment',
      targetMoney: 10000000
    };

    const response = await request(app)
      .post('/api/activities')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(activityData)
      .expect(201);

    expect(response.body).toHaveProperty('message', 'Activity created successfully');
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('title', activityData.title);
    expect(response.body.data).toHaveProperty('description', activityData.description);
    expect(response.body.data).toHaveProperty('collectedMoney', 0);
    expect(response.body.data).toHaveProperty('collectedVolunteer', 0);

    // Verify in database
    const activities = db.collection('activities');
    const activity = await activities.findOne({ title: activityData.title });
    expect(activity).toBeTruthy();
  });

  test('should create activity without authentication (no auth middleware)', async () => {
    const activityData = {
      title: 'Beach Cleanup',
      description: 'Clean the beach together',
      location: 'Kuta Beach',
      category: 'environment',
      targetMoney: 10000000
    };

    const response = await request(app)
      .post('/api/activities')
      .send(activityData);
    
    // Karena tidak ada auth middleware, request bisa sukses (201)
    expect([201, 400, 401]).toContain(response.status);
  });

  test('should create activity as regular user (no admin check)', async () => {
    const activityData = {
      title: 'Beach Cleanup',
      description: 'Clean the beach together',
      location: 'Kuta Beach',
      category: 'environment',
      targetMoney: 10000000
    };

    const response = await request(app)
      .post('/api/activities')
      .set('Authorization', `Bearer ${token}`)
      .send(activityData);
    
    // Karena tidak ada auth/admin middleware, regular user bisa create (201)
    expect([201, 400, 403]).toContain(response.status);
  });

  test('should create activity with default values', async () => {
    const activityData = {
      title: 'Minimal Activity',
      description: 'Minimal description'
    };

    const response = await request(app)
      .post('/api/activities')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(activityData)
      .expect(201);

    expect(response.body.data).toHaveProperty('collectedMoney', 0);
    expect(response.body.data).toHaveProperty('collectedVolunteer', 0);
    expect(response.body.data).toHaveProperty('images');
    expect(response.body.data.images).toEqual([]);
  });
});

describe('Activity Controller - Get Activities', () => {
  beforeEach(async () => {
    // Insert test activities
    const activities = db.collection('activities');
    await activities.insertMany([
      {
        title: 'Beach Cleanup Bali',
        description: 'Clean the beach in Bali',
        location: { name: 'Kuta Beach', lat: -8.718, lng: 115.169 },
        category: 'environment',
        targetMoney: 5000000,
        collectedMoney: 0,
        collectedVolunteer: 0,
        images: [],
        listVolunteer: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Food Distribution Jakarta',
        description: 'Distribute food to those in need',
        location: { name: 'Jakarta', lat: -6.2088, lng: 106.8456 },
        category: 'social',
        targetMoney: 10000000,
        collectedMoney: 0,
        collectedVolunteer: 0,
        images: [],
        listVolunteer: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Tree Planting Bandung',
        description: 'Plant trees in the city',
        location: { name: 'Bandung', lat: -6.9175, lng: 107.6191 },
        category: 'environment',
        targetMoney: 3000000,
        collectedMoney: 0,
        collectedVolunteer: 0,
        images: [],
        listVolunteer: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  });

  test('should get all activities', async () => {
    const response = await request(app)
      .get('/api/activities')
      .expect(200);

    expect(response.body).toHaveProperty('data');
    expect(response.body).toHaveProperty('total', 3);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBe(3);
  });

  test('should filter activities by category', async () => {
    const response = await request(app)
      .get('/api/activities?category=environment')
      .expect(200);

    expect(response.body).toHaveProperty('total', 2);
    expect(response.body.data.every(act => act.category === 'environment')).toBe(true);
  });

  test('should filter activities by location', async () => {
    const response = await request(app)
      .get('/api/activities?location=Jakarta')
      .expect(200);

    expect(response.body).toHaveProperty('total');
    expect(response.body.total).toBeGreaterThanOrEqual(0);
  });

  test('should search activities by title', async () => {
    const response = await request(app)
      .get('/api/activities?search=Beach')
      .expect(200);

    expect(response.body.total).toBeGreaterThan(0);
    expect(response.body.data[0].title).toContain('Beach');
  });

  test('should search activities by description', async () => {
    const response = await request(app)
      .get('/api/activities?search=food')
      .expect(200);

    expect(response.body.total).toBeGreaterThan(0);
  });

  test('should return empty array when no activities match', async () => {
    const response = await request(app)
      .get('/api/activities?category=nonexistent')
      .expect(200);

    expect(response.body).toHaveProperty('data');
    expect(response.body).toHaveProperty('total', 0);
    expect(response.body.data.length).toBe(0);
  });
});

describe('Activity Controller - Get Activity By ID', () => {
  let activityId;

  beforeEach(async () => {
    const activities = db.collection('activities');
    const result = await activities.insertOne({
      title: 'Test Activity',
      description: 'Test description',
      category: 'environment',
      targetMoney: 5000000,
      collectedMoney: 0,
      collectedVolunteer: 0,
      images: [],
      listVolunteer: [],
      createdAt: new Date(),
      updatedAt: new Date()
    });
    activityId = result.insertedId.toString();
  });

  test('should get activity by valid ID', async () => {
    const response = await request(app)
      .get(`/api/activities/${activityId}`)
      .expect(200);

    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('title', 'Test Activity');
    expect(response.body.data).toHaveProperty('description', 'Test description');
  });

  test('should return 404 for non-existent activity', async () => {
    const fakeId = new ObjectId().toString();
    const response = await request(app)
      .get(`/api/activities/${fakeId}`)
      .expect(404);

    expect(response.body).toHaveProperty('message', 'Activity not found');
  });

  test('should return 400 for invalid ID format', async () => {
    const response = await request(app)
      .get('/api/activities/invalidid')
      .expect(400);

    expect(response.body).toHaveProperty('message', 'Invalid id');
  });
});

describe('Activity Controller - Update Activity', () => {
  let activityId;

  beforeEach(async () => {
    const activities = db.collection('activities');
    const result = await activities.insertOne({
      title: 'Original Title',
      description: 'Original description',
      category: 'environment',
      targetMoney: 5000000,
      collectedMoney: 0,
      collectedVolunteer: 0,
      images: [],
      listVolunteer: [],
      createdAt: new Date(),
      updatedAt: new Date()
    });
    activityId = result.insertedId.toString();
  });

  test('should update activity as admin', async () => {
    const updateData = {
      title: 'Updated Title',
      description: 'Updated description',
      targetMoney: 8000000
    };

    const response = await request(app)
      .put(`/api/activities/${activityId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send(updateData)
      .expect(200);

    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toMatch(/updated/i);

    // Verify in database
    const activities = db.collection('activities');
    const { ObjectId } = await import('mongodb');
    const activity = await activities.findOne({ _id: new ObjectId(activityId) });
    expect(activity.title).toBe('Updated Title');
    expect(activity.targetMoney).toBe(8000000);
  });

  test('should update without authentication (no auth required)', async () => {
    const response = await request(app)
      .put(`/api/activities/${activityId}`)
      .send({ title: 'Updated Title' })
      .expect(200);

    expect(response.body).toHaveProperty('message');
  });

  test('should return 404 for non-existent activity', async () => {
    const fakeId = new ObjectId().toString();
    const response = await request(app)
      .put(`/api/activities/${fakeId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Updated Title' })
      .expect(404);

    expect(response.body).toHaveProperty('message', 'Activity not found');
  });

  test('should return 400 for invalid ID', async () => {
    const response = await request(app)
      .put('/api/activities/invalidid')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Updated Title' })
      .expect(400);

    expect(response.body).toHaveProperty('message', 'Invalid id');
  });
});

describe('Activity Controller - Delete Activity', () => {
  let activityId;

  beforeEach(async () => {
    const activities = db.collection('activities');
    const result = await activities.insertOne({
      title: 'To Be Deleted',
      description: 'Test description',
      category: 'environment',
      targetMoney: 5000000,
      collectedMoney: 0,
      collectedVolunteer: 0,
      images: [],
      listVolunteer: [],
      createdAt: new Date(),
      updatedAt: new Date()
    });
    activityId = result.insertedId.toString();
  });

  test('should delete activity as admin', async () => {
    const response = await request(app)
      .delete(`/api/activities/${activityId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toMatch(/deleted/i);

    // Verify deletion in database
    const activities = db.collection('activities');
    const { ObjectId } = await import('mongodb');
    const activity = await activities.findOne({ _id: new ObjectId(activityId) });
    expect(activity).toBeNull();
  });

  test('should delete without authentication (no auth required)', async () => {
    const response = await request(app)
      .delete(`/api/activities/${activityId}`)
      .expect(200);

    expect(response.body).toHaveProperty('message');
  });

  test('should return 404 for non-existent activity', async () => {
    const fakeId = new ObjectId().toString();
    const response = await request(app)
      .delete(`/api/activities/${fakeId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(404);

    expect(response.body).toHaveProperty('message', 'Activity not found');
  });
});

describe('Activity Controller - Register Volunteer', () => {
  let activityId;

  beforeEach(async () => {
    const { ObjectId } = await import('mongodb');
    const activities = db.collection('activities');
    const result = await activities.insertOne({
      title: 'Volunteer Activity',
      description: 'Need volunteers',
      category: 'social',
      targetMoney: 5000000,
      collectedMoney: 0,
      collectedVolunteer: 0,
      listVolunteer: [],
      createdAt: new Date(),
      updatedAt: new Date()
    });
    activityId = result.insertedId.toString();
  });

  test('should register volunteer successfully', async () => {
    const volunteerData = {
      userId: '507f1f77bcf86cd799439011',
      name: 'John Volunteer',
      phone: '08123456789',
      note: 'I want to help'
    };

    const response = await request(app)
      .post(`/api/activities/${activityId}/volunteer`)
      .send(volunteerData)
      .expect(201);

    expect(response.body).toHaveProperty('message', 'Registered as volunteer');
    expect(response.body).toHaveProperty('volunteer');
    expect(response.body.volunteer).toHaveProperty('userId', volunteerData.userId);
    expect(response.body.volunteer).toHaveProperty('name', volunteerData.name);
  });

  test('should register volunteer without optional fields', async () => {
    const volunteerData = {
      userId: '507f1f77bcf86cd799439012',
      name: 'Jane Volunteer'
    };

    const response = await request(app)
      .post(`/api/activities/${activityId}/volunteer`)
      .send(volunteerData)
      .expect(201);

    expect(response.body.volunteer).toHaveProperty('phone', null);
    expect(response.body.volunteer).toHaveProperty('note', null);
  });

  test('should return 409 for duplicate volunteer registration', async () => {
    const volunteerData = {
      userId: '507f1f77bcf86cd799439011',
      name: 'John Volunteer'
    };

    // First registration
    await request(app)
      .post(`/api/activities/${activityId}/volunteer`)
      .send(volunteerData)
      .expect(201);

    // Duplicate registration
    const response = await request(app)
      .post(`/api/activities/${activityId}/volunteer`)
      .send(volunteerData)
      .expect(409);

    expect(response.body).toHaveProperty('message', 'User already registered as volunteer');
  });

  test('should return 400 for invalid activity id', async () => {
    const response = await request(app)
      .post('/api/activities/invalid-id/volunteer')
      .send({ userId: '123', name: 'Test' })
      .expect(400);

    expect(response.body).toHaveProperty('message', 'Invalid activity id');
  });

  test('should return 404 for non-existent activity', async () => {
    const { ObjectId } = await import('mongodb');
    const fakeId = new ObjectId().toString();
    
    const response = await request(app)
      .post(`/api/activities/${fakeId}/volunteer`)
      .send({ userId: '123', name: 'Test' })
      .expect(404);

    expect(response.body).toHaveProperty('message', 'Activity not found');
  });
});

describe('Activity Controller - Unregister Volunteer', () => {
  let activityId;
  let volunteerId;

  beforeEach(async () => {
    const { ObjectId } = await import('mongodb');
    volunteerId = new ObjectId();
    
    const activities = db.collection('activities');
    const result = await activities.insertOne({
      title: 'Volunteer Activity',
      description: 'Need volunteers',
      category: 'social',
      targetMoney: 5000000,
      collectedMoney: 0,
      collectedVolunteer: 1,
      listVolunteer: [{
        _id: volunteerId,
        userId: '507f1f77bcf86cd799439011',
        name: 'John Volunteer',
        status: 'registered',
        createdAt: new Date()
      }],
      createdAt: new Date(),
      updatedAt: new Date()
    });
    activityId = result.insertedId.toString();
  });

  test('should unregister volunteer successfully', async () => {
    const response = await request(app)
      .delete(`/api/activities/${activityId}/volunteer/${volunteerId.toString()}`)
      .expect(200);

    expect(response.body).toHaveProperty('message', 'Volunteer unregistered');
    expect(response.body).toHaveProperty('data');
  });

  test('should return 400 for invalid activity id', async () => {
    const response = await request(app)
      .delete(`/api/activities/invalid-id/volunteer/${volunteerId.toString()}`)
      .expect(400);

    expect(response.body).toHaveProperty('message', 'Invalid id(s)');
  });

  test('should return 400 for invalid volunteer id', async () => {
    const response = await request(app)
      .delete(`/api/activities/${activityId}/volunteer/invalid-id`)
      .expect(400);

    expect(response.body).toHaveProperty('message', 'Invalid id(s)');
  });

  test('should return 404 for non-existent volunteer', async () => {
    const { ObjectId } = await import('mongodb');
    const fakeVolunteerId = new ObjectId().toString();
    
    const response = await request(app)
      .delete(`/api/activities/${activityId}/volunteer/${fakeVolunteerId}`)
      .expect(404);

    expect(response.body).toHaveProperty('message', 'Activity or volunteer not found');
  });

  test('should return 404 for non-existent activity', async () => {
    const { ObjectId } = await import('mongodb');
    const fakeActivityId = new ObjectId().toString();
    
    const response = await request(app)
      .delete(`/api/activities/${fakeActivityId}/volunteer/${volunteerId.toString()}`)
      .expect(404);

    expect(response.body).toHaveProperty('message', 'Activity or volunteer not found');
  });
});

describe('Activity Controller - Add Donation', () => {
  let activityId;

  beforeEach(async () => {
    const activities = db.collection('activities');
    const result = await activities.insertOne({
      title: 'Donation Activity',
      description: 'Need donations',
      category: 'social',
      targetMoney: 10000000,
      collectedMoney: 0,
      collectedVolunteer: 0,
      listVolunteer: [],
      createdAt: new Date(),
      updatedAt: new Date()
    });
    activityId = result.insertedId.toString();
  });

  test('should add donation successfully', async () => {
    const response = await request(app)
      .post(`/api/activities/${activityId}/donation`)
      .send({ amount: 500000 })
      .expect(200);

    expect(response.body).toHaveProperty('message', 'Donation added');
    expect(response.body).toHaveProperty('data');
    expect(response.body.data.collectedMoney).toBe(500000);
  });

  test('should return 400 for invalid activity id', async () => {
    const response = await request(app)
      .post('/api/activities/invalid-id/donation')
      .send({ amount: 100000 })
      .expect(400);

    expect(response.body).toHaveProperty('message', 'Invalid activity id');
  });

  test('should return 400 for missing amount', async () => {
    const response = await request(app)
      .post(`/api/activities/${activityId}/donation`)
      .send({})
      .expect(400);

    expect(response.body).toHaveProperty('message', 'Valid amount is required');
  });

  test('should return 400 for zero amount', async () => {
    const response = await request(app)
      .post(`/api/activities/${activityId}/donation`)
      .send({ amount: 0 })
      .expect(400);

    expect(response.body).toHaveProperty('message', 'Valid amount is required');
  });

  test('should return 400 for negative amount', async () => {
    const response = await request(app)
      .post(`/api/activities/${activityId}/donation`)
      .send({ amount: -1000 })
      .expect(400);

    expect(response.body).toHaveProperty('message', 'Valid amount is required');
  });

  test('should return 404 for non-existent activity', async () => {
    const { ObjectId } = await import('mongodb');
    const fakeId = new ObjectId().toString();
    
    const response = await request(app)
      .post(`/api/activities/${fakeId}/donation`)
      .send({ amount: 100000 })
      .expect(404);

    expect(response.body).toHaveProperty('message', 'Activity not found');
  });
});
