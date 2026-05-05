/**
 * agenda.js — Agenda visual por dentista (Recepcionista)
 */

// Slots de 08:00 a 17:30 em intervalos de 30 min
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

// Estado interno
let slotSelecionado = { dentistaId: null, data: null, hora: null };
let pacientesCache  = [];

/* ══════════════════════════════════════
   INICIALIZAÇÃO
══════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', async () => {
  SidebarComponent.render('sidebarContainer', { perfil: 'recepcionista', ativo: 'agenda' });
  document.getElementById('btnHamburger')?.addEventListener('click', () => SidebarComponent.toggleSidebar());

  // Data padrão = hoje
  const hoje = new Date().toISOString().split('T')[0];
  document.getElementById('inputData').value = hoje;

  await carregarDentistas();
  configurarEventos();
  configurarAutocomplete();
});

/* ══════════════════════════════════════
   DENTISTAS
══════════════════════════════════════ */
async function carregarDentistas() {
  const select = document.getElementById('selectDentista');
  try {
    const res  = await apiGetDentistas();
    const lista = res?.dados ?? res ?? [];
    select.innerHTML = '<option value="">Selecione um dentista...</option>' +
      lista.map(d => `<option value="${d.id}">${d.nome}</option>`).join('');
  } catch {
    select.innerHTML = '<option value="">Erro ao carregar dentistas</option>';
  }
}

/* ══════════════════════════════════════
   CARREGAR AGENDA
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

  try {
    const res      = await apiGetAgendaDentista(dentistaId, data);
    const consultas = res?.dados ?? res ?? [];
    renderGrid(consultas, dentistaId, data);
  } catch (e) {
    document.getElementById('agendaGrid').innerHTML =
      `<div class="agenda-placeholder"><i class="fa-solid fa-triangle-exclamation"></i><p>${e.message}</p></div>`;
  }
}

/* ══════════════════════════════════════
   RENDERIZAR GRID
══════════════════════════════════════ */
function renderGrid(consultas, dentistaId, data) {
  const grid = document.getElementById('agendaGrid');

  // Indexar por hora "HH:MM"
  const porHora = {};
  consultas.forEach(c => {
    const hora = c.horaConsulta?.substring(0, 5);
    if (hora) porHora[hora] = c;
  });

  grid.innerHTML = SLOTS_HORARIOS.map(hora => {
    const consulta = porHora[hora];

    if (!consulta) {
      return `
        <div class="slot slot-livre" data-hora="${hora}" data-dentista="${dentistaId}" data-data="${data}"
             onclick="AgendaPage.abrirModal(this)">
          <div class="slot-hora">${hora}</div>
          <div class="slot-conteudo">
            <span class="slot-disponivel-label"><i class="fa-solid fa-circle-check me-1"></i>Disponível</span>
            <button class="btn-agendar-slot">
              <i class="fa-solid fa-plus"></i> Agendar
            </button>
          </div>
        </div>`;
    }

    const s    = STATUS_LABEL[consulta.status] ?? { badge: '', slotClass: '', texto: consulta.status };
    const ret  = consulta.retorno
      ? `<span class="badge-retorno">Retorno</span>`
      : '';

    return `
      <div class="slot ${s.slotClass}">
        <div class="slot-hora">${hora}</div>
        <div class="slot-conteudo">
          <div>
            <div class="slot-paciente-nome">${consulta.nomePaciente}</div>
            <div class="slot-servico-nome">${consulta.nomeServico || '—'}</div>
          </div>
          <div class="slot-badges">
            ${ret}
            <span class="status-badge ${s.badge}">${s.texto}</span>
          </div>
        </div>
      </div>`;
  }).join('');
}

/* ══════════════════════════════════════
   MODAL DE AGENDAMENTO
══════════════════════════════════════ */
const AgendaPage = {
  abrirModal(slotEl) {
    const hora      = slotEl.dataset.hora;
    const dentistaId = slotEl.dataset.dentista;
    const data      = slotEl.dataset.data;

    slotSelecionado = { dentistaId: parseInt(dentistaId), data, hora };

    // Preencher info no modal
    const nomeDentista = document.getElementById('selectDentista').selectedOptions[0]?.text ?? '—';
    document.getElementById('modalNomeDentista').textContent  = nomeDentista;
    document.getElementById('modalDataFormatada').textContent = formatarData(data);
    document.getElementById('modalHoraFormatada').textContent = hora;

    // Carregar serviços e pacientes
    Promise.all([carregarPacientesModal(), carregarServicosModal()]).then(() => {
      bootstrap.Modal.getOrCreateInstance(document.getElementById('modalAgendarSlot')).show();
    });
  },

  async confirmarAgendamento() {
    const alerta     = document.getElementById('alertaAgendarSlot');
    alerta.classList.add('d-none');

    const idPaciente = parseInt(document.getElementById('slotPacienteId').value);
    const idServico  = parseInt(document.getElementById('slotServico').value) || null;
    const retorno    = document.getElementById('slotRetorno').checked;

    if (!idPaciente) { mostrarErro('Selecione um paciente na lista.'); return; }

    const { dentistaId, data, hora } = slotSelecionado;

    const agora      = new Date();
    const hoje       = agora.toISOString().split('T')[0];
    const horaAtual  = agora.toTimeString().slice(0, 5);

    if (data < hoje) { mostrarErro('Não é possível agendar em uma data passada.'); return; }
    if (data === hoje && hora < horaAtual) { mostrarErro('Não é possível agendar em um horário que já passou.'); return; }

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
      this.resetarModal();
      await carregarAgenda();
    } catch (e) {
      mostrarErro(e.message);
    } finally {
      btn.disabled = false;
      btn.textContent = 'Agendar';
    }
  },

  resetarModal() {
    document.getElementById('slotPacienteSearch').value = '';
    document.getElementById('slotPacienteId').value     = '';
    document.getElementById('slotPacienteSugestoes').style.display = 'none';
    document.getElementById('slotRetorno').checked      = false;
    document.getElementById('alertaAgendarSlot').classList.add('d-none');
    slotSelecionado = { dentistaId: null, data: null, hora: null };
  },
};

function mostrarErro(msg) {
  const alerta = document.getElementById('alertaAgendarSlot');
  alerta.textContent = msg;
  alerta.classList.remove('d-none');
}

/* ══════════════════════════════════════
   CARREGAR DADOS PARA O MODAL
══════════════════════════════════════ */
async function carregarPacientesModal() {
  try {
    const res   = await apiGetPacientes();
    pacientesCache = (res?.dados ?? res ?? []).map(p => ({ id: p.id, nome: p.nome, cpf: p.cpf ?? '' }));
  } catch {
    pacientesCache = [];
  }
}

async function carregarServicosModal() {
  const select = document.getElementById('slotServico');
  select.innerHTML = '<option value="">Nenhum</option>';
  try {
    const res   = await apiGetServicos();
    const lista = res?.dados ?? res ?? [];
    lista.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.id;
      opt.textContent = s.nome;
      select.appendChild(opt);
    });
  } catch { /* mantém apenas "Nenhum" */ }
}

/* ══════════════════════════════════════
   AUTOCOMPLETE PACIENTE
══════════════════════════════════════ */
function configurarAutocomplete() {
  const input     = document.getElementById('slotPacienteSearch');
  const hiddenId  = document.getElementById('slotPacienteId');
  const sugestoes = document.getElementById('slotPacienteSugestoes');

  input.addEventListener('input', () => {
    hiddenId.value = '';
    const termo = input.value.trim().toLowerCase();
    if (!termo) { sugestoes.style.display = 'none'; return; }
    const filtrados = pacientesCache.filter(p => p.nome.toLowerCase().includes(termo)).slice(0, 8);
    renderSugestoes(filtrados, input, hiddenId, sugestoes);
  });

  sugestoes.addEventListener('mousedown', (e) => {
    const btn = e.target.closest('[data-id]');
    if (!btn) return;
    const p = pacientesCache.find(x => x.id === parseInt(btn.dataset.id));
    if (p) {
      input.value    = p.nome;
      hiddenId.value = p.id;
      sugestoes.style.display = 'none';
    }
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('#slotPacienteSearch') && !e.target.closest('#slotPacienteSugestoes')) {
      sugestoes.style.display = 'none';
    }
  });
}

function renderSugestoes(lista, input, hiddenId, box) {
  if (!lista.length) { box.style.display = 'none'; return; }
  box.innerHTML = lista.map(p => `
    <button type="button" class="list-group-item list-group-item-action py-2 px-3" data-id="${p.id}">
      <div class="fw-semibold" style="font-size:.85rem;">${p.nome}</div>
      ${p.cpf ? `<div class="text-muted" style="font-size:.75rem;">${formatCPF(p.cpf)}</div>` : ''}
    </button>`).join('');
  box.style.display = 'block';
}

function formatCPF(cpf) {
  const d = cpf.replace(/\D/g, '');
  return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/* ══════════════════════════════════════
   EVENTOS DOS FILTROS
══════════════════════════════════════ */
function configurarEventos() {
  document.getElementById('selectDentista').addEventListener('change', carregarAgenda);
  document.getElementById('inputData').addEventListener('change', carregarAgenda);

  document.getElementById('btnHoje').addEventListener('click', () => {
    document.getElementById('inputData').value = new Date().toISOString().split('T')[0];
    carregarAgenda();
  });

  document.getElementById('btnDiaAnterior').addEventListener('click', () => {
    mudarDia(-1);
  });

  document.getElementById('btnProximoDia').addEventListener('click', () => {
    mudarDia(1);
  });
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
