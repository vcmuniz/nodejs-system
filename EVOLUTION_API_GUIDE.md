# Evolution API - Guia de Integração Completo

Integração com Evolution API seguindo a documentação oficial: https://doc.evolution-api.com/v2/api-reference

## 📋 Endpoints da API

### Instance Management

#### GET /instance/get/{instanceName}
Obter informações de uma instância específica
```bash
curl -X GET http://localhost:8080/instance/get/business \
  -H "apikey: sua_chave_api"
```

#### GET /instance/fetchInstances
Listar todas as instâncias
```bash
curl -X GET http://localhost:8080/instance/fetchInstances \
  -H "apikey: sua_chave_api"
```

#### POST /instance/create
Criar nova instância
```bash
curl -X POST http://localhost:8080/instance/create \
  -H "apikey: sua_chave_api" \
  -H "Content-Type: application/json" \
  -d '{
    "instanceName": "business",
    "number": "5511999999999"
  }'
```

#### GET /instance/connect/{instanceName}
Conectar instância e obter QR Code
```bash
curl -X GET http://localhost:8080/instance/connect/business \
  -H "apikey: sua_chave_api"
```

#### GET /instance/disconnect/{instanceName}
Desconectar instância
```bash
curl -X GET http://localhost:8080/instance/disconnect/business \
  -H "apikey: sua_chave_api"
```

#### DELETE /instance/delete/{instanceName}
Deletar instância
```bash
curl -X DELETE http://localhost:8080/instance/delete/business \
  -H "apikey: sua_chave_api"
```

#### POST /instance/restart/{instanceName}
Reiniciar instância
```bash
curl -X POST http://localhost:8080/instance/restart/business \
  -H "apikey: sua_chave_api"
```

### Messaging

#### POST /message/sendText/{instanceName}
Enviar mensagem de texto
```bash
curl -X POST http://localhost:8080/message/sendText/business \
  -H "apikey: sua_chave_api" \
  -H "Content-Type: application/json" \
  -d '{
    "number": "5511999999999",
    "text": "Olá! Esta é uma mensagem de teste"
  }'
```

## 🚀 Uso na Aplicação

### 1. Criar Instância WhatsApp

```typescript
import { WhatsAppFactory } from './src/infra/factories/whatsapp/WhatsAppFactory';

const evolutionAPI = WhatsAppFactory.getEvolutionAPI();

// Criar instância
const instance = await evolutionAPI.createInstance({
  instanceName: 'business',
  number: '5511999999999',
  webhook: {
    url: 'http://seu-servidor.com/webhooks/whatsapp',
    enabled: true
  }
});

console.log('Instância criada:', instance);
```

### 2. Conectar e Obter QR Code

```typescript
// Conectar instância
const qrcode = await evolutionAPI.connectInstance('business');

console.log('QR Code:', qrcode.qrcode.base64);
// Mostrar QR Code para o usuário escanear
```

### 3. Enviar Mensagem

```typescript
const sendMessage = WhatsAppFactory.getSendWhatsAppMessage();

const result = await sendMessage.execute({
  userId: 'user-123',
  instanceName: 'business',
  phoneNumber: '5511999999999',
  message: 'Olá! Como você está?'
});

if (result.success) {
  console.log('Mensagem enviada:', result.messageId);
} else {
  console.error('Erro:', result.error);
}
```

### 4. Obter Status da Instância

```typescript
const status = await evolutionAPI.getInstance('business');

console.log('Status:', status.instance.status);
console.log('Número:', status.instance.phoneNumber);
console.log('Conectado:', status.instance.state === 'CONNECTED');
```

### 5. Processar Webhooks

```typescript
import express from 'express';
import { WhatsAppFactory } from './src/infra/factories/whatsapp/WhatsAppFactory';

const app = express();
const webhookHandler = WhatsAppFactory.getWebhookHandler();

app.post('/webhooks/whatsapp', async (req, res) => {
  const event = req.body;

  console.log('Webhook recebido:', event);

  if (event.event === 'messages.upsert') {
    // Mensagem recebida
    console.log('Mensagem:', event.data);
  } else if (event.event === 'messages.update') {
    // Status de mensagem atualizado
    await webhookHandler.handleMessageStatusUpdate(event);
  } else if (event.event === 'connection.update') {
    // Mudança no status de conexão
    await webhookHandler.handleInstanceConnectionChange(event);
  }

  res.status(200).json({ received: true });
});
```

## 🔌 Rotas HTTP da Aplicação

### Enviar Mensagem
```
POST /api/whatsapp/send-message

Body:
{
  "instanceName": "business",
  "phoneNumber": "5511999999999",
  "message": "Olá!"
}

Response:
{
  "success": true,
  "messageId": "msg_...",
  "status": "sent"
}
```

### Obter Status da Instância
```
GET /api/whatsapp/status/:instanceName

Response:
{
  "instance": {
    "instanceName": "business",
    "status": "open",
    "state": "CONNECTED",
    "phoneNumber": "5511999999999"
  }
}
```

### Criar Instância
```
POST /api/whatsapp/create

Body:
{
  "instanceName": "business",
  "number": "5511999999999"
}

Response:
{
  "instance": {
    "instanceName": "business",
    "status": "close",
    "state": "DISCONNECTED"
  }
}
```

## 🔑 Configuração de Ambiente

```env
# Arquivo .env
EVOLUTION_API_KEY=sua_chave_api_aqui
EVOLUTION_API_URL=http://localhost:8080

# Webhook
WEBHOOK_URL=http://seu-servidor.com/webhooks/whatsapp
```

## 📊 Estados da Instância

| Estado | Descrição |
|--------|-----------|
| `CONNECTED` | Instância conectada e funcional |
| `DISCONNECTED` | Instância desconectada |
| `CONNECTING` | Em processo de conexão |
| `PAIRING` | Esperando escanear QR Code |

## 📊 Estados da Mensagem

| Status | Descrição |
|--------|-----------|
| `pending` | Mensagem aguardando envio |
| `sent` | Mensagem enviada |
| `delivered` | Mensagem entregue |
| `read` | Mensagem lida |
| `failed` | Falha ao enviar |

## ⚠️ Tratamento de Erros

```typescript
try {
  const result = await sendMessage.execute(input);
  
  if (!result.success) {
    console.error('Erro na lógica:', result.error);
    // Erro de validação ou na Evolution API
  }
} catch (error) {
  console.error('Erro não tratado:', error);
  // Erro crítico
}
```

## 🎯 Próximos Passos

- [ ] Adicionar modelos Prisma para persistência
- [ ] Implementar métodos do repositório com Prisma
- [ ] Adicionar rate limiting
- [ ] Implementar retry logic
- [ ] Adicionar logging estruturado
- [ ] Testes unitários
- [ ] Testes de integração
- [ ] Documentação de webhooks

## 📚 Referências

- [Evolution API Documentation](https://doc.evolution-api.com/v2/api-reference)
- [WhatsApp Business API](https://www.whatsapp.com/business/api)
