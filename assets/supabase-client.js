/* ============================================================
   FGSG — Supabase client (anon key only, public by design)
   Project: uhtgwnunvyduneoqsbxz · eu-west-1
   NEVER put the service_role key in this file or the browser.
   Covers: Auth session helpers, application save via the
   fgsg_submit_application RPC (NIN encrypted server-side with
   the Vault key — plain NIN is never written to a column),
   document upload to the private student-documents bucket +
   documents metadata row, payments / transactions /
   withdrawals rows, and the LIVE student serial number.
   Does NOT change liveness, the Paystack popup, or the 24h
   Pending → ₦50,000 background wait — those stay exactly as
   they were; this file only mirrors their results to Supabase.
   Loaded after the Supabase JS CDN and before auth.js.
   ============================================================ */
var SUPABASE_URL = 'https://uhtgwnunvyduneoqsbxz.supabase.co';
var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVodGd3bnVudnlkdW5lb3FzYnh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTUxNjA5NzUsImV4cCI6MjExMDczNjk3NX0.azFySm3GRXb2DtMpCK6F9OqdwABW27JgZQOgqNc7alo';
var fgsgDb = null;
try {
  if (window.supabase && window.supabase.createClient) {
    fgsgDb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
} catch (e) { fgsgDb = null; }
window.__fgsgLiveCount = null;
window.__fgsgSerial = null;
window.__fgsgApplicationId = null;
window.__fgsgApplicationRef = '';

/* --- Auth (raw Supabase calls; auth.js wraps these for the UI) --- */
async function fgsgSignUp(email, password, fullName) {
  if (!fgsgDb) throw new Error('Supabase is not available — check your connection and try again.');
  var res = await fgsgDb.auth.signUp({ email: email, password: password, options: { data: { full_name: fullName } } });
  if (res.error) throw res.error;
  return res.data;
}
async function fgsgSignIn(email, password) {
  if (!fgsgDb) throw new Error('Supabase is not available — check your connection and try again.');
  var res = await fgsgDb.auth.signInWithPassword({ email: email, password: password });
  if (res.error) throw res.error;
  return res.data;
}
async function fgsgSignOut() {
  if (!fgsgDb) return;
  var res = await fgsgDb.auth.signOut();
  if (res && res.error) throw res.error;
}
async function fgsgCurrentUserAsync() {
  if (!fgsgDb) return null;
  var res = await fgsgDb.auth.getUser();
  return (res && res.data) ? (res.data.user || null) : null;
}

/* --- Documents: student-documents/<user-id>/<ref>/<kind>-<filename> --- */
async function fgsgUploadDocument(file, applicationRef, kind) {
  if (!fgsgDb) throw new Error('Supabase is not available.');
  var user = await fgsgCurrentUserAsync();
  if (!user) throw new Error('Log in first.');
  var safeName = String(file.name || 'document').replace(/[^\w.\-]+/g, '_');
  var path = user.id + '/' + applicationRef + '/' + kind + '-' + safeName;
  var up = await fgsgDb.storage.from('student-documents').upload(path, file, { upsert: true, contentType: file.type || undefined });
  if (up.error) throw up.error;
  return path;
}
async function fgsgRecordDocument(applicationId, kind, storagePath, file) {
  if (!fgsgDb || !applicationId) return null;
  var user = await fgsgCurrentUserAsync();
  if (!user) return null;
  var res = await fgsgDb.from('documents').insert({
    application_id: applicationId, user_id: user.id, kind: kind,
    storage_path: storagePath, file_name: file ? file.name : null,
    file_size: file ? (file.size || null) : null, mime_type: file ? (file.type || null) : null
  }).select().single();
  if (res.error) throw res.error;
  return res.data;
}

/* --- Application: NIN encrypted server-side by the RPC --- */
async function fgsgSaveApplication(form, reference) {
  if (!fgsgDb) throw new Error('Supabase is not available.');
  var user = await fgsgCurrentUserAsync();
  if (!user) throw new Error('Log in first.');
  var payout = form.fPayout || 'Grant Wallet';
  if (payout === 'Bank Account') payout = 'Bank'; /* schema check: 'Grant Wallet' | 'Bank' */
  var res = await fgsgDb.rpc('fgsg_submit_application', {
    p_user_id: user.id,
    p_reference: reference,
    p_full_name: form.fName,
    p_date_of_birth: form.fDob || null,
    p_state_of_origin: form.fState || null,
    p_lga: form.fLga || null,
    p_institution_type: form.fType || null,
    p_institution_name: form.fSchool || null,
    p_level: form.fLevel || null,
    p_department: form.fDept || null,
    p_nin: form.fNin,
    p_payout_method: payout,
    p_payout_bank: form.fBank || null,
    p_payout_account_number: form.fAcctNo || null,
    p_payout_account_name: form.fAcctName || null,
    p_wallet_id: (typeof getOrCreateWalletId === 'function') ? getOrCreateWalletId() : null
  });
  if (res.error) throw res.error;
  var row = Array.isArray(res.data) ? res.data[0] : res.data;
  if (row && row.id) { window.__fgsgApplicationId = row.id; window.__fgsgApplicationRef = reference; }
  /* Academic + Background details (the Akwa Ibom bursary items):
     the RPC above predates these fields, so they are written
     onto the same applications row with a follow-up update.
     Best-effort by design: if a column is not in the database
     yet the update is skipped and the application save above
     still stands — the submission flow never breaks. The six
     new document uploads travel separately as documents rows
     (semester_result, student_id_card,
     certificate_of_origin, birth_certificate, passport_photo). */
  if (row && row.id && (form.fMatric || form.fCgpa !== undefined || form.fPhone || form.fParentsStatus)) {
    try {
      await fgsgDb.from('applications').update({
        matric_number: form.fMatric || null,
        cgpa: (form.fCgpa === undefined ? null : form.fCgpa),
        phone_number: form.fPhone || null,
        parents_financial_status: form.fParentsStatus || null,
        no_other_government_scholarship: !!form.fNoOtherScholarship
      }).eq('id', row.id);
    } catch (e) { /* columns pending in the database — ignore */ }
  }
  return row;
}
async function fgsgLoadApplication(reference) {
  if (!fgsgDb) return null;
  var res = await fgsgDb.from('applications').select('*').eq('reference', reference).single();
  if (res.error) throw res.error;
  if (res.data && res.data.id) { window.__fgsgApplicationId = res.data.id; window.__fgsgApplicationRef = reference; }
  return res.data;
}
async function fgsgResolveApplicationId(reference) {
  if (window.__fgsgApplicationId && window.__fgsgApplicationRef === reference) return window.__fgsgApplicationId;
  if (!reference) {
    /* fall back to this user's own application, if any */
    if (!fgsgDb) return null;
    var user = await fgsgCurrentUserAsync();
    if (!user) return null;
    var own = await fgsgDb.from('applications').select('id,reference').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).single();
    if (!own.error && own.data) { window.__fgsgApplicationId = own.data.id; window.__fgsgApplicationRef = own.data.reference; return own.data.id; }
    return null;
  }
  try { var row = await fgsgLoadApplication(reference); return row ? row.id : null; } catch (e) { return null; }
}

/* --- Payments: the ₦3,000 Paystack verification fee --- */
async function fgsgSavePayment(paystackReference, applicationId) {
  if (!fgsgDb) throw new Error('Supabase is not available.');
  var user = await fgsgCurrentUserAsync();
  if (!user) throw new Error('Log in first.');
  var res = await fgsgDb.from('payments').insert({
    application_id: applicationId || null, user_id: user.id,
    paystack_reference: paystackReference || null, amount_kobo: 300000, status: 'paid'
  }).select().single();
  if (res.error) throw res.error;
  return res.data;
}

/* --- Transactions: fee | grant | withdrawal, with balance after --- */
async function fgsgAddTransaction(applicationId, kind, direction, amount, reference, balanceAfter) {
  if (!fgsgDb) throw new Error('Supabase is not available.');
  var user = await fgsgCurrentUserAsync();
  if (!user) throw new Error('Log in first.');
  var res = await fgsgDb.from('transactions').insert({
    application_id: applicationId || null, user_id: user.id,
    kind: kind, direction: direction, amount: amount,
    reference: reference || null, balance_after: (balanceAfter === undefined || balanceAfter === null) ? null : balanceAfter
  }).select().single();
  if (res.error) throw res.error;
  return res.data;
}
async function fgsgLoadTransactions() {
  if (!fgsgDb) return [];
  var res = await fgsgDb.from('transactions').select('*').order('created_at', { ascending: false });
  if (res.error) throw res.error;
  return res.data || [];
}

/* --- Withdrawals: queued Grant Wallet withdrawals --- */
async function fgsgSaveWithdrawal(applicationId, amount, bankName, bankCode, accountNumber, accountName) {
  if (!fgsgDb) throw new Error('Supabase is not available.');
  var user = await fgsgCurrentUserAsync();
  if (!user) throw new Error('Log in first.');
  var res = await fgsgDb.from('withdrawals').insert({
    application_id: applicationId || null, user_id: user.id,
    amount: amount, bank_name: bankName, bank_code: bankCode || null,
    account_number: accountNumber, account_name: accountName || null, status: 'queued'
  }).select().single();
  if (res.error) throw res.error;
  return res.data;
}

/* ============================================================
   LIVE SERIAL NUMBER — from the live Supabase count, never a
   hardcoded figure. Serials start at 0101: the first student
   application in Supabase is 0101, the next is 0102, then
   0103, and so on, in application order.
   - A student who has applied gets the serial for their own
     position: a live count of applications submitted up to
     theirs, so 1st → 0101, 2nd → 0102.
   - A signed-in student who has not applied yet sees the
     NEXT serial: 0101 + the live applications count.
   The count is fetched fresh from Supabase on every call
   (dashboard load, login, submission). RLS scopes what an
   account can count to the rows it is allowed to see.
   ============================================================ */
async function fgsgLiveStudentCount() {
  if (!fgsgDb) return null;
  try {
    var res = await fgsgDb.from('applications').select('*', { count: 'exact', head: true });
    if (!res.error && typeof res.count === 'number') { window.__fgsgLiveCount = res.count; return res.count; }
  } catch (e) {}
  try {
    var res2 = await fgsgDb.from('profiles').select('*', { count: 'exact', head: true });
    if (!res2.error && typeof res2.count === 'number') { window.__fgsgLiveCount = res2.count; return res2.count; }
  } catch (e) {}
  return null;
}
function fgsgFormatSerial(indexFromZero) {
  return String(101 + Math.max(0, indexFromZero || 0)).padStart(4, '0');
}
function fgsgRenderSerial(serial, liveCount) {
  if (!serial) return;
  window.__fgsgSerial = serial;
  var pills = ['homeSerialPill', 'bankSerialPill'];
  for (var i = 0; i < pills.length; i++) {
    var el = document.getElementById(pills[i]);
    if (el) el.textContent = 'Serial No. · ' + serial;
  }
  var spans = document.querySelectorAll('[data-serial-value]');
  for (var j = 0; j < spans.length; j++) spans[j].textContent = serial;
  var prof = document.getElementById('profileSerial');
  if (prof) prof.textContent = serial;
  if (typeof liveCount === 'number') {
    var cnt = document.getElementById('profileStudentCount');
    if (cnt) cnt.textContent = String(liveCount);
  }
}
async function fgsgRefreshSerial() {
  if (!fgsgDb) return null;
  var total = await fgsgLiveStudentCount();
  if (total === null) return null;
  var serial = null;
  try {
    var user = await fgsgCurrentUserAsync();
    if (user) {
      var own = await fgsgDb.from('applications').select('id,reference,created_at')
        .eq('user_id', user.id).order('created_at', { ascending: true }).limit(1).single();
      if (!own.error && own.data) {
        window.__fgsgApplicationId = own.data.id;
        window.__fgsgApplicationRef = own.data.reference;
        var upto = await fgsgDb.from('applications').select('*', { count: 'exact', head: true })
          .lte('created_at', own.data.created_at);
        if (!upto.error && typeof upto.count === 'number' && upto.count > 0) {
          serial = fgsgFormatSerial(upto.count - 1); /* 1st application → index 0 → 0101 */
        } else {
          serial = fgsgFormatSerial(Math.max(0, total - 1));
        }
      }
    }
  } catch (e) {}
  if (!serial) serial = fgsgFormatSerial(total); /* next available serial */
  fgsgRenderSerial(serial, total);
  return { count: total, serial: serial };
}
/* Fire-and-forget sync helper: local UI flow never waits on,
   or breaks because of, a Supabase mirror write. */
function fgsgSync(label, promise) {
  if (!promise || typeof promise.catch !== 'function') return;
  promise.catch(function (err) {
    if (window.console && console.warn) console.warn('[FGSG Supabase] ' + label + ' sync failed:', err && err.message ? err.message : err);
  });
}

/* ============================================================
   PER-ITEM REVIEW — every detail and document, one by one.
   Supabase table required (run once in the SQL editor):
     create table if not exists public.item_reviews (
       id uuid primary key default gen_random_uuid(),
       application_id uuid references public.applications(id) on delete cascade,
       user_id uuid,
       item_key text not null,
       item_label text,
       status text not null check (status in ('accepted','declined','resend','resubmitted')),
       reason text,
       reviewed_by text,
       created_at timestamptz not null default now()
     );
     alter table public.item_reviews enable row level security;
     -- Policies: students can select/insert rows for their own
     -- application; admins (profiles.is_admin / role='admin')
     -- can select/insert/update all rows. Add those policies
     -- alongside the existing admin policies for applications.
   Every Accept / Decline / Ask for Resend inserts ONE new row
   — rows are never edited or deleted, so the full history for
   an item is every row with that item_key, oldest first. The
   latest row for an item is its current review status. A
   student resubmission also inserts a row (status
   'resubmitted'), which returns the item to awaiting review.
   ============================================================ */
var FGSG_REVIEW_ITEMS = [
  {key:'full_name', label:'Full name', kind:'field', column:'full_name', fieldId:'fName', inputType:'text'},
  {key:'date_of_birth', label:'Date of birth', kind:'field', column:'date_of_birth', fieldId:'fDob', inputType:'date'},
  {key:'state_of_origin', label:'State of origin', kind:'field', column:'state_of_origin', fieldId:'fState', inputType:'text'},
  {key:'lga', label:'LGA', kind:'field', column:'lga', fieldId:'fLga', inputType:'text'},
  {key:'institution_type', label:'Institution type', kind:'field', column:'institution_type', fieldId:'fType', inputType:'text'},
  {key:'institution_name', label:'Institution name', kind:'field', column:'institution_name', fieldId:'fSchool', inputType:'text'},
  {key:'level', label:'Level', kind:'field', column:'level', fieldId:'fLevel', inputType:'text'},
  {key:'department', label:'Department', kind:'field', column:'department', fieldId:'fDept', inputType:'text'},
  {key:'matric_number', label:'Matric / Registration Number', kind:'field', column:'matric_number', fieldId:'fMatric', inputType:'text'},
  {key:'cgpa', label:'CGPA', kind:'field', column:'cgpa', fieldId:'fCgpa', inputType:'text'},
  {key:'phone_number', label:'Phone number', kind:'field', column:'phone_number', fieldId:'fPhone', inputType:'tel'},
  {key:'parents_status', label:"Parents' status / occupation", kind:'field', column:'parents_financial_status', fieldId:'fParentsStatus', inputType:'text'},
  {key:'scholarship_confirmation', label:'No other government scholarship', kind:'field', column:'no_other_government_scholarship', fieldId:'fNoOtherScholarship', inputType:'text'},
  {key:'nin', label:'NIN', kind:'field', column:null, fieldId:'fNin', inputType:'text'},
  {key:'doc_nin_card', label:'NIN Card / Slip', kind:'document', docKind:'nin_card', uploadId:'upNin'},
  {key:'payout', label:'Payout details', kind:'field', column:null, fieldId:null, inputType:'text'},
  {key:'doc_jamb_letter', label:'JAMB Admission Letter', kind:'document', docKind:'jamb_letter', uploadId:'upJamb'},
  {key:'doc_fees_receipt', label:'Last School Fees Receipt', kind:'document', docKind:'fees_receipt', uploadId:'upFees'},
  {key:'doc_semester_result', label:'Statement of Result', kind:'document', docKind:'semester_result', uploadId:'upResult'},
  {key:'doc_student_id_card', label:'Student ID Card', kind:'document', docKind:'student_id_card', uploadId:'upStudentId'},
  {key:'doc_certificate_of_origin', label:'Certificate of Origin', kind:'document', docKind:'certificate_of_origin', uploadId:'upOrigin'},
  {key:'doc_birth_certificate', label:'Birth Certificate / Age Declaration', kind:'document', docKind:'birth_certificate', uploadId:'upBirth'},
  {key:'doc_passport_photo', label:'Passport Photograph', kind:'document', docKind:'passport_photo', uploadId:'upPassport'}
];
function fgsgReviewItemByKey(key){
  for (var i = 0; i < FGSG_REVIEW_ITEMS.length; i++) if (FGSG_REVIEW_ITEMS[i].key === key) return FGSG_REVIEW_ITEMS[i];
  return null;
}
function fgsgLatestReviewMap(reviews){
  var map = {};
  (reviews || []).forEach(function(r){ if (r && r.item_key) map[r.item_key] = r; });
  return map;
}
function fgsgReviewsAllAccepted(reviews){
  var map = fgsgLatestReviewMap(reviews);
  return FGSG_REVIEW_ITEMS.every(function(it){ var r = map[it.key]; return r && r.status === 'accepted'; });
}
function fgsgReviewCounts(reviews){
  var map = fgsgLatestReviewMap(reviews);
  var c = {accepted:0, declined:0, resend:0, resubmitted:0, waiting:0, total:FGSG_REVIEW_ITEMS.length};
  FGSG_REVIEW_ITEMS.forEach(function(it){
    var r = map[it.key];
    if (!r) c.waiting++;
    else if (r.status === 'accepted') c.accepted++;
    else if (r.status === 'declined') c.declined++;
    else if (r.status === 'resend') c.resend++;
    else if (r.status === 'resubmitted') c.resubmitted++;
    else c.waiting++;
  });
  return c;
}
async function fgsgLoadItemReviews(applicationId) {
  if (!fgsgDb || !applicationId) return [];
  var res = await fgsgDb.from('item_reviews').select('*').eq('application_id', applicationId).order('created_at', { ascending: true });
  if (res.error) throw res.error;
  return res.data || [];
}
async function fgsgSaveItemReview(applicationId, userId, itemKey, itemLabel, status, reason, reviewedBy) {
  if (!fgsgDb) throw new Error('Supabase is not available');
  if (!applicationId) throw new Error('Application not found in Supabase yet');
  var res = await fgsgDb.from('item_reviews').insert({
    application_id: applicationId, user_id: userId || null,
    item_key: itemKey, item_label: itemLabel || null,
    status: status, reason: (reason || '').trim() || null,
    reviewed_by: reviewedBy || null
  }).select().single();
  if (res.error) throw res.error;
  return res.data;
}
