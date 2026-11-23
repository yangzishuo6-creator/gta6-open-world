import {makeVehicle,poseVehicle} from './carModels.js';
import {roadXs,roadZs} from '../world/cityBuilder.js';
import {seededRandom} from '../world/geometry.js';

const colors=[0x47a5ae,0xdfbd82,0xc8644d,0x344a6d,0xece3cc,0x91a36f,0xa45471];
export function spawnTraffic(scene) {
  const rng=seededRandom(821);
  const cars=[];
  for(let i=0;i<69;i++) {
    const vertical=i<49;
    const axis=vertical?roadXs[i<16?4:i%4]:roadZs[(i*3)%roadZs.length];
    const direction=i%2?1:-1;
    const car=makeVehicle(scene,colors[i%colors.length],{sport:i%7===0});
    const offset=vertical?(i<16?-270+i*35:-288+rng()*580):-204+rng()*201;
    const lane=axis+direction*(i%3===0?5.4:2);
    Object.assign(car,{x:vertical?lane:offset,z:vertical?offset:lane,
      heading:vertical?(direction===1?0:Math.PI):direction*Math.PI/2,
      route:{vertical,direction,cruise:8+rng()*7}});
    cars.push(car);
  }
  return cars;
}
export function updateTraffic(cars,driver,dt,time,viewer) {
  for(const car of cars) {
    car.model.visible=Math.hypot(car.x-viewer.x,car.z-viewer.z)<180;
    if(car===driver||!car.route) {if(car.model.visible)poseVehicle(car,time);continue;}
    const {vertical,direction,cruise}=car.route;
    const coordinate=vertical?'z':'x';
    const cross=vertical?'x':'z';
    const gap=cars.some(other=>other!==car&&Math.abs(other[cross]-car[cross])<1.6&&
      (other[coordinate]-car[coordinate])*direction>0&&(other[coordinate]-car[coordinate])*direction<8);
    car.speed+=( (gap?0:cruise)-car.speed)*Math.min(1,dt*3);
    car[coordinate]+=direction*car.speed*dt;
    const lo=vertical?-293:-208,hi=vertical?293:4;
    if(car[coordinate]>hi)car[coordinate]=lo;
    if(car[coordinate]<lo)car[coordinate]=hi;
    if(car.model.visible)poseVehicle(car,time);
  }
}
