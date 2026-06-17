(function () {
  'use strict';

  // ------------------------------------------------------------
  // Ícones (SVG outline, 24x24, herda a cor via "currentColor")
  // ------------------------------------------------------------
  var ICONS = {
    success:
      '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/>' +
      '<path d="M8 12.5l2.5 2.5L16 9.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
      '</svg>',
    error:
      '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/>' +
      '<path d="M9.5 9.5l5 5M14.5 9.5l-5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' +
      '</svg>',
    warning:
      '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="M12 3.5l9 16H3l9-16z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>' +
      '<path d="M12 10v4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' +
      '<circle cx="12" cy="17" r="0.9" fill="currentColor"/>' +
      '</svg>',
    info:
      '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/>' +
      '<path d="M12 11v5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' +
      '<circle cx="12" cy="8" r="0.9" fill="currentColor"/>' +
      '</svg>',
    close:
      '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' +
      '</svg>'
  };

  var VALID_TYPES = ['success', 'error', 'warning', 'info'];

  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  // Encontra (ou cria) o container de toasts.
  // Suporta os dois IDs já usados historicamente no projeto
  // ("toastContainer" em login/cadastro e "toast-container" nas demais páginas),
  // garantindo compatibilidade total sem precisar editar HTML existente.
  function getContainer() {
    var c = document.getElementById('toastContainer') ||
      document.getElementById('toast-container');

    if (!c) {
      c = document.createElement('div');
      c.id = 'toast-container';
      c.className = 'toast-container';
      document.body.appendChild(c);
    } else if (!c.classList.contains('toast-container')) {
      c.classList.add('toast-container');
    }
    return c;
  }

  /**
   * Exibe uma notificação (toast) modernizada.
   * Mantém a assinatura usada em todo o projeto: showToast(msg, type)
   *
   * @param {string} msg     Mensagem a exibir.
   * @param {string} type    'success' | 'error' | 'warning' | 'info'
   * @param {number} [duration=3800]  Tempo em ms até o fechamento automático.
   */
  function showToast(msg, type, duration) {
    type = VALID_TYPES.indexOf(type) !== -1 ? type : 'success';
    duration = typeof duration === 'number' ? duration : 3800;

    var container = getContainer();

    var toastEl = document.createElement('div');
    toastEl.className = 'toast ' + type;
    toastEl.setAttribute('role', type === 'error' ? 'alert' : 'status');
    toastEl.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');

    toastEl.innerHTML =
      '<span class="toast-icon">' + ICONS[type] + '</span>' +
      '<span class="toast-message">' + escapeHtml(msg) + '</span>' +
      '<button type="button" class="toast-close" aria-label="Fechar notificação">' + ICONS.close + '</button>';

    container.appendChild(toastEl);

    var dismissed = false;
    function dismiss() {
      if (dismissed) return;
      dismissed = true;
      toastEl.classList.add('toast-leaving');
      toastEl.addEventListener('animationend', function () {
        if (toastEl.parentNode) toastEl.parentNode.removeChild(toastEl);
      }, { once: true });
      // fallback de segurança, caso o evento de animação não dispare
      setTimeout(function () {
        if (toastEl.parentNode) toastEl.parentNode.removeChild(toastEl);
      }, 500);
    }

    toastEl.querySelector('.toast-close').addEventListener('click', dismiss);

    var autoCloseTimer = setTimeout(dismiss, duration);

    // Pausa a auto-remoção enquanto o usuário interage com o toast
    toastEl.addEventListener('mouseenter', function () {
      clearTimeout(autoCloseTimer);
    });
    toastEl.addEventListener('mouseleave', function () {
      autoCloseTimer = setTimeout(dismiss, 1200);
    });

    return toastEl;
  }

  // Exposto globalmente com os dois nomes já usados nas páginas do projeto,
  // sem precisar alterar nenhuma chamada existente:
  //   - showToast(msg, type)  -> usado em login.html e cadastro.html
  //   - toast(msg, type)      -> usado em dashboard, corredores, ranking, estatisticas
  window.showToast = showToast;
  window.toast = showToast;

})();
