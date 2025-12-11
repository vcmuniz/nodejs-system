// src/factories/user/UserFetcherFactory.ts

import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { makeUserCache } from "../../infra/cache/factories/makeUserCache";
import { makeUserRepository } from "../../infra/database/factories/makeUserRepository";
import { CachedUserFetcher } from "../../usercase/auth/CachedUserFetcher";

export function makeUserFetcher() {
    const userRepository = makeUserRepository() as IUserRepository;
    const cache = makeUserCache()
    return new CachedUserFetcher(userRepository, cache);
}
