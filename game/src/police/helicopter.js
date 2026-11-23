import * as T from 'three';
import {box} from '../world/geometry.js';

export function buildHelicopter(scene) {
  const body=new T.Group(), rotor=new T.Group();
  box(body,0x253746,0,0,0,1.92,1.34,3.35);
  box(body,0x4b7581,0,.16,1.38,1.73,.80,1.12).rotation.x=.21;
  box(body,0xdfdac4,0,-.38,.08,1.99,.22,3.45);
  box(body,0x263b4b,0,.08,-2.85,.49,.42,3.44);
  box(body,0x263b4b,0,.57,-4.36,.26,1.35,.50).rotation.x=-.22;
  for(const side of [-1,1]) {
    box(body,0x25313a,side*1.03,-.96,0,.12,.12,3.6);
    box(body,0x25313a,side*.78,-.63,.73,.12,.68,.12).rotation.z=side*.36;
    box(body,side===1?0xff5a45:0x78e5e3,side*1.03,.31,.09,.13,.14,.19);
  }
  box(body,0x3c4850,0,.89,0,.2,.52,.21);
  rotor.position.y=1.13;
  box(rotor,0x30373b,0,0,0,9.4,.055,.19);
  box(rotor,0x30373b,0,0,0,.19,.055,9.4);
  body.add(rotor);
  scene.add(body);
  const cone=new T.Mesh(new T.ConeGeometry(3.15,1,36,1,true),new T.ShaderMaterial({
    transparent:true,depthWrite:false,side:T.DoubleSide,
    vertexShader:`varying float h; void main(){h=position.y+.5;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader:`varying float h;void main(){gl_FragColor=vec4(1.,.91,.65,.20*pow(h,.65)+.045);}`
  }));
  cone.renderOrder=2;
  const lamp=new T.SpotLight(0xffe4aa,230,47,.26,.65,1.25);
  scene.add(lamp,lamp.target,cone);
  return {body,rotor,cone,lamp};
}
export function updateHelicopter(aircraft,player,heat,time,dt,shot) {
  const {body,rotor,cone,lamp}=aircraft;
  body.visible=cone.visible=lamp.visible=heat>=4;
  if(heat<4)return;
  const destination=new T.Vector3(player.x+(shot?-5:9+Math.sin(time*.55)*8),shot?8.6:14,player.z+(shot?20:-11+Math.cos(time*.55)*8));
  body.position.lerp(destination,shot?1:1-Math.exp(-dt*1.6));
  body.rotation.y=shot?.67:time*.58;
  rotor.rotation.y=time*24;
  const ground=new T.Vector3(player.x+(shot?2:0),.04,player.z+(shot?9:0));
  const source=body.position.clone().add(new T.Vector3(0,-.52,.9));
  const axis=source.clone().sub(ground);
  cone.position.copy(ground).addScaledVector(axis,.5);
  cone.scale.y=axis.length();
  cone.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),axis.normalize());
  lamp.position.copy(source);
  lamp.target.position.copy(ground);
}
