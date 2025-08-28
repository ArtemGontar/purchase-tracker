// Jest setup file
require('dotenv').config({ path: '.env.test' });

// Mock Prisma client for tests
jest.mock('../src/config/database', () => ({
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  purchase: {
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    aggregate: jest.fn(),
    groupBy: jest.fn(),
  },
  receipt: {
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
}));

// Mock AWS services for tests
jest.mock('../src/services/cognitoService', () => ({
  verifyToken: jest.fn(),
  getOrCreateUser: jest.fn(),
}));

jest.mock('../src/services/s3Service', () => ({
  uploadFile: jest.fn(),
  deleteFile: jest.fn(),
  generateFileKey: jest.fn(),
  getSignedUrl: jest.fn(),
}));

jest.mock('../src/services/textractService', () => ({
  analyzeExpense: jest.fn(),
}));
