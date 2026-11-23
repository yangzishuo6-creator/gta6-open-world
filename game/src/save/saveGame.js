const key='harbor-bay-save-v1';

const slotKey=slot=>slot===0 ? key : key+'-slot-'+slot;

export function loadGame(slot=0) {
  try {
    const save=JSON.parse(localStorage.getItem(slotKey(slot)));
    if (!save || save.version!==1) return null;
    return save;
  } catch {
    return null;
  }
}

export function saveGame(state,slot=0) {
  if (state.shot || state.mode==='title') return false;
  const pos=state.position();
  try {
    localStorage.setItem(slotKey(slot),JSON.stringify({
      version:1,x:pos.x,z:pos.z,heading:state.view.heading,
      cash:state.cash,xp:state.xp,mission:state.mission,stage:state.stage,
      health:state.health,armour:state.armour,
      ammo:state.ammo,
      stats:state.stats,owned:state.owned,savedAt:Date.now(),
    }));
    return true;
  } catch {
    return false;
  }
}
