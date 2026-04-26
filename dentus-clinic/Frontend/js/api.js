const API_BASE = '/api';

async function request(endpoint, method = 'GET', body = null) {
    const token = getToken();

    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        },
        ...(body && { body: JSON.stringify(body) })
    };

    let response;
    try {
        response = await fetch(`${API_BASE}${endpoint}`, options);
    } catch {
        throw new Error('Não foi possível conectar ao servidor. Tente novamente.');
    }

    if (response.status === 401) {
        if (endpoint === '/auth/login') {
            throw new Error('E-mail ou senha inválidos.');
        }
        logout();
        return;
    }

    if (response.status === 403) {
        throw new Error('Você não tem permissão para realizar esta ação.');
    }

    const text = await response.text();
    const data = text ? JSON.parse(text) : null;

    if (!response.ok) {
        if (Array.isArray(data?.error)) {
            throw new Error(data.error.join('\n'));
        }
        throw new Error(data?.mensagem || data?.message || 'Ocorreu um erro. Tente novamente.');
    }

    return data;
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

async function apiInativarPaciente(id) {
    return request(`/pacientes/${id}/inativar`, 'PATCH');
}

// ── Funcionários ──
async function apiGetFuncionarios() {
    return request('/funcionarios');
}

async function apiCadastrarFuncionario(dados) {
    return request('/funcionarios', 'POST', dados);
}

async function apiAtualizarFuncionario(id, dados) {
    return request(`/funcionarios/${id}`, 'PATCH', dados);
}

// ── Dentistas ──
async function apiGetDentistas() {
    return request('/dentistas');
}

async function apiCadastrarDentista(dados) {
    return request('/dentistas', 'POST', dados);
}

async function apiAtualizarDentista(id, dados) {
    return request(`/dentistas/${id}`, 'PATCH', dados);
}

// ── Especialidades ──
async function apiGetEspecialidades() {
    return request('/especialidades');
}