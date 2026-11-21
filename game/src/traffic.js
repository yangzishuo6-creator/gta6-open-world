import {GRID,SHORE,COLS,ROWS,randomGenerator,canOccupy,distance,clamp} from './city.js';

const PAINT=['#e97862','#f8d47f','#4fc3b2','#f7eacf','#b5a7d9','#568dac','#d47793'];
const SEED_CAR={x:977,y:654,angle:0,speed:0,color:'#ff795f',kind:'coupe'};

function carAt(x,y,angle,color,kind) {
  return {x,y,angle,color,kind,speed:0};
}

export function populate(city) {
  const rng=randomGenerator(533);
  const cars=[{...SEED_CAR},carAt(1338,320,0,'#5be0c7','coupe')];
  const people=[];
  for(let row=0;row<ROWS;row++){
    for(let col=0;col<COLS;col++){
      const x=SHORE+col*GRID,y=row*GRID;
      if(col<COLS-1){
        const flow=carAt(x+65+rng()*186,y+15,0,PAINT[(row+col*3)%7],row%3===0?'van':'coupe');
        flow.flow={axis:'x',min:SHORE-29,max:SHORE+(COLS-1)*GRID+27,velocity:65+rng()*58};
        cars.push(flow);
        if((col+row)%2===0) cars.push(carAt(x+105+rng()*98,y-33,Math.PI,PAINT[(row*3+col)%7],'coupe'));
      }
      if(row<ROWS-1){
        const flow=carAt(x+15,y+70+rng()*178,Math.PI/2,PAINT[(row*2+col)%7],col%3===0?'van':'coupe');
        flow.flow={axis:'y',min:-43,max:(ROWS-1)*GRID+33,velocity:60+rng()*55};
        cars.push(flow);
      }
    }
  }
  for(const block of city.blocks){
    for(let i=0;i<7;i++){
      const edge=(i%2===0);
      const x=block.x+(edge?9+rng()*211:10);
      const y=block.y+(edge?9:27+rng()*180);
      people.push({x,y,axis:edge?'x':'y',min:(edge?block.x:block.y)+8,max:(edge?block.x:block.y)+218,
        speed:(rng()>.45?1:-1)*(15+rng()*24),color:PAINT[Math.floor(rng()*7)],skin:['#d89664','#f2b98d','#915d49'][i%3]});
    }
  }
  return {cars,people};
}

export function stepTraffic(state,dt) {
  for(const car of state.cars){
    if(car===state.car || !car.flow) continue;
    const {axis,min,max,velocity}=car.flow;
    const ahead=state.cars.some(other=>other!==car && Math.abs(other[axis==='x'?'y':'x']-car[axis==='x'?'y':'x'])<15 && other[axis]-car[axis]>0 && other[axis]-car[axis]<47);
    car[axis]+=dt*velocity*(ahead?.12:1);
    if(car[axis]>max) car[axis]=min;
  }
  for(const person of state.people){
    person[person.axis]+=person.speed*dt;
    if(person[person.axis]<person.min || person[person.axis]>person.max){
      person[person.axis]=clamp(person[person.axis],person.min,person.max);
      person.speed*=-1;
    }
  }
}

export function moveBody(city,body,dx,dy,radius) {
  const oldX=body.x,oldY=body.y;
  if(canOccupy(city,body.x+dx,body.y,radius)) body.x+=dx;
  if(canOccupy(city,body.x,body.y+dy,radius)) body.y+=dy;
  return Math.hypot(body.x-oldX,body.y-oldY);
}

export function stepCourier(state,keys,dt) {
  const horizontal=Number(keys.has('d')||keys.has('arrowright'))-Number(keys.has('a')||keys.has('arrowleft'));
  const vertical=Number(keys.has('s')||keys.has('arrowdown'))-Number(keys.has('w')||keys.has('arrowup'));
  const p=state.player;
  if(!state.car){
    p.walking=Boolean(horizontal||vertical);
    if(!p.walking) return;
    p.angle=Math.atan2(vertical,horizontal);
    const rate=keys.has(' ')?208:136;
    moveBody(state.city,p,Math.cos(p.angle)*rate*dt,Math.sin(p.angle)*rate*dt,8);
    return;
  }
  const car=state.car, brake=keys.has(' ');
  car.speed+=-vertical*(car.kind==='van'?225:305)*dt;
  car.speed*=Math.pow(brake?.019:vertical?.82:.25,dt);
  car.speed=clamp(car.speed,-130,car.kind==='van'?270:365);
  const turn=Math.min(Math.abs(car.speed)/70,1);
  car.angle+=horizontal*dt*turn*(brake?3.6:2.5)*Math.sign(car.speed);
  const intended=Math.abs(car.speed*dt);
  const moved=moveBody(state.city,car,Math.cos(car.angle)*car.speed*dt,Math.sin(car.angle)*car.speed*dt,15);
  const obstacle=state.cars.find(other=>other!==car && distance(other,car)<26 && Math.cos(car.angle)*(other.x-car.x)*Math.sign(car.speed)+Math.sin(car.angle)*(other.y-car.y)*Math.sign(car.speed)>0);
  if((intended>2 && moved<intended*.22)||obstacle){
    if(Math.abs(car.speed)>90 && state.time>state.bumpAt){
      state.bumpAt=state.time+.5;
      p.health-=4;
      state.particles.push({x:car.x,y:car.y,life:.38,max:.38,color:'#ffd270',radius:27});
      if(obstacle && !obstacle.flow) moveBody(state.city,obstacle,Math.cos(car.angle)*14,Math.sin(car.angle)*14,13);
    }
    car.speed*=-.22;
  }
  Object.assign(p,{x:car.x,y:car.y,angle:car.angle});
}

export function nearbyCar(state) {
  return state.cars.reduce((best,car)=>distance(car,state.player)<(best?distance(best,state.player):48)?car:best,null);
}

export function changeVehicle(state) {
  const p=state.player;
  if(state.car){
    const car=state.car;
    if(Math.abs(car.speed)>100) return '';
    const exits=[car.angle+Math.PI/2,car.angle-Math.PI/2,car.angle+Math.PI];
    const angle=exits.find(a=>canOccupy(state.city,car.x+27*Math.cos(a),car.y+27*Math.sin(a),8));
    if(angle===undefined) return '';
    p.x=car.x+27*Math.cos(angle);
    p.y=car.y+27*Math.sin(angle);
    car.speed=0;
    state.car=null;
    return 'On foot';
  }
  const car=nearbyCar(state);
  if(!car) return '';
  car.flow=null;
  state.car=car;
  state.player.x=car.x;
  state.player.y=car.y;
  return car.kind==='van'?'Quayline van acquired':'Solara coupe acquired';
}
