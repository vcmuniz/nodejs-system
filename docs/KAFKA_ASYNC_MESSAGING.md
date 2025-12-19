# Sistema de Mensagens Assíncronas via Kafka

## Visão Geral

O sistema de mensagens foi implementado com suporte a processamento assíncrono via Kafka, seguindo os princípios de Clean Architecture, SOLID e Hexagonal Architecture.

## Como Funciona

### Modo Síncrono (Padrão - Kafka Desabilitado)
Quando `KAFKA_ENABLED=false` ou não configurado:
- Mensagens são enviadas imediatamente quando a API é chamada
- O cliente aguarda a resposta da integração (Evolution API, etc)
- Status retornado: `pending` → `sent` ou `failed`

### Modo Assíncrono (Kafka Habilitado)
Quando `KAFKA_ENABLED=true`:
- Mensagem é enfileirada no Kafka imediatamente
- API retorna sucesso instantâneo com status `queued`
- Consumer processa em background e envia para a integração
- Status: `queued` → `processing` → `sent` ou `failed`

## Configuração

### Variáveis de Ambiente

Adicione ao `.env`:

```bash
# Habilitar Kafka
KAFKA_ENABLED=true

# Brokers do Kafka (separados por vírgula para múltiplos)
KAFKA_BROKERS=localhost:9092
# ou
KAFKA_BROKERS=kafka1:9092,kafka2:9092,kafka3:9092
```

### Instalar Kafka Localmente (Docker)

```bash
# docker-compose.yml
version: '3.8'
services:
  zookeeper:
    image: confluentinc/cp-zookeeper:latest
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181
    ports:
      - "2181:2181"

  kafka:
    image: confluentinc/cp-kafka:latest
    depends_on:
      - zookeeper
    ports:
      - "9092:9092"
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://localhost:9092
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1

# Iniciar
docker-compose up -d
```

## Arquitetura

### Componentes

```
┌─────────────┐
│   Cliente   │
└──────┬──────┘
       │ POST /api/messaging/message/send
       ▼
┌─────────────────────────────┐
│ SendMessageController       │
│ (Presentation Layer)        │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐    KAFKA_ENABLED?
│ makeSendMessageUseCase      │───────┐
│ (Factory)                   │       │
└─────────────────────────────┘       │
       │                              │
       ├──────────────────────────────┤
       │ false                        │ true
       ▼                              ▼
┌─────────────────┐         ┌──────────────────┐
│  SendMessage    │         │ SendMessageAsync │
│  (Síncrono)     │         │  (Assíncrono)    │
└────────┬────────┘         └─────────┬────────┘
         │                            │
         │                            ▼
         │                  ┌──────────────────┐
         │                  │  Kafka Producer  │
         │                  │  (Topic:         │
         │                  │   messaging.send)│
         │                  └─────────┬────────┘
         │                            │
         │                            ▼
         │                  ┌──────────────────┐
         │                  │  Kafka Consumer  │
         │                  │  (Background)    │
         │                  └─────────┬────────┘
         │                            │
         │                            ▼
         │                  ┌──────────────────────┐
         │                  │ ProcessMessageQueue  │
         │                  │ (Use Case)           │
         │                  └─────────┬────────────┘
         │                            │
         └────────────────────────────┘
                   │
                   ▼
         ┌──────────────────┐
         │ Evolution API /  │
         │ Outras Integrações│
         └──────────────────┘
```

### Domain Layer

**MessageQueueEvent** (`domain/messaging/MessageQueueEvent.ts`)
- Estrutura de dados do evento Kafka
- Contém todas informações necessárias para enviar mensagem

**MessageStatus** (`domain/messaging/MessagingChannel.ts`)
- Estados adicionais: `queued`, `processing`

### Use Cases

**SendMessageAsync** (`usercase/messaging/SendMessageAsync.ts`)
- Valida instância e usuário
- Cria registro com status `queued`
- Publica evento no Kafka
- Retorna imediatamente

**ProcessMessageQueue** (`usercase/messaging/ProcessMessageQueue.ts`)
- Processa evento do Kafka
- Atualiza status para `processing`
- Envia via adaptador da integração
- Atualiza para `sent` ou `failed`
- Implementa retry logic (3 tentativas)

### Infrastructure Layer

**KafkaAdapter** (`infra/kafka/KafkaAdapter.ts`)
- Implementa `IMessageQueue`
- Wrapper do `kafkajs`
- Producer e Consumer

**MessageConsumer** (`infra/kafka/MessageConsumer.ts`)
- Subscriber do tópico `messaging.send`
- Delega processamento para `ProcessMessageQueue`

### Factories

**makeKafkaAdapter** (`infra/kafka/factories/makeKafkaAdapter.ts`)
- Singleton do KafkaAdapter
- Retorna `null` se Kafka desabilitado

**makeMessageConsumer** (`infra/kafka/factories/makeMessageConsumer.ts`)
- Factory do consumer
- Conecta todas dependências

**makeSendMessageUseCase** (`presentation/factories/messaging/makeMessagingUseCases.ts`)
- Retorna `SendMessageAsync` se Kafka habilitado
- Retorna `SendMessage` (síncrono) se desabilitado

## Estados de Mensagem

| Estado | Descrição |
|--------|-----------|
| `pending` | Mensagem criada (modo síncrono) |
| `queued` | Mensagem enfileirada no Kafka |
| `processing` | Consumer processando |
| `sent` | Enviada com sucesso |
| `delivered` | Confirmada pela integração |
| `read` | Lida pelo destinatário |
| `failed` | Falha após todas tentativas |

## Retry Logic

- **Tentativas**: 3 (configurável em `maxRetries`)
- **Estratégia**: Kafka reprocessa automaticamente se consumer lança exceção
- **Após falha final**: Status `failed` e erro registrado no banco

## Monitoramento

### Logs

```bash
# Ao iniciar
[Kafka] Kafka desabilitado via configuração
# ou
[Kafka] Instância criada com brokers: ['localhost:9092']
[MessageConsumer] Iniciando consumer de mensagens...
[MessageConsumer] Consumer iniciado e aguardando mensagens

# Ao processar
[ProcessMessageQueue] Processando mensagem <id> (tentativa 1)
[ProcessMessageQueue] Mensagem <id> enviada com sucesso
# ou
[ProcessMessageQueue] Mensagem <id> falhou após 3 tentativas
```

### Consultar Mensagens

```sql
-- Mensagens enfileiradas
SELECT * FROM messaging_messages WHERE status = 'queued';

-- Mensagens sendo processadas
SELECT * FROM messaging_messages WHERE status = 'processing';

-- Mensagens com falha
SELECT * FROM messaging_messages WHERE status = 'failed';
```

## Exemplo de Uso

### Enviar Mensagem Individual

```bash
curl -X POST http://localhost:3000/api/messaging/message/send \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "channel": "whatsapp_evolution",
    "channelInstanceId": "my-instance",
    "remoteJid": "5585999999999",
    "message": "Olá!",
    "mediaUrl": "http://localhost:3000/uploads/...",
    "mediaType": "image"
  }'
```

**Resposta (Kafka desabilitado)**:
```json
{
  "success": true,
  "message": "Mensagem enviada com sucesso",
  "data": {
    "messageId": "uuid",
    "channelMessageId": "wamid...",
    "status": "sent",
    "timestamp": "2025-01-18T..."
  }
}
```

**Resposta (Kafka habilitado)**:
```json
{
  "success": true,
  "message": "Mensagem enviada com sucesso",
  "data": {
    "messageId": "uuid",
    "status": "queued",
    "queued": true
  }
}
```

### Enviar para Grupo

```bash
curl -X POST http://localhost:3000/api/messaging/message/send \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "channel": "whatsapp_evolution",
    "channelInstanceId": "my-instance",
    "groupId": "group-uuid",
    "message": "Olá grupo!"
  }'
```

## Vantagens do Modo Assíncrono

✅ **Performance**: API responde instantaneamente  
✅ **Resiliência**: Mensagens não se perdem se integração estiver offline  
✅ **Escalabilidade**: Múltiplos consumers processam em paralelo  
✅ **Retry Automático**: Kafka reprocessa falhas automaticamente  
✅ **Desacoplamento**: Sistema continua funcionando mesmo com problemas nas integrações  

## Desvantagens

⚠️ **Complexidade**: Requer Kafka rodando  
⚠️ **Latência**: Mensagem não é enviada imediatamente  
⚠️ **Debugging**: Mais difícil rastrear problemas  

## Quando Usar Cada Modo

| Cenário | Modo Recomendado |
|---------|------------------|
| Desenvolvimento local | Síncrono |
| Testes manuais | Síncrono |
| Produção (baixo volume) | Síncrono ou Assíncrono |
| Produção (alto volume) | Assíncrono |
| Envio em massa | Assíncrono |
| Notificações críticas | Síncrono (feedback imediato) |
| Campanhas de marketing | Assíncrono |

## Migração Gradual

1. **Fase 1**: Manter `KAFKA_ENABLED=false` (padrão atual)
2. **Fase 2**: Instalar Kafka em staging
3. **Fase 3**: Habilitar Kafka em staging para testes
4. **Fase 4**: Monitorar performance e erros
5. **Fase 5**: Habilitar em produção gradualmente

## Troubleshooting

### Kafka não conecta

```bash
# Verificar se Kafka está rodando
docker ps | grep kafka

# Verificar logs do Kafka
docker logs <kafka-container>

# Testar conexão
telnet localhost 9092
```

### Mensagens não processam

```bash
# Verificar se consumer está rodando
# Logs devem mostrar:
[MessageConsumer] Consumer iniciado e aguardando mensagens

# Verificar tópico existe
docker exec -it <kafka-container> kafka-topics --list --bootstrap-server localhost:9092

# Criar tópico manualmente se necessário
docker exec -it <kafka-container> kafka-topics --create \
  --bootstrap-server localhost:9092 \
  --topic messaging.send \
  --partitions 3 \
  --replication-factor 1
```

### Mensagens ficam em `queued`

- Consumer não está rodando
- Kafka offline
- Erro no processamento (verificar logs)

## Próximos Passos

- [ ] Implementar Dead Letter Queue para mensagens com falha permanente
- [ ] Adicionar métricas (Prometheus/Grafana)
- [ ] Implementar backpressure/rate limiting
- [ ] Adicionar webhooks de notificação de status
- [ ] Suporte a priorização de mensagens
- [ ] Dashboard de monitoramento em tempo real
