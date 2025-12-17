# 🏗️ Multi-Tenant - Status da Implementação

**Data:** 2025-12-17  
**Progresso:** 25% concluído

---

## ✅ CONCLUÍDO

### Fase 1: Schema Prisma ✅
- Adicionado `businessProfileId?` em 7 tabelas
- Adicionado relacionamentos em `business_profiles`
- Adicionados índices para performance

### Fase 2: Migration ✅
- Schema aplicado no banco com `prisma db push`
- Script de população criado: `scripts/populate-business-profile-ids.ts`
- Dados existentes vinculados ao business_profile

---

## 🚧 PRÓXIMAS FASES

### Fase 3: AuthenticatedRequest Interface
```typescript
// src/presentation/interfaces/AuthenticatedRequest.ts
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email?: string;
    name?: string;
    role?: string;
    businessProfileId?: string;  // ← ADICIONAR
  };
}
```

### Fase 4: Endpoints de Seleção de Empresa

**Criar arquivos:**
1. `src/usercase/business-profile/ListUserBusinessProfiles.ts`
2. `src/usercase/business-profile/SelectBusinessProfile.ts`
3. `src/presentation/controllers/business-profile/BusinessProfileController.ts`
4. Atualizar `src/usercase/auth/SignIn.ts` (retornar lista de empresas)
5. Atualizar `src/infra/auth/JsonWebTokenProvider.ts` (incluir businessProfileId no token)

**Endpoints:**
```
GET  /api/auth/business-profiles     - Listar empresas do usuário
POST /api/auth/select-business-profile - Selecionar empresa (gera token)
POST /api/auth/switch-business-profile - Trocar de empresa
```

### Fase 5: Middleware requireBusinessProfile
```typescript
// src/middlewares/requireBusinessProfile.ts
export const requireBusinessProfile = (req, res, next) => {
  if (!req.user?.businessProfileId) {
    return res.status(400).json({ 
      error: 'Business profile not selected' 
    });
  }
  next();
};
```

### Fase 6: Atualizar Repositories

Adicionar filtro `businessProfileId` em:
- `PrismaContactRepository.ts`
- `PrismaLeadCaptureRepository.ts`
- `PrismaCategoryRepository.ts`
- `PrismaProductRepository.ts`
- Etc...

**Exemplo:**
```typescript
async findByUserId(userId: string, businessProfileId: string) {
  return this.prisma.contacts.findMany({
    where: { 
      userId,
      businessProfileId  // ← ADICIONAR
    }
  });
}
```

### Fase 7: Atualizar Use Cases

Adicionar `businessProfileId` nos inputs:
```typescript
export interface CreateContactInput {
  userId: string;
  businessProfileId: string;  // ← ADICIONAR
  name: string;
  // ...
}
```

### Fase 8: Atualizar Controllers

Extrair `businessProfileId` do `req.user`:
```typescript
const businessProfileId = req.user?.businessProfileId;
if (!businessProfileId) {
  return res.status(400).json({ error: 'Select a business profile' });
}
```

### Fase 9: Atualizar Swagger

Adicionar `businessProfileId` nos schemas e documentar novos endpoints.

---

## 📋 CHECKLIST

### Feito ✅
- [x] Adicionar `businessProfileId` no schema Prisma
- [x] Aplicar migration no banco
- [x] Popular dados existentes
- [x] Criar script de população

### A Fazer 🔲
- [ ] Atualizar AuthenticatedRequest interface
- [ ] Criar use cases de business profile
- [ ] Criar endpoints de seleção
- [ ] Atualizar SignIn para retornar lista de empresas
- [ ] Incluir businessProfileId no token JWT
- [ ] Criar middleware requireBusinessProfile
- [ ] Atualizar todos repositories (7 arquivos)
- [ ] Atualizar todos use cases (10+ arquivos)
- [ ] Atualizar todos controllers (10+ arquivos)
- [ ] Aplicar middleware nas rotas
- [ ] Atualizar Swagger
- [ ] Testes

---

## 🔄 PARA CONTINUAR

**Execute:**
```bash
# 1. Verificar se o servidor ainda inicia
npm run dev

# 2. Continuar implementação das fases 3-9
# Próximo passo: Atualizar AuthenticatedRequest
```

**Estimativa:** 1-2 horas para completar fases 3-9

---

## 📝 NOTAS IMPORTANTES

1. **Campo opcional**: `businessProfileId` está como `String?` (opcional)
2. **Backwards compatible**: Sistema ainda funciona sem businessProfileId
3. **Próxima etapa crítica**: Modificar JWT para incluir businessProfileId
4. **Segurança**: Validar sempre se user tem acesso ao businessProfileId

---

**Checkpoint criado em:** 2025-12-17 15:45  
**Próxima sessão:** Continuar da Fase 3
