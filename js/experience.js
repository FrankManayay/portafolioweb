/* Presentation interactions are isolated from project demos and contact logic. */
(()=>{
 'use strict';
 const display=document.getElementById('sceneDisplay');
 const buttons=[...document.querySelectorAll('[data-scene]')];
 const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
 const scenes={
  shop:{number:'01',title:'Product Frank',caption:'Catálogo, selección y pedido.',address:'product-frank / interfaz web',href:'proyectos/product-frank.html'},
  kitchen:{number:'02',title:'Pedidos & Cocina',caption:'De la mesa a la preparación.',address:'pedidos-cocina / sistema',href:'proyectos/restaurant.html'},
  luna:{number:'03',title:'Luna AI',caption:'Exploración de voz y modelos locales.',address:'luna-ai / asistente de escritorio',href:'proyectos/luna-ai.html'}
 };
 function selectScene(key,focus=false){
  const scene=scenes[key],template=document.getElementById('scene-'+key);
  if(!scene||!template||!display)return;
  display.replaceChildren(template.content.cloneNode(true));
  if(!motion.matches){
   display.classList.remove('scene-changing');
   void display.offsetWidth;
   display.classList.add('scene-changing');
  }
  buttons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.scene===key)));
  const write=(id,value)=>{const el=document.getElementById(id);if(el)el.textContent=value};
  write('sceneMetaTitle',scene.title);write('sceneMetaCaption',scene.caption);
  write('sceneAddress',scene.address);write('stageNumber',scene.number);
  const link=document.getElementById('sceneProjectLink');
  if(link){link.href=scene.href;link.setAttribute('aria-label','Ver caso de '+scene.title)}
  if(focus)buttons.find(button=>button.dataset.scene===key)?.focus();
 }
 buttons.forEach((button,index)=>{
  button.addEventListener('click',()=>selectScene(button.dataset.scene));
  button.addEventListener('keydown',event=>{
   if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
   event.preventDefault();
   const next=event.key==='Home'?0:event.key==='End'?buttons.length-1:(index+(event.key==='ArrowRight'?1:-1)+buttons.length)%buttons.length;
   selectScene(buttons[next].dataset.scene,true);
  });
 });
 const clock=document.getElementById('localTime');
 if(clock){
  const refresh=()=>{clock.textContent=new Intl.DateTimeFormat('es-PE',{hour:'2-digit',minute:'2-digit',hour12:false,timeZone:'America/Lima'}).format(new Date())};
  let timer;
  const startClock=()=>{clearInterval(timer);refresh();timer=setInterval(refresh,60000)};
  startClock();
  window.addEventListener('pagehide',()=>clearInterval(timer));
  window.addEventListener('pageshow',startClock);
 }
 if('IntersectionObserver' in window&&!motion.matches){
  const observer=new IntersectionObserver(entries=>{
   entries.forEach(entry=>{
    if(entry.isIntersecting){entry.target.classList.add('entered');observer.unobserve(entry.target)}
   });
  },{threshold:.08});
  document.querySelectorAll('[data-enter]').forEach(element=>observer.observe(element));
 }
})();

/* Each scene owns its frame; no permanent animation loop or touch interception. */
(()=>{
 'use strict';
 const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
 const pointer=window.matchMedia('(hover:hover) and (pointer:fine)');
 const resets=[];
 document.querySelectorAll('[data-depth-stage]').forEach(stage=>{
  const surface=stage.matches('[data-depth-surface]')?stage:stage.querySelector('[data-depth-surface]');
  if(!surface)return;
  let frame=0,bounds=null;
  const strength=Math.min(7,Math.max(1,Number(stage.dataset.depthStrength)||3));
  const reset=()=>{
   cancelAnimationFrame(frame);frame=0;bounds=null;
   ['--stage-rx','--stage-ry','--light-x','--light-y'].forEach(name=>surface.style.removeProperty(name));
   surface.classList.remove('depth-active');
  };
  resets.push(reset);
  stage.addEventListener('pointerenter',()=>{bounds=stage.getBoundingClientRect()},{passive:true});
  stage.addEventListener('pointermove',event=>{
   if(motion.matches||!pointer.matches||event.pointerType==='touch')return;
   const {clientX,clientY}=event;
   cancelAnimationFrame(frame);
   frame=requestAnimationFrame(()=>{
    frame=0;
    const box=bounds||(bounds=stage.getBoundingClientRect());
    if(!box.width||!box.height)return;
    const x=Math.max(-1,Math.min(1,(clientX-box.left)/box.width*2-1));
    const y=Math.max(-1,Math.min(1,(clientY-box.top)/box.height*2-1));
    surface.style.setProperty('--stage-rx',(-y*strength*.65).toFixed(2)+'deg');
    surface.style.setProperty('--stage-ry',(x*strength).toFixed(2)+'deg');
    surface.style.setProperty('--light-x',((x+1)*50).toFixed(1)+'%');
    surface.style.setProperty('--light-y',((y+1)*50).toFixed(1)+'%');
    surface.classList.add('depth-active');
   });
  },{passive:true});
  ['pointerleave','pointercancel','focusout'].forEach(type=>stage.addEventListener(type,reset));
 });
 const resetAll=()=>resets.forEach(reset=>reset());
 motion.addEventListener('change',resetAll);
 pointer.addEventListener('change',resetAll);
 window.addEventListener('blur',resetAll);
 window.addEventListener('pagehide',resetAll);
 window.addEventListener('scroll',resetAll,{passive:true});
 window.addEventListener('resize',resetAll,{passive:true});
})();

(()=>{
 'use strict';
 const grid=document.getElementById('workGrid');
 const controls=[...document.querySelectorAll('.layout-control [data-layout]')];
 if(!grid||!controls.length)return;
 controls.forEach(button=>button.addEventListener('click',()=>{
  const layout=button.dataset.layout;
  if(!['gallery','index'].includes(layout))return;
  grid.dataset.layout=layout;
  controls.forEach(control=>control.setAttribute('aria-pressed',String(control===button)));
  window.dispatchEvent(new Event('resize'));
 }));
})();

