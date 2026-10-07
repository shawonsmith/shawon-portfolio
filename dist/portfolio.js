const motionButton = document.getElementById('motion');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
function syncMotion() {
  const paused = document.body.classList.contains('paused');
  motionButton.setAttribute('aria-pressed', String(paused));
  motionButton.textContent = paused ? 'Resume animation ▶' : 'Pause animation Ⅱ';
}
if (reducedMotion.matches) { motionButton.hidden = true; }
motionButton.addEventListener('click', () => { document.body.classList.toggle('paused'); syncMotion(); });
reducedMotion.addEventListener('change', (event) => { motionButton.hidden = event.matches; });
syncMotion();
