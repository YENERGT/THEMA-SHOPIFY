class DetailsModal extends HTMLElement {
  constructor() {
    super();
    this.detailsContainer = this.querySelector('details');
    this.summaryToggle = this.querySelector('summary');

    this.detailsContainer.addEventListener('keyup', (event) => event.code.toUpperCase() === 'ESCAPE' && this.close());
    this.summaryToggle.addEventListener('click', this.onSummaryClick.bind(this));
    this.querySelector('button[type="button"]').addEventListener('click', this.close.bind(this));

    this.summaryToggle.setAttribute('role', 'button');
  }

  isOpen() {
    return this.detailsContainer.hasAttribute('open');
  }

  onSummaryClick(event) {
  event.preventDefault();
  
  const isCurrentlyOpen = event.target.closest('details').hasAttribute('open');
  
  if (isCurrentlyOpen) {
    this.close();
  } else {
    // Detectar si es móvil
    const isMobile = window.innerWidth <= 990 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      // EN MÓVIL: NUNCA abrir modal nativo, SOLO activar Searchanise
      this.activateSearchaniseOnly();
    } else {
      // Desktop: abrir modal nativo normalmente
      this.open(event);
    }
  }
}

activateSearchaniseOnly() {
  console.log('🎯 ACTIVANDO SOLO SEARCHANISE - Bloqueando modal nativo');
  
  // ESTRATEGIA: Buscar y activar directamente cualquier elemento de Searchanise
  
  // 1. BUSCAR INPUTS DE SEARCHANISE
  const searchaniseInputSelectors = [
    'input[data-searchanise-input]',
    'input[data-widget-id]',
    'input[id*="searchanise"]',
    'input[class*="searchanise"]',
    'input[name*="searchanise"]',
    '.searchanise-widget input[type="search"]',
    '.searchanise-widget input[type="text"]',
    '.searchanise-input',
    '.widget-search-input',
    '[data-search-widget] input',
    'input[placeholder*="search" i]:not([name="q"]):not(.search__input)',
    'input[data-snize]',
    'input[data-instant-search]'
  ];
  
  for (let selector of searchaniseInputSelectors) {
    const inputs = document.querySelectorAll(selector);
    for (let input of inputs) {
      if (input.offsetParent !== null) { // visible
        console.log('✅ Searchanise INPUT encontrado y activado:', selector);
        input.focus();
        input.click();
        
        // Disparar múltiples eventos para asegurar activación
        ['focus', 'click', 'mousedown', 'mouseup', 'touchstart'].forEach(eventType => {
          input.dispatchEvent(new Event(eventType, { bubbles: true }));
        });
        
        return; // ÉXITO - Input de Searchanise activado
      }
    }
  }
  
  // 2. BUSCAR BOTONES/WIDGETS DE SEARCHANISE
  const searchaniseButtonSelectors = [
    'button[data-searchanise]',
    'button[class*="searchanise"]',
    '.searchanise-widget',
    '.searchanise-search-button',
    '.searchanise-button',
    '[data-search-widget]',
    '.search-widget-trigger',
    '.widget-search-button',
    '[data-widget-open]',
    '[data-snize-trigger]',
    '.snize-search-trigger'
  ];
  
  for (let selector of searchaniseButtonSelectors) {
    const buttons = document.querySelectorAll(selector);
    for (let button of buttons) {
      if (button.offsetParent !== null) { // visible
        console.log('✅ Searchanise WIDGET encontrado y activado:', selector);
        button.click();
        
        // Disparar eventos adicionales
        button.dispatchEvent(new Event('click', { bubbles: true }));
        button.dispatchEvent(new Event('mousedown', { bubbles: true }));
        button.dispatchEvent(new Event('mouseup', { bubbles: true }));
        
        return; // ÉXITO - Widget de Searchanise activado
      }
    }
  }
  
  // 3. DISPARAR EVENTOS GLOBALES DE SEARCHANISE
  const searchaniseEvents = [
    'searchanise:open',
    'searchanise-open',
    'searchanise_open',
    'widget:search:open',
    'search:widget:activate',
    'searchanise_search_open',
    'snize:open',
    'instant-search:open'
  ];
  
  searchaniseEvents.forEach(eventName => {
    document.dispatchEvent(new CustomEvent(eventName, { 
      bubbles: true,
      detail: { source: 'mobile-direct-activation' }
    }));
    
    // También disparar en window por si acaso
    if (window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent(eventName, { 
        bubbles: true,
        detail: { source: 'mobile-direct-activation' }
      }));
    }
  });
  
  console.log('📡 Eventos de Searchanise disparados');
  
  // 4. INTENTAR APIS DE SEARCHANISE
  const searchaniseAPIs = [
    () => window.searchaniseApi && window.searchaniseApi.openSearch && window.searchaniseApi.openSearch(),
    () => window.SearchaniseWidget && window.SearchaniseWidget.open && window.SearchaniseWidget.open(),
    () => window.SearchaniseWidget && window.SearchaniseWidget.show && window.SearchaniseWidget.show(),
    () => window.snize && window.snize.openSearch && window.snize.openSearch(),
    () => window.searchWidget && window.searchWidget.show && window.searchWidget.show(),
    () => window.searchWidget && window.searchWidget.open && window.searchWidget.open(),
    () => window.InstantSearch && window.InstantSearch.open && window.InstantSearch.open(),
    () => window.jQuery && window.jQuery('.searchanise-widget').trigger && window.jQuery('.searchanise-widget').trigger('click')
  ];
  
  for (let apiCall of searchaniseAPIs) {
    try {
      if (apiCall && apiCall()) {
        console.log('✅ Searchanise API activada exitosamente');
        return; // ÉXITO - API activada
      }
    } catch (e) {
      // Ignorar errores y continuar con siguiente API
    }
  }
  
  // 5. FALLBACK: Buscar cualquier input de búsqueda que no sea el nativo
  const fallbackInputs = document.querySelectorAll('input[type="search"]:not([name="q"]):not(.search__input)');
  for (let input of fallbackInputs) {
    if (input.offsetParent !== null) {
      console.log('✅ Input de búsqueda alternativo encontrado:', input);
      input.focus();
      input.click();
      return;
    }
  }
  
  // 6. ÚLTIMO RECURSO: Informar y no hacer nada (no abrir modal nativo)
  console.log('⚠️ No se encontró Searchanise - Bloqueando modal nativo');
  
  // Mostrar mensaje temporal al usuario
  this.showSearchaniseNotAvailableMessage();
}


showSearchaniseNotAvailableMessage() {
  // Mostrar mensaje temporal si Searchanise no está disponible
  const message = document.createElement('div');
  message.style.cssText = `
    position: fixed;
    top: 50px;
    left: 50%;
    transform: translateX(-50%);
    background: #334fb4;
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    z-index: 10000;
    font-size: 14px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  `;
  message.innerHTML = 'Buscador no disponible, intenta de nuevo en un momento';
  
  document.body.appendChild(message);
  
  // Remover mensaje después de 3 segundos
  setTimeout(() => {
    if (message.parentNode) {
      message.parentNode.removeChild(message);
    }
  }, 3000);
}


  onBodyClick(event) {
    if (!this.contains(event.target) || event.target.classList.contains('modal-overlay')) this.close(false);
  }

  open(event) {
    this.onBodyClickEvent = this.onBodyClickEvent || this.onBodyClick.bind(this);
    event.target.closest('details').setAttribute('open', true);
    document.body.addEventListener('click', this.onBodyClickEvent);
    document.body.classList.add('overflow-hidden');

    trapFocus(
      this.detailsContainer.querySelector('[tabindex="-1"]'),
      this.detailsContainer.querySelector('input:not([type="hidden"])')
    );
  }

  close(focusToggle = true) {
    removeTrapFocus(focusToggle ? this.summaryToggle : null);
    this.detailsContainer.removeAttribute('open');
    document.body.removeEventListener('click', this.onBodyClickEvent);
    document.body.classList.remove('overflow-hidden');
  }
}

customElements.define('details-modal', DetailsModal);
