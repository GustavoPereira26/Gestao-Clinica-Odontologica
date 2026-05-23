// js/dentista/dashboard.js
// Dashboard do Dentista — fila de espera e painel de detalhe

// ─── Estado local ───────────────────────────────────────────────────────────
let filaConsultas    = [];   // consultas do dia com status Aguardando
let pacientesMap     = {};   // id -> PacienteResponse
let consultaAtualId  = null; // id da consulta selecionada
let planosTratamento = [];

const ESTADOS_DENTE = ['saudavel', 'selecao', 'tratado', 'ausente'];

const NOMES_DENTES = {
  11:'Incisivo Central Superior Direito', 12:'Incisivo Lateral Superior Direito',
  13:'Canino Superior Direito',           14:'Primeiro Pré-Molar Superior Direito',
  15:'Segundo Pré-Molar Superior Direito',16:'Primeiro Molar Superior Direito',
  17:'Segundo Molar Superior Direito',    18:'Terceiro Molar Superior Direito',
  21:'Incisivo Central Superior Esquerdo',22:'Incisivo Lateral Superior Esquerdo',
  23:'Canino Superior Esquerdo',          24:'Primeiro Pré-Molar Superior Esquerdo',
  25:'Segundo Pré-Molar Superior Esquerdo',26:'Primeiro Molar Superior Esquerdo',
  27:'Segundo Molar Superior Esquerdo',   28:'Terceiro Molar Superior Esquerdo',
  31:'Incisivo Central Inferior Esquerdo',32:'Incisivo Lateral Inferior Esquerdo',
  33:'Canino Inferior Esquerdo',          34:'Primeiro Pré-Molar Inferior Esquerdo',
  35:'Segundo Pré-Molar Inferior Esquerdo',36:'Primeiro Molar Inferior Esquerdo',
  37:'Segundo Molar Inferior Esquerdo',   38:'Terceiro Molar Inferior Esquerdo',
  41:'Incisivo Central Inferior Direito', 42:'Incisivo Lateral Inferior Direito',
  43:'Canino Inferior Direito',           44:'Primeiro Pré-Molar Inferior Direito',
  45:'Segundo Pré-Molar Inferior Direito',46:'Primeiro Molar Inferior Direito',
  47:'Segundo Molar Inferior Direito',    48:'Terceiro Molar Inferior Direito',
};

// ─── Helpers ────────────────────────────────────────────────────────────────
function formatarCPF(cpf) {
  const d = (cpf || '').replace(/\D/g, '');
  if (d.length !== 11) return cpf || '—';
  return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9)}`;
}

function formatarTelefone(tel) {
  const d = (tel || '').replace(/\D/g, '');
  if (d.length === 11) return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`;
  return tel || '—';
}

function calcularTempoAguardando(horaConsulta) {
  if (!horaConsulta) return '—';
  const [h, m] = horaConsulta.split(':').map(Number);
  const agora    = new Date();
  const agendado = new Date(agora);
  agendado.setHours(h, m, 0, 0);
  const diffMin = Math.floor((agora - agendado) / 60000);
  if (diffMin < 0) return horaConsulta.slice(0, 5);
  return `${diffMin} min`;
}

function infoColuna(c) {
  if (c.status === 'Aguardando')  return calcularTempoAguardando(c.horaConsulta);
  if (c.status === 'Em Consulta') return 'Em Consulta';
  return (c.horaConsulta || '').slice(0, 5);
}

// ─── Carga de dados da API ──────────────────────────────────────────────────
async function carregarDashboard() {
  const dentistaId = parseInt(sessionStorage.getItem('id'));
  if (!dentistaId) return;

  try {
    const [resConsultas, resPacientes] = await Promise.all([
      apiGetConsultasDia(),
      apiGetPacientes()
    ]);

    const todasConsultas = resConsultas?.dados || [];
    const todosPacientes = resPacientes?.dados || [];

    todosPacientes.forEach(p => { pacientesMap[p.id] = p; });

    const minhasHoje = todasConsultas.filter(c => c.idDentista === dentistaId);

    // Show all active consultations for today (not just those who arrived)
    filaConsultas = minhasHoje
      .filter(c => ['Agendada', 'Aguardando', 'Em Consulta'].includes(c.status))
      .sort((a, b) => (a.horaConsulta || '').localeCompare(b.horaConsulta || ''));

    const emEspera = minhasHoje.filter(c => c.status === 'Aguardando').length;

    document.getElementById('metricaConsultas').textContent = minhasHoje.length;
    document.getElementById('metricaFila').textContent      = emEspera;

    const banner = document.getElementById('bannerAguardando');
    const bannerTexto = document.getElementById('bannerAguardandoTexto');
    if (banner && bannerTexto) {
      if (emEspera > 0) {
        bannerTexto.textContent = emEspera === 1
          ? '1 paciente chegou e está aguardando atendimento'
          : `${emEspera} pacientes chegaram e estão aguardando atendimento`;
        banner.style.display = 'flex';
      } else {
        banner.style.display = 'none';
      }
    }

    renderizarFila(filaConsultas);
  } catch (err) {
    console.error('Erro ao carregar dashboard:', err.message);
  }
}

// ─── Inicialização ──────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  SidebarComponent.render('sidebarContainer', {
    perfil: 'dentista',
    ativo: 'dashboard'
  });

  const btnHamburger = document.getElementById('btnHamburger');
  if (btnHamburger) {
    btnHamburger.addEventListener('click', () => SidebarComponent.toggleSidebar());
  }

  carregarDashboard();

  // Auto-refresh a cada 30s para refletir pacientes que chegaram
  setInterval(carregarDashboard, 30000);

  document.getElementById('btnIniciarConsulta').addEventListener('click', iniciarConsulta);
  document.getElementById('btnVoltarDash').addEventListener('click', voltarAoDashboard);

  document.getElementById('btnVoltarParaTratamento').addEventListener('click', () => {
    mostrarView('iniciarTratamento');
  });
  document.getElementById('apBtnAddEtapa').addEventListener('click', () => {
    mostrarView('iniciarTratamento');
  });
  document.getElementById('apBtnConfirmar').addEventListener('click', confirmarPlano);

  document.getElementById('cfBtnDashboard').addEventListener('click', () => {
    planosTratamento = [];
    mostrarView('dashboard');
  });
  document.getElementById('cfBtnProntuario').addEventListener('click', () => {
    const consulta = filaConsultas.find(c => c.id === consultaAtualId);
    if (consulta) {
      window.location.href = `../dentista/tratamentos.html?prontuario=${encodeURIComponent(consulta.nomePaciente)}`;
    }
  });
  document.getElementById('cfBtnImprimir').addEventListener('click', () => {
    window.print();
  });

  inicializarOdontograma();

  document.getElementById('formPlano').addEventListener('submit', e => {
    e.preventDefault();
    const dente     = document.getElementById('itInputDente').value.trim();
    const condicao  = document.getElementById('itInputCondicao').value.trim();
    const descricao = document.getElementById('itTextareaDescricao').value.trim();
    if (!condicao || !descricao) {
      alert('Preencha todos os campos antes de adicionar o plano.');
      return;
    }
    planosTratamento.push({ id: Date.now(), dente, condicao, descricao });
    mostrarTelaDePlano();
  });

  document.getElementById('btnProntuarioIt').addEventListener('click', () => {
    const consulta = filaConsultas.find(c => c.id === consultaAtualId);
    if (consulta) {
      window.location.href = `../dentista/tratamentos.html?prontuario=${encodeURIComponent(consulta.nomePaciente)}`;
    }
  });
});

// ─── Renderiza as linhas da tabela ──────────────────────────────────────────
function renderizarFila(consultas) {
  const tbody = document.getElementById('tbodyFila');
  tbody.innerHTML = '';

  if (!consultas.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="3" style="text-align:center; padding:2rem; color:var(--c3);">
          Nenhuma consulta para hoje
        </td>
      </tr>`;
    return;
  }

  consultas.forEach(c => {
    const tr = document.createElement('tr');
    tr.dataset.id = c.id;
    if (c.status === 'Aguardando') tr.classList.add('fila-chegou');
    const badgeChegou = c.status === 'Aguardando'
      ? `<span class="badge-chegou-dash"><i class="fa-solid fa-person-walking-arrow-right"></i> Chegou</span>`
      : '';
    tr.innerHTML = `
      <td class="ps-4 fw-medium">${c.nomePaciente || '—'}${badgeChegou}</td>
      <td>${c.nomeServico || '—'}</td>
      <td>${infoColuna(c)}</td>
    `;
    tr.addEventListener('click', () => selecionarPaciente(c.id));
    tbody.appendChild(tr);
  });
}

// ─── Seleciona consulta e atualiza painel ───────────────────────────────────
function selecionarPaciente(consultaId) {
  const linhaAnterior = document.querySelector('#tabelaFila tbody tr.selecionado');
  if (linhaAnterior) linhaAnterior.classList.remove('selecionado');

  const linhaNova = document.querySelector(`#tabelaFila tbody tr[data-id="${consultaId}"]`);
  if (linhaNova) linhaNova.classList.add('selecionado');

  consultaAtualId = consultaId;

  const consulta = filaConsultas.find(c => c.id === consultaId);
  const podeIniciar = ['Agendada', 'Aguardando', 'Em Consulta'].includes(consulta?.status);
  const btnIniciar = document.getElementById('btnIniciarConsulta');
  btnIniciar.disabled = !podeIniciar;
  btnIniciar.textContent = consulta?.status === 'Em Consulta' ? 'Continuar Consulta' : 'Iniciar Consulta';
  document.getElementById('hintIniciar').style.visibility = podeIniciar ? 'hidden' : 'visible';

  const paciente = pacientesMap[consulta?.idPaciente];
  if (consulta) preencherPainel(consulta, paciente);
}

// ─── Preenche o painel lateral com os dados do paciente ─────────────────────
function preencherPainel(consulta, paciente) {
  document.getElementById('detalheVazio').style.display = 'none';
  document.getElementById('detalheConteudo').hidden = false;

  const foto        = document.getElementById('detalheFoto');
  const placeholder = document.getElementById('detalheAvatarPlaceholder');
  foto.classList.remove('visivel');
  placeholder.classList.remove('oculto');

  document.getElementById('detalheNome').textContent    = consulta.nomePaciente || '—';
  document.getElementById('detalheServico').textContent = consulta.nomeServico  || '—';
  document.getElementById('detalheTempo').textContent   = calcularTempoAguardando(consulta.horaConsulta);

  document.getElementById('detalheTelefone').textContent = formatarTelefone(paciente?.telefone);
  document.getElementById('detalheCpf').textContent      = formatarCPF(paciente?.cpf);
  document.getElementById('detalheEndereco').textContent = paciente?.endereco || '—';

  document.getElementById('btnProntuario').onclick = () => {
    window.location.href = `../dentista/tratamentos.html?prontuario=${encodeURIComponent(consulta.nomePaciente)}`;
  };
}

// ─── Controle de views ───────────────────────────────────────────────────────
function mostrarView(qual) {
  document.querySelector('.dash-topbar').style.display            = qual === 'dashboard'         ? '' : 'none';
  document.querySelector('.dash-body').style.display              = qual === 'dashboard'         ? '' : 'none';
  document.getElementById('iniciarTratamentoView').style.display  = qual === 'iniciarTratamento' ? 'block' : 'none';
  document.getElementById('adicionarPlanoView').style.display     = qual === 'adicionarPlano'    ? 'block' : 'none';
  document.getElementById('confirmacaoView').style.display        = qual === 'confirmacao'       ? 'block' : 'none';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ─── Iniciar consulta → redireciona para tratamentos.html com a consulta ────
function iniciarConsulta() {
  if (!consultaAtualId) return;
  window.location.href = `../dentista/tratamentos.html?consultaId=${consultaAtualId}`;
}

// ─── Voltar ao dashboard ─────────────────────────────────────────────────────
function voltarAoDashboard() {
  mostrarView('dashboard');
}

// ─── Exibe a tela de plano de tratamento ────────────────────────────────────
function mostrarTelaDePlano() {
  const consulta = filaConsultas.find(c => c.id === consultaAtualId);
  if (consulta) {
    document.getElementById('apNomePaciente').textContent = consulta.nomePaciente || '—';
    document.getElementById('apServico').textContent      = consulta.nomeServico  || '—';
  }
  renderizarPlanos();
  mostrarView('adicionarPlano');
}

// ─── Renderiza os cards de plano ─────────────────────────────────────────────
function renderizarPlanos() {
  const lista     = document.getElementById('apEtapasLista');
  const contador  = document.getElementById('apContador');

  contador.textContent = planosTratamento.length === 1
    ? '1 etapa'
    : `${planosTratamento.length} etapas`;

  if (!planosTratamento.length) {
    lista.innerHTML = '<p class="ap-etapas-vazio">Nenhuma etapa adicionada ainda.</p>';
    return;
  }

  lista.innerHTML = planosTratamento.map((p, i) => `
    <div class="ap-etapa-card" data-id="${p.id}">
      <div class="ap-etapa-header">
        <span class="ap-etapa-num">${i + 1}</span>
        <span class="ap-etapa-dente-nome">${p.dente || 'Dente não especificado'}</span>
        <button class="ap-etapa-delete" data-id="${p.id}" title="Remover etapa">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
      <div class="ap-etapa-body">
        <div class="ap-etapa-campo">
          <span class="ap-etapa-campo-label">Condição</span>
          <span class="ap-etapa-campo-valor">${p.condicao}</span>
        </div>
        <div class="ap-etapa-campo full">
          <span class="ap-etapa-campo-label">Planejamento do Tratamento</span>
          <span class="ap-etapa-campo-valor">${p.descricao}</span>
        </div>
      </div>
    </div>
  `).join('');

  lista.querySelectorAll('.ap-etapa-delete').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = Number(btn.dataset.id);
      planosTratamento = planosTratamento.filter(p => p.id !== id);
      renderizarPlanos();
    });
  });
}

// ─── Confirmar plano ─────────────────────────────────────────────────────────
async function confirmarPlano() {
  if (!planosTratamento.length) {
    alert('Adicione pelo menos uma etapa antes de confirmar.');
    return;
  }

  const consulta = filaConsultas.find(c => c.id === consultaAtualId);
  if (consulta) {
    document.getElementById('cfNomePaciente').textContent = consulta.nomePaciente || '—';
    document.getElementById('cfServico').textContent      = consulta.nomeServico  || '—';
  }
  document.getElementById('cfTotalEtapas').textContent = planosTratamento.length;

  const agora  = new Date();
  const opcoes = { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' };
  document.getElementById('cfData').textContent = agora.toLocaleDateString('pt-BR', opcoes);

  const timeline = document.getElementById('cfEtapasTimeline');
  timeline.innerHTML = planosTratamento.map((p, i) => `
    <div class="cf-timeline-item">
      <div class="cf-timeline-marker">
        <span class="cf-timeline-num">${i + 1}</span>
        ${i < planosTratamento.length - 1 ? '<div class="cf-timeline-line"></div>' : ''}
      </div>
      <div class="cf-timeline-content">
        <span class="cf-timeline-dente">${p.dente || 'Dente não especificado'}</span>
        <span class="cf-timeline-condicao">${p.condicao}</span>
        <p class="cf-timeline-descricao">${p.descricao}</p>
      </div>
    </div>
  `).join('');

  mostrarView('confirmacao');

  const animEl = document.getElementById('cfSucessoAnim');
  animEl.classList.remove('cf-animate');
  void animEl.offsetWidth;
  animEl.classList.add('cf-animate');

  // Salvar planos no banco de dados
  if (consulta?.idPaciente) {
    try {
      const resPront   = await apiObterOuCriarProntuario(consulta.idPaciente);
      const prontuario = resPront?.dados;
      if (prontuario?.id) {
        for (const p of planosTratamento) {
          const denteNum = p.dente === 'Todos os dentes selecionados'
            ? 'todos'
            : (p.dente ? p.dente.split(' - ')[0].trim() : null);
          await apiCadastrarPlano({
            idProntuario: prontuario.id,
            idServico:    consulta.idServico || null,
            condicao:     p.condicao  || null,
            descricao:    p.descricao || null,
            observacao:   null,
            dente:        denteNum,
            status:       'Concluido'
          });
        }
      }
    } catch (err) {
      console.error('[Dashboard] Erro ao salvar planos:', err.message);
    }
  }

  // Encerrar consulta
  if (consultaAtualId) {
    try {
      await apiAtualizarStatusConsulta(consultaAtualId, 'Encerrada');
    } catch (err) {
      console.warn('[Dashboard] Erro ao encerrar consulta:', err.message);
    }
  }
}

// ─── Odontograma ─────────────────────────────────────────────────────────────
function inicializarOdontograma() {
  document.querySelectorAll('.it-dente').forEach(dente => {
    dente.addEventListener('click', () => {
      const num        = parseInt(dente.dataset.num, 10);
      const idxAtual   = ESTADOS_DENTE.findIndex(e => dente.classList.contains(e));
      const proximoIdx = (idxAtual + 1) % ESTADOS_DENTE.length;

      ESTADOS_DENTE.forEach(e => dente.classList.remove(e));
      dente.classList.add(ESTADOS_DENTE[proximoIdx]);

      if (ESTADOS_DENTE[proximoIdx] === 'selecao') {
        atualizarCampoDente(num);
        document.getElementById('chkSelecionarTodos').checked = false;
      }
    });
  });

  document.getElementById('chkSelecionarTodos').addEventListener('change', e => {
    const estado = e.target.checked ? 'selecao' : 'saudavel';
    document.querySelectorAll('.it-dente').forEach(d => {
      ESTADOS_DENTE.forEach(s => d.classList.remove(s));
      d.classList.add(estado);
    });
    document.getElementById('itInputDente').value = e.target.checked
      ? 'Todos os dentes selecionados'
      : '';
  });
}

function atualizarCampoDente(num) {
  const nome = NOMES_DENTES[num] || '';
  document.getElementById('itInputDente').value = nome ? `${num} - ${nome}` : String(num);
}

function resetarOdontograma() {
  document.querySelectorAll('.it-dente').forEach(d => {
    ESTADOS_DENTE.forEach(s => d.classList.remove(s));
    d.classList.add('saudavel');
  });
  const d46 = document.querySelector('.it-dente[data-num="46"]');
  if (d46) {
    d46.classList.remove('saudavel');
    d46.classList.add('selecao');
  }
  document.getElementById('chkSelecionarTodos').checked = false;
  document.getElementById('itInputDente').value         = '46 - Primeiro Molar Inferior Direito';
  document.getElementById('itInputCondicao').value      = 'Cárie Profunda';
  document.getElementById('itTextareaDescricao').value  = 'Tratamento endodôntico necessário. Obturação temporária aplicada';
}
