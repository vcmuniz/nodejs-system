# Padrão de Documentação Swagger

## ✅ Padrão Estabelecido

### Documentação nos Controllers
Toda a documentação `@swagger` deve estar **SEMPRE nos controllers**, não nas rotas.

**Exemplo correto:**
```typescript
// src/presentation/controllers/messaging/ListMessagingInstancesController.ts

/**
 * @swagger
 * /api/messaging/instances:
 *   get:
 *     tags:
 *       - Messaging (Multi-Channel)
 *     summary: List messaging instances
 *     ...
 */
export class ListMessagingInstancesController {
  async handle(req: AuthenticatedRequest, res: Response): Promise<Response> {
    // implementation
  }
}
```

### Rotas Limpas e Organizadas
Os arquivos de rotas devem conter:
1. **Tags do Swagger** (apenas a definição da categoria)
2. **Schemas compartilhados** (quando necessário)
3. **Rotas especiais sem controller** (ex: webhooks)
4. **Registro limpo das rotas** (sem documentação inline)

**Exemplo correto:**
```typescript
// src/presentation/routes/messaging.routes.ts

/**
 * @swagger
 * tags:
 *   - name: Messaging (Multi-Channel)
 *     description: Generic messaging API supporting multiple channels
 */

export const makeMessagingRoutes = () => {
  const router = Router();
  const authMiddleware = makeAuthMiddleware();

  // Rotas limpas, sem documentação inline
  router.get('/instances', authMiddleware.authenticate(), requireBusinessProfile, (req, res) => 
    makeListMessagingInstancesController().handle(req, res)
  );

  router.post('/instance', authMiddleware.authenticate(), requireBusinessProfile, (req, res) => 
    makeCreateMessagingInstanceController().handle(req, res)
  );

  return router;
};
```

## ✅ Arquivos Migrados

### Completamente Reorganizados:
- ✅ `src/presentation/routes/messaging.routes.ts`
- ✅ `src/presentation/routes/quote.routes.ts`
- ✅ `src/presentation/routes/stock.routes.ts`
- ✅ `src/presentation/controllers/messaging/*` (todos os 4 controllers)

### Já Seguiam o Padrão:
- ✅ `src/presentation/controllers/inventory/*` (todos)
- ✅ `src/presentation/controllers/contacts/*`
- ✅ `src/presentation/controllers/lead-captures/*`
- ✅ `src/presentation/controllers/auth/SignInController.ts`
- ✅ `src/presentation/controllers/whatsapp/CreateInstanceController.ts`

## 📋 Arquivos Ainda com Documentação nas Rotas

Estes arquivos ainda têm documentação `@swagger` inline e precisarão ser migrados no futuro:
- ⚠️ `business-profile.routes.ts` (5 blocos)
- ⚠️ `integration-credentials.routes.ts` (6 blocos)
- ⚠️ `order.routes.ts` (3 blocos)
- ⚠️ `whatsapp.routes.ts` (7 blocos)
- ⚠️ `category.routes.ts` (5 blocos)
- ⚠️ `product.routes.ts` (7 blocos)
- ⚠️ `contacts.routes.ts` (7 blocos)
- ⚠️ `lead-captures.routes.ts` (6 blocos)

**Nota:** A migração dos demais arquivos será feita gradualmente conforme necessário.

## 🎯 Benefícios do Padrão

1. **Separação de Responsabilidades**: Controllers documentam sua própria API
2. **Manutenibilidade**: Documentação próxima à implementação
3. **Código Limpo**: Rotas mais legíveis e organizadas
4. **Consistência**: Padrão uniforme em todo o projeto

## 🔍 Como Identificar

**Controller com documentação (correto):**
```bash
grep -l "@swagger" src/presentation/controllers/**/*.ts
```

**Rotas com documentação (precisa migrar):**
```bash
grep -c "@swagger" src/presentation/routes/*.routes.ts
```

## ✅ Status Atual

- **Swagger funcionando:** ✅ http://localhost:3000/api-docs
- **Todas as rotas documentadas:** ✅ Sim
- **Padrão aplicado em:** Messaging, Inventory, Contacts, Leads, Auth
- **Servidor rodando:** ✅ Sem erros
