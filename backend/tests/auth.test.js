// Simple test to verify basic functionality
const request = require('supertest');
const app = require('../server');

describe('Health Check', () => {
  test('should return server health status', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);
    
    expect(response.body.success).toBe(true);
    expect(response.body.message).toContain('KrishiSahayak API is running');
  });
});

describe('Authentication', () => {
  const testUser = {
    email: 'test@krishisahayak.com',
    password: 'TestPass123',
    name: 'Test Farmer',
    phone: '9876543210'
  };

  test('should register a new user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send(testUser)
      .expect(201);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data.user.email).toBe(testUser.email);
    expect(response.body.data.accessToken).toBeDefined();
  });

  test('should login existing user', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password
      })
      .expect(200);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data.user.email).toBe(testUser.email);
    expect(response.body.data.accessToken).toBeDefined();
  });
});