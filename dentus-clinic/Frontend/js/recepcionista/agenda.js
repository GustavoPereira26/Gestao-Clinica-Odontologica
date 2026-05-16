
/**
 * agenda.js — Agenda visual por dentista (Recepcionista)
 * Centraliza agendamento, edição, cancelamento e busca por paciente.
 */

const SLOTS_HORARIOS = (() => {
  const slots = [];
  for (let h = 8; h < 18; h++) {
    slots.push(`${String(h).padStart(2, '0')}:00`);
    slots.push(`${String(h).padStart(2, '0')}:30`);
  }
  return slots;
})();

const STATUS_LABEL = {
  'Agendada':    { badge: 'status-agendada',    slotClass: 'slot-agendada',  texto: 'Agendada' },
  'Aguardando':  { badge: 'status-em-fila',     slotClass: 'slot-fila',      texto: 'Em Fila' },
  'Em Consulta': { badge: 'status-em-consulta', slotClass: 'slot-consulta',  texto: 'Em Consulta' },
  'Encerrada':   { badge: 'status-encerrada',   slotClass: 'slot-encerrada', texto: 'Encerrada' },
  'Cancelada':   { badge: 'status-cancelada',   slotClass: 'slot-cancelada', texto: 'Cancelada' },
};

// Estado
let slotSelecionado  = { dentistaId: null, data: null, hora: null };
let consultaEmEdicao = null;
let consultasAtuais  = [];
let todasConsultas   = [];
let pacientesCache   = [];
let dentistasCache   = [];
let servicosCache    = [];

/* ══════════════════════════════════════
   INICIALIZAÇÃO
══════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', async () => {
  SidebarComponent.render('sidebarContainer', { perfil: 'recepcionista', ativo: 'agenda' });
  document.getElementById('btnHamburger')?.addEventListener('click', () => SidebarComponent.toggleSidebar());

  document.getElementById('inputData').value = new Date().toISOString().split('T')[0];

  await Promise.all([
    carregarDentistas(),
    carregarPacientes(),
    carregarServicos(),
    carregarTodasConsultas(),
  ]);

  configurarEventos();
  configurarBusca();
  configurarAutocompleteAgendar();
  configurarAutocompleteEditar();
});

/* ══════════════════════════════════════
   CARGA DE DADOS
══════════════════════════════════════ */
async function carregarDentistas() {
  const select = document.getElementById('selectDentista');
  try {
    const res = await apiGetDentistas();
    dentistasCache = res?.dados ?? res ?? [];
    select.innerHTML = '<option value="">Selecione um dentista...</option>' +
      dentistasCache.map(d => `<option value="${d.id}">${d.nome}</option>`).join('');
  } catch {
    select.innerHTML = '<option value="">Erro ao carregar dentistas</option>';
  }
}

async function carregarPacientes() {
  try {
    const res = await apiGetPacientes();
    pacientesCache = (res?.dados ?? res ?? []).map(p => ({ id: p.id, nome: p.nome, cpf: p.cpf ?? '' }));
  } catch { pacientesCache = []; }
}

async function carregarServicos() {
  try {
    const res = await apiGetServicos();
    servicosCache = res?.dados ?? res ?? [];
    preencherSelectServico('slotServico');
    preencherSelectServico('editServico');
  } catch { /* mantém vazio */ }
}

async function carregarTodasConsultas() {
  try {
    const res = await apiGetConsultas();
    todasConsultas = res?.dados ?? res ?? [];
  } catch { todasConsultas = []; }
}

function preencherSelectServico(selectId) {
  const select = document.getElementById(selectId);
  if (!select) return;
  select.innerHTML = '<option value="">Nenhum</option>' +
    servicosCache.map(s => `<option value="${s.id}">${s.nome}</option>`).join('');
}

/* ══════════════════════════════════════
   AGENDA — CARREGAR E RENDERIZAR
══════════════════════════════════════ */
async function carregarAgenda() {
  const dentistaId = document.getElementById('selectDentista').value;
  const data       = document.getElementById('inputData').value;

  const placeholder = document.getElementById('placeholderSelecioneDentista');
  const wrapper     = document.getElementById('agendaGridWrapper');
  const legenda     = document.getElementById('agendaLegenda');

  if (!dentistaId) {
    placeholder.style.display = '';
    wrapper.style.display     = 'none';
    legenda.style.display     = 'none';
    return;
  }

  placeholder.style.display = 'none';
  wrapper.style.display     = '';
  legenda.style.display     = '';

  const grid = document.getElementById('agendaGrid');
  grid.innerHTML = `<div class="agenda-loading"><i class="fa-solid fa-spinner fa-spin"></i> Carregando...</div>`;

  try {
    const res = await apiGetAgendaDentista(dentistaId, data);
    consultasAtuais = res?.dados ?? res ?? [];
    renderGrid(consultasAtuais, dentistaId, data);
  } catch (e) {
    grid.innerHTML = `<div class="agenda-placeholder"><i class="fa-solid fa-triangle-exclamation"></i><p>${e.message}</p></div>`;
  }
}

function renderGrid(consultas, dentistaId, data) {
  const grid = document.getElementById('agendaGrid');

  const porHora = {};
  consultas.forEach(c => {
    if (c.status === 'Cancelada') return;
    const hora = c.horaConsulta?.substring(0, 5);
    if (hora) porHora[hora] = c;
  });

  grid.innerHTML = SLOTS_HORARIOS.map(hora => {
    const consulta = porHora[hora];

    if (!consulta) {
      return `
        <div class="slot slot-livre" data-hora="${hora}" data-dentista="${dentistaId}" data-data="${data}"
             onclick="AgendaPage.abrirModalAgendar(this)">
          <div class="slot-hora">${hora}</div>
          <div class="slot-conteudo">
            <span class="slot-disponivel-label"><i class="fa-solid fa-circle-check me-1"></i>Disponível</span>
            <button class="btn-agendar-slot"><i class="fa-solid fa-plus"></i> Agendar</button>
          </div>
        </div>`;
    }

    const s   = STATUS_LABEL[consulta.status] ?? { badge: '', slotClass: '', texto: consulta.status };
    const ret = consulta.retorno ? `<span class="badge-retorno">Retorno</span>` : '';

    return `
      <div class="slot slot-ocupado ${s.slotClass}" onclick="AgendaPage.abrirModalDetalhe(${consulta.id})">
        <div class="slot-hora">${hora}</div>
        <div class="slot-conteudo">
          <div>
            <div class="slot-paciente-nome">${consulta.nomePaciente}</div>
            <div class="slot-servico-nome">${consulta.nomeServico || '—'}</div>
          </div>
          <div class="slot-badges">
            ${ret}
            <span class="status-badge ${s.badge}">${s.texto}</span>
            <i class="fa-solid fa-chevron-right slot-seta"></i>
          </div>
        </div>
      </div>`;
  }).join('');
}

/* ══════════════════════════════════════
   MODAL DETALHE / EDITAR / CANCELAR
══════════════════════════════════════ */
const AgendaPage = {

  /* ─── Abrir detalhe ─── */
  abrirModalDetalhe(id) {
    const consulta = consultasAtuais.find(c => c.id === id);
    if (!consulta) return;
    consultaEmEdicao = consulta;

    // Preencher info
    document.getElementById('dtlPaciente').textContent = consulta.nomePaciente;
    document.getElementById('dtlDentista').textContent = consulta.nomeDentista;
    document.getElementById('dtlData').textContent     = formatarData(String(consulta.dataConsulta));
    document.getElementById('dtlHora').textContent     = consulta.horaConsulta?.substring(0, 5);
    document.getElementById('dtlServico').textContent  = consulta.nomeServico || '—';

    const s = STATUS_LABEL[consulta.status] ?? { badge: '', texto: consulta.status };
    document.getElementById('dtlStatus').innerHTML = `<span class="status-badge ${s.badge}">${s.texto}</span>`;

    const retEl = document.getElementById('dtlRetorno');
    retEl.classList.toggle('d-none', !consulta.retorno);

    // Botões: só mostra editar/cancelar se a consulta ainda pode ser alterada
    const editavel = !['Encerrada', 'Cancelada'].includes(consulta.status);
    document.getElementById('btnEditarConsulta').classList.toggle('d-none', !editavel);
    document.getElementById('btnCancelarConsulta').classList.toggle('d-none', !editavel);

    this._mostrarView('viewInfo');
    bootstrap.Modal.getOrCreateInstance(document.getElementById('modalDetalhe')).show();
  },

  /* ─── Vistas ─── */
  _mostrarView(id) {
    ['viewInfo', 'viewCancelar', 'viewEditar'].forEach(v => {
      document.getElementById(v).classList.toggle('d-none', v !== id);
    });
    document.getElementById('alertaCancelar').classList.add('d-none');
    document.getElementById('alertaEditarDetalhe').classList.add('d-none');
  },

  voltarInfo() { this._mostrarView('viewInfo'); },

  mostrarViewCancelar() { this._mostrarView('viewCancelar'); },

  mostrarViewEditar() {
    if (!consultaEmEdicao) return;
    const c = consultaEmEdicao;

    // Preencher campos do form
    document.getElementById('editPacienteSearch').value = c.nomePaciente;
    document.getElementById('editPacienteId').value     = c.idPaciente;

    // Dentista
    const selDentista = document.getElementById('editDentista');
    selDentista.innerHTML = dentistasCache.map(d =>
      `<option value="${d.id}" ${d.id === c.idDentista ? 'selected' : ''}>${d.nome}</option>`
    ).join('');

    // Data e hora
    document.getElementById('editData').value = String(c.dataConsulta);
    document.getElementById('editHora').value = c.horaConsulta?.substring(0, 5);

    // Serviço
    const selServico = document.getElementById('editServico');
    selServico.innerHTML = '<option value="">Nenhum</option>' +
      servicosCache.map(s =>
        `<option value="${s.id}" ${s.id === c.idServico ? 'selected' : ''}>${s.nome}</option>`
      ).join('');

    // Retorno
    document.getElementById('editRetorno').checked = c.retorno;

    this._mostrarView('viewEditar');
  },

  /* ─── Cancelar consulta ─── */
  async confirmarCancelar() {
    if (!consultaEmEdicao) return;
    const btn = document.getElementById('btnConfirmarCancelar');
    btn.disabled = true;
    btn.textContent = 'Cancelando...';

    try {
      await apiCancelarConsulta(consultaEmEdicao.id);
      bootstrap.Modal.getOrCreateInstance(document.getElementById('modalDetalhe')).hide();
      this.resetarModalDetalhe();
      await Promise.all([carregarAgenda(), carregarTodasConsultas()]);
    } catch (e) {
      const alerta = document.getElementById('alertaCancelar');
      alerta.textContent = e.message;
      alerta.classList.remove('d-none');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Sim, Cancelar';
    }
  },

  /* ─── Salvar edição ─── */
  async confirmarEdicao() {
    if (!consultaEmEdicao) return;

    const idPaciente = parseInt(document.getElementById('editPacienteId').value);
    const idDentista = parseInt(document.getElementById('editDentista').value);
    const data       = document.getElementById('editData').value;
    const hora       = document.getElementById('editHora').value;
    const idServico  = parseInt(document.getElementById('editServico').value) || null;
    const retorno    = document.getElementById('editRetorno').checked;

    const alerta = document.getElementById('alertaEditarDetalhe');
    alerta.classList.add('d-none');

    if (!idPaciente) { this._erroEditar('Selecione um paciente na lista.'); return; }
    if (!idDentista) { this._erroEditar('Selecione um dentista.'); return; }
    if (!data)       { this._erroEditar('Informe a data.'); return; }
    if (!hora)       { this._erroEditar('Informe o horário.'); return; }

    const btn = document.getElementById('btnSalvarEdicao');
    btn.disabled = true;
    btn.textContent = 'Salvando...';

    try {
      await apiEditarConsulta(consultaEmEdicao.id, {
        idPaciente,
        idDentista,
        dataConsulta: data,
        horaConsulta: hora + ':00',
        idServico,
        retorno,
      });

      bootstrap.Modal.getOrCreateInstance(document.getElementById('modalDetalhe')).hide();
      this.resetarModalDetalhe();

      // Se o dentista mudou, seleciona o novo no filtro
      document.getElementById('selectDentista').value = idDentista;
      document.getElementById('inputData').value = data;

      await Promise.all([carregarAgenda(), carregarTodasConsultas()]);
    } catch (e) {
      this._erroEditar(e.message);
    } finally {
      btn.disabled = false;
      btn.textContent = 'Salvar';
    }
  },

  _erroEditar(msg) {
    const alerta = document.getElementById('alertaEditarDetalhe');
    alerta.textContent = msg;
    alerta.classList.remove('d-none');
  },

  resetarModalDetalhe() {
    consultaEmEdicao = null;
    document.getElementById('editPacienteSearch').value = '';
    document.getElementById('editPacienteId').value     = '';
    document.getElementById('editPacienteSugestoes').style.display = 'none';
  },

  /* ─── Modal agendar (slot livre) ─── */
  abrirModalAgendar(slotEl) {
    const hora       = slotEl.dataset.hora;
    const dentistaId = slotEl.dataset.dentista;
    const data       = slotEl.dataset.data;

    slotSelecionado = { dentistaId: parseInt(dentistaId), data, hora };

    const nomeDentista = document.getElementById('selectDentista').selectedOptions[0]?.text ?? '—';
    document.getElementById('modalNomeDentista').textContent  = nomeDentista;
    document.getElementById('modalDataFormatada').textContent = formatarData(data);
    document.getElementById('modalHoraFormatada').textContent = hora;

    document.getElementById('slotPacienteSearch').value = '';
    document.getElementById('slotPacienteId').value     = '';
    document.getElementById('slotRetorno').checked      = false;
    document.getElementById('alertaAgendarSlot').classList.add('d-none');

    bootstrap.Modal.getOrCreateInstance(document.getElementById('modalAgendarSlot')).show();
  },

  async confirmarAgendamento() {
    const alerta    = document.getElementById('alertaAgendarSlot');
    alerta.classList.add('d-none');

    const idPaciente = parseInt(document.getElementById('slotPacienteId').value);
    const idServico  = parseInt(document.getElementById('slotServico').value) || null;
    const retorno    = document.getElementById('slotRetorno').checked;

    if (!idPaciente) { this._erroAgendar('Selecione um paciente na lista.'); return; }

    const { dentistaId, data, hora } = slotSelecionado;
    const agora     = new Date();
    const hoje      = agora.toISOString().split('T')[0];
    const horaAtual = agora.toTimeString().slice(0, 5);

    if (data < hoje)                      { this._erroAgendar('Não é possível agendar em uma data passada.'); return; }
    if (data === hoje && hora < horaAtual){ this._erroAgendar('Não é possível agendar em um horário que já passou.'); return; }

    const btn = document.getElementById('btnConfirmarAgendarSlot');
    btn.disabled = true;
    btn.textContent = 'Agendando...';

    try {
      await apiAgendarConsulta({
        idPaciente,
        idDentista: dentistaId,
        dataConsulta: data,
        horaConsulta: hora + ':00',
        idServico,
        retorno,
      });

      bootstrap.Modal.getOrCreateInstance(document.getElementById('modalAgendarSlot')).hide();
      this.resetarModalAgendar();
      await Promise.all([carregarAgenda(), carregarTodasConsultas()]);
    } catch (e) {
      this._erroAgendar(e.message);
    } finally {
      btn.disabled = false;
      btn.textContent = 'Agendar';
    }
  },

  _erroAgendar(msg) {
    const alerta = document.getElementById('alertaAgendarSlot');
    alerta.textContent = msg;
    alerta.classList.remove('d-none');
  },

  resetarModalAgendar() {
    document.getElementById('slotPacienteSearch').value = '';
    document.getElementById('slotPacienteId').value     = '';
    document.getElementById('slotPacienteSugestoes').style.display = 'none';
    document.getElementById('slotRetorno').checked      = false;
    document.getElementById('alertaAgendarSlot').classList.add('d-none');
    slotSelecionado = { dentistaId: null, data: null, hora: null };
  },

  /* ─── Busca: navegar para consulta ─── */
  navegarParaConsulta(dentistaId, dataISO) {
    document.getElementById('selectDentista').value = dentistaId;
    document.getElementById('inputData').value      = dataISO;
    document.getElementById('buscaResultados').style.display = 'none';
    document.getElementById('buscaPaciente').value  = '';
    carregarAgenda();
  },
};

/* ══════════════════════════════════════
   BUSCA POR PACIENTE
══════════════════════════════════════ */
function configurarBusca() {
  const input      = document.getElementById('buscaPaciente');
  const resultados = document.getElementById('buscaResultados');
  let timer;

  input.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      const termo = input.value.trim().toLowerCase();
      if (termo.length < 2) { resultados.style.display = 'none'; return; }

      const filtrados = todasConsultas
        .filter(c => c.nomePaciente.toLowerCase().includes(termo) && c.status !== 'Inativa')
        .slice(0, 8);

      renderResultadosBusca(filtrados, resultados);
    }, 280);
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('#buscaPaciente') && !e.target.closest('#buscaResultados')) {
      resultados.style.display = 'none';
    }
  });
}

function renderResultadosBusca(lista, box) {
  if (!lista.length) {
    box.innerHTML = '<div class="busca-sem-resultado">Nenhuma consulta encontrada</div>';
    box.style.display = 'block';
    return;
  }
  box.innerHTML = lista.map(c => {
    const s = STATUS_LABEL[c.status] ?? { badge: '', texto: c.status };
    return `
      <button type="button" class="busca-resultado-item"
              onclick="AgendaPage.navegarParaConsulta(${c.idDentista}, '${c.dataConsulta}')">
        <div class="busca-resultado-paciente">${c.nomePaciente}</div>
        <div class="busca-resultado-info">
          <span><i class="fa-solid fa-user-doctor"></i> ${c.nomeDentista}</span>
          <span><i class="fa-solid fa-calendar"></i> ${formatarData(String(c.dataConsulta))}</span>
          <span><i class="fa-solid fa-clock"></i> ${c.horaConsulta?.substring(0, 5)}</span>
          <span class="status-badge ${s.badge}">${s.texto}</span>
        </div>
      </button>`;
  }).join('');
  box.style.display = 'block';
}

/* ══════════════════════════════════════
   AUTOCOMPLETE — AGENDAR
══════════════════════════════════════ */
function configurarAutocompleteAgendar() {
  _setupAutocomplete('slotPacienteSearch', 'slotPacienteId', 'slotPacienteSugestoes');
}

function configurarAutocompleteEditar() {
  _setupAutocomplete('editPacienteSearch', 'editPacienteId', 'editPacienteSugestoes');
}

function _setupAutocomplete(inputId, hiddenId, sugestoesId) {
  const input     = document.getElementById(inputId);
  const hidden    = document.getElementById(hiddenId);
  const sugestoes = document.getElementById(sugestoesId);

  input.addEventListener('input', () => {
    hidden.value = '';
    const termo = input.value.trim().toLowerCase();
    if (!termo) { sugestoes.style.display = 'none'; return; }
    const filtrados = pacientesCache.filter(p => p.nome.toLowerCase().includes(termo)).slice(0, 8);
    _renderSugestoes(filtrados, hidden, sugestoes);
  });

  sugestoes.addEventListener('mousedown', (e) => {
    const btn = e.target.closest('[data-id]');
    if (!btn) return;
    const p = pacientesCache.find(x => x.id === parseInt(btn.dataset.id));
    if (p) {
      input.value    = p.nome;
      hidden.value   = p.id;
      sugestoes.style.display = 'none';
    }
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest(`#${inputId}`) && !e.target.closest(`#${sugestoesId}`)) {
      sugestoes.style.display = 'none';
    }
  });
}

function _renderSugestoes(lista, hidden, box) {
  if (!lista.length) { box.style.display = 'none'; return; }
  box.innerHTML = lista.map(p => `
    <button type="button" class="list-group-item list-group-item-action py-2 px-3" data-id="${p.id}">
      <div class="fw-semibold" style="font-size:.85rem;">${p.nome}</div>
      ${p.cpf ? `<div class="text-muted" style="font-size:.75rem;">${formatCPF(p.cpf)}</div>` : ''}
    </button>`).join('');
  box.style.display = 'block';
}

/* ══════════════════════════════════════
   EVENTOS E UTILITÁRIOS
══════════════════════════════════════ */
function configurarEventos() {
  document.getElementById('selectDentista').addEventListener('change', carregarAgenda);
  document.getElementById('inputData').addEventListener('change', carregarAgenda);
  document.getElementById('btnHoje').addEventListener('click', () => {
    document.getElementById('inputData').value = new Date().toISOString().split('T')[0];
    carregarAgenda();
  });
  document.getElementById('btnDiaAnterior').addEventListener('click', () => mudarDia(-1));
  document.getElementById('btnProximoDia').addEventListener('click', () => mudarDia(1));
}

function mudarDia(delta) {
  const input = document.getElementById('inputData');
  const data  = new Date(input.value + 'T00:00:00');
  data.setDate(data.getDate() + delta);
  input.value = data.toISOString().split('T')[0];
  carregarAgenda();
}

function formatarData(iso) {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

function formatCPF(cpf) {
  const d = cpf.replace(/\D/g, '');
  return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}
