import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class PrismaQuoteRepository {
    async create(data: any, items: any[]) {
        return prisma.quotes.create({
            data: {
                ...data,
                items: { create: items },
            },
            include: { quote_items: true },
        });
    }

    async findById(id: string) {
        return prisma.quotes.findUnique({ where: { id }, include: { quote_items: true } });
    }

    async findByNumber(quoteNumber: string, userId: string) {
        return prisma.quotes.findFirst({
            where: { quoteNumber, userId },
            include: { quote_items: true },
        });
    }

    async findByUserId(userId: string, status?: any) {
        return prisma.quotes.findMany({
            where: { userId, ...(status && { status: status as any }) },
            include: { quote_items: true },
            orderBy: { createdAt: "desc" },
        });
    }

    async update(id: string, data: any) {
        return prisma.quotes.update({ where: { id }, data: data as any, include: { quote_items: true } });
    }

    async updateStatus(id: string, status: any) {
        return prisma.quotes.update({ where: { id }, data: { status: status as any }, include: { quote_items: true } });
    }

    async delete(id: string) {
        return prisma.quotes.delete({ where: { id } });
    }

    async getNextQuoteNumber(userId: string) {
        const last = await prisma.quotes.findFirst({
            where: { userId },
            orderBy: { createdAt: "desc" },
            select: { quoteNumber: true },
        });

        if (!last || !last.quoteNumber) return "QT-001";
        const num = parseInt(last.quoteNumber.split("-")[1]) + 1;
        return `QT-${String(num).padStart(3, "0")}`;
    }
}
