/* One archive panel at a time; carousel cards open on click or keyboard focus. */
(() => {
  'use strict';
  const section = document.getElementById('whats-next');
  const cards = [...section.querySelectorAll('.next-card')];
  const panels = cards.map(card => document.getElementById(card.getAttribute('aria-controls')));
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 761px)');
  let active = -1;
  let pinned = false;
  let dismissed = -1;
  let closeTimer;
  let hideTimer;
  let hidingPanel;
  let suppressFocus = false;

  function cancelClose() { clearTimeout(closeTimer); }
  function finishHiding() {
    clearTimeout(hideTimer);
    if (hidingPanel) hidingPanel.hidden = true;
    hidingPanel = null;
  }
  function positionPanel() {
    if (active < 0) return;
    const panel = panels[active];
    const cardRect = cards[active].getBoundingClientRect();
    const margin = 16;
    const width = panel.offsetWidth;
    const height = panel.offsetHeight;
    const left = Math.max(margin, Math.min(innerWidth - width - margin, cardRect.left + cardRect.width / 2 - width / 2));
    let top = cardRect.bottom + 12;
    if (top + height > innerHeight - margin) top = cardRect.top - height - 12;
    if (top < margin) top = (innerHeight - height) / 2;
    panel.style.left = `${left}px`;
    panel.style.top = `${Math.max(margin, Math.min(innerHeight - height - margin, top))}px`;
  }
  function openPanel(index, pin = false) {
    cancelClose();
    finishHiding();
    if (active === index) { pinned ||= pin; return; }
    if (active >= 0) {
      panels[active].classList.remove('is-open');
      panels[active].hidden = true;
      cards[active].classList.remove('is-active');
      cards[active].setAttribute('aria-expanded', 'false');
    }
    active = index;
    pinned = pin;
    const panel = panels[index];
    panel.hidden = false;
    panel.querySelector('.next-panel-body').scrollTop = 0;
    cards[index].classList.add('is-active');
    cards[index].setAttribute('aria-expanded', 'true');
    positionPanel();
    requestAnimationFrame(() => { if (active === index) panel.classList.add('is-open'); });
  }
  function closePanel(restoreFocus = false) {
    if (active < 0) return;
    cancelClose();
    finishHiding();
    const index = active;
    const panel = panels[index];
    active = -1;
    pinned = false;
    dismissed = index;
    panel.classList.remove('is-open');
    cards[index].classList.remove('is-active');
    cards[index].setAttribute('aria-expanded', 'false');
    hidingPanel = panel;
    hideTimer = setTimeout(finishHiding, 200);
    if (restoreFocus) {
      suppressFocus = true;
      cards[index].focus({ preventScroll: true });
      suppressFocus = false;
    }
  }
  function outsidePreview() {
    if (active < 0 || pinned) return;
    const card = cards[active];
    const panel = panels[active];
    const focused = document.activeElement;
    const hovered = canHover.matches && (card.matches(':hover') || panel.matches(':hover'));
    if (!hovered && !card.contains(focused) && !panel.contains(focused)) closePanel();
  }
  function delayClose() {
    cancelClose();
    closeTimer = setTimeout(outsidePreview, 240);
  }
  cards.forEach((card, index) => {
    const panel = panels[index];
    card.addEventListener('pointerenter', () => {
      if (!section.querySelector('.next-carousel') && canHover.matches && dismissed !== index && (!pinned || active === index)) openPanel(index);
    });
    card.addEventListener('pointerleave', () => { if (dismissed === index) dismissed = -1; delayClose(); });
    card.addEventListener('focus', () => {
      if (!suppressFocus && dismissed !== index && card.matches(':focus-visible')) openPanel(index);
    });
    card.addEventListener('click', () => {
      dismissed = -1;
      if (active === index && pinned) closePanel(true);
      else openPanel(index, true);
    });
    card.addEventListener('focusout', delayClose);
    card.addEventListener('keydown', event => {
      if (event.key === 'Tab' && !event.shiftKey && active === index) {
        event.preventDefault();
        panel.querySelector('.next-panel-close').focus();
      }
    });
    panel.addEventListener('pointerenter', cancelClose);
    panel.addEventListener('pointerdown', () => { if (active === index) pinned = true; });
    panel.addEventListener('pointerleave', delayClose);
    panel.addEventListener('focusin', cancelClose);
    panel.addEventListener('focusout', delayClose);
    panel.addEventListener('keydown', event => {
      if (event.key !== 'Tab') return;
      const targets = [...panel.querySelectorAll('button, a, [tabindex]')].filter(target => target.tabIndex >= 0 && target.getClientRects().length);
      if (event.shiftKey && event.target === targets[0]) {
        event.preventDefault();
        cards[index].focus({ preventScroll: true });
      } else if (!event.shiftKey && event.target === targets[targets.length - 1] && index + 1 < cards.length) {
        event.preventDefault();
        closePanel();
        cards[index + 1].focus({ preventScroll: true });
      }
    });
    panel.querySelector('.next-panel-close').addEventListener('click', () => closePanel(true));
  });
  document.addEventListener('pointerdown', event => {
    if (active >= 0 && !cards[active].contains(event.target) && !panels[active].contains(event.target)) closePanel();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && active >= 0) { event.preventDefault(); closePanel(true); }
  });
  section.addEventListener('next-carousel-dragstart', () => closePanel());
  section.addEventListener('next-carousel-change', () => closePanel());
  window.addEventListener('resize', positionPanel);
  window.addEventListener('scroll', () => {
    if (active < 0) return;
    const rect = cards[active].getBoundingClientRect();
    const focused = document.activeElement;
    const hasFocus = cards[active].contains(focused) || panels[active].contains(focused);
    if (!hasFocus && (rect.bottom < 0 || rect.top > innerHeight)) closePanel();
    else positionPanel();
  }, { passive: true });

  const tabs = [...section.querySelectorAll('[role="tab"]')];
  function selectModel(index, focus = false) {
    tabs.forEach((tab, i) => {
      tab.setAttribute('aria-selected', String(i === index));
      tab.tabIndex = i === index ? 0 : -1;
      document.getElementById(tab.getAttribute('aria-controls')).hidden = i !== index;
    });
    if (focus) tabs[index].focus();
    positionPanel();
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectModel(index));
    tab.addEventListener('keydown', event => {
      const target = { ArrowRight: (index + 1) % tabs.length, ArrowLeft: (index + tabs.length - 1) % tabs.length, Home: 0, End: tabs.length - 1 }[event.key];
      if (target !== undefined) { event.preventDefault(); selectModel(target, true); }
    });
  });
})();
