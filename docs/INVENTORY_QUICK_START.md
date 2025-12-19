# 🚀 Quick Start - Sistema de Estoque

## Instalação Rápida (5 minutos)

### 1. Dependências já estão instaladas
```bash
cd /home/victo/stackline/stackline-saas-nodejs
```

### 2. Migrate database
```bash
npx prisma migrate dev
```

### 3. Inicie o servidor
```bash
npm run dev
```

O servidor estará em `http://localhost:3000`

## 🔑 Autenticação

Você precisa de um token JWT. Após autenticar, use no header:
```
Authorization: Bearer {seu_token}
```

## 📚 Documentação Completa

- **Guia Detalhado**: `INVENTORY_SYSTEM_GUIDE.md`
- **Exemplos de API**: `INVENTORY_API_EXAMPLES.sh`
- **README Completo**: `INVENTORY_SYSTEM_README.md`
- **Resumo de Implementação**: `INVENTORY_IMPLEMENTATION_SUMMARY.md`

## 🎯 Endpoints Principais

### Criar Categoria
```bash
POST /inventory/categories
{
  "name": "Eletrônicos",
  "description": "Produtos eletrônicos"
}
```

### Criar Produto
```bash
POST /inventory/products
{
  "categoryId": "cat-001",
  "name": "Notebook",
  "sku": "NB-001",
  "price": 3500,
  "cost": 2500,
  "quantity": 0,
  "minQuantity": 2,
  "type": "PHYSICAL"
}
```

### Upload de Imagem
```bash
POST /inventory/products/{productId}/images
(multipart/form-data com arquivo)
```

### Registrar Entrada de Estoque
```bash
POST /inventory/stock-movements/entry
{
  "productId": "prod-001",
  "quantity": 50,
  "reference": "NF-2025-001"
}
```

### Criar Orçamento
```bash
POST /inventory/quotes
{
  "clientName": "João",
  "clientEmail": "joao@example.com",
  "items": [{
    "productId": "prod-001",
    "quantity": 2,
    "unitPrice": 3500
  }],
  "discount": 100,
  "validUntil": "2025-01-12"
}
```

### Criar Pedido
```bash
POST /inventory/orders
{
  "clientName": "João",
  "clientEmail": "joao@example.com",
  "items": [{
    "productId": "prod-001",
    "quantity": 2,
    "unitPrice": 3500
  }],
  "quoteId": "qt-001"
}
```

### Relatórios
```bash
GET /inventory/reports/stock
GET /inventory/reports/sales
GET /inventory/reports/dashboard
```

## 📊 Estrutura de Dados

### Product
```json
{
  "id": "prod-001",
  "name": "Notebook",
  "sku": "NB-001",
  "price": 3500,
  "cost": 2500,
  "quantity": 50,
  "minQuantity": 2,
  "type": "PHYSICAL",
  "images": [{"url": "...", "alt": "..."}]
}
```

### Quote
```json
{
  "id": "qt-001",
  "quoteNumber": "QT-2025-001",
  "clientName": "João",
  "status": "DRAFT",
  "subtotal": 7000,
  "discount": 100,
  "tax": 1180,
  "total": 8080,
  "items": [...]
}
```

### Order
```json
{
  "id": "pd-001",
  "orderNumber": "PD-2025-001",
  "clientName": "João",
  "status": "DRAFT",
  "subtotal": 7000,
  "discount": 100,
  "tax": 1180,
  "total": 8080,
  "items": [...]
}
```

## 🔄 Fluxo Típico

```
1. POST /inventory/categories
   ↓
2. POST /inventory/products
   ↓
3. POST /inventory/products/{id}/images
   ↓
4. POST /inventory/stock-movements/entry
   ↓
5. POST /inventory/quotes
   ↓
6. PATCH /inventory/quotes/{id}/status → SENT
   ↓
7. PATCH /inventory/quotes/{id}/status → ACCEPTED
   ↓
8. POST /inventory/quotes/{id}/convert-to-order
   ↓
9. PATCH /inventory/orders/{id}/status → CONFIRMED
   ↓
10. PATCH /inventory/orders/{id}/status → PROCESSING
    ↓
11. PATCH /inventory/orders/{id}/status → SHIPPED (com tracking)
    ↓
12. PATCH /inventory/orders/{id}/status → DELIVERED
```

## 📈 Ver Relatórios

```bash
# Estoque
GET /inventory/reports/stock

# Vendas (com período)
GET /inventory/reports/sales?startDate=2025-01-01&endDate=2025-12-31

# Dashboard consolidado
GET /inventory/reports/dashboard
```

## 🧪 Testes

```bash
# Executar testes
npm run test

# Ver cobertura
npm run test:coverage

# Modo watch
npm run test:watch
```

## 🐛 Troubleshooting

### Erro "Categoria não encontrada"
- Verifique se a categoryId existe
- Use `GET /inventory/categories` para listar

### Erro "Estoque insuficiente"
- Registre entrada de estoque primeiro
- `POST /inventory/stock-movements/entry`

### Erro "Orçamento não aceito"
- Mude o status para ACCEPTED
- `PATCH /inventory/quotes/{id}/status`

## 📱 Testes com Curl

```bash
# Listar categorias
curl -H "Authorization: Bearer {TOKEN}" \
  http://localhost:3000/inventory/categories

# Listar produtos
curl -H "Authorization: Bearer {TOKEN}" \
  http://localhost:3000/inventory/products

# Criar categoria
curl -X POST http://localhost:3000/inventory/categories \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"name":"Eletrônicos","description":"..."}'
```

## 📝 Notes

- Todas as requests precisam de `Authorization: Bearer {TOKEN}`
- Numeração é automática (QT-YYYY-NNN, PD-YYYY-NNN)
- Imagens são otimizadas automaticamente
- Estoque é validado antes de criar pedido
- Dados são isolados por usuário (multi-tenant)

## 🎓 Arquitetura

```
Domain Models → Use Cases → Repositories → API Controllers → Routes
    ↓              ↓             ↓              ↓               ↓
  Product       CreateProduct   Prisma     ProductController  /products
  Quote        CreateQuote       ↓         QuoteController     /quotes
  Order        CreateOrder      MySQL      OrderController     /orders
```

## ✨ Features Avançadas

- ✅ Otimização automática de imagens
- ✅ Geração de thumbnails
- ✅ Sistema de eventos extensível
- ✅ Relatórios com período customizável
- ✅ Validação de todas as entradas
- ✅ Transações de status validadas
- ✅ Histórico completo de estoque
- ✅ Taxa de conversão de orçamentos

---

**Pronto para usar! 🚀**
