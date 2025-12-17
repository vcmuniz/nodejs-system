import { Response } from 'express';
import { AuthenticatedRequest } from '../../../interfaces/AuthenticatedRequest';
import { SyncGroupsFromProvider } from '../../../../usercase/messaging/groups/SyncGroupsFromProvider';
import { makeMessagingGroupRepository } from '../../../../infra/database/factories/makeMessagingGroupRepository';
import { makeMessagingRepository } from '../../../../infra/database/factories/makeMessagingRepository';
import axios from 'axios';
import { ENV } from '../../../../config/enviroments';
import { v4 as uuidv4 } from 'uuid';

/**
 * @swagger
 * /api/messaging/groups/sync/{instanceId}:
 *   post:
 *     tags:
 *       - Messaging Groups
 *     summary: Sync groups from Evolution API
 *     description: |
 *       Manually sync WhatsApp groups from Evolution API.
 *       
 *       **What it does:**
 *       - Fetches all groups from Evolution API
 *       - Creates/updates groups in database (type: SYNCED_WHATSAPP)
 *       - Syncs all group members automatically
 *       - Marks groups as isSynced: true (read-only)
 *       
 *       **Use cases:**
 *       - Initial sync after creating instance
 *       - Refresh groups when needed
 *       - Update members list
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: instanceId
 *         required: true
 *         schema:
 *           type: string
 *         description: Messaging instance ID
 *         example: 'abc-123-instance-id'
 *     responses:
 *       200:
 *         description: Groups synced successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 'Grupos sincronizados com sucesso'
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalGroups:
 *                       type: number
 *                       example: 5
 *                     syncedGroups:
 *                       type: number
 *                       example: 5
 *                     totalMembers:
 *                       type: number
 *                       example: 50
 *       400:
 *         description: Invalid request or Evolution API error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Instance not found
 */
export class SyncGroupsController {
  async handle(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { instanceId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      // Busca a instância no banco
      const messagingRepository = makeMessagingRepository();
      const instance = await messagingRepository.getInstanceById(instanceId);

      if (!instance) {
        return res.status(404).json({ error: 'Instância não encontrada' });
      }

      // Verifica se pertence ao usuário
      if (instance.userId !== userId) {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      // Busca credenciais da instância
      let evolutionUrl = 'http://localhost:8080';
      let apiKey = '';

      if (instance.credentialId) {
        // Busca as credenciais do banco
        const prisma = (await import('../../../infra/database/prisma')).default;
        const credential = await prisma.integration_credentials.findUnique({
          where: { id: instance.credentialId }
        });

        if (credential && credential.credentials) {
          const creds = typeof credential.credentials === 'string' 
            ? JSON.parse(credential.credentials) 
            : credential.credentials;
          
          evolutionUrl = creds.baseUrl || creds.apiUrl || 'http://localhost:8080';
          apiKey = creds.apiKey || creds.apikey || '';
        }
      }

      // Se não tem credenciais, usa as do .env (fallback)
      if (!apiKey) {
        evolutionUrl = ENV.EVOLUTION_API_URL || 'http://localhost:8080';
        apiKey = ENV.EVOLUTION_API_KEY || '';
      }

      if (!apiKey) {
        return res.status(400).json({ 
          error: 'API Key não configurada',
          details: 'Configure as credenciais da Evolution API no sistema'
        });
      }

      let groups: any[] = [];
      
      try {
        const response = await axios.get(
          `${evolutionUrl}/group/fetchAllGroups/${instance.channelInstanceId}`,
          {
            headers: {
              'apikey': apiKey
            }
          }
        );

        groups = response.data || [];
      } catch (error: any) {
        console.error('[SyncGroups] Erro ao buscar grupos da Evolution API:', error.message);
        return res.status(400).json({ 
          error: 'Erro ao buscar grupos da Evolution API',
          details: error.message 
        });
      }

      // Se não encontrou grupos
      if (!groups.length) {
        return res.status(200).json({
          success: true,
          message: 'Nenhum grupo encontrado',
          data: {
            totalGroups: 0,
            syncedGroups: 0,
            totalMembers: 0
          }
        });
      }

      // Mapeia grupos para o formato esperado
      const syncGroups = groups.map((group: any) => ({
        externalGroupId: group.id,
        name: group.subject || 'Grupo sem nome',
        members: (group.participants || []).map((participant: any) => ({
          identifier: participant.id?.replace('@s.whatsapp.net', ''),
          identifierType: 'phone',
          name: participant.name || participant.notify || 'Sem nome',
          metadata: {
            isAdmin: participant.admin === 'admin' || participant.admin === 'superadmin',
            isSuperAdmin: participant.admin === 'superadmin'
          }
        })),
        metadata: {
          subject: group.subject,
          owner: group.owner,
          creation: group.creation,
          subjectTime: group.subjectTime,
          subjectOwner: group.subjectOwner,
          participantCount: group.participants?.length || 0
        }
      }));

      // Sincroniza os grupos
      const groupRepository = makeMessagingGroupRepository();
      const syncUseCase = new SyncGroupsFromProvider(groupRepository);

      await syncUseCase.execute({
        userId,
        businessProfileId: instance.businessProfileId,
        instanceId,
        groupType: 'SYNCED_WHATSAPP',
        groups: syncGroups
      });

      // Calcula estatísticas
      const totalMembers = syncGroups.reduce((acc, g) => acc + g.members.length, 0);

      return res.status(200).json({
        success: true,
        message: 'Grupos sincronizados com sucesso',
        data: {
          totalGroups: groups.length,
          syncedGroups: syncGroups.length,
          totalMembers
        }
      });
    } catch (error: any) {
      console.error('[SyncGroupsController] Error:', error);
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
}

export const makeSyncGroupsController = () => new SyncGroupsController();
