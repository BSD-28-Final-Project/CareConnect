import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import app from '../../testApp.js';
import { setupTestDB, teardownTestDB, clearDatabase } from '../helpers/testHelper.js';
import { ObjectId } from 'mongodb';

let db;
let token;
let adminToken;
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

  // Create test activity
  const activities = db.collection('activities');
  const activityResult = await activities.insertOne({
    title: 'Test Activity',
    description: 'Test description',
    category: 'environment',
    targetMoney: 10000000,
    collectedMoney: 5000000,
    collectedVolunteer: 0,
    images: [],
    listVolunteer: [],
    createdAt: new Date(),
    updatedAt: new Date()
  });
  activityId = activityResult.insertedId.toString();
});

describe('Expense Controller - Create Expense', () => {
  test('should create expense successfully as admin', async () => {
    const expenseData = {
      activityId: activityId,
      title: 'Transportation Cost',
      amount: 500000
    };

    const response = await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(expenseData)
      .expect(201);

    expect(response.body).toHaveProperty('message', 'Expense created successfully');
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('title', 'Transportation Cost');
    expect(response.body.data).toHaveProperty('amount', 500000);

    // Verify in database
    const expenses = db.collection('expenses');
    const expense = await expenses.findOne({ title: 'Transportation Cost' });
    expect(expense).toBeTruthy();
    expect(expense.amount).toBe(500000);
  });

  test('should create expense with authentication', async () => {
    const expenseData = {
      activityId: activityId,
      title: 'Transportation Cost',
      amount: 500000
    };

    const response = await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${token}`)
      .send(expenseData)
      .expect(201);

    expect(response.body).toHaveProperty('message', 'Expense created successfully');
  });

  test('should create expense as regular user (no auth required)', async () => {
    const expenseData = {
      activityId: activityId,
      title: 'Transportation Cost',
      amount: 500000
    };

    const response = await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${token}`)
      .send(expenseData)
      .expect(201);

    expect(response.body).toHaveProperty('message', 'Expense created successfully');
  });

  test('should fail when activityId is missing', async () => {
    const expenseData = {
      title: 'Transportation Cost',
      amount: 500000
    };

    const response = await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(expenseData)
      .expect(400);

    expect(response.body).toHaveProperty('message', 'activityId, title, and amount are required');
  });

  test('should fail when title is missing', async () => {
    const expenseData = {
      activityId: activityId,
      amount: 500000
    };

    const response = await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(expenseData)
      .expect(400);

    expect(response.body).toHaveProperty('message', 'activityId, title, and amount are required');
  });

  test('should fail when amount is missing', async () => {
    const expenseData = {
      activityId: activityId,
      title: 'Transportation Cost'
    };

    const response = await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(expenseData)
      .expect(400);

    expect(response.body).toHaveProperty('message', 'activityId, title, and amount are required');
  });

  test('should fail with invalid activityId', async () => {
    const expenseData = {
      activityId: 'invalidid',
      title: 'Transportation Cost',
      amount: 500000
    };

    const response = await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(expenseData)
      .expect(400);

    expect(response.body).toHaveProperty('message', 'Invalid activityId format');
  });

  test('should fail with zero amount', async () => {
    const expenseData = {
      activityId: activityId,
      title: 'Transportation Cost',
      amount: 0
    };

    const response = await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(expenseData)
      .expect(400);

    expect(response.body.message).toMatch(/amount|required/i);
  });

  test('should fail with negative amount', async () => {
    const expenseData = {
      activityId: activityId,
      title: 'Transportation Cost',
      amount: -1000
    };

    const response = await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(expenseData)
      .expect(400);

    expect(response.body).toHaveProperty('message', 'Amount must be a positive number');
  });

  test('should fail when activity does not exist', async () => {
    const fakeActivityId = new ObjectId().toString();
    const expenseData = {
      activityId: fakeActivityId,
      title: 'Transportation Cost',
      amount: 500000
    };

    const response = await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(expenseData)
      .expect(404);

    expect(response.body).toHaveProperty('message', 'Activity not found');
  });

  test('should trim title whitespace', async () => {
    const expenseData = {
      activityId: activityId,
      title: '  Transportation Cost  ',
      amount: 500000
    };

    const response = await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(expenseData)
      .expect(201);

    expect(response.body.data.title).toBe('Transportation Cost');
  });
});

describe('Expense Controller - Get Expenses', () => {
  let activityId2;

  beforeEach(async () => {
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

    // Insert test expenses
    const expenses = db.collection('expenses');
    await expenses.insertMany([
      {
        activityId: new ObjectId(activityId),
        title: 'Transportation',
        amount: 500000,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        activityId: new ObjectId(activityId),
        title: 'Food',
        amount: 300000,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        activityId: new ObjectId(activityId2),
        title: 'Supplies',
        amount: 200000,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  });

  test('should get all expenses', async () => {
    const response = await request(app)
      .get('/api/expenses')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toHaveProperty('data');
    expect(response.body).toHaveProperty('total', 3);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  test('should filter expenses by activityId', async () => {
    const response = await request(app)
      .get(`/api/expenses?activityId=${activityId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toHaveProperty('total', 2);
    expect(response.body.data.every(e => e.activityId.toString() === activityId)).toBe(true);
  });

  test('should return empty array when no expenses match filter', async () => {
    const fakeId = new ObjectId().toString();
    const response = await request(app)
      .get(`/api/expenses?activityId=${fakeId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toHaveProperty('total', 0);
    expect(response.body.data.length).toBe(0);
  });

  test('should fail with invalid activityId format', async () => {
    const response = await request(app)
      .get('/api/expenses?activityId=invalidid')
      .set('Authorization', `Bearer ${token}`)
      .expect(400);

    expect(response.body).toHaveProperty('message', 'Invalid activityId format');
  });

  test('should get expenses without authentication (no auth required)', async () => {
    const response = await request(app)
      .get('/api/expenses')
      .expect(200);

    expect(response.body).toHaveProperty('data');
  });
});

describe('Expense Controller - Get Expenses By Activity', () => {
  beforeEach(async () => {
    const expenses = db.collection('expenses');
    await expenses.insertMany([
      {
        activityId: new ObjectId(activityId),
        title: 'Transportation',
        amount: 500000,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        activityId: new ObjectId(activityId),
        title: 'Food',
        amount: 300000,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  });

  test('should get expenses for specific activity', async () => {
    const response = await request(app)
      .get(`/api/expenses/activity/${activityId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toHaveProperty('data');
    expect(response.body).toHaveProperty('total', 2);
    expect(response.body.data.every(e => e.activityId.toString() === activityId)).toBe(true);
  });

  test('should return empty array for activity with no expenses', async () => {
    const fakeId = new ObjectId().toString();
    const response = await request(app)
      .get(`/api/expenses/activity/${fakeId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toHaveProperty('total', 0);
  });

  test('should fail with invalid activityId', async () => {
    const response = await request(app)
      .get('/api/expenses/activity/invalidid')
      .set('Authorization', `Bearer ${token}`)
      .expect(400);

    expect(response.body).toHaveProperty('message', 'Invalid activityId format');
  });
});

describe('Expense Controller - Get Expense By ID', () => {
  let expenseId;

  beforeEach(async () => {
    const expenses = db.collection('expenses');
    const result = await expenses.insertOne({
      activityId: new ObjectId(activityId),
      title: 'Test Expense',
      amount: 100000,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    expenseId = result.insertedId.toString();
  });

  test('should get expense by id', async () => {
    const response = await request(app)
      .get(`/api/expenses/${expenseId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('title', 'Test Expense');
  });

  test('should return 400 for invalid expense id', async () => {
    const response = await request(app)
      .get('/api/expenses/invalid-id')
      .set('Authorization', `Bearer ${token}`)
      .expect(400);

    expect(response.body).toHaveProperty('message', 'Invalid expense ID format');
  });

  test('should return 404 for non-existent expense', async () => {
    const fakeId = new ObjectId().toString();
    const response = await request(app)
      .get(`/api/expenses/${fakeId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404);

    expect(response.body).toHaveProperty('message', 'Expense not found');
  });
});

describe('Expense Controller - Update Expense', () => {
  let expenseId;

  beforeEach(async () => {
    const expenses = db.collection('expenses');
    const result = await expenses.insertOne({
      activityId: new ObjectId(activityId),
      title: 'Original Title',
      amount: 100000,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    expenseId = result.insertedId.toString();
  });

  test('should update expense title and amount', async () => {
    const updateData = {
      title: 'Updated Title',
      amount: 200000
    };

    const response = await request(app)
      .put(`/api/expenses/${expenseId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send(updateData)
      .expect(200);

    expect(response.body).toHaveProperty('message', 'Expense updated successfully');
    expect(response.body.data).toHaveProperty('title', 'Updated Title');
    expect(response.body.data).toHaveProperty('amount', 200000);
  });

  test('should update only title', async () => {
    const response = await request(app)
      .put(`/api/expenses/${expenseId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'New Title' })
      .expect(200);

    expect(response.body.data).toHaveProperty('title', 'New Title');
    expect(response.body.data).toHaveProperty('amount', 100000); // unchanged
  });

  test('should update only amount', async () => {
    const response = await request(app)
      .put(`/api/expenses/${expenseId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ amount: 300000 })
      .expect(200);

    expect(response.body.data).toHaveProperty('title', 'Original Title'); // unchanged
    expect(response.body.data).toHaveProperty('amount', 300000);
  });

  test('should return 400 for invalid expense id', async () => {
    const response = await request(app)
      .put('/api/expenses/invalid-id')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Test' })
      .expect(400);

    expect(response.body).toHaveProperty('message', 'Invalid expense ID format');
  });

  test('should return 400 for empty title', async () => {
    const response = await request(app)
      .put(`/api/expenses/${expenseId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: '   ' })
      .expect(400);

    expect(response.body).toHaveProperty('message', 'Title must be a non-empty string');
  });

  test('should return 400 for non-string title', async () => {
    const response = await request(app)
      .put(`/api/expenses/${expenseId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 123 })
      .expect(400);

    expect(response.body).toHaveProperty('message', 'Title must be a non-empty string');
  });

  test('should return 400 for zero amount', async () => {
    const response = await request(app)
      .put(`/api/expenses/${expenseId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ amount: 0 })
      .expect(400);

    expect(response.body).toHaveProperty('message', 'Amount must be a positive number');
  });

  test('should return 400 for negative amount', async () => {
    const response = await request(app)
      .put(`/api/expenses/${expenseId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ amount: -1000 })
      .expect(400);

    expect(response.body).toHaveProperty('message', 'Amount must be a positive number');
  });

  test('should return 400 for non-number amount', async () => {
    const response = await request(app)
      .put(`/api/expenses/${expenseId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ amount: 'not a number' })
      .expect(400);

    expect(response.body).toHaveProperty('message', 'Amount must be a positive number');
  });

  test('should return 404 for non-existent expense', async () => {
    const fakeId = new ObjectId().toString();
    const response = await request(app)
      .put(`/api/expenses/${fakeId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Test' })
      .expect(404);

    expect(response.body).toHaveProperty('message', 'Expense not found');
  });

  test('should trim title whitespace', async () => {
    const response = await request(app)
      .put(`/api/expenses/${expenseId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: '  Trimmed Title  ' })
      .expect(200);

    expect(response.body.data.title).toBe('Trimmed Title');
  });
});

describe('Expense Controller - Delete Expense', () => {
  let expenseId;

  beforeEach(async () => {
    const expenses = db.collection('expenses');
    const result = await expenses.insertOne({
      activityId: new ObjectId(activityId),
      title: 'To Be Deleted',
      amount: 100000,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    expenseId = result.insertedId.toString();
  });

  test('should delete expense successfully', async () => {
    const response = await request(app)
      .delete(`/api/expenses/${expenseId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('message', 'Expense deleted successfully');

    // Verify deletion
    const expenses = db.collection('expenses');
    const expense = await expenses.findOne({ _id: new ObjectId(expenseId) });
    expect(expense).toBeNull();
  });

  test('should return 400 for invalid expense id', async () => {
    const response = await request(app)
      .delete('/api/expenses/invalid-id')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(400);

    expect(response.body).toHaveProperty('message', 'Invalid expense ID format');
  });

  test('should return 404 for non-existent expense', async () => {
    const fakeId = new ObjectId().toString();
    const response = await request(app)
      .delete(`/api/expenses/${fakeId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(404);

    expect(response.body).toHaveProperty('message', 'Expense not found');
  });
});
