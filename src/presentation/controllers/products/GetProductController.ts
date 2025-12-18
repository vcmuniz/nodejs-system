// Controller - Get Product By ID
// Presentation Layer

import { Response } from 'express';
import { AuthenticatedRequest } from '../../interfaces/AuthenticatedRequest';
import { GetProduct } from '../../../usercase/products/GetProduct';

export class GetProductController {
  constructor(private readonly getProduct: GetProduct) {}

  async handle(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const includeTypeData = req.query.includeTypeData === 'true';

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'ID do produto é obrigatório',
        });
      }

      const product = await this.getProduct.execute({
        productId: id,
        userId,
        includeTypeData,
      });

      return res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error: any) {
      console.error('[GetProductController] Erro:', error);

      if (error.message === 'Produto não encontrado') {
        return res.status(404).json({
          success: false,
          error: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        error: 'Erro ao buscar produto',
      });
    }
  }
}
