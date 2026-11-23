import {spawnCar} from '../vehicles/carModels.js';
import {addPatrol} from '../police/dispatch.js';
import {makePerson} from '../actors/pedestrians.js';
import {startActivity} from '../missions/activities.js';

export function readShot() {
  const name=new URLSearchParams(location.search).get('shot');
  return ['title','chase','foot','race'].includes(name) ? name : null;
}

export function stageShot(state) {
  if (state.shot==='title') return 1.5;
  state.mode='play';
  state.cash=18450;
  state.xp=2075;
  state.armour=68;
  state.health=88;
  state.mission=3;
  state.stage=2;
  if (state.shot==='foot') {
    state.hero.mesh.position.set(15.4,0,-26);
    state.hero.heading=.17;
    state.view.heading=.17;
    state.slot=3;
    state.stars=2;
    addPatrol(state,0,3.2,-52,Math.PI);
    addPatrol(state,1,-3.8,-74,Math.PI);
    for (let i=0;i<7;i++) {
      const person=makePerson(state.scene,13+i%3*2.8,-33-i*4.7,[0xe1a26f,0x66a297,0xc77b75][i%3],i+1);
      person.heading=i%2 ? 0 : Math.PI;
      state.people.push(person);
    }
    state.speak('Nia','Keep clear of the promenade crowd. The handoff is by the pier.',12);
    return 1.6;
  }
  const race=state.shot==='race';
  state.car=spawnCar(state.scene,'Aster Veloce',0xf29842,2.8,race ? 60 : 44,0);
  state.hero.mesh.visible=false;
  state.car.speed=race ? 18 : 111/3.6;
  if (race) {
    startActivity(state,'race');
    state.activity.rivals[0].mesh.position.set(-2.6,0,42);
    state.activity.rivals[1].mesh.position.set(-5.3,0,40);
    return 1.75;
  }
  state.car.damage=17;
  state.stars=4;
  addPatrol(state,0,5.2,46,-.05).car.speed=33;
  addPatrol(state,1,-4.1,47,.05).car.speed=34;
  addPatrol(state,2,-4.3,-57,Math.PI).car.speed=8;
  state.crew.ivo=22;
  state.speak('Nia','You’ve got the ledger. Stay on Bayfront and lose that spotlight before we meet.',12);
  return 1.7;
}
