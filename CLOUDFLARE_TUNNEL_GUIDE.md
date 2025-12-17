# 🌐 Cloudflare Tunnel - Guia de Configuração

## 🔐 Opção 1: Nova Conta Cloudflare (Recomendado para novo projeto)

### Passo 1: Login com nova conta
```bash
./login-cloudflare.sh
```
Isso vai:
- Fazer backup do certificado antigo
- Abrir navegador para você fazer login com a **nova conta Cloudflare**

### Passo 2: Configurar o túnel
```bash
./setup-tunnel.sh
```
Isso cria o túnel `stackline-saas` e gera a configuração local.

### Passo 3: Configurar domínio
Edite `.cloudflared/config.yml` e substitua o domínio:
```yaml
ingress:
  - hostname: api.stackline.com.br  # SEU DOMÍNIO
    service: http://localhost:3000
```

### Passo 4: Configurar DNS
```bash
cloudflared tunnel route dns stackline-saas api.stackline.com.br
```

### Passo 5: Iniciar túnel
```bash
./start-tunnel.sh
```

---

## ⚡ Opção 2: Túnel Rápido (Temporário - sem login)

```bash
./start-tunnel.sh
```

Sem configuração prévia, gera URL temporária tipo `https://xxx.trycloudflare.com`

---

## 📂 Gerenciando Múltiplas Contas

Este projeto usa configuração **local** (`.cloudflared/config.yml`), então:

✅ **Conta antiga** → Outros projetos usam `~/.cloudflared/config.yml`  
✅ **Conta nova** → Este projeto usa `.cloudflared/config.yml`

Certificados ficam em `~/.cloudflared/cert.pem` (um por vez), mas túneis ficam separados.

---

## 🔄 Alternando entre contas

### Para usar conta antiga em outro projeto:
```bash
# Restaurar certificado antigo
cp ~/.cloudflared/cert.pem.backup-XXXXXXX ~/.cloudflared/cert.pem
```

### Para usar conta nova (Stackline):
```bash
./login-cloudflare.sh  # Faz login novamente
```

---

## 🛠️ Comandos Úteis

```bash
# Listar túneis da conta atual
cloudflared tunnel list

# Ver informações do túnel
cloudflared tunnel info stackline-saas

# Deletar túnel
cloudflared tunnel delete stackline-saas

# Rodar em background com tmux
tmux new -s tunnel
./start-tunnel.sh
# Ctrl+B depois D para desanexar
```

---

## 🎯 Resumo Rápido

**Para usar NOVA conta Cloudflare:**
```bash
./login-cloudflare.sh        # 1. Login
./setup-tunnel.sh            # 2. Criar túnel
# Edite .cloudflared/config.yml
cloudflared tunnel route dns stackline-saas SEU_DOMINIO.com
./start-tunnel.sh            # 3. Iniciar
```

**Para teste rápido (sem conta):**
```bash
./start-tunnel.sh
# Copia a URL que aparecer e atualiza .env
```
