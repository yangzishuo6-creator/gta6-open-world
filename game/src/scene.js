import {WIDTH,SOUTH,distance} from './city.js';
import {paintGround,drawBuilding,buildingShadow,drawPalm,box,disc} from './city-art.js';
import {drawCar,drawPerson,drawMarker,actorLabel} from './actor-art.js';
import {mapMarkers,storyCharacters} from './contracts.js';

const landmarks=[
  {x:80,y:530,text:'SUNLINE MARINA'},
  {x:987,y:738,text:'JUNIPER MILE'},
  {x:1681,y:1050,text:'CROWN HEIGHTS'},
  {x:721,y:1380,text:'BEACON MARKET'}
];

export function createScene(canvas,city) {
  const ctx=canvas.getContext('2d',{alpha:false});
  const ground=document.createElement('canvas');
  ground.width=WIDTH+900;
  ground.height=SOUTH+550;
  const terrain=ground.getContext('2d');
  terrain.translate(470,260);
  paintGround(terrain,city);
  for(const b of city.buildings) buildingShadow(terrain,b);
  for(const site of landmarks){
    terrain.save();
    terrain.translate(site.x,site.y);
    terrain.rotate(site.x<120?-Math.PI/2:0);
    terrain.font='900 12px Arial';
    terrain.textAlign='center';
    terrain.fillStyle='#f8e3adbb';
    terrain.fillText(site.text,0,0);
    terrain.restore();
  }
  const camera={x:0,y:0,zoom:1,w:1,h:1};

  function render(state,dt,menu) {
    const w=canvas.clientWidth,h=canvas.clientHeight;
    const ratio=Math.min(devicePixelRatio||1,2);
    if(canvas.width!==Math.round(w*ratio)||canvas.height!==Math.round(h*ratio)){
      canvas.width=Math.round(w*ratio);
      canvas.height=Math.round(h*ratio);
    }
    const p=state.player;
    const scale=Math.max(.67,Math.min(w/1030,h/610));
    const desiredZoom=scale*(menu?.89:state.car?1.01:1.16);
    const x=menu?220:p.x+(state.car?Math.cos(state.car.angle)*state.car.speed*.25:0);
    const y=menu?498:p.y+(state.car?Math.sin(state.car.angle)*state.car.speed*.25:0);
    const snap=camera.w===1?1:1-Math.exp(-dt*6);
    camera.x+=(x-camera.x)*snap;
    camera.y+=(y-camera.y)*snap;
    camera.zoom+=(desiredZoom-camera.zoom)*snap;
    Object.assign(camera,{w,h});
    ctx.setTransform(ratio,0,0,ratio,0,0);
    box(ctx,'#348f96',0,0,w,h);
    ctx.save();
    ctx.translate(w*.53,h*.54);
    ctx.scale(camera.zoom,camera.zoom);
    ctx.translate(-camera.x,-camera.y);
    ctx.drawImage(ground,-470,-260);
    const visible=(o,pad=85)=>Math.abs(o.x-camera.x)<w*.61/camera.zoom+pad && Math.abs(o.y-camera.y)<h*.63/camera.zoom+pad;
    const layers=[];
    for(const b of city.buildings) if(visible(b,170)) layers.push({y:b.y+b.h,draw:()=>drawBuilding(ctx,b)});
    for(const palm of city.palms) if(visible(palm)) layers.push({y:palm.y,draw:()=>drawPalm(ctx,palm)});
    for(const person of [...state.people,...storyCharacters(state)]) if(visible(person)) layers.push({y:person.y,draw:()=>drawPerson(ctx,person,state.time)});
    for(const car of [...state.cars,...state.police]) if(visible(car)) layers.push({y:car.y,draw:()=>drawCar(ctx,car,state.time,state.car===car)});
    if(!state.car && visible(p)){
      layers.push({y:p.y,draw:()=>{
        disc(ctx,'#ffe7a24c',p.x,p.y,12,9);
        drawPerson(ctx,p,state.time,true);
      }});
    }
    layers.sort((a,b)=>a.y-b.y);
    layers.forEach(layer=>layer.draw());
    if(!menu){
      for(const marker of mapMarkers(state)) if(visible(marker.point)) drawMarker(ctx,marker,state.time);
      const identified=[];
      for(const car of [...state.police].sort((a,b)=>b.stun-a.stun)){
        if(!visible(car)||identified.some(other=>Math.abs(other.x-car.x)<88&&Math.abs(other.y-car.y)<20)) continue;
        identified.push(car);
        actorLabel(ctx,car.x,car.y-25,car.stun>state.time?'DISABLED':'PORT PATROL',car.stun>state.time?'#99ffdf':'#ffb096');
      }
      actorLabel(ctx,p.x,p.y-(state.car?29:22),state.car?'YOU · DRIVER':'YOU · COURIER','#ffe49d');
    }
    for(const trace of state.traces){
      ctx.strokeStyle='#a1ffe1';
      ctx.globalAlpha=Math.min(1,trace.life*8);
      ctx.lineWidth=4;
      ctx.beginPath();
      ctx.moveTo(trace.x,trace.y);
      ctx.lineTo(trace.tx,trace.ty);
      ctx.stroke();
      ctx.globalAlpha=1;
    }
    for(const fx of state.particles){
      ctx.globalAlpha=fx.life/fx.max;
      ctx.strokeStyle=fx.color;
      ctx.lineWidth=2;
      ctx.beginPath();
      ctx.arc(fx.x,fx.y,2+fx.radius*(1-fx.life/fx.max),0,Math.PI*2);
      ctx.stroke();
      ctx.globalAlpha=1;
    }
    ctx.restore();
    const vignette=ctx.createRadialGradient(w*.53,h*.54,h*.27,w*.53,h*.54,Math.max(w,h)*.68);
    vignette.addColorStop(0,'#17313f00');
    vignette.addColorStop(1,'#18363c55');
    box(ctx,vignette,0,0,w,h);
  }

  function worldPoint(x,y){
    return {x:camera.x+(x-camera.w*.53)/camera.zoom,y:camera.y+(y-camera.h*.54)/camera.zoom};
  }

  return {render,worldPoint,snap(){camera.w=1;}};
}
