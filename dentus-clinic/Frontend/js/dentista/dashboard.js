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
      <td>${p.nome}</td>
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
  const linhaAnterior = document.querySelector('.dash-table tbody tr.selecionado');
  if (linhaAnterior) linhaAnterior.classList.remove('selecionado');

  // Destaca nova linha
  const linhaNova = document.querySelector(`.dash-table tbody tr[data-id="${id}"]`);
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

  // Botão prontuário (preparado para rota com ID)
  document.getElementById('btnProntuario').onclick = () => {
    window.location.href = `../dentista/pacientes.html?id=${p.id}`;
  };
}

// ─── Iniciar consulta ───────────────────────────────────────────────────────
function iniciarConsulta() {
  if (!pacienteSelecionadoId) return;

  const paciente = PACIENTES_FILA.find(p => p.id === pacienteSelecionadoId);
  if (!paciente) return;

  // TODO: integrar com API
  // apiAtualizarStatusConsulta(paciente.id, 'em_atendimento')
  //   .then(() => { /* navegar para tela de consulta */ })
  //   .catch(err => console.error('Erro ao iniciar consulta:', err));

  alert(`Iniciando consulta com ${paciente.nome} — ${paciente.servico}`);
}