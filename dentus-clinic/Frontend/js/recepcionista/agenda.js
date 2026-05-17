/**
 * agenda.js — Agenda semanal (Recepcionista)
 * Layout Teams: visão semanal com agendamento, edição e cancelamento.
 */

document.addEventListener('DOMContentLoaded', async () => {

  SidebarComponent.render('sidebarContainer', { perfil: 'recepcionista', ativo: 'agenda' });
  document.getElementById('btnHamburger')?.addEventListener('click', () => SidebarComponent.toggleSidebar());

  await Promise.all([
    carregarDentistas(),
    carregarPacientes(),
    carregarServicos(),
  ]);

  configurarNavegacao();
  configurarAutocompleteAgendar();
  configurarAutocompleteEditar();

  updateAll();
});

/* ══════════════════════════════════════
   CONFIGURAÇÃO
══════════════════════════════════════ */
const CELL_H     = 48;
const HOUR_START = 8;
const SLOT_MIN   = 30;
const HOUR_COUNT = 27; // 08:00 → 21:00, de 30 em 30 min

const MONTHS_PT = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
                   'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const DAY_ABBR  = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
const DAY_FULL  = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];

const STATUS_CORES = {
  'Agendada':    { bg: '#4f46e5', text: '#fff', border: 'none' },
  'Aguardando':  { bg: '#d97706', text: '#fff', border: 'none' },
  'Em Consulta': { bg: '#0d9488', text: '#fff', border: 'none' },
  'Encerrada':   { bg: '#6b7280', text: '#fff', border: 'none' },
  'Cancelada':   { bg: 'rgba(220,38,38,.35)', text: '#fff', border: 'none' },
};

const STATUS_LABEL = {
  'Agendada':    { badge: 'status-agendada',    texto: 'Agendada'    },
  'Aguardando':  { badge: 'status-em-fila',     texto: 'Em Fila'     },
  'Em Consulta': { badge: 'status-em-consulta', texto: 'Em Consulta' },
  'Encerrada':   { badge: 'status-encerrada',   texto: 'Encerrada'   },
  'Cancelada':   { badge: 'status-cancelada',   texto: 'Cancelada'   },
};

/* ══════════════════════════════════════
   ESTADO
══════════════════════════════════════ */
let weekOffset      = 0;
let diaAtivo        = 0;
let dadosSemana     = [];
let pacientesCache  = [];
let dentistasCache  = [];
let servicosCache   = [];
let consultaEmEdicao = null;
let slotSelecionado  = { dentistaId: null, data: null, hora: null };

/* ══════════════════════════════════════
   HELPERS
══════════════════════════════════════ */
function getMonday(offset = 0) {
  const today = new Date();
  const dow   = today.getDay();
  const d     = new Date(today);
  d.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1) + offset * 7);
  d.setHours(0, 0, 0, 0);
  return d;
}

function dateKey(d) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function toISODate(d) {
  const y  = d.getFullYear();
  const m  = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

function formatarData(iso) {
  const [y, m, d] = String(iso).split('-');
  return `${d}/${m}/${y}`;
}

function formatarHora(horaStr) {
  return horaStr ? horaStr.slice(0, 5) : '';
}

function getWeekNumber(d) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
}

function slotToTime(idx) {
  const mins = HOUR_START * 60 + idx * SLOT_MIN;
  return `${String(Math.floor(mins / 60)).padStart(2,'0')}:${String(mins % 60).padStart(2,'0')}`;
}

function getDentistaId() {
  const sel = document.getElementById('selectDentista');
  return sel?.value || '';
}

function getDentistaNome() {
  const sel = document.getElementById('selectDentista');
  const opt = sel?.selectedOptions[0];
  return (opt && opt.value) ? opt.text : '—';
}

/* ══════════════════════════════════════
   CARGA DE DADOS
══════════════════════════════════════ */
async function carregarDentistas() {
  try {
    const res = await apiGetDentistas();
    dentistasCache = res?.dados ?? res ?? [];
    const opts = dentistasCache.map(d => `<option value="${d.id}">${d.nome}</option>`).join('');
    document.getElementById('selectDentista').innerHTML       = opts;
    document.getElementById('selectDentistaMobile').innerHTML =
      '<option value="">Selecione um dentista…</option>' + opts;
    // Auto-seleciona mobile com o mesmo valor do desktop
    if (dentistasCache.length > 0) {
      document.getElementById('selectDentistaMobile').value = dentistasCache[0].id;
    }
  } catch {
    document.getElementById('selectDentista').innerHTML = '<option value="">Erro ao carregar</option>';
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
    _preencherSelectServico('slotServico');
    _preencherSelectServico('editServico');
  } catch { /* mantém vazio */ }
}

function _preencherSelectServico(id) {
  const sel = document.getElementById(id);
  if (!sel) return;
  sel.innerHTML = '<option value="">Nenhum</option>' +
    servicosCache.map(s => `<option value="${s.id}">${s.nome}</option>`).join('');
}

/* ══════════════════════════════════════
   CARREGAR SEMANA DA API
══════════════════════════════════════ */
async function carregarSemana() {
  dadosSemana = Array.from({ length: 7 }, () =>
    Array.from({ length: HOUR_COUNT }, () => ({ occupied: false }))
  );

  const dentistaId = getDentistaId();
  if (!dentistaId) return;

  const monday = getMonday(weekOffset);
  const datas  = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return toISODate(d);
  });

  try {
    const resultados = await Promise.all(
      datas.map(data => apiGetAgendaDentista(dentistaId, data).catch(() => null))
    );

    resultados.forEach((res, dayIdx) => {
      const consultas = res?.dados ?? [];
      consultas.forEach(c => {
        const parts = (c.horaConsulta || '00:00:00').split(':');
        const hh = parseInt(parts[0]);
        const mm = parseInt(parts[1] || '0');
        const h  = Math.round(((hh - HOUR_START) * 60 + mm) / SLOT_MIN);
        if (h >= 0 && h < HOUR_COUNT && !dadosSemana[dayIdx][h].occupied) {
          dadosSemana[dayIdx][h] = {
            occupied:      true,
            id:            c.id,
            nome:          c.nomePaciente,
            servico:       c.nomeServico || '—',
            hora:          slotToTime(h),
            data:          datas[dayIdx],
            status:        c.status || '',
            idPaciente:    c.idPaciente,
            idDentista:    parseInt(dentistaId),
            nomeDentista:  getDentistaNome(),
            idServico:     c.idServico,
            retorno:       c.retorno,
          };
        }
      });
    });
  } catch (err) {
    console.error('Erro ao carregar agenda:', err.message);
  }
}

/* ══════════════════════════════════════
   DESKTOP — cabeçalho
══════════════════════════════════════ */
function updateHeaders() {
  const monday   = getMonday(weekOffset);
  const sunday   = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const todayKey = dateKey(new Date());

  const label = document.getElementById('monthYearLabel');
  if (label) {
    if (monday.getMonth() === sunday.getMonth()) {
      label.textContent = `${MONTHS_PT[monday.getMonth()]} ${monday.getFullYear()}`;
    } else {
      label.textContent = `${MONTHS_PT[monday.getMonth()].slice(0,3)} — ${MONTHS_PT[sunday.getMonth()].slice(0,3)} ${monday.getFullYear()}`;
    }
  }

  for (let d = 0; d < 7; d++) {
    const day     = new Date(monday);
    day.setDate(monday.getDate() + d);
    const isToday = dateKey(day) === todayKey;
    const el      = document.getElementById(`day-${d}`);
    if (!el) continue;
    el.className = 'tcal-head-day' + (isToday ? ' today' : '');
    el.querySelector('.tcal-abbr').textContent = DAY_ABBR[day.getDay()];
    el.querySelector('.tcal-num').textContent  = day.getDate();
  }
}

/* ══════════════════════════════════════
   DESKTOP — grade
══════════════════════════════════════ */
function buildTimeCol() {
  const col = document.getElementById('tcalTimeCol');
  if (!col) return;
  col.innerHTML = '';
  for (let i = 0; i < HOUR_COUNT; i++) {
    const cell = document.createElement('div');
    cell.className = 'tcal-hour-cell';
    const lbl = document.createElement('span');
    lbl.className   = 'tcal-hour-lbl';
    lbl.textContent = slotToTime(i);
    cell.appendChild(lbl);
    col.appendChild(cell);
  }
}

function buildGrid() {
  const grid = document.getElementById('tcalGrid');
  if (!grid) return;

  const dentistaId = getDentistaId();
  grid.innerHTML   = '';

  const monday   = getMonday(weekOffset);
  const todayKey = dateKey(new Date());

  for (let d = 0; d < 7; d++) {
    const day     = new Date(monday);
    day.setDate(monday.getDate() + d);
    const isToday = dateKey(day) === todayKey;
    const dataISO = toISODate(day);

    const col       = document.createElement('div');
    col.className   = 'tcal-day-col' + (isToday ? ' today' : '');
    col.dataset.day = d;

    for (let h = 0; h < HOUR_COUNT; h++) {
      const cell         = document.createElement('div');
      cell.className     = 'tcal-cell';
      cell.dataset.hour  = HOUR_START + h;
      const slot         = dadosSemana[d][h];

      if (slot.occupied) {
        const cor = STATUS_CORES[slot.status] || { bg: 'var(--c1)', text: '#fff' };
        const ev  = document.createElement('div');
        ev.className   = 'tcal-event';
        ev.style.cssText = `background:${cor.bg}; color:${cor.text}; border-left:none; border-radius:6px; box-shadow:0 2px 8px rgba(0,0,0,.18);`;
        ev.innerHTML = `
          <span class="tcal-event-name"   style="color:${cor.text};">${slot.nome}</span>
          <span class="tcal-event-service" style="color:${cor.text}; opacity:.8;">${slot.servico}</span>
        `;
        ev.addEventListener('click', e => { e.stopPropagation(); AgendaRec.abrirModalDetalhe(slot); });
        cell.appendChild(ev);
      } else {
        // Slot livre — clicável para agendar
        const horaSlot = slotToTime(h);
        cell.classList.add('tcal-cell--livre');
        cell.title = `Agendar ${horaSlot}`;
        cell.addEventListener('click', () => {
          AgendaRec.abrirModalAgendar({ dentistaId, data: dataISO, hora: horaSlot });
        });
      }

      col.appendChild(cell);
    }

    grid.appendChild(col);
  }
}

/* ══════════════════════════════════════
   MOBILE
══════════════════════════════════════ */
function renderMobile() {
  const base = getMonday(weekOffset);
  _atualizarCabecalhoMobile(base);
  _renderStrip(base);
  _renderSlots(base);
}

function _atualizarCabecalhoMobile(base) {
  const semEl = document.getElementById('amSemana');
  const mesEl = document.getElementById('amMes');
  if (semEl) semEl.textContent = `Semana ${getWeekNumber(base)}`;
  if (mesEl) mesEl.textContent = `${MONTHS_PT[base.getMonth()]} ${base.getFullYear()}`;
}

function _renderStrip(base) {
  const strip    = document.getElementById('amStrip');
  if (!strip) return;
  const todayKey = dateKey(new Date());
  strip.innerHTML = '';

  for (let i = 0; i < 7; i++) {
    const d      = new Date(base);
    d.setDate(base.getDate() + i);
    const pill   = document.createElement('div');
    pill.className = 'am-day' +
      (dateKey(d) === todayKey ? ' hoje' : '') +
      (i === diaAtivo ? ' ativo' : '');
    pill.innerHTML = `<span class="am-day-nome">${DAY_ABBR[d.getDay()]}</span><span class="am-day-num">${d.getDate()}</span>`;
    pill.addEventListener('click', () => { diaAtivo = i; _renderStrip(base); _renderSlots(base); });
    strip.appendChild(pill);
  }
}

function _renderSlots(base) {
  const container  = document.getElementById('amSlots');
  if (!container) return;

  const dentistaId = getDentistaId();
  const slots      = dadosSemana[diaAtivo] || [];
  const d          = new Date(base);
  d.setDate(base.getDate() + diaAtivo);
  const dataISO    = toISODate(d);

  let html = `<div class="am-slots-titulo">${DAY_FULL[d.getDay()]}, ${d.getDate()} de ${MONTHS_PT[d.getMonth()]}</div>`;

  if (!dentistaId) {
    html += `<div class="am-vazio"><i class="fa-solid fa-user-doctor"></i><span class="am-vazio-texto">Selecione um dentista</span></div>`;
    container.innerHTML = html;
    return;
  }

  slots.forEach((slot, idx) => {
    const hora   = slotToTime(idx);
    const isLast = idx === slots.length - 1;
    const cor    = slot.occupied ? (STATUS_CORES[slot.status] || { bg: 'var(--c1)', text: '#fff' }) : null;
    html += `
      <div class="am-slot">
        <span class="am-slot-hora">${hora}</span>
        <div class="am-slot-linha">
          <span class="am-slot-dot${slot.occupied ? ' ocupado' : ''}"></span>
          ${!isLast ? '<span class="am-slot-fio"></span>' : ''}
        </div>
        <div class="am-slot-corpo">
          ${slot.occupied
            ? `<div class="am-evento" data-idx="${idx}" style="background:${cor.bg};">
                <span class="am-evento-nome" style="color:${cor.text};">${slot.nome}</span>
                <span class="am-evento-servico" style="color:${cor.text}; opacity:.8;">${slot.servico}</span>
               </div>`
            : `<button class="am-btn-agendar" data-hora="${hora}" data-data="${dataISO}" data-dentista="${dentistaId}">
                 <i class="fa-solid fa-plus"></i> Agendar
               </button>`
          }
        </div>
      </div>`;
  });

  container.innerHTML = html;

  container.querySelectorAll('.am-evento').forEach(ev => {
    const slot = slots[parseInt(ev.dataset.idx)];
    ev.addEventListener('click', () => AgendaRec.abrirModalDetalhe(slot));
  });

  container.querySelectorAll('.am-btn-agendar').forEach(btn => {
    btn.addEventListener('click', () =>
      AgendaRec.abrirModalAgendar({ dentistaId: btn.dataset.dentista, data: btn.dataset.data, hora: btn.dataset.hora })
    );
  });
}

/* ══════════════════════════════════════
   UPDATE COMPLETO
══════════════════════════════════════ */
async function updateAll() {
  await carregarSemana();
  updateHeaders();
  buildTimeCol();
  buildGrid();
  renderMobile();
}

function scrollToNow() {
  const area = document.getElementById('tcalScrollArea');
  if (!area) return;
  const now  = new Date();
  const mins = (now.getHours() - HOUR_START) * 60 + now.getMinutes();
  if (mins < 0) return;
  area.scrollTop = Math.max(0, (Math.floor(mins / SLOT_MIN) - 1) * CELL_H + 68); // +tcal-head-h
}

/* ══════════════════════════════════════
   NAVEGAÇÃO
══════════════════════════════════════ */
function configurarNavegacao() {
  document.getElementById('btnPrevWeek')?.addEventListener('click', () => { weekOffset--; diaAtivo = 0; updateAll(); });
  document.getElementById('btnNextWeek')?.addEventListener('click', () => { weekOffset++; diaAtivo = 0; updateAll(); });
  document.getElementById('btnToday')?.addEventListener('click',    () => { weekOffset = 0; diaAtivo = 0; updateAll().then(scrollToNow); });
  document.getElementById('amPrev')?.addEventListener('click',      () => { weekOffset--; diaAtivo = 0; updateAll(); });
  document.getElementById('amNext')?.addEventListener('click',      () => { weekOffset++; diaAtivo = 0; updateAll(); });

  document.getElementById('selectDentista')?.addEventListener('change', () => {
    const v = document.getElementById('selectDentista').value;
    document.getElementById('selectDentistaMobile').value = v;
    diaAtivo = 0;
    updateAll().then(scrollToNow);
  });

  document.getElementById('selectDentistaMobile')?.addEventListener('change', () => {
    const v = document.getElementById('selectDentistaMobile').value;
    document.getElementById('selectDentista').value = v;
    diaAtivo = 0;
    updateAll().then(scrollToNow);
  });
}

/* ══════════════════════════════════════
   OBJETO AgendaRec — modais
══════════════════════════════════════ */
const AgendaRec = {

  /* ── Abrir modal de agendamento (slot vazio) ── */
  abrirModalAgendar({ dentistaId, data, hora }) {
    slotSelecionado = { dentistaId: parseInt(dentistaId), data, hora };

    document.getElementById('modalNomeDentista').textContent  = getDentistaNome();
    document.getElementById('modalDataFormatada').textContent = formatarData(data);
    document.getElementById('modalHoraFormatada').textContent = hora;
    document.getElementById('slotPacienteSearch').value       = '';
    document.getElementById('slotPacienteId').value           = '';
    document.getElementById('slotRetorno').checked            = false;
    document.getElementById('alertaAgendarSlot').classList.add('d-none');
    _preencherSelectServico('slotServico');

    bootstrap.Modal.getOrCreateInstance(document.getElementById('modalAgendarSlot')).show();
  },

  async confirmarAgendamento() {
    const alerta     = document.getElementById('alertaAgendarSlot');
    alerta.classList.add('d-none');

    const idPaciente = parseInt(document.getElementById('slotPacienteId').value);
    const idServico  = parseInt(document.getElementById('slotServico').value) || null;
    const retorno    = document.getElementById('slotRetorno').checked;

    if (!idPaciente) { this._erroAgendar('Selecione um paciente na lista.'); return; }

    const { dentistaId, data, hora } = slotSelecionado;
    const agora     = new Date();
    const hoje      = agora.toISOString().split('T')[0];
    const horaAtual = agora.toTimeString().slice(0, 5);

    if (data < hoje)                       { this._erroAgendar('Não é possível agendar em uma data passada.'); return; }
    if (data === hoje && hora < horaAtual) { this._erroAgendar('Não é possível agendar em um horário que já passou.'); return; }

    const btn = document.getElementById('btnConfirmarAgendarSlot');
    btn.disabled = true; btn.textContent = 'Agendando…';

    try {
      await apiAgendarConsulta({ idPaciente, idDentista: dentistaId, dataConsulta: data, horaConsulta: hora + ':00', idServico, retorno });
      bootstrap.Modal.getOrCreateInstance(document.getElementById('modalAgendarSlot')).hide();
      this.resetarModalAgendar();
      await updateAll();
    } catch (e) {
      this._erroAgendar(e.message);
    } finally {
      btn.disabled = false; btn.textContent = 'Agendar';
    }
  },

  _erroAgendar(msg) {
    const a = document.getElementById('alertaAgendarSlot');
    a.textContent = msg; a.classList.remove('d-none');
  },

  resetarModalAgendar() {
    document.getElementById('slotPacienteSearch').value = '';
    document.getElementById('slotPacienteId').value     = '';
    document.getElementById('slotPacienteSugestoes').style.display = 'none';
    document.getElementById('slotRetorno').checked      = false;
    document.getElementById('alertaAgendarSlot').classList.add('d-none');
    slotSelecionado = { dentistaId: null, data: null, hora: null };
  },

  /* ── Abrir modal de detalhe (slot ocupado) ── */
  abrirModalDetalhe(slot) {
    consultaEmEdicao = slot;

    document.getElementById('dtlPaciente').textContent = slot.nome;
    document.getElementById('dtlDentista').textContent = slot.nomeDentista || getDentistaNome();
    document.getElementById('dtlData').textContent     = formatarData(slot.data);
    document.getElementById('dtlHora').textContent     = slot.hora;
    document.getElementById('dtlServico').textContent  = slot.servico;

    const s = STATUS_LABEL[slot.status] ?? { badge: '', texto: slot.status };
    document.getElementById('dtlStatus').innerHTML = `<span class="status-badge ${s.badge}">${s.texto}</span>`;

    document.getElementById('dtlRetorno').classList.toggle('d-none', !slot.retorno);

    const editavel = !['Encerrada', 'Cancelada'].includes(slot.status);
    document.getElementById('btnEditarConsulta').classList.toggle('d-none', !editavel);
    document.getElementById('btnCancelarConsulta').classList.toggle('d-none', !editavel);

    this._mostrarView('viewInfo');
    bootstrap.Modal.getOrCreateInstance(document.getElementById('modalDetalhe')).show();
  },

  _mostrarView(id) {
    ['viewInfo','viewCancelar','viewEditar'].forEach(v =>
      document.getElementById(v).classList.toggle('d-none', v !== id)
    );
    document.getElementById('alertaCancelar').classList.add('d-none');
    document.getElementById('alertaEditarDetalhe').classList.add('d-none');
  },

  voltarInfo()          { this._mostrarView('viewInfo'); },
  mostrarViewCancelar() { this._mostrarView('viewCancelar'); },

  mostrarViewEditar() {
    if (!consultaEmEdicao) return;
    const c = consultaEmEdicao;

    document.getElementById('editPacienteSearch').value = c.nome;
    document.getElementById('editPacienteId').value     = c.idPaciente;

    const selDentista = document.getElementById('editDentista');
    selDentista.innerHTML = dentistasCache.map(d =>
      `<option value="${d.id}" ${d.id === c.idDentista ? 'selected' : ''}>${d.nome}</option>`
    ).join('');

    document.getElementById('editData').value = c.data;
    document.getElementById('editHora').value = c.hora;

    const selServico = document.getElementById('editServico');
    selServico.innerHTML = '<option value="">Nenhum</option>' +
      servicosCache.map(s => `<option value="${s.id}" ${s.id === c.idServico ? 'selected' : ''}>${s.nome}</option>`).join('');

    document.getElementById('editRetorno').checked = !!c.retorno;

    this._mostrarView('viewEditar');
  },

  async confirmarCancelar() {
    if (!consultaEmEdicao) return;
    const btn = document.getElementById('btnConfirmarCancelar');
    btn.disabled = true; btn.textContent = 'Cancelando…';
    try {
      await apiCancelarConsulta(consultaEmEdicao.id);
      bootstrap.Modal.getOrCreateInstance(document.getElementById('modalDetalhe')).hide();
      this.resetarModalDetalhe();
      await updateAll();
    } catch (e) {
      const a = document.getElementById('alertaCancelar');
      a.textContent = e.message; a.classList.remove('d-none');
    } finally {
      btn.disabled = false; btn.textContent = 'Sim, Cancelar';
    }
  },

  async confirmarEdicao() {
    if (!consultaEmEdicao) return;

    const idPaciente = parseInt(document.getElementById('editPacienteId').value);
    const idDentista = parseInt(document.getElementById('editDentista').value);
    const data       = document.getElementById('editData').value;
    const hora       = document.getElementById('editHora').value;
    const idServico  = parseInt(document.getElementById('editServico').value) || null;
    const retorno    = document.getElementById('editRetorno').checked;

    document.getElementById('alertaEditarDetalhe').classList.add('d-none');

    if (!idPaciente) { this._erroEditar('Selecione um paciente na lista.'); return; }
    if (!idDentista) { this._erroEditar('Selecione um dentista.'); return; }
    if (!data)       { this._erroEditar('Informe a data.'); return; }
    if (!hora)       { this._erroEditar('Informe o horário.'); return; }

    const btn = document.getElementById('btnSalvarEdicao');
    btn.disabled = true; btn.textContent = 'Salvando…';

    try {
      await apiEditarConsulta(consultaEmEdicao.id, { idPaciente, idDentista, dataConsulta: data, horaConsulta: hora + ':00', idServico, retorno });
      bootstrap.Modal.getOrCreateInstance(document.getElementById('modalDetalhe')).hide();
      this.resetarModalDetalhe();
      // Se o dentista mudou, seleciona no filtro
      document.getElementById('selectDentista').value       = idDentista;
      document.getElementById('selectDentistaMobile').value = idDentista;
      await updateAll();
    } catch (e) {
      this._erroEditar(e.message);
    } finally {
      btn.disabled = false; btn.textContent = 'Salvar';
    }
  },

  _erroEditar(msg) {
    const a = document.getElementById('alertaEditarDetalhe');
    a.textContent = msg; a.classList.remove('d-none');
  },

  resetarModalDetalhe() {
    consultaEmEdicao = null;
    document.getElementById('editPacienteSearch').value = '';
    document.getElementById('editPacienteId').value     = '';
    document.getElementById('editPacienteSugestoes').style.display = 'none';
  },
};

/* ══════════════════════════════════════
   AUTOCOMPLETE
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
    const termo  = input.value.trim().toLowerCase();
    if (!termo) { sugestoes.style.display = 'none'; return; }
    const filtrados = pacientesCache.filter(p => p.nome.toLowerCase().includes(termo)).slice(0, 8);
    _renderSugestoes(filtrados, hidden, sugestoes);
  });

  sugestoes.addEventListener('mousedown', e => {
    const btn = e.target.closest('[data-id]');
    if (!btn) return;
    const p = pacientesCache.find(x => x.id === parseInt(btn.dataset.id));
    if (p) { input.value = p.nome; hidden.value = p.id; sugestoes.style.display = 'none'; }
  });

  document.addEventListener('click', e => {
    if (!e.target.closest(`#${inputId}`) && !e.target.closest(`#${sugestoesId}`))
      sugestoes.style.display = 'none';
  });
}

function _renderSugestoes(lista, hidden, box) {
  if (!lista.length) { box.style.display = 'none'; return; }
  box.innerHTML = lista.map(p => `
    <button type="button" class="list-group-item list-group-item-action py-2 px-3" data-id="${p.id}">
      <div class="fw-semibold" style="font-size:.85rem;">${p.nome}</div>
      ${p.cpf ? `<div class="text-muted" style="font-size:.75rem;">${_formatCPF(p.cpf)}</div>` : ''}
    </button>`).join('');
  box.style.display = 'block';
}

function _formatCPF(cpf) {
  const d = cpf.replace(/\D/g, '');
  return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}
