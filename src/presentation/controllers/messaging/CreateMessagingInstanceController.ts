// Controller - Criar Instância de Messageria
import { Response } from 'express';
import { AuthenticatedRequest } from '../../interfaces/AuthenticatedRequest';
import { makeCreateMessagingInstanceUseCase } from '../../factories/messaging/makeMessagingUseCases';
import { MessagingChannel } from '../../../domain/messaging/MessagingChannel';
import { ENV } from '../../../config/enviroments';

export class CreateMessagingInstanceController {
  async handle(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { name, channel, channelInstanceId, channelPhoneOrId, credentials, credentialId } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      if (!channel || !channelInstanceId || !channelPhoneOrId) {
        return res.status(400).json({ 
          error: 'Campos obrigatórios: channel, channelInstanceId, channelPhoneOrId' 
        });
      }

      // Usar APP_DOMAIN do .env para webhook
      const webhookBaseUrl = ENV.APP_DOMAIN;

      console.log(`[CreateMessagingInstanceController] Webhook base URL: ${webhookBaseUrl}`);

      const useCase = makeCreateMessagingInstanceUseCase();
      const result = await useCase.execute({
        userId,
        name, // Nome amigável (opcional)
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
