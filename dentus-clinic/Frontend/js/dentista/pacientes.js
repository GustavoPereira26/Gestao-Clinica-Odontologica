document.addEventListener("DOMContentLoaded", () => {

  SidebarComponent.render("sidebarContainer", {
    perfil: "dentista",
    ativo: "pacientes"
  });

  const btnHamburger = document.getElementById("btnHamburger");
  if (btnHamburger) {
    btnHamburger.addEventListener("click", () => SidebarComponent.toggleSidebar());
  }

  // Máscara de CPF para o input de filtro
  const cpfInput = document.getElementById('filterCpf');
  if (cpfInput) {
    cpfInput.addEventListener('input', function (e) {
      let value = e.target.value.replace(/\D/g, ''); // Remove tudo que não é número
      
      // Limita o tamanho máximo a 11 números
      if (value.length > 11) {
        value = value.slice(0, 11);
      }

      // Aplica a formatação XXX.XXX.XXX-XX
      if (value.length > 9) {
        value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
      } else if (value.length > 6) {
        value = value.replace(/(\d{3})(\d{3})(\d{1,3})/, "$1.$2.$3");
      } else if (value.length > 3) {
        value = value.replace(/(\d{3})(\d{1,3})/, "$1.$2");
      }
      
      e.target.value = value;
    });
  }

  // Máscara de Data (DD/MM/AAAA) para o input de consulta
  const consultaInput = document.getElementById('filterConsulta');
  if (consultaInput) {
    consultaInput.addEventListener('input', function (e) {
      let value = e.target.value.replace(/\D/g, '');
      if (value.length > 8) value = value.slice(0, 8);
      if (value.length > 4) {
        value = value.replace(/(\d{2})(\d{2})(\d{1,4})/, "$1/$2/$3");
      } else if (value.length > 2) {
        value = value.replace(/(\d{2})(\d{1,2})/, "$1/$2");
      }
      e.target.value = value;
    });
  }

  // Máscara de Telefone ( (XX) XXXXX-XXXX ) para o input de telefone
  const telefoneInput = document.getElementById('filterTelefone');
  if (telefoneInput) {
    telefoneInput.addEventListener('input', function (e) {
      let value = e.target.value.replace(/\D/g, '');
      
      if (value.length > 11) {
        value = value.slice(0, 11);
      }

      if (value.length > 10) {
        // Fixo com 9 dígitos: (11) 98765-4321
        value = value.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
      } else if (value.length > 6) {
        // Fixo com 8 ou 9 dígitos incompletos: (11) 9876-
        value = value.replace(/(\d{2})(\d{4,5})(\d{0,4})/, "($1) $2-$3");
      } else if (value.length > 2) {
        value = value.replace(/(\d{2})(\d{0,5})/, "($1) $2");
      } else if (value.length > 0) {
        value = value.replace(/(\d{1,2})/, "($1");
      }
      
      e.target.value = value;
    });
  }

  const btnHamburgerMobile = document.getElementById("btnHamburgerMobile");
  if (btnHamburgerMobile) {
    btnHamburgerMobile.addEventListener("click", () => SidebarComponent.toggleSidebar());
  }

  // --- Lógica de Filtro dos Cards ---
  const filterInputs = {
    cpf: document.getElementById('filterCpf'),
    nome: document.getElementById('filterNome'),
    servico: document.getElementById('filterServico'),
    consulta: document.getElementById('filterConsulta'),
    telefone: document.getElementById('filterTelefone')
  };

  const cardsList = document.getElementById('pacientesCardsList');

  function filterTable() {
    try {
      const filters = {
        cpf: filterInputs.cpf ? filterInputs.cpf.value.toLowerCase().trim() : '',
        nome: filterInputs.nome ? filterInputs.nome.value.toLowerCase().trim() : '',
        servico: filterInputs.servico ? filterInputs.servico.value.toLowerCase().trim() : '',
        consulta: filterInputs.consulta ? filterInputs.consulta.value.trim() : '',
        telefone: filterInputs.telefone ? filterInputs.telefone.value.toLowerCase().trim() : ''
      };

      if (!cardsList) return;
      
      const cards = cardsList.querySelectorAll('.patient-card');

      cards.forEach(card => {
        const textNome = card.dataset.nome ? card.dataset.nome.toLowerCase() : '';
        const textCpf = card.dataset.cpf ? card.dataset.cpf.toLowerCase() : '';
        const textServico = card.dataset.servico ? card.dataset.servico.toLowerCase() : '';
        const textTelefone = card.dataset.telefone ? card.dataset.telefone.toLowerCase() : '';
        const textConsulta = card.dataset.consulta ? card.dataset.consulta.toLowerCase() : '';

        const matchNome = textNome.includes(filters.nome);
        const matchCpf = textCpf.includes(filters.cpf);
        const matchServico = textServico.includes(filters.servico);
        const matchTelefone = textTelefone.includes(filters.telefone);
        const matchConsulta = textConsulta.includes(filters.consulta);

        if (matchCpf && matchNome && matchServico && matchConsulta && matchTelefone) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    } catch (err) {
      console.error('Filter Error:', err);
    }
  }

  // Adicionar eventos 'input', 'keyup' e 'change' em todos os campos de filtro para atualizar em tempo real
  Object.values(filterInputs).forEach(input => {
    if (input) {
      input.addEventListener('input', filterTable);
      input.addEventListener('keyup', filterTable);
      input.addEventListener('change', filterTable);
    }
  });

  // Botão de limpar filtros
  const btnClearFilters = document.getElementById('btnClearFilters');
  if (btnClearFilters) {
    btnClearFilters.addEventListener('click', () => {
      Object.values(filterInputs).forEach(input => {
        if (input) input.value = '';
      });
      filterTable(); // Re-render the table with empty filters
    });
  }

  // Lógica do Modal "Ver Detalhes"
  const detalhesModalEl = document.getElementById('detalhesModal');
  const detalhesModal = detalhesModalEl ? new bootstrap.Modal(detalhesModalEl) : null;

  if (cardsList && detalhesModal) {
    cardsList.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn-detalhes');
      if (!btn) return;
      
      const card = btn.closest('.patient-card');
      if (!card) return;

      const nome = card.dataset.nome || '';
      const cpf = card.dataset.cpf || '';
      const servico = card.dataset.servico || '';
      const telefone = card.dataset.telefone || '';
      const consulta = card.dataset.consulta || '';

      document.getElementById('modalNome').textContent = nome;
      document.getElementById('modalServico').textContent = servico;
      document.getElementById('modalCpf').textContent = cpf;
      document.getElementById('modalTelefone').textContent = telefone;
      document.getElementById('modalConsulta').textContent = consulta;

      detalhesModal.show();
    });
  }

});