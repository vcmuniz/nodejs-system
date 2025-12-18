// Use Case - Create Product (Clean Architecture)
// Seguindo Single Responsibility Principle (SOLID)

import { IProductRepository, CreateProductDTO } from '../../domain/products/repositories/IProductRepository';
import { CompleteProductData, ProductType } from '../../domain/products/Product';

interface CreateProductRequest {
  userId: string;
  businessProfileId?: string;
  categoryId: string;
  name: string;
  description?: string;
  sku: string;
  price: number;
  type: ProductType;
  images?: string[];
  metadata?: Record<string, any>;
  isActive?: boolean;
  
  // Type-specific data
  physicalData?: any;
  serviceData?: any;
  courseData?: any;
  digitalData?: any;
  subscriptionData?: any;
  eventData?: any;
}

export class CreateProduct {
  constructor(
    private readonly productRepository: IProductRepository
  ) {}

  async execute(request: CreateProductRequest): Promise<CompleteProductData> {
    // Validação de negócio
    await this.validateBusinessRules(request);

    // Criação do produto
    const productData: CreateProductDTO = {
      userId: request.userId,
      businessProfileId: request.businessProfileId,
      categoryId: request.categoryId,
      name: request.name,
      description: request.description,
      sku: request.sku,
      price: request.price,
      type: request.type,
      images: request.images,
      metadata: request.metadata,
      isActive: request.isActive ?? true,
    };

    // Adiciona dados específicos do tipo
    this.addTypeSpecificData(productData, request);

    return await this.productRepository.create(productData);
  }

  private async validateBusinessRules(request: CreateProductRequest): Promise<void> {
    // Regra: SKU deve ser único
    const skuExists = await this.productRepository.existsBySku(
      request.sku,
      request.userId
    );

    if (skuExists) {
      throw new Error('SKU já está em uso');
    }

    // Regra: Preço deve ser positivo
    if (request.price < 0) {
      throw new Error('Preço deve ser maior ou igual a zero');
    }

    // Validações específicas por tipo
    this.validateTypeSpecificData(request);
  }

  private validateTypeSpecificData(request: CreateProductRequest): void {
    switch (request.type) {
      case ProductType.PHYSICAL:
        if (request.physicalData) {
          if (request.physicalData.stock < 0) {
            throw new Error('Estoque não pode ser negativo');
          }
        }
        break;

      case ProductType.SERVICE:
        if (request.serviceData) {
          if (request.serviceData.duration && request.serviceData.duration <= 0) {
            throw new Error('Duração do serviço deve ser maior que zero');
          }
        }
        break;

      case ProductType.COURSE:
        if (request.courseData) {
          if (request.courseData.modules && request.courseData.modules <= 0) {
            throw new Error('Número de módulos deve ser maior que zero');
          }
        }
        break;

      case ProductType.EVENT:
        if (request.eventData) {
          if (request.eventData.capacity && request.eventData.capacity <= 0) {
            throw new Error('Capacidade do evento deve ser maior que zero');
          }
          if (request.eventData.ticketsSold > request.eventData.capacity) {
            throw new Error('Ingressos vendidos não pode ser maior que a capacidade');
          }
        }
        break;
    }
  }

  private addTypeSpecificData(
    productData: CreateProductDTO,
    request: CreateProductRequest
  ): void {
    switch (request.type) {
      case ProductType.PHYSICAL:
        productData.physicalData = request.physicalData;
        break;
      case ProductType.SERVICE:
        productData.serviceData = request.serviceData;
        break;
      case ProductType.COURSE:
        productData.courseData = request.courseData;
        break;
      case ProductType.DIGITAL:
        productData.digitalData = request.digitalData;
        break;
      case ProductType.SUBSCRIPTION:
        productData.subscriptionData = request.subscriptionData;
        break;
      case ProductType.EVENT:
        productData.eventData = request.eventData;
        break;
    }
  }
}
