# Swagger API Documentation

## Visão Geral

Este projeto possui integração com **Swagger UI** para documentação interativa da API. A documentação é gerada automaticamente a partir das anotações nos arquivos de rotas.

## Como Acessar a Documentação

Após iniciar o servidor, acesse:

```
http://localhost:8080/api-docs
```

## Estrutura da Documentação

### Endpoints Documentados

#### 1. **Health Check**
- `GET /health` - Verifica se a API está em funcionamento
- `GET /` - Mensagem de boas-vindas

#### 2. **Autenticação**
- `POST /auth/signin` - Realiza login e retorna um JWT token
  - **Campos obrigatórios**: email, password
  - **Resposta**: user data + token

#### 3. **Pedidos (Orders)**
- `GET /orders` - Lista todos os pedidos (requer autenticação)
- `POST /orders` - Cria um novo pedido (requer autenticação)
  - **Campos obrigatórios**: items (array de OrderItem)

### Esquemas (Schemas)

O Swagger define os seguintes schemas reutilizáveis:

#### **User**
```json
{
  "id": "string",
  "email": "string (email format)",
  "name": "string",
  "createdAt": "string (date-time)"
}
```

#### **OrderItem**
```json
{
  "productId": "string",
  "quantity": "number",
  "price": "number"
}
```

#### **Order**
```json
{
  "id": "string",
  "status": "string (enum: pending|confirmed|shipped|delivered|cancelled)",
  "total": "number",
  "items": "OrderItem[]",
  "createdAt": "string (date-time)",
  "updatedAt": "string (date-time)"
}
```

## Segurança

Os endpoints `/orders` utilizam **Bearer Token (JWT)** para autenticação:

1. Faça login em `POST /auth/signin` com email e password
2. Use o token retornado no header: `Authorization: Bearer <token>`
3. Acesse os endpoints protegidos

## Configuração

A configuração do Swagger está em:
- **Arquivo principal**: `src/config/swagger.ts`
- **Documentação das rotas**: Anotações `@swagger` nos arquivos `src/presentation/routes/*.routes.ts`

## Adicionando Novos Endpoints

Para adicionar um novo endpoint à documentação:

1. Adicione a anotação `@swagger` acima da rota em `src/presentation/routes/`:

```typescript
/**
 * @swagger
 * /novo-endpoint:
 *   get:
 *     summary: Descrição do endpoint
 *     tags:
 *       - Category
 *     responses:
 *       200:
 *         description: Sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MeuSchema'
 */
```

2. Se usar um novo schema, adicione em `src/config/swagger.ts`:

```typescript
MeuSchema: {
  type: 'object',
  properties: {
    // ... propriedades
  },
  required: [/* campos obrigatórios */]
}
```

## Dependências Instaladas

```json
{
  "swagger-ui-express": "^4.x.x",
  "swagger-jsdoc": "^6.x.x",
  "@types/swagger-ui-express": "^4.x.x"
}
```

## Desenvolvimento

- O arquivo `src/config/swagger.ts` processa todas as rotas em `src/presentation/routes/*.routes.ts`
- As anotações JSDoc são parseadas automaticamente
- A interface Swagger é servida em `/api-docs`

## Próximas Melhorias

- [ ] Adicionar endpoints de WhatsApp à documentação
- [ ] Documentar endpoints de scheduler
- [ ] Adicionar exemplos de request/response mais detalhados
- [ ] Implementar versionamento de API
