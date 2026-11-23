import * as T from 'three';
import {buildCity} from './world/cityBuilder.js';
import {lightWaterfront} from './world/atmosphere.js';
import {makeVehicle} from './vehicles/carModels.js';
import {spawnTraffic,updateTraffic} from './vehicles/trafficSystem.js';
import {driveVehicle,switchVehicle} from './vehicles/vehicleController.js';
import {makeRaceRivals,tickRaceRivals,racePosition} from './vehicles/raceRivals.js';
import {makePerson,posePerson,spawnPedestrians,updatePedestrians,movePlayer} from './actors/pedestrians.js';
import {makeDispatch,tickDispatch,raiseWanted} from './police/dispatch.js';
import {makeWeapons,aimWeapon,updateWeapons} from './combat/weapons.js';
import {currentObjective,tickStory} from './missions/storyMissions.js';
import {activityMarkers,availableActivity,startActivity,activityObjective,tickActivity} from './missions/activities.js';
import {makeCrew,tickCrew} from './missions/crew.js';
import {makeWaypoint} from './missions/waypoints.js';
import {makeRadio} from './audio/radio.js';
import {loadSave,saveGame} from './save/saveGame.js';
import {bindInput,neutralInput} from './core/input.js';
import {followPlayer} from './core/camera.js';
import {configureShot} from './core/shotMode.js';
import {updateHUD} from './ui/hud.js';
import {makeDialogue} from './ui/dialogue.js';
import {makeMenus} from './ui/menus.js';
import {renderPortrait} from './ui/portrait.js';

const shot=new URLSearchParams(location.search).get('shot');
const capture=['chase','foot','mission','title'].includes(shot);
const canvas=document.querySelector('#view');
const renderer=new T.WebGLRenderer({canvas,antialias:true,preserveDrawingBuffer:capture});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=T.PCFSoftShadowMap;
renderer.toneMapping=T.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.15;
const scene=new T.Scene(),camera=new T.PerspectiveCamera(62,innerWidth/innerHeight,.12,468);
const light=lightWaterfront(scene);
buildCity(scene);
const cars=spawnTraffic(scene);
const starter=Object.assign(makeVehicle(scene,0xe35225,{sport:true}),{owned:true,x:4.9,z:8});
cars.push(starter);
const rivals=makeRaceRivals(scene);
const pedestrians=spawnPedestrians(scene);
const player=makePerson(scene,0xe19651,1);
const dispatch=makeDispatch(scene),weapons=makeWeapons(scene),crew=makeCrew(),radio=makeRadio();
const dialogue=makeDialogue(),state={chapter:0,stage:0};
const waypoint=makeWaypoint(scene);
const eventMarkers=activityMarkers().map(()=>makeWaypoint(scene,0x61d7d4));
const input=bindInput(canvas);
let activity=null,time=0,heading=0,hudTime=0;
const save=()=>{if(!capture)saveGame(state,player,weapons);};
const wanted=level=>raiseWanted(dispatch,level);
const say=(line,speaker)=>dialogue.say(line,speaker);

function newGame(continueGame=false) {
  const saved=continueGame?loadSave():null;
  Object.assign(state,{chapter:saved?.chapter??0,stage:saved?.stage??0});
  Object.assign(player,{x:saved?.x??-8.25,z:saved?.z??-8,heading:0,
    vehicle:null,health:saved?.health??100,armor:saved?.armor??100,
    cash:saved?.cash??250,xp:saved?.xp??0});
  Object.assign(starter,{x:4.9,z:8,heading:0,speed:0,damage:0});
  if(saved?.ownedCar) {
    const car=saved.ownedCar.name==='Vela GT'?starter:
      Object.assign(makeVehicle(scene,0x498a8d),{owned:true});
    if(!cars.includes(car))cars.push(car);
    Object.assign(car,{x:player.x,z:player.z,damage:saved.ownedCar.damage});
    player.vehicle=car;
  }
  weapons.slots.slice(1).forEach((item,i)=>item.ammo=saved?.ammo?.[i]??[48,150,24][i]);
  dispatch.heat=0;dispatch.quiet=0;
  dispatch.units.forEach(unit=>Object.assign(unit,{active:false,disabled:0,damage:0}));
  crew.forEach(member=>member.cooldown=0);
  heading=0;activity=null;
  weapons.slot=1;
  weapons.cooldown=weapons.flash=0;
  camera.position.set(player.x,3,player.z-7);
  menus.show('play');
  if(!capture)radio.unlock();
  if(!saved)say('Meet me by the Juniper Mile promenade. I kept a copy of the manifest.');
  else dialogue.hide();
  save();
}
const menus=makeMenus({newGame,resume:()=>menus.show('play'),canContinue:()=>!capture&&!!loadSave(),save});
function resize(){
  camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();
  renderer.setSize(innerWidth,innerHeight,false);
}
addEventListener('resize',resize);
resize();
renderPortrait(renderer);

function simulate(dt,controls=neutralInput,scripted=false){
  time+=dt;
  const play=menus.page==='play';
  let target=activityObjective(activity)??currentObjective(state);
  let hint='';
  if(play){
    if(controls.tap('KeyR'))radio.cycle();
    if(controls.tap('KeyM'))radio.toggle();
    tickCrew(crew,player,dispatch,controls,dt,say);
    const used=!activity&&tickStory(state,player,controls,wanted,say,save);
    const event=availableActivity(player);
    if(!used&&controls.tap('KeyE')){
      if(!activity&&event&&player.vehicle)activity=startActivity(event);
      else switchVehicle(player,cars,wanted);
    }
    if(player.vehicle){
      const collisions=activity?.event.kind==='Street race'?[...cars,...rivals.filter(rival=>rival.activity===activity)]:cars;
      driveVehicle(player.vehicle,controls,dt,collisions,scripted?Math.min(1,Math.abs(player.vehicle.speed)*.13/16):0);
      player.x=player.vehicle.x;player.z=player.vehicle.z;
      heading=player.vehicle.heading;
    } else {
      const turn=(controls.down('KeyA','ArrowLeft')?1:0)-(controls.down('KeyD','ArrowRight')?1:0);
      if(!controls.active)heading+=turn*dt*1.7;
      const moving=movePlayer(player,controls,heading,dt);
      player.heading=heading;
      aimWeapon(player,controls,camera);
      if(controls.active&&!scripted)heading+=(Math.atan2(Math.sin(player.heading-heading),Math.cos(player.heading-heading)))*dt*(controls.down('KeyW','ArrowUp')?1.5:.8);
      posePerson(player,time*11,moving,weapons.slot!==0&&(controls.active||shot==='foot'));
    }
    player.group.visible=!player.vehicle;
    const before=player.health;
    tickDispatch(dispatch,player,dt,time,scripted);
    if(player.health<before&&player.armor>0){
      const blocked=Math.min(before-player.health,player.armor);
      player.armor-=blocked;player.health+=blocked;
    }
    if(player.health<=0||player.vehicle?.damage>=100){
      player.vehicle=null;
      player.health=100;player.armor=65;player.cash=Math.max(0,player.cash-150);
      player.x=-8.1;player.z=7;heading=0;dispatch.heat=0;
      say('You’re back on Juniper Mile. The crew covered your escape.');
      save();
    }
    updateWeapons(weapons,player,controls,dispatch,dt,wanted,radio.tone);
    if(activity)activity=tickActivity(activity,player,dt,say,save);
    if(!scripted)dialogue.tick(dt);
    target=activityObjective(activity)??currentObjective(state);
    if(!scripted) {
      if(target?.action==='use'&&Math.hypot(player.x-target.x,player.z-target.z)<6.5)hint='Interact';
      else if(event&&!activity&&player.vehicle)hint='Start '+event.kind.toLowerCase();
      else if(!player.vehicle&&cars.some(car=>Math.abs(car.speed)<=12&&Math.hypot(car.x-player.x,car.z-player.z)<4.2))hint='Enter vehicle';
    }
    radio.tick(!!player.vehicle,Math.abs(player.vehicle?.speed??0));
  } else {
    player.group.visible=false;
    tickDispatch(dispatch,player,dt,time);
  }
  tickRaceRivals(rivals,play?activity:null,dt,time);
  updateTraffic(cars,player.vehicle,dt,time,player);
  updatePedestrians(pedestrians,player,time,dt,dispatch.heat);
  waypoint(play?target:null,time);
  eventMarkers.forEach((marker,index)=>marker(play&&!activity?activityMarkers()[index]:null,time));
  if(play&&(time>=hudTime||scripted)){
    updateHUD(player,dispatch,target,crew,weapons,radio,cars,hint,racePosition(rivals,player,activity));
    hudTime=time+.095;
  }
  followPlayer(camera,player,dt,play?null:'title',heading);
  light(play?player.x:0,play?player.z:30);
}

if(capture){
  if(shot==='title'){
    Object.assign(player,{x:0,z:32});
    menus.show('title');
  }else{
    newGame();
    activity=configureShot(shot,{player,state,dispatch,crew,weapons,cars,starter,dialogue});
  }
  for(let i=0;i<115;i++)simulate(1/60,neutralInput,true);
  renderer.render(scene,camera);
  document.documentElement.dataset.captureReady=shot;
  addEventListener('resize',()=>renderer.render(scene,camera));
}else{
  Object.assign(player,{x:0,z:32});
  menus.show('title');
  let last=performance.now();
  function frame(now){
    const dt=Math.min(.05,(now-last)/1000);last=now;
    if(input.tap('Escape')){
      if(menus.page==='play')menus.show('pause');
      else if(menus.page==='pause')menus.show('play');
      else if(menus.page==='pause-controls')menus.show('pause');
      else if(menus.page==='title-controls')menus.show('title');
    }
    if(!menus.page.startsWith('pause'))simulate(dt,input);
    input.pressed.clear();
    renderer.render(scene,camera);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
