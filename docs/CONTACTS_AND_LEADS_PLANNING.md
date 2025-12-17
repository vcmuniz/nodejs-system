# 📋 Sistema de Contatos e Captura de Leads - Planejamento Completo

**Data:** 2025-12-17  
**Status:** ✅ Aprovado para implementação

---

## 🎯 Objetivo

Criar um sistema completo de gestão de contatos com:
1. **CRUD de contatos** (privado - requer autenticação)
2. **API pública para captura de leads** (sem autenticação)
3. **Controle e rastreamento de leads** capturados

---

## 📊 Estrutura do Banco de Dados

### Tabela: `contacts`

Armazena todos os contatos e leads do sistema.

```prisma
model contacts {
  id              String    @id @default(uuid())
  userId          String    // Dono do contato
  
  // Informações básicas
  name            String
  email           String?
  phone           String?
  cpf             String?   @unique
  
  // Informações profissionais
  company         String?
  position        String?   // Cargo
  website         String?
  
  // Endereço completo
  street          String?
  number          String?
  complement      String?
  neighborhood    String?
  city            String?
  state           String?
  zipCode         String?
  country         String?   @default("Brasil")
  
  // Dados adicionais
  birthDate       DateTime?
  notes           String?   @db.LongText
  tags            String?   // JSON array ["cliente", "vip"]
  customFields    String?   @db.LongText // JSON campos customizados
  
  // Rastreamento de origem
  source          String?   // "manual", "lead_capture", "import", "whatsapp"
  sourceUrl       String?   // URL de onde veio
  leadCaptureId   String?   // ID da página de captura
  
  // Status e classificação
  status          String    @default("active") // active, inactive, blocked
  isLead          Boolean   @default(false)
  leadScore       Int       @default(0)
  
  // Timestamps
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  convertedAt     DateTime? // Quando virou contato
  
  // Relações
  user            users     @relation(fields: [userId], references: [id], onDelete: Cascade)
  leadCapture     lead_captures? @relation(fields: [leadCaptureId], references: [id])
  activities      contact_activities[]
  
  @@index([userId])
  @@index([email])
  @@index([phone])
  @@index([isLead])
  @@index([status])
  @@index([leadCaptureId])
  @@index([createdAt])
}
```

### Tabela: `lead_captures`

Páginas de captura configuráveis para cada usuário.

```prisma
model lead_captures {
  id              String    @id @default(uuid())
  userId          String
  
  // Configuração da página
  name            String    // Nome interno
  title           String    // Título mostrado
  description     String?   @db.Text
  
  // Campos do formulário
  fields          String    @db.LongText // JSON: ["name","email","phone"]
  requiredFields  String    @db.LongText // JSON: ["name","email"]
  
  // Customização
  submitButtonText String   @default("Enviar")
  successMessage  String    @db.Text
  redirectUrl     String?   // Redirecionar após envio
  
  // Notificações
  webhookUrl      String?   // POST quando capturar
  notifyEmail     String?   // Email de notificação
  
  // Controle
  isActive        Boolean   @default(true)
  slug            String    @unique // URL: /public/lead/{slug}
  totalCaptures   Int       @default(0)
  
  // Timestamps
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  // Relações
  user            users     @relation(fields: [userId], references: [id], onDelete: Cascade)
  contacts        contacts[]
  
  @@index([userId])
  @@index([slug])
  @@index([isActive])
}
```

### Tabela: `contact_activities`

Timeline de atividades e interações com contatos.

```prisma
model contact_activities {
  id          String    @id @default(uuid())
  contactId   String
  userId      String?
  
  // Atividade
  type        String    // "note", "email", "call", "meeting", "status_change", "lead_captured"
  title       String
  description String?   @db.Text
  
  // Dados extras
  metadata    String?   @db.LongText // JSON
  
  createdAt   DateTime  @default(now())
  
  contact     contacts  @relation(fields: [contactId], references: [id], onDelete: Cascade)
  user        users?    @relation(fields: [userId], references: [id])
  
  @@index([contactId])
  @@index([type])
  @@index([createdAt])
}
```

---

## 🚀 Endpoints da API

### 🔒 Rotas Privadas (Requerem Autenticação)

#### CRUD de Contatos
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/contacts` | Criar contato |
| GET | `/api/contacts` | Listar contatos (filtros, paginação) |
| GET | `/api/contacts/:id` | Obter contato específico |
| PUT | `/api/contacts/:id` | Atualizar contato |
| DELETE | `/api/contacts/:id` | Deletar contato |
| POST | `/api/contacts/:id/convert` | Converter lead → contato |
| POST | `/api/contacts/:id/activity` | Adicionar atividade |
| GET | `/api/contacts/:id/activities` | Timeline de atividades |

#### Gestão de Lead Captures
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/lead-captures` | Criar página de captura |
| GET | `/api/lead-captures` | Listar páginas |
| GET | `/api/lead-captures/:id` | Obter página |
| PUT | `/api/lead-captures/:id` | Atualizar página |
| DELETE | `/api/lead-captures/:id` | Deletar página |
| GET | `/api/lead-captures/:id/stats` | Estatísticas |

#### Filtros de Contatos
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/contacts/leads` | Apenas leads (isLead=true) |
| GET | `/api/contacts?tags=vip` | Filtrar por tags |
| GET | `/api/contacts?source=lead_capture` | Filtrar por origem |
| GET | `/api/contacts?status=active` | Filtrar por status |

### 🌐 Rotas Públicas (SEM Autenticação)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/public/lead/:slug` | Ver formulário HTML |
| POST | `/public/lead/:slug` | Enviar formulário |
| GET | `/public/lead/:slug/config` | Config do formulário (JSON) |

---

## 📝 Exemplos de Uso

### 1. Criar Contato Manualmente

```bash
POST /api/contacts
Authorization: Bearer {token}

{
  "name": "João Silva",
  "email": "joao@example.com",
  "phone": "5511999999999",
  "company": "Empresa XYZ",
  "position": "Gerente de Vendas",
  "tags": ["cliente", "vip"],
  "source": "manual",
  "notes": "Cliente VIP interessado em produto Premium"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "João Silva",
    "email": "joao@example.com",
    "phone": "5511999999999",
    "isLead": false,
    "status": "active",
    "createdAt": "2025-12-17T14:00:00Z"
  }
}
```

### 2. Criar Página de Captura

```bash
POST /api/lead-captures
Authorization: Bearer {token}

{
  "name": "Landing Page E-book",
  "title": "Baixe nosso E-book Grátis",
  "description": "Aprenda tudo sobre marketing digital",
  "slug": "ebook-marketing",
  "fields": ["name", "email", "phone", "company"],
  "requiredFields": ["name", "email"],
  "submitButtonText": "Baixar E-book Agora",
  "successMessage": "✅ Obrigado! Enviamos o e-book para seu email.",
  "redirectUrl": "https://meusite.com/obrigado",
  "notifyEmail": "vendas@meusite.com"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "slug": "ebook-marketing",
    "publicUrl": "https://stackline-api.stackline.com.br/public/lead/ebook-marketing",
    "isActive": true,
    "totalCaptures": 0
  }
}
```

### 3. Capturar Lead (Público - SEM AUTH)

```bash
POST /public/lead/ebook-marketing
Content-Type: application/json

{
  "name": "Maria Santos",
  "email": "maria@example.com",
  "phone": "5521988888888",
  "company": "ABC Ltda"
}
```

**Response:**
```json
{
  "success": true,
  "message": "✅ Obrigado! Enviamos o e-book para seu email.",
  "redirectUrl": "https://meusite.com/obrigado"
}
```

**O que acontece automaticamente:**
1. ✅ Lead salvo em `contacts` (isLead=true)
2. ✅ Atividade criada: "Lead capturado via Landing Page E-book"
3. ✅ Email enviado para `vendas@meusite.com`
4. ✅ Webhook POST enviado (se configurado)
5. ✅ Contador `totalCaptures` incrementado

### 4. Listar Leads Capturados

```bash
GET /api/contacts/leads?leadCaptureId=xxx&page=1&limit=20
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-1",
      "name": "Maria Santos",
      "email": "maria@example.com",
      "phone": "5521988888888",
      "company": "ABC Ltda",
      "isLead": true,
      "leadScore": 50,
      "source": "lead_capture",
      "leadCapture": {
        "name": "Landing Page E-book",
        "slug": "ebook-marketing"
      },
      "createdAt": "2025-12-17T14:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

### 5. Converter Lead em Contato

```bash
POST /api/contacts/{id}/convert
Authorization: Bearer {token}

{
  "notes": "Cliente fechou contrato - Produto Premium"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Lead convertido em contato",
  "data": {
    "id": "uuid",
    "isLead": false,
    "convertedAt": "2025-12-17T15:00:00Z"
  }
}
```

### 6. Estatísticas da Página de Captura

```bash
GET /api/lead-captures/{id}/stats
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalCaptures": 150,
    "capturesLast7Days": 25,
    "capturesLast30Days": 89,
    "conversionRate": 35.5,
    "topSources": [
      { "url": "facebook.com", "count": 50 },
      { "url": "google.com", "count": 30 },
      { "url": "instagram.com", "count": 20 }
    ],
    "capturesByDay": [
      { "date": "2025-12-17", "count": 12 },
      { "date": "2025-12-16", "count": 8 }
    ],
    "conversionsByDay": [
      { "date": "2025-12-17", "count": 4 },
      { "date": "2025-12-16", "count": 3 }
    ]
  }
}
```

---

## 🔐 Validações

### Contato
- ✅ Nome obrigatório (min: 3 caracteres)
- ✅ Email OU telefone obrigatório
- ✅ Email válido (formato correto)
- ✅ Telefone válido (formato brasileiro)
- ✅ CPF único (se fornecido)
- ✅ CPF válido (validação matemática)
- ✅ Tags: array de strings
- ✅ Status: enum ["active", "inactive", "blocked"]

### Lead Capture
- ✅ Nome obrigatório
- ✅ Slug único
- ✅ Slug alfanumérico (a-z, 0-9, -)
- ✅ Pelo menos 1 campo ativo
- ✅ Campos requeridos devem estar nos ativos
- ✅ Email válido (se notifyEmail fornecido)
- ✅ URL válida (se webhookUrl fornecido)

---

## 🎨 Campos Customizados

Sistema flexível de campos extras:

```json
{
  "customFields": {
    "empresa_tamanho": "50-100 funcionários",
    "interesse": "Produto Premium",
    "orcamento": "R$ 10.000",
    "prazo": "3 meses"
  }
}
```

---

## 🏷️ Sistema de Tags

```json
{
  "tags": ["cliente", "vip", "interessado-produto-x", "prioridade-alta"]
}
```

**Filtros:**
```
GET /api/contacts?tags=vip,cliente
GET /api/contacts?tags=interessado-produto-x
```

---

## 📊 Lead Scoring

Pontuação automática baseada em:
- ✅ Preenchimento de campos (+10 por campo)
- ✅ Origem (landing page = +20, manual = +10)
- ✅ Atividades (+5 por interação)
- ✅ Tempo desde criação (-5 por semana)

**Exemplo:**
- Lead com nome, email, phone, company = 40 pontos
- De landing page = +20 = 60 pontos
- 3 atividades registradas = +15 = 75 pontos

---

## 🔔 Webhooks

Quando um lead é capturado:

```json
POST {webhookUrl}
Content-Type: application/json

{
  "event": "lead_captured",
  "leadCaptureId": "uuid",
  "leadCaptureName": "Landing Page E-book",
  "contact": {
    "id": "uuid",
    "name": "Maria Santos",
    "email": "maria@example.com",
    "phone": "5521988888888",
    "company": "ABC Ltda",
    "customFields": {}
  },
  "sourceUrl": "https://facebook.com/ad-campaign",
  "timestamp": "2025-12-17T14:00:00Z"
}
```

---

## 🎯 Ordem de Implementação

### Fase 1: Base de Dados ✅
1. Migrations (schema.prisma)
2. Domain entities
3. Repositories (Prisma)

### Fase 2: Lógica de Negócio ✅
4. Use Cases (todos)
5. Validações

### Fase 3: API ✅
6. Controllers
7. Routes (privadas e públicas)
8. Middlewares

### Fase 4: Documentação ✅
9. Swagger
10. Exemplos de uso
11. README

### Fase 5: Extras (Futuro)
- Dashboard de estatísticas
- Importação CSV
- Exportação
- Email Marketing
- UTM tracking

---

## 💡 Melhorias Futuras

- [ ] **Importação em massa** (CSV, Excel)
- [ ] **Exportação** de contatos
- [ ] **Segmentação** de listas
- [ ] **Email Marketing** integrado
- [ ] **UTM tracking** automático
- [ ] **Formulário visual** (drag & drop)
- [ ] **A/B testing** de páginas
- [ ] **Scoring** inteligente (IA)
- [ ] **Integração** com CRMs externos
- [ ] **Duplicatas** - detecção e merge
- [ ] **Campos dinâmicos** por tipo de lead
- [ ] **Templates** de formulários

---

## ✅ Checklist de Implementação

- [ ] Schema Prisma
- [ ] Migration SQL
- [ ] Domain entities
- [ ] Repository interfaces
- [ ] Repository implementations
- [ ] Use Cases (CRUD)
- [ ] Use Cases (Lead Capture)
- [ ] Use Cases (Conversão)
- [ ] Controllers
- [ ] Routes privadas
- [ ] Routes públicas
- [ ] Validações
- [ ] Swagger docs
- [ ] Testes básicos

---

## 🚀 Pronto para Implementar!

**Próximo comando:**
```bash
# Na próxima sessão, diga:
"Vamos implementar o sistema de contatos e leads conforme docs/CONTACTS_AND_LEADS_PLANNING.md"
```

**Arquivos de referência:**
- `PROXIMO_PASSO.md` - Resumo rápido
- `docs/CONTACTS_AND_LEADS_PLANNING.md` - Este arquivo (completo)

---

**Data de planejamento:** 2025-12-17  
**Status:** ✅ Aprovado e pronto para implementação
