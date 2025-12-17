// Controller - Obter QR Code Fresco de uma Instância
import { Response } from 'express';
import { AuthenticatedRequest } from '../../interfaces/AuthenticatedRequest';
import { GetInstanceQRCode } from '../../../usercase/messaging/GetInstanceQRCode';
import { makeMessagingRepository } from '../../../infra/database/factories/makeMessagingRepository';
import { MessagingAdapterFactory } from '../../../infra/messaging/MessagingAdapterFactory';

export class GetInstanceQRCodeController {
  async handle(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { instanceId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      if (!instanceId) {
        return res.status(400).json({ error: 'instanceId é obrigatório' });
      }

      const repository = makeMessagingRepository();
      const adapterFactory = new MessagingAdapterFactory();
      const useCase = new GetInstanceQRCode(repository, adapterFactory);

      const result = await useCase.execute({ userId, instanceId });

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }
}

export function makeGetInstanceQRCodeController(): GetInstanceQRCodeController {
  return new GetInstanceQRCodeController();
}
