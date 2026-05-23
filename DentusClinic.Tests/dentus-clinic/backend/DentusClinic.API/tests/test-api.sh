
# TESTE DE ENDPOINTS COM LOGIN ADMIN

#!/bin/bash

BASE_URL="http://localhost:5081"

echo "================================================="
echo "  DentusClinic API - Testes de Endpoint"
echo "================================================="

# LOGIN
echo ""
echo "[1] POST /api/auth/login"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@dentusclinic.com","senha":"Admin@123"}')

echo "$LOGIN_RESPONSE" | python -m json.tool 2>/dev/null || echo "$LOGIN_RESPONSE"

TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | sed 's/"token":"//;s/"//')

if [ -z "$TOKEN" ]; then
  echo ""
  echo "ERRO: Token não encontrado. Verifique as credenciais ou se a API está rodando."
  exit 1
fi

echo ""
echo "Token capturado com sucesso!"

# Função para fazer GET autenticado
get_endpoint() {
  local label=$1
  local path=$2

  echo ""
  echo "-------------------------------------------------"
  echo "GET $path"
  echo "-------------------------------------------------"
  curl -s -X GET "$BASE_URL$path" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" | python -m json.tool 2>/dev/null || echo "Sem resposta ou erro na rota."
}

get_endpoint "Funcionários"  "/api/funcionarios"
get_endpoint "Pacientes"     "/api/pacientes"
get_endpoint "Dentistas"     "/api/dentistas"
get_endpoint "Consultas"     "/api/consultas"
get_endpoint "Atendimentos"  "/api/atendimentos"

echo ""
echo "================================================="
echo "  Testes concluídos!"
echo "================================================="
