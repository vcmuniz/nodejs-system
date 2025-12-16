import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class PrismaQuoteRepository {
    async create(data: any, items: any[]) {
        return prisma.quote.create({
            data: {
                ...data,
                items: { create: items },
            },
            include: { items: true },
        });
    }

    async findById(id: string) {
        return prisma.quote.findUnique({ where: { id }, include: { items: true } });
    }

    async findByNumber(quoteNumber: string, userId: string) {
        return prisma.quote.findFirst({
            where: { quoteNumber, userId },
            include: { items: true },
        });
    }

    async findByUserId(userId: string, status?: any) {
        return prisma.quote.findMany({
            where: { userId, ...(status && { status: status as any }) },
            include: { items: true },
            orderBy: { createdAt: "desc" },
        });
    }

    async update(id: string, data: any) {
        return prisma.quote.update({ where: { id }, data: data as any, include: { items: true } });
    }

    async updateStatus(id: string, status: any) {
        return prisma.quote.update({ where: { id }, data: { status: status as any }, include: { items: true } });
    }

    async delete(id: string) {
        return prisma.quote.delete({ where: { id } });
    }

    async getNextQuoteNumber(userId: string) {
        const last = await prisma.quote.findFirst({
            where: { userId },
            orderBy: { createdAt: "desc" },
            select: { quoteNumber: true },
        });

        if (!last || !last.quoteNumber) return "QT-001";
        const num = parseInt(last.quoteNumber.split("-")[1]) + 1;
        return `QT-${String(num).padStart(3, "0")}`;
    }
}
