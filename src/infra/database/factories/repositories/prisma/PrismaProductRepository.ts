import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();

export class PrismaProductRepository {
    async create(data: any) {
        // Extrai quantity do tipo específico ou usa 0 como padrão
        let quantity = data.quantity || 0;
        
        // Extrai dados específicos do tipo
        const { physicalData, serviceData, courseData, digitalData, subscriptionData, eventData, ...productData } = data;
        
        if (data.type === 'PHYSICAL' && physicalData?.stock !== undefined) {
            quantity = physicalData.stock;
        }
        
        const finalData: any = {
            id: randomUUID(),
            updatedAt: new Date(),
            ...productData,
            quantity,
        };
        
        // Adiciona relacionamento com dados específicos se existirem
        if (data.type === 'PHYSICAL' && physicalData) {
            finalData.physicalData = {
                create: {
                    ...physicalData,
                    id: randomUUID(),
                }
            };
        } else if (data.type === 'SERVICE' && serviceData) {
            finalData.serviceData = {
                create: {
                    ...serviceData,
                    id: randomUUID(),
                }
            };
        } else if (data.type === 'COURSE' && courseData) {
            finalData.courseData = {
                create: {
                    ...courseData,
                    id: randomUUID(),
                }
            };
        } else if (data.type === 'DIGITAL' && digitalData) {
            finalData.digitalData = {
                create: {
                    ...digitalData,
                    id: randomUUID(),
                }
            };
        } else if (data.type === 'SUBSCRIPTION' && subscriptionData) {
            finalData.subscriptionData = {
                create: {
                    ...subscriptionData,
                    id: randomUUID(),
                }
            };
        } else if (data.type === 'EVENT' && eventData) {
            finalData.eventData = {
                create: {
                    ...eventData,
                    id: randomUUID(),
                }
            };
        }
        
        return prisma.products.create({ data: finalData });
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
