// Adapter - Prisma Repository Implementation (Hexagonal Architecture)
// Infrastructure Layer

import { PrismaClient } from '@prisma/client';
import {
  IProductRepository,
  CreateProductDTO,
  UpdateProductDTO,
  ListProductsFilters
} from '../../../domain/products/repositories/IProductRepository';
import { CompleteProductData, ProductType } from '../../../domain/products/Product';
import { v4 as uuidv4 } from 'uuid';

export class PrismaProductRepository implements IProductRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateProductDTO): Promise<CompleteProductData> {
    const productId = uuidv4();

    // Cria produto base + dados específicos do tipo em uma transação
    const product = await this.prisma.$transaction(async (tx) => {
      // Cria produto base
      const baseProduct = await tx.products.create({
        data: {
          id: productId,
          userId: data.userId,
          businessProfileId: data.businessProfileId,
          categoryId: data.categoryId,
          name: data.name,
          description: data.description,
          sku: data.sku,
          price: data.price,
          quantity: data.physicalData?.stock ?? 0,
          image: data.images?.[0] || null,
          type: data.type,
          images: data.images ? data.images as any : undefined,
          metadata: data.metadata ? data.metadata as any : undefined,
          isActive: data.isActive ?? true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      // Cria dados específicos do tipo
      await this.createTypeSpecificData(tx, productId, data);

      return baseProduct;
    });

    // Busca produto completo com dados do tipo
    return this.findByIdWithTypeData(product.id, data.userId) as Promise<CompleteProductData>;
  }

  async update(
    id: string,
    userId: string,
    data: UpdateProductDTO
  ): Promise<CompleteProductData> {
    await this.prisma.$transaction(async (tx) => {
      // Atualiza produto base
      const updateData: any = {
        updatedAt: new Date(),
      };
      
      if (data.name !== undefined) updateData.name = data.name;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.price !== undefined) updateData.price = data.price;
      if (data.images !== undefined) {
        updateData.images = data.images as any;
        updateData.image = data.images[0] ?? null;
      }
      if (data.metadata !== undefined) {
        updateData.metadata = data.metadata as any;
      }
      if (data.isActive !== undefined) updateData.isActive = data.isActive;

      await tx.products.update({
        where: { id, userId },
        data: updateData,
      });

      // Atualiza dados específicos do tipo
      await this.updateTypeSpecificData(tx, id, data);
    });

    return this.findByIdWithTypeData(id, userId) as Promise<CompleteProductData>;
  }

  async findById(id: string, userId: string): Promise<CompleteProductData | null> {
    const product = await this.prisma.products.findFirst({
      where: { id, userId },
    });

    if (!product) return null;

    return this.mapToCompleteProduct(product);
  }

  async findByIdWithTypeData(
    id: string,
    userId: string
  ): Promise<CompleteProductData | null> {
    const product = await this.prisma.products.findFirst({
      where: { id, userId },
      include: {
        physicalData: true,
        serviceData: true,
        courseData: true,
        digitalData: true,
        subscriptionData: true,
        eventData: true,
      },
    });

    if (!product) return null;

    return this.mapToCompleteProductWithTypeData(product);
  }

  async list(filters: ListProductsFilters): Promise<CompleteProductData[]> {
    const where: any = {
      userId: filters.userId,
    };

    if (filters.businessProfileId) {
      where.businessProfileId = filters.businessProfileId;
    }

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search } },
        { sku: { contains: filters.search } },
      ];
    }

    const products = await this.prisma.products.findMany({
      where,
      include: {
        physicalData: true,
        serviceData: true,
        courseData: true,
        digitalData: true,
        subscriptionData: true,
        eventData: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return products.map((p) => this.mapToCompleteProductWithTypeData(p));
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.prisma.products.delete({
      where: { id, userId },
    });
  }

  async existsBySku(
    sku: string,
    userId: string,
    excludeId?: string
  ): Promise<boolean> {
    const where: any = {
      sku,
      userId,
    };

    if (excludeId) {
      where.id = { not: excludeId };
    }

    const count = await this.prisma.products.count({ where });
    return count > 0;
  }

  // Métodos privados auxiliares

  private async createTypeSpecificData(
    tx: any,
    productId: string,
    data: CreateProductDTO
  ): Promise<void> {
    switch (data.type) {
      case 'PHYSICAL':
        if (data.physicalData) {
          await tx.productPhysical.create({
            data: {
              id: uuidv4(),
              productId,
              stock: data.physicalData.stock ?? 0,
              sku: data.physicalData.sku,
              weight: data.physicalData.weight,
              width: data.physicalData.width,
              height: data.physicalData.height,
              depth: data.physicalData.depth,
              variations: data.physicalData.variations as any,
            },
          });
        }
        break;

      case 'SERVICE':
        if (data.serviceData) {
          await tx.productService.create({
            data: {
              id: uuidv4(),
              productId,
              duration: data.serviceData.duration,
              scheduling: data.serviceData.scheduling ?? false,
              location: data.serviceData.location,
              professionals: data.serviceData.professionals
                ? data.serviceData.professionals as any
                : null,
              extras: data.serviceData.extras
                ? data.serviceData.extras as any
                : null,
            },
          });
        }
        break;

      case 'COURSE':
        if (data.courseData) {
          await tx.productCourse.create({
            data: {
              id: uuidv4(),
              productId,
              platform: data.courseData.platform,
              modules: data.courseData.modules,
              lessons: data.courseData.lessons,
              durationHours: data.courseData.durationHours,
              certificate: data.courseData.certificate ?? false,
              accessDays: data.courseData.accessDays,
              level: data.courseData.level,
              content: data.courseData.content
                ? data.courseData.content as any
                : null,
            },
          });
        }
        break;

      case 'DIGITAL':
        if (data.digitalData) {
          await tx.productDigital.create({
            data: {
              id: uuidv4(),
              productId,
              fileUrl: data.digitalData.fileUrl,
              fileSize: data.digitalData.fileSize,
              fileType: data.digitalData.fileType,
              downloadLimit: data.digitalData.downloadLimit,
              licenseType: data.digitalData.licenseType,
              expirationDays: data.digitalData.expirationDays,
            },
          });
        }
        break;

      case 'SUBSCRIPTION':
        if (data.subscriptionData) {
          await tx.productSubscription.create({
            data: {
              id: uuidv4(),
              productId,
              billingCycle: data.subscriptionData.billingCycle,
              trialDays: data.subscriptionData.trialDays,
              maxUsers: data.subscriptionData.maxUsers ?? 1,
              benefits: data.subscriptionData.benefits
                ? data.subscriptionData.benefits as any
                : null,
            },
          });
        }
        break;

      case 'EVENT':
        if (data.eventData) {
          await tx.productEvent.create({
            data: {
              id: uuidv4(),
              productId,
              eventDate: data.eventData.eventDate,
              location: data.eventData.location,
              capacity: data.eventData.capacity,
              ticketsSold: data.eventData.ticketsSold ?? 0,
              category: data.eventData.category,
            },
          });
        }
        break;
    }
  }

  private async updateTypeSpecificData(
    tx: any,
    productId: string,
    data: UpdateProductDTO
  ): Promise<void> {
    // Atualiza PhysicalData se fornecido
    if (data.physicalData) {
      await tx.productPhysical.upsert({
        where: { productId },
        update: {
          stock: data.physicalData.stock,
          sku: data.physicalData.sku,
          weight: data.physicalData.weight,
          width: data.physicalData.width,
          height: data.physicalData.height,
          depth: data.physicalData.depth,
          variations: data.physicalData.variations
            ? data.physicalData.variations as any
            : undefined,
        },
        create: {
          id: uuidv4(),
          productId,
          stock: data.physicalData.stock ?? 0,
          sku: data.physicalData.sku,
          weight: data.physicalData.weight,
          width: data.physicalData.width,
          height: data.physicalData.height,
          depth: data.physicalData.depth,
          variations: data.physicalData.variations
            ? data.physicalData.variations as any
            : null,
        },
      });
    }

    // Adicionar lógica similar para outros tipos...
    // (ServiceData, CourseData, etc)
  }

  private mapToCompleteProduct(product: any): CompleteProductData {
    return {
      id: product.id,
      userId: product.userId,
      businessProfileId: product.businessProfileId,
      categoryId: product.categoryId,
      name: product.name,
      description: product.description,
      sku: product.sku,
      price: product.price,
      type: product.type as ProductType,
      images: product.images ? (Array.isArray(product.images) ? product.images : JSON.parse(product.images as string)) : [],
      metadata: product.metadata ? (typeof product.metadata === 'object' ? product.metadata : JSON.parse(product.metadata as string)) : {},
      isActive: product.isActive,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }

  private mapToCompleteProductWithTypeData(product: any): CompleteProductData {
    const baseProduct = this.mapToCompleteProduct(product);

    // Adiciona dados específicos do tipo
    if (product.physicalData) {
      baseProduct.physicalData = {
        stock: product.physicalData.stock,
        sku: product.physicalData.sku,
        weight: product.physicalData.weight,
        width: product.physicalData.width,
        height: product.physicalData.height,
        depth: product.physicalData.depth,
        variations: product.physicalData.variations
          ? (typeof product.physicalData.variations === 'object' ? product.physicalData.variations : JSON.parse(product.physicalData.variations as string))
          : undefined,
      };
    }

    if (product.serviceData) {
      baseProduct.serviceData = {
        duration: product.serviceData.duration,
        scheduling: product.serviceData.scheduling,
        location: product.serviceData.location,
        professionals: product.serviceData.professionals
          ? (Array.isArray(product.serviceData.professionals) ? product.serviceData.professionals : JSON.parse(product.serviceData.professionals as string))
          : undefined,
        extras: product.serviceData.extras
          ? (typeof product.serviceData.extras === 'object' ? product.serviceData.extras : JSON.parse(product.serviceData.extras as string))
          : undefined,
      };
    }

    if (product.courseData) {
      baseProduct.courseData = {
        platform: product.courseData.platform,
        modules: product.courseData.modules,
        lessons: product.courseData.lessons,
        durationHours: product.courseData.durationHours,
        certificate: product.courseData.certificate,
        accessDays: product.courseData.accessDays,
        level: product.courseData.level,
        content: product.courseData.content
          ? (typeof product.courseData.content === 'object' ? product.courseData.content : JSON.parse(product.courseData.content as string))
          : undefined,
      };
    }

    if (product.digitalData) {
      baseProduct.digitalData = {
        fileUrl: product.digitalData.fileUrl,
        fileSize: product.digitalData.fileSize,
        fileType: product.digitalData.fileType,
        downloadLimit: product.digitalData.downloadLimit,
        licenseType: product.digitalData.licenseType,
        expirationDays: product.digitalData.expirationDays,
      };
    }

    if (product.subscriptionData) {
      baseProduct.subscriptionData = {
        billingCycle: product.subscriptionData.billingCycle,
        trialDays: product.subscriptionData.trialDays,
        maxUsers: product.subscriptionData.maxUsers,
        benefits: product.subscriptionData.benefits
          ? (Array.isArray(product.subscriptionData.benefits) ? product.subscriptionData.benefits : JSON.parse(product.subscriptionData.benefits as string))
          : undefined,
      };
    }

    if (product.eventData) {
      baseProduct.eventData = {
        eventDate: product.eventData.eventDate,
        location: product.eventData.location,
        capacity: product.eventData.capacity,
        ticketsSold: product.eventData.ticketsSold,
        category: product.eventData.category,
      };
    }

    return baseProduct;
  }
}
