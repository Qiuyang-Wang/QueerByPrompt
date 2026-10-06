/* State lasts only for this visit. Refreshing starts a new activity. */
(() => {
  'use strict';
  const { rounds, categories, scoreRound, reflection } = BlindGuess;
  const maxSelection = 5;
  let currentRound = 0;
  let selected = new Set();
  let transitioning = false;
  let initialEntrance = Promise.resolve();
  const activeAnimations = new Set();
  const responses = [];
  const screen = document.getElementById('blind-guess');
  const activity = document.getElementById('activity');
  const results = document.getElementById('results');
  const stage = document.getElementById('portrait-stage');
  const keywords = document.getElementById('keywords');
  const portrait = document.getElementById('portrait-image');
  const nextButton = document.getElementById('next-button');
  const count = document.getElementById('selection-count');
  const help = document.getElementById('selection-help');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function updateSelection() {
    count.replaceChildren(document.createTextNode('Selected: '), element('strong', '', String(selected.size)), document.createTextNode(' / 5'));
    help.textContent = selected.size === maxSelection ? 'Five words selected. Remove one to choose another.' : 'Choose a prompt word. Click again to remove it.';
    for (const button of keywords.children) {
      const active = selected.has(button.dataset.word);
      button.setAttribute('aria-pressed', String(active));
      button.disabled = transitioning || (!active && selected.size === maxSelection);
    }
    nextButton.disabled = transitioning || selected.size === 0;
  }

  function renderRound() {
    const round = rounds[currentRound];
    const number = String(currentRound + 1).padStart(2, '0');
    portrait.src = round.image;
    portrait.alt = round.alt;
    const progress = document.getElementById('round-progress');
    progress.replaceChildren(document.createTextNode(`${number} `), element('span', '', '/ 03'));
    progress.setAttribute('aria-label', `Round ${currentRound + 1} of 3`);
    document.querySelectorAll('.progress-marks span').forEach((mark, index) => {
      mark.className = index === currentRound ? 'current' : index < currentRound ? 'done' : '';
    });
    const buttonText = currentRound === rounds.length - 1 ? 'See results' : 'Next';
    document.getElementById('next-label').textContent = buttonText;
    nextButton.querySelector('.button-hover-label').textContent = buttonText;
    nextButton.classList.toggle('is-final', currentRound === rounds.length - 1);
    keywords.replaceChildren(...round.keywords.map(({ word }) => {
      const button = element('button', 'keyword');
      button.type = 'button';
      button.dataset.word = word;
      button.setAttribute('aria-label', word);
      const label = element('span', 'keyword-label');
      label.setAttribute('aria-hidden', 'true');
      label.append(...Array.from(word, (character, index) => {
        const letter = element('span', 'keyword-letter', character === ' ' ? '\u00a0' : character);
        letter.style.setProperty('--wave-delay', `${index * 22}ms`);
        return letter;
      }));
      button.append(label);
      button.setAttribute('aria-pressed', 'false');
      button.addEventListener('click', () => {
        if (transitioning) return;
        if (selected.has(word)) selected.delete(word);
        else if (selected.size < maxSelection) selected.add(word);
        updateSelection();
      });
      return button;
    }));
    updateSelection();
  }

  async function animateNode(node, frames, timing) {
    if (reducedMotion.matches || typeof node.animate !== 'function') return;
    const animation = node.animate(frames, { fill: 'both', ...timing });
    activeAnimations.add(animation);
    try { await animation.finished; }
    catch (error) { if (error.name !== 'AbortError') throw error; }
    finally { activeAnimations.delete(animation); animation.cancel(); }
  }

  function photoEntrance() {
    // +24° to 0° rotates counterclockwise, from lower-right to the centre.
    return animateNode(portrait, [
      { opacity: 0, transform: 'translate(125px, 115px) rotate(24deg) scale(.68)', filter: 'blur(12px)' },
      { opacity: 1, transform: 'translate(0, 0) rotate(0deg) scale(1)', filter: 'blur(0px)' }
    ], { duration: 650, easing: 'cubic-bezier(.16, 1, .3, 1)' });
  }

  function fadeRoundOut() {
    return Promise.all([
      animateNode(portrait, [
        { opacity: 1, transform: 'translate(0, 0) rotate(0deg) scale(1)', filter: 'blur(0px)' },
        { opacity: 0, transform: 'translate(-130px, 120px) rotate(-26deg) scale(.62)', filter: 'blur(12px)' }
      ], { duration: 420, easing: 'cubic-bezier(.55, 0, .85, .4)' }),
      animateNode(keywords, [{ opacity: 1, offset: 0 }, { opacity: 0, offset: .62 }, { opacity: 0, offset: 1 }], { duration: 420, easing: 'ease-in' }),
      animateNode(document.getElementById('round-progress'), [{ opacity: 1, offset: 0 }, { opacity: 0, offset: .62 }, { opacity: 0, offset: 1 }], { duration: 420, easing: 'ease-in' })
    ]);
  }

  function fadeRoundIn() {
    return Promise.all([
      photoEntrance(),
      animateNode(keywords, [{ opacity: 0 }, { opacity: 1 }], { duration: 380, delay: 100, easing: 'ease-out' }),
      animateNode(document.getElementById('round-progress'), [{ opacity: 0 }, { opacity: 1 }], { duration: 380, delay: 100, easing: 'ease-out' })
    ]);
  }

  function preparePortraitEntrance() {
    if (reducedMotion.matches || !('IntersectionObserver' in window)) return;
    portrait.classList.add('photo-awaiting');
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      portrait.classList.remove('photo-awaiting');
      if (!transitioning) initialEntrance = photoEntrance();
      observer.disconnect();
    }, { threshold: .25 });
    observer.observe(stage);
    reducedMotion.addEventListener('change', event => {
      if (event.matches) {
        portrait.classList.remove('photo-awaiting');
        observer.disconnect();
      }
    });
  }

  reducedMotion.addEventListener('change', event => {
    if (event.matches) activeAnimations.forEach(animation => animation.cancel());
  });

  function reviewRound(round, response, index) {
    const review = element('article', 'round-review');
    const figure = element('figure');
    const image = element('img', 'review-image');
    image.src = round.image;
    image.alt = round.alt;
    image.loading = 'lazy';
    figure.append(image);
    const body = element('div');
    const heading = element('div', 'review-heading');
    heading.append(element('h3', '', `Your choices · Portrait 0${index + 1}`), element('span', 'review-score', `${response.score} / 10`));
    const choices = element('ul', 'choice-list');
    for (const word of response.words) {
      const item = round.keywords.find(item => item.word === word);
      const category = categories[item.type];
      const choice = element('li', 'choice-item');
      const points = category.points > 0 ? '+2' : String(category.points).replace('-', '−');
      const explanation = index === 2 && word === 'artist' ? "This cannot be confirmed from the main subject’s appearance alone." : category.explanation;
      const separator = item.type === 'interpretation' ? ' · ' : ' ';
      choice.append(element('span', 'choice-word', word), element('span', `choice-category ${item.type}`, `${category.label}${separator}${points}`), element('span', 'choice-explanation', explanation));
      choices.append(choice);
    }
    body.append(heading, choices);
    review.append(figure, body);
    return review;
  }

  function showResults() {
    const total = responses.reduce((sum, response) => sum + response.score, 0);
    const message = reflection(total);
    document.getElementById('total-score').textContent = String(total);
    document.getElementById('reflection-title').textContent = message.title;
    document.getElementById('reflection-text').textContent = message.text;
    const reviews = document.getElementById('round-reviews');
    reviews.replaceChildren(element('p', 'scoring-note', 'Visible +2 · Assumption 0 · Interpretation 0 · Not supported −1. Each portrait is scored from 0 to 10.'));
    rounds.forEach((round, index) => reviews.append(reviewRound(round, responses[index], index)));
    const contexts = document.getElementById('prompt-contexts');
    contexts.replaceChildren(...rounds.map((round, index) => {
      const item = element('article', 'prompt-item');
      item.append(element('h3', '', `Image 0${index + 1} AI prompt context`), element('p', '', round.prompt));
      return item;
    }));
    activity.hidden = true;
    results.hidden = false;
    results.classList.add('enter');
    screen.setAttribute('aria-labelledby', 'results-title');
    moveToScreen('results-title');
  }

  function moveToScreen(titleId) {
    document.getElementById(titleId).focus({ preventScroll: true });
    screen.scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'start' });
  }

  nextButton.addEventListener('click', async () => {
    if (transitioning || selected.size === 0 || responses.length !== currentRound) return;
    transitioning = true;
    activity.setAttribute('aria-busy', 'true');
    updateSelection();
    const words = [...selected];
    responses.push({ words, score: scoreRound(rounds[currentRound], words) });
    try {
      if (currentRound < rounds.length - 1) {
        const image = new Image();
        image.src = rounds[currentRound + 1].image;
        await image.decode().catch(() => {});
      }
      await initialEntrance;
      await fadeRoundOut();
      if (currentRound === rounds.length - 1) showResults();
      else {
        currentRound += 1;
        selected = new Set();
        renderRound();
        moveToScreen('page-title');
        await fadeRoundIn();
      }
    } finally {
      transitioning = false;
      activity.removeAttribute('aria-busy');
      updateSelection();
    }
  });

  // Deliberately no click handler or route for the future comparison section.
  renderRound();
  preparePortraitEntrance();
  rounds.slice(1).forEach(round => { const image = new Image(); image.src = round.image; });
})();
