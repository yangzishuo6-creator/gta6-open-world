import {Group} from 'three';
import {spawnCar,faceCar} from '../vehicles/carModels.js';
import {isBlocked} from '../world/cityBuilder.js';
import {makePerson,stride} from '../actors/pedestrians.js';
import {box,lettering} from '../world/geometry.js';
import {addSirenReflection,muzzleBurst} from '../combat/streetEffects.js';

const tactics=['RAMMING','FLANKING','ROADBLOCK','FLANKING','RAMMING'];

export function addPatrol(state,i,x,z,heading=0) {
  const car=spawnCar(state.scene,'Port Patrol',i%2 ? 0x293d54 : 0x233450,x,z,heading,'patrol');
  const unit={id:'P-'+(12+i*7),tactic:tactics[i%tactics.length],car,cooldown:0};
  addSirenReflection(car);
  state.units.push(unit);
  return unit;
}

export function deployOfficer(state,unit,side) {
  const {car}=unit;
  const door=unit.door ?? new Group();
  if (!unit.door) {
    box(door,0xeee5d1,0,.73,.64,.14,.57,1.28);
    box(door,0x405968,0,1.16,.64,.105,.34,1.21);
    lettering(door,'PATROL','#243850','#eee5d1',.95,.25,side*.08,.74,.64,side*Math.PI/2);
    car.mesh.add(door);
    unit.door=door;
  }
  door.position.set(side*1.07,0,-.93);
  door.rotation.y=side*1.11;
  door.visible=true;
  car.mesh.updateMatrixWorld(true);
  const cover=car.mesh.localToWorld(door.position.clone().set(side*2.25,0,.18));
  unit.officer ??=makePerson(state.scene,cover.x,cover.z,0x25374f,2);
  unit.officer.mesh.position.copy(cover);
  unit.officer.mesh.visible=true;
  unit.tactic='FIRING';
  car.speed=0;
}

export function fireFromCover(state,unit) {
  const officer=unit.officer;
  const target=state.position();
  const p=officer.mesh.position;
  officer.heading=Math.atan2(p.x-target.x,p.z-target.z);
  stride(officer,0,0,true);
  officer.body.position.y=-.13;
  const origin=p.clone();
  origin.y=1.36;
  const end=target.clone().lerp(origin,.22);
  end.y=1.1;
  muzzleBurst(state,origin,end,0xffad73);
}

export function updateDispatch(state,dt) {
  const target=state.position();
  const wanted=state.stars ? Math.min(5,state.stars+1) : 0;
  while (state.units.length>wanted) {
    const unit=state.units.pop();
    state.scene.remove(unit.car.mesh);
    if (unit.officer) state.scene.remove(unit.officer.mesh);
  }
  if (state.units.length<wanted && !state.shot) {
    const i=state.units.length;
    const heading=state.car?.heading ?? state.hero.heading;
    const ahead=i===2 ? 46 : 0;
    const lane=Math.max(-208,Math.min(0,Math.round((target.x-Math.sin(heading)*ahead)/52)*52));
    const z=Math.max(-330,Math.min(275,target.z+(ahead ? -Math.cos(heading)*ahead : 39+i*12)));
    addPatrol(state,i,lane+(i%2 ? -5 : 4),z,ahead ? heading+Math.PI/2 : 0);
  }
  let closest=Infinity;
  for (let i=0;i<state.units.length;i++) {
    const unit=state.units[i];
    const car=unit.car;
    const pos=car.mesh.position;
    const gap=pos.distanceTo(target);
    closest=Math.min(closest,gap);
    if (!state.shot && !state.car && state.stars>=3 && gap<23 && !unit.officer?.mesh.visible) {
      unit.previousTactic=unit.tactic;
      deployOfficer(state,unit,1);
    }
    if (unit.officer?.mesh.visible) {
      if (!state.shot && (state.car || gap>33 || state.stars<3)) {
        unit.officer.mesh.visible=unit.door.visible=false;
        unit.tactic=unit.previousTactic;
      } else {
        unit.cooldown-=dt;
        if (!state.shot && unit.cooldown<=0) {
          fireFromCover(state,unit);
          unit.cooldown=1.65;
          if (gap<17) state.damagePlayer(3);
        }
        continue;
      }
    }
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
      if (!state.stars) state.stats.escapes++;
      state.heat=18;
    }
  }
}
