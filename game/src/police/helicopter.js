import * as T from 'three';
import {box,paint} from '../world/geometry.js';

export function buildHelicopter(scene) {
  const root=new T.Group();
  const body=new T.Group();
  const shell=new T.Mesh(new T.SphereGeometry(1,14,10),paint(0x31495c));
  shell.scale.set(1.16,1,2.12);
  body.add(shell);
  const glass=new T.Mesh(new T.SphereGeometry(1,14,8),paint(0x6e9ba4));
  glass.position.set(0,.19,-1.16);
  glass.scale.set(1.04,.76,1.21);
  body.add(glass);
  box(body,0x385d68,0,.17,3.07,.33,.42,4.8).rotation.x=.1;
  box(body,0x40556b,0,.79,5.27,.17,1.39,.74).rotation.x=.29;
  box(body,0xdac8aa,0,.19,3.9,2.19,.12,.39);
  for (const side of [-1,1]) {
    box(body,0x252c37,side*.91,-1.15,0,.12,.12,3.32);
    box(body,0xd7c8b0,side*.81,-.76,-.72,.12,.72,.12).rotation.z=side*.42;
    box(body,0xd7c8b0,side*.81,-.76,.72,.12,.72,.12).rotation.z=side*.42;
  }
  const rotor=new T.Group();
  rotor.position.y=1.4;
  box(rotor,0x323340,0,0,0,9.4,.05,.19);
  box(rotor,0x323340,0,0,0,.19,.05,9.4);
  box(body,0x282c34,0,1.1,0,.25,.6,.25);
  body.add(rotor);
  root.add(body);
  const ray=new T.Mesh(new T.ConeGeometry(2.8,1,36,1,true),new T.ShaderMaterial({
    transparent:true,side:T.DoubleSide,depthWrite:false,blending:T.AdditiveBlending,
    vertexShader:`varying float y; void main(){y=position.y+.5;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader:`varying float y; void main(){gl_FragColor=vec4(.71,.86,1.,.07+.19*y*y);}`,
  }));
  const pool=new T.Mesh(new T.CircleGeometry(2.8,36),new T.MeshBasicMaterial({
    color:0xffe6a1,opacity:.15,transparent:true,depthWrite:false,blending:T.AdditiveBlending,
  }));
  pool.rotation.x=-Math.PI/2;
  const lamp=new T.Mesh(new T.SphereGeometry(.24,10,6),new T.MeshBasicMaterial({color:0xffecb2}));
  lamp.position.set(0,-.91,-1.22);
  body.add(lamp);
  scene.add(root,ray,pool);
  return {root,body,rotor,ray,pool};
}

export function flyHelicopter(state,dt) {
  const {root,body,rotor,ray,pool}=state.heli;
  root.visible=ray.visible=pool.visible=state.stars>=4;
  if (!root.visible) return;
  const p=state.position();
  const shot=state.shot==='chase';
  root.position.set(p.x+(shot ? 5 : 13*Math.sin(state.time*.47)),shot ? 8.6 : 24,p.z-(shot ? 17 : 19));
  body.rotation.set(.095,shot ? -1.21 : -.45+Math.sin(state.time*.6)*.18,-.11);
  rotor.rotation.y+=dt*29;
  pool.position.set(p.x,.15,p.z);
  root.updateMatrixWorld(true);
  const top=body.localToWorld(new T.Vector3(0,-.91,-1.22));
  ray.position.copy(top).lerp(pool.position,.5);
  const direction=top.sub(pool.position);
  ray.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),direction.clone().normalize());
  ray.scale.y=direction.length();
}
