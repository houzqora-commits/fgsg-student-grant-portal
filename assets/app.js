/* ============================================================
   FGSG demo — core app logic
   Data lists, page routing (landing / auth / app), auth tabs,
   dock navigation, multi-step application form and uploads.
   Loaded first; liveness.js and payment.js build on this.
   ============================================================ */

var STATES=["Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno","Cross River","Delta","Ebonyi","Edo","Ekiti","Enugu","Gombe","Imo","Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara","Lagos","Nasarawa","Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto","Taraba","Yobe","Zamfara","FCT — Abuja"];
var SCHOOLS=["University of Ibadan (UI)","University of Lagos (UNILAG)","University of Nigeria, Nsukka (UNN)","Obafemi Awolowo University (OAU)","Ahmadu Bello University (ABU), Zaria","University of Benin (UNIBEN)","University of Ilorin (UNILORIN)","University of Calabar (UNICAL)","University of Port Harcourt (UNIPORT)","University of Maiduguri (UNIMAID)","Bayero University Kano (BUK)","Nnamdi Azikiwe University (UNIZIK)","University of Jos (UNIJOS)","University of Abuja (UNIABUJA)","Federal University of Technology, Akure (FUTA)","Federal University of Technology, Minna (FUTMINNA)","Federal University of Technology, Owerri (FUTO)","Lagos State University (LASU)","Rivers State University (RSU)","University of Uyo (UNIUYO)","Yaba College of Technology (YABATECH)","Federal Polytechnic, Ilaro","Federal Polytechnic, Nekede","Kaduna Polytechnic","Auchi Polytechnic","The Polytechnic, Ibadan","Federal Polytechnic, Bida","Kwara State Polytechnic","Akwa Ibom State Polytechnic","Lagos State Polytechnic (LASPOTECH)","Federal Polytechnic, Ede"];
var stateSel=document.getElementById('fState'); STATES.forEach(function(s){var o=document.createElement('option');o.textContent=s;stateSel.appendChild(o);});
var schoolSel=document.getElementById('fSchool'); SCHOOLS.forEach(function(s){var o=document.createElement('option');o.textContent=s;schoolSel.appendChild(o);});

/* heavy libraries load on demand only, so every page opens fast */
var _scriptCache={};
function loadScriptOnce(src){
  if(_scriptCache[src]) return _scriptCache[src];
  _scriptCache[src]=new Promise(function(res,rej){
    var sc=document.createElement('script'); sc.src=src; sc.async=true;
    sc.onload=function(){res();}; sc.onerror=function(){rej(new Error('load failed'));};
    document.head.appendChild(sc);
  });
  return _scriptCache[src];
}

function toast(msg){var t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');setTimeout(function(){t.classList.remove('show')},2600);}

/* ---------- page routing: landing / auth / app are separate pages ---------- */
function goPage(page,authTab){
  if(page!=='app' && typeof liveRunning!=='undefined' && liveRunning && typeof liveReset==='function'){ liveReset(); }
  document.querySelectorAll('.page').forEach(function(p){p.classList.remove('active')});
  var el=document.getElementById('page-'+page); if(el) el.classList.add('active');
  if(page==='auth' && authTab) switchAuthTab(authTab);
  window.scrollTo({top:0});
  if(page==='app'){ requestAnimationFrame(moveDockIndicator); setTimeout(moveDockIndicator,380); }
}
function goLandingAnchor(e,id){
  e.preventDefault(); goPage('landing');
  setTimeout(function(){ var t=document.getElementById(id); if(t) t.scrollIntoView({behavior:'smooth'}); },60);
}
function enterApp(view){ goPage('app'); showView(view||'home'); }
function switchAuthTab(name){
  document.querySelectorAll('[data-auth-tab]').forEach(function(t){t.classList.toggle('on',t.dataset.authTab===name)});
  document.querySelectorAll('[data-auth-panel]').forEach(function(p){p.classList.toggle('on',p.dataset.authPanel===name)});
}
function authEmailOk(v){ return v && v.indexOf('@')>0 && v.indexOf('.')>v.indexOf('@'); }
function authLogin(){
  var e=document.getElementById('authLoginEmail').value.trim(), p=document.getElementById('authLoginPass').value;
  if(!authEmailOk(e)){ toast('Enter a demo email address to log in'); return; }
  if(!p){ toast('Enter a demo password to log in'); return; }
  document.getElementById('fEmail').value=e; document.getElementById('fPass').value=p;
  enterApp('home'); toast('Welcome back — demo login');
}
function authSignup(){
  var n=document.getElementById('authSuName').value.trim(), e=document.getElementById('authSuEmail').value.trim(),
      p=document.getElementById('authSuPass').value, p2=document.getElementById('authSuPass2').value;
  if(!n){ toast('Enter your full name to sign up'); return; }
  if(!authEmailOk(e)){ toast('Enter a demo email address to sign up'); return; }
  if(!p){ toast('Create a demo password to sign up'); return; }
  if(p!==p2){ toast('The two passwords do not match'); return; }
  document.getElementById('fName').value=n; document.getElementById('fEmail').value=e; document.getElementById('fPass').value=p;
  enterApp('application'); toast('Account created — demo only');
}
function authForgot(){
  var e=document.getElementById('authForgotEmail').value.trim();
  if(!authEmailOk(e)){ toast('Enter the email address for the account'); return; }
  document.getElementById('forgotOk').style.display='block';
}
/* dock highlighter: a sliding lime pill glides behind the active tab */
function moveDockIndicator(){
  var btn=document.querySelector('.dock button.active'), ind=document.getElementById('dockIndicator');
  if(!btn||!ind||!btn.offsetParent) return;
  ind.style.left=btn.offsetLeft+'px'; ind.style.width=btn.offsetWidth+'px';
}
window.addEventListener('resize',moveDockIndicator);
window.addEventListener('load',function(){ setTimeout(moveDockIndicator,60); });

/* view switching */
function showView(name){
  if(name!=='application' && typeof liveRunning!=='undefined' && liveRunning && typeof liveReset==='function'){ liveReset(); }
  document.querySelectorAll('.view').forEach(function(v){v.classList.remove('active')});
  var el=document.getElementById('view-'+name); if(el) el.classList.add('active');
  document.querySelectorAll('.dock button').forEach(function(b){b.classList.toggle('active',b.dataset.view===name)});
  requestAnimationFrame(moveDockIndicator);
  if(name==='me') renderProfile();
}
document.querySelectorAll('.dock button').forEach(function(b){b.addEventListener('click',function(){showView(b.dataset.view);});});

/* multi-step form */
var step=1, totalSteps=6, liveDone=false, feeDone=false;
var titles={1:'Create your account',2:'Personal details',3:'Institution & course',4:'Documents & identity',5:'Verification fee — Paystack',6:'Choose payout',7:'Done'};
function renderStep(){
  document.querySelectorAll('.fstep').forEach(function(f){f.classList.toggle('active',+f.dataset.step===step)});
  var shown=Math.min(step,totalSteps);
  document.getElementById('stepTitle').textContent='Step '+shown+' of '+totalSteps+' — '+titles[step];
  var pct=Math.round(shown/totalSteps*100);
  document.getElementById('stepPct').textContent=(step===7?100:pct)+'%';
  document.getElementById('pbar').style.width=(step===7?100:pct)+'%';
  document.getElementById('backBtn').style.visibility= step===1||step===7 ? 'hidden':'visible';
  document.getElementById('nextBtn').textContent= step===6 ? 'Submit Demo Application ✓' : 'Continue →';
  document.getElementById('formNav').style.display= step===7 ? 'none':'flex';
  if(step===5){ var pe=document.getElementById('psEmail'); if(pe) pe.textContent=(val('fEmail')||'demo@fgsg.demo'); }
}
function val(id){return document.getElementById(id).value.trim();}
function validateStep(){
  if(step===1){ if(!val('fEmail')||val('fEmail').indexOf('@')<0){toast('Enter a demo email address to continue');return false;} if(!val('fPass')){toast('Create a demo password to continue');return false;} }
  if(step===2){ if(!val('fName')||!val('fDob')||!val('fState')||!val('fLga')){toast('Complete name, date of birth, state of origin and LGA');return false;} }
  if(step===3){ if(!val('fType')||!val('fLevel')||!val('fSchool')||!val('fDept')){toast('Complete institution type, level, institution and department');return false;} }
  if(step===4){ if(!document.getElementById('upJamb').files.length){toast('Attach your JAMB admission letter (demo file)');return false;} var nin=val('fNin').replace(/\s/g,''); if(!/^\d{11}$/.test(nin)){toast('Enter 11 dummy digits in the NIN demo field');return false;} if(!liveDone){toast('Run the liveness check to continue');return false;} }
  if(step===5){ if(!feeDone){toast('Pay the ₦3,000 verification fee with Paystack to continue');return false;} }
  return true;
}
document.getElementById('nextBtn').addEventListener('click',function(){
  if(step<6){ if(!validateStep())return; step++; renderStep(); window.scrollTo({top:document.getElementById('apply').offsetTop,behavior:'smooth'}); }
  else if(step===6){ submitDemo(); }
});
document.getElementById('backBtn').addEventListener('click',function(){ if(step>1){step--;renderStep();} });

/* uploads */
[['upJamb','okJamb'],['upFees','okFees']].forEach(function(pair){
  document.getElementById(pair[0]).addEventListener('change',function(e){ if(e.target.files.length){var ok=document.getElementById(pair[1]); ok.style.display='block'; ok.textContent='✓ '+e.target.files[0].name+' attached (stays on device)'; }});
});
