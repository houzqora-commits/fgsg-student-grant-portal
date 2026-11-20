/* ============================================================
   FGSG — Paystack verification fee & payout
   Step 7 is ONLY the real Paystack popup. There is
   no FGSG checkout sheet and no fallback checkout anywhere: if
   the Paystack script cannot load, Step 7 shows an error and
   the Pay button becomes a retry. After payment, the status is
   Pending — Waiting for Approval.
   Depends on app.js (val, toast, step state) — loaded last.
   ============================================================ */

/* ---------- Verification fee payment (Step 7) ----------
   The Pay button opens the REAL Paystack popup (PaystackPop from
   js.paystack.co, loaded on tap so pages stay fast) with the
   public key below, amount 300000 kobo (₦3,000), currency NGN and
   an FGSG-PS reference. Channels: Card, Bank Transfer, USSD and
   Bank Account — Bank Transfer is the featured channel on the
   card and generates a Paystack-Titan account number that expires
   after 30 minutes. The same reference appears in the Paystack
   dashboard after payment. */
var PAYSTACK_PUBLIC_KEY='pk_test_e9e8232812380633f7d91f6f7db571fa0296ae72';
var PAYSTACK_SRC='https://js.paystack.co/v1/inline.js';
var paystackRef='';
function makePaystackRef(){
  paystackRef='FGSG-PS-2026-'+Math.floor(1000+Math.random()*9000);
  document.getElementById('psRefPreview').textContent=paystackRef;
  return paystackRef;
}
function paystackEmail(){
  var e=val('fEmail');
  return (e && e.indexOf('@')>=0) ? e : 'you@example.com';
}
function setFeeStatus(msg,ok){
  var st=document.getElementById('feeStatus');
  st.className='live-status '+(ok?'ok':'err');
  st.textContent=msg;
}
function completePaystackPayment(ref){
  feeDone=true;
  if(typeof draftFeePaidAt!=='undefined') draftFeePaidAt=Date.now();
  if(typeof draftFeeRef!=='undefined') draftFeeRef=ref||'';
  if(typeof saveDraft==='function') saveDraft();
  if(typeof renderTxHistory==='function') renderTxHistory();
  /* Mirror the fee to Supabase: a payments row for the Paystack
     reference plus the fee transaction row. The application row
     does not exist yet at Step 7, so both link to it later via
     the user; application_id stays null here, as the schema
     allows. Fire-and-forget — the popup flow never waits on it. */
  if(typeof fgsgSync==='function'){
    if(typeof fgsgSavePayment==='function') fgsgSync('fee payment', fgsgSavePayment(ref||'', null));
    if(typeof fgsgAddTransaction==='function') fgsgSync('fee transaction', fgsgAddTransaction(null, 'fee', 'out', 3000, ref||'', null));
  }
  setFeeStatus('Payment received — Pending, waiting for approval · Ref: '+ref,true);
  document.getElementById('feeBtn').textContent='Paid via Paystack ✓ — ₦3,000';
  var pending=document.getElementById('feePending');
  if(pending) pending.style.display='flex';
  document.getElementById('walletStatus').textContent='Pending — Waiting for Approval';
  toast('Payment received — pending approval');
}
/* Paystack could not load or open: error + retry on the same Pay
   button. The in-memory script cache is cleared so the retry
   really fetches the script again. No sheet ever opens here. */
function paystackLoadFailed(){
  if(window._scriptCache) delete _scriptCache[PAYSTACK_SRC];
  var btn=document.getElementById('feeBtn');
  btn.disabled=false;
  btn.textContent='Try Again — Pay ₦3,000';
  setFeeStatus('Paystack could not load — check your connection and tap Try Again.',false);
}
function openPaystackPopup(){
  var ref=makePaystackRef();
  document.getElementById('psEmail').textContent=paystackEmail();
  var btn=document.getElementById('feeBtn');
  btn.disabled=true; btn.textContent='Opening Paystack…';
  setFeeStatus('',true);
  loadScriptOnce(PAYSTACK_SRC).then(function(){
    btn.disabled=false; btn.textContent='Pay ₦3,000';
    if(typeof PaystackPop==='undefined'){ paystackLoadFailed(); return; }
    var paid=false;
    try{
      var handler=PaystackPop.setup({
        key:PAYSTACK_PUBLIC_KEY,
        email:paystackEmail(),
        amount:300000,
        currency:'NGN',
        ref:ref,
        channels:['card','bank_transfer','ussd','bank'],
        metadata:{custom_fields:[{display_name:'Purpose',variable_name:'purpose',value:'FGSG verification fee'}]},
        callback:function(response){
          paid=true;
          completePaystackPayment(response.reference||ref);
        },
        onClose:function(){
          if(!paid && !feeDone) setFeeStatus('Paystack payment cancelled — pay to continue.',false);
        }
      });
      handler.openIframe();
    }catch(err){
      paystackLoadFailed();
    }
  }).catch(function(){
    paystackLoadFailed();
  });
}
document.getElementById('feeBtn').addEventListener('click',function(){
  if(feeDone){ toast('Verification fee already paid'); return; }
  openPaystackPopup();
});
makePaystackRef();

/* payout toggle */
document.querySelectorAll('input[name="pay"]').forEach(function(r){ r.addEventListener('change',function(){
  document.getElementById('bankFields').style.display = document.querySelector('input[name="pay"]:checked').value==='Bank Account' ? 'grid':'none';
});});

function renderProfile(){
  var name=val('fName'), school=val('fSchool');
  var esc=(typeof escapeHtml==='function')?escapeHtml:function(s){return String(s||'');};
  if(name||school){ document.getElementById('profileSummary').innerHTML='<b>'+esc(name||'Applicant')+'</b>'+(school?'<br>'+esc(school):'')+(val('fDept')?'<br>'+esc(val('fDept')):'')+(val('fLevel')?'<br>'+esc(val('fLevel')):'')+(val('fMatric')?'<br>Matric No. · '+esc(val('fMatric')):'')+(val('fCgpa')?'<br>CGPA · '+esc(val('fCgpa')):'')+(val('fPhone')?'<br>'+esc(val('fPhone')):'')+(val('fState')?'<br>'+esc(val('fState'))+(val('fLga')?' · '+esc(val('fLga'))+' LGA':''):''); }
}
/* Mirror a submitted application to Supabase, in order:
   1) the applications row via fgsg_submit_application — the
      RPC encrypts the NIN server-side, only encrypted bytes
      are stored, and fgsgSaveApplication then writes the
      Academic / Background fields (matric, CGPA, parents'
      status, phone, no-other-scholarship confirmation) onto
      that same applications row; 2) every uploaded file — JAMB
      letter, fees receipt, statement of result, HOD
      student ID card, certificate of origin,
      birth certificate and passport photograph — to the
      student-documents bucket plus their documents rows.
   The Pending UI below never waits on this; failures are
   logged by fgsgSync and the local flow is unchanged. */
function syncApplicationToSupabase(ref, payValue){
  if(typeof fgsgSaveApplication!=='function') return;
  var noSchEl=document.getElementById('fNoOtherScholarship');
  var cgpaVal=parseFloat(val('fCgpa'));
  var form={
    fName:val('fName'), fDob:val('fDob'), fState:val('fState'), fLga:val('fLga'),
    fType:val('fType'), fSchool:val('fSchool'), fLevel:val('fLevel'), fDept:val('fDept'),
    fNin:val('fNin').replace(/\s/g,''), fPayout:payValue,
    fBank:val('fBank'), fAcctNo:val('fAcct'), fAcctName:val('fAcctName'),
    fMatric:val('fMatric'), fCgpa:isNaN(cgpaVal)?null:cgpaVal,
    fParentsStatus:val('fParentsStatus'), fPhone:val('fPhone'),
    fNoOtherScholarship:!!(noSchEl&&noSchEl.checked)
  };
  function fileOf(id){ var el=document.getElementById(id); return (el && el.files && el.files.length)?el.files[0]:null; }
  var docFiles=[
    {file:fileOf('upJamb'), kind:'jamb_letter'},
    {file:fileOf('upFees'), kind:'fees_receipt'},
    {file:fileOf('upResult'), kind:'semester_result'},
    {file:fileOf('upStudentId'), kind:'student_id_card'},
    {file:fileOf('upOrigin'), kind:'certificate_of_origin'},
    {file:fileOf('upBirth'), kind:'birth_certificate'},
    {file:fileOf('upPassport'), kind:'passport_photo'}
  ];
  var chain=fgsgSaveApplication(form, ref).then(function(row){
    var appId=row?row.id:null;
    if(!appId) return null;
    var jobs=[];
    docFiles.forEach(function(d){
      if(d.file && typeof fgsgUploadDocument==='function'){
        jobs.push(fgsgUploadDocument(d.file, ref, d.kind).then(function(path){
          if(typeof fgsgRecordDocument==='function') return fgsgRecordDocument(appId, d.kind, path, d.file);
        }));
      }
    });
    return Promise.all(jobs);
  }).then(function(){
    /* The live serial follows the new live count in Supabase. */
    if(typeof fgsgRefreshSerial==='function') return fgsgRefreshSerial();
  });
  if(typeof fgsgSync==='function') fgsgSync('application + documents', chain);
}
function submitApplication(){
  /* Locked: no second application once one is submitted. */
  if(typeof isSubmitted==='function' && isSubmitted()){ step=9; renderStep(); if(typeof renderGrantState==='function') renderGrantState(); toast('Application already submitted'); return; }
  if(typeof draftAppRef!=='undefined' && draftAppRef && step===9){ toast('Application already submitted'); return; }
  step=9; renderStep();
  var ref='FGSG-2026-'+Math.floor(1000+Math.random()*9000);
  if(typeof draftAppRef!=='undefined') draftAppRef=ref;
  if(typeof draftSubmittedAt!=='undefined') draftSubmittedAt=Date.now();
  if(typeof saveDraft==='function') saveDraft();
  syncApplicationToSupabase(ref, document.querySelector('input[name="pay"]:checked').value);
  document.getElementById('refCode').textContent=ref;
  var pay=document.querySelector('input[name="pay"]:checked').value;
  var name=val('fName')||'Applicant', school=val('fSchool')||'your institution';
  document.getElementById('successSummary').textContent=name.split(' ')[0]+' · '+school+' · '+pay+' · ₦50,000 Grant · Pending — Waiting for Approval';
  var esc2=(typeof escapeHtml==='function')?escapeHtml:function(s){return String(s||'');};
  document.getElementById('bankSummary').innerHTML='<b>'+esc2(pay)+'</b>'+(pay==='Bank Account'&&val('fBank')?' · <b>'+esc2(val('fBank'))+'</b> •••'+esc2(val('fAcct').slice(-3)||'000'):'');
  document.getElementById('walletStatus').textContent='Pending — Waiting for Approval';
  renderStep();
  if(typeof renderGrantState==='function') renderGrantState();
  renderProfile();
  toast('Application submitted — pending approval');
}
renderStep();
