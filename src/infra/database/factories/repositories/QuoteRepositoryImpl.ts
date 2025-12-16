import { PrismaQuoteRepository } from "./prisma/PrismaQuoteRepository";

export class QuoteRepositoryImpl {
    constructor(private impl: PrismaQuoteRepository) {}

    create(data: any, items: any[]) {
        return this.impl.create(data, items);
    }

    findById(id: string) {
        return this.impl.findById(id);
    }

    findByNumber(quoteNumber: string, userId: string) {
        return this.impl.findByNumber(quoteNumber, userId);
    }

    findByUserId(userId: string, status?: string) {
        return this.impl.findByUserId(userId, status);
    }

    update(id: string, data: any) {
        return this.impl.update(id, data);
    }

    updateStatus(id: string, status: string) {
        return this.impl.updateStatus(id, status);
    }

    delete(id: string) {
        return this.impl.delete(id);
    }

    getNextQuoteNumber(userId: string) {
        return this.impl.getNextQuoteNumber(userId);
    }
}
