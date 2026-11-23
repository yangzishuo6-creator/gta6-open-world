import * as T from 'three';
import {box, material} from './geometry.js';

export function plantPalm(group,x,z,scale,turn) {
  const palm = new T.Group();
  palm.position.set(x,0,z);
  palm.scale.setScalar(scale);
  palm.rotation.y=turn;
  group.add(palm);
  for(let i=0;i<8;i++) {
    const trunk=box(palm,i%2?0x8b6049:0xaf8061,i*i*.016,.44+i*.77,0,.37-i*.021,.88,.42-i*.024);
    trunk.rotation.z=-i*.045;
  }
  for(let i=0;i<9;i++) {
    const leaf = new T.Group();
    leaf.position.set(.86,6.3,0);
    leaf.rotation.y=i*2.399;
    palm.add(leaf);
    const lift = i%2 ? .55 : .9;
    for(let j=0;j<6;j++) {
      const frond=box(leaf,[0x235e49,0x458c58,0x36764d][i%3],j*.57,Math.sin(j*.64)*lift,0,.69,.09,.58*Math.sin((j+1)*.42));
      frond.rotation.z=Math.cos(j*.64)*lift;
    }
  }
}
export function streetLamp(group,x,z,side) {
  box(group,0x243b47,x,2.65,z,.13,5.3,.13);
  box(group,0x243b47,x+side*.65,5.26,z,1.35,.13,.13);
  box(group,0xffe0a0,x+side*1.27,5.19,z,.56,.12,.27);
}
export function citySign(scene,label,x,y,z,width,color='#183942',rotation=0) {
  const canvas=document.createElement('canvas');
  canvas.width=512; canvas.height=96;
  const ctx=canvas.getContext('2d');
  ctx.fillStyle=color;ctx.fillRect(0,0,512,96);
  ctx.strokeStyle='#fff1d6';ctx.lineWidth=4;ctx.strokeRect(8,8,496,80);
  ctx.fillStyle='#fff1d6';ctx.font='bold 49px sans-serif';ctx.textAlign='center';
  ctx.fillText(label,256,65,460);
  const map=new T.CanvasTexture(canvas);
  map.colorSpace=T.SRGBColorSpace;
  const sign=new T.Mesh(new T.PlaneGeometry(width,width*96/512),new T.MeshBasicMaterial({map,side:T.DoubleSide}));
  sign.position.set(x,y,z);
  sign.rotation.y=rotation;
  scene.add(sign);
}
export function buildOcean(scene) {
  const sea=new T.Mesh(new T.PlaneGeometry(820,230), material(0x268d99));
  sea.rotation.x=-Math.PI/2;
  sea.position.set(243,-.36,0);
  scene.add(sea);
  const streaks = new T.Group();
  for(let i=0;i<460;i++) {
    const x=43+(i*71%242),z=(i*37%510)-255;
    box(streaks,i%3?0x64a9a9:0xe9c2a2,x,-.33,z,1+(i%13)*.35,.022,.10+(i%7)*.02);
  }
  return streaks;
}
