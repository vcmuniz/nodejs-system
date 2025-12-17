# 🔔 Configuração de Webhook

## ⚙️ Variáveis de Ambiente

Adicione no seu `.env`:

```bash
# URL base da sua aplicação (para webhook)
WEBHOOK_URL=https://seu-dominio.com
# OU
APP_URL=https://seu-dominio.com
```

**Exemplos:**
- Desenvolvimento local: `http://localhost:3000`
- ngrok: `https://abc123.ngrok.io`
- Produção: `https://api.seuapp.com`

---

## 🚀 Como Funciona

### 1. Criar Instância

Quando você cria uma instância:

```bash
POST /api/messaging/instance
{
  "channel": "whatsapp_evolution",
  "channelInstanceId": "my-store",
  "channelPhoneOrId": "5521999999999"
}
```

**O sistema automaticamente:**

1. ✅ Cria a instância na Evolution API
2. ✅ Conecta e gera QR Code
3. ✅ **Configura o webhook** → `{WEBHOOK_URL}/api/messaging/webhook/my-store`

---

## 📨 Endpoint do Webhook

**URL:** `POST /api/messaging/webhook/:instanceId`

**Exemplo:** `https://seu-dominio.com/api/messaging/webhook/my-store`

### Eventos Recebidos

A Evolution API enviará eventos como:

```json
{
  "event": "messages.upsert",
  "instance": "my-store",
  "data": {
    "key": {
      "remoteJid": "5521999999999@s.whatsapp.net",
      "fromMe": false,
      "id": "BAE5..."
    },
    "message": {
      "conversation": "Olá!"
    },
    "messageTimestamp": "1702828800"
  }
}
```

---

## 🔍 Logs

Os webhooks são automaticamente logados:

```
[Webhook] Recebido para instância: my-store
[Webhook] Event: messages.upsert
[Webhook] Data keys: ['key', 'message', 'messageTimestamp']
```

---

## 🧪 Testando Localmente com ngrok

### 1. Instalar ngrok

```bash
# Linux/Mac
brew install ngrok
# ou
npm install -g ngrok
```

### 2. Expor sua aplicação

```bash
ngrok http 3000
```

**Output:**
```
Forwarding  https://abc123.ngrok.io -> http://localhost:3000
```

### 3. Configurar no .env

```bash
WEBHOOK_URL=https://abc123.ngrok.io
```

### 4. Reiniciar servidor

```bash
pnpm dev
```

### 5. Criar instância

```bash
curl -X POST http://localhost:3000/api/messaging/instance \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "channel": "whatsapp_evolution",
    "channelInstanceId": "test-ngrok",
    "channelPhoneOrId": "5521999999999"
  }'
```

**Webhook configurado em:** `https://abc123.ngrok.io/api/messaging/webhook/test-ngrok` ✅

---

## 📊 Verificar Webhook Configurado

### Na Evolution API:

```bash
curl http://localhost:8080/instance/connectionState/my-store \
  -H "apikey: evolution-api-key-clubfacts-2025"
```

**Response inclui:**
```json
{
  "webhook": {
    "url": "https://seu-dominio.com/api/messaging/webhook/my-store",
    "enabled": true
  }
}
```

---

## 🛠️ Processar Webhooks (TODO)

Atualmente o webhook apenas loga os eventos. Para processar:

1. **messages.upsert** → Nova mensagem recebida
2. **connection.update** → Status da conexão mudou
3. **qr.updated** → Novo QR Code gerado
4. **message.sent** → Mensagem enviada
5. **message.ack** → Status de entrega atualizado

**Próximos passos:**
- Salvar mensagens no banco (`messaging_messages`)
- Atualizar status da instância
- Disparar eventos para processamento
- Integrar com fila (Kafka/Redis)

---

## ⚠️ Troubleshooting

### Webhook não está sendo chamado

1. **Verificar URL pública:** 
   - `WEBHOOK_URL` precisa ser acessível da internet
   - Não pode ser `localhost` (use ngrok)

2. **Verificar logs:**
   ```bash
   # Deve aparecer ao criar instância:
   [WhatsAppAdapter] Configurando webhook: https://...
   [WhatsAppAdapter] Webhook configurado com sucesso
   ```

3. **Testar manualmente:**
   ```bash
   curl -X POST http://localhost:3000/api/messaging/webhook/test \
     -H "Content-Type: application/json" \
     -d '{"event":"test","data":{}}'
   ```

### Webhook retornando erro

- Verifique se o endpoint está respondendo
- Cheque se não há autenticação bloqueando
- Webhook endpoint **NÃO** requer autenticação JWT

---

## 🎯 Configuração de Produção

### Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name api.seuapp.com;

    location /api/messaging/webhook {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Docker Compose

```yaml
services:
  api:
    environment:
      - WEBHOOK_URL=https://api.seuapp.com
      - EVOLUTION_API_URL=http://evolution:8080
```

---

## ✅ Checklist

- [ ] `WEBHOOK_URL` configurado no `.env`
- [ ] URL é acessível publicamente (ou via ngrok)
- [ ] Servidor reiniciado após configurar `.env`
- [ ] Instância criada com sucesso
- [ ] Webhook configurado (check nos logs)
- [ ] Testou enviar mensagem e verificou webhook

---

## 📚 Documentação

- **Swagger:** http://localhost:3000/api-docs
- **Evolution API Docs:** https://doc.evolution-api.com/v2/api-reference
- **Endpoint:** `POST /api/messaging/webhook/:instanceId`
