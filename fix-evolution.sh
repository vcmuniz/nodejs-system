#!/bin/bash

# Evolution API - Quick Fix Script
# Este script resolve o erro "Database provider invalid"

echo "🔧 Evolution API - Corrigindo erro de Database Provider"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Passo 1: Verificar se docker está disponível
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não está instalado"
    exit 1
fi

echo "✅ Docker encontrado"
echo ""

# Passo 2: Parar containers
echo "📛 Parando containers..."
docker-compose down

echo ""
echo "✅ Containers parados"
echo ""

# Passo 3: Opcionalmente remover volumes
read -p "Limpar dados de Evolution? (s/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Ss]$ ]]; then
    echo "🗑️ Removendo volumes..."
    docker volume rm clubfacts_evolution 2>/dev/null || true
    echo "✅ Volumes removidos"
    echo ""
fi

# Passo 4: Iniciar containers
echo "🚀 Iniciando containers com configuração corrigida..."
docker-compose up -d

echo ""
echo "✅ Containers iniciados"
echo ""

# Passo 5: Aguardar Evolution ficar pronto
echo "⏳ Aguardando Evolution inicializar (máx 30 segundos)..."
for i in {1..30}; do
    if docker logs clubfacts_evolution 2>&1 | grep -q "running on"; then
        echo ""
        echo "✅ Evolution API está rodando!"
        break
    fi
    echo -n "."
    sleep 1
done

echo ""
echo ""

# Passo 6: Mostrar logs relevantes
echo "📋 Últimas linhas do log:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
docker logs clubfacts_evolution 2>&1 | tail -10
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Passo 7: Verificar status dos containers
echo "📊 Status dos containers:"
docker-compose ps
echo ""

# Passo 8: Testar endpoint
echo "🧪 Testando endpoint Evolution..."
if curl -s http://localhost:8080/v1/health > /dev/null 2>&1; then
    echo "✅ Evolution API respondendo corretamente"
    echo ""
    echo "Response:"
    curl -s http://localhost:8080/v1/health | head -20
else
    echo "⚠️ Evolution API ainda não está respondendo"
    echo "Aguarde alguns segundos e tente novamente:"
    echo "curl http://localhost:8080/v1/health"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Correção aplicada com sucesso!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📚 Para mais informações, consulte: EVOLUTION_API_SETUP.md"
echo ""
