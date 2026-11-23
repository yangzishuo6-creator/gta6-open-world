import {makeVehicle,poseVehicle} from './carModels.js';
import {canOccupy} from '../world/cityBuilder.js';

export function makeRaceRivals(scene) {
  return [0x4c8797,0xa56cad].map(color=>{
    const car=makeVehicle(scene,color,{sport:true});
    car.model.visible=false;
    return car;
  });
}
export function tickRaceRivals(rivals,activity,dt,time) {
  for(let i=0;i<rivals.length;i++){
    const car=rivals[i];
    const running=activity?.event.kind==='Street race';
    car.model.visible=running;
    if(!running){car.activity=null;continue;}
    const route=activity.event.route;
    if(car.activity!==activity){
      car.activity=activity;
      car.checkpoint=activity.index;
      car.x=(activity.event.x??3)+(i===0?-5:2.9);
      car.z=(activity.event.z??-48)-(i+1)*5;
      car.heading=0;
      car.speed=0;
    }
    if(car.checkpoint>=route.length){car.speed=0;continue;}
    const [x,z]=route[car.checkpoint];
    const distance=Math.hypot(x-car.x,z-car.z);
    if(distance<5){car.checkpoint++;continue;}
    const heading=Math.atan2(x-car.x,z-car.z);
    const offset=Math.atan2(Math.sin(heading-car.heading),Math.cos(heading-car.heading));
    car.heading+=Math.max(-2.2*dt,Math.min(2.2*dt,offset));
    const speed=Math.min(25+i*1.2,Math.max(6,distance*1.25))*(Math.abs(offset)>.4?.52:1);
    car.speed+=(speed-car.speed)*Math.min(1,dt*2.6);
    const nx=car.x+Math.sin(car.heading)*car.speed*dt,nz=car.z+Math.cos(car.heading)*car.speed*dt;
    if(canOccupy(nx,nz,.9)){car.x=nx;car.z=nz;}
    else {car.heading=heading;car.speed*=.4;}
    poseVehicle(car,time);
  }
}
export function racePosition(rivals,player,activity) {
  if(!activity||activity.event.kind!=='Street race')return null;
  const [x,z]=activity.event.route[activity.index];
  const distance=Math.hypot(x-player.x,z-player.z);
  const ahead=rivals.filter(car=>car.activity===activity&&(car.checkpoint>activity.index||
    (car.checkpoint===activity.index&&Math.hypot(x-car.x,z-car.z)<distance)));
  return 1+ahead.length;
}
