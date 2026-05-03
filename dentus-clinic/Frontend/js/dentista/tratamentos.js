document.addEventListener("DOMContentLoaded", () => {

  // ── Sidebar ──
  SidebarComponent.render("sidebarContainer", {
    perfil: "dentista",
    ativo: "tratamentos"
  });

  // ── Hamburguer (mobile) ──
  const btnHamburger = document.getElementById("btnHamburger");
  if (btnHamburger) {
    btnHamburger.addEventListener("click", () => SidebarComponent.toggleSidebar());
  }
  const btnHamburgerMobile = document.getElementById("btnHamburgerMobile");
  if (btnHamburgerMobile) {
    btnHamburgerMobile.addEventListener("click", () => SidebarComponent.toggleSidebar());
  }

  // ══════════════════════════════════
  //  DADOS DE EXEMPLO
  // ══════════════════════════════════
  const tratamentos = [
    {
      paciente: "João Silva",
      servico: "Limpeza",
      status: "Aguardando a 12 min",
      progresso: 75,
      proximaSessao: "10/04/2026",
      etapasFeitas: 3,
      etapasTotal: 4,
      ultimaEtapa: "Raspagem",
      proximaEtapa: "Polimento"
    },
    {
      paciente: "Ana Costa",
      servico: "Clareamento",
      status: "aguardando a 20 min",
      progresso: 30,
      proximaSessao: "10/04/2026",
      etapasFeitas: 1,
      etapasTotal: 3,
      ultimaEtapa: "Limpeza",
      proximaEtapa: "Clareamento"
    },
    {
      paciente: "Pedro Santos",
      servico: "Extração",
      status: "Aguardando a 30 min",
      progresso: 0,
      proximaSessao: "20/04/2026",
      etapasFeitas: 0,
      etapasTotal: 2,
      ultimaEtapa: "—",
      proximaEtapa: "Avaliação"
    },
    {
      paciente: "Carlos Oliveira",
      servico: "Implante",
      status: "aguardando a 40 min",
      progresso: 25,
      proximaSessao: "27/04/2026",
      etapasFeitas: 1,
      etapasTotal: 4,
      ultimaEtapa: "Exame",
      proximaEtapa: "Cirurgia"
    },
    {
      paciente: "Maria Souza",
      servico: "Restauração",
      status: "aguardando a 50 min",
      progresso: 50,
      proximaSessao: "31/05/2026",
      etapasFeitas: 2,
      etapasTotal: 4,
      ultimaEtapa: "Moldagem",
      proximaEtapa: "Aplicação"
    }
  ];

  // ══════════════════════════════════
  //  ELEMENTOS DA VIEW LISTA
  // ══════════════════════════════════
  const metricasRow = document.querySelector(".metricas-row");
  const filterBar = document.querySelector(".filter-bar");
  const tratamentosLayout = document.querySelector(".tratamentos-layout");
  const editarPlanoView = document.getElementById("editarPlanoView");

  // ══════════════════════════════════
  //  RENDERIZAR TABELA
  // ══════════════════════════════════
  const tbody = document.getElementById("tbodyTratamentos");
  const cardsContainer = document.getElementById("cardsTratamentos");
  let selectedIndex = 1;
  let currentTratamento = tratamentos[selectedIndex];

  function renderTabela(dados) {
    tbody.innerHTML = "";
    if (cardsContainer) cardsContainer.innerHTML = "";

    dados.forEach((t, i) => {
      // -- Desktop Row --
      const tr = document.createElement("tr");
      if (i === selectedIndex) tr.classList.add("selected");

      tr.innerHTML = `
        <td data-label="Paciente">${t.paciente}</td>
        <td data-label="Serviço">${t.servico}</td>
        <td data-label="Status">${t.status}</td>
        <td data-label="Progresso">
          <div class="progress-cell">
            <div class="progress-bar-wrapper">
              <div class="progress-bar-fill" style="width: ${t.progresso}%"></div>
            </div>
            <span class="progress-percent">${t.progresso}%</span>
          </div>
        </td>
        <td data-label="Próxima Sessão">${t.proximaSessao}</td>
      `;

      tr.addEventListener("click", () => {
        selectedIndex = i;
        currentTratamento = t;
        renderTabela(dados);
        atualizarResumo(t);
      });

      tbody.appendChild(tr);

      // -- Mobile Card --
      if (cardsContainer) {
        const card = document.createElement("div");
        card.className = "paciente-card-mobile";
        
        card.innerHTML = `
          <div class="pcm-header">
            <h3 class="pcm-nome">${t.paciente}</h3>
            <i class="fa-solid fa-hands-asl-interpreting pcm-icon-acessibilidade"></i>
          </div>
          <div class="pcm-body">
            <div class="pcm-item">
              <i class="fa-solid fa-magnifying-glass"></i>
              <span>Serviço: ${t.servico}</span>
            </div>
            <div class="pcm-item">
              <i class="fa-regular fa-clock"></i>
              <span>Status: ${t.status}</span>
            </div>
            <div class="pcm-progresso-row">
              <div class="pcm-progresso-bar-wrapper">
                <div class="pcm-progresso-fill" style="width: ${t.progresso}%"></div>
              </div>
              <span class="pcm-progresso-text">${t.progresso}%</span>
            </div>
            <div class="pcm-item">
              <i class="fa-regular fa-calendar"></i>
              <span>Próxima Sessão: ${t.proximaSessao}</span>
            </div>
          </div>
        `;

        card.addEventListener("click", (e) => {
          if (e.target.closest('.btn-prontuario-mobile')) return;
          selectedIndex = i;
          currentTratamento = t;
          atualizarResumo(t);
          
          // Smooth scroll para o resumo no mobile
          const resumoEl = document.getElementById("painelResumo");
          if (resumoEl && window.innerWidth <= 992) {
            resumoEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        });

        cardsContainer.appendChild(card);
      }
    });
  }

  // ══════════════════════════════════
  //  ATUALIZAR PAINEL RESUMO
  // ══════════════════════════════════
  function atualizarResumo(t) {
    document.getElementById("resumoNome").textContent = t.paciente;
    document.getElementById("resumoServico").textContent = t.servico;
    document.getElementById("resumoEtapas").textContent = `${t.etapasFeitas} de ${t.etapasTotal} Etapas`;

    const pct = t.etapasTotal > 0 ? Math.round((t.etapasFeitas / t.etapasTotal) * 100) : 0;
    document.getElementById("resumoProgressoFill").style.width = pct + "%";

    document.getElementById("resumoUltimaEtapa").textContent = t.ultimaEtapa;
    document.getElementById("resumoProximaEtapa").textContent = t.proximaEtapa;
  }

  // Render inicial
  renderTabela(tratamentos);
  atualizarResumo(tratamentos[selectedIndex]);

  // ══════════════════════════════════
  //  FILTROS
  // ══════════════════════════════════
  const filtroPaciente = document.getElementById("filtroPaciente");
  const filtroServico = document.getElementById("filtroServico");
  const filtroStatus = document.getElementById("filtroStatus");
  const filtroSessao = document.getElementById("filtroSessao");

  function aplicarFiltros() {
    const paciente = filtroPaciente.value.toLowerCase().trim();
    const servico = filtroServico.value.toLowerCase().trim();
    const status = filtroStatus.value.toLowerCase().trim();
    const sessao = filtroSessao.value;

    let filtrados = tratamentos.filter(t => {
      if (paciente && !t.paciente.toLowerCase().includes(paciente)) return false;
      if (servico && !t.servico.toLowerCase().includes(servico)) return false;
      if (status && !t.status.toLowerCase().includes(status)) return false;
      if (sessao) {
        const partes = t.proximaSessao.split("/");
        const dataISO = `${partes[2]}-${partes[1]}-${partes[0]}`;
        if (dataISO !== sessao) return false;
      }
      return true;
    });

    selectedIndex = 0;
    renderTabela(filtrados);
    if (filtrados.length > 0) {
      atualizarResumo(filtrados[0]);
    }
  }

  [filtroPaciente, filtroServico, filtroStatus, filtroSessao].forEach(input => {
    input.addEventListener("input", aplicarFiltros);
  });

  document.getElementById("btnLimparFiltros").addEventListener("click", () => {
    filtroPaciente.value = "";
    filtroServico.value = "";
    filtroStatus.value = "";
    filtroSessao.value = "";
    selectedIndex = 1;
    renderTabela(tratamentos);
    atualizarResumo(tratamentos[selectedIndex]);
  });

  // ══════════════════════════════════
  //  ABAS
  // ══════════════════════════════════
  const tabBtns = document.querySelectorAll(".tab-btn");
  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      tabBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });

  // ══════════════════════════════════════════════════════
  //  EDITAR PLANO — ABRIR / FECHAR
  // ══════════════════════════════════════════════════════
  function mostrarEditarPlano() {
    metricasRow.style.display = "none";
    filterBar.style.display = "none";
    tratamentosLayout.style.display = "none";

    const t = currentTratamento;
    document.getElementById("editarResumoNome").textContent = t.paciente;
    document.getElementById("editarResumoServico").textContent = t.servico;
    document.getElementById("editarResumoEtapas").textContent = `${t.etapasFeitas} de ${t.etapasTotal} Etapas`;
    const pct = t.etapasTotal > 0 ? Math.round((t.etapasFeitas / t.etapasTotal) * 100) : 0;
    document.getElementById("editarResumoProgressoFill").style.width = pct + "%";
    document.getElementById("editarUltimaEtapa").textContent = t.ultimaEtapa;
    document.getElementById("editarProximaEtapa").textContent = t.proximaEtapa;

    editarPlanoView.style.display = "block";
    renderCalendario(calAno, calMes);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function voltarParaLista() {
    editarPlanoView.style.display = "none";
    metricasRow.style.display = "";
    filterBar.style.display = "";
    tratamentosLayout.style.display = "";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  document.getElementById("btnEditarPlano").addEventListener("click", mostrarEditarPlano);
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

  // ── Tornar campos das etapas editáveis ──────────────
  document.querySelectorAll("#etapasScroll .etapa-input, #etapasScroll .etapa-textarea").forEach(el => {
    el.removeAttribute("readonly");
  });

  // ── Botão de edição foca o campo correspondente ─────
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
  //  ETAPAS — DRAG AND DROP (reordenação horizontal)
  // ══════════════════════════════════════════════════════
  function initEtapasDragDrop() {
    const container = document.getElementById("etapasScroll");
    if (!container) return;

    let draggedCard = null;
    let placeholder = null;

    function getAfterElement(clientX) {
      const cards = [...container.querySelectorAll(".etapa-card:not(.dragging)")];
      return cards.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = clientX - box.left - box.width / 2;
        if (offset < 0 && offset > closest.offset) {
          return { offset, element: child };
        }
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
      if (placeholder && placeholder.parentNode) placeholder.parentNode.removeChild(placeholder);
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
      if (afterElement == null) {
        container.appendChild(placeholder);
      } else {
        container.insertBefore(placeholder, afterElement);
      }
    });

    container.addEventListener("dragleave", (e) => {
      if (e.relatedTarget && container.contains(e.relatedTarget)) return;
      if (placeholder && placeholder.parentNode) placeholder.parentNode.removeChild(placeholder);
      placeholder = null;
    });

    container.addEventListener("drop", (e) => {
      e.preventDefault();
      if (!draggedCard || !placeholder || !placeholder.parentNode) return;
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
      const nextIndex = (estados.indexOf(currentState) + 1) % estados.length;
      estados.forEach(s => dente.classList.remove(s));
      dente.classList.add(estados[nextIndex]);
    });
  });

  // ══════════════════════════════════
  //  CALENDÁRIO
  // ══════════════════════════════════
  const mesesNome = [
    "JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO",
    "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO"
  ];

  let calMes = 3; // Abril (0-indexed)
  let calAno = 2026;
  let calDiaSelecionado = null;

  const consultaDatas = {
    "2026-2": [20],
    "2026-3": [5, 27, 28]
  };

  function renderCalendario(ano, mes, diaSelecionado = null) {
    const calBody = document.getElementById("calBody");
    const calMesAno = document.getElementById("calMesAno");

    calMesAno.textContent = `${mesesNome[mes]} ${ano}`;

    const primeiroDia = new Date(ano, mes, 1).getDay();
    const totalDias = new Date(ano, mes + 1, 0).getDate();
    const hoje = new Date();

    const chave = `${ano}-${mes}`;
    const diasConsulta = consultaDatas[chave] || [];

    let html = "";
    let dia = 1;
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
          if (diasConsulta.includes(dia)) classes.push("consulta");
          if (diaSelecionado === dia)     classes.push("selecionado");
          html += `<td class="${classes.join(" ")}">${dia}</td>`;
          dia++;
        }
      }
      html += "</tr>";
    }

    calBody.innerHTML = html;
  }

  document.getElementById("calPrev").addEventListener("click", () => {
    calMes--;
    if (calMes < 0) { calMes = 11; calAno--; }
    calDiaSelecionado = null;
    renderCalendario(calAno, calMes);
  });

  document.getElementById("calNext").addEventListener("click", () => {
    calMes++;
    if (calMes > 11) { calMes = 0; calAno++; }
    calDiaSelecionado = null;
    renderCalendario(calAno, calMes);
  });

  // ── Clicar em data da lista → navegar no calendário ──
  document.getElementById("datasLista").addEventListener("click", (e) => {
    const item = e.target.closest(".data-item");
    if (!item) return;

    // Remover ativo de todos e marcar o clicado
    document.querySelectorAll("#datasLista .data-item").forEach(i => i.classList.remove("ativo"));
    item.classList.add("ativo");

    // Parsear "DD/MM/AAAA"
    const texto = item.querySelector("span")?.textContent?.trim();
    if (!texto) return;
    const partes = texto.split("/");
    if (partes.length !== 3) return;
    const dia = parseInt(partes[0], 10);
    const mes = parseInt(partes[1], 10) - 1; // 0-indexed
    const ano = parseInt(partes[2], 10);

    calDiaSelecionado = dia;
    calMes = mes;
    calAno = ano;
    renderCalendario(calAno, calMes, calDiaSelecionado);
  });

  // Render inicial do calendário
  renderCalendario(calAno, calMes);

  // ══════════════════════════════════════════════════════
  //  MODAL INICIAR CONSULTA
  // ══════════════════════════════════════════════════════
  const modalOverlay = document.getElementById("modalIniciarOverlay");
  const consultaView = document.getElementById("consultaView");

  document.getElementById("btnIniciarConsulta").addEventListener("click", () => {
    const t = currentTratamento;
    document.getElementById("modalNome").textContent = t.paciente;
    document.getElementById("modalServico").textContent = t.servico;

    // Extrair minutos do status
    const match = t.status.match(/(\d+)/);
    const minutos = match ? match[1] + " Minutos" : "—";
    document.getElementById("modalTempo").textContent = minutos;

    modalOverlay.style.display = "flex";
  });

  document.getElementById("btnModalCancelar").addEventListener("click", () => {
    modalOverlay.style.display = "none";
  });

  // Fechar ao clicar fora
  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) {
      modalOverlay.style.display = "none";
    }
  });

  // Confirmar iniciar → abrir tela de consulta
  document.getElementById("btnModalIniciar").addEventListener("click", () => {
    modalOverlay.style.display = "none";

    const t = currentTratamento;

    // Esconder tudo
    metricasRow.style.display = "none";
    filterBar.style.display = "none";
    tratamentosLayout.style.display = "none";
    editarPlanoView.style.display = "none";

    // Preencher dados na tela de consulta
    document.getElementById("consultaNomePaciente").textContent = t.paciente;
    document.getElementById("consultaServico").textContent = t.servico;

    // Mostrar tela de consulta
    consultaView.style.display = "block";
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // ══════════════════════════════════════════════════════
  //  CONSULTA — ODONTOGRAMA (toggle dentes)
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
      // Atualizar checkbox "Selecionar Todos"
      const todos = document.querySelectorAll(".dente-consulta");
      const selecionados = document.querySelectorAll(".dente-consulta.tratamento");
      document.getElementById("chkSelecionarTodos").checked = selecionados.length === todos.length;
    });
  });

  // Selecionar Todos
  document.getElementById("chkSelecionarTodos").addEventListener("change", (e) => {
    const todos = document.querySelectorAll(".dente-consulta");
    todos.forEach(d => {
      d.classList.remove("saudavel", "tratamento");
      d.classList.add(e.target.checked ? "tratamento" : "saudavel");
    });
  });

  // ══════════════════════════════════════════════════════
  //  MODAL ADICIONAR ETAPA NO CHECKLIST
  // ══════════════════════════════════════════════════════
  const maeOverlay    = document.getElementById("modalNovaEtapaOverlay");
  const maeInputNome  = document.getElementById("inputMaeNome");
  const maeInputDesc  = document.getElementById("inputMaeDescricao");
  const maeChkConc    = document.getElementById("chkMaeConcluida");
  const maeContador   = document.getElementById("maeContador");

  function abrirMae() {
    maeInputNome.value  = "";
    maeInputDesc.value  = "";
    maeChkConc.checked  = false;
    maeInputNome.classList.remove("erro");
    maeContador.textContent = "0 / 80";
    maeOverlay.style.display = "flex";
    setTimeout(() => maeInputNome.focus(), 80);
  }

  function fecharMae() {
    maeOverlay.style.display = "none";
  }

  function confirmarMae() {
    const nome = maeInputNome.value.trim();
    if (!nome) {
      maeInputNome.classList.add("erro");
      maeInputNome.focus();
      return;
    }

    const lista = document.getElementById("checklistLista");
    const novaEtapa = document.createElement("label");
    novaEtapa.className = "checklist-item";

    const chk = document.createElement("input");
    chk.type = "checkbox";
    if (maeChkConc.checked) chk.checked = true;

    novaEtapa.appendChild(chk);
    novaEtapa.appendChild(document.createTextNode(" " + nome));

    if (maeInputDesc.value.trim()) {
      const desc = document.createElement("span");
      desc.className = "checklist-item-desc";
      desc.textContent = maeInputDesc.value.trim();
      novaEtapa.appendChild(desc);
    }

    lista.appendChild(novaEtapa);
    fecharMae();
  }

  document.getElementById("btnAdicionarEtapa").addEventListener("click", abrirMae);
  document.getElementById("btnMaeFechar").addEventListener("click", fecharMae);
  document.getElementById("btnMaeCancelar").addEventListener("click", fecharMae);
  document.getElementById("btnMaeConfirmar").addEventListener("click", confirmarMae);

  // Fechar ao clicar fora do card
  maeOverlay.addEventListener("click", (e) => {
    if (e.target === maeOverlay) fecharMae();
  });

  // Confirmar com Enter no campo nome
  maeInputNome.addEventListener("keydown", (e) => {
    if (e.key === "Enter") { e.preventDefault(); confirmarMae(); }
    if (e.key === "Escape") fecharMae();
  });

  // Remover estado de erro ao digitar
  maeInputNome.addEventListener("input", () => {
    maeInputNome.classList.remove("erro");
    maeContador.textContent = `${maeInputNome.value.length} / 80`;
  });

  // ══════════════════════════════════════════════════════
  //  CONSULTA — FINALIZAR (abrir tela de finalização)
  // ══════════════════════════════════════════════════════
  document.getElementById("btnFinalizarConsulta").addEventListener("click", abrirFinalizarConsulta);

  // ══════════════════════════════════════════════════════
  //  TELA FINALIZAR CONSULTA
  // ══════════════════════════════════════════════════════
  const finalizarConsultaView = document.getElementById("finalizarConsultaView");

  function abrirFinalizarConsulta() {
    const t = currentTratamento;

    // Preencher header e sidebar
    document.getElementById("finalizarNomePaciente").textContent = t.paciente;
    document.getElementById("finalizarServico").textContent = t.servico;
    document.getElementById("finalizarResumoNome").textContent = t.paciente;
    document.getElementById("finalizarResumoServico").textContent = t.servico;
    document.getElementById("finalizarResumoEtapas").textContent = `${t.etapasFeitas} de ${t.etapasTotal} Etapas`;
    const pct = t.etapasTotal > 0 ? Math.round((t.etapasFeitas / t.etapasTotal) * 100) : 0;
    document.getElementById("finalizarResumoProgressoFill").style.width = pct + "%";
    document.getElementById("finalizarResumoUltimaEtapa").textContent = t.ultimaEtapa;
    document.getElementById("finalizarResumoProximaEtapa").textContent = t.proximaEtapa;

    // Copiar dados da consulta
    document.getElementById("finalizarCondicao").textContent =
      document.getElementById("consultaCondicao").value || "—";
    document.getElementById("finalizarDescricao").textContent =
      document.getElementById("consultaDescricao").value || "—";
    document.getElementById("finalizarObservacoes").textContent =
      document.getElementById("observacoesClinicas").value || "—";

    // Espelhar odontograma da consulta (snapshot somente leitura)
    document.querySelectorAll(".dente-consulta").forEach(src => {
      const dest = document.querySelector(`.dente-finalizar[data-num="${src.dataset.num}"]`);
      if (!dest) return;
      dest.classList.remove("saudavel", "tratado-consulta");
      dest.classList.add(src.classList.contains("tratamento") ? "tratado-consulta" : "saudavel");
    });

    esconderTudo();
    finalizarConsultaView.style.display = "block";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Voltar à consulta
  document.getElementById("btnCancelarFinalizar").addEventListener("click", () => {
    finalizarConsultaView.style.display = "none";
    consultaView.style.display = "block";
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // Confirmar finalização
  document.getElementById("btnConfirmarFinalizar").addEventListener("click", () => {
    finalizarConsultaView.style.display = "none";
    mostrarLista();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // ══════════════════════════════════════════════════════
  //  PRONTUÁRIO — NAVEGAÇÃO
  // ══════════════════════════════════════════════════════
  const prontuarioView = document.getElementById("prontuarioView");
  let prontuarioOrigin = "lista"; // de onde veio: "lista" ou "consulta"

  // Função auxiliar: esconder todas as views
  function esconderTudo() {
    metricasRow.style.display = "none";
    filterBar.style.display = "none";
    tratamentosLayout.style.display = "none";
    editarPlanoView.style.display = "none";
    consultaView.style.display = "none";
    prontuarioView.style.display = "none";
    finalizarConsultaView.style.display = "none";
  }

  function mostrarLista() {
    metricasRow.style.display = "";
    filterBar.style.display = "";
    tratamentosLayout.style.display = "";
  }

  // Abrir Prontuário — preencher dados do paciente selecionado
  function abrirProntuario(origem) {
    prontuarioOrigin = origem;
    esconderTudo();

    const t = currentTratamento;
    document.getElementById("prontuarioNome").textContent = t.paciente;

    prontuarioView.style.display = "block";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Botão "olho" na tabela (Prontuário) E Botão Prontuário Mobile
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-prontuario") || e.target.closest(".btn-prontuario-mobile");
    if (!btn) return;
    
    // Only handle clicks within tratamentos view lists
    if (!document.getElementById("tbodyTratamentos").contains(btn) && 
        !document.getElementById("cardsTratamentos").contains(btn)) {
      return;
    }
    
    e.stopPropagation();

    const idx = parseInt(btn.dataset.idx, 10);
    if (!isNaN(idx) && idx >= 0 && idx < tratamentos.length) {
      currentTratamento = tratamentos[idx];
    }

    abrirProntuario("lista");
  });

  // Botão "Prontuário" no rodapé da consulta
  document.getElementById("btnProntuarioConsulta").addEventListener("click", () => {
    abrirProntuario("consulta");
  });

  // Botão "Prontuário" no Resumo do Tratamento
  document.getElementById("btnResumoProntuario").addEventListener("click", () => {
    abrirProntuario("lista");
  });

  // Voltar do Prontuário
  document.getElementById("btnVoltarProntuario").addEventListener("click", () => {
    prontuarioView.style.display = "none";

    if (prontuarioOrigin === "consulta") {
      consultaView.style.display = "block";
    } else {
      mostrarLista();
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // ══════════════════════════════════════════════════════
  //  PRONTUÁRIO — SELEÇÃO DE PLANOS REALIZADOS
  // ══════════════════════════════════════════════════════
  const planosData = [
    {
      data: "2023-09-01",
      servico: "Extração do Siso",
      dentista: "Pedro Santos",
      condicao: "Siso em má formação",
      descricao: "Tratamento de remoção do dente do Siso numero 48",
      observacoes: "dente do siso 48 removido com sucesso, sem problemas ou sequelas, necessário retorno para acompanhamento da cicatrização.",
      dentesTratados: ["48"]
    },
    {
      data: "2023-08-10",
      servico: "Tratamento de Canal",
      dentista: "Dr. Carlos Mendes",
      condicao: "Cárie profunda com comprometimento pulpar",
      descricao: "Tratamento endodôntico do dente 36 com obturação definitiva",
      observacoes: "Canal tratado com sucesso, paciente relatou melhora imediata da dor. Retorno em 30 dias para avaliação.",
      dentesTratados: ["36"]
    }
  ];

  document.querySelectorAll(".plano-row").forEach(row => {
    row.addEventListener("click", () => {
      // Desselecionar todos
      document.querySelectorAll(".plano-row").forEach(r => r.classList.remove("selected"));
      row.classList.add("selected");

      const idx = parseInt(row.dataset.plano);
      const plano = planosData[idx];
      if (!plano) return;

      // Atualizar campos do plano selecionado
      document.getElementById("prontuarioPlanoServico").textContent = plano.servico;
      document.getElementById("prontuarioPlanoData").textContent = plano.data;
      document.getElementById("prontuarioCondicao").textContent = plano.condicao;
      document.getElementById("prontuarioDescricao").textContent = plano.descricao;
      document.getElementById("prontuarioObsTexto").textContent = plano.observacoes;
      document.getElementById("prontuarioDentista").textContent = plano.dentista;

      // Atualizar dentes no odontograma
      document.querySelectorAll(".dente-prontuario").forEach(d => {
        d.classList.remove("tratado-consulta");
        d.classList.add("saudavel");
      });
      plano.dentesTratados.forEach(num => {
        const dente = document.querySelector(`.dente-prontuario[data-num="${num}"]`);
        if (dente) {
          dente.classList.remove("saudavel");
          dente.classList.add("tratado-consulta");
        }
      });
    });
  });

});