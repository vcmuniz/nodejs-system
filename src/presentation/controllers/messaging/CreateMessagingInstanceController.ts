// Controller - Criar Instância de Messageria
import { Response } from 'express';
import { AuthenticatedRequest } from '../../interfaces/AuthenticatedRequest';
import { makeCreateMessagingInstanceUseCase } from '../../factories/messaging/makeMessagingUseCases';
import { MessagingChannel } from '../../../domain/messaging/MessagingChannel';

export class CreateMessagingInstanceController {
  async handle(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { channel, channelInstanceId, channelPhoneOrId, credentials, credentialId } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      if (!channel || !channelInstanceId || !channelPhoneOrId) {
        return res.status(400).json({ 
          error: 'Campos obrigatórios: channel, channelInstanceId, channelPhoneOrId' 
        });
      }

      // Construir URL base automaticamente a partir do request
      const protocol = req.protocol; // http ou https
      const host = req.get('host'); // localhost:3000 ou api.seuapp.com
      const webhookBaseUrl = `${protocol}://${host}`;

      console.log(`[CreateMessagingInstanceController] Webhook base URL: ${webhookBaseUrl}`);

      const useCase = makeCreateMessagingInstanceUseCase();
      const result = await useCase.execute({
        userId,
        channel: channel as MessagingChannel,
        channelInstanceId,
        channelPhoneOrId,
        credentials, // Agora opcional - se não passar, busca automaticamente
        credentialId, // Opcional - forçar credencial específica
        webhookBaseUrl, // URL base para configurar webhook
      });

      return res.status(201).json({
        success: true,
        message: credentials 
          ? 'Instância criada com credenciais customizadas' 
          : 'Instância criada com credenciais do sistema',
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

export function makeCreateMessagingInstanceController(): CreateMessagingInstanceController {
  return new CreateMessagingInstanceController();
}
