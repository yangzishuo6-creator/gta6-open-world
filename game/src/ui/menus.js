import {loadGame} from '../save/saveGame.js';
import {openAtlas,saveDetails,saveSlots} from './cityAtlas.js';

const bindings=[
  ['W A S D','Move / drive'],['Shift','Sprint'],['Space','Handbrake'],
  ['E','Enter, steal, or exit a car'],['Right mouse','Aim and turn camera'],['Left mouse','Fire'],
  ['1–4','Select weapon'],['Q / F','Nia diversion / Ivo repair or armour'],
  ['R / C','Juniper Circuit / Pier Courier'],['T','Cycle radio'],['M / Esc','City atlas / resume'],
  ['R (on foot)','Reload'],['Shift (in race)','Nitro'],['H / B (garage)','Save / restock ammo'],
];

export function createMenus(state) {
  const root=document.getElementById('menu');
  const preview={mission:2,stage:1,cash:18450,xp:2075,savedAt:Date.UTC(2026,10,23,19,42)};
  let loadSlot=0;
  function show(screen) {
    if (screen==='play') {
      root.hidden=true;
      return;
    }
    document.exitPointerLock?.();
    root.hidden=false;
    root.dataset.screen=screen;
    root.innerHTML='';
    const card=document.createElement('div');
    card.className='menu-card';
    root.append(card);
    if (screen==='pause') {
      openAtlas(card,state,()=>state.title(),state.shot==='map' ? preview : null);
      return;
    }
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
    const save=state.shot==='title' ? preview : loadGame();
    if (screen==='title') {
      card.innerHTML='<h1>Harbor<br><em>Bay</em></h1><p class="title-subtitle">The Breakwater Ledger</p>';
      button('Continue',()=>state.start(save),!save);
      button('New Game',()=>state.start(null));
      button('Load',()=>{ loadSlot=0; show('load'); });
      button('Settings',()=>show('settings'));
      button('Controls',()=>show('controls'));
      const file=document.createElement('aside');
      file.className='title-save';
      file.innerHTML='<h2>Save file</h2>'+saveDetails(save);
      root.append(file);
    } else if (screen==='load') {
      const selected=loadSlot===0 ? save : loadGame(loadSlot);
      card.innerHTML='<h2>'+saveSlots[loadSlot]+'</h2>'+saveDetails(selected);
      button('Load game',()=>state.start(selected),!selected);
      saveSlots.forEach((name,i)=>button(name,()=>{ loadSlot=i; show('load'); },loadSlot===i));
      button('Back',()=>show('title'));
    } else if (screen==='settings') {
      card.innerHTML='<h2>Settings</h2>';
      button(state.audio.muted ? 'Sound off' : 'Sound on',()=>{
        state.audio.muted=!state.audio.muted;
        show('settings');
      });
      button('Back',()=>show('title'));
    } else if (screen==='controls') {
      card.innerHTML='<div class="micro">HARBOR BAY</div><h2>Controls</h2><ul class="controls">'+bindings.map(
        ([key,action])=>'<li><b>'+key+'</b>'+action+'</li>').join('')+'</ul>';
      button('Back',()=>show(state.mode));
    }
    card.append(buttons);
    if (screen==='title') {
      const hint=document.createElement('div');
      hint.className='controls-hint';
      hint.textContent='WASD  MOVE / DRIVE   ·   E  ENTER / EXIT   ·   M  CITY ATLAS';
      card.append(hint);
    }
  }
  return show;
}
