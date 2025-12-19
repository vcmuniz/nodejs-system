# 📦 Sistema de Gestão de Estoque

Um sistema completo e robusto de gestão de estoque, produtos, orçamentos e pedidos construído com Node.js, TypeScript, Prisma e Express.

## 🚀 Funcionalidades Principais

- ✅ **Gestão de Categorias** - Organize produtos por categorias
- ✅ **Cadastro de Produtos** - Com tipos (físico, digital, serviço), fotos, preço, custo
- ✅ **Upload de Imagens** - Com otimização e geração de thumbnails
- ✅ **Controle de Estoque** - Entrada, saída e ajustes de estoque
- ✅ **Orçamentos** - Crie e gerencie orçamentos com múltiplos itens
- ✅ **Pedidos** - Crie pedidos vinculados a orçamentos
- ✅ **Rastreamento de Status** - Acompanhe orçamentos e pedidos em tempo real
- ✅ **Relatórios** - Relatórios de estoque e vendas
- ✅ **Dashboard** - Visão geral dos dados de negócio
- ✅ **Sistema de Eventos** - Notificações automáticas

## 📋 Pré-requisitos

- Node.js 18+
- npm ou yarn
- MySQL/MariaDB
- Docker (opcional)

## 🛠️ Instalação

### 1. Clone o repositório

```bash
git clone <seu-repositorio>
cd stackline-saas-nodejs
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Database
DATABASE_URL="mysql://user:password@localhost:3307/clubfacts_crm"

# JWT
JWT_SECRET="sua_chave_secreta_aqui"

# Node Environment
NODE_ENV="development"

# Server
PORT=3000
```

### 4. Execute as migrações do banco de dados

```bash
npx prisma migrate dev --name "initial"
```

### 5. Inicie o servidor

```bash
npm run dev
```

O servidor estará disponível em `http://localhost:3000`

## 📚 Documentação da API

### Autenticação

Todos os endpoints requerem um token JWT no header `Authorization`:

```bash
Authorization: Bearer {seu_token_jwt}
```

### Estrutura de Resposta

**Sucesso (2xx):**
```json
{
  "id": "abc123",
  "name": "Produto X",
  ...
}
```

**Erro (4xx/5xx):**
```json
{
  "error": "Descrição do erro",
  "field": "nome_do_campo",
  "statusCode": 400
}
```

### Endpoints Disponíveis

Veja o arquivo [INVENTORY_SYSTEM_GUIDE.md](./INVENTORY_SYSTEM_GUIDE.md) para a documentação completa de todos os endpoints.

### Exemplos de API

Veja o arquivo [INVENTORY_API_EXAMPLES.sh](./INVENTORY_API_EXAMPLES.sh) para exemplos de requisições com curl.

## 🗂️ Estrutura do Projeto

```
src/
├── domain/                 # Modelos de negócio
│   ├── models/            # Classes de domínio
│   └── repositories/      # Interfaces de repositório
├── usercase/              # Casos de uso (lógica de aplicação)
│   └── inventory/
├── infra/                 # Implementações e serviços
│   ├── repositories/      # Implementações Prisma
│   ├── storage/           # Serviço de upload de imagens
│   ├── events/            # Sistema de eventos
│   └── validation/        # Validadores
├── presentation/          # Controllers e presentação
│   └── controllers/
├── ports/                 # Configuração de rotas
│   └── routes/
├── middlewares/           # Middlewares Express
└── config/                # Configurações
```

## 🧪 Testes

Execute os testes unitários:

```bash
npm run test
```

Execute com cobertura:

```bash
npm run test:coverage
```

## 🐳 Docker

Para iniciar os serviços com Docker Compose:

```bash
docker-compose up -d
```

## 📊 Fluxo de Negócio Típico

### 1. Criar Categoria e Produtos

```bash
# Criar categoria
POST /inventory/categories
{
  "name": "Eletrônicos",
  "description": "Produtos eletrônicos"
}

# Criar produto
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

# Upload de imagem
POST /inventory/products/{productId}/images
(file upload)
```

### 2. Registrar Entrada de Estoque

```bash
POST /inventory/stock-movements/entry
{
  "productId": "prod-001",
  "quantity": 50,
  "reference": "NF-2025-001"
}
```

### 3. Criar Orçamento

```bash
POST /inventory/quotes
{
  "clientName": "João Silva",
  "clientEmail": "joao@example.com",
  "items": [
    {
      "productId": "prod-001",
      "quantity": 2,
      "unitPrice": 3500
    }
  ],
  "discount": 100,
  "validUntil": "2025-01-12"
}
```

### 4. Converter para Pedido

```bash
POST /inventory/quotes/{quoteId}/convert-to-order
{
  "notes": "Pedido confirmado"
}

# Atualizar status do pedido
PATCH /inventory/orders/{orderId}/status
{
  "status": "CONFIRMED"
}
```

### 5. Acompanhar Pedido

```bash
# Confirmar
PATCH /inventory/orders/{orderId}/status
{ "status": "CONFIRMED" }

# Processar
PATCH /inventory/orders/{orderId}/status
{ "status": "PROCESSING" }

# Enviar
PATCH /inventory/orders/{orderId}/status
{
  "status": "SHIPPED",
  "trackingNumber": "BR123456789"
}

# Entregar
PATCH /inventory/orders/{orderId}/status
{ "status": "DELIVERED" }
```

### 6. Gerar Relatórios

```bash
# Relatório de estoque
GET /inventory/reports/stock

# Relatório de vendas
GET /inventory/reports/sales?startDate=2025-01-01&endDate=2025-12-31

# Dashboard
GET /inventory/reports/dashboard
```

## 🔐 Validação

O sistema valida automaticamente:

- Email válido
- Telefone com formato correto
- SKU único por usuário
- Preços e quantidades positivos
- Estoque suficiente para saídas
- Status válidos para transições

## 📈 Recuros Avançados

### Upload de Imagens

- Suporte a JPEG, PNG, WebP, GIF
- Limite de 5MB por arquivo
- Otimização automática
- Geração de thumbnails

### Movimentação de Estoque

- ENTRY: Entrada de estoque
- EXIT: Saída (venda, dano)
- ADJUSTMENT: Ajuste manual
- RETURN: Devolução

### Sistema de Eventos

- QUOTE_CREATED: Novo orçamento
- QUOTE_ACCEPTED: Orçamento aceito
- ORDER_CREATED: Novo pedido
- ORDER_STATUS_CHANGED: Status alterado
- PRODUCT_LOW_STOCK: Estoque baixo
- PRODUCT_OUT_OF_STOCK: Sem estoque

## 🛡️ Segurança

- Autenticação JWT
- Validação de entrada
- Proteção contra SQL Injection (via Prisma)
- Tratamento de erros robusto
- Isolamento de dados por usuário (multi-tenant)

## 🐛 Tratamento de Erros

O sistema retorna códigos HTTP apropriados:

- `200`: OK
- `201`: Criado
- `204`: Deletado
- `400`: Erro de validação
- `401`: Não autenticado
- `404`: Não encontrado
- `500`: Erro interno

## 📝 Logs

Os logs são exibidos no console durante desenvolvimento. Para produção, considere usar uma solução de logging como Winston ou Bunyan.

## 🚀 Deploy

### Produção

```bash
npm run build
npm run start
```

### Variáveis de Ambiente Necessárias

```env
NODE_ENV=production
DATABASE_URL=...
JWT_SECRET=...
PORT=3000
```

## 📞 Suporte

Para questões, abra uma issue no repositório.

## 📄 Licença

MIT

## 🙏 Agradecimentos

Sistema desenvolvido com:
- Express.js
- Prisma ORM
- TypeScript
- Multer (upload de arquivos)
- Sharp (otimização de imagens)

---

**Versão:** 1.0.0  
**Última atualização:** 12/12/2025
