import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class PrismaCategoryRepository {
    async create(data: any) {
        return prisma.categories.create({ data });
    }

    async findById(id: string) {
        return prisma.categories.findUnique({ where: { id } });
    }

    async findByName(name: string, userId: string) {
        return prisma.categories.findFirst({ where: { name, userId } });
    }

    async findByUserId(userId: string) {
        return prisma.categories.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });
    }

    async update(id: string, data: any) {
        return prisma.categories.update({ where: { id }, data });
    }

    async delete(id: string) {
        return prisma.categories.delete({ where: { id } });
    }
}
