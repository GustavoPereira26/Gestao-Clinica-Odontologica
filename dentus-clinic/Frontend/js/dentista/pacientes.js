document.addEventListener("DOMContentLoaded", () => {

  SidebarComponent.render("sidebarContainer", { perfil: "dentista", ativo: "pacientes" });

  const btnHamburger = document.getElementById("btnHamburger");
  if (btnHamburger) btnHamburger.addEventListener("click", () => SidebarComponent.toggleSidebar());

  const btnHamburgerMobile = document.getElementById("btnHamburgerMobile");
  if (btnHamburgerMobile) btnHamburgerMobile.addEventListener("click", () => SidebarComponent.toggleSidebar());

  const dentistaId = parseInt(sessionStorage.getItem('id'));

  // ── Helpers ──────────────────────────────────────────────────────
  function formatarData(iso) {
    if (!iso) return '—';
    const [y, m, d] = iso.split('-');
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

  function formatarHora(hora) {
    return hora ? hora.slice(0, 5) : '—';
  }

  // ── Renderização dos cards ────────────────────────────────────────
  function renderCards(consultas, pacientesMap) {
    const lista    = document.getElementById('pacientesCardsList');
    const empty    = document.getElementById('emptyState');
    if (!lista) return;

    if (consultas.length === 0) {
      lista.innerHTML = '';
      empty?.classList.remove('d-none');
      return;
    }

    empty?.classList.add('d-none');

    const servicos = [...new Set(consultas.map(c => c.nomeServico).filter(Boolean))].sort();
    const select   = document.getElementById('filterServico');
    if (select) {
      const atual = select.value;
      select.innerHTML = '<option value="">Todos os Serviços</option>' +
        servicos.map(s => `<option value="${s}">${s}</option>`).join('');
      if (atual) select.value = atual;
    }

    lista.innerHTML = consultas.map(c => {
      const pac      = pacientesMap[c.idPaciente] || {};
      const cpf      = formatarCPF(pac.cpf);
      const telefone = formatarTelefone(pac.telefone);
      const data     = formatarData(c.dataConsulta);
      const hora     = formatarHora(c.horaConsulta);
      const servico  = c.nomeServico || '—';
      const nome     = c.nomePaciente || '—';
      const status   = c.status || '—';

      return `
        <div class="patient-card"
             data-nome="${nome}"
             data-cpf="${cpf}"
             data-servico="${servico}"
             data-telefone="${telefone}"
             data-consulta="${data}"
             data-hora="${hora}"
             data-status="${status}">
          <div class="pc-header">
            <h3 class="pc-name">${nome}</h3>
          </div>
          <div class="pc-body">
            <div class="pc-item"><i class="fa-regular fa-id-card"></i><span>${cpf}</span></div>
            <div class="pc-item"><i class="fa-solid fa-phone"></i><span>${telefone}</span></div>
            <div class="pc-item pc-service"><i class="fa-solid fa-stethoscope"></i><span>${servico}</span></div>
            <div class="pc-item"><i class="fa-regular fa-calendar"></i><span>${data} — ${hora}</span></div>
          </div>
          <div class="pc-footer">
            <button class="btn-detalhes">Ver Detalhes</button>
          </div>
        </div>
      `;
    }).join('');
  }

  // ── Carrega dados da API ──────────────────────────────────────────
  async function carregarConsultas() {
    try {
      const [resConsultas, resPacientes] = await Promise.all([
        apiGetConsultas(),
        apiGetPacientes()
      ]);

      const todasConsultas = resConsultas?.dados || [];
      const todosPacientes = resPacientes?.dados || [];

      const pacientesMap = {};
      todosPacientes.forEach(p => { pacientesMap[p.id] = p; });

      const minhas = todasConsultas
        .filter(c => c.idDentista === dentistaId)
        .sort((a, b) => {
          const da = `${a.dataConsulta}T${a.horaConsulta}`;
          const db = `${b.dataConsulta}T${b.horaConsulta}`;
          return da.localeCompare(db);
        });

      renderCards(minhas, pacientesMap);
    } catch (err) {
      console.error('Erro ao carregar consultas:', err.message);
    }
  }

  // ── Filtros ───────────────────────────────────────────────────────
  const filterInputs = {
    cpf:      document.getElementById('filterCpf'),
    nome:     document.getElementById('filterNome'),
    servico:  document.getElementById('filterServico'),
    consulta: document.getElementById('filterConsulta'),
    telefone: document.getElementById('filterTelefone')
  };

  function filterCards() {
    const lista = document.getElementById('pacientesCardsList');
    if (!lista) return;

    const f = {
      cpf:      filterInputs.cpf?.value.toLowerCase().trim()      || '',
      nome:     filterInputs.nome?.value.toLowerCase().trim()     || '',
      servico:  filterInputs.servico?.value.toLowerCase().trim()  || '',
      consulta: filterInputs.consulta?.value.trim()               || '',
      telefone: filterInputs.telefone?.value.toLowerCase().trim() || ''
    };

    lista.querySelectorAll('.patient-card').forEach(card => {
      const match =
        card.dataset.nome?.toLowerCase().includes(f.nome) &&
        card.dataset.cpf?.toLowerCase().includes(f.cpf) &&
        card.dataset.servico?.toLowerCase().includes(f.servico) &&
        card.dataset.telefone?.toLowerCase().includes(f.telefone) &&
        card.dataset.consulta?.includes(f.consulta);

      card.style.display = match ? '' : 'none';
    });
  }

  Object.values(filterInputs).forEach(input => {
    if (input) {
      input.addEventListener('input',  filterCards);
      input.addEventListener('change', filterCards);
    }
  });

  document.getElementById('btnClearFilters')?.addEventListener('click', () => {
    Object.values(filterInputs).forEach(input => { if (input) input.value = ''; });
    filterCards();
  });

  // ── Máscaras ──────────────────────────────────────────────────────
  filterInputs.cpf?.addEventListener('input', e => {
    let v = e.target.value.replace(/\D/g, '').slice(0, 11);
    if (v.length > 9)      v = v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    else if (v.length > 6) v = v.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
    else if (v.length > 3) v = v.replace(/(\d{3})(\d{1,3})/, '$1.$2');
    e.target.value = v;
  });

  filterInputs.consulta?.addEventListener('input', e => {
    let v = e.target.value.replace(/\D/g, '').slice(0, 8);
    if (v.length > 4)      v = v.replace(/(\d{2})(\d{2})(\d{1,4})/, '$1/$2/$3');
    else if (v.length > 2) v = v.replace(/(\d{2})(\d{1,2})/, '$1/$2');
    e.target.value = v;
  });

  filterInputs.telefone?.addEventListener('input', e => {
    let v = e.target.value.replace(/\D/g, '').slice(0, 11);
    if (v.length > 10)     v = `(${v.slice(0,2)}) ${v.slice(2,7)}-${v.slice(7)}`;
    else if (v.length > 6) v = `(${v.slice(0,2)}) ${v.slice(2,6)}-${v.slice(6)}`;
    else if (v.length > 2) v = `(${v.slice(0,2)}) ${v.slice(2)}`;
    else if (v.length > 0) v = `(${v}`;
    e.target.value = v;
  });

  // ── Modal Detalhes ────────────────────────────────────────────────
  const detalhesModal = document.getElementById('detalhesModal')
    ? new bootstrap.Modal(document.getElementById('detalhesModal'))
    : null;

  document.getElementById('pacientesCardsList')?.addEventListener('click', e => {
    const btn  = e.target.closest('.btn-detalhes');
    const card = btn?.closest('.patient-card');
    if (!btn || !card) return;

    document.getElementById('modalNome').textContent     = card.dataset.nome    || '—';
    document.getElementById('modalServico').textContent  = card.dataset.servico || '—';
    document.getElementById('modalCpf').textContent      = card.dataset.cpf     || '—';
    document.getElementById('modalTelefone').textContent = card.dataset.telefone|| '—';
    document.getElementById('modalConsulta').textContent = card.dataset.consulta|| '—';
    document.getElementById('modalHora').textContent     = card.dataset.hora    || '—';
    document.getElementById('modalStatus').textContent   = card.dataset.status  || '—';

    detalhesModal?.show();
  });

  // ── Inicialização ─────────────────────────────────────────────────
  carregarConsultas();
});
