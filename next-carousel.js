/* Native coverflow: pointer dragging, circular navigation, no cloned research cards. */
(() => {
  'use strict';
  const carousel = document.querySelector('.next-carousel');
  if (!carousel) return;
  const viewport = carousel.querySelector('.next-carousel-viewport');
  const slides = [...carousel.querySelectorAll('.next-slide')];
  const dots = [...carousel.querySelectorAll('[data-slide]')];
  const status = carousel.querySelector('.next-carousel-status');
  const section = carousel.closest('.next-screen');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let current = 1; // Preserve the original left-to-right 01, 02, 03 arrangement.
  let step = 0;
  let gesture = null;
  let suppressClickUntil = 0;
  let frame = 0;
  let wrapFrame = 0;
  const modulo = value => (value + slides.length) % slides.length;
  const position = (index, centre = current) => {
    const relative = modulo(index - centre);
    return relative === slides.length - 1 ? -1 : relative;
  };

  function paint(offset = 0) {
    slides.forEach((slide, index) => {
      const slot = position(index);
      const distance = slot + offset / step;
      const depth = Math.min(Math.abs(distance), 1.8);
      slide.style.setProperty('--slide-x', `${slot * step + offset}px`);
      slide.style.setProperty('--slide-z', `${-90 * depth}px`);
      slide.style.setProperty('--slide-rotate', `${Math.max(-46, Math.min(46, -distance * 34))}deg`);
      slide.style.zIndex = String(10 - Math.round(depth * 4));
      slide.classList.toggle('is-centre', slot === 0);
    });
  }
  function measure() {
    step = slides[0].offsetWidth * .98 + 12;
    paint();
  }
  function select(index) {
    const next = modulo(index);
    const previous = current;
    cancelAnimationFrame(wrapFrame);
    slides.forEach(slide => slide.classList.remove('is-wrapping'));
    if (next !== previous) {
      // The far card is recycled behind the other two instead of crossing the centre.
      slides.forEach((slide, i) => {
        if (Math.abs(position(i, next) - position(i, previous)) > 1) slide.classList.add('is-wrapping');
      });
      current = next;
      section.dispatchEvent(new CustomEvent('next-carousel-change'));
    }
    paint();
    dots.forEach((dot, i) => dot.setAttribute('aria-current', String(i === current)));
    carousel.dataset.currentSlide = String(current);
    status.textContent = `${current + 1} of ${slides.length}: ${slides[current].querySelector('.next-card-title').textContent}`;
    wrapFrame = requestAnimationFrame(() => {
      wrapFrame = requestAnimationFrame(() => slides.forEach(slide => slide.classList.remove('is-wrapping')));
    });
  }

  viewport.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0) return;
    gesture = { id: event.pointerId, x: event.clientX, y: event.clientY, dx: 0, dragging: false };
  });
  viewport.addEventListener('pointermove', event => {
    if (!gesture || gesture.id !== event.pointerId) return;
    const dx = event.clientX - gesture.x;
    const dy = event.clientY - gesture.y;
    if (!gesture.dragging) {
      if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) { gesture = null; return; }
      if (Math.abs(dx) < 8 || Math.abs(dx) <= Math.abs(dy)) return;
      gesture.dragging = true;
      viewport.setPointerCapture(event.pointerId);
      carousel.classList.add('is-dragging');
      section.dispatchEvent(new CustomEvent('next-carousel-dragstart'));
    }
    gesture.dx = Math.max(-step, Math.min(step, dx));
    event.preventDefault();
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => paint(reduced.matches ? 0 : gesture?.dx || 0));
  });
  function release(event) {
    if (!gesture || gesture.id !== event.pointerId) return;
    const finished = gesture;
    gesture = null;
    cancelAnimationFrame(frame);
    carousel.classList.remove('is-dragging');
    if (viewport.hasPointerCapture(event.pointerId)) viewport.releasePointerCapture(event.pointerId);
    if (!finished.dragging) return;
    suppressClickUntil = performance.now() + 300;
    const advance = event.type !== 'pointercancel' && Math.abs(finished.dx) > Math.min(step * .18, 64);
    select(current + (advance ? (finished.dx < 0 ? 1 : -1) : 0));
  }
  viewport.addEventListener('pointerup', release);
  viewport.addEventListener('pointercancel', release);
  viewport.addEventListener('lostpointercapture', release);
  viewport.addEventListener('click', event => {
    if (performance.now() < suppressClickUntil) { event.preventDefault(); event.stopImmediatePropagation(); }
  }, true);
  viewport.addEventListener('dragstart', event => event.preventDefault());
  viewport.addEventListener('keydown', event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    select(current + (event.key === 'ArrowRight' ? 1 : -1));
  });
  dots.forEach((dot, index) => dot.addEventListener('click', () => select(index)));
  carousel.classList.add('carousel-enabled');
  carousel.querySelector('.next-carousel-dots').hidden = false;
  measure();
  select(current);
  new ResizeObserver(measure).observe(viewport);
})();
