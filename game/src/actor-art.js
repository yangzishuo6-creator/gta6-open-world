import {box,disc,shape} from './city-art.js';

export function drawCar(ctx,car,time,active) {
  const van=car.kind==='van',police=car.kind==='police';
  const length=van?25:22, width=van?12:10;
  ctx.save();
  ctx.translate(car.x,car.y);
  ctx.rotate(car.angle);
  disc(ctx,'#1c333858',5,5,length+3,width+3);
  for(const x of [-length+7,length-10]){
    box(ctx,'#263337',x,-width-2,8,4);
    box(ctx,'#263337',x,width-2,8,4);
  }
  shape(ctx,'#293e41',[[-length,-width+2],[length-4,-width],[length+2,-width+4],[length+2,width-4],[length-4,width],[-length,width-2]]);
  shape(ctx,car.color,[[-length,-width+1],[length-5,-width+1],[length,-width+4],[length,width-4],[length-5,width-1],[-length,width-1]]);
  shape(ctx,'#36606a',[[-13,-width+2],[10,-width+2],[14,-width+5],[14,width-5],[10,width-2],[-13,width-2]]);
  box(ctx,car.color,-11,-width+3,17,width*2-6);
  box(ctx,'#fff7d577',-11,-width+3,17,1.5);
  box(ctx,'#fff4a7',length-2,-width+3,3,4);
  box(ctx,'#fff4a7',length-2,width-7,3,4);
  box(ctx,'#e55a57',-length,-width+3,3,4);
  box(ctx,'#e55a57',-length,width-7,3,4);
  if(police){
    const flash=Math.floor(time*9)%2;
    const red=flash?'#ffc1a7':'#ec4b58',blue=flash?'#5592ff':'#c0fbff';
    box(ctx,'#315b6d',-length+1,-3,11,6);
    if(car.stun<time){
      disc(ctx,flash?'#ee4b6850':'#c0fbff55',-3,flash?-7:7,20,12);
      box(ctx,red,-5,-8,5,7);
      box(ctx,blue,-5,1,5,7);
    }else{
      box(ctx,'#40575e',-5,-8,5,16);
      disc(ctx,'#a4ffe0',-2,0,3);
    }
  }
  if(active){
    ctx.strokeStyle='#ffe79b';
    ctx.lineWidth=1.2;
    ctx.strokeRect(-length-3,-width-3,2*length+6,width*2+6);
  }
  ctx.restore();
}

export function drawPerson(ctx,p,time,active=false) {
  const walk=active?p.walking:Math.abs(p.speed)>0;
  const angle=active?p.angle:(p.axis==='x'?0:Math.PI/2)+(p.speed>0?0:Math.PI);
  const swing=walk?Math.sin(time*(active?15:8)+p.x*.03)*3:0;
  ctx.save();
  ctx.translate(p.x,p.y);
  disc(ctx,'#304a4c62',5,3,active?12:8,4);
  ctx.rotate(angle);
  const size=active?1.25:1;
  ctx.scale(size,size);
  box(ctx,'#29414d',-4+swing,-4,6,3);
  box(ctx,'#29414d',-4-swing,1,6,3);
  disc(ctx,active?'#f5b24f':p.color,-2,0,5.6,5.2);
  disc(ctx,active?'#e3a478':p.skin,2.9,0,3.3);
  disc(ctx,active?'#4c3856':'#443a38',2.2,0,2);
  if(active) box(ctx,'#a34160',-7,-3,4,6);
  ctx.restore();
}

export function actorLabel(ctx,x,y,label,color) {
  ctx.font='800 10px Arial';
  ctx.textAlign='center';
  const w=ctx.measureText(label).width+14;
  box(ctx,'#172f34eb',x-w/2,y-11,w,17);
  box(ctx,color,x-w/2,y-11,2,17);
  ctx.fillStyle=color;
  ctx.fillText(label,x,y+1);
}

export function drawMarker(ctx,marker,time) {
  const {point,color,glyph}=marker;
  const wave=(time*.8)%1;
  disc(ctx,color+'32',point.x,point.y,25,17);
  ctx.strokeStyle=color;
  ctx.lineWidth=2;
  ctx.beginPath();
  ctx.ellipse(point.x,point.y,21+wave*11,14+wave*7,0,0,Math.PI*2);
  ctx.stroke();
  const y=point.y-17+Math.sin(time*3)*3;
  shape(ctx,'#182e34',[[point.x,y-22],[point.x+11,y-11],[point.x,y],[point.x-11,y-11]]);
  ctx.fillStyle=color;
  ctx.textAlign='center';
  ctx.font='900 14px Arial';
  ctx.fillText(glyph,point.x,y-7);
  actorLabel(ctx,point.x,y-30,point.label.toUpperCase(),color);
}
