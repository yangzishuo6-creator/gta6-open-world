import {spawnCar,faceCar} from '../vehicles/carModels.js';
import {isBlocked} from '../world/cityBuilder.js';

const tactics=['RAMMING','FLANKING','ROADBLOCK','FLANKING','RAMMING'];

export function addPatrol(state,i,x,z,heading=0) {
  const car=spawnCar(state.scene,'Port Patrol',i%2 ? 0x293d54 : 0x233450,x,z,heading,'patrol');
  const unit={id:'P-'+(12+i*7),tactic:tactics[i%tactics.length],car,cooldown:0};
  state.units.push(unit);
  return unit;
}

export function updateDispatch(state,dt) {
  const target=state.position();
  const wanted=state.stars ? Math.min(5,state.stars+1) : 0;
  while (state.units.length>wanted) state.scene.remove(state.units.pop().car.mesh);
  if (state.units.length<wanted && !state.shot) {
    const i=state.units.length;
    const lane=Math.max(-208,Math.min(0,Math.round(target.x/52)*52));
    const z=Math.max(-330,Math.min(275,target.z+(i===2 ? -70 : 39+i*12)));
    addPatrol(state,i,lane+(i%2 ? -5 : 4),z);
  }
  let closest=Infinity;
  for (let i=0;i<state.units.length;i++) {
    const unit=state.units[i];
    const car=unit.car;
    const pos=car.mesh.position;
    const gap=pos.distanceTo(target);
    closest=Math.min(closest,gap);
    const heading=state.car?.heading ?? state.hero.heading;
    const side=unit.tactic==='FLANKING' ? (i%2 ? -4.1 : 4.1) : 0;
    const lead=unit.tactic==='ROADBLOCK' ? 22 : side ? 5 : 0;
    const x=target.x-Math.sin(heading)*lead+Math.cos(heading)*side;
    const z=target.z-Math.cos(heading)*lead-Math.sin(heading)*side;
    const aim=Math.atan2(pos.x-x,pos.z-z);
    const delta=Math.atan2(Math.sin(aim-car.heading),Math.cos(aim-car.heading));
    const pace=state.shot==='chase' && i<2 ? state.car.speed-1.65 :
      unit.tactic==='ROADBLOCK' && Math.hypot(pos.x-x,pos.z-z)<5 ? 0 : Math.min(42,10+gap*1.35);
    car.speed+=(pace-car.speed)*dt*1.82;
    const steer=state.shot==='chase' && i<2 ? -car.heading : delta;
    faceCar(car,car.heading+Math.max(-2.4,Math.min(2.4,steer*3))*dt);
    const nx=pos.x-Math.sin(car.heading)*car.speed*dt;
    const nz=pos.z-Math.cos(car.heading)*car.speed*dt;
    if (!isBlocked(state.lots,nx,nz,1)) {
      pos.x=nx;
      pos.z=nz;
    } else {
      faceCar(car,car.heading+2*dt);
      car.speed*=.9;
    }
    car.lights.forEach((lamp,n)=>lamp.scale.y=.21*(1+.25*Math.sin(state.time*20+n*Math.PI)));
    unit.cooldown-=dt;
    if (!state.shot && gap<2.6 && unit.cooldown<=0) {
      unit.cooldown=1.15;
      if (state.car) {
        state.car.damage=Math.min(100,state.car.damage+7+state.stars);
        state.car.speed*=.78;
      } else state.damagePlayer(8+state.stars*2);
      state.audio.effect(75,.18,'sawtooth');
    }
  }
  if (state.stars && !state.shot) {
    state.heat-=dt*(closest>45 ? 1 : .18);
    if (state.heat<=0) {
      state.stars--;
      state.heat=18;
    }
  }
}
