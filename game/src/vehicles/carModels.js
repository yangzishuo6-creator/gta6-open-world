import * as T from 'three';
import {box, lettering, paint} from '../world/geometry.js';

const tire = new T.CylinderGeometry(.39,.39,.28,14);
const rim = new T.CylinderGeometry(.23,.23,.29,12);
const shadow = new T.CircleGeometry(1,24);

function chassis(parent, color, y, length, lower, upper, height) {
  const shape = new T.Shape();
  shape.moveTo(-lower,-length+.26);
  shape.lineTo(-lower+.22,-length);
  shape.lineTo(lower-.22,-length);
  shape.lineTo(lower,-length+.26);
  shape.lineTo(upper,length-.25);
  shape.lineTo(upper-.19,length);
  shape.lineTo(-upper+.19,length);
  shape.lineTo(-upper,length-.25);
  shape.closePath();
  const geometry = new T.ExtrudeGeometry(shape,{depth:height,bevelEnabled:true,bevelThickness:.105,bevelSize:.09,bevelSegments:1});
  const mesh = new T.Mesh(geometry,paint(color));
  mesh.rotation.x = -Math.PI/2;
  mesh.position.y = y;
  mesh.castShadow=true;
  mesh.receiveShadow=true;
  parent.add(mesh);
}

export function spawnCar(scene, name, color, x, z, heading=0, type='coupe') {
  const mesh = new T.Group();
  const patrol = type==='patrol';
  const van = type==='van';
  const width = patrol ? 1.08 : 1;
  const length = van ? 2.38 : 2.19;
  const cabin = van ? 1.71 : patrol ? 1.45 : 1.22;
  const contact = new T.Mesh(shadow,new T.MeshBasicMaterial({color:0x282732,transparent:true,opacity:.32,depthWrite:false}));
  contact.rotation.x = -Math.PI/2;
  contact.position.y = .029;
  contact.scale.set(1.32,2.56,1);
  mesh.add(contact);
  chassis(mesh,0x252c37,.32,length+.03,width,width,.21);
  chassis(mesh,color,.55,length,width,width*.99,.31);
  chassis(mesh,color,.87,length-.18,width*.94,width*.91,.09);
  const glass = box(mesh,0x304a55,0,(cabin+.92)/2,-.16,1.69,cabin-.9,2.07);
  glass.rotation.x = van ? 0 : -.08;
  box(mesh,patrol ? 0xe4e9df : color,0,cabin,-.32,1.61,.12,van ? 2.03 : 1.48);
  box(mesh,color,0,1.01,.93,1.82,.12,.35);
  for (const side of [-1,1]) {
    box(mesh,color,side*.85,1.1,-.18,.1,.44,.1).rotation.z = side*.3;
    box(mesh,color,side*.86,1.0,.54,.46,.13,.27);
    box(mesh,0xfaf1bc,side*.75,.71,-length,.4,.18,.065);
    const tail=box(mesh,0xff484b,side*.71,.74,length+.115,.54,.19,.071);
    tail.material=new T.MeshStandardMaterial({color:0xff4038,emissive:0xc80c10,emissiveIntensity:.46});
    box(mesh,0xffa897,side*.71,.78,length+.161,.39,.035,.03);
    for (const axle of [-1.35,1.36]) {
      const wheel = new T.Mesh(tire,paint(0x202027));
      const hub = new T.Mesh(rim,paint(0xa6b2b0));
      for (const part of [wheel,hub]) {
        part.rotation.z = Math.PI/2;
        part.position.set(side*width,.41,axle);
        mesh.add(part);
      }
    }
    if (patrol) box(mesh,0xe8e9dc,side*(width+.1),.73,-.22,.08,.49,1.92);
  }
  box(mesh,0x242935,0,.54,length+.12,1.86,.14,.08);
  box(mesh,0xffeacf,0,.67,length+.16,.39,.17,.034);
  if (name==='Aster Veloce') {
    box(mesh,0x212c38,0,1.045,1.72,1.96,.09,.24);
    box(mesh,0x282f39,0,.57,length+.171,.94,.12,.04);
    box(mesh,0x343944,0,.95,1.3,1.26,.055,.27);
    box(mesh,0x202630,0,.93,1.89,1.04,.07,.2);
  }
  const lights = [];
  if (patrol) {
    box(mesh,0x293845,0,cabin+.115,-.25,1.48,.14,.35);
    for (const [side,tint] of [[-1,0x247eff],[1,0xff3545]]) {
      const panel = box(mesh,tint,side*.43,cabin+.23,-.25,.64,.21,.32);
      panel.material = new T.MeshBasicMaterial({color:tint,toneMapped:false});
      lights.push(panel);
    }
    lettering(mesh,'PORT PATROL','#253847','#f3ebd1',1.65,.33,0,.98,1.49).rotation.x = -Math.PI/2;
    lettering(mesh,'PATROL','#ffead6','#23415a',1.34,.24,0,.91,length+.08);
    lettering(mesh,'PORT PATROL','#293c50','#eee5d0',1.44,.30,width+.155,.73,-.22,Math.PI/2);
    lettering(mesh,'PORT PATROL','#293c50','#eee5d0',1.44,.30,-width-.155,.73,-.22,-Math.PI/2);
  }
  mesh.position.set(x,0,z);
  mesh.rotation.y = heading;
  scene.add(mesh);
  return {mesh,name,type,heading,speed:0,damage:0,lights,parked:false};
}

export function faceCar(car,heading) {
  car.heading = heading;
  car.mesh.rotation.y = heading;
}
