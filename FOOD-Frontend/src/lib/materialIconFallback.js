const fallbackSymbols = {
  air: '~',
  arrow_back: '<',
  cannabis: '*',
  cancel: 'x',
  check_circle: '✓',
  chevron_left: '<',
  circle: 'o',
  close: 'x',
  eco: '◇',
  explore: '⌖',
  fastfood: '≡',
  favorite: '♥',
  history: '↺',
  home: '⌂',
  hot_tub: '♨',
  icecream: '◇',
  kebab_dining: '⋮',
  local_bar: '◡',
  local_fire_department: '♨',
  location_off: '⊘',
  location_on: '⌖',
  lunch_dining: '▰',
  nutrition: '◌',
  outdoor_grill: '≋',
  person: '◉',
  person_off: '⊘',
  place: '⌖',
  ramen_dining: '♨',
  refresh: '↻',
  restaurant: '▣',
  restaurant_menu: '▣',
  rice_bowl: '▱',
  rocket_launch: '▲',
  set_meal: '◈',
  sound_detection_dog_barking: '!',
  star: '★',
  store_off: '□',
  swipe: '⇄',
  vitals: '≈',
};

function syncIconNode(node) {
  if (!(node instanceof HTMLElement) || !node.classList.contains('material-symbols-outlined')) {
    return;
  }

  const iconName = (node.dataset.icon || node.textContent || '').trim();
  if (!iconName) return;

  node.dataset.icon = iconName;
  node.dataset.fallbackIcon = fallbackSymbols[iconName] || '•';
}

function syncTree(root = document) {
  if (root instanceof HTMLElement) {
    syncIconNode(root);
  }

  root.querySelectorAll?.('.material-symbols-outlined').forEach(syncIconNode);
}

function enableFallbackIfNeeded() {
  const fonts = document.fonts;
  const hasMaterialSymbols = fonts?.check?.('24px "Material Symbols Outlined"');

  if (!hasMaterialSymbols) {
    document.documentElement.classList.add('icons-font-missing');
  }
}

export function installMaterialIconFallback() {
  syncTree();
  enableFallbackIfNeeded();

  document.fonts?.ready.then(enableFallbackIfNeeded).catch(enableFallbackIfNeeded);
  window.setTimeout(enableFallbackIfNeeded, 1200);

  const observer = new MutationObserver((records) => {
    for (const record of records) {
      record.addedNodes.forEach((node) => {
        if (node instanceof HTMLElement) {
          syncTree(node);
        }
      });
    }
  });

  observer.observe(document.documentElement, { childList: true, subtree: true });
}
