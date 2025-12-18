// Controller - Update Product
// Presentation Layer

import { Response } from 'express';
import { AuthenticatedRequest } from '../../interfaces/AuthenticatedRequest';
import { UpdateProduct } from '../../../usercase/products/UpdateProduct';

export class UpdateProductController {
  constructor(private readonly updateProduct: UpdateProduct) {}

  async handle(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'ID do produto é obrigatório',
        });
      }

      const {
        name,
        description,
        price,
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

      const product = await this.updateProduct.execute({
        productId: id,
        userId,
        name,
        description,
        price,
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

      return res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error: any) {
      console.error('[UpdateProductController] Erro:', error);

      if (error.message === 'Produto não encontrado') {
        return res.status(404).json({
          success: false,
          error: error.message,
        });
      }

      return res.status(400).json({
        success: false,
        error: error.message || 'Erro ao atualizar produto',
      });
    }
  }
}
