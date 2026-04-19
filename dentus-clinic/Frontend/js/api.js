// js/api.js

const API_BASE = 'https://localhost:7000/api';

// Função base reutilizável para todas as requisições
async function request(endpoint, method = 'GET', body = null) {
    const token = localStorage.getItem('token');

    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        },
        ...(body && { body: JSON.stringify(body) })
    };

    const response = await fetch(`${API_BASE}${endpoint}`, options);    // Renan tratar

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

async function apiAgendarConsulta(dados) {
    return request('/consultas', 'POST', dados);
}

// ── Pacientes ──
async function apiGetPacientes() {
    return request('/pacientes');
}

async function apiCadastrarPaciente(dados) {
    return request('/pacientes', 'POST', dados);
}