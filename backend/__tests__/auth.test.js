import jwt from 'jsonwebtoken';

describe('JWT Authentication', () => {
  const secret = 'test-secret-key';
  
  describe('Token Generation', () => {
    it('should generate valid JWT token', () => {
      const payload = { userId: 1 };
      const token = jwt.sign(payload, secret);
      
      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    it('should include userId in payload', () => {
      const payload = { userId: 123 };
      const token = jwt.sign(payload, secret);
      const decoded = jwt.verify(token, secret);
      
      expect(decoded.userId).toBe(123);
    });
  });

  describe('Token Verification', () => {
    it('should verify valid token', () => {
      const payload = { userId: 1 };
      const token = jwt.sign(payload, secret);
      
      expect(() => {
        jwt.verify(token, secret);
      }).not.toThrow();
    });

    it('should reject invalid token', () => {
      const invalidToken = 'invalid.token.here';
      
      expect(() => {
        jwt.verify(invalidToken, secret);
      }).toThrow();
    });

    it('should reject token with wrong secret', () => {
      const payload = { userId: 1 };
      const token = jwt.sign(payload, secret);
      
      expect(() => {
        jwt.verify(token, 'wrong-secret');
      }).toThrow();
    });
  });
});

describe('WebSocket Authentication', () => {
  it('should extract token from handshake', () => {
    const mockHandshake = {
      auth: {
        token: 'test-token-123'
      }
    };
    
    const token = mockHandshake.auth.token;
    expect(token).toBe('test-token-123');
  });

  it('should handle missing token', () => {
    const mockHandshake = {
      auth: {}
    };
    
    const token = mockHandshake.auth.token;
    expect(token).toBeUndefined();
  });
});
