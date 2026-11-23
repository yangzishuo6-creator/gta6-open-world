import * as T from 'three';
import {box,paint,noise} from '../world/geometry.js';
import {isBlocked} from '../world/cityBuilder.js';

const headShape=new T.IcosahedronGeometry(.245,1);
const disc=new T.CircleGeometry(.63,18);
const skin=[0xbb785c,0x8a4d3d,0xe4ad83,0x704839];
const outfits=[0x378e84,0xe69070,0xf0ce78,0x6a7895,0xe3d7af,0x9b596a];

export function makePerson(scene,x,z,jacket=0x3f7775,seed=0) {
  const mesh=new T.Group();
  const shade=new T.Mesh(disc,new T.MeshBasicMaterial({color:0x3d3841,opacity:.23,transparent:true,depthWrite:false}));
  shade.rotation.x=-Math.PI/2;
  shade.position.y=.021;
  shade.scale.set(1,.53,1);
  mesh.add(shade);
  const body=new T.Group();
  body.position.y=.12;
  mesh.add(body);
  const tone=skin[seed%skin.length];
  const head=new T.Mesh(headShape,paint(tone));
  head.position.set(0,1.72,-.02);
  body.add(head);
  const hair=new T.Mesh(headShape,paint(0x302833));
  hair.position.set(0,1.84,.045);
  hair.scale.set(1,.73,.91);
  body.add(hair);
  box(body,jacket,0,1.19,0,.59,.68,.36);
  box(body,0xddc2a1,0,1.37,.185,.17,.12,.035);
  box(body,0x343a49,0,.86,0,.51,.19,.33);
  const legs=[];
  const arms=[];
  for (const side of [-1,1]) {
    const leg=new T.Group();
    leg.position.set(side*.145,.87,0);
    box(leg,0x343a49,0,-.37,0,.23,.72,.24);
    box(leg,0xe2dbbe,0,-.76,-.052,.245,.14,.35);
    body.add(leg);
    legs.push(leg);
    const arm=new T.Group();
    arm.position.set(side*.34,1.46,0);
    box(arm,jacket,0,-.13,0,.183,.29,.21);
    box(arm,tone,0,-.39,-.015,.142,.28,.16);
    body.add(arm);
    arms.push(arm);
  }
  const gun=new T.Group();
  gun.position.set(.06,-.49,-.13);
  arms[1].add(gun);
  box(gun,0x243039,0,-.20,0,.16,.54,.20);
  box(gun,0x515c61,0,-.45,-.007,.10,.23,.10);
  box(gun,0x27323c,0,-.16,.16,.13,.15,.23).rotation.x=.15;
  gun.visible=false;
  mesh.position.set(x,0,z);
  scene.add(mesh);
  return {mesh,body,arms,legs,gun,heading:0,phase:0,down:0};
}

export function stride(person,speed,dt,aim=false) {
  person.phase+=dt*(3+speed*1.45);
  const swing=Math.sin(person.phase)*Math.min(.67,speed*.13);
  person.legs[0].rotation.x=swing;
  person.legs[1].rotation.x=-swing;
  person.arms[0].rotation.x=aim ? 1.26 : -swing*.67;
  person.arms[1].rotation.x=aim ? 1.69 : swing*.67;
  person.arms[1].rotation.z=aim ? .18 : 0;
  person.gun.visible=aim;
  person.mesh.rotation.y=person.heading;
  person.body.position.y=.11+Math.abs(swing)*.09;
}

export function populateWalkers(scene) {
  const people=[];
  for (let i=0;i<46;i++) {
    const x=i%4===0 ? -13.5 : 13+noise(i)*7;
    const person=makePerson(scene,x,249-(i*19.71)%568,outfits[i%outfits.length],i);
    person.heading=i%2 ? 0 : Math.PI;
    people.push(person);
  }
  return people;
}

export function urbanWalk(state,dt) {
  for (const person of state.people) {
    if (person.down>0) {
      person.down-=dt;
      person.body.rotation.z=1.55;
      continue;
    }
    person.body.rotation.z=0;
    const pace=state.stars && person.mesh.position.distanceTo(state.position())<22 ? 3.8 : 1.23;
    person.mesh.position.z-=Math.cos(person.heading)*pace*dt;
    if (Math.abs(person.mesh.position.z)>325) person.heading=person.heading ? 0 : Math.PI;
    stride(person,pace,dt);
  }
}

export function walkPlayer(state,input,dt) {
  const person=state.hero;
  const forward=input.axis('KeyW','KeyS');
  const lateral=input.axis('KeyD','KeyA');
  const pace=input.down('ShiftLeft') ? 11 : 6;
  const cameraAngle=state.view.heading;
  const scale=pace*dt/Math.max(1,Math.hypot(forward,lateral));
  const dx=(-Math.sin(cameraAngle)*forward+Math.cos(cameraAngle)*lateral)*scale;
  const dz=(-Math.cos(cameraAngle)*forward-Math.sin(cameraAngle)*lateral)*scale;
  const pos=person.mesh.position;
  if (!isBlocked(state.lots,pos.x+dx,pos.z)) pos.x+=dx;
  if (!isBlocked(state.lots,pos.x,pos.z+dz)) pos.z+=dz;
  const aim=input.mouse.right || input.mouse.left || state.shot==='foot';
  person.heading=cameraAngle;
  stride(person,Math.hypot(dx,dz)/dt,dt,aim);
}
