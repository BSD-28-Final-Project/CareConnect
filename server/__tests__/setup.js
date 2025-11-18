import dotenv from 'dotenv';

dotenv.config();

// Set test environment variables
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key-for-testing';
process.env.NODE_ENV = 'test';

// Silence noisy console output during tests to keep failure traces readable.
// We keep originals in case a test needs to restore them.
global.__ORIG_CONSOLE__ = {
	log: console.log,
	warn: console.warn,
	error: console.error,
	info: console.info,
	debug: console.debug,
};

console.log = () => {};
console.warn = () => {};
console.error = () => {};
console.info = () => {};
console.debug = () => {};
