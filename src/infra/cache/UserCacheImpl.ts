import { User } from "../../domain/models/User";
import { IUserCache } from "../../ports/IUserCache";

export class UserCacheImpl implements IUserCache {
    constructor(private impl: IUserCache) { }

    get(key: string): Promise<User | null> {
        return this.impl.get(key);
    }
    set(key: string, user: User, ttlSeconds?: number): Promise<void> {
        return this.impl.set(key, user, ttlSeconds);
    }
    delete(key: string): Promise<void> {
        return this.impl.delete(key);
    }
    clear(): Promise<void> {
        return this.impl.clear();
    }

}