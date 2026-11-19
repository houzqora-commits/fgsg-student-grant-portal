/* ============================================================
   FGSG — liveness check
   Real on-device face scan using MediaPipe Face Mesh.
   Step 4 shows only the "Face Scan / Liveness Check" button;
   tapping it opens a full-screen popup with the camera, and
   every instruction and status line is overlaid on the camera
   view itself — no arrows, nothing under the frame.
   Depends on helpers from app.js (loadScriptOnce, toast) and
   the shared liveDone flag declared there.
   ============================================================ */

var LIVE_STEPS=[
  {id:'center', chip:'Centre', title:'Look straight at the camera'},
  {id:'left', chip:'Turn left', title:'Turn your face LEFT'},
  {id:'right', chip:'Turn right', title:'Turn your face RIGHT'},
  {id:'up', chip:'Tilt up', title:'Tilt your face UP'},
  {id:'down', chip:'Tilt down', title:'Tilt your face DOWN'},
  {id:'blink', chip:'Blink', title:'Now blink'}
];
var liveIdx=0, liveRunning=false, liveStream=null, liveMesh=null, liveRAF=0, liveSending=false;
var liveHold=0, liveBase=null, liveBlinkPhase=0, liveFaceSeen=false, liveNoFaceFrames=0;
var liveOverlayOpen=false, liveCloseTimer=0;
var liveEls={};
['liveOverlay','liveFrame','liveVideo','liveCanvas','liveBadge','liveInstruction','liveStatus','liveStepCount','liveProgress','liveOpenBtn','liveRetryBtn','liveCloseBtn','liveEntryStatus'].forEach(function(id){liveEls[id]=document.getElementById(id);});

function liveRenderProgress(){
  var doneCount=liveDone?LIVE_STEPS.length:liveIdx;
  liveEls.liveProgress.style.width=Math.round(doneCount/LIVE_STEPS.length*100)+'%';
  liveEls.liveStepCount.textContent=liveDone?'Complete':(liveRunning||liveIdx>0?'Step '+(Math.min(liveIdx+1,LIVE_STEPS.length))+' of '+LIVE_STEPS.length:'');
}
function liveSetInstruction(){
  var s=LIVE_STEPS[liveIdx];
  if(!s) return;
  liveEls.liveInstruction.textContent=s.title;
  liveRenderProgress();
}
function liveSetBadge(txt,cls){
  liveEls.liveBadge.textContent=txt;
  liveEls.liveBadge.className='live-badge'+(cls?' '+cls:'');
}
function liveSetEntry(txt,cls){
  liveEls.liveEntryStatus.textContent=txt;
  liveEls.liveEntryStatus.className='live-entry-status'+(cls?' '+cls:'');
}
function liveStopCamera(){
  liveRunning=false; liveSending=false;
  if(liveRAF) cancelAnimationFrame(liveRAF); liveRAF=0;
  if(liveStream){ liveStream.getTracks().forEach(function(t){t.stop();}); liveStream=null; }
  if(liveEls.liveVideo) liveEls.liveVideo.srcObject=null;
  liveEls.liveFrame.classList.remove('scanning');
}
function liveOpen(){
  liveOverlayOpen=true;
  liveEls.liveOverlay.classList.add('open');
  document.body.style.overflow='hidden';
}
function liveClose(){
  if(liveCloseTimer){ clearTimeout(liveCloseTimer); liveCloseTimer=0; }
  liveStopCamera();
  liveOverlayOpen=false;
  liveEls.liveOverlay.classList.remove('open');
  document.body.style.overflow='';
  if(!liveDone) liveResetScan();
}
function liveResetScan(){
  liveIdx=0; liveHold=0; liveBase=null; liveBlinkPhase=0; liveFaceSeen=false; liveNoFaceFrames=0;
  liveEls.liveFrame.classList.remove('on','done','face-ok');
  var ctx=liveEls.liveCanvas.getContext('2d'); ctx.clearRect(0,0,liveEls.liveCanvas.width,liveEls.liveCanvas.height);
  liveEls.liveStatus.className='live-status';
  liveEls.liveStatus.textContent='Not started';
  liveEls.liveInstruction.textContent='Liveness Check';
  liveSetBadge('Camera not started','');
  liveEls.liveRetryBtn.style.display='none';
  liveRenderProgress();
}
function liveReset(){
  liveDone=false;
  liveClose();
  liveResetScan();
  liveSetEntry('Not started','');
  liveEls.liveOpenBtn.textContent='Face Scan / Liveness Check';
}
function liveFail(msg){
  liveStopCamera();
  liveEls.liveFrame.classList.remove('on');
  liveEls.liveStatus.className='live-status err';
  liveEls.liveStatus.textContent=msg;
  liveEls.liveInstruction.textContent='Liveness check could not run';
  liveEls.liveStepCount.textContent='';
  liveSetBadge('Camera blocked','bad');
  liveEls.liveRetryBtn.style.display='inline-flex';
  liveEls.liveRetryBtn.textContent='Try Again';
  liveSetEntry('Scan could not run','err');
}
function liveSucceed(){
  liveDone=true; liveIdx=LIVE_STEPS.length;
  liveStopCamera();
  liveEls.liveFrame.classList.remove('on');
  liveEls.liveFrame.classList.add('done','face-ok');
  liveEls.liveStatus.className='live-status ok';
  liveEls.liveStatus.textContent='✓ Liveness confirmed';
  liveEls.liveInstruction.textContent='Liveness check passed ✓';
  liveEls.liveRetryBtn.style.display='inline-flex';
  liveEls.liveRetryBtn.textContent='Scan Again';
  liveRenderProgress();
  liveSetEntry('✓ Liveness confirmed','ok');
  liveEls.liveOpenBtn.textContent='Scan Again';
  toast('Liveness check passed ✓');
  /* hold the success screen briefly, then close the popup */
  liveCloseTimer=setTimeout(function(){ liveCloseTimer=0; if(liveOverlayOpen) liveClose(); },2000);
}
function liveDist(a,b){ var dx=a.x-b.x, dy=a.y-b.y; return Math.sqrt(dx*dx+dy*dy); }
function liveEAR(lm,p){
  var v1=liveDist(lm[p[1]],lm[p[5]]), v2=liveDist(lm[p[2]],lm[p[4]]), h=liveDist(lm[p[0]],lm[p[3]]);
  return h>0 ? (v1+v2)/(2*h) : 0.3;
}
function liveAdvance(){
  liveIdx++; liveHold=0; liveBlinkPhase=0;
  if(liveIdx>=LIVE_STEPS.length){ liveSucceed(); return; }
  liveSetInstruction();
  liveEls.liveStatus.className='live-status ok';
  liveEls.liveStatus.textContent='✓ '+(LIVE_STEPS[liveIdx-1].chip)+' — good. Next: '+LIVE_STEPS[liveIdx].chip+'.';
}
function liveOnResults(results){
  liveSending=false;
  if(!liveRunning) return;
  var canvas=liveEls.liveCanvas, ctx=canvas.getContext('2d');
  ctx.clearRect(0,0,canvas.width,canvas.height);
  var lm = results.multiFaceLandmarks && results.multiFaceLandmarks.length ? results.multiFaceLandmarks[0] : null;
  if(!lm){
    liveFaceSeen=false; liveHold=0; liveNoFaceFrames++;
    liveEls.liveFrame.classList.remove('face-ok');
    liveSetBadge('No face found','bad');
    if(liveNoFaceFrames>12){ liveEls.liveStatus.className='live-status'; liveEls.liveStatus.textContent='No face in view — move into the light and centre your face in the oval.'; }
    return;
  }
  liveNoFaceFrames=0;
  if(!liveFaceSeen){ liveFaceSeen=true; liveSetBadge('Face found — scanning','ok'); }
  /* draw a few tracking dots so the presenter can see the scan is live */
  ctx.fillStyle='rgba(142,230,58,.9)';
  [1,33,263,10,152].forEach(function(i){ var p=lm[i]; ctx.beginPath(); ctx.arc(p.x*canvas.width,p.y*canvas.height,4,0,6.2832); ctx.fill(); });
  ctx.strokeStyle='rgba(142,230,58,.55)'; ctx.lineWidth=2; ctx.beginPath();
  var oval=[57,133,195,93,2,5,164,1,162,14,13,311,402,14,317,182];
  oval.forEach(function(i,k){ var p=lm[i]; if(k===0) ctx.moveTo(p.x*canvas.width,p.y*canvas.height); else ctx.lineTo(p.x*canvas.width,p.y*canvas.height); });
  ctx.closePath(); ctx.stroke();

  var nose=lm[1], lCheek=lm[234], rCheek=lm[454], fore=lm[10], chin=lm[152];
  var cheekSpan=Math.abs(rCheek.x-lCheek.x);
  var yaw=(nose.x-lCheek.x)/((rCheek.x-lCheek.x)||0.001);
  var pitch=(nose.y-fore.y)/((chin.y-fore.y)||0.001);
  var ear=(liveEAR(lm,[33,160,158,133,153,144])+liveEAR(lm,[362,385,387,263,373,380]))/2;
  var cur=LIVE_STEPS[liveIdx]; if(!cur) return;

  if(cur.id==='center'){
    var centred = yaw>0.40 && yaw<0.60 && pitch>0.34 && pitch<0.66;
    if(cheekSpan<0.16){ liveEls.liveStatus.textContent='Move a little closer to the camera.'; liveHold=0; liveEls.liveFrame.classList.remove('face-ok'); return; }
    if(cheekSpan>0.62){ liveEls.liveStatus.textContent='Move a little further back.'; liveHold=0; return; }
    liveEls.liveFrame.classList.toggle('face-ok',centred);
    if(centred){
      if(!liveBase) liveBase={yaw:0,pitch:0,ear:0,n:0};
      liveBase.yaw+=yaw; liveBase.pitch+=pitch; liveBase.ear+=ear; liveBase.n++;
      liveHold++;
      liveEls.liveStatus.textContent='Face centred — hold still… ('+Math.min(100,Math.round(liveHold/12*100))+'%)';
      if(liveHold>=12){ liveBase.yaw/=liveBase.n; liveBase.pitch/=liveBase.n; liveBase.ear/=liveBase.n; liveAdvance(); }
    } else { liveHold=0; liveEls.liveStatus.textContent='Centre your face in the oval and look straight ahead.'; }
    return;
  }
  var bYaw=liveBase?liveBase.yaw:0.5, bPitch=liveBase?liveBase.pitch:0.5, bEar=liveBase?liveBase.ear:0.28;
  var ok=false, need=9;
  if(cur.id==='left') ok = yaw<=bYaw-0.08;
  if(cur.id==='right') ok = yaw>=bYaw+0.08;
  if(cur.id==='up') ok = pitch<=bPitch-0.05;
  if(cur.id==='down') ok = pitch>=bPitch+0.05;
  if(cur.id==='blink'){
    var closed = ear < Math.min(0.175, bEar*0.68);
    var open = ear > Math.max(0.20, bEar*0.85);
    if(liveBlinkPhase===0 && closed){ liveBlinkPhase=1; liveEls.liveStatus.textContent='Eyes closed — now open them…'; }
    else if(liveBlinkPhase===1 && open){ liveAdvance(); return; }
    else if(liveBlinkPhase===0){ liveEls.liveStatus.textContent='Blink now — close both eyes fully, then open.'; }
    return;
  }
  if(ok){
    liveHold++;
    liveEls.liveFrame.classList.add('face-ok');
    liveEls.liveStatus.textContent=cur.chip+' detected — hold it… ('+Math.min(100,Math.round(liveHold/need*100))+'%)';
    if(liveHold>=need) liveAdvance();
  } else {
    liveHold=0; liveEls.liveFrame.classList.remove('face-ok');
    liveEls.liveStatus.textContent=cur.title+' — move slowly.';
  }
}
async function liveLoop(){
  if(!liveRunning) return;
  var v=liveEls.liveVideo;
  if(v.readyState>=2 && !liveSending){ liveSending=true; try{ await liveMesh.send({image:v}); }catch(e){ liveSending=false; } }
  liveRAF=requestAnimationFrame(liveLoop);
}
async function liveStart(){
  if(liveCloseTimer){ clearTimeout(liveCloseTimer); liveCloseTimer=0; }
  liveResetScan();
  liveEls.liveStatus.className='live-status';
  liveEls.liveStatus.textContent='Opening camera… allow camera access if asked.';
  liveEls.liveInstruction.textContent='Liveness Check';
  if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){
    liveFail('This browser cannot open a camera here. Open the page in Chrome or Safari over HTTPS and try again.');
    return;
  }
  if(typeof FaceMesh==='undefined'){
    liveEls.liveStatus.textContent='Loading the face scanner…';
    try{ await loadScriptOnce('https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js'); }catch(e){}
  }
  if(!liveOverlayOpen) return;
  if(typeof FaceMesh==='undefined'){
    liveFail('The face-scan library did not load — check your internet connection and tap Try Again.');
    return;
  }
  try{
    liveStream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:640},height:{ideal:480}},audio:false});
  }catch(err){
    if(liveOverlayOpen) liveFail('Camera access was blocked or no camera was found. Allow the camera for this site, then tap Try Again.');
    return;
  }
  if(!liveOverlayOpen){ liveStream.getTracks().forEach(function(t){t.stop();}); liveStream=null; return; }
  try{
    if(!liveMesh){
      liveMesh=new FaceMesh({locateFile:function(file){return 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/'+file;}});
      liveMesh.setOptions({maxNumFaces:1,refineLandmarks:true,minDetectionConfidence:0.5,minTrackingConfidence:0.5});
      liveMesh.onResults(liveOnResults);
    }
    liveEls.liveVideo.srcObject=liveStream;
    await liveEls.liveVideo.play();
  }catch(err){
    if(liveOverlayOpen) liveFail('The face scanner could not start. Check your connection and tap Try Again.');
    return;
  }
  if(!liveOverlayOpen){ liveStopCamera(); return; }
  liveIdx=0; liveHold=0; liveBase=null; liveBlinkPhase=0; liveFaceSeen=false; liveNoFaceFrames=0;
  liveRunning=true;
  liveEls.liveFrame.classList.add('on','scanning');
  liveEls.liveFrame.classList.remove('done');
  liveSetBadge('Scanning…','');
  liveSetInstruction();
  liveEls.liveStatus.textContent='Camera on — centre your face in the oval.';
  liveLoop();
}
liveEls.liveOpenBtn.addEventListener('click',function(){
  if(liveDone){ liveDone=false; liveSetEntry('Not started',''); liveEls.liveOpenBtn.textContent='Face Scan / Liveness Check'; }
  liveOpen();
  liveStart();
});
liveEls.liveRetryBtn.addEventListener('click',function(){
  if(liveDone){ liveDone=false; liveSetEntry('Not started',''); liveEls.liveOpenBtn.textContent='Face Scan / Liveness Check'; }
  liveEls.liveRetryBtn.style.display='none';
  liveStart();
});
liveEls.liveCloseBtn.addEventListener('click',function(){ liveClose(); });
document.addEventListener('keydown',function(e){
  if(e.key==='Escape' && liveOverlayOpen) liveClose();
});
window.__stopLiveCamera=liveStopCamera;
liveRenderProgress();
