import {loadGame} from '../save/saveGame.js';

const bindings=[
  ['W A S D','Move / drive'],['Shift','Sprint'],['Space','Handbrake'],
  ['E','Enter, steal, or exit a car'],['Right mouse','Aim and turn camera'],['Left mouse','Fire'],
  ['1–4','Select weapon'],['Q / F','Nia diversion / Ivo repair or armour'],
  ['R / C','Juniper Circuit / Pier Courier'],['T','Cycle radio'],['Esc','Pause'],
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
      const save=loadGame();
      button('Continue',()=>state.start(save),!save);
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
  }
  return show;
}
