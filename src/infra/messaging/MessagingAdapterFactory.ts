// Factory para criar adaptadores de messaging
import { IMessagingAdapter } from '../../ports/IMessagingAdapter';
import { MessagingChannel } from '../../domain/messaging/MessagingChannel';
import { WhatsAppAdapter } from './adapters/WhatsAppAdapter';
import { IEvolutionAPI } from '../../ports/IEvolutionAPI';
import { EvolutionAPIImpl } from '../whatsapp/EvolutionAPIImpl';

export class MessagingAdapterFactory {
  constructor(private evolutionAPI?: IEvolutionAPI) {}

  createAdapter(channel: MessagingChannel, credentials?: Record<string, any>): IMessagingAdapter {
    switch (channel) {
      case MessagingChannel.WHATSAPP_EVOLUTION:
        // Se credenciais foram passadas, cria nova instância do Evolution API
        let evolutionAPI = this.evolutionAPI;
        
        if (credentials && credentials.apiToken && credentials.baseUrl) {
          console.log('[MessagingAdapterFactory] Criando Evolution API com credenciais customizadas');
          evolutionAPI = new EvolutionAPIImpl(credentials.apiToken, credentials.baseUrl);
        } else if (!evolutionAPI) {
          console.warn('[MessagingAdapterFactory] Nenhuma credencial fornecida e evolutionAPI não inicializado!');
        }
        
        return new WhatsAppAdapter(evolutionAPI!);
      
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
