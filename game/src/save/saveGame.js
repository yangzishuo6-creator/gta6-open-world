const key='harbor-bay-3d-v1';
export function loadSave() {
  try {
    const saved=JSON.parse(localStorage.getItem(key));
    return saved?.version===1?saved:null;
  } catch {return null;}
}
export function saveGame(story,player,weapons) {
  try {
    localStorage.setItem(key,JSON.stringify({version:1,chapter:story.chapter,stage:story.stage,
      x:player.x,z:player.z,cash:player.cash,xp:player.xp,health:player.health,armor:player.armor,
      ownedCar:player.vehicle?{name:player.vehicle.name,damage:player.vehicle.damage}:null,
      ammo:weapons.slots.slice(1).map(item=>item.ammo)}));
    return true;
  } catch {return false;}
}
