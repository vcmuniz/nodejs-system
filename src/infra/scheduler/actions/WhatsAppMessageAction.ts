// Action - Executar envio de WhatsApp
import { IScheduledAction, ScheduledActionPayload, ScheduledActionType } from '../../../ports/IScheduledAction';
import { IEvolutionAPI } from '../../../ports/IEvolutionAPI';

export class WhatsAppMessageAction implements IScheduledAction {
  type = ScheduledActionType.WHATSAPP_MESSAGE;

  constructor(private evolutionAPI: IEvolutionAPI) {}

  async execute(payload: ScheduledActionPayload): Promise<void> {
    const { instanceName, phoneNumber, message } = payload;

    if (!instanceName || !phoneNumber || !message) {
      throw new Error('Payload incompleto para WhatsApp: instanceName, phoneNumber, message obrigatórios');
    }

    console.log(`[WhatsAppMessageAction] Enviando para ${phoneNumber}`);

    const response = await this.evolutionAPI.sendMessage(instanceName, {
      number: phoneNumber,
      text: message,
    });

    if (!response.key?.id) {
      throw new Error(response.error || 'Erro ao enviar mensagem WhatsApp');
    }

    console.log(`[WhatsAppMessageAction] ✅ Enviada: ${response.key.id}`);
  }
}
