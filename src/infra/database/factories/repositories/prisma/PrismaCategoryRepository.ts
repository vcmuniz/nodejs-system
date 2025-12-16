import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class PrismaCategoryRepository {
    async create(data: any) {
        return prisma.category.create({ data });
    }

    async findById(id: string) {
        return prisma.category.findUnique({ where: { id } });
    }

    async findByName(name: string, userId: string) {
        return prisma.category.findFirst({ where: { name, userId } });
    }

    async findByUserId(userId: string) {
        return prisma.category.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });
    }

    async update(id: string, data: any) {
        return prisma.category.update({ where: { id }, data });
    }

    async delete(id: string) {
        return prisma.category.delete({ where: { id } });
    }
}
