import * as T from 'three';
import {box, batchBoxes, seededRandom} from './geometry.js';
import {plantPalm, streetLamp, citySign, buildOcean} from './props.js';

export const roadXs=[-192,-144,-96,-48,0];
export const roadZs=Array.from({length:13},(_,i)=>(i-6)*48);
const blocks=[];
const facades=[0xd6a47e,0xf4d2a8,0x8bacaa,0xf0baaa,0xf0e1bb,0xb38c78];

function buildHotel(group,x,z,w,d,h,index) {
  blocks.push({x,z,w,d});
  const color=facades[index%facades.length];
  box(group,color,x,h/2,z,w,h,d);
  box(group,0xffe3b0,x,h-.08,z,w+.6,.55,d+.6);
  box(group,color,x,h+.45,z,w*.52,.8,d*.62);
  box(group,0x5d6664,x,1.35,z-d/2-.03,w*.92,2.45,.13);
  box(group,index%2?0x2e8584:0xbd4e43,x,2.66,z-d/2-.65,w*.95,.22,1.55).rotation.x=-.13;
  for(let floor=0;floor<Math.floor((h-1.2)/2.55);floor++) {
    const y=3.65+floor*2.55;
    for(let j=0;j<Math.floor((w-1)/2.6);j++) {
      const cx=x-w/2+1.7+j*2.6;
      for(const side of [-1,1]) {
        box(group,0xf4dcc1,cx,y,z+side*d/2,1.73,1.54,.18);
        box(group,(index+j+floor)%5===0?0xb98b5e:0x385e69,cx,y+.05,z+side*(d/2+.11),1.44,1.2,.10);
        box(group,0x789393,cx,y+.06,z+side*(d/2+.17),.08,1.18,.025);
      }
    }
    for(let j=0;j<Math.floor((d-1)/2.7);j++) {
      const cz=z-d/2+1.6+j*2.7;
      box(group,0xf0d0aa,x+w/2,y,cz,.22,1.5,1.67);
      box(group,0x527980,x+w/2+.14,y+.04,cz,.10,1.15,1.32);
      if(index%3===0) {
        box(group,0xd4ad8c,x+w/2+.57,y-.67,cz,1.23,.21,1.82);
        box(group,0x5d776f,x+w/2+1.1,y-.35,cz,.06,.47,1.82);
      }
    }
  }
}

export function buildCity(scene) {
  const g=new T.Group();
  const random=seededRandom(1567);
  box(g,0xa49b7d,-101,-.31,0,244,.5,626);
  box(g,0xefc28b,27,-.22,0,37,.33,646);
  box(g,0xdcc1a2,13,.03,0,9,.13,620);
  box(g,0xe6dbbb,17.5,.19,0,.26,.48,620);
  for(let z=-297;z<300;z+=9) {
    box(g,0xb16c59,8.30,.047,z,1.30,.18,8.93);
    box(g,0xf9e4b8,7.62,.084,z,.22,.27,8.94);
    box(g,0xefdbc0,10.31,.116,z,.09,.025,8.95);
    box(g,0xc19b7a,16.96,.122,z,1.1,.026,8.93);
    if(z%2===1) {
      box(g,0x50616a,17.4,.55,z,.16,.97,.16);
      box(g,0x50616a,17.4,1.0,z+9,.10,.11,18);
    }
  }
  scene.add(batchBoxes(buildOcean(scene)));
  for(const x of roadXs) {
    box(g,0x454b53,x,-.038,0,15,.08,620);
    for(let z=-302;z<309;z+=6) {
      if(roadZs.some(c=>Math.abs(c-z)<8)) continue;
      box(g,0xffc15c,x-.15,.013,z,.09,.018,3.2);
      box(g,0xffc15c,x+.15,.013,z,.09,.018,3.2);
      for(const side of [-1,1]) {
        box(g,0xd6dbcd,x+side*3.7,.013,z,.105,.016,2.75);
        box(g,0xd4d6c5,x+side*7.1,.013,z,.094,.016,5.99);
      }
    }
  }
  for(const z of roadZs) {
    box(g,0x494e55,-101,-.041,z,217,.082,15);
    for(let x=-213;x<5;x+=5) {
      if(!roadXs.some(c=>Math.abs(c-x)<8)) box(g,0xe9bc70,x,.012,z,2.5,.017,.105);
    }
    for (const x of roadXs) for (const side of [-1,1]) {
      for(let stripe=-6;stripe<=6;stripe++) box(g,0xe7e2cf,x+stripe,.023,z+side*7.9,.46,.024,1.7);
      box(g,0xf7e6cd,x+3.6,.026,z+side*9.2,6.5,.021,.18);
    }
    for(let col=0;col<4;col++) {
      if(z===288) continue;
      const cx=roadXs[col]+24;
      box(g,0xc6b39a,cx,.045,z+24,32.6,.13,32.6);
      for(let i=0;i<2;i++) {
        const height=6.5+random()*14+((col<2&&z>20)?random()*14:0);
        buildHotel(g,cx+(i-.5)*15.4,z+24,13.5,24+random()*5,height,Math.floor(random()*12));
      }
    }
  }
  for(let z=-298;z<302;z+=13) {
    plantPalm(g,15+(z%2)*.5,z,.85+random()*.4,random()*6);
    if(z%3!==0) streetLamp(g,-8.1,z+3,1);
    if(z%4!==0) plantPalm(g,-9.1,z+2,.65+random()*.23,random()*6);
    if(z%3===0) {
      const x=28+random()*8;
      box(g,0xe47752,x,1.65,z,2.9,.13,2.9).rotation.y=.78;
      box(g,0xeedea8,x,.76,z,.11,1.6,.11);
      box(g,0x73b7a9,x+1.5,.025,z+2,1.4,.07,2.1);
    }
  }
  box(g,0xb98160,44,.02,105,72,.64,8);
  for(let x=18;x<79;x+=.54)box(g,0xd2a17d,x,.36,105,.49,.08,7.9);
  for(let x=19;x<79;x+=2) for(const side of [-1,1]) {
    box(g,0x594d48,x,-.7,105+side*3.4,.38,2.65,.38);
    box(g,0xf7d3a3,x,.73,105+side*3.8,.15,1.02,.15);
    box(g,0xf7d3a3,x,1.22,105+side*3.8,2.01,.14,.14);
  }
  citySign(scene,'JUNIPER MILE',-10.5,4.7,24,5.4,'#175658');
  citySign(scene,'BEACON PIER',14,3,99,5,'#a8493b');
  citySign(scene,'MARÉ HOTEL',-12.3,5.4,35,7,'#346e72',Math.PI/2);
  scene.add(batchBoxes(g));
}

export function canOccupy(x,z,radius=.65) {
  const pier=x>=43&&x<79&&Math.abs(z-105)<3.4;
  return x>-214&&(x<43||pier)&&Math.abs(z)<302&&!blocks.some(b=>
    Math.abs(x-b.x)<b.w/2+radius&&Math.abs(z-b.z)<b.d/2+radius);
}
export function districtAt(x,z) {
  if(x>-27) return z>82?'Beacon Pier':'Juniper Mile';
  return x<-123?'Crown Heights':'Port Exchange';
}
