import * as T from 'three';

function softTexture() {
  const canvas=document.createElement('canvas');
  canvas.width=canvas.height=64;
  const ctx=canvas.getContext('2d');
  const glow=ctx.createRadialGradient(32,32,1,32,32,32);
  glow.addColorStop(0,'#fff');
  glow.addColorStop(.4,'#ffffffb0');
  glow.addColorStop(1,'#ffffff00');
  ctx.fillStyle=glow;
  ctx.fillRect(0,0,64,64);
  return new T.CanvasTexture(canvas);
}

const texture=softTexture();
const streak=new T.CylinderGeometry(1,1,1,6);
const up=new T.Vector3(0,1,0);

function particle(state,point,color,size,life,rise=0,light=false) {
  const material=new T.SpriteMaterial({map:texture,color,transparent:true,depthWrite:false,
    blending:light ? T.AdditiveBlending : T.NormalBlending,toneMapped:false});
  const mesh=new T.Sprite(material);
  mesh.position.copy(point);
  mesh.scale.setScalar(size);
  state.scene.add(mesh);
  state.effects.push({mesh,life,duration:life,rise,size});
}

export function muzzleBurst(state,origin,end,color=0xffd184) {
  const direction=end.clone().sub(origin);
  const mesh=new T.Mesh(streak,new T.MeshBasicMaterial({color,toneMapped:false}));
  mesh.position.copy(origin).lerp(end,.5);
  mesh.quaternion.setFromUnitVectors(up,direction.clone().normalize());
  mesh.scale.set(.021,direction.length(),.021);
  state.scene.add(mesh);
  state.effects.push({mesh,life:.11,duration:.11});
  particle(state,origin,0xffa31d,1.45,.13,0,true);
  particle(state,origin,0xffffc3,.59,.11,0,true);
}

export function updateStreetEffects(state,dt) {
  state.effects=state.effects.filter(effect=>{
    effect.life-=dt;
    const {mesh}=effect;
    if (effect.life<=0) {
      state.scene.remove(mesh);
      mesh.material.dispose();
      return false;
    }
    if (effect.size) {
      mesh.position.y+=effect.rise*dt;
      mesh.scale.setScalar(effect.size*(1+.65*(1-effect.life/effect.duration)));
      mesh.material.opacity=effect.life/effect.duration;
    }
    return true;
  });
  const cars=[state.car,...state.traffic,...(state.activity?.rivals ?? [])];
  for (const car of cars) {
    if (!car || (car.nextEffect ?? 0)>state.time) continue;
    const burning=car.damage>=88;
    const drifting=state.activity?.kind==='race' && Math.abs(car.speed)>14 &&
      (car!==state.car || state.input.down('Space') || state.shot==='race');
    if (car.damage<48 && !drifting) continue;
    const t=state.time;
    car.nextEffect=t+(burning ? .06 : .13);
    const offset=drifting ? 2 : -1.55;
    const point=car.mesh.position.clone().add(new T.Vector3(
      Math.sin(car.heading)*offset+Math.cos(t*43)*.54,drifting ? .35 : 1.05,Math.cos(car.heading)*offset));
    const smoke=burning ? point.clone().add(new T.Vector3(0,.82,0)) : point;
    particle(state,smoke,drifting ? 0xd9d4cb : 0x383441,burning ? 3.7 : 1.45,burning ? 2.5 : .85,burning ? 2.7 : .85);
    if (burning) {
      const flame=point.clone().add(new T.Vector3(Math.sin(t*33)*.64,.72,0));
      flame.addScaledVector(state.position().clone().sub(point).setY(0).normalize(),1.8);
      particle(state,flame,0xff4811,4.2,.49,3.5,true);
      particle(state,flame,0xffc34d,2.1,.32,2.1,true);
      particle(state,point.clone().add(new T.Vector3(Math.sin(t*39)*1.7,.8,Math.cos(t*29))),
        0xffae3b,.49,.62,3.4,true);
    }
  }
}

export function addSirenReflection(car) {
  for (const [x,color] of [[-.92,0x3277ff],[.92,0xff3449]]) {
    const light=new T.Mesh(new T.PlaneGeometry(6.5,10),new T.MeshBasicMaterial({
      map:texture,color,transparent:true,opacity:.81,depthWrite:false,
      blending:T.AdditiveBlending,toneMapped:false,
    }));
    light.rotation.x=-Math.PI/2;
    light.position.set(x,.13,-1.9);
    car.mesh.add(light);
    const bloom=new T.Sprite(new T.SpriteMaterial({
      map:texture,color,opacity:.9,transparent:true,depthWrite:false,
      blending:T.AdditiveBlending,toneMapped:false,
    }));
    bloom.position.set(x*.51,1.65,0);
    bloom.scale.set(2.3,1.65,1);
    car.mesh.add(bloom);
  }
}

export function addCarLampBloom(car) {
  for (const side of [-1,1]) {
    for (const [z,color,size] of [[2.37,0xff3030,.92],[-2.24,0xffdf9f,.72]]) {
      const glow=new T.Sprite(new T.SpriteMaterial({
        map:texture,color,opacity:.72,transparent:true,depthWrite:false,
        blending:T.AdditiveBlending,toneMapped:false,
      }));
      glow.position.set(side*.72,.76,z);
      glow.scale.set(size,size*.48,1);
      car.mesh.add(glow);
    }
  }
}
