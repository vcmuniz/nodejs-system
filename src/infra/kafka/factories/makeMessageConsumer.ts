import { MessageConsumer } from '../MessageConsumer';
import { ProcessMessageQueue } from '../../../usercase/messaging/ProcessMessageQueue';
import { makeMessagingRepository } from '../../database/factories/makeMessagingRepository';
import { makeMessagingAdapterFactory } from '../../database/factories/makeMessagingAdapterFactory';
import { makeKafkaAdapter } from './makeKafkaAdapter';

export function makeMessageConsumer(): MessageConsumer | null {
  const kafkaAdapter = makeKafkaAdapter();
  
  if (!kafkaAdapter) {
    return null;
  }

  const messagingRepository = makeMessagingRepository();
  const adapterFactory = makeMessagingAdapterFactory();
  const processMessageQueue = new ProcessMessageQueue(messagingRepository, adapterFactory);

  return new MessageConsumer(kafkaAdapter, processMessageQueue);
}
