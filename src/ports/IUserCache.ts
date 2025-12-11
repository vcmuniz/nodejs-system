import { User } from "../domain/models/User";

// Port (Hexagonal Architecture): abstração para cache
export interface IUserCache {
  get(key: string): Promise<User | null>;
  set(key: string, user: User, ttlSeconds?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}
