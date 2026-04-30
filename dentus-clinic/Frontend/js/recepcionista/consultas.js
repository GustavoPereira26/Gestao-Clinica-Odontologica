/**
 * consultas.js — Página de gerenciamento de consultas (Recepcionista)
 * Padrão idêntico ao pacientes.js
 */

let CONSULTAS = [];

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
    document.getElementById('modalErro').classList.add('hidden');
    document.getElementById('modalErro').textContent = '';
    document.getElementById('modalConfirmacao').classList.remove('hidden');
  },
  hide() {
    document.getElementById('modalConfirmacao').classList.add('hidden');
    this._cb = null;
  },
  async confirmar() {
    if (typeof this._cb !== 'function') return;

    const btnConfirmar = document.getElementById('btnModalConfirmar');
    const btnCancelar  = document.getElementById('btnModalCancelar');
    const erroEl       = document.getElementById('modalErro');

    btnConfirmar.disabled = true;
    btnCancelar.disabled  = true;
    btnConfirmar.textContent = 'Cancelando...';
    erroEl.classList.add('hidden');

    try {
      await this._cb();
      this.hide();
    } catch (erro) {
      erroEl.textContent = erro.message || 'Erro ao cancelar. Tente novamente.';
      erroEl.classList.remove('hidden');
    } finally {
      btnConfirmar.disabled = false;
      btnCancelar.disabled  = false;
      btnConfirmar.textContent = 'Cancelar consulta';
    }
  }
};

/* ══════════════════════════════════════
   CARREGAMENTO DA API
══════════════════════════════════════ */
async function carregarConsultas() {
  try {
    const res = await apiGetConsultas();
    CONSULTAS = (res.dados || []).map(c => ({
      id:         c.id,
      paciente:   c.nomePaciente,
      idPaciente: c.idPaciente,
      data:       c.dataConsulta,
      hora:       (c.horaConsulta || '').slice(0, 5),
      doutor:     c.nomeDentista,
      idDentista: c.idDentista,
      servico:    c.nomeServico || '—',
      idServico:  c.idServico || null,
      retorno:    c.retorno || false,
      status:     c.status || ''
    }));
    dadosAtivos = [...CONSULTAS];
    TabelaConsultas.render(dadosAtivos);
    CardsMobileConsultas.render(dadosAtivos);
    atualizarBadge(dadosAtivos.length);
  } catch (erro) {
    console.error('Erro ao carregar consultas:', erro.message);
  }
}

/* ══════════════════════════════════════
   FILTROS
══════════════════════════════════════ */
let dadosAtivos = [];

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
    const el = document.getElementById(id);
    if (el) el.value = '';
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
let idParaInativar = null;

async function inativarConsulta(id) {
  await apiInativarConsulta(id);
  CONSULTAS   = CONSULTAS.filter(c => c.id !== id);
  dadosAtivos = dadosAtivos.filter(c => c.id !== id);
  TabelaConsultas.render(dadosAtivos);
  CardsMobileConsultas.render(dadosAtivos);
  atualizarBadge(dadosAtivos.length);
}

/* ══════════════════════════════════════
   INIT
══════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initSidebar();
  initHamburger();

  // Carrega consultas da API
  carregarConsultas();

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
  document.getElementById('btnAgendar')?.addEventListener('click', abrirModalAgendar);

  // Botão confirmar edição
  document.getElementById('btnConfirmarEdicao')?.addEventListener('click', confirmarEdicao);

  // Dentista no modal de edição → recarrega serviços
  document.getElementById('edtDentista')?.addEventListener('change', async (e) => {
    const idDentista = parseInt(e.target.value) || null;
    if (!idDentista) {
      document.getElementById('edtServico').innerHTML = '<option value="">Selecione um dentista primeiro</option>';
      document.getElementById('edtServico').disabled  = true;
      return;
    }
    await carregarServicosEditar(idDentista, null);
  });

  // Autocomplete de paciente no modal de edição
  document.getElementById('edtPacienteSearch')?.addEventListener('input', (e) => {
    if (consultaEditando) consultaEditando.idPaciente = null;
    const termo = e.target.value.trim().toLowerCase();
    if (!termo) { document.getElementById('edtPacienteSugestoes').style.display = 'none'; return; }
    const filtrados = edtPacientesCache.filter(p => p.nome.toLowerCase().includes(termo));
    renderSugestoesEdt(filtrados);
  });

  document.getElementById('edtPacienteSugestoes')?.addEventListener('mousedown', (e) => {
    e.preventDefault();
    const btn = e.target.closest('button[data-id]');
    if (!btn) return;
    const paciente = edtPacientesCache.find(p => p.id === parseInt(btn.dataset.id));
    if (paciente) {
      if (consultaEditando) consultaEditando.idPaciente = paciente.id;
      document.getElementById('edtPacienteSearch').value        = paciente.nome;
      document.getElementById('edtPacienteSugestoes').style.display = 'none';
    }
  });

  document.addEventListener('mousedown', (e) => {
    if (!e.target.closest('#edtPacienteSearch') && !e.target.closest('#edtPacienteSugestoes')) {
      document.getElementById('edtPacienteSugestoes').style.display = 'none';
    }
  });

  // Ao selecionar dentista, carrega serviços da especialidade dele
  document.getElementById('agdDentista')?.addEventListener('change', async (e) => {
    const selOpt = e.target.selectedOptions[0];
    const idEspecialidade = selOpt?.dataset.especialidade;
    const selServico = document.getElementById('agdServico');

    if (!idEspecialidade) {
      selServico.innerHTML = '<option value="">Selecione um dentista primeiro</option>';
      selServico.disabled = true;
      return;
    }

    selServico.innerHTML = '<option value="">Carregando...</option>';
    selServico.disabled = true;

    try {
      const res = await apiGetServicosPorEspecialidade(idEspecialidade);
      const servicos = res.dados || [];
      if (servicos.length === 0) {
        selServico.innerHTML = '<option value="">Nenhum serviço cadastrado para esta especialidade</option>';
      } else {
        selServico.innerHTML = '<option value="">Nenhum</option>' +
          servicos.map(s => `<option value="${s.id}">${s.nome}</option>`).join('');
        selServico.disabled = false;
      }
    } catch {
      selServico.innerHTML = '<option value="">Erro ao carregar serviços</option>';
    }
  });

  // Autocomplete de paciente no modal — filtra ao digitar
  document.getElementById('agdPacienteSearch')?.addEventListener('input', (e) => {
    document.getElementById('agdPaciente').value = '';
    const termo = e.target.value.trim().toLowerCase();
    if (!termo) { fecharSugestoes(); return; }
    const filtrados = pacientesCache.filter(p => p.nome.toLowerCase().includes(termo));
    renderSugestoes(filtrados);
  });

  // Autocomplete de paciente — seleciona ao clicar na sugestão (delegação no container)
  document.getElementById('agdPacienteSugestoes')?.addEventListener('mousedown', (e) => {
    e.preventDefault();
    const btn = e.target.closest('button[data-id]');
    if (!btn) return;
    const paciente = pacientesCache.find(p => p.id === parseInt(btn.dataset.id));
    if (paciente) selecionarPaciente(paciente.id, paciente.nome);
  });

  // Fecha sugestões ao clicar fora
  document.addEventListener('mousedown', (e) => {
    if (!e.target.closest('#agdPacienteSearch') && !e.target.closest('#agdPacienteSugestoes')) {
      fecharSugestoes();
    }
  });
});

/* ══════════════════════════════════════
   MODAL DE AGENDAMENTO
══════════════════════════════════════ */
let pacientesCache = [];
let dentistasCache = [];

function formatCPF(cpf) {
  const d = cpf.replace(/\D/g, '');
  if (d.length !== 11) return cpf;
  return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9)}`;
}

function renderSugestoes(lista) {
  const box = document.getElementById('agdPacienteSugestoes');
  if (lista.length === 0) {
    box.innerHTML = '<div class="list-group-item text-muted py-2 px-3">Nenhum paciente encontrado</div>';
  } else {
    box.innerHTML = lista.map(p => `
      <button type="button"
              class="list-group-item list-group-item-action py-2 px-3"
              data-id="${p.id}">
        <div class="fw-semibold">${p.nome}</div>
        <small class="text-muted">CPF: ${formatCPF(p.cpf)}</small>
      </button>
    `).join('');
  }
  box.style.display = 'block';
}

function selecionarPaciente(id, nome) {
  document.getElementById('agdPaciente').value        = id;
  document.getElementById('agdPacienteSearch').value  = nome;
  document.getElementById('agdPacienteSugestoes').style.display = 'none';
}

function fecharSugestoes() {
  document.getElementById('agdPacienteSugestoes').style.display = 'none';
}

function renderSugestoesEdt(lista) {
  const box = document.getElementById('edtPacienteSugestoes');
  if (lista.length === 0) {
    box.innerHTML = '<div class="list-group-item text-muted py-2 px-3">Nenhum paciente encontrado</div>';
  } else {
    box.innerHTML = lista.map(p => `
      <button type="button"
              class="list-group-item list-group-item-action py-2 px-3"
              data-id="${p.id}">
        <div class="fw-semibold">${p.nome}</div>
        <small class="text-muted">CPF: ${formatCPF(p.cpf)}</small>
      </button>
    `).join('');
  }
  box.style.display = 'block';
}

async function abrirModalAgendar() {
  resetarModalAgendar();
  bootstrap.Modal.getOrCreateInstance(document.getElementById('modalAgendar')).show();

  try {
    const [resPacientes, resDentistas] = await Promise.all([
      apiGetPacientes(),
      apiGetDentistas()
    ]);

    pacientesCache = resPacientes.dados || [];
    dentistasCache = resDentistas.dados || [];

    const selDentista = document.getElementById('agdDentista');
    selDentista.innerHTML = '<option value="">Selecione um dentista</option>' +
      dentistasCache.map(d => `<option value="${d.id}" data-especialidade="${d.idEspecialidade}">${d.nome}</option>`).join('');

    document.getElementById('agdServico').innerHTML = '<option value="">Selecione um dentista primeiro</option>';
    document.getElementById('agdServico').disabled = true;

    // Ativa busca de paciente
    const searchInput = document.getElementById('agdPacienteSearch');
    searchInput.disabled = false;
    searchInput.placeholder = 'Digite o nome do paciente...';
  } catch (erro) {
    mostrarErroAgendar('Erro ao carregar dados: ' + erro.message);
  }
}

async function confirmarAgendamento() {
  const alerta = document.getElementById('alertaAgendar');
  alerta.classList.add('d-none');

  const idPaciente = parseInt(document.getElementById('agdPaciente').value);
  const idDentista = parseInt(document.getElementById('agdDentista').value);
  const data       = document.getElementById('agdData').value;
  const hora       = document.getElementById('agdHora').value;
  const idServico  = parseInt(document.getElementById('agdServico').value) || null;
  const retorno    = document.getElementById('agdRetorno').checked;

  const agora = new Date();
  const hoje  = agora.toISOString().split('T')[0];
  const horaAtual = agora.toTimeString().slice(0, 5);

  if (!idPaciente) { mostrarErroAgendar('Selecione um paciente na lista.'); return; }
  if (!idDentista) { mostrarErroAgendar('Selecione um dentista.'); return; }
  if (!data)       { mostrarErroAgendar('Informe a data da consulta.'); return; }
  if (data < hoje) { mostrarErroAgendar('Não é possível agendar uma consulta em uma data passada.'); return; }
  if (!hora)       { mostrarErroAgendar('Informe o horário da consulta.'); return; }
  if (data === hoje && hora < horaAtual) { mostrarErroAgendar('Não é possível agendar uma consulta em um horário que já passou.'); return; }

  try {
    await apiAgendarConsulta({
      dataConsulta: data,
      horaConsulta: hora + ':00',
      retorno,
      idDentista,
      idPaciente,
      idServico
    });

    bootstrap.Modal.getOrCreateInstance(document.getElementById('modalAgendar')).hide();
    resetarModalAgendar();
    await carregarConsultas();
  } catch (erro) {
    mostrarErroAgendar(erro.message);
  }
}

function mostrarErroAgendar(msg) {
  const alerta = document.getElementById('alertaAgendar');
  alerta.innerHTML = msg.split('\n').map(m => `<div>${m}</div>`).join('');
  alerta.classList.remove('d-none');
}

function resetarModalAgendar() {
  pacientesCache = [];
  document.getElementById('agdPacienteSearch').value          = '';
  document.getElementById('agdPacienteSearch').disabled        = true;
  document.getElementById('agdPacienteSearch').placeholder     = 'Carregando...';
  document.getElementById('agdPaciente').value                 = '';
  document.getElementById('agdPacienteSugestoes').style.display = 'none';
  dentistasCache = [];
  document.getElementById('agdDentista').innerHTML             = '<option value="">Carregando...</option>';
  document.getElementById('agdServico').innerHTML              = '<option value="">Selecione um dentista primeiro</option>';
  document.getElementById('agdServico').disabled               = true;
  document.getElementById('agdData').value                     = '';
  document.getElementById('agdHora').value                     = '';
  document.getElementById('agdRetorno').checked                = false;
  document.getElementById('alertaAgendar').classList.add('d-none');
}

function handleAcaoTabela(e) {
  const btn = e.target.closest('.btn-acao');
  if (!btn) return;
  const id = Number(btn.dataset.id);
  const consulta = CONSULTAS.find(c => c.id === id);
  if (!consulta) return;

  if (btn.classList.contains('btn-visualizar')) {
    alert(`Consulta de ${consulta.paciente}\nData: ${formatarData(consulta.data)} às ${consulta.hora}\nDentista: ${consulta.doutor}\nServiço: ${consulta.servico}\nStatus: ${consulta.status}`);
  } else if (btn.classList.contains('btn-editar')) {
    abrirModalEditar(id);
  } else if (btn.classList.contains('btn-excluir')) {
    idParaInativar = id;
    ModalConfirmacao.show(consulta.paciente, () => inativarConsulta(idParaInativar));
  }
}

function handleAcaoMobile(e) {
  const btn = e.target.closest('.btn-excluir');
  if (!btn) return;
  const id = Number(btn.dataset.id);
  const consulta = CONSULTAS.find(c => c.id === id);
  if (!consulta) return;
  idParaInativar = id;
  ModalConfirmacao.show(consulta.paciente, () => inativarConsulta(idParaInativar));
}

/* ══════════════════════════════════════
   MODAL DE EDIÇÃO
══════════════════════════════════════ */
let consultaEditando  = null;
let edtPacientesCache = [];
let edtDentistasCache = [];

async function abrirModalEditar(id) {
  resetarModalEditar();
  consultaEditando = { id };
  bootstrap.Modal.getOrCreateInstance(document.getElementById('modalEditar')).show();

  try {
    const [resConsulta, resPacientes, resDentistas] = await Promise.all([
      apiGetConsultaPorId(id),
      apiGetPacientes(),
      apiGetDentistas()
    ]);

    const c             = resConsulta.dados;
    edtPacientesCache   = resPacientes.dados || [];
    edtDentistasCache   = resDentistas.dados || [];

    // Resolve IDs: prefere o que veio da API, senão busca pelo nome na lista
    const idPaciente = c.idPaciente
      || edtPacientesCache.find(p => p.nome === c.nomePaciente)?.id
      || null;
    const idDentista = c.idDentista
      || edtDentistasCache.find(d => d.nome === c.nomeDentista)?.id
      || null;

    consultaEditando = { id: c.id, idPaciente, idDentista, idServico: c.idServico || null };

    // Preenche dentistas
    document.getElementById('edtDentista').innerHTML =
      '<option value="">Selecione um dentista</option>' +
      edtDentistasCache.map(d =>
        `<option value="${d.id}" data-especialidade="${d.idEspecialidade}"${d.id === idDentista ? ' selected' : ''}>${d.nome}</option>`
      ).join('');

    // Preenche paciente
    const searchInput       = document.getElementById('edtPacienteSearch');
    searchInput.disabled    = false;
    searchInput.placeholder = 'Digite o nome do paciente...';
    searchInput.value       = c.nomePaciente;

    // Data, hora, retorno
    document.getElementById('edtData').value      = c.dataConsulta;
    document.getElementById('edtHora').value      = (c.horaConsulta || '').slice(0, 5);
    document.getElementById('edtRetorno').checked = c.retorno;

    // Carrega serviços da especialidade do dentista atual
    await carregarServicosEditar(idDentista, c.idServico);

  } catch (erro) {
    mostrarErroEditar('Erro ao carregar dados: ' + erro.message);
  }
}

async function carregarServicosEditar(idDentista, idServicoAtual) {
  const selDentista = document.getElementById('edtDentista');
  const selServico  = document.getElementById('edtServico');

  const opt = selDentista.querySelector(`option[value="${idDentista}"]`);
  const idEspecialidade = opt?.dataset.especialidade;

  if (!idEspecialidade) {
    selServico.innerHTML = '<option value="">Nenhum serviço disponível</option>';
    selServico.disabled  = true;
    return;
  }

  selServico.innerHTML = '<option value="">Carregando...</option>';
  selServico.disabled  = true;

  try {
    const res = await apiGetServicosPorEspecialidade(idEspecialidade);
    const servicos = res.dados || [];
    if (servicos.length === 0) {
      selServico.innerHTML = '<option value="">Nenhum serviço para esta especialidade</option>';
    } else {
      selServico.innerHTML =
        '<option value="">Nenhum</option>' +
        servicos.map(s =>
          `<option value="${s.id}"${s.id === idServicoAtual ? ' selected' : ''}>${s.nome}</option>`
        ).join('');
      selServico.disabled = false;
    }
  } catch {
    selServico.innerHTML = '<option value="">Erro ao carregar serviços</option>';
  }
}

async function confirmarEdicao() {
  if (!consultaEditando) return;

  document.getElementById('alertaEditar').classList.add('d-none');

  const idPaciente = consultaEditando.idPaciente || null;
  const idDentista = parseInt(document.getElementById('edtDentista').value) || null;
  const data       = document.getElementById('edtData').value;
  const hora       = document.getElementById('edtHora').value;
  const idServico  = parseInt(document.getElementById('edtServico').value) || null;
  const retorno    = document.getElementById('edtRetorno').checked;

  const agora = new Date();
  const hoje  = agora.toISOString().split('T')[0];
  const horaAtual = agora.toTimeString().slice(0, 5);

  if (!idPaciente) { mostrarErroEditar('Selecione um paciente na lista.'); return; }
  if (!idDentista) { mostrarErroEditar('Selecione um dentista.'); return; }
  if (!data)       { mostrarErroEditar('Informe a data da consulta.'); return; }
  if (data < hoje) { mostrarErroEditar('Não é possível alterar uma consulta para uma data passada.'); return; }
  if (!hora)       { mostrarErroEditar('Informe o horário da consulta.'); return; }
  if (data === hoje && hora < horaAtual) { mostrarErroEditar('Não é possível alterar uma consulta para um horário que já passou.'); return; }

  const btn = document.getElementById('btnConfirmarEdicao');
  btn.disabled    = true;
  btn.textContent = 'Salvando...';

  try {
    await apiEditarConsulta(consultaEditando.id, {
      dataConsulta: data,
      horaConsulta: hora + ':00',
      retorno,
      idDentista,
      idPaciente,
      idServico
    });

    bootstrap.Modal.getInstance(document.getElementById('modalEditar')).hide();
    resetarModalEditar();
    await carregarConsultas();
  } catch (erro) {
    mostrarErroEditar(erro.message);
  } finally {
    btn.disabled    = false;
    btn.textContent = 'Salvar alterações';
  }
}

function mostrarErroEditar(msg) {
  const alerta = document.getElementById('alertaEditar');
  alerta.innerHTML = msg.split('\n').map(m => `<div>${m}</div>`).join('');
  alerta.classList.remove('d-none');
}

function resetarModalEditar() {
  consultaEditando  = null;
  edtPacientesCache = [];
  edtDentistasCache = [];

  const search = document.getElementById('edtPacienteSearch');
  search.value       = '';
  search.disabled    = true;
  search.placeholder = 'Carregando...';

  document.getElementById('edtPaciente').value               = '';
  document.getElementById('edtPacienteSugestoes').style.display = 'none';
  document.getElementById('edtDentista').innerHTML           = '<option value="">Carregando...</option>';
  document.getElementById('edtServico').innerHTML            = '<option value="">Selecione um dentista primeiro</option>';
  document.getElementById('edtServico').disabled             = true;
  document.getElementById('edtData').value                   = '';
  document.getElementById('edtHora').value                   = '';
  document.getElementById('edtRetorno').checked              = false;
  document.getElementById('alertaEditar').classList.add('d-none');
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
