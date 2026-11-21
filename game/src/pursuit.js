import {distance,GRID,SHORE,COLS,ROWS,clamp,canOccupy} from './city.js';
import {moveBody} from './traffic.js';

export function raiseHeat(state,level,seconds=14) {
  state.heat=Math.max(state.heat,level);
  state.heatUntil=Math.max(state.heatUntil,state.time+seconds);
  state.spawnAt=Math.min(state.spawnAt,state.time+.4);
}

function dispatch(state) {
  const p=state.player;
  const col=clamp(Math.round((p.x-SHORE)/GRID),0,COLS-1);
  const row=clamp(Math.round(p.y/GRID),0,ROWS-1);
  const options=[[-1,0],[1,0],[0,-1],[0,1],[1,1],[-1,-1]]
    .map(([dx,dy])=>({x:SHORE+(col+dx)*GRID,y:(row+dy)*GRID}))
    .filter(c=>c.x>=SHORE && c.x<=SHORE+(COLS-1)*GRID && c.y>=0 && c.y<=(ROWS-1)*GRID && distance(c,p)>165);
  const open=options.filter(c=>state.police.every(unit=>distance(unit,c)>120));
  const candidate=(open.length?open:options).sort((a,b)=>distance(a,p)-distance(b,p))[0];
  if(candidate) state.police.push({...candidate,angle:0,kind:'police',color:'#fff4dc',stun:0});
}

function policeGoal(car,p) {
  const x=SHORE+Math.round((car.x-SHORE)/GRID)*GRID;
  const y=Math.round(car.y/GRID)*GRID;
  const px=SHORE+Math.round((p.x-SHORE)/GRID)*GRID;
  const py=Math.round(p.y/GRID)*GRID;
  if(distance(car,p)<120) return p;
  if(Math.abs(car.x-x)<13 && Math.abs(car.y-y)<13){
    if(Math.abs(px-x)>1) return {x:px,y};
    if(Math.abs(py-y)>1) return {x,y:py};
    return p;
  }
  if(Math.abs(car.x-x)<Math.abs(car.y-y)) return {x,y:py!==y?py:y};
  return {x:px!==x?px:x,y};
}

export function stepPursuit(state,dt) {
  const p=state.player;
  if(state.heat===0) return;
  if(state.time>=state.heatUntil){
    state.heat=0;
    state.police=[];
    state.say('Heat cleared · dispatch stood down');
    return;
  }
  if(state.time>state.spawnAt && state.police.length<state.heat+1){
    dispatch(state);
    state.spawnAt=state.time+1.1;
  }
  for(const car of state.police){
    if(car.stun>state.time) continue;
    const goal=policeGoal(car,p);
    const angle=Math.atan2(goal.y-car.y,goal.x-car.x);
    car.angle=angle;
    const speed=state.car?168+state.heat*11:97+state.heat*7;
    moveBody(state.city,car,Math.cos(angle)*dt*speed,Math.sin(angle)*dt*speed,12);
    if(distance(car,p)<39){
      p.health-=dt*(state.car?8:17);
      state.heatUntil=Math.max(state.heatUntil,state.time+5);
    }
  }
}

export function firePulse(state,target) {
  if(state.car || state.time<state.fireAt) return;
  state.fireAt=state.time+.33;
  const p=state.player;
  const angle=Math.atan2(target.y-p.y,target.x-p.x);
  p.angle=angle;
  let length=Math.min(235,distance(p,target));
  for(let sample=8;sample<length;sample+=8){
    if(!canOccupy(state.city,p.x+Math.cos(angle)*sample,p.y+Math.sin(angle)*sample,1)){
      length=sample;
      break;
    }
  }
  const unit=state.police
    .map(car=>({car,along:(car.x-p.x)*Math.cos(angle)+(car.y-p.y)*Math.sin(angle),across:Math.abs((car.y-p.y)*Math.cos(angle)-(car.x-p.x)*Math.sin(angle))}))
    .filter(hit=>hit.along>0 && hit.along<=length+12 && hit.across<20)
    .sort((a,b)=>a.along-b.along)[0];
  const reach=unit?unit.along:length;
  const impact={x:p.x+Math.cos(angle)*reach,y:p.y+Math.sin(angle)*reach};
  state.traces.push({x:p.x,y:p.y-6,tx:impact.x,ty:impact.y,life:.19});
  state.particles.push({...impact,life:.32,max:.32,radius:unit?33:13,color:'#98ffdf'});
  if(unit){
    unit.car.stun=state.time+6;
    state.say('Patrol disabled · six seconds');
  }else if(state.heat===0){
    raiseHeat(state,1,8);
  }
  state.sound('pulse');
}
