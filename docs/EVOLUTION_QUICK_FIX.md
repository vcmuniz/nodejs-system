# 🚀 Evolution API - Quick Reference

## ⚡ Solução Rápida

```bash
# 1. Aplicar correção
./fix-evolution.sh

# OU manualmente:
docker-compose down
docker-compose up -d

# 2. Verificar status
docker logs clubfacts_evolution

# 3. Testar
curl http://localhost:8080/v1/health
```

## 🔧 O que foi corrigido

| Problema | Solução |
|----------|---------|
| `DATABASE_ENABLED` | → `EVOLUTION_DATABASE_ENABLED` |
| Indentação YAML quebrada | → Estrutura corrigida |
| Sem healthchecks | → Adicionados para MySQL, Zookeeper, Kafka |
| Sem EVOLUTION_API_HOST | → Adicionado: `0.0.0.0` |
| Sem EVOLUTION_STORE_PATH | → Adicionado: `./store` |
| Sem EVOLUTION_LOG_LEVEL | → Adicionado: `debug` |
| Kafka sem dependência de saúde | → Agora aguarda Zookeeper ser saudável |

## 📝 Arquivos Criados

- `EVOLUTION_API_SETUP.md` - Documentação completa
- `fix-evolution.sh` - Script de correção automática

## ✅ Status

**CORRIGIDO E PRONTO PARA USAR** ✅

