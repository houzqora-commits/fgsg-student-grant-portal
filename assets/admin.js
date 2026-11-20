/* ============================================================
   FGSG — Admin panel (#/admin only)
   Its own login screen, separate from the student login, then
   the admin dashboard. Reachable ONLY at #/admin
   (fgsg.site/#/admin): there is no /admin route, and no link,
   button or menu entry to this panel anywhere on the site —
   typing #/admin is the only way in.

   ADMIN LOGIN — BOTH gates, every time, neither one alone
   opens the dashboard:
   Gate 1: Username Admin + the generated admin password.
   The password itself is never in this file — only its
   SHA-256 hash (ADMIN_PASS_SHA256 below); what is typed is
   hashed in the browser and compared against that hash.
   The password lives in ADMIN-CREDENTIALS.txt, which sits
   with the site source outside the served website files.
   Gate 2: a Supabase account marked as admin (user_metadata
   is_admin / role = 'admin', app_metadata role = 'admin',
   or a profiles row with is_admin = true / role = 'admin'),
   verified by fgsgSupabaseAdminUser().
   The application data itself is enforced server-side by
   Supabase RLS under that session, and login state lives in
   memory only — no browser-storage flag opens the dashboard.

   Data is live from Supabase (applications, documents,
   payments, withdrawals, transactions, profiles) through the
   existing anon client in supabase-client.js. NIN is never
   shown: the database only holds nin_encrypted bytes, and
   this panel shows NIN status only.
   Loaded last, after app.js / payment.js.
   ============================================================ */
(function(){
'use strict';
var _adminAuthed = false; /* in-memory only, never stored */
var _gatePass = false;    /* gate 1: Username Admin + password */
var _sbAdminUser = null;  /* gate 2: verified Supabase admin user */
/* Gate 1 verifier: SHA-256 hash of the generated admin
   password (the password itself is in ADMIN-CREDENTIALS.txt,
   outside the served files — never in this code). */
var ADMIN_USER = 'Admin';
var ADMIN_PASS_SHA256 = '87250b35dadf34a3334e5190a174ff40eabc41d3846b57bd5461bceb72c54f8d';

function $(id){ return document.getElementById(id); }
function esc(s){ return (typeof escapeHtml === 'function') ? escapeHtml(s == null ? '' : String(s)) : String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
function fmtMoney(n){ return '₦' + (Number(n) || 0).toLocaleString('en-NG'); }
function fmtDate(v){
  if(!v) return '—';
  try { return new Date(v).toLocaleDateString('en-GB', {day:'numeric', month:'short', year:'numeric'}); } catch(e){ return '—'; }
}
function fmtDateTime(v){
  if(!v) return '—';
  try { return new Date(v).toLocaleDateString('en-GB', {day:'numeric', month:'short', year:'numeric'}) + ' · ' + new Date(v).toLocaleTimeString('en-GB', {hour:'numeric', minute:'2-digit'}); } catch(e){ return '—'; }
}
function statusOf(a){ return String((a && a.status) || 'pending').toLowerCase(); }
function serialFor(index){ return String(101 + index).padStart(4, '0'); }

/* ---------- Supabase admin marking (for a signed-in session) ---------- */
async function fgsgSupabaseAdminUser(){
  try {
    if (typeof fgsgDb === 'undefined' || !fgsgDb) return null;
    var res = await fgsgDb.auth.getUser();
    var user = res && res.data ? res.data.user : null;
    if (!user) return null;
    var meta = user.user_metadata || {}, appMeta = user.app_metadata || {};
    if (meta.is_admin === true || meta.role === 'admin' || appMeta.role === 'admin' || appMeta.is_admin === true) return user;
    try {
      var prof = await fgsgDb.from('profiles').select('*').eq('id', user.id).single();
      if (!prof.error && prof.data && (prof.data.is_admin === true || prof.data.role === 'admin')) return user;
    } catch(e){}
    return null;
  } catch(e){ return null; }
}

/* ---------- routing: #/admin is the ONLY way in ---------- */
function isAdminRoute(){
  try { return (window.location.hash || '') === '#/admin'; } catch(e){}
  return false;
}
function isAdminAuthed(){ return _adminAuthed === true; }
function setAdminAuthed(on){ _adminAuthed = !!on; }
/* The dashboard opens only when BOTH gates have passed in
   this page session: gate 1 (Username Admin + password) and
   gate 2 (verified Supabase admin session). */
function maybeOpenDashboard(){
  if (_gatePass && _sbAdminUser){
    setAdminAuthed(true);
    showDashboard();
    if (typeof toast === 'function') toast('Welcome, Admin');
    return true;
  }
  return false;
}
function enterAdminPage(){
  document.body.classList.add('in-admin');
  document.body.classList.remove('in-portal');
  if (typeof goPage === 'function') goPage('admin');
  else {
    document.querySelectorAll('.page').forEach(function(p){ p.classList.remove('active'); });
    var el = $('page-admin'); if (el) el.classList.add('active');
  }
  document.body.classList.add('in-admin');
  if (isAdminAuthed()){ showDashboard(); }
  else {
    showAdminLogin();
    /* A live Supabase session marked as admin passes gate 2
       on its own, but gate 1 (Username Admin + password) is
       still required before the dashboard opens. */
    fgsgSupabaseAdminUser().then(function(u){
      if (u && document.body.classList.contains('in-admin')){
        _sbAdminUser = u;
        markSbPassed();
        setSbMsg('Supabase admin account accepted — now complete the Username and password step above', true);
        maybeOpenDashboard();
      }
    });
  }
  window.scrollTo({top: 0});
}
function leaveAdminPage(){
  document.body.classList.remove('in-admin');
  if (typeof goPage === 'function') goPage('landing');
}
/* No goAdmin export and no link, button or menu entry anywhere:
   the #/admin hash check in initAdmin below is the only way
   this page can be opened. */

/* ---------- login / logout ---------- */
function showAdminLogin(){
  var login = $('adminLoginView'), dash = $('adminDashView');
  if (login) login.style.display = 'block';
  if (dash) dash.style.display = 'none';
}
function showDashboard(){
  var login = $('adminLoginView'), dash = $('adminDashView');
  if (login) login.style.display = 'none';
  if (dash) dash.style.display = 'block';
  loadAdminData();
}
function adminLogout(){
  setAdminAuthed(false);
  _gatePass = false;
  _sbAdminUser = null;
  state.apps = []; state.reviews = []; state.selectedId = null;
  try { if (typeof fgsgDb !== 'undefined' && fgsgDb) fgsgDb.auth.signOut(); } catch(e){}
  resetLoginGates();
  showAdminLogin();
  if (typeof toast === 'function') toast('Admin logged out');
}
/* ---------- gate 1: Username Admin + generated password ---------- */
function setGateMsg(msg, ok){
  var el = $('adminMsg'); if (!el) return;
  el.textContent = msg || '';
  el.className = 'auth-msg' + (msg ? (' show ' + (ok ? 'ok' : 'err')) : '');
}
function sha256Hex(text){
  var enc = new TextEncoder().encode(text);
  return crypto.subtle.digest('SHA-256', enc).then(function(buf){
    return Array.prototype.map.call(new Uint8Array(buf), function(b){
      return ('0' + b.toString(16)).slice(-2);
    }).join('');
  });
}
function markGatePassed(){
  var u = $('adminUser'), p = $('adminPass'), b = $('adminLoginBtn');
  if (u) u.disabled = true;
  if (p) p.disabled = true;
  if (b){ b.disabled = true; b.textContent = '✓ Username & password accepted'; }
}
function markSbPassed(){
  var e = $('adminSbEmail'), p = $('adminSbPass'), b = $('adminSbBtn');
  if (e) e.disabled = true;
  if (p) p.disabled = true;
  if (b){ b.disabled = true; b.textContent = '✓ Supabase admin accepted'; }
}
function resetLoginGates(){
  var u = $('adminUser'), p = $('adminPass'), b = $('adminLoginBtn');
  if (u){ u.disabled = false; }
  if (p){ p.disabled = false; p.value = ''; }
  if (b){ b.disabled = false; b.textContent = 'Log in to Admin →'; }
  setGateMsg('');
  var e = $('adminSbEmail'), sp = $('adminSbPass'), sb = $('adminSbBtn');
  if (e) e.disabled = false;
  if (sp){ sp.disabled = false; sp.value = ''; }
  if (sb){ sb.disabled = false; sb.textContent = 'Log in with Supabase →'; }
  setSbMsg('');
}
function adminGateLogin(){
  if (_gatePass){ maybeOpenDashboard(); return; }
  var userEl = $('adminUser'), passEl = $('adminPass');
  var username = userEl ? userEl.value.trim() : '';
  var password = passEl ? passEl.value : '';
  setGateMsg('');
  if (!username || !password){ setGateMsg('Enter the admin username and password'); return; }
  if (username !== ADMIN_USER){ setGateMsg('Username or password is not correct'); return; }
  if (!window.crypto || !crypto.subtle){ setGateMsg('A secure connection is needed to check the admin password — open this page over HTTPS and try again'); return; }
  var btn = $('adminLoginBtn');
  if (btn){ btn.disabled = true; btn.textContent = 'Checking…'; }
  sha256Hex(password).then(function(hex){
    if (btn){ btn.disabled = false; btn.textContent = 'Log in to Admin →'; }
    if (hex !== ADMIN_PASS_SHA256){
      setGateMsg('Username or password is not correct');
      return;
    }
    if (passEl) passEl.value = '';
    _gatePass = true;
    markGatePassed();
    if (!maybeOpenDashboard()){
      setGateMsg('Username and password accepted — now sign in with the Supabase admin account below', true);
    }
  }).catch(function(){
    if (btn){ btn.disabled = false; btn.textContent = 'Log in to Admin →'; }
    setGateMsg('The admin password could not be checked — try again');
  });
}
/* ---------- gate 2: Supabase Auth admin login ----------
   Signs in with Supabase and passes this gate ONLY if that
   account is marked as admin (see fgsgSupabaseAdminUser).
   A student account is rejected here. The dashboard still
   needs gate 1 as well. */
function setSbMsg(msg, ok){
  var el = $('adminSbMsg'); if (!el) return;
  el.textContent = msg || '';
  el.className = 'auth-msg' + (msg ? (' show ' + (ok ? 'ok' : 'err')) : '');
}
function adminSupabaseLogin(){
  if (_sbAdminUser){ maybeOpenDashboard(); return; }
  var emailEl = $('adminSbEmail'), passEl = $('adminSbPass');
  var email = emailEl ? emailEl.value.trim() : '';
  var password = passEl ? passEl.value : '';
  setSbMsg('');
  if (!email || !password){ setSbMsg('Enter the admin account email and password'); return; }
  if (typeof fgsgDb === 'undefined' || !fgsgDb){ setSbMsg('Supabase is not available — check your connection and try again'); return; }
  var btn = $('adminSbBtn');
  if (btn){ btn.disabled = true; btn.textContent = 'Checking…'; }
  fgsgDb.auth.signInWithPassword({email: email, password: password}).then(function(res){
    if (res.error) throw res.error;
    return fgsgSupabaseAdminUser();
  }).then(function(adminUser){
    if (btn){ btn.disabled = false; btn.textContent = 'Log in with Supabase →'; }
    if (!adminUser){
      setSbMsg('That Supabase account is not marked as admin — the dashboard stays locked');
      return;
    }
    if (passEl) passEl.value = '';
    _sbAdminUser = adminUser;
    markSbPassed();
    if (!maybeOpenDashboard()){
      setSbMsg('Supabase admin account accepted — now complete the Username and password step above', true);
    }
  }).catch(function(err){
    if (btn){ btn.disabled = false; btn.textContent = 'Log in with Supabase →'; }
    setSbMsg((err && err.message) ? err.message : 'Supabase login failed');
  });
}

/* ---------- live data from Supabase ---------- */
var state = { apps: [], documents: [], payments: [], withdrawals: [], transactions: [], reviews: [], reviewsError: '', profilesCount: null, loading: false, selectedId: null, loadError: '' };

function setDashMsg(msg, kind){
  var el = $('adminDashMsg'); if (!el) return;
  el.textContent = msg || '';
  el.className = 'admin-msg' + (msg ? (' show ' + (kind || 'info')) : '');
}
async function fetchAll(table, orderCol, ascending){
  var rows = [], from = 0, pageSize = 1000;
  for (var guard = 0; guard < 20; guard++){
    var q = fgsgDb.from(table).select('*').range(from, from + pageSize - 1);
    if (orderCol) q = q.order(orderCol, {ascending: !!ascending});
    var res = await q;
    if (res.error) throw res.error;
    var data = res.data || [];
    rows = rows.concat(data);
    if (data.length < pageSize) break;
    from += pageSize;
  }
  return rows;
}
async function loadAdminData(){
  if (state.loading) return;
  var listEl = $('adminListWrap');
  if (typeof fgsgDb === 'undefined' || !fgsgDb){
    state.loadError = 'Supabase is not available — check your connection and refresh.';
    renderStats(); renderList();
    setDashMsg(state.loadError, 'err');
    return;
  }
  state.loading = true;
  setDashMsg('Loading live applications from Supabase…', 'info');
  try {
    var apps = await fetchAll('applications', 'created_at', true);
    state.apps = apps;
    state.loadError = '';
    /* Supporting tables are best-effort: if one is blocked the
       dashboard still shows the applications. */
    try { state.payments = await fetchAll('payments', 'paid_at', false); } catch(e){ try { state.payments = await fetchAll('payments', null, false); } catch(e2){ state.payments = []; } }
    try { state.withdrawals = await fetchAll('withdrawals', 'created_at', false); } catch(e){ state.withdrawals = []; }
    try { state.transactions = await fetchAll('transactions', 'created_at', false); } catch(e){ state.transactions = []; }
    try { state.documents = await fetchAll('documents', 'uploaded_at', false); } catch(e){ try { state.documents = await fetchAll('documents', null, false); } catch(e2){ state.documents = []; } }
    try { state.reviews = await fetchAll('item_reviews', 'created_at', true); state.reviewsError = ''; } catch(e){ state.reviews = []; state.reviewsError = (e && e.message) ? e.message : 'item_reviews table could not be read'; }
    try {
      var pc = await fgsgDb.from('profiles').select('*', {count: 'exact', head: true});
      state.profilesCount = (!pc.error && typeof pc.count === 'number') ? pc.count : null;
    } catch(e){ state.profilesCount = null; }
    setDashMsg(apps.length ? '' : 'No applications found in Supabase for this view. If students have applied, the admin account needs a Supabase policy that can read all applications (RLS currently lets each student see only their own rows).', apps.length ? '' : 'info');
  } catch(err){
    state.apps = [];
    state.loadError = (err && err.message) ? err.message : 'Could not load applications';
    setDashMsg('Could not load applications from Supabase: ' + state.loadError + ' — If RLS is blocking the read, add an admin read policy for the applications table in Supabase.', 'err');
  }
  state.loading = false;
  buildFilterOptions();
  renderStats();
  renderList();
  if (state.selectedId) {
    var still = state.apps.find(function(a){ return a.id === state.selectedId; });
    if (still) renderDetail(still); else { state.selectedId = null; var d = $('adminDetail'); if (d) d.style.display = 'none'; }
  }
}

/* ---------- stats ---------- */
function renderStats(){
  var apps = state.apps;
  var pending = apps.filter(function(a){ return statusOf(a) === 'pending'; }).length;
  var approvedApps = apps.filter(function(a){ return statusOf(a) === 'approved'; });
  var grantPaid = approvedApps.reduce(function(sum, a){ return sum + (Number(a.grant_amount) || 50000); }, 0);
  var fees = 0;
  if (state.payments.length){
    fees = state.payments.filter(function(p){ return !p.status || String(p.status).toLowerCase() === 'paid'; })
      .reduce(function(sum, p){ return sum + ((Number(p.amount_kobo) || 300000) / 100); }, 0);
  } else {
    fees = state.transactions.filter(function(t){ return t.kind === 'fee'; })
      .reduce(function(sum, t){ return sum + (Number(t.amount) || 0); }, 0);
  }
  var set = function(id, v){ var el = $(id); if (el) el.textContent = v; };
  set('adminStatTotal', String(apps.length));
  set('adminStatPending', String(pending));
  set('adminStatApproved', String(approvedApps.length));
  set('adminStatGrant', fmtMoney(grantPaid));
  set('adminStatFees', fmtMoney(fees));
}

/* ---------- search + filters ---------- */
function distinctValues(key){
  var seen = {}, out = [];
  state.apps.forEach(function(a){ var v = a[key]; if (v && !seen[v]){ seen[v] = 1; out.push(v); } });
  return out.sort();
}
function fillSelect(id, values, allLabel){
  var el = $(id); if (!el) return;
  var current = el.value;
  el.innerHTML = '';
  var opt = document.createElement('option'); opt.value = ''; opt.textContent = allLabel; el.appendChild(opt);
  values.forEach(function(v){ var o = document.createElement('option'); o.value = v; o.textContent = v; el.appendChild(o); });
  if (current && values.indexOf(current) >= 0) el.value = current;
}
function buildFilterOptions(){
  fillSelect('adminFilterInstitution', distinctValues('institution_name'), 'All institutions');
  fillSelect('adminFilterState', distinctValues('state_of_origin'), 'All states');
}
function filteredApps(){
  var q = (($('adminSearch') && $('adminSearch').value) || '').trim().toLowerCase();
  var st = ($('adminFilterStatus') && $('adminFilterStatus').value) || '';
  var inst = ($('adminFilterInstitution') && $('adminFilterInstitution').value) || '';
  var stateF = ($('adminFilterState') && $('adminFilterState').value) || '';
  return state.apps.filter(function(a, idx){
    a.__serialIndex = idx;
    if (st && statusOf(a) !== st) return false;
    if (inst && a.institution_name !== inst) return false;
    if (stateF && a.state_of_origin !== stateF) return false;
    if (q){
      var hay = [a.full_name, a.matric_number, a.institution_name, a.department, a.state_of_origin, a.lga, a.level, a.reference, serialFor(idx)].join(' ').toLowerCase();
      if (hay.indexOf(q) < 0) return false;
    }
    return true;
  });
}
function renderList(){
  var wrap = $('adminListWrap'); if (!wrap) return;
  var countEl = $('adminListCount');
  /* keep serial indexes based on full ordered list */
  state.apps.forEach(function(a, i){ a.__serialIndex = i; });
  var rows = filteredApps();
  if (countEl) countEl.textContent = rows.length + (rows.length === 1 ? ' application' : ' applications') + (state.apps.length && rows.length !== state.apps.length ? ' · ' + state.apps.length + ' total' : '');
  if (!rows.length){
    wrap.innerHTML = '<div class="admin-empty">' + (state.apps.length ? 'No applications match your search or filters' : 'No applications yet') + '</div>';
    return;
  }
  var html = '<table class="admin-table"><thead><tr>' +
    '<th>Serial</th><th>Student</th><th>Matric No.</th><th>Institution</th><th>Level</th><th>Department</th><th>State</th><th>LGA</th><th>Status</th><th>Submitted</th>' +
    '</tr></thead><tbody>';
  rows.forEach(function(a){
    var st = statusOf(a);
    html += '<tr data-admin-app="' + esc(a.id) + '" tabindex="0" role="button" aria-label="View ' + esc(a.full_name || 'student') + '">' +
      '<td data-label="Serial">' + esc(serialFor(a.__serialIndex)) + '</td>' +
      '<td data-label="Student" class="a-main"><span class="a-name">' + esc(a.full_name || '—') + '</span></td>' +
      '<td data-label="Matric No.">' + esc(a.matric_number || '—') + '</td>' +
      '<td data-label="Institution">' + esc(a.institution_name || '—') + '</td>' +
      '<td data-label="Level">' + esc(a.level || '—') + '</td>' +
      '<td data-label="Department">' + esc(a.department || '—') + '</td>' +
      '<td data-label="State">' + esc(a.state_of_origin || '—') + '</td>' +
      '<td data-label="LGA">' + esc(a.lga || '—') + '</td>' +
      '<td data-label="Status"><span class="admin-status ' + esc(st) + '">' + esc(st) + '</span></td>' +
      '<td data-label="Submitted">' + esc(fmtDate(a.submitted_at || a.created_at)) + '</td>' +
      '</tr>';
  });
  html += '</tbody></table>';
  wrap.innerHTML = html;
  wrap.querySelectorAll('[data-admin-app]').forEach(function(row){
    var open = function(){
      var app = state.apps.find(function(a){ return a.id === row.getAttribute('data-admin-app'); });
      if (app){ state.selectedId = app.id; renderDetail(app); var d = $('adminDetail'); if (d) d.scrollIntoView({behavior: 'smooth', block: 'start'}); }
    };
    row.addEventListener('click', open);
    row.addEventListener('keydown', function(e){ if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); open(); } });
  });
}

/* ---------- detail view ---------- */
function kv(label, value){
  return '<div class="admin-kv"><span>' + esc(label) + '</span><b>' + esc(value == null || value === '' ? '—' : value) + '</b></div>';
}
function docsFor(app){
  return state.documents.filter(function(d){ return d.application_id === app.id; });
}
function paymentsFor(app){
  return state.payments.filter(function(p){ return p.application_id === app.id || (!p.application_id && p.user_id === app.user_id); });
}
function withdrawalsFor(app){
  return state.withdrawals.filter(function(w){ return w.application_id === app.id || (!w.application_id && w.user_id === app.user_id); });
}
function transactionsFor(app){
  return state.transactions.filter(function(t){ return t.application_id === app.id || (!t.application_id && t.user_id === app.user_id); });
}
/* ---------- per-item review ---------- */
function reviewsFor(app){
  return state.reviews.filter(function(r){ return r.application_id === app.id; });
}
function reviewStatusLabel(s){
  if (s === 'accepted') return 'Accepted';
  if (s === 'declined') return 'Declined';
  if (s === 'resend') return 'Resend requested';
  if (s === 'resubmitted') return 'Resubmitted — awaiting review';
  return 'Awaiting review';
}
function reviewStatusClass(s){
  if (s === 'accepted') return 'accepted';
  if (s === 'declined') return 'declined';
  if (s === 'resend') return 'resend';
  if (s === 'resubmitted') return 'resubmitted';
  return 'waiting';
}
function reviewItemValue(app, def, docs){
  if (def.kind === 'document'){
    var d = null;
    for (var i = 0; i < docs.length; i++){ if (docs[i].kind === def.docKind) { d = docs[i]; break; } }
    return d ? {text: (d.file_name || d.storage_path || 'Uploaded') + ' · ' + fmtDateTime(d.uploaded_at || d.created_at), docIndex: docs.indexOf(d)} : {text: 'Not uploaded', docIndex: -1};
  }
  if (def.key === 'nin') return {text: app.nin_encrypted ? 'On file — encrypted in Supabase' : 'Not on file'};
  if (def.key === 'payout'){
    var parts = [];
    if (app.payout_method) parts.push(app.payout_method === 'Bank' ? 'Bank Account' : app.payout_method);
    if (app.payout_bank) parts.push(app.payout_bank);
    if (app.payout_account_number) parts.push('••••' + String(app.payout_account_number).slice(-4));
    if (app.payout_account_name) parts.push(app.payout_account_name);
    return {text: parts.join(' · ') || '—'};
  }
  if (def.key === 'scholarship_confirmation') return {text: app.no_other_government_scholarship == null ? '—' : (app.no_other_government_scholarship ? 'Confirmed' : 'Not confirmed')};
  if (!def.column) return {text: '—'};
  var v = app[def.column];
  if (v == null || v === '') return {text: '—'};
  if (def.key === 'date_of_birth') return {text: fmtDate(v)};
  return {text: String(v)};
}
function reviewSectionHtml(app, docs){
  var items = (typeof FGSG_REVIEW_ITEMS !== 'undefined') ? FGSG_REVIEW_ITEMS : [];
  var reviews = reviewsFor(app);
  var counts = (typeof fgsgReviewCounts === 'function') ? fgsgReviewCounts(reviews) : {accepted:0, declined:0, resend:0, resubmitted:0, waiting:items.length, total:items.length};
  var allAccepted = (typeof fgsgReviewsAllAccepted === 'function') ? fgsgReviewsAllAccepted(reviews) : false;
  var map = (typeof fgsgLatestReviewMap === 'function') ? fgsgLatestReviewMap(reviews) : {};
  var h = '<h4>Per-item review</h4>';
  h += '<div class="review-progress ' + (allAccepted ? 'all-accepted' : '') + '"><b>' + counts.accepted + ' of ' + counts.total + ' accepted</b><span>' +
    (counts.declined ? counts.declined + ' declined · ' : '') + (counts.resend ? counts.resend + ' resend requested · ' : '') + (counts.resubmitted ? counts.resubmitted + ' resubmitted · ' : '') + (counts.waiting ? counts.waiting + ' awaiting review · ' : '') +
    (allAccepted ? 'All items accepted — application can be Approved' : 'Application stays Pending until every item is accepted') + '</span></div>';
  if (state.reviewsError){
    h += '<p class="review-table-note">Review decisions cannot be saved yet: Supabase could not read the <b>item_reviews</b> table (' + esc(state.reviewsError) + '). Create the table and its admin/student policies — the SQL is in the comment at the top of the per-item review section in supabase-client.js — then Refresh.</p>';
  }
  items.forEach(function(def){
    var latest = map[def.key] || null;
    var st = latest ? latest.status : null;
    var val = reviewItemValue(app, def, docs);
    var history = reviews.filter(function(r){ return r.item_key === def.key; });
    h += '<div class="review-item ' + reviewStatusClass(st) + '" data-review-item="' + esc(def.key) + '">';
    h += '<div class="review-item-head"><b>' + esc(def.label) + '</b><span class="review-pill ' + reviewStatusClass(st) + '">' + esc(reviewStatusLabel(st)) + '</span></div>';
    h += '<p class="review-value">' + esc(val.text) + (val.docIndex >= 0 ? ' <button type="button" class="btn btn-outline-dark review-view-btn" data-admin-doc="' + val.docIndex + '">View</button>' : '') + '</p>';
    if (latest && latest.reason) h += '<p class="review-reason"><span>Reason</span> ' + esc(latest.reason) + '</p>';
    h += '<label class="review-reason-label">Reason<textarea class="review-reason-input" data-review-reason="' + esc(def.key) + '" rows="2" placeholder="Reason for decline / resend"></textarea></label>';
    h += '<div class="review-actions">' +
      '<button type="button" class="btn btn-green" data-review-action="accepted" data-review-key="' + esc(def.key) + '">Accept</button>' +
      '<button type="button" class="btn btn-reject" data-review-action="declined" data-review-key="' + esc(def.key) + '">Decline</button>' +
      '<button type="button" class="btn btn-outline-dark" data-review-action="resend" data-review-key="' + esc(def.key) + '">Ask for Resend</button>' +
      '</div>';
    h += '<p class="review-msg" data-review-msg="' + esc(def.key) + '" role="alert"></p>';
    if (history.length){
      h += '<div class="review-history"><span class="review-history-title">Review history</span>';
      history.slice().reverse().forEach(function(r){
        h += '<div class="review-history-row"><span class="review-pill ' + reviewStatusClass(r.status) + '">' + esc(reviewStatusLabel(r.status)) + '</span><span>' + esc(fmtDateTime(r.created_at)) + (r.reviewed_by ? ' · ' + esc(r.reviewed_by) : '') + '</span>' + (r.reason ? '<span class="review-history-reason">' + esc(r.reason) + '</span>' : '') + '</div>';
      });
      h += '</div>';
    }
    h += '</div>';
  });
  return h;
}
async function saveItemReview(app, itemKey, action, btn){
  var def = (typeof fgsgReviewItemByKey === 'function') ? fgsgReviewItemByKey(itemKey) : null;
  if (!def) return;
  var box = $('adminDetail');
  var reasonEl = box ? box.querySelector('[data-review-reason="' + itemKey + '"]') : null;
  var msgEl = box ? box.querySelector('[data-review-msg="' + itemKey + '"]') : null;
  var reason = reasonEl ? reasonEl.value.trim() : '';
  function setMsg(m, ok){ if (msgEl){ msgEl.textContent = m || ''; msgEl.className = 'review-msg' + (m ? (' show ' + (ok ? 'ok' : 'err')) : ''); } }
  setMsg('');
  if ((action === 'declined' || action === 'resend') && !reason){ setMsg('Enter a short reason first'); if (reasonEl) reasonEl.focus(); return; }
  var original = btn.textContent;
  btn.disabled = true; btn.textContent = 'Saving…';
  try {
    if (typeof fgsgSaveItemReview !== 'function') throw new Error('Supabase review saving is not available');
    var by = (_sbAdminUser && _sbAdminUser.email) ? _sbAdminUser.email : 'Admin';
    var saved = await fgsgSaveItemReview(app.id, app.user_id, def.key, def.label, action, reason, by);
    state.reviews.push(saved);
    state.reviewsError = '';
    var reviewsNow = reviewsFor(app);
    var allAccepted = (typeof fgsgReviewsAllAccepted === 'function') ? fgsgReviewsAllAccepted(reviewsNow) : false;
    /* Overall status rule: stays Pending while anything is
       waiting / declined / resend / resubmitted. It only moves
       to Approved via the whole-application Approve button
       once every item is accepted (that button is gated). If
       this student was Approved and an item is now declined or
       sent back, return the application to Pending in Supabase. */
    if (!allAccepted && statusOf(app) === 'approved'){
      try {
        var back = await fgsgDb.from('applications').update({status:'pending'}).eq('id', app.id);
        if (!back.error){ app.status = 'pending'; }
      } catch(e){}
    }
    setDashMsg(def.label + ' marked ' + reviewStatusLabel(action) + ' in Supabase.' + (allAccepted ? ' Every item is now accepted — the application can be Approved.' : ''), 'ok');
    renderStats(); renderList(); renderDetail(app);
    if (typeof toast === 'function') toast(def.label + ' — ' + reviewStatusLabel(action));
  } catch(err){
    btn.disabled = false; btn.textContent = original;
    setMsg('Not saved to Supabase: ' + ((err && err.message) || 'item_reviews table / policy missing'), false);
  }
}
async function openDocument(doc, linkEl){
  if (linkEl){ linkEl.textContent = 'Opening…'; }
  try {
    var res = await fgsgDb.storage.from('student-documents').createSignedUrl(doc.storage_path, 3600);
    if (res.error) throw res.error;
    if (res.data && res.data.signedUrl) window.open(res.data.signedUrl, '_blank');
    if (linkEl) linkEl.textContent = 'View';
  } catch(e){
    if (linkEl) linkEl.textContent = 'View';
    setDashMsg('That document could not be opened from Supabase Storage — the admin account needs storage read access for the student-documents bucket.', 'err');
  }
}
function renderDetail(app){
  var box = $('adminDetail'); if (!box) return;
  var st = statusOf(app);
  var docs = docsFor(app);
  var pays = paymentsFor(app);
  var wds = withdrawalsFor(app);
  var txs = transactionsFor(app);
  var ninOnFile = !!(app.nin_encrypted);
  var withdrawnTotal = wds.reduce(function(s, w){ return s + (Number(w.amount) || 0); }, 0);
  var walletBalance = st === 'approved' ? Math.max(0, (Number(app.grant_amount) || 50000) - withdrawnTotal) : 0;

  var html = '';
  html += '<button type="button" class="btn btn-outline-dark" id="adminDetailBack">← Back to list</button>';
  html += '<h3 style="margin-top:16px">' + esc(app.full_name || 'Student') + ' <span class="admin-status ' + esc(st) + '">' + esc(st) + '</span></h3>';
  html += '<div class="admin-detail-grid">' +
    kv('Serial No.', serialFor(app.__serialIndex || 0)) +
    kv('Reference', app.reference) +
    kv('Full name', app.full_name) +
    kv('Matric / Reg. Number', app.matric_number) +
    kv('CGPA', app.cgpa == null ? null : String(app.cgpa)) +
    kv('Date of birth', fmtDate(app.date_of_birth)) +
    kv('Phone number', app.phone_number) +
    kv('State of origin', app.state_of_origin) +
    kv('LGA', app.lga) +
    kv('Institution type', app.institution_type) +
    kv('Institution', app.institution_name) +
    kv('Level', app.level) +
    kv('Department', app.department) +
    kv("Parents' status / occupation", app.parents_financial_status) +
    kv('No other govt scholarship', app.no_other_government_scholarship == null ? null : (app.no_other_government_scholarship ? 'Confirmed' : 'Not confirmed')) +
    kv('Date submitted', fmtDateTime(app.submitted_at || app.created_at)) +
    kv('Approved at', fmtDateTime(app.approved_at)) +
    '</div>';

  html += '<h4>Identity</h4><div class="admin-detail-grid">' +
    kv('NIN status', ninOnFile ? 'On file — encrypted in Supabase' : 'Not on file') +
    kv('NIN', 'Never shown') +
    '</div>';

  html += reviewSectionHtml(app, docs);

  html += '<h4>Uploaded documents</h4>';
  if (!docs.length) html += '<p class="admin-none">No documents found for this application in Supabase</p>';
  docs.forEach(function(d, i){
    html += '<div class="admin-doc"><div><b>' + esc(d.kind || 'Document') + '</b><span>' + esc(d.file_name || d.storage_path || '') + ' · ' + esc(fmtDateTime(d.uploaded_at || d.created_at)) + '</span></div>' +
      '<button type="button" class="btn btn-outline-dark" data-admin-doc="' + i + '">View</button></div>';
  });

  html += '<h4>Payment — ₦3,000 verification fee</h4>';
  if (!pays.length) html += '<p class="admin-none">No payment row found for this student</p>';
  pays.forEach(function(p){
    html += '<div class="admin-mini-row"><span>' + esc(fmtDateTime(p.paid_at || p.created_at)) + ' · ' + esc(p.paystack_reference || '') + '</span><b>' + esc(fmtMoney((Number(p.amount_kobo) || 0) / 100)) + ' · ' + esc(p.status || 'paid') + '</b></div>';
  });

  html += '<h4>Grant Wallet</h4><div class="admin-detail-grid">' +
    kv('Wallet ID', app.wallet_id) +
    kv('Grant amount', fmtMoney(Number(app.grant_amount) || 50000)) +
    kv('Wallet balance', fmtMoney(walletBalance)) +
    kv('Payout method', app.payout_method === 'Bank' ? 'Bank Account' : app.payout_method) +
    kv('Payout bank', app.payout_bank) +
    kv('Payout account', app.payout_account_number ? ('••••' + String(app.payout_account_number).slice(-4)) : null) +
    kv('Payout account name', app.payout_account_name) +
    '</div>';

  html += '<h4>Withdrawals</h4>';
  if (!wds.length) html += '<p class="admin-none">No withdrawals yet</p>';
  wds.forEach(function(w){
    html += '<div class="admin-mini-row"><span>' + esc(fmtDateTime(w.created_at)) + ' · ' + esc(w.bank_name || '') + ' •••' + esc(String(w.account_number || '').slice(-4)) + '</span><b>' + esc(fmtMoney(w.amount)) + ' · ' + esc(w.status || 'queued') + '</b></div>';
  });

  html += '<h4>Transaction history</h4>';
  if (!txs.length) html += '<p class="admin-none">No transactions yet</p>';
  txs.forEach(function(t){
    html += '<div class="admin-mini-row"><span>' + esc(fmtDateTime(t.created_at)) + ' · ' + esc(t.kind || '') + ' · ' + esc(t.reference || '') + '</span><b>' + esc((t.direction === 'out' ? '−' : '+') + fmtMoney(t.amount)) + (t.balance_after == null ? '' : ' · Bal ' + esc(fmtMoney(t.balance_after))) + '</b></div>';
  });

  if (st === 'pending'){
    var _allAcc = (typeof fgsgReviewsAllAccepted === 'function') ? fgsgReviewsAllAccepted(reviewsFor(app)) : false;
    html += '<div class="admin-actions"><button type="button" class="btn btn-green" id="adminApproveBtn"' + (_allAcc ? '' : ' disabled aria-disabled="true"') + '>Approve Application</button><button type="button" class="btn btn-reject" id="adminRejectBtn">Reject Application</button></div>';
    if (!_allAcc) html += '<p class="review-gate-note">Approve is locked until every item above is Accepted. The application stays Pending while any item is awaiting review, declined, asked to resend, or resubmitted.</p>';
  }
  box.innerHTML = html;
  box.style.display = 'block';

  var back = $('adminDetailBack');
  if (back) back.addEventListener('click', function(){ box.style.display = 'none'; state.selectedId = null; var w = $('adminListWrap'); if (w) w.scrollIntoView({behavior: 'smooth', block: 'start'}); });
  box.querySelectorAll('[data-admin-doc]').forEach(function(btn){
    btn.addEventListener('click', function(){ openDocument(docs[Number(btn.getAttribute('data-admin-doc'))], btn); });
  });
  box.querySelectorAll('[data-review-action]').forEach(function(btn){
    btn.addEventListener('click', function(){ saveItemReview(app, btn.getAttribute('data-review-key'), btn.getAttribute('data-review-action'), btn); });
  });
  var approve = $('adminApproveBtn'), reject = $('adminRejectBtn');
  if (approve) approve.addEventListener('click', function(){ setApplicationStatus(app, 'approved'); });
  if (reject) reject.addEventListener('click', function(){ setApplicationStatus(app, 'rejected'); });
}

/* ---------- approve / reject ---------- */
async function setApplicationStatus(app, newStatus){
  if (newStatus === 'approved'){
    var allAcc = (typeof fgsgReviewsAllAccepted === 'function') ? fgsgReviewsAllAccepted(reviewsFor(app)) : false;
    if (!allAcc){
      setDashMsg('This application cannot be Approved yet — every detail and document must be Accepted first. It stays Pending while any item is awaiting review, declined, asked to resend, or resubmitted.', 'err');
      return;
    }
  }
  var old = statusOf(app);
  app.status = newStatus;
  if (newStatus === 'approved') app.approved_at = new Date().toISOString();
  renderStats(); renderList(); renderDetail(app);
  try {
    if (typeof fgsgDb === 'undefined' || !fgsgDb) throw new Error('Supabase is not available');
    var patch = {status: newStatus};
    if (newStatus === 'approved') patch.approved_at = new Date().toISOString();
    var res = await fgsgDb.from('applications').update(patch).eq('id', app.id);
    if (res.error) throw res.error;
    setDashMsg((app.full_name || 'Application') + ' marked ' + newStatus + ' in Supabase.', 'ok');
    if (typeof toast === 'function') toast('Application ' + newStatus);
  } catch(err){
    app.status = old;
    renderStats(); renderList(); renderDetail(app);
    setDashMsg('Supabase blocked this ' + newStatus + ' update (' + ((err && err.message) || 'RLS') + '). The change was not saved — the applications table needs an admin update policy in Supabase for it to stick.', 'err');
  }
}

/* ---------- wiring ---------- */
function initAdmin(){
  var gateBtn = $('adminLoginBtn');
  if (gateBtn) gateBtn.addEventListener('click', adminGateLogin);
  ['adminUser', 'adminPass'].forEach(function(id){
    var el = $(id);
    if (el) el.addEventListener('keydown', function(e){ if (e.key === 'Enter'){ e.preventDefault(); adminGateLogin(); } });
  });
  var sbBtn = $('adminSbBtn');
  if (sbBtn) sbBtn.addEventListener('click', adminSupabaseLogin);
  var sbPass = $('adminSbPass');
  if (sbPass) sbPass.addEventListener('keydown', function(e){ if (e.key === 'Enter'){ e.preventDefault(); adminSupabaseLogin(); } });
  var logoutBtn = $('adminLogoutBtn');
  if (logoutBtn) logoutBtn.addEventListener('click', adminLogout);
  var refreshBtn = $('adminRefreshBtn');
  if (refreshBtn) refreshBtn.addEventListener('click', function(){ loadAdminData(); });
  ['adminSearch', 'adminFilterStatus', 'adminFilterInstitution', 'adminFilterState'].forEach(function(id){
    var el = $(id);
    if (el){ el.addEventListener('input', renderList); el.addEventListener('change', renderList); }
  });
  var backHome = $('adminBackHome');
  if (backHome) backHome.addEventListener('click', function(e){ e.preventDefault(); leaveAdminPage(); });
  var backHome2 = $('adminDashHome');
  if (backHome2) backHome2.addEventListener('click', function(e){ e.preventDefault(); leaveAdminPage(); });

  if (isAdminRoute()) enterAdminPage();
  window.addEventListener('hashchange', function(){
    if (isAdminRoute()) enterAdminPage();
    else if (document.body.classList.contains('in-admin')){ document.body.classList.remove('in-admin'); }
  });
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initAdmin);
else initAdmin();
})();
