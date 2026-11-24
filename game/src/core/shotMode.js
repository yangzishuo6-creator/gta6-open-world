import {faceCar,spawnCar} from '../vehicles/carModels.js';
import {addPatrol,deployOfficer,fireFromCover} from '../police/dispatch.js';
import {makePerson} from '../actors/pedestrians.js';
import {fireWeapon} from '../combat/weapons.js';
import {addCarLampBloom} from '../combat/streetEffects.js';

export function readShot() {
  const name=new URLSearchParams(location.search).get('shot');
  return ['title','chase','foot','map','shop'].includes(name) ? name : null;
}

export function stageShot(state) {
  if (state.shot==='title') return 1.5;
  state.mode='play';
  state.cash=18450;
  state.xp=2075;
  state.armour=68;
  state.health=88;
  state.mission=2;
  state.stage=1;
  state.stats={earned:18150,stolen:12,escapes:7};
  state.owned=['Aster Veloce','Canopy Transit'];
  if (state.shot==='shop') {
    state.mode='pause';
    state.car=spawnCar(state.scene,'Aster Veloce',0xff6b16,-9,-67);
    state.car.damage=17;
    followMapShot(state);
    return 0;
  }
  if (state.shot==='map') {
    state.mode='pause';
    state.hero.mesh.position.set(-19,0,15);
    followMapShot(state);
    return 0;
  }
  if (state.shot==='foot') {
    state.hero.mesh.position.set(7.4,0,-28);
    state.hero.heading=.25;
    state.view.heading=.25;
    state.slot=3;
    state.ammo[3]=[24,96];
    state.stars=3;
    state.heat=18;
    deployOfficer(state,addPatrol(state,0,1.8,-39,2.52),-1);
    deployOfficer(state,addPatrol(state,1,-5.2,-48,3.6),1);
    const wreck=spawnCar(state.scene,'Canopy Transit',0xd7ab77,6.7,-49,-.86,'van');
    const curbCar=state.traffic.find(car=>car.parked && car.mesh.position.x>0 && car.mesh.position.z===-45);
    if (curbCar) curbCar.mesh.position.z=-92;
    wreck.parked=true;
    wreck.damage=100;
    state.traffic.push(wreck);
    for (let i=0;i<7;i++) {
      const person=makePerson(state.scene,13+i%3*2.8,-33-i*4.7,[0xe1a26f,0x66a297,0xc77b75][i%3],i+1);
      person.heading=i%2 ? 0 : Math.PI;
      state.people.push(person);
    }
    state.speak('Nia','Patrol blocked Bayfront. Get to the pier with the ledger.',12);
    return 2.1;
  }
  state.stage=2;
  state.car=spawnCar(state.scene,'Aster Veloce',0xff6b16,2.4,17,-.26);
  addCarLampBloom(state.car);
  state.hero.mesh.visible=false;
  state.car.speed=111/3.6;
  state.car.damage=17;
  state.stars=4;
  state.heat=107;
  addPatrol(state,0,7.1,22,-.24).car.speed=32;
  addPatrol(state,1,-3.8,20,.18).car.speed=33;
  addPatrol(state,2,-3.8,-53,Math.PI/2).car.speed=0;
  addPatrol(state,3,-49,-39,0);
  addPatrol(state,4,-52,40,0);
  const wreck=spawnCar(state.scene,'Breakwater Hauler',0x822e26,-5,-34,-.98,'van');
  wreck.parked=true;
  wreck.damage=100;
  state.traffic.push(wreck);
  state.crew.ivo=22;
  state.speak('Nia','You’ve got the archive key. Stay on Bayfront and lose that spotlight.',12);
  return 1.25;
}

function followMapShot(state) {
  state.view.camera.position.set(60,48,24);
  state.view.camera.lookAt(0,0,-80);
}

export function finishShot(state) {
  if (state.shot==='chase') {
    const p=state.position();
    state.traffic.filter(car=>Math.abs(car.mesh.position.x)<11 &&
      Math.abs(car.mesh.position.z-p.z)<12).forEach(car=>car.mesh.visible=false);
    const intercepts=[[5,.7,.43],[-4.6,1.25,-.19],[-4.4,-42,1.22]];
    intercepts.forEach(([x,z,heading],i)=>{
      const car=state.units[i].car;
      car.mesh.position.set(p.x+x,0,p.z+z);
      faceCar(car,heading);
    });
  }
  if (state.shot!=='foot') return;
  state.units.forEach(unit=>fireFromCover(state,unit));
  const target=state.units[0].officer.mesh.position.clone();
  target.y=1.13;
  fireWeapon(state,target);
  state.hitPoint=target;
  state.hitUntil=state.time+.18;
}
