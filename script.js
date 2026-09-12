
(() => {
  'use strict';
  document.documentElement.classList.add('js-enabled');
  const menu = document.querySelector('.menu-button');
  const nav = document.querySelector('#site-nav');
  const setMenu = (open) => {
    nav.classList.toggle('is-open', open);
    menu.setAttribute('aria-expanded', String(open));
    menu.querySelector('span').textContent = open ? 'Close' : 'Menu';
  };
  menu.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') !== 'true'));
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('click', (e) => { if (!e.target.closest('.site-header')) setMenu(false); });
  document.addEventListener('keydown', (e) => { if(e.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true'){setMenu(false);menu.focus();} });
  matchMedia('(min-width:651px)').addEventListener('change', (e) => {if(e.matches) setMenu(false);});

  // Illustrative business frameworks, not financial models or live recommendations.
  const examples = {
    margin: {question:'Where is margin really moving?', values:['Price, mix & cost signals','Product & customer definitions','Compare operating levers','Challenge the assumptions','Review the financial result']},
    cash: {question:'What is tying up working capital?', values:['Receivables & inventory','Shared working-capital definitions','Compare cash-release options','Agree ownership & constraints','Review cash-flow movement']},
    investment: {question:'Which investment deserves capital?', values:['Capacity & business demand','Consistent cash-flow assumptions','Compare NPV & payback','Review risk & financial case','Revisit the investment case']}
  };
  const tabs = [...document.querySelectorAll('.map-tabs [role="tab"]')];
  const activateTab = (button) => {
    tabs.forEach(t => {const selected=t===button;t.setAttribute('aria-selected',String(selected));t.tabIndex=selected?0:-1;});
    const example = examples[button.dataset.example];
    document.querySelector('#map-question').textContent = example.question;
    document.querySelectorAll('[data-stage-value]').forEach((n,i) => {n.textContent=example.values[i];});
    document.querySelector('#map-panel').setAttribute('aria-labelledby',button.id);
  };
  tabs.forEach((tab,i) => {
    tab.addEventListener('click',() => activateTab(tab));
    tab.addEventListener('keydown',(e) => {
      let n;
      if(e.key==='ArrowRight') n=(i+1)%tabs.length;
      else if(e.key==='ArrowLeft') n=(i-1+tabs.length)%tabs.length;
      else if(e.key==='Home') n=0;
      else if(e.key==='End') n=tabs.length-1;
      else return;
      e.preventDefault();tabs[n].focus();activateTab(tabs[n]);
    });
  });

  const dialog = document.querySelector('#detail-dialog');
  const dialogContent = document.querySelector('#dialog-content');
  const dialogLabel = document.querySelector('#dialog-label');
  let lastFocus = null;
  let priorHash = '';
  const details = [...document.querySelectorAll('details[data-dialog]')];
  const replaceFragment = (fragment) => {
    try {const url = new URL(location.href);url.hash=fragment;history.replaceState(null,'',url.href);} catch (_) {/* Sandboxed previews may not allow history updates. */}
  };
  const hasNativeDialog = typeof dialog.showModal === 'function';
  const openDetail = (detail, fromHash=false) => {
    if(!hasNativeDialog){detail.open=true;detail.scrollIntoView();return;}
    if(!dialog.open){lastFocus=document.activeElement;priorHash=location.hash.startsWith('#case-')||location.hash==='#privacy'?'#work':location.hash;}
    dialogContent.replaceChildren(detail.querySelector('.detail-panel').cloneNode(true));
    const heading=dialogContent.querySelector('h2,h3');
    if(heading){heading.id='dialog-title';dialog.setAttribute('aria-labelledby','dialog-title');}
    dialogLabel.textContent=detail.dataset.dialog==='privacy'?'Privacy & portfolio boundaries':'Independent portfolio / Case study';
    if(!dialog.open){dialog.showModal();document.body.style.overflow='hidden';}
    dialog.scrollTop=0;
    if(!fromHash && location.hash!=='#'+detail.id){replaceFragment('#'+detail.id);}
  };
  if(hasNativeDialog){
    details.forEach(d => d.querySelector('summary').addEventListener('click', e => {e.preventDefault();openDetail(d);}));
    document.querySelector('.dialog-close').addEventListener('click',() => dialog.close());
    dialog.addEventListener('click',e => {const rect=dialog.getBoundingClientRect();if(e.target===dialog && (e.clientX<rect.left||e.clientX>rect.right||e.clientY<rect.top||e.clientY>rect.bottom)) dialog.close();});
    dialog.addEventListener('close',() => {
      document.body.style.overflow='';
      if(location.hash.startsWith('#case-') || location.hash==='#privacy'){replaceFragment(priorHash);}
      if(lastFocus instanceof HTMLElement) lastFocus.focus({preventScroll:true});
    });
    const handleHash = () => {const d=details.find(x=>'#'+x.id===location.hash);if(d) openDetail(d,true);};
    window.addEventListener('hashchange',handleHash);
    handleHash();
  }

  const copyButton=document.querySelector('.copy-email');
  const status=document.querySelector('#email-status');
  copyButton.addEventListener('click',async() => {
    const email=document.querySelector('#email-address').textContent.trim();
    try {
      if(!navigator.clipboard || !window.isSecureContext) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(email);
      status.textContent='Email address copied.';
    } catch (_) {
      status.textContent='Select the email address above to copy it, or use the Email Aftab button.';
    }
  });

  const progress=document.querySelector('.scroll-progress');
  let scrollQueued=false;
  const updateProgress=() => {
    const available=document.documentElement.scrollHeight-innerHeight;
    progress.style.width=(available>0?Math.min(100,100*scrollY/available):0)+'%';
    scrollQueued=false;
  };
  window.addEventListener('scroll',() => {if(!scrollQueued){requestAnimationFrame(updateProgress);scrollQueued=true;}},{passive:true});
  window.addEventListener('resize',updateProgress);
  updateProgress();
  if('IntersectionObserver' in window){
    const navSections=[...document.querySelectorAll('main>section[id]')];
    const observer=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){nav.querySelectorAll('a').forEach(a=>a.removeAttribute('aria-current'));const active=nav.querySelector('a[href="#'+entry.target.id+'"]');if(active)active.setAttribute('aria-current','location');}
      });
    },{rootMargin:'-18% 0px -60% 0px',threshold:0});
    navSections.forEach(section=>observer.observe(section));
  }
})();
