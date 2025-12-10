# Node.js System - Clean Architecture API

Um projeto de API REST desenvolvido com Node.js, Express e TypeScript, seguindo os princípios de **Clean Architecture** e **SOLID**.

## 🎯 Características

- ✅ **Clean Architecture** - Separação clara de responsabilidades (Domain, Use Case, Infra, Presentation)
- ✅ **TypeScript** - Type-safe development
- ✅ **Express.js** - Framework web minimalista e robusto
- ✅ **Vitest** - Framework de testes rápido e moderno
- ✅ **Factory Pattern** - Dependency Injection e composição de objetos
- ✅ **Repository Pattern** - Abstração da camada de dados
- ✅ **CORS Habilitado** - Suporte a requisições cross-origin

## 📁 Estrutura do Projeto

```
src/
├── config/              # Configurações (variáveis de ambiente)
├── domain/              # Entidades e regras de negócio
│   ├── models/          # Modelos de dados
│   └── repositories/    # Interfaces de repositório
├── infra/               # Implementação de detalhes técnicos
│   └── database/        # Fábricas e implementações de repositório
├── usercase/            # Casos de uso da aplicação
│   └── order/           # Lógica de negócio de pedidos
├── presentation/        # Camada de apresentação
│   ├── controllers/     # Controladores HTTP
│   ├── routes/          # Definição de rotas
│   └── factories/       # Composição de controladores
└── index.ts             # Entrada da aplicação
```

## 🚀 Como Começar

### Pré-requisitos

- Node.js 18+
- npm ou yarn

### Instalação

```bash
# Instalar dependências
npm install

# Instalar dependências de desenvolvimento
npm install --save-dev
```

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
PORT=8080
NODE_ENV=development
```

### Executar Aplicação

```bash
# Modo desenvolvimento com auto-reload
npm run dev

# Build para produção
npm run build

# Executar em produção
npm start
```

## 🧪 Testes

```bash
# Executar todos os testes
npm test

# Executar testes em modo watch
npm run test:watch

# Executar testes com cobertura
npm run test:coverage
```

## 📦 Dependências Principais

| Pacote | Versão | Propósito |
|--------|--------|----------|
| `express` | ^4.x | Framework web |
| `cors` | ^2.x | Middleware CORS |
| `dotenv` | ^16.x | Gerenciamento de variáveis de ambiente |
| `typescript` | ^5.x | Linguagem tipada |

## 🔗 Endpoints da API

### Orders (Pedidos)

#### Listar todos os pedidos
```
GET /orders
```

**Resposta:**
```json
[]
```

## 🏗️ Padrões de Arquitetura

### Clean Architecture

O projeto segue a arquitetura limpa com as seguintes camadas:

1. **Domain Layer** - Contém as regras de negócio puras
   - `models/` - Entidades do domínio
   - `repositories/` - Interfaces (contratos)

2. **Use Case Layer** - Orquestra a lógica de negócio
   - Implementa os casos de uso da aplicação
   - Coordena domain e infra

3. **Infrastructure Layer** - Implementação técnica
   - Repositórios concretos
   - Acesso a dados (banco de dados, APIs externas)
   - Factories para injeção de dependência

4. **Presentation Layer** - Interface com o usuário
   - Controladores HTTP
   - Rotas da API
   - Validação de requisições

### Design Patterns

- **Factory Pattern** - Criação de objetos complexos
- **Repository Pattern** - Abstração da persistência de dados
- **Dependency Injection** - Inversão de controle
- **Interface Segregation** - Contratos específicos

## 📝 Scripts Disponíveis

```bash
npm run dev          # Executar em modo desenvolvimento
npm run build        # Compilar TypeScript
npm start            # Executar aplicação compilada
npm test             # Rodar testes
npm run test:watch   # Rodar testes em watch mode
```

## 🔄 Fluxo de Requisição

```
Request HTTP
    ↓
Routes (orderRoutes)
    ↓
Controller (GetAllOrderController)
    ↓
Use Case (GetAllOrder)
    ↓
Repository Interface (IOrderRepository)
    ↓
Repository Implementation (MemoryOrderRepository)
    ↓
Domain Model (Order)
    ↓
Response JSON
```

## 🛠️ Desenvolvimento

### Adicionar Novo Endpoint

1. Criar modelo no `domain/models/`
2. Criar repositório no `domain/repositories/` (interface)
3. Implementar repositório em `infra/database/`
4. Criar use case em `usercase/`
5. Criar controller em `presentation/controllers/`
6. Criar factory em `presentation/factories/`
7. Registrar rota em `presentation/routes/`

### Cobertura de Testes

- Testes unitários para modelos
- Testes para repositórios
- Testes para controladores
- Testes para use cases

## 📄 Licença

MIT

## 👨‍💻 Autor

Victor
