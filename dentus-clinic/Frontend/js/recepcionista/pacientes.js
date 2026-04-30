/**
 * pacientes.js — Página de gerenciamento de pacientes (Admin)
 * Componentes: TabelaPacientes, CardMobilePaciente, ModalConfirmacao
 */

let PACIENTES = [];


/* ══════════════════════════════════════
   UTILITÁRIOS
══════════════════════════════════════ */

/** Mascara CPF: ex: ***.***.**9-01 */
function mascaraCPF(cpf) {
    const d = cpf.replace(/\D/g, '');
    if (d.length !== 11) return cpf;
    return `***.***.*${d[7]}${d[8]}-${d[9]}${d[10]}`;
}

/** Formata data ISO para DD/MM/YYYY */
function formatarData(iso) {
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
}

/** Máscara de entrada de CPF no input */
function aplicarMascaraCPF(input) {
    input.addEventListener('input', () => {
        let v = input.value.replace(/\D/g, '').slice(0, 11);
        if (v.length > 9)       v = v.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
        else if (v.length > 6)  v = v.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
        else if (v.length > 3)  v = v.replace(/(\d{3})(\d{1,3})/, '$1.$2');
        input.value = v;
    });
}

/** Obtém as iniciais do nome */
function iniciais(nome) {
    const partes = nome.trim().split(/\s+/);
    if (partes.length >= 2) return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
    return partes[0][0].toUpperCase();
}


/* ══════════════════════════════════════
   COMPONENTE — Tabela de Pacientes
══════════════════════════════════════ */
const TabelaPacientes = {
    /**
     * Renderiza as linhas da tabela
     * @param {Array} lista - pacientes filtrados
     */
    render(lista) {
        const tbody = document.getElementById('tbodyPacientes');
        const empty = document.getElementById('emptyState');
        const tableContainer = document.getElementById('tableContainer');
        if (!tbody) return;

        if (lista.length === 0) {
            tbody.innerHTML = '';
            empty.classList.remove('hidden');
            return;
        }

        empty.classList.add('hidden');

        tbody.innerHTML = lista.map((p, i) => `
      <tr style="animation: rowAppear 0.3s ease-out ${i * 0.03}s both;">
        <td class="td-nome">${p.nome}</td>
        <td class="td-cpf">${mascaraCPF(p.cpf)}</td>
        <td class="td-celular">${p.celular || '—'}</td>
        <td class="td-data">${p.dataCadastro ? formatarData(p.dataCadastro) : '—'}</td>
        <td class="td-acoes">—</td>
      </tr>
    `).join('');
    }
};


/* ══════════════════════════════════════
   COMPONENTE — Cards Mobile
══════════════════════════════════════ */
const CardMobilePaciente = {
    /**
     * Renderiza os cards para visualização mobile
     * @param {Array} lista - pacientes filtrados
     */
    render(lista) {
        const container = document.getElementById('cardsMobile');
        if (!container) return;

        if (lista.length === 0) {
            container.innerHTML = `
        <div class="empty-state" id="emptyStateMobile">
          <i class="fa-solid fa-user-xmark"></i>
          <p>Nenhum paciente encontrado</p>
        </div>
      `;
            return;
        }

        container.innerHTML = lista.map(p => `
      <div class="card-paciente-mobile" id="cardMobile-${p.id}">
        <div class="card-mobile-avatar">${iniciais(p.nome)}</div>
        <div class="card-mobile-info">
          <div class="card-mobile-nome">${p.nome}</div>
          <div class="card-mobile-detail">
            <span><i class="bi bi-credit-card"></i> ${mascaraCPF(p.cpf)}</span>
            <span><i class="bi bi-calendar3"></i> ${p.dataCadastro ? formatarData(p.dataCadastro) : '—'}</span>
          </div>
        </div>
      </div>
    `).join('');
    }
};


/* ══════════════════════════════════════
   CONTROLADOR DA PÁGINA
══════════════════════════════════════ */
const PacientesPage = (() => {
    let sortCol = null;
    let sortAsc = true;

    async function carregarPacientes() {
        try {
            const res = await apiGetPacientes();
            PACIENTES = (res.dados || []).map(p => ({
                id:           p.id,
                nome:         p.nome,
                cpf:          p.cpf,
                celular:      p.telefone || '',
                dataCadastro: p.dataNascimento || ''
            }));
            atualizar();
        } catch (erro) {
            console.error('Erro ao carregar pacientes:', erro.message);
        }
    }

    /**
     * Lista filtrada de pacientes
     */
    function listaFiltrada() {
        const nome = (document.getElementById('filtroNome')?.value || '').toLowerCase().trim();
        const cpf  = (document.getElementById('filtroCPF')?.value || '').replace(/\D/g, '');
        const data = document.getElementById('filtroData')?.value || '';

        let lista = PACIENTES.filter(p => {
            const matchNome = !nome || p.nome.toLowerCase().includes(nome);
            const matchCPF  = !cpf  || p.cpf.replace(/\D/g, '').includes(cpf);
            const matchData = !data || p.dataCadastro === data;
            return matchNome && matchCPF && matchData;
        });

        // Ordenação
        if (sortCol) {
            lista.sort((a, b) => {
                let va, vb;
                if (sortCol === 'nome') { va = a.nome.toLowerCase(); vb = b.nome.toLowerCase(); }
                if (sortCol === 'data') { va = a.dataCadastro; vb = b.dataCadastro; }
                if (va < vb) return sortAsc ? -1 : 1;
                if (va > vb) return sortAsc ?  1 : -1;
                return 0;
            });
        }

        return lista;
    }

    /**
     * Atualiza tabela e cards
     */
    function atualizar() {
        const lista = listaFiltrada();
        TabelaPacientes.render(lista);
        CardMobilePaciente.render(lista);

        // Badge total
        const badge = document.getElementById('badgeTotal');
        if (badge) {
            badge.textContent = `${lista.length} paciente${lista.length !== 1 ? 's' : ''}`;
        }
    }

    async function confirmarCadastro() {
        const alerta = document.getElementById('alertaCadastro');
        alerta.classList.add('d-none');

        const nome           = document.getElementById('cadNome').value.trim();
        const cpf            = document.getElementById('cadCpf').value.replace(/\D/g, '');
        const telefone       = document.getElementById('cadTelefone').value.replace(/\D/g, '');
        const email          = document.getElementById('cadEmail').value.trim();
        const dataNascimento = document.getElementById('cadDataNascimento').value;
        const endereco       = document.getElementById('cadEndereco').value.trim();

        try {
            await apiCadastrarPaciente({ nome, cpf, telefone, email, dataNascimento, endereco });

            bootstrap.Modal.getOrCreateInstance(document.getElementById('modalCadastrarPaciente')).hide();
            resetarModalCadastro();
            await carregarPacientes();
        } catch (erro) {
            alerta.innerHTML = erro.message.split('\n').map(m => `<div>${m}</div>`).join('');
            alerta.classList.remove('d-none');
        }
    }

    function resetarModalCadastro() {
        ['cadNome','cadCpf','cadTelefone','cadEmail','cadDataNascimento','cadEndereco']
            .forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
        document.getElementById('alertaCadastro').classList.add('d-none');
    }

    /**
     * Inicialização
     */
    function init() {
        // 1. Sidebar
        SidebarComponent.render('sidebarContainer', {
            perfil: 'recepcionista',
            ativo: 'pacientes',
            nome: sessionStorage.getItem('nome') || 'Secretária',
            cargo: 'Secretária',
        });

        // 2. Hamburger
        const btnHamburger = document.getElementById('btnHamburger');
        if (btnHamburger) {
            btnHamburger.addEventListener('click', () => SidebarComponent.toggleSidebar());
        }

        // 3. Modal 
        // (A inicialização do modal bootstrap é automática sem init customizado agora)

        // 4. Máscara CPF
        const filtroCPF = document.getElementById('filtroCPF');
        if (filtroCPF) aplicarMascaraCPF(filtroCPF);

        // 5. Filtros com debounce
        let debounce;
        const inputs = ['filtroNome', 'filtroCPF', 'filtroData'];
        inputs.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('input', () => {
                    clearTimeout(debounce);
                    debounce = setTimeout(atualizar, 200);
                });
                // Para date input, também escuta change
                if (id === 'filtroData') {
                    el.addEventListener('change', () => {
                        clearTimeout(debounce);
                        debounce = setTimeout(atualizar, 100);
                    });
                }
            }
        });

        // 6. Limpar filtros
        const btnLimpar = document.getElementById('btnLimparFiltros');
        if (btnLimpar) {
            btnLimpar.addEventListener('click', () => {
                inputs.forEach(id => {
                    const el = document.getElementById(id);
                    if (el) el.value = '';
                });
                atualizar();
            });
        }

        // 6.1 Botão cadastrar paciente
        const btnCadastrar = document.getElementById('btnCadastrar');
        if (btnCadastrar) {
            btnCadastrar.addEventListener('click', () => {
                bootstrap.Modal.getOrCreateInstance(document.getElementById('modalCadastrarPaciente')).show();
            });
        }

        // Máscaras
        const cadCpfEl = document.getElementById('cadCpf');
        if (cadCpfEl) {
            cadCpfEl.addEventListener('input', () => {
                let v = cadCpfEl.value.replace(/\D/g, '').slice(0, 11);
                v = v.replace(/(\d{3})(\d)/, '$1.$2');
                v = v.replace(/(\d{3})(\d)/, '$1.$2');
                v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
                cadCpfEl.value = v;
            });
        }

        const cadTelEl = document.getElementById('cadTelefone');
        if (cadTelEl) {
            cadTelEl.addEventListener('input', () => {
                let v = cadTelEl.value.replace(/\D/g, '').slice(0, 11);
                if (v.length > 10)     v = `(${v.slice(0,2)}) ${v.slice(2,7)}-${v.slice(7)}`;
                else if (v.length > 6) v = `(${v.slice(0,2)}) ${v.slice(2,6)}-${v.slice(6)}`;
                else if (v.length > 2) v = `(${v.slice(0,2)}) ${v.slice(2)}`;
                else if (v.length > 0) v = `(${v}`;
                cadTelEl.value = v;
            });
        }

        // 7. Ordenação por coluna
        document.querySelectorAll('.th-sort').forEach(btn => {
            btn.addEventListener('click', () => {
                const col = btn.dataset.col;
                if (sortCol === col) {
                    sortAsc = !sortAsc;
                } else {
                    sortCol = col;
                    sortAsc = true;
                }

                // Atualiza ícones
                document.querySelectorAll('.th-sort i').forEach(icon => {
                    icon.className = 'fa-solid fa-sort';
                });
                const icon = btn.querySelector('i');
                icon.className = sortAsc ? 'fa-solid fa-chevron-up' : 'fa-solid fa-chevron-down';

                atualizar();
            });
        });

        // 8. Carrega pacientes da API
        carregarPacientes();
    }

    return { init, confirmarCadastro, resetarModalCadastro };
})();


/* ══════════════════════════════════════
   INICIALIZAÇÃO
══════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', PacientesPage.init);
