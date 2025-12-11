# 🏗️ Arquitetura do Projeto

## Clean Architecture em Camadas

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│  (Controllers, Routes, HTTP)                                 │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ SignInController                                      │  │
│  │ - handle(req, res)                                   │  │
│  │ - Valida email e password                           │  │
│  │ - Retorna user + token                              │  │
│  └───────────────────────┬────────────────────────────┘  │
└────────────────────────┬─────────────────────────────────┘
                         │
┌────────────────────────▼─────────────────────────────────────┐
│                    USECASE LAYER                              │
│  (Lógica de negócio)                                          │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ SignIn UseCase                                        │  │
│  │ - execute(email, password)                           │  │
│  │ - Valida credenciais                                │  │
│  │ - Gera token JWT                                    │  │
│  │ - Retorna user + token                              │  │
│  └───────────────────────┬────────────────────────────┘  │
└────────────────────────┬─────────────────────────────────┘
                         │
┌────────────────────────▼──────────────────────────────────────┐
│                    DOMAIN LAYER                                │
│  (Entidades, Interfaces)                                      │
│                                                                │
│  ┌──────────────┐          ┌──────────────────────────────┐  │
│  │ User Model   │          │ IUserRepository (Interface)  │  │
│  │ - id         │          │ - findByEmail()              │  │
│  │ - email      │          │ - save()                     │  │
│  │ - password   │          │ - findById()                 │  │
│  │ - name       │          └──────────────────────────────┘  │
│  └──────────────┘                                             │
└────────────────────────┬──────────────────────────────────────┘
                         │
┌────────────────────────▼──────────────────────────────────────┐
│                    INFRA LAYER                                 │
│  (Banco de dados, Implementações)                             │
│                                                                │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ PrismaUserRepository implements IUserRepository        │  │
│  │ - prisma.user.findUnique()                            │  │
│  │ - prisma.user.create()                                │  │
│  │ - prisma.user.update()                                │  │
│  └───────────────────────┬─────────────────────────────┘  │
│                          │                                  │
│  ┌────────────────────────▼────────────────────────────┐  │
│  │         MySQL Database (vortexpay)                  │  │
│  │  Tabelas: User, Product, Order, Transaction, etc   │  │
│  └────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

## Fluxo de dados para POST /auth/signin

```
1. Cliente (Browser/Mobile)
        │
        │ POST /auth/signin
        │ { email, password }
        │
        ▼
2. SignInController
        │ Valida campos obrigatórios
        ▼
3. SignIn UseCase
        │ execute(email, password)
        │
        ├─► IUserRepository.findByEmail(email)
        │
        ▼
4. PrismaUserRepository
        │ prisma.user.findUnique({ where: { email } })
        │
        ▼
5. MySQL Database
        │ SELECT * FROM User WHERE email = ?
        │
        ├─ Usuário encontrado ──────────────────┐
        │                                        │
        ├─ Usuário não encontrado ────────┐     │
                                          │     │
        ▼                                 ▼     ▼
   Erro 401                          Erro 401  Valida password
   "User not found"                              │
                                                │
                                        ├─ Senha inválida ──────┐
                                        │                       │
                                        ├─ Senha válida ────┐   │
                                                            │   │
                                                            ▼   ▼
                                                    Gera JWT    Erro 401
                                                    Token       "Invalid
                                                    │           password"
                                                    │
                                                    ▼
                                    6. SignInController
                                            │
                                            ▼
                                    7. Cliente Response
                                    {
                                      "message": "Sign in successful",
                                      "user": { ... },
                                      "token": "..."
                                    }
```

## Padrões utilizados

### 1. **Repository Pattern**
- Interface: `IUserRepository`
- Implementação: `PrismaUserRepository`
- Desacopla lógica de negócio do banco de dados

### 2. **UseCase/Interactor Pattern**
- `SignIn` class implementa `IUseCase<Input, Output>`
- Contém lógica de negócio isolada

### 3. **Dependency Injection**
- Controllers recebem dependências no construtor
- Factories criam instâncias com dependências injetadas

### 4. **Factory Pattern**
- `makeSignInController()` - Cria controller
- `makePrismaUserRepository()` - Cria repositório
- Centraliza criação de objetos

### 5. **Model Domain**
- `User` class representa entidade de domínio
- Métodos: `create()`, `getPublicData()`
- Separado do banco de dados

## Benefícios da arquitetura

```
┌─────────────────────────────────────┐
│  Testabilidade                      │
│  - Testes unitários sem BD          │
│  - Mock de repositórios             │
│  - 48 testes passando               │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  Manutenibilidade                   │
│  - Código organizado em camadas     │
│  - Fácil de navegar                 │
│  - Responsabilidades claras         │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  Escalabilidade                     │
│  - Fácil adicionar novos repositórios
│  - Reutiliza padrões                │
│  - Preparado para crescimento       │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  Flexibilidade                      │
│  - Trocar BD (Postgres, SQLite, etc)
│  - Sem alterar lógica de negócio    │
│  - Controllers independentes        │
└─────────────────────────────────────┘
```

## Estrutura de diretórios

```
src/
├── config/               # Configurações (ENV, constantes)
├── domain/               # Camada de domínio
│   ├── models/          # Entidades (User, Order, etc)
│   └── repositories/    # Interfaces de repositórios
├── infra/               # Camada de infra
│   └── database/
│       ├── prisma.ts    # Instância do Prisma
│       └── factories/
│           ├── repositories/
│           │   ├── memory/   # Implementações em memória
│           │   └── prisma/   # Implementações com Prisma
│           └── make*.ts      # Factories
├── usercase/            # Casos de uso (UseCases)
│   ├── order/
│   └── auth/
├── presentation/        # Camada de apresentação
│   ├── controllers/     # Controllers
│   ├── factories/       # Factories de controllers
│   └── routes/          # Rotas Express
└── index.ts             # Entrada da aplicação
```

## Próximos passos

1. **Expandir repositórios**: ProductRepository, OrderRepository, etc
2. **Adicionar mais UseCases**: CreateProduct, GetOrder, etc
3. **Implementar middleware de auth**: ValidateToken
4. **Adicionar tratamento de erros**: Error handling centralizado
5. **Integrar com Stripe/Pagamento**: Para transações
