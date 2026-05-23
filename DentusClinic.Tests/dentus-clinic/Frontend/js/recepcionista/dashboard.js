// js/recepcionista/dashboard.js

document.addEventListener('DOMContentLoaded', () => {
  initSidebar();
  initHamburger();
  initStatusToggle();
  initActionButtons();
});

/* ── Sidebar ── */
function initSidebar() {
  SidebarComponent.render('sidebarContainer', {
    perfil: 'recepcionista',
    ativo:  'dashboard',
    nome:   sessionStorage.getItem('nome')  || 'Ana Paula',
    cargo:  sessionStorage.getItem('perfil') || 'Secretaria'
  });
}

/* ── Hamburguer mobile ── */
function initHamburger() {
  const btn = document.getElementById('btnHamburger');
  if (btn) btn.addEventListener('click', () => SidebarComponent.toggleSidebar());
}

/* ── Ordem dos status (exceto cancelada) ── */
const STATUS_ORDER = ['agendada', 'em-fila', 'em-consulta', 'consulta-encerrada'];

const STATUS_LABELS = {
  'agendada':            'Agendada',
  'em-fila':             'Em Fila',
  'em-consulta':         'Em Consulta',
  'consulta-encerrada':  'Consulta Encerrada',
  'cancelada':           'Cancelada'
};

const STATUS_CLASSES = {
  'agendada':            'status-agendada',
  'em-fila':             'status-em-fila',
  'em-consulta':         'status-em-consulta',
  'consulta-encerrada':  'status-consulta-encerrada',
  'cancelada':           'status-cancelada'
};

/* Atualiza o badge de status na linha */
function atualizarBadge(badge, novoStatus) {
  // Remove todas as classes de status anteriores
  Object.values(STATUS_CLASSES).forEach(cls => badge.classList.remove(cls));
  badge.classList.add(STATUS_CLASSES[novoStatus]);
  badge.textContent = STATUS_LABELS[novoStatus];
  badge.dataset.status = novoStatus;
}

/* Avança ou retrocede o status */
function mudarStatus(badge, direcao) {
  const atual = badge.dataset.status;
  if (atual === 'cancelada') return; // Cancelada não muda

  const idx = STATUS_ORDER.indexOf(atual);
  if (idx === -1) return;

  let novoIdx = idx + direcao;
  // Limita nos extremos
  if (novoIdx < 0) novoIdx = 0;
  if (novoIdx >= STATUS_ORDER.length) novoIdx = STATUS_ORDER.length - 1;

  const novoStatus = STATUS_ORDER[novoIdx];
  atualizarBadge(badge, novoStatus);

  // TODO: chamar API para persistir o novo status
  // apiAtualizarStatusConsulta(badge.dataset.consultaId, novoStatus);
}

/* Delegação de eventos na tabela */
function initStatusToggle() {
  const tabela = document.getElementById('tabelaConsultas');
  if (!tabela) return;

  tabela.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-status-arrow');
    if (!btn) return;

    const badge    = btn.closest('.status-cell').querySelector('.status-badge');
    const direcao  = btn.dataset.dir === 'next' ? 1 : -1;
    mudarStatus(badge, direcao);
  });
}

/* ── Botões de ação ── */
function initActionButtons() {
  document.getElementById('btnAgendar')?.addEventListener('click', () => {
    window.location.href = '../recepcionista/consultas.html?acao=agendar';
  });
  document.getElementById('btnVisualizarPaciente')?.addEventListener('click', () => {
    window.location.href = '../recepcionista/pacientes.html';
  });
  document.getElementById('btnCadastrarPaciente')?.addEventListener('click', () => {
    window.location.href = '../recepcionista/pacientes.html?acao=cadastrar';
  });
}
