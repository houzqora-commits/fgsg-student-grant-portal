/* ============================================================
   FGSG — Per-item review: student side
   Shows the admin's decision for every detail and document on
   the dashboard (view-home) and in the application
   (view-application). Declined / Resend items are marked
   clearly with the admin reason, and the student can correct
   or re-upload JUST that item and resubmit it — the rest of
   the application is untouched and never restarted.
   Data: Supabase `item_reviews` (see supabase-client.js for the
   table SQL). Latest row per item_key is the current status;
   every row is the history for that item. A resubmission
   inserts a new row with status 'resubmitted'.
   Loaded after payment.js, before admin.js.
   ============================================================ */
(function(){
'use strict';
function $(id){ return document.getElementById(id); }
function esc(s){ return (typeof escapeHtml === 'function') ? escapeHtml(s == null ? '' : String(s)) : String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
function fmtDT(v){ if(!v) return '—'; try { return new Date(v).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}) + ' · ' + new Date(v).toLocaleTimeString('en-GB',{hour:'numeric',minute:'2-digit'}); } catch(e){ return '—'; } }
function statusLabel(s){
  if (s === 'accepted') return 'Accepted';
  if (s === 'declined') return 'Declined';
  if (s === 'resend') return 'Resend requested';
  if (s === 'resubmitted') return 'Resubmitted — awaiting review';
  return 'Awaiting review';
}
function statusClass(s){
  if (s === 'accepted') return 'accepted';
  if (s === 'declined') return 'declined';
  if (s === 'resend') return 'resend';
  if (s === 'resubmitted') return 'resubmitted';
  return 'waiting';
}

var _myApp = null;
var _myReviews = [];
var _myDocs = [];
var _loading = false;
var _loadedFor = null;

async function loadMyReviewData(force){
  if (_loading) return null;
  if (typeof fgsgDb === 'undefined' || !fgsgDb) return null;
  var user = null;
  try { user = await fgsgCurrentUserAsync(); } catch(e){}
  if (!user) return null;
  var cacheKey = user.id;
  if (!force && _loadedFor === cacheKey && _myApp) return {app:_myApp, reviews:_myReviews};
  _loading = true;
  try {
    var appRes = await fgsgDb.from('applications').select('*').eq('user_id', user.id).order('created_at', {ascending:false}).limit(1).single();
    if (appRes.error || !appRes.data){ _myApp = null; _myReviews = []; _myDocs = []; _loadedFor = cacheKey; return null; }
    _myApp = appRes.data;
    window.__fgsgApplicationId = _myApp.id;
    if (_myApp.reference) window.__fgsgApplicationRef = _myApp.reference;
    try { _myReviews = await fgsgLoadItemReviews(_myApp.id); } catch(e){ _myReviews = []; }
    try {
      var dRes = await fgsgDb.from('documents').select('*').eq('application_id', _myApp.id).order('created_at', {ascending:false});
      _myDocs = (!dRes.error && dRes.data) ? dRes.data : [];
    } catch(e){ _myDocs = []; }
    _loadedFor = cacheKey;
    return {app:_myApp, reviews:_myReviews};
  } catch(e){ return null; }
  finally { _loading = false; }
}

function fieldValue(app, def){
  if (!app || !def) return '';
  if (def.key === 'nin') return app.nin_encrypted ? 'On file — encrypted' : 'Not on file';
  if (def.key === 'payout'){
    var parts = [];
    if (app.payout_method) parts.push(app.payout_method === 'Bank' ? 'Bank Account' : app.payout_method);
    if (app.payout_bank) parts.push(app.payout_bank);
    if (app.payout_account_number) parts.push('••••' + String(app.payout_account_number).slice(-4));
    if (app.payout_account_name) parts.push(app.payout_account_name);
    return parts.join(' · ') || '—';
  }
  if (def.key === 'scholarship_confirmation'){
    if (app.no_other_government_scholarship == null) return '—';
    return app.no_other_government_scholarship ? 'Confirmed' : 'Not confirmed';
  }
  if (!def.column) return '—';
  var v = app[def.column];
  if (v == null || v === '') return '—';
  if (def.key === 'date_of_birth'){ try { return new Date(v).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}); } catch(e){ return String(v); } }
  return String(v);
}
function docFor(def){
  if (!def || !def.docKind) return null;
  for (var i = 0; i < _myDocs.length; i++){ if (_myDocs[i].kind === def.docKind) return _myDocs[i]; }
  return null;
}
function historyHtml(itemKey){
  var rows = _myReviews.filter(function(r){ return r.item_key === itemKey; });
  if (!rows.length) return '';
  var h = '<div class="sr-history"><span class="sr-history-title">Review history</span>';
  rows.slice().reverse().forEach(function(r){
    h += '<div class="sr-history-row"><span class="sr-pill ' + statusClass(r.status) + '">' + esc(statusLabel(r.status)) + '</span><span class="sr-history-meta">' + esc(fmtDT(r.created_at)) + (r.reviewed_by ? ' · ' + esc(r.reviewed_by) : '') + '</span>' + (r.reason ? '<span class="sr-history-reason">' + esc(r.reason) + '</span>' : '') + '</div>';
  });
  h += '</div>';
  return h;
}

function renderStudentReviews(){
  var homeEl = $('studentReviewHome'), appEl = $('studentReviewApp');
  if (!homeEl && !appEl) return;
  if (!_myApp || !_myReviews.length){
    if (homeEl) homeEl.innerHTML = '';
    if (appEl) appEl.innerHTML = '';
    return;
  }
  var map = (typeof fgsgLatestReviewMap === 'function') ? fgsgLatestReviewMap(_myReviews) : {};
  var counts = (typeof fgsgReviewCounts === 'function') ? fgsgReviewCounts(_myReviews) : {accepted:0, declined:0, resend:0, resubmitted:0, waiting:0, total:(typeof FGSG_REVIEW_ITEMS !== 'undefined' ? FGSG_REVIEW_ITEMS.length : 0)};
  var needsAction = [];
  var items = (typeof FGSG_REVIEW_ITEMS !== 'undefined') ? FGSG_REVIEW_ITEMS : [];
  items.forEach(function(def){
    var r = map[def.key];
    if (r && (r.status === 'declined' || r.status === 'resend')) needsAction.push({def:def, review:r});
  });
  var overall = String(_myApp.status || 'pending').toLowerCase();
  var allAccepted = (typeof fgsgReviewsAllAccepted === 'function') ? fgsgReviewsAllAccepted(_myReviews) : false;

  function flaggedHtml(entry){
    var def = entry.def, r = entry.review;
    var isDoc = def.kind === 'document';
    var current = isDoc ? (function(){ var d = docFor(def); return d ? (d.file_name || d.storage_path || 'Uploaded') : 'Not uploaded'; })() : fieldValue(_myApp, def);
    var h = '<div class="sr-item flagged ' + statusClass(r.status) + '" data-sr-item="' + esc(def.key) + '">';
    h += '<div class="sr-item-head"><b>' + esc(def.label) + '</b><span class="sr-pill ' + statusClass(r.status) + '">' + esc(statusLabel(r.status)) + '</span></div>';
    h += '<p class="sr-current"><span>Submitted</span> ' + esc(current) + '</p>';
    if (r.reason) h += '<p class="sr-reason"><span>Admin reason</span> ' + esc(r.reason) + '</p>';
    if (isDoc){
      h += '<label class="sr-label">' + esc(def.label) + ' — new file<input type="file" class="sr-file" data-sr-file="' + esc(def.key) + '" accept=".pdf,image/*"></label>';
      h += '<button type="button" class="btn btn-green sr-resubmit" data-sr-resubmit="' + esc(def.key) + '">Upload &amp; Resubmit</button>';
    } else if (def.key === 'nin'){
      h += '<label class="sr-label">NIN<input type="text" class="sr-input" data-sr-input="' + esc(def.key) + '" inputmode="numeric" maxlength="13" placeholder="11 digits"></label>';
      h += '<button type="button" class="btn btn-green sr-resubmit" data-sr-resubmit="' + esc(def.key) + '">Resubmit</button>';
    } else if (def.key === 'payout'){
      h += '<label class="sr-label">Payout bank<input type="text" class="sr-input" data-sr-input="payout_bank" placeholder="Bank name"></label>';
      h += '<label class="sr-label">Account number<input type="text" class="sr-input" data-sr-input="payout_account_number" inputmode="numeric" maxlength="10" placeholder="10 digits"></label>';
      h += '<label class="sr-label">Account name<input type="text" class="sr-input" data-sr-input="payout_account_name" placeholder="Name on the account"></label>';
      h += '<button type="button" class="btn btn-green sr-resubmit" data-sr-resubmit="' + esc(def.key) + '">Resubmit</button>';
    } else if (def.key === 'scholarship_confirmation'){
      h += '<label class="sr-label">Confirmation<select class="sr-input" data-sr-input="' + esc(def.key) + '"><option value="true">Confirmed — no other government scholarship</option><option value="false">Not confirmed</option></select></label>';
      h += '<button type="button" class="btn btn-green sr-resubmit" data-sr-resubmit="' + esc(def.key) + '">Resubmit</button>';
    } else {
      var val = (def.column && _myApp[def.column] != null) ? String(_myApp[def.column]) : '';
      if (def.key === 'date_of_birth' && val) { try { val = String(val).slice(0,10); } catch(e){} }
      h += '<label class="sr-label">' + esc(def.label) + '<input type="' + esc(def.inputType || 'text') + '" class="sr-input" data-sr-input="' + esc(def.key) + '" value="' + esc(val) + '"></label>';
      h += '<button type="button" class="btn btn-green sr-resubmit" data-sr-resubmit="' + esc(def.key) + '">Correct &amp; Resubmit</button>';
    }
    h += '<p class="sr-msg" data-sr-msg="' + esc(def.key) + '" role="alert"></p>';
    h += historyHtml(def.key);
    h += '</div>';
    return h;
  }

  function fullListHtml(){
    var h = '<div class="sr-all">';
    items.forEach(function(def){
      var r = map[def.key];
      var st = r ? r.status : null;
      var current = def.kind === 'document' ? (function(){ var d = docFor(def); return d ? (d.file_name || 'Uploaded') : 'Not uploaded'; })() : fieldValue(_myApp, def);
      h += '<div class="sr-row"><div class="sr-row-main"><b>' + esc(def.label) + '</b><span>' + esc(current) + '</span>' + (r && r.reason && st !== 'accepted' ? '<span class="sr-row-reason">' + esc(r.reason) + '</span>' : '') + '</div><span class="sr-pill ' + statusClass(st) + '">' + esc(statusLabel(st)) + '</span></div>';
      h += historyHtml(def.key);
    });
    h += '</div>';
    return h;
  }

  var html = '<section class="sr-card" aria-label="Application review">';
  html += '<div class="sr-head"><h3>Application Review</h3><span class="sr-pill ' + (allAccepted ? 'accepted' : (overall === 'rejected' ? 'declined' : 'waiting')) + '">' + esc(allAccepted ? 'All items accepted' : (overall === 'rejected' ? 'Rejected' : 'Pending')) + '</span></div>';
  html += '<p class="sr-summary">' + counts.accepted + ' of ' + counts.total + ' accepted' + (counts.declined ? ' · ' + counts.declined + ' declined' : '') + (counts.resend ? ' · ' + counts.resend + ' resend requested' : '') + (counts.resubmitted ? ' · ' + counts.resubmitted + ' resubmitted' : '') + (counts.waiting ? ' · ' + counts.waiting + ' awaiting review' : '') + '</p>';
  if (needsAction.length){
    html += '<h4 class="sr-subhead">Needs correction</h4>';
    needsAction.forEach(function(e){ html += flaggedHtml(e); });
  }
  html += '<details class="sr-details"><summary>All items &amp; review history</summary>' + fullListHtml() + '</details>';
  html += '</section>';

  if (homeEl) homeEl.innerHTML = html;
  if (appEl) appEl.innerHTML = html;
  wireResubmitButtons(homeEl);
  wireResubmitButtons(appEl);
}

function setItemMsg(container, key, msg, ok){
  if (!container) return;
  var el = container.querySelector('[data-sr-msg="' + key + '"]');
  if (!el) return;
  el.textContent = msg || '';
  el.className = 'sr-msg' + (msg ? (' show ' + (ok ? 'ok' : 'err')) : '');
}
function wireResubmitButtons(container){
  if (!container) return;
  container.querySelectorAll('[data-sr-resubmit]').forEach(function(btn){
    btn.addEventListener('click', function(){ resubmitItem(btn.getAttribute('data-sr-resubmit'), btn, container); });
  });
}

async function resubmitItem(key, btn, container){
  var def = (typeof fgsgReviewItemByKey === 'function') ? fgsgReviewItemByKey(key) : null;
  if (!def || !_myApp) return;
  setItemMsg(container, key, '');
  var original = btn.textContent;
  btn.disabled = true; btn.textContent = 'Sending…';
  try {
    if (typeof fgsgDb === 'undefined' || !fgsgDb) throw new Error('Supabase is not available');
    var user = await fgsgCurrentUserAsync();
    if (!user) throw new Error('Log in first');
    if (def.kind === 'document'){
      var fileInput = container.querySelector('[data-sr-file="' + key + '"]');
      var file = fileInput && fileInput.files && fileInput.files.length ? fileInput.files[0] : null;
      if (!file) throw new Error('Choose the new file first');
      if (typeof fgsgUploadDocument !== 'function' || typeof fgsgRecordDocument !== 'function') throw new Error('Upload is not available');
      var path = await fgsgUploadDocument(file, _myApp.reference || _myApp.id, def.docKind);
      await fgsgRecordDocument(_myApp.id, def.docKind, path, file);
    } else if (def.key === 'nin'){
      var ninInput = container.querySelector('[data-sr-input="' + key + '"]');
      var nin = ninInput ? ninInput.value.replace(/\s/g,'') : '';
      if (!/^\d{11}$/.test(nin)) throw new Error('Enter 11 digits for NIN');
      /* NIN is only ever stored encrypted via the submit RPC;
         re-running it would create a new application, so the
         resubmission is recorded for admin review and the plain
         NIN is never written to a column. */
    } else if (def.key === 'payout'){
      var bankEl = container.querySelector('[data-sr-input="payout_bank"]');
      var acctEl = container.querySelector('[data-sr-input="payout_account_number"]');
      var nameEl = container.querySelector('[data-sr-input="payout_account_name"]');
      var patchP = {};
      if (bankEl && bankEl.value.trim()) patchP.payout_bank = bankEl.value.trim();
      if (acctEl && acctEl.value.trim()) patchP.payout_account_number = acctEl.value.trim();
      if (nameEl && nameEl.value.trim()) patchP.payout_account_name = nameEl.value.trim();
      if (!Object.keys(patchP).length) throw new Error('Enter the corrected payout detail');
      var upP = await fgsgDb.from('applications').update(patchP).eq('id', _myApp.id);
      if (upP.error) throw upP.error;
      Object.keys(patchP).forEach(function(k){ _myApp[k] = patchP[k]; });
    } else if (def.column){
      var input = container.querySelector('[data-sr-input="' + key + '"]');
      var value = input ? input.value.trim() : '';
      if (!value) throw new Error('Enter the corrected ' + def.label.toLowerCase());
      var patch = {};
      if (def.key === 'scholarship_confirmation') patch[def.column] = (value === 'true');
      else if (def.key === 'cgpa'){ var n = parseFloat(value); patch[def.column] = isNaN(n) ? value : n; }
      else patch[def.column] = value;
      var up = await fgsgDb.from('applications').update(patch).eq('id', _myApp.id);
      if (up.error) throw up.error;
      _myApp[def.column] = patch[def.column];
      if (def.fieldId){ var formEl = $(def.fieldId); if (formEl) formEl.value = value; if (typeof saveDraft === 'function') saveDraft(); }
    }
    var saved = await fgsgSaveItemReview(_myApp.id, user.id, def.key, def.label, 'resubmitted', '', user.email || null);
    _myReviews.push(saved);
    /* A resubmitted item means the application is Pending again. */
    if (String(_myApp.status || '').toLowerCase() !== 'pending'){
      try { await fgsgDb.from('applications').update({status:'pending'}).eq('id', _myApp.id); _myApp.status = 'pending'; } catch(e){}
    }
    btn.disabled = false; btn.textContent = original;
    if (typeof toast === 'function') toast(def.label + ' resubmitted');
    renderStudentReviews();
  } catch(err){
    btn.disabled = false; btn.textContent = original;
    setItemMsg(container, key, (err && err.message) ? err.message : 'Resubmission could not be saved to Supabase', false);
  }
}

async function refreshStudentReviews(force){
  await loadMyReviewData(!!force);
  renderStudentReviews();
}
window.refreshStudentReviews = refreshStudentReviews;
window.renderStudentReviews = renderStudentReviews;

/* Refresh when the portal opens / the view changes. showView is
   defined in app.js (loaded before this file), so wrap it. */
if (typeof window.showView === 'function'){
  var _origShowView = window.showView;
  window.showView = function(name){ var r = _origShowView.apply(this, arguments); if (name === 'home' || name === 'application') refreshStudentReviews(false); return r; };
}
window.addEventListener('load', function(){ setTimeout(function(){ refreshStudentReviews(false); }, 400); });
setInterval(function(){
  var appPage = $('page-app');
  if (appPage && appPage.classList.contains('active')) refreshStudentReviews(false);
}, 60000);
})();
