// Port - Interface para fila de mensagens (Kafka)
export interface KafkaMessage {
  topic: string;
  value: Record<string, any>;
  key?: string;
}

export interface IMessageQueue {
  publish(message: KafkaMessage): Promise<void>;
  subscribe(topic: string, callback: (message: Record<string, any>) => Promise<void>): Promise<void>;
  disconnect(): Promise<void>;
}
