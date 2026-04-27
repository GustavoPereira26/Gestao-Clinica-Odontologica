document.addEventListener("DOMContentLoaded", () => {

  SidebarComponent.render("sidebarContainer", {
    perfil: "dentista",
    ativo: "agenda"
  });

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
    // Base: 16 de Março de 2026 (Segunda-feira correspondente à Semana 12)
    const baseDate = new Date(2026, 2, 16); 
    baseDate.setDate(baseDate.getDate() + (weekOffset * 7));
    
    let currentWeekNum = ((11 + weekOffset) % 52) + 1;
    if (currentWeekNum <= 0) currentWeekNum += 52;
    if (weekLabel) weekLabel.textContent = `Semana ${currentWeekNum}`;
    
    if (monthYearLabel) {
      const month = String(baseDate.getMonth() + 1).padStart(2, '0');
      const year = baseDate.getFullYear();
      monthYearLabel.textContent = `${month}/${year}`;
    }
    
    // Atualiza os cabeçalhos de dias (Seg 20 -> Seg 27, etc)
    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(baseDate);
      dayDate.setDate(baseDate.getDate() + i);
      const dayElement = document.getElementById(`day-${i}`);
      if (dayElement) {
        dayElement.textContent = `${dayNames[i]} ${dayDate.getDate()}`;
      }
    }
    
    // Simula uma nova agenda embaralhando os horários de forma aleatória
    const allSlotsTd = document.querySelectorAll('.calendar-table tbody td:not(.time-col)');
    allSlotsTd.forEach(td => {
      // Clona a célula para remover listeners anteriores
      const newTd = td.cloneNode(false); 
      td.parentNode.replaceChild(newTd, td);
      
      const isUnavailable = Math.random() < 0.25; // 25% de chance de estar ocupado
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
  }

  // Eventos de Clique
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

});