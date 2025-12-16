import { PrismaProductRepository } from "./prisma/PrismaProductRepository";

export class ProductRepositoryImpl {
    constructor(private impl: PrismaProductRepository) {}

    create(data: any) {
        return this.impl.create(data);
    }

    findById(id: string) {
        return this.impl.findById(id);
    }

    findBySku(sku: string, userId: string) {
        return this.impl.findBySku(sku, userId);
    }

    update(id: string, data: any) {
        return this.impl.update(id, data);
    }

    delete(id: string) {
        return this.impl.delete(id);
    }

    findByUserId(userId: string, categoryId?: string) {
        return this.impl.findByUserId(userId, categoryId);
    }

    updateQuantity(id: string, quantity: number) {
        return this.impl.updateQuantity(id, quantity);
    }
}
