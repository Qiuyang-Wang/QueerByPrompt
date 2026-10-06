/* Repeatable, reversible gradual-spacing titles driven by native page scroll. */
(() => {
  'use strict';
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const titles = ['page-title', 'comparison-title', 'findings-title', 'whats-next-title']
    .map(id => document.getElementById(id)).filter(Boolean);

  titles.forEach(title => {
    const text = title.textContent.trim();
    title.setAttribute('aria-label', text);
    let index = 0;
    const content = [];
    text.split(/\s+/).forEach((word, wordIndex) => {
      if (wordIndex) { content.push(document.createTextNode(' ')); index += 1; }
      const group = document.createElement('span');
      group.className = 'title-word';
      group.setAttribute('aria-hidden', 'true');
      for (const character of word) {
        const letter = document.createElement('span');
        letter.className = 'title-letter';
        letter.textContent = character;
        letter.style.setProperty('--letter-delay', `${index++ * 40}ms`);
        group.append(letter);
      }
      content.push(group);
    });
    title.replaceChildren(...content);
    title.classList.add('title-animated');
  });

  let frame = null;
  function update() {
    frame = null;
    titles.forEach(title => {
      const rect = title.getBoundingClientRect();
      // Leave room below for the reverse stagger to remain visible on an upward scroll.
      // Above the viewport, reset so scrolling back down through the heading also replays.
      const visible = motion.matches ||
        (rect.height > 0 && rect.top + rect.height / 2 < window.innerHeight * .78 && rect.bottom > 0);
      title.classList.toggle('is-visible', visible);
    });
  }
  function schedule() {
    if (frame === null) frame = requestAnimationFrame(update);
  }
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  motion.addEventListener('change', schedule);
  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(schedule);
    titles.forEach(title => observer.observe(title));
  }
  // Commit the hidden letter styles before the first reveal (including direct hash links).
  requestAnimationFrame(schedule);
  if (document.fonts?.ready) document.fonts.ready.then(schedule);
})();
