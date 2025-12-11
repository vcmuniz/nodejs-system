# Prisma Setup

## Estrutura criada

```
prisma/
└── schema.prisma              # Schema do banco de dados (MySQL)

src/infra/database/
├── prisma.ts                  # Instância singleton do PrismaClient
└── factories/
    ├── makePrismaUserRepository.ts     # Factory para UserRepository com Prisma
    └── repositories/prisma/
        └── PrismaUserRepository.ts     # Implementação com Prisma

.env                           # Variáveis de ambiente (com DATABASE_URL configurada)
```

## Configuração Realizada ✅

### 1. Prisma instalado (v5.21.0)
- `@prisma/client` 
- `prisma`

### 2. Database URL configurada
```env
DATABASE_URL="mysql://vortexpay:vortexpaypassword@localhost:3307/vortexpay"
```

### 3. Cliente Prisma gerado
```bash
✔ Generated Prisma Client (v5.21.0)
```

### 4. Schema carregado
O arquivo `schema.prisma` contém:
- 40+ modelos de dados (User, Product, Order, Transaction, etc)
- Enums para roles, status, tipos de pagamento, etc
- Relacionamentos completos

## Como usar

### Importar o Prisma em repositórios

```typescript
import prisma from '../../database/prisma';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';

export class PrismaUserRepository implements IUserRepository {
    async findByEmail(email: string) {
        return await prisma.user.findUnique({
            where: { email }
        });
    }

    async save(user: User) {
        return await prisma.user.create({
            data: {
                id: user.id,
                email: user.email,
                password: user.password,
                name: user.name
            }
        });
    }
}
```

## Scripts disponíveis

- `npm run prisma:generate` - Regenera o cliente Prisma
- `npm run prisma:migrate` - Executa novas migrations
- `npm run prisma:studio` - Abre o Prisma Studio (visualizador gráfico)

## Próximos passos

1. ✅ Prisma configurado e conectando ao banco
2. ✅ PrismaUserRepository implementado
3. ✅ Factory makePrismaUserRepository criado
4. ✅ Integrado no app (index.ts)
5. Testar a autenticação com banco real:
   ```bash
   npm run dev
   # Fazer POST /auth/signin com credenciais do banco
   ```

## Arquivos criados/modificados

- ✅ `prisma/schema.prisma` - Schema com todos os modelos
- ✅ `src/infra/database/prisma.ts` - Singleton PrismaClient
- ✅ `src/infra/database/factories/makePrismaUserRepository.ts` - Factory
- ✅ `src/infra/database/factories/repositories/prisma/PrismaUserRepository.ts` - Repositório
- ✅ `.env` - Variáveis de ambiente
- ✅ `package.json` - Scripts Prisma adicionados
- ✅ `src/index.ts` - Integração no app
