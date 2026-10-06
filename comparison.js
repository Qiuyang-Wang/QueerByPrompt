(() => {
  'use strict';
  const { identities, ages, relationships, getPair } = PromptComparison;
  const form = document.getElementById('comparison-form');
  const selectors = ['identity', 'age', 'relationship'].map(name => document.getElementById(`comparison-${name}`));
  const generate = document.getElementById('comparison-generate');
  const status = document.getElementById('comparison-status');
  const panels = document.querySelector('.comparison-panels');
  const images = ['baseline', 'modified'].map(name => document.getElementById(`${name}-image`));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let loading = false;

  [identities, ages, relationships].forEach((options, index) => {
    selectors[index].append(...options.map(({ value, label }) => new Option(label, value)));
  });
  function updateControls() {
    selectors.forEach(select => { select.disabled = loading; });
    generate.disabled = loading || selectors.some(select => !select.value);
    generate.querySelectorAll('.button-label, .button-hover-label').forEach(label => {
      label.textContent = loading ? 'Loading…' : 'Generate';
    });
  }
  form.addEventListener('change', updateControls);

  // Load both files before replacing either panel so a failed load cannot mix pairs.
  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = async () => {
        if (typeof image.decode === 'function') await image.decode().catch(() => {});
        resolve(image);
      };
      image.onerror = () => reject(new Error('Image could not be loaded.'));
      image.src = src;
    });
  }
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (loading || selectors.some(select => !select.value)) return;
    const pair = getPair(...selectors.map(select => select.value));
    loading = true;
    panels.setAttribute('aria-busy', 'true');
    status.textContent = 'Loading your comparison…';
    updateControls();
    try {
      await Promise.all([loadImage(pair.baseline), loadImage(pair.modified)]);
      images.forEach((image, index) => {
        image.src = index === 0 ? pair.baseline : pair.modified;
        image.alt = `${index === 0 ? 'Baseline person' : `Modified ${pair.identity}`} image, ${pair.age.toLowerCase()}, ${pair.relationship.toLowerCase()}.`;
        image.hidden = false;
        image.parentElement.querySelector('.comparison-placeholder').hidden = true;
        if (!reducedMotion.matches && typeof image.animate === 'function') {
          image.animate([{ opacity: 0, transform: 'scale(.985)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 420, easing: 'ease-out' });
        }
      });
      status.textContent = 'Choose new words to compare again.';
    } catch {
      status.textContent = 'These images could not be loaded. Please try again.';
    } finally {
      loading = false;
      panels.setAttribute('aria-busy', 'false');
      updateControls();
    }
  });

  updateControls();
})();
