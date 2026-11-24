import * as T from 'three';
import {buildCity,isBlocked} from './world/cityBuilder.js';
import {lightHarbor,makeOcean} from './world/atmosphere.js';
import {box} from './world/geometry.js';
import {populateTraffic,updateTraffic} from './vehicles/trafficSystem.js';
import {driveCar,nearestRide} from './vehicles/vehicleController.js';
import {makePerson,populateWalkers,urbanWalk,walkPlayer} from './actors/pedestrians.js';
import {updateDispatch} from './police/dispatch.js';
import {buildHelicopter,flyHelicopter} from './police/helicopter.js';
import {refillAmmo,updateWeapons} from './combat/weapons.js';
import {updateStreetEffects} from './combat/streetEffects.js';
import {announceStage,advanceStory,currentStage} from './missions/storyMissions.js';
import {activityPoint,makeCheckpoint,startActivity,updateActivities} from './missions/activities.js';
import {updateCrew} from './missions/crew.js';
import {createRadio} from './audio/radio.js';
import {saveGame} from './save/saveGame.js';
import {markGarage,serviceGarage,useGarage} from './save/garage.js';
import {bindInput} from './core/input.js';
import {createView,followPlayer} from './core/camera.js';
import {finishShot,readShot,stageShot} from './core/shotMode.js';
import {createHUD} from './ui/hud.js';
import {createMenus} from './ui/menus.js';

const canvasHost=document.getElementById('viewport');
const renderer=new T.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(1.5,devicePixelRatio));
renderer.toneMapping=T.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.04;
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=T.PCFSoftShadowMap;
canvasHost.append(renderer.domElement);
const scene=new T.Scene();
const lighting=lightHarbor(scene);
const water=makeOcean(scene);
const groundMarker=new T.Mesh(new T.RingGeometry(1.25,1.52,36),new T.MeshBasicMaterial({
  color:0xffd981,transparent:true,opacity:.86,side:T.DoubleSide,
}));
groundMarker.rotation.x=-Math.PI/2;
scene.add(groundMarker);
const beacon=new T.Group();
box(beacon,0xffca6e,0,2.28,0,.46,.46,.46).rotation.z=Math.PI/4;
scene.add(beacon);

const state={
  scene,lots:buildCity(scene),input:bindInput(),view:createView(),
  traffic:populateTraffic(scene),people:populateWalkers(scene),
  hero:makePerson(scene,15,28,0x385a6a,2),heli:buildHelicopter(scene),
  gate:makeCheckpoint(scene),audio:createRadio(),units:[],effects:[],ammo:refillAmmo(),hitUntil:0,
  crew:{nia:0,ivo:0},car:null,activity:null,shot:readShot(),mode:'title',
  time:0,heat:0,stars:0,cash:0,xp:0,mission:0,stage:0,slot:0,
  stats:{earned:0,stolen:0,escapes:0},owned:[],taken:new Set(),
  health:100,armour:45,shotCooldown:0,message:null,
  position(){ return this.car?.mesh.position ?? this.hero.mesh.position; },
  alert(level,seconds=15) {
    this.stars=Math.max(this.stars,level);
    this.heat=Math.max(this.heat,seconds);
  },
  damagePlayer(amount) {
    const absorbed=Math.min(this.armour,amount*.65);
    this.armour-=absorbed;
    this.health-=amount-absorbed;
    if (this.health<=0) {
      if (this.car) this.exitCar();
      this.hero.mesh.position.set(15,0,28);
      this.health=100;
      this.armour=35;
      this.stars=0;
      this.cash=Math.max(0,this.cash-250);
      this.view.ready=false;
      this.speak('Ivo','I brought you back to Juniper. Patrol kept your spare cash.',7);
      this.save();
    }
  },
  exitCar() {
    const car=this.car;
    const pos=car.mesh.position;
    const side=Math.cos(car.heading)*2.2;
    const offset=-Math.sin(car.heading)*2.2;
    const exit=[1,-1].map(sign=>[pos.x+side*sign,pos.z+offset*sign]).find(
      ([x,z])=>!isBlocked(this.lots,x,z));
    this.hero.mesh.position.set(exit?.[0] ?? pos.x,0,exit?.[1] ?? pos.z);
    this.hero.heading=car.heading;
    this.hero.mesh.visible=true;
    car.parked=true;
    car.speed=0;
    this.car=null;
    this.view.ready=false;
  },
  speak(speaker,line,seconds) { this.message={speaker,line,until:this.time+seconds}; },
  save(slot){ return saveGame(this,slot); },
  serviceGarage(key){ return serviceGarage(this,key); },
  drawShowroom(canvas) {
    const model=this.car ?? this.traffic.find(car=>car.name==='Aster Veloce');
    const display=new T.Scene();
    display.add(new T.HemisphereLight(0xfff1d0,0x75607c,2.5));
    const key=new T.DirectionalLight(0xffdfad,3);
    key.position.set(3,5,-4);
    display.add(key);
    const preview=model.mesh.clone();
    preview.position.set(0,0,0);
    preview.rotation.set(0,0,0);
    display.add(preview);
    const buffer=renderer.domElement;
    const camera=new T.PerspectiveCamera(30,buffer.width/buffer.height,.1,40);
    camera.position.set(7,3.3,-6);
    camera.lookAt(0,.72,0);
    const context=canvas.getContext('2d');
    const ratio=canvas.width/canvas.height;
    const width=Math.min(buffer.width,buffer.height*ratio);
    const height=width/ratio;
    display.background=new T.Color(0x224e53);
    renderer.render(display,camera);
    context.drawImage(buffer,(buffer.width-width)/2,(buffer.height-height)/2,width,height,0,0,canvas.width,canvas.height);
  },
  start(save) {
    if (this.car) this.exitCar();
    if (this.activity) this.activity.rivals.forEach(car=>scene.remove(car.mesh));
    this.activity=null;
    this.hero.mesh.position.set(save?.x ?? 15,0,save?.z ?? 28);
    this.view.heading=save?.heading ?? 0;
    this.hero.heading=this.view.heading;
    this.view.ready=false;
    this.hero.mesh.visible=true;
    this.cash=save?.cash ?? 300;
    this.xp=save?.xp ?? 0;
    this.health=save?.health ?? 100;
    this.armour=save?.armour ?? 45;
    this.mission=save?.mission ?? 0;
    this.stage=save?.stage ?? 0;
    this.ammo=save?.ammo ?? refillAmmo();
    this.stats={earned:0,stolen:0,escapes:0,...save?.stats};
    this.owned=save?.owned ?? [];
    this.taken.clear();
    this.hitUntil=0;
    this.shotCooldown=0;
    this.stars=0;
    this.crew={nia:0,ivo:0};
    this.mode='play';
    this.audio.unlock();
    announceStage(this);
    showMenu('play');
    this.save();
  },
  resume(){ this.mode='play'; showMenu('play'); this.audio.unlock(); },
  title(){ this.mode='title'; this.view.ready=false; showMenu('title'); },
};
markGarage(scene);
const drawHUD=createHUD();
const showMenu=createMenus(state);
const camera=state.view.camera;

function resize() {
  camera.aspect=innerWidth/innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth,innerHeight);
  document.documentElement.style.setProperty('--hud-scale',Math.min(innerWidth/1280,innerHeight/800));
}

function readActions() {
  const input=state.input;
  if (input.tap('KeyE')) {
    if (state.car) state.exitCar();
    else {
      const car=nearestRide(state);
      if (car) {
        if (!state.taken.has(car)) {
          state.stats.stolen++;
          state.taken.add(car);
        }
        if (!state.owned.includes(car.name)) state.owned.push(car.name);
        state.car=car;
        state.hero.mesh.visible=false;
        state.view.ready=false;
        state.alert(car.parked ? 1 : 2);
        state.audio.effect(118,.13,'triangle');
      }
    }
  }
  if (input.tap('KeyR') && state.car) startActivity(state,'race');
  if (input.tap('KeyC')) startActivity(state,'courier');
  if (input.tap('KeyT')) state.audio.cycle();
}

function updateMarker() {
  const stage=currentStage(state);
  const point=state.activity ? activityPoint(state.activity) : stage?.slice(1,3);
  beacon.visible=groundMarker.visible=state.mode==='play' && !state.shot && Boolean(point);
  if (!point) return;
  groundMarker.position.set(point[0],.19,point[1]);
  beacon.position.set(point[0],Math.sin(state.time*2)*.37,point[1]);
  beacon.rotation.y=state.time;
}

function stepWorld(dt) {
  state.time+=dt;
  water.value=state.time;
  if (state.mode==='play') {
    if (!state.shot) {
      readActions();
      if (state.car) driveCar(state,state.input,dt);
      else walkPlayer(state,state.input,dt);
      updateWeapons(state,dt);
      updateCrew(state,dt);
      useGarage(state);
    } else if (state.car) {
      state.car.mesh.position.z-=state.car.speed*dt;
    } else {
      walkPlayer(state,state.input,dt);
    }
    updateDispatch(state,dt);
    if (!state.shot) advanceStory(state);
    updateActivities(state,dt);
    if (state.message?.until<=state.time) state.message=null;
  }
  updateTraffic(state,dt);
  updateStreetEffects(state,dt);
  urbanWalk(state,dt);
  flyHelicopter(state,dt);
  updateMarker();
  followPlayer(state,dt);
}

function present() {
  lighting.follow(state.mode==='title' ? {x:0,z:-37} : state.position());
  camera.updateMatrixWorld();
  drawHUD(state);
  renderer.render(scene,camera);
}

window.addEventListener('resize',()=>{
  resize();
  if (state.shot) present();
});
resize();
if (state.shot) {
  const seconds=stageShot(state);
  for (let i=0;i<Math.round(seconds*60);i++) stepWorld(1/60);
  finishShot(state);
  showMenu(state.mode);
  requestAnimationFrame(present);
} else {
  showMenu('title');
  let previous=performance.now();
  function frame(now) {
    const dt=Math.min(.045,Math.max(.0001,(now-previous)/1000));
    previous=now;
    if (state.input.tap('Escape') || state.input.tap('KeyM')) {
      if (state.mode==='play') {
        state.mode='pause';
        showMenu('pause');
      } else if (state.mode==='pause') state.resume();
      else showMenu('title');
    }
    if (state.mode!=='pause') stepWorld(dt);
    state.audio.update(state);
    present();
    state.input.finish();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
