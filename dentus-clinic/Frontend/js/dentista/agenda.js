document.addEventListener("DOMContentLoaded", () => {

  SidebarComponent.render("sidebarContainer", {
    perfil: "dentista",
    ativo: "agenda"
  });

  const btnHamburger = document.getElementById("btnHamburger");
  if (btnHamburger) {
    btnHamburger.addEventListener("click", () => SidebarComponent.toggleSidebar());
  }

  const modalElement = document.getElementById('appointmentModal');
  let appointmentModal = null;
  if (modalElement) {
    appointmentModal = new bootstrap.Modal(modalElement);
  }

  // --- Configurar Modal para os Slots Iniciais ---
  const unavailableSlots = document.querySelectorAll('.slot-unavailable');
  if (unavailableSlots.length > 0 && appointmentModal) {
    unavailableSlots.forEach(slot => {
      slot.parentElement.addEventListener('click', () => {
        appointmentModal.show();
      });
    });
  }

  // --- Lógica de Navegação Semanal ---
  let weekOffset = 0;
  const btnPrev = document.getElementById('btnPrevWeek');
  const btnNext = document.getElementById('btnNextWeek');
  const weekLabel = document.getElementById('weekLabel');
  const monthYearLabel = document.getElementById('monthYearLabel');
  const dayNames = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'];

  function updateCalendar() {
    const baseDate = getBaseDate();

    let currentWeekNum = ((11 + weekOffset) % 52) + 1;
    if (currentWeekNum <= 0) currentWeekNum += 52;
    if (weekLabel) weekLabel.textContent = `Semana ${currentWeekNum}`;

    if (monthYearLabel) {
      const month = String(baseDate.getMonth() + 1).padStart(2, '0');
      const year = baseDate.getFullYear();
      monthYearLabel.textContent = `${month}/${year}`;
    }

    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(baseDate);
      dayDate.setDate(baseDate.getDate() + i);
      const dayElement = document.getElementById(`day-${i}`);
      if (dayElement) {
        dayElement.textContent = `${dayNames[i]} ${dayDate.getDate()}`;
      }
    }

    const allSlotsTd = document.querySelectorAll('.calendar-table tbody td:not(.time-col)');
    allSlotsTd.forEach(td => {
      const newTd = td.cloneNode(false);
      td.parentNode.replaceChild(newTd, td);

      const isUnavailable = Math.random() < 0.25;
      const div = document.createElement('div');

      if (isUnavailable) {
        div.className = 'slot-unavailable';
        newTd.addEventListener('click', () => {
          if (appointmentModal) appointmentModal.show();
        });
      } else {
        div.className = 'slot-available';
      }
      newTd.appendChild(div);
    });

    gerarDadosSemana();
    renderMobile();
  }

  if (btnPrev && btnNext) {
    btnPrev.addEventListener('click', () => {
      weekOffset--;
      updateCalendar();
    });

    btnNext.addEventListener('click', () => {
      weekOffset++;
      updateCalendar();
    });
  }

  // ══════════════════════════════════════════════════
  // AGENDA MOBILE
  // ══════════════════════════════════════════════════

  const mesesPT = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const horasLabels = [
    '8 AM', '9 AM', '10 AM', '11 AM', '12 PM',
    '1 PM', '2 PM', '3 PM', '4 PM', '5 PM'
  ];

  const nomesMock = [
    'Ana Costa', 'Bruno Lima', 'Carla Souza', 'Diego Alves',
    'Elena Rocha', 'Felipe Melo', 'Gabi Nunes', 'Hélio Pinto'
  ];

  const servicosMock = [
    'Limpeza', 'Clareamento', 'Extração', 'Canal',
    'Consulta', 'Prótese', 'Ortodontia', 'Restauração'
  ];

  let diaAtivo = 0;
  let dadosSemana = [];

  function getBaseDate() {
    const base = new Date(2026, 2, 16);
    base.setDate(base.getDate() + weekOffset * 7);
    return base;
  }

  function gerarDadosSemana() {
    dadosSemana = [];
    for (let d = 0; d < 7; d++) {
      const slots = [];
      for (let h = 0; h < horasLabels.length; h++) {
        const ocupado = Math.random() < 0.28;
        slots.push(ocupado ? {
          ocupado: true,
          nome: nomesMock[Math.floor(Math.random() * nomesMock.length)],
          servico: servicosMock[Math.floor(Math.random() * servicosMock.length)]
        } : { ocupado: false });
      }
      dadosSemana.push(slots);
    }
  }

  function atualizarCabecalhoMobile(base) {
    const amSemana = document.getElementById('amSemana');
    const amMes = document.getElementById('amMes');
    if (!amSemana || !amMes) return;

    let currentWeekNum = ((11 + weekOffset) % 52) + 1;
    if (currentWeekNum <= 0) currentWeekNum += 52;
    amSemana.textContent = `Semana ${currentWeekNum}`;
    amMes.textContent = `${mesesPT[base.getMonth()]} ${base.getFullYear()}`;
  }

  function renderStrip(base) {
    const strip = document.getElementById('amStrip');
    if (!strip) return;

    const hoje = new Date();
    const hojeStr = `${hoje.getFullYear()}-${hoje.getMonth()}-${hoje.getDate()}`;

    const diasCurtos = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    strip.innerHTML = '';

    for (let i = 0; i < 7; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      const dStr = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      const isHoje = dStr === hojeStr;
      const isAtivo = i === diaAtivo;

      const pill = document.createElement('div');
      pill.className = 'am-day' + (isHoje ? ' hoje' : '') + (isAtivo ? ' ativo' : '');
      pill.innerHTML = `
        <span class="am-day-nome">${diasCurtos[d.getDay()]}</span>
        <span class="am-day-num">${d.getDate()}</span>
      `;
      pill.addEventListener('click', () => {
        diaAtivo = i;
        renderStrip(base);
        renderSlots();
      });
      strip.appendChild(pill);
    }
  }

  function renderSlots() {
    const container = document.getElementById('amSlots');
    if (!container) return;

    const slots = dadosSemana[diaAtivo] || [];
    const temConsulta = slots.some(s => s.ocupado);

    const base = getBaseDate();
    const d = new Date(base);
    d.setDate(base.getDate() + diaAtivo);
    const diasPT = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

    let html = `<div class="am-slots-titulo">${diasPT[d.getDay()]}, ${d.getDate()} de ${mesesPT[d.getMonth()]}</div>`;

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
              <span class="am-slot-dot${slot.ocupado ? ' ocupado' : ''}"></span>
              ${!isLast ? '<span class="am-slot-fio"></span>' : ''}
            </div>
            <div class="am-slot-corpo">
              ${slot.ocupado
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

    container.querySelectorAll('.am-evento').forEach(ev => {
      ev.addEventListener('click', () => {
        if (appointmentModal) appointmentModal.show();
      });
    });
  }

  function renderMobile() {
    const base = getBaseDate();
    atualizarCabecalhoMobile(base);
    renderStrip(base);
    renderSlots();
  }

  // Navegação mobile
  const amPrev = document.getElementById('amPrev');
  const amNext = document.getElementById('amNext');

  if (amPrev) {
    amPrev.addEventListener('click', () => {
      weekOffset--;
      diaAtivo = 0;
      gerarDadosSemana();
      updateCalendar();
    });
  }

  if (amNext) {
    amNext.addEventListener('click', () => {
      weekOffset++;
      diaAtivo = 0;
      gerarDadosSemana();
      updateCalendar();
    });
  }

  // Fechar notificação
  const amNotifFechar = document.getElementById('amNotifFechar');
  const amNotif = document.getElementById('amNotif');
  if (amNotifFechar && amNotif) {
    amNotifFechar.addEventListener('click', () => {
      amNotif.style.display = 'none';
    });
  }

  // Inicialização
  gerarDadosSemana();
  renderMobile();

});
