/* ============================================================
   FGSG demo — Paystack verification fee & payout
   Step 5 is ONLY the real Paystack popup (test mode). There is
   no FGSG checkout sheet and no fallback checkout anywhere: if
   the Paystack script cannot load, Step 5 shows an error and
   the Pay button becomes a retry. After payment, the status is
   Pending — Waiting for Approval.
   Depends on app.js (val, toast, step state) — loaded last.
   ============================================================ */

/* ---------- Verification fee payment (Step 5) ----------
   The Pay button opens the REAL Paystack popup (PaystackPop from
   js.paystack.co, loaded on tap so pages stay fast) with the test
   public key below, amount 300000 kobo (₦3,000), currency NGN and
   an FGSG-PS reference. Channels: Card, Bank Transfer, USSD and
   Bank Account — Bank Transfer is the featured channel on the
   card and generates a Paystack-Titan account number that expires
   after 30 minutes. Test mode only: pay with the Paystack test
   card, no real money moves, and the same reference appears in the
   Paystack dashboard (Test Mode) after payment. */
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
  return (e && e.indexOf('@')>=0) ? e : 'demo@fgsg.demo';
}
function setFeeStatus(msg,ok){
  var st=document.getElementById('feeStatus');
  st.className='live-status '+(ok?'ok':'err');
  st.textContent=msg;
}
function completePaystackPayment(ref){
  feeDone=true;
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
        metadata:{custom_fields:[{display_name:'Purpose',variable_name:'purpose',value:'FGSG verification fee — competition demo'}]},
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
  if(name||school){ document.getElementById('profileSummary').innerHTML='<b>'+esc(name||'Demo Applicant')+'</b>'+(school?'<br>'+esc(school):'')+(val('fDept')?'<br>'+esc(val('fDept')):'')+(val('fLevel')?'<br>'+esc(val('fLevel')):'')+(val('fState')?'<br>'+esc(val('fState'))+(val('fLga')?' · '+esc(val('fLga'))+' LGA':''):''); }
}
function submitDemo(){
  step=7; renderStep();
  var ref='FGSG-DEMO-2026-'+Math.floor(1000+Math.random()*9000);
  document.getElementById('refCode').textContent=ref;
  var pay=document.querySelector('input[name="pay"]:checked').value;
  var name=val('fName')||'Applicant', school=val('fSchool')||'your institution';
  document.getElementById('successSummary').textContent=name.split(' ')[0]+' · '+school+' · '+pay+' · Pending — Waiting for Approval';
  var esc2=(typeof escapeHtml==='function')?escapeHtml:function(s){return String(s||'');};
  document.getElementById('bankSummary').innerHTML='<b>'+esc2(pay)+'</b>'+(pay==='Bank Account'&&val('fBank')?' · <b>'+esc2(val('fBank'))+'</b> •••'+esc2(val('fAcct').slice(-3)||'000'):'');
  document.getElementById('walletStatus').textContent='Pending — Waiting for Approval';
  renderProfile();
  toast('Application submitted — pending approval');
}
renderStep();
