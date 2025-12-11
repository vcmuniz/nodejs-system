import { User } from "../../domain/models/User";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { IUserCache } from "../../ports/IUserCache";

// Port (Hexagonal): abstração para buscar usuário com cache
export interface IUserFetcher {
  getUserById(id: string): Promise<User | null>;
}

// Application Service com Dependency Inversion
export class CachedUserFetcher implements IUserFetcher {
  constructor(
    private userRepository: IUserRepository,
    private userCache: IUserCache,
  ) {}

  async getUserById(id: string): Promise<User | null> {
    const cacheKey = `user:${id}`;

    // Tenta obter do cache primeiro
    const cachedUser = await this.userCache.get(cacheKey);
    if (cachedUser) {
      return cachedUser;
    }

    // Se não está em cache, busca no banco
    const user = await this.userRepository.findById(id);
    if (!user) {
      return null;
    }

    // Armazena em cache
    await this.userCache.set(cacheKey, user);

    return user;
  }
}
