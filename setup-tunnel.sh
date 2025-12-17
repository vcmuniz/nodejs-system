#!/bin/bash
# Script para configurar túnel Cloudflare com nova conta

echo "⚙️  Configurando túnel Cloudflare..."
echo ""

# Verificar se existe certificado
if [ ! -f ~/.cloudflared/cert.pem ]; then
    echo "❌ Certificado não encontrado!"
    echo "Execute primeiro: ./login-cloudflare.sh"
    exit 1
fi

# Criar o túnel
echo "Criando túnel 'stackline-saas'..."
TUNNEL_OUTPUT=$(cloudflared tunnel create stackline-saas 2>&1)

# Extrair o TUNNEL_ID
TUNNEL_ID=$(echo "$TUNNEL_OUTPUT" | grep -oP '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}' | head -1)

if [ -z "$TUNNEL_ID" ]; then
    echo "ℹ️  Túnel pode já existir. Listando túneis existentes:"
    cloudflared tunnel list
    echo ""
    read -p "Digite o TUNNEL_ID que deseja usar: " TUNNEL_ID
fi

echo ""
echo "✓ Tunnel ID: $TUNNEL_ID"
echo ""

# Criar arquivo de configuração LOCAL (específico do projeto)
cat > .cloudflared/config.yml << EOF
tunnel: $TUNNEL_ID
credentials-file: $HOME/.cloudflared/$TUNNEL_ID.json

ingress:
  - hostname: stackline-api.seudominio.com
    service: http://localhost:3000
  - service: http_status:404
EOF

echo "✓ Configuração criada em .cloudflared/config.yml"
echo ""
echo "📝 Edite o arquivo e substitua 'stackline-api.seudominio.com' pelo seu domínio real"
echo ""
echo "Depois execute:"
echo "  cloudflared tunnel route dns stackline-saas stackline-api.seudominio.com"
echo "  cloudflared tunnel --config .cloudflared/config.yml run stackline-saas"
