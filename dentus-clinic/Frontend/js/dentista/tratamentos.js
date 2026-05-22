document.addEventListener("DOMContentLoaded", () => {

  // ── Sidebar ──
  SidebarComponent.render("sidebarContainer", {
    perfil: "dentista",
    ativo: "tratamentos"
  });

  const btnHamburger = document.getElementById("btnHamburger");
  if (btnHamburger) btnHamburger.addEventListener("click", () => SidebarComponent.toggleSidebar());

  // ══════════════════════════════════
  //  ESTADO GLOBAL
  // ══════════════════════════════════
  const dentistaId  = parseInt(sessionStorage.getItem('id'));
  const dentistaNome = sessionStorage.getItem('nome') || '—';

  let todasConsultas  = [];  // all consultations from API
  let consultasDent   = [];  // filtered by dentistaId
  let pacientesMap    = {};  // idPaciente → PacienteResponse
  let todosRows       = [];  // todos os pacientes na lista
  let selectedIndex   = 0;
  let currentTratamento = null;  // selected row object
  let currentConsulta   = null;  // selected consulta object

  // Captured just before finalization view opens (inputs still visible)
  let pendingObservacoes = { condicao: null, descricao: null, observacao: null };

  // State for finalization choice flow
  let _prontuarioParaFinalizar = null;
  let _planoMaisRecente        = null;

  // Currently displayed plano in prontuário view (for edit)
  let currentPlano     = null;
  let currentProntuario = null;

  // ── Helpers ──────────────────────────────────────────────────────────
  function formatarData(iso) {
    if (!iso) return '—';
    const [y, m, d] = String(iso).split('-');
    return `${d}/${m}/${y}`;
  }

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

  function resolverDataPlano(plano, prontuario) {
    if (plano?.dataAtualizacao && plano.dataAtualizacao !== '0001-01-01')
      return formatarData(plano.dataAtualizacao);
    const d = plano?.dataCriacao;
    if (d && d !== '0001-01-01') return formatarData(d);
    if (prontuario?.dataAbertura) return formatarData(prontuario.dataAbertura);
    return '—';
  }

  function pacienteToRow(p) {
    return {
      idPaciente: p.id,
      paciente:   p.nome || '—',
      _paciente:  p
    };
  }

  function montarListaPacientes() {
    todosRows = Object.values(pacientesMap)
      .map(pacienteToRow)
      .sort((a, b) => a.paciente.localeCompare(b.paciente, 'pt-BR', { sensitivity: 'base' }));
  }

  // Map consulta → row object with compatibility fields
  function consultaToRow(c) {
    return {
      _consulta:   c,
      consultaId:  c.id,
      idPaciente:  c.idPaciente,
      paciente:    c.nomePaciente || '—',
      servico:     c.nomeServico  || '—',
      status:      c.status       || '—',
      progresso:   0,
      proximaSessao: formatarData(c.dataConsulta),
      etapasFeitas:  0,
      etapasTotal:   0,
      ultimaEtapa:   '—',
      proximaEtapa:  '—'
    };
  }

  // ══════════════════════════════════
  //  CARGA DE DADOS
  // ══════════════════════════════════
  async function carregarDados() {
    try {
      const [resConsultas, resPacientes] = await Promise.all([
        apiGetConsultas(),
        apiGetPacientes()
      ]);

      todasConsultas = resConsultas?.dados || [];
      const todosPacientes = resPacientes?.dados || [];

      todosPacientes.forEach(p => { pacientesMap[p.id] = p; });
      consultasDent = todasConsultas.filter(c => c.idDentista === dentistaId);

      montarListaPacientes();
      atualizarLista();
    } catch (err) {
      console.error('Erro ao carregar tratamentos:', err.message);
    }
  }

  function atualizarLista() {
    selectedIndex = 0;
    currentConsulta = null;
    currentTratamento = todosRows[0] || null;
    renderListaPacientes(todosRows);
    if (todosRows.length > 0) {
      atualizarResumo(todosRows[0]);
    } else {
      document.getElementById("resumoNome").textContent = "—";
    }
  }

  // ══════════════════════════════════
  //  ELEMENTOS DA VIEW LISTA
  // ══════════════════════════════════
  const filterBar         = document.querySelector(".filter-bar");
  const tratamentosLayout = document.getElementById("tratamentosLayout");
  const editarPlanoView   = document.getElementById("editarPlanoView");

  // ══════════════════════════════════
  //  RENDERIZAR TABELA
  // ══════════════════════════════════
  const listaPacientes = document.getElementById("listaPacientes");

  function selecionarPaciente(t, i, dados) {
    selectedIndex = i;
    currentTratamento = t;
    currentConsulta = t._consulta || null;
    renderListaPacientes(dados);
    atualizarResumo(t);
    const resumoEl = document.getElementById("painelResumo");
    if (resumoEl && window.innerWidth < 992) {
      resumoEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function renderListaPacientes(dados) {
    if (!listaPacientes) return;
    listaPacientes.innerHTML = "";

    if (!dados.length) {
      listaPacientes.innerHTML =
        '<li class="tratamentos-lista-vazia">Nenhum paciente encontrado</li>';
      return;
    }

    dados.forEach((t, i) => {
      const li = document.createElement("li");
      li.className = "tratamento-paciente-item" + (i === selectedIndex ? " selected" : "");
      li.setAttribute("role", "option");
      li.setAttribute("aria-selected", i === selectedIndex ? "true" : "false");
      li.textContent = t.paciente;
      li.addEventListener("click", () => selecionarPaciente(t, i, dados));
      listaPacientes.appendChild(li);
    });
  }

  // ══════════════════════════════════
  //  ATUALIZAR PAINEL RESUMO
  // ══════════════════════════════════
  function atualizarResumo(t) {
    document.getElementById("resumoNome").textContent = t?.paciente || "—";
  }

  // ══════════════════════════════════
  //  FILTROS
  // ══════════════════════════════════
  const filtroPaciente = document.getElementById("filtroPaciente");

  function aplicarFiltros() {
    const paciente = filtroPaciente.value.toLowerCase().trim();
    const filtrados = todosRows.filter(t => {
      if (paciente && !t.paciente.toLowerCase().includes(paciente)) return false;
      return true;
    });

    selectedIndex = 0;
    renderListaPacientes(filtrados);
    if (filtrados.length > 0) atualizarResumo(filtrados[0]);
  }

  filtroPaciente.addEventListener("input", aplicarFiltros);

  document.getElementById("btnLimparFiltros").addEventListener("click", () => {
    filtroPaciente.value = "";
    selectedIndex = 0;
    renderListaPacientes(todosRows);
    if (todosRows.length > 0) atualizarResumo(todosRows[0]);
  });

  // ══════════════════════════════════════════════════════
  //  EDITAR PLANO — ABRIR / FECHAR
  // ══════════════════════════════════════════════════════
  function resetarViewLista() {
    filterBar?.classList.remove("tratamentos-oculto");
    tratamentosLayout?.classList.remove("tratamentos-oculto");

    ["editarPlanoView", "consultaView", "prontuarioView", "finalizarConsultaView"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.style.display = "none";
    });
  }

  function mostrarEditarPlano() {
    filterBar?.classList.add("tratamentos-oculto");
    tratamentosLayout?.classList.add("tratamentos-oculto");

    const t = currentTratamento || {};
    document.getElementById("editarResumoNome").textContent    = t.paciente    || '—';
    document.getElementById("editarResumoServico").textContent = t.servico     || '—';
    document.getElementById("editarResumoEtapas").textContent  =
      `${t.etapasFeitas || 0} de ${t.etapasTotal || 0} Etapas`;
    const pct = t.etapasTotal > 0
      ? Math.round((t.etapasFeitas / t.etapasTotal) * 100) : 0;
    document.getElementById("editarResumoProgressoFill").style.width = pct + "%";
    document.getElementById("editarUltimaEtapa").textContent   = t.ultimaEtapa  || '—';
    document.getElementById("editarProximaEtapa").textContent  = t.proximaEtapa || '—';

    editarPlanoView.style.display = "block";
    renderCalendario(calAno, calMes);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function voltarParaLista() {
    editarPlanoView.style.display = "none";
    resetarViewLista();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  document.getElementById("btnVoltarPlano").addEventListener("click", voltarParaLista);

  // ══════════════════════════════════
  //  ETAPAS — SELEÇÃO DE CARDS
  // ══════════════════════════════════
  const etapaCards = document.querySelectorAll(".etapa-card");
  etapaCards.forEach(card => {
    card.addEventListener("click", (e) => {
      if (e.target.closest("input, textarea, button")) return;
      etapaCards.forEach(c => c.classList.remove("active"));
      card.classList.add("active");
    });
  });

  document.querySelectorAll("#etapasScroll .etapa-input, #etapasScroll .etapa-textarea").forEach(el => {
    el.removeAttribute("readonly");
  });

  document.querySelectorAll(".etapa-edit-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const campo = btn.closest(".etapa-campo");
      if (!campo) return;
      const input = campo.querySelector(".etapa-input, .etapa-textarea");
      if (input) { input.focus(); input.select(); }
    });
  });

  // ══════════════════════════════════════════════════════
  //  ETAPAS — DRAG AND DROP
  // ══════════════════════════════════════════════════════
  function initEtapasDragDrop() {
    const container = document.getElementById("etapasScroll");
    if (!container) return;

    let draggedCard = null;
    let placeholder = null;

    function getAfterElement(clientX) {
      const cards = [...container.querySelectorAll(".etapa-card:not(.dragging)")];
      return cards.reduce((closest, child) => {
        const box    = child.getBoundingClientRect();
        const offset = clientX - box.left - box.width / 2;
        if (offset < 0 && offset > closest.offset) return { offset, element: child };
        return closest;
      }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    function renumerarEtapas() {
      container.querySelectorAll(".etapa-card").forEach((card, i) => {
        card.dataset.etapa = i + 1;
        const numEl = card.querySelector(".etapa-numero");
        if (numEl) numEl.textContent = `${i + 1}º`;
      });
    }

    container.addEventListener("dragstart", (e) => {
      const card = e.target.closest(".etapa-card");
      if (!card) return;
      draggedCard = card;
      e.dataTransfer.effectAllowed = "move";
      setTimeout(() => card.classList.add("dragging"), 0);
    });

    container.addEventListener("dragend", (e) => {
      const card = e.target.closest(".etapa-card");
      if (!card) return;
      card.classList.remove("dragging");
      if (placeholder?.parentNode) placeholder.parentNode.removeChild(placeholder);
      placeholder = null;
      draggedCard = null;
      renumerarEtapas();
    });

    container.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      if (!placeholder) {
        placeholder = document.createElement("div");
        placeholder.className = "etapa-placeholder";
      }
      const afterElement = getAfterElement(e.clientX);
      if (afterElement == null) container.appendChild(placeholder);
      else container.insertBefore(placeholder, afterElement);
    });

    container.addEventListener("dragleave", (e) => {
      if (e.relatedTarget && container.contains(e.relatedTarget)) return;
      if (placeholder?.parentNode) placeholder.parentNode.removeChild(placeholder);
      placeholder = null;
    });

    container.addEventListener("drop", (e) => {
      e.preventDefault();
      if (!draggedCard || !placeholder?.parentNode) return;
      placeholder.parentNode.insertBefore(draggedCard, placeholder);
      placeholder.parentNode.removeChild(placeholder);
      placeholder = null;
    });
  }

  initEtapasDragDrop();

  // ══════════════════════════════════
  //  ODONTOGRAMA — TOGGLE DENTES
  // ══════════════════════════════════
  const estados = ["saudavel", "selecao", "tratado", "ausente"];
  document.querySelectorAll(".dente").forEach(dente => {
    dente.addEventListener("click", () => {
      const currentState = estados.find(s => dente.classList.contains(s)) || "saudavel";
      const nextIndex    = (estados.indexOf(currentState) + 1) % estados.length;
      estados.forEach(s => dente.classList.remove(s));
      dente.classList.add(estados[nextIndex]);
    });
  });

  // ══════════════════════════════════
  //  CALENDÁRIO
  // ══════════════════════════════════
  const mesesNome = [
    "JANEIRO","FEVEREIRO","MARÇO","ABRIL","MAIO","JUNHO",
    "JULHO","AGOSTO","SETEMBRO","OUTUBRO","NOVEMBRO","DEZEMBRO"
  ];

  let calMes = new Date().getMonth();
  let calAno = new Date().getFullYear();
  let calDiaSelecionado = null;

  function renderCalendario(ano, mes, diaSelecionado = null) {
    const calBody  = document.getElementById("calBody");
    const calMesAno = document.getElementById("calMesAno");
    if (!calBody || !calMesAno) return;

    calMesAno.textContent = `${mesesNome[mes]} ${ano}`;

    const primeiroDia = new Date(ano, mes, 1).getDay();
    const totalDias   = new Date(ano, mes + 1, 0).getDate();
    const hoje        = new Date();

    let html = "";
    let dia  = 1;
    const rows = Math.ceil((primeiroDia + totalDias) / 7);

    for (let r = 0; r < rows; r++) {
      html += "<tr>";
      for (let c = 0; c < 7; c++) {
        const cellIndex = r * 7 + c;
        if (cellIndex < primeiroDia || dia > totalDias) {
          html += '<td class="empty"></td>';
        } else {
          const classes = [];
          if (hoje.getFullYear() === ano && hoje.getMonth() === mes && hoje.getDate() === dia) {
            classes.push("today");
          }
          if (diaSelecionado === dia) classes.push("selecionado");
          html += `<td class="${classes.join(" ")}">${dia}</td>`;
          dia++;
        }
      }
      html += "</tr>";
    }

    calBody.innerHTML = html;
  }

  document.getElementById("calPrev")?.addEventListener("click", () => {
    calMes--;
    if (calMes < 0) { calMes = 11; calAno--; }
    calDiaSelecionado = null;
    renderCalendario(calAno, calMes);
  });

  document.getElementById("calNext")?.addEventListener("click", () => {
    calMes++;
    if (calMes > 11) { calMes = 0; calAno++; }
    calDiaSelecionado = null;
    renderCalendario(calAno, calMes);
  });

  document.getElementById("datasLista")?.addEventListener("click", (e) => {
    const item = e.target.closest(".data-item");
    if (!item) return;

    document.querySelectorAll("#datasLista .data-item").forEach(i => i.classList.remove("ativo"));
    item.classList.add("ativo");

    const texto = item.querySelector("span")?.textContent?.trim();
    if (!texto) return;
    const partes = texto.split("/");
    if (partes.length !== 3) return;
    const dia = parseInt(partes[0], 10);
    const mes = parseInt(partes[1], 10) - 1;
    const ano = parseInt(partes[2], 10);

    calDiaSelecionado = dia;
    calMes = mes;
    calAno = ano;
    renderCalendario(calAno, calMes, calDiaSelecionado);
  });

  renderCalendario(calAno, calMes);

  const consultaView = document.getElementById("consultaView");

  // ══════════════════════════════════════════════════════
  //  CONSULTA — ODONTOGRAMA
  // ══════════════════════════════════════════════════════
  document.querySelectorAll(".dente-consulta").forEach(dente => {
    dente.addEventListener("click", () => {
      if (dente.classList.contains("tratamento")) {
        dente.classList.remove("tratamento");
        dente.classList.add("saudavel");
      } else {
        dente.classList.remove("saudavel");
        dente.classList.add("tratamento");
      }
      const todos       = document.querySelectorAll(".dente-consulta");
      const selecionados = document.querySelectorAll(".dente-consulta.tratamento");
      document.getElementById("chkSelecionarTodos").checked = selecionados.length === todos.length;
    });
  });

  document.getElementById("chkSelecionarTodos").addEventListener("change", (e) => {
    document.querySelectorAll(".dente-consulta").forEach(d => {
      d.classList.remove("saudavel", "tratamento");
      d.classList.add(e.target.checked ? "tratamento" : "saudavel");
    });
  });

  // ══════════════════════════════════════════════════════
  //  FINALIZAR CONSULTA
  // ══════════════════════════════════════════════════════
  const finalizarConsultaView = document.getElementById("finalizarConsultaView");

  document.getElementById("btnFinalizarConsulta").addEventListener("click", abrirFinalizarConsulta);

  function abrirFinalizarConsulta() {
    console.log('[FinalizarView] abrindo | currentConsulta:', currentConsulta);
    const t = currentTratamento || {};

    document.getElementById("finalizarNomePaciente").textContent = t.paciente || '—';
    document.getElementById("finalizarServico").textContent      = t.servico  || '—';
    document.getElementById("finalizarResumoNome").textContent   = t.paciente || '—';
    document.getElementById("finalizarResumoServico").textContent = t.servico || '—';
    document.getElementById("finalizarResumoEtapas").textContent  =
      `${t.etapasFeitas || 0} de ${t.etapasTotal || 0} Etapas`;
    const pct = t.etapasTotal > 0
      ? Math.round((t.etapasFeitas / t.etapasTotal) * 100) : 0;
    document.getElementById("finalizarResumoProgressoFill").style.width = pct + "%";
    document.getElementById("finalizarResumoUltimaEtapa").textContent   = t.ultimaEtapa  || '—';
    document.getElementById("finalizarResumoProximaEtapa").textContent  = t.proximaEtapa || '—';

    const dentesSelecionados = [...document.querySelectorAll(".dente-consulta.tratamento")]
      .map(d => d.dataset.num).filter(Boolean);

    pendingObservacoes = {
      condicao:  document.getElementById("consultaCondicao")?.value?.trim()  || null,
      descricao: document.getElementById("consultaDescricao")?.value?.trim() || null,
      observacao: document.getElementById("observacoesClinicas")?.value?.trim() || null,
      dente: dentesSelecionados.length ? dentesSelecionados.join(',') : null,
    };

    document.getElementById("finalizarCondicao").textContent    = pendingObservacoes.condicao   || "—";
    document.getElementById("finalizarDescricao").textContent   = pendingObservacoes.descricao  || "—";
    document.getElementById("finalizarObservacoes").textContent = pendingObservacoes.observacao || "—";

    document.querySelectorAll(".dente-consulta").forEach(src => {
      const dest = document.querySelector(`.dente-finalizar[data-num="${src.dataset.num}"]`);
      if (!dest) return;
      dest.classList.remove("saudavel", "tratado-consulta");
      dest.classList.add(src.classList.contains("tratamento") ? "tratado-consulta" : "saudavel");
    });

    _resetarEscolha();
    esconderTudo();
    finalizarConsultaView.style.display = "block";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  document.getElementById("btnCancelarFinalizar").addEventListener("click", () => {
    _resetarEscolha();
    finalizarConsultaView.style.display = "none";
    consultaView.style.display = "block";
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // ── Helpers de finalização ──────────────────────────────────────────
  function _resetarEscolha() {
    document.getElementById("finalizarEscolha").style.display  = "none";
    document.getElementById("btnConfirmarFinalizar").style.display = "";
    _prontuarioParaFinalizar = null;
    _planoMaisRecente        = null;
  }

  async function _concluirFinalizacao() {
    const idPaciente = currentConsulta?.idPaciente;

    // Mark consultation as "Encerrada"
    if (currentConsulta?.id) {
      try {
        await apiAtualizarStatusConsulta(currentConsulta.id, 'Encerrada');
      } catch (err) {
        console.warn('Não foi possível encerrar consulta:', err.message);
      }
    }

    finalizarConsultaView.style.display = "none";
    _resetarEscolha();

    await carregarDados();

    if (idPaciente) {
      const idx = todosRows.findIndex(r => r.idPaciente === idPaciente);
      if (idx >= 0) {
        selectedIndex = idx;
        currentTratamento = todosRows[idx];
        currentConsulta = null;
        renderListaPacientes(todosRows);
        atualizarResumo(currentTratamento);
      }
      await abrirProntuario("lista");
    } else {
      mostrarLista();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  // ── Confirmar Finalização: verificar se já existem registros ────────
  document.getElementById("btnConfirmarFinalizar").addEventListener("click", async () => {
    const idPaciente = currentConsulta?.idPaciente;
    const idServico  = currentConsulta?.idServico || null;
    if (!idPaciente) {
      // No patient linked — just close without creating a plano
      await _concluirFinalizacao();
      return;
    }

    const btn = document.getElementById("btnConfirmarFinalizar");
    btn.disabled = true;

    try {
      const resPront = await apiObterOuCriarProntuario(idPaciente);
      _prontuarioParaFinalizar = resPront?.dados || null;

      if (_prontuarioParaFinalizar?.id) {
        const resPlanos = await apiGetPlanosPorProntuario(_prontuarioParaFinalizar.id);
        const existentes = (resPlanos?.dados || []).sort((a, b) => b.id - a.id);

        if (existentes.length > 0) {
          _planoMaisRecente = existentes[0];
          // Show choice UI
          btn.style.display = "none";
          const escolha = document.getElementById("finalizarEscolha");
          escolha.style.display = "flex";
          btn.disabled = false;
          return;
        }
      }

      // No existing planos → create new directly
      const { condicao, descricao, observacao, dente } = pendingObservacoes;
      if (_prontuarioParaFinalizar?.id) {
        await apiCadastrarPlano({
          idProntuario: _prontuarioParaFinalizar.id,
          idServico,
          condicao,
          descricao,
          observacao,
          dente,
          status: 'Concluido'
        });
      }
      await _concluirFinalizacao();
    } catch (err) {
      console.error('[Finalizar] Erro:', err.message);
      await _concluirFinalizacao();
    }

    btn.disabled = false;
  });

  // ── Atualizar último registro ────────────────────────────────────────
  document.getElementById("btnAtualizarPlano").addEventListener("click", async () => {
    const idServico = currentConsulta?.idServico || null;
    const { condicao, descricao, observacao, dente } = pendingObservacoes;
    const plano = _planoMaisRecente;

    if (plano) {
      try {
        await apiEditarPlano(plano.id, {
          idProntuario: plano.idProntuario,
          idServico:    idServico ?? plano.idServico ?? null,
          condicao:     condicao  || plano.condicao  || null,
          descricao:    descricao || plano.descricao || null,
          observacao:   observacao|| plano.observacao|| null,
          dente:        dente     || plano.dente     || null,
          status: 'Concluido'
        });
      } catch (err) {
        console.error('[Finalizar] Erro ao atualizar plano:', err.message);
      }
    }

    await _concluirFinalizacao();
  });

  // ── Criar novo registro ──────────────────────────────────────────────
  document.getElementById("btnCriarNovoPlano").addEventListener("click", async () => {
    const idServico = currentConsulta?.idServico || null;
    const { condicao, descricao, observacao, dente } = pendingObservacoes;

    if (_prontuarioParaFinalizar?.id) {
      try {
        await apiCadastrarPlano({
          idProntuario: _prontuarioParaFinalizar.id,
          idServico,
          condicao,
          descricao,
          observacao,
          dente,
          status: 'Concluido'
        });
      } catch (err) {
        console.error('[Finalizar] Erro ao criar plano:', err.message);
      }
    }

    await _concluirFinalizacao();
  });

  // ══════════════════════════════════════════════════════
  //  PRONTUÁRIO — NAVEGAÇÃO
  // ══════════════════════════════════════════════════════
  const prontuarioView = document.getElementById("prontuarioView");
  let prontuarioOrigin = "lista";

  function esconderTudo() {
    filterBar?.classList.add("tratamentos-oculto");
    tratamentosLayout?.classList.add("tratamentos-oculto");
    if (editarPlanoView) editarPlanoView.style.display = "none";
    if (consultaView) consultaView.style.display = "none";
    if (prontuarioView) prontuarioView.style.display = "none";
    if (finalizarConsultaView) finalizarConsultaView.style.display = "none";
  }

  function mostrarLista() {
    resetarViewLista();
  }

  function setEl(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  async function abrirProntuario(origem) {
    prontuarioOrigin = origem;
    esconderTudo();

    const t       = currentTratamento || {};
    const idPac   = t.idPaciente;
    const paciente = idPac ? (pacientesMap[idPac] || {}) : {};

    console.log('[Prontuário] abrindo | idPac:', idPac, '| t:', t);

    // Fill header synchronously from in-memory data
    setEl("prontuarioNome",  t.paciente || '—');
    setEl("prontuarioCPF",   `CPF: ${formatarCPF(paciente.cpf)}`);
    setEl("prontuarioTel",   formatarTelefone(paciente.telefone));
    setEl("prontuarioEmail", paciente.email || '—');
    setEl("prontuarioInfoEmail",    paciente.email    || '—');
    setEl("prontuarioInfoEndereco", paciente.endereco || '—');

    // Show view immediately with header populated
    prontuarioView.style.display = "block";
    window.scrollTo({ top: 0, behavior: "smooth" });

    if (!idPac) {
      renderConsultasAgendadas([]);
      renderPlanosRealizados([], null);
      return;
    }

    // Load prontuário + planos from API
    try {
      const { prontuario, planos } = await buscarProntuarioEPlanos(idPac);

      setEl("prontuarioUltimaAtualizacao", prontuario
        ? formatarData(prontuario.dataUltimaAtualizacao ?? prontuario.dataAbertura)
        : '—');

      const consultasPaciente = todasConsultas.filter(c =>
        c.idPaciente === idPac &&
        c.status !== 'Cancelada' &&
        c.status !== 'Inativa'
      );
      renderConsultasAgendadas(consultasPaciente);
      renderPlanosRealizados(planos, prontuario);
    } catch (err) {
      console.error('Erro ao carregar dados do prontuário:', err);
    }
  }

  // Returns { prontuario, planos } — always fetches fresh from API.
  async function buscarProntuarioEPlanos(idPaciente) {
    let prontuario = null;
    let planos     = [];

    try {
      const res = await apiGetProntuarioPorPaciente(idPaciente);
      prontuario = res?.dados || null;
      console.log('[Prontuário] prontuário encontrado:', prontuario);
    } catch (err) {
      console.log('[Prontuário] nenhum prontuário para paciente', idPaciente, '—', err.message);
      return { prontuario: null, planos: [] };
    }

    if (prontuario?.id) {
      try {
        const resPlanos = await apiGetPlanosPorProntuario(prontuario.id);
        planos = resPlanos?.dados || [];
        console.log('[Prontuário] planos do prontuário', prontuario.id, ':', planos);
      } catch (err) {
        console.error('[Prontuário] erro ao buscar planos:', err.message);
      }
    }

    return { prontuario, planos };
  }

  function renderConsultasAgendadas(consultas) {
    const tbody = document.getElementById('tbodyConsultasAgendadas');
    if (!tbody) return;

    const hoje    = new Date().toISOString().split('T')[0];
    const proximas = consultas
      .filter(c => String(c.dataConsulta) >= hoje)
      .sort((a, b) => `${a.dataConsulta}T${a.horaConsulta}`.localeCompare(`${b.dataConsulta}T${b.horaConsulta}`));

    if (!proximas.length) {
      tbody.innerHTML = `<tr><td colspan="3" style="text-align:center;color:var(--c3);padding:1rem">Nenhuma consulta agendada</td></tr>`;
      return;
    }

    tbody.innerHTML = proximas.map(c => `
      <tr>
        <td>${formatarData(c.dataConsulta)}</td>
        <td>${(c.horaConsulta || '').slice(0, 5)}</td>
        <td>${c.nomeServico || '—'}</td>
      </tr>
    `).join('');
  }

  function renderPlanosRealizados(planos, prontuario) {
    const tbodyEl = document.querySelector('#tabelaPlanosRealizados tbody');
    if (!tbodyEl) return;

    currentProntuario = prontuario;

    if (!planos.length) {
      tbodyEl.innerHTML = `<tr><td colspan="3" style="text-align:center;color:var(--c3);padding:1rem">Nenhum plano encontrado</td></tr>`;
      setEl('prontuarioPlanoServico', '—');
      setEl('prontuarioPlanoData',    '—');
      setEl('prontuarioCondicao',     '—');
      setEl('prontuarioDescricao',    '—');
      setEl('prontuarioObsTexto',     '—');
      setEl('prontuarioDentista',     '—');
      const editAcao = document.getElementById('prontuarioEditarAcao');
      if (editAcao) editAcao.style.display = 'none';
      return;
    }

    tbodyEl.innerHTML = planos.map((p, i) => `
      <tr class="plano-row${i === 0 ? ' selected' : ''}" data-idx="${i}">
        <td>${resolverDataPlano(p, prontuario)}</td>
        <td>${p.nomeServico || '—'}</td>
        <td>${dentistaNome}</td>
      </tr>
    `).join('');

    // Show first plano details
    mostrarDetalhePlano(planos[0], prontuario);

    // Click listeners
    tbodyEl.querySelectorAll('.plano-row').forEach(row => {
      row.addEventListener('click', () => {
        tbodyEl.querySelectorAll('.plano-row').forEach(r => r.classList.remove('selected'));
        row.classList.add('selected');
        const idx = parseInt(row.dataset.idx);
        mostrarDetalhePlano(planos[idx], prontuario);
      });
    });
  }

  function mostrarDetalhePlano(plano, prontuario) {
    _fecharEdicaoInline();
    currentPlano      = plano;
    currentProntuario = prontuario;

    setEl('prontuarioPlanoServico', plano.nomeServico || '—');
    setEl('prontuarioPlanoData',    resolverDataPlano(plano, prontuario));
    setEl('prontuarioCondicao',     plano.condicao   || '—');
    setEl('prontuarioDescricao',    plano.descricao  || '—');
    setEl('prontuarioObsTexto',     plano.observacao || '—');
    setEl('prontuarioDentista',     dentistaNome);

    const editAcao = document.getElementById('prontuarioEditarAcao');
    if (editAcao) editAcao.style.display = 'flex';

    // Reset all teeth
    document.querySelectorAll('.dente-prontuario').forEach(d => {
      d.classList.remove('tratado-consulta');
      d.classList.add('saudavel');
    });

    // Highlight selected teeth
    if (plano.dente) {
      if (plano.dente === 'todos') {
        document.querySelectorAll('.dente-prontuario').forEach(d => {
          d.classList.remove('saudavel');
          d.classList.add('tratado-consulta');
        });
      } else {
        plano.dente.split(',').forEach(num => {
          const el = document.querySelector(`.dente-prontuario[data-num="${num.trim()}"]`);
          if (el) {
            el.classList.remove('saudavel');
            el.classList.add('tratado-consulta');
          }
        });
      }
    }
  }

  // Botões que abrem prontuário
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-prontuario") || e.target.closest(".btn-prontuario-mobile");
    if (!btn) return;
    e.stopPropagation();
    const idx = parseInt(btn.dataset.idx, 10);
    if (!isNaN(idx) && idx >= 0 && idx < todosRows.length) {
      currentTratamento = todosRows[idx];
      currentConsulta   = currentTratamento._consulta || null;
    }
    abrirProntuario("lista");
  });

  document.getElementById("btnProntuarioConsulta")?.addEventListener("click", () => abrirProntuario("consulta"));
  document.getElementById("btnResumoProntuario")?.addEventListener("click",   () => abrirProntuario("lista"));

  document.getElementById("btnVoltarProntuario").addEventListener("click", () => {
    _fecharEdicaoInline();
    prontuarioView.style.display = "none";
    if (prontuarioOrigin === "consulta") consultaView.style.display = "block";
    else mostrarLista();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // ══════════════════════════════════════════════════════
  //  EDITAR REGISTRO DO PRONTUÁRIO — inline (sem modal)
  // ══════════════════════════════════════════════════════
  let _editModeAtivo = false;

  function _abrirEdicaoInline() {
    if (!currentPlano) return;
    _editModeAtivo = true;

    // Populate fields
    document.getElementById("editCondicao").value  = currentPlano.condicao   || "";
    document.getElementById("editDescricao").value = currentPlano.descricao  || "";
    document.getElementById("editObsTexto").value  = currentPlano.observacao || "";

    // Switch display → edit
    document.getElementById("prontuarioCondicao").classList.add("d-none");
    document.getElementById("editCondicao").classList.remove("d-none");
    document.getElementById("prontuarioDescricao").classList.add("d-none");
    document.getElementById("editDescricao").classList.remove("d-none");
    document.getElementById("prontuarioObsTexto").classList.add("d-none");
    document.getElementById("editObsTexto").classList.remove("d-none");

    // Show save/cancel, hide edit button
    document.getElementById("btnEditarRegistroProntuario").classList.add("d-none");
    document.getElementById("prontuarioAcoesEditar").style.display = "flex";

    // Hint on odontogram
    document.getElementById("odontogramaHint")?.classList.remove("d-none");
    document.querySelectorAll(".dente-prontuario").forEach(d => {
      d.style.cursor = "pointer";
    });
  }

  function _fecharEdicaoInline() {
    _editModeAtivo = false;

    // Switch edit → display
    document.getElementById("prontuarioCondicao").classList.remove("d-none");
    document.getElementById("editCondicao").classList.add("d-none");
    document.getElementById("prontuarioDescricao").classList.remove("d-none");
    document.getElementById("editDescricao").classList.add("d-none");
    document.getElementById("prontuarioObsTexto").classList.remove("d-none");
    document.getElementById("editObsTexto").classList.add("d-none");

    // Show edit button, hide save/cancel
    document.getElementById("btnEditarRegistroProntuario").classList.remove("d-none");
    document.getElementById("prontuarioAcoesEditar").style.display = "none";

    document.getElementById("odontogramaHint")?.classList.add("d-none");
    document.querySelectorAll(".dente-prontuario").forEach(d => {
      d.style.cursor = "";
    });
  }

  // Odontogram in prontuário view — only interactive in edit mode
  document.getElementById("prontuarioOdontograma")?.addEventListener("click", (e) => {
    if (!_editModeAtivo) return;
    const d = e.target.closest(".dente-prontuario");
    if (!d) return;
    if (d.classList.contains("tratado-consulta")) {
      d.classList.remove("tratado-consulta");
      d.classList.add("saudavel");
    } else {
      d.classList.remove("saudavel");
      d.classList.add("tratado-consulta");
    }
  });

  document.getElementById("btnEditarRegistroProntuario")?.addEventListener("click", _abrirEdicaoInline);

  document.getElementById("btnCancelarEdicaoInline")?.addEventListener("click", () => {
    // Restore original teeth state from currentPlano
    if (currentPlano && currentProntuario) mostrarDetalhePlano(currentPlano, currentProntuario);
    _fecharEdicaoInline();
  });

  document.getElementById("btnSalvarEdicaoInline")?.addEventListener("click", async () => {
    if (!currentPlano) return;
    const btn = document.getElementById("btnSalvarEdicaoInline");
    btn.disabled = true;

    const editedPlanoId = currentPlano.id;
    const dentesSelecionados = [...document.querySelectorAll(".dente-prontuario.tratado-consulta")]
      .map(d => d.dataset.num).filter(Boolean);

    const dados = {
      idProntuario: currentPlano.idProntuario,
      idServico:    currentPlano.idServico ?? null,
      condicao:     document.getElementById("editCondicao").value.trim()  || null,
      descricao:    document.getElementById("editDescricao").value.trim() || null,
      observacao:   document.getElementById("editObsTexto").value.trim()  || null,
      dente:        dentesSelecionados.length ? dentesSelecionados.join(",") : null,
      status:       currentPlano.status || "Concluido"
    };

    const erroEl = document.getElementById("erroSalvarRegistro");
    if (erroEl) erroEl.style.display = "none";

    try {
      await apiEditarPlano(editedPlanoId, dados);
      _fecharEdicaoInline();

      const idPac = currentTratamento?.idPaciente;
      if (idPac) {
        const { prontuario, planos } = await buscarProntuarioEPlanos(idPac);
        setEl("prontuarioUltimaAtualizacao", prontuario
          ? formatarData(prontuario.dataUltimaAtualizacao ?? prontuario.dataAbertura)
          : "—");
        renderPlanosRealizados(planos, prontuario);

        // Re-select the plano that was edited
        const idx = planos.findIndex(p => p.id === editedPlanoId);
        if (idx >= 0) {
          const tbodyEl = document.querySelector("#tabelaPlanosRealizados tbody");
          tbodyEl?.querySelectorAll(".plano-row").forEach(r => r.classList.remove("selected"));
          tbodyEl?.querySelector(`.plano-row[data-idx="${idx}"]`)?.classList.add("selected");
          mostrarDetalhePlano(planos[idx], prontuario);
        }
      }
    } catch (err) {
      console.error("[EditarInline] erro:", err.message);
      if (erroEl) {
        erroEl.textContent = "Erro ao salvar: " + err.message;
        erroEl.style.display = "block";
      }
    } finally {
      btn.disabled = false;
    }
  });

  // ══════════════════════════════════════════════════════
  //  VERIFICAR URL PARAMS (?prontuario=nome)
  // ══════════════════════════════════════════════════════
  async function verificarUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);

    // ?consultaId=X — abrir fluxo de consulta direto (vindo do dashboard)
    const consultaIdParam = parseInt(urlParams.get("consultaId"));
    if (consultaIdParam) {
      // Remove query param da URL imediatamente para evitar reprocessamento
      history.replaceState(null, '', window.location.pathname);

      const consulta = todasConsultas.find(c => c.id === consultaIdParam);
      if (consulta) {
        currentTratamento = consultaToRow(consulta);
        currentConsulta   = consulta;
        if (consulta.status === 'Agendada' || consulta.status === 'Aguardando') {
          try {
            await apiAtualizarStatusConsulta(consultaIdParam, 'Em Consulta');
          } catch (err) {
            console.warn('Não foi possível atualizar status para Em Consulta:', err.message);
          }
        }
        esconderTudo();
        document.getElementById('consultaNomePaciente').textContent = currentTratamento.paciente || '—';
        document.getElementById('consultaServico').textContent      = currentTratamento.servico  || '—';
        consultaView.style.display = 'block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    // ?prontuario=nome — abrir prontuário do paciente
    const prontuarioNome = urlParams.get("prontuario");
    if (!prontuarioNome) return;

    const paciente = Object.values(pacientesMap).find(
      p => p.nome === prontuarioNome
    );

    if (paciente) {
      currentTratamento = pacienteToRow(paciente);
      currentConsulta   = null;
    } else {
      currentTratamento = { paciente: prontuarioNome, idPaciente: null };
      currentConsulta   = null;
    }

    await abrirProntuario("lista");
  }

  // ══════════════════════════════════
  //  INICIALIZAÇÃO
  // ══════════════════════════════════
  resetarViewLista();
  carregarDados().then(() => verificarUrlParams());

  // Restaura layout ao voltar do prontuário / bfcache (comum após uso no celular)
  window.addEventListener("pageshow", (e) => {
    if (e.persisted) resetarViewLista();
  });

});
