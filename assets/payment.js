/* ============================================================
   FGSG demo — Paystack verification fee & payout
   Step 5 Paystack popup (test mode), fallback test checkout,
   payout choice, profile summary and demo submission.
   Depends on app.js (val, toast, step state) — loaded last.
   ============================================================ */

/* ---------- Paystack payment (Step 5) ----------
   Paystack TEST public key (pk_test_…) wired in: the Pay button opens the
   real Paystack popup via PaystackPop. Test mode only — payments are made
   with Paystack test cards and no real money moves. If the Paystack script
   fails to load, the button falls back to the in-page test checkout above. */
var PAYSTACK_PUBLIC_KEY='pk_test_e9e8232812380633f7d91f6f7db571fa0296ae72';
var paystackRef='';
function makePaystackRef(){
  paystackRef='FGSG-PS-2026-'+Math.floor(1000+Math.random()*9000);
  document.getElementById('psRefPreview').textContent=paystackRef;
  document.getElementById('psModalRef').textContent=paystackRef;
  return paystackRef;
}
function paystackEmail(){
  var e=val('fEmail');
  return (e && e.indexOf('@')>=0) ? e : 'demo@fgsg.demo';
}
function completePaystackPayment(ref){
  feeDone=true;
  var st=document.getElementById('feeStatus');
  st.className='live-status ok';
  st.textContent='✓ Paid via Paystack · Ref: '+ref;
  document.getElementById('feeBtn').textContent='Paid via Paystack ✓ — ₦3,000';
  document.getElementById('walletStatus').textContent='Verification fee paid';
  toast('Payment complete');
}
function openTestCheckout(){
  makePaystackRef();
  document.getElementById('psEmail').textContent=paystackEmail();
  document.getElementById('psModalEmail').textContent=paystackEmail();
  document.getElementById('psModalStatus').textContent='';
  document.getElementById('psPayBtn').disabled=false;
  document.getElementById('psPayBtn').textContent='Complete Test Payment — ₦3,000';
  document.getElementById('psOverlay').classList.add('open');
}
function closeTestCheckout(msg){
  document.getElementById('psOverlay').classList.remove('open');
  if(msg && !feeDone){
    var st=document.getElementById('feeStatus');
    st.className='live-status err'; st.textContent=msg;
  }
}
document.querySelectorAll('[data-ps-tab]').forEach(function(tab){
  tab.addEventListener('click',function(){
    document.querySelectorAll('[data-ps-tab]').forEach(function(t){t.classList.toggle('on',t===tab);});
    document.querySelectorAll('[data-ps-panel]').forEach(function(p){p.classList.toggle('on',p.dataset.psPanel===tab.dataset.psTab);});
    document.querySelectorAll('.ps-channels .ps-channel').forEach(function(c){c.classList.remove('on');});
    var map={transfer:0,card:1,ussd:2};
    var chips=document.querySelectorAll('.ps-channels .ps-channel');
    if(chips[map[tab.dataset.psTab]]) chips[map[tab.dataset.psTab]].classList.add('on');
  });
});
document.getElementById('psCloseBtn').addEventListener('click',function(){ closeTestCheckout('Paystack payment cancelled — pay to continue.'); });
document.getElementById('psPayBtn').addEventListener('click',function(){
  var btn=this, ms=document.getElementById('psModalStatus');
  btn.disabled=true; btn.textContent='Processing…';
  ms.className='live-status'; ms.textContent='Contacting Paystack…';
  setTimeout(function(){
    var ref=paystackRef||makePaystackRef();
    document.getElementById('psOverlay').classList.remove('open');
    completePaystackPayment(ref);
  },1400);
});
document.getElementById('feeBtn').addEventListener('click',async function(){
  if(feeDone){ toast('Verification fee already paid'); return; }
  var keyIsPlaceholder = !PAYSTACK_PUBLIC_KEY || PAYSTACK_PUBLIC_KEY.indexOf('xxxx')>=0;
  if(!keyIsPlaceholder && typeof PaystackPop==='undefined'){
    var st0=document.getElementById('feeStatus');
    st0.className='live-status'; st0.textContent='Opening Paystack…';
    try{ await loadScriptOnce('https://js.paystack.co/v1/inline.js'); }catch(e){}
  }
  if(!keyIsPlaceholder && typeof PaystackPop!=='undefined'){
    var handler=PaystackPop.setup({
      key:PAYSTACK_PUBLIC_KEY,
      email:paystackEmail(),
      amount:300000,
      currency:'NGN',
      channels:['bank_transfer','card','ussd','bank'],
      ref:makePaystackRef(),
      metadata:{custom_fields:[{display_name:'Purpose',variable_name:'purpose',value:'FGSG verification fee — competition demo'}]},
      callback:function(response){ completePaystackPayment(response.reference); },
      onClose:function(){
        var st=document.getElementById('feeStatus');
        st.className='live-status err'; st.textContent='Paystack window closed — payment not completed.';
      }
    });
    handler.openIframe();
    return;
  }
  openTestCheckout();
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
  document.getElementById('successSummary').textContent=name.split(' ')[0]+' · '+school+' · '+pay+' · '+ref;
  var esc2=(typeof escapeHtml==='function')?escapeHtml:function(s){return String(s||'');};
  document.getElementById('bankSummary').innerHTML='<b>'+esc2(pay)+'</b>'+(pay==='Bank Account'&&val('fBank')?' · <b>'+esc2(val('fBank'))+'</b> •••'+esc2(val('fAcct').slice(-3)||'000'):'');
  document.getElementById('walletStatus').textContent='Verified';
  renderProfile();
  toast('Demo application filed — '+ref);
}
renderStep();
