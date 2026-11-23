import {faceCar} from './carModels.js';
import {isBlocked} from '../world/cityBuilder.js';

export function driveCar(state,input,dt) {
  const car = state.car;
  const throttle = input.axis('KeyW','KeyS');
  const turn = input.axis('KeyA','KeyD');
  const brake = input.down('Space');
  const race=state.activity?.kind==='race' ? state.activity : null;
  const boost=Boolean(race && race.nitro>0 && throttle>0 && input.down('ShiftLeft'));
  if (race) {
    race.boosting=boost;
    if (boost) race.nitro=Math.max(0,race.nitro-dt*24);
  }
  const limit = (car.type==='van' ? 29 : 44) * (1-car.damage*.0045)+(boost ? 12 : 0);
  car.speed += throttle * (boost ? 29 : throttle>0 ? 14 : 19)*dt;
  car.speed *= Math.exp(-dt*(brake ? 3.5 : throttle ? .19 : .74));
  car.speed = Math.max(-9,Math.min(limit,car.speed));
  const steering = Math.min(1,Math.abs(car.speed)/7) * (brake ? 2.32 : 1.48);
  faceCar(car,car.heading+turn*steering*Math.sign(car.speed)*dt);
  const pos = car.mesh.position;
  const x = pos.x-Math.sin(car.heading)*car.speed*dt;
  const z = pos.z-Math.cos(car.heading)*car.speed*dt;
  const hit = [...state.traffic,...state.units.map(unit=>unit.car)].find(
    other=>other!==car && other.mesh.position.distanceTo({x,y:0,z})<2.22);
  if (hit || isBlocked(state.lots,x,z,1.1)) {
    if (Math.abs(car.speed)>3) {
      car.damage = Math.min(100,car.damage+Math.abs(car.speed)*.34);
      state.audio.effect(61,.17,'sawtooth');
      if (car.speed>14 && hit) state.alert(1);
    }
    car.speed *= -.27;
  } else {
    pos.x=x;
    pos.z=z;
  }
  car.mesh.rotation.z = -turn*Math.min(.065,Math.abs(car.speed)*.002);
  if (car.damage>=100) {
    state.exitCar();
    state.damagePlayer(24);
  }
}

export function nearestRide(state) {
  let best;
  let distance=4.9;
  for (const car of state.traffic) {
    const gap=car.mesh.position.distanceTo(state.hero.mesh.position);
    if (gap<distance && car.damage<100) {
      best=car;
      distance=gap;
    }
  }
  return best;
}
