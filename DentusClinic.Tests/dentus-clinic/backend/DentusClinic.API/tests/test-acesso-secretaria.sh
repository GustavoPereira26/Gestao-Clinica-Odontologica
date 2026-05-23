#!/bin/bash

BASE_URL="http://localhost:5081"
PERMITIDOS=()
BLOQUEADOS=()

echo "================================================="
echo "  DentusClinic - Teste de Acesso: Secretária"
echo "================================================="

# LOGIN
echo ""
echo "[AUTH] POST /api/auth/login"
RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"fernanda.lima@dentus.com","senha":"Senha@123"}')
BODY=$(echo "$RESP" | head -n -1)
STATUS=$(echo "$RESP" | tail -n 1)

if [[ "$STATUS" -ne 200 ]]; then
  echo "ERRO no login (HTTP $STATUS). Encerrando."
  echo "$BODY" | python -m json.tool 2>/dev/null || echo "$BODY"
  exit 1
fi

TOKEN=$(echo "$BODY" | python -c "import sys,json; d=json.load(sys.stdin); print(d['dados']['token'])" 2>/dev/null)
if [ -z "$TOKEN" ]; then
  echo "ERRO FATAL: Token não capturado. Encerrando."
  exit 1
fi
echo "Login OK! Token capturado."
AUTH="-H \"Authorization: Bearer $TOKEN\""

# Função de teste
# $1 = método, $2 = rota, $3 = body (opcional)
testar() {
  local METHOD=$1
  local ROTA=$2
  local BODY_DATA=$3
  local LABEL="$METHOD $ROTA"

  if [ -n "$BODY_DATA" ]; then
    RESP=$(curl -s -w "\n%{http_code}" -X "$METHOD" "$BASE_URL$ROTA" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "$BODY_DATA")
  else
    RESP=$(curl -s -w "\n%{http_code}" -X "$METHOD" "$BASE_URL$ROTA" \
      -H "Authorization: Bearer $TOKEN")
  fi

  STATUS=$(echo "$RESP" | tail -n 1)

  if [[ "$STATUS" -eq 401 || "$STATUS" -eq 403 ]]; then
    echo "  [BLOQUEADO $STATUS] $LABEL"
    BLOQUEADOS+=("$LABEL")
  else
    echo "  [PERMITIDO $STATUS] $LABEL"
    PERMITIDOS+=("$LABEL")
  fi
}

# ─── FUNCIONÁRIOS ─────────────────────────────────────
echo ""
echo "--- /api/funcionarios ---"
testar GET    "/api/funcionarios"
testar GET    "/api/funcionarios/1"
testar POST   "/api/funcionarios"   '{"nome":"Teste","cpf":"00011122233","dataNascimento":"1990-01-01","cargo":"SECRETARIA","email":"x@x.com","senha":"Senha@123"}'
testar PUT    "/api/funcionarios/1" '{"nome":"Teste","cpf":"00011122233","dataNascimento":"1990-01-01","cargo":"SECRETARIA","email":"x@x.com","senha":"Senha@123"}'
testar DELETE "/api/funcionarios/1"

# ─── DENTISTAS ────────────────────────────────────────
echo ""
echo "--- /api/dentistas ---"
testar GET    "/api/dentistas"
testar GET    "/api/dentistas/1"
testar POST   "/api/dentistas"   '{"nome":"Dr Teste","cpf":"00011122244","cro":"CRO-SP00001","idEspecialidade":1,"email":"dr@x.com","senha":"Senha@123"}'
testar PUT    "/api/dentistas/1" '{"nome":"Dr Teste","cpf":"00011122244","cro":"CRO-SP00001","idEspecialidade":1,"email":"dr@x.com","senha":"Senha@123"}'
testar DELETE "/api/dentistas/1"

# ─── PACIENTES ────────────────────────────────────────
echo ""
echo "--- /api/pacientes ---"
testar GET    "/api/pacientes"
testar GET    "/api/pacientes/1"
testar POST   "/api/pacientes/cadastrar" '{"nome":"Pac Teste","cpf":"00011122255","telefone":"11900000001","email":"pac@x.com","dataNascimento":"2000-01-01","endereco":"Rua X"}'
testar PUT    "/api/pacientes/1"         '{"nome":"Pac Teste","cpf":"00011122255","telefone":"11900000001","email":"pac@x.com","dataNascimento":"2000-01-01","endereco":"Rua X"}'
testar PATCH  "/api/pacientes/1/inativar"

# ─── CONSULTAS ────────────────────────────────────────
echo ""
echo "--- /api/consultas ---"
testar GET    "/api/consultas"
testar GET    "/api/consultas/1"
testar POST   "/api/consultas"      '{"idDentista":1,"idPaciente":1,"dataConsulta":"2026-12-01","horaConsulta":"09:00:00","retorno":false}'
testar PUT    "/api/consultas/1"    '{"idDentista":1,"idPaciente":1,"dataConsulta":"2026-12-01","horaConsulta":"09:00:00","retorno":false}'
testar PUT    "/api/consultas/1/chegada"
testar PUT    "/api/consultas/1/cancelar"

# ─── ATENDIMENTOS ─────────────────────────────────────
echo ""
echo "--- /api/atendimentos ---"
testar GET    "/api/atendimentos"
testar GET    "/api/atendimentos/1"
testar POST   "/api/atendimentos"   '{"idConsulta":1,"descricao":"Teste","dataAtendimento":"2026-12-01"}'
testar PUT    "/api/atendimentos/1" '{"idConsulta":1,"descricao":"Teste","dataAtendimento":"2026-12-01"}'
testar DELETE "/api/atendimentos/1"

# ─── ESPECIALIDADES ───────────────────────────────────
echo ""
echo "--- /api/especialidades ---"
testar GET    "/api/especialidades"
testar GET    "/api/especialidades/1"
testar POST   "/api/especialidades"   '{"nome":"Teste"}'
testar PUT    "/api/especialidades/1" '{"nome":"Teste"}'
testar DELETE "/api/especialidades/1"

# ─── PLANOS ───────────────────────────────────────────
echo ""
echo "--- /api/planos ---"
testar GET    "/api/planos"
testar GET    "/api/planos/1"
testar POST   "/api/planos"   '{"idProntuario":1,"idServico":1,"status":"ATIVO"}'
testar PUT    "/api/planos/1" '{"idProntuario":1,"idServico":1,"status":"ATIVO"}'
testar DELETE "/api/planos/1"

# ─── PRONTUÁRIOS ──────────────────────────────────────
echo ""
echo "--- /api/prontuarios ---"
testar GET "/api/prontuarios"
testar GET "/api/prontuarios/1"
testar GET "/api/prontuarios/paciente/1"

# ─── SERVIÇOS ─────────────────────────────────────────
echo ""
echo "--- /api/servicos ---"
testar GET    "/api/servicos"
testar GET    "/api/servicos/1"
testar POST   "/api/servicos"   '{"nome":"Teste"}'
testar PUT    "/api/servicos/1" '{"nome":"Teste"}'
testar DELETE "/api/servicos/1"

# ─── RESUMO ───────────────────────────────────────────
echo ""
echo "================================================="
echo "  RESUMO FINAL"
echo "================================================="

echo ""
echo "ENDPOINTS COM ACESSO PERMITIDO (${#PERMITIDOS[@]}):"
for ep in "${PERMITIDOS[@]}"; do
  echo "  + $ep"
done

echo ""
echo "ENDPOINTS BLOQUEADOS (${#BLOQUEADOS[@]}):"
for ep in "${BLOQUEADOS[@]}"; do
  echo "  - $ep"
done

echo ""
echo "TOTAL: $((${#PERMITIDOS[@]} + ${#BLOQUEADOS[@]})) endpoints testados"
echo "================================================="
