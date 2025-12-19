# 🔗 Configuração de Webhook Evolution API

## ✅ Configuração Automática

O sistema **configura automaticamente** o webhook ao criar uma instância de messaging.

### Como funciona:

1. **APP_DOMAIN** no `.env` define a URL base
2. Ao criar instância via API, o webhook é configurado automaticamente
3. URL do webhook: `{APP_DOMAIN}/api/messaging/webhook/{instanceId}`

## 🌐 Configuração Atual

```env
APP_DOMAIN=https://stackline-api.stackline.com.br
```

**Webhook será:**
```
https://stackline-api.stackline.com.br/api/messaging/webhook/NOME_DA_INSTANCIA
```

## 📝 Exemplo de Criação de Instância

```bash
curl -X POST https://stackline-api.stackline.com.br/api/messaging/instance \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "channel": "whatsapp_evolution",
    "channelInstanceId": "minha-instancia",
    "channelPhoneOrId": "5511999999999"
  }'
```

O webhook será automaticamente configurado como:
```
https://stackline-api.stackline.com.br/api/messaging/webhook/minha-instancia
```

## 🔍 Como o Sistema Decide a URL

1. **Produção:** Usa `ENV.APP_DOMAIN` (https://stackline-api.stackline.com.br)
2. **Desenvolvimento:** Se APP_DOMAIN não estiver definido, usa http://localhost:3000

## ✅ Vantagens

- ✅ Webhook configurado automaticamente
- ✅ URL consistente (usa o túnel Cloudflare)
- ✅ Não precisa configurar manualmente
- ✅ Funciona em produção e desenvolvimento

## 🧪 Testar Webhook

```bash
# Simular evento do Evolution
curl -X POST https://stackline-api.stackline.com.br/api/messaging/webhook/test-instance \
  -H "Content-Type: application/json" \
  -d '{
    "event": "messages.upsert",
    "instance": "test-instance",
    "data": {
      "key": {
        "remoteJid": "5511999999999@s.whatsapp.net"
      },
      "message": {
        "conversation": "Olá!"
      }
    }
  }'
```

## 📋 Alteração Realizada

**Arquivo:** `src/presentation/controllers/messaging/CreateMessagingInstanceController.ts`

**Antes:**
```typescript
const protocol = req.protocol;
const host = req.get('host');
const webhookBaseUrl = `${protocol}://${host}`;
```

**Depois:**
```typescript
import { ENV } from '../../../config/enviroments';
const webhookBaseUrl = ENV.APP_DOMAIN;
```

## 🎯 Resultado

Agora todas as instâncias criadas usarão automaticamente:
```
https://stackline-api.stackline.com.br/api/messaging/webhook/{instanceId}
```
