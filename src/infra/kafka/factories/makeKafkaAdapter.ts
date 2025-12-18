import { KafkaAdapter } from '../KafkaAdapter';
import { ENV } from '../../../config/enviroments';

let kafkaInstance: KafkaAdapter | null = null;

export function makeKafkaAdapter(): KafkaAdapter | null {
  if (!ENV.KAFKA_ENABLED) {
    console.log('[Kafka] Kafka desabilitado via configuração');
    return null;
  }

  if (!kafkaInstance) {
    const brokers = ENV.KAFKA_BROKERS.split(',');
    kafkaInstance = new KafkaAdapter(brokers);
    console.log('[Kafka] Instância criada com brokers:', brokers);
  }

  return kafkaInstance;
}
