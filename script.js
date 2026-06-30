const lines = Array.from(document.querySelectorAll('.line'));
const trackerLetters = document.getElementById('trackerLetters');
const tracker = document.getElementById('tracker');

// build tracker letter placeholders, inserting a space
// whenever a new stanza (new paragraph) begins
let prevStanza = null;
lines.forEach((line, i) => {
  const ch = line.dataset.letter;
  const stanza = line.closest('.stanza').dataset.stanza;

  if (prevStanza !== null && stanza !== prevStanza) {
    const tSpace = document.createElement('span');
    tSpace.textContent = '\u00A0';
    tSpace.classList.add('space');
    trackerLetters.appendChild(tSpace);
  }
  prevStanza = stanza;

  const tSpan = document.createElement('span');
  tSpan.textContent = ch;
  tSpan.dataset.index = i;
  trackerLetters.appendChild(tSpan);
});

let lastY = window.scrollY;
let scrollDir = 'down';
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  if (Math.abs(y - lastY) > 2) {
    scrollDir = y > lastY ? 'down' : 'up';
    lastY = y;
  }
}, { passive: true });

const collected = new Set();

const lineObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    const idx = lines.indexOf(entry.target);
    const t = trackerLetters.querySelector(`span[data-index="${idx}"]`);

    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      collected.add(idx);
      if (t) t.classList.add('in');
    } else if (scrollDir === 'up') {
      entry.target.classList.remove('visible');
      collected.delete(idx);
      if (t) t.classList.remove('in');
    }

    tracker.classList.toggle('show', collected.size > 0);
  });
}, { threshold: 0.55 });

lines.forEach(l => lineObserver.observe(l));

// Register the service worker so the page is installable and works offline.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js').catch((err) => {
      console.warn('Service worker registration failed:', err);
    });
  });
}
