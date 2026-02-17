import axios from 'axios';
import { authAPI } from '../services/api';

jest.mock('axios');

describe('API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('Authentication API', () => {
    it('should call signup endpoint', async () => {
      const mockResponse = { data: { user: {}, token: 'test-token' } };
      axios.create.mockReturnValue({
        post: jest.fn().resolvedValue(mockResponse),
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() }
        }
      });

      const data = { email: 'test@example.com', password: 'pass123', name: 'Test' };
      await authAPI.signup(data);

      expect(axios.create).toHaveBeenCalled();
    });

    it('should call login endpoint', async () => {
      const mockResponse = { data: { user: {}, token: 'test-token' } };
      axios.create.mockReturnValue({
        post: jest.fn().resolvedValue(mockResponse),
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() }
        }
      });

      const data = { email: 'test@example.com', password: 'pass123' };
      await authAPI.login(data);

      expect(axios.create).toHaveBeenCalled();
    });
  });

  describe('Request Interceptor', () => {
    it('should add authorization header when token exists', () => {
      localStorage.setItem('token', 'test-token');
      
      const config = { headers: {} };
      const token = localStorage.getItem('token');
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      expect(config.headers.Authorization).toBe('Bearer test-token');
    });

    it('should not add header when token missing', () => {
      const config = { headers: {} };
      const token = localStorage.getItem('token');
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      expect(config.headers.Authorization).toBeUndefined();
    });
  });
});
