// Controller - Create Product
// Presentation Layer (Clean Architecture)

import { Request, Response } from 'express';
import { CreateProduct } from '../../../usercase/products/CreateProduct';
import { ProductType } from '../../../domain/products/Product';

export class CreateProductController {
  constructor(private readonly createProduct: CreateProduct) {}

  async handle(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.user!.id;
      const businessProfileId = req.user!.businessProfileId;

      const {
        categoryId,
        name,
        description,
        sku,
        price,
        type = ProductType.PHYSICAL,
        images,
        metadata,
        isActive,
        physicalData,
        serviceData,
        courseData,
        digitalData,
        subscriptionData,
        eventData,
      } = req.body;

      // Validações básicas
      if (!name || !sku || price === undefined || !categoryId) {
        return res.status(400).json({
          success: false,
          error: 'Campos obrigatórios: name, sku, price, categoryId',
        });
      }

      // Executa use case
      const product = await this.createProduct.execute({
        userId,
        businessProfileId,
        categoryId,
        name,
        description,
        sku,
        price,
        type,
        images,
        metadata,
        isActive,
        physicalData,
        serviceData,
        courseData,
        digitalData,
        subscriptionData,
        eventData,
      });

      return res.status(201).json({
        success: true,
        data: product,
      });
    } catch (error: any) {
      console.error('[CreateProductController] Erro:', error);

      if (error.message.includes('SKU já está em uso')) {
        return res.status(409).json({
          success: false,
          error: error.message,
        });
      }

      return res.status(400).json({
        success: false,
        error: error.message || 'Erro ao criar produto',
      });
    }
  }
}
