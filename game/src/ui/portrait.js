import * as T from 'three';
import {makePerson,posePerson} from '../actors/pedestrians.js';
import {box} from '../world/geometry.js';
export function renderPortrait(renderer) {
  const scene=new T.Scene();
  scene.background=new T.Color(0x3a756f);
  const person=makePerson(scene,0xe98d57,1);
  box(person.group,0x26272b,0,1.65,-.12,.31,.26,.19);
  for(const x of [-.066,.066])box(person.group,0x282939,x,1.62,.161,.046,.024,.023);
  box(person.group,0x6b302e,0,1.548,.165,.075,.016,.02);
  posePerson(person,0,false);
  scene.add(new T.HemisphereLight(0xffdbac,0x5b597a,3));
  const camera=new T.PerspectiveCamera(23,1,0.05,10);
  camera.position.set(.29,1.51,1.36);
  camera.lookAt(0,1.47,0);
  const previous=new T.Vector2();
  renderer.getSize(previous);
  renderer.setSize(128,128,false);
  renderer.render(scene,camera);
  document.querySelector('#portrait').src=renderer.domElement.toDataURL();
  renderer.setSize(previous.x,previous.y,false);
}
