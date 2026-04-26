/**
 * sidebar.js — Componente reutilizável da Sidebar
 * Uso: SidebarComponent.render(containerId, config)
 */
const SidebarComponent = (() => {

  const menusPorPerfil = {
    recepcionista: [
      { id: 'dashboard',    icon: 'bi-house',       label: 'Página Inicial', href: '../recepcionista/dashboard.html' },
      { id: 'consultas',    icon: 'bi-calendar2-check', label: 'Consultas',  href: '../recepcionista/consultas.html' },
      { id: 'pacientes',    icon: 'bi-people',       label: 'Pacientes',     href: '../recepcionista/pacientes.html' },
      { id: 'funcionarios', icon: 'bi-person-badge', label: 'Funcionários',  href: '../recepcionista/funcionarios.html' },
    ],
    dentista: [
      { id: 'dashboard',   icon: 'bi-house',         label: 'Página Inicial', href: '../dentista/dashboard.html' },
      { id: 'tratamentos', icon: 'bi-heart-pulse',   label: 'Tratamentos',    href: '../dentista/tratamentos.html' },
      { id: 'agenda',      icon: 'bi-calendar3',     label: 'Agenda',         href: '../dentista/agenda.html' },
      { id: 'planejar',    icon: 'bi-clipboard2-pulse', label: 'Planejar Tratamento', href: '../dentista/planejar.html' },
      { id: 'pacientes',   icon: 'bi-people',        label: 'Meus Pacientes', href: '../dentista/pacientes.html' },
    ],
    admin: [
      { id: 'funcionarios', icon: 'bi-person-badge', label: 'Funcionários',  href: '../admin/funcionarios.html' },
      { id: 'pacientes',    icon: 'bi-people',       label: 'Pacientes',     href: '../admin/pacientes.html' }
    ]
  };

  function render(containerId, { perfil = 'recepcionista', ativo = 'dashboard', nome = '', cargo = '' }) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const menus = menusPorPerfil[perfil] || [];

    const nomeSessao  = nome  || sessionStorage.getItem('nome')  || 'Usuário';
    const cargoSessao = cargo || sessionStorage.getItem('perfil') || perfil;
    const cargoLabel  = cargoSessao.charAt(0).toUpperCase() + cargoSessao.slice(1);

    const menuHTML = menus.map(item => `
      <li class="sidebar-nav-item">
        <a href="${item.href}"
           class="sidebar-nav-link ${item.id === ativo ? 'active' : ''}"
           data-page="${item.id}">
          <i class="bi ${item.icon} me-2"></i>
          <span>${item.label}</span>
        </a>
      </li>
    `).join('');

    container.innerHTML = `
      <aside class="sidebar" id="sidebarEl">

        <!-- Logo -->
        <div class="sidebar-logo">
        <img src="../img/dental.svg" alt="Ícone de início" class="dente">
          <span class="sidebar-brand">Dentu's Clinic</span>
        </div>
        <hr class="sidebar-divider" />

        <!-- Perfil do usuário -->
        <div class="sidebar-profile">
          <div class="sidebar-avatar">
            <i class="bi bi-person-fill"></i>
          </div>
          <div class="sidebar-profile-info">
            <span class="sidebar-role">${cargoLabel}</span>
            <span class="sidebar-name">${nomeSessao}</span>
          </div>
        </div>

        <!-- Navegação -->
        <nav class="sidebar-nav">
          <ul class="sidebar-nav-list">
            ${menuHTML}
          </ul>
        </nav>

        <!-- Rodapé -->
        <div class="sidebar-footer">
          <hr class="sidebar-divider" />
          <a href="#" class="sidebar-nav-link" id="btnConfiguracoes">
            <i class="bi bi-gear me-2"></i>
            <span>Configurações</span>
          </a>
          <a href="index.html" class="sidebar-nav-link sidebar-logout" id="btnSair">
            <i class="bi bi-box-arrow-left me-2"></i>
            <span>Sair</span>
          </a>
        </div>
      </aside>

      <!-- Overlay mobile -->
      <div class="sidebar-overlay" id="sidebarOverlay"></div>
    `;

    // Evento de logout
    document.getElementById('btnSair').addEventListener('click', (e) => {
      e.preventDefault();
      if (confirm('Deseja realmente sair?')) {
        sessionStorage.clear();
        window.location.href = '../index.html';
      }
    });

    // Fechar sidebar no mobile ao clicar no overlay
    document.getElementById('sidebarOverlay').addEventListener('click', () => {
      toggleSidebar(false);
    });
  }

  function toggleSidebar(force) {
    const sidebar  = document.getElementById('sidebarEl');
    const overlay  = document.getElementById('sidebarOverlay');
    const isOpen   = sidebar.classList.contains('open');
    const open     = force !== undefined ? force : !isOpen;

    sidebar.classList.toggle('open', open);
    overlay.classList.toggle('active', open);
  }

  return { render, toggleSidebar };
})();
