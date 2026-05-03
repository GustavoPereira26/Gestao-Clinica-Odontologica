// js/dentista/dashboard.js
// Dashboard do Dentista — seleção de fila e painel de detalhe

// ─── Dados mock (substituir por chamadas à API futuramente) ─────────────────
const PACIENTES_FILA = [
  {
    id: 1,
    nome: 'Maria Souza',
    servico: 'Limpeza',
    tempo: '10 min',
    foto: null,
    telefone: '(11) 98765-4321',
    cpf: '123.456.789-00',
    endereco: 'Rua das Flores, 123, Centro, São Paulo – SP',
    alergias: 'Penicilina',
    condicoes: 'Hypertension (Controlado)',
    medicamentos: 'Lisinopril (Diário)',
    historico: 'Extração do dente do siso (2018)'
  },
  {
    id: 2,
    nome: 'Carlos Mendes',
    servico: 'Extração',
    tempo: '25 min',
    foto: null,
    telefone: '(11) 97654-3210',
    cpf: '987.654.321-00',
    endereco: 'Av. Paulista, 456, Bela Vista, São Paulo – SP',
    alergias: 'Nenhuma',
    condicoes: 'Nenhuma',
    medicamentos: 'Nenhum',
    historico: 'Nenhum'
  },
  {
    id: 3,
    nome: 'Ana Paula',
    servico: 'Restauração',
    tempo: '5 min',
    foto: null,
    telefone: '(11) 99999-0001',
    cpf: '111.222.333-44',
    endereco: 'Rua Augusta, 789, Consolação, São Paulo – SP',
    alergias: 'Látex',
    condicoes: 'Diabetes Tipo 2',
    medicamentos: 'Metformina',
    historico: 'Nenhum'
  },
  {
    id: 4,
    nome: 'Pedro Lima',
    servico: 'Consulta',
    tempo: '15 min',
    foto: null,
    telefone: '(21) 98888-7777',
    cpf: '444.555.666-77',
    endereco: 'Rua do Ouvidor, 50, Centro, Rio de Janeiro – RJ',
    alergias: 'Nenhuma',
    condicoes: 'Nenhuma',
    medicamentos: 'Nenhum',
    historico: 'Canal no molar (2020)'
  },
  {
    id: 5,
    nome: 'Fernanda Costa',
    servico: 'Clareamento',
    tempo: '30 min',
    foto: null,
    telefone: '(11) 92222-3333',
    cpf: '555.666.777-88',
    endereco: 'Al. Santos, 200, Jardins, São Paulo – SP',
    alergias: 'Nenhuma',
    condicoes: 'Nenhuma',
    medicamentos: 'Nenhum',
    historico: 'Nenhum'
  },
  {
    id: 6,
    nome: 'Ricardo Alves',
    servico: 'Canal',
    tempo: '20 min',
    foto: null,
    telefone: '(11) 91111-2222',
    cpf: '666.777.888-99',
    endereco: 'Rua Haddock Lobo, 300, Cerqueira César, São Paulo – SP',
    alergias: 'Ibuprofeno',
    condicoes: 'Nenhuma',
    medicamentos: 'Nenhum',
    historico: 'Extração (2019)'
  },
  {
    id: 7,
    nome: 'Juliana Santos',
    servico: 'Revisão',
    tempo: '12 min',
    foto: null,
    telefone: '(11) 93333-4444',
    cpf: '777.888.999-00',
    endereco: 'Rua Oscar Freire, 88, Pinheiros, São Paulo – SP',
    alergias: 'Nenhuma',
    condicoes: 'Nenhuma',
    medicamentos: 'Nenhum',
    historico: 'Nenhum'
  }
];

// ─── Estado local ───────────────────────────────────────────────────────────
let pacienteSelecionadoId = null;
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

// ─── Inicialização ──────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Sidebar
  SidebarComponent.render('sidebarContainer', {
    perfil: 'dentista',
    ativo: 'dashboard'
  });

  // Hamburguer
  const btnHamburger = document.getElementById('btnHamburger');
  if (btnHamburger) {
    btnHamburger.addEventListener('click', () => SidebarComponent.toggleSidebar());
  }

  // Popular tabela com dados mock
  // TODO: substituir por: apiGetPacientesEmFila().then(renderizarFila)
  renderizarFila(PACIENTES_FILA);

  // Atualizar métricas
  // TODO: substituir por: apiGetConsultasDia().then(data => { ... })
  document.getElementById('metricaConsultas').textContent = 30;
  document.getElementById('metricaFila').textContent = PACIENTES_FILA.length;

  // Botão iniciar consulta
  document.getElementById('btnIniciarConsulta').addEventListener('click', iniciarConsulta);

  // Botão voltar da tela de tratamento
  document.getElementById('btnVoltarDash').addEventListener('click', voltarAoDashboard);

  // Tela de plano de tratamento
  document.getElementById('btnVoltarParaTratamento').addEventListener('click', () => {
    mostrarView('iniciarTratamento');
  });
  document.getElementById('apBtnAddEtapa').addEventListener('click', () => {
    mostrarView('iniciarTratamento');
  });
  document.getElementById('apBtnConfirmar').addEventListener('click', confirmarPlano);

  // Odontograma
  inicializarOdontograma();

  // Formulário de planejamento → adiciona ao array e vai para tela de plano
  document.getElementById('formPlano').addEventListener('submit', e => {
    e.preventDefault();
    const dente    = document.getElementById('itInputDente').value.trim();
    const condicao = document.getElementById('itInputCondicao').value.trim();
    const descricao = document.getElementById('itTextareaDescricao').value.trim();
    if (!condicao || !descricao) {
      alert('Preencha todos os campos antes de adicionar o plano.');
      return;
    }
    planosTratamento.push({ id: Date.now(), dente, condicao, descricao });
    mostrarTelaDePlano();
  });

  // Botão prontuário dentro da tela de tratamento
  document.getElementById('btnProntuarioIt').addEventListener('click', () => {
    const paciente = PACIENTES_FILA.find(p => p.id === pacienteSelecionadoId);
    if (paciente) {
      window.location.href = `../dentista/tratamentos.html?prontuario=${encodeURIComponent(paciente.nome)}`;
    }
  });
});

// ─── Renderiza as linhas da tabela ──────────────────────────────────────────
function renderizarFila(pacientes) {
  const tbody = document.getElementById('tbodyFila');
  tbody.innerHTML = '';

  if (!pacientes.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="3" style="text-align:center; padding:2rem; color:var(--c3);">
          Nenhum paciente em espera
        </td>
      </tr>`;
    return;
  }

  pacientes.forEach(p => {
    const tr = document.createElement('tr');
    tr.dataset.id = p.id;
    tr.innerHTML = `
      <td class="ps-4 fw-medium">${p.nome}</td>
      <td>${p.servico}</td>
      <td>${p.tempo}</td>
    `;
    tr.addEventListener('click', () => selecionarPaciente(p.id));
    tbody.appendChild(tr);
  });
}

// ─── Seleciona paciente e atualiza painel ───────────────────────────────────
function selecionarPaciente(id) {
  // Remove destaque da linha anterior
  const linhaAnterior = document.querySelector('#tabelaFila tbody tr.selecionado');
  if (linhaAnterior) linhaAnterior.classList.remove('selecionado');

  // Destaca nova linha
  const linhaNova = document.querySelector(`#tabelaFila tbody tr[data-id="${id}"]`);
  if (linhaNova) linhaNova.classList.add('selecionado');

  pacienteSelecionadoId = id;

  // Habilita botão iniciar consulta
  const btnIniciar = document.getElementById('btnIniciarConsulta');
  btnIniciar.disabled = false;
  document.getElementById('hintIniciar').style.visibility = 'hidden';

  // Busca dados e preenche painel
  // TODO: substituir por chamada à API quando disponível: apiGetPaciente(id).then(preencherPainel)
  const paciente = PACIENTES_FILA.find(p => p.id === id);
  if (paciente) preencherPainel(paciente);
}

// ─── Preenche o painel lateral com os dados do paciente ─────────────────────
function preencherPainel(p) {
  // Troca estado vazio → conteúdo
  document.getElementById('detalheVazio').style.display = 'none';
  document.getElementById('detalheConteudo').hidden = false;

  // Foto / avatar placeholder
  const foto = document.getElementById('detalheFoto');
  const placeholder = document.getElementById('detalheAvatarPlaceholder');

  if (p.foto) {
    foto.src = p.foto;
    foto.alt = `Foto de ${p.nome}`;
    foto.classList.add('visivel');
    placeholder.classList.add('oculto');
  } else {
    foto.classList.remove('visivel');
    placeholder.classList.remove('oculto');
  }

  // Dados básicos
  document.getElementById('detalheNome').textContent       = p.nome;
  document.getElementById('detalheServico').textContent    = p.servico;
  document.getElementById('detalheTempo').textContent      = p.tempo;

  // Contato
  document.getElementById('detalheTelefone').textContent   = p.telefone;

  // Pessoal
  document.getElementById('detalheCpf').textContent        = p.cpf;
  document.getElementById('detalheEndereco').textContent   = p.endereco;

  // Observações
  document.getElementById('detalheAlergias').textContent    = p.alergias;
  document.getElementById('detalheCondicoes').textContent   = p.condicoes;
  document.getElementById('detalheMedicamentos').textContent = p.medicamentos;
  document.getElementById('detalheHistorico').textContent   = p.historico;

  // Botão prontuário (redireciona para tela de tratamentos abrindo o prontuário)
  document.getElementById('btnProntuario').onclick = () => {
    window.location.href = `../dentista/tratamentos.html?prontuario=${encodeURIComponent(p.nome)}`;
  };
}

// ─── Controle de views ───────────────────────────────────────────────────────
function mostrarView(qual) {
  document.querySelector('.dash-topbar').style.display       = qual === 'dashboard'         ? '' : 'none';
  document.querySelector('.dash-body').style.display         = qual === 'dashboard'         ? '' : 'none';
  document.getElementById('iniciarTratamentoView').style.display = qual === 'iniciarTratamento' ? 'block' : 'none';
  document.getElementById('adicionarPlanoView').style.display    = qual === 'adicionarPlano'    ? 'block' : 'none';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ─── Iniciar consulta → exibe tela de tratamento ────────────────────────────
function iniciarConsulta() {
  if (!pacienteSelecionadoId) return;
  const paciente = PACIENTES_FILA.find(p => p.id === pacienteSelecionadoId);
  if (!paciente) return;

  document.getElementById('itNomePaciente').textContent = paciente.nome;
  document.getElementById('itServico').textContent      = paciente.servico;

  planosTratamento = [];
  resetarOdontograma();
  mostrarView('iniciarTratamento');
}

// ─── Voltar ao dashboard ─────────────────────────────────────────────────────
function voltarAoDashboard() {
  mostrarView('dashboard');
}

// ─── Exibe a tela de plano de tratamento ────────────────────────────────────
function mostrarTelaDePlano() {
  const paciente = PACIENTES_FILA.find(p => p.id === pacienteSelecionadoId);
  if (paciente) {
    document.getElementById('apNomePaciente').textContent = paciente.nome;
    document.getElementById('apServico').textContent      = paciente.servico;
  }
  renderizarPlanos();
  mostrarView('adicionarPlano');
}

// ─── Renderiza os cards de plano ─────────────────────────────────────────────
function renderizarPlanos() {
  const lista = document.getElementById('apEtapasLista');
  const contador = document.getElementById('apContador');

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
          <span class="ap-etapa-campo-label">Descrição do Tratamento</span>
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
function confirmarPlano() {
  if (!planosTratamento.length) {
    alert('Adicione pelo menos uma etapa antes de confirmar.');
    return;
  }
  alert(`Plano de tratamento confirmado com ${planosTratamento.length} etapa(s)!`);
  planosTratamento = [];
  mostrarView('dashboard');
}

// ─── Odontograma ─────────────────────────────────────────────────────────────
function inicializarOdontograma() {
  document.querySelectorAll('.it-dente').forEach(dente => {
    dente.addEventListener('click', () => {
      const num         = parseInt(dente.dataset.num, 10);
      const idxAtual    = ESTADOS_DENTE.findIndex(e => dente.classList.contains(e));
      const proximoIdx  = (idxAtual + 1) % ESTADOS_DENTE.length;

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
  // Marca o 46 como seleção por padrão
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