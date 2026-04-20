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

# GET /api/prontuarios
STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
  -H "Authorization: Bearer $TOKEN_ADMIN" \
  "$BASE_URL/prontuarios")
verificar "GET /api/prontuarios (listar todos)" "$STATUS" 200 "admin"

# GET /api/prontuarios/{id}
STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
  -H "Authorization: Bearer $TOKEN_ADMIN" \
  "$BASE_URL/prontuarios/1")
verificar "GET /api/prontuarios/1 (buscar por ID)" "$STATUS" 200 "admin"

# GET /api/prontuarios/paciente/{idPaciente}
STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
  -H "Authorization: Bearer $TOKEN_ADMIN" \
  "$BASE_URL/prontuarios/paciente/1")
verificar "GET /api/prontuarios/paciente/1 (buscar por paciente)" "$STATUS" 200 "admin"

# ─────────────────────────────────────────────
echo -e "\n${AZUL}========================================${RESET}"
echo -e "${AZUL}  CENÁRIO 2 — SECRETARIA (deve ter acesso a tudo)${RESET}"
echo -e "${AZUL}========================================${RESET}"

TOKEN_SECR=$(login "fernanda.lima@dentus.com" "Senha@123")

if [ -z "$TOKEN_SECR" ]; then
  echo -e "${VERMELHO}  Falha ao autenticar como Secretaria. Verifique as credenciais.${RESET}"
  exit 1
fi
echo -e "  Token obtido: ${AMARELO}${TOKEN_SECR:0:40}...${RESET}\n"

# GET /api/prontuarios
STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
  -H "Authorization: Bearer $TOKEN_SECR" \
  "$BASE_URL/prontuarios")
verificar "GET /api/prontuarios (deve retornar 200)" "$STATUS" 200 "secr"

# GET /api/prontuarios/{id}
STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
  -H "Authorization: Bearer $TOKEN_SECR" \
  "$BASE_URL/prontuarios/1")
verificar "GET /api/prontuarios/1 (deve retornar 200)" "$STATUS" 200 "secr"

# GET /api/prontuarios/paciente/{idPaciente}
STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
  -H "Authorization: Bearer $TOKEN_SECR" \
  "$BASE_URL/prontuarios/paciente/1")
verificar "GET /api/prontuarios/paciente/1 (deve retornar 200)" "$STATUS" 200 "secr"

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
