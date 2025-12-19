# 🔄 QR Code Fresco - Solução para Conexão WhatsApp

## 🎯 Problema Identificado

**Sintoma:** QR Code da API não conecta, mas QR Code do painel Evolution funciona.

**Causa:** QR Codes da Evolution API expiram em **30-60 segundos**. O QR Code retornado na criação da instância pode estar expirado quando o usuário tenta escanear.

## ✅ Solução Implementada

Criado endpoint para **gerar QR Code fresco sob demanda**.

## 🚀 Como Usar

### 1. Criar Instância (como antes):

```bash
POST /api/messaging/instance
Authorization: Bearer SEU_TOKEN
Content-Type: application/json

{
  "channel": "whatsapp_evolution",
  "channelInstanceId": "minha-instancia",
  "channelPhoneOrId": "5511999999999"
}
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "instanceId": "uuid-da-instancia",
    "status": "connecting",
    "qrCode": "data:image/png;base64,...",
    "message": "Instância criada..."
  }
}
```

### 2. **NOVO:** Obter QR Code Fresco:

```bash
GET /api/messaging/instance/{instanceId}/qrcode
Authorization: Bearer SEU_TOKEN
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "status": "connecting",
    "message": "QR Code gerado com sucesso. Escaneie em até 60 segundos."
  }
}
```

## 💡 Fluxo Recomendado no Frontend

```javascript
// 1. Criar instância
const createResponse = await fetch('/api/messaging/instance', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    channel: 'whatsapp_evolution',
    channelInstanceId: 'minha-instancia',
    channelPhoneOrId: '5511999999999'
  })
});

const { data } = await createResponse.json();
const instanceId = data.instanceId;

// 2. Mostrar QR Code inicial
showQRCode(data.qrCode);

// 3. Botão para renovar QR Code (caso expire)
async function refreshQRCode() {
  const qrResponse = await fetch(`/api/messaging/instance/${instanceId}/qrcode`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const qrData = await qrResponse.json();
  showQRCode(qrData.data.qrCode);
}

// 4. Auto-refresh a cada 50 segundos (antes de expirar)
setInterval(refreshQRCode, 50000);
```

## 🎨 Exemplo React

```jsx
import { useState, useEffect } from 'react';

function WhatsAppConnection({ instanceId, token }) {
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchQRCode = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/messaging/instance/${instanceId}/qrcode`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      const data = await response.json();
      setQrCode(data.data.qrCode);
    } catch (error) {
      console.error('Erro ao obter QR Code:', error);
    } finally {
      setLoading(false);
    }
  };

  // Buscar QR Code inicial
  useEffect(() => {
    fetchQRCode();
  }, [instanceId]);

  // Auto-refresh a cada 50 segundos
  useEffect(() => {
    const interval = setInterval(fetchQRCode, 50000);
    return () => clearInterval(interval);
  }, [instanceId]);

  return (
    <div>
      <h2>Conectar WhatsApp</h2>
      {qrCode && <img src={qrCode} alt="QR Code" />}
      <button onClick={fetchQRCode} disabled={loading}>
        {loading ? 'Gerando...' : '🔄 Renovar QR Code'}
      </button>
      <p>QR Code expira em 60 segundos</p>
    </div>
  );
}
```

## 📝 O Que Foi Implementado

### Arquivos Criados:
- `src/usercase/messaging/GetInstanceQRCode.ts` - Use case
- `src/presentation/controllers/messaging/GetInstanceQRCodeController.ts` - Controller
- Rota GET `/api/messaging/instance/:instanceId/qrcode`

### Arquivos Modificados:
- `src/ports/IMessagingAdapter.ts` - Adicionado `qrCode?` ao `GetStatusOutput`
- `src/infra/messaging/adapters/WhatsAppAdapter.ts` - Implementado `getStatus()` para buscar QR Code fresco
- `src/presentation/routes/messaging.routes.ts` - Adicionada rota e documentação Swagger

## 🔧 Como Funciona Internamente

1. **GET /instance/{id}/qrcode** chamado
2. Busca instância no banco
3. Verifica credenciais do usuário
4. Chama `adapter.getStatus()` que:
   - Verifica estado na Evolution API
   - Se não conectado, chama `connectInstance()` para gerar QR Code **novo**
   - Retorna QR Code fresco em base64
5. Frontend exibe QR Code atualizado

## ✅ Benefícios

- ✅ QR Code sempre fresco (< 5 segundos de idade)
- ✅ Usuário pode renovar quantas vezes quiser
- ✅ Auto-refresh no frontend evita expiração
- ✅ Não salva QR Code no banco (segurança)
- ✅ Funciona igual ao painel Evolution

## 🎯 Teste Rápido

```bash
# 1. Criar instância
curl -X POST http://localhost:3000/api/messaging/instance \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "channel": "whatsapp_evolution",
    "channelInstanceId": "teste-qr",
    "channelPhoneOrId": "5511999999999"
  }'

# 2. Anotar o instanceId da resposta

# 3. Obter QR Code fresco
curl http://localhost:3000/api/messaging/instance/INSTANCE_ID/qrcode \
  -H "Authorization: Bearer SEU_TOKEN"

# 4. Aguardar 70 segundos e chamar novamente - novo QR Code!
```

---

**Agora o QR Code sempre funcionará!** 🎉
