// Factory para criar Messaging Adapter Factory
import { WhatsAppFactory } from '../../factories/whatsapp/WhatsAppFactory';
import { MessagingAdapterFactory } from '../../messaging/MessagingAdapterFactory';

export function makeMessagingAdapterFactory(): MessagingAdapterFactory {
  const evolutionAPI = WhatsAppFactory.getEvolutionAPI();
  return new MessagingAdapterFactory(evolutionAPI);
}
