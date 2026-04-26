document.addEventListener("DOMContentLoaded", () => {

  // ── Sidebar ──
  SidebarComponent.render("sidebarContainer", {
    perfil: "dentista",
    ativo: "tratamentos"
  });

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
  let selectedIndex = 1;
  let currentTratamento = tratamentos[selectedIndex];

  function renderTabela(dados) {
    tbody.innerHTML = "";
    dados.forEach((t, i) => {
      const tr = document.createElement("tr");
      if (i === selectedIndex) tr.classList.add("selected");

      tr.innerHTML = `
        <td>${t.paciente}</td>
        <td>${t.servico}</td>
        <td>${t.status}</td>
        <td>
          <div class="progress-cell">
            <div class="progress-bar-wrapper">
              <div class="progress-bar-fill" style="width: ${t.progresso}%"></div>
            </div>
            <span class="progress-percent">${t.progresso}%</span>
          </div>
        </td>
        <td>${t.proximaSessao}</td>
        <td>
          <button class="btn-prontuario" title="Ver prontuário">
            <i class="fa-regular fa-eye"></i>
          </button>
        </td>
      `;

      tr.addEventListener("click", () => {
        selectedIndex = i;
        currentTratamento = t;
        renderTabela(dados);
        atualizarResumo(t);
      });

      tbody.appendChild(tr);
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
    "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
    "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
  ];

  let calMes = 3; // Abril (0-indexed)
  let calAno = 2026;

  const consultaDatas = {
    "2026-3": [5, 27, 28]
  };

  function renderCalendario(ano, mes) {
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
    let rows = Math.ceil((primeiroDia + totalDias) / 7);

    for (let r = 0; r < rows; r++) {
      html += "<tr>";
      for (let c = 0; c < 7; c++) {
        const cellIndex = r * 7 + c;
        if (cellIndex < primeiroDia || dia > totalDias) {
          html += '<td class="empty"></td>';
        } else {
          let classes = "";
          if (hoje.getFullYear() === ano && hoje.getMonth() === mes && hoje.getDate() === dia) {
            classes = "today";
          }
          if (diasConsulta.includes(dia)) {
            classes = "consulta";
          }
          html += `<td class="${classes}">${dia}</td>`;
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
    renderCalendario(calAno, calMes);
  });

  document.getElementById("calNext").addEventListener("click", () => {
    calMes++;
    if (calMes > 11) { calMes = 0; calAno++; }
    renderCalendario(calAno, calMes);
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
  //  CONSULTA — ADICIONAR ETAPA NO CHECKLIST
  // ══════════════════════════════════════════════════════
  document.getElementById("btnAdicionarEtapa").addEventListener("click", () => {
    const lista = document.getElementById("checklistLista");
    const novaEtapa = document.createElement("label");
    novaEtapa.className = "checklist-item";

    const input = document.createElement("input");
    input.type = "checkbox";

    const texto = document.createElement("span");

    // Prompt simples via input temporário
    const textoInput = prompt("Nome da nova etapa:");
    if (!textoInput || textoInput.trim() === "") return;

    novaEtapa.appendChild(input);
    novaEtapa.appendChild(document.createTextNode(" " + textoInput.trim()));
    lista.appendChild(novaEtapa);
  });

  // ══════════════════════════════════════════════════════
  //  CONSULTA — FINALIZAR (voltar para lista)
  // ══════════════════════════════════════════════════════
  document.getElementById("btnFinalizarConsulta").addEventListener("click", () => {
    if (!confirm("Deseja finalizar esta consulta?")) return;

    consultaView.style.display = "none";
    metricasRow.style.display = "";
    filterBar.style.display = "";
    tratamentosLayout.style.display = "";
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

  // Botão "olho" na tabela (Prontuário)
  document.getElementById("tbodyTratamentos").addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-prontuario");
    if (!btn) return;
    e.stopPropagation();

    // Pegar o índice da linha
    const tr = btn.closest("tr");
    const rows = Array.from(document.getElementById("tbodyTratamentos").children);
    const idx = rows.indexOf(tr);
    if (idx >= 0 && idx < tratamentos.length) {
      currentTratamento = tratamentos[idx];
    }

    abrirProntuario("lista");
  });

  // Botão "Prontuário" no rodapé da consulta
  document.getElementById("btnProntuarioConsulta").addEventListener("click", () => {
    abrirProntuario("consulta");
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