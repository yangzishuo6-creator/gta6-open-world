import {loadGame} from '../save/saveGame.js';
import {campaign} from '../missions/storyMissions.js';

const bindings=[
  ['W A S D','Move / drive'],['Shift','Sprint'],['Space','Handbrake'],
  ['E','Enter, steal, or exit a car'],['Right mouse','Aim and turn camera'],['Left mouse','Fire'],
  ['1–4','Select weapon'],['Q / F','Nia diversion / Ivo repair or armour'],
  ['R / C','Juniper Circuit / Pier Courier'],['T','Cycle radio'],['Esc','Pause'],
  ['R (on foot)','Reload'],['Shift (in race)','Nitro'],['H / B (garage)','Save / restock ammo'],
];

export function createMenus(state) {
  const root=document.getElementById('menu');
  function show(screen) {
    if (screen==='play') {
      root.hidden=true;
      return;
    }
    document.exitPointerLock?.();
    root.hidden=false;
    root.innerHTML='';
    const card=document.createElement('div');
    card.className='menu-card';
    root.append(card);
    const buttons=document.createElement('div');
    buttons.className='menu-actions';
    function button(label,onClick,disabled=false) {
      const item=document.createElement('button');
      item.textContent=label;
      item.disabled=disabled;
      item.addEventListener('click',onClick);
      buttons.append(item);
      return item;
    }
    if (screen==='title') {
      card.innerHTML='<div class="micro">JUNIPER MILE · PORT DISTRICT</div><h1>Harbor<br><em>Bay</em></h1><p>Steal the ledger that runs the waterfront.</p>';
      button('New Game',()=>state.start(null));
      const save=state.shot==='title' ? {mission:3,stage:2,cash:18450} : loadGame();
      const continued=button('Continue',()=>state.start(save),!save);
      if (save) {
        const total=campaign.reduce((sum,chapter)=>sum+chapter.stages.length,0);
        const cleared=campaign.slice(0,save.mission).reduce((sum,chapter)=>sum+chapter.stages.length,0)+save.stage;
        const slot=document.createElement('small');
        slot.className='save-slot';
        slot.textContent='Chapter '+Math.min(save.mission+1,campaign.length)+' · '+
          Math.round(cleared/total*100)+'% · $'+save.cash.toLocaleString('en-US');
        continued.append(slot);
      }
      button('Controls',()=>show('controls'));
    } else if (screen==='controls') {
      card.innerHTML='<div class="micro">HARBOR BAY</div><h2>Controls</h2><ul class="controls">'+bindings.map(
        ([key,action])=>'<li><b>'+key+'</b>'+action+'</li>').join('')+'</ul>';
      button('Back',()=>show(state.mode));
    } else {
      card.innerHTML='<div class="micro">HARBOR BAY</div><h2>Paused</h2>';
      button('Resume',()=>state.resume());
      const save=button('Save Game',()=>{ save.textContent=state.save() ? 'Game saved' : 'Save unavailable'; });
      button('Controls',()=>show('controls'));
      button('Main Menu',()=>state.title());
    }
    card.append(buttons);
    if (screen==='title') {
      const hint=document.createElement('div');
      hint.className='controls-hint';
      hint.textContent='WASD  MOVE / DRIVE   ·   E  ENTER / EXIT';
      card.append(hint);
    }
  }
  return show;
}
