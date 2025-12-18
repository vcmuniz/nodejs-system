// Use Case Factories para Messaging
import { makeMessagingRepository } from '../../../infra/database/factories/makeMessagingRepository';
import { makeMessagingAdapterFactory } from '../../../infra/database/factories/makeMessagingAdapterFactory';
import { makeKafkaAdapter } from '../../../infra/kafka/factories/makeKafkaAdapter';
import { SendMessage } from '../../../usercase/messaging/SendMessage';
import { SendMessageAsync } from '../../../usercase/messaging/SendMessageAsync';
import { CreateMessagingInstance } from '../../../usercase/messaging/CreateMessagingInstance';
import { ListMessagingInstances } from '../../../usercase/messaging/ListMessagingInstances';

export function makeSendMessageUseCase(): SendMessage | SendMessageAsync {
  const kafkaAdapter = makeKafkaAdapter();
  const messagingRepository = makeMessagingRepository();
  const adapterFactory = makeMessagingAdapterFactory();
  
  if (kafkaAdapter) {
    console.log('[Factory] Usando SendMessageAsync (Kafka habilitado)');
    return new SendMessageAsync(messagingRepository, kafkaAdapter);
  }
  
  console.log('[Factory] Usando SendMessage síncrono (Kafka desabilitado)');
  return new SendMessage(messagingRepository, adapterFactory);
}

export function makeCreateMessagingInstanceUseCase(): CreateMessagingInstance {
  const messagingRepository = makeMessagingRepository();
  const adapterFactory = makeMessagingAdapterFactory();
  return new CreateMessagingInstance(messagingRepository, adapterFactory);
}

export function makeListMessagingInstancesUseCase(): ListMessagingInstances {
  const messagingRepository = makeMessagingRepository();
  return new ListMessagingInstances(messagingRepository);
}
