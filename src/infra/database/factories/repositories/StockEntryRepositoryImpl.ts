import { PrismaStockEntryRepository } from "./prisma/PrismaStockEntryRepository";

export class StockEntryRepositoryImpl {
    constructor(private impl: PrismaStockEntryRepository) {}

    create(data: any) {
        return this.impl.create(data);
    }

    findById(id: string) {
        return this.impl.findById(id);
    }

    findByProductId(productId: string) {
        return this.impl.findByProductId(productId);
    }

    findByUserId(userId: string) {
        return this.impl.findByUserId(userId);
    }

    delete(id: string) {
        return this.impl.delete(id);
    }
}
