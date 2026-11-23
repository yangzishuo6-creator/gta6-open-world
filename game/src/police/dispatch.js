import {makeVehicle,poseVehicle} from '../vehicles/carModels.js';
import {canOccupy} from '../world/cityBuilder.js';
import {buildHelicopter,updateHelicopter} from './helicopter.js';

const tactics=['Ramming','Flanking','Roadblock','Intercept','Backup'];
export function makeDispatch(scene) {
  const units=tactics.map((tactic,i)=>Object.assign(makeVehicle(scene,0x243751,{police:true}),
    {tactic,id:'P-'+(12+i*7),active:false,disabled:0}));
  return {units,air:buildHelicopter(scene),heat:0,quiet:0};
}
export function raiseWanted(dispatch,level) {
  dispatch.heat=Math.max(dispatch.heat,Math.min(5,level));
  dispatch.quiet=0;
}
export function tickDispatch(dispatch,player,dt,time,shot=false) {
  const {units,air,heat}=dispatch;
  const angle=player.vehicle?.heading??player.heading;
  let nearest=Infinity;
  units.forEach((car,i)=>{
    car.disabled=Math.max(0,car.disabled-dt);
    const active=i<[0,1,2,3,3,5][heat]&&car.disabled===0;
    car.model.visible=active;
    if(!active){car.active=false;return;}
    const offset=shot?[[-4.65,-2.1],[4.85,2.0],[-4.9,22],[-3,40],[5,-12]][i]:[[(i%2?1:-1)*5,-24],[6,-30],[-5,57],[-6,-39],[7,-46]][i];
    const [lateral,depth]=offset;
    const tx=player.x+Math.sin(angle)*depth+Math.cos(angle)*lateral;
    const tz=player.z+Math.cos(angle)*depth-Math.sin(angle)*lateral;
    if(!car.active||shot) {
      const roadblock=i===2&&!shot;
      car.x=roadblock?Math.min(0,Math.max(-192,Math.round(tx/48)*48))+1:tx;
      car.z=roadblock?Math.min(288,Math.max(-288,Math.round(tz/48)*48)):tz;
      car.heading=angle+(i===2?1.38:shot?(i===0?.10:-.08):0);
      car.active=true;
    }
    const distance=Math.hypot(player.x-car.x,player.z-car.z);
    nearest=Math.min(nearest,distance);
    if(!shot) {
      const roadblock=i===2;
      if(roadblock&&distance>105)car.active=false;
      const destinationX=player.x+(i===1?Math.cos(angle)*4+Math.sin(angle)*6:0);
      const destinationZ=player.z+(i===1?-Math.sin(angle)*4+Math.cos(angle)*6:0);
      const target=Math.atan2(destinationX-car.x,destinationZ-car.z);
      const turn=Math.atan2(Math.sin(target-car.heading),Math.cos(target-car.heading));
      if(!roadblock)car.heading+=Math.max(-2.1*dt,Math.min(2.1*dt,turn));
      const speed=roadblock?0:11+heat*5;
      const x=car.x+Math.sin(car.heading)*dt*speed,z=car.z+Math.cos(car.heading)*dt*speed;
      if(canOccupy(x,z,1)){ car.x=x;car.z=z; }
      else car.heading+=dt*2.5;
      if(distance<3.35) {
        if(player.vehicle) {
          player.vehicle.damage=Math.min(100,player.vehicle.damage+dt*(i===0?19:11));
          player.vehicle.speed*=Math.exp(-.7*dt);
        } else player.health-=dt*11;
      }
    }
    poseVehicle(car,time);
  });
  if(!shot&&heat) {
    dispatch.quiet=nearest>34?dispatch.quiet+dt:Math.max(0,dispatch.quiet-dt*2);
    if(dispatch.quiet>12){dispatch.heat--;dispatch.quiet=0;}
  }
  updateHelicopter(air,player,heat,time,dt,shot);
}
