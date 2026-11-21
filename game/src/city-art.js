import {GRID,ROAD,COLS,ROWS,SHORE,WIDTH,SOUTH,randomGenerator} from './city.js';

export function box(ctx,color,x,y,w,h) {
  ctx.fillStyle=color;
  ctx.fillRect(x,y,w,h);
}

export function shape(ctx,color,points) {
  ctx.fillStyle=color;
  ctx.beginPath();
  points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));
  ctx.closePath();
  ctx.fill();
}

export function disc(ctx,color,x,y,rx,ry=rx) {
  ctx.fillStyle=color;
  ctx.beginPath();
  ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);
  ctx.fill();
}

export function roadCenter(col) { return SHORE+col*GRID; }

function parasol(ctx,x,y,color){
  disc(ctx,'#263c4e46',x+5,y+5,11,8);
  for(let i=0;i<8;i++){
    const a=i*Math.PI/4,b=(i+1)*Math.PI/4;
    shape(ctx,i%2?'#fff0cd':color,[[x,y],[x+10*Math.cos(a),y+10*Math.sin(a)],[x+10*Math.cos(b),y+10*Math.sin(b)]]);
  }
  disc(ctx,'#ffe1a8',x,y,1.5);
}

export function paintGround(ctx,city) {
  const rng=randomGenerator(56);
  const ocean=ctx.createLinearGradient(-1000,0,SHORE,0);
  ocean.addColorStop(0,'#137a89');
  ocean.addColorStop(.75,'#24a0a1');
  ocean.addColorStop(1,'#8ed4b6');
  box(ctx,ocean,-1300,-850,WIDTH+2600,SOUTH+1700);
  for(let i=0;i<2300;i++){
    const x=-1000+rng()*1040,y=-400+rng()*3000;
    box(ctx,i%5===0?'#c3f3d16b':'#e3ffeb30',x,y,5+rng()*42,1+rng()*2);
  }
  box(ctx,'#d9bc89',31,-84,WIDTH-11,SOUTH+164);
  box(ctx,'#af916d',34,-84,5,SOUTH+164);
  box(ctx,'#fbddb0',39,-84,8,SOUTH+164);
  box(ctx,'#687e7d',SHORE-ROAD/2,-62,WIDTH-SHORE+ROAD/2,SOUTH+116);
  for(let y=-50;y<SOUTH;y+=42){
    box(ctx,'#bd986d',41,y,2,24);
    box(ctx,'#f8d2a6',39,y,4,3);
    if(y%3===1) parasol(ctx,49,y+17,'#e47c71');
  }
  for(const block of city.blocks){
    const {x,y,size,park,plaza}=block;
    box(ctx,'#e9caa2',x,y,size,size);
    box(ctx,'#f8deae',x+3,y+3,size-6,size-6);
    if(park){
      box(ctx,plaza?'#dcb695':'#8eb888',x+23,y+23,size-46,size-46);
      box(ctx,'#efe0b7',x+94,y+23,36,size-46);
      box(ctx,'#efe0b7',x+23,y+94,size-46,36);
      disc(ctx,'#977b65',x+112,y+114,37,31);
      disc(ctx,'#f3e4bf',x+112,y+109,35,29);
      disc(ctx,'#4b9c9a',x+112,y+109,29,23);
      disc(ctx,'#92dad0',x+112,y+108,18,14);
      disc(ctx,'#ffface',x+112,y+103,4);
      for(let j=0;j<4;j++) box(ctx,'#865c4e',x+39+j*48,y+155+(j%2)*25,19,5);
      for(let j=0;j<3;j++) parasol(ctx,x+45+j*67,y+70,plaza?'#d9828b':'#3f9eaa');
    }else{
      box(ctx,'#dcb38d',x+21,y+21,size-42,size-42);
      for(let j=23;j<size;j+=17) box(ctx,'#bb997245',x+j,y+4,1,size-8);
      if(block.market) for(let j=0;j<4;j++) parasol(ctx,x+195,y+44+j*43,'#e87d5e');
    }
  }
  for(let i=0;i<COLS;i++){
    const x=roadCenter(i);
    for(let j=0;j<ROWS-1;j++){
      const y=j*GRID;
      for(let k=65;k<GRID-55;k+=29) box(ctx,'#eddca6',x-1,y+k,2,14);
      for(const offset of [-39,37]) box(ctx,'#dae0bc89',x+offset,y+53,2,GRID-106);
      for(let k=-29;k<35;k+=10){
        box(ctx,'#efe4c9',x+k,y+51,5,15);
        box(ctx,'#efe4c9',x+k,y+GRID-65,5,15);
      }
    }
  }
  for(let j=0;j<ROWS;j++){
    const y=j*GRID;
    for(let i=0;i<COLS-1;i++){
      const x=roadCenter(i);
      for(let k=65;k<GRID-55;k+=29) box(ctx,'#eddca6',x+k,y-1,14,2);
      for(const offset of [-39,37]) box(ctx,'#dae0bc89',x+53,y+offset,GRID-106,2);
      for(let k=-29;k<35;k+=10){
        box(ctx,'#efe4c9',x+51,y+k,15,5);
        box(ctx,'#efe4c9',x+GRID-65,y+k,15,5);
      }
    }
  }
  for(const dock of city.docks){
    box(ctx,'#123d506b',dock.x+7,dock.y-6,dock.width,37);
    box(ctx,'#c18d60',dock.x,dock.y-13,dock.width,26);
    for(let x=dock.x+4;x<39;x+=6) box(ctx,'#f9cc8a',x,dock.y-12,3,23);
    for(let i=0;i<2;i++){
      const x=-92+i*32,y=dock.y+(i%2===0?-27:25);
      disc(ctx,'#d2faed77',x-4,y+9,8,35);
      ctx.save();
      ctx.translate(x,y);
      ctx.rotate(-.14+i*.22);
      shape(ctx,'#fff0c9',[[0,-27],[8,-14],[8,20],[-8,20],[-8,-14]]);
      box(ctx,i?'#df7762':'#568f99',-6,-10,12,24);
      box(ctx,'#3d6570',-6,-9,12,6);
      ctx.restore();
    }
  }
  ctx.save();
  ctx.translate(-100,1297);
  disc(ctx,'#d0f2d250',2,6,26,66);
  shape(ctx,'#fff0ce',[[0,-64],[23,-43],[23,40],[12,54],[-14,54],[-23,38],[-23,-42]]);
  box(ctx,'#dc826c',-19,-27,38,66);
  box(ctx,'#2a6773',-14,-23,28,37);
  box(ctx,'#f5c388',-11,-18,22,26);
  box(ctx,'#2a6773',-6,19,12,14);
  ctx.restore();
  for(let i=0;i<10000;i++){
    const x=38+rng()*WIDTH,y=-62+rng()*(SOUTH+100);
    box(ctx,i%2?'#13282916':'#fffce22a',x,y,1+rng()*3,1);
  }
}

export function buildingShadow(ctx,b) {
  shape(ctx,'#233d4952',[[b.x,b.y],[b.x+b.w,b.y],[b.x+b.w+b.z*.64,b.y+b.z*.59],[b.x+b.w+b.z*.64,b.y+b.h+b.z*.59],[b.x+b.z*.64,b.y+b.h+b.z*.59],[b.x,b.y+b.h]]);
}

export function drawBuilding(ctx,b) {
  const {x,y,w,h,z,color}=b;
  const dx=-z*.34,dy=-z*.63,rx=x+dx,ry=y+dy;
  shape(ctx,'#985f57',[[x+w,y],[rx+w,ry],[rx+w,ry+h],[x+w,y+h]]);
  shape(ctx,color,[[x,y+h],[x+w,y+h],[rx+w,ry+h],[rx,ry+h]]);
  shape(ctx,'#88574f54',[[x,y+h],[x+w,y+h],[rx+w,ry+h],[rx,ry+h]]);
  for(let floor=0;floor<Math.ceil(z/15);floor++){
    for(let i=9;i<w-8;i+=15){
      const f=(floor+1)/(Math.ceil(z/15)+1);
      box(ctx,'#4e7276',x+i+dx*f,y+h+dy*f-2,8,3);
      box(ctx,'#b8ded0',x+i+dx*f,y+h+dy*f-2,8,1);
    }
  }
  box(ctx,'#fff1d1',rx-2,ry-2,w+4,h+4);
  box(ctx,color,rx+1,ry+1,w-2,h-2);
  box(ctx,'#7b534b38',rx+3,ry+h-5,w-6,3);
  box(ctx,'#fffbe766',rx+6,ry+6,w-12,2);
  if(b.equipment){
    box(ctx,'#916a6755',rx+w*.51+4,ry+h*.29+5,25,15);
    box(ctx,'#fdf1d4',rx+w*.51,ry+h*.29,25,15);
    for(let i=0;i<4;i++) box(ctx,'#879e98',rx+w*.51+3,ry+h*.29+3+i*2,12,1);
    disc(ctx,'#648e91',rx+w*.51+19,ry+h*.29+7,3);
    box(ctx,'#47777d',rx+8,ry+h-19,21,10);
    for(let i=0;i<3;i++) box(ctx,'#93bab2',rx+9,ry+h-17+i*3,19,1);
  }
  if(b.awning){
    for(let j=0;j<8;j++){
      const sx=x+w*.17+j*5;
      shape(ctx,j%2?'#f9dfac':'#ce6a62',[[sx-2,y+h-5],[sx+3,y+h-5],[sx+5,y+h+3],[sx,y+h+3]]);
    }
  }
}

export function drawPalm(ctx,p) {
  const {x,y,scale}=p;
  ctx.save();
  ctx.translate(x,y);
  ctx.scale(scale,scale);
  disc(ctx,'#273b3d37',10,7,18,6);
  shape(ctx,'#9e704d',[[-2,1],[1,1],[-3,-16],[-6,-18]]);
  for(let i=0;i<7;i++){
    const angle=i*.9+.12;
    ctx.save();
    ctx.translate(-5,-17);
    ctx.rotate(angle);
    shape(ctx,['#318477','#479b78','#75b67b'][i%3],[[0,0],[7,-5],[16,-5],[24,1],[15,-1],[10,3]]);
    ctx.restore();
  }
  disc(ctx,'#e6c67b',-5,-17,2.3);
  ctx.restore();
}
