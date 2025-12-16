import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class PrismaStockEntryRepository {
    async create(data: any) {
        return prisma.stockEntry.create({ data });
    }

    async findById(id: string) {
        return prisma.stockEntry.findUnique({ where: { id } });
    }

    async findByProductId(productId: string) {
        return prisma.stockEntry.findMany({
            where: { productId },
            orderBy: { createdAt: "desc" },
        });
    }

    async findByUserId(userId: string) {
        return prisma.stockEntry.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });
    }

    async delete(id: string) {
        return prisma.stockEntry.delete({ where: { id } });
    }
}
