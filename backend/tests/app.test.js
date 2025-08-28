const request = require('supertest');
const app = require('../src/app');

describe('API Health Check', () => {
  test('GET /health should return OK status', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);

    expect(response.body).toHaveProperty('status', 'OK');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('environment');
  });
});

describe('API Documentation', () => {
  test('GET /api should return API documentation', async () => {
    const response = await request(app)
      .get('/api')
      .expect(200);

    expect(response.body).toHaveProperty('name', 'Purchase Tracker API');
    expect(response.body).toHaveProperty('endpoints');
  });
});

describe('404 Handler', () => {
  test('GET /nonexistent should return 404', async () => {
    const response = await request(app)
      .get('/nonexistent')
      .expect(404);

    expect(response.body).toHaveProperty('error', 'Endpoint not found');
    expect(response.body).toHaveProperty('code', 'NOT_FOUND');
  });
});
