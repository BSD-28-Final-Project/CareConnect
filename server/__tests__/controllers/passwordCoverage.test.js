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

// Helper function to create user and get token
async function createUserAndGetToken(email = 'test@example.com', password = 'password123') {
  await request(app)
    .post('/api/users/register')
    .send({
      name: 'Test User',
      email,
      password,
      role: 'volunteer'
    });

  const loginResponse = await request(app)
    .post('/api/users/login')
    .send({
      email,
      password
    });

  return loginResponse.body.token;
}

describe('Additional Coverage - Password Change Validations', () => {
  test('should fail to change password without currentPassword', async () => {
    const token = await createUserAndGetToken('test1@example.com');
    
    const response = await request(app)
      .put('/api/users/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({
        newPassword: 'newpassword123'
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Current password is required to change password');
  });

  test('should fail to change password with incorrect currentPassword', async () => {
    const token = await createUserAndGetToken('test2@example.com');
    
    const response = await request(app)
      .put('/api/users/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({
        currentPassword: 'wrongpassword',
        newPassword: 'newpassword123'
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Current password is incorrect');
  });

  test('should fail to change password with short newPassword', async () => {
    const token = await createUserAndGetToken('test3@example.com');
    
    const response = await request(app)
      .put('/api/users/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({
        currentPassword: 'password123',
        newPassword: '123'
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('New password must be at least 5 characters long');
  });
});
