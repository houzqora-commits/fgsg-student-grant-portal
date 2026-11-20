/* ============================================================
   FGSG — portal dock behaviour
   One bar, built once at body level (see index.html). This
   file never creates or destroys it: switching pages or views
   only toggles its visibility and glides the bubble + notch
   to the active tab, so the bar never rebuilds or blinks.

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
     solid blue silhouettes, as in the reference design */
  var FILLED={
    home:'<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 3.1 2.9 11.2c-.38.34-.13.92.38.92h1.7v7.9c0 .5.4.9.9.9h3.9c.5 0 .9-.4.9-.9v-5h2.6v5c0 .5.4.9.9.9h3.9c.5 0 .9-.4.9-.9v-7.9h1.7c.51 0 .76-.58.38-.92L12 3.1Z"/></svg>',
    bank:'<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.7 22 7.5v1.7H2V7.5L12 2.7Z"/><path d="M3.8 11h2.5v6.6H3.8zM8.5 11h2.5v6.6H8.5zM13 11h2.5v6.6H13zM17.7 11h2.5v6.6h-2.5z"/><path d="M2 19.4h20v2H2z"/></svg>',
    application:'<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6.8 2.5h6.7l4.7 4.7v14.3H6.8V2.5Z"/><path d="M13.7 2.8v4.1h4.1" fill="none" stroke="#131418" stroke-width="1.6"/><path d="M9.4 12.6h5.4M9.4 16h5.4" stroke="#131418" stroke-width="1.7" stroke-linecap="round"/></svg>',
    notices:'<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 3.1a5.9 5.9 0 0 0-5.9 5.9c0 4.4-1.6 5.9-2.6 7-.36.4-.05 1.1.5 1.1h16c.55 0 .86-.7.5-1.1-1-1.1-2.6-2.6-2.6-7A5.9 5.9 0 0 0 12 3.1Z"/><path d="M9.9 19.6a2.15 2.15 0 0 0 4.2 0H9.9Z"/></svg>',
    me:'<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="12" cy="7.9" r="4.1"/><path d="M4.6 20.4c.8-3.8 3.8-5.9 7.4-5.9s6.6 2.1 7.4 5.9c.1.55-.32 1-.87 1H5.47c-.55 0-.97-.45-.87-1Z"/></svg>'
  };

  var activeView='home';
  var curX=null;      /* current bubble centre, px from pill left */
  var rafId=null;
  var reduceMotion=window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function centreFor(view){
    var w=pill.clientWidth||dock.clientWidth||0;
    var i=VIEWS.indexOf(view); if(i<0) i=0;
    return (w/VIEWS.length)*(i+0.5);
  }
  function paint(x){
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
    activeView=view;
    tabs.forEach(function(t){ t.classList.toggle('on', t.dataset.dockView===view); });
    bubbleIcon.innerHTML=FILLED[view]||FILLED.home;
    var target=centreFor(view);
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
    var inPortal=!!(appPage && appPage.classList.contains('active'));
    dock.classList.toggle('on', inPortal);
    document.body.classList.toggle('dock-on', inPortal);
    if(inPortal){ setActive(currentViewFromDom(), animate); }
  }

  tabs.forEach(function(t){
    t.addEventListener('click',function(){
      var v=t.dataset.dockView;
      if(v===activeView){ setActive(v,true); return; }
      setActive(v,true);
      if(typeof showView==='function') showView(v);
    });
  });

  /* follow every page / view switch without ever rebuilding:
     wrap the site's own routers, and watch the page/view
     classes as a backstop for any other caller */
  if(typeof window.showView==='function'){
    var origShowView=window.showView;
    window.showView=function(name){ var r=origShowView.apply(this,arguments); syncDock(true); return r; };
  }
  if(typeof window.goPage==='function'){
    var origGoPage=window.goPage;
    window.goPage=function(){ var r=origGoPage.apply(this,arguments); syncDock(true); return r; };
  }
  var queued=false;
  function queueSync(){
    if(queued) return; queued=true;
    requestAnimationFrame(function(){ queued=false; syncDock(true); });
  }
  if(window.MutationObserver){
    var obs=new MutationObserver(queueSync);
    document.querySelectorAll('.page,.view').forEach(function(el){
      obs.observe(el,{attributes:true,attributeFilter:['class']});
    });
  }
  window.addEventListener('resize',function(){ if(dock.classList.contains('on')) setActive(activeView,false); });

  /* first paint: snapped to the current view, no glide */
  syncDock(false);
})();
