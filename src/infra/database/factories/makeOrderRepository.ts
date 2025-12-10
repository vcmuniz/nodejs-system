import { IOrderRepository } from "../../../domain/repositories/IOrderRepository";
import { MemoryOrderRepository } from "./repositories/memory/MemoryOrderRepository";
import { OrderRepositoryImpl } from "./repositories/OrderRepositoryImpl";

export function makeOrderRepository(type?: string): IOrderRepository {
    const repoType = type ?? process.env.REPO_TYPE ?? "memory";

    let impl: IOrderRepository;
    switch (repoType) {
        case "memory":
        default:
            impl = new MemoryOrderRepository() as IOrderRepository;
    }

    return new OrderRepositoryImpl(impl)
}