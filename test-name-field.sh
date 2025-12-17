#!/bin/bash
# Teste do campo name

echo "🧪 Testando campo 'name' em messaging_instances"
echo ""

# Substitua SEU_TOKEN pelo token real
TOKEN="SEU_TOKEN_AQUI"
API_URL="http://localhost:3000"

echo "1️⃣ Criando instância COM nome..."
curl -X POST "$API_URL/api/messaging/instance" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Loja Principal - Teste",
    "channel": "whatsapp_evolution",
    "channelInstanceId": "test-with-name",
    "channelPhoneOrId": "5511999999999"
  }' | jq '.'

echo ""
echo ""
echo "2️⃣ Criando instância SEM nome..."
curl -X POST "$API_URL/api/messaging/instance" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "channel": "whatsapp_evolution",
    "channelInstanceId": "test-without-name",
    "channelPhoneOrId": "5511888888888"
  }' | jq '.'

echo ""
echo ""
echo "3️⃣ Listando todas as instâncias..."
curl -X GET "$API_URL/api/messaging/instances" \
  -H "Authorization: Bearer $TOKEN" | jq '.data[] | {id, name, channelInstanceId, status}'

echo ""
echo "✅ Teste concluído!"
echo ""
echo "Verifique se:"
echo "  - Primeira instância tem name: 'Loja Principal - Teste'"
echo "  - Segunda instância tem name: null"
