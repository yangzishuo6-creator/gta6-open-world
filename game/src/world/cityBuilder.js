import {batchBoxes, lettering, noise} from './geometry.js';
import {plantPalm, streetLamp, umbrella} from './props.js';

export const avenues = [0,-52,-104,-156,-208];
export const crossStreets = [-320,-256,-192,-128,-64,0,64,128,192,256];
const stucco = [0xf7d2a6,0xefa286,0xb8d0c9,0xe3e0c2,0xc6a9ad,0xf0c284];
const trim = [0xd05a4b,0x2b8480,0xd88767,0x709c9a,0x9e6476];
const shops = ['CASA JUNIPER','SOLA HOTEL','IVO MOTOR CO.','PALOMA CLUB','MIRAMAR','TIDELINE MARKET','MARLIN CAFE','BAY SOCIAL'];

function buildHotel(scene, add, lots, x, z, seed, frontage) {
  const h = 9 + Math.floor(noise(seed)*6)*3.15;
  const w = 15 + noise(seed+4)*5;
  const d = 13 + noise(seed-6)*5;
  const wall = stucco[seed%stucco.length];
  const accent = trim[seed%trim.length];
  lots.push({x,z,w,d,h});
  add(wall,x,h/2,z,w,h,d);
  add(0xffe3bd,x,h+.18,z,w+.55,.48,d+.55);
  add(accent,x,h+.61,z,w+.3,.32,d+.3);
  add(wall,x-2,h+1.1,z-1,w*.52,2.1,d*.55);
  add(accent,x,h+2.21,z-1,w*.63,.28,d*.63);
  add(0xd3a583,x,.28,z,w+.3,.56,d+.3);
  for (let floor=1;floor<h/2.9-.4;floor++) {
    const y = 2.35 + floor*2.75;
    add(0xffdfb9,x,y-.9,z,w+.25,.16,d+.25);
    for (let j=-2;j<=2;j++) {
      const glass = (floor+j+seed)%5===0 ? 0xc89260 : 0x416a76;
      add(0xf1c398,x+j*w/5.5,y,z+d/2,1.95,1.66,.16);
      add(glass,x+j*w/5.5,y+.04,z+d/2+.1,1.45,1.28,.11);
      add(0xf8d3a4,x+j*w/5.5,y+.04,z+d/2+.17,.065,1.28,.06);
      add(glass,x+w/2,y,z+j*d/5.5,.16,1.37,1.54);
      add(0xffd9aa,x+w/2+.1,y-.78,z+j*d/5.5,.4,.12,1.78);
    }
  }
  add(accent,x,3.33,z,w+.48,.45,d+.48);
  for (let j=-2;j<=2;j++) {
    add(0x355b62,x+w/2,1.61,z+j*d/5,.22,2.28,1.85);
    add(0xd7ac80,x+w/2+.14,1.58,z+j*d/5,.1,2.3,.09);
    add(0x41616b,x+j*w/5,1.58,z+d/2,2.03,2.28,.2);
  }
  if (frontage) {
    for (let j=0;j<16;j++) {
      add(j%2 ? accent : 0xffe9bc,x+w/2+1.04,2.94,z-d*.42+j*d*.054,2.1,.16,d*.055);
      add(j%2 ? accent : 0xffe9bc,x+w/2+2.05,2.76,z-d*.42+j*d*.054,.12,.36,d*.055);
    }
    lettering(scene,shops[seed%shops.length],'#ffe5a8','#263f46',Math.min(9,d*.7),1.62,x+w/2+.25,4.35,z,Math.PI/2);
    lettering(scene,shops[seed%shops.length],'#fff4ce','#5d4145',Math.min(10,w*.7),1.55,x,4.33,z+d/2+.14);
  }
}

export function buildCity(scene) {
  const batch = batchBoxes(scene);
  const add = batch.add;
  const lots = [];
  add(0x696975,-98,-.17,-30,246,.27,680);
  add(0xf6d49a,34,-.17,-30,46,.22,680);
  add(0xebbf92,31,-.24,-422,53,.26,145);
  add(0xb9a08c,-75,-.30,-422,159,.37,145);
  add(0xe3bb91,16,.01,-30,12,.21,680);
  add(0xf1ded0,10.25,.11,-30,.27,.24,680);
  add(0xf2d2a7,21.9,.07,-30,.52,.23,680);
  for (let z=-360;z<304;z+=4) {
    add(z%8 ? 0xeec69e : 0xf6d7af,16,.126,z,11.4,.014,3.88);
    add(0xd98470,19.7,.14,z,.17,.015,3.9);
    add(0xd98470,12.5,.14,z,.17,.015,3.9);
  }
  for (const x of avenues) {
    for (let z=-350;z<304;z+=7) {
      if (crossStreets.some(c=>Math.abs(c-z)<11)) continue;
      add(0xf7c56c,x-.19,.004,z,.115,.014,3.6);
      add(0xf7c56c,x+.18,.004,z,.115,.014,3.6);
      add(0xf3ded1,x+5.6,.004,z,.10,.014,3);
      add(0xf3ded1,x-5.6,.004,z,.10,.014,3);
    }
    for (const z of crossStreets) {
      for (const side of [-1,1]) {
        for (let k=-6;k<=6;k++) add(0xeee0cf,x+k*1.37,.017,z+side*9,.72,.018,3);
        if (x<0) for (let k=-5;k<=5;k++) add(0xeee0cf,x+side*11,.018,z+k*1.26,2.18,.018,.64);
      }
    }
  }
  for (const z of crossStreets) {
    for (let x=-218;x<0;x+=7) {
      if (avenues.some(c=>Math.abs(c-x)<12)) continue;
      add(0xf1ba69,x,.014,z,3.8,.018,.13);
    }
  }
  for (let row=0;row<crossStreets.length-1;row++) {
    const z = crossStreets[row]+32;
    for (let col=0;col<4;col++) {
      const x = -26-col*52;
      add(0xe9c6a5,x,.03,z,32,.29,46);
      add(0xffdfb5,x+16,.09,z,.24,.24,46);
      buildHotel(scene,add,lots,x+1,z-10,1+row*13+col*9,col===0);
      if ((row+col)%4!==0) buildHotel(scene,add,lots,x-2,z+11,5+row*13+col*9,col===0);
      else {
        add(0x81976f,x-2,.188,z+11,17,.06,15);
        plantPalm(scene,x-5,z+10,row+col);
      }
    }
  }
  for (let z=-350;z<300;z+=16) {
    plantPalm(scene,18.5,z,z+351);
    if (!crossStreets.some(c=>Math.abs(c-z-4)<11)) plantPalm(scene,-12,z+4,z+890);
    streetLamp(add,11.3,z+7,-1);
    add(0x577473,20,.52,z+5,.6,.8,1.8);
    add(0xc98759,20,.97,z+5,.69,.11,1.93);
    umbrella(scene,29+noise(z)*16,z+5,[0xe67c62,0x529e9a,0xe9a252][Math.abs(z)%3]);
  }
  for (let z=-346;z<305;z+=3) {
    add(0x586e74,22.4,.55,z,.13,.98,.13);
    add(0x84999a,22.4,.96,z,.11,.11,3);
  }
  for (let x=23;x<110;x+=2.7) {
    add(0xb78663,x,.66,-103,2.64,.29,8.1);
    add(0x6b6963,x,.12,-106,.35,2,.35);
    add(0x6b6963,x,.12,-100,.35,2,.35);
    add(0xefc998,x,1.64,-107,2.7,.12,.13);
    add(0xefc998,x,1.64,-99,2.7,.12,.13);
    add(0x8c7968,x,1.25,-107,.15,1.1,.15);
    add(0x8c7968,x,1.25,-99,.15,1.1,.15);
  }
  add(0xa17960,96,.65,-103,25,.37,17);
  add(0xe4bf8f,97,4.28,-103,15,.24,10);
  add(0x577e7b,97,4.52,-103,14,.25,9.8);
  add(0xf0c688,97,4.77,-103,11,.27,7.8);
  for (const x of [91,97,103]) for (const z of [-107,-99]) add(0xeacfa4,x,2.47,z,.22,3.42,.22);
  lettering(scene,'TIDE PAVILION','#fff0bf','#285c61',7.2,1.24,97,3.85,-97.9);
  for (const [x,z,tint] of [[36,-64,0xa95662],[39,-71,0x3b9697],[32,-78,0xd07642],[47,-125,0xd07642]]) {
    umbrella(scene,x,z,tint);
    add(tint,x+.65,.04,z+.37,.83,.09,1.62,.3);
  }
  lettering(scene,'JUNIPER PIER','#ffe8a6','#235e64',6,1.2,24,3,-103,-Math.PI/2);
  batch.finish();
  return lots;
}

export function isBlocked(lots,x,z,r=.45) {
  return x>52-r || x<-217+r || z<-347+r || z>291-r ||
    lots.some(lot=>Math.abs(x-lot.x)<lot.w/2+r && Math.abs(z-lot.z)<lot.d/2+r);
}
