import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import app from '../../testApp.js';
import { setupTestDB, teardownTestDB, clearDatabase, getTestDB } from '../helpers/testHelper.js';
import { validate, validateActivityPayload, validateVolunteerPayload } from '../../middlewares/errorhandler.js';

let db;

beforeAll(async () => {
  db = await setupTestDB();
});

afterAll(async () => {
  await teardownTestDB();
});

beforeEach(async () => {
  await clearDatabase();
});

describe('Error Handler - Validate Middleware', () => {
  test('should call next when validation passes', () => {
    const validationFn = () => []; // No errors
    const middleware = validate(validationFn);
    
    const req = { body: {}, params: {}, query: {} };
    const res = {
      status: function(code) {
        this.statusCode = code;
        return this;
      },
      json: function(data) {
        this.body = data;
        return this;
      }
    };
    const next = () => {
      res.nextCalled = true;
    };

    middleware(req, res, next);
    
    expect(res.nextCalled).toBe(true);
  });

  test('should return 400 with errors when validation fails', () => {
    const validationFn = () => ['Error 1', 'Error 2'];
    const middleware = validate(validationFn);
    
    const req = { body: {}, params: {}, query: {} };
    const res = {
      status: function(code) {
        this.statusCode = code;
        return this;
      },
      json: function(data) {
        this.body = data;
        return this;
      }
    };
    const next = () => {};

    middleware(req, res, next);
    
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ errors: ['Error 1', 'Error 2'] });
  });
});

describe('Error Handler - validateActivityPayload', () => {
  test('should return error for null body', () => {
    const errors = validateActivityPayload(null);
    expect(errors).toContain('Request body is required');
  });

  test('should return error for undefined body', () => {
    const errors = validateActivityPayload(undefined);
    expect(errors).toContain('Request body is required');
  });

  test('should return error when title is missing', () => {
    const errors = validateActivityPayload({ description: 'test' });
    expect(errors.some(e => e.includes('title'))).toBe(true);
  });

  test('should return error when title is not a string', () => {
    const errors = validateActivityPayload({ title: 123, description: 'test' });
    expect(errors.some(e => e.includes('title'))).toBe(true);
  });

  test('should return error when description is missing', () => {
    const errors = validateActivityPayload({ title: 'test' });
    expect(errors.some(e => e.includes('description'))).toBe(true);
  });

  test('should return error when description is not a string', () => {
    const errors = validateActivityPayload({ title: 'test', description: 123 });
    expect(errors.some(e => e.includes('description'))).toBe(true);
  });

  test('should return error when location is not a string', () => {
    const errors = validateActivityPayload({ 
      title: 'test', 
      description: 'test',
      location: 123 
    });
    expect(errors.some(e => e.includes('location'))).toBe(true);
  });

  test('should return error when category is not a string', () => {
    const errors = validateActivityPayload({ 
      title: 'test', 
      description: 'test',
      category: 123 
    });
    expect(errors.some(e => e.includes('category'))).toBe(true);
  });

  test('should return error when targetMoney is not a number', () => {
    const errors = validateActivityPayload({ 
      title: 'test', 
      description: 'test',
      targetMoney: 'not a number' 
    });
    expect(errors.some(e => e.includes('targetMoney'))).toBe(true);
  });

  test('should return no errors for valid payload', () => {
    const errors = validateActivityPayload({
      title: 'Test Activity',
      description: 'Test Description',
      location: { name: 'Test Location', address: 'Test Address' },
      category: 'education',
      targetMoney: 1000000
    });
    expect(errors).toEqual([]);
  });

  test('should return no errors for minimal valid payload', () => {
    const errors = validateActivityPayload({
      title: 'Test Activity',
      description: 'Test Description'
    });
    expect(errors).toEqual([]);
  });
});

describe('Error Handler - validateVolunteerPayload', () => {
  test('should return error for null body', () => {
    const errors = validateVolunteerPayload(null);
    expect(errors).toContain('Request body is required');
  });

  test('should return error for undefined body', () => {
    const errors = validateVolunteerPayload(undefined);
    expect(errors).toContain('Request body is required');
  });

  test('should return error when userId is missing', () => {
    const errors = validateVolunteerPayload({ name: 'John' });
    expect(errors.some(e => e.includes('userId'))).toBe(true);
  });

  test('should return error when userId is not a string', () => {
    const errors = validateVolunteerPayload({ userId: 123, name: 'John' });
    expect(errors.some(e => e.includes('userId'))).toBe(true);
  });

  test('should return error when name is missing', () => {
    const errors = validateVolunteerPayload({ userId: '123' });
    expect(errors.some(e => e.includes('name'))).toBe(true);
  });

  test('should return error when name is not a string', () => {
    const errors = validateVolunteerPayload({ userId: '123', name: 456 });
    expect(errors.some(e => e.includes('name'))).toBe(true);
  });

  test('should return no errors for valid payload', () => {
    const errors = validateVolunteerPayload({
      userId: '507f1f77bcf86cd799439011',
      name: 'John Doe'
    });
    expect(errors).toEqual([]);
  });

  test('should return multiple errors for invalid payload', () => {
    const errors = validateVolunteerPayload({
      userId: 123,
      name: 456
    });
    expect(errors.length).toBeGreaterThan(1);
  });
});

describe('Error Handler - Generic Error Handler', () => {
  test('should handle error with custom status and message', async () => {
    // This will be tested through actual API calls since errorHandler 
    // is used as Express middleware
    const response = await request(app)
      .get('/api/activities/invalid-id-format')
      .expect(400);

    expect(response.body).toHaveProperty('message');
  });

  test('should handle 404 errors', async () => {
    const response = await request(app)
      .get('/api/nonexistent-route')
      .expect(404);

    expect(response.status).toBe(404);
  });
});
