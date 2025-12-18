// Use Case - Get Product By ID
// Dependency Inversion Principle (SOLID)

import { IProductRepository } from '../../domain/products/repositories/IProductRepository';
import { CompleteProductData } from '../../domain/products/Product';

interface GetProductRequest {
  productId: string;
  userId: string;
  includeTypeData?: boolean;
}

export class GetProduct {
  constructor(
    private readonly productRepository: IProductRepository
  ) {}

  async execute(request: GetProductRequest): Promise<CompleteProductData> {
    const product = request.includeTypeData
      ? await this.productRepository.findByIdWithTypeData(request.productId, request.userId)
      : await this.productRepository.findById(request.productId, request.userId);

    if (!product) {
      throw new Error('Produto não encontrado');
    }

    return product;
  }
}
