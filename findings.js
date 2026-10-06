/* Vertical page scroll moves the four cards horizontally; no endless loop. */
(() => {
  'use strict';
  const section = document.getElementById('findings');
  const viewport = section.querySelector('.findings-viewport');
  const track = section.querySelector('.findings-track');
  const cards = [...track.children];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let start = 0;
  let end = 0;
  let distance = 1;
  let frame = null;
  let measureNeeded = true;

  function measure() {
    const enabled = !reducedMotion.matches;
    section.classList.toggle('findings-motion', enabled);
    if (!enabled) {
      section.style.removeProperty('height');
      track.style.removeProperty('transform');
      return;
    }
    start = Math.min(200, viewport.clientWidth * .18);
    end = -Math.max(0, track.scrollWidth - viewport.clientWidth);
    distance = Math.max((start - end) * 1.7, window.innerHeight * .9);
    section.style.height = `${window.innerHeight + distance}px`;
  }
  function update() {
    frame = null;
    if (measureNeeded) { measure(); measureNeeded = false; }
    if (reducedMotion.matches) return;
    const progress = Math.max(0, Math.min(1, -section.getBoundingClientRect().top / distance));
    track.style.transform = `translate3d(${start + (end - start) * progress}px, 0, 0)`;
  }
  function schedule(measuring = false) {
    measureNeeded ||= measuring;
    if (frame === null) frame = requestAnimationFrame(update);
  }
  window.addEventListener('scroll', () => schedule(), { passive: true });
  window.addEventListener('resize', () => schedule(true));
  reducedMotion.addEventListener('change', () => schedule(true));
  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(() => schedule(true));
    observer.observe(viewport);
    observer.observe(track);
  }
  cards.forEach(card => card.addEventListener('focus', () => {
    if (reducedMotion.matches) return;
    // Bring keyboard-focused cards into the visible part of the horizontal row.
    viewport.scrollLeft = 0;
    const wanted = Math.max(end, Math.min(start, viewport.clientWidth / 2 - card.offsetLeft - card.offsetWidth / 2));
    const progress = (start - wanted) / (start - end || 1);
    const top = section.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + progress * distance, behavior: 'instant' });
    schedule();
  }));
  schedule(true);
  if (document.fonts?.ready) document.fonts.ready.then(() => schedule(true));
})();
