# 📚 Swagger Integration - ClubFacts Project

## Sumário da Implementação

Este documento descreve a integração completa do **Swagger UI** no projeto ClubFacts Node.js.

---

## ✅ O que foi Implementado

### 1. **Instalação de Dependências**
```bash
npm install swagger-ui-express swagger-jsdoc @types/swagger-ui-express
```

Pacotes instalados:
- `swagger-ui-express` - Interface visual do Swagger
- `swagger-jsdoc` - Parser de anotações JSDoc para Swagger
- `@types/swagger-ui-express` - Tipos TypeScript

### 2. **Arquivos Criados**

#### `src/config/swagger.ts`
- Arquivo de configuração do Swagger
- Define a especificação OpenAPI 3.0.0
- Inclui esquemas (User, OrderItem, Order)
- Processa anotações `@swagger` dos arquivos de rotas

#### `src/types/swagger-jsdoc.d.ts`
- Arquivo de declaração TypeScript para `swagger-jsdoc`
- Resolve erro TS7016 de tipos não encontrados

#### `SWAGGER_SETUP.md`
- Documentação completa do Swagger
- Guia de uso e configuração
- Instruções para adicionar novos endpoints

### 3. **Rotas Documentadas**

Foram adicionadas anotações `@swagger` aos seguintes arquivos:

#### `src/presentation/routes/index.routes.ts`
```
GET  /           - Welcome message
GET  /health     - Health check
```

#### `src/presentation/routes/auth.routes.ts`
```
POST /auth/signin - Sign in (email, password) → JWT token
```

#### `src/presentation/routes/order.routes.ts`
```
GET  /orders     - List all orders (requer JWT)
POST /orders     - Create order (requer JWT)
```

### 4. **Integração no App**

Arquivo `src/app.ts` foi atualizado para:
```typescript
// Swagger documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
```

Agora a UI Swagger está disponível em: `http://localhost:8080/api-docs`

---

## 📖 Como Usar

### Acessar a Documentação
1. Inicie o servidor: `npm run dev`
2. Abra no navegador: `http://localhost:8080/api-docs`
3. Explore todos os endpoints com exemplos de requisição/resposta

### Testar Autenticação
1. Execute `POST /auth/signin` com email e password
2. Copie o token retornado
3. Clique no botão "Authorize" no Swagger
4. Cole: `Bearer <seu_token_aqui>`
5. Acesse os endpoints protegidos `/orders`

### Adicionar Novo Endpoint

#### Passo 1: Adicione a anotação @swagger na rota

```typescript
/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Get order by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order found
 */
```

#### Passo 2: Se novo schema, adicione em `src/config/swagger.ts`

```typescript
MySchema: {
  type: 'object',
  properties: {
    // ... suas propriedades
  }
}
```

---

## 🏗️ Estrutura dos Schemas

### User
```typescript
{
  id: string
  email: string (format: email)
  name: string
  createdAt: string (format: date-time)
}
```

### OrderItem
```typescript
{
  productId: string
  quantity: number
  price: number (format: float)
}
```

### Order
```typescript
{
  id: string
  status: 'pending'|'confirmed'|'shipped'|'delivered'|'cancelled'
  total: number (format: float)
  items: OrderItem[]
  createdAt: string (format: date-time)
  updatedAt: string (format: date-time)
}
```

---

## 🔐 Segurança

- Endpoints de `/orders` requerem autenticação via JWT
- O Swagger valida automaticamente o token nos testes
- Use o formulário de "Authorize" para inserir o bearer token

---

## 📝 Arquivos Modificados

| Arquivo | Mudança |
|---------|---------|
| `src/app.ts` | Adicionada integração Swagger UI |
| `src/presentation/routes/auth.routes.ts` | Adicionadas anotações @swagger |
| `src/presentation/routes/order.routes.ts` | Adicionadas anotações @swagger |
| `src/presentation/routes/index.routes.ts` | Adicionadas anotações @swagger |
| `package.json` | Instaladas 3 novas dependências |

---

## 🎯 Funcionalidades do Swagger UI

✅ Visualização interativa de todas as rotas  
✅ Exemplos de requisição/resposta  
✅ Schemas reutilizáveis e bem definidos  
✅ Autenticação Bearer Token integrada  
✅ Testes de endpoints direto da UI  
✅ Documentação automática via JSDoc  

---

## 🚀 Próximas Sugestões

- [ ] Documentar endpoints de WhatsApp
- [ ] Documentar endpoints de Scheduler
- [ ] Adicionar validação de entrada mais detalhada
- [ ] Incluir exemplo de webhook
- [ ] Versionamento da API (/api/v1/...)

---

## 📞 Suporte

Para mais informações, consulte:
- `SWAGGER_SETUP.md` - Guia de uso detalhado
- `src/config/swagger.ts` - Configuração principal
- [OpenAPI 3.0 Spec](https://spec.openapis.org/oas/v3.0.3)
- [Swagger UI Docs](https://swagger.io/tools/swagger-ui/)
