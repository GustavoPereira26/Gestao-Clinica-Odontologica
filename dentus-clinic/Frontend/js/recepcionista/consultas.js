document.addEventListener('DOMContentLoaded', () => {
    initSidebar();
    initHamburger();
    // ... resto da lógica de consultas
});

function initSidebar() {
    SidebarComponent.render('sidebarContainer', {
        perfil: 'recepcionista',
        ativo:  'consultas',  // ← só isso mudou em relação ao dashboard
        nome:   sessionStorage.getItem('nome')   || 'Ana Paula',
        cargo:  sessionStorage.getItem('perfil') || 'Secretaria'
    });
}

function initHamburger() {
    document.getElementById('btnHamburger')
        ?.addEventListener('click', () => SidebarComponent.toggleSidebar());
}