#!/bin/bash
# Script para fazer login em nova conta Cloudflare (stackline)

echo "🔐 Fazendo login em nova conta Cloudflare para Stackline..."
echo ""
echo "⚠️  Isso criará um novo certificado para este projeto"
echo ""

# Fazer backup do cert atual
if [ -f ~/.cloudflared/cert.pem ]; then
    BACKUP_NAME="cert.pem.backup-$(date +%Y%m%d-%H%M%S)"
    cp ~/.cloudflared/cert.pem ~/.cloudflared/$BACKUP_NAME
    echo "✓ Backup do certificado anterior: ~/.cloudflared/$BACKUP_NAME"
    rm ~/.cloudflared/cert.pem
fi

# Login na nova conta
cloudflared tunnel login

echo ""
echo "✓ Login concluído!"
echo ""
echo "Próximos passos:"
echo "1. Criar túnel: cloudflared tunnel create stackline-saas"
echo "2. Configurar: ./setup-tunnel.sh"
