import { describe, test, expect, beforeAll, afterAll, jest } from '@jest/globals';
import { authenticate, isAdmin, isAuthorized } from '../../middlewares/authentication.js';
import jwt from 'jsonwebtoken';

// Ensure JWT_SECRET is set for tests
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key';

describe('Authentication Middleware - authenticate', () => {
  test('should authenticate with valid token', () => {
    const token = jwt.sign(
      { id: '123', email: 'test@example.com', role: 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    const req = {
      headers: {
        authorization: `Bearer ${token}`
      }
    };
    const res = {};
    const next = jest.fn();

    authenticate(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toBeDefined();
    expect(req.user.id).toBe('123');
    expect(req.user.email).toBe('test@example.com');
    expect(req.user.role).toBe('user');
  });

  test('should fail when no authorization header', () => {
    const req = { headers: {} };
    const res = {
      status: jest.fn(function() { return this; }),
      json: jest.fn()
    };
    const next = jest.fn();

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'No token provided' });
    expect(next).not.toHaveBeenCalled();
  });

  test('should fail with invalid token format', () => {
    const req = {
      headers: {
        authorization: 'InvalidFormat'
      }
    };
    const res = {
      status: jest.fn(function() { return this; }),
      json: jest.fn()
    };
    const next = jest.fn();

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid token format' });
    expect(next).not.toHaveBeenCalled();
  });

  test('should fail with invalid token', () => {
    const req = {
      headers: {
        authorization: 'Bearer invalidtoken'
      }
    };
    const res = {
      status: jest.fn(function() { return this; }),
      json: jest.fn()
    };
    const next = jest.fn();

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid token' });
    expect(next).not.toHaveBeenCalled();
  });

  test('should fail with expired token', (done) => {
    const token = jwt.sign(
      { id: '123', email: 'test@example.com', role: 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '1ms' }
    );

    // Wait for token to expire
    setTimeout(() => {
      const req = {
        headers: {
          authorization: `Bearer ${token}`
        }
      };
      const res = {
        status: jest.fn(function() { return this; }),
        json: jest.fn()
      };
      const next = jest.fn();

      authenticate(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Token expired' });
      expect(next).not.toHaveBeenCalled();
      done();
    }, 10);
  });
});

describe('Authentication Middleware - isAdmin', () => {
  test('should allow admin user', () => {
    const req = {
      user: { id: '123', email: 'admin@example.com', role: 'admin' }
    };
    const res = {};
    const next = jest.fn();

    isAdmin(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  test('should deny non-admin user', () => {
    const req = {
      user: { id: '123', email: 'user@example.com', role: 'user' }
    };
    const res = {
      status: jest.fn(function() { return this; }),
      json: jest.fn()
    };
    const next = jest.fn();

    isAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Access denied. Admin only.' });
    expect(next).not.toHaveBeenCalled();
  });
});

describe('Authentication Middleware - isAuthorized', () => {
  test('should allow admin to access any resource', () => {
    const req = {
      user: { id: '123', email: 'admin@example.com', role: 'admin' },
      params: { id: '456' }
    };
    const res = {};
    const next = jest.fn();

    isAuthorized(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  test('should allow user to access their own resource', () => {
    const req = {
      user: { id: '123', email: 'user@example.com', role: 'user' },
      params: { id: '123' }
    };
    const res = {};
    const next = jest.fn();

    isAuthorized(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  test('should deny user accessing others resource', () => {
    const req = {
      user: { id: '123', email: 'user@example.com', role: 'user' },
      params: { id: '456' }
    };
    const res = {
      status: jest.fn(function() { return this; }),
      json: jest.fn()
    };
    const next = jest.fn();

    isAuthorized(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ 
      message: 'Access denied. Not authorized.' 
    });
    expect(next).not.toHaveBeenCalled();
  });
});
