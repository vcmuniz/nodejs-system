import { StockEntryRepositoryImpl } from "./repositories/StockEntryRepositoryImpl";
import { PrismaStockEntryRepository } from "./repositories/prisma/PrismaStockEntryRepository";

export function makeStockEntryRepository() {
    return new StockEntryRepositoryImpl(new PrismaStockEntryRepository());
}
