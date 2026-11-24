import {box,lettering} from '../world/geometry.js';
import {refillAmmo} from '../combat/weapons.js';

export const garageLocation=[-9,-67];
export const garageServices={
  repair:{
    label:'Bodywork & repair',price:250,
    available:state=>!state.stars && state.car?.damage>0 && state.car.damage<100,
    apply:state=>{ state.car.damage=0; },
    message:'Bodywork restored to 100%.',
  },
  restock:{
    label:'Ammo restock',price:120,
    available:()=>true,
    apply:state=>{ state.ammo=refillAmmo(); },
    message:'All weapons restocked.',
  },
};

export function markGarage(scene) {
  const [x,z]=garageLocation;
  box(scene,0x294d51,x-2,1,z-.7,.12,2,.12);
  lettering(scene,'IVO · SAVE & SUPPLY','#fff1c9','#294d51',3.8,.59,x-2,2.05,z-.7,Math.PI/2);
}

export function garageNearby(state) {
  const p=state.position();
  return Math.hypot(p.x-garageLocation[0],p.z-garageLocation[1])<7;
}

export function serviceGarage(state,key) {
  const service=garageServices[key];
  if (!service || !garageNearby(state)) return 'Visit Ivo Motor Co. for service.';
  if (state.cash<service.price) return 'You need $'+service.price+' for this service.';
  if (!service.available(state)) return state.stars ? 'Lose Port Patrol before requesting bodywork.' :
    'Bring Ivo a damaged, running car.';
  state.cash-=service.price;
  service.apply(state);
  state.save();
  return service.message;
}

export function useGarage(state) {
  if (!garageNearby(state)) return;
  if (state.input.tap('KeyH')) {
    state.speak('Ivo',state.stars ? 'Lose Patrol before you bed down.' :
      state.save() ? 'Progress saved at the garage.' : 'Save unavailable.',4);
  }
  if (state.input.tap('KeyB')) {
    state.speak('Ivo',serviceGarage(state,'restock'),4);
  }
}
