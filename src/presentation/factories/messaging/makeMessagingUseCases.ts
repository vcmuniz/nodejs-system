// Use Case Factories para Messaging
import { makeMessagingRepository } from '../../../infra/database/factories/makeMessagingRepository';
import { makeMessagingAdapterFactory } from '../../../infra/database/factories/makeMessagingAdapterFactory';
import { SendMessage } from '../../../usercase/messaging/SendMessage';
import { CreateMessagingInstance } from '../../../usercase/messaging/CreateMessagingInstance';
import { ListMessagingInstances } from '../../../usercase/messaging/ListMessagingInstances';

export function makeSendMessageUseCase(): SendMessage {
  const messagingRepository = makeMessagingRepository();
  const adapterFactory = makeMessagingAdapterFactory();
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
