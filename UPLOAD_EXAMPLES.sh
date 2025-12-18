#!/bin/bash

# Sistema de Upload - Exemplo de Uso
# ====================================

# 1. Fazer upload de uma imagem
echo "=== Upload de Imagem ==="
curl -X POST http://localhost:3000/api/upload \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -F "file=@/caminho/para/sua/imagem.jpg"

echo -e "\n"

# Resposta esperada:
# {
#   "success": true,
#   "file": {
#     "id": "uuid-do-arquivo",
#     "filename": "uuid.jpg",
#     "originalName": "imagem.jpg",
#     "mimeType": "image/jpeg",
#     "size": 245678,
#     "url": "http://localhost:3000/uploads/business_123/uuid.jpg"
#   }
# }

# 2. Usar a URL em uma mensagem do Evolution API
echo "=== Enviando imagem via Evolution API ==="

# Primeiro, pegue a URL do upload acima
FILE_URL="http://localhost:3000/uploads/business_123/uuid.jpg"

# Agora envie a mensagem com a imagem
curl -X POST http://localhost:3000/api/messaging/messages/send \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "instanceId": "sua-instance-id",
    "remoteJid": "5585999999999@s.whatsapp.net",
    "message": {
      "text": "Olá! Segue a imagem:"
    },
    "mediaUrl": "'$FILE_URL'"
  }'

echo -e "\n"

# 3. Exemplo com PDF
echo "=== Upload de PDF ==="
curl -X POST http://localhost:3000/api/upload \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -F "file=@/caminho/para/documento.pdf"

# 4. Exemplo com áudio
echo "=== Upload de Áudio ==="
curl -X POST http://localhost:3000/api/upload \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -F "file=@/caminho/para/audio.mp3"

# NOTAS:
# - Tamanho máximo: 50MB
# - Formatos suportados: qualquer tipo de arquivo
# - A URL retornada é pública e pode ser usada em qualquer lugar
# - Arquivos são organizados por businessProfileId
# - Requer autenticação (Bearer token)
