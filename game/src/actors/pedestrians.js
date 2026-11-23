import * as T from 'three';
import {box,material,seededRandom} from '../world/geometry.js';
import {canOccupy} from '../world/cityBuilder.js';

const head=new T.SphereGeometry(.17,9,7);
export function makePerson(scene,shirt=0xd55144,index=0) {
  const group=new T.Group();
  const skin=[0xc58b60,0x8e5338,0xedb78e,0xae6f52][index%4];
  const legs=[],arms=[];
  box(group,shirt,0,1.13,0,.46,.55,.27);
  box(group,0x242b3d,0,.85,0,.40,.15,.29);
  const face=new T.Mesh(head,material(skin));
  face.position.set(0,1.61,.01);
  group.add(face);
  box(group,0x302426,0,1.72,-.035,.29,.13,.24);
  for(const side of [-1,1]) {
    const leg=new T.Group();
    leg.position.set(side*.12,.84,0);
    box(leg,0x293949,0,-.31,0,.18,.68,.19);
    box(leg,0xf2e1c9,0,-.69,.045,.20,.16,.28);
    legs.push(leg);
    group.add(leg);
    const arm=new T.Group();
    arm.position.set(side*.30,1.37,0);
    box(arm,shirt,0,-.10,0,.16,.24,.18);
    box(arm,skin,0,-.32,0,.13,.30,.14);
    arms.push(arm);
    group.add(arm);
  }
  const weapon=box(group,0x222934,.27,1.15,.51,.12,.12,.48);
  weapon.visible=false;
  scene.add(group);
  return {group,legs,arms,weapon,x:0,z:0,heading:0};
}
export function posePerson(person,phase,moving,aim=false) {
  const swing=moving?Math.sin(phase)*.55:0;
  person.group.position.set(person.x,0,person.z);
  person.group.rotation.y=person.heading;
  person.legs.forEach((leg,i)=>leg.rotation.x=swing*(i?1:-1));
  person.arms.forEach((arm,i)=>arm.rotation.x=aim&&i===1?-1.28:swing*(i?-1:1));
  person.weapon.visible=aim;
}
export function spawnPedestrians(scene) {
  const rng=seededRandom(92);
  return Array.from({length:86},(_,i)=>{
    const person=makePerson(scene,[0xdca24e,0x529989,0xca5e55,0xeedec7,0x6d5790][i%5],i);
    const x=i<50?(i%3===0?-8.5:11+i%4):-56-(i%3)*48;
    return Object.assign(person,{x,z:i<15?-17+i*6:rng()*575-287,heading:i%2?0:Math.PI,pace:1+rng()*.9});
  });
}
export function updatePedestrians(pedestrians,player,time,dt,heat) {
  for(const person of pedestrians) {
    const distance=Math.hypot(player.x-person.x,player.z-person.z);
    person.group.visible=distance<118;
    if(!person.group.visible)continue;
    const pace=person.pace*(heat&&distance<15?1.9:1);
    person.z+=Math.cos(person.heading)*pace*dt;
    if(Math.abs(person.z)>290||!canOccupy(person.x,person.z))person.heading+=Math.PI;
    posePerson(person,time*pace*4,true);
  }
}
export function movePlayer(player,input,cameraHeading,dt) {
  const forward=Number(input.down('KeyW','ArrowUp'))-Number(input.down('KeyS','ArrowDown'));
  const side=Number(input.down('KeyD','ArrowRight'))-Number(input.down('KeyA','ArrowLeft'));
  const dx=Math.sin(cameraHeading)*forward-Math.cos(cameraHeading)*side;
  const dz=Math.cos(cameraHeading)*forward+Math.sin(cameraHeading)*side;
  const length=Math.hypot(dx,dz);
  if(!length)return false;
  const step=(input.down('ShiftLeft','Space')?8.5:4.6)*dt/length;
  if(canOccupy(player.x+dx*step,player.z))player.x+=dx*step;
  if(canOccupy(player.x,player.z+dz*step))player.z+=dz*step;
  return true;
}
