# 📚 Swagger Atualizado - Messaging APIs

## ✅ O que foi adicionado ao Swagger

### 📊 Schemas (Definições de tipos)

Adicionados 3 novos schemas ao Swagger:

1. **MessagingChannel**
   - Enum com todos os canais suportados: `whatsapp`, `sms`, `email`, `telegram`, `facebook`

2. **MessagingInstanceData**
   - Representa uma instância de messageria
   - Campos: id, userId, channel, channelInstanceId, channelPhoneOrId, status, qrCode, metadata, timestamps
   - Genérica para todos os canais

3. **MessagingMessage**
   - Representa uma mensagem
   - Campos: id, userId, instanceId, channel, remoteJid, message, channelMessageId, direction, status, media info, retries, timestamps
   - Agnóstica de canal

### 🔌 Endpoints (3 novas rotas)

#### 1. **GET /api/messaging/instances**
```
Lista todas as instâncias de messaging do usuário

Parâmetros:
  - channel (opcional): Filtrar por canal (whatsapp, sms, email, telegram, facebook)

Resposta 200:
{
  "success": true,
  "message": "Instâncias listadas com sucesso",
  "data": [
    {
      "id": "uuid",
      "userId": "user123",
      "channel": "whatsapp_evolution",
      "channelInstanceId": "minha-instancia",
      "channelPhoneOrId": "5585999999999",
      "status": "connected",
      "qrCode": null,
      "metadata": {},
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### 2. **POST /api/messaging/instance**
```
Criar e conectar uma nova instância de messageria

Body:
{
  "channel": "whatsapp_evolution",
  "channelInstanceId": "minha-instancia",
  "channelPhoneOrId": "5585999999999",
  "credentials": { "token": "evolution-api-token" }
}

Resposta 201:
{
  "success": true,
  "message": "Instância criada com sucesso",
  "data": {
    "instanceId": "uuid",
    "status": "connecting",
    "qrCode": "data:image/png;base64,...",
    "message": "Escaneie o QR code"
  }
}
```

#### 3. **POST /api/messaging/message/send**
```
Enviar mensagem por qualquer canal de forma agnóstica

Body:
{
  "channel": "whatsapp_evolution",
  "channelInstanceId": "minha-instancia",
  "remoteJid": "5585988888888",
  "message": "Olá!",
  "mediaUrl": "https://example.com/image.jpg",
  "mediaType": "image"
}

Resposta 200:
{
  "success": true,
  "message": "Mensagem enviada com sucesso",
  "data": {
    "messageId": "uuid",
    "channelMessageId": "whatsapp-msg-123",
    "status": "sent",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

---

## 🚀 Como visualizar

### Acessar Swagger UI

```bash
# 1. Rodar a aplicação
npm run dev

# 2. Acessar no navegador
http://localhost:3000/api-docs
```

### Ver endpoints de Messaging

1. Acesse http://localhost:3000/api-docs
2. Procure por "Messaging (Multi-Channel)" no dropdown de tags
3. Verá os 3 endpoints com documentação completa

---

## 📋 Detalhes dos Endpoints

### Segurança
✅ Todos os endpoints requerem autenticação Bearer Token (JWT)

### Headers obrigatórios
```
Authorization: Bearer <seu-token-jwt>
Content-Type: application/json
```

### Códigos de resposta

| Código | Significado |
|--------|-----------|
| 200 | Sucesso (GET, POST envio de msg) |
| 201 | Criado com sucesso (POST instance) |
| 400 | Bad request (campos obrigatórios faltando, dados inválidos) |
| 401 | Não autenticado (token inválido ou expirado) |
| 500 | Erro interno do servidor |

---

## 🔄 Fluxo típico de uso (via Swagger UI)

### Passo 1: Criar instância WhatsApp
1. Abra Swagger UI (http://localhost:3000/api-docs)
2. Procure por "POST /api/messaging/instance"
3. Clique em "Try it out"
4. Preencha:
   ```json
   {
     "channel": "whatsapp_evolution",
     "channelInstanceId": "minha-instancia",
     "channelPhoneOrId": "5585999999999",
     "credentials": { "token": "seu-evolution-token" }
   }
   ```
5. Clique em "Execute"
6. Copie o `instanceId` da resposta

### Passo 2: Listar instâncias (verificar status)
1. Procure por "GET /api/messaging/instances"
2. Clique em "Try it out"
3. Clique em "Execute"
4. Veja a lista de instâncias criadas

### Passo 3: Enviar mensagem
1. Procure por "POST /api/messaging/message/send"
2. Clique em "Try it out"
3. Preencha:
   ```json
   {
     "channel": "whatsapp_evolution",
     "channelInstanceId": "minha-instancia",
     "remoteJid": "5585988888888",
     "message": "Olá, testando messageria!"
   }
   ```
4. Clique em "Execute"
5. Veja a resposta com status da mensagem

---

## 🌐 Exemplos de Requisições (CURL)

### Listar instâncias
```bash
curl -X GET 'http://localhost:3000/api/messaging/instances?channel=whatsapp' \
  -H 'Authorization: Bearer seu-token-jwt' \
  -H 'Content-Type: application/json'
```

### Criar instância
```bash
curl -X POST 'http://localhost:3000/api/messaging/instance' \
  -H 'Authorization: Bearer seu-token-jwt' \
  -H 'Content-Type: application/json' \
  -d '{
    "channel": "whatsapp_evolution",
    "channelInstanceId": "minha-instancia",
    "channelPhoneOrId": "5585999999999",
    "credentials": { "token": "evolution-token" }
  }'
```

### Enviar mensagem
```bash
curl -X POST 'http://localhost:3000/api/messaging/message/send' \
  -H 'Authorization: Bearer seu-token-jwt' \
  -H 'Content-Type: application/json' \
  -d '{
    "channel": "whatsapp_evolution",
    "channelInstanceId": "minha-instancia",
    "remoteJid": "5585988888888",
    "message": "Olá!"
  }'
```

---

## 📝 Notas importantes

### Agnóstico de canal
Os 3 endpoints funcionam com **qualquer canal suportado**:
- ✅ WhatsApp
- ✅ SMS (quando implementado)
- ✅ Email (quando implementado)
- ✅ Telegram (quando implementado)
- ✅ Facebook (quando implementado)

**Não precisa mudar código de chamada**. Só muda o `channel`.

### Autenticação
Todos os endpoints requerem token JWT válido no header `Authorization`.

Token deve ser obtido via login (`POST /api/auth/signin`).

### Rate Limiting
Nenhum rate limiting implementado atualmente. Se precisar, implementaremos.

### Validações
- `channel`: Obrigatório, deve ser um dos valores do enum
- `channelInstanceId`: Obrigatório, único por canal
- `remoteJid`: Obrigatório, formato depende do canal
- `message`: Obrigatório, não pode estar vazio

---

## 🔄 Mudanças no Swagger

Arquivos modificados:
- ✅ `src/config/swagger.ts` - Adicionados schemas
- ✅ `src/presentation/routes/messaging.routes.ts` - Adicionada documentação JSDoc

Nenhum arquivo foi deletado ou refatorado significativamente.

---

## ✅ Próximos passos

1. **Rodar migration do Prisma** (se ainda não fez)
   ```bash
   npx prisma migrate dev --name "add-messaging-tables"
   ```

2. **Integrar rotas no app.ts** (se ainda não fez)
   ```typescript
   import { makeMessagingRoutes } from './presentation/routes/messaging.routes';
   app.use('/api/messaging', makeMessagingRoutes());
   ```

3. **Testar endpoints no Swagger UI**
   ```bash
   npm run dev
   # Abre http://localhost:3000/api-docs
   ```

4. **Adicionar novos schemas quando implementar novos canais**

---

## 📚 Documentação relacionada

- `MESSAGERIA_QUICK_START.md` - Exemplos de uso
- `MESSAGERIA_EXEMPLOS.md` - Código para integração
- `MESSAGERIA_ARCHITECTURE.md` - Arquitetura técnica

---

**Status**: ✅ Swagger atualizado com Messaging APIs
**Data**: 2024-12-16
