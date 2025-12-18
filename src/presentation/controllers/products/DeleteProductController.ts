// Controller - Delete Product
// Presentation Layer

import { Response } from 'express';
import { AuthenticatedRequest } from '../../interfaces/AuthenticatedRequest';
import { DeleteProduct } from '../../../usercase/products/DeleteProduct';

export class DeleteProductController {
  constructor(private readonly deleteProduct: DeleteProduct) {}

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

      await this.deleteProduct.execute({
        productId: id,
        userId,
      });

      return res.status(200).json({
        success: true,
        message: 'Produto deletado com sucesso',
      });
    } catch (error: any) {
      console.error('[DeleteProductController] Erro:', error);

      if (error.message === 'Produto não encontrado') {
        return res.status(404).json({
          success: false,
          error: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        error: 'Erro ao deletar produto',
      });
    }
  }
}
