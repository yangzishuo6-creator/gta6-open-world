export const GRID = 320;
export const ROAD = 92;
export const COLS = 8;
export const ROWS = 7;
export const SHORE = 81;
export const WIDTH = (COLS - 1) * GRID + 79;
export const SOUTH = (ROWS - 1) * GRID + 72;
export const START = {x: 935, y: 675};
export const COLORS = ['#f6c57d','#ec9277','#f9e3a8','#e99eb3','#8ec6be','#fbedd6','#c6abcf'];

export function randomGenerator(seed) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

export const distance = (a,b) => Math.hypot(a.x-b.x,a.y-b.y);
export const clamp = (value,min,max) => Math.max(min,Math.min(max,value));
export const districts = ['Sunline Marina','Juniper Mile','Beacon Market','Crown Heights'];

export function districtAt(x,y) {
  if (x < 380) return districts[0];
  if (y > 1280) return districts[2];
  return x > 1450 ? districts[3] : districts[1];
}

export function buildCity() {
  const rng = randomGenerator(7204);
  const city = {blocks:[], buildings:[], palms:[], docks:[]};
  for (let row=0; row<ROWS-1; row++) {
    city.docks.push({x:-35,y:row*GRID+116,width:127});
    for (let col=0; col<COLS-1; col++) {
      const x=SHORE+col*GRID+ROAD/2, y=row*GRID+ROAD/2, size=GRID-ROAD;
      const park=(col+row*3)%8===0 || (col===3 && row===1) || (col===4 && row===3);
      city.blocks.push({x,y,size,park,plaza:park && col!==0,market:row===4 && col===2});
      for (let j=0;j<5;j++) {
        city.palms.push({x:x+13+j*46,y:y+13,scale:.8+rng()*.4});
        if(j%2===0) city.palms.push({x:x+size-13,y:y+36+j*39,scale:.8+rng()*.45});
      }
      if (park) {
        for (let j=0;j<7;j++) city.palms.push({x:x+27+rng()*170,y:y+37+rng()*160,scale:.85+rng()*.6});
        continue;
      }
      const count=col>1 ? 4 : 2;
      for (let j=0;j<count;j++) {
        const split=count===4;
        city.buildings.push({
          x:x+25+(split ? j%2*96 : 0)+rng()*7,
          y:y+25+Math.floor(j/(split?2:1))*94+rng()*8,
          w:(split?63:142)+rng()*15,h:60+rng()*17,
          z:14+rng()*(col>3?48:31),
          color:COLORS[Math.floor(rng()*COLORS.length)],
          awning:rng()>.4, equipment:rng()>.25
        });
      }
    }
  }
  return city;
}

export function canOccupy(city,x,y,radius) {
  if(x<8+radius || y<-66+radius || x>WIDTH-radius || y>SOUTH-radius) return false;
  if(x<SHORE-43+radius && !city.docks.some(d=>x>d.x+radius && Math.abs(y-d.y)<13-radius)) return false;
  return !city.buildings.some(b=>x+radius>b.x && x-radius<b.x+b.w && y+radius>b.y && y-radius<b.y+b.h);
}
