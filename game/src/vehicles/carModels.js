import * as T from 'three';
import {batchBoxes,box,material} from '../world/geometry.js';

const tire=new T.CylinderGeometry(.45,.45,.34,14);
const rim=new T.CylinderGeometry(.26,.26,.36,12);
const glass=0x294a5e;
export function makeVehicle(scene,paint,{police=false,sport=false}={}) {
  const model=new T.Group();
  const hull=new T.Group();
  model.add(hull);
  const w=sport?2.18:2.04;
  const length=sport?4.76:4.6;
  box(hull,0x1d2430,0,.52,0,w,.33,length);
  box(hull,paint,0,.82,0,w,.55,length-.16);
  box(hull,paint,0,1.04,1.4,w*.95,.25,1.47).rotation.x=.075;
  box(hull,paint,0,1,-1.63,w*.94,.30,1.18);
  box(hull,glass,0,1.26,-.09,w*.82,.43,1.96);
  const windscreen=box(hull,glass,0,1.29,.92,w*.82,.085,.72);
  windscreen.rotation.x=.58;
  box(hull,glass,0,1.26,-1.19,w*.80,.085,.83).rotation.x=-.45;
  box(hull,paint,0,1.53,-.11,w*.82,.10,1.43);
  for(const side of [-1,1]) {
    box(hull,paint,side*w*.415,1.29,-.17,.055,.39,.15);
    box(hull,paint,side*w*.54,1.11,.68,.31,.16,.29);
    box(hull,0x3f1421,side*w*.33,.93,-length/2+.065,.63,.21,.12);
    box(hull,0xff423d,side*w*.33,.945,-length/2-.003,.53,.09,.025);
    box(hull,0xffedc5,side*w*.32,.95,length/2-.18,.55,.15,.13);
    box(hull,0x111c2a,side*.69,.54,-length/2,.33,.12,.16);
    if(police) box(hull,0xe6e6db,side*w*.499,.89,0,.035,.45,1.9);
    for(const z of [-1.48,1.46]) for(const [geo,col] of [[tire,0x20242a],[rim,0xa6aaa7]]) {
      const wheel=new T.Mesh(geo,material(col));
      wheel.position.set(side*w*.48,.45,z);
      wheel.rotation.z=Math.PI/2;
      wheel.castShadow=true;
      hull.add(wheel);
    }
  }
  box(hull,0xffe7ba,0,.73,-length/2,.43,.18,.024);
  if(sport) {
    box(hull,0x252631,0,1.19,-2.02,w*1.03,.10,.41);
    for(const x of [-.62,.62]) box(hull,0x252631,x,1.07,-1.96,.09,.25,.15);
  }
  if(sport) {
    box(hull,0x242c36,0,.70,-length/2-.015,.73,.11,.023);
    for(const side of [-1,1]) {
      box(hull,0xff9c5d,side*w*.34,1.003,-length/2-.005,.58,.045,.03);
      box(hull,0x652d26,side*w*.46,.71,-length/2+.04,.21,.14,.12);
    }
  }
  const staticParts=batchBoxes(hull);
  const boxGeometry=hull.children[0].geometry;
  for(const part of [...hull.children])if(part.geometry===boxGeometry)hull.remove(part);
  hull.add(staticParts);
  const lights=[];
  if(police) {
    box(hull,0x263043,0,1.63,-.04,1.6,.11,.32);
    for(const [x,c] of [[-.46,0xff3448],[.46,0x389aff]]) {
      const lamp=box(hull,c,x,1.74,-.04,.7,.15,.29);
      lamp.material=lamp.material.clone();
      lamp.material.emissive.setHex(c);
      lights.push(lamp);
    }
    box(hull,0xd3dadb,0,.85,-2.31,1.16,.24,.025);
  }
  scene.add(model);
  return {model,hull,lights,x:0,z:0,heading:0,speed:0,damage:0,police,
    name:police?'Port Patrol':sport?'Vela GT':'Mistral LX'};
}
export function poseVehicle(car,t=0) {
  car.model.position.set(car.x,0,car.z);
  car.model.rotation.y=car.heading;
  car.lights.forEach((light,i)=>light.material.emissiveIntensity=Math.floor(t*8+i)%2?2.4:.35);
}
