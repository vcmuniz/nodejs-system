# 📸 Como Enviar Mensagens com Mídia (Imagens, Vídeos, Arquivos)

## 🎯 Fluxo Completo

### 1. **Upload do Arquivo** 📤

Primeiro, faça upload do arquivo e obtenha a URL:

```bash
curl -X POST http://localhost:3000/api/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/image.jpg"
```

**Response:**
```json
{
  "success": true,
  "file": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "filename": "123e4567-e89b-12d3-a456-426614174000.jpg",
    "originalName": "image.jpg",
    "mimeType": "image/jpeg",
    "size": 245678,
    "url": "http://localhost:3000/uploads/business_123/123e4567-e89b-12d3-a456-426614174000.jpg"
  }
}
```

### 2. **Enviar Mensagem com a URL da Mídia** 📨

Use a URL retornada no campo `mediaUrl`:

```bash
curl -X POST http://localhost:3000/api/messaging/message/send \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "instanceId": "11131cd4-43f9-4e6f-8aeb-b7fd17cf5905",
    "remoteJid": "5585999999999",
    "message": "Olá! Segue a imagem:",
    "mediaUrl": "http://localhost:3000/uploads/business_123/123e4567-e89b-12d3-a456-426614174000.jpg"
  }'
```

## 📋 Campos Disponíveis

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `instanceId` | string | ✅ | ID da instância de mensageria |
| `remoteJid` | string | ✅ | Número do destinatário (formato: 5585999999999) |
| `message` | string | ❌ | Texto da mensagem (opcional quando há mídia) |
| `mediaUrl` | string | ❌ | URL pública da mídia (imagem, vídeo, documento) |

## 🎨 Exemplos de Uso

### Enviar Apenas Imagem (sem texto)

```bash
curl -X POST http://localhost:3000/api/messaging/message/send \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "instanceId": "11131cd4-43f9-4e6f-8aeb-b7fd17cf5905",
    "remoteJid": "5585999999999",
    "mediaUrl": "http://localhost:3000/uploads/business_123/image.jpg"
  }'
```

### Enviar Imagem com Legenda

```bash
curl -X POST http://localhost:3000/api/messaging/message/send \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "instanceId": "11131cd4-43f9-4e6f-8aeb-b7fd17cf5905",
    "remoteJid": "5585999999999",
    "message": "🎉 Nova promoção disponível!",
    "mediaUrl": "http://localhost:3000/uploads/business_123/promocao.jpg"
  }'
```

### Enviar PDF

```bash
curl -X POST http://localhost:3000/api/messaging/message/send \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "instanceId": "11131cd4-43f9-4e6f-8aeb-b7fd17cf5905",
    "remoteJid": "5585999999999",
    "message": "Segue o documento solicitado",
    "mediaUrl": "http://localhost:3000/uploads/business_123/documento.pdf"
  }'
```

### Enviar Vídeo

```bash
curl -X POST http://localhost:3000/api/messaging/message/send \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "instanceId": "11131cd4-43f9-4e6f-8aeb-b7fd17cf5905",
    "remoteJid": "5585999999999",
    "message": "Confira o vídeo tutorial",
    "mediaUrl": "http://localhost:3000/uploads/business_123/tutorial.mp4"
  }'
```

## 🔄 Enviar para Grupo

### Opção 1: Enviar para Remoto JID do Grupo

```bash
curl -X POST http://localhost:3000/api/messaging/message/send \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "instanceId": "11131cd4-43f9-4e6f-8aeb-b7fd17cf5905",
    "remoteJid": "120363XXXXXXXXXX@g.us",
    "message": "Olá grupo!",
    "mediaUrl": "http://localhost:3000/uploads/business_123/image.jpg"
  }'
```

### Opção 2: Enviar para Grupo Cadastrado no Sistema

```bash
curl -X POST http://localhost:3000/api/messaging/groups/GROUP_ID/send \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Olá grupo!",
    "mediaUrl": "http://localhost:3000/uploads/business_123/image.jpg"
  }'
```

## 📝 Tipos de Mídia Suportados

### Imagens
- `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`
- Máximo: 50MB

### Vídeos
- `.mp4`, `.avi`, `.mov`, `.mkv`
- Máximo: 50MB

### Documentos
- `.pdf`, `.doc`, `.docx`, `.xls`, `.xlsx`, `.txt`
- Máximo: 50MB

### Áudio
- `.mp3`, `.ogg`, `.wav`, `.m4a`
- Máximo: 50MB

## 🔍 Como Verificar o Status

O sistema retorna informações sobre o envio:

```json
{
  "total": 1,
  "sent": 1,
  "failed": 0,
  "errors": []
}
```

## ⚠️ Observações Importantes

1. **URL Pública**: A URL da mídia deve ser acessível publicamente pela Evolution API
2. **Tamanho**: Máximo de 50MB por arquivo
3. **Formato**: Use o formato de número correto (5585999999999 sem + ou espaços)
4. **Grupos**: Para grupos do WhatsApp, use o formato `120363XXXXXXXXXX@g.us`
5. **HTTPS**: Em produção, use URLs HTTPS para maior segurança

## 🚀 Workflow Completo (Frontend)

```javascript
// 1. Upload do arquivo
const formData = new FormData();
formData.append('file', fileInput.files[0]);

const uploadResponse = await fetch('http://localhost:3000/api/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const { file } = await uploadResponse.json();

// 2. Enviar mensagem com a URL
await fetch('http://localhost:3000/api/messaging/message/send', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    instanceId: 'YOUR_INSTANCE_ID',
    remoteJid: '5585999999999',
    message: 'Confira a imagem!',
    mediaUrl: file.url
  })
});
```

## 📚 Links Relacionados

- [Evolution API Docs](https://doc.evolution-api.com)
- [Swagger Local](http://localhost:3000/api-docs)
