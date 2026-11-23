import * as T from 'three';
import {box, noise, paint} from './geometry.js';

const trunk = new T.CylinderGeometry(.16,.28,1,7);
const leaf = new T.BufferGeometry();
leaf.setAttribute('position',new T.Float32BufferAttribute([
  0,0,0, 1.1,.47,.26, 1.2,.69,0,
  0,0,0, 1.2,.69,0, 1.1,.47,-.26,
  1.1,.47,.26, 2.1,.32,.31, 1.2,.69,0,
  1.2,.69,0, 2.1,.32,-.31, 1.1,.47,-.26,
  1.2,.69,0, 2.1,.32,.31, 3.15,-.26,0,
  2.1,.32,-.31, 1.2,.69,0, 3.15,-.26,0,
],3));
leaf.computeVertexNormals();
const fronds = [0x397c55,0x59864b,0x1f6550,0x86a155].map(color =>
  new T.MeshStandardMaterial({color,side:T.DoubleSide,roughness:1}));

export function plantPalm(scene, x, z, seed) {
  const group = new T.Group();
  group.position.set(x,.12,z);
  scene.add(group);
  const h = 5.6 + noise(seed)*3.5;
  const lean = .7 + noise(seed+6);
  for (let i=0;i<5;i++) {
    const part = new T.Mesh(trunk,paint(i%2 ? 0xa78964 : 0x8a715c));
    part.position.set(lean*(i/5)**2,h*(i+.5)/5,0);
    part.scale.y = h/5+.08;
    part.rotation.z = -.085*i;
    part.castShadow = true;
    group.add(part);
  }
  for (let i=0;i<10;i++) {
    const frond = new T.Mesh(leaf,fronds[i%4]);
    frond.position.set(lean,h,0);
    frond.rotation.y = i*2.4 + seed;
    frond.rotation.z = noise(seed+i)*.62-.27;
    frond.scale.setScalar(.8+noise(seed-i)*.56);
    frond.castShadow = true;
    group.add(frond);
  }
}

export function umbrella(scene, x, z, color) {
  box(scene,0xf3e4c9,x,1.25,z,.07,2.5,.07);
  const top = new T.ConeGeometry(1.7,.54,12);
  const colors = [paint(color),paint(0xffe9c7)];
  top.clearGroups();
  for (let i=0;i<12;i++) top.addGroup(i*3,3,i%2);
  top.addGroup(36,36,0);
  const mesh = new T.Mesh(top,colors);
  mesh.position.set(x,2.5,z);
  mesh.castShadow = true;
  scene.add(mesh);
  box(scene,0xf0d8aa,x+.6,.12,z+1.2,1.4,.18,.56).rotation.y = -.25;
}

export function streetLamp(add, x, z, side) {
  add(0x435558,x,2.65,z,.12,5.1,.12);
  add(0x435558,x+side*.85,5.15,z,1.8,.11,.11);
  add(0xffe1a3,x+side*1.65,5.08,z,.6,.13,.32);
}
