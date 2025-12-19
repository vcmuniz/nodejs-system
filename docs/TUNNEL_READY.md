# ✅ Túnel Cloudflare FUNCIONANDO!

## 🎉 Status: ONLINE

- **URL Pública:** https://stackline-api.stackline.com.br
- **Túnel:** vortex-pay (b345d038-ceb1-4990-8794-d09b44142513)
- **Porta Local:** 3000
- **Config:** `.cloudflared/config-vortex.yml`

## ✅ Testes Realizados

```bash
curl https://stackline-api.stackline.com.br/health
# Resposta: OK
```

## 🚀 Como Usar

### Iniciar o túnel:
```bash
./start-tunnel.sh
```

### Manter em background (tmux):
```bash
tmux new -s tunnel
./start-tunnel.sh
# Ctrl+B depois D para desanexar

# Para reconectar:
tmux attach -t tunnel
```

## 📝 O Que Foi Resolvido

**Problema:** O DNS estava apontando para o túnel `vortex-pay` antigo, mas tentávamos usar o túnel `stackline-saas` novo.

**Solução:** Reutilizamos o túnel `vortex-pay` que já tinha o DNS configurado, apenas atualizamos sua configuração para apontar para a porta 3000 local.

## 🌐 Usar em Webhooks

```javascript
const webhookUrl = 'https://stackline-api.stackline.com.br/webhook/evolution';
```

## 🔧 Arquivos Importantes

- `.cloudflared/config-vortex.yml` - Configuração do túnel
- `start-tunnel.sh` - Script para iniciar
- `.env` - APP_DOMAIN atualizado

## ✅ Próximos Passos

1. ✅ Túnel funcionando
2. ✅ Aplicação acessível publicamente
3. ⏭️ Configurar webhooks da Evolution API
4. ⏭️ Testar integração completa
