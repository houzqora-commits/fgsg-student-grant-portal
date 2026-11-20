/* ============================================================
   FGSG — portal dock behaviour
   One bar, built once at body level (see index.html), locked
   to the bottom by CSS. Page and view switches never
   re-create or rebuild it; its visibility flips only when
   entering or leaving the portal, never between the portal's
   own views.

   Steadiness rules (the bar must not drop, pop, flicker,
   jump sideways or re-layout when switching between Home,
   Bank, Application, Notices and Me):
   - The pill width is measured ONCE at load and re-measured
     ONLY when the window WIDTH actually changes. A view
     switch never reads layout, so it can never force a
     reflow or re-centre the bar.
   - Height-only resizes (the mobile browser chrome sliding
     in and out while pages change height) are ignored
     completely — the bar does not react to them at all.
   - There is exactly ONE sync path (the showView / goPage
     wrap below, plus tab taps through that same wrap) and
     exactly ONE glide: a tap never starts a second glide,
     and a sync that finds the bubble already on — or already
     gliding to — the active tab touches nothing at all.

   The bubble and the notch are driven from the SAME animated
   x on every frame — the bubble by transform, the notch by
   the pill background's radial mask — so the notch is always
   exactly around the bubble.
   ============================================================ */
(function(){
  var dock=document.getElementById('fgsgDock');
  if(!dock) return;
  var pill=document.getElementById('dockPill');
  var bg=document.getElementById('dockBg');
  var bubble=document.getElementById('dockBubble');
  var bubbleIcon=document.getElementById('dockBubbleIcon');
  var tabs=Array.prototype.slice.call(dock.querySelectorAll('.dock-tab'));
  var VIEWS=['home','bank','application','notices','me'];
  var NOTCH_R=35; /* bubble radius 28 + 7px gap ring */

  /* filled versions of the tab icons, shown in the bubble —
     solid green silhouettes, as in the reference design */
  var FILLED={
    home:'<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 3.1 2.9 11.2c-.38.34-.13.92.38.92h1.7v7.9c0 .5.4.9.9.9h3.9c.5 0 .9-.4.9-.9v-5h2.6v5c0 .5.4.9.9.9h3.9c.5 0 .9-.4.9-.9v-7.9h1.7c.51 0 .76-.58.38-.92L12 3.1Z"/></svg>',
    bank:'<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.7 22 7.5v1.7H2V7.5L12 2.7Z"/><path d="M3.8 11h2.5v6.6H3.8zM8.5 11h2.5v6.6H8.5zM13 11h2.5v6.6H13zM17.7 11h2.5v6.6h-2.5z"/><path d="M2 19.4h20v2H2z"/></svg>',
    application:'<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6.8 2.5h6.7l4.7 4.7v14.3H6.8V2.5Z"/><path d="M13.7 2.8v4.1h4.1" fill="none" stroke="#131418" stroke-width="1.6"/><path d="M9.4 12.6h5.4M9.4 16h5.4" stroke="#131418" stroke-width="1.7" stroke-linecap="round"/></svg>',
    notices:'<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 3.1a5.9 5.9 0 0 0-5.9 5.9c0 4.4-1.6 5.9-2.6 7-.36.4-.05 1.1.5 1.1h16c.55 0 .86-.7.5-1.1-1-1.1-2.6-2.6-2.6-7A5.9 5.9 0 0 0 12 3.1Z"/><path d="M9.9 19.6a2.15 2.15 0 0 0 4.2 0H9.9Z"/></svg>',
    me:'<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="12" cy="7.9" r="4.1"/><path d="M4.6 20.4c.8-3.8 3.8-5.9 7.4-5.9s6.6 2.1 7.4 5.9c.1.55-.32 1-.87 1H5.47c-.55 0-.97-.45-.87-1Z"/></svg>'
  };

  var activeView=null;   /* view the bubble currently marks */
  var inPortal=null;     /* last synced portal visibility */
  var curX=null;         /* current bubble centre, px from pill left */
  var paintedX=null;     /* last x actually written to the DOM */
  var pillW=0;           /* pill width, measured once (see measure) */
  var lastInnerW=window.innerWidth||0;
  var rafId=null;
  var glideTarget=null;  /* x the running glide is heading to */
  var reduceMotion=window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* The ONLY place layout is read. Called when the bar first
     appears in the portal, and again only after the window
     width has really changed — never during a page or view
     switch. (While the bar is hidden outside the portal it
     has no width to read, so a zero read keeps the last
     good measurement.) */
  function measure(){
    var w=pill.clientWidth||dock.clientWidth||0;
    if(w) pillW=w;
  }
  function centreFor(view){
    var i=VIEWS.indexOf(view); if(i<0) i=0;
    return (pillW/VIEWS.length)*(i+0.5);
  }
  function paint(x){
    if(paintedX!==null && Math.abs(x-paintedX)<0.01) return; /* no repaint for no movement */
    paintedX=x;
    bubble.style.transform='translate('+(x-28)+'px,-28px)';
    var mask='radial-gradient(circle '+NOTCH_R+'px at '+x+'px 0px, transparent '+(NOTCH_R-1)+'px, #000 '+NOTCH_R+'px)';
    bg.style.webkitMaskImage=mask;
    bg.style.maskImage=mask;
  }
  function glideTo(target){
    if(rafId && glideTarget===target) return; /* already gliding there — never restart */
    if(curX===null || reduceMotion){ curX=target; glideTarget=null; paint(curX); return; }
    if(rafId) cancelAnimationFrame(rafId);
    glideTarget=target;
    var from=curX, start=null, dur=460;
    function frame(ts){
      if(start===null) start=ts;
      var t=Math.min(1,(ts-start)/dur);
      var e=1-Math.pow(1-t,4); /* easeOutQuart — quick, then settles */
      curX=from+(target-from)*e;
      paint(curX);
      if(t<1){ rafId=requestAnimationFrame(frame); } else { rafId=null; glideTarget=null; curX=target; paint(curX); }
    }
    rafId=requestAnimationFrame(frame);
  }
  function setActive(view, animate){
    if(VIEWS.indexOf(view)<0) view='home';
    if(!pillW) measure(); /* first appearance in the portal: measure once, then never again on a switch */
    var target=centreFor(view);
    var viewChanged=view!==activeView;
    if(!viewChanged){
      if(rafId && glideTarget===target) return; /* already on its way there */
      if(!rafId && curX!==null && Math.abs(target-curX)<0.01) return; /* already there: touch nothing */
    }
    activeView=view;
    if(viewChanged){
      tabs.forEach(function(t){ t.classList.toggle('on', t.dataset.dockView===view); });
      bubbleIcon.innerHTML=FILLED[view]||FILLED.home;
    }
    if(animate && curX!==null && Math.abs(target-curX)>1){ glideTo(target); }
    else { if(rafId){ cancelAnimationFrame(rafId); rafId=null; } glideTarget=null; curX=target; paint(curX); }
  }
  function currentViewFromDom(){
    var active=document.querySelector('.view.active');
    if(active && active.id && active.id.indexOf('view-')===0){
      var v=active.id.slice(5);
      if(VIEWS.indexOf(v)>=0) return v;
    }
    return (typeof currentViewName!=='undefined' && VIEWS.indexOf(currentViewName)>=0)?currentViewName:'home';
  }
  function syncDock(animate){
    var appPage=document.getElementById('page-app');
    var portalNow=!!(appPage && appPage.classList.contains('active'));
    if(portalNow!==inPortal){
      inPortal=portalNow;
      dock.classList.toggle('on', portalNow);
      document.body.classList.toggle('dock-on', portalNow);
    }
    if(portalNow){ setActive(currentViewFromDom(), animate); }
  }

  tabs.forEach(function(t){
    t.addEventListener('click',function(){
      var v=t.dataset.dockView;
      if(v===activeView) return; /* already there: no repaint, no re-glide */
      /* Go through showView only — its wrap below is the single
         sync path, so the bubble glides exactly once. Setting
         the active tab here as well used to start a first glide
         that the sync then cancelled and restarted (a visible
         stutter in the bar on every tap). */
      if(typeof window.showView==='function') window.showView(v);
      else setActive(v,true);
    });
  });

  /* follow page / view switches through the site's own routers
     only — the one and only sync path */
  if(typeof window.showView==='function'){
    var origShowView=window.showView;
    window.showView=function(name){ var r=origShowView.apply(this,arguments); syncDock(true); return r; };
  }
  if(typeof window.goPage==='function'){
    var origGoPage=window.goPage;
    window.goPage=function(){ var r=origGoPage.apply(this,arguments); syncDock(true); return r; };
  }
  /* Resize: react ONLY to a real width change (rotation, a
     wider/narrower window). Height-only resizes — the mobile
     browser chrome sliding in and out as pages change height —
     are ignored, so they can never make the bar drop or pop. */
  window.addEventListener('resize',function(){
    var w=window.innerWidth||0;
    if(w===lastInnerW) return;
    lastInnerW=w;
    measure();
    if(inPortal && activeView) setActive(activeView,false);
  });

  /* first sync: snapped to the current view, no glide. The
     width itself is measured when the bar first appears in
     the portal (see setActive), not on every switch. */
  syncDock(false);
})();
