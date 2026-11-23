export const controls=[
  ['WASD / arrows','Move or drive'],['Mouse / click','Aim and fire'],['E','Enter, exit or interact'],
  ['1–4','Select weapon'],['Space','Sprint or handbrake'],['Q / F','Crew jam / repair'],
  ['R / M','Change station / mute'],['Esc','Pause']
];
export function makeMenus({newGame,resume,canContinue,save}) {
  const menu=document.querySelector('#menu'), list=document.querySelector('#menu-actions');
  const heading=document.querySelector('#menu-heading'), label=document.querySelector('#menu-label');
  let page='title';
  function button(text,action,disabled=false) {
    const node=document.createElement('button');
    node.textContent=text;node.disabled=disabled;node.onclick=action;list.append(node);
  }
  function show(mode) {
    page=mode;
    menu.hidden=mode==='play';
    menu.classList.toggle('paused',mode.startsWith('pause'));
    document.querySelector('#hud').hidden=mode!=='play';
    list.replaceChildren();
    if(mode==='play')return;
    if(mode.includes('controls')) {
      label.textContent='Harbor Bay';
      heading.textContent='Controls';
      const dl=document.createElement('dl');
      for(const [key,description] of controls)dl.append(Object.assign(document.createElement('dt'),{textContent:key}),Object.assign(document.createElement('dd'),{textContent:description}));
      list.append(dl);
      button('Back',()=>show(mode.startsWith('pause')?'pause':'title'));
    } else if(mode==='title') {
      label.textContent='THE PORT AUTHORITY FILES';
      heading.innerHTML='Harbor<br><em>Bay</em>';
      button('New game',()=>newGame(false));
      button('Continue',()=>newGame(true),!canContinue());
      button('Controls',()=>show('title-controls'));
    } else {
      label.textContent='Harbor Bay';
      heading.textContent='Paused';
      button('Resume',resume);
      button('Save & resume',()=>{save();resume();});
      button('Controls',()=>show('pause-controls'));
      button('Main menu',()=>show('title'));
    }
  }
  return {show,get page(){return page;}};
}
