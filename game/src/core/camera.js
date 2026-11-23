import * as T from 'three';

export function createView() {
  const camera=new T.PerspectiveCamera(61,1,.12,1800);
  return {camera,heading:0,ready:false};
}

export function followPlayer(state,dt) {
  const {view,car}=state;
  const camera=view.camera;
  if (state.mode==='title' || state.shot==='title') {
    camera.position.set(27,27,-34);
    camera.lookAt(5,8,-139);
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
  const race=state.shot==='race';
  const back=chase ? 16 : race ? 12.5 : car ? 8.5 : foot ? 5.7 : 4.8;
  const side=chase ? -3.7 : car ? .3 : foot ? 1.23 : -1.20;
  const sideX=Math.cos(angle)*side;
  const sideZ=-Math.sin(angle)*side;
  const ideal=new T.Vector3(p.x-fx*back+sideX,car ? chase ? 7.6 : 4.1 : foot ? 3.75 : 4.15,p.z-fz*back+sideZ);
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
  camera.lookAt(p.x+fx*lead+(chase ? 3.2 : 0),car ? chase ? 3.35 : 2.5 : foot ? 1.71 : 2.25,p.z+fz*lead);
  view.ready=true;
}
