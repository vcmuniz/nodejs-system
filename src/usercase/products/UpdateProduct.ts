// Use Case - Update Product
// Open/Closed Principle (SOLID) - Aberto para extensão, fechado para modificação

import { IProductRepository, UpdateProductDTO } from '../../domain/products/repositories/IProductRepository';
import { CompleteProductData } from '../../domain/products/Product';

interface UpdateProductRequest {
  productId: string;
  userId: string;
  name?: string;
  description?: string;
  price?: number;
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

export class UpdateProduct {
  constructor(
    private readonly productRepository: IProductRepository
  ) {}

  async execute(request: UpdateProductRequest): Promise<CompleteProductData> {
    // Verifica se produto existe
    const existingProduct = await this.productRepository.findById(
      request.productId,
      request.userId
    );

    if (!existingProduct) {
      throw new Error('Produto não encontrado');
    }

    // Validações de negócio
    if (request.price !== undefined && request.price < 0) {
      throw new Error('Preço deve ser maior ou igual a zero');
    }

    // Prepara dados para atualização
    const updateData: UpdateProductDTO = {};

    if (request.name !== undefined) updateData.name = request.name;
    if (request.description !== undefined) updateData.description = request.description;
    if (request.price !== undefined) updateData.price = request.price;
    if (request.images !== undefined) updateData.images = request.images;
    if (request.metadata !== undefined) updateData.metadata = request.metadata;
    if (request.isActive !== undefined) updateData.isActive = request.isActive;

    // Atualiza dados específicos do tipo
    if (request.physicalData !== undefined) updateData.physicalData = request.physicalData;
    if (request.serviceData !== undefined) updateData.serviceData = request.serviceData;
    if (request.courseData !== undefined) updateData.courseData = request.courseData;
    if (request.digitalData !== undefined) updateData.digitalData = request.digitalData;
    if (request.subscriptionData !== undefined) updateData.subscriptionData = request.subscriptionData;
    if (request.eventData !== undefined) updateData.eventData = request.eventData;

    return await this.productRepository.update(
      request.productId,
      request.userId,
      updateData
    );
  }
}
