#!/bin/bash

BASE_URL="http://localhost:5081"

echo "================================================="
echo "  DentusClinic - Cadastrar Recepcionista"
echo "================================================="

# LOGIN
echo ""
echo "[1] POST /api/auth/login"
RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@dentusclinic.com","senha":"Admin@123"}')
BODY=$(echo "$RESP" | head -n -1)
STATUS=$(echo "$RESP" | tail -n 1)

if [[ "$STATUS" -ne 200 ]]; then
  echo "ERRO no login (HTTP $STATUS):"
  echo "$BODY" | python -m json.tool 2>/dev/null || echo "$BODY"
  exit 1
fi

TOKEN=$(echo "$BODY" | python -c "import sys,json; d=json.load(sys.stdin); print(d['dados']['token'])" 2>/dev/null)
if [ -z "$TOKEN" ]; then
  echo "ERRO FATAL: Token não capturado. Encerrando."
  exit 1
fi
echo "Login realizado com sucesso! Token capturado."

# CADASTRAR RECEPCIONISTA
echo ""
echo "[2] POST /api/funcionarios"
RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/funcionarios" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "nome": "Fernanda Lima",
    "cpf": "55566677788",
    "dataNascimento": "1998-04-10",
    "telefone": "11944440002",
    "cargo": "Secretaria",
    "email": "fernanda.lima@dentus.com",
    "senha": "Senha@123"
  }')
BODY=$(echo "$RESP" | head -n -1)
STATUS=$(echo "$RESP" | tail -n 1)

echo ""
echo "-------------------------------------------------"
echo "POST /api/funcionarios | HTTP $STATUS"
echo "-------------------------------------------------"
echo "$BODY" | python -m json.tool 2>/dev/null || echo "$BODY"

if [[ "$STATUS" -ge 200 && "$STATUS" -lt 300 ]]; then
  echo ""
  echo ">> Recepcionista cadastrada com sucesso!"
else
  echo ""
  echo ">> FALHOU"
fi

echo "================================================="
