/**
 * funcionarios.js — Página de gerenciamento de funcionários (Admin)
 * Componentes: CardFuncionario, GridFuncionarios, Header, Toolbar
 */

let FUNCIONARIOS = [];


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
    const tipo  = (func.tipo || func.cargo || '').toLowerCase();

    return `
      <article class="card-funcionario"
               data-tipo="${tipo}"
               data-nome="${func.nome.toLowerCase()}"
               style="animation: cardAppear 0.4s ease-out ${delay}s both;"
               id="card-${func.id}">

        <div class="card-avatar" id="avatar-${func.id}">
          ${func.foto ? `<img src="${func.foto}" alt="${func.nome}" style="width: 100%; height: 100%; object-fit: cover;">` : '<i class="bi bi-person card-avatar-icon"></i>'}
        </div>

        <h3 class="card-nome">${func.nome}</h3>
        <span class="cargo-badge ${tipo}">${func.cargo}</span>

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

  async function carregarFuncionarios() {
    try {
      const [resFuncionarios, resDentistas] = await Promise.all([
        apiGetFuncionarios(),
        apiGetDentistas()
      ]);

      const funcionarios = (resFuncionarios.dados || []).map(f => ({
        id:    f.id,
        nome:  f.nome,
        cargo: f.cargo,
        tipo:  f.cargo.toLowerCase(),
        email: f.email
      }));

      const dentistas = (resDentistas.dados || []).map(d => ({
        id:    d.id,
        nome:  d.nome,
        cargo: 'Dentista',
        tipo:  'dentista',
        email: d.email,
        cro:   d.cro,
        especialidade: d.nomeEspecialidade
      }));

      FUNCIONARIOS = [...funcionarios, ...dentistas];
      atualizar();
    } catch (erro) {
      console.error('Erro ao carregar funcionários:', erro.message);
    }
  }

  async function carregarEspecialidades() {
    try {
      const res = await apiGetEspecialidades();
      const select = document.getElementById('cadEspecialidade');
      select.innerHTML = (res.dados || [])
        .map(e => `<option value="${e.id}">${e.nome}</option>`)
        .join('');
    } catch {
      document.getElementById('cadEspecialidade').innerHTML = '<option value="">Erro ao carregar</option>';
    }
  }

  function atualizarCamposPorCargo() {
    const cargo = document.getElementById('cadCargo').value;
    const isDentista = cargo === 'DENTISTA';

    document.getElementById('campoCRO').classList.toggle('d-none', !isDentista);
    document.getElementById('campoEspecialidade').classList.toggle('d-none', !isDentista);
    document.getElementById('campoDtNascimento').classList.toggle('d-none', isDentista);
  }

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
      
      resetarFotoVisualizar();
      
      if (func.foto) {
          const preview = document.getElementById('previewFoto');
          const icone = document.getElementById('iconeFotoPadrao');
          preview.src = func.foto;
          preview.classList.remove('d-none');
          icone.classList.add('d-none');
      }
      
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
   * Aciona o input de upload de foto escondido
   */
  function acionarInputFoto() {
    document.getElementById('inputSubirFoto').click();
  }

  /**
   * Lida com a mudança de arquivo no input de foto e cria o preview
   */
  function lidarUploadFoto(event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        const preview = document.getElementById('previewFoto');
        const icone = document.getElementById('iconeFotoPadrao');
        if (preview && icone) {
            preview.src = e.target.result;
            preview.classList.remove('d-none');
            icone.classList.add('d-none');
            
            if (funcionarioAtualId !== null) {
                const func = FUNCIONARIOS.find(f => f.id === funcionarioAtualId);
                if (func) func.foto = e.target.result;
            }
        }
      };
      reader.readAsDataURL(file);
    }
  }

  /**
   * Reseta a foto (chamado ao visualizar outro)
   */
  function resetarFotoVisualizar() {
      const preview = document.getElementById('previewFoto');
      const icone = document.getElementById('iconeFotoPadrao');
      const input = document.getElementById('inputSubirFoto');

      if (preview && icone && input) {
          preview.src = '';
          preview.classList.add('d-none');
          icone.classList.remove('d-none');
          input.value = '';
      }
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

  async function confirmarCadastro() {
    const cargo    = document.getElementById('cadCargo').value;
    const nome     = document.getElementById('cadNome').value.trim();
    const cpf      = document.getElementById('cadCpf').value.replace(/\D/g, '');
    const telefone = document.getElementById('cadTelefone').value.trim();
    const email    = document.getElementById('cadEmail').value.trim();
    const senha    = document.getElementById('cadSenha').value;

    const alerta = document.getElementById('alertaCadastro');
    const mostrarErro = (msg) => {
      alerta.innerHTML = msg.split('\n').map(m => `<div>${m}</div>`).join('');
      alerta.classList.remove('d-none');
    };
    alerta.classList.add('d-none');

    try {
      if (cargo === 'DENTISTA') {
        const cro            = document.getElementById('cadCRO').value.trim();
        const idEspecialidade = parseInt(document.getElementById('cadEspecialidade').value);

        await apiCadastrarDentista({ nome, cpf, cro, telefone, idEspecialidade, email, senha });
      } else {
        const dataNascimento = document.getElementById('cadDataNascimento').value;
        await apiCadastrarFuncionario({ nome, cpf, dataNascimento, telefone, cargo, email, senha });
      }

      await carregarFuncionarios();
      cancelarCadastro();
    } catch (erro) {
      mostrarErro(erro.message);
    }
  }

  /**
   * Inicializa a página
   */
  function init() {
    verificarAutenticacao();

    // 1. Renderiza a sidebar
    SidebarComponent.render('sidebarContainer', {
      perfil: 'admin',
      ativo: 'funcionarios',
      nome: sessionStorage.getItem('nome') || 'Admin',
      cargo: 'Administrador'
    });

    // 2. Botão hamburger (mobile)
    const btnHamburger = document.getElementById('btnHamburger');
    if (btnHamburger) {
      btnHamburger.addEventListener('click', () => {
        SidebarComponent.toggleSidebar();
      });
    }

    // 3. Carrega da API
    carregarFuncionarios();
    carregarEspecialidades();

    // 4. Atualiza campos ao mudar cargo
    const cadCargo = document.getElementById('cadCargo');
    if (cadCargo) {
      cadCargo.addEventListener('change', atualizarCamposPorCargo);
      atualizarCamposPorCargo();
    }

    // 5. Máscara CPF
    const cadCpf = document.getElementById('cadCpf');
    if (cadCpf) {
      cadCpf.addEventListener('input', () => {
        let v = cadCpf.value.replace(/\D/g, '').slice(0, 11);
        v = v.replace(/(\d{3})(\d)/, '$1.$2');
        v = v.replace(/(\d{3})(\d)/, '$1.$2');
        v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        cadCpf.value = v;
      });
    }

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
        atualizar();
        document.getElementById('listaFuncionarios').classList.remove('d-none');
        document.getElementById('visualizarFuncionario').classList.add('d-none');
        
        document.getElementById('pageTitle').textContent = 'Funcionários';
        document.getElementById('pageSubtitle').textContent = 'Gerencie a equipe da Dentus Clinic';
      });
    }
  }

  return { init, visualizar, adicionar, confirmarDeletar, confirmarRestaurarSenha, resetarModalRestaurar, copiarNovaSenha, cancelarCadastro, confirmarCadastro, acionarInputFoto, lidarUploadFoto };
})();


/* ══════════════════════════════════════
   INICIALIZAÇÃO
══════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', FuncionariosPage.init);
