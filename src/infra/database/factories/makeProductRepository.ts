import { ProductRepositoryImpl } from "./repositories/ProductRepositoryImpl";
import { PrismaProductRepository } from "./repositories/prisma/PrismaProductRepository";

export function makeProductRepository() {
    return new ProductRepositoryImpl(new PrismaProductRepository());
}
