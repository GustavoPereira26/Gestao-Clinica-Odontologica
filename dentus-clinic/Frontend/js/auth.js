// js/auth.js

// Salva dados da sessão após login
function salvarSessao(data) {
    localStorage.setItem('token',  data.token);
    localStorage.setItem('perfil', data.perfil);
    localStorage.setItem('nome',   data.nome);
}

// Redireciona conforme o perfil recebido da API
function redirecionarPorPerfil(perfil) {
    const rotas = {
        'secretaria': './secretary/dashboard.html',
        'dentista':   './dentist/dashboard.html',
        'admin':      './admin/dashboard.html'
    };

    const destino = rotas[perfil];
    if (destino) {
        window.location.href = destino;
    } else {
        mostrarErro('Perfil não reconhecido.');
    }
}

// Verifica se há sessão ativa (usado nas páginas internas)
function verificarAutenticacao() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '../index.html'; // Volta para login
    }
}

// Logout
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('perfil');
    localStorage.removeItem('nome');
    window.location.href = '../index.html';
}