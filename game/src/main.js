import {buildCity,START} from './city.js';
import {populate,stepCourier,stepTraffic} from './traffic.js';
import {stepPursuit,firePulse} from './pursuit.js';
import {getSave,loadSave,interact,stepContracts,recover} from './contracts.js';
import {createScene} from './scene.js';
import {createInterface} from './interface.js';
import {createAudio} from './audio.js';

const canvas=document.querySelector('#city');
const city=buildCity();
const scene=createScene(canvas,city);
const hud=createInterface(city);
const audio=createAudio();
const keys=new Set();
const state={
  city,...populate(city),player:{...START,angle:0,walking:false,health:100},
  time:0,stage:0,cash:0,heat:0,heatUntil:0,spawnAt:0,fireAt:0,bumpAt:0,
  car:null,trial:null,police:[],traces:[],particles:[],toast:'',toastUntil:0,
  sound:audio.play,
  say(message){this.toast=message;this.toastUntil=this.time+3.8;},
  save(){
    const {x,y}=this.player;
    try{localStorage.setItem('harbor-bay-v1',JSON.stringify({stage:this.stage,cash:this.cash,x,y}));}catch{}
  }
};
const saved=getSave();
let paused=true,started=false,previous=performance.now();
hud.menu(true,started,saved);

function setPaused(open){
  paused=open;
  keys.clear();
  audio.update(state,!paused);
  hud.menu(paused,started,saved);
}

function begin(restore){
  audio.unlock();
  if(!started){
    if(restore) loadSave(state,saved);
    else state.save();
    scene.snap();
    started=true;
  }
  hud.refresh(state);
  setPaused(false);
}

hud.play.addEventListener('click',()=>begin(true));
hud.restart.addEventListener('click',()=>begin(false));
const movement=new Set(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright',' ']);
window.addEventListener('keydown',event=>{
  const key=event.key.toLowerCase();
  if(key==='escape'&&started&&!event.repeat) setPaused(!paused);
  if(paused) return;
  if(movement.has(key)){
    event.preventDefault();
    keys.add(key);
  }
  if(event.repeat) return;
  if(key==='e') interact(state);
  if(key==='m') state.say(audio.toggle()?'Audio muted':'Audio on');
});
window.addEventListener('keyup',event=>keys.delete(event.key.toLowerCase()));
window.addEventListener('blur',()=>keys.clear());
canvas.addEventListener('pointerdown',event=>{
  if(!paused && event.button===0) firePulse(state,scene.worldPoint(event.clientX,event.clientY));
});

function frame(now){
  const dt=Math.min(.033,(now-previous)/1000);
  previous=now;
  if(!paused || !started){
    state.time+=dt;
    stepTraffic(state,dt);
  }
  if(!paused){
    stepCourier(state,keys,dt);
    stepPursuit(state,dt);
    stepContracts(state);
    if(state.player.health<=0){recover(state);scene.snap();}
    state.traces=state.traces.filter(fx=>(fx.life-=dt)>0);
    state.particles=state.particles.filter(fx=>(fx.life-=dt)>0);
    hud.refresh(state);
    audio.update(state,true);
  }
  scene.render(state,dt,!started);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
