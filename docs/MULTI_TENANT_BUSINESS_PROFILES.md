# 🏢 Implementação Multi-Tenant com Business Profiles

**Data:** 2025-12-17  
**Status:** 📋 Planejamento

---

## 🎯 Objetivo

Implementar sistema **multi-tenant** onde:
- Cada usuário pertence a uma **organização** (business_profile)
- Todos os dados são **isolados por organização**
- Consultas sempre filtram por `businessProfileId`
- Usuário precisa **informar a empresa** ao fazer login/operações

---

## 📊 Tabelas que precisam de businessProfileId

### ✅ Já existem (só adicionar campo):
1. **categories** - Categorias de produtos
2. **contacts** - Contatos e leads
3. **lead_captures** - Páginas de captura
4. **messaging_instances** - Instâncias de mensagem
5. **products** - Produtos
6. **quotes** - Orçamentos
7. **stock_entries** - Movimentações de estoque
8. **scheduled_messages** - Mensagens agendadas
9. **scheduled_tasks** - Tarefas agendadas

### ⚠️ Tabelas que NÃO precisam:
- **users** - Usuário pode acessar múltiplas organizações
- **sessions** - Sessão é do usuário
- **business_profiles** - É a organização em si
- **integration_credentials** - Credenciais compartilhadas (global)

---

## 🏗️ Estratégia de Implementação

### Fase 1: Schema e Migration ✅
```prisma
model business_profiles {
  id           String   @id
  userId       String
  // ... campos existentes ...
  
  // Relacionamentos novos
  categories         categories[]
  contacts           contacts[]
  lead_captures      lead_captures[]
  messaging_instances messaging_instances[]
  products           products[]
  quotes             quotes[]
  stock_entries      stock_entries[]
}

model categories {
  id                String   @id
  userId            String
  businessProfileId String?  // Nullable inicialmente
  // ... outros campos ...
  
  business_profile  business_profiles? @relation(fields: [businessProfileId], references: [id])
  
  @@index([businessProfileId])
}
```

### Fase 2: Middleware de Contexto
```typescript
// src/middlewares/businessProfileContext.ts
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    businessProfileId?: string; // Adicionado
  };
}
```

### Fase 3: Atualizar Repositories
Todos os métodos de busca devem filtrar por `businessProfileId`:

```typescript
async findByUserId(userId: string, businessProfileId: string): Promise<Contact[]> {
  return this.prisma.contacts.findMany({
    where: { 
      userId,
      businessProfileId // Novo filtro
    }
  });
}
```

### Fase 4: Atualizar Use Cases
```typescript
export interface CreateContactInput {
  userId: string;
  businessProfileId: string; // Obrigatório
  name: string;
  // ...
}
```

### Fase 5: Atualizar Controllers
```typescript
const businessProfileId = req.user?.businessProfileId;
if (!businessProfileId) {
  return res.status(400).json({ 
    error: 'Business profile not selected' 
  });
}
```

---

## 🔐 Fluxo de Autenticação

### Login atual:
```json
POST /api/auth/signin
{
  "email": "user@example.com",
  "password": "123456"
}

Response:
{
  "token": "jwt-token",
  "user": { "id": "...", "email": "..." }
}
```

### Login novo (com seleção de empresa):
```json
POST /api/auth/signin
{
  "email": "user@example.com",
  "password": "123456",
  "businessProfileId": "empresa-123" // Opcional na primeira vez
}

Response:
{
  "token": "jwt-token",
  "user": {
    "id": "...",
    "email": "...",
    "businessProfileId": "empresa-123"
  },
  "availableBusinessProfiles": [
    { "id": "empresa-123", "companyName": "Empresa A" },
    { "id": "empresa-456", "companyName": "Empresa B" }
  ]
}
```

### Trocar de empresa:
```json
POST /api/auth/switch-business-profile
{
  "businessProfileId": "empresa-456"
}

Response:
{
  "token": "new-jwt-token",
  "businessProfile": { "id": "...", "companyName": "..." }
}
```

---

## 📝 Migration Step-by-Step

### 1. Adicionar campos (nullable)
```sql
ALTER TABLE categories ADD COLUMN businessProfileId VARCHAR(191);
ALTER TABLE contacts ADD COLUMN businessProfileId VARCHAR(191);
ALTER TABLE lead_captures ADD COLUMN businessProfileId VARCHAR(191);
-- etc...

CREATE INDEX idx_categories_businessProfileId ON categories(businessProfileId);
CREATE INDEX idx_contacts_businessProfileId ON contacts(businessProfileId);
-- etc...
```

### 2. Popular dados existentes
```sql
-- Assumindo que cada usuário tem apenas 1 business_profile
UPDATE categories c
SET businessProfileId = (
  SELECT id FROM business_profiles bp WHERE bp.userId = c.userId LIMIT 1
);

UPDATE contacts c
SET businessProfileId = (
  SELECT id FROM business_profiles bp WHERE bp.userId = c.userId LIMIT 1
);
-- etc...
```

### 3. Tornar obrigatório (depois de popular)
```sql
ALTER TABLE categories MODIFY businessProfileId VARCHAR(191) NOT NULL;
ALTER TABLE contacts MODIFY businessProfileId VARCHAR(191) NOT NULL;
-- etc...
```

---

## 🎨 Interface do Usuário

### Seletor de Empresa (novo componente)
```tsx
<BusinessProfileSelector
  currentProfile={currentBusinessProfile}
  availableProfiles={userBusinessProfiles}
  onChange={(profileId) => switchBusinessProfile(profileId)}
/>
```

### Header/Navbar
```
[Logo] | [Empresa: Empresa A ▼] | [Notificações] | [Usuário ▼]
```

---

## ⚠️ Considerações Importantes

### 1. Relacionamentos Cruzados
- Contato de uma empresa não pode referenciar lead_capture de outra
- Validar `businessProfileId` em todos os relacionamentos

### 2. Performance
- Adicionar índices em todos os `businessProfileId`
- Queries sempre devem filtrar por organização

### 3. Segurança
- Middleware deve SEMPRE validar se o `businessProfileId` pertence ao usuário
- Usuário não pode acessar dados de outras organizações

### 4. Backwards Compatibility
- Manter campos `userId` para auditoria
- Migração gradual (campo nullable → popular → tornar obrigatório)

---

## 🧪 Testes Necessários

1. ✅ Usuário não pode ver dados de outra organização
2. ✅ Trocar de empresa funciona corretamente
3. ✅ Criação de registros associa à organização correta
4. ✅ Queries filtram por businessProfileId
5. ✅ Relacionamentos respeitam a organização

---

## 📋 Checklist de Implementação

### Schema (Prisma)
- [ ] Adicionar `businessProfileId?` em todas as tabelas
- [ ] Adicionar relações com `business_profiles`
- [ ] Adicionar índices
- [ ] Gerar migration

### Backend
- [ ] Atualizar `AuthenticatedRequest` interface
- [ ] Criar middleware `requireBusinessProfile`
- [ ] Criar endpoint `switch-business-profile`
- [ ] Listar `business_profiles` do usuário
- [ ] Atualizar todos os repositories (adicionar filtro)
- [ ] Atualizar todos os use cases (validar organização)
- [ ] Atualizar todos os controllers (passar businessProfileId)

### Migration
- [ ] Script para popular `businessProfileId` em dados existentes
- [ ] Validar dados antes de tornar campo obrigatório
- [ ] Tornar campo obrigatório após popular

### Testes
- [ ] Testes de isolamento de dados
- [ ] Testes de troca de empresa
- [ ] Testes de segurança (acesso cruzado)

### Documentação
- [ ] Atualizar Swagger com novo campo
- [ ] Documentar fluxo de autenticação
- [ ] Guia de migração

---

## 🚀 Próximos Passos

**Opção 1: Implementação Completa**
- Implementar tudo de uma vez (2-3 horas)

**Opção 2: Implementação Gradual**
- Fase 1: Schema + Migration (30 min)
- Fase 2: Auth + Middleware (30 min)
- Fase 3: Atualizar módulos existentes (1-2 horas)

**Você prefere qual abordagem?**

---

**Criado em:** 2025-12-17  
**Estimativa:** 2-3 horas para implementação completa
