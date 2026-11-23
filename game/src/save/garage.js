import {box,lettering} from '../world/geometry.js';
import {refillAmmo} from '../combat/weapons.js';

export const garageLocation=[-9,-67];

export function markGarage(scene) {
  const [x,z]=garageLocation;
  box(scene,0x294d51,x-2,1,z-.7,.12,2,.12);
  lettering(scene,'IVO · SAVE & SUPPLY','#fff1c9','#294d51',3.8,.59,x-2,2.05,z-.7,Math.PI/2);
}

export function garageNearby(state) {
  const p=state.position();
  return Math.hypot(p.x-garageLocation[0],p.z-garageLocation[1])<7;
}

export function useGarage(state) {
  if (!garageNearby(state)) return;
  if (state.input.tap('KeyH')) {
    state.speak('Ivo',state.stars ? 'Lose Patrol before you bed down.' :
      state.save() ? 'Progress saved at the garage.' : 'Save unavailable.',4);
  }
  if (state.input.tap('KeyB')) {
    if (state.cash<120) state.speak('Ivo','A full restock costs $120.',4);
    else {
      state.cash-=120;
      state.ammo=refillAmmo();
      state.speak('Ivo','All weapons restocked.',4);
    }
  }
}
