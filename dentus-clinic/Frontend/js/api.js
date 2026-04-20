// js/api.js

const API_BASE = 'https://localhost:7000/api'; // ⚠️ ajuste a porta

// ── Função base reutilizável ──
async function request(endpoint, method = 'GET', body = null) {

    // 🔴 MUDANÇA: usa getToken() do auth.js em vez de localStorage direto
    const token = getToken();

    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        },
        ...(body && { body: JSON.stringify(body) })
    };

    const response = await fetch(`${API_BASE}${endpoint}`, options);

    // 🔴 NOVO: token expirado — redireciona para login
    if (response.status === 401) {
        logout();
        return;
    }

    // 🔴 NOVO: sem permissão para essa rota
    if (response.status === 403) {
        alert('Você não tem permissão para acessar este recurso.');
        return;
    }

    if (!response.ok) {
        const erro = await response.json();
        throw new Error(erro.message || 'Erro na requisição');
    }

    return response.json();
}

// ── Autenticação ──
async function apiLogin(email, senha) {
    return request('/auth/login', 'POST', { email, senha });
}

// ── Consultas ──
async function apiGetConsultas() {
    return request('/consultas');
}

// 🔴 NOVA: consultas do dia (usada no dashboard da secretaria)
async function apiGetConsultasDia() {
    return request('/consultas/hoje');
}

async function apiAgendarConsulta(dados) {
    return request('/consultas', 'POST', dados);
}

// 🔴 NOVA: atualizar status de uma consulta (setas do dashboard)
async function apiAtualizarStatusConsulta(id, status) {
    return request(`/consultas/${id}/status`, 'PATCH', { status });
}

// ── Pacientes ──
async function apiGetPacientes() {
    return request('/pacientes');
}

async function apiCadastrarPaciente(dados) {
    return request('/pacientes', 'POST', dados);
}