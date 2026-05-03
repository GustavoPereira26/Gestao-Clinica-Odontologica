document.addEventListener("DOMContentLoaded", () => {

  SidebarComponent.render("sidebarContainer", { perfil: "dentista", ativo: "agenda" });

  const btnHamburger = document.getElementById("btnHamburger");
  if (btnHamburger) btnHamburger.addEventListener("click", () => SidebarComponent.toggleSidebar());

  const modalEl = document.getElementById("appointmentModal");
  const appointmentModal = modalEl ? new bootstrap.Modal(modalEl) : null;

  // ── Configurações ──────────────────────────────────────────────────
  const CELL_H      = 64;   // px — deve coincidir com --tcal-cell-h
  const HOUR_START  = 8;
  const HOUR_COUNT  = 10;   // 08:00 → 17:00

  const MONTHS_PT = [
    "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
    "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"
  ];
  const DAY_ABBR = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];
  const DAY_FULL = ["Domingo","Segunda","Terça","Quarta","Quinta","Sexta","Sábado"];
  const HOUR_LABELS = Array.from({ length: HOUR_COUNT }, (_, i) => `${HOUR_START + i} AM`.replace("12 AM","12 PM").replace(/^(1[3-9]|2\d) AM$/, h => `${parseInt(h) - 12} PM`));

  const NAMES_MOCK = [
    "Ana Costa","Bruno Lima","Carla Souza","Diego Alves",
    "Elena Rocha","Felipe Melo","Gabi Nunes","Hélio Pinto",
  ];
  const SERVICES_MOCK = [
    "Limpeza","Clareamento","Extração","Canal",
    "Consulta","Prótese","Ortodontia","Restauração",
  ];



  // ── Estado ─────────────────────────────────────────────────────────
  let weekOffset  = 0;
  let dadosSemana = [];   // [7][HOUR_COUNT] → { occupied, nome, servico }
  let diaAtivo    = 0;   // mobile only

  // ── Helpers ────────────────────────────────────────────────────────
  function getMonday(offset = 0) {
    const today = new Date();
    const dow   = today.getDay();
    const d     = new Date(today);
    d.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1) + offset * 7);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  function dateKey(d) {
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  }

  function buildHourLabel(h) {
    if (h < 12) return `${h}:00`;
    if (h === 12) return "12:00";
    return `${h - 12}:00`;
  }

  function gerarDados() {
    dadosSemana = Array.from({ length: 7 }, () =>
      Array.from({ length: HOUR_COUNT }, () => {
        if (Math.random() < 0.27) {
          return {
            occupied: true,
            nome:    NAMES_MOCK[Math.floor(Math.random() * NAMES_MOCK.length)],
            servico: SERVICES_MOCK[Math.floor(Math.random() * SERVICES_MOCK.length)],
          };
        }
        return { occupied: false };
      })
    );
  }

  // ══════════════════════════════════════════════════
  // DESKTOP — cabeçalho de dias
  // ══════════════════════════════════════════════════
  function updateHeaders() {
    const monday   = getMonday(weekOffset);
    const sunday   = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const todayKey = dateKey(new Date());

    // Período no toolbar
    const label = document.getElementById("monthYearLabel");
    if (label) {
      if (monday.getMonth() === sunday.getMonth()) {
        label.textContent = `${MONTHS_PT[monday.getMonth()]} ${monday.getFullYear()}`;
      } else if (monday.getFullYear() === sunday.getFullYear()) {
        label.textContent = `${MONTHS_PT[monday.getMonth()].slice(0,3)} — ${MONTHS_PT[sunday.getMonth()].slice(0,3)} ${monday.getFullYear()}`;
      } else {
        label.textContent = `${MONTHS_PT[monday.getMonth()].slice(0,3)} ${monday.getFullYear()} — ${MONTHS_PT[sunday.getMonth()].slice(0,3)} ${sunday.getFullYear()}`;
      }
    }

    for (let d = 0; d < 7; d++) {
      const day = new Date(monday);
      day.setDate(monday.getDate() + d);
      const isToday = dateKey(day) === todayKey;

      const el = document.getElementById(`day-${d}`);
      if (!el) continue;
      el.className = "tcal-head-day" + (isToday ? " today" : "");
      el.querySelector(".tcal-abbr").textContent = DAY_ABBR[day.getDay()];
      el.querySelector(".tcal-num").textContent  = day.getDate();
    }
  }

  // ══════════════════════════════════════════════════
  // DESKTOP — grade de células + eventos
  // ══════════════════════════════════════════════════
  function buildGrid() {
    const grid = document.getElementById("tcalGrid");
    if (!grid) return;
    grid.innerHTML = "";

    const monday   = getMonday(weekOffset);
    const todayKey = dateKey(new Date());

    for (let d = 0; d < 7; d++) {
      const day = new Date(monday);
      day.setDate(monday.getDate() + d);
      const isToday = dateKey(day) === todayKey;

      const col = document.createElement("div");
      col.className = "tcal-day-col" + (isToday ? " today" : "");
      col.dataset.day = d;

      for (let h = 0; h < HOUR_COUNT; h++) {
        const cell = document.createElement("div");
        cell.className  = "tcal-cell";
        cell.dataset.hour = HOUR_START + h;

        const slot = dadosSemana[d][h];

        if (slot.occupied) {
          const ev = document.createElement("div");
          ev.className = "tcal-event";
          ev.style.cssText = `background: var(--c1); color: #fff; border-left: none; border-radius: 6px; box-shadow: 0 2px 8px rgba(110, 84, 48, .25);`;
          ev.innerHTML = `
            <span class="tcal-event-name" style="color: #fff;">${slot.nome}</span>
            <span class="tcal-event-service" style="color: rgba(255, 255, 255, 0.72);">${slot.servico}</span>
          `;
          ev.addEventListener("click", e => {
            e.stopPropagation();
            if (appointmentModal) {
              document.getElementById("modalPaciente").textContent = slot.nome;
              document.getElementById("modalServico").textContent  = slot.servico;
              appointmentModal.show();
            }
          });
          cell.appendChild(ev);
        } else {
          cell.addEventListener("click", () => {
            if (appointmentModal) appointmentModal.show();
          });
        }

        col.appendChild(cell);
      }

      grid.appendChild(col);
    }
  }



  // ── Scroll para o horário atual no início ────────────────────────
  function scrollToNow() {
    const body = document.getElementById("tcalBody");
    if (!body) return;
    const h = new Date().getHours();
    if (h < HOUR_START) return;
    const offset = Math.max(0, (h - HOUR_START - 1) * CELL_H);
    body.scrollTop = offset;
  }

  // ══════════════════════════════════════════════════
  // MOBILE
  // ══════════════════════════════════════════════════
  function atualizarCabecalhoMobile(base) {
    const amSemana = document.getElementById("amSemana");
    const amMes    = document.getElementById("amMes");
    if (!amSemana || !amMes) return;

    const sunday = new Date(base);
    sunday.setDate(base.getDate() + 6);
    const semNum = getWeekNumber(base);
    amSemana.textContent = `Semana ${semNum}`;
    amMes.textContent    = `${MONTHS_PT[base.getMonth()]} ${base.getFullYear()}`;
  }

  function getWeekNumber(d) {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    return Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
  }

  function renderStrip(base) {
    const strip = document.getElementById("amStrip");
    if (!strip) return;
    const todayKey = dateKey(new Date());
    strip.innerHTML = "";

    for (let i = 0; i < 7; i++) {
      const d    = new Date(base);
      d.setDate(base.getDate() + i);
      const isHoje  = dateKey(d) === todayKey;
      const isAtivo = i === diaAtivo;

      const pill = document.createElement("div");
      pill.className = "am-day" + (isHoje ? " hoje" : "") + (isAtivo ? " ativo" : "");
      pill.innerHTML = `
        <span class="am-day-nome">${DAY_ABBR[d.getDay()]}</span>
        <span class="am-day-num">${d.getDate()}</span>
      `;
      pill.addEventListener("click", () => {
        diaAtivo = i;
        renderStrip(base);
        renderSlots(base);
      });
      strip.appendChild(pill);
    }
  }

  function renderSlots(base) {
    const container = document.getElementById("amSlots");
    if (!container) return;

    const slots       = dadosSemana[diaAtivo] || [];
    const temConsulta = slots.some(s => s.occupied);
    const d           = new Date(base);
    d.setDate(base.getDate() + diaAtivo);

    let html = `<div class="am-slots-titulo">${DAY_FULL[d.getDay()]}, ${d.getDate()} de ${MONTHS_PT[d.getMonth()]}</div>`;

    const horasLabels = Array.from({ length: HOUR_COUNT }, (_, i) => {
      const h = HOUR_START + i;
      return h < 12 ? `${h} AM` : h === 12 ? "12 PM" : `${h - 12} PM`;
    });

    if (!temConsulta) {
      html += `
        <div class="am-vazio">
          <i class="fa-regular fa-calendar-xmark"></i>
          <span class="am-vazio-texto">Nenhuma consulta agendada</span>
        </div>
      `;
    } else {
      slots.forEach((slot, idx) => {
        const isLast = idx === slots.length - 1;
        html += `
          <div class="am-slot">
            <span class="am-slot-hora">${horasLabels[idx]}</span>
            <div class="am-slot-linha">
              <span class="am-slot-dot${slot.occupied ? " ocupado" : ""}"></span>
              ${!isLast ? '<span class="am-slot-fio"></span>' : ""}
            </div>
            <div class="am-slot-corpo">
              ${slot.occupied
                ? `<div class="am-evento">
                    <span class="am-evento-nome">${slot.nome}</span>
                    <span class="am-evento-servico">${slot.servico}</span>
                  </div>`
                : `<span class="am-livre">Horário livre</span>`
              }
            </div>
          </div>
        `;
      });
    }

    container.innerHTML = html;

    container.querySelectorAll(".am-evento").forEach(ev => {
      ev.addEventListener("click", () => {
        if (appointmentModal) appointmentModal.show();
      });
    });
  }

  function renderMobile() {
    const base = getMonday(weekOffset);
    atualizarCabecalhoMobile(base);
    renderStrip(base);
    renderSlots(base);
  }

  // ══════════════════════════════════════════════════
  // UPDATE COMPLETO
  // ══════════════════════════════════════════════════
  function updateAll() {
    gerarDados();
    updateHeaders();
    buildGrid();
    renderMobile();
  }

  // ── Navegação (desktop e mobile compartilham weekOffset) ──────────
  document.getElementById("btnPrevWeek")?.addEventListener("click", () => { weekOffset--; diaAtivo = 0; updateAll(); });
  document.getElementById("btnNextWeek")?.addEventListener("click", () => { weekOffset++; diaAtivo = 0; updateAll(); });
  document.getElementById("btnToday")?.addEventListener("click",    () => { weekOffset = 0; diaAtivo = 0; updateAll(); scrollToNow(); });
  document.getElementById("amPrev")?.addEventListener("click",      () => { weekOffset--; diaAtivo = 0; updateAll(); });
  document.getElementById("amNext")?.addEventListener("click",      () => { weekOffset++; diaAtivo = 0; updateAll(); });

  // ── Notificações ─────────────────────────────────────────────────
  document.getElementById("tcalNotifClose")?.addEventListener("click", () => {
    const n = document.getElementById("tcalNotif");
    if (n) n.style.display = "none";
  });

  document.getElementById("amNotifFechar")?.addEventListener("click", () => {
    const n = document.getElementById("amNotif");
    if (n) n.style.display = "none";
  });

  // ── Inicialização ─────────────────────────────────────────────────
  gerarDados();
  updateHeaders();
  buildGrid();
  renderMobile();
});
