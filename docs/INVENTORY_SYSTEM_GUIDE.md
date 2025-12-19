# Sistema de Estoque - Documentação Completa

## 📋 Visão Geral

Sistema completo de gestão de estoque, produtos, orçamentos e pedidos com suporte a múltiplos tipos de produtos, controle de entrada/saída de estoque, geração de relatórios e upload de imagens.

## 🏗️ Arquitetura

O sistema segue a arquitetura Clean Architecture com as seguintes camadas:

- **Domain**: Modelos de negócio e interfaces dos repositórios
- **Use Cases**: Lógica de aplicação
- **Infra**: Implementação de repositórios, storage e eventos
- **Presentation**: Controllers e rotas da API
- **Ports**: Configuração de rotas e dependências

## 📦 Módulos Principais

### 1. **Categorias de Produtos**

**Endpoints:**
```
POST   /inventory/categories              - Criar categoria
GET    /inventory/categories              - Listar categorias
GET    /inventory/categories/:id          - Obter por ID
PUT    /inventory/categories/:id          - Atualizar
DELETE /inventory/categories/:id          - Deletar
```

**Exemplo de Request:**
```json
{
  "name": "Eletrônicos",
  "description": "Produtos eletrônicos em geral",
  "image": "url-da-imagem"
}
```

---

### 2. **Produtos**

**Endpoints:**
```
POST   /inventory/products                - Criar produto
GET    /inventory/products                - Listar (com paginação)
GET    /inventory/products/:id            - Obter por ID
GET    /inventory/products/category/:id   - Produtos por categoria
GET    /inventory/products/low-stock      - Produtos com estoque baixo
PUT    /inventory/products/:id            - Atualizar
DELETE /inventory/products/:id            - Deletar
```

**Exemplo de Request:**
```json
{
  "categoryId": "cat-001",
  "name": "Notebook Dell",
  "sku": "NB-DELL-001",
  "price": 3500.00,
  "quantity": 10,
  "description": "Notebook i7 16GB RAM",
  "type": "PHYSICAL",
  "cost": 2500.00,
  "minQuantity": 2,
  "images": [
    {
      "url": "/uploads/products/image1.webp",
      "alt": "Frente do notebook"
    }
  ]
}
```

**Tipos de Produto:**
- `PHYSICAL`: Produto físico
- `DIGITAL`: Produto digital (e-book, software, etc)
- `SERVICE`: Serviço

---

### 3. **Upload de Imagens de Produtos**

**Endpoints:**
```
POST   /inventory/products/:productId/images    - Upload de imagem
DELETE /inventory/products/:productId/images    - Remover imagem
```

**Upload com Curl:**
```bash
curl -X POST http://localhost:3000/inventory/products/prod-001/images \
  -F "image=@/path/to/image.jpg" \
  -F "alt=Foto do produto" \
  -H "Authorization: Bearer {token}"
```

**Features:**
- Suporte a JPEG, PNG, WebP, GIF
- Limite de 5MB por arquivo
- Geração automática de thumbnails
- Otimização de imagens

---

### 4. **Controle de Estoque**

#### 4.1 Entrada de Estoque Simples

**Endpoint:**
```
POST /inventory/stock-entries
```

**Request:**
```json
{
  "productId": "prod-001",
  "quantity": 50,
  "description": "Compra de fornecedor",
  "reference": "NF-2025-001"
}
```

#### 4.2 Movimentação de Estoque (Avançada)

**Endpoints:**
```
POST /inventory/stock-movements         - Movimentação genérica
POST /inventory/stock-movements/entry   - Entrada
POST /inventory/stock-movements/exit    - Saída
```

**Tipos de Movimentação:**
- `ENTRY`: Entrada de estoque
- `EXIT`: Saída de estoque (venda, dano)
- `ADJUSTMENT`: Ajuste de inventário
- `RETURN`: Devolução

**Request:**
```json
{
  "productId": "prod-001",
  "type": "EXIT",
  "quantity": 5,
  "description": "Venda para cliente",
  "reason": "Venda pós-venda",
  "reference": "PD-2025-001"
}
```

#### 4.3 Histórico de Estoque

**Endpoints:**
```
GET /inventory/stock-entries/product/:productId  - Por produto
GET /inventory/stock-entries/user/history         - Do usuário
GET /inventory/stock-entries/:id                  - Obter entrada
```

---

### 5. **Orçamentos (Quotes)**

**Endpoints:**
```
POST   /inventory/quotes                     - Criar orçamento
GET    /inventory/quotes                     - Listar
GET    /inventory/quotes/:id                 - Obter por ID
GET    /inventory/quotes/status/:status      - Por status
PATCH  /inventory/quotes/:id/status          - Alterar status
POST   /inventory/quotes/:quoteId/convert    - Converter para pedido
DELETE /inventory/quotes/:id                 - Deletar
```

**Request:**
```json
{
  "clientName": "João Silva",
  "clientEmail": "joao@example.com",
  "clientPhone": "+55 11 99999-9999",
  "items": [
    {
      "productId": "prod-001",
      "quantity": 2,
      "unitPrice": 100.00
    },
    {
      "productId": "prod-002",
      "quantity": 1,
      "unitPrice": 500.00
    }
  ],
  "discount": 50.00,
  "tax": 47.50,
  "notes": "Orçamento válido por 30 dias",
  "validUntil": "2025-01-12T00:00:00Z"
}
```

**Status de Orçamento:**
- `DRAFT`: Rascunho (padrão)
- `SENT`: Enviado ao cliente
- `ACCEPTED`: Aceito pelo cliente
- `REJECTED`: Rejeitado
- `EXPIRED`: Expirado

**Response:**
```json
{
  "id": "qt-001",
  "userId": "user-001",
  "quoteNumber": "QT-2025-001",
  "clientName": "João Silva",
  "status": "DRAFT",
  "subtotal": 700.00,
  "discount": 50.00,
  "tax": 47.50,
  "total": 697.50,
  "validUntil": "2025-01-12T00:00:00Z",
  "createdAt": "2025-12-12T11:16:10.635Z"
}
```

---

### 6. **Pedidos (Orders)**

**Endpoints:**
```
POST   /inventory/orders                  - Criar pedido
GET    /inventory/orders                  - Listar
GET    /inventory/orders/:id              - Obter por ID
GET    /inventory/orders/status/:status   - Por status
PATCH  /inventory/orders/:orderId/status  - Alterar status
DELETE /inventory/orders/:id              - Deletar
```

**Request:**
```json
{
  "clientName": "João Silva",
  "clientEmail": "joao@example.com",
  "clientPhone": "+55 11 99999-9999",
  "address": "Rua das Flores, 123 - São Paulo, SP",
  "items": [
    {
      "productId": "prod-001",
      "quantity": 2,
      "unitPrice": 100.00
    }
  ],
  "discount": 20.00,
  "tax": 0,
  "notes": "Entregar na segunda-feira",
  "quoteId": "qt-001"  // Opcional: vincular a um orçamento
}
```

**Status do Pedido:**
- `DRAFT`: Rascunho
- `CONFIRMED`: Confirmado
- `PROCESSING`: Em processamento
- `SHIPPED`: Enviado
- `DELIVERED`: Entregue
- `CANCELLED`: Cancelado

**Alterar Status:**
```
PATCH /inventory/orders/order-001/status
{
  "status": "SHIPPED",
  "trackingNumber": "BR123456789",
  "shippingDate": "2025-12-12T00:00:00Z",
  "notes": "Enviado pela transportadora X"
}
```

---

### 7. **Relatórios**

#### 7.1 Relatório de Estoque

**Endpoint:**
```
GET /inventory/reports/stock
```

**Response:**
```json
{
  "totalProducts": 50,
  "lowStockCount": 5,
  "outOfStockCount": 2,
  "totalInventoryValue": 250000.00,
  "totalCost": 150000.00,
  "avgStockValue": 5000.00,
  "products": [
    {
      "id": "prod-001",
      "name": "Notebook Dell",
      "sku": "NB-DELL-001",
      "quantity": 10,
      "minQuantity": 2,
      "price": 3500.00,
      "cost": 2500.00,
      "inventoryValue": 35000.00,
      "status": "IN_STOCK"
    }
  ]
}
```

#### 7.2 Relatório de Vendas

**Endpoint:**
```
GET /inventory/reports/sales?startDate=2025-01-01&endDate=2025-12-31
```

**Response:**
```json
{
  "period": {
    "startDate": "2025-01-01T00:00:00Z",
    "endDate": "2025-12-31T23:59:59Z"
  },
  "totalQuotes": 45,
  "totalOrders": 30,
  "totalRevenue": 150000.00,
  "totalDiscount": 5000.00,
  "totalTax": 25000.00,
  "avgOrderValue": 5000.00,
  "quoteConversionRate": 66.67,
  "ordersByStatus": {
    "DRAFT": 2,
    "CONFIRMED": 5,
    "PROCESSING": 8,
    "SHIPPED": 10,
    "DELIVERED": 5,
    "CANCELLED": 0
  },
  "quotesByStatus": {
    "DRAFT": 5,
    "SENT": 10,
    "ACCEPTED": 30,
    "REJECTED": 0,
    "EXPIRED": 0
  }
}
```

#### 7.3 Dashboard

**Endpoint:**
```
GET /inventory/reports/dashboard
```

**Response:**
```json
{
  "stock": {
    "totalProducts": 50,
    "lowStockCount": 5,
    "outOfStockCount": 2,
    "totalInventoryValue": 250000.00
  },
  "sales": {
    "totalQuotes": 45,
    "totalOrders": 30,
    "totalRevenue": 150000.00,
    "avgOrderValue": 5000.00,
    "quoteConversionRate": 66.67
  }
}
```

---

## 🔄 Fluxo de Negócio

### Exemplo: Criar Orçamento → Converter para Pedido

```
1. Criar Orçamento
   POST /inventory/quotes
   Status: DRAFT

2. Enviar ao Cliente
   PATCH /inventory/quotes/qt-001/status
   Status: SENT

3. Cliente Aceita
   PATCH /inventory/quotes/qt-001/status
   Status: ACCEPTED

4. Converter para Pedido
   POST /inventory/quotes/qt-001/convert-to-order
   Cria automaticamente o pedido vinculado

5. Confirmar Pedido
   PATCH /inventory/orders/pd-001/status
   Status: CONFIRMED

6. Processar
   PATCH /inventory/orders/pd-001/status
   Status: PROCESSING

7. Enviar
   PATCH /inventory/orders/pd-001/status
   Status: SHIPPED
   trackingNumber: "BR123456789"

8. Entregue
   PATCH /inventory/orders/pd-001/status
   Status: DELIVERED
```

---

## 🗂️ Estrutura de Diretórios

```
src/
├── domain/
│   ├── models/
│   │   ├── Category.ts
│   │   ├── Product.ts
│   │   ├── StockEntry.ts
│   │   ├── Quote.ts
│   │   ├── OrderEntity.ts
│   │   └── *.test.ts
│   └── repositories/
│       ├── ICategoryRepository.ts
│       ├── IProductRepository.ts
│       ├── IStockEntryRepository.ts
│       ├── IQuoteRepository.ts
│       └── IOrderRepository.ts
├── usercase/
│   └── inventory/
│       ├── CreateCategory.ts
│       ├── CreateProduct.ts
│       ├── CreateStockEntry.ts
│       ├── CreateStockMovement.ts
│       ├── CreateQuote.ts
│       ├── CreateOrder.ts
│       ├── UploadProductImage.ts
│       ├── ConvertQuoteToOrder.ts
│       ├── UpdateOrderStatus.ts
│       └── reports/
│           ├── StockReportUseCase.ts
│           └── SalesReportUseCase.ts
├── infra/
│   ├── repositories/
│   │   ├── PrismaCategoryRepository.ts
│   │   ├── PrismaProductRepository.ts
│   │   ├── PrismaStockEntryRepository.ts
│   │   ├── PrismaQuoteRepository.ts
│   │   └── PrismaOrderRepository.ts
│   ├── storage/
│   │   └── ImageUploadService.ts
│   └── events/
│       └── EventBus.ts
├── presentation/
│   └── controllers/
│       └── inventory/
│           ├── CategoryController.ts
│           ├── ProductController.ts
│           ├── StockEntryController.ts
│           ├── QuoteController.ts
│           ├── OrderController.ts
│           ├── ProductImageController.ts
│           ├── StockMovementController.ts
│           ├── ReportsController.ts
│           └── OrderManagementController.ts
└── ports/
    └── routes/
        └── inventoryRoutes.ts
```

---

## 🔐 Autenticação

Todos os endpoints requerem autenticação via token JWT no header:

```bash
Authorization: Bearer {seu_token}
```

---

## 📊 Paginação

Endpoints que retornam listas suportam paginação:

```
GET /inventory/products?skip=0&take=20
GET /inventory/quotes?skip=0&take=10
GET /inventory/orders?skip=0&take=10
```

---

## ⚠️ Tratamento de Erros

```json
{
  "error": "Descrição do erro"
}
```

**Códigos HTTP:**
- `200`: Sucesso
- `201`: Criado com sucesso
- `204`: Deletado com sucesso
- `400`: Erro na requisição
- `401`: Não autenticado
- `404`: Recurso não encontrado
- `500`: Erro interno do servidor

---

## 🧪 Testes

Execute os testes unitários:

```bash
npm run test
```

Testes implementados para:
- Modelo de Produto
- Modelo de Orçamento
- Cálculos de estoque e margens

---

## 🚀 Próximas Melhorias

- [ ] Integração com gateway de pagamento
- [ ] Geração de PDF de orçamentos/pedidos
- [ ] Envio de emails automáticos
- [ ] Webhook para integrações externas
- [ ] Controle de permissões granular
- [ ] Importação/Exportação de dados
- [ ] API de analytics avançada
- [ ] Integração com sistema de logística

---

## 📝 Notas Importantes

1. **Numeração Automática**: Orçamentos e pedidos recebem numeração automática (QT-YYYY-NNN, PD-YYYY-NNN)
2. **Estoque Sincronizado**: Entrada de estoque atualiza automaticamente a quantidade do produto
3. **Validação**: Pedidos validam estoque disponível antes de criação
4. **Multi-tenant**: Cada usuário vê apenas seus dados
5. **Imagens Otimizadas**: Imagens são comprimidas e thumbnails gerados automaticamente
