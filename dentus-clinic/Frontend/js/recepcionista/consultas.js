/**
 * consultas.js — Página de gerenciamento de consultas (Recepcionista)
 * Padrão idêntico ao pacientes.js
 */

/* ══════════════════════════════════════
   DADOS MOCK — 22 consultas
══════════════════════════════════════ */
const CONSULTAS = [
  { id: 1,  paciente: 'Ricardo Henrique',  data: '2026-03-30', hora: '08:00', doutor: 'Dra. Ana Costa',    servico: 'Limpeza' },
  { id: 2,  paciente: 'Lilian Marques',    data: '2026-03-30', hora: '08:20', doutor: 'Dr. Pedro Santos',  servico: 'Restauração' },
  { id: 3,  paciente: 'Inês Ribeiro',      data: '2026-03-30', hora: '09:00', doutor: 'Dra. Ana Costa',    servico: 'Extração' },
  { id: 4,  paciente: 'Sofia Costa',       data: '2026-03-30', hora: '09:30', doutor: 'Dr. Pedro Santos',  servico: 'Clareamento' },
  { id: 5,  paciente: 'Catarina Lima',     data: '2026-03-30', hora: '09:30', doutor: 'Dra. Ana Costa',    servico: 'Restauração' },
  { id: 6,  paciente: 'João Silva',        data: '2026-03-30', hora: '10:00', doutor: 'Dr. Pedro Santos',  servico: 'Limpeza' },
  { id: 7,  paciente: 'Tiago Carvalho',    data: '2026-03-30', hora: '10:00', doutor: 'Dra. Ana Costa',    servico: 'Clareamento' },
  { id: 8,  paciente: 'Ricardo Almeida',   data: '2026-03-29', hora: '10:30', doutor: 'Dr. Pedro Santos',  servico: 'Extração' },
  { id: 9,  paciente: 'Filipe Rocha',      data: '2026-03-29', hora: '10:30', doutor: 'Dra. Ana Costa',    servico: 'Consulta' },
  { id: 10, paciente: 'Maria Souza',       data: '2026-03-29', hora: '11:00', doutor: 'Dr. Pedro Santos',  servico: 'Limpeza' },
  { id: 11, paciente: 'Beatriz Mendes',    data: '2026-03-29', hora: '11:00', doutor: 'Dra. Ana Costa',    servico: 'Restauração' },
  { id: 12, paciente: 'Mariana Fernandes', data: '2026-03-29', hora: '11:30', doutor: 'Dr. Pedro Santos',  servico: 'Consulta' },
  { id: 13, paciente: 'Vera Barros',       data: '2026-03-29', hora: '11:30', doutor: 'Dra. Ana Costa',    servico: 'Consulta' },
  { id: 14, paciente: 'Pedro Santos',      data: '2026-03-29', hora: '14:00', doutor: 'Dr. Pedro Santos',  servico: 'Canal' },
  { id: 15, paciente: 'André Nunes',       data: '2026-03-29', hora: '14:00', doutor: 'Dra. Ana Costa',    servico: 'Limpeza' },
  { id: 16, paciente: 'Luís Rodrigues',    data: '2026-03-28', hora: '14:30', doutor: 'Dr. Pedro Santos',  servico: 'Canal' },
  { id: 17, paciente: 'Ana Oliveira',      data: '2026-03-28', hora: '15:00', doutor: 'Dra. Ana Costa',    servico: 'Restauração' },
  { id: 18, paciente: 'Laura Pires',       data: '2026-03-28', hora: '15:00', doutor: 'Dr. Pedro Santos',  servico: 'Extração' },
  { id: 19, paciente: 'Patrícia Gomes',    data: '2026-03-28', hora: '15:30', doutor: 'Dra. Ana Costa',    servico: 'Limpeza' },
  { id: 20, paciente: 'Carlos Pereira',    data: '2026-03-28', hora: '16:00', doutor: 'Dr. Pedro Santos',  servico: 'Canal' },
  { id: 21, paciente: 'Miguel Santos',     data: '2026-03-28', hora: '16:00', doutor: 'Dra. Ana Costa',    servico: 'Restauração' },
  { id: 22, paciente: 'Daniel Martins',    data: '2026-03-28', hora: '16:30', doutor: 'Dr. Pedro Santos',  servico: 'Clareamento' },
];

/* ══════════════════════════════════════
   UTILITÁRIOS
══════════════════════════════════════ */
function formatarData(iso) {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

function iniciais(nome) {
  const partes = nome.trim().split(/\s+/);
  if (partes.length >= 2) return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
  return partes[0][0].toUpperCase();
}

/* ══════════════════════════════════════
   COMPONENTE — Tabela de Consultas
══════════════════════════════════════ */
const TabelaConsultas = {
  render(lista) {
    const tbody    = document.getElementById('tbodyConsultas');
    const empty    = document.getElementById('emptyState');
    if (!tbody) return;

    if (lista.length === 0) {
      tbody.innerHTML = '';
      empty.classList.remove('hidden');
      return;
    }
    empty.classList.add('hidden');

    tbody.innerHTML = lista.map((c, i) => `
      <tr style="animation: fadeInUp 0.3s ease-out ${i * 0.03}s both">
        <td class="td-nome">${c.paciente}</td>
        <td class="td-data">${formatarData(c.data)}</td>
        <td class="td-hora">${c.hora}</td>
        <td class="td-doutor">${c.doutor}</td>
        <td class="td-servico">${c.servico}</td>
        <td class="td-acoes">
          <div class="acoes-wrapper">
            <button class="btn-acao btn-visualizar" data-id="${c.id}" title="Visualizar">
              <i class="fa-solid fa-eye"></i>
            </button>
            <button class="btn-acao btn-editar" data-id="${c.id}" title="Editar">
              <i class="fa-solid fa-pen"></i>
            </button>
            <button class="btn-acao btn-excluir" data-id="${c.id}" title="Excluir">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');

    atualizarBadge(lista.length);
  }
};

/* ══════════════════════════════════════
   COMPONENTE — Cards Mobile
══════════════════════════════════════ */
const CardsMobileConsultas = {
  render(lista) {
    const container = document.getElementById('cardsMobile');
    if (!container) return;

    if (lista.length === 0) { container.innerHTML = ''; return; }

    container.innerHTML = lista.map(c => `
      <div class="card-consulta-mobile">
        <div class="card-mobile-avatar">${iniciais(c.paciente)}</div>
        <div class="card-mobile-info">
          <div class="card-mobile-nome">${c.paciente}</div>
          <div class="card-mobile-detail">
            <span><i class="fa-solid fa-calendar-days"></i> ${formatarData(c.data)}</span>
            <span><i class="fa-solid fa-clock"></i> ${c.hora}</span>
            <span><i class="fa-solid fa-id-card"></i> ${c.doutor}</span>
            <span><i class="fa-solid fa-notes-medical"></i> ${c.servico}</span>
          </div>
        </div>
        <div class="card-mobile-actions">
          <button class="btn-acao btn-excluir" data-id="${c.id}" title="Excluir">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </div>
    `).join('');
  }
};

/* ══════════════════════════════════════
   COMPONENTE — Modal de Confirmação
══════════════════════════════════════ */
const ModalConfirmacao = {
  _cb: null,
  show(nome, cb) {
    this._cb = cb;
    document.getElementById('modalNomePaciente').textContent = nome;
    document.getElementById('modalConfirmacao').classList.remove('hidden');
  },
  hide() {
    document.getElementById('modalConfirmacao').classList.add('hidden');
    this._cb = null;
  },
  confirmar() {
    if (typeof this._cb === 'function') this._cb();
    this.hide();
  }
};

/* ══════════════════════════════════════
   FILTROS
══════════════════════════════════════ */
let dadosAtivos = [...CONSULTAS];

function aplicarFiltros() {
  const fPaciente = document.getElementById('fPaciente').value.trim().toLowerCase();
  const fData     = document.getElementById('fData').value;
  const fHora     = document.getElementById('fHora').value.trim();
  const fDoutor   = document.getElementById('fDoutor').value.trim().toLowerCase();
  const fServico  = document.getElementById('fServico').value.trim().toLowerCase();

  dadosAtivos = CONSULTAS.filter(c => {
    if (fPaciente && !c.paciente.toLowerCase().includes(fPaciente)) return false;
    if (fData     && c.data !== fData)                              return false;
    if (fHora     && !c.hora.startsWith(fHora))                    return false;
    if (fDoutor   && !c.doutor.toLowerCase().includes(fDoutor))    return false;
    if (fServico  && !c.servico.toLowerCase().includes(fServico))  return false;
    return true;
  });

  TabelaConsultas.render(dadosAtivos);
  CardsMobileConsultas.render(dadosAtivos);
}

function limparFiltros() {
  ['fPaciente','fData','fHora','fDoutor','fServico'].forEach(id => {
    document.getElementById(id).value = '';
  });
  dadosAtivos = [...CONSULTAS];
  TabelaConsultas.render(dadosAtivos);
  CardsMobileConsultas.render(dadosAtivos);
}

function atualizarBadge(total) {
  const badge = document.getElementById('badgeTotal');
  if (badge) badge.textContent = `${total} consulta${total !== 1 ? 's' : ''}`;
}

/* ══════════════════════════════════════
   EXCLUSÃO
══════════════════════════════════════ */
let idParaExcluir = null;

function excluirConsulta(id) {
  const idx = CONSULTAS.findIndex(c => c.id === id);
  if (idx === -1) return;
  CONSULTAS.splice(idx, 1);
  dadosAtivos = dadosAtivos.filter(c => c.id !== id);
  TabelaConsultas.render(dadosAtivos);
  CardsMobileConsultas.render(dadosAtivos);
}

/* ══════════════════════════════════════
   INIT
══════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initSidebar();
  initHamburger();

  // Renderização inicial
  TabelaConsultas.render(CONSULTAS);
  CardsMobileConsultas.render(CONSULTAS);
  atualizarBadge(CONSULTAS.length);

  // Filtros em tempo real
  ['fPaciente','fHora','fDoutor','fServico'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', aplicarFiltros);
  });
  document.getElementById('fData')?.addEventListener('change', aplicarFiltros);
  document.getElementById('btnLimparFiltros')?.addEventListener('click', limparFiltros);

  // Delegação de cliques na tabela (visualizar / editar / excluir)
  document.getElementById('tbodyConsultas')?.addEventListener('click', handleAcaoTabela);
  document.getElementById('cardsMobile')?.addEventListener('click', handleAcaoMobile);

  // Modal
  document.getElementById('btnModalCancelar')?.addEventListener('click', () => ModalConfirmacao.hide());
  document.getElementById('btnModalConfirmar')?.addEventListener('click', () => ModalConfirmacao.confirmar());
  document.getElementById('modalConfirmacao')?.addEventListener('click', e => {
    if (e.target === e.currentTarget) ModalConfirmacao.hide();
  });

  // Botão agendar
  document.getElementById('btnAgendar')?.addEventListener('click', () => {
    // TODO: abrir modal de agendamento ou navegar para formulário
    alert('Abrir formulário de agendamento');
  });
});

function handleAcaoTabela(e) {
  const btn = e.target.closest('.btn-acao');
  if (!btn) return;
  const id = Number(btn.dataset.id);
  const consulta = CONSULTAS.find(c => c.id === id);
  if (!consulta) return;

  if (btn.classList.contains('btn-visualizar')) {
    alert(`Visualizar consulta de ${consulta.paciente}\nData: ${formatarData(consulta.data)} às ${consulta.hora}\nDoutor: ${consulta.doutor}\nServiço: ${consulta.servico}`);
  } else if (btn.classList.contains('btn-editar')) {
    alert(`Editar consulta de ${consulta.paciente}`);
    // TODO: abrir modal/formulário de edição
  } else if (btn.classList.contains('btn-excluir')) {
    idParaExcluir = id;
    ModalConfirmacao.show(consulta.paciente, () => excluirConsulta(idParaExcluir));
  }
}

function handleAcaoMobile(e) {
  const btn = e.target.closest('.btn-excluir');
  if (!btn) return;
  const id = Number(btn.dataset.id);
  const consulta = CONSULTAS.find(c => c.id === id);
  if (!consulta) return;
  idParaExcluir = id;
  ModalConfirmacao.show(consulta.paciente, () => excluirConsulta(idParaExcluir));
}

/* ── Sidebar (padrão do projeto) ── */
function initSidebar() {
  SidebarComponent.render('sidebarContainer', {
    perfil: 'recepcionista',
    ativo:  'consultas',
    nome:   sessionStorage.getItem('nome')   || 'Ana Paula',
    cargo:  sessionStorage.getItem('perfil') || 'Secretaria'
  });
}

function initHamburger() {
  document.getElementById('btnHamburger')
    ?.addEventListener('click', () => SidebarComponent.toggleSidebar());
}
