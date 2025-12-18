// Controller - List Products
// Presentation Layer

import { Request, Response } from 'express';
import { ListProducts } from '../../../usercase/products/ListProducts';
import { ProductType } from '../../../domain/products/Product';

export class ListProductsController {
  constructor(private readonly listProducts: ListProducts) {}

  async handle(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.user!.id;
      const businessProfileId = req.user!.businessProfileId;

      const {
        type,
        categoryId,
        isActive,
        search,
      } = req.query;

      const products = await this.listProducts.execute({
        userId,
        businessProfileId,
        type: type as ProductType | undefined,
        categoryId: categoryId as string | undefined,
        isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
        search: search as string | undefined,
      });

      return res.status(200).json({
        success: true,
        data: products,
        total: products.length,
      });
    } catch (error: any) {
      console.error('[ListProductsController] Erro:', error);

      return res.status(500).json({
        success: false,
        error: 'Erro ao listar produtos',
      });
    }
  }
}
