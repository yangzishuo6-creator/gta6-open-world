import {avenues,crossStreets} from '../world/cityBuilder.js';
import {faceCar,spawnCar} from './carModels.js';

const fleet = [
  ['Lumen S4',0xe5aa5f,'coupe'],['Maris 86',0x74a9a3,'coupe'],
  ['Canopy Transit',0xe4d9c4,'van'],['Cinder GT',0xad5145,'coupe'],
  ['Sora LX',0x667d9b,'coupe'],['Aster Veloce',0xe88a37,'coupe'],
];

export function populateTraffic(scene) {
  const cars=[];
  for (let i=0;i<42;i++) {
    const [name,color,type]=fleet[i%fleet.length];
    const heading=i%2 ? 0 : Math.PI;
    const avenue=avenues[i<18 ? 0 : 1+(i%4)];
    const lane=avenue+(i%2 ? 3.1 : -3.1);
    const car=spawnCar(scene,name,color,lane,267-(i*39)%598,heading,type);
    car.route={axis:'z',lane,heading,pace:9+i%6};
    cars.push(car);
  }
  for (let i=0;i<8;i++) {
    const [name,color,type]=fleet[i%fleet.length];
    const heading=i%2 ? Math.PI/2 : -Math.PI/2;
    const lane=crossStreets[i+1]+(i%2 ? -3 : 3);
    const car=spawnCar(scene,name,color,-25-i*20,lane,heading,type);
    car.route={axis:'x',lane,heading,pace:9+i%4};
    cars.push(car);
  }
  for (let i=0;i<12;i++) {
    const [name,color,type]=fleet[(i+5)%fleet.length];
    const car=spawnCar(scene,name,color,i<6 ? 7.7 : -7.7,42-i*29,i<6 ? 0 : Math.PI,type);
    car.parked=true;
    cars.push(car);
  }
  return cars;
}

export function updateTraffic(state,dt) {
  for (const car of state.traffic) {
    if (car===state.car || car.parked || !car.route) continue;
    const {axis,heading,lane,pace}=car.route;
    const pos=car.mesh.position;
    const across=axis==='x' ? 'z' : 'x';
    faceCar(car,heading);
    pos[across]=lane;
    const dir=axis==='z' ? -Math.cos(heading) : -Math.sin(heading);
    const blocked=state.traffic.some(other=>other!==car &&
      Math.abs(other.mesh.position[across]-lane)<1.7 &&
      (other.mesh.position[axis]-pos[axis])*dir>0 &&
      (other.mesh.position[axis]-pos[axis])*dir<6);
    car.speed += ((blocked ? 0 : pace)-car.speed)*Math.min(1,dt*2.5);
    pos[axis]+=dir*car.speed*dt;
    if (axis==='z' && pos.z<-342) pos.z=282;
    if (axis==='z' && pos.z>284) pos.z=-337;
    if (axis==='x' && pos.x<-207) pos.x=-12;
    if (axis==='x' && pos.x>-11) pos.x=-206;
  }
}
