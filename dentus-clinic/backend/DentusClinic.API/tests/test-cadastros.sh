
# TESTE DE CRUD COM LOGIN ADMIN


#!/bin/bash

BASE_URL="http://localhost:5081"
PASS=0
FAIL=0

echo "================================================="
echo "  DentusClinic API - Testes de CRUD Completo"
echo "================================================="

# Função para exibir resultado formatado
exibir() {
  local label=$1
  local status=$2
  local body=$3

  echo ""
  echo "-------------------------------------------------"
  echo "$label | HTTP $status"
  echo "-------------------------------------------------"
  echo "$body" | python -m json.tool 2>/dev/null || echo "$body"

  if [[ "$status" -ge 200 && "$status" -lt 300 ]]; then
    echo ">> PASSOU"
    PASS=$((PASS + 1))
  else
    echo ">> FALHOU"
    FAIL=$((FAIL + 1))
  fi
}

# Extrai campo do JSON
extrair() {
  echo "$1" | python -c "import sys,json; d=json.load(sys.stdin); print(d$2)" 2>/dev/null
}

# ─── LOGIN ────────────────────────────────────────────
echo ""
echo "[AUTH] POST /api/auth/login"
RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@dentusclinic.com","senha":"Admin@123"}')
BODY=$(echo "$RESP" | head -n -1)
STATUS=$(echo "$RESP" | tail -n 1)
exibir "POST /api/auth/login" "$STATUS" "$BODY"

TOKEN=$(extrair "$BODY" "['dados']['token']")
if [ -z "$TOKEN" ]; then
  echo "ERRO FATAL: Token não capturado. Encerrando."
  exit 1
fi
echo "Token capturado!"
AUTH="Authorization: Bearer $TOKEN"

# ─── FUNCIONÁRIOS ─────────────────────────────────────
echo ""
echo "========== FUNCIONÁRIOS ========================="

RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/funcionarios" \
  -H "Content-Type: application/json" -H "$AUTH" \
  -d '{
    "nome": "Carlos Teste",
    "cpf": "11122233344",
    "dataNascimento": "1990-06-15",
    "telefone": "11999990001",
    "cargo": "SECRETARIA",
    "email": "carlos.teste@dentus.com",
    "senha": "Senha@123"
  }')
BODY=$(echo "$RESP" | head -n -1)
STATUS=$(echo "$RESP" | tail -n 1)
exibir "POST /api/funcionarios" "$STATUS" "$BODY"
FUNC_ID=$(extrair "$BODY" "['dados']['id']")
echo "ID capturado: $FUNC_ID"

RESP=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/funcionarios/$FUNC_ID" \
  -H "$AUTH")
BODY=$(echo "$RESP" | head -n -1)
STATUS=$(echo "$RESP" | tail -n 1)
exibir "GET /api/funcionarios/$FUNC_ID" "$STATUS" "$BODY"

RESP=$(curl -s -w "\n%{http_code}" -X PUT "$BASE_URL/api/funcionarios/$FUNC_ID" \
  -H "Content-Type: application/json" -H "$AUTH" \
  -d '{
    "nome": "Carlos Editado",
    "cpf": "11122233344",
    "dataNascimento": "1990-06-15",
    "telefone": "11999990001",
    "cargo": "SECRETARIA",
    "email": "carlos.teste@dentus.com",
    "senha": "Senha@123"
  }')
BODY=$(echo "$RESP" | head -n -1)
STATUS=$(echo "$RESP" | tail -n 1)
exibir "PUT /api/funcionarios/$FUNC_ID" "$STATUS" "$BODY"

RESP=$(curl -s -w "\n%{http_code}" -X DELETE "$BASE_URL/api/funcionarios/$FUNC_ID" \
  -H "$AUTH")
BODY=$(echo "$RESP" | head -n -1)
STATUS=$(echo "$RESP" | tail -n 1)
exibir "DELETE /api/funcionarios/$FUNC_ID" "$STATUS" "$BODY"

# ─── DENTISTAS ────────────────────────────────────────
echo ""
echo "========== DENTISTAS ============================"

RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/dentistas" \
  -H "Content-Type: application/json" -H "$AUTH" \
  -d '{
    "nome": "Dra Ana Teste",
    "cpf": "22233344455",
    "cro": "CRO-SP99999",
    "telefone": "11988880001",
    "idEspecialidade": 1,
    "email": "ana.teste@dentus.com",
    "senha": "Senha@123"
  }')
BODY=$(echo "$RESP" | head -n -1)
STATUS=$(echo "$RESP" | tail -n 1)
exibir "POST /api/dentistas" "$STATUS" "$BODY"
DENT_ID=$(extrair "$BODY" "['dados']['id']")
echo "ID capturado: $DENT_ID"

RESP=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/dentistas/$DENT_ID" \
  -H "$AUTH")
BODY=$(echo "$RESP" | head -n -1)
STATUS=$(echo "$RESP" | tail -n 1)
exibir "GET /api/dentistas/$DENT_ID" "$STATUS" "$BODY"

RESP=$(curl -s -w "\n%{http_code}" -X PUT "$BASE_URL/api/dentistas/$DENT_ID" \
  -H "Content-Type: application/json" -H "$AUTH" \
  -d '{
    "nome": "Dra Ana Editada",
    "cpf": "22233344455",
    "cro": "CRO-SP99999",
    "telefone": "11988880001",
    "idEspecialidade": 1,
    "email": "ana.teste@dentus.com",
    "senha": "Senha@123"
  }')
BODY=$(echo "$RESP" | head -n -1)
STATUS=$(echo "$RESP" | tail -n 1)
exibir "PUT /api/dentistas/$DENT_ID" "$STATUS" "$BODY"

RESP=$(curl -s -w "\n%{http_code}" -X DELETE "$BASE_URL/api/dentistas/$DENT_ID" \
  -H "$AUTH")
BODY=$(echo "$RESP" | head -n -1)
STATUS=$(echo "$RESP" | tail -n 1)
exibir "DELETE /api/dentistas/$DENT_ID" "$STATUS" "$BODY"

# ─── PACIENTES ────────────────────────────────────────
echo ""
echo "========== PACIENTES ============================"

RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/pacientes/cadastrar" \
  -H "Content-Type: application/json" -H "$AUTH" \
  -d '{
    "nome": "Maria Teste",
    "cpf": "99988877766",
    "telefone": "11977770001",
    "email": "maria.novo@email.com",
    "dataNascimento": "1995-03-20",
    "endereco": "Rua Teste, 123, Sao Paulo"
  }')
BODY=$(echo "$RESP" | head -n -1)
STATUS=$(echo "$RESP" | tail -n 1)
exibir "POST /api/pacientes/cadastrar" "$STATUS" "$BODY"
PAC_ID=$(extrair "$BODY" "['dados']['id']")
echo "ID capturado: $PAC_ID"

RESP=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/pacientes/$PAC_ID" \
  -H "$AUTH")
BODY=$(echo "$RESP" | head -n -1)
STATUS=$(echo "$RESP" | tail -n 1)
exibir "GET /api/pacientes/$PAC_ID" "$STATUS" "$BODY"

RESP=$(curl -s -w "\n%{http_code}" -X PUT "$BASE_URL/api/pacientes/$PAC_ID" \
  -H "Content-Type: application/json" -H "$AUTH" \
  -d '{
    "nome": "Maria Editada",
    "cpf": "99988877766",
    "telefone": "11977770001",
    "email": "maria.novo@email.com",
    "dataNascimento": "1995-03-20",
    "endereco": "Rua Editada, 456, Sao Paulo"
  }')
BODY=$(echo "$RESP" | head -n -1)
STATUS=$(echo "$RESP" | tail -n 1)
exibir "PUT /api/pacientes/$PAC_ID" "$STATUS" "$BODY"

RESP=$(curl -s -w "\n%{http_code}" -X PATCH "$BASE_URL/api/pacientes/$PAC_ID/inativar" \
  -H "$AUTH")
BODY=$(echo "$RESP" | head -n -1)
STATUS=$(echo "$RESP" | tail -n 1)
exibir "PATCH /api/pacientes/$PAC_ID/inativar" "$STATUS" "$BODY"

# ─── RESUMO ───────────────────────────────────────────
echo ""
echo "================================================="
echo "  RESUMO FINAL"
echo "================================================="
echo "  PASSOU : $PASS"
echo "  FALHOU : $FAIL"
echo "  TOTAL  : $((PASS + FAIL))"
echo "================================================="
