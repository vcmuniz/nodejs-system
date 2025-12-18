import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();

export class PrismaProductRepository {
    async create(data: any) {
        const productData = {
            id: randomUUID(),
            updatedAt: new Date(),
            ...data,
        };
        return prisma.products.create({ data: productData });
    }

    async findById(id: string) {
        return prisma.products.findUnique({ where: { id } });
    }

    async findBySku(sku: string, userId: string) {
        return prisma.products.findFirst({ where: { sku, userId } });
    }

    async update(id: string, data: any) {
        return prisma.products.update({ where: { id }, data });
    }

    async delete(id: string) {
        return prisma.products.delete({ where: { id } });
    }

    async findByUserId(userId: string, categoryId?: string) {
        return prisma.products.findMany({
            where: { userId, ...(categoryId && { categoryId }) },
            orderBy: { createdAt: "desc" },
        });
    }

    async updateQuantity(id: string, quantity: number) {
        return prisma.products.update({ where: { id }, data: { quantity } });
    }
}
