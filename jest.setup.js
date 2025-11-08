// Jest setup file
// This file runs before each test file

// Mock environment variables for testing
process.env.NEXTAUTH_SECRET = 'test-secret-key-for-jwt-signing';
process.env.NEXTAUTH_URL = 'http://localhost:3000';
process.env.DATABSE_STRING = 'mongodb://localhost:27017/test';
process.env.DATABASE_PASSWORD = 'test';

// Suppress console logs during tests (optional)
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
//   warn: jest.fn(),
//   error: jest.fn(),
// };

