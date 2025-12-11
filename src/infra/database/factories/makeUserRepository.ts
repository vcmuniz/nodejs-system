import { ENV } from "../../../config/enviroments";
import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { PrismaUserRepository } from "./repositories/prisma/PrismaUserRepository";
import { UserRepositoryImpl } from "./repositories/UserRepositoryImpl";

export function makeUserRepository(type?: string): IUserRepository {
    const repoType = type ?? ENV.REPO_TYPE ?? "memory";

    let impl: IUserRepository = new PrismaUserRepository() as IUserRepository;

    return new UserRepositoryImpl(impl)
}
