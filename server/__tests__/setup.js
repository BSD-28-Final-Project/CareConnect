import dotenv from 'dotenv';

dotenv.config();

// Set test environment variables
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key-for-testing';
process.env.NODE_ENV = 'test';
