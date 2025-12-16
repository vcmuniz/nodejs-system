#!/bin/bash

# Script para testar o sistema de credenciais de integração

BASE_URL="http://localhost:3000"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="senha123"

echo "================================"
echo "TESTE: Sistema de Credenciais"
echo "================================"
echo ""

# 1. Login como ADMIN
echo "1. Fazendo login como ADMIN..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/signin" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$ADMIN_EMAIL\",
    \"password\": \"$ADMIN_PASSWORD\"
  }")

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Erro ao fazer login. Response:"
  echo $LOGIN_RESPONSE
  exit 1
fi

echo "✅ Login realizado com sucesso!"
echo "Token: ${TOKEN:0:20}..."
echo ""

# 2. Criar credencial Evolution
echo "2. Criando credencial Evolution..."
CREATE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/integration-credentials" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Evolution Principal",
    "type": "evolution",
    "credentials": {
      "apiToken": "B6D711FCDE4D4FD5936544120E713976",
      "baseUrl": "http://localhost:8080"
    },
    "isActive": true,
    "description": "Servidor Evolution principal para testes"
  }')

CREDENTIAL_ID=$(echo $CREATE_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)

if [ -z "$CREDENTIAL_ID" ]; then
  echo "⚠️  Credencial já existe ou erro ao criar. Response:"
  echo $CREATE_RESPONSE
else
  echo "✅ Credencial criada com sucesso!"
  echo "ID: $CREDENTIAL_ID"
fi
echo ""

# 3. Listar todas as credenciais
echo "3. Listando todas as credenciais..."
LIST_RESPONSE=$(curl -s -X GET "$BASE_URL/api/integration-credentials" \
  -H "Authorization: Bearer $TOKEN")

echo $LIST_RESPONSE | jq '.' 2>/dev/null || echo $LIST_RESPONSE
echo ""

# 4. Filtrar por tipo
echo "4. Filtrando credenciais do tipo 'evolution'..."
FILTER_RESPONSE=$(curl -s -X GET "$BASE_URL/api/integration-credentials?type=evolution" \
  -H "Authorization: Bearer $TOKEN")

echo $FILTER_RESPONSE | jq '.' 2>/dev/null || echo $FILTER_RESPONSE
echo ""

# 5. Buscar apenas ativas
echo "5. Buscando apenas credenciais ativas..."
ACTIVE_RESPONSE=$(curl -s -X GET "$BASE_URL/api/integration-credentials?activeOnly=true" \
  -H "Authorization: Bearer $TOKEN")

echo $ACTIVE_RESPONSE | jq '.' 2>/dev/null || echo $ACTIVE_RESPONSE
echo ""

# 6. Criar credencial Twilio
echo "6. Criando credencial Twilio..."
TWILIO_RESPONSE=$(curl -s -X POST "$BASE_URL/api/integration-credentials" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Twilio Production",
    "type": "twilio",
    "credentials": {
      "accountSid": "ACxxxxxxxxxxxxxxxxxxxxx",
      "authToken": "your_auth_token_here",
      "phoneNumber": "+15551234567"
    },
    "isActive": false,
    "description": "Conta Twilio de produção (desativada)"
  }')

echo $TWILIO_RESPONSE | jq '.' 2>/dev/null || echo $TWILIO_RESPONSE
echo ""

# 7. Listar todas novamente
echo "7. Listando todas as credenciais (Evolution + Twilio)..."
LIST_ALL_RESPONSE=$(curl -s -X GET "$BASE_URL/api/integration-credentials" \
  -H "Authorization: Bearer $TOKEN")

echo $LIST_ALL_RESPONSE | jq '.' 2>/dev/null || echo $LIST_ALL_RESPONSE
echo ""

# 8. Testar acesso sem ser admin (deve falhar)
echo "8. Testando acesso de usuário comum (deve falhar)..."

# Login como user comum
USER_LOGIN=$(curl -s -X POST "$BASE_URL/api/auth/signin" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "senha123"
  }')

USER_TOKEN=$(echo $USER_LOGIN | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

if [ ! -z "$USER_TOKEN" ]; then
  UNAUTHORIZED_RESPONSE=$(curl -s -X GET "$BASE_URL/api/integration-credentials" \
    -H "Authorization: Bearer $USER_TOKEN")
  
  echo $UNAUTHORIZED_RESPONSE | jq '.' 2>/dev/null || echo $UNAUTHORIZED_RESPONSE
else
  echo "⚠️  Usuário comum não existe para teste"
fi
echo ""

echo "================================"
echo "✅ Testes concluídos!"
echo "================================"
