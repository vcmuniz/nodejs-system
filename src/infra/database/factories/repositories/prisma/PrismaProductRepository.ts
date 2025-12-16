import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class PrismaProductRepository {
    async create(data: any) {
        return prisma.product.create({ data });
    }

    async findById(id: string) {
        return prisma.product.findUnique({ where: { id } });
    }

    async findBySku(sku: string, userId: string) {
        return prisma.product.findFirst({ where: { sku, userId } });
    }

    async update(id: string, data: any) {
        return prisma.product.update({ where: { id }, data });
    }

    async delete(id: string) {
        return prisma.product.delete({ where: { id } });
    }

    async findByUserId(userId: string, categoryId?: string) {
        return prisma.product.findMany({
            where: { userId, ...(categoryId && { categoryId }) },
            orderBy: { createdAt: "desc" },
        });
    }

    async updateQuantity(id: string, quantity: number) {
        return prisma.product.update({ where: { id }, data: { quantity } });
    }
}
