import * as T from 'three';
import {canOccupy} from '../world/cityBuilder.js';
export const inventory=[
  {name:'Fists',ammo:Infinity,delay:.36,reach:2.1,power:1},
  {name:'Pistol',ammo:48,delay:.28,reach:70,power:2},
  {name:'SMG',ammo:150,delay:.085,reach:53,power:1},
  {name:'Shotgun',ammo:24,delay:.65,reach:27,power:4}
];
export function makeWeapons(scene) {
  const line=new T.Line(new T.BufferGeometry().setFromPoints([new T.Vector3(),new T.Vector3()]),new T.LineBasicMaterial({color:0xffdc88}));
  line.frustumCulled=false;
  line.visible=false;
  scene.add(line);
  return {slots:inventory.map(slot=>({...slot})),slot:1,cooldown:0,flash:0,line};
}
export function aimWeapon(player,input,camera) {
  if(!input.active)return;
  const ray=new T.Raycaster();
  ray.setFromCamera(new T.Vector2(input.aimX,input.aimY),camera);
  const direction=ray.ray.direction;
  player.heading=Math.atan2(direction.x,direction.z);
}
export function updateWeapons(weapons,player,input,dispatch,dt,raiseWanted,play) {
  for(let i=0;i<4;i++)if(input.tap('Digit'+(i+1)))weapons.slot=i;
  weapons.cooldown-=dt;
  weapons.flash-=dt;
  weapons.line.visible=weapons.flash>0;
  const gun=weapons.slots[weapons.slot];
  if(player.vehicle||!input.mouseDown||weapons.cooldown>0||gun.ammo<=0)return;
  weapons.cooldown=gun.delay;
  gun.ammo--;
  play(weapons.slot?92:55,.13,'sawtooth');
  if(weapons.slot)raiseWanted(Math.max(2,dispatch.heat));
  const dx=Math.sin(player.heading),dz=Math.cos(player.heading);
  let reach=gun.reach;
  for(let n=.5;n<reach;n+=.65) {
    if(!canOccupy(player.x+dx*n,player.z+dz*n,0)){reach=n;break;}
  }
  let hit=null;
  for(const car of dispatch.units) {
    if(!car.active)continue;
    const x=car.x-player.x,z=car.z-player.z;
    const distance=x*dx+z*dz;
    if(distance>0&&distance<reach&&Math.abs(x*dz-z*dx)<1.55){
      reach=distance;
      hit=car;
    }
  }
  if(hit){
    hit.damage+=gun.power*14;
    if(hit.damage>=100){
      hit.active=false;
      hit.damage=0;
      hit.disabled=9;
      hit.model.visible=false;
      player.xp+=30;
      raiseWanted(dispatch.heat+1);
    }
  }
  if(weapons.slot) {
    const pos=weapons.line.geometry.attributes.position;
    pos.setXYZ(0,player.x,1.16,player.z);
    pos.setXYZ(1,player.x+dx*reach,1.05,player.z+dz*reach);
    pos.needsUpdate=true;
    weapons.flash=.075;
  }
}
