import { IUserCache } from "../../../ports/IUserCache";
import { MemoryUserCache } from "../memory/MemoryUserCache";
import { UserCacheImpl } from "../UserCacheImpl";

export function makeUserCache(type?: string): IUserCache {
    const repoType = type ?? process.env.REPO_TYPE ?? "memory";

    let impl: IUserCache;
    switch (repoType) {
        case "memory":
        default:
            impl = new MemoryUserCache() as IUserCache;
    }

    return new UserCacheImpl(impl)
}