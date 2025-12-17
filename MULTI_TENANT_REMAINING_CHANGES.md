# 🔄 Mudanças Restantes - Multi-Tenant

## ✅ JÁ CONCLUÍDO (Fases 1-5):
- Schema Prisma ✅
- Migration ✅
- AuthenticatedRequest interface ✅
- Endpoints de seleção ✅
- Middleware requireBusinessProfile ✅
- IContactRepository atualizado ✅
- PrismaContactRepository parcialmente atualizado ✅

## 🔄 FALTA FAZER:

### Repositories (adicionar businessProfileId nos filtros):
```typescript
// Padrão para TODOS os repositories:
where: { 
  userId,
  businessProfileId  // ← Adicionar
}
```

**Arquivos:**
- PrismaLeadCaptureRepository.ts
- Outros repositories de inventory, quotes, etc (se existirem)

### Use Cases (adicionar businessProfileId no input):
```typescript
export interface CreateContactInput {
  userId: string;
  businessProfileId: string;  // ← Adicionar
  // ... rest
}
```

**Arquivos principais:**
- CreateContact.ts
- ListContacts.ts
- UpdateContact.ts
- DeleteContact.ts
- ConvertLeadToContact.ts
- CreateLeadCapture.ts
- ListLeadCaptures.ts
- GetLeadCapture.ts
- CaptureLead.ts

### Controllers (extrair businessProfileId):
```typescript
const businessProfileId = req.user?.businessProfileId;
if (!businessProfileId) {
  return res.status(400).json({ 
    error: 'Select a business profile' 
  });
}
```

**Arquivos:**
- CreateContactController.ts
- ContactControllers.ts (todos os métodos)
- LeadCaptureControllers.ts (todos os métodos)

