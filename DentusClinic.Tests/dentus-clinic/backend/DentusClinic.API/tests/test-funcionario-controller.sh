#!/bin/bash

BASE_URL="http://localhost:5081/api"

VERDE="\e[32m"
VERMELHO="\e[31m"
AMARELO="\e[33m"
AZUL="\e[34m"
RESET="\e[0m"

# Contadores por perfil
ADMIN_OK=0
ADMIN_FAIL=0
RECEP_OK=0
RECEP_FAIL=0

verificar() {
  local descricao="$1"
  local status="$2"
  local esperado="$3"
  local perfil="$4"

  if [ "$status" -eq "$esperado" ]; then
    echo -e "  ${VERDE}[PASS]${RESET} $descricao (HTTP $status)"
    [ "$perfil" = "admin" ] && ADMIN_OK=$((ADMIN_OK + 1)) || RECEP_OK=$((RECEP_OK + 1))
  else
    echo -e "  ${VERMELHO}[FAIL]${RESET} $descricao — esperado $esperado, obtido $status"
    [ "$perfil" = "admin" ] && ADMIN_FAIL=$((ADMIN_FAIL + 1)) || RECEP_FAIL=$((RECEP_FAIL + 1))
  fi
}

login() {
  local email="$1"
  local senha="$2"
  curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$email\",\"senha\":\"$senha\"}" \
    | grep -o '"token":"[^"]*"' | sed 's/"token":"//;s/"//'
}

# ─────────────────────────────────────────────
echo -e "\n${AZUL}========================================${RESET}"
echo -e "${AZUL}  CENÁRIO 1 — ADMINISTRADOR${RESET}"
echo -e "${AZUL}========================================${RESET}"

TOKEN_ADMIN=$(login "admin@dentusclinic.com" "Admin@123")

if [ -z "$TOKEN_ADMIN" ]; then
  echo -e "${VERMELHO}  Falha ao autenticar como Admin. Verifique se a API está rodando.${RESET}"
  exit 1
fi
echo -e "  Token obtido: ${AMARELO}${TOKEN_ADMIN:0:40}...${RESET}\n"

# GET /api/funcionarios
STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
  -H "Authorization: Bearer $TOKEN_ADMIN" \
  "$BASE_URL/funcionarios")
verificar "GET /api/funcionarios (listar todos)" "$STATUS" 200 "admin"

# POST /api/funcionarios
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/funcionarios" \
  -H "Authorization: Bearer $TOKEN_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Carlos Teste",
    "cpf": "12345678901",
    "dataNascimento": "1990-05-15",
    "telefone": "11999990000",
    "cargo": "SECRETARIA",
    "email": "carlos.teste@dentus.com",
    "senha": "Senha@123"
  }')
STATUS=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)
verificar "POST /api/funcionarios (cadastrar)" "$STATUS" 201 "admin"

# Extrai o ID criado para usar no GET, PUT e DELETE
NOVO_ID=$(echo "$BODY" | grep -o '"id":[0-9]*' | head -1 | sed 's/"id"://')
if [ -z "$NOVO_ID" ]; then NOVO_ID=1; fi

# GET /api/funcionarios/{id}
STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
  -H "Authorization: Bearer $TOKEN_ADMIN" \
  "$BASE_URL/funcionarios/$NOVO_ID")
verificar "GET /api/funcionarios/$NOVO_ID (buscar por ID)" "$STATUS" 200 "admin"

# PUT /api/funcionarios/{id}
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X PUT "$BASE_URL/funcionarios/$NOVO_ID" \
  -H "Authorization: Bearer $TOKEN_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Carlos Atualizado",
    "cpf": "12345678901",
    "dataNascimento": "1990-05-15",
    "telefone": "11988880000",
    "cargo": "SECRETARIA",
    "email": "carlos.atualizado@dentus.com",
    "senha": "Senha@123"
  }')
verificar "PUT /api/funcionarios/$NOVO_ID (editar)" "$STATUS" 200 "admin"

# DELETE /api/funcionarios/{id}
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$BASE_URL/funcionarios/$NOVO_ID" \
  -H "Authorization: Bearer $TOKEN_ADMIN")
verificar "DELETE /api/funcionarios/$NOVO_ID (remover)" "$STATUS" 200 "admin"

# ─────────────────────────────────────────────
echo -e "\n${AZUL}========================================${RESET}"
echo -e "${AZUL}  CENÁRIO 2 — RECEPCIONISTA (deve ser bloqueada)${RESET}"
echo -e "${AZUL}========================================${RESET}"

TOKEN_RECEP=$(login "fernanda.lima@dentus.com" "Senha@123")

if [ -z "$TOKEN_RECEP" ]; then
  echo -e "${VERMELHO}  Falha ao autenticar como Recepcionista. Verifique as credenciais.${RESET}"
  exit 1
fi
echo -e "  Token obtido: ${AMARELO}${TOKEN_RECEP:0:40}...${RESET}\n"

# GET /api/funcionarios
STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
  -H "Authorization: Bearer $TOKEN_RECEP" \
  "$BASE_URL/funcionarios")
verificar "GET /api/funcionarios (deve retornar 403)" "$STATUS" 403 "recep"

# GET /api/funcionarios/1
STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
  -H "Authorization: Bearer $TOKEN_RECEP" \
  "$BASE_URL/funcionarios/1")
verificar "GET /api/funcionarios/1 (deve retornar 403)" "$STATUS" 403 "recep"

# POST /api/funcionarios
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/funcionarios" \
  -H "Authorization: Bearer $TOKEN_RECEP" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Tentativa Invalida",
    "cpf": "99988877766",
    "dataNascimento": "1995-01-01",
    "telefone": "11900000000",
    "cargo": "SECRETARIA",
    "email": "invalido@dentus.com",
    "senha": "Senha@123"
  }')
verificar "POST /api/funcionarios (deve retornar 403)" "$STATUS" 403 "recep"

# PUT /api/funcionarios/1
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X PUT "$BASE_URL/funcionarios/1" \
  -H "Authorization: Bearer $TOKEN_RECEP" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Tentativa Edicao",
    "cargo": "SECRETARIA"
  }')
verificar "PUT /api/funcionarios/1 (deve retornar 403)" "$STATUS" 403 "recep"

# DELETE /api/funcionarios/1
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$BASE_URL/funcionarios/1" \
  -H "Authorization: Bearer $TOKEN_RECEP")
verificar "DELETE /api/funcionarios/1 (deve retornar 403)" "$STATUS" 403 "recep"

# ─────────────────────────────────────────────
echo -e "\n${AZUL}========================================${RESET}"
echo -e "${AZUL}  RESUMO FINAL${RESET}"
echo -e "${AZUL}========================================${RESET}"

echo -e "\n  ${AMARELO}Administrador:${RESET}"
echo -e "    ${VERDE}Passou: $ADMIN_OK${RESET} | ${VERMELHO}Falhou: $ADMIN_FAIL${RESET}"

echo -e "\n  ${AMARELO}Recepcionista:${RESET}"
echo -e "    ${VERDE}Passou: $RECEP_OK${RESET} | ${VERMELHO}Falhou: $RECEP_FAIL${RESET}"

TOTAL_FAIL=$((ADMIN_FAIL + RECEP_FAIL))
echo ""
if [ "$TOTAL_FAIL" -eq 0 ]; then
  echo -e "  ${VERDE}Todos os testes passaram!${RESET}"
else
  echo -e "  ${VERMELHO}$TOTAL_FAIL teste(s) falharam.${RESET}"
fi
echo ""
