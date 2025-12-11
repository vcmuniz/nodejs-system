import { ENV } from "../../../config/enviroments";
import { IOrderRepository } from "../../../domain/repositories/IOrderRepository";
import { OrderRepositoryImpl } from "./repositories/OrderRepositoryImpl";
import { PrismaOrderRepository } from "./repositories/prisma/PrismaOrderRepository";

export function makeOrderRepository(type?: string): IOrderRepository {
    const repoType = type ?? ENV.REPO_TYPE ?? "memory";

    let impl: IOrderRepository = new PrismaOrderRepository() as IOrderRepository;

    return new OrderRepositoryImpl(impl)
}