/**
 * pacientes.js — Página de gerenciamento de pacientes (Admin)
 * Componentes: TabelaPacientes, CardMobilePaciente, ModalConfirmacao
 */

let PACIENTES = [];


/* ══════════════════════════════════════
   UTILITÁRIOS
══════════════════════════════════════ */

/** Mascara CPF: ex: ***.***.**9-01 */
function mascaraCPF(cpf) {
  const d = cpf.replace(/\D/g, '');
  if (d.length !== 11) return cpf;
  return `***.***.*${d[7]}${d[8]}-${d[9]}${d[10]}`;
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
        <td class="td-celular">${p.celular || '—'}</td>
        <td class="td-data">${p.dataNascimento ? formatarData(p.dataNascimento) : '—'}</td>
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
            <span><i class="bi bi-calendar3"></i> ${p.dataNascimento ? formatarData(p.dataNascimento) : '—'}</span>
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

  async function carregarPacientes() {
    try {
      const res = await apiGetPacientes();
      PACIENTES = (res.dados || []).map(p => ({
        id:             p.id,
        nome:           p.nome,
        cpf:            p.cpf,
        celular:        p.telefone || '',
        dataNascimento: p.dataNascimento || ''
      }));
      atualizar();
    } catch (erro) {
      console.error('Erro ao carregar pacientes:', erro.message);
    }
  }

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
      const matchData = !data || p.dataNascimento === data;
      return matchNome && matchCPF && matchData;
    });

    // Ordenação
    if (sortCol) {
      lista.sort((a, b) => {
        let va, vb;
        if (sortCol === 'nome') { va = a.nome.toLowerCase(); vb = b.nome.toLowerCase(); }
        if (sortCol === 'data') { va = a.dataNascimento; vb = b.dataNascimento; }
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
    document.getElementById('mdlNome').textContent    = p.nome;
    document.getElementById('mdlCPF').textContent     = mascaraCPF(p.cpf);
    document.getElementById('mdlCelular').textContent = p.celular || '—';
    document.getElementById('mdlData').textContent    = p.dataNascimento ? formatarData(p.dataNascimento) : '—';

    // Abre o modal
    const modalEl = document.getElementById('modalDeletarPaciente');
    const modalInst = new bootstrap.Modal(modalEl);
    modalInst.show();
  }

  /**
   * Remove o item da lista
   */
  async function efetivarExclusao() {
    if (pacienteParaExcluir === null) return;

    try {
      await apiInativarPaciente(pacienteParaExcluir);

      PACIENTES = PACIENTES.filter(p => p.id !== pacienteParaExcluir);
      atualizar();

      const modalEl = document.getElementById('modalDeletarPaciente');
      const modalInst = bootstrap.Modal.getInstance(modalEl);
      if (modalInst) modalInst.hide();

      const backdrops = document.querySelectorAll('.modal-backdrop');
      backdrops.forEach(b => b.remove());
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    } catch (erro) {
      console.error('Erro ao inativar paciente:', erro.message);
    }

    pacienteParaExcluir = null;
  }

  /**
   * Inicialização
   */
  function init() {
    // 1. Sidebar
    SidebarComponent.render('sidebarContainer', {
      perfil: 'admin',
      ativo: 'pacientes',
      nome: sessionStorage.getItem('nome') || 'Admin',
      cargo: 'Administrador'
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

    // 8. Carrega pacientes da API
    carregarPacientes();
  }

  return { init, confirmarExclusao, efetivarExclusao };
})();


/* ══════════════════════════════════════
   INICIALIZAÇÃO
══════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', PacientesPage.init);
