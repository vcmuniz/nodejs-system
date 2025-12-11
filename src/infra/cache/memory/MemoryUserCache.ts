import { User } from "../../../domain/models/User";
import { IUserCache } from "../../../ports/IUserCache";

export class MemoryUserCache implements IUserCache {
    private cache: Map<string, { user: User; expiresAt?: number }> = new Map();

    async get(key: string): Promise<User | null> {
        const entry = this.cache.get(key);
        if (!entry) return null;

        // Se tiver TTL e já expirou, remove e retorna null
        if (entry.expiresAt && Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            return null;
        }

        return entry.user;
    }

    async set(key: string, user: User, ttlSeconds?: number): Promise<void> {
        const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined;
        this.cache.set(key, { user, expiresAt });
    }

    async delete(key: string): Promise<void> {
        this.cache.delete(key);
    }

    async clear(): Promise<void> {
        this.cache.clear();
    }
}