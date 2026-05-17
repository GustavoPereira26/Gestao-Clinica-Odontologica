document.addEventListener("DOMContentLoaded", () => {

  SidebarComponent.render("sidebarContainer", { perfil: "dentista", ativo: "agenda" });

  const btnHamburger = document.getElementById("btnHamburger");
  if (btnHamburger) btnHamburger.addEventListener("click", () => SidebarComponent.toggleSidebar());

  const modalEl = document.getElementById("appointmentModal");
  const appointmentModal = modalEl ? new bootstrap.Modal(modalEl) : null;

  // ── Configurações ──────────────────────────────────────────────────
  const CELL_H      = 48;
  const HOUR_START  = 8;
  const SLOT_MIN    = 30;
  const HOUR_COUNT  = 27;   // 08:00 → 21:00, de 30 em 30 min

  const MONTHS_PT = [
    "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
    "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"
  ];
  const DAY_ABBR = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];
  const DAY_FULL = ["Domingo","Segunda","Terça","Quarta","Quinta","Sexta","Sábado"];

  const dentistaId = sessionStorage.getItem('id');

  // ── Estado ─────────────────────────────────────────────────────────
  let weekOffset  = 0;
  let dadosSemana = [];
  let diaAtivo    = 0;

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

  function toISODate(d) {
    const y  = d.getFullYear();
    const m  = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${dd}`;
  }

  function formatarHora(horaStr) {
    return horaStr ? horaStr.slice(0, 5) : '';
  }

  function slotToTime(idx) {
    const mins = HOUR_START * 60 + idx * SLOT_MIN;
    return `${String(Math.floor(mins / 60)).padStart(2,'0')}:${String(mins % 60).padStart(2,'0')}`;
  }

  // ── Carrega dados reais da API ─────────────────────────────────────
  async function carregarSemana() {
    const monday = getMonday(weekOffset);

    dadosSemana = Array.from({ length: 7 }, () =>
      Array.from({ length: HOUR_COUNT }, () => ({ occupied: false }))
    );

    if (!dentistaId) return;

    const datas = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return toISODate(d);
    });

    try {
      const resultados = await Promise.all(
        datas.map(data => apiGetAgendaDentista(dentistaId, data).catch(() => null))
      );

      resultados.forEach((res, d) => {
        const consultas = res?.dados || [];
        consultas.forEach(c => {
          const parts = (c.horaConsulta || '00:00:00').split(':');
          const hh = parseInt(parts[0]);
          const mm = parseInt(parts[1] || '0');
          const h  = Math.round(((hh - HOUR_START) * 60 + mm) / SLOT_MIN);
          if (h >= 0 && h < HOUR_COUNT && !dadosSemana[d][h].occupied) {
            dadosSemana[d][h] = {
              occupied: true,
              id:       c.id,
              nome:     c.nomePaciente,
              servico:  c.nomeServico || '—',
              hora:     slotToTime(h),
              data:     datas[d],
              status:   c.status || ''
            };
          }
        });
      });
    } catch (err) {
      console.error('Erro ao carregar agenda:', err.message);
    }
  }

  // ── Abre o modal com os dados da consulta ──────────────────────────
  function abrirModal(slot, diaDate) {
    if (!appointmentModal) return;
    const label = document.getElementById("appointmentModalLabel");
    if (label) label.textContent = `${DAY_FULL[diaDate.getDay()]} | ${slot.hora || ''}`;
    document.getElementById("modalPaciente").textContent = slot.nome || '—';
    document.getElementById("modalServico").textContent  = slot.servico || '—';
    const statusEl = document.getElementById("modalStatus");
    if (statusEl) statusEl.textContent = slot.status || '';
    appointmentModal.show();
  }

  // ══════════════════════════════════════════════════
  // DESKTOP — cabeçalho de dias
  // ══════════════════════════════════════════════════
  function updateHeaders() {
    const monday   = getMonday(weekOffset);
    const sunday   = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const todayKey = dateKey(new Date());

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
  function buildTimeCol() {
    const col = document.getElementById('tcalTimeCol');
    if (!col) return;
    col.innerHTML = '';
    for (let i = 0; i < HOUR_COUNT; i++) {
      const cell = document.createElement('div');
      cell.className = 'tcal-hour-cell';
      const lbl = document.createElement('span');
      lbl.className   = 'tcal-hour-lbl';
      lbl.textContent = slotToTime(i);
      cell.appendChild(lbl);
      col.appendChild(cell);
    }
  }

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
        cell.className   = "tcal-cell";
        cell.dataset.hour = HOUR_START + h;

        const slot = dadosSemana[d][h];

        if (slot.occupied) {
          const ev = document.createElement("div");
          ev.className = "tcal-event";
          ev.style.cssText = `background: var(--c1); color: #fff; border-left: none; border-radius: 6px; box-shadow: 0 2px 8px rgba(110, 84, 48, .25);`;
          ev.innerHTML = `
            <span class="tcal-event-name"  style="color:#fff;">${slot.nome}</span>
            <span class="tcal-event-service" style="color:rgba(255,255,255,0.72);">${slot.servico}</span>
          `;
          ev.addEventListener("click", e => { e.stopPropagation(); abrirModal(slot, day); });
          cell.appendChild(ev);
        }

        col.appendChild(cell);
      }

      grid.appendChild(col);
    }
  }

  // ── Scroll para o horário atual ──────────────────────────────────
  function scrollToNow() {
    const area = document.getElementById("tcalScrollArea");
    if (!area) return;
    const now  = new Date();
    const mins = (now.getHours() - HOUR_START) * 60 + now.getMinutes();
    if (mins < 0) return;
    area.scrollTop = Math.max(0, (Math.floor(mins / SLOT_MIN) - 1) * CELL_H + 68);
  }

  // ══════════════════════════════════════════════════
  // MOBILE
  // ══════════════════════════════════════════════════
  function atualizarCabecalhoMobile(base) {
    const amSemana = document.getElementById("amSemana");
    const amMes    = document.getElementById("amMes");
    if (!amSemana || !amMes) return;
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

    const horasLabels = Array.from({ length: HOUR_COUNT }, (_, i) => slotToTime(i));

    let html = `<div class="am-slots-titulo">${DAY_FULL[d.getDay()]}, ${d.getDate()} de ${MONTHS_PT[d.getMonth()]}</div>`;

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
                ? `<div class="am-evento" data-idx="${idx}">
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
      const idx  = parseInt(ev.dataset.idx);
      const slot = slots[idx];
      ev.addEventListener("click", () => abrirModal(slot, d));
    });
  }

  function renderMobile() {
    const base = getMonday(weekOffset);
    atualizarCabecalhoMobile(base);
    renderStrip(base);
    renderSlots(base);
  }

  // ══════════════════════════════════════════════════
  // UPDATE COMPLETO (async)
  // ══════════════════════════════════════════════════
  async function updateAll() {
    await carregarSemana();
    updateHeaders();
    buildTimeCol();
    buildGrid();
    renderMobile();
  }

  // ── Navegação ─────────────────────────────────────────────────────
  document.getElementById("btnPrevWeek")?.addEventListener("click", () => { weekOffset--; diaAtivo = 0; updateAll(); });
  document.getElementById("btnNextWeek")?.addEventListener("click", () => { weekOffset++; diaAtivo = 0; updateAll(); });
  document.getElementById("btnToday")?.addEventListener("click",    () => { weekOffset = 0; diaAtivo = 0; updateAll().then(scrollToNow); });
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
  updateAll().then(scrollToNow);
});
