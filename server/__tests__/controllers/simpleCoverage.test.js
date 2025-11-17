import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import app from '../../testApp.js';
import { setupTestDB, teardownTestDB, clearDatabase } from '../helpers/testHelper.js';

beforeAll(async () => {
  await setupTestDB();
});

afterAll(async () => {
  await teardownTestDB();
});

beforeEach(async () => {
  await clearDatabase();
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
      .send({
        title: 'Test Activity'
        // missing other required fields
      });

    expect([400, 422]).toContain(response.status);
  });

  test('should handle news creation with missing activityId', async () => {
    const response = await request(app)
      .post('/api/news')
      .send({
        title: 'Test News',
        content: 'Test content'
      });

    expect([400, 422]).toContain(response.status);
  });

  test('should handle expense creation with missing fields', async () => {
    const response = await request(app)
      .post('/api/expenses')
      .send({
        title: 'Test Expense'
      });

    expect([400, 422]).toContain(response.status);
  });

  test('should handle donation creation with missing fields', async () => {
    const response = await request(app)
      .post('/api/donations')
      .send({
        amount: 50000
      });

    expect([400, 422]).toContain(response.status);
  });
});
