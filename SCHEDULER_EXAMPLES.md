# Exemplos Práticos de Agendamentos

## 1️⃣ ENVIAR WHATSAPP

```bash
curl -X POST http://localhost:3000/api/schedule \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "actionType": "whatsapp_message",
    "payload": {
      "instanceName": "business",
      "phoneNumber": "5511999999999",
      "message": "Olá! Seu pedido foi confirmado!"
    },
    "scheduledFor": "2025-12-12T10:30:00Z"
  }'
```

**Resultado:** Envia mensagem WhatsApp em 2025-12-12 às 10:30

---

## 2️⃣ CHAMAR API DO SEU PROJETO

### Exemplo A: Gerar Relatório

```bash
curl -X POST http://localhost:3000/api/schedule \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "actionType": "api_call",
    "payload": {
      "url": "http://localhost:3000/api/reports/generate",
      "method": "POST",
      "headers": {
        "Authorization": "Bearer INTERNAL_TOKEN"
      },
      "data": {
        "reportType": "sales",
        "period": "monthly",
        "userId": "user-123"
      }
    },
    "scheduledFor": "2025-12-15T23:59:00Z"
  }'
```

**Resultado:** Na data agendada, faz POST para gerar relatório de vendas

### Exemplo B: Enviar Email via seu serviço

```json
{
  "actionType": "api_call",
  "payload": {
    "url": "http://localhost:3000/api/email/send",
    "method": "POST",
    "data": {
      "to": "cliente@example.com",
      "subject": "Seu pedido está pronto",
      "template": "order_ready",
      "variables": {
        "orderId": "ORD-123",
        "clientName": "João"
      }
    }
  },
  "scheduledFor": "2025-12-12T14:00:00Z"
}
```

**Resultado:** Envia email através de sua API de emails

### Exemplo C: Atualizar Status no seu Banco

```json
{
  "actionType": "api_call",
  "payload": {
    "url": "http://localhost:3000/api/orders/123/confirm",
    "method": "PATCH",
    "data": {
      "status": "confirmed",
      "confirmedAt": "2025-12-12T10:00:00Z"
    }
  },
  "scheduledFor": "2025-12-12T10:00:00Z"
}
```

**Resultado:** Atualiza status do pedido no seu banco após 1 dia

---

## 3️⃣ DISPARAR PARA TERCEIROS

### Exemplo A: Webhook de Pagamento

```bash
curl -X POST http://localhost:3000/api/schedule \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "actionType": "webhook",
    "payload": {
      "webhookUrl": "https://stripe.com/webhooks/payment",
      "body": {
        "event": "payment.processed",
        "amount": 199.90,
        "currency": "BRL",
        "customerId": "cus_123",
        "orderId": "ORD-456",
        "timestamp": "2025-12-12T10:00:00Z"
      }
    },
    "scheduledFor": "2025-12-12T10:00:00Z"
  }'
```

**Resultado:** Envia notificação para Stripe na hora agendada

### Exemplo B: Webhook para Parceiro Externo

```json
{
  "actionType": "webhook",
  "payload": {
    "webhookUrl": "https://seu-parceiro.com/api/notifications",
    "body": {
      "type": "shipment",
      "trackingNumber": "BR123456789",
      "carrier": "Sedex",
      "destination": "São Paulo, SP",
      "estimatedDelivery": "2025-12-15",
      "clientEmail": "cliente@example.com"
    }
  },
  "scheduledFor": "2025-12-12T10:30:00Z"
}
```

**Resultado:** Notifica seu parceiro de logística sobre o envio

### Exemplo C: Webhook para Integração

```json
{
  "actionType": "webhook",
  "payload": {
    "webhookUrl": "https://zapier.com/hooks/catch/webhook-id/",
    "body": {
      "action": "create_contact",
      "name": "João Silva",
      "email": "joao@example.com",
      "phone": "11999999999",
      "source": "clubfacts"
    }
  },
  "scheduledFor": "2025-12-12T10:00:00Z"
}
```

**Resultado:** Cria contato no seu CRM via Zapier

---

## 4️⃣ CASOS DE USO REAIS

### Caso 1: Lembrete de Reunião

**De:** Seu sistema  
**Para:** WhatsApp do cliente + API interna + Email

```typescript
// 1. Agendar mensagem WhatsApp
{
  "actionType": "whatsapp_message",
  "payload": {
    "instanceName": "business",
    "phoneNumber": "5511999999999",
    "message": "Olá João! Lembrando: sua reunião é amanhã às 10:00 com o vendedor. Confirme presença!"
  },
  "scheduledFor": "2025-12-12T18:00:00Z"  // 6pm do dia anterior
}

// 2. Agendar chamada à sua API
{
  "actionType": "api_call",
  "payload": {
    "url": "http://localhost:3000/api/notifications/remind",
    "method": "POST",
    "data": {
      "clientId": "cli-123",
      "meetingId": "meet-456",
      "type": "meeting_reminder"
    }
  },
  "scheduledFor": "2025-12-12T18:00:00Z"
}

// 3. Agendar envio de email
{
  "actionType": "api_call",
  "payload": {
    "url": "http://localhost:3000/api/email/send",
    "method": "POST",
    "data": {
      "to": "joao@example.com",
      "template": "meeting_reminder",
      "variables": { "time": "10:00" }
    }
  },
  "scheduledFor": "2025-12-12T18:00:00Z"
}
```

---

### Caso 2: Follow-up Após Venda

**Dia 1:** Obrigado + WhatsApp  
**Dia 3:** Avaliação + Email  
**Dia 7:** Feedback + Webhook para CRM  

```typescript
// Agendar 1 dia depois
{
  "actionType": "whatsapp_message",
  "payload": {
    "instanceName": "sales",
    "phoneNumber": "5511999999999",
    "message": "Obrigado pela compra! Seu pedido foi enviado. Acompanhe em: https://..."
  },
  "scheduledFor": "2025-12-13T09:00:00Z"  // +1 dia
}

// Agendar 3 dias depois
{
  "actionType": "api_call",
  "payload": {
    "url": "http://localhost:3000/api/email/send",
    "method": "POST",
    "data": {
      "to": "cliente@example.com",
      "template": "product_review_request",
      "variables": { "productName": "Widget A" }
    }
  },
  "scheduledFor": "2025-12-15T09:00:00Z"  // +3 dias
}

// Agendar 7 dias depois
{
  "actionType": "webhook",
  "payload": {
    "webhookUrl": "https://seu-crm.com/api/customers/feedback",
    "body": {
      "customerId": "cus-123",
      "rating": null,
      "comment": "Aguardando feedback",
      "followUpDate": "2025-12-21"
    }
  },
  "scheduledFor": "2025-12-19T09:00:00Z"  // +7 dias
}
```

---

### Caso 3: Processamento Complexo

**Flow:** WhatsApp → API Interna → Webhook Externo

```json
{
  "actionType": "whatsapp_message",
  "payload": {
    "instanceName": "support",
    "phoneNumber": "5511999999999",
    "message": "Seu suporte será atendido agora. Ticket #SUP-789"
  },
  "scheduledFor": "2025-12-12T09:00:00Z"
}

// Depois de 5 minutos, faz update no seu banco
{
  "actionType": "api_call",
  "payload": {
    "url": "http://localhost:3000/api/tickets/SUP-789/status",
    "method": "PATCH",
    "data": { "status": "in_progress", "assignedTo": "support-team" }
  },
  "scheduledFor": "2025-12-12T09:05:00Z"
}

// Depois, notifica cliente externo
{
  "actionType": "webhook",
  "payload": {
    "webhookUrl": "https://ticket-system-externo.com/update",
    "body": {
      "ticketId": "SUP-789",
      "status": "in_progress",
      "eta": "30 minutes"
    }
  },
  "scheduledFor": "2025-12-12T09:10:00Z"
}
```

---

## 5️⃣ DICAS

### ✅ O que PODE fazer:

- Enviar para WhatsApp (Evolution API)
- Chamar sua própria API
- Chamar APIs de terceiros
- Disparar webhooks
- Atualizar banco de dados
- Enviar emails
- Gerar relatórios
- Sincronizar dados
- Notificações em tempo agendado

### ⚠️ Limitações:

- Máximo 90 dias no futuro
- Executa a cada minuto (não é em tempo real)
- Retry automático 3x (com 5min de intervalo)
- Precisa de URL acessível (se for externo)

### 🔒 Segurança:

```json
{
  "actionType": "api_call",
  "payload": {
    "url": "https://sua-api.com/endpoint",
    "method": "POST",
    "headers": {
      "Authorization": "Bearer SEU_TOKEN_SECRETO",
      "X-API-Key": "sua-chave"
    },
    "data": { ... }
  }
}
```

