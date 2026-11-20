/* ============================================================
   FGSG — Supabase Auth
   Accounts now live in Supabase Auth (project
   uhtgwnunvyduneoqsbxz), not in this browser. Sign up, log in,
   log out and the session are all Supabase; the session is
   restored on load and kept in sync with onAuthStateChange.
   Only a small in-memory cache of the signed-in user is kept
   here so the rest of the site (goPage, draft keys, Wallet ID)
   can ask synchronously who is signed in — no passwords, NIN,
   documents or bank details are ever stored by this file.
   The application draft itself still saves in this browser
   (app.js), keyed by the signed-in email, exactly as before.
   Loaded after supabase-client.js, before app.js.
   ============================================================ */

var FGSGAuth = (function(){
  var _cacheUser = null; /* {id, name, email, createdAt} | null */
  var _ready = false;
  var _readyWaiters = [];

  function normalizeEmail(e){ return String(e||'').trim().toLowerCase(); }
  function validEmail(e){ return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(normalizeEmail(e)); }
  function passwordError(pw){
    pw=String(pw||'');
    if(pw.length<8) return 'Password must be at least 8 characters';
    if(!/[A-Za-z]/.test(pw)) return 'Password must include at least one letter';
    if(!/[0-9]/.test(pw)) return 'Password must include at least one number';
    return '';
  }
  function toCacheUser(su){
    if(!su) return null;
    var meta=su.user_metadata||{};
    return {
      id: su.id,
      name: meta.full_name || meta.name || (su.email?su.email.split('@')[0]:'Student'),
      email: normalizeEmail(su.email||''),
      createdAt: su.created_at || null
    };
  }
  function setCache(su){
    _cacheUser = toCacheUser(su);
    return _cacheUser;
  }
  function markReady(){
    if(_ready) return;
    _ready=true;
    var w=_readyWaiters.slice(); _readyWaiters=[];
    w.forEach(function(fn){ try{ fn(_cacheUser); }catch(e){} });
  }
  function whenReady(){
    if(_ready) return Promise.resolve(_cacheUser);
    return new Promise(function(res){ _readyWaiters.push(res); });
  }
  function dbReady(){
    return (typeof fgsgDb!=='undefined' && fgsgDb) ? fgsgDb : null;
  }
  /* Restore the Supabase session on load and keep the cache in
     sync for the whole visit (login, logout, token refresh). */
  function init(){
    var db=dbReady();
    if(!db){ markReady(); return; }
    db.auth.getSession().then(function(res){
      var session=res && res.data ? res.data.session : null;
      setCache(session?session.user:null);
      markReady();
      if(typeof updateAuthUI==='function') updateAuthUI();
      if(typeof fgsgRefreshSerial==='function') fgsgRefreshSerial();
    }).catch(function(){ markReady(); });
    db.auth.onAuthStateChange(function(_event, session){
      setCache(session?session.user:null);
      markReady();
      if(typeof updateAuthUI==='function') updateAuthUI();
      if(session && typeof fgsgRefreshSerial==='function') fgsgRefreshSerial();
    });
  }
  function currentUser(){ return _cacheUser; }
  function currentSession(){ return _cacheUser ? { email:_cacheUser.email, userId:_cacheUser.id } : null; }
  /* Legacy helpers kept for app.js Step-1 / callers: with
     Supabase there is no local user table to look up, and a
     password can only be checked by signing in. */
  function findUser(email){
    if(_cacheUser && _cacheUser.email===normalizeEmail(email)) return _cacheUser;
    return null;
  }
  function verifyPassword(){ return Promise.resolve(!!_cacheUser); }
  function startSession(){ return currentSession(); }
  function storageOk(){
    try{ var k='__fgsg_test__'; localStorage.setItem(k,'1'); localStorage.removeItem(k); return true; }
    catch(e){ return false; }
  }
  function friendlyError(err){
    var m=(err && err.message) ? String(err.message) : 'Something went wrong — try again';
    if(/already registered|already exists|user already/i.test(m)) return 'An account with this email already exists — log in instead';
    if(/invalid login credentials/i.test(m)) return 'Email or password is incorrect';
    if(/email not confirmed/i.test(m)) return 'Confirm your email first — open the confirmation link sent to your inbox, then log in';
    return m;
  }
  function signup(name, email, password){
    name=String(name||'').trim(); email=normalizeEmail(email);
    if(name.length<2) return Promise.reject(new Error('Enter your full name to sign up'));
    if(!validEmail(email)) return Promise.reject(new Error('Enter a valid email address to sign up'));
    var perr=passwordError(password);
    if(perr) return Promise.reject(new Error(perr));
    var db=dbReady();
    if(!db) return Promise.reject(new Error('Supabase is not available — check your connection and try again'));
    return db.auth.signUp({ email:email, password:password, options:{ data:{ full_name:name } } })
      .then(function(res){
        if(res.error) throw new Error(friendlyError(res.error));
        var data=res.data||{};
        if(data.user && data.session){ setCache(data.user); return _cacheUser; }
        if(data.user && !data.session){
          /* Email confirmation is on for this project: the
             account exists in Supabase but there is no session
             until the inbox link is opened. */
          var e=new Error('Account created — confirm your email, then log in. Open the confirmation link sent to '+email+'.');
          e.code='EMAIL_CONFIRMATION_REQUIRED';
          throw e;
        }
        throw new Error('The account could not be created — try again');
      });
  }
  function login(email, password){
    email=normalizeEmail(email);
    if(!validEmail(email)) return Promise.reject(new Error('Enter a valid email address to log in'));
    if(!password) return Promise.reject(new Error('Enter your password to log in'));
    var db=dbReady();
    if(!db) return Promise.reject(new Error('Supabase is not available — check your connection and try again'));
    return db.auth.signInWithPassword({ email:email, password:password })
      .then(function(res){
        if(res.error) throw new Error(friendlyError(res.error));
        setCache(res.data.user);
        return _cacheUser;
      });
  }
  /* Supabase resets by email: a reset link is sent to the
     inbox and the new password is set from that link. The new
     password fields on the form are validated locally first so
     a weak or mismatched password is caught before sending. */
  function resetPassword(email, newPassword){
    email=normalizeEmail(email);
    if(!validEmail(email)) return Promise.reject(new Error('Enter the email address for the account'));
    var perr=passwordError(newPassword);
    if(perr) return Promise.reject(new Error(perr));
    var db=dbReady();
    if(!db) return Promise.reject(new Error('Supabase is not available — check your connection and try again'));
    return db.auth.resetPasswordForEmail(email).then(function(res){
      if(res.error) throw new Error(friendlyError(res.error));
      return true;
    });
  }
  function logout(){
    var db=dbReady();
    _cacheUser=null;
    if(db){ db.auth.signOut().catch(function(){}); }
  }
  /* Client apps cannot delete the Supabase auth user itself;
     deleting here removes this user's profile row (RLS: own
     row only) and signs out. The auth record is removed from
     the Supabase dashboard for a full deletion. */
  function deleteAccount(){
    var u=_cacheUser; if(!u) return Promise.resolve(false);
    var db=dbReady();
    _cacheUser=null;
    if(!db) return Promise.resolve(true);
    return db.from('profiles').delete().eq('id', u.id)
      .then(function(){ return db.auth.signOut(); })
      .then(function(){ return true; })
      .catch(function(){ return true; });
  }
  init();
  return {
    validEmail:validEmail, passwordError:passwordError, findUser:findUser,
    verifyPassword:verifyPassword, startSession:startSession,
    currentSession:currentSession, currentUser:currentUser,
    signup:signup, login:login, resetPassword:resetPassword,
    logout:logout, deleteAccount:deleteAccount, storageOk:storageOk,
    whenReady:whenReady
  };
})();

/* ---------- auth UI wiring (login / signup / reset / logout) ---------- */
function escapeHtml(s){
  return String(s||'').replace(/[&<>"']/g,function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
  });
}
function setAuthMsg(id, msg, ok){
  var el=document.getElementById(id);
  if(!el) return;
  el.textContent=msg||'';
  el.className='auth-msg'+(msg?(' show '+(ok?'ok':'err')):'');
}
function updateAuthUI(){
  var user=FGSGAuth.currentUser();
  var loginLink=document.getElementById('navLoginLink');
  var applyLink=document.getElementById('navApplyLink');
  if(loginLink){
    loginLink.textContent=user?('Hi, '+user.name.split(' ')[0]):'Log in';
    loginLink.onclick=function(){ if(user){ goPage('app'); } else { goPage('auth','login'); } return false; };
  }
  if(applyLink){
    if(user){
      applyLink.style.display='none';
    } else {
      applyLink.style.display='';
      applyLink.textContent='Apply Now';
      applyLink.onclick=function(){ goPage('auth','signup'); return false; };
    }
  }
  var heroBtn=document.getElementById('heroCtaBtn');
  if(heroBtn){
    if(user){
      heroBtn.textContent='Dashboard';
      heroBtn.onclick=function(){ goPage('app'); return false; };
    } else {
      heroBtn.textContent='Start Application →';
      heroBtn.onclick=function(){ goPage('auth','signup'); return false; };
    }
  }
  var box=document.getElementById('accountBox');
  if(box){
    if(user){
      var since='';
      try{ since=new Date(user.createdAt).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'}); }catch(e){}
      box.innerHTML='<b>'+escapeHtml(user.name)+'</b><br>'+escapeHtml(user.email)+
        (since?'<br><span>'+escapeHtml(since)+'</span>':'')+
        '<br><span>Serial No. · </span><b data-serial-value>'+escapeHtml(window.__fgsgSerial||'0100')+'</b>';
    } else {
      box.innerHTML='Not signed in.';
    }
  }
  if(user){
    var fe=document.getElementById('fEmail'); if(fe && !fe.value) fe.value=user.email;
    var fn=document.getElementById('fName'); if(fn && !fn.value) fn.value=user.name;
  }
  if(typeof renderWalletId==='function') renderWalletId();
  if(typeof fgsgRenderSerial==='function' && window.__fgsgSerial) fgsgRenderSerial(window.__fgsgSerial, window.__fgsgLiveCount);
}
function authSetBusy(btnId, busy, label){
  var b=document.getElementById(btnId);
  if(!b) return;
  if(busy){ b.dataset.label=b.textContent; b.disabled=true; b.textContent='Checking…'; }
  else { b.disabled=false; if(label) b.textContent=label; else if(b.dataset.label) b.textContent=b.dataset.label; }
}
function authLogin(){
  var e=document.getElementById('authLoginEmail').value, p=document.getElementById('authLoginPass').value;
  setAuthMsg('loginMsg','');
  authSetBusy('loginBtn', true);
  FGSGAuth.login(e,p).then(function(user){
    authSetBusy('loginBtn', false);
    document.getElementById('fEmail').value=user.email;
    document.getElementById('fPass').value=p;
    var fn=document.getElementById('fName'); if(fn && !fn.value) fn.value=user.name;
    updateAuthUI();
    if(typeof fgsgRefreshSerial==='function') fgsgRefreshSerial();
    enterApp('home');
    toast('Welcome back, '+user.name.split(' ')[0]);
  }).catch(function(err){
    authSetBusy('loginBtn', false);
    setAuthMsg('loginMsg', err.message);
  });
}
function authSignup(){
  var n=document.getElementById('authSuName').value, e=document.getElementById('authSuEmail').value,
      p=document.getElementById('authSuPass').value, p2=document.getElementById('authSuPass2').value;
  setAuthMsg('signupMsg','');
  if(p!==p2){ setAuthMsg('signupMsg','The two passwords do not match'); return; }
  authSetBusy('signupBtn', true);
  FGSGAuth.signup(n,e,p).then(function(user){
    authSetBusy('signupBtn', false);
    document.getElementById('fName').value=user.name;
    document.getElementById('fEmail').value=user.email;
    document.getElementById('fPass').value=p;
    updateAuthUI();
    if(typeof fgsgRefreshSerial==='function') fgsgRefreshSerial();
    enterApp('application');
    toast('Account created');
  }).catch(function(err){
    authSetBusy('signupBtn', false);
    if(err && err.code==='EMAIL_CONFIRMATION_REQUIRED'){
      setAuthMsg('signupMsg', err.message, true);
      var le=document.getElementById('authLoginEmail'); if(le) le.value=e.trim().toLowerCase();
    } else {
      setAuthMsg('signupMsg', err.message);
    }
  });
}
/* Supabase sends the reset link by email; the new password is
   set from that link, not on this device. */
function authForgot(){
  var e=document.getElementById('authForgotEmail').value,
      p=document.getElementById('authForgotPass').value, p2=document.getElementById('authForgotPass2').value;
  setAuthMsg('forgotMsg','');
  document.getElementById('forgotOk').style.display='none';
  if(p!==p2){ setAuthMsg('forgotMsg','The two passwords do not match'); return; }
  authSetBusy('forgotBtn', true);
  FGSGAuth.resetPassword(e,p).then(function(){
    authSetBusy('forgotBtn', false);
    var ok=document.getElementById('forgotOk');
    ok.innerHTML='<b>Reset link sent.</b> Open the link in your email to set your new password.';
    ok.style.display='block';
    document.getElementById('authLoginEmail').value=e.trim().toLowerCase();
    setAuthMsg('forgotMsg','');
  }).catch(function(err){
    authSetBusy('forgotBtn', false);
    setAuthMsg('forgotMsg', err.message);
  });
}
function authLogout(){
  FGSGAuth.logout();
  var lp=document.getElementById('authLoginPass'); if(lp) lp.value='';
  var fp=document.getElementById('fPass'); if(fp) fp.value='';
  updateAuthUI();
  goPage('landing');
  toast('Logged out');
}
function authDeleteAccount(){
  var btn=document.getElementById('deleteAcctBtn');
  if(btn && !btn.dataset.armed){
    btn.dataset.armed='1';
    btn.textContent='Tap again to confirm delete';
    setTimeout(function(){ if(btn){ delete btn.dataset.armed; btn.textContent='Delete Account'; } }, 4000);
    return;
  }
  var delUser=FGSGAuth.currentUser();
  var done=function(){
    if(delUser){ try{ localStorage.removeItem('fgsg_draft_v1_'+delUser.email); localStorage.removeItem('fgsg_wallet_id_v1_'+delUser.email); }catch(e){} }
    if(btn){ delete btn.dataset.armed; btn.textContent='Delete Account'; }
    updateAuthUI();
    goPage('landing');
    toast('Account deleted');
  };
  var result=FGSGAuth.deleteAccount();
  if(result && typeof result.then==='function'){ result.then(done).catch(done); }
  else if(result){ done(); }
}
/* ---------- password peek: eye toggle on every password field ---------- */
var PEEK_EYE='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>';
var PEEK_EYE_OFF='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 3l18 18"/><path d="M10.6 5.1A9.8 9.8 0 0 1 12 5c6.5 0 10 7 10 7a17.6 17.6 0 0 1-3.2 3.9"/><path d="M6.6 6.9A16.9 16.9 0 0 0 2 12s3.5 7 10 7a9.7 9.7 0 0 0 4.4-1.2"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg>';
function initPasswordPeeks(){
  document.querySelectorAll('input[type="password"]').forEach(function(inp){
    if(inp.dataset.peek) return;
    inp.dataset.peek='1';
    var wrap=document.createElement('span');
    wrap.className='pw-wrap';
    inp.parentNode.insertBefore(wrap, inp);
    wrap.appendChild(inp);
    var btn=document.createElement('button');
    btn.type='button';
    btn.className='pw-peek';
    btn.setAttribute('aria-label','Show password');
    btn.innerHTML=PEEK_EYE;
    btn.addEventListener('click',function(){
      var show=inp.type==='password';
      inp.type=show?'text':'password';
      btn.classList.toggle('on',show);
      btn.setAttribute('aria-label',show?'Hide password':'Show password');
      btn.innerHTML=show?PEEK_EYE_OFF:PEEK_EYE;
      try{ inp.focus(); }catch(e){}
    });
    wrap.appendChild(btn);
  });
}
initPasswordPeeks();

window.addEventListener('load', function(){ updateAuthUI(); });
