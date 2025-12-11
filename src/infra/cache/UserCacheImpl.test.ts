import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UserCacheImpl } from './UserCacheImpl';
import { User } from '../../domain/models/User';
import { IUserCache } from '../../ports/IUserCache';

describe('UserCacheImpl', () => {
  let cacheImpl: UserCacheImpl;
  let mockImpl: IUserCache;
  let testUser: User;

  beforeEach(() => {
    testUser = new User('1', 'test@example.com', 'password', 'John Doe');

    mockImpl = {
      get: vi.fn(),
      set: vi.fn(),
      delete: vi.fn(),
      clear: vi.fn(),
    };

    cacheImpl = new UserCacheImpl(mockImpl);
  });

  describe('get', () => {
    it('should delegate get to implementation', async () => {
      vi.mocked(mockImpl.get).mockResolvedValue(testUser);

      const result = await cacheImpl.get('user:1');

      expect(mockImpl.get).toHaveBeenCalledWith('user:1');
      expect(result).toEqual(testUser);
    });

    it('should return null if implementation returns null', async () => {
      vi.mocked(mockImpl.get).mockResolvedValue(null);

      const result = await cacheImpl.get('user:1');

      expect(result).toBeNull();
      expect(mockImpl.get).toHaveBeenCalledWith('user:1');
    });

    it('should pass through key parameter correctly', async () => {
      const key = 'custom:key:123';
      vi.mocked(mockImpl.get).mockResolvedValue(testUser);

      await cacheImpl.get(key);

      expect(mockImpl.get).toHaveBeenCalledWith(key);
    });
  });

  describe('set', () => {
    it('should delegate set to implementation', async () => {
      vi.mocked(mockImpl.set).mockResolvedValue(undefined);

      await cacheImpl.set('user:1', testUser);

      expect(mockImpl.set).toHaveBeenCalledWith('user:1', testUser, undefined);
    });

    it('should pass TTL parameter to implementation', async () => {
      vi.mocked(mockImpl.set).mockResolvedValue(undefined);

      await cacheImpl.set('user:1', testUser, 3600);

      expect(mockImpl.set).toHaveBeenCalledWith('user:1', testUser, 3600);
    });

    it('should handle set without TTL', async () => {
      vi.mocked(mockImpl.set).mockResolvedValue(undefined);

      await cacheImpl.set('user:1', testUser);

      expect(mockImpl.set).toHaveBeenCalledWith('user:1', testUser, undefined);
    });

    it('should pass user object correctly', async () => {
      vi.mocked(mockImpl.set).mockResolvedValue(undefined);
      const user = new User('123', 'test@example.com', 'pass', 'Test User');

      await cacheImpl.set('user:123', user, 7200);

      expect(mockImpl.set).toHaveBeenCalledWith('user:123', user, 7200);
    });
  });

  describe('delete', () => {
    it('should delegate delete to implementation', async () => {
      vi.mocked(mockImpl.delete).mockResolvedValue(undefined);

      await cacheImpl.delete('user:1');

      expect(mockImpl.delete).toHaveBeenCalledWith('user:1');
    });

    it('should pass key parameter correctly', async () => {
      vi.mocked(mockImpl.delete).mockResolvedValue(undefined);
      const key = 'some:key:xyz';

      await cacheImpl.delete(key);

      expect(mockImpl.delete).toHaveBeenCalledWith(key);
    });
  });

  describe('clear', () => {
    it('should delegate clear to implementation', async () => {
      vi.mocked(mockImpl.clear).mockResolvedValue(undefined);

      await cacheImpl.clear();

      expect(mockImpl.clear).toHaveBeenCalled();
    });
  });

  describe('Adapter Pattern', () => {
    it('should implement IUserCache interface', () => {
      expect(cacheImpl).toHaveProperty('get');
      expect(cacheImpl).toHaveProperty('set');
      expect(cacheImpl).toHaveProperty('delete');
      expect(cacheImpl).toHaveProperty('clear');
    });

    it('should act as adapter to implementation', async () => {
      vi.mocked(mockImpl.get).mockResolvedValue(testUser);
      vi.mocked(mockImpl.set).mockResolvedValue(undefined);
      vi.mocked(mockImpl.delete).mockResolvedValue(undefined);
      vi.mocked(mockImpl.clear).mockResolvedValue(undefined);

      // Perform operations
      await cacheImpl.set('user:1', testUser, 100);
      await cacheImpl.get('user:1');
      await cacheImpl.delete('user:1');
      await cacheImpl.clear();

      // Verify all delegated
      expect(mockImpl.set).toHaveBeenCalled();
      expect(mockImpl.get).toHaveBeenCalled();
      expect(mockImpl.delete).toHaveBeenCalled();
      expect(mockImpl.clear).toHaveBeenCalled();
    });

    it('should maintain operation order', async () => {
      const callOrder: string[] = [];

      vi.mocked(mockImpl.set).mockImplementation(async () => {
        callOrder.push('set');
      });
      vi.mocked(mockImpl.get).mockImplementation(async () => {
        callOrder.push('get');
        return null;
      });
      vi.mocked(mockImpl.delete).mockImplementation(async () => {
        callOrder.push('delete');
      });

      await cacheImpl.set('key', testUser);
      await cacheImpl.get('key');
      await cacheImpl.delete('key');

      expect(callOrder).toEqual(['set', 'get', 'delete']);
    });
  });
});
