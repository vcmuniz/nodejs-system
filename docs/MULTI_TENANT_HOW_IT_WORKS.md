# 🏢 Como o Sistema Identifica a Organização (Business Profile)

**Data:** 2025-12-17

---

## 🎯 3 Abordagens Possíveis

### ✅ **OPÇÃO 1: Via Token JWT (RECOMENDADA)**

O `businessProfileId` fica **dentro do token JWT** após login.

#### Como funciona:

```typescript
// 1. Login - usuário escolhe a empresa
POST /api/auth/signin
{
  "email": "user@example.com",
  "password": "123456",
  "businessProfileId": "empresa-123"  // Escolhe aqui
}

// 2. Token gerado contém o businessProfileId
const token = jwt.sign({
  userId: "user-456",
  email: "user@example.com",
  businessProfileId: "empresa-123"  // ← Vai dentro do token
}, SECRET);

// 3. Nas próximas requisições
GET /api/contacts
Authorization: Bearer eyJhbGc...

// 4. Middleware extrai do token
const decoded = jwt.verify(token);
req.user = {
  userId: decoded.userId,
  businessProfileId: decoded.businessProfileId  // ← Disponível automaticamente
};

// 5. Controller usa automaticamente
const contacts = await contactRepository.findByOrganization(
  req.user.businessProfileId  // ← Sempre disponível
);
```

#### ✅ Vantagens:
- ✅ **Simples**: Cliente não precisa enviar em toda requisição
- ✅ **Seguro**: BusinessProfileId não pode ser falsificado
- ✅ **Automático**: Middleware já injeta no `req.user`
- ✅ **Stateless**: Sem necessidade de sessão no servidor

#### ⚠️ Desvantagens:
- ⚠️ Trocar de empresa = gerar novo token
- ⚠️ Token fica um pouco maior

---

### ✅ **OPÇÃO 2: Via Header HTTP**

Cliente envia `X-Business-Profile-Id` em cada requisição.

#### Como funciona:

```typescript
// 1. Login normal (sem escolher empresa)
POST /api/auth/signin
{
  "email": "user@example.com",
  "password": "123456"
}

// 2. Nas próximas requisições, cliente envia header
GET /api/contacts
Authorization: Bearer eyJhbGc...
X-Business-Profile-Id: empresa-123  // ← Cliente envia

// 3. Middleware valida e injeta
const businessProfileId = req.headers['x-business-profile-id'];

// Validar se pertence ao usuário
const hasAccess = await validateUserHasAccessToOrganization(
  req.user.userId,
  businessProfileId
);

if (!hasAccess) {
  return res.status(403).json({ error: 'Access denied' });
}

req.user.businessProfileId = businessProfileId;
```

#### ✅ Vantagens:
- ✅ **Flexível**: Troca de empresa sem novo token
- ✅ **Explícito**: Fica claro qual empresa está sendo usada
- ✅ **Ideal para mobile**: App pode cachear o ID

#### ⚠️ Desvantagens:
- ⚠️ Cliente precisa enviar em TODA requisição
- ⚠️ Mais uma validação no middleware (consulta DB)
- ⚠️ Cliente pode esquecer de enviar

---

### ✅ **OPÇÃO 3: Via URL/Path Parameter**

A organização fica na URL.

#### Como funciona:

```typescript
// URLs com o businessProfileId
GET /api/empresas/:businessProfileId/contacts
GET /api/empresas/empresa-123/contacts
GET /api/empresas/empresa-123/products

// Middleware extrai da URL
const businessProfileId = req.params.businessProfileId;

// Valida acesso
const hasAccess = await validateUserHasAccessToOrganization(
  req.user.userId,
  businessProfileId
);
```

#### ✅ Vantagens:
- ✅ **Muito explícito**: URL deixa claro qual organização
- ✅ **RESTful**: Segue padrões REST de recursos aninhados
- ✅ **Fácil debug**: Vê na URL qual empresa está usando

#### ⚠️ Desvantagens:
- ⚠️ URLs mais longas
- ⚠️ Todas as rotas precisam mudar
- ⚠️ Cliente precisa montar URLs dinamicamente

---

## 🎖️ **RECOMENDAÇÃO: Opção 1 (Token JWT)**

### Por quê?

1. **Mais simples para o cliente**: Envia token e pronto
2. **Mais seguro**: businessProfileId não pode ser manipulado
3. **Performance**: Sem consultas extras no banco
4. **Padrão da indústria**: JWT é stateless e escalável

---

## 🔄 **Implementação Recomendada: Token JWT + Endpoint de Troca**

### 1. Login com seleção de empresa

```typescript
POST /api/auth/signin
{
  "email": "user@example.com",
  "password": "123456"
}

Response:
{
  "token": null,  // Ainda não gera token
  "user": {
    "id": "user-456",
    "email": "user@example.com"
  },
  "availableBusinessProfiles": [
    { "id": "empresa-123", "companyName": "Empresa A", "cnpj": "12345" },
    { "id": "empresa-456", "companyName": "Empresa B", "cnpj": "67890" }
  ]
}
```

### 2. Cliente escolhe a empresa

```typescript
POST /api/auth/select-business-profile
{
  "businessProfileId": "empresa-123"
}

Response:
{
  "token": "eyJhbGc...",  // Token com businessProfileId dentro
  "businessProfile": {
    "id": "empresa-123",
    "companyName": "Empresa A",
    "cnpj": "12345..."
  }
}
```

### 3. Todas as requisições usam esse token

```typescript
GET /api/contacts
Authorization: Bearer eyJhbGc...

// Backend extrai automaticamente
const { userId, businessProfileId } = req.user;  // Do token JWT
```

### 4. Trocar de empresa (sem fazer logout)

```typescript
POST /api/auth/switch-business-profile
Authorization: Bearer eyJhbGc...
{
  "businessProfileId": "empresa-456"
}

Response:
{
  "token": "eyNEW...",  // Novo token com nova empresa
  "businessProfile": {
    "id": "empresa-456",
    "companyName": "Empresa B"
  }
}
```

---

## 🛡️ **Middleware de Segurança**

```typescript
// src/middlewares/requireBusinessProfile.ts

export const requireBusinessProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const businessProfileId = req.user?.businessProfileId;
  
  if (!businessProfileId) {
    return res.status(400).json({
      error: 'Business profile not selected',
      message: 'Please select a business profile first'
    });
  }
  
  // Opcional: validar se ainda tem acesso
  const hasAccess = await validateUserAccessToOrganization(
    req.user.userId,
    businessProfileId
  );
  
  if (!hasAccess) {
    return res.status(403).json({
      error: 'Access denied to this organization'
    });
  }
  
  next();
};

// Uso nas rotas
router.get('/contacts', 
  authenticate(),           // Valida token JWT
  requireBusinessProfile(), // Valida businessProfileId
  contactController.list
);
```

---

## 📱 **Como o Frontend Usa**

### React/Angular/Vue:

```typescript
// 1. Login
const { availableBusinessProfiles } = await api.signin(email, password);

// 2. Usuário escolhe empresa na UI
const selectedProfile = showBusinessProfileSelector(availableBusinessProfiles);

// 3. Seleciona empresa e recebe token
const { token } = await api.selectBusinessProfile(selectedProfile.id);

// 4. Salva token (com businessProfileId dentro)
localStorage.setItem('token', token);

// 5. Todas as próximas chamadas usam esse token
api.setToken(token);
await api.getContacts();  // Já sabe qual empresa!
```

### Mobile (React Native/Flutter):

```dart
// 1. Login
var profiles = await api.signin(email, password);

// 2. Mostrar lista de empresas
showDialog(BusinessProfileSelector(profiles));

// 3. Selecionar e salvar token
var token = await api.selectBusinessProfile(selectedId);
await secureStorage.write('token', token);

// 4. Usar automaticamente
api.setToken(token);
var contacts = await api.getContacts();
```

---

## 🎨 **Interface do Usuário**

### Tela de Login (após autenticação):

```
┌─────────────────────────────────────────┐
│  Selecione uma Organização              │
├─────────────────────────────────────────┤
│                                         │
│  ⚪ Empresa A - CNPJ: 12.345.678/0001-90│
│     👥 50 usuários                      │
│                                         │
│  ⚪ Empresa B - CNPJ: 98.765.432/0001-01│
│     👥 120 usuários                     │
│                                         │
│           [ Continuar ]                 │
│                                         │
└─────────────────────────────────────────┘
```

### Header/Navbar (após login):

```
┌─────────────────────────────────────────────────┐
│ [Logo] | 🏢 Empresa A ▼ | 🔔 | 👤 João ▼      │
└─────────────────────────────────────────────────┘

Ao clicar em "Empresa A ▼":
┌─────────────────────────┐
│ Empresa A (atual)       │
├─────────────────────────┤
│ Empresa B               │
├─────────────────────────┤
│ + Criar nova empresa    │
└─────────────────────────┘
```

---

## 📊 **Estrutura do Token JWT**

```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "userId": "user-456",
    "email": "user@example.com",
    "businessProfileId": "empresa-123",  // ← Organização atual
    "role": "admin",
    "iat": 1702831200,
    "exp": 1702917600
  },
  "signature": "..."
}
```

---

## ✅ **Resumo da Recomendação**

| Aspecto | Solução |
|---------|---------|
| **Onde vai** | Dentro do token JWT |
| **Como passa** | Token JWT no header `Authorization: Bearer ...` |
| **Middleware** | Extrai automaticamente de `req.user.businessProfileId` |
| **Segurança** | JWT assinado, não pode ser falsificado |
| **Troca de empresa** | Novo endpoint gera novo token |
| **UX** | Cliente não precisa enviar em toda requisição |

---

## 🚀 **Quer que eu implemente isso?**

Vou implementar:
1. ✅ Atualizar interface `AuthenticatedRequest` (adicionar `businessProfileId`)
2. ✅ Modificar token JWT para incluir `businessProfileId`
3. ✅ Criar endpoint `/auth/select-business-profile`
4. ✅ Criar endpoint `/auth/switch-business-profile`
5. ✅ Criar middleware `requireBusinessProfile`
6. ✅ Atualizar todos os repositories para filtrar por `businessProfileId`

**Posso começar?** 🎯
