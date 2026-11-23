import * as T from 'three';
import {muzzleBurst} from './streetEffects.js';

export const loadout=[
  {name:'Sidearm',pace:.30,range:58,pitch:145},
  {name:'Compact',pace:.10,range:43,pitch:188},
  {name:'Scatter',pace:.62,range:25,pitch:89},
  {name:'Carbine',pace:.15,range:89,pitch:121},
];

export function refillAmmo() {
  return [[12,48],[24,96],[6,24],[30,120]];
}

export function fireWeapon(state,end) {
  const arm=state.hero.gun;
  arm.updateWorldMatrix(true,false);
  muzzleBurst(state,arm.localToWorld(new T.Vector3(0,-.58,0)),end);
}

export function updateWeapons(state,dt) {
  for (let i=0;i<loadout.length;i++) {
    if (state.input.tap('Digit'+(i+1))) state.slot=i;
  }
  state.shotCooldown-=dt;
  if (state.car) return;
  const ammo=state.ammo[state.slot];
  const capacity=refillAmmo()[state.slot][0];
  if (state.input.tap('KeyR')) {
    const count=Math.min(capacity-ammo[0],ammo[1]);
    if (count>0) {
      ammo[0]+=count;
      ammo[1]-=count;
      state.shotCooldown=.45;
      state.audio.effect(315,.08,'triangle');
    }
  }
  if (!ammo[0] || !state.input.mouse.left || state.shotCooldown>0) return;
  ammo[0]--;
  const tool=loadout[state.slot];
  state.shotCooldown=tool.pace;
  state.alert(state.stars ? Math.min(5,state.stars+1) : 2,2);
  state.audio.effect(tool.pitch,.13,'square');
  const direction=new T.Vector3();
  const mouse=state.input.mouse;
  const point=document.pointerLockElement ? new T.Vector2() : new T.Vector2(
    mouse.x/innerWidth*2-1,1-mouse.y/innerHeight*2);
  const aim=new T.Raycaster();
  aim.setFromCamera(point,state.view.camera);
  direction.copy(aim.ray.direction);
  const origin=state.hero.mesh.position.clone().add(new T.Vector3(0,1.43,0));
  const end=origin.clone().addScaledVector(direction,tool.range);
  const hit=state.people.find(person=>{
    const world=person.mesh.position.clone().add(new T.Vector3(0,1,0));
    return world.distanceTo(origin)<tool.range && aim.ray.distanceToPoint(world)<.73;
  });
  if (hit) {
    hit.down=5;
    end.copy(hit.mesh.position).y=1;
    state.hitUntil=state.time+.18;
  }
  const car=state.traffic.find(car=>car.mesh.position.distanceTo(origin)<end.distanceTo(origin) &&
    aim.ray.distanceToPoint(car.mesh.position.clone().add(new T.Vector3(0,.75,0)))<1.3);
  if (car) {
    car.damage=Math.min(100,car.damage+15);
    if (car.damage>=88) car.parked=true;
    end.copy(car.mesh.position).y=.8;
    state.hitUntil=state.time+.18;
  }
  fireWeapon(state,end);
}
