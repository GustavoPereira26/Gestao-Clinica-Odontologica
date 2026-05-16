/**
 * settings.js — Componente de Configurações
 * Gerencia o modal de configurações do sistema.
 */
window.SettingsComponent = (() => {

  /**
   * Inicializa o componente, usando delegação de eventos global.
   */
  function init() {
    // Remove ouvinte antigo para evitar duplicidade
    document.removeEventListener('click', handleGlobalClick);
    document.addEventListener('click', handleGlobalClick);
  }

  function handleGlobalClick(e) {
    // Verifica se o clique foi no botão de configurações ou em algum elemento dentro dele
    const btn = e.target.closest('#btnConfiguracoes');
    if (btn) {
      e.preventDefault();
      openModal();
    }
  }

  /**
   * Cria e exibe o modal de configurações.
   */
  function openModal() {
    let modalEl = document.getElementById('settingsModal');

    // Se o modal não existir no DOM, cria a estrutura básica
    if (!modalEl) {
      modalEl = document.createElement('div');
      modalEl.id = 'settingsModal';
      modalEl.className = 'modal fade';
      modalEl.tabIndex = '-1';
      modalEl.setAttribute('aria-hidden', 'true');

      modalEl.innerHTML = `
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content" style="border-radius: 16px; border: none; box-shadow: var(--shadow-card); overflow: hidden;">
            <div class="modal-header" style="background-color: var(--c3); color: var(--c1); border-bottom: none; padding: 1.5rem;">
              <h5 class="modal-title" style="font-weight: 700; font-family: var(--font-display);">
                <i class="fa-solid fa-gear me-2"></i>Configurações
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            
            <div class="modal-body" style="padding: 2rem; background-color: var(--c5);">
              <div class="settings-list">
                
                <!-- Item: Dark Mode -->
                <div class="settings-item">
                  <div class="settings-info">
                    <span class="settings-label">Modo Escuro</span>
                    <span class="settings-desc">Reduz o cansaço visual em ambientes de baixa luz.</span>
                  </div>
                  <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" role="switch" id="darkModeSwitch">
                  </div>
                </div>
                <!-- Exemplo de outra configuração futura -->
                <div class="settings-item" style="opacity: 0.6; cursor: not-allowed;">
                  <div class="settings-info">
                    <span class="settings-label">Notificações Desktop</span>
                    <span class="settings-desc">Receber alertas de novas consultas.</span>
                  </div>
                  <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" role="switch" disabled>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer" style="border-top: none; background-color: var(--c5); padding: 1.5rem; justify-content: flex-end;">
              <button type="button" class="btn px-4" data-bs-dismiss="modal" style="background-color: var(--c1); color: #fff; border-radius: 8px; font-weight: 600;">
                Fechar
              </button>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(modalEl);
    }

    // Inicializa e abre o modal usando Bootstrap 5
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();
  }

  return {
    init,
    openModal
  };
})();

// Auto-inicialização ao carregar o script
SettingsComponent.init();
