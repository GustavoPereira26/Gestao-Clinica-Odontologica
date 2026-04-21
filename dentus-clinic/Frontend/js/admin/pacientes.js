/**
 * pacientes.js — Página de gerenciamento de pacientes (Admin)
 * Componentes: TabelaPacientes, CardMobilePaciente, ModalConfirmacao
 */

/* ══════════════════════════════════════
   DADOS MOCK — 20 pacientes
══════════════════════════════════════ */
const PACIENTES = [
  { id: 1,  nome: 'Ricardo Henrique',    cpf: '123.456.789-01', celular: '(15) 91234-5678', dataCadastro: '2026-03-30' },
  { id: 2,  nome: 'Lillian Marques',     cpf: '234.567.890-12', celular: '(15) 91234-5678', dataCadastro: '2026-03-30' },
  { id: 3,  nome: 'Inês Ribeiro',        cpf: '345.678.901-23', celular: '(15) 91234-5678', dataCadastro: '2026-03-30' },
  { id: 4,  nome: 'Sofia Costa',         cpf: '456.789.012-34', celular: '(15) 91234-5678', dataCadastro: '2026-03-30' },
  { id: 5,  nome: 'Catarina Lima',       cpf: '567.890.123-45', celular: '(15) 91234-5678', dataCadastro: '2026-03-30' },
  { id: 6,  nome: 'João Silva',          cpf: '678.901.234-56', celular: '(15) 91234-5678', dataCadastro: '2026-03-30' },
  { id: 7,  nome: 'Thiago Carvalho',     cpf: '789.012.345-67', celular: '(15) 91234-5678', dataCadastro: '2026-03-30' },
  { id: 8,  nome: 'Ricardo Almeida',     cpf: '890.123.456-78', celular: '(15) 91234-5678', dataCadastro: '2026-03-24' },
  { id: 9,  nome: 'Filipe Rocha',        cpf: '901.234.567-89', celular: '(15) 91234-5678', dataCadastro: '2026-03-24' },
  { id: 10, nome: 'Maria Souza',         cpf: '012.345.678-90', celular: '(15) 91234-5678', dataCadastro: '2026-03-24' },
  { id: 11, nome: 'Beatriz Mendes',      cpf: '111.222.333-44', celular: '(15) 91234-5678', dataCadastro: '2026-03-24' },
  { id: 12, nome: 'Mariana Fernandes',   cpf: '222.333.444-55', celular: '(15) 91234-5678', dataCadastro: '2026-03-28' },
  { id: 13, nome: 'Vitor Santos',        cpf: '333.444.555-66', celular: '(15) 91234-5678', dataCadastro: '2026-03-24' },
  { id: 14, nome: 'Pedro Santos',        cpf: '444.555.666-77', celular: '(15) 91234-5678', dataCadastro: '2026-03-24' },
  { id: 15, nome: 'André Nunes',         cpf: '555.666.777-88', celular: '(15) 91234-5678', dataCadastro: '2026-03-28' },
  { id: 16, nome: 'Luís Rodrigues',      cpf: '666.777.888-99', celular: '(15) 91234-5678', dataCadastro: '2026-03-28' },
  { id: 17, nome: 'Ana Oliveira',        cpf: '777.888.999-00', celular: '(15) 91234-5678', dataCadastro: '2026-03-28' },
  { id: 18, nome: 'Laura Pires',         cpf: '888.999.000-11', celular: '(15) 91234-5678', dataCadastro: '2026-03-28' },
  { id: 19, nome: 'Patrícia Gomes',      cpf: '999.000.111-22', celular: '(15) 91234-5678', dataCadastro: '2026-03-28' },
  { id: 20, nome: 'Carlos Pereira',      cpf: '100.200.300-40', celular: '(15) 91234-5678', dataCadastro: '2026-03-28' },
  { id: 21, nome: 'Miguel Santos',       cpf: '200.300.400-50', celular: '(15) 91234-5678', dataCadastro: '2026-03-28' },
  { id: 22, nome: 'Daniel Martins',      cpf: '300.400.500-60', celular: '(15) 91234-5678', dataCadastro: '2026-03-28' },
];


/* ══════════════════════════════════════
   UTILITÁRIOS
══════════════════════════════════════ */

/** Mascara CPF: ex: ***.***.**9-01 */
function mascaraCPF(cpf) {
  const partes = cpf.split(/[.\-]/);
  return `***.***.*${partes[2].charAt(1)}${partes[2].charAt(2)}-${partes[3]}`;
}

/** Formata data ISO para DD/MM/YYYY */
function formatarData(iso) {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

/** Máscara de entrada de CPF no input */
function aplicarMascaraCPF(input) {
  input.addEventListener('input', () => {
    let v = input.value.replace(/\D/g, '').slice(0, 11);
    if (v.length > 9)       v = v.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
    else if (v.length > 6)  v = v.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
    else if (v.length > 3)  v = v.replace(/(\d{3})(\d{1,3})/, '$1.$2');
    input.value = v;
  });
}

/** Obtém as iniciais do nome */
function iniciais(nome) {
  const partes = nome.trim().split(/\s+/);
  if (partes.length >= 2) return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
  return partes[0][0].toUpperCase();
}


/* ══════════════════════════════════════
   COMPONENTE — Tabela de Pacientes
══════════════════════════════════════ */
const TabelaPacientes = {
  /**
   * Renderiza as linhas da tabela
   * @param {Array} lista - pacientes filtrados
   */
  render(lista) {
    const tbody = document.getElementById('tbodyPacientes');
    const empty = document.getElementById('emptyState');
    const tableContainer = document.getElementById('tableContainer');
    if (!tbody) return;

    if (lista.length === 0) {
      tbody.innerHTML = '';
      empty.classList.remove('hidden');
      return;
    }

    empty.classList.add('hidden');

    tbody.innerHTML = lista.map((p, i) => `
      <tr style="animation: rowAppear 0.3s ease-out ${i * 0.03}s both;">
        <td class="td-nome">${p.nome}</td>
        <td class="td-cpf">${mascaraCPF(p.cpf)}</td>
        <td class="td-celular">${p.celular}</td>
        <td class="td-data">${formatarData(p.dataCadastro)}</td>
        <td class="td-acoes">
          <button class="btn-delete"
                  onclick="PacientesPage.confirmarExclusao(${p.id})"
                  title="Excluir ${p.nome}"
                  id="btnDelete-${p.id}">
            <i class="bi bi-trash3"></i>
          </button>
        </td>
      </tr>
    `).join('');
  }
};


/* ══════════════════════════════════════
   COMPONENTE — Cards Mobile
══════════════════════════════════════ */
const CardMobilePaciente = {
  /**
   * Renderiza os cards para visualização mobile
   * @param {Array} lista - pacientes filtrados
   */
  render(lista) {
    const container = document.getElementById('cardsMobile');
    if (!container) return;

    if (lista.length === 0) {
      container.innerHTML = `
        <div class="empty-state" id="emptyStateMobile">
          <i class="bi bi-person-x"></i>
          <p>Nenhum paciente encontrado</p>
        </div>
      `;
      return;
    }

    container.innerHTML = lista.map(p => `
      <div class="card-paciente-mobile" id="cardMobile-${p.id}">
        <div class="card-mobile-avatar">${iniciais(p.nome)}</div>
        <div class="card-mobile-info">
          <div class="card-mobile-nome">${p.nome}</div>
          <div class="card-mobile-detail">
            <span><i class="bi bi-credit-card"></i> ${mascaraCPF(p.cpf)}</span>
            <span><i class="bi bi-calendar3"></i> ${formatarData(p.dataCadastro)}</span>
          </div>
        </div>
        <div class="card-mobile-actions">
          <button class="btn-delete"
                  onclick="PacientesPage.confirmarExclusao(${p.id})"
                  title="Excluir ${p.nome}"
                  id="btnDeleteMobile-${p.id}">
            <i class="bi bi-trash3"></i>
          </button>
        </div>
      </div>
    `).join('');
  }
};


/* ModalConfirmacao foi substituído pelo Bootstrap Modal na tela principal */


/* ══════════════════════════════════════
   CONTROLADOR DA PÁGINA
══════════════════════════════════════ */
const PacientesPage = (() => {
  let sortCol = null;
  let sortAsc = true;
  let pacienteParaExcluir = null;

  /**
   * Lista filtrada de pacientes
   */
  function listaFiltrada() {
    const nome = (document.getElementById('filtroNome')?.value || '').toLowerCase().trim();
    const cpf  = (document.getElementById('filtroCPF')?.value || '').replace(/\D/g, '');
    const data = document.getElementById('filtroData')?.value || '';

    let lista = PACIENTES.filter(p => {
      const matchNome = !nome || p.nome.toLowerCase().includes(nome);
      const matchCPF  = !cpf  || p.cpf.replace(/\D/g, '').includes(cpf);
      const matchData = !data || p.dataCadastro === data;
      return matchNome && matchCPF && matchData;
    });

    // Ordenação
    if (sortCol) {
      lista.sort((a, b) => {
        let va, vb;
        if (sortCol === 'nome') { va = a.nome.toLowerCase(); vb = b.nome.toLowerCase(); }
        if (sortCol === 'data') { va = a.dataCadastro; vb = b.dataCadastro; }
        if (va < vb) return sortAsc ? -1 : 1;
        if (va > vb) return sortAsc ?  1 : -1;
        return 0;
      });
    }

    return lista;
  }

  /**
   * Atualiza tabela e cards
   */
  function atualizar() {
    const lista = listaFiltrada();
    TabelaPacientes.render(lista);
    CardMobilePaciente.render(lista);

    // Badge total
    const badge = document.getElementById('badgeTotal');
    if (badge) {
      badge.textContent = `${lista.length} paciente${lista.length !== 1 ? 's' : ''}`;
    }
  }

  /**
   * Prepara os dados no modal do Bootstrap e o exibe
   */
  function confirmarExclusao(id) {
    const p = PACIENTES.find(pac => pac.id === id);
    if (!p) return;

    pacienteParaExcluir = id;

    // Popula o modal
    document.getElementById('mdlNome').textContent = p.nome;
    document.getElementById('mdlCPF').textContent = mascaraCPF(p.cpf);
    document.getElementById('mdlCelular').textContent = p.celular;
    document.getElementById('mdlData').textContent = formatarData(p.dataCadastro);

    // Abre o modal
    const modalEl = document.getElementById('modalDeletarPaciente');
    const modalInst = new bootstrap.Modal(modalEl);
    modalInst.show();
  }

  /**
   * Remove o item da lista
   */
  function efetivarExclusao() {
    if (pacienteParaExcluir !== null) {
      const index = PACIENTES.findIndex(p => p.id === pacienteParaExcluir);
      if (index > -1) {
        PACIENTES.splice(index, 1);
        atualizar();
        
        // Esconde modal
        const modalEl = document.getElementById('modalDeletarPaciente');
        const modalInst = bootstrap.Modal.getInstance(modalEl);
        if (modalInst) modalInst.hide();
        
        // Remove backdrop em caso de travamento do BS
        const backdrops = document.querySelectorAll('.modal-backdrop');
        backdrops.forEach(b => b.remove());
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
      }
      pacienteParaExcluir = null;
    }
  }

  /**
   * Inicialização
   */
  function init() {
    // 1. Sidebar
    SidebarComponent.render('sidebarContainer', {
      perfil: 'admin',
      ativo: 'pacientes',
      nome: 'Fernanda Lima',
      cargo: 'TI'
    });

    // 2. Hamburger
    const btnHamburger = document.getElementById('btnHamburger');
    if (btnHamburger) {
      btnHamburger.addEventListener('click', () => SidebarComponent.toggleSidebar());
    }

    // 3. Modal 
    // (A inicialização do modal bootstrap é automática sem init customizado agora)

    // 4. Máscara CPF
    const filtroCPF = document.getElementById('filtroCPF');
    if (filtroCPF) aplicarMascaraCPF(filtroCPF);

    // 5. Filtros com debounce
    let debounce;
    const inputs = ['filtroNome', 'filtroCPF', 'filtroData'];
    inputs.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', () => {
          clearTimeout(debounce);
          debounce = setTimeout(atualizar, 200);
        });
        // Para date input, também escuta change
        if (id === 'filtroData') {
          el.addEventListener('change', () => {
            clearTimeout(debounce);
            debounce = setTimeout(atualizar, 100);
          });
        }
      }
    });

    // 6. Limpar filtros
    const btnLimpar = document.getElementById('btnLimparFiltros');
    if (btnLimpar) {
      btnLimpar.addEventListener('click', () => {
        inputs.forEach(id => {
          const el = document.getElementById(id);
          if (el) el.value = '';
        });
        atualizar();
      });
    }

    // 7. Ordenação por coluna
    document.querySelectorAll('.th-sort').forEach(btn => {
      btn.addEventListener('click', () => {
        const col = btn.dataset.col;
        if (sortCol === col) {
          sortAsc = !sortAsc;
        } else {
          sortCol = col;
          sortAsc = true;
        }

        // Atualiza ícones
        document.querySelectorAll('.th-sort i').forEach(icon => {
          icon.className = 'bi bi-chevron-expand';
        });
        const icon = btn.querySelector('i');
        icon.className = sortAsc ? 'bi bi-chevron-up' : 'bi bi-chevron-down';

        atualizar();
      });
    });

    // 8. Render inicial
    atualizar();
  }

  return { init, confirmarExclusao, efetivarExclusao };
})();


/* ══════════════════════════════════════
   INICIALIZAÇÃO
══════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', PacientesPage.init);
