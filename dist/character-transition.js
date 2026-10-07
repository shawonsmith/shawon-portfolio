(() => {
  'use strict';
  const iframe = document.getElementById('shawon-hero-frame');
  const root = document.getElementById('root');
  if (!iframe || !root || document.getElementById('shawon-transition')) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const layer = document.createElement('div');
  layer.id = 'shawon-transition';
  layer.hidden = true;
  layer.setAttribute('aria-hidden', 'true');
  layer.innerHTML = `<div class="st-actor"><img class="st-pose st-flight" alt="" draggable="false"><img class="st-pose st-crouch" src="assets/characters/shawon-crouch-900x1600-v2.png" alt="" draggable="false"><div class="st-greeting"><img class="st-pose st-wave-body" src="assets/characters/shawon-wave-v3.png" alt="" draggable="false"><img class="st-pose st-wave-hand" src="assets/characters/shawon-wave-v3.png" alt="" draggable="false"></div></div><div class="st-impact">THUD!</div><div class="st-speech">Hey there! Welcome to my world.</div>`;
  document.body.append(layer);
  const actor = layer.querySelector('.st-actor');
  const flight = layer.querySelector('.st-flight');
  const crouch = layer.querySelector('.st-crouch');
  const greeting = layer.querySelector('.st-greeting');
  const wave = greeting.querySelector('img');
  const impact = layer.querySelector('.st-impact');
  const speech = layer.querySelector('.st-speech');
  const clamp = (n, a = 0, b = 1) => Math.max(a, Math.min(b, n));
  const mix = (a, b, t) => a + (b - a) * t;
  let about, bridge, snapshot, startScroll, progress = 0, raf = 0, previousTime = 0;
  let landedAt = null, pose = 0, assetsReady = false, held = false, stopped = false;
  let mutationFrame = 0;
  const load = img => new Promise((resolve, reject) => {
    if (img.complete && img.naturalWidth) return resolve();
    img.addEventListener('load', resolve, {once:true});
    img.addEventListener('error', reject, {once:true});
  });
  function getBridge() {
    try { return iframe.contentWindow.shawonHeroTransition; } catch { return null; }
  }
  function locate() {
    if (!about?.isConnected) {
      about = [...root.querySelectorAll('section.rGeu6w, section')].find(el => /ABOUT\s+ME/i.test(el.textContent));
      if (about) observer.observe(about);
    }
    schedule();
  }
  function targetBox() {
    const box = about.getBoundingClientRect();
    const original = about.querySelector('img[src*="shawon-walk-"]');
    const pic = original?.getBoundingClientRect();
    // Keep the character in the replica's existing illustration column.
    let available = {left:box.left + box.width*.015, top:box.top + box.height*.12,
      width:box.width*.32, height:box.height*.82};
    if (pic && pic.width > 0 && pic.height > 0) {
      const left = Math.max(box.left, pic.left), top = Math.max(box.top, pic.top);
      const right = Math.min(box.right, pic.right), bottom = Math.min(box.bottom, pic.bottom);
      if (right > left && bottom > top) available = {left,top,width:right-left,height:bottom-top};
    }
    const h = Math.min(available.height*.93, available.width*1600/900, innerHeight*.78);
    const w = h*900/1600;
    return {x:available.left+(available.width-w)/2, y:available.top+available.height-h,
      w,h,section:box};
  }
  function restore() {
    if (held) bridge?.release();
    held = false; snapshot = null; landedAt = null; progress = 0; pose = 0;
    about?.classList.remove('shawon-about-active');
    layer.hidden = true;
  }
  function schedule() {
    if (!raf && !document.hidden && !stopped) raf = requestAnimationFrame(render);
  }
  function render(now) {
    raf = 0;
    const dt = Math.min(40, previousTime ? now-previousTime : 16);
    previousTime = now;
    bridge = getBridge();
    if (!about?.isConnected || !assetsReady || !bridge?.ready) { restore(); return; }
    const hero = iframe.getBoundingClientRect();
    const box = targetBox();
    const yScroll = scrollY;
    const heroTop = hero.top + yScroll;
    const begin = heroTop + hero.height*.06;
    const end = Math.max(begin+80, box.y+yScroll+box.h-innerHeight*.82);
    const requested = clamp((yScroll-begin)/(end-begin));
    if (reduce.matches || bridge.paused) {
      restore();
      if (box.section.top < innerHeight*.8 && box.section.bottom > 0) {
        about.classList.add('shawon-about-active'); layer.hidden = false;
        actor.style.width = box.w+'px'; actor.style.height = box.h+'px';
        actor.style.transform = `translate3d(${box.x}px,${box.y}px,0)`;
        flight.style.opacity = crouch.style.opacity = impact.style.opacity = '0';
        greeting.style.opacity = '1'; greeting.style.transform = 'none'; greeting.style.setProperty("--wave-angle","0deg");
        placeSpeech(box,1);
      }
      return;
    }
    if (!held) {
      if (requested <= 0) return;
      snapshot = bridge.take();
      if (!snapshot) return;
      held = true; startScroll = yScroll;
      snapshot.x += hero.left; snapshot.y += hero.top;
      flight.src = snapshot.src;
      progress = 0;
      about.classList.add('shawon-about-active');
    }
    const factor = 1-Math.exp(-dt/75);
    progress += (requested-progress)*factor;
    if (Math.abs(requested-progress) < .001) progress = requested;
    if (requested === 0 && progress === 0) { restore(); return; }
    const p = progress, easing = p*p*(3-2*p);
    const fromY = snapshot.y+startScroll-yScroll;
    const x = mix(snapshot.x, box.x, easing);
    const y = mix(fromY, box.y, p*p)-Math.sin(Math.PI*p)*Math.min(110,innerHeight*.13);
    const w = mix(snapshot.w,box.w,easing), h = mix(snapshot.h,box.h,easing);
    const rotation = mix(snapshot.rotation,0,easing)+Math.sin(Math.PI*p)*-14;
    if (requested < .985) landedAt = null;
    else if (p >= .995 && landedAt === null) landedAt = now;
    const landingTime = landedAt === null ? 0 : now-landedAt;
    const desiredPose = landedAt !== null && landingTime >= 350 ? 1 : 0;
    pose += (desiredPose-pose)*(1-Math.exp(-dt/65));
    if (Math.abs(desiredPose-pose) < .002) pose = desiredPose;
    const bounce = landedAt === null ? 0 : Math.sin(clamp(landingTime/350)*Math.PI*2)*9*Math.exp(-landingTime/140);
    const swap = clamp((p-.8)/.2);
    layer.hidden = box.section.bottom < -40 || (p===1 && box.y>innerHeight+40);
    actor.style.width = w+'px'; actor.style.height = h+'px';
    actor.style.transform = `translate3d(${x}px,${y+bounce}px,0) rotate(${rotation}deg)`;
    flight.style.opacity = String(1-swap);
    crouch.style.opacity = String(swap*(1-pose));
    greeting.style.opacity = String(swap*pose);
    const helloTime = Math.max(0,landingTime-350);
    const hello = pose>.1 && helloTime<1600 ? Math.sin(helloTime/95)*1.4*Math.exp(-helloTime/1100) : 0;
    greeting.style.transform = `scale(${.97+.03*pose})`;
    greeting.style.setProperty("--wave-angle",`${hello*3}deg`);
    const hit = landedAt === null ? 0 : clamp(1-landingTime/350);
    impact.style.opacity = String(hit);
    impact.style.transform = `translate3d(${box.x+box.w*.45}px,${box.y+box.h*.8}px,0) rotate(-12deg) scale(${1.2-.2*hit})`;
    placeSpeech(box,pose);
    if (progress!==requested || pose!==desiredPose || (landedAt!==null && landingTime<2000)) schedule();
  }
  function placeSpeech(box, opacity) {
    const width = Math.min(240,innerWidth*.65);
    const left = clamp(box.x+box.w*.5-width*.5,8,Math.max(8,innerWidth-width-8));
    speech.style.opacity = String(opacity);
    speech.style.transform = `translate3d(${left}px,${box.y-78}px,0) scale(${.8+.2*opacity})`;
  }
  const observer = new ResizeObserver(schedule);
  observer.observe(iframe); observer.observe(root);
  const mutations = new MutationObserver(() => {
    if (!mutationFrame) mutationFrame=requestAnimationFrame(() => { mutationFrame=0; locate(); });
  });
  mutations.observe(root,{childList:true,subtree:true});
  document.addEventListener('scroll',schedule,{passive:true,capture:true});
  addEventListener('resize',()=>{restore();schedule();},{passive:true});
  iframe.addEventListener('load',()=>{restore();locate();});
  iframe.addEventListener('shawon-hero-ready',schedule);
  iframe.addEventListener('shawon-motion-change',schedule);
  reduce.addEventListener('change',()=>{restore();schedule();});
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden){cancelAnimationFrame(raf);raf=0;}
    else {previousTime=0;schedule();}
  });
  addEventListener('pagehide',()=>{cancelAnimationFrame(raf);raf=0;restore();});
  addEventListener('pageshow',schedule);
  Promise.all([load(crouch),load(wave)]).then(()=>{assetsReady=true;locate();}).catch(()=>{
    stopped=true;restore();console.warn('Character transition disabled: a pose image could not load.');
  });
  locate();
})();
