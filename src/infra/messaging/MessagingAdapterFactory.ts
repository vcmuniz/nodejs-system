// Factory para criar adaptadores de messaging
import { IMessagingAdapter } from '../../ports/IMessagingAdapter';
import { MessagingChannel } from '../../domain/messaging/MessagingChannel';
import { WhatsAppAdapter } from './adapters/WhatsAppAdapter';
import { IEvolutionAPI } from '../../ports/IEvolutionAPI';

export class MessagingAdapterFactory {
  constructor(private evolutionAPI: IEvolutionAPI) {}

  createAdapter(channel: MessagingChannel): IMessagingAdapter {
    switch (channel) {
      case MessagingChannel.WHATSAPP_EVOLUTION:
        return new WhatsAppAdapter(this.evolutionAPI);
      
      case MessagingChannel.WHATSAPP_OFICIAL:
      case MessagingChannel.SMS:
      case MessagingChannel.EMAIL:
      case MessagingChannel.TELEGRAM:
      case MessagingChannel.FACEBOOK:
      default:
        throw new Error(`Adaptador não implementado para o canal: ${channel}`);
    }
  }
}
