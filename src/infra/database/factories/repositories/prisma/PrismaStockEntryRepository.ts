import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class PrismaStockEntryRepository {
    async create(data: any) {
        return prisma.stock_entries.create({ data });
    }

    async findById(id: string) {
        return prisma.stock_entries.findUnique({ where: { id } });
    }

    async findByProductId(productId: string) {
        return prisma.stock_entries.findMany({
            where: { productId },
            orderBy: { createdAt: "desc" },
        });
    }

    async findByUserId(userId: string) {
        return prisma.stock_entries.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });
    }

    async delete(id: string) {
        return prisma.stock_entries.delete({ where: { id } });
    }
}
