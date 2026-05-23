let SERVICOS = [];
let ESPECIALIDADES = [];

/* ══════════════════════════════════════
   COMPONENTE — Tabela
══════════════════════════════════════ */
const TabelaServicos = {
  render(lista) {
    const tbody = document.getElementById('tbodyServicos');
    const empty = document.getElementById('emptyState');
    if (!tbody) return;

    if (lista.length === 0) {
      tbody.innerHTML = '';
      empty.classList.remove('hidden');
      return;
    }

    empty.classList.add('hidden');

    tbody.innerHTML = lista.map((s, i) => `
      <tr style="animation: rowAppear 0.3s ease-out ${i * 0.03}s both;">
        <td class="td-nome">${s.nome}</td>
        <td class="td-especialidade">
          <span class="badge-especialidade">${s.nomeEspecialidade || '—'}</span>
        </td>
        <td class="td-acoes">
          <button class="btn-delete" data-id="${s.id}" title="Remover ${s.nome}">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      </tr>
    `).join('');
  }
};

/* ══════════════════════════════════════
   COMPONENTE — Cards Mobile
══════════════════════════════════════ */
const CardsMobileServico = {
  render(lista) {
    const container = document.getElementById('cardsMobile');
    if (!container) return;

    if (lista.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-tooth"></i>
          <p>Nenhum serviço encontrado</p>
        </div>
      `;
      return;
    }

    container.innerHTML = lista.map(s => `
      <div class="card-servico-mobile">
        <div class="card-mobile-icon">
          <i class="fa-solid fa-tooth"></i>
        </div>
        <div class="card-mobile-info">
          <div class="card-mobile-nome">${s.nome}</div>
          <div class="card-mobile-detail">${s.nomeEspecialidade || '—'}</div>
        </div>
        <div class="card-mobile-actions">
          <button class="btn-delete" data-id="${s.id}" title="Remover ${s.nome}">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </div>
    `).join('');
  }
};

/* ══════════════════════════════════════
   CONTROLADOR DA PÁGINA
══════════════════════════════════════ */
const ServicosPage = (() => {
  let sortCol = null;
  let sortAsc = true;
  let servicoParaRemover = null;

  async function carregarDados() {
    try {
      const [resServicos, resEspecialidades] = await Promise.all([
        apiGetServicos(),
        apiGetEspecialidades()
      ]);

      ESPECIALIDADES = (resEspecialidades.dados || []);

      const mapaEspecialidades = Object.fromEntries(
        ESPECIALIDADES.map(e => [e.id, e.nome])
      );

      SERVICOS = (resServicos.dados || []).map(s => ({
        id:                s.id,
        nome:              s.nome,
        idEspecialidade:   s.idEspecialidade,
        nomeEspecialidade: s.idEspecialidade ? (mapaEspecialidades[s.idEspecialidade] || '—') : '—'
      }));

      popularSelectEspecialidade();
      atualizar();
    } catch (erro) {
      console.error('Erro ao carregar dados:', erro.message);
    }
  }

  function popularSelectEspecialidade() {
    const selectFiltro = document.getElementById('filtroEspecialidade');
    const selectCadastro = document.getElementById('selectEspecialidadeServico');

    const opcoesEspecialidade = ESPECIALIDADES.map(e =>
      `<option value="${e.id}">${e.nome}</option>`
    ).join('');

    if (selectFiltro) {
      selectFiltro.innerHTML = `<option value="">Todas</option>${opcoesEspecialidade}`;
    }
    if (selectCadastro) {
      selectCadastro.innerHTML = `<option value="">Selecione uma especialidade...</option>${opcoesEspecialidade}`;
    }
  }

  function listaFiltrada() {
    const nome = (document.getElementById('filtroNome')?.value || '').toLowerCase().trim();
    const idEsp = document.getElementById('filtroEspecialidade')?.value || '';

    let lista = SERVICOS.filter(s => {
      const matchNome = !nome || s.nome.toLowerCase().includes(nome);
      const matchEsp  = !idEsp || String(s.idEspecialidade) === idEsp;
      return matchNome && matchEsp;
    });

    if (sortCol === 'nome') {
      lista.sort((a, b) => {
        const va = a.nome.toLowerCase();
        const vb = b.nome.toLowerCase();
        if (va < vb) return sortAsc ? -1 : 1;
        if (va > vb) return sortAsc ?  1 : -1;
        return 0;
      });
    }

    return lista;
  }

  function atualizar() {
    const lista = listaFiltrada();
    TabelaServicos.render(lista);
    CardsMobileServico.render(lista);

    const badge = document.getElementById('badgeTotal');
    if (badge) {
      badge.textContent = `${lista.length} serviço${lista.length !== 1 ? 's' : ''}`;
    }
  }

  function abrirModalCadastro() {
    document.getElementById('inputNomeServico').value = '';
    document.getElementById('selectEspecialidadeServico').value = '';
    document.getElementById('inputNomeServico').classList.remove('is-invalid');
    document.getElementById('selectEspecialidadeServico').classList.remove('is-invalid');
    document.getElementById('erroGeralCadastro').classList.add('d-none');

    bootstrap.Modal.getOrCreateInstance(document.getElementById('modalCadastrarServico')).show();
  }

  async function confirmarCadastro() {
    const nome    = document.getElementById('inputNomeServico').value.trim();
    const idEsp   = document.getElementById('selectEspecialidadeServico').value;
    let valido = true;

    document.getElementById('inputNomeServico').classList.remove('is-invalid');
    document.getElementById('selectEspecialidadeServico').classList.remove('is-invalid');
    document.getElementById('erroGeralCadastro').classList.add('d-none');

    if (!nome) {
      document.getElementById('inputNomeServico').classList.add('is-invalid');
      document.getElementById('erroNomeServico').textContent = 'Informe o nome do serviço.';
      valido = false;
    }

    if (!idEsp) {
      document.getElementById('selectEspecialidadeServico').classList.add('is-invalid');
      document.getElementById('erroEspecialidadeServico').textContent = 'Selecione uma especialidade.';
      valido = false;
    }

    if (!valido) return;

    const btnConfirmar = document.getElementById('btnConfirmarCadastro');
    btnConfirmar.disabled = true;
    btnConfirmar.textContent = 'Cadastrando...';

    try {
      await apiCadastrarServico({ nome, idEspecialidade: parseInt(idEsp) });
      bootstrap.Modal.getInstance(document.getElementById('modalCadastrarServico')).hide();
      await carregarDados();
    } catch (erro) {
      const erroEl = document.getElementById('erroGeralCadastro');
      erroEl.textContent = erro.message || 'Erro ao cadastrar serviço.';
      erroEl.classList.remove('d-none');
    } finally {
      btnConfirmar.disabled = false;
      btnConfirmar.textContent = 'Cadastrar';
    }
  }

  function confirmarRemocao(id) {
    const s = SERVICOS.find(sv => sv.id === id);
    if (!s) return;

    servicoParaRemover = id;
    document.getElementById('mdlNomeServico').textContent          = s.nome;
    document.getElementById('mdlEspecialidadeServico').textContent = s.nomeEspecialidade;
    document.getElementById('erroRemocao').classList.add('d-none');

    bootstrap.Modal.getOrCreateInstance(document.getElementById('modalExcluirServico')).show();
  }

  async function efetivarRemocao() {
    if (servicoParaRemover === null) return;

    const btnConfirmar = document.getElementById('btnConfirmarExclusao');
    const erroEl       = document.getElementById('erroRemocao');
    btnConfirmar.disabled = true;
    erroEl.classList.add('d-none');

    try {
      await apiRemoverServico(servicoParaRemover);

      SERVICOS = SERVICOS.filter(s => s.id !== servicoParaRemover);
      servicoParaRemover = null;
      atualizar();

      const modal = bootstrap.Modal.getInstance(document.getElementById('modalExcluirServico'));
      if (modal) modal.hide();

      document.querySelectorAll('.modal-backdrop').forEach(b => b.remove());
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    } catch (erro) {
      erroEl.textContent = erro.message || 'Erro ao remover serviço. Tente novamente.';
      erroEl.classList.remove('d-none');
    } finally {
      btnConfirmar.disabled = false;
    }
  }

  function init() {
    SidebarComponent.render('sidebarContainer', {
      perfil: 'admin',
      ativo:  'servicos',
      nome:   sessionStorage.getItem('nome') || 'Admin',
      cargo:  'Administrador'
    });

    const btnHamburger = document.getElementById('btnHamburger');
    if (btnHamburger) {
      btnHamburger.addEventListener('click', () => SidebarComponent.toggleSidebar());
    }

    document.getElementById('btnNovoServico')?.addEventListener('click', abrirModalCadastro);
    document.getElementById('btnConfirmarCadastro')?.addEventListener('click', confirmarCadastro);
    document.getElementById('btnConfirmarExclusao')?.addEventListener('click', efetivarRemocao);

    // Delegação para botões de delete na tabela e nos cards
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn-delete[data-id]');
      if (!btn) return;
      confirmarRemocao(parseInt(btn.dataset.id));
    });

    // Filtros com debounce
    let debounce;
    ['filtroNome', 'filtroEspecialidade'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', () => {
          clearTimeout(debounce);
          debounce = setTimeout(atualizar, 200);
        });
        el.addEventListener('change', () => {
          clearTimeout(debounce);
          debounce = setTimeout(atualizar, 100);
        });
      }
    });

    document.getElementById('btnLimparFiltros')?.addEventListener('click', () => {
      const filtroNome = document.getElementById('filtroNome');
      const filtroEsp  = document.getElementById('filtroEspecialidade');
      if (filtroNome) filtroNome.value = '';
      if (filtroEsp)  filtroEsp.value  = '';
      atualizar();
    });

    // Ordenação por coluna
    document.querySelectorAll('.th-sort').forEach(btn => {
      btn.addEventListener('click', () => {
        const col = btn.dataset.col;
        if (sortCol === col) {
          sortAsc = !sortAsc;
        } else {
          sortCol = col;
          sortAsc = true;
        }

        document.querySelectorAll('.th-sort i').forEach(icon => {
          icon.className = 'bi bi-chevron-expand';
        });
        const icon = btn.querySelector('i');
        icon.className = sortAsc ? 'bi bi-chevron-up' : 'bi bi-chevron-down';

        atualizar();
      });
    });

    carregarDados();
  }

  return { init, confirmarRemocao, efetivarRemocao };
})();

document.addEventListener('DOMContentLoaded', ServicosPage.init);
