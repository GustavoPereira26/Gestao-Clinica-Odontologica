// js/auth.js

// ── Salva dados da sessão após login ──
function salvarSessao(data) {
    sessionStorage.setItem('token',      data.token);
    sessionStorage.setItem('perfil',     data.tipoAcesso.toLowerCase());
    sessionStorage.setItem('nome',       data.nome);
    sessionStorage.setItem('expiracao',  data.expiracao);
}

// ── Recupera o token (usado pelo api.js) ──
function getToken() {
    return sessionStorage.getItem('token');
}

// ── Verifica se o token ainda é válido pela data ──
function tokenValido() {
    const token     = getToken();
    const expiracao = sessionStorage.getItem('expiracao');

    if (!token || !expiracao) return false;

    return new Date(expiracao) > new Date();
}

// ── Redireciona conforme o perfil recebido da API ──
function redirecionarPorPerfil(perfil) {
    const rotas = {
        'secretaria':    './recepcionista/dashboard.html',
        'dentista':      './dentista/dashboard.html',
        'administrador': './admin/funcionarios.html'
    };

    const destino = rotas[perfil];
    if (destino) {
        window.location.href = destino;
    } else {
        mostrarErro('Perfil não reconhecido.');
    }
}

// ── Verifica autenticação (chamar no topo de toda página interna) ──
function verificarAutenticacao() {
    if (!tokenValido()) {
        logout();
    }
}

// ── Logout ──
function logout() {
    sessionStorage.clear(); // limpa tudo de uma vez

    const emSubpasta = window.location.pathname.includes('/recepcionista/') ||
                       window.location.pathname.includes('/dentista/')      ||
                       window.location.pathname.includes('/admin/');

    window.location.href = emSubpasta ? '../index.html' : './index.html';
}