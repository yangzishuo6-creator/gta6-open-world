const key='harbor-bay-save-v1';

export function loadGame() {
  try {
    const save=JSON.parse(localStorage.getItem(key));
    if (!save || save.version!==1) return null;
    return save;
  } catch {
    return null;
  }
}

export function saveGame(state) {
  if (state.shot || state.mode==='title') return false;
  const pos=state.position();
  try {
    localStorage.setItem(key,JSON.stringify({
      version:1,x:pos.x,z:pos.z,heading:state.view.heading,
      cash:state.cash,xp:state.xp,mission:state.mission,stage:state.stage,
      health:state.health,armour:state.armour,
      ammo:state.ammo,
    }));
    return true;
  } catch {
    return false;
  }
}
