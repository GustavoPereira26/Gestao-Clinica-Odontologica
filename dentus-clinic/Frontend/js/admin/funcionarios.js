/**
 * funcionarios.js — Página de gerenciamento de funcionários (Admin)
 * Componentes: CardFuncionario, GridFuncionarios, Header, Toolbar
 */

/* ══════════════════════════════════════
   DADOS MOCK
══════════════════════════════════════ */
const FUNCIONARIOS = [
  { id: 1, nome: 'Ana Paula',        cargo: 'Secretária', tipo: 'secretaria' },
  { id: 2, nome: 'Ana Costa',         cargo: 'Dentista',   tipo: 'dentista'   },
  { id: 3, nome: 'Pedro Santos',      cargo: 'Dentista',   tipo: 'dentista'   },
  { id: 4, nome: 'Yuri Fernandes',    cargo: 'TI/ADM',     tipo: 'ti'         },
  { id: 5, nome: 'Miranda Cristina',  cargo: 'Secretária', tipo: 'secretaria' },
];


/* ══════════════════════════════════════
   COMPONENTE — CardFuncionario
══════════════════════════════════════ */
const CardFuncionario = {
  /**
   * Gera o HTML de um card individual
   * @param {Object} func - objeto do funcionário
   * @param {number} index - índice para delay de animação
   * @returns {string} HTML do card
   */
  render(func, index = 0) {
    const delay = index * 0.08;

    return `
      <article class="card-funcionario" 
               data-tipo="${func.tipo}" 
               data-nome="${func.nome.toLowerCase()}"
               style="animation: cardAppear 0.4s ease-out ${delay}s both;"
               id="card-${func.id}">
        
        <!-- Avatar / Placeholder -->
        <div class="card-avatar" id="avatar-${func.id}">
          <i class="bi bi-person card-avatar-icon"></i>
        </div>

        <!-- Informações -->
        <h3 class="card-nome">${func.nome}</h3>
        <span class="cargo-badge ${func.tipo}">${func.cargo}</span>

        <!-- Ação -->
        <button class="btn-visualizar" 
                onclick="FuncionariosPage.visualizar(${func.id})"
                id="btnVisualizar-${func.id}"
                title="Visualizar ${func.nome}">
          <i class="bi bi-eye"></i>
          Visualizar
        </button>
      </article>
    `;
  }
};


/* ══════════════════════════════════════
   COMPONENTE — GridFuncionarios
══════════════════════════════════════ */
const GridFuncionarios = {

  /**
   * Renderiza todos os cards no grid
   * @param {Array} lista - lista de funcionários
   */
  render(lista) {
    const grid = document.getElementById('gridFuncionarios');
    if (!grid) return;

    if (lista.length === 0) {
      grid.innerHTML = `
        <div class="empty-state" id="emptyState">
          <i class="bi bi-person-x"></i>
          <p>Nenhum funcionário encontrado</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = lista
      .map((func, i) => CardFuncionario.render(func, i))
      .join('');
  }
};


/* ══════════════════════════════════════
   CONTROLADOR DA PÁGINA
══════════════════════════════════════ */
const FuncionariosPage = (() => {
  let filtroAtivo = 'todos';
  let termoBusca  = '';
  let funcionarioAtualId = null;

  /**
   * Retorna a lista filtrada
   */
  function listaFiltrada() {
    return FUNCIONARIOS.filter(func => {
      const matchFiltro = filtroAtivo === 'todos' || func.tipo === filtroAtivo;
      const matchBusca  = termoBusca === '' ||
        func.nome.toLowerCase().includes(termoBusca) ||
        func.cargo.toLowerCase().includes(termoBusca);
      return matchFiltro && matchBusca;
    });
  }

  /**
   * Atualiza o grid com filtros aplicados
   */
  function atualizar() {
    GridFuncionarios.render(listaFiltrada());
  }

  /**
   * Ação mock de visualizar funcionário
   */
  function visualizar(id) {
    const func = FUNCIONARIOS.find(f => f.id === id);
    if (func) {
      funcionarioAtualId = id;
      // Toggle visibility
      document.getElementById('listaFuncionarios').classList.add('d-none');
      document.getElementById('visualizarFuncionario').classList.remove('d-none');
      
      // Update form values
      document.getElementById('visCargo').value = func.cargo;
      document.getElementById('visNome').value = func.nome;
      
      // Update headers
      document.getElementById('pageTitle').textContent = `Visualizar: ${func.nome}`;
      document.getElementById('pageSubtitle').textContent = func.cargo;
    }
  }

  /**
   * Confirma e deleta o funcionário selecionado
   */
  function confirmarDeletar() {
    if (funcionarioAtualId !== null) {
      const index = FUNCIONARIOS.findIndex(f => f.id === funcionarioAtualId);
      if (index > -1) {
        // Encontra o modal e fecha
        const modalEl = document.getElementById('modalDeletarFuncionario');
        if (modalEl) {
          // Utiliza a API do bootstrap para esconder o modal
          const modalInst = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
          modalInst.hide();
          
          // Remove o backdrop manualmente caso sobre resíduos
          const backdrops = document.querySelectorAll('.modal-backdrop');
          backdrops.forEach(b => b.remove());
          document.body.classList.remove('modal-open');
          document.body.style.overflow = '';
          document.body.style.paddingRight = '';
        }

        // Remove da lista
        FUNCIONARIOS.splice(index, 1);
        atualizar();

        // Volta para a lista principal
        document.getElementById('listaFuncionarios').classList.remove('d-none');
        document.getElementById('visualizarFuncionario').classList.add('d-none');
        document.getElementById('pageTitle').textContent = 'Funcionários';
        document.getElementById('pageSubtitle').textContent = 'Gerencie a equipe da Dentus Clinic';
        
        funcionarioAtualId = null;
      }
    }
  }

  /**
   * Confirma a restauração de senha e mostra o resultado
   */
  function confirmarRestaurarSenha() {
    document.getElementById('step1Restaurar').classList.add('d-none');
    document.getElementById('step2Restaurar').classList.remove('d-none');
    
    // Gera senha aleatória estilo a65sd76a5sd
    const charset = "abcdefghijklmnopqrstuvwxyz0123456789";
    let novaSenha = "";
    for(let i=0; i < 11; i++) novaSenha += charset.charAt(Math.floor(Math.random() * charset.length));
    
    document.getElementById('novaSenhaInput').value = novaSenha;
  }

  /**
   * Reinicia o estado do modal para futuras aberturas
   */
  function resetarModalRestaurar() {
    setTimeout(() => { // Aguarda fechar caso seja dismiss
        document.getElementById('step1Restaurar').classList.remove('d-none');
        document.getElementById('step2Restaurar').classList.add('d-none');
        document.getElementById('novaSenhaInput').value = '';
    }, 300);
  }

  /**
   * Copia a nova senha para a área de transferência
   */
  function copiarNovaSenha() {
    const input = document.getElementById('novaSenhaInput');
    navigator.clipboard.writeText(input.value).then(() => {
       // Opcional: feedback visual de copiado
       const btn = input.nextElementSibling;
       const icon = btn.querySelector('i');
       icon.classList.replace('bi-copy', 'bi-check2');
       setTimeout(() => {
         icon.classList.replace('bi-check2', 'bi-copy');
       }, 2000);
    });
  }

  /**
   * Abre a tela de cadastro
   */
  function adicionar() {
    document.getElementById('listaFuncionarios').classList.add('d-none');
    document.getElementById('cadastrarFuncionario').classList.remove('d-none');
    
    document.getElementById('pageTitle').textContent = 'Cadastrar Funcionário';
    document.getElementById('pageSubtitle').textContent = 'Preencha os dados do novo funcionário';
  }

  /**
   * Cancela e volta para a lista (também reseta o form)
   */
  function cancelarCadastro() {
    document.getElementById('cadastrarFuncionario').classList.add('d-none');
    document.getElementById('listaFuncionarios').classList.remove('d-none');
    
    document.getElementById('pageTitle').textContent = 'Funcionários';
    document.getElementById('pageSubtitle').textContent = 'Gerencie a equipe da Dentus Clinic';
    
    const form = document.getElementById('formCadastrar');
    if (form) form.reset();
  }

  /**
   * Confirma o cadastro do funcionário e atualiza o grid
   */
  function confirmarCadastro() {
    const nome = document.getElementById('cadNome').value.trim();
    const select = document.getElementById('cadCargo');
    const cargoLabel = select.options[select.selectedIndex].text;
    const cargoValor = select.value;

    if (!nome) {
      alert('Por favor, informe o nome do funcionário.');
      return;
    }

    // Calcula novo ID baseado nos existentes
    const novoId = FUNCIONARIOS.length > 0 ? Math.max(...FUNCIONARIOS.map(f => f.id)) + 1 : 1;

    FUNCIONARIOS.push({
      id: novoId,
      nome: nome,
      cargo: cargoLabel,
      tipo: cargoValor
    });

    atualizar();
    cancelarCadastro();
  }

  /**
   * Inicializa a página
   */
  function init() {
    // 1. Renderiza a sidebar
    SidebarComponent.render('sidebarContainer', {
      perfil: 'admin',
      ativo: 'funcionarios',
      nome: 'Fernanda Lima',
      cargo: 'TI'
    });

    // 2. Botão hamburger (mobile)
    const btnHamburger = document.getElementById('btnHamburger');
    if (btnHamburger) {
      btnHamburger.addEventListener('click', () => {
        SidebarComponent.toggleSidebar();
      });
    }

    // 3. Renderiza o grid
    atualizar();

    // 4. Filtros por cargo
    const filterChips = document.querySelectorAll('.filter-chip');
    filterChips.forEach(chip => {
      chip.addEventListener('click', () => {
        filterChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        filtroAtivo = chip.dataset.filter;
        atualizar();
      });
    });

    // 5. Busca com debounce
    const searchInput = document.getElementById('searchInput');
    let debounceTimer;
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          termoBusca = e.target.value.toLowerCase().trim();
          atualizar();
        }, 250);
      });
    }

    // 6. Botão Adicionar
    const btnAdd = document.getElementById('btnAddFuncionario');
    if (btnAdd) {
      btnAdd.addEventListener('click', adicionar);
    }

    // 7. Botão Voltar da visualização
    const btnVoltarVis = document.getElementById('btnVoltarVisualizar');
    if (btnVoltarVis) {
      btnVoltarVis.addEventListener('click', () => {
        document.getElementById('listaFuncionarios').classList.remove('d-none');
        document.getElementById('visualizarFuncionario').classList.add('d-none');
        
        document.getElementById('pageTitle').textContent = 'Funcionários';
        document.getElementById('pageSubtitle').textContent = 'Gerencie a equipe da Dentus Clinic';
      });
    }
  }

  return { init, visualizar, adicionar, confirmarDeletar, confirmarRestaurarSenha, resetarModalRestaurar, copiarNovaSenha, cancelarCadastro, confirmarCadastro };
})();


/* ══════════════════════════════════════
   INICIALIZAÇÃO
══════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', FuncionariosPage.init);
