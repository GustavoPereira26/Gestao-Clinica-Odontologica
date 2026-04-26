document.addEventListener("DOMContentLoaded", () => {

  SidebarComponent.render("sidebarContainer", {
    perfil: "dentista",
    ativo: "pacientes"
  });

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
      
      if (value.length > 8) {
        value = value.slice(0, 8);
      }

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

  // --- Lógica de Filtro da Tabela ---
  const filterInputs = {
    cpf: document.getElementById('filterCpf'),
    nome: document.getElementById('filterNome'),
    servico: document.getElementById('filterServico'),
    consulta: document.getElementById('filterConsulta'),
    telefone: document.getElementById('filterTelefone')
  };

  const tableBody = document.getElementById('pacientesTableBody');
  const tableRows = tableBody ? tableBody.querySelectorAll('tr') : [];

  function filterTable() {
    try {
      const filters = {
        cpf: filterInputs.cpf ? filterInputs.cpf.value.toLowerCase().trim() : '',
        nome: filterInputs.nome ? filterInputs.nome.value.toLowerCase().trim() : '',
        servico: filterInputs.servico ? filterInputs.servico.value.toLowerCase().trim() : '',
        consulta: filterInputs.consulta ? filterInputs.consulta.value.toLowerCase().trim() : '',
        telefone: filterInputs.telefone ? filterInputs.telefone.value.toLowerCase().trim() : ''
      };

      const tbody = document.getElementById('pacientesTableBody');
      if (!tbody) return;
      
      const rows = tbody.querySelectorAll('tr');

      rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 5) {
          // cells map: 0:Nome, 1:CPF, 2:Serviço, 3:Telefone, 4:Consulta, 5:Ações
          const textNome = cells[0].textContent || '';
          const textCpf = cells[1].textContent || '';
          const textServico = cells[2].textContent || '';
          const textTelefone = cells[3].textContent || '';
          const textConsulta = cells[4].textContent || '';

          const matchNome = textNome.toLowerCase().includes(filters.nome);
          const matchCpf = textCpf.toLowerCase().includes(filters.cpf);
          const matchServico = textServico.toLowerCase().includes(filters.servico);
          const matchTelefone = textTelefone.toLowerCase().includes(filters.telefone);
          const matchConsulta = textConsulta.toLowerCase().includes(filters.consulta);

          if (matchCpf && matchNome && matchServico && matchConsulta && matchTelefone) {
            row.style.display = '';
          } else {
            row.style.display = 'none';
          }
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

});