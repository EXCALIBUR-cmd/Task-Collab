import request from 'supertest';
import express from 'express';
import authRoutes from '../src/routes/authRoutes.js';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Authentication API', () => {
  describe('POST /api/auth/signup', () => {
    it('should create a new user with valid data', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe('test@example.com');
    });

    it('should return error for missing fields', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'test@example.com'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
    });

    it('should return error for invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
    });
  });
});

describe('Board API', () => {
  let token;

  beforeAll(async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });
    token = response.body.token;
  });

  describe('POST /api/boards', () => {
    it('should create a board with authentication', async () => {
      const response = await request(app)
        .post('/api/boards')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Test Board'
        });

      expect(response.status).toBe(201);
      expect(response.body.name).toBe('Test Board');
    });

    it('should reject request without authentication', async () => {
      const response = await request(app)
        .post('/api/boards')
        .send({
          name: 'Test Board'
        });

      expect(response.status).toBe(401);
    });
  });
});
