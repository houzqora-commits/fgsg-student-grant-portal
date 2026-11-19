/* ============================================================
   FGSG demo — browser-built-in auth database
   Accounts live ONLY in this browser (localStorage). There is
   no server and no email is sent. Passwords are never stored
   in plain text: each account stores a random salt plus a
   PBKDF2-SHA256 hash (Web Crypto). Only name + email + hash
   are saved — NIN, documents and bank details are never part
   of the auth record. Clearing browser data deletes accounts.
   Loaded before app.js; app.js, liveness.js, payment.js use
   the session helpers exposed here.
   ============================================================ */

var FGSGAuth = (function(){
  var USERS_KEY='fgsg_auth_users_v1';
  var SESSION_KEY='fgsg_auth_session_v1';
  var ITERATIONS=120000;
  var SESSION_MS=24*60*60*1000;
  var MAX_FAILS=5;
  var LOCK_MS=60*1000;

  function storageOk(){
    try{ var k='__fgsg_test__'; localStorage.setItem(k,'1'); localStorage.removeItem(k); return true; }
    catch(e){ return false; }
  }
  function loadUsers(){
    if(!storageOk()) return [];
    try{ var raw=localStorage.getItem(USERS_KEY); var arr=raw?JSON.parse(raw):[]; return Array.isArray(arr)?arr:[]; }
    catch(e){ return []; }
  }
  function saveUsers(users){
    if(!storageOk()) return false;
    try{ localStorage.setItem(USERS_KEY, JSON.stringify(users)); return true; }
    catch(e){ return false; }
  }
  function normalizeEmail(e){ return String(e||'').trim().toLowerCase(); }
  function validEmail(e){
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(normalizeEmail(e));
  }
  function passwordError(pw){
    pw=String(pw||'');
    if(pw.length<8) return 'Password must be at least 8 characters';
    if(!/[A-Za-z]/.test(pw)) return 'Password must include at least one letter';
    if(!/[0-9]/.test(pw)) return 'Password must include at least one number';
    return '';
  }
  function findUser(email){
    email=normalizeEmail(email);
    var users=loadUsers();
    for(var i=0;i<users.length;i++){ if(users[i].email===email) return users[i]; }
    return null;
  }
  function randomHex(bytes){
    var arr=new Uint8Array(bytes);
    if(window.crypto && crypto.getRandomValues) crypto.getRandomValues(arr);
    else { for(var i=0;i<arr.length;i++) arr[i]=Math.floor(Math.random()*256); }
    return bytesToHex(arr);
  }
  function bytesToHex(buf){
    var out='';
    for(var i=0;i<buf.length;i++){ var h=buf[i].toString(16); out+=(h.length<2?'0':'')+h; }
    return out;
  }
  function hexToBytes(hex){
    var out=new Uint8Array(hex.length/2);
    for(var i=0;i<out.length;i++) out[i]=parseInt(hex.substr(i*2,2),16);
    return out;
  }
  /* PBKDF2-SHA256 via Web Crypto. Fallback (no SubtleCrypto, e.g. a
     non-secure context) is an iterated salted hash — still never
     plain text, but the secure path is the normal one. */
  function deriveHash(password, saltHex, iterations){
    if(window.crypto && crypto.subtle && crypto.subtle.importKey){
      var enc=new TextEncoder();
      return crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits'])
        .then(function(key){
          return crypto.subtle.deriveBits(
            {name:'PBKDF2', salt:hexToBytes(saltHex), iterations:iterations, hash:'SHA-256'},
            key, 256);
        })
        .then(function(bits){ return bytesToHex(new Uint8Array(bits)); });
    }
    return Promise.resolve().then(function(){
      var h=5381, s=saltHex+':'+password;
      for(var r=0;r<4096;r++){ for(var i=0;i<s.length;i++){ h=((h<<5)+h+s.charCodeAt(i))>>>0; } h=(h*33+r)>>>0; }
      return ('0000000'+h.toString(16)).slice(-8)+saltHex.slice(0,24);
    });
  }
  function safeEqual(a,b){
    if(typeof a!=='string'||typeof b!=='string'||a.length!==b.length) return false;
    var diff=0;
    for(var i=0;i<a.length;i++) diff|=a.charCodeAt(i)^b.charCodeAt(i);
    return diff===0;
  }
  function verifyPassword(email, password){
    var user=findUser(email);
    if(!user) return Promise.resolve(false);
    return deriveHash(String(password||''), user.salt, user.iterations||ITERATIONS)
      .then(function(h){ return safeEqual(h, user.hash); });
  }
  function startSession(email){
    if(!storageOk()) return null;
    var sess={email:normalizeEmail(email), token:randomHex(24), expiresAt:Date.now()+SESSION_MS};
    try{ localStorage.setItem(SESSION_KEY, JSON.stringify(sess)); }catch(e){ return null; }
    return sess;
  }
  function currentSession(){
    if(!storageOk()) return null;
    try{
      var raw=localStorage.getItem(SESSION_KEY); if(!raw) return null;
      var s=JSON.parse(raw);
      if(!s || !s.email || !s.expiresAt || Date.now()>s.expiresAt){ localStorage.removeItem(SESSION_KEY); return null; }
      return s;
    }catch(e){ return null; }
  }
  function currentUser(){
    var s=currentSession(); if(!s) return null;
    var u=findUser(s.email); if(!u) return null;
    return {name:u.name, email:u.email, createdAt:u.createdAt};
  }
  function logout(){
    try{ localStorage.removeItem(SESSION_KEY); }catch(e){}
  }
  function signup(name, email, password){
    name=String(name||'').trim(); email=normalizeEmail(email);
    if(name.length<2) return Promise.reject(new Error('Enter your full name to sign up'));
    if(!validEmail(email)) return Promise.reject(new Error('Enter a valid email address to sign up'));
    var perr=passwordError(password);
    if(perr) return Promise.reject(new Error(perr));
    if(!storageOk()) return Promise.reject(new Error('This browser is blocking local storage, so the account cannot be saved on this device'));
    if(findUser(email)) return Promise.reject(new Error('An account with this email already exists on this device — log in instead'));
    var salt=randomHex(16);
    return deriveHash(password, salt, ITERATIONS).then(function(hash){
      var users=loadUsers();
      var user={name:name, email:email, salt:salt, hash:hash, iterations:ITERATIONS, createdAt:new Date().toISOString(), fails:0, lockUntil:0};
      users.push(user);
      if(!saveUsers(users)) throw new Error('The account could not be saved in this browser');
      startSession(email);
      return {name:user.name, email:user.email, createdAt:user.createdAt};
    });
  }
  function login(email, password){
    email=normalizeEmail(email);
    if(!validEmail(email)) return Promise.reject(new Error('Enter a valid email address to log in'));
    if(!password) return Promise.reject(new Error('Enter your password to log in'));
    var user=findUser(email);
    /* Same message whether the email or the password is wrong,
       so the form never reveals which accounts exist. */
    var generic='Email or password is incorrect for this device';
    if(!user) return Promise.reject(new Error(generic));
    if(user.lockUntil && Date.now()<user.lockUntil){
      var secs=Math.ceil((user.lockUntil-Date.now())/1000);
      return Promise.reject(new Error('Too many failed attempts — try again in '+secs+' seconds'));
    }
    return verifyPassword(email, password).then(function(ok){
      var users=loadUsers();
      var rec=null;
      for(var i=0;i<users.length;i++){ if(users[i].email===email) rec=users[i]; }
      if(!ok){
        if(rec){
          rec.fails=(rec.fails||0)+1;
          if(rec.fails>=MAX_FAILS){ rec.lockUntil=Date.now()+LOCK_MS; rec.fails=0; }
          saveUsers(users);
        }
        throw new Error(generic);
      }
      if(rec){ rec.fails=0; rec.lockUntil=0; saveUsers(users); }
      startSession(email);
      return {name:user.name, email:user.email, createdAt:user.createdAt};
    });
  }
  function resetPassword(email, newPassword){
    email=normalizeEmail(email);
    if(!validEmail(email)) return Promise.reject(new Error('Enter the email address for the account'));
    var perr=passwordError(newPassword);
    if(perr) return Promise.reject(new Error(perr));
    var user=findUser(email);
    if(!user) return Promise.reject(new Error('No account with that email was found on this device'));
    var salt=randomHex(16);
    return deriveHash(newPassword, salt, ITERATIONS).then(function(hash){
      var users=loadUsers();
      for(var i=0;i<users.length;i++){
        if(users[i].email===email){ users[i].salt=salt; users[i].hash=hash; users[i].iterations=ITERATIONS; users[i].fails=0; users[i].lockUntil=0; }
      }
      if(!saveUsers(users)) throw new Error('The new password could not be saved in this browser');
      return true;
    });
  }
  function deleteAccount(){
    var s=currentSession(); if(!s) return false;
    var users=loadUsers().filter(function(u){ return u.email!==s.email; });
    saveUsers(users); logout();
    return true;
  }
  return {
    validEmail:validEmail, passwordError:passwordError, findUser:findUser,
    verifyPassword:verifyPassword, startSession:startSession,
    currentSession:currentSession, currentUser:currentUser,
    signup:signup, login:login, resetPassword:resetPassword,
    logout:logout, deleteAccount:deleteAccount, storageOk:storageOk
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
    applyLink.textContent=user?'Open Dashboard →':'Apply — Demo';
    applyLink.onclick=function(){ if(user){ goPage('app'); } else { goPage('auth','signup'); } return false; };
  }
  var box=document.getElementById('accountBox');
  if(box){
    if(user){
      var since='';
      try{ since=new Date(user.createdAt).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'}); }catch(e){}
      box.innerHTML='<b>'+escapeHtml(user.name)+'</b><br>'+escapeHtml(user.email)+
        (since?'<br><span>'+escapeHtml(since)+'</span>':'');
    } else {
      box.innerHTML='Not signed in.';
    }
  }
  if(user){
    var fe=document.getElementById('fEmail'); if(fe && !fe.value) fe.value=user.email;
    var fn=document.getElementById('fName'); if(fn && !fn.value) fn.value=user.name;
  }
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
    enterApp('application');
    toast('Account created');
  }).catch(function(err){
    authSetBusy('signupBtn', false);
    setAuthMsg('signupMsg', err.message);
  });
}
/* No email is sent: the reset happens here, on the device that
   holds the account — holding the device is the proof. */
function authForgot(){
  var e=document.getElementById('authForgotEmail').value,
      p=document.getElementById('authForgotPass').value, p2=document.getElementById('authForgotPass2').value;
  setAuthMsg('forgotMsg','');
  document.getElementById('forgotOk').style.display='none';
  if(p!==p2){ setAuthMsg('forgotMsg','The two passwords do not match'); return; }
  authSetBusy('forgotBtn', true);
  FGSGAuth.resetPassword(e,p).then(function(){
    authSetBusy('forgotBtn', false);
    document.getElementById('forgotOk').style.display='block';
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
  if(FGSGAuth.deleteAccount()){
    if(btn){ delete btn.dataset.armed; btn.textContent='Delete Account'; }
    updateAuthUI();
    goPage('landing');
    toast('Account deleted');
  }
}
window.addEventListener('load', function(){ updateAuthUI(); });
