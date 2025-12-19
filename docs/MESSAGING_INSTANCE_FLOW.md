# 📱 Fluxo de Criação de Instância de Mensageria

## 🔄 Fluxo Completo (Inteligente)

### Cenário 1: Primeira criação

```bash
POST /api/messaging/instance
{
  "channel": "whatsapp_evolution",
  "channelInstanceId": "my-store",
  "channelPhoneOrId": "5521991856227"
}
```

**O que acontece:**

1. ✅ Verifica se existe no **banco de dados** → **NÃO existe**
2. ✅ Busca credencial ativa do tipo `whatsapp_evolution`
3. ✅ Cria registro no banco de dados
4. ✅ Verifica se existe na **Evolution API** → **NÃO existe**
5. ✅ Chama `POST /instance/create` na Evolution API
6. ✅ Chama `GET /instance/connect/{instanceName}` para gerar QR Code
7. ✅ Salva QR Code no banco
8. ✅ Retorna QR Code em base64

**Response:**
```json
{
  "success": true,
  "message": "Instância criada com credenciais do sistema",
  "data": {
    "instanceId": "clxxx",
    "status": "connecting",
    "qrCode": "data:image/png;base64,iVBORw0KG...",
    "message": "Instância criada. Escaneie o QR Code no WhatsApp."
  }
}
```

---

### Cenário 2: Chamada duplicada (já existe no banco E na Evolution)

```bash
POST /api/messaging/instance
{
  "channel": "whatsapp_evolution",
  "channelInstanceId": "my-store",  // MESMA instância
  "channelPhoneOrId": "5521991856227"
}
```

**O que acontece:**

1. ✅ Verifica se existe no **banco de dados** → **SIM, existe!**
2. ✅ Busca credencial ativa do tipo `whatsapp_evolution`
3. ⏭️ **NÃO cria** novo registro no banco (reusa existente)
4. ✅ Verifica se existe na **Evolution API** → **SIM, existe!**
5. ⏭️ **NÃO chama** `POST /instance/create` (já existe)
6. ✅ Chama `GET /instance/connect/{instanceName}` para **gerar novo QR Code**
7. ✅ Atualiza QR Code no banco
8. ✅ Retorna novo QR Code

**Response:**
```json
{
  "success": true,
  "message": "Instância criada com credenciais do sistema",
  "data": {
    "instanceId": "clxxx",  // MESMO ID do banco
    "status": "connecting",
    "qrCode": "data:image/png;base64,NEW_QR_CODE...",
    "message": "Instância já existente. Escaneie o QR Code."
  }
}
```

---

### Cenário 3: Existe no banco mas NÃO na Evolution (dessincronizado)

**Pode acontecer se:**
- Evolution API foi reiniciada e perdeu as instâncias
- Instância foi deletada manualmente na Evolution
- Troca de servidor Evolution

```bash
POST /api/messaging/instance
{
  "channel": "whatsapp_evolution",
  "channelInstanceId": "my-store",
  "channelPhoneOrId": "5521991856227"
}
```

**O que acontece:**

1. ✅ Verifica se existe no **banco de dados** → **SIM, existe!**
2. ✅ Busca credencial ativa
3. ⏭️ **NÃO cria** novo registro no banco
4. ✅ Verifica se existe na **Evolution API** → **NÃO existe!** 😱
5. ✅ **Recria** a instância: `POST /instance/create`
6. ✅ Conecta para gerar QR Code
7. ✅ Atualiza banco
8. ✅ Retorna QR Code

**Response:**
```json
{
  "success": true,
  "message": "Instância criada com credenciais do sistema",
  "data": {
    "instanceId": "clxxx",
    "status": "connecting",
    "qrCode": "data:image/png;base64,NEW_QR...",
    "message": "Instância criada. Escaneie o QR Code no WhatsApp."
  }
}
```

---

## 🎯 Lógica de Decisão

```
┌─────────────────────────────────┐
│  POST /api/messaging/instance   │
└────────────┬────────────────────┘
             │
             ▼
    ┌────────────────────┐
    │ Existe no Banco?   │
    └────┬───────────┬───┘
         │ NÃO       │ SIM
         ▼           ▼
    ┌────────┐  ┌──────────────────┐
    │ Criar  │  │ Verificar na     │
    │ no     │  │ Evolution API    │
    │ Banco  │  └────┬─────────┬───┘
    └────┬───┘       │         │
         │           │ NÃO     │ SIM
         │           ▼         │
         │      ┌─────────┐    │
         │      │ Criar   │    │
         │      │ Evolution│   │
         │      └────┬────┘    │
         │           │         │
         └───────────┴─────────┘
                     │
                     ▼
            ┌────────────────┐
            │ Conectar &     │
            │ Gerar QR Code  │
            └────────┬───────┘
                     │
                     ▼
            ┌────────────────┐
            │ Retornar QR    │
            └────────────────┘
```

---

## 🔐 Credenciais Automáticas

**Todas as chamadas usam credenciais do banco:**

```sql
SELECT * FROM integration_credentials 
WHERE type = 'whatsapp_evolution' 
AND isActive = true 
LIMIT 1;
```

**Resultado:**
```json
{
  "apiToken": "evolution-api-key-clubfacts-2025",
  "baseUrl": "http://localhost:8080"
}
```

---

## 📊 Tracking de Credenciais

Cada instância guarda qual credencial foi usada:

```sql
SELECT 
  id,
  channelInstanceId,
  credentialId,
  status
FROM messaging_instances;
```

```
| id     | channelInstanceId | credentialId                  | status     |
|--------|-------------------|-------------------------------|------------|
| cl123  | my-store          | cred_evolution_clubfacts_2025 | connecting |
```

---

## ⚠️ Casos de Erro

### 1. Nenhuma credencial ativa
```json
{
  "success": false,
  "error": "Nenhuma credencial ativa encontrada para o canal \"whatsapp_evolution\". Por favor, contate o administrador para configurar as credenciais de integração."
}
```

**Solução:** Admin precisa criar credencial

### 2. Evolution API offline
```json
{
  "success": false,
  "error": "Erro ao criar/conectar instância"
}
```

**Solução:** Verificar se Evolution API está rodando

### 3. Instância já existe para outro usuário
```json
{
  "success": false,
  "error": "Instância já existe para outro usuário"
}
```

**Solução:** Usar outro `channelInstanceId`

---

## 🧪 Testando

### 1. Primeira criação
```bash
curl -X POST http://localhost:3000/api/messaging/instance \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "channel": "whatsapp_evolution",
    "channelInstanceId": "test-1",
    "channelPhoneOrId": "5521999999999"
  }'
```

### 2. Chamar novamente (deve recriar QR)
```bash
# Mesmo comando acima
# Deve retornar novo QR Code sem duplicar no banco
```

### 3. Verificar no banco
```bash
mysql> SELECT * FROM messaging_instances WHERE channelInstanceId = 'test-1';
# Deve ter APENAS 1 registro
```

### 4. Verificar na Evolution
```bash
curl http://localhost:8080/instance/fetchInstances \
  -H "apikey: evolution-api-key-clubfacts-2025"
```

---

## ✅ Benefícios

1. ✅ **Idempotente** - Chamar N vezes não duplica
2. ✅ **Auto-recuperação** - Recria se Evolution perdeu
3. ✅ **Credenciais centralizadas** - Admin controla
4. ✅ **Rastreável** - Sabe qual credencial foi usada
5. ✅ **Resiliente** - Trata erros graciosamente
6. ✅ **Novo QR a cada chamada** - Sempre atualizado

---

## 🎊 Pronto para Produção!

Sistema funcionando 100% com:
- ✅ Credenciais automáticas
- ✅ Verificação inteligente
- ✅ Enum de tipos
- ✅ Logs detalhados
- ✅ Tratamento de erros
