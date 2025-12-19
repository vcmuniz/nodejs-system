# 🎯 Quick Start - Swagger Integration

## ⚡ 30 Segundos

```bash
# 1. Servidor está rodando em:
npm run dev

# 2. Acesse Swagger em:
http://localhost:8080/api-docs

# 3. Pronto! Toda documentação está lá.
```

---

## 📋 O que foi Feito

✅ **Instalado**
- `swagger-ui-express` - Interface visual
- `swagger-jsdoc` - Parser de documentação
- `@types/swagger-ui-express` - Tipos TypeScript

✅ **Criado**
- `src/config/swagger.ts` - Configuração OpenAPI
- `src/types/swagger-jsdoc.d.ts` - Tipos do módulo
- Anotações `@swagger` em todas as rotas

✅ **Documentado**
- 7 endpoints documentados
- 3 schemas (User, Order, OrderItem)
- Exemplos de requisição/resposta
- Autenticação Bearer Token

---

## 🚀 Como Usar

### Via Swagger UI (Recomendado)
1. Abra `http://localhost:8080/api-docs`
2. Veja todos os endpoints documentados
3. Clique "Try it out" para testar
4. Use "Authorize" para inserir JWT token

### Via cURL
```bash
# Sign in
curl -X POST http://localhost:8080/auth/signin \
  -H 'Content-Type: application/json' \
  -d '{"email": "user@example.com", "password": "pass123"}'

# Copie o token e use:
curl -X GET http://localhost:8080/orders \
  -H 'Authorization: Bearer <seu_token>'
```

### Via Postman / Thunder Client
- Importe o Swagger: `http://localhost:8080/api-docs.json`
- Ou copie/cole a especificação OpenAPI

---

## 📚 Documentação Disponível

| Arquivo | Conteúdo |
|---------|----------|
| `SWAGGER_SETUP.md` | Guia detalhado de uso |
| `SWAGGER_IMPLEMENTATION.md` | Resumo técnico da implementação |
| `ARCHITECTURE_WITH_SWAGGER.md` | Diagramas da arquitetura |
| `API_TEST_EXAMPLES.sh` | Exemplos de teste via cURL |

---

## 🔌 Endpoints Documentados

### Health
- `GET /` - Welcome message
- `GET /health` - Status da API

### Auth
- `POST /auth/signin` - Login (retorna JWT)

### Orders (Requer JWT)
- `GET /orders` - Listar pedidos
- `POST /orders` - Criar pedido

---

## 🔑 Autenticação no Swagger

1. Execute `POST /auth/signin`
2. Copie o `token` da resposta
3. Clique no botão **Authorize** (cadeado 🔒)
4. Cole: `Bearer seu_token_aqui`
5. Clique **Authorize** e depois **Close**
6. Pronto! Agora pode usar endpoints protegidos

---

## 📝 Adicionar Novo Endpoint

### 1. Na rota:
```typescript
/**
 * @swagger
 * /novo:
 *   get:
 *     summary: Descrição
 *     responses:
 *       200:
 *         description: Sucesso
 */
router.get("/novo", handler)
```

### 2. Se novo schema em `src/config/swagger.ts`:
```typescript
MeuSchema: {
  type: 'object',
  properties: { /* ... */ }
}
```

### 3. Restart:
```bash
npm run dev
```

---

## ✨ Features

✅ Documentação automática via JSDoc  
✅ Testes interativos de endpoints  
✅ Autenticação Bearer Token integrada  
✅ Schemas bem definidos  
✅ Exemplos de request/response  
✅ OpenAPI 3.0.0 compatible  

---

## 🐛 Troubleshooting

**Swagger não carrega?**
- Verifique se `npm run dev` está rodando
- Acesse `http://localhost:8080/api-docs`
- Verifique console para erros

**Token expirou?**
- Faça login novamente em `/auth/signin`
- Copie o novo token
- Clique em Authorize e cole o novo token

**Novo endpoint não aparece?**
- Restart o servidor (`npm run dev`)
- Limpe cache do navegador
- Verifique a sintaxe da anotação `@swagger`

---

## 📞 Referências

- [Swagger UI Docs](https://swagger.io/tools/swagger-ui/)
- [OpenAPI 3.0 Spec](https://spec.openapis.org/oas/v3.0.3)
- [Swagger JSDoc](https://github.com/Surnet/swagger-jsdoc)
- [Express Routing](https://expressjs.com/en/guide/routing.html)

---

**Pronto para usar!** 🎉

Qualquer dúvida, consulte os documentos de documentação criados.
