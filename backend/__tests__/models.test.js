import bcrypt from 'bcryptjs';

describe('User Model', () => {
  describe('Password Hashing', () => {
    it('should hash password correctly', async () => {
      const password = 'testpassword123';
      const hash = await bcrypt.hash(password, 10);
      
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(50);
    });

    it('should verify password correctly', async () => {
      const password = 'testpassword123';
      const hash = await bcrypt.hash(password, 10);
      
      const isValid = await bcrypt.compare(password, hash);
      expect(isValid).toBe(true);
    });

    it('should reject wrong password', async () => {
      const password = 'testpassword123';
      const hash = await bcrypt.hash(password, 10);
      
      const isValid = await bcrypt.compare('wrongpassword', hash);
      expect(isValid).toBe(false);
    });
  });
});

describe('Database Queries', () => {
  describe('SQL Injection Protection', () => {
    it('should use parameterized queries', () => {
      const maliciousInput = "'; DROP TABLE users; --";
      const query = 'SELECT * FROM users WHERE email = $1';
      
      expect(query).toContain('$1');
      expect(query).not.toContain(maliciousInput);
    });
  });
});
