// Use Case - Delete Product
// Liskov Substitution Principle (SOLID)

import { IProductRepository } from '../../domain/products/repositories/IProductRepository';

interface DeleteProductRequest {
  productId: string;
  userId: string;
}

export class DeleteProduct {
  constructor(
    private readonly productRepository: IProductRepository
  ) {}

  async execute(request: DeleteProductRequest): Promise<void> {
    // Verifica se produto existe
    const product = await this.productRepository.findById(
      request.productId,
      request.userId
    );

    if (!product) {
      throw new Error('Produto não encontrado');
    }

    // Aqui poderia ter validações adicionais
    // Ex: Verificar se produto tem vendas, etc

    await this.productRepository.delete(request.productId, request.userId);
  }
}
