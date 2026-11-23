import * as T from 'three';

export const loadout=[
  {name:'Sidearm',pace:.30,range:58,pitch:145},
  {name:'Compact',pace:.10,range:43,pitch:188},
  {name:'Scatter',pace:.62,range:25,pitch:89},
  {name:'Carbine',pace:.15,range:89,pitch:121},
];

export function updateWeapons(state,dt) {
  for (let i=0;i<loadout.length;i++) {
    if (state.input.tap('Digit'+(i+1))) state.slot=i;
  }
  state.shotCooldown-=dt;
  state.traces=state.traces.filter(trace=>{
    trace.life-=dt;
    if (trace.life>0) return true;
    state.scene.remove(trace.line);
    trace.line.geometry.dispose();
    trace.line.material.dispose();
    return false;
  });
  if (state.car || !state.input.mouse.left || state.shotCooldown>0) return;
  const tool=loadout[state.slot];
  state.shotCooldown=tool.pace;
  state.alert(state.stars ? Math.min(5,state.stars+1) : 2,2);
  state.audio.effect(tool.pitch,.13,'square');
  const direction=new T.Vector3();
  const mouse=state.input.mouse;
  const point=document.pointerLockElement ? new T.Vector2() : new T.Vector2(
    mouse.x/innerWidth*2-1,1-mouse.y/innerHeight*2);
  const aim=new T.Raycaster();
  aim.setFromCamera(point,state.view.camera);
  direction.copy(aim.ray.direction);
  const origin=state.hero.mesh.position.clone().add(new T.Vector3(0,1.43,0));
  const end=origin.clone().addScaledVector(direction,tool.range);
  const hit=state.people.find(person=>{
    const world=person.mesh.position.clone().add(new T.Vector3(0,1,0));
    return world.distanceTo(origin)<tool.range && aim.ray.distanceToPoint(world)<.73;
  });
  if (hit) {
    hit.down=5;
    end.copy(hit.mesh.position).y=1;
  }
  const line=new T.Line(new T.BufferGeometry().setFromPoints([origin,end]),
    new T.LineBasicMaterial({color:0xffd581,transparent:true,opacity:.88}));
  state.scene.add(line);
  state.traces.push({line,life:.07});
}
