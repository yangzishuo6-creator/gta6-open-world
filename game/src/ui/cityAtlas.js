import {avenues,crossStreets} from '../world/cityBuilder.js';
import {campaign,currentStage} from '../missions/storyMissions.js';
import {activityPoint} from '../missions/activities.js';
import {garageLocation,garageNearby,garageServices} from '../save/garage.js';
import {loadGame} from '../save/saveGame.js';
import {portrait} from './dialogue.js';

const tabs=['Map','Story','Crew','Garage','Stats','Save'];
export const saveSlots=['Autosave','Manual slot 01','Manual slot 02'];
const districts=[
  ['PORT AUTHORITY','#a390e8','#6953a9',-225,-330,-.5,-192,-126,-265],
  ['CANNERY WARD','#f58874','#b94b46',-225,-192,-104,64,-157,-106],
  ['JUNIPER MILE','#f5bd57','#c47c32',-104,-192,9,64,-48,-35],
  ['LOW TIDE','#86cb91','#438956',-225,64,9,271,-116,167],
];
const pins=[
  ['◆','Story','#ffcf59'],['R','Circuit','#ff9779'],['C','Courier','#c8afff'],
  ['G','Safehouse','#a1edaa'],['P','Pier','#ffe7ad'],['▲','You','#8ff2ed'],
];

function drawAtlas(canvas,state) {
  const ctx=canvas.getContext('2d');
  const x=value=>421+value*1.74;
  const y=value=>306+value*.85;
  const rect=(left,top,right,bottom)=>ctx.fillRect(x(left),y(top),x(right)-x(left),y(bottom)-y(top));
  const line=(points)=>{
    ctx.beginPath();
    points.forEach(([mx,mz],i)=>i===0 ? ctx.moveTo(x(mx),y(mz)) : ctx.lineTo(x(mx),y(mz)));
    ctx.stroke();
  };
  const water=ctx.createLinearGradient(430,0,650,500);
  water.addColorStop(0,'#2ea9a2');
  water.addColorStop(1,'#137a8b');
  ctx.fillStyle=water;
  ctx.fillRect(0,0,650,560);
  ctx.strokeStyle='#c5f4d551';
  for (let row=0;row<22;row++) {
    for (let col=0;col<14;col++) {
      const px=col*49+(row%2)*19, py=row*26+8;
      ctx.beginPath();
      ctx.moveTo(px,py);
      ctx.quadraticCurveTo(px+9,py-5,px+21,py);
      ctx.stroke();
    }
  }
  ctx.fillStyle='#88d6ba';
  rect(-230,-335,63,277);
  ctx.fillStyle='#ffe0a0';
  rect(-225,-330,56,271);
  for (const [,fill,,left,top,right,bottom] of districts) {
    ctx.fillStyle=fill;
    rect(left,top,right,bottom);
  }
  for (const lot of state.lots) {
    const district=districts.find(([, , ,left,top,right,bottom])=>
      lot.x>=left && lot.x<right && lot.z>=top && lot.z<bottom);
    if (!district) continue;
    ctx.fillStyle=district[2];
    rect(lot.x-lot.w/2,lot.z-lot.d/2,lot.x+lot.w/2,lot.z+lot.d/2);
  }
  ctx.fillStyle='#fff2cc';
  for (const street of crossStreets) rect(-225,street-4,9,street+4);
  for (const avenue of avenues) rect(avenue-4,-330,avenue+4,271);
  ctx.fillStyle='#bf7553';
  rect(13,-330,22,271);
  rect(22,-109,108,-97);
  rect(87,-115,110,-91);
  ctx.fillStyle='#f4b984';
  rect(15,-330,20,271);
  rect(22,-106,105,-100);
  rect(90,-112,107,-94);

  ctx.textAlign='center';
  ctx.textBaseline='middle';
  ctx.font='bold 22px Georgia';
  for (const [label,fill,,,,,,mx,mz] of districts) {
    const width=ctx.measureText(label).width+19;
    ctx.fillStyle='#fff1cd';
    ctx.fillRect(x(mx)-width/2-2,y(mz)-16,width+4,32);
    ctx.fillStyle=fill;
    ctx.fillRect(x(mx)-width/2,y(mz)-14,width,28);
    ctx.fillStyle='#263438';
    ctx.fillText(label,x(mx),y(mz)+1);
  }
  ctx.fillStyle='#fff9dc';
  ctx.font='italic bold 26px Georgia';
  ctx.fillText('Harbor Bay',581,428);
  ctx.font='bold 13px Arial';
  ctx.fillText('JUNIPER PIER',586,190);
  ctx.fillText('N',595,57);
  ctx.fillText('▲',595,73);
  ctx.save();
  ctx.translate(x(40),y(122));
  ctx.rotate(-Math.PI/2);
  ctx.fillStyle='#725338';
  ctx.fillText('BAYFRONT PROMENADE',0,0);
  ctx.restore();

  const p=state.position();
  const step=currentStage(state);
  const target=activityPoint(state.activity) ?? step?.slice(1,3);
  if (target) {
    const [tx,tz]=target;
    const avenue=avenues.reduce((best,next)=>Math.abs(next-p.x)<Math.abs(best-p.x) ? next : best);
    const crossing=crossStreets.reduce((best,next)=>Math.abs(next-tz)<Math.abs(best-tz) ? next : best);
    const route=[[p.x,p.z],[avenue,p.z],[avenue,crossing],[tx,crossing],[tx,tz]];
    ctx.lineJoin='round';
    ctx.strokeStyle='#fff5d3';
    ctx.lineWidth=9;
    line(route);
    ctx.strokeStyle='#164d57';
    ctx.lineWidth=5;
    ctx.setLineDash([9,5]);
    line(route);
    ctx.setLineDash([]);
  }
  function pin(mx,mz,label,color) {
    ctx.save();
    ctx.translate(x(mx),y(mz));
    ctx.fillStyle=color;
    ctx.strokeStyle='#102430';
    ctx.lineWidth=3;
    ctx.beginPath();
    ctx.roundRect(-13,-13,26,26,6);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle='#102430';
    ctx.font='bold 15px Arial';
    ctx.fillText(label,0,1);
    ctx.restore();
  }
  const mark=(point,index)=>pin(...point,pins[index][0],pins[index][2]);
  if (step) mark(step.slice(1,3),0);
  mark([3,59],1);
  mark([16,27],2);
  mark(garageLocation,3);
  mark([97,-103],4);
  if (state.activity && target) mark(target,state.activity.kind==='race' ? 1 : 2);
  mark([p.x,p.z],5);
}

export function saveDetails(save) {
  if (!save) return '<p>Empty slot</p>';
  const rank=['Rookie','Runner','Wheelhand','Fixer','Harbor Ace','Legend'][Math.min(5,Math.floor((save.xp ?? 0)/800))];
  const saved=save.savedAt ? new Date(save.savedAt).toLocaleString('en-GB',{dateStyle:'medium',timeStyle:'short',timeZone:'UTC'})+' UTC' : 'Unavailable';
  return '<dl><dt>Chapter</dt><dd>'+Math.min(save.mission+1,6)+'/6</dd><dt>Missions done</dt><dd>'+save.mission+
    '/6</dd><dt>Cash</dt><dd>$'+save.cash.toLocaleString('en-US')+'</dd><dt>Rank</dt><dd>'+rank+
    '</dd><dt>Saved</dt><dd>'+saved+'</dd></dl>';
}

export function openAtlas(card,state,showTitle,previewSave) {
  const total=campaign.reduce((sum,job)=>sum+job.stages.length,0);
  const cleared=campaign.slice(0,state.mission).reduce((sum,job)=>sum+job.stages.length,0)+state.stage;
  const completion=Math.round(100*cleared/total);
  card.className='atlas';
  card.innerHTML='<header><h1>Harbor Bay <em>Atlas</em></h1><button id="atlas-resume">Resume <kbd>M</kbd></button></header>'+
    '<nav aria-label="Pause menu"></nav><div class="atlas-body"><section class="atlas-drawing"><canvas width="650" height="560" aria-label="Harbor Bay district map"></canvas>'+
    '<div class="atlas-legend">'+pins.map(([symbol,label,color])=>
      '<span><b style="--pin:'+color+'">'+symbol+'</b> '+label+'</span>').join('')+'</div></section>'+
    '<section class="atlas-detail" aria-live="polite"></section></div>';
  card.querySelector('#atlas-resume').onclick=()=>state.resume();
  drawAtlas(card.querySelector('canvas'),state);
  const nav=card.querySelector('nav');
  const detail=card.querySelector('.atlas-detail');
  const story=()=>'<ol class="atlas-jobs">'+campaign.map((job,i)=>
    '<li class="'+(i===state.mission ? 'current' : '')+'"><b>'+String(i+1).padStart(2,'0')+'</b><span>'+job.title+
    '</span><small>'+(i<state.mission ? 'DONE' : i===state.mission ? 'ACTIVE' : 'UPCOMING')+'</small></li>').join('')+'</ol>';
  const crew='<div class="atlas-crew">'+[['Nia','Fixer','Q'],['Ivo','Mechanic','F']].map(([name,role,key])=>
    '<div><canvas width="88" height="88" data-crew="'+name+'"></canvas><span><b>'+name+'</b><br>'+role+'</span><kbd>'+key+'</kbd></div>').join('')+'</div>';
  const stats='<dl><dt>Cash earned</dt><dd>$'+state.stats.earned.toLocaleString('en-US')+
    '</dd><dt>Cars stolen</dt><dd>'+state.stats.stolen+'</dd><dt>Wanted escapes</dt><dd>'+state.stats.escapes+'</dd></dl>';
  function collection() {
    const list=document.createElement('ul');
    list.className='atlas-collection';
    for (const name of state.owned) {
      const entry=document.createElement('li');
      entry.textContent=name;
      list.append(entry);
    }
    detail.querySelector('.collection').append(list);
    if (!list.children.length) list.textContent='No cars collected';
  }
  const slot=()=>saveDetails(previewSave ?? loadGame());
  let selectedSlot=0;
  function draw(tab) {
    card.dataset.tab=tab;
    for (const button of nav.children) button.setAttribute('aria-pressed',String(button.textContent===tab));
    if (tab==='Map') {
      detail.innerHTML='<div class="atlas-completion"><strong style="--completion:'+completion+'%">'+completion+'%</strong>'+
        '<div><h2>Story progress</h2><p>'+cleared+' / '+total+' stages cleared</p></div></div>'+story()+
        '<div class="atlas-summary"><div><h3>Crew</h3>'+crew+'</div><div class="collection"><h3>Ivo Motor Co.</h3></div>'+
        '<div><h3>Career stats</h3>'+stats+'</div><div><h3>Save slots</h3>'+slot()+'</div></div>';
      collection();
    } else if (tab==='Story') {
      detail.innerHTML='<h2>Ledger case</h2>'+story();
    } else if (tab==='Crew') {
      detail.innerHTML='<h2>Crew</h2>'+crew+'<p>Nia distracts Port Patrol. Ivo repairs your ride or supplies armour.</p>';
    } else if (tab==='Garage') {
      const car=state.car;
      const nearby=garageNearby(state);
      detail.innerHTML='<div class="showroom-heading"><h2>Ivo Motor Co.</h2><b>$'+state.cash.toLocaleString('en-US')+'</b></div>'+
        '<figure class="showroom-car"><canvas width="640" height="306"></canvas><figcaption>'+
        '<strong></strong><span></span></figcaption></figure>'+
        '<div class="collection"><h3>Collection</h3></div><h3>Workshop</h3>'+
        '<p>'+(!nearby ? 'Visit the safehouse on Bayfront Drive for service.' :
          state.stars ? 'Bodywork opens when you lose Port Patrol.' :
          car?.damage>0 && car.damage<100 ? 'Safehouse open for service.' : 'Bring a damaged, running car for bodywork.')+'</p>'+
        '<div class="showroom-services"></div><p class="service-status" role="status"></p>';
      state.drawShowroom(detail.querySelector('.showroom-car canvas'));
      detail.querySelector('figcaption strong').textContent=car?.name ?? 'Aster Veloce';
      const condition=detail.querySelector('figcaption span');
      if (car) {
        const value=Math.max(0,Math.round(100-car.damage));
        condition.textContent=value+'% condition';
        const meter=document.createElement('meter');
        meter.max=100;
        meter.value=value;
        meter.setAttribute('aria-label','Vehicle condition');
        condition.append(meter);
      } else condition.textContent='Featured model';
      collection();
      for (const [key,service] of Object.entries(garageServices)) {
        const button=document.createElement('button');
        button.innerHTML='<span>'+service.label+'</span><strong>$'+service.price+'</strong>';
        button.disabled=!nearby || state.cash<service.price || !service.available(state);
        button.onclick=()=>{
          const status=state.serviceGarage(key);
          draw('Garage');
          detail.querySelector('.service-status').textContent=status;
        };
        detail.querySelector('.showroom-services').append(button);
      }
    } else if (tab==='Stats') {
      detail.innerHTML='<h2>Career stats</h2>'+stats;
    } else {
      detail.innerHTML='<h2>Save slots</h2><div class="slot-options"></div>'+
        saveDetails(selectedSlot===0 && previewSave ? previewSave : loadGame(selectedSlot))+
        '<button id="atlas-save">Save Game</button> <button id="atlas-title">Main Menu</button><p id="save-status" role="status"></p>';
      saveSlots.forEach((name,i)=>{
        const choice=document.createElement('button');
        choice.textContent=name;
        choice.setAttribute('aria-pressed',String(i===selectedSlot));
        choice.onclick=()=>{ selectedSlot=i; draw('Save'); };
        detail.querySelector('.slot-options').append(choice);
      });
      detail.querySelector('#atlas-save').onclick=()=>{
        const saved=state.save(selectedSlot);
        draw('Save');
        detail.querySelector('#save-status').textContent=saved ? 'Progress saved' : 'Save unavailable';
      };
      detail.querySelector('#atlas-title').onclick=showTitle;
    }
    for (const face of detail.querySelectorAll('[data-crew]')) portrait(face,face.dataset.crew);
  }
  for (const tab of tabs) {
    const item=document.createElement('button');
    item.textContent=tab;
    item.onclick=()=>draw(tab);
    nav.append(item);
  }
  draw(state.shot==='shop' ? 'Garage' : 'Map');
}
