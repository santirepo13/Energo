import { describe, it, expect } from '@jest/globals';
import { UserService } from '../services/userService';
import { Pool } from 'mysql2/promise';

describe('UserService', () => {
  let userService: UserService;
  let mockPool: any;

  beforeEach(() => {
    mockPool = {
      getConnection: jest.fn().mockResolvedValue({
        query: jest.fn(),
        release: jest.fn()
      })
    };
    userService = new UserService(mockPool);
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const mockConn = {
        query: jest.fn().mockResolvedValue([[{ id: 1, username: 'test', email: 'test@test.com', created_at: new Date(), last_login: null, role: 'user', status: 'Activo' }]])
      };
      mockPool.getConnection.mockResolvedValue(mockConn);

      const result = await userService.getProfile(1);
      expect(result).toBeDefined();
      expect(result.user.id).toBe(1);
    });
  });

  describe('updateProfile', () => {
    it('should update user profile', async () => {
      const mockConn = {
        query: jest.fn(),
        beginTransaction: jest.fn(),
        commit: jest.fn(),
        rollback: jest.fn()
      };
      mockPool.getConnection.mockResolvedValue(mockConn);

      await userService.updateProfile(1, {
        primer_nombre: 'John',
        segundo_nombre: 'Doe',
        primer_apellido: 'Smith',
        segundo_apellido: null,
        tipo_identificacion: 'Cédula',
        numero_identificacion: '123456789',
        direccion: 'Calle 123',
        telefono: '3001234567'
      });
      expect(mockConn.query).toHaveBeenCalled();
    });
  });
});