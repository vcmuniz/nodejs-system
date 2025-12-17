# 🔐 Autenticação com Business Profile - Fluxo Seguro

**Data:** 2025-12-17  
**Status:** ✅ Implementado

---

## 🎯 Objetivo

Garantir que usuários **SEM businessProfileId no token** só possam:
1. Listar suas organizações
2. Selecionar uma organização (retorna novo token)

Usuários **COM businessProfileId** só podem:
- Acessar recursos (contacts, products, etc.)
- Trocar de organização (switch)

---

## 🔒 Middlewares de Segurança

### 1. `requireNoBusinessProfile`
**Localização:** `src/middlewares/requireNoBusinessProfile.ts`

**Função:** Bloqueia acesso se JÁ tem businessProfileId

**Usado em:**
- `GET /api/business-profiles/` - Listar organizações
- `POST /api/business-profiles/select` - Selecionar organização

**Resposta se JÁ tiver businessProfileId:**
```json
{
  "success": false,
  "error": "Business profile already selected",
  "message": "Você já tem uma organização selecionada. Use /api/business-profiles/switch para trocar.",
  "action": "USE_SWITCH_ENDPOINT"
}
```

### 2. `requireBusinessProfile`
**Localização:** `src/middlewares/requireBusinessProfile.ts`

**Função:** Bloqueia acesso se NÃO tem businessProfileId

**Usado em:** Todas as rotas de recursos (23 rotas)
- Contacts, Lead Captures, Categories, Products, Quotes, Stock

**Resposta se NÃO tiver businessProfileId:**
```json
{
  "success": false,
  "error": "Business profile not selected",
  "message": "Por favor, selecione uma organização antes de continuar",
  "action": "SELECT_BUSINESS_PROFILE"
}
```

---

## 🔐 Fluxo de Autenticação Completo

### Fase 1: Login (sem organização)

```bash
POST /api/auth/signin
{
  "email": "user@example.com",
  "password": "senha123"
}

# Resposta:
{
  "success": true,
  "token": "eyJhbGc...",  # ← SEM businessProfileId
  "user": { "id": "...", "email": "...", "name": "..." }
}
```

### Fase 2: Tentar acessar recurso (BLOQUEADO)

```bash
GET /api/contacts
Authorization: Bearer TOKEN_SEM_BUSINESS

# Resposta: 400 Bad Request
{
  "success": false,
  "error": "Business profile not selected",
  "action": "SELECT_BUSINESS_PROFILE"
}
```

### Fase 3: Listar organizações disponíveis

```bash
GET /api/business-profiles/
Authorization: Bearer TOKEN_SEM_BUSINESS

# Resposta: 200 OK
{
  "success": true,
  "data": [
    {
      "id": "business-123",
      "companyName": "Empresa A LTDA",
      "cnpj": "12.345.678/0001-90"
    },
    {
      "id": "business-456",
      "companyName": "Empresa B S.A.",
      "cnpj": "98.765.432/0001-10"
    }
  ]
}
```

### Fase 4: Selecionar organização

```bash
POST /api/business-profiles/select
Authorization: Bearer TOKEN_SEM_BUSINESS
{
  "businessProfileId": "business-123"
}

# Resposta: 200 OK
{
  "success": true,
  "token": "eyJhbGc...",  # ← NOVO TOKEN com businessProfileId
  "businessProfile": {
    "id": "business-123",
    "companyName": "Empresa A LTDA",
    "cnpj": "12.345.678/0001-90"
  }
}
```

### Fase 5: Acessar recursos (LIBERADO)

```bash
GET /api/contacts
Authorization: Bearer NOVO_TOKEN_COM_BUSINESS

# Resposta: 200 OK
{
  "success": true,
  "data": [
    { "id": "...", "name": "João Silva", ... }
  ]
}
```

### Fase 6: Trocar de organização (opcional)

```bash
POST /api/business-profiles/switch
Authorization: Bearer TOKEN_COM_BUSINESS_ATUAL
{
  "businessProfileId": "business-456"
}

# Resposta: 200 OK
{
  "success": true,
  "message": "Organização alterada com sucesso",
  "token": "eyJhbGc...",  # ← NOVO TOKEN com outro businessProfileId
  "businessProfile": {
    "id": "business-456",
    "companyName": "Empresa B S.A.",
    ...
  }
}
```

---

## 🚫 Bloqueios de Segurança

### ❌ Tentar listar organizações com businessProfileId JÁ selecionado

```bash
GET /api/business-profiles/
Authorization: Bearer TOKEN_COM_BUSINESS

# Resposta: 400 Bad Request
{
  "success": false,
  "error": "Business profile already selected",
  "message": "Você já tem uma organização selecionada. Use /api/business-profiles/switch para trocar.",
  "action": "USE_SWITCH_ENDPOINT"
}
```

### ❌ Tentar select com businessProfileId JÁ selecionado

```bash
POST /api/business-profiles/select
Authorization: Bearer TOKEN_COM_BUSINESS

# Resposta: 400 Bad Request (mesmo erro acima)
```

### ❌ Tentar switch SEM ter selecionado antes

```bash
POST /api/business-profiles/switch
Authorization: Bearer TOKEN_SEM_BUSINESS

# Resposta: 400 Bad Request
{
  "success": false,
  "message": "Você precisa selecionar uma organização primeiro. Use /api/business-profiles/select",
  "action": "USE_SELECT_ENDPOINT"
}
```

### ❌ Tentar switch para a MESMA organização

```bash
POST /api/business-profiles/switch
Authorization: Bearer TOKEN_COM_BUSINESS_123
{
  "businessProfileId": "business-123"  # ← Mesma que já está
}

# Resposta: 400 Bad Request
{
  "success": false,
  "message": "Você já está nesta organização"
}
```

---

## 📋 Matriz de Permissões

| Endpoint | Sem businessProfileId | Com businessProfileId |
|----------|----------------------|----------------------|
| `POST /api/auth/signin` | ✅ Permitido | ✅ Permitido |
| `POST /api/auth/signup` | ✅ Permitido | ✅ Permitido |
| `GET /api/business-profiles/` | ✅ Permitido | ❌ Bloqueado |
| `POST /api/business-profiles/select` | ✅ Permitido | ❌ Bloqueado |
| `POST /api/business-profiles/switch` | ❌ Bloqueado | ✅ Permitido |
| `GET /api/contacts` | ❌ Bloqueado | ✅ Permitido |
| `POST /api/contacts` | ❌ Bloqueado | ✅ Permitido |
| `GET /api/inventory/products` | ❌ Bloqueado | ✅ Permitido |
| ... (todos recursos) | ❌ Bloqueado | ✅ Permitido |

---

## 🔐 Validações Implementadas

### No Controller `SelectBusinessProfile`:
- ✅ Valida se userId existe
- ✅ Valida se businessProfileId foi enviado
- ✅ Valida no banco se organização existe
- ✅ Valida se usuário tem acesso à organização
- ✅ Gera novo token JWT com businessProfileId

### No Controller `SwitchBusinessProfile`:
- ✅ Valida se userId existe
- ✅ Valida se JÁ tem businessProfileId no token atual
- ✅ Valida se businessProfileId novo foi enviado
- ✅ Valida se não está tentando trocar para a mesma organização
- ✅ Valida no banco se nova organização existe
- ✅ Valida se usuário tem acesso à nova organização
- ✅ Gera novo token JWT com novo businessProfileId

---

## 🛡️ Camadas de Segurança

### Camada 1: Middlewares
- `requireNoBusinessProfile` - Lista/Select
- `requireBusinessProfile` - Recursos

### Camada 2: Controllers
- Validações de negócio
- Verificações de acesso

### Camada 3: Use Cases
- Lógica de negócio
- Validação de dados

### Camada 4: Repositories
- Filtros por businessProfileId
- Isolamento de dados

### Camada 5: Database
- Constraints e índices
- Integridade referencial

---

## 🧪 Testando

### 1. Login e tentar acessar recurso (deve falhar):
```bash
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"maria@example.com","password":"senha123"}' | jq -r '.token')

curl -s http://localhost:3000/api/contacts \
  -H "Authorization: Bearer $TOKEN"

# Deve retornar: "Business profile not selected"
```

### 2. Listar organizações:
```bash
curl -s http://localhost:3000/api/business-profiles \
  -H "Authorization: Bearer $TOKEN" | jq
```

### 3. Selecionar organização:
```bash
NEW_TOKEN=$(curl -s -X POST http://localhost:3000/api/business-profiles/select \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"businessProfileId":"ID_DA_ORGANIZACAO"}' | jq -r '.token')
```

### 4. Acessar recurso (deve funcionar):
```bash
curl -s http://localhost:3000/api/contacts \
  -H "Authorization: Bearer $NEW_TOKEN" | jq
```

### 5. Tentar listar organizações novamente (deve falhar):
```bash
curl -s http://localhost:3000/api/business-profiles \
  -H "Authorization: Bearer $NEW_TOKEN"

# Deve retornar: "Business profile already selected"
```

### 6. Trocar de organização:
```bash
ANOTHER_TOKEN=$(curl -s -X POST http://localhost:3000/api/business-profiles/switch \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $NEW_TOKEN" \
  -d '{"businessProfileId":"OUTRO_ID"}' | jq -r '.token')
```

---

## ✅ Checklist de Segurança

- [x] Login retorna token SEM businessProfileId
- [x] Recursos bloqueados sem businessProfileId
- [x] Lista organizações APENAS sem businessProfileId
- [x] Select APENAS sem businessProfileId
- [x] Switch APENAS com businessProfileId
- [x] Select gera novo token COM businessProfileId
- [x] Switch gera novo token COM novo businessProfileId
- [x] Validação de acesso à organização no banco
- [x] Impossível trocar para mesma organização
- [x] Mensagens de erro claras e acionáveis

---

## 🎯 Resultado

**Fluxo de autenticação 100% seguro!** 🔐

- ✅ Separação clara entre "sem organização" e "com organização"
- ✅ Impossível acessar recursos sem selecionar organização
- ✅ Impossível listar/selecionar com organização já selecionada
- ✅ Troca de organização segura e validada
- ✅ Mensagens de erro orientam o cliente sobre próximas ações

---

**Implementado em:** 2025-12-17 17:05  
**Status:** ✅ Produção Ready  
**Arquivos:** 3 modificados, 1 criado
