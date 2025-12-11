// Adapter - Implementação Kafka
import { Kafka, Producer, Consumer, logLevel } from 'kafkajs';
import { IMessageQueue, KafkaMessage } from '../../ports/IMessageQueue';

export class KafkaAdapter implements IMessageQueue {
  private kafka: Kafka;
  private producer: Producer;
  private consumer: Consumer;

  constructor(brokers: string[]) {
    this.kafka = new Kafka({
      clientId: 'clubfacts-app',
      brokers,
      logLevel: logLevel.ERROR,
    });

    this.producer = this.kafka.producer();
    this.consumer = this.kafka.consumer({ groupId: 'clubfacts-group' });
  }

  async connect(): Promise<void> {
    await this.producer.connect();
    await this.consumer.connect();
  }

  async publish(message: KafkaMessage): Promise<void> {
    try {
      await this.producer.send({
        topic: message.topic,
        messages: [
          {
            key: message.key || undefined,
            value: JSON.stringify(message.value),
          },
        ],
      });

      console.log(`[Kafka] Message published to topic: ${message.topic}`);
    } catch (error) {
      console.error(`[Kafka] Error publishing message:`, error);
      throw error;
    }
  }

  async subscribe(
    topic: string,
    callback: (message: Record<string, any>) => Promise<void>,
  ): Promise<void> {
    try {
      await this.consumer.subscribe({ topic, fromBeginning: false });

      await this.consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          try {
            const data = JSON.parse(message.value?.toString() || '{}');
            console.log(`[Kafka] Message received from topic: ${topic}`, data);
            await callback(data);
          } catch (error) {
            console.error(`[Kafka] Error processing message:`, error);
          }
        },
      });
    } catch (error) {
      console.error(`[Kafka] Error subscribing to topic: ${topic}`, error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    await this.producer.disconnect();
    await this.consumer.disconnect();
  }
}
