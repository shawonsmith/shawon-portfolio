(() => {
  'use strict';
  const hero=document.getElementById('hero'),person=document.getElementById('person'),city=document.getElementById('city');
  const web=document.getElementById('web'),shadow=document.getElementById('web-shadow'),main=document.getElementById('web-main'),fine=document.getElementById('web-fine'),cross=document.getElementById('web-cross');
  const motion=document.getElementById('motion'),icon=document.getElementById('motion-icon');
  const media=matchMedia('(prefers-reduced-motion: reduce)'),finePointer=matchMedia('(pointer:fine)');
  let ready=false,paused=false,visible=true,frame=0,last=0,elapsed=0,px=0,py=0,tx=0,ty=0,rect,layout,scrollLeap=0;
  function resize(){
    rect=hero.getBoundingClientRect();const W=rect.width,H=rect.height,portrait=W/H<=1.2;
    const w=portrait?Math.min(W*.86,H*.49*1.5):Math.min(W*.59,H*.78*1.5),h=w/1.5;
    layout={w,h,x:portrait?(W-w)/2:W-w-W*.045,y:portrait?H*.43:(H-h)*.42,portrait};
    Object.assign(person.style,{width:w+'px',left:layout.x+'px',top:layout.y+'px'});
    web.setAttribute('viewBox',`0 0 ${W} ${H}`);draw();
  }
  function draw(){
    if(!layout)return;
    const t=elapsed/1000,still=paused||media.matches,entry=media.matches?1:Math.min(t/1.8,1),ease=1-Math.pow(1-entry,3);
    const sway=still?0:Math.sin(t*.9),breath=still?0:Math.sin(t*1.4);
    // Side entrance intentionally begins offscreen; the settled pose retains fullscreen margins.
    const leapY=scrollLeap*rect.height*0.8,leapX=-scrollLeap*rect.width*0.12,leapRot=scrollLeap*20;
    const alpha=Math.max(0,1-scrollLeap*1.5);
    const x=(1-ease)*rect.width*.75+sway*5+px+leapX,y=(1-ease)*-rect.height*.2+Math.sin(entry*Math.PI)*rect.height*.09+breath*5+py+leapY,rotation=(1-ease)*-18+sway*.85+leapRot;
    person.style.transform=`translate(${x}px,${y}px) rotate(${rotation}deg)`;
    person.style.opacity=alpha;
    web.style.opacity=alpha;
    const {w,h}=layout,ox=.85*w,oy=.29*h,a=rotation*Math.PI/180;
    // Web starts at the underside of the wrist, not the knuckles or fingertips.
    const hx=.865*w-ox,hy=.325*h-oy;
    const handX=layout.x+ox+hx*Math.cos(a)-hy*Math.sin(a)+x,handY=layout.y+oy+hx*Math.sin(a)+hy*Math.cos(a)+y;
    const endX=rect.width+24,endY=layout.portrait?rect.height*.31:-12;
    const cx=handX+(endX-handX)*.5,cy=handY+(endY-handY)*.5+7+breath*2;
    const d=`M${handX},${handY} Q${cx},${cy} ${endX},${endY}`;
    shadow.setAttribute('d',d);main.setAttribute('d',d);
    fine.setAttribute('d',`M${handX},${handY+2} Q${cx},${cy+5} ${endX},${endY+5} M${handX},${handY-1} Q${cx},${cy-4} ${endX},${endY-4}`);
    let str='';for(let k=1;k<12;k++){const f=k/12,ix=(1-f)*handX+f*endX,iy=(1-f)*handY+f*endY+2*(1-f)*f*(7+breath*2);str+=`M${ix-2},${iy-3} q-3,3 2,7 `;}cross.setAttribute('d',str);
    city.style.transform=`translate(${-px*.3}px,${-py*.25}px) scale(1.015)`;
  }
  function tick(now){if(!last)last=now;const dt=Math.min(now-last,40);last=now;elapsed+=dt;px+=(tx-px)*.07;py+=(ty-py)*.07;draw();frame=requestAnimationFrame(tick);}
  function sync(){cancelAnimationFrame(frame);frame=0;last=0;const active=ready&&!paused&&!media.matches&&visible&&!document.hidden;if(active)frame=requestAnimationFrame(tick);else{px=py=tx=ty=0;draw();}motion.hidden=media.matches;motion.setAttribute('aria-label',paused?'Resume animation':'Pause animation');motion.setAttribute('aria-pressed',String(paused));icon.setAttribute('d',paused?'M8 5L19 12L8 19Z':'M8 5V19M16 5V19');}
  hero.addEventListener('pointermove',e=>{if(!finePointer.matches||paused||media.matches)return;tx=((e.clientX-rect.left)/rect.width-.5)*8;ty=((e.clientY-rect.top)/rect.height-.5)*6;},{passive:true});
  hero.addEventListener('pointerleave',()=>{tx=ty=0;});motion.addEventListener('click',()=>{paused=!paused;sync();});
  media.addEventListener('change',sync);document.addEventListener('visibilitychange',sync);new ResizeObserver(resize).observe(hero);
  window.addEventListener('message',e=>{
    if(e.origin!==location.origin||e.source!==parent)return;
    if(e.data?.type==='hero-visibility'){visible=Boolean(e.data.visible);sync();}
    if(e.data?.type==='hero-scroll'){scrollLeap=Math.max(0,Math.min(e.data.scrollY/350,1));draw();}
  });
  if(media.matches)elapsed=2000;
  resize();sync();
  const character=person.querySelector('img');
  const begin=()=>{if(ready)return;ready=true;last=0;sync();};
  if(character.complete&&character.naturalWidth)begin();
  else {character.addEventListener('load',begin,{once:true});character.addEventListener('error',begin,{once:true});}
})();
