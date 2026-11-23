import {canOccupy} from '../world/cityBuilder.js';

export function driveVehicle(car,input,dt,vehicles,scriptThrottle=0) {
  const throttle=(input.down('KeyW','ArrowUp')?1:0)-(input.down('KeyS','ArrowDown')?1:0) || scriptThrottle;
  const steering=(input.down('KeyA','ArrowLeft')?1:0)-(input.down('KeyD','ArrowRight')?1:0);
  const brake=input.down('Space');
  car.speed=Math.max(-10,Math.min(car.name==='Vela GT'?43:35,car.speed+throttle*16*dt));
  car.speed*=Math.exp(-(brake?3.4:throttle?.13:.52)*dt);
  car.heading+=steering*Math.sign(car.speed)*Math.min(1,Math.abs(car.speed)*.19)*(brake?2.75:1.64)*dt;
  const x=car.x+Math.sin(car.heading)*car.speed*dt,z=car.z+Math.cos(car.heading)*car.speed*dt;
  const hit=vehicles.find(other=>other!==car&&Math.hypot(other.x-x,other.z-z)<2.45);
  if(!canOccupy(x,z,1.25)||hit) {
    if(Math.abs(car.speed)>3)car.damage=Math.min(100,car.damage+Math.abs(car.speed)*.32);
    if(hit)hit.speed*=.66;
    car.speed*=-.27;
  } else {
    car.x=x;
    car.z=z;
  }
}
export function switchVehicle(player,vehicles,raiseHeat) {
  if(player.vehicle) {
    const car=player.vehicle;
    const side=[1,-1].find(s=>canOccupy(car.x+Math.cos(car.heading)*s*2.1,car.z-Math.sin(car.heading)*s*2.1));
    if(!side)return false;
    player.x=car.x+Math.cos(car.heading)*side*2.1;
    player.z=car.z-Math.sin(car.heading)*side*2.1;
    player.heading=car.heading;
    car.speed=0;
    player.vehicle=null;
    return true;
  }
  const car=vehicles.reduce((best,v)=>Math.hypot(v.x-player.x,v.z-player.z)<Math.hypot(best.x-player.x,best.z-player.z)?v:best,{x:Infinity,z:Infinity});
  if(Math.hypot(car.x-player.x,car.z-player.z)>4.2||Math.abs(car.speed)>12)return false;
  player.vehicle=car;
  car.route=null;
  if(!car.owned) {
    car.owned=true;
    raiseHeat(1);
  }
  return true;
}
