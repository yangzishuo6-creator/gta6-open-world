import {avenues,crossStreets} from '../world/cityBuilder.js';
import {campaign,currentStage} from '../missions/storyMissions.js';
import {garageLocation} from '../save/garage.js';
import {loadGame} from '../save/saveGame.js';

const tabs=['Map','Story','Crew','Garage','Stats','Save'];
export const saveSlots=['Autosave','Manual slot 01','Manual slot 02'];
const districts=[
  ['CANNERY WARD',-181,-138],['PORT AUTHORITY',-98,-267],
  ['JUNIPER MILE',-35,-27],['LOW TIDE',-126,125],
];

function drawAtlas(canvas,state) {
  const ctx=canvas.getContext('2d');
  const x=value=>493+value*1.92;
  const y=value=>304+value*.78;
  ctx.fillStyle='#103b4d';
  ctx.fillRect(0,0,650,560);
  ctx.strokeStyle='#397583';
  for (let i=0;i<560;i+=14) {
    ctx.beginPath();
    ctx.moveTo(0,i+55);
    ctx.lineTo(650,i-55);
    ctx.stroke();
  }
  ctx.fillStyle='#253846';
  ctx.fillRect(x(-229),y(-325),x(25)-x(-229),y(273)-y(-325));
  ctx.fillStyle='#344d52';
  for (const lot of state.lots) {
    ctx.fillRect(x(lot.x-lot.w/2),y(lot.z-lot.d/2),lot.w*1.92,lot.d*.78);
  }
  ctx.fillStyle='#a9a18e';
  for (const street of crossStreets) ctx.fillRect(x(-222),y(street)-2,x(15)-x(-222),4);
  for (const avenue of avenues) ctx.fillRect(x(avenue)-5,y(-325),10,y(273)-y(-325));
  ctx.fillStyle='#d7b58b';
  ctx.fillRect(x(13),y(-325),6,y(273)-y(-325));
  ctx.fillRect(x(13),y(-103),x(69)-x(13),8);
  ctx.font='bold 15px Arial';
  ctx.textAlign='center';
  ctx.textBaseline='middle';
  ctx.lineWidth=4;
  ctx.strokeStyle='#20343d';
  for (const [label,mx,mz] of districts) {
    ctx.strokeText(label,x(mx),y(mz));
    ctx.fillText(label,x(mx),y(mz));
  }
  ctx.fillStyle='#92c4c4';
  ctx.font='italic 21px Georgia';
  ctx.fillText('Harbor Bay',577,405);
  const p=state.position();
  const step=currentStage(state);
  if (step) {
    ctx.strokeStyle='#6bf0c9';
    ctx.lineWidth=3;
    ctx.setLineDash([5,4]);
    ctx.beginPath();
    ctx.moveTo(x(p.x),y(p.z));
    ctx.lineTo(x(p.x),y(step[2]));
    ctx.lineTo(x(step[1]),y(step[2]));
    ctx.stroke();
    ctx.setLineDash([]);
  }
  function pin(mx,mz,label,color) {
    ctx.save();
    ctx.translate(x(mx),y(mz));
    ctx.fillStyle=color;
    ctx.strokeStyle='#102430';
    ctx.lineWidth=3;
    ctx.beginPath();
    ctx.roundRect(-12,-12,24,24,5);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle='#102430';
    ctx.font='bold 13px Arial';
    ctx.fillText(label,0,1);
    ctx.restore();
  }
  if (step) pin(step[1],step[2],'◆','#ffd083');
  pin(...garageLocation,'G','#8bdccf');
  pin(3,59,'R','#ee8871');
  pin(16,27,'C','#b7a2fc');
  pin(p.x,p.z,'▲','#72f0ba');
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
    '<div class="atlas-legend"><span>◆ Story</span><span>R Circuit</span><span>C Courier</span><span>G Safehouse</span><span>▲ You</span></div></section>'+
    '<section class="atlas-detail" aria-live="polite"></section></div>';
  card.querySelector('#atlas-resume').onclick=()=>state.resume();
  drawAtlas(card.querySelector('canvas'),state);
  const nav=card.querySelector('nav');
  const detail=card.querySelector('.atlas-detail');
  const story=()=>'<ol class="atlas-jobs">'+campaign.map((job,i)=>
    '<li class="'+(i===state.mission ? 'current' : '')+'"><b>'+String(i+1).padStart(2,'0')+'</b><span>'+job.title+
    '</span><small>'+(i<state.mission ? 'DONE' : i===state.mission ? 'ACTIVE' : 'UPCOMING')+'</small></li>').join('')+'</ol>';
  const crew='<p><b>Nia</b> · Fixer <kbd>Q</kbd></p><p><b>Ivo</b> · Mechanic <kbd>F</kbd></p>';
  const stats='<dl><dt>Cash earned</dt><dd>$'+state.stats.earned.toLocaleString('en-US')+
    '</dd><dt>Cars stolen</dt><dd>'+state.stats.stolen+'</dd><dt>Wanted escapes</dt><dd>'+state.stats.escapes+'</dd></dl>';
  const garage=()=>'<p>Ivo Motor Co. · Safehouse</p><p>'+state.owned.length+' cars in your collection</p>';
  const slot=()=>saveDetails(previewSave ?? loadGame());
  let selectedSlot=0;
  function draw(tab) {
    for (const button of nav.children) button.setAttribute('aria-pressed',String(button.textContent===tab));
    if (tab==='Map') {
      detail.innerHTML='<div class="atlas-completion"><strong style="--completion:'+completion+'%">'+completion+'%</strong>'+
        '<div><h2>Story progress</h2><p>'+cleared+' / '+total+' stages cleared</p></div></div>'+story()+
        '<div class="atlas-summary"><div><h3>Crew</h3>'+crew+'</div><div><h3>Garage</h3>'+garage()+'</div>'+
        '<div><h3>Career stats</h3>'+stats+'</div><div><h3>Save slots</h3>'+slot()+'</div></div>';
    } else if (tab==='Story') {
      detail.innerHTML='<h2>Ledger case</h2>'+story();
    } else if (tab==='Crew') {
      detail.innerHTML='<h2>Crew</h2>'+crew+'<p>Nia distracts Port Patrol. Ivo repairs your ride or supplies armour.</p>';
    } else if (tab==='Garage') {
      detail.innerHTML='<h2>Garage</h2>'+garage();
      const list=document.createElement('ul');
      for (const name of state.owned) {
        const entry=document.createElement('li');
        entry.textContent=name;
        list.append(entry);
      }
      detail.append(list);
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
  }
  for (const tab of tabs) {
    const item=document.createElement('button');
    item.textContent=tab;
    item.onclick=()=>draw(tab);
    nav.append(item);
  }
  draw('Map');
}
