import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import app from '../../testApp.js';
import { setupTestDB, teardownTestDB, clearDatabase } from '../helpers/testHelper.js';

let token;

beforeAll(async () => {
  await setupTestDB();
});

afterAll(async () => {
  await teardownTestDB();
});

beforeEach(async () => {
  await clearDatabase();
  
  // Create user and get token
  await request(app)
    .post('/api/users/register')
    .send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'user'
    });

  const loginResponse = await request(app)
    .post('/api/users/login')
    .send({
      email: 'test@example.com',
      password: 'password123'
    });

  token = loginResponse.body.token;
});

describe('Simple Coverage Boost', () => {
  // Test untuk cover beberapa edge cases yang mudah
  test('should handle missing email in registration', async () => {
    const response = await request(app)
      .post('/api/users/register')
      .send({
        name: 'Test User',
        password: 'password123'
      });

    expect([400, 422]).toContain(response.status);
  });

  test('should handle missing password in registration', async () => {
    const response = await request(app)
      .post('/api/users/register')
      .send({
        name: 'Test User',
        email: 'test@example.com'
      });

    expect([400, 422]).toContain(response.status);
  });

  test('should handle missing name in registration', async () => {
    const response = await request(app)
      .post('/api/users/register')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });

    expect([400, 422]).toContain(response.status);
  });

  test('should handle activity creation with missing fields', async () => {
    const response = await request(app)
      .post('/api/activities')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Test Activity'
        // missing other required fields
      });

    expect([400, 401, 422]).toContain(response.status);
  });

  test('should handle news creation with missing activityId', async () => {
    const response = await request(app)
      .post('/api/news')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Test News',
        content: 'Test content'
      });

    expect([400, 401, 422]).toContain(response.status);
  });

  test('should handle expense creation with missing fields', async () => {
    const response = await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Test Expense'
      });

    expect([400, 401, 422]).toContain(response.status);
  });

  test('should handle donation creation with missing fields', async () => {
    const response = await request(app)
      .post('/api/donations')
      .set('Authorization', `Bearer ${token}`)
      .send({
        amount: 50000
      });

    expect([400, 401, 422]).toContain(response.status);
  });
});
