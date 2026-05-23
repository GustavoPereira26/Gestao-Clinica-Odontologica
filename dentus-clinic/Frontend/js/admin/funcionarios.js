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
          ${func.foto ? `<img src="${func.foto}" alt="${func.nome}" style="width: 100%; height: 100%; object-fit: cover;">` : '<i class="fa-solid fa-user card-avatar-icon"></i>'}
        </div>

        <h3 class="card-nome">${func.nome}</h3>
        <span class="cargo-badge ${tipo}">${func.cargo}</span>

        <button class="btn-visualizar"
                onclick="FuncionariosPage.visualizar(${func.id}, '${tipo}')"
                id="btnVisualizar-${func.id}"
                title="Visualizar ${func.nome}">
          <i class="fa-solid fa-eye"></i>
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
  let funcionarioAtualId   = null;
  let funcionarioAtualTipo = null;
  let campoEmEdicao  = null;
  let valorEmEdicao  = null;

  async function carregarFuncionarios() {
    try {
      const [resFuncionarios, resDentistas] = await Promise.all([
        apiGetFuncionarios(),
        apiGetDentistas()
      ]);

      const funcionarios = (resFuncionarios.dados || []).map(f => ({
        id:             f.id,
        nome:           f.nome,
        cargo:          f.cargo,
        tipo:           f.cargo.toLowerCase(),
        cpf:            f.cpf,
        dataNascimento: f.dataNascimento,
        telefone:       f.telefone,
        email:          f.email
      }));

      const dentistas = (resDentistas.dados || []).map(d => ({
        id:            d.id,
        nome:          d.nome,
        cargo:         'Dentista',
        tipo:          'dentista',
        cpf:           d.cpf,
        telefone:      d.telefone,
        email:         d.email,
        cro:           d.cro,
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
      if (!select) return;
      select.innerHTML = (res.dados || [])
        .map(e => `<option value="${e.id}">${e.nome}</option>`)
        .join('');
    } catch {
      const select = document.getElementById('cadEspecialidade');
      if (select) select.innerHTML = '<option value="">Erro ao carregar</option>';
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
  function visualizar(id, tipo) {
    const func = FUNCIONARIOS.find(f => f.id === id && f.tipo === tipo);
    if (func) {
      funcionarioAtualId   = id;
      funcionarioAtualTipo = tipo;
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
      
      const isDentista = func.tipo === 'dentista';
      const cpfFormatado = (func.cpf || '').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');

      document.getElementById('visCargo').value    = func.cargo;
      document.getElementById('visNome').value     = func.nome;
      document.getElementById('visCpf').value      = cpfFormatado;
      document.getElementById('visEmail').value    = func.email || '';
      document.getElementById('visTelefone').value = func.telefone || '';

      document.getElementById('visDataNascimentoContainer').classList.toggle('d-none', isDentista);
      document.getElementById('visCROContainer').classList.toggle('d-none', !isDentista);
      document.getElementById('visEspecialidadeContainer').classList.toggle('d-none', !isDentista);

      if (isDentista) {
        document.getElementById('visCRO').value           = func.cro || '';
        document.getElementById('visEspecialidade').value = func.especialidade || '';
      } else {
        const dt = func.dataNascimento;
        document.getElementById('visDataNascimento').value = dt
          ? new Date(dt + 'T00:00:00').toLocaleDateString('pt-BR')
          : '';
      }

      document.getElementById('pageTitle').textContent    = `Visualizar: ${func.nome}`;
      document.getElementById('pageSubtitle').textContent = func.cargo;
    }
  }

  async function confirmarDeletar() {
    if (funcionarioAtualId === null) return;

    const btn    = document.getElementById('btnConfirmarInativar');
    const alerta = document.getElementById('alertaInativarFuncionario');
    btn.disabled = true;
    alerta.classList.add('d-none');

    try {
      await apiRemoverFuncionario(funcionarioAtualId);

      const modalEl   = document.getElementById('modalDeletarFuncionario');
      const modalInst = bootstrap.Modal.getInstance(modalEl);
      if (modalInst) modalInst.hide();

      FUNCIONARIOS = FUNCIONARIOS.filter(f => !(f.id === funcionarioAtualId && f.tipo === funcionarioAtualTipo));
      atualizar();

      document.getElementById('listaFuncionarios').classList.remove('d-none');
      document.getElementById('visualizarFuncionario').classList.add('d-none');
      document.getElementById('pageTitle').textContent    = 'Funcionários';
      document.getElementById('pageSubtitle').textContent = 'Gerencie a equipe da Dentus Clinic';

      funcionarioAtualId   = null;
      funcionarioAtualTipo = null;
    } catch (erro) {
      alerta.textContent = erro.message || 'Erro ao inativar funcionário. Tente novamente.';
      alerta.classList.remove('d-none');
    } finally {
      btn.disabled = false;
    }
  }

  async function confirmarRestaurarSenha() {
    const senha = document.getElementById('novaSenhaInput').value.trim();
    const alerta = document.getElementById('alertaRestaurar');
    alerta.classList.add('d-none');

    if (!senha || senha.length < 6) {
      alerta.textContent = 'A senha deve ter no mínimo 6 caracteres.';
      alerta.classList.remove('d-none');
      return;
    }

    try {
      if (funcionarioAtualTipo === 'dentista') {
        await apiAtualizarDentista(funcionarioAtualId, { senha });
      } else {
        await apiAtualizarFuncionario(funcionarioAtualId, { senha });
      }

      const modalEl = document.getElementById('modalRestaurarSenha');
      bootstrap.Modal.getInstance(modalEl)?.hide();
      resetarModalRestaurar();
    } catch (erro) {
      alerta.textContent = erro.message;
      alerta.classList.remove('d-none');
    }
  }

  function resetarModalRestaurar() {
    setTimeout(() => {
      document.getElementById('novaSenhaInput').value = '';
      document.getElementById('alertaRestaurar').classList.add('d-none');
    }, 300);
  }

  function abrirModalEdicao(campo) {
    campoEmEdicao = campo;
    const isEmail = campo === 'email';

    document.getElementById('modalEditarCampoTitulo').textContent = isEmail ? 'Editar E-mail' : 'Editar Telefone';
    document.getElementById('modalEditarCampoLabel').textContent  = isEmail ? 'Novo e-mail'   : 'Novo telefone';

    const input = document.getElementById('inputEditarCampo');
    input.type        = isEmail ? 'email' : 'tel';
    input.placeholder = isEmail ? 'ex: nome@email.com' : 'ex: (11) 99999-9999';
    input.value       = '';

    document.getElementById('alertaEdicaoCampo').classList.add('d-none');
    bootstrap.Modal.getOrCreateInstance(document.getElementById('modalEditarCampo')).show();
  }

  function confirmarEdicao() {
    const input  = document.getElementById('inputEditarCampo');
    const alerta = document.getElementById('alertaEdicaoCampo');
    const valor  = input.value.trim();
    alerta.classList.add('d-none');

    if (campoEmEdicao === 'email') {
      if (!valor || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) {
        alerta.textContent = 'Informe um e-mail válido.';
        alerta.classList.remove('d-none');
        return;
      }
    } else {
      const digits = valor.replace(/\D/g, '');
      if (digits.length < 10 || digits.length > 11) {
        alerta.textContent = 'Informe um telefone válido (10 ou 11 dígitos).';
        alerta.classList.remove('d-none');
        return;
      }
    }

    valorEmEdicao = valor;
    document.getElementById('confirmarEdicaoCampoLabel').textContent = campoEmEdicao === 'email' ? 'e-mail' : 'telefone';
    document.getElementById('confirmarEdicaoValor').textContent       = valor;

    bootstrap.Modal.getOrCreateInstance(document.getElementById('modalEditarCampo')).hide();
    bootstrap.Modal.getOrCreateInstance(document.getElementById('modalConfirmarEdicao')).show();
  }

  async function salvarEdicao() {
    if (!campoEmEdicao || valorEmEdicao === null) return;

    try {
      const valorParaApi = campoEmEdicao === 'telefone'
        ? valorEmEdicao.replace(/\D/g, '')
        : valorEmEdicao;
      const dados = { [campoEmEdicao]: valorParaApi };
      if (funcionarioAtualTipo === 'dentista') {
        await apiAtualizarDentista(funcionarioAtualId, dados);
      } else {
        await apiAtualizarFuncionario(funcionarioAtualId, dados);
      }

      const func = FUNCIONARIOS.find(f => f.id === funcionarioAtualId && f.tipo === funcionarioAtualTipo);
      if (func) func[campoEmEdicao] = valorEmEdicao;

      const elId = campoEmEdicao === 'email' ? 'visEmail' : 'visTelefone';
      document.getElementById(elId).value = valorEmEdicao;

      bootstrap.Modal.getOrCreateInstance(document.getElementById('modalConfirmarEdicao')).hide();
      resetarModalEdicao();
    } catch (erro) {
      bootstrap.Modal.getOrCreateInstance(document.getElementById('modalConfirmarEdicao')).hide();
      document.getElementById('alertaEdicaoCampo').textContent = erro.message;
      document.getElementById('alertaEdicaoCampo').classList.remove('d-none');
      bootstrap.Modal.getOrCreateInstance(document.getElementById('modalEditarCampo')).show();
    }
  }

  function resetarModalEdicao() {
    campoEmEdicao = null;
    valorEmEdicao = null;
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
                const func = FUNCIONARIOS.find(f => f.id === funcionarioAtualId && f.tipo === funcionarioAtualTipo);
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
    const telefone = document.getElementById('cadTelefone').value.replace(/\D/g, '');
    const email    = document.getElementById('cadEmail').value.trim();
    const senha    = document.getElementById('cadSenha').value;

    const alerta = document.getElementById('alertaCadastro');
    const mostrarErro = (msg) => {
      alerta.innerHTML = msg.split('\n').map(m => `<div>${m}</div>`).join('');
      alerta.classList.remove('d-none');
    };
    alerta.classList.add('d-none');

    if (!nome)              { mostrarErro('Nome é obrigatório.'); return; }
    if (cpf.length !== 11)  { mostrarErro('CPF inválido. Informe exatamente 11 dígitos.'); return; }
    if (!email)             { mostrarErro('E-mail é obrigatório.'); return; }
    if (!senha)             { mostrarErro('Senha é obrigatória.'); return; }
    if (senha.length < 6)   { mostrarErro('A senha deve ter no mínimo 6 caracteres.'); return; }

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

    // 3. Máscara progressiva do telefone no modal de edição
    const inputEditar = document.getElementById('inputEditarCampo');
    if (inputEditar) {
      inputEditar.addEventListener('input', () => {
        if (campoEmEdicao !== 'telefone') return;
        let v = inputEditar.value.replace(/\D/g, '').slice(0, 11);
        if (v.length > 10)     v = `(${v.slice(0,2)}) ${v.slice(2,7)}-${v.slice(7)}`;
        else if (v.length > 6) v = `(${v.slice(0,2)}) ${v.slice(2,6)}-${v.slice(6)}`;
        else if (v.length > 2) v = `(${v.slice(0,2)}) ${v.slice(2)}`;
        else if (v.length > 0) v = `(${v}`;
        inputEditar.value = v;
      });
    }

    // 3b. Toggle mostrar/ocultar nova senha no modal
    const toggleNovaSenha = document.getElementById('toggleNovaSenha');
    if (toggleNovaSenha) {
      toggleNovaSenha.addEventListener('click', () => {
        const input = document.getElementById('novaSenhaInput');
        const icon  = toggleNovaSenha.querySelector('i');
        const oculto = input.type === 'password';
        input.type = oculto ? 'text' : 'password';
        icon.classList.toggle('bi-eye-slash', !oculto);
        icon.classList.toggle('bi-eye', oculto);
      });
    }

    // 4. Carrega da API
    carregarFuncionarios();
    carregarEspecialidades();

    // 4. Atualiza campos ao mudar cargo
    const cadCargo = document.getElementById('cadCargo');
    if (cadCargo) {
      cadCargo.addEventListener('change', atualizarCamposPorCargo);
      atualizarCamposPorCargo();
    }

    // 5. Máscara telefone do cadastro
    const cadTelefone = document.getElementById('cadTelefone');
    if (cadTelefone) {
      cadTelefone.addEventListener('input', () => {
        let v = cadTelefone.value.replace(/\D/g, '').slice(0, 11);
        if (v.length > 10)     v = `(${v.slice(0,2)}) ${v.slice(2,7)}-${v.slice(7)}`;
        else if (v.length > 6) v = `(${v.slice(0,2)}) ${v.slice(2,6)}-${v.slice(6)}`;
        else if (v.length > 2) v = `(${v.slice(0,2)}) ${v.slice(2)}`;
        else if (v.length > 0) v = `(${v}`;
        cadTelefone.value = v;
      });
    }

    // 5b. Máscara CPF
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

  return { init, visualizar, adicionar, confirmarDeletar, confirmarRestaurarSenha, resetarModalRestaurar, cancelarCadastro, confirmarCadastro, acionarInputFoto, lidarUploadFoto, abrirModalEdicao, confirmarEdicao, salvarEdicao, resetarModalEdicao };
})();


/* ══════════════════════════════════════
   INICIALIZAÇÃO
══════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', FuncionariosPage.init);
