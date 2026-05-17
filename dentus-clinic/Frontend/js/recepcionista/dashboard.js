let CONSULTAS_DIA = [];

/* ── Mapeamento de status: banco ↔ interface ── */
const STATUS_DB_TO_UI = {
  'Agendada':    'agendada',
  'Aguardando':  'em-fila',
  'Em Consulta': 'em-consulta',
  'Encerrada':   'consulta-encerrada',
  'Cancelada':   'cancelada'
};

const STATUS_UI_TO_DB = {
  'agendada':           'Agendada',
  'em-fila':            'Aguardando',
  'em-consulta':        'Em Consulta',
  'consulta-encerrada': 'Encerrada'
};

const STATUS_ORDER  = ['agendada', 'em-fila', 'em-consulta', 'consulta-encerrada'];

const STATUS_LABELS = {
  'agendada':           'Agendada',
  'em-fila':            'Em Fila',
  'em-consulta':        'Em Consulta',
  'consulta-encerrada': 'Consulta Encerrada',
  'cancelada':          'Cancelada'
};

const STATUS_CLASSES = {
  'agendada':           'status-agendada',
  'em-fila':            'status-em-fila',
  'em-consulta':        'status-em-consulta',
  'consulta-encerrada': 'status-consulta-encerrada',
  'cancelada':          'status-cancelada'
};

/* ── Init ── */
document.addEventListener('DOMContentLoaded', () => {
  initSidebar();
  initHamburger();
  carregarConsultasDia();
  initActionButtons();
  document.getElementById('tabelaConsultas')
    ?.addEventListener('click', handleStatusClick);
});

/* ── Carregamento da API ── */
async function carregarConsultasDia() {
  try {
    const res = await apiGetConsultasDia();
    CONSULTAS_DIA = (res.dados || []).map(c => ({
      id:       c.id,
      paciente: c.nomePaciente,
      hora:     (c.horaConsulta || '').slice(0, 5),
      doutor:   c.nomeDentista,
      servico:  c.nomeServico || '—',
      retorno:  c.retorno || false,
      status:   STATUS_DB_TO_UI[c.status] || 'agendada'
    }));
    renderTabela();
  } catch (erro) {
    const tbody = document.getElementById('tbodyConsultasDia');
    if (tbody) tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-danger">Erro ao carregar consultas. Tente recarregar a página.</td></tr>`;
  }
}

/* ── Renderização da tabela ── */
function renderTabela() {
  const tbody = document.getElementById('tbodyConsultasDia');
  if (!tbody) return;

  if (CONSULTAS_DIA.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-muted">Nenhuma consulta agendada para hoje</td></tr>`;
    return;
  }

  tbody.innerHTML = CONSULTAS_DIA.map(c => {
    const isCancelada = c.status === 'cancelada';
    const statusCell  = isCancelada
      ? `<div class="status-cell">
           <span class="status-badge ${STATUS_CLASSES[c.status]}"
                 data-status="${c.status}">${STATUS_LABELS[c.status]}</span>
         </div>`
      : `<div class="status-cell">
           <button class="btn-status-arrow" data-dir="prev" data-id="${c.id}" title="Status anterior">
             <i class="fa-solid fa-chevron-left"></i>
           </button>
           <span class="status-badge ${STATUS_CLASSES[c.status]}"
                 data-status="${c.status}" data-id="${c.id}">${STATUS_LABELS[c.status]}</span>
           <button class="btn-status-arrow" data-dir="next" data-id="${c.id}" title="Próximo status">
             <i class="fa-solid fa-chevron-right"></i>
           </button>
         </div>`;

    const retornoBadge = c.retorno
      ? `<span class="badge-retorno">Retorno</span>`
      : '';

    return `<tr>
      <td>${c.paciente} ${retornoBadge}</td>
      <td>${c.hora}</td>
      <td>${c.doutor}</td>
      <td>${c.servico}</td>
      <td>${statusCell}</td>
    </tr>`;
  }).join('');
}

/* ── Clique nas setas de status ── */
async function handleStatusClick(e) {
  const btn = e.target.closest('.btn-status-arrow');
  if (!btn) return;

  const id       = parseInt(btn.dataset.id);
  const direcao  = btn.dataset.dir === 'next' ? 1 : -1;
  const consulta = CONSULTAS_DIA.find(c => c.id === id);
  if (!consulta) return;

  const idx     = STATUS_ORDER.indexOf(consulta.status);
  if (idx === -1) return;

  const novoIdx = Math.min(Math.max(idx + direcao, 0), STATUS_ORDER.length - 1);
  if (novoIdx === idx) return;

  const novoStatusUI = STATUS_ORDER[novoIdx];
  const novoStatusDB = STATUS_UI_TO_DB[novoStatusUI];

  const cell = btn.closest('.status-cell');
  cell.querySelectorAll('.btn-status-arrow').forEach(b => b.disabled = true);

  try {
    await apiAtualizarStatusConsulta(id, novoStatusDB);
    consulta.status = novoStatusUI;

    const badge = cell.querySelector('.status-badge');
    Object.values(STATUS_CLASSES).forEach(cls => badge.classList.remove(cls));
    badge.classList.add(STATUS_CLASSES[novoStatusUI]);
    badge.textContent   = STATUS_LABELS[novoStatusUI];
    badge.dataset.status = novoStatusUI;
  } catch (erro) {
    console.error('Erro ao atualizar status:', erro.message);
  } finally {
    cell.querySelectorAll('.btn-status-arrow').forEach(b => b.disabled = false);
  }
}

/* ── Sidebar ── */
function initSidebar() {
  SidebarComponent.render('sidebarContainer', {
    perfil: 'recepcionista',
    ativo:  'dashboard',
    nome:   sessionStorage.getItem('nome')   || 'Ana Paula',
    cargo:  sessionStorage.getItem('perfil') || 'Secretaria'
  });
}

function initHamburger() {
  const btn = document.getElementById('btnHamburger');
  if (btn) btn.addEventListener('click', () => SidebarComponent.toggleSidebar());
}

/* ── Botões de ação ── */
function initActionButtons() {
  document.getElementById('btnAgendar')?.addEventListener('click', () => {
    window.location.href = '../recepcionista/agenda.html';
  });
  document.getElementById('btnVisualizarPaciente')?.addEventListener('click', () => {
    window.location.href = '../recepcionista/pacientes.html';
  });
  document.getElementById('btnCadastrarPaciente')?.addEventListener('click', () => {
    window.location.href = '../recepcionista/pacientes.html?acao=cadastrar';
  });
}
