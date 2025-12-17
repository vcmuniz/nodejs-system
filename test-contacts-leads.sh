#!/bin/bash

# Script de teste para o sistema de Contatos e Leads
# Execute: chmod +x test-contacts-leads.sh && ./test-contacts-leads.sh

BASE_URL="http://localhost:3000"
TOKEN="" # Adicione seu token aqui

echo "======================================"
echo "🧪 Testes - Sistema de Contatos e Leads"
echo "======================================"
echo ""

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

if [ -z "$TOKEN" ]; then
  echo -e "${YELLOW}⚠️  TOKEN não configurado. Configure a variável TOKEN no script.${NC}"
  echo ""
fi

# 1. Criar Lead Capture
echo -e "${GREEN}1. Criando página de captura...${NC}"
LEAD_CAPTURE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/lead-captures" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Landing Page E-book Marketing",
    "title": "Baixe nosso E-book Grátis",
    "description": "Aprenda tudo sobre marketing digital",
    "slug": "ebook-marketing-2025",
    "fields": ["name", "email", "phone", "company"],
    "requiredFields": ["name", "email"],
    "submitButtonText": "Baixar E-book Agora",
    "successMessage": "✅ Obrigado! Enviamos o e-book para seu email."
  }')

echo "$LEAD_CAPTURE_RESPONSE" | jq '.'
echo ""

# 2. Listar Lead Captures
echo -e "${GREEN}2. Listando páginas de captura...${NC}"
curl -s "$BASE_URL/api/lead-captures" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""

# 3. Capturar Lead (Público - sem token)
echo -e "${GREEN}3. Capturando lead via formulário público...${NC}"
curl -s -X POST "$BASE_URL/public/lead/ebook-marketing-2025" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Maria Santos",
    "email": "maria@example.com",
    "phone": "5521988888888",
    "company": "ABC Ltda"
  }' | jq '.'
echo ""

# 4. Criar Contato Manual
echo -e "${GREEN}4. Criando contato manualmente...${NC}"
curl -s -X POST "$BASE_URL/api/contacts" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "João Silva",
    "email": "joao@example.com",
    "phone": "5511999999999",
    "company": "Empresa XYZ",
    "position": "Gerente de Vendas",
    "tags": ["cliente", "vip"],
    "notes": "Cliente VIP interessado em produto Premium",
    "source": "manual"
  }' | jq '.'
echo ""

# 5. Listar todos os contatos
echo -e "${GREEN}5. Listando todos os contatos...${NC}"
curl -s "$BASE_URL/api/contacts" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""

# 6. Listar apenas leads
echo -e "${GREEN}6. Listando apenas leads...${NC}"
curl -s "$BASE_URL/api/contacts?isLead=true" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""

# 7. Filtrar por empresa
echo -e "${GREEN}7. Filtrando contatos por busca (ABC)...${NC}"
curl -s "$BASE_URL/api/contacts?search=ABC" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""

# 8. Converter lead em contato (você precisará pegar o ID do lead criado)
# echo -e "${GREEN}8. Convertendo lead em contato...${NC}"
# CONTACT_ID="cole-o-id-aqui"
# curl -s -X POST "$BASE_URL/api/contacts/$CONTACT_ID/convert" \
#   -H "Content-Type: application/json" \
#   -H "Authorization: Bearer $TOKEN" \
#   -d '{
#     "notes": "Cliente fechou contrato - Produto Premium"
#   }' | jq '.'
# echo ""

echo -e "${GREEN}✅ Testes concluídos!${NC}"
echo ""
echo -e "${YELLOW}📝 Notas:${NC}"
echo "  - Configure a variável TOKEN no início do script"
echo "  - Para testar conversão de lead, descomente a seção 8 e adicione um ID válido"
echo "  - Instale 'jq' para formatação JSON: sudo apt install jq"
echo ""
