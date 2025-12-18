// Factory - Product Controllers
// Dependency Injection (Clean Architecture)

import { PrismaClient } from '@prisma/client';

// Repository
import { PrismaProductRepository } from '../../../infra/repositories/products/PrismaProductRepository';

// Use Cases
import { CreateProduct } from '../../../usercase/products/CreateProduct';
import { GetProduct } from '../../../usercase/products/GetProduct';
import { ListProducts } from '../../../usercase/products/ListProducts';
import { UpdateProduct } from '../../../usercase/products/UpdateProduct';
import { DeleteProduct } from '../../../usercase/products/DeleteProduct';

// Controllers
import { CreateProductController } from '../../controllers/products/CreateProductController';
import { GetProductController } from '../../controllers/products/GetProductController';
import { ListProductsController } from '../../controllers/products/ListProductsController';
import { UpdateProductController } from '../../controllers/products/UpdateProductController';
import { DeleteProductController } from '../../controllers/products/DeleteProductController';

export class ProductControllerFactory {
  private static productRepository: PrismaProductRepository;

  static initialize(prisma: PrismaClient): void {
    this.productRepository = new PrismaProductRepository(prisma);
  }

  static makeCreateProductController(): CreateProductController {
    const createProduct = new CreateProduct(this.productRepository);
    return new CreateProductController(createProduct);
  }

  static makeGetProductController(): GetProductController {
    const getProduct = new GetProduct(this.productRepository);
    return new GetProductController(getProduct);
  }

  static makeListProductsController(): ListProductsController {
    const listProducts = new ListProducts(this.productRepository);
    return new ListProductsController(listProducts);
  }

  static makeUpdateProductController(): UpdateProductController {
    const updateProduct = new UpdateProduct(this.productRepository);
    return new UpdateProductController(updateProduct);
  }

  static makeDeleteProductController(): DeleteProductController {
    const deleteProduct = new DeleteProduct(this.productRepository);
    return new DeleteProductController(deleteProduct);
  }
}
