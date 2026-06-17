/* ==============================================================
   SEPTEM RACING — Hotspots Interativos do Carrinho (Tooltip)
   --------------------------------------------------------------
   Módulo independente do viewer 3D. Recebe os eventos de hover
   emitidos pelo robot-viewer.js (onHotspotEnter/Move/Leave) e
   cuida apenas da camada de UI: criar o card, posicioná-lo perto
   da peça, mantê-lo dentro dos limites da janela e animar a
   entrada/saída com fade + scale.

   Não depende de nenhum framework: DOM + CSS puro, no mesmo
   padrão "Dark Luxury Motorsport" do restante do site.
================================================================ */

const HOTSPOT_DATA = {
  motor: {
    name: 'Motor DC',
    description: 'Responsável por gerar a força que movimenta o carrinho. É o componente que transforma energia elétrica em movimento mecânico, fazendo a tração das rodas.',
    icon: 'motor'
  },
  ponteh: {
    name: 'Ponte H',
    description: 'Circuito eletrônico responsável por controlar os motores. Permite alterar a velocidade e inverter o sentido de rotação, possibilitando que o carrinho ande para frente, para trás e faça curvas.',
    icon: 'circuit'
  },
  chassi: {
    name: 'Chassi',
    description: 'Estrutura principal do carrinho. Serve como base para fixação de todos os componentes eletrônicos e mecânicos, sustentando toda a montagem.',
    icon: 'chassis'
  },
  bateria: {
    name: 'Bateria',
    description: 'Fonte de energia do carrinho. Alimenta todos os componentes elétricos, incluindo motores e circuitos eletrônicos.',
    icon: 'battery'
  }
};

const HOTSPOT_ICONS = {
  motor:
    '<svg viewBox="0 0 24 24" fill="none"><circle cx="10" cy="12" r="6.5" stroke="currentColor" stroke-width="1.6"/><path d="M16.5 12h4M19 9.5v5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M7.5 12h5M10 9.5v5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
  circuit:
    '<svg viewBox="0 0 24 24" fill="none"><rect x="5" y="5" width="14" height="14" rx="2" stroke="currentColor" stroke-width="1.6"/><path d="M9 5V2.5M15 5V2.5M9 21.5V19M15 21.5V19M5 9H2.5M5 15H2.5M19 9h2.5M19 15h2.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><circle cx="12" cy="12" r="2.4" stroke="currentColor" stroke-width="1.4"/></svg>',
  chassis:
    '<svg viewBox="0 0 24 24" fill="none"><rect x="3" y="9" width="18" height="6" rx="1.4" stroke="currentColor" stroke-width="1.6"/><circle cx="7" cy="18" r="2.2" stroke="currentColor" stroke-width="1.6"/><circle cx="17" cy="18" r="2.2" stroke="currentColor" stroke-width="1.6"/><path d="M7 16V9M17 16V9" stroke="currentColor" stroke-width="1.4"/></svg>',
  battery:
    '<svg viewBox="0 0 24 24" fill="none"><rect x="3" y="7" width="16" height="10" rx="1.6" stroke="currentColor" stroke-width="1.6"/><path d="M21 10v4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M7.5 9.5v5M11.5 9.5v5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>'
};

/**
 * Cria e gerencia o tooltip de hotspots para um viewer 3D criado por
 * createRobotViewer(). Retorna uma API mínima { dispose() } para que o
 * chamador possa limpar tudo junto com o viewer.
 *
 * @param {HTMLElement} container  Elemento que envolve o canvas do viewer
 *                                  (mesmo container passado a createRobotViewer)
 * @param {object} viewer          Objeto retornado por createRobotViewer()
 * @param {object} [data]          Mapa opcional hotspotId -> { name, description, icon }
 */
function createHotspotTooltip(container, viewer, data = HOTSPOT_DATA) {
  if (!container || !viewer) {
    throw new Error('createHotspotTooltip precisa de um container e de um viewer.');
  }

  // O container do viewer já é position:relative no CSS do projeto
  // (#robot-viewer ocupa 100% do .carro-viewer). Garantimos aqui também,
  // sem sobrescrever nada que já exista.
  const computedPosition = window.getComputedStyle(container).position;
  if (computedPosition === 'static') {
    container.style.position = 'relative';
  }

  const tooltip = document.createElement('div');
  tooltip.className = 'hotspot-tooltip';
  tooltip.setAttribute('role', 'status');
  tooltip.setAttribute('aria-live', 'polite');
  tooltip.innerHTML = `
    <div class="hotspot-tooltip__icon" aria-hidden="true"></div>
    <div class="hotspot-tooltip__body">
      <p class="hotspot-tooltip__name"></p>
      <p class="hotspot-tooltip__desc"></p>
    </div>
  `;
  container.appendChild(tooltip);

  const iconEl = tooltip.querySelector('.hotspot-tooltip__icon');
  const nameEl = tooltip.querySelector('.hotspot-tooltip__name');
  const descEl = tooltip.querySelector('.hotspot-tooltip__desc');

  let visible = false;
  let currentId = null;
  let hideTimeout = null;

  const MARGIN = 14; // distância mínima até a borda do container/janela

  function showForHotspot(id) {
    const info = data[id];
    if (!info) return;

    if (hideTimeout) {
      clearTimeout(hideTimeout);
      hideTimeout = null;
    }

    if (currentId !== id) {
      currentId = id;
      nameEl.textContent = info.name;
      descEl.textContent = info.description;
      iconEl.innerHTML = HOTSPOT_ICONS[info.icon] || '';
    }

    if (!visible) {
      visible = true;
      // Força reflow antes de adicionar a classe para garantir a transição
      // mesmo quando o card estava totalmente oculto (display fica sempre
      // em flex; o controle é só opacity/transform, ver CSS).
      tooltip.classList.add('is-visible');
    }
  }

  function hide() {
    if (!visible) return;
    visible = false;
    currentId = null;
    tooltip.classList.remove('is-visible');
  }

  function positionAt(screenPoint) {
    const containerRect = container.getBoundingClientRect();

    // Posição desejada relativa ao container (a peça ancora o canto
    // inferior-esquerdo do card, com um pequeno deslocamento).
    let left = screenPoint.x - containerRect.left + 18;
    let top = screenPoint.y - containerRect.top - 18;

    // Mede o card já renderizado para aplicar o clamp corretamente.
    const tw = tooltip.offsetWidth || 260;
    const th = tooltip.offsetHeight || 90;

    const maxLeft = containerRect.width - tw - MARGIN;
    const maxTop = containerRect.height - th - MARGIN;

    if (left > maxLeft) left = screenPoint.x - containerRect.left - tw - 18;
    if (left < MARGIN) left = MARGIN;
    if (left > maxLeft) left = Math.max(MARGIN, maxLeft);

    if (top < MARGIN) top = screenPoint.y - containerRect.top + 18;
    if (top > maxTop) top = Math.max(MARGIN, maxTop);

    tooltip.style.setProperty('--hotspot-x', `${Math.round(left)}px`);
    tooltip.style.setProperty('--hotspot-y', `${Math.round(top)}px`);
  }

  viewer.onHotspotEnter((id) => {
    showForHotspot(id);
  });

  viewer.onHotspotMove((id, screenPoint) => {
    showForHotspot(id);
    positionAt(screenPoint);
  });

  viewer.onHotspotLeave(() => {
    hide();
  });

  return {
    dispose() {
      if (hideTimeout) clearTimeout(hideTimeout);
      tooltip.remove();
    }
  };
}
