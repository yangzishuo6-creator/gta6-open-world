export function updateCrew(state,dt) {
  state.crew.nia=Math.max(0,state.crew.nia-dt);
  state.crew.ivo=Math.max(0,state.crew.ivo-dt);
  if (state.input.tap('KeyQ') && state.crew.nia===0 && state.stars>0) {
    state.stars=Math.max(0,state.stars-2);
    state.heat=7;
    state.crew.nia=48;
    state.speak('Nia','I sent them to the south docks. Make it count.',5);
  }
  if (state.input.tap('KeyF') && state.crew.ivo===0) {
    if (state.car) state.car.damage=Math.max(0,state.car.damage-55);
    else state.armour=Math.min(100,state.armour+50);
    state.crew.ivo=35;
    state.speak('Ivo',state.car ? 'That should hold till you reach the shop.' : 'Fresh plates. Keep your head down.',5);
  }
}
