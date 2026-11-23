import * as T from 'three';
import {box,lettering} from '../world/geometry.js';
import {spawnCar} from '../vehicles/carModels.js';

const routes={
  race:[[3,48],[3,0],[3,-64],[3,-128],[3,-192],[3,-256]],
  courier:[[16,27],[18,-8],[16,-56],[24,-103],[44,-103]],
};

export function makeCheckpoint(scene) {
  const gate=new T.Group();
  const aqua=0x41d4bc;
  for (const x of [-5,5]) {
    box(gate,aqua,x,2.7,0,.37,5.4,.43);
    box(gate,0xffd081,x,.2,0,.89,.4,.89);
    for (let i=0;i<6;i++) box(gate,0x284d58,x,.8+i*.7,.25,.39,.27,.13);
  }
  box(gate,aqua,0,5.48,0,10.4,.44,.56);
  lettering(gate,'JUNIPER CIRCUIT','#f9f0c9','#214e58',7.0,1.15,0,5.5,.34);
  scene.add(gate);
  gate.visible=false;
  return gate;
}

export function startActivity(state,kind) {
  if (state.activity) return;
  if ((kind==='race')!==Boolean(state.car)) {
    state.speak('Ivo',kind==='race' ? 'Get a car first.' : 'Courier run is on foot.',3);
    return;
  }
  const race=kind==='race';
  const p=state.position();
  const start=race ? 1 : 0;
  const rivals=race ? [
    spawnCar(state.scene,'Cinder GT',0xbd554f,-3,52,0),
    spawnCar(state.scene,'Maris R',0x58aaa3,-.3,57,0),
    spawnCar(state.scene,'Sora LX',0x657cae,6.6,61,0),
  ] : [];
  if (race && !state.shot) {
    p.set(3,0,59);
    state.car.heading=state.car.mesh.rotation.y=0;
    state.car.speed=0;
    state.view.ready=false;
  }
  state.activity={kind,step:start,left:race ? 37 : 34,rivals,elapsed:0,nitro:100,boosting:false};
  state.speak('Ivo',race ? 'Bayfront is yours. Hit every gate before the other crews.' :
    'Deliver the copy along the promenade before the buyer leaves.',7);
}

export function activityPoint(activity) {
  return activity ? routes[activity.kind][activity.step] : null;
}

export function raceRoute(activity) {
  return routes.race.slice(Math.max(0,activity.step-1));
}

export function raceStandings(state) {
  return [state.car,...state.activity.rivals].filter(Boolean)
    .sort((a,b)=>a.mesh.position.z-b.mesh.position.z);
}

export function updateActivities(state,dt) {
  const run=state.activity;
  state.gate.visible=run?.kind==='race';
  if (!run) return;
  run.left-=dt;
  run.elapsed+=dt;
  const p=state.position();
  const [x,z]=activityPoint(run);
  state.gate.position.set(x-3,0,z);
  run.rivals.forEach((car,i)=>{
    car.speed=Math.min(27+i*2,car.speed+dt*10);
    car.mesh.position.z-=car.speed*dt;
  });
  if (Math.hypot(p.x-x,p.z-z)<(run.kind==='race' ? 9 : 5)) {
    run.step++;
    state.audio.effect(560,.1,'triangle');
  }
  const complete=run.step===routes[run.kind].length;
  const lost=run.rivals.some(car=>car.mesh.position.z < -260);
  if (complete || run.left<=0 || lost) {
    if (complete) {
      state.cash+=run.kind==='race' ? 850 : 420;
      state.xp+=140;
      state.save();
    }
    state.speak('Ivo',complete ? 'Clean finish. Check your cut.' :
      lost ? 'A rival crossed first. There’s another heat when you’re ready.' : 'Clock ran out. Run it again when you’re ready.',6);
    run.rivals.forEach(car=>state.scene.remove(car.mesh));
    state.activity=null;
    state.gate.visible=false;
  }
}
