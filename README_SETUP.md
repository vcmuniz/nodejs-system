# 🚀 Clubfacts NodeJS - Setup Completo

Projeto Node.js/TypeScript com **Clean Architecture**, **Prisma ORM** e acesso ao banco de dados MySQL compartilhado.

## 📋 Status

- ✅ **Prisma 5.21.0** - Conectado ao banco MySQL (vortexpay)
- ✅ **40+ Modelos** - Schema completo carregado
- ✅ **POST /auth/signin** - Endpoint de autenticação funcional
- ✅ **48 Testes** - 100% passando
- ✅ **Clean Architecture** - Organizado em camadas (Domain → UseCase → Presentation → Infra)

## 🏗️ Arquitetura

```
Clean Architecture em 4 Camadas:

PRESENTATION  → Controllers, Routes, HTTP
USECASE       → Lógica de negócio
DOMAIN        → Entidades e interfaces
INFRA         → Banco de dados (Prisma + MySQL)
```

Detalhes em: [`ARCHITECTURE.md`](./ARCHITECTURE.md)

## 🔧 Configuração

### Variáveis de Ambiente
Arquivo `.env` já configurado:
```env
DATABASE_URL="mysql://vortexpay:vortexpaypassword@localhost:3307/vortexpay"
NODE_ENV=development
PORT=3000
```

### Banco de Dados
- **Tipo**: MySQL
- **Host**: localhost:3307
- **Database**: vortexpay
- **Modelos**: 40+ tabelas (User, Product, Order, Transaction, etc)

## 📚 Documentação

- **[API de Sign In](./AUTH_SIGNIN_API.md)** - POST /auth/signin
- **[Prisma Setup](./PRISMA_SETUP.md)** - Como usar Prisma
- **[Integração Completa](./PRISMA_INTEGRATION_COMPLETE.md)** - Resumo da integração
- **[Arquitetura](./ARCHITECTURE.md)** - Padrões e design

## 🚀 Como Usar

### 1. Instalar dependências
```bash
npm install
```

### 2. Gerar cliente Prisma
```bash
npm run prisma:generate
```

### 3. Iniciar servidor
```bash
npm run dev
```

Server rodando em: `http://localhost:3000`

### 4. Testar autenticação
```bash
curl -X POST http://localhost:3000/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email": "seu@email.com", "password": "sua_senha"}'
```

### 5. Visualizar banco (Prisma Studio)
```bash
npm run prisma:studio
```
Abre: `http://localhost:5555`

## 📦 Scripts Disponíveis

```bash
npm run dev              # Inicia servidor com ts-node
npm run test            # Executa testes com vitest
npm run test:watch      # Testes em modo watch
npm run test:coverage   # Cobertura de testes
npm run test:ui         # UI para testes
npm run prisma:generate # Regenera cliente Prisma
npm run prisma:migrate  # Executa migrations
npm run prisma:studio   # Abre Prisma Studio
```

## 📁 Estrutura do Projeto

```
src/
├── config/              # Configurações (ENV, constantes)
├── domain/              # Camada de domínio
│   ├── models/
│   │   ├── User.ts
│   │   ├── Order.ts
│   │   └── ...
│   └── repositories/
│       ├── IUserRepository.ts
│       └── ...
├── infra/               # Camada de infra
│   └── database/
│       ├── prisma.ts    # PrismaClient singleton
│       └── factories/
│           ├── repositories/
│           │   ├── memory/      # Em memória (testes)
│           │   └── prisma/      # Com Prisma (produção)
│           └── make*.ts         # Factories
├── usercase/            # Casos de uso
│   ├── order/
│   │   ├── GetAllOrder.ts
│   │   ├── CreateOrder.ts
│   │   └── ...
│   └── auth/
│       └── SignIn.ts
├── presentation/        # Camada de apresentação
│   ├── controllers/
│   │   ├── orders/
│   │   └── auth/
│   ├── factories/
│   └── routes/
│       ├── authRoutes.ts
│       └── orderRoutes.ts
└── index.ts             # Entrada da aplicação
```

## 🔐 Segurança

⚠️ **Importante**: 
- Senhas não são hasheadas (use bcrypt em produção)
- Tokens são Base64 simples (use JWT real em produção)
- `.env` contém credenciais (não commitar!)

Implementar em breve:
- [ ] Hash de senhas com bcrypt
- [ ] JWT real com HS256
- [ ] Refresh tokens
- [ ] Rate limiting
- [ ] CORS configurável

## 🧪 Testes

### Executar testes
```bash
npm run test
```

### Cobertura
```bash
npm run test:coverage
```

### Modo watch (desenvolvimento)
```bash
npm run test:watch
```

**Status atual**: 48 testes passando ✅

## 🔗 Criar Novo Repositório

Siga o padrão do `PrismaUserRepository`:

### 1. Domain - Interface
```typescript
// src/domain/repositories/IProductRepository.ts
import { Product } from "../models/Product";

export interface IProductRepository {
    findById(id: string): Promise<Product | null>;
    findAll(): Promise<Product[]>;
    save(product: Product): Promise<Product>;
}
```

### 2. Domain - Model
```typescript
// src/domain/models/Product.ts
export class Product {
    constructor(
        public id: string,
        public name: string,
        public price: number
    ) {}

    static create(name: string, price: number): Product {
        return new Product(Math.random().toString(36).substring(7), name, price);
    }
}
```

### 3. Infra - Implementação Prisma
```typescript
// src/infra/database/factories/repositories/prisma/PrismaProductRepository.ts
import prisma from '../../../database/prisma';
import { IProductRepository } from '../../../domain/repositories/IProductRepository';
import { Product } from '../../../domain/models/Product';

export class PrismaProductRepository implements IProductRepository {
    async findById(id: string): Promise<Product | null> {
        const product = await prisma.product.findUnique({ where: { id } });
        if (!product) return null;
        return new Product(product.id, product.name, product.price);
    }

    async findAll(): Promise<Product[]> {
        const products = await prisma.product.findMany();
        return products.map(p => new Product(p.id, p.name, p.price));
    }

    async save(product: Product): Promise<Product> {
        const saved = await prisma.product.upsert({
            where: { id: product.id },
            update: { name: product.name, price: product.price },
            create: { id: product.id, name: product.name, price: product.price }
        });
        return new Product(saved.id, saved.name, saved.price);
    }
}
```

### 4. Factory
```typescript
// src/infra/database/factories/makePrismaProductRepository.ts
import { IProductRepository } from '../../../domain/repositories/IProductRepository';
import { PrismaProductRepository } from './repositories/prisma/PrismaProductRepository';

export function makePrismaProductRepository(): IProductRepository {
    return new PrismaProductRepository();
}
```

## 📊 Modelos Disponíveis no Prisma

Alguns dos 40+ modelos já configurados:

- `User` - Usuários do sistema
- `Product` - Produtos
- `Order` - Pedidos
- `OrderItem` - Itens de pedido
- `Transaction` - Transações financeiras
- `Invoice` - Faturas
- `Wallet` - Carteiras de usuários
- `BusinessProfile` - Perfis comerciais
- `Config` - Configurações do sistema
- `Notification` - Notificações
- `Employee` - Funcionários
- E muitos mais...

## 🚨 Troubleshooting

### Erro de conexão com banco
```
Error: connect ECONNREFUSED
```
Verifique:
1. MySQL está rodando em localhost:3307
2. Credenciais em `.env` estão corretas
3. Database `vortexpay` existe

### Testes falhando
```bash
npm run test
```
Limpe e reinstale:
```bash
rm -rf node_modules package-lock.json
npm install
npm run prisma:generate
npm run test
```

## 📞 Suporte

Documentação completa:
- [`AUTH_SIGNIN_API.md`](./AUTH_SIGNIN_API.md)
- [`PRISMA_SETUP.md`](./PRISMA_SETUP.md)
- [`ARCHITECTURE.md`](./ARCHITECTURE.md)

## 📝 Checklist de Próximos Passos

- [ ] Testar signin com credenciais reais do banco
- [ ] Implementar ProductRepository
- [ ] Implementar OrderRepository
- [ ] Adicionar middleware de autenticação
- [ ] Hash de senhas com bcrypt
- [ ] JWT com HS256
- [ ] Validações mais rigorosas
- [ ] Tratamento de erros centralizado
- [ ] Logging
- [ ] Integração com sistema de pagamento

---

**Versões**:
- Node: 20.19.5
- TypeScript: 5.9.3
- Prisma: 5.21.0
- Express: 5.2.1
- Vitest: 4.0.15
