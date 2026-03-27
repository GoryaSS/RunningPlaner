// ═══════════════════════════════════════
// SHARED CONSTANTS
// ═══════════════════════════════════════
var TYPE_LABELS  = { easy:'Легкий', tempo:'Темп', long:'Довгий', race:'ЗАБІГ' };
var TYPE_CLASS   = { easy:'type-easy', tempo:'type-tempo', long:'type-long', race:'type-race' };
var BUILD_FOCUSES = [
  'Починаємо','Будуємо базу','Ростемо','Відновлення','Набираємо темп',
  'Тримо темп','Новий рубіж','Відпочинок','Нова висота','Набираємо оберти',
  'Пікове навантаження','Стабілізація','Фінальний натиск','Максимум',
  'Підготовка','Зосередженість','Впевненість'
];
var TARGET_KM = 21;

function lerp(a,b,t){ return a+(b-a)*t; }
function clamp(v,mn,mx){ return Math.min(mx,Math.max(mn,v)); }
function toDateStr(d){ return d.toISOString().split('T')[0]; }

// ── pace helpers ──
// paceStr: "6:30" → minutes float 6.5
function parsePace(s){
  if(!s) return null;
  var p = String(s).split(':');
  if(p.length===2){ var m=parseInt(p[0]),s2=parseInt(p[1]); if(!isNaN(m)&&!isNaN(s2)) return m+s2/60; }
  var n=parseFloat(s); return isNaN(n)?null:n;
}
// minutes float → "6:30"
function formatPace(f){
  if(f==null||isNaN(f)) return '—';
  var m=Math.floor(f), s=Math.round((f-m)*60);
  return m+':'+(s<10?'0':'')+s;
}

// ═══════════════════════════════════════
// PLAN GENERATOR (fixed)
// ═══════════════════════════════════════
function generatePlan(totalWeeks){
  if(totalWeeks<2) totalWeeks=2;
  var plan=[], hasTaper=totalWeeks>=4,
      taperIdx=hasTaper?totalWeeks-2:-1,
      raceIdx=totalWeeks-1,
      buildCount=hasTaper?totalWeeks-2:totalWeeks-1;
  for(var w=0;w<totalWeeks;w++){
    var isRace=w===raceIdx, isTaper=w===taperIdx;
    var isRecovery=!isRace&&!isTaper&&buildCount>=5&&((w+1)%4===0);
    var progress=buildCount<=1?1:Math.min(w/(buildCount-1),1);
    var longKm=isRace?21:isTaper?clamp(Math.round(lerp(5,17,progress)),5,17):isRecovery?clamp(Math.round(lerp(5,13,progress*.75)),5,13):clamp(Math.round(lerp(5,19,progress)),5,19);
    var easyKm=isRace?3:clamp(Math.round(lerp(3,7,progress)),3,7);
    var tempoKm=clamp(Math.round(lerp(4,9,progress)),4,9);
    var usesTempo=!isRace&&!isRecovery&&w>=2;
    var workouts;
    if(isRace){
      workouts=[{type:'easy',km:4,desc:"Дуже легко, розім'яти ноги"},{type:'easy',km:3,desc:'15 хв + 5×100м прискорення'},{type:'race',km:21,desc:'🏁 ДЕНЬ ЗАБІГУ!'}];
    }else if(isTaper){
      workouts=[{type:'easy',km:Math.max(3,easyKm-1),desc:'Легко, збережи енергію'},{type:'tempo',km:Math.max(3,tempoKm-2),desc:'Короткий темп, без надзусиль'},{type:'long',km:longKm,desc:'Останній довгий'}];
    }else if(isRecovery){
      workouts=[{type:'easy',km:Math.max(3,easyKm-1),desc:'Дуже легко — відновлення'},{type:'easy',km:easyKm,desc:'Фокус на техніці'},{type:'long',km:longKm,desc:'Легкий відновлювальний'}];
    }else if(!usesTempo){
      workouts=[{type:'easy',km:easyKm,desc:'Легкий темп'},{type:'easy',km:easyKm,desc:'5 хв розминки, 5 хв заминки'},{type:'long',km:longKm,desc:longKm+' км — без поспіху'}];
    }else{
      workouts=[{type:'easy',km:easyKm,desc:'Рівний темп'},{type:'tempo',km:tempoKm,desc:(tempoKm*5)+' хв темп'},{type:'long',km:longKm,desc:longKm+' км — тримай темп'}];
    }
    var focus=isRace?'Тиждень забігу':isTaper?'Звужуємо (тейпер)':BUILD_FOCUSES[w%BUILD_FOCUSES.length];
    plan.push({week:w+1,focus:focus,workouts:workouts});
  }
  return plan;
}

// ═══════════════════════════════════════
// FIXED PLAN STATE
// ═══════════════════════════════════════
var fState=null;
function fLoad(){ var r=localStorage.getItem('rp_fixed_v1'); if(r){try{fState=JSON.parse(r);return true;}catch(e){}}return false; }
function fSave(){ localStorage.setItem('rp_fixed_v1',JSON.stringify(fState)); }
function fPlan(){ return fState&&fState.plan?fState.plan:[]; }
function fTotalW(){ return fPlan().length*3; }
function fDoneCount(){ return Object.values(fState.done||{}).filter(Boolean).length; }
function fDoneKm(){
  var km=0,plan=fPlan();
  Object.keys(fState.done||{}).forEach(function(k){
    if(!fState.done[k])return;
    var p=k.replace('w','').split('d').map(Number);
    if(plan[p[0]]&&plan[p[0]].workouts[p[1]]) km+=plan[p[0]].workouts[p[1]].km;
  });
  return km;
}
function fCurrentWeek(){
  if(!fState||!fState.startDate) return 0;
  var d=Math.floor((new Date()-new Date(fState.startDate))/(7*24*3600*1000));
  return Math.max(0,Math.min(d,fPlan().length-1));
}

// Pace data: { "w0d1": "6:30", ... }
function fAvgPace(){
  var paces=[], plan=fPlan();
  Object.keys(fState.pace||{}).forEach(function(k){
    var v=parsePace(fState.pace[k]); if(v==null) return;
    var p=k.replace('w','').split('d').map(Number);
    if(plan[p[0]]&&plan[p[0]].workouts[p[1]]){
      var km=plan[p[0]].workouts[p[1]].km;
      if(km>0) paces.push(v);
    }
  });
  if(!paces.length) return null;
  return paces.reduce(function(a,b){return a+b;},0)/paces.length;
}
// Projected pace: assume 1% improvement per week of training
function fProjPace(){
  var avg=fAvgPace(); if(avg==null) return null;
  var weeksLeft=fPlan().length-fCurrentWeek();
  return avg*(1-0.008*Math.min(weeksLeft,10));
}

// ═══════════════════════════════════════
// ADAPTIVE STATE
// ═══════════════════════════════════════
var aState=null;
function aLoad(){ var r=localStorage.getItem('rp_adap_v1'); if(r){try{aState=JSON.parse(r);return true;}catch(e){}}return false; }
function aSave(){ localStorage.setItem('rp_adap_v1',JSON.stringify(aState)); }

function buildAdaptiveWeeks(startKm,growthPct,actuals,paces,startDate){
  var weeks=[],longKm=parseFloat(startKm)||5,growth=parseFloat(growthPct)||10,MAX=52,w=0;
  while(longKm<TARGET_KM&&w<MAX){
    var easyKm=Math.max(3,Math.round(longKm*.55*10)/10);
    var tempoKm=Math.max(4,Math.round(longKm*.70*10)/10);
    var planLong=Math.min(TARGET_KM,Math.round(longKm*10)/10);
    var wos=[
      {type:'easy', planned:easyKm, desc:'Легкий відновлювальний'},
      {type:w<2?'easy':'tempo', planned:w<2?easyKm:tempoKm, desc:w<2?'Рівний спокійний темп':'Темповий біг'},
      {type:'long', planned:planLong, desc:'Довгий — ключ тижня'}
    ];
    wos.forEach(function(wo,di){
      var k='w'+w+'d'+di;
      wo.actual=(actuals&&actuals[k]!=null)?actuals[k]:null;
      wo.pace=(paces&&paces[k]!=null)?paces[k]:null;
    });
    var weekDate=null;
    if(startDate){var d=new Date(startDate);d.setDate(d.getDate()+w*7);weekDate=d.toLocaleDateString('uk-UA',{day:'numeric',month:'short'});}
    weeks.push({wIdx:w,weekNum:w+1,workouts:wos,projectedLong:planLong,weekDate:weekDate});
    var longKey='w'+w+'d2';
    var baseLong=(actuals&&actuals[longKey]!=null)?parseFloat(actuals[longKey]):longKm;
    longKm=baseLong*(1+growth/100); w++;
  }
  // race week
  var raceDate=null,raceFullDate=null;
  if(startDate){var rd=new Date(startDate);rd.setDate(rd.getDate()+w*7);
    raceDate=rd.toLocaleDateString('uk-UA',{day:'numeric',month:'short'});
    raceFullDate=rd.toLocaleDateString('uk-UA',{day:'numeric',month:'long',year:'numeric'});}
  weeks.push({wIdx:w,weekNum:w+1,isRace:true,projectedLong:21,weekDate:raceDate,fullDate:raceFullDate,
    workouts:[
      {type:'easy',planned:4,desc:"Легко, розім'яти ноги",actual:actuals&&actuals['w'+w+'d0']!=null?actuals['w'+w+'d0']:null,pace:paces&&paces['w'+w+'d0']!=null?paces['w'+w+'d0']:null},
      {type:'easy',planned:3,desc:'15 хв + прискорення',actual:actuals&&actuals['w'+w+'d1']!=null?actuals['w'+w+'d1']:null,pace:paces&&paces['w'+w+'d1']!=null?paces['w'+w+'d1']:null},
      {type:'race',planned:21,desc:'🏁 ДЕНЬ ЗАБІГУ!',actual:actuals&&actuals['w'+w+'d2']!=null?actuals['w'+w+'d2']:null,pace:paces&&paces['w'+w+'d2']!=null?paces['w'+w+'d2']:null}
    ]
  });
  return weeks;
}

function aRealGrowth(actuals){
  var longs=[],w=0;
  while(actuals['w'+w+'d2']!=null){longs.push(parseFloat(actuals['w'+w+'d2']));w++;}
  if(longs.length<2) return null;
  var gs=[];
  for(var i=1;i<longs.length;i++){if(longs[i-1]>0) gs.push((longs[i]-longs[i-1])/longs[i-1]*100);}
  if(!gs.length) return null;
  return Math.round(gs.reduce(function(a,b){return a+b;},0)/gs.length*10)/10;
}
function aTotalActualKm(actuals){ return Math.round(Object.values(actuals).reduce(function(s,v){return s+(parseFloat(v)||0);},0)*10)/10; }

// Avg pace across all logged paces (adaptive)
function aAvgPace(actuals,paces){
  var ps=[];
  Object.keys(paces||{}).forEach(function(k){
    var v=parsePace(paces[k]); if(v==null) return;
    var p=k.replace('w','').split('d').map(Number);
    var wIdx=p[0],di=p[1];
    // use actual km if available, else ignore
    var km=actuals&&actuals[k]?parseFloat(actuals[k]):0;
    if(km>0&&v>0) ps.push(v);
  });
  if(!ps.length) return null;
  return ps.reduce(function(a,b){return a+b;},0)/ps.length;
}
function aCurrentWeekIdx(startDate,totalWeeks){
  if(!startDate) return 0;
  var d=Math.floor((new Date()-new Date(startDate))/(7*24*3600*1000));
  return Math.max(0,Math.min(d,totalWeeks-1));
}

// ═══════════════════════════════════════
// CURRENT MODE
// ═══════════════════════════════════════
var currentMode='fixed'; // 'fixed' | 'adaptive'
var currentSetupMode='fixed';

function selectMode(m){
  currentSetupMode=m;
  document.getElementById('mc-fixed').classList.toggle('active',m==='fixed');
  document.getElementById('mc-adaptive').classList.toggle('active',m==='adaptive');
  document.getElementById('form-fixed').style.display=m==='fixed'?'block':'none';
  document.getElementById('form-adaptive').style.display=m==='adaptive'?'block':'none';
}

// ═══════════════════════════════════════
// SETUP
// ═══════════════════════════════════════
var eventRows=[];
function weeksFromDates(s,e){
  if(!s||!e) return null;
  var d=Math.round((new Date(e)-new Date(s))/(7*24*3600*1000));
  return d>0?d:null;
}
function updateSetupPreview(){
  var w=weeksFromDates(document.getElementById('start-date').value,document.getElementById('end-date').value);
  document.getElementById('setup-sub-text').textContent=w?(w+' тижнів · 3 тренування/тиждень'):'— тижнів · 3 тренування/тиждень';
}
function addEventRow(name,date){
  name=name||''; date=date||'';
  var id=Date.now(); eventRows.push(id);
  var el=document.createElement('div'); el.className='event-row'; el.id='er-'+id;
  el.innerHTML='<input type="text" class="form-input" placeholder="Назва (напр. 10 км забіг)" value="'+name+'" id="en-'+id+'"><input type="date" class="form-input" id="ed-'+id+'" value="'+date+'"><button class="btn-icon" onclick="removeEvent('+id+')">×</button>';
  document.getElementById('events-list').appendChild(el);
}
function removeEvent(id){
  var el=document.getElementById('er-'+id); if(el) el.remove();
  eventRows=eventRows.filter(function(x){return x!==id;});
}

function startPlan(){
  if(currentSetupMode==='fixed'){
    var startDate=document.getElementById('start-date').value;
    var endDate=document.getElementById('end-date').value;
    if(!startDate){alert('Вкажи дату початку!');return;}
    if(!endDate){alert('Вкажи дату забігу!');return;}
    var weeks=weeksFromDates(startDate,endDate);
    if(!weeks||weeks<2){alert('Між датами має бути хоча б 2 тижні!');return;}
    var events=eventRows.map(function(id){return{name:document.getElementById('en-'+id)?.value||'Подія',date:document.getElementById('ed-'+id)?.value||''};}).filter(function(e){return e.date;});
    fState={startDate:startDate,endDate:endDate,events:events,done:{},pace:{},plan:generatePlan(weeks)};
    fSave(); currentMode='fixed'; showApp();
  } else {
    var startKm=parseFloat(document.getElementById('adap-start-km').value)||5;
    var growthPct=parseFloat(document.getElementById('adap-growth').value)||10;
    var startDate=document.getElementById('adap-start-date').value;
    if(!startDate){alert('Вкажи дату першого тренування!');return;}
    if(startKm<1||startKm>=TARGET_KM){alert('Стартова дистанція: 1–20 км');return;}
    aState={startKm:startKm,growthPct:growthPct,startDate:startDate,actuals:{},paces:{}};
    aSave(); currentMode='adaptive'; showApp();
  }
}

// ═══════════════════════════════════════
// APP SHELL
// ═══════════════════════════════════════
function showApp(){
  document.getElementById('setup-screen').style.display='none';
  document.getElementById('app-screen').style.display='block';
  switchMode(currentMode);
}
function goHome(){
  if(!confirm('Повернутись до головного екрану? Прогрес збережено.')) return;
  document.getElementById('setup-screen').style.display='flex';
  document.getElementById('app-screen').style.display='none';
}
function switchMode(m){
  currentMode=m;
  document.getElementById('msb-fixed').classList.toggle('active',m==='fixed');
  document.getElementById('msb-adaptive').classList.toggle('active',m==='adaptive');
  document.getElementById('tabs-fixed').style.display=m==='fixed'?'flex':'none';
  document.getElementById('tabs-adaptive').style.display=m==='adaptive'?'flex':'none';
  if(m==='fixed'){
    if(!fState){alert('Спочатку налаштуй план за датою!');switchMode('adaptive');return;}
    switchView('f-dashboard');
  } else {
    if(!aState){alert('Спочатку налаштуй адаптивний план!');switchMode('fixed');return;}
    switchView('a-dashboard');
  }
}

var ALL_VIEWS=['f-dashboard','f-plan','f-stats','a-dashboard','a-plan','a-stats'];
function switchView(view){
  ALL_VIEWS.forEach(function(v){
    var el=document.getElementById('view-'+v);
    if(el) el.style.display=v===view?'block':'none';
  });
  // Update tabs
  var prefix=view.split('-')[0]; // 'f' or 'a'
  var tabs=document.querySelectorAll('#tabs-'+( prefix==='f'?'fixed':'adaptive')+' .nav-tab');
  var subViews={f:['f-dashboard','f-plan','f-stats'],a:['a-dashboard','a-plan','a-stats']};
  var idx=(subViews[prefix]||[]).indexOf(view);
  tabs.forEach(function(btn,i){btn.classList.toggle('active',i===idx);});
  // Render
  if(view==='f-dashboard') renderFDashboard();
  else if(view==='f-plan') renderFPlan();
  else if(view==='f-stats') renderFStats();
  else if(view==='a-dashboard') renderADashboard();
  else if(view==='a-plan') renderAPlan();
  else if(view==='a-stats') renderAStats();
}

function resetCurrent(){
  if(currentMode==='fixed'){
    if(!confirm('Скинути план за датою і весь прогрес?')) return;
    localStorage.removeItem('rp_fixed_v1'); fState=null;
    if(aState) switchMode('adaptive'); else location.reload();
  } else {
    if(!confirm('Скинути адаптивний план і весь прогрес?')) return;
    localStorage.removeItem('rp_adap_v1'); aState=null;
    if(fState) switchMode('fixed'); else location.reload();
  }
}

// ═══════════════════════════════════════
// FIXED PLAN — RENDER
// ═══════════════════════════════════════
function renderFDashboard(){
  var plan=fPlan(), wi=fCurrentWeek(), done=fDoneCount(), km=fDoneKm();
  var pct=Math.round(done/Math.max(1,fTotalW())*100);
  document.getElementById('f-s-week').textContent=wi+1;
  document.getElementById('f-s-week-total').textContent=plan.length+' тижнів';
  document.getElementById('f-s-done').textContent=done;
  document.getElementById('f-s-km').textContent=km;
  document.getElementById('f-prog-pct').textContent=pct+'%';
  document.getElementById('f-prog-bar').style.width=pct+'%';
  if(fState.endDate){
    var days=Math.max(0,Math.ceil((new Date(fState.endDate)-new Date())/(24*3600*1000)));
    document.getElementById('f-s-days').textContent=days;
  }
  // Event markers
  var markers=document.getElementById('f-events-markers'); markers.innerHTML='';
  if(fState.endDate&&fState.startDate){
    var start=new Date(fState.startDate),end=new Date(fState.endDate),total=end-start;
    (fState.events||[]).forEach(function(ev){
      if(!ev.date) return;
      var pctPos=Math.min(100,Math.max(0,((new Date(ev.date)-start)/total)*100));
      var m=document.createElement('div'); m.className='event-marker'; m.style.left=pctPos+'%';
      m.innerHTML='<div class="event-marker-dot"></div><div class="event-marker-label">'+ev.name+'</div>';
      markers.appendChild(m);
    });
  }
  // Current week
  var week=plan[wi];
  document.getElementById('f-week-title').textContent='ТИЖДЕНЬ '+(wi+1)+' — '+week.focus.toUpperCase();
  var c=document.getElementById('f-current-workouts'); c.innerHTML='';
  week.workouts.forEach(function(w,di){ c.appendChild(makeFWorkoutCard(wi,di,w)); });
}

function makeFWorkoutCard(wi,di,w){
  var key='w'+wi+'d'+di, isDone=!!(fState.done||{})[key];
  var paceVal=(fState.pace||{})[key]||'';
  var paceF=parsePace(paceVal);
  var el=document.createElement('div');
  el.className='workout-card'+(isDone?' done':'');
  var days=['Тренування 1','Тренування 2','Тренування 3'];
  el.innerHTML=
    '<div class="workout-day">'+days[di]+'</div>'+
    '<div class="workout-type-badge '+TYPE_CLASS[w.type]+'">'+TYPE_LABELS[w.type]+'</div>'+
    '<div class="workout-distance">'+w.km+' <span style="font-size:1rem;color:var(--text2)">км</span></div>'+
    '<div class="workout-desc">'+w.desc+'</div>'+
    '<div class="pace-row">'+
      '<span class="pace-row-label">Темп:</span>'+
      '<input class="pace-input'+(paceVal?' has-val':'')+'" id="fp-'+wi+'-'+di+'" '+
        'type="text" placeholder="6:30" value="'+paceVal+'" '+
        'onclick="event.stopPropagation()" '+
        'onchange="saveFPace('+wi+','+di+',this.value)">'+
      '<span class="pace-row-label">хв/км</span>'+
      (paceF!=null?'<span class="pace-display">'+formatPace(paceF)+'</span>':'')+
    '</div>';
  el.addEventListener('click', function(e){
    if(e.target.tagName==='INPUT') return;
    toggleFWorkout(wi,di);
  });
  return el;
}

function toggleFWorkout(wi,di){
  var key='w'+wi+'d'+di;
  if(!fState.done) fState.done={};
  fState.done[key]=!fState.done[key];
  fSave(); showToast(fState.done[key]?'✅ +'+fPlan()[wi].workouts[di].km+' км · Відмінно!':'↩ Відмінено');
  renderFDashboard();
}
function saveFPace(wi,di,val){
  if(!fState.pace) fState.pace={};
  var key='w'+wi+'d'+di;
  if(val&&val.trim()) fState.pace[key]=val.trim(); else delete fState.pace[key];
  fSave();
  clearTimeout(window._fpTimer);
  window._fpTimer=setTimeout(function(){ renderFDashboard(); renderFStats(); },400);
}

function renderFPlan(){
  var plan=fPlan(), wi=fCurrentWeek(), c=document.getElementById('f-all-weeks'); c.innerHTML='';
  plan.forEach(function(week,wIdx){
    var isCur=wIdx===wi;
    var weekEvents=(fState.events||[]).filter(function(ev){
      if(!ev.date||!fState.startDate) return false;
      var evW=Math.floor((new Date(ev.date)-new Date(fState.startDate))/(7*24*3600*1000));
      return evW===wIdx;
    });
    var doneInWeek=week.workouts.map(function(_,di){return !!(fState.done||{})['w'+wIdx+'d'+di];});
    var totalKm=week.workouts.reduce(function(s,w){return s+w.km;},0);
    var dateStr='';
    if(fState.startDate){var d=new Date(fState.startDate);d.setDate(d.getDate()+wIdx*7);dateStr=d.toLocaleDateString('uk-UA',{day:'numeric',month:'short'});}
    var dots=doneInWeek.map(function(d){return '<div class="mini-dot'+(d?' done':'')+'"></div>';}).join('');
    var evTags=weekEvents.map(function(e){return '<div class="event-tag">🎯 '+e.name+' — '+new Date(e.date).toLocaleDateString('uk-UA',{day:'numeric',month:'short'})+'</div>';}).join('');
    var block=document.createElement('div');
    block.className='week-block'+(isCur?' current-wk open':'');
    block.id='fwb-'+wIdx;
    block.innerHTML=
      '<div class="week-header" onclick="toggleFWeek('+wIdx+')">'+
        '<div class="week-left"><div class="week-num">ТИЖД '+(wIdx+1)+'</div>'+
        '<div><div style="font-weight:600;font-size:14px">'+week.focus+'</div><div class="week-focus">'+dateStr+'</div></div></div>'+
        '<div class="week-right"><div class="week-km">'+totalKm+' км</div><div class="week-progress-mini">'+dots+'</div><div class="week-chevron">▼</div></div>'+
      '</div>'+
      '<div class="week-body">'+evTags+'<div class="week-workouts" id="fww-'+wIdx+'"></div></div>';
    c.appendChild(block);
    var wc=block.querySelector('#fww-'+wIdx);
    week.workouts.forEach(function(w,di){ wc.appendChild(makeFWorkoutCard(wIdx,di,w)); });
  });
}
function toggleFWeek(wIdx){ var el=document.getElementById('fwb-'+wIdx); if(el) el.classList.toggle('open'); }

function renderFStats(){
  var plan=fPlan(), wi=fCurrentWeek();
  var totalPlanKm=plan.reduce(function(s,w){return s+w.workouts.reduce(function(a,x){return a+x.km;},0);},0);
  var doneKm=fDoneKm(), doneCount=fDoneCount();
  document.getElementById('f-sv-total').textContent=totalPlanKm+' км';
  document.getElementById('f-sv-done-km').textContent=doneKm+' км';
  document.getElementById('f-sv-workouts').textContent=doneCount+'/'+fTotalW();
  // Pace
  var avg=fAvgPace(), proj=fProjPace();
  document.getElementById('f-sv-pace-cur').textContent=avg!=null?formatPace(avg):'—';
  document.getElementById('f-sv-pace-proj').textContent=proj!=null?formatPace(proj):'—';
  // KM chart
  var chart=document.getElementById('f-kms-chart'); chart.innerHTML='';
  var maxKm=Math.max.apply(null,plan.map(function(w){return w.workouts.reduce(function(s,x){return s+x.km;},0);}));
  var weekPaces=[];
  plan.forEach(function(week,wIdx){
    var weekKm=week.workouts.reduce(function(s,x){return s+x.km;},0);
    var pctH=(weekKm/maxKm)*100;
    var bar=document.createElement('div');
    bar.className='kms-bar'+(wIdx<wi?' done-bar':wIdx===wi?' current-bar':'');
    bar.style.height=pctH+'%'; bar.title='Тиждень '+(wIdx+1)+': '+weekKm+' км';
    chart.appendChild(bar);
    // collect pace per week
    var wps=[];
    week.workouts.forEach(function(_,di){
      var v=parsePace((fState.pace||{})['w'+wIdx+'d'+di]); if(v!=null) wps.push(v);
    });
    weekPaces.push(wps.length?wps.reduce(function(a,b){return a+b;})/wps.length:null);
  });
  renderPaceChart('f-pace-chart', weekPaces);
  // Type breakdown
  renderTypeBreakdown('f-type-breakdown', plan, fState.done||{});
}

// ═══════════════════════════════════════
// ADAPTIVE PLAN — RENDER
// ═══════════════════════════════════════
function getAWeeks(){ return buildAdaptiveWeeks(aState.startKm,aState.growthPct,aState.actuals||{},aState.paces||{},aState.startDate); }

function renderADashboard(){
  var weeks=getAWeeks();
  var raceWeek=weeks[weeks.length-1];
  document.getElementById('a-pred-date').textContent=raceWeek.fullDate||'—';
  document.getElementById('a-pred-sub').textContent=(weeks.length-1)+' тижнів підготовки + тиждень забігу';
  var rg=aRealGrowth(aState.actuals||{});
  document.getElementById('a-real-growth').textContent=rg!=null?rg+'%':'—%';
  document.getElementById('a-total-real-km').textContent=aTotalActualKm(aState.actuals||{})+' км';
  var ap=aAvgPace(aState.actuals||{},aState.paces||{});
  document.getElementById('a-cur-pace').textContent=ap!=null?formatPace(ap):'—';
  // Settings
  document.getElementById('a-growth-live').value=aState.growthPct;
  document.getElementById('a-settings-info').textContent='Старт: '+aState.startKm+' км · Ціль: '+TARGET_KM+' км';
  // Current week
  var wi=aCurrentWeekIdx(aState.startDate,weeks.length);
  var week=weeks[wi];
  document.getElementById('a-week-title').textContent=(week.isRace?'🏁 ТИЖДЕНЬ ЗАБІГУ':'ТИЖДЕНЬ '+week.weekNum+' — ПОТОЧНИЙ');
  var body=document.getElementById('a-current-week-body'); body.innerHTML='';
  week.workouts.forEach(function(wo,di){ body.appendChild(makeAWorkoutRow(wi,di,wo,false)); });
}
function updateAdaptiveGrowth(){
  var v=parseFloat(document.getElementById('a-growth-live').value);
  if(!v||v<1||v>30) return;
  aState.growthPct=v; aSave(); renderADashboard(); renderAPlan(); renderAStats();
}

function makeAWorkoutRow(wIdx,di,wo,isFuture){
  var key='w'+wIdx+'d'+di;
  var actualVal=wo.actual!=null?wo.actual:'';
  var paceVal=wo.pace!=null?wo.pace:'';
  var diff=wo.actual!=null?Math.round((wo.actual-wo.planned)*10)/10:null;
  var diffCls=diff==null?'neu':diff>0?'pos':diff<0?'neg':'neu';
  var diffText=diff!=null?(diff>0?'+':'')+diff+' км':'';
  var days=['Тренування 1','Тренування 2','Тренування 3'];
  var row=document.createElement('div'); row.className='adap-workout-row';
  row.innerHTML=
    '<div class="adap-workout-left">'+
      '<div class="workout-type-badge '+TYPE_CLASS[wo.type]+'">'+TYPE_LABELS[wo.type]+'</div>'+
      '<div class="adap-workout-planned">'+wo.planned+' <span style="font-size:.8rem;color:var(--text2)">км план</span></div>'+
      '<div class="adap-workout-desc">'+days[di]+'</div>'+
    '</div>'+
    '<div class="adap-workout-desc" style="font-size:13px;color:var(--text2)">'+wo.desc+'</div>'+
    '<div class="adap-actual-wrap">'+
      '<div class="adap-actual-inputs">'+
        '<span class="adap-actual-label">Факт км:</span>'+
        '<input type="number" class="adap-actual-input'+(actualVal?' has-value':'')+'" '+
          'id="ai-'+wIdx+'-'+di+'" value="'+actualVal+'" min="0" max="50" step="0.1" placeholder="0.0" '+
          (isFuture?'disabled ':'')+
          'onchange="saveAActual('+wIdx+','+di+',this.value)">'+
        '<span class="adap-diff '+diffCls+'" id="ad-'+wIdx+'-'+di+'">'+diffText+'</span>'+
      '</div>'+
      '<div class="adap-actual-inputs">'+
        '<span class="adap-actual-label">Темп:</span>'+
        '<input type="text" class="adap-pace-input'+(paceVal?' has-value':'')+'" '+
          'id="ap-'+wIdx+'-'+di+'" value="'+paceVal+'" placeholder="6:30" '+
          (isFuture?'disabled ':'')+
          'onchange="saveAPace('+wIdx+','+di+',this.value)">'+
        '<span style="font-size:10px;color:var(--text2)">хв/км</span>'+
      '</div>'+
    '</div>';
  return row;
}

function saveAActual(wIdx,di,val){
  if(!aState.actuals) aState.actuals={};
  var key='w'+wIdx+'d'+di, v=parseFloat(val);
  if(!isNaN(v)&&v>0){ aState.actuals[key]=v; var inp=document.getElementById('ai-'+wIdx+'-'+di); if(inp) inp.className='adap-actual-input has-value'; }
  else delete aState.actuals[key];
  aSave();
  clearTimeout(window._aTimer);
  window._aTimer=setTimeout(function(){ renderADashboard(); renderAPlan(); renderAStats(); },600);
}
function saveAPace(wIdx,di,val){
  if(!aState.paces) aState.paces={};
  var key='w'+wIdx+'d'+di;
  if(val&&val.trim()){ aState.paces[key]=val.trim(); var inp=document.getElementById('ap-'+wIdx+'-'+di); if(inp) inp.className='adap-pace-input has-value'; }
  else delete aState.paces[key];
  aSave();
  clearTimeout(window._apTimer);
  window._apTimer=setTimeout(function(){ renderADashboard(); renderAStats(); },400);
}

function renderAPlan(){
  var weeks=getAWeeks(), c=document.getElementById('a-all-weeks'); c.innerHTML='';
  var wi=aCurrentWeekIdx(aState.startDate,weeks.length);
  // remember open
  var open={};
  c.querySelectorAll&&c.querySelectorAll('.adap-week.open').forEach(function(el){open[el.dataset.widx]=true;});
  weeks.forEach(function(week){
    var w=week.wIdx, isCur=w===wi, isFuture=w>wi;
    var totalPlanned=week.workouts.reduce(function(s,wo){return s+wo.planned;},0);
    var totalActualW=week.workouts.reduce(function(s,wo){return s+(wo.actual||0);},0);
    var diff=totalActualW>0?Math.round((totalActualW-totalPlanned)*10)/10:null;
    var kmInfo='<span class="planned-km">'+totalPlanned+' км план</span>';
    if(totalActualW>0){var sg=diff>=0?'+':'';kmInfo+=' · <span class="actual-km">'+totalActualW+' км факт ('+sg+diff+')</span>';}
    var badge=week.isRace?'🏁 ЗАБІГ':'ТИЖД '+week.weekNum;
    var blockCls='adap-week'+(isCur?' adap-current':isFuture?' adap-future':'')+(week.isRace?' adap-race':'')+(open[String(w)]||isCur?' open':'');
    var block=document.createElement('div'); block.className=blockCls; block.dataset.widx=w;
    block.innerHTML=
      '<div class="adap-week-header" onclick="toggleAWeek('+w+')">'+
        '<div class="adap-week-label">'+badge+'</div>'+
        '<div class="adap-week-meta">'+(week.weekDate||'')+(week.isRace?' 🎯':'')+'</div>'+
        '<div class="adap-week-km-info">'+kmInfo+'</div>'+
        '<div class="week-chevron" style="color:var(--text2);font-size:12px;transition:transform .2s">▼</div>'+
      '</div>'+
      '<div class="adap-week-body" id="awb-'+w+'"></div>';
    c.appendChild(block);
    var body=block.querySelector('#awb-'+w);
    week.workouts.forEach(function(wo,di){ body.appendChild(makeAWorkoutRow(w,di,wo,isFuture)); });
  });
}
function toggleAWeek(w){ var el=document.querySelector('.adap-week[data-widx="'+w+'"]'); if(el) el.classList.toggle('open'); }

function renderAStats(){
  var weeks=getAWeeks();
  var totalPlanKm=weeks.reduce(function(s,w){return s+w.workouts.reduce(function(a,wo){return a+wo.planned;},0);},0);
  var actualKm=aTotalActualKm(aState.actuals||{});
  var totalW=weeks.reduce(function(s,w){return s+w.workouts.length;},0);
  var doneW=Object.values(aState.actuals||{}).filter(function(v){return parseFloat(v)>0;}).length;
  document.getElementById('a-sv-km').textContent=actualKm+' км';
  document.getElementById('a-sv-plan-km').textContent=totalPlanKm;
  document.getElementById('a-sv-workouts').textContent=doneW;
  document.getElementById('a-sv-total-w').textContent=totalW;
  var ap=aAvgPace(aState.actuals||{},aState.paces||{});
  document.getElementById('a-sv-pace-cur').textContent=ap!=null?formatPace(ap):'—';
  // Projected pace: 0.8% better per remaining week
  var wi=aCurrentWeekIdx(aState.startDate,weeks.length);
  var weeksLeft=weeks.length-wi;
  var proj=ap!=null?ap*(1-0.008*Math.min(weeksLeft,10)):null;
  document.getElementById('a-sv-pace-proj').textContent=proj!=null?formatPace(proj):'—';
  // KM chart
  var chart=document.getElementById('a-kms-chart'); chart.innerHTML='';
  var maxKm=Math.max.apply(null,weeks.map(function(w){return w.workouts.reduce(function(s,wo){return s+wo.planned;},0);}));
  var weekPaces=[];
  weeks.forEach(function(week,wIdx){
    var planned=week.workouts.reduce(function(s,wo){return s+wo.planned;},0);
    var actual=week.workouts.reduce(function(s,wo){return s+(wo.actual||0);},0);
    var pctH=(planned/maxKm)*100;
    var bar=document.createElement('div');
    bar.className='kms-bar'+(actual>0?(actual>=planned?' done-bar-adap':' current-bar'):'');
    bar.style.height=pctH+'%'; bar.title='Тиждень '+week.weekNum+': план '+planned+' км'+(actual?' / факт '+actual+' км':'');
    chart.appendChild(bar);
    var wps=[];
    week.workouts.forEach(function(wo,di){
      var v=parsePace((aState.paces||{})['w'+week.wIdx+'d'+di]); if(v!=null) wps.push(v);
    });
    weekPaces.push(wps.length?wps.reduce(function(a,b){return a+b;})/wps.length:null);
  });
  renderPaceChart('a-pace-chart', weekPaces);
  // Type breakdown
  var fakeDone={};
  weeks.forEach(function(week){
    week.workouts.forEach(function(wo,di){
      if(wo.actual!=null&&wo.actual>0) fakeDone['w'+week.wIdx+'d'+di]=true;
    });
  });
  var fakePlan=weeks.map(function(w){return{workouts:w.workouts.map(function(wo){return{type:wo.type,km:wo.actual||0};})};});
  renderTypeBreakdown('a-type-breakdown', fakePlan, fakeDone);
}

// ═══════════════════════════════════════
// SHARED RENDER HELPERS
// ═══════════════════════════════════════
function renderPaceChart(elId, weekPaces){
  var el=document.getElementById(elId); if(!el) return;
  var hasData=weekPaces.some(function(p){return p!=null;});
  if(!hasData){el.innerHTML='<div style="font-size:12px;color:var(--text2);padding-top:4px">Темп буде відображено після введення даних пробіжок</div>';return;}
  var valid=weekPaces.filter(function(p){return p!=null;});
  var minP=Math.min.apply(null,valid)*0.97, maxP=Math.max.apply(null,valid)*1.03;
  var n=weekPaces.length; if(n<2){el.innerHTML='';return;}
  var w=el.offsetWidth||600, h=36;
  var points=[];
  weekPaces.forEach(function(p,i){
    if(p==null) return;
    var x=(i/(n-1))*w;
    var y=h-((p-minP)/(maxP-minP+0.001))*h;
    points.push({x:x,y:y,p:p,i:i});
  });
  if(points.length<1){el.innerHTML='';return;}
  var pathD=points.map(function(pt,j){return(j===0?'M':'L')+pt.x+','+pt.y;}).join(' ');
  var dots=points.map(function(pt){
    return '<circle cx="'+pt.x+'" cy="'+pt.y+'" r="3" fill="#a78bfa"/>'+
      '<title>Тиждень '+(pt.i+1)+': '+formatPace(pt.p)+' хв/км</title>';
  }).join('');
  el.innerHTML='<svg class="pace-svg" viewBox="0 0 '+w+' '+h+'" preserveAspectRatio="none">'+
    '<path d="'+pathD+'" fill="none" stroke="#a78bfa" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'+
    dots+'</svg>';
}

function renderTypeBreakdown(elId, plan, done){
  var types={easy:0,tempo:0,long:0,race:0};
  plan.forEach(function(w,wi){
    w.workouts.forEach(function(wo,di){
      if(done['w'+wi+'d'+di]) types[wo.type]=(types[wo.type]||0)+wo.km;
    });
  });
  var el=document.getElementById(elId); el.innerHTML='';
  var total=Object.values(types).reduce(function(a,b){return a+b;},0)||1;
  Object.entries(types).forEach(function(entry){
    var t=entry[0],km=entry[1], pct=Math.round(km/total*100);
    el.innerHTML+='<div>'+
      '<div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px">'+
        '<span class="'+TYPE_CLASS[t]+'">'+TYPE_LABELS[t]+'</span>'+
        '<span style="color:var(--text2)">'+km+' км · '+pct+'%</span>'+
      '</div>'+
      '<div style="height:6px;background:var(--surface2);border-radius:100px;overflow:hidden">'+
        '<div style="height:100%;width:'+pct+'%;background:var(--accent);border-radius:100px;transition:width .6s"></div>'+
      '</div></div>';
  });
}

// ═══════════════════════════════════════
// TOAST
// ═══════════════════════════════════════
function showToast(msg){
  var t=document.getElementById('toast'); t.textContent=msg; t.classList.add('show');
  setTimeout(function(){t.classList.remove('show');},2800);
}

// ═══════════════════════════════════════
// INIT
// ═══════════════════════════════════════
window.onload=function(){
  var today=new Date();
  var si=document.getElementById('start-date');
  if(si){ si.value=toDateStr(today); si.addEventListener('change',updateSetupPreview); }
  var ei=document.getElementById('end-date');
  if(ei){
    var def=new Date(today); def.setDate(def.getDate()+16*7);
    ei.value=toDateStr(def);
    ei.addEventListener('change',updateSetupPreview);
    updateSetupPreview();
  }
  var ai=document.getElementById('adap-start-date');
  if(ai) ai.value=toDateStr(today);

  var hasFixed=fLoad(), hasAdap=aLoad();
  if(hasFixed||hasAdap){
    currentMode=hasFixed?'fixed':'adaptive';
    showApp();
  }
};
