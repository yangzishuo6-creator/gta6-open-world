import * as T from 'three';
export function followPlayer(camera,player,dt,mode,walkingHeading=player.heading) {
  const heading=player.vehicle?.heading ?? walkingHeading;
  const forward=new T.Vector3(Math.sin(heading),0,Math.cos(heading));
  const side=new T.Vector3(Math.cos(heading),0,-Math.sin(heading));
  const origin=new T.Vector3(player.x,0,player.z);
  const position=origin.clone().addScaledVector(forward,player.vehicle?-10.4:-5.1)
    .addScaledVector(side,player.vehicle?-2.25:-1.7);
  position.y=player.vehicle?4.2:2.75;
  const target=origin.clone().addScaledVector(forward,player.vehicle?14:12);
  target.y=player.vehicle?3.7:3.0;
  if(mode==='title') {
    position.set(-32,27,-55);
    target.set(24,8,105);
  }
  camera.position.lerp(position,1-Math.exp(-8*dt));
  camera.lookAt(target);
  camera.fov=T.MathUtils.lerp(camera.fov,player.vehicle?62+Math.abs(player.vehicle.speed)*.14:62,1-Math.exp(-3*dt));
  camera.updateProjectionMatrix();
}
