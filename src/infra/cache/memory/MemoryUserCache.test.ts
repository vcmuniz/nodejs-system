import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MemoryUserCache } from './MemoryUserCache';
import { User } from '../../../domain/models/User';

describe('MemoryUserCache', () => {
  let cache: MemoryUserCache;
  let testUser: User;

  beforeEach(() => {
    cache = new MemoryUserCache();
    testUser = new User('1', 'test@example.com', 'password', 'John Doe');
  });

  describe('set and get', () => {
    it('should store and retrieve a user', async () => {
      const key = 'user:1';
      
      await cache.set(key, testUser);
      const result = await cache.get(key);

      expect(result).toEqual(testUser);
      expect(result?.id).toBe('1');
      expect(result?.email).toBe('test@example.com');
    });

    it('should return null for non-existent key', async () => {
      const result = await cache.get('nonexistent');
      
      expect(result).toBeNull();
    });

    it('should overwrite existing value', async () => {
      const key = 'user:1';
      const user1 = new User('1', 'user1@example.com', 'pass', 'User 1');
      const user2 = new User('1', 'user2@example.com', 'pass', 'User 2');

      await cache.set(key, user1);
      await cache.set(key, user2);
      const result = await cache.get(key);

      expect(result?.email).toBe('user2@example.com');
    });

    it('should store multiple users with different keys', async () => {
      const user1 = new User('1', 'user1@example.com', 'pass', 'User 1');
      const user2 = new User('2', 'user2@example.com', 'pass', 'User 2');

      await cache.set('user:1', user1);
      await cache.set('user:2', user2);

      const result1 = await cache.get('user:1');
      const result2 = await cache.get('user:2');

      expect(result1?.id).toBe('1');
      expect(result2?.id).toBe('2');
    });
  });

  describe('TTL (Time To Live)', () => {
    it('should store user with TTL', async () => {
      const key = 'user:1';
      
      await cache.set(key, testUser, 10); // 10 seconds TTL
      const result = await cache.get(key);

      expect(result).not.toBeNull();
      expect(result?.id).toBe('1');
    });

    it('should return null for expired entries', async () => {
      const key = 'user:1';
      
      // Set with very short TTL (1 millisecond)
      await cache.set(key, testUser, 0.001);
      
      // Wait to ensure expiration (need to wait longer than TTL)
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const result = await cache.get(key);
      expect(result).toBeNull();
    });

    it('should not expire when TTL is not set', async () => {
      const key = 'user:1';
      
      await cache.set(key, testUser); // No TTL
      
      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const result = await cache.get(key);
      expect(result).not.toBeNull();
    });

    it('should handle different TTL values', async () => {
      const user1 = new User('1', 'user1@example.com', 'pass', 'User 1');
      const user2 = new User('2', 'user2@example.com', 'pass', 'User 2');

      await cache.set('user:1', user1, 100); // Long TTL
      await cache.set('user:2', user2, 0.001); // Very short TTL

      // Immediately after
      let result1 = await cache.get('user:1');
      let result2 = await cache.get('user:2');

      expect(result1).not.toBeNull();
      
      // Wait for user2 to expire
      await new Promise(resolve => setTimeout(resolve, 50));
      result2 = await cache.get('user:2');
      expect(result2).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete a stored user', async () => {
      const key = 'user:1';
      
      await cache.set(key, testUser);
      await cache.delete(key);
      const result = await cache.get(key);

      expect(result).toBeNull();
    });

    it('should not error when deleting non-existent key', async () => {
      expect(async () => {
        await cache.delete('nonexistent');
      }).not.toThrow();
    });

    it('should only delete specified key', async () => {
      const user1 = new User('1', 'user1@example.com', 'pass', 'User 1');
      const user2 = new User('2', 'user2@example.com', 'pass', 'User 2');

      await cache.set('user:1', user1);
      await cache.set('user:2', user2);

      await cache.delete('user:1');

      const result1 = await cache.get('user:1');
      const result2 = await cache.get('user:2');

      expect(result1).toBeNull();
      expect(result2).not.toBeNull();
    });
  });

  describe('clear', () => {
    it('should clear all entries', async () => {
      const user1 = new User('1', 'user1@example.com', 'pass', 'User 1');
      const user2 = new User('2', 'user2@example.com', 'pass', 'User 2');

      await cache.set('user:1', user1);
      await cache.set('user:2', user2);

      await cache.clear();

      const result1 = await cache.get('user:1');
      const result2 = await cache.get('user:2');

      expect(result1).toBeNull();
      expect(result2).toBeNull();
    });

    it('should work even if cache is already empty', async () => {
      expect(async () => {
        await cache.clear();
      }).not.toThrow();
    });

    it('should allow re-populating after clear', async () => {
      const user1 = new User('1', 'user1@example.com', 'pass', 'User 1');

      await cache.set('user:1', user1);
      await cache.clear();
      await cache.set('user:1', user1);

      const result = await cache.get('user:1');
      expect(result).not.toBeNull();
      expect(result?.id).toBe('1');
    });
  });

  describe('Cache Behavior', () => {
    it('should implement IUserCache interface', async () => {
      expect(cache).toHaveProperty('get');
      expect(cache).toHaveProperty('set');
      expect(cache).toHaveProperty('delete');
      expect(cache).toHaveProperty('clear');
    });

    it('should return same object reference', async () => {
      const key = 'user:1';
      
      await cache.set(key, testUser);
      const result = await cache.get(key);

      expect(result).toBe(testUser);
    });

    it('should handle concurrent operations', async () => {
      const user1 = new User('1', 'user1@example.com', 'pass', 'User 1');
      const user2 = new User('2', 'user2@example.com', 'pass', 'User 2');

      await Promise.all([
        cache.set('user:1', user1),
        cache.set('user:2', user2),
      ]);

      const [result1, result2] = await Promise.all([
        cache.get('user:1'),
        cache.get('user:2'),
      ]);

      expect(result1?.id).toBe('1');
      expect(result2?.id).toBe('2');
    });
  });
});
