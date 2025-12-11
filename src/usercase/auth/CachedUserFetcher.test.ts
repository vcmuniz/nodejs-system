import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CachedUserFetcher } from './CachedUserFetcher';
import { User } from '../../domain/models/User';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { IUserCache } from '../../ports/IUserCache';

describe('CachedUserFetcher', () => {
  let cachedUserFetcher: CachedUserFetcher;
  let mockRepository: IUserRepository;
  let mockCache: IUserCache;
  let testUser: User;

  beforeEach(() => {
    testUser = new User('1', 'test@example.com', 'password', 'John Doe');

    mockRepository = {
      findById: vi.fn(),
      findByEmail: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findAll: vi.fn(),
    };

    mockCache = {
      get: vi.fn(),
      set: vi.fn(),
      delete: vi.fn(),
      clear: vi.fn(),
    };

    cachedUserFetcher = new CachedUserFetcher(mockRepository, mockCache);
  });

  describe('getUserById', () => {
    it('should return user from cache if exists', async () => {
      const cacheKey = 'user:1';
      vi.mocked(mockCache.get).mockResolvedValue(testUser);

      const result = await cachedUserFetcher.getUserById('1');

      expect(mockCache.get).toHaveBeenCalledWith(cacheKey);
      expect(result).toEqual(testUser);
      expect(mockRepository.findById).not.toHaveBeenCalled();
    });

    it('should fetch from repository if not in cache', async () => {
      vi.mocked(mockCache.get).mockResolvedValue(null);
      vi.mocked(mockRepository.findById).mockResolvedValue(testUser);
      vi.mocked(mockCache.set).mockResolvedValue(undefined);

      const result = await cachedUserFetcher.getUserById('1');

      expect(mockCache.get).toHaveBeenCalledWith('user:1');
      expect(mockRepository.findById).toHaveBeenCalledWith('1');
      expect(result).toEqual(testUser);
    });

    it('should store user in cache after fetching from repository', async () => {
      vi.mocked(mockCache.get).mockResolvedValue(null);
      vi.mocked(mockRepository.findById).mockResolvedValue(testUser);
      vi.mocked(mockCache.set).mockResolvedValue(undefined);

      await cachedUserFetcher.getUserById('1');

      expect(mockCache.set).toHaveBeenCalledWith('user:1', testUser);
    });

    it('should return null if user not found in repository', async () => {
      vi.mocked(mockCache.get).mockResolvedValue(null);
      vi.mocked(mockRepository.findById).mockResolvedValue(null);

      const result = await cachedUserFetcher.getUserById('nonexistent');

      expect(result).toBeNull();
      expect(mockCache.set).not.toHaveBeenCalled();
    });

    it('should use correct cache key format', async () => {
      vi.mocked(mockCache.get).mockResolvedValue(testUser);

      await cachedUserFetcher.getUserById('123');

      expect(mockCache.get).toHaveBeenCalledWith('user:123');
    });

    it('should handle cache get errors gracefully', async () => {
      vi.mocked(mockCache.get).mockRejectedValue(new Error('Cache error'));

      await expect(cachedUserFetcher.getUserById('1')).rejects.toThrow('Cache error');
    });

    it('should handle repository errors when cache miss', async () => {
      vi.mocked(mockCache.get).mockResolvedValue(null);
      vi.mocked(mockRepository.findById).mockRejectedValue(new Error('Repository error'));

      await expect(cachedUserFetcher.getUserById('1')).rejects.toThrow('Repository error');
    });

    it('should not call set cache if repository returns null', async () => {
      vi.mocked(mockCache.get).mockResolvedValue(null);
      vi.mocked(mockRepository.findById).mockResolvedValue(null);

      await cachedUserFetcher.getUserById('1');

      expect(mockCache.set).not.toHaveBeenCalled();
    });

    it('should prefer cache over repository', async () => {
      const cachedUser = new User('1', 'cached@example.com', 'password', 'Cached User');
      const repositoryUser = new User('1', 'repo@example.com', 'password', 'Repo User');

      vi.mocked(mockCache.get).mockResolvedValue(cachedUser);
      vi.mocked(mockRepository.findById).mockResolvedValue(repositoryUser);

      const result = await cachedUserFetcher.getUserById('1');

      expect(result).toEqual(cachedUser);
      expect(mockRepository.findById).not.toHaveBeenCalled();
    });

    it('should work with different user IDs', async () => {
      vi.mocked(mockCache.get).mockResolvedValue(null);
      vi.mocked(mockRepository.findById).mockResolvedValue(testUser);
      vi.mocked(mockCache.set).mockResolvedValue(undefined);

      await cachedUserFetcher.getUserById('user-abc-123');

      expect(mockCache.get).toHaveBeenCalledWith('user:user-abc-123');
      expect(mockRepository.findById).toHaveBeenCalledWith('user-abc-123');
      expect(mockCache.set).toHaveBeenCalledWith('user:user-abc-123', testUser);
    });
  });

  describe('Cache behavior', () => {
    it('should implement IUserFetcher interface', () => {
      expect(cachedUserFetcher).toHaveProperty('getUserById');
      expect(typeof cachedUserFetcher.getUserById).toBe('function');
    });

    it('should work with TTL parameter if cache supports it', async () => {
      vi.mocked(mockCache.get).mockResolvedValue(null);
      vi.mocked(mockRepository.findById).mockResolvedValue(testUser);
      vi.mocked(mockCache.set).mockResolvedValue(undefined);

      await cachedUserFetcher.getUserById('1');

      // Current implementation doesn't pass TTL, but interface supports it
      expect(mockCache.set).toHaveBeenCalledWith('user:1', testUser);
    });

    it('should handle multiple consecutive calls efficiently', async () => {
      vi.mocked(mockCache.get).mockResolvedValue(testUser);

      // First call
      await cachedUserFetcher.getUserById('1');
      // Second call
      await cachedUserFetcher.getUserById('1');
      // Third call
      await cachedUserFetcher.getUserById('1');

      // Should hit cache 3 times
      expect(mockCache.get).toHaveBeenCalledTimes(3);
      // Repository should never be called
      expect(mockRepository.findById).not.toHaveBeenCalled();
    });

    it('should make repository call only once for cache misses', async () => {
      vi.mocked(mockCache.get)
        .mockResolvedValueOnce(null) // First call misses cache
        .mockResolvedValueOnce(testUser); // Second call hits cache

      vi.mocked(mockRepository.findById).mockResolvedValue(testUser);
      vi.mocked(mockCache.set).mockResolvedValue(undefined);

      // First call - cache miss
      await cachedUserFetcher.getUserById('1');
      // Second call - cache hit
      await cachedUserFetcher.getUserById('1');

      // Repository should be called only once
      expect(mockRepository.findById).toHaveBeenCalledTimes(1);
      // Set should be called once
      expect(mockCache.set).toHaveBeenCalledTimes(1);
    });
  });
});
