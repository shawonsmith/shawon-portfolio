(() => {
  'use strict';

  const iframe = document.getElementById('shawon-hero-frame');
  const root = document.getElementById('root');
  if (!iframe || !root || document.getElementById('shawon-transition')) return;

  const reduce = matchMedia('(prefers-reduced-motion: reduce)');

  // Create overlay layer
  const layer = document.createElement('div');
  layer.id = 'shawon-transition';
  layer.hidden = true;
  layer.setAttribute('aria-hidden', 'true');
  layer.innerHTML = `
    <div class="st-actor">
      <img class="st-pose st-flight" alt="" draggable="false">
      <img class="st-pose st-crouch" src="assets/characters/shawon-crouch-900x1600-v2.png" alt="" draggable="false">
      <div class="st-greeting">
        <img class="st-pose st-wave-body" src="assets/characters/shawon-wave-v3.png" alt="" draggable="false">
        <img class="st-pose st-wave-hand" src="assets/characters/shawon-wave-v3.png" alt="" draggable="false">
      </div>
    </div>
    <div class="st-impact">THUD!</div>
    <svg class="st-shockwave" viewBox="0 0 160 50" width="180" height="50">
      <path d="M12,42 Q45,28 80,38" stroke="#ef2437" stroke-width="4" stroke-linecap="round" fill="none" />
      <path d="M148,42 Q115,28 80,38" stroke="#ef2437" stroke-width="4" stroke-linecap="round" fill="none" />
      <circle cx="80" cy="38" r="4" fill="#ef2437" />
    </svg>
    <div class="st-speech" role="dialog" aria-label="Shawon greeting">
      <div class="st-bubble-tag">👋 DHAKA IT SUPPORT</div>
      <div class="st-bubble-text" id="st-bubble-title">Hey there! I'm Shawon Khan.</div>
      <div class="st-bubble-sub" id="st-bubble-desc">Your Friendly Neighborhood IT Guy — keeping systems 100% operational!</div>
      <div class="st-bubble-hint">
        <span>💬 Tap to switch tip</span>
        <span style="color:#059669">● Live</span>
      </div>
    </div>
  `;
  document.body.append(layer);

  const actor = layer.querySelector('.st-actor');
  const flight = layer.querySelector('.st-flight');
  const crouch = layer.querySelector('.st-crouch');
  const greeting = layer.querySelector('.st-greeting');
  const impact = layer.querySelector('.st-impact');
  const shockwave = layer.querySelector('.st-shockwave');
  const speech = layer.querySelector('.st-speech');
  const bubbleTitle = document.getElementById('st-bubble-title');
  const bubbleDesc = document.getElementById('st-bubble-desc');

  const quotes = [
    { title: "Hey there! I'm Shawon Khan.", desc: "Your Friendly Neighborhood IT Guy — keeping systems 100% operational!" },
    { title: "🖥️ PC slow or Windows crashing?", desc: "I diagnose hardware, optimize Windows OS, and eliminate bottlenecks." },
    { title: "🌐 Wi-Fi dead zones or drops?", desc: "Routers, switches, and structured LAN cables configured flawlessly." },
    { title: "⚡ Remote IT Support anywhere!", desc: "AnyDesk or TeamViewer ready to rescue your workflow in minutes." }
  ];
  let quoteIdx = 0;

  speech.addEventListener('click', (e) => {
    e.stopPropagation();
    quoteIdx = (quoteIdx + 1) % quotes.length;
    speech.style.transform = speech.style.transform.replace(/scale\([^)]+\)/, 'scale(0.92)');
    setTimeout(() => {
      bubbleTitle.innerText = quotes[quoteIdx].title;
      bubbleDesc.innerText = quotes[quoteIdx].desc;
      speech.style.transform = speech.style.transform.replace(/scale\([^)]+\)/, 'scale(1)');
    }, 120);
  });

  const clamp = (n, a = 0, b = 1) => Math.max(a, Math.min(b, n));
  const mix = (a, b, t) => a + (b - a) * t;

  let about = null;
  let bridge = null;
  let snapshot = null;
  let startScroll = 0;
  let progress = 0;
  let raf = 0;
  let previousTime = 0;
  let landedAt = null;
  let pose = 0;
  let assetsReady = false;
  let held = false;
  let stopped = false;
  let mutationFrame = 0;

  const load = img => new Promise((resolve, reject) => {
    if (!img || (img.complete && img.naturalWidth)) return resolve();
    img.addEventListener('load', resolve, { once: true });
    img.addEventListener('error', reject, { once: true });
  });

  function getBridge() {
    try { return iframe.contentWindow.shawonHeroTransition; } catch { return null; }
  }

  function locate() {
    if (!about?.isConnected) {
      const candidates = [...root.querySelectorAll('section, div.rGeu6w, div[data-scroll-ready]')];
      about = candidates.find(el => /ABOUT\s+ME/i.test(el.textContent)) ||
              root.querySelector('section.rGeu6w') ||
              root.querySelector('section');
      if (about) {
        observer.observe(about);
      }
    }
    schedule();
  }

  function targetBox() {
    if (!about?.isConnected) locate();
    if (!about) return null;

    const box = about.getBoundingClientRect();
    const original = about.querySelector('img[src*="shawon-walk"], img[src*="70e67220"], img[src*="f1ed17d8"], image[href*="shawon-walk"]');
    const pic = original?.getBoundingClientRect();

    let targetLeft, targetTop, targetW, targetH;

    if (pic && pic.width > 20 && pic.height > 20) {
      const left = Math.max(box.left, pic.left);
      const top = Math.max(box.top, pic.top);
      const right = Math.min(box.right, pic.right);
      const bottom = Math.min(box.bottom, pic.bottom);
      targetH = Math.max(1, Math.min(bottom-top, (right-left)*1600/900, innerHeight*.78));
      targetW = targetH*900/1600;
      targetLeft = left + (right-left-targetW)/2;
      targetTop = bottom-targetH;
    } else {
      const isMobile = window.innerWidth < 850;
      if (isMobile) {
        targetW = Math.min(box.width * 0.55, 240);
        targetH = targetW * (1600 / 900);
        targetLeft = box.left + Math.max(15, (box.width - targetW) / 2);
        targetTop = box.top + Math.max(20, box.height * 0.08);
      } else {
        targetH = Math.min(box.height * 0.85, window.innerHeight * 0.78, 580);
        targetW = targetH * (900 / 1600);
        targetLeft = box.left + Math.max(30, box.width * 0.06);
        targetTop = box.top + (box.height - targetH) * 0.55;
      }
    }

    return {
      x: targetLeft,
      y: targetTop,
      w: targetW,
      h: targetH,
      section: box
    };
  }

  function restore() {
    if (held) bridge?.release();
    held = false;
    snapshot = null;
    landedAt = null;
    progress = 0;
    pose = 0;
    about?.classList.remove('shawon-about-active');
    layer.hidden = true;
  }

  function schedule() {
    if (!raf && !document.hidden && !stopped) {
      raf = requestAnimationFrame(render);
    }
  }

  function render(now) {
    raf = 0;
    const dt = Math.min(40, previousTime ? now - previousTime : 16);
    previousTime = now;

    bridge = getBridge();
    const box = targetBox();

    if (!box || !assetsReady || !bridge?.ready) {
      if (held) restore();
      return;
    }

    const hero = iframe.getBoundingClientRect();
    const yScroll = window.scrollY || window.pageYOffset || 0;
    const heroTop = hero.top + yScroll;
    const begin = heroTop + 30; // start transition early at 30px scroll
    const end = Math.max(begin + 120, box.y + yScroll + box.h * 0.5 - innerHeight * 0.55);
    const requested = clamp((yScroll - begin) / (end - begin));

    if (reduce.matches || bridge.paused) {
      restore();
      if (box.section.top < innerHeight * 0.8 && box.section.bottom > 0) {
        about.classList.add('shawon-about-active');
        layer.hidden = false;
        actor.style.width = box.w + 'px';
        actor.style.height = box.h + 'px';
        actor.style.transform = `translate3d(${box.x}px,${box.y}px,0)`;
        flight.style.opacity = crouch.style.opacity = impact.style.opacity = shockwave.style.opacity = '0';
        greeting.style.opacity = '1';
        greeting.style.transform = 'none';
        greeting.style.setProperty("--wave-angle", "0deg");
        placeSpeech(box, 1);
      }
      return;
    }

    // Take character from hero iframe
    if (!held) {
      if (requested <= 0) return;
      snapshot = bridge.take();
      if (!snapshot) return;
      held = true;
      startScroll = yScroll;
      snapshot.x += hero.left;
      snapshot.y += hero.top;
      flight.src = snapshot.src;
      progress = 0;
      about.classList.add('shawon-about-active');
    }

    // Smooth physics progress
    const factor = 1 - Math.exp(-dt / 60);
    progress += (requested - progress) * factor;
    if (Math.abs(requested - progress) < 0.001) progress = requested;

    // Reverse: if user scrolls back to the very top, hand off back to hero
    if (requested <= 0.005 && progress <= 0.01) {
      restore();
      return;
    }

    const p = progress;
    const easing = p * p * (3 - 2 * p); // Smooth Hermite curve
    const fromY = snapshot.y + startScroll - yScroll;
    const x = mix(snapshot.x, box.x, easing);
    // Parabolic arc: rises slightly then dives
    const arcHeight = Math.sin(Math.PI * p) * Math.min(100, innerHeight * 0.12);
    const y = mix(fromY, box.y, p * p) - arcHeight;
    const w = mix(snapshot.w, box.w, easing);
    const h = mix(snapshot.h, box.h, easing);
    const rotation = mix(snapshot.rotation, 0, easing) + Math.sin(Math.PI * p) * -12;

    // Landing detection
    if (requested < 0.95) {
      landedAt = null;
    } else if (p >= 0.97 && landedAt === null) {
      landedAt = now;
    }

    const landingTime = landedAt === null ? 0 : now - landedAt;
    const desiredPose = landedAt !== null && landingTime >= 350 ? 1 : 0;
    pose += (desiredPose - pose) * (1 - Math.exp(-dt / 55));
    if (Math.abs(desiredPose - pose) < 0.002) pose = desiredPose;

    // Small impact bounce
    const bounce = landedAt === null ? 0 : Math.sin(clamp(landingTime / 350) * Math.PI * 2) * 8 * Math.exp(-landingTime / 140);
    const swap = clamp((p - 0.78) / 0.22);

    // Visibility: fade smoothly if section scrolls off-screen
    const sectionVisible = box.section.bottom > 20 && box.section.top < innerHeight - 20;
    layer.hidden = !sectionVisible && p >= 1;

    actor.style.width = w + 'px';
    actor.style.height = h + 'px';
    actor.style.transform = `translate3d(${x}px,${y + bounce}px,0) rotate(${rotation}deg)`;

    // Poses crossfade
    flight.style.opacity = String(1 - swap);
    crouch.style.opacity = String(swap * (1 - pose));
    greeting.style.opacity = String(swap * pose);

    // Realistic Waving Hand Animation
    const helloTime = Math.max(0, landingTime - 350);
    // Real wave swinging from -16deg to +16deg around the wrist
    const waveAngle = pose > 0.1 && helloTime < 3500 
      ? Math.sin(helloTime / 85) * 16 * Math.exp(-helloTime / 2400) 
      : 0;
    greeting.style.transform = `scale(${0.96 + 0.04 * pose})`;
    greeting.style.setProperty("--wave-angle", `${waveAngle}deg`);

    // Comic "THUD!" impact burst
    const hit = landedAt === null ? 0 : clamp(1 - landingTime / 350);
    impact.style.opacity = String(hit);
    impact.style.transform = `translate3d(${box.x + box.w * 0.4}px,${box.y + box.h * 0.75}px,0) rotate(-10deg) scale(${1.2 - 0.2 * hit})`;

    // Ground shockwave
    shockwave.style.opacity = String(hit);
    shockwave.style.transform = `translate3d(${box.x + (box.w - 180) / 2}px,${box.y + box.h - 30}px,0) scale(${1 + 0.3 * (1 - hit)})`;

    // Speech bubble positioning
    placeSpeech(box, pose);

    if (progress !== requested || pose !== desiredPose || (landedAt !== null && landingTime < 3600)) {
      schedule();
    }
  }

  function placeSpeech(box, opacity) {
    const width = Math.min(290, innerWidth * 0.8);
    const left = clamp(box.x + box.w * 0.2, 12, Math.max(12, innerWidth - width - 12));
    const top = Math.max(15, box.y - 120);
    speech.style.opacity = String(opacity);
    speech.style.transform = `translate3d(${left}px,${top}px,0) scale(${0.85 + 0.15 * opacity})`;
  }

  const observer = new ResizeObserver(schedule);
  observer.observe(iframe);
  observer.observe(root);

  const mutations = new MutationObserver(() => {
    if (!mutationFrame) mutationFrame = requestAnimationFrame(() => { mutationFrame = 0; locate(); });
  });
  mutations.observe(root, { childList: true, subtree: true });

  window.addEventListener('scroll', schedule, { passive: true, capture: true });
  window.addEventListener('resize', () => { schedule(); }, { passive: true });
  iframe.addEventListener('load', () => { restore(); locate(); });
  iframe.addEventListener('shawon-hero-ready', schedule);
  iframe.addEventListener('shawon-motion-change', schedule);
  reduce.addEventListener('change', () => { restore(); schedule(); });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(raf); raf = 0; }
    else { previousTime = 0; schedule(); }
  });

  const waveImg = layer.querySelector('.st-wave-body');
  Promise.all([load(crouch), load(waveImg)]).then(() => {
    assetsReady = true;
    locate();
  }).catch(() => {
    stopped = true;
    restore();
  });

  locate();
})();
