import { describe, it, expect } from '@jest/globals';
import { AuthService } from '../services/authService';
import { Pool } from 'mysql2/promise';

describe('AuthService', () => {
  let authService: AuthService;
  let mockPool: any;

  beforeEach(() => {
    mockPool = {
      getConnection: jest.fn().mockResolvedValue({
        query: jest.fn(),
        release: jest.fn()
      })
    };
    authService = new AuthService(mockPool);
  });

  describe('login', () => {
    it('should return user when credentials are valid', async () => {
      const mockConn = {
        query: jest.fn().mockResolvedValue([[{ id: 1, username: 'test', email: 'test@test.com', password_hash: 'hash', role_name: 'user', status_name: 'Activo' }]])
      };
      mockPool.getConnection.mockResolvedValue(mockConn);

      const result = await authService.login('test', 'password');
      expect(result).toBeDefined();
      expect(result?.id).toBe(1);
      expect(result?.username).toBe('test');
    });

    it('should return null when credentials are invalid', async () => {
      const mockConn = {
        query: jest.fn().mockResolvedValue([[]])
      };
      mockPool.getConnection.mockResolvedValue(mockConn);

      const result = await authService.login('test', 'wrongpassword');
      expect(result).toBeNull();
    });
  });

  describe('register', () => {
    it('should create user and energy card', async () => {
      const mockConn = {
        query: jest.fn().mockResolvedValue([{ inserted_id: 1 }]),
        beginTransaction: jest.fn(),
        commit: jest.fn(),
        rollback: jest.fn()
      };
      mockPool.getConnection.mockResolvedValue(mockConn);

      const result = await authService.register({
        username: 'test',
        password: 'password',
        email: 'test@test.com',
        role_id: 2,
        status_id: 1,
        card_number: '123456789'
      });
      expect(result).toBeDefined();
      expect(result.userId).toBe(1);
    });
  });
});