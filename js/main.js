'use strict';
const $=(s,root=document)=>root.querySelector(s);
const $$=(s,root=document)=>[...root.querySelectorAll(s)];
const header=$('#cabecera'),menuButton=$('#menuButton'),mobileNav=$('#mobileNav');
function setMenu(open){
 if(!header||!menuButton||!mobileNav)return;
 mobileNav.hidden=!open;
 menuButton.setAttribute('aria-expanded',String(open));
 menuButton.setAttribute('aria-label',open?'Cerrar menú':'Abrir menú');
 header.classList.toggle('menu-open',open);
}
menuButton?.addEventListener('click',()=>setMenu(mobileNav.hidden));
$$('a',mobileNav||document.createElement('nav')).forEach(a=>a.addEventListener('click',()=>setMenu(false)));
document.addEventListener('click',event=>{if(header&&!header.contains(event.target))setMenu(false)});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&mobileNav&&!mobileNav.hidden){setMenu(false);menuButton.focus()}});
const desktopMedia=matchMedia('(min-width:721px)');
desktopMedia.addEventListener('change',event=>{if(event.matches)setMenu(false)});
const progress=$('.reading-progress');
let scrollQueued=false;
function syncProgress(){
 const range=document.documentElement.scrollHeight-innerHeight;
 if(progress)progress.style.width=(range>0?Math.min(100,scrollY/range*100):0)+'%';
 scrollQueued=false;
}
addEventListener('scroll',()=>{if(!scrollQueued){scrollQueued=true;requestAnimationFrame(syncProgress)}},{passive:true});
addEventListener('resize',syncProgress);
syncProgress();
$$('[data-year]').forEach(el=>el.textContent=new Date().getFullYear());
const filters=$$('[data-filter]'),cards=$$('.work-card');
filters.forEach(button=>button.addEventListener('click',()=>{
 filters.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
 cards.forEach(card=>card.hidden=button.dataset.filter!=='all'&&card.dataset.category!==button.dataset.filter);
 const status=$('#filterStatus'),count=cards.filter(card=>!card.hidden).length;
 if(status)status.textContent=count+' proyectos';
 syncProgress();
}));
if('IntersectionObserver' in window&&$('#inicio')){
 const observer=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
   if(entry.isIntersecting){
    $$('.desktop-nav a').forEach(a=>{
     if(a.getAttribute('href')==='#'+entry.target.id)a.setAttribute('aria-current','location');
     else a.removeAttribute('aria-current');
    });
   }
  });
 },{rootMargin:'-15% 0px -55% 0px',threshold:0});
 $$('main>section[id]').forEach(section=>observer.observe(section));
}
$$('[data-service]').forEach(a=>a.addEventListener('click',()=>{
 const select=$('#contactType');
 if(select)select.value=a.dataset.service;
}));
const form=$('#contactForm');
form?.addEventListener('submit',event=>{
 event.preventDefault();
 if(!form.reportValidity())return;
 const name=form.elements.namedItem('name').value.trim();
 const type=form.elements.namedItem('type').value.trim();
 const message=form.elements.namedItem('message').value.trim();
 if(!name||!type||!message){showToast('Completa tu nombre y tu mensaje antes de continuar.');return}
 const text='Hola Franklin, vi tu portafolio de Frank Manayay.\n\nNombre: '+name+'\nConsulta: '+type+'\nMensaje: '+message;
 location.assign('https://wa.me/51925096515?text='+encodeURIComponent(text));
});
let toastTimer;
function showToast(message){
 const toast=$('#toast');if(!toast)return;
 clearTimeout(toastTimer);toast.textContent=message;toast.hidden=false;
 toastTimer=setTimeout(()=>{toast.hidden=true},3500);
}
$('#copyEmail')?.addEventListener('click',async()=>{
 const email='frankmanayay5@gmail.com';
 try{
  if(navigator.clipboard&&window.isSecureContext)await navigator.clipboard.writeText(email);
  else{
   const area=document.createElement('textarea');area.value=email;
   area.setAttribute('readonly','');area.style.cssText='position:fixed;left:-9999px;top:0';
   document.body.append(area);area.select();
   const ok=document.execCommand('copy');area.remove();
   if(!ok)throw new Error('copy unavailable');
   $('#copyEmail').focus();
  }
  showToast('Correo copiado.');
 }catch{showToast('Correo: '+email)}
});
const dialog=$('#demoDialog'),content=$('#demoContent'),demoTitle=$('#demoTitle');
let launcher=null,activeDemo=null,state=null;
const products=[
 {id:'audio',name:'Auriculares Studio',category:'access',description:'Audio / accesorio',price:129,glyph:'AUDIO'},
 {id:'mouse',name:'Mouse inalámbrico',category:'access',description:'Escritorio / accesorio',price:59,glyph:'WORK'},
 {id:'icons',name:'Pack de iconos',category:'digital',description:'Recurso digital',price:35,glyph:'ICONS'},
 {id:'template',name:'Plantilla web',category:'digital',description:'Recurso digital',price:149,glyph:'WEB'}
];
const dishes=[
 {id:'pato',name:'Arroz con pato',category:'platos',description:'Arroz al culantro con pato y salsa criolla.',price:28},
 {id:'cabrito',name:'Seco de cabrito',category:'platos',description:'Con frejoles, arroz y salsa criolla.',price:30},
 {id:'lomo',name:'Lomo saltado',category:'platos',description:'Salteado con papas y arroz blanco.',price:26},
 {id:'chicha',name:'Chicha morada',category:'bebidas',description:'Vaso personal de maíz morado.',price:5},
 {id:'limonada',name:'Limonada',category:'bebidas',description:'Vaso personal, recién preparada.',price:6}
];
const money=value=>new Intl.NumberFormat('es-PE',{style:'currency',currency:'PEN',minimumFractionDigits:2}).format(value);
const initialOrders=()=>[
 {id:'024',table:'04',lines:['2 × Lomo saltado','1 × Chicha morada'],status:0},
 {id:'025',table:'09',lines:['1 × Arroz con pollo','2 × Limonada'],status:0},
 {id:'023',table:'02',lines:['1 × Menú del día','1 × Refresco'],status:1}
];
const totalFor=(items,bag)=>items.reduce((sum,item)=>sum+item.price*(bag[item.id]||0),0);
const countFor=bag=>Object.values(bag).reduce((sum,n)=>sum+n,0);
function tab(action,value,label,selected){
 return '<button type="button" data-action="'+action+'" data-value="'+value+'" aria-pressed="'+(value===selected)+'">'+label+'</button>';
}
function openDemo(kind,button){
 if(!dialog||!content||!['shop','kitchen','menu'].includes(kind))return;
 launcher=button;activeDemo=kind;
 state={filter:kind==='menu'?'platos':'all',bag:{},orders:initialOrders()};
 demoTitle.textContent={shop:'Product Frank / Catálogo',kitchen:'Pedidos & Cocina / Comandas',menu:'Menú Digital / Carta'}[kind];
 renderDemo();
 document.body.classList.add('dialog-open');
 dialog.showModal();
 $('#closeDemo').focus();
}
$$('[data-demo]').forEach(button=>button.addEventListener('click',()=>openDemo(button.dataset.demo,button)));
$('#closeDemo')?.addEventListener('click',()=>dialog.close());
dialog?.addEventListener('click',event=>{
 const r=dialog.getBoundingClientRect();
 if(event.target===dialog&&(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom))dialog.close();
});
dialog?.addEventListener('close',()=>{
 document.body.classList.remove('dialog-open');
 content.replaceChildren();activeDemo=null;state=null;
 launcher?.focus();launcher=null;
});
function renderShop(){
 const items=products.filter(p=>state.filter==='all'||p.category===state.filter);
 const basket=products.filter(p=>state.bag[p.id]>0);
 const lines=basket.map(p=>'<div class="basket-line"><strong>'+p.name+'</strong><div><span class="quantity-control"><button type="button" data-action="remove" data-id="'+p.id+'" aria-label="Quitar una unidad de '+p.name+'">−</button><span>'+state.bag[p.id]+'</span><button type="button" data-action="add" data-id="'+p.id+'" aria-label="Añadir una unidad de '+p.name+'">+</button></span><span>'+money(p.price*state.bag[p.id])+'</span></div></div>').join('');
 return '<div class="demo-tabs" role="group" aria-label="Categorías de catálogo">'+tab('filter','all','Todo',state.filter)+tab('filter','access','Accesorios',state.filter)+tab('filter','digital','Digital',state.filter)+'</div><div class="demo-shop-layout"><div class="demo-products">'+items.map(p=>'<article class="demo-product"><div class="product-glyph" aria-hidden="true">'+p.glyph+'</div><h3>'+p.name+'</h3><p>'+p.description+'</p><strong>'+money(p.price)+'</strong><button type="button" data-action="add" data-id="'+p.id+'" aria-label="Añadir '+p.name+' a la bolsa">Añadir a la bolsa +</button></article>').join('')+'</div><aside class="demo-basket"><h3 tabindex="-1" id="basketHeading">Tu bolsa <span>('+countFor(state.bag)+')</span></h3>'+(lines||'<p>Elige un producto para empezar.</p>')+'<div class="basket-total"><span>Total</span><strong>'+money(totalFor(products,state.bag))+'</strong></div><p class="demo-help">Catálogo de ejemplo. Esta demo no realiza compras ni envía pedidos.</p>'+(basket.length?'<button type="button" class="reset-demo" data-action="empty">Vaciar bolsa</button>':'')+'</aside></div>';
}
function renderKitchen(){
 const names=['Por preparar','En cocina','Listo'];
 return '<div class="demo-board">'+names.map((name,status)=>{
  const orders=state.orders.filter(o=>o.status===status);
  return '<section class="demo-column"><h3 tabindex="-1" id="column'+status+'">'+name+' <span>'+orders.length+'</span></h3>'+orders.map(o=>'<article class="demo-order"><small>MESA '+o.table+' / #'+o.id+'</small><h4>Comanda #'+o.id+'</h4><p>'+o.lines.join('<br>')+'</p>'+(status<2?'<button type="button" data-action="advance" data-id="'+o.id+'">'+(status===0?'Iniciar preparación →':'Marcar como listo ✓')+'</button>':'<span class="demo-done">✓ Listo para entregar</span>')+'</article>').join('')+(!orders.length?'<p class="demo-help">Sin pedidos en este estado.</p>':'')+'</section>';
 }).join('')+'</div><button type="button" class="reset-demo" data-action="reset">Reiniciar demostración</button>';
}
function renderMenu(){
 const list=dishes.filter(d=>d.category===state.filter);
 return '<div class="demo-menu-title"><h3>Sazón<br><i>Norteño.</i></h3><p>Carta demostrativa<br>Platos y precios de ejemplo</p></div><div class="demo-tabs" role="group" aria-label="Categorías de carta">'+tab('filter','platos','Platos',state.filter)+tab('filter','bebidas','Bebidas',state.filter)+'</div><div>'+list.map(d=>'<article class="demo-dish"><div><h4>'+d.name+'</h4><p>'+d.description+'</p></div><div><strong>'+money(d.price)+'</strong><button type="button" data-action="add" data-id="'+d.id+'" aria-label="Añadir '+d.name+'">+</button></div></article>').join('')+'</div><div class="demo-menu-summary"><span>'+countFor(state.bag)+' productos seleccionados</span><strong>'+money(totalFor(dishes,state.bag))+'</strong></div><p class="demo-help">'+(countFor(state.bag)?dishes.filter(d=>state.bag[d.id]).map(d=>state.bag[d.id]+' × '+d.name).join(' · '):'Añade un plato o una bebida para armar una selección de ejemplo.')+'</p><button type="button" class="reset-demo" data-action="empty">Limpiar selección</button>';
}
function renderDemo(){
 if(!content||!state)return;
 content.innerHTML=activeDemo==='shop'?renderShop():activeDemo==='kitchen'?renderKitchen():renderMenu();
 const live=document.createElement('p');live.id='demoAnnouncement';live.className='demo-announcement';live.setAttribute('role','status');live.setAttribute('aria-live','polite');content.append(live);
}
content?.addEventListener('click',event=>{
 const button=event.target.closest('button[data-action]');
 if(!button||!state)return;
 const {action,id,value}=button.dataset;
 let message='',focusSelector=null;
 if(action==='filter'){state.filter=value;focusSelector='button[data-action="filter"][data-value="'+value+'"]'}
 if(action==='add'||action==='remove'){
  const items=activeDemo==='shop'?products:dishes,item=items.find(p=>p.id===id);
  if(!item)return;
  const previous=state.bag[id]||0,next=Math.max(0,Math.min(50,previous+(action==='add'?1:-1)));
  state.bag[id]=next;
  message=item.name+': '+next+' en tu selección.';
  focusSelector='button[data-action="'+action+'"][data-id="'+id+'"]';
 }
 if(action==='advance'){
  const order=state.orders.find(o=>o.id===id);
  if(!order||order.status>=2)return;
  order.status++;
  message='Comanda #'+id+': '+(order.status===1?'en preparación.':'lista para entregar.');
  focusSelector=order.status===1?'button[data-action="advance"][data-id="'+id+'"]':'#column2';
 }
 if(action==='empty'){state.bag={};message='Selección vacía.';focusSelector=activeDemo==='shop'?'#basketHeading':'button[data-action="empty"]'}
 if(action==='reset'){state.orders=initialOrders();message='Pedidos de ejemplo reiniciados.';focusSelector='button[data-action="reset"]'}
 renderDemo();
 let focus=focusSelector?$(focusSelector,content):null;
 if(!focus)focus=$('#basketHeading',content)||$('button',content);
 focus?.focus({preventScroll:true});
 const announcement=$('#demoAnnouncement',content);if(announcement)announcement.textContent=message;
});

