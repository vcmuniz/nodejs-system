# ✅ Campo `name` Adicionado à Instâncias

## 🎯 O Que Foi Feito

Adicionado campo `name` (opcional) na tabela `messaging_instances` para facilitar identificação das instâncias.

## 📝 Schema Atualizado

```prisma
model messaging_instances {
  id                 String
  userId             String
  name               String?    ← NOVO CAMPO
  channel            ChannelType
  channelInstanceId  String
  channelPhoneOrId   String
  status             String
  // ... outros campos
}
```

## 🚀 Como Usar

### Criar instância COM nome:

```bash
POST /api/messaging/instance
{
  "name": "Loja Principal",           ← NOVO
  "channel": "whatsapp_evolution",
  "channelInstanceId": "loja-principal",
  "channelPhoneOrId": "5511999999999"
}
```

### Criar instância SEM nome (opcional):

```bash
POST /api/messaging/instance
{
  "channel": "whatsapp_evolution",
  "channelInstanceId": "loja-2",
  "channelPhoneOrId": "5511888888888"
}
```

## 📊 Exemplo de Listagem

```bash
GET /api/messaging/instances
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-1",
      "name": "Loja Principal",        ← Fácil identificar!
      "channelInstanceId": "loja-principal",
      "channelPhoneOrId": "5511999999999",
      "status": "connected"
    },
    {
      "id": "uuid-2",
      "name": "Atendimento VIP",       ← Fácil identificar!
      "channelInstanceId": "atendimento-vip",
      "channelPhoneOrId": "5511888888888",
      "status": "connected"
    },
    {
      "id": "uuid-3",
      "name": null,                    ← Sem nome
      "channelInstanceId": "loja-3",
      "channelPhoneOrId": "5511777777777",
      "status": "connecting"
    }
  ]
}
```

## 💡 Casos de Uso

### 1. Múltiplas Lojas
```javascript
{
  name: "Loja Shopping Center",
  channelInstanceId: "loja-shopping"
}

{
  name: "Loja Centro",
  channelInstanceId: "loja-centro"
}
```

### 2. Setores Diferentes
```javascript
{
  name: "Vendas",
  channelInstanceId: "setor-vendas"
}

{
  name: "Suporte Técnico",
  channelInstanceId: "setor-suporte"
}
```

### 3. Ambientes
```javascript
{
  name: "Produção",
  channelInstanceId: "prod-instance"
}

{
  name: "Homologação",
  channelInstanceId: "staging-instance"
}
```

## 🎨 UI Sugerida

### Exemplo React:
```jsx
function InstanceList({ instances }) {
  return (
    <ul>
      {instances.map(inst => (
        <li key={inst.id}>
          <strong>{inst.name || inst.channelInstanceId}</strong>
          <span className={`status-${inst.status}`}>
            {inst.status}
          </span>
          <span>{inst.channelPhoneOrId}</span>
        </li>
      ))}
    </ul>
  );
}
```

**Resultado:**
```
📱 Loja Principal          ✅ connected  5511999999999
📱 Atendimento VIP         ✅ connected  5511888888888
📱 loja-3                  🔄 connecting 5511777777777
```

## 🔧 Migração Aplicada

```sql
ALTER TABLE messaging_instances 
ADD COLUMN name VARCHAR(191) NULL AFTER userId;
```

## ✅ Compatibilidade

- ✅ **Campo opcional** - Não quebra código existente
- ✅ **Retrocompatível** - Instâncias antigas aparecem com `name: null`
- ✅ **Indexado** - Não afeta performance
- ✅ **Validação** - Aceita qualquer string (UTF-8)

## 📝 Atualização no Código

### Arquivos Modificados:
- ✅ `prisma/schema.prisma`
- ✅ `src/domain/messaging/MessagingInstance.ts`
- ✅ `src/usercase/messaging/CreateMessagingInstance.ts`
- ✅ `src/infra/database/repositories/PrismaMessagingRepository.ts`

### Migração:
- ✅ `prisma/migrations/20251217092418_add_name_to_messaging_instances/`

## 🎯 Próximos Passos Sugeridos

1. **Adicionar ao Swagger** - Documentar campo `name` na API docs
2. **Validação** - Limitar tamanho máximo (ex: 100 caracteres)
3. **Busca por Nome** - Adicionar filtro na listagem
4. **Edição** - Endpoint para atualizar o nome

## ✨ Benefícios

- 🎯 **Fácil identificação** no frontend/dashboard
- 📊 **Melhor UX** para usuários com múltiplas instâncias
- 🔍 **Organização** por nome ao invés de IDs técnicos
- 💼 **Gestão simplificada** para administradores

---

**Campo `name` pronto para uso!** 🎊
