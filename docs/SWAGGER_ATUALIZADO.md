# ✅ Swagger Atualizado - Campo `name`

## 📝 O Que Foi Atualizado

### 1. Endpoint POST /api/messaging/instance

**Request Body - Adicionado campo `name`:**
```yaml
name:
  type: string
  description: Nome amigável para identificar a instância (opcional)
  example: 'Loja Principal'
```

### 2. Response - Schema MessagingInstance

**Adicionado campo `name` no schema:**
```yaml
name:
  type: string
  example: 'Loja Principal'
  description: Nome amigável para identificar a instância
```

### 3. Endpoint GET /api/messaging/instances

**Response agora inclui o campo `name`:**
```yaml
name:
  type: string
  example: 'Loja Principal'
  description: Nome amigável da instância (opcional)
```

## 🌐 Como Acessar o Swagger

1. **Inicie o servidor:**
   ```bash
   pnpm dev
   ```

2. **Acesse no navegador:**
   ```
   http://localhost:3000/api-docs
   ```

3. **Ou via túnel (público):**
   ```
   https://stackline-api.stackline.com.br/api-docs
   ```

## 📸 O Que Você Verá

### POST /api/messaging/instance

**Request Body:**
```json
{
  "name": "Loja Principal",           ← NOVO CAMPO
  "channel": "whatsapp_evolution",
  "channelInstanceId": "loja-1",
  "channelPhoneOrId": "5511999999999"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "instanceId": "uuid",
    "name": "Loja Principal",        ← APARECE AQUI
    "status": "connecting",
    "qrCode": "data:image/png;base64,...",
    "message": "Instância criada..."
  }
}
```

### GET /api/messaging/instances

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-1",
      "name": "Loja Principal",      ← APARECE AQUI
      "channel": "whatsapp_evolution",
      "channelInstanceId": "loja-1",
      "status": "connected"
    },
    {
      "id": "uuid-2",
      "name": "Atendimento VIP",     ← APARECE AQUI
      "channel": "whatsapp_evolution",
      "channelInstanceId": "atendimento",
      "status": "connected"
    }
  ]
}
```

## 🎯 Arquivos Atualizados

- ✅ `src/presentation/routes/messaging.routes.ts`
  - Adicionado campo `name` na documentação do POST
  - Adicionado campo `name` na documentação do GET
  
- ✅ `src/config/swagger.ts`
  - Adicionado campo `name` no schema `MessagingInstance`

## ✅ Tudo Funcionando

- ✅ Swagger atualizado com campo `name`
- ✅ Documentação completa
- ✅ Exemplos práticos
- ✅ Schemas atualizados

## 🚀 Testar Agora

1. Acesse: `http://localhost:3000/api-docs`
2. Expanda: `POST /api/messaging/instance`
3. Clique em: `Try it out`
4. Veja o campo `name` disponível!

---

**Swagger 100% atualizado e documentado!** 📚✨
