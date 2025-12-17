#!/bin/bash
# Script para iniciar túnel Cloudflare para a aplicação

echo "🚀 Iniciando túnel Cloudflare..."
echo ""

# Usar o túnel vortex-pay que já está com DNS configurado
if [ -f .cloudflared/config-vortex.yml ]; then
    echo "📁 Usando túnel vortex-pay (DNS já configurado)"
    echo "🌐 URL: https://stackline-api.stackline.com.br"
    echo ""
    cloudflared tunnel --config .cloudflared/config-vortex.yml run vortex-pay
else
    echo "⚡ Modo rápido - túnel temporário"
    echo "📍 Porta local: 3000"
    echo "🌐 Você receberá uma URL pública do tipo: https://xxx.trycloudflare.com"
    echo ""
    cloudflared tunnel --url http://localhost:3000
fi
