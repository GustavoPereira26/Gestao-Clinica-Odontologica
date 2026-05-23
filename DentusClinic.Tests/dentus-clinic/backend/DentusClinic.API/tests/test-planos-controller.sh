#!/bin/bash

BASE_URL="http://localhost:5081/api"

VERDE="\e[32m"
VERMELHO="\e[31m"
AMARELO="\e[33m"
AZUL="\e[34m"
RESET="\e[0m"

ADMIN_OK=0
ADMIN_FAIL=0
SECR_OK=0
SECR_FAIL=0

verificar() {
  local descricao="$1"
  local status="$2"
  local esperado="$3"
  local perfil="$4"

  if [ "$status" -eq "$esperado" ]; then
    echo -e "  ${VERDE}[PASS]${RESET} $descricao (HTTP $status)"
    [ "$perfil" = "admin" ] && ADMIN_OK=$((ADMIN_OK + 1)) || SECR_OK=$((SECR_OK + 1))
  else
    echo -e "  ${VERMELHO}[FAIL]${RESET} $descricao — esperado $esperado, obtido $status"
    [ "$perfil" = "admin" ] && ADMIN_FAIL=$((ADMIN_FAIL + 1)) || SECR_FAIL=$((SECR_FAIL + 1))
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

# GET /api/planos
STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
  -H "Authorization: Bearer $TOKEN_ADMIN" \
  "$BASE_URL/planos")
verificar "GET /api/planos (listar todos)" "$STATUS" 200 "admin"

# POST /api/planos
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/planos" \
  -H "Authorization: Bearer $TOKEN_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{
    "idProntuario": 1,
    "idServico": 1,
    "descricao": "Plano de tratamento inicial",
    "condicao": "Bom estado geral",
    "status": "Ativo",
    "observacao": "Paciente sem alergias"
  }')
STATUS=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)
verificar "POST /api/planos (cadastrar)" "$STATUS" 201 "admin"

NOVO_ID=$(echo "$BODY" | grep -o '"id":[0-9]*' | head -1 | sed 's/"id"://')
if [ -z "$NOVO_ID" ]; then NOVO_ID=1; fi

# GET /api/planos/{id}
STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
  -H "Authorization: Bearer $TOKEN_ADMIN" \
  "$BASE_URL/planos/$NOVO_ID")
verificar "GET /api/planos/$NOVO_ID (buscar por ID)" "$STATUS" 200 "admin"

# PUT /api/planos/{id}
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X PUT "$BASE_URL/planos/$NOVO_ID" \
  -H "Authorization: Bearer $TOKEN_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{
    "idProntuario": 1,
    "idServico": 2,
    "descricao": "Plano atualizado",
    "condicao": "Em acompanhamento",
    "status": "Ativo",
    "observacao": "Revisao agendada"
  }')
verificar "PUT /api/planos/$NOVO_ID (editar)" "$STATUS" 200 "admin"

# DELETE /api/planos/{id}
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$BASE_URL/planos/$NOVO_ID" \
  -H "Authorization: Bearer $TOKEN_ADMIN")
verificar "DELETE /api/planos/$NOVO_ID (remover)" "$STATUS" 200 "admin"

# ─────────────────────────────────────────────
echo -e "\n${AZUL}========================================${RESET}"
echo -e "${AZUL}  CENÁRIO 2 — SECRETARIA (acesso parcial)${RESET}"
echo -e "${AZUL}========================================${RESET}"

TOKEN_SECR=$(login "fernanda.lima@dentus.com" "Senha@123")

if [ -z "$TOKEN_SECR" ]; then
  echo -e "${VERMELHO}  Falha ao autenticar como Secretaria. Verifique as credenciais.${RESET}"
  exit 1
fi
echo -e "  Token obtido: ${AMARELO}${TOKEN_SECR:0:40}...${RESET}\n"

# GET /api/planos
STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
  -H "Authorization: Bearer $TOKEN_SECR" \
  "$BASE_URL/planos")
verificar "GET /api/planos (deve retornar 200)" "$STATUS" 200 "secr"

# POST /api/planos
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/planos" \
  -H "Authorization: Bearer $TOKEN_SECR" \
  -H "Content-Type: application/json" \
  -d '{
    "idProntuario": 2,
    "idServico": 3,
    "descricao": "Plano secretaria",
    "condicao": "Estavel",
    "status": "Ativo",
    "observacao": "Criado pela secretaria"
  }')
STATUS=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)
verificar "POST /api/planos (deve retornar 201)" "$STATUS" 201 "secr"

NOVO_ID_SECR=$(echo "$BODY" | grep -o '"id":[0-9]*' | head -1 | sed 's/"id"://')
if [ -z "$NOVO_ID_SECR" ]; then NOVO_ID_SECR=1; fi

# GET /api/planos/{id}
STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
  -H "Authorization: Bearer $TOKEN_SECR" \
  "$BASE_URL/planos/$NOVO_ID_SECR")
verificar "GET /api/planos/$NOVO_ID_SECR (deve retornar 200)" "$STATUS" 200 "secr"

# PUT /api/planos/{id}
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X PUT "$BASE_URL/planos/$NOVO_ID_SECR" \
  -H "Authorization: Bearer $TOKEN_SECR" \
  -H "Content-Type: application/json" \
  -d '{
    "idProntuario": 2,
    "idServico": 3,
    "descricao": "Plano secretaria atualizado",
    "condicao": "Estavel",
    "status": "Ativo",
    "observacao": "Atualizado pela secretaria"
  }')
verificar "PUT /api/planos/$NOVO_ID_SECR (deve retornar 200)" "$STATUS" 200 "secr"

# DELETE /api/planos/{id}
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$BASE_URL/planos/$NOVO_ID_SECR" \
  -H "Authorization: Bearer $TOKEN_SECR")
verificar "DELETE /api/planos/$NOVO_ID_SECR (deve retornar 403)" "$STATUS" 403 "secr"

# ─────────────────────────────────────────────
echo -e "\n${AZUL}========================================${RESET}"
echo -e "${AZUL}  RESUMO FINAL${RESET}"
echo -e "${AZUL}========================================${RESET}"

echo -e "\n  ${AMARELO}Administrador:${RESET}"
echo -e "    ${VERDE}Passou: $ADMIN_OK${RESET} | ${VERMELHO}Falhou: $ADMIN_FAIL${RESET}"

echo -e "\n  ${AMARELO}Secretaria:${RESET}"
echo -e "    ${VERDE}Passou: $SECR_OK${RESET} | ${VERMELHO}Falhou: $SECR_FAIL${RESET}"

TOTAL_FAIL=$((ADMIN_FAIL + SECR_FAIL))
echo ""
if [ "$TOTAL_FAIL" -eq 0 ]; then
  echo -e "  ${VERDE}Todos os testes passaram!${RESET}"
else
  echo -e "  ${VERMELHO}$TOTAL_FAIL teste(s) falharam.${RESET}"
fi
echo ""
