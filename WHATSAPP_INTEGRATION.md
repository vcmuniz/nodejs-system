# Integração Evolution API - WhatsApp

Integração completa com Evolution API seguindo os padrões **Clean Code**, **SOLID** e **Arquitetura Hexagonal**.

## Arquitetura

```
├── ports/                          # Interfaces (contratos)
│   ├── IEvolutionAPI.ts           # Contrato da Evolution API
│   └── IWhatsAppRepository.ts     # Contrato do repositório
│
├── domain/models/                  # Modelos de domínio (entidades)
│   └── WhatsAppInstance.ts        # Entidade WhatsApp
│
├── infra/                          # Implementações concretas
│   ├── whatsapp/
│   │   ├── EvolutionAPIImpl.ts     # Adapter da API
│   │   ├── WhatsAppRepositoryImpl.ts # Implementação do repo
│   │   └── webhooks/
│   │       └── WebhookHandler.ts  # Handler de webhooks
│   └── factories/whatsapp/
│       └── WhatsAppFactory.ts     # Injeção de dependências
│
├── usercase/whatsapp/              # Lógica de negócio
│   └── SendWhatsAppMessage.ts     # Use case
│
└── presentation/controllers/       # Camada HTTP
    └── whatsapp/
        └── SendWhatsAppMessageController.ts
```

## Princípios SOLID Aplicados

### Single Responsibility Principle (SRP)
- Cada classe tem uma única responsabilidade
- `SendWhatsAppMessage`: apenas lógica de negócio
- `EvolutionAPIImpl`: apenas comunicação com API
- `WebhookHandler`: apenas processamento de webhooks

### Open/Closed Principle (OCP)
- Classes abertas para extensão, fechadas para modificação
- Implementações concretas podem ser trocadas sem afetar uso

### Liskov Substitution Principle (LSP)
- `EvolutionAPIImpl` pode substituir `IEvolutionAPI`
- `WhatsAppRepositoryImpl` pode substituir `IWhatsAppRepository`

### Interface Segregation Principle (ISP)
- `IEvolutionAPI` com apenas métodos necessários
- `IWhatsAppRepository` com operações específicas

### Dependency Inversion Principle (DIP)
- Classes dependem de interfaces, não de implementações concretas
- `SendWhatsAppMessage` depende de `IEvolutionAPI` e `IWhatsAppRepository`

## Configuração

### Variáveis de Ambiente

```env
EVOLUTION_API_KEY=sua_chave_api
EVOLUTION_API_URL=http://localhost:8080
```

### Inicialização

```typescript
import { PrismaClient } from '@prisma/client';
import { WhatsAppFactory } from './src/infra/factories/whatsapp/WhatsAppFactory';

const prisma = new PrismaClient();
WhatsAppFactory.initialize(prisma);
```

## Uso

### Enviar Mensagem

```typescript
import { WhatsAppFactory } from './src/infra/factories/whatsapp/WhatsAppFactory';

const sendWhatsAppMessage = WhatsAppFactory.getSendWhatsAppMessage();

const result = await sendWhatsAppMessage.execute({
  userId: 'user-123',
  instanceName: 'business-instance',
  phoneNumber: '5511999999999',
  message: 'Olá! Esta é uma mensagem de teste',
  mediaUrl: 'https://example.com/image.jpg', // opcional
});

if (result.success) {
  console.log('Mensagem enviada:', result.messageId);
} else {
  console.error('Erro:', result.error);
}
```

### Webhook HTTP

```typescript
import express from 'express';
import { WhatsAppFactory } from './src/infra/factories/whatsapp/WhatsAppFactory';

const app = express();
const webhookHandler = WhatsAppFactory.getWebhookHandler();

app.post('/webhooks/whatsapp', async (req, res) => {
  const event = req.body;

  if (event.event === 'message.status') {
    await webhookHandler.handleMessageStatusUpdate(event);
  } else if (event.event === 'connection') {
    await webhookHandler.handleInstanceConnectionChange(event);
  }

  res.status(200).json({ received: true });
});
```

### Controller HTTP (Rota)

```typescript
import { Router } from 'express';
import { WhatsAppFactory } from './src/infra/factories/whatsapp/WhatsAppFactory';

const router = Router();
const controller = WhatsAppFactory.getSendWhatsAppMessageController();

router.post('/send-message', (req, res) => {
  return controller.handle(req, res);
});

export default router;
```

## Extensibilidade

### Adicionar Nova Implementação de API

1. Implementar `IEvolutionAPI`:

```typescript
export class OutraAPIImpl implements IEvolutionAPI {
  // implementação...
}
```

2. Atualizar `WhatsAppFactory`:

```typescript
static initialize(prisma: PrismaClient, apiType: 'evolution' | 'outra' = 'evolution'): void {
  if (apiType === 'evolution') {
    this.evolutionAPI = new EvolutionAPIImpl(apiKey, baseURL);
  } else {
    this.evolutionAPI = new OutraAPIImpl(apiKey, baseURL);
  }
}
```

### Adicionar Novo Use Case

1. Criar novo `UseCase.ts` em `src/usercase/whatsapp/`
2. Implementar validações e lógica
3. Registrar no `WhatsAppFactory`

## Testes

### Unit Test de Use Case

```typescript
import { SendWhatsAppMessage } from '../SendWhatsAppMessage';

describe('SendWhatsAppMessage', () => {
  let useCase: SendWhatsAppMessage;
  let mockAPI: IEvolutionAPI;
  let mockRepository: IWhatsAppRepository;

  beforeEach(() => {
    mockAPI = createMock<IEvolutionAPI>();
    mockRepository = createMock<IWhatsAppRepository>();
    useCase = new SendWhatsAppMessage(mockAPI, mockRepository);
  });

  it('should send message successfully', async () => {
    const result = await useCase.execute({
      userId: 'user-1',
      instanceName: 'instance-1',
      phoneNumber: '5511999999999',
      message: 'Test message',
    });

    expect(result.success).toBe(true);
  });
});
```

## Fluxo de Dados

```
Request HTTP
    ↓
SendWhatsAppMessageController
    ↓
SendWhatsAppMessage (Use Case)
    ↓
EvolutionAPIImpl → API externa
    ↓
WhatsAppRepositoryImpl → Database
    ↓
Response HTTP
```

## Próximas Implementações

- [ ] Adicionar modelos Prisma para WhatsApp
- [ ] Implementar métodos do repositório com Prisma
- [ ] Autenticação JWT middleware
- [ ] Validação de schemas com Zod/Joi
- [ ] Testes unitários
- [ ] Testes de integração
- [ ] Rate limiting
- [ ] Logging estruturado
