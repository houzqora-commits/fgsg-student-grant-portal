/* ============================================================
   FGSG — portal dock behaviour
   One bar, built once at body level (see index.html), locked
   to the bottom by CSS. This file never creates, destroys,
   moves or repositions it: the bar element itself is never
   touched after load. Page and view switches only (a) toggle
   its visibility when entering or leaving the portal, and
   (b) glide the bubble + notch inside it to the active tab.

   Every sync is idempotent — if the portal state, the active
   view and the pill width have not changed, sync does nothing
   at all: no class writes, no style writes, no repaint. There
   is deliberately NO MutationObserver and NO second sync path:
   the single sync entry point is the showView / goPage wrap
   below (plus tab taps and window resize), so nothing can
   fight the bar or make it glitch.

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
  var paintedW=0;        /* pill width at the last paint */
  var rafId=null;
  var reduceMotion=window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function centreFor(view){
    var w=pill.clientWidth||dock.clientWidth||0;
    var i=VIEWS.indexOf(view); if(i<0) i=0;
    return (w/VIEWS.length)*(i+0.5);
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
    if(curX===null || reduceMotion){ curX=target; paint(curX); return; }
    if(rafId) cancelAnimationFrame(rafId);
    var from=curX, start=null, dur=460;
    function frame(ts){
      if(start===null) start=ts;
      var t=Math.min(1,(ts-start)/dur);
      var e=1-Math.pow(1-t,4); /* easeOutQuart — quick, then settles */
      curX=from+(target-from)*e;
      paint(curX);
      if(t<1){ rafId=requestAnimationFrame(frame); } else { rafId=null; curX=target; paint(curX); }
    }
    rafId=requestAnimationFrame(frame);
  }
  function setActive(view, animate){
    if(VIEWS.indexOf(view)<0) view='home';
    var w=pill.clientWidth||dock.clientWidth||0;
    var target=centreFor(view);
    /* already marking this view at this width: touch nothing */
    if(view===activeView && w===paintedW && curX!==null && Math.abs(target-curX)<0.01) return;
    var viewChanged=view!==activeView;
    activeView=view;
    paintedW=w;
    if(viewChanged){
      tabs.forEach(function(t){ t.classList.toggle('on', t.dataset.dockView===view); });
      bubbleIcon.innerHTML=FILLED[view]||FILLED.home;
    }
    if(animate && curX!==null && Math.abs(target-curX)>1){ glideTo(target); }
    else { if(rafId){ cancelAnimationFrame(rafId); rafId=null; } curX=target; paint(curX); }
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
      setActive(v,true);
      if(typeof showView==='function') showView(v);
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
  window.addEventListener('resize',function(){ if(inPortal) setActive(activeView,false); });

  /* first paint: snapped to the current view, no glide */
  syncDock(false);
})();
