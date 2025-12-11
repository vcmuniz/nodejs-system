// Factory - Criar ações agendadas
import { IScheduledAction, IScheduledActionFactory, ScheduledActionType, ScheduledActionPayload } from '../../ports/IScheduledAction';
import { WhatsAppMessageAction } from './actions/WhatsAppMessageAction';
import { ApiCallAction } from './actions/ApiCallAction';
import { WebhookAction } from './actions/WebhookAction';
import { IEvolutionAPI } from '../../ports/IEvolutionAPI';

export class ScheduledActionFactory implements IScheduledActionFactory {
  constructor(private evolutionAPI: IEvolutionAPI) {}

  create(type: ScheduledActionType, payload: ScheduledActionPayload): IScheduledAction {
    switch (type) {
      case ScheduledActionType.WHATSAPP_MESSAGE:
        return new WhatsAppMessageAction(this.evolutionAPI);

      case ScheduledActionType.API_CALL:
        return new ApiCallAction();

      case ScheduledActionType.WEBHOOK:
        return new WebhookAction();

      default:
        throw new Error(`Tipo de ação não suportado: ${type}`);
    }
  }
}
