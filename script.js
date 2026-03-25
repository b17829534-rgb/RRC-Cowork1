/* CURSOR */
const cur=document.getElementById('cur'),curR=document.getElementById('curR');
let mx=0,my=0,rx=0,ry=0;
document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;cur.style.left=mx+'px';cur.style.top=my+'px';});
(function loop(){rx+=(mx-rx)*.11;ry+=(my-ry)*.11;curR.style.left=rx+'px';curR.style.top=ry+'px';requestAnimationFrame(loop);})();
document.querySelectorAll('a,button,.s-card,.perk,.g-item,.t-card').forEach(el=>{
  el.addEventListener('mouseenter',()=>{cur.style.width='20px';cur.style.height='20px';curR.style.width='60px';curR.style.height='60px';});
  el.addEventListener('mouseleave',()=>{cur.style.width='10px';cur.style.height='10px';curR.style.width='38px';curR.style.height='38px';});
});

/* NAV */
const nav=document.getElementById('nav');
window.addEventListener('scroll',()=>nav.classList.toggle('scrolled',window.scrollY>60));

/* HERO SLIDER */
const slides=document.querySelectorAll('.slide');
const dots=document.querySelectorAll('.dot');
const thumbs=document.querySelectorAll('.thumb');
let cur_s=0,timer;
function goTo(i){
  slides[cur_s].classList.remove('active');
  dots[cur_s].classList.remove('active');
  thumbs[cur_s].classList.remove('active');
  cur_s=i;
  slides[cur_s].classList.add('active');
  dots[cur_s].classList.add('active');
  thumbs[cur_s].classList.add('active');
}
function next(){goTo((cur_s+1)%slides.length);}
function startAuto(){timer=setInterval(next,4500);}
function stopAuto(){clearInterval(timer);}
startAuto();
dots.forEach(d=>d.addEventListener('click',()=>{stopAuto();goTo(+d.dataset.i);startAuto();}));
thumbs.forEach(t=>t.addEventListener('click',()=>{stopAuto();goTo(+t.dataset.i);startAuto();}));

/* SMOOTH ANCHORS */
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click',e=>{
    const t=document.querySelector(a.getAttribute('href'));
    if(t){e.preventDefault();t.scrollIntoView({behavior:'smooth',block:'start'});}
  });
});

/* SCROLL REVEAL */
const revs=document.querySelectorAll('.reveal');
const ro=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible');}),{threshold:.12,rootMargin:'0px 0px -36px 0px'});
revs.forEach(el=>ro.observe(el));

/* ══ DEEP 3-LAYER PARALLAX ══
   Layer speeds (fraction of scroll offset from section centre):
     back  → 0.30  (slowest)
     mid   → 0.55
     front → 0.10  (slight drift — keeps text readable)
*/
(function(){
  const section   = document.getElementById('deepPxs');
  const lBack     = document.getElementById('layerBack');
  const lMid      = document.getElementById('layerMid');
  const lFront    = document.getElementById('layerFront');
  if(!section) return;

  const SPEED_BACK  = 0.30;
  const SPEED_MID   = 0.55;
  const SPEED_FRONT = 0.10;

  // Reveal trigger
  const pxsObs = new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting) section.classList.add('pxs-active');
    });
  },{threshold:0.15});
  pxsObs.observe(section);

  let rafId = null;
  let lastSY = -1;

  function tick(){
    const sy = window.scrollY;
    if(sy === lastSY){ rafId = requestAnimationFrame(tick); return; }
    lastSY = sy;

    const rect   = section.getBoundingClientRect();
    const vh     = window.innerHeight;
    // Skip if far off screen
    if(rect.bottom < -300 || rect.top > vh + 300){
      rafId = requestAnimationFrame(tick);
      return;
    }

    // Offset from section visual centre to viewport centre
    const centre = rect.top + rect.height / 2 - vh / 2;

    // Each layer moves at its own fraction
    const yBack  = centre * SPEED_BACK;
    const yMid   = centre * SPEED_MID;
    const yFront = centre * SPEED_FRONT;

    lBack.style.transform  = `translateY(${yBack}px)`;
    lMid.style.transform   = `translateY(${yMid}px)`;
    lFront.style.transform = `translateY(${yFront}px)`;

    rafId = requestAnimationFrame(tick);
  }

  // Start RAF loop
  rafId = requestAnimationFrame(tick);

  // Pause when tab hidden
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden){ cancelAnimationFrame(rafId); }
    else { rafId = requestAnimationFrame(tick); }
  });
})();

/* ── TESTIMONIALS CAROUSEL ── */
(function(){
  const track  = document.getElementById('testiTrack');
  const track2 = document.getElementById('testiTrack2');
  const dotsEl = document.getElementById('testiDots');
  const barEl  = document.getElementById('tcBar');
  const prevBtn= document.getElementById('tcPrev');
  const nextBtn= document.getElementById('tcNext');
  if(!track) return;

  const cards = Array.from(track.querySelectorAll('.tc'));
  const total = cards.length;
  const gap   = 24;
  let cur     = 0;
  let autoTimer, barTimer, barPct = 0;
  const AUTO_MS = 3800;
  const CARD_W  = () => cards[0].offsetWidth + gap;

  // Build dots
  cards.forEach((_,i)=>{
    const d = document.createElement('div');
    d.className='tdi'+(i===0?' on':'');
    d.addEventListener('click',()=>goTo(i));
    dotsEl.appendChild(d);
  });

  function updateDots(){
    dotsEl.querySelectorAll('.tdi').forEach((d,i)=>{
      d.classList.toggle('on', i===cur);
    });
  }

  function goTo(idx, wrap=false){
    cur = ((idx % total) + total) % total;
    const offset = cur * CARD_W();
    track.style.transform = `translateX(-${offset}px)`;
    updateDots();
    resetBar();
  }

  // Row 2 scrolls in reverse at slower speed
  let row2Pos = 0;
  function animRow2(){
    const cards2 = Array.from(track2.querySelectorAll('.tc'));
    if(!cards2.length) return;
    const w2 = cards2[0].offsetWidth + gap;
    const totalW = w2 * cards2.length;
    row2Pos -= 0.45;
    if(Math.abs(row2Pos) >= totalW/2) row2Pos = 0;
    track2.style.transform = `translateX(${row2Pos}px)`;
    requestAnimationFrame(animRow2);
  }
  // Duplicate row2 for seamless loop
  const orig2 = track2.innerHTML;
  track2.innerHTML = orig2 + orig2;
  animRow2();

  // Progress bar
  function resetBar(){ barPct=0; barEl.style.transition='none'; barEl.style.width='0%'; clearInterval(barTimer);
    setTimeout(()=>{ barEl.style.transition=`width ${AUTO_MS}ms linear`; barEl.style.width='100%'; },30);
  }

  function startAuto(){
    clearInterval(autoTimer);
    autoTimer = setInterval(()=>goTo(cur+1),AUTO_MS);
    resetBar();
  }
  function stopAuto(){ clearInterval(autoTimer); clearInterval(barTimer); barEl.style.transition='none'; }

  prevBtn.addEventListener('click',()=>{ stopAuto(); goTo(cur-1); startAuto(); });
  nextBtn.addEventListener('click',()=>{ stopAuto(); goTo(cur+1); startAuto(); });

  // Pause on hover
  const vp = document.getElementById('testiVp');
  vp.addEventListener('mouseenter', stopAuto);
  vp.addEventListener('mouseleave', startAuto);

  // Touch / swipe
  let tx0=0;
  vp.addEventListener('touchstart',e=>{ tx0=e.touches[0].clientX; },{passive:true});
  vp.addEventListener('touchend',e=>{
    const dx=e.changedTouches[0].clientX-tx0;
    if(Math.abs(dx)>40){ stopAuto(); goTo(dx<0?cur+1:cur-1); startAuto(); }
  },{passive:true});

  startAuto();
})();

/* PARALLAX SCROLL */
const pxBanner = document.getElementById('parallaxBanner');
const pxBg     = document.getElementById('parallaxBg');
function updateParallax(){
  if(!pxBanner||!pxBg) return;
  const rect   = pxBanner.getBoundingClientRect();
  const vh     = window.innerHeight;
  // only run when banner is near viewport
  if(rect.bottom < -200 || rect.top > vh + 200) return;
  const center = rect.top + rect.height / 2 - vh / 2;
  // image travels at 40% of scroll speed → depth feel
  const shift  = center * 0.38;
  pxBg.style.transform = `translateY(${shift}px)`;
}

// In-view reveal
const pxObserver = new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(e.isIntersecting) e.target.classList.add('in-view');
  });
},{threshold:0.15});
if(pxBanner) pxObserver.observe(pxBanner);

window.addEventListener('scroll', updateParallax, {passive:true});
window.addEventListener('resize', updateParallax, {passive:true});
updateParallax();

const hamburger=document.getElementById('hamburger');
const drawer=document.getElementById('drawer');
const drawerClose=document.getElementById('drawerClose');
function openDrawer(){drawer.classList.add('open');hamburger.classList.add('open');document.body.style.overflow='hidden';}
function closeDrawer(){drawer.classList.remove('open');hamburger.classList.remove('open');document.body.style.overflow='';}
hamburger.addEventListener('click',()=>drawer.classList.contains('open')?closeDrawer():openDrawer());
drawerClose.addEventListener('click',closeDrawer);
document.querySelectorAll('.drawer-link,.drawer-cta').forEach(a=>a.addEventListener('click',()=>{closeDrawer();const t=document.querySelector(a.getAttribute('href'));if(t){setTimeout(()=>t.scrollIntoView({behavior:'smooth',block:'start'}),350);}}));

function countUp(el,target,fmt,dur=1800){
  let start;
  const step=ts=>{
    if(!start)start=ts;
    const p=Math.min((ts-start)/dur,1),e=1-Math.pow(1-p,3),v=Math.floor(e*target);
    if(fmt==='K+')el.textContent=(v>=1000?(v/1000).toFixed(1)+'K':v)+'+';
    else el.textContent=v+fmt;
    if(p<1)requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
const co=new IntersectionObserver(es=>es.forEach(e=>{
  if(e.isIntersecting){
    countUp(document.getElementById('s1'),1200,'K+');
    countUp(document.getElementById('s2'),3,'');
    countUp(document.getElementById('s3'),98,'%');
    co.disconnect();
  }
}),{threshold:.5});
co.observe(document.querySelector('.hero-stats'));
// whatsapp
/* ── WHATSAPP WIDGET ── */
(function(){
  const PHONE  = '919876543210'; // ← Replace with your WhatsApp number (country code + number, no + or spaces)
  const fab    = document.getElementById('waFab');
  const panel  = document.getElementById('waPanel');
  const close  = document.getElementById('waClose');
  const input  = document.getElementById('waInput');
  const send   = document.getElementById('waSend');
  const badge  = document.querySelector('.wa-badge');
 
  function openPanel(){
    panel.classList.add('open');
    badge.style.display='none';
    input.focus();
  }
  function closePanel(){ panel.classList.remove('open'); }
 
  fab.addEventListener('click',()=>panel.classList.contains('open') ? closePanel() : openPanel());
  close.addEventListener('click',closePanel);
 
  // Close on outside click
  document.addEventListener('click',e=>{
    if(!e.target.closest('.wa-root')) closePanel();
  });
 
  // Open WhatsApp with a prefilled message
  function waOpenChat(msg){
    const url = `https://wa.me/${PHONE}?text=${encodeURIComponent(msg)}`;
    window.open(url,'_blank','noopener');
  }
  window.waOpenChat = waOpenChat;
 
  // Send custom typed message
  function sendCustom(){
    const msg = input.value.trim();
    if(!msg) return;
    waOpenChat(msg);
    input.value='';
  }
  send.addEventListener('click', sendCustom);
  input.addEventListener('keydown',e=>{ if(e.key==='Enter') sendCustom(); });
 
  // Auto-open after 8 seconds on first visit
  const alreadyOpened = sessionStorage.getItem('wa_opened');
  if(!alreadyOpened){
    setTimeout(()=>{ openPanel(); sessionStorage.setItem('wa_opened','1'); }, 8000);
  }
})();
// ── SCROLL REVEAL ───────────────────────────
const revClasses = ['reveal','reveal-left','reveal-right','reveal-scale','reveal-rotate','reveal-clip'];
const revEls = document.querySelectorAll('.reveal,.reveal-left,.reveal-right,.reveal-scale,.reveal-rotate,.reveal-clip');

const revObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if(!e.isIntersecting) return;
    const el = e.target;
    const delay = parseFloat(el.style.transitionDelay)||0;
    setTimeout(()=> el.classList.add('revealed'), delay*1000);
    revObs.unobserve(el);
  });
},{threshold:0.12, rootMargin:'0px 0px -55px 0px'});

revEls.forEach(el => revObs.observe(el));

