# Fluxo de Integração WhatsApp com Kafka

## 1. ENVIO IMEDIATO DE MENSAGEM

```
┌─────────────────────────────────────────────────────────────────┐
│ CLIENT faz POST /api/whatsapp/send-message                      │
├─────────────────────────────────────────────────────────────────┤
│ {                                                               │
│   "instanceName": "business",                                  │
│   "phoneNumber": "5511999999999",                              │
│   "message": "Olá!"                                            │
│ }                                                               │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ SendWhatsAppMessageController.handle()                          │
│ - Valida autenticação (req.user.id)                             │
│ - Extrai dados do request                                       │
│ - Chama use case                                                │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ SendWhatsAppMessage.execute()                                   │
│ - Valida entrada (telefone, tamanho mensagem, etc)             │
│ - Publica evento no Kafka: 'whatsapp-send-message'             │
│ - Retorna imediatamente com status='queued'                     │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ KAFKA: Topic 'whatsapp-send-message'                           │
│ Mensagem:                                                       │
│ {                                                               │
│   "userId": "user-123",                                        │
│   "instanceName": "business",                                  │
│   "phoneNumber": "5511999999999",                              │
│   "message": "Olá!",                                           │
│   "timestamp": "2025-12-11T02:56:37Z"                          │
│ }                                                               │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ RESPONSE ao client (200 OK - IMEDIATO)                          │
│ {                                                               │
│   "success": true,                                             │
│   "status": "queued"                                           │
│ }                                                               │
└─────────────────────────────────────────────────────────────────┘

═════════════════════════════════════════════════════════════════

⏱️ PROCESSAMENTO ASSÍNCRONO (em background):

┌─────────────────────────────────────────────────────────────────┐
│ Kafka Consumer: ProcessSendWhatsAppMessage                      │
│ (escuta topic 'whatsapp-send-message')                         │
│                                                                 │
│ Processa:                                                       │
│ - Envia via Evolution API                                       │
│ - Registra no banco (WhatsAppMessageLog)                        │
│ - Trata erros robustamente                                      │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ Evolution API                                                   │
│ POST /message/sendText/business                                │
│ - Envia para WhatsApp                                          │
│ - Retorna messageId                                            │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ Database: WhatsAppMessageLog                                    │
│ id: msg_xxx                                                     │
│ status: 'sent'                                                  │
│ messageId: retornado da API                                     │
│ direction: 'sent'                                               │
│ createdAt: timestamp                                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. ENVIO AGENDADO DE MENSAGEM

```
┌─────────────────────────────────────────────────────────────────┐
│ CLIENT faz POST /api/whatsapp/schedule-message                 │
├─────────────────────────────────────────────────────────────────┤
│ {                                                               │
│   "instanceName": "business",                                  │
│   "phoneNumber": "5511999999999",                              │
│   "message": "Olá!",                                           │
│   "scheduledFor": "2025-12-12T10:30:00Z"  ← HORA DO ENVIO     │
│ }                                                               │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ ScheduleWhatsAppMessageController.handle()                      │
│ - Valida data (deve ser no futuro)                             │
│ - Máximo 90 dias                                               │
│ - Chama use case                                               │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ ScheduleWhatsAppMessage.execute()                               │
│ - Cria scheduleId único                                        │
│ - Publica evento no Kafka: 'whatsapp-schedule-message'         │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ KAFKA: Topic 'whatsapp-schedule-message'                       │
│ Mensagem:                                                       │
│ {                                                               │
│   "scheduleId": "schedule_123_abc",                            │
│   "userId": "user-123",                                        │
│   "instanceName": "business",                                  │
│   "phoneNumber": "5511999999999",                              │
│   "message": "Olá!",                                           │
│   "scheduledFor": "2025-12-12T10:30:00Z"  ← IMPORTANTE        │
│ }                                                               │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ RESPONSE ao client (202 ACCEPTED)                              │
│ {                                                               │
│   "success": true,                                             │
│   "scheduleId": "schedule_123_abc",                            │
│   "scheduledFor": "2025-12-12T10:30:00Z",                      │
│   "message": "Mensagem agendada com sucesso"                   │
│ }                                                               │
└─────────────────────────────────────────────────────────────────┘

═════════════════════════════════════════════════════════════════

⏱️ PROCESSAMENTO AGENDADO (em background - na hora agendada):

┌─────────────────────────────────────────────────────────────────┐
│ Kafka Consumer: ProcessScheduleWhatsAppMessage                  │
│ (escuta topic 'whatsapp-schedule-message')                     │
│                                                                 │
│ Espera até scheduledFor:                                       │
│ - Calcula delay: scheduledFor - now()                          │
│ - Aguarda esse tempo                                           │
│ - Processa quando chegar na hora                              │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ Evolution API (na hora agendada)                               │
│ POST /message/sendText/business                                │
│ - Envia para WhatsApp                                          │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ Database: WhatsAppMessageLog                                    │
│ Registra envio agendado                                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. WEBHOOKS DA EVOLUTION API (Entrada de Eventos)

```
┌─────────────────────────────────────────────────────────────────┐
│ Evolution API envia webhook                                     │
│ POST /webhooks/whatsapp                                        │
│ Eventos possíveis:                                             │
│ - messages.upsert (nova mensagem)                              │
│ - messages.update (status de mensagem)                         │
│ - connection.update (mudança de conexão)                       │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ WebhookHandler.handle()                                         │
│ - Recebe evento da Evolution                                   │
│ - Identifica tipo de evento                                    │
│ - Chama método apropriado                                      │
└─────────────────────────────────────────────────────────────────┘
                            ↓
                    ┌───────┴───────┐
                    ↓               ↓
        ┌──────────────────┐  ┌──────────────────┐
        │ Message Status   │  │ Connection       │
        │ Update           │  │ Change           │
        └──────────────────┘  └──────────────────┘
                    ↓               ↓
        ┌──────────────────┐  ┌──────────────────┐
        │ Publica no Kafka │  │ Publica no Kafka │
        │ 'whatsapp-       │  │ 'whatsapp-       │
        │ message-status'  │  │ instance-status' │
        └──────────────────┘  └──────────────────┘
                    ↓               ↓
        ┌──────────────────┐  ┌──────────────────┐
        │ Atualiza banco   │  │ Atualiza banco   │
        │ MessageLog.      │  │ Instance.status  │
        │ status='read'    │  │ state='connected'│
        └──────────────────┘  └──────────────────┘

═════════════════════════════════════════════════════════════════

⏱️ PROCESSAMENTO DO WEBHOOK (em background):

┌─────────────────────────────────────────────────────────────────┐
│ Kafka Consumers                                                 │
│ - ProcessMessageStatus                                         │
│ - ProcessInstanceStatus                                        │
│                                                                 │
│ Processam eventos e atualizam banco                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. FLUXO COMPLETO (Visão Geral)

```
                         CLIENTE
                            ↑
                            │ Response
                            │ imediato
                            │
                    ┌───────┴────────┐
                    ↓                ↓
            Envio Imediato    Envio Agendado
            (200 OK)          (202 Accepted)
                    │                │
                    ↓                ↓
            ┌───────────────────────────────┐
            │      KAFKA (Message Queue)    │
            │                               │
            │ Topics:                       │
            │ - whatsapp-send-message      │
            │ - whatsapp-schedule-message  │
            │ - whatsapp-message-status    │
            │ - whatsapp-instance-status   │
            └───────────────────────────────┘
                    │       │       │       │
        ┌───────────┘       │       │       └────────────┐
        │                   │       │                    │
        ↓                   ↓       ↓                    ↓
    Processa      Aguarda     Webhook      Webhook
    Imediato      Horário     Status       Instância
    (segundos)    Agendado    Update       Change
                  (horas/dias)
        │                   │       │                    │
        ↓                   ↓       ↓                    ↓
    Evolution API ──────────┘       │                    │
    (envia mensagem)                │                    │
                                    ↓                    ↓
                            Database Updates
                            (MessageLog, Instance)
```

---

## 5. TIMEOUT E RETRY

Atualmente (sem consumer de agendamento):

```
✅ Funciona:
- Envio imediato (via Kafka consumer real-time)
- Webhooks da Evolution (em tempo real)
- Armazenamento no banco

⚠️ PENDENTE:
- Consumer que processa agendamentos
  (precisa escutar Kafka e executar na hora certa)
```

---

## 6. COMO INTEGRAR O CONSUMER DE AGENDAMENTO

```typescript
// Você precisa criar algo tipo:

class ProcessScheduleWhatsAppMessageConsumer {
  constructor(private messageQueue: IMessageQueue) {}

  async start() {
    await this.messageQueue.subscribe(
      'whatsapp-schedule-message',
      async (message) => {
        const { scheduledFor, ...data } = message;
        
        // Calcular quanto tempo falta
        const delay = new Date(scheduledFor).getTime() - Date.now();
        
        // Aguardar até a hora
        if (delay > 0) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
        
        // Enviar mensagem
        await this.processSendWhatsAppMessage.execute(data);
      }
    );
  }
}
```

---

## RESUMO

| Tipo | Request | Response | Processamento | Banco |
|------|---------|----------|---------------|-------|
| Imediato | POST /send-message | 200 OK | Assíncrono (segundos) | ✅ |
| Agendado | POST /schedule-message | 202 Accepted | Assíncrono (na hora) | ⏳ Pendente |
| Webhook Status | Evolution → /webhooks/whatsapp | 200 OK | Assíncrono | ✅ |
| Webhook Conexão | Evolution → /webhooks/whatsapp | 200 OK | Assíncrono | ✅ |

