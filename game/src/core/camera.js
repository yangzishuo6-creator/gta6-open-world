import * as T from 'three';

export function createView() {
  const camera=new T.PerspectiveCamera(61,1,.12,1800);
  return {camera,heading:0,ready:false};
}

export function followPlayer(state,dt) {
  const {view,car}=state;
  const camera=view.camera;
  if (state.mode==='title' || state.shot==='title') {
    camera.position.set(71,32,56);
    camera.lookAt(6,9,-124);
    return;
  }
  const p=state.position();
  if (car) view.heading=car.heading;
  else view.heading-=state.input.mouse.dx*.004;
  const angle=view.heading;
  const fx=-Math.sin(angle);
  const fz=-Math.cos(angle);
  const foot=state.shot==='foot';
  const chase=state.shot==='chase';
  const back=chase ? 5.9 : car ? 7.8 : foot ? 3.35 : 4.8;
  const side=chase ? -1.45 : car ? .55 : foot ? 1.32 : -1.20;
  const sideX=Math.cos(angle)*side;
  const sideZ=-Math.sin(angle)*side;
  const ideal=new T.Vector3(p.x-fx*back+sideX,car ? chase ? 3.35 : 3.65 : foot ? 2.54 : 4.15,p.z-fz*back+sideZ);
  let obstructed=false;
  for (let i=1;i<=7;i++) {
    const x=T.MathUtils.lerp(p.x,ideal.x,i/7);
    const z=T.MathUtils.lerp(p.z,ideal.z,i/7);
    if (state.lots.some(lot=>Math.abs(x-lot.x)<lot.w/2+1.15 && Math.abs(z-lot.z)<lot.d/2+1.15)) {
      obstructed=true;
      ideal.x=T.MathUtils.lerp(p.x,ideal.x,(i-1)/7);
      ideal.z=T.MathUtils.lerp(p.z,ideal.z,(i-1)/7);
      ideal.y=5.2;
      break;
    }
  }
  camera.position.lerp(ideal,view.ready && !obstructed ? 1-Math.exp(-dt*10) : 1);
  const lead=foot ? 8 : chase ? 14 : 17;
  camera.lookAt(p.x+fx*lead+(chase ? 2.3 : foot ? .8 : 0),car ? chase ? 3.18 : 2.5 : foot ? 1.82 : 2.25,p.z+fz*lead);
  view.ready=true;
}
