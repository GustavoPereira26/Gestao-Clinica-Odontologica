/**
 * funcionarios.js — Página de gerenciamento de funcionários (recepcionista)
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
          <i class="fa-solid fa-user card-avatar-icon"></i>
        </div>

        <!-- Informações -->
        <h3 class="card-nome">${func.nome}</h3>
        <span class="cargo-badge ${func.tipo}">${func.cargo}</span>

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
          <i class="fa-solid fa-user-xmark"></i>
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
     * Inicializa a página
     */
    function init() {
        // 1. Renderiza a sidebar
        SidebarComponent.render('sidebarContainer', {
            perfil: 'recepcionista',
            ativo: 'funcionarios',
            nome: 'Ana Paula',
            cargo: 'Secretaria'
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
    }

    return { init, visualizar};
})();


/* ══════════════════════════════════════
   INICIALIZAÇÃO
══════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', FuncionariosPage.init);
