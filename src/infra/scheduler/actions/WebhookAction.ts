// Action - Dispara webhook customizado
import axios from 'axios';
import { IScheduledAction, ScheduledActionPayload, ScheduledActionType } from '../../../ports/IScheduledAction';

export class WebhookAction implements IScheduledAction {
  type = ScheduledActionType.WEBHOOK;

  async execute(payload: ScheduledActionPayload): Promise<void> {
    const { webhookUrl, body } = payload;

    if (!webhookUrl) {
      throw new Error('webhookUrl é obrigatória para WebhookAction');
    }

    console.log(`[WebhookAction] Disparando webhook: ${webhookUrl}`);

    try {
      const response = await axios.post(webhookUrl, body || {}, {
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log(`[WebhookAction] ✅ Webhook disparado: ${response.status}`);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error(`[WebhookAction] ❌ Erro: ${msg}`);
      throw error;
    }
  }
}
