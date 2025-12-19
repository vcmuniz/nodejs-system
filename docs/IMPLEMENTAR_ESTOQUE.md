# 📦 SISTEMA DE ESTOQUE - GUIA DE IMPLEMENTAÇÃO

## ✅ Status Atual
- TypeScript compila **SEM ERROS**
- Estrutura hexagonal/clean pronta
- Modelos de domínio existentes

## 🎯 O QUE VOCÊ PRECISA FAZER

### PASSO 1: Criar Repositories (Interface)
```bash
# Arquivo: src/domain/repositories/ICategoryRepository.ts
```

```typescript
import { Category } from '../models/Category';

export interface ICategoryRepository {
  create(category: Category): Promise<Category>;
  findById(id: string): Promise<Category | null>;
  findAll(userId: string): Promise<Category[]>;
  update(category: Category): Promise<Category>;
  delete(id: string): Promise<void>;
}
```

### PASSO 2: Implementar Repositories (Prisma)
```bash
# Arquivo: src/infra/database/factories/repositories/prisma/inventory/PrismaCategoryRepository.ts
```

```typescript
import { PrismaClient } from '@prisma/client';
import { Category } from '../../../../../domain/models/Category';
import { ICategoryRepository } from '../../../../../domain/repositories/ICategoryRepository';

const prisma = new PrismaClient();

export class PrismaCategoryRepository implements ICategoryRepository {
  async create(category: Category): Promise<Category> {
    const result = await prisma.category.create({
      data: {
        id: category.id,
        userId: category.userId,
        name: category.name,
        description: category.description,
      },
    });
    return new Category(result.id, result.userId, result.name, result.description);
  }

  async findById(id: string): Promise<Category | null> {
    const result = await prisma.category.findUnique({ where: { id } });
    if (!result) return null;
    return new Category(result.id, result.userId, result.name, result.description);
  }

  async findAll(userId: string): Promise<Category[]> {
    const results = await prisma.category.findMany({ where: { userId } });
    return results.map(r => new Category(r.id, r.userId, r.name, r.description));
  }

  async update(category: Category): Promise<Category> {
    const result = await prisma.category.update({
      where: { id: category.id },
      data: {
        name: category.name,
        description: category.description,
      },
    });
    return new Category(result.id, result.userId, result.name, result.description);
  }

  async delete(id: string): Promise<void> {
    await prisma.category.delete({ where: { id } });
  }
}
```

### PASSO 3: Criar Use Cases
```bash
# Arquivo: src/usercase/inventory/CreateCategoryUseCase.ts
```

```typescript
import { IUseCase } from '../IUseCase';
import { Category } from '../../domain/models/Category';
import { ICategoryRepository } from '../../domain/repositories/ICategoryRepository';

export interface CreateCategoryInput {
  userId: string;
  name: string;
  description?: string;
}

export class CreateCategoryUseCase implements IUseCase<CreateCategoryInput, Category> {
  constructor(private categoryRepository: ICategoryRepository) {}

  async execute(input: CreateCategoryInput): Promise<Category> {
    const category = new Category(
      this.generateId(),
      input.userId,
      input.name,
      input.description
    );
    return this.categoryRepository.create(category);
  }

  private generateId(): string {
    return Math.random().toString(36).substring(7);
  }
}
```

### PASSO 4: Criar Controllers
```bash
# Arquivo: src/presentation/controllers/inventory/CategoryController.ts
```

```typescript
import { Request, Response } from 'express';
import { CreateCategoryUseCase } from '../../../usercase/inventory/CreateCategoryUseCase';
import { ICategoryRepository } from '../../../domain/repositories/ICategoryRepository';

export class CategoryController {
  constructor(
    private createCategoryUseCase: CreateCategoryUseCase,
    private categoryRepository: ICategoryRepository
  ) {}

  async create(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id || 'default-user';
      const result = await this.createCategoryUseCase.execute({
        userId,
        name: req.body.name,
        description: req.body.description,
      });
      res.status(201).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async findAll(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id || 'default-user';
      const categories = await this.categoryRepository.findAll(userId);
      res.status(200).json(categories);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async findById(req: Request, res: Response): Promise<void> {
    try {
      const category = await this.categoryRepository.findById(req.params.id);
      if (!category) {
        res.status(404).json({ error: 'Categoria não encontrada' });
        return;
      }
      res.status(200).json(category);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const category = await this.categoryRepository.findById(req.params.id);
      if (!category) {
        res.status(404).json({ error: 'Categoria não encontrada' });
        return;
      }
      category.name = req.body.name || category.name;
      category.description = req.body.description || category.description;
      const updated = await this.categoryRepository.update(category);
      res.status(200).json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      await this.categoryRepository.delete(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
```

### PASSO 5: Criar Rotas
```bash
# Arquivo: src/routes/inventory.ts
```

```typescript
import { Router } from 'express';
import { CategoryController } from '../presentation/controllers/inventory/CategoryController';
import { PrismaCategoryRepository } from '../infra/database/factories/repositories/prisma/inventory/PrismaCategoryRepository';
import { CreateCategoryUseCase } from '../usercase/inventory/CreateCategoryUseCase';

const router = Router();

const categoryRepository = new PrismaCategoryRepository();
const createCategoryUseCase = new CreateCategoryUseCase(categoryRepository);
const categoryController = new CategoryController(createCategoryUseCase, categoryRepository);

router.post('/categories', (req, res) => categoryController.create(req, res));
router.get('/categories', (req, res) => categoryController.findAll(req, res));
router.get('/categories/:id', (req, res) => categoryController.findById(req, res));
router.put('/categories/:id', (req, res) => categoryController.update(req, res));
router.delete('/categories/:id', (req, res) => categoryController.delete(req, res));

export default router;
```

### PASSO 6: Registrar Rotas no App
```bash
# Arquivo: src/app.ts (ou onde está configurado)
```

```typescript
import inventoryRoutes from './routes/inventory';

app.use('/api/v1/inventory', inventoryRoutes);
```

---

## 📋 CHECKLIST - REPITA PARA CADA ENTIDADE

- [ ] **Category** - Repository Interface
- [ ] **Category** - Prisma Implementation  
- [ ] **Category** - Use Cases (Create, List, Get, Update, Delete)
- [ ] **Category** - Controller
- [ ] **Category** - Routes

- [ ] **Product** - Repository Interface
- [ ] **Product** - Prisma Implementation
- [ ] **Product** - Use Cases
- [ ] **Product** - Controller
- [ ] **Product** - Routes

- [ ] **StockEntry** - Repository Interface
- [ ] **StockEntry** - Prisma Implementation
- [ ] **StockEntry** - Use Cases
- [ ] **StockEntry** - Controller
- [ ] **StockEntry** - Routes

- [ ] **Quote** - Repository Interface
- [ ] **Quote** - Prisma Implementation
- [ ] **Quote** - Use Cases
- [ ] **Quote** - Controller
- [ ] **Quote** - Routes

- [ ] **Order** - Repository Interface
- [ ] **Order** - Prisma Implementation
- [ ] **Order** - Use Cases
- [ ] **Order** - Controller
- [ ] **Order** - Routes

---

## 🚀 ROTAS FINAIS

```
POST   /api/v1/inventory/categories         - Criar categoria
GET    /api/v1/inventory/categories         - Listar categorias
GET    /api/v1/inventory/categories/:id     - Obter categoria
PUT    /api/v1/inventory/categories/:id     - Atualizar categoria
DELETE /api/v1/inventory/categories/:id     - Deletar categoria

POST   /api/v1/inventory/products           - Criar produto
GET    /api/v1/inventory/products           - Listar produtos
GET    /api/v1/inventory/products/:id       - Obter produto
PUT    /api/v1/inventory/products/:id       - Atualizar produto
DELETE /api/v1/inventory/products/:id       - Deletar produto
POST   /api/v1/inventory/products/:id/images - Upload de imagem

POST   /api/v1/inventory/stock-entries      - Registrar movimento
GET    /api/v1/inventory/stock-entries      - Listar histórico

POST   /api/v1/inventory/quotes             - Criar orçamento
GET    /api/v1/inventory/quotes             - Listar orçamentos
GET    /api/v1/inventory/quotes/:id         - Obter orçamento
PUT    /api/v1/inventory/quotes/:id         - Atualizar orçamento
DELETE /api/v1/inventory/quotes/:id         - Deletar orçamento

POST   /api/v1/inventory/orders             - Criar pedido
GET    /api/v1/inventory/orders             - Listar pedidos
GET    /api/v1/inventory/orders/:id         - Obter pedido
PUT    /api/v1/inventory/orders/:id         - Atualizar pedido
DELETE /api/v1/inventory/orders/:id         - Deletar pedido
```

---

## ✅ ESTRUTURA FINAL

```
src/
├── domain/
│   ├── models/
│   │   ├── Category.ts ✅
│   │   ├── Product.ts ✅
│   │   ├── StockEntry.ts ✅
│   │   ├── Quote.ts ✅
│   │   └── Order.ts ✅
│   └── repositories/
│       ├── ICategoryRepository.ts (CRIAR)
│       ├── IProductRepository.ts (CRIAR)
│       ├── IStockEntryRepository.ts (CRIAR)
│       ├── IQuoteRepository.ts (CRIAR)
│       └── IOrderRepository.ts (CRIAR)
│
├── infra/
│   └── database/
│       └── factories/
│           └── repositories/
│               └── prisma/
│                   └── inventory/
│                       ├── PrismaCategoryRepository.ts (CRIAR)
│                       ├── PrismaProductRepository.ts (CRIAR)
│                       ├── PrismaStockEntryRepository.ts (CRIAR)
│                       ├── PrismaQuoteRepository.ts (CRIAR)
│                       └── PrismaOrderRepository.ts (CRIAR)
│
├── usercase/
│   └── inventory/
│       ├── CreateCategoryUseCase.ts (CRIAR)
│       ├── ListCategoriesUseCase.ts (CRIAR)
│       ├── CreateProductUseCase.ts (CRIAR)
│       ├── ListProductsUseCase.ts (CRIAR)
│       ├── RecordStockEntryUseCase.ts (CRIAR)
│       ├── CreateQuoteUseCase.ts (CRIAR)
│       ├── CreateOrderUseCase.ts (CRIAR)
│       └── ... (mais use cases)
│
├── presentation/
│   └── controllers/
│       └── inventory/
│           ├── CategoryController.ts (CRIAR)
│           ├── ProductController.ts (CRIAR)
│           ├── StockController.ts (CRIAR)
│           ├── QuoteController.ts (CRIAR)
│           └── OrderController.ts (CRIAR)
│
└── routes/
    └── inventory.ts (CRIAR)
```

---

## 🎓 PADRÃO A SEGUIR

1. **Domain** - Define interfaces e modelos (o QUÊ)
2. **Infra** - Implementa com Prisma (COMO)
3. **UseCase** - Lógica de negócio (QUANDO e REGRAS)
4. **Controller** - Recebe requisição HTTP (ENTRADA)
5. **Routes** - Mapeia URLs para controllers (DIRECIONAMENTO)

---

**Agora é com você! Seguindo este padrão não tem erro!** ✅

