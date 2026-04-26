// js/main.js

document.addEventListener('DOMContentLoaded', () => {
    initPasswordToggle();
    initFormValidation();
    initFormSubmit();
});

// 1. Toggle mostrar/ocultar senha
function initPasswordToggle() {
    const toggleBtn  = document.getElementById('togglePw');
    const senhaInput = document.getElementById('senha');

    toggleBtn.addEventListener('click', () => {
        const oculto = senhaInput.type === 'password';
        senhaInput.type = oculto ? 'text' : 'password';
        toggleBtn.classList.toggle('fa-eye-slash', !oculto);
        toggleBtn.classList.toggle('fa-eye',        oculto);
    });
}

// 2. Validação em tempo real (ao sair do campo)
function initFormValidation() {
    document.getElementById('email').addEventListener('blur', function () {
        this.classList.toggle('is-invalid', !this.checkValidity());
        this.classList.toggle('is-valid',    this.checkValidity());
    });

    document.getElementById('senha').addEventListener('blur', function () {
        this.classList.toggle('is-invalid', !this.checkValidity());
        this.classList.toggle('is-valid',    this.checkValidity());
    });
}

// 3. Submit do formulário
function initFormSubmit() {
    const form       = document.getElementById('loginForm');
    const btnText    = document.getElementById('btnLoginText');
    const btnSpinner = document.getElementById('btnLoginSpinner');
    const btnLogin   = document.getElementById('btnLogin');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        form.classList.add('was-validated');
        if (!form.checkValidity()) return;

        // Loading
        setLoadingState(true, btnText, btnSpinner, btnLogin);

        try {
            const email = document.getElementById('email').value;
            const senha = document.getElementById('senha').value;

            // Chama api.js
            const data = await apiLogin(email, senha);

            // Salva sessão via auth.js
            salvarSessao(data);

            // Redireciona via auth.js
            redirecionarPorPerfil(data.perfil);

        } catch (erro) {
            mostrarErro(erro.message);
        } finally {
            setLoadingState(false, btnText, btnSpinner, btnLogin);
        }
    });
}

// Helpers
function setLoadingState(loading, btnText, btnSpinner, btnLogin) {
    btnText.classList.toggle('d-none',  loading);
    btnSpinner.classList.toggle('d-none', !loading);
    btnLogin.disabled = loading;
}

function mostrarErro(mensagem) {
    // Você pode trocar por um toast Bootstrap ou alert customizado
    const alerta = document.getElementById('alertaErro');
    if (alerta) {
        alerta.textContent = mensagem;
        alerta.classList.remove('d-none');
    }
}