// Use Case - List Products
// Interface Segregation Principle (SOLID)

import { IProductRepository, ListProductsFilters } from '../../domain/products/repositories/IProductRepository';
import { CompleteProductData, ProductType } from '../../domain/products/Product';

interface ListProductsRequest {
  userId: string;
  businessProfileId?: string;
  type?: ProductType;
  categoryId?: string;
  isActive?: boolean;
  search?: string;
}

export class ListProducts {
  constructor(
    private readonly productRepository: IProductRepository
  ) {}

  async execute(request: ListProductsRequest): Promise<CompleteProductData[]> {
    const filters: ListProductsFilters = {
      userId: request.userId,
      businessProfileId: request.businessProfileId,
      type: request.type,
      categoryId: request.categoryId,
      isActive: request.isActive,
      search: request.search,
    };

    return await this.productRepository.list(filters);
  }
}
