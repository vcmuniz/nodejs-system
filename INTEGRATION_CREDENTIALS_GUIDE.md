# Sistema de Credenciais de Integração

## 📋 Visão Geral

Sistema centralizado para gerenciar credenciais de integração com serviços externos (Evolution API, Twilio, Telegram, etc.). Apenas **administradores** podem gerenciar as credenciais.

## 🎯 Objetivo

Permitir que administradores configurem credenciais uma única vez, evitando que usuários precisem passar credenciais toda vez que criam instâncias de mensageria.

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────┐
│              ADMIN configura credenciais             │
│              (Evolution, Twilio, etc.)               │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
         ┌──────────────────────┐
         │ IntegrationCredential│
         │  - name              │
         │  - type              │
         │  - credentials       │
         │  - isActive          │
         └──────────┬───────────┘
                    │
                    ▼
         ┌──────────────────────┐
         │ CreateInstance       │
         │ busca credenciais    │
         │ automaticamente      │
         └──────────────────────┘
```

## 📊 Modelo de Dados

```typescript
interface IntegrationCredential {
  id: string;
  name: string;                    // "Evolution Principal", "Twilio US"
  type: string;                    // "evolution", "twilio", "telegram"
  credentials: {                   // JSON flexível por tipo
    // Para Evolution:
    apiToken?: string;
    baseUrl?: string;
    
    // Para Twilio:
    accountSid?: string;
    authToken?: string;
    
    // etc...
  };
  isActive: boolean;               // Ativar/Desativar credencial
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## 🔐 Permissões

**Apenas ADMIN** pode:
- ✅ Criar credenciais
- ✅ Listar credenciais
- ✅ Atualizar credenciais
- ✅ Deletar credenciais

**Usuários comuns** não têm acesso a essas rotas.

## 🚀 Endpoints

### 1. Criar Credencial
```bash
POST /api/integration-credentials
Authorization: Bearer {token_admin}

{
  "name": "Evolution Principal",
  "type": "evolution",
  "credentials": {
    "apiToken": "B6D711FCDE4D4FD5936544120E713976",
    "baseUrl": "http://localhost:8080"
  },
  "isActive": true,
  "description": "Servidor Evolution principal"
}
```

### 2. Listar Credenciais
```bash
GET /api/integration-credentials
Authorization: Bearer {token_admin}

# Filtrar por tipo
GET /api/integration-credentials?type=evolution

# Apenas ativas
GET /api/integration-credentials?activeOnly=true
```

### 3. Buscar por ID
```bash
GET /api/integration-credentials/{id}
Authorization: Bearer {token_admin}
```

### 4. Atualizar Credencial
```bash
PUT /api/integration-credentials/{id}
Authorization: Bearer {token_admin}

{
  "isActive": false,
  "description": "Servidor em manutenção"
}
```

### 5. Deletar Credencial
```bash
DELETE /api/integration-credentials/{id}
Authorization: Bearer {token_admin}
```

## 📝 Exemplos de Credenciais por Tipo

### Evolution API
```json
{
  "name": "Evolution Server 1",
  "type": "evolution",
  "credentials": {
    "apiToken": "B6D711FCDE4D4FD5936544120E713976",
    "baseUrl": "http://localhost:8080"
  }
}
```

### Twilio
```json
{
  "name": "Twilio Production",
  "type": "twilio",
  "credentials": {
    "accountSid": "ACxxxxxxxxxxxxxxxxxxxxx",
    "authToken": "your_auth_token",
    "phoneNumber": "+15551234567"
  }
}
```

### Telegram
```json
{
  "name": "Telegram Bot",
  "type": "telegram",
  "credentials": {
    "botToken": "123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
  }
}
```

## 🔄 Integração com CreateInstance

Quando um usuário criar uma instância, o sistema vai:

1. Buscar credenciais ativas do tipo solicitado
2. Usar automaticamente as credenciais configuradas
3. Não exigir que o usuário passe credenciais manualmente

**Antes** (usuário passava credenciais):
```json
{
  "channel": "whatsapp",
  "instanceName": "minha_loja",
  "apiToken": "xxx",      // ❌ Não mais necessário
  "baseUrl": "http://..." // ❌ Não mais necessário
}
```

**Depois** (automático):
```json
{
  "channel": "whatsapp",
  "instanceName": "minha_loja"
  // ✅ Sistema busca credenciais automaticamente
}
```

## 🛠️ Próximos Passos

1. ✅ Sistema de credenciais criado
2. ⏳ Modificar `CreateInstance` para buscar credenciais automaticamente
3. ⏳ Adicionar campo `credentialId` opcional em `MessagingInstance`
4. ⏳ Criar logs de uso de credenciais
5. ⏳ Adicionar rotação automática de credenciais

## 📁 Arquivos Criados

```
src/
├── domain/models/
│   └── IntegrationCredential.ts
├── ports/
│   └── IIntegrationCredentialRepository.ts
├── infra/database/
│   ├── repositories/
│   │   └── IntegrationCredentialRepositoryImpl.ts
│   └── factories/
│       └── makeIntegrationCredentialRepository.ts
├── usercase/integration-credentials/
│   ├── CreateIntegrationCredential.ts
│   ├── GetIntegrationCredentials.ts
│   ├── GetIntegrationCredentialById.ts
│   ├── UpdateIntegrationCredential.ts
│   └── DeleteIntegrationCredential.ts
└── presentation/
    ├── controllers/integration-credentials/
    │   ├── CreateIntegrationCredentialController.ts
    │   ├── GetIntegrationCredentialsController.ts
    │   ├── GetIntegrationCredentialByIdController.ts
    │   ├── UpdateIntegrationCredentialController.ts
    │   └── DeleteIntegrationCredentialController.ts
    └── routes/
        └── integration-credentials.routes.ts
```

## 🧪 Testando

1. **Fazer login como ADMIN**:
```bash
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "senha123"
  }'
```

2. **Criar credencial Evolution**:
```bash
curl -X POST http://localhost:3000/api/integration-credentials \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {TOKEN}" \
  -d '{
    "name": "Evolution Principal",
    "type": "evolution",
    "credentials": {
      "apiToken": "B6D711FCDE4D4FD5936544120E713976",
      "baseUrl": "http://localhost:8080"
    }
  }'
```

3. **Listar credenciais**:
```bash
curl http://localhost:3000/api/integration-credentials \
  -H "Authorization: Bearer {TOKEN}"
```

## 🔒 Segurança

- ✅ Credenciais armazenadas em JSON no banco
- ⚠️ **TODO**: Encriptar credenciais sensíveis
- ✅ Apenas ADMIN pode acessar
- ✅ Logs de acesso (futuro)

## 📚 Documentação

Acesse o Swagger: http://localhost:3000/api-docs

Procure pela tag: **Integration Credentials**
