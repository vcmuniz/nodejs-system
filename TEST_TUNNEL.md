# ✅ Túnel Cloudflare Configurado!

## 📡 Informações do Túnel

- **URL Pública:** https://stackline-api.stackline.com.br
- **Porta Local:** 3000
- **Status:** ✅ Ativo (4 conexões registradas)

## 🧪 Testes

### 1. Testar se o túnel está acessível:
```bash
curl https://stackline-api.stackline.com.br
```

### 2. Testar endpoint específico (quando app estiver rodando):
```bash
# Health check
curl https://stackline-api.stackline.com.br/health

# Swagger docs
curl https://stackline-api.stackline.com.br/api-docs
```

## 🚀 Iniciar a Aplicação

Em outro terminal:
```bash
npm run dev
```

## 📝 Configuração Atual

- ✅ Túnel: `stackline-saas` (ID: 7657fe79-ffe6-47d5-a3ea-9d82c3cd603e)
- ✅ DNS: stackline-api.stackline.com.br → Cloudflare Tunnel
- ✅ Config: `.cloudflared/config.yml`
- ✅ APP_DOMAIN no `.env` atualizado

## 🔧 Gerenciar Túnel

```bash
# Para o túnel (Ctrl+C no terminal onde está rodando)

# Reiniciar
./start-tunnel.sh

# Ver logs
cloudflared tunnel info stackline-saas

# Rodar em background (tmux)
tmux new -s tunnel
./start-tunnel.sh
# Ctrl+B depois D para desanexar
```

## 🌐 Usar em Webhooks

Use esta URL como base para webhooks:
```javascript
const webhookUrl = `https://stackline-api.stackline.com.br/webhook/evolution`;
```

## 💡 Próximos Passos

1. ✅ Túnel configurado
2. ⏭️ Iniciar aplicação: `npm run dev`
3. ⏭️ Testar: `curl https://stackline-api.stackline.com.br/health`
4. ⏭️ Configurar webhooks Evolution API com a URL pública
