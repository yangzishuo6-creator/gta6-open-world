import {distance,START,canOccupy} from './city.js';
import {raiseHeat} from './pursuit.js';
import {nearbyCar,changeVehicle} from './traffic.js';

const loft={x:1041,y:675,label:'Nia’s print shop'};
const locker={x:401,y:320,label:'Marina locker'};
const relay={x:1681,y:960,label:'Relay plaza'};
const slip={x:81,y:1280,label:'Ferry slip'};
const garage={x:721,y:1280,label:'Mechanic'};
const trial={x:1361,y:320,label:'Courier sprint'};
const checkpoints=[
  {x:1681,y:320,label:'Crown gate'},
  {x:2001,y:320,label:'Hotel turn'},
  {x:2001,y:640,label:'Glass arcade'},
  {x:1681,y:640,label:'Sprint finish'}
];

const story=[
  {name:'A Favor for Nia',instruction:'Meet Nia at the print shop. She has a lead on the port authority.',target:loft,action:'Talk to Nia'},
  {name:'The Tide Ledger',instruction:'Collect the missing ledger from the waterfront locker.',target:locker,action:'Open the locker'},
  {name:'Drop the Tail',instruction:'Shake the patrols. Keep moving or stun them with your pulse tool.',target:null},
  {name:'Open Channel',instruction:'Bring the ledger to the relay and broadcast the evidence.',target:relay,action:'Broadcast the ledger'},
  {name:'Last Ferry',instruction:'Lose dispatch, then bring the transmitter to Nia at the ferry slip.',target:slip,action:'Meet Nia at the ferry'},
  {name:'The Bay Is Yours',instruction:'Run timed deliveries in Crown Heights or fix up your ride at Beacon Market.',target:trial,action:'Start courier sprint'}
];

export function storyCharacters(state) {
  const point=state.stage===0?loft:state.stage===4?slip:null;
  return point?[{x:point.x+12,y:point.y+4,angle:Math.PI,speed:0,axis:'x',color:'#be6ca2',skin:'#d49a75'}]:[];
}

export function activeContract(state) {
  if(state.trial) return {name:'Crown Courier Sprint',instruction:'Drive through the gates before the clock runs out.',target:checkpoints[state.trial.gate],chapter:'SIDE JOB · '+Math.ceil(state.trial.until-state.time)+'s LEFT'};
  const contract=story[state.stage];
  return {...contract,chapter:state.stage===5?'FREE ROAM · STORY COMPLETE':'STORY / '+String(state.stage+1).padStart(2,'0')};
}

export function mapMarkers(state){
  return [
    {point:garage,color:'#9ff2ba',glyph:'+'},
    {point:trial,color:'#80ded3',glyph:'◆'},
    {point:activeContract(state).target,color:'#ffda79',glyph:'◆'}
  ].filter(marker=>marker.point);
}

function finish(state,message,cash=0) {
  state.cash+=cash;
  state.say(message);
  state.sound('reward');
  state.save();
}

function storyAction(state) {
  switch(state.stage){
    case 0:
      state.stage=1;
      finish(state,'NIA / Locker 14. Take whatever gets you there.');
      break;
    case 1:
      state.stage=2;
      raiseHeat(state,2,17);
      finish(state,'LEDGER SECURED / Port patrols inbound',250);
      break;
    case 3:
      state.stage=4;
      raiseHeat(state,3,21);
      finish(state,'BROADCAST LIVE / The city has the evidence',500);
      break;
    case 4:
      if(state.heat){
        state.say('NIA / Come back when your tail is gone.');
        break;
      }
      state.stage=5;
      state.player.health=100;
      finish(state,'STORY COMPLETE / Nia’s cut delivered',1250);
      break;
  }
}

function nextAction(state) {
  const p=state.player, contract=story[state.stage];
  if(state.stage<5 && contract.target && distance(p,contract.target)<52) return {label:contract.action,run:()=>storyAction(state)};
  if(!state.trial && distance(p,trial)<51 && state.car) return {
    label:'Start courier sprint',
    run:()=>{
      state.trial={gate:0,until:state.time+30};
      state.say('SPRINT / Four gates · $350');
      state.sound('reward');
    }
  };
  if(distance(p,garage)<51 && state.cash>=100 && p.health<100) return {
    label:'Restore condition · $100',
    run:()=>{
      p.health=100;
      finish(state,'Mechanic restored your condition',-100);
    }
  };
  if(state.car || nearbyCar(state)) return {
    label:state.car?'Exit vehicle':'Take vehicle',
    run:()=>{
      const entering=!state.car;
      const result=changeVehicle(state);
      if(!result){
        state.say('Slow down or find room to exit');
        return;
      }
      if(entering) raiseHeat(state,1,11);
      state.say(result);
      state.sound('interact');
    }
  };
  if(distance(p,trial)<51 && !state.trial) return {label:'Courier sprint requires a car',run:()=>state.say('Bring a car to enter the sprint')};
  return null;
}

export function interactionLabel(state) { return nextAction(state)?.label??''; }
export function interact(state) { nextAction(state)?.run(); }

export function stepContracts(state) {
  if(state.stage===2 && !state.heat){
    state.stage=3;
    finish(state,'NIA / Take the ledger to the relay at Crown Plaza.');
  }
  if(!state.trial) return;
  if(state.time>=state.trial.until){
    state.trial=null;
    state.say('Sprint expired · return to the start to retry');
    return;
  }
  if(state.car && distance(state.player,checkpoints[state.trial.gate])<47){
    state.trial.gate++;
    state.sound('interact');
    if(state.trial.gate===checkpoints.length){
      state.trial=null;
      finish(state,'SPRINT COMPLETE / $350 earned',350);
    }
  }
}

export function recover(state) {
  if(state.car) state.car.speed=0;
  Object.assign(state,{car:null,heat:0,heatUntil:0,police:[],trial:null,cash:Math.max(0,state.cash-75)});
  Object.assign(state.player,START,{health:100});
  state.say('Back at Juniper Mile · recovery fee up to $75');
  state.save();
}

export function getSave() {
  try{
    const saved=JSON.parse(localStorage.getItem('harbor-bay-v1'));
    if(saved && Number.isInteger(saved.stage) && saved.stage>=0 && saved.stage<=5 && Number.isFinite(saved.cash)) return saved;
  }catch{}
  return null;
}

export function loadSave(state,saved) {
  if(!saved) return;
  state.stage=saved.stage;
  state.cash=Math.max(0,saved.cash);
  if(Number.isFinite(saved.x)&&Number.isFinite(saved.y)&&canOccupy(state.city,saved.x,saved.y,8)){
    Object.assign(state.player,{x:saved.x,y:saved.y});
  }
}
