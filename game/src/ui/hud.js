import {campaign,currentStage} from '../missions/storyMissions.js';
import {activityPoint} from '../missions/activities.js';
import {loadout} from '../combat/weapons.js';
import {nearestRide} from '../vehicles/vehicleController.js';
import {createDialogue} from './dialogue.js';
import {createMinimap} from './minimap.js';

export function createHUD() {
  const nodes=new Map();
  const get=id=>{
    if (!nodes.has(id)) nodes.set(id,document.getElementById(id));
    return nodes.get(id);
  };
  const set=(id,value)=>{
    if (get(id).textContent!==String(value)) get(id).textContent=value;
  };
  const fill=(id,value)=>{ get(id).style.width=Math.min(100,value)+'%'; };
  const dialogue=createDialogue();
  const map=createMinimap();
  const dollars=new Intl.NumberFormat('en-US');
  const slots=loadout.map((weapon,i)=>{
    const item=document.createElement('div');
    item.className='panel slot';
    item.innerHTML='<kbd>'+(i+1)+'</kbd>'+weapon.name;
    get('slots').append(item);
    return item;
  });
  return state=>{
    const showing=state.mode==='play' || state.mode==='pause';
    get('hud').hidden=!showing;
    if (!showing) return;
    const run=state.activity;
    const mission=campaign[state.mission];
    const step=currentStage(state);
    const marker=run ? activityPoint(run) : step ? [step[1],step[2]] : null;
    const p=state.position();
    const distance=marker ? Math.round(Math.hypot(p.x-marker[0],p.z-marker[1])) : 0;
    set('mission-tag',run ? 'SIDE ACTIVITY' : mission ? '◆ LEDGER CASE' : 'FREE ROAM');
    set('mission-name',run ? run.kind==='race' ? 'Juniper Circuit' : 'Pier Courier' : mission?.title ?? 'Harbor Bay');
    set('stage',run ? 'GATE '+(run.step+1)+' / '+(run.kind==='race' ? 6 : 5) : mission ? 'STAGE '+(state.stage+1)+'/'+mission.stages.length : 'CASE CLOSED');
    set('objective',run ? 'Reach the next marker · '+Math.ceil(run.left)+'s' : step?.[0] ?? 'Explore Juniper Mile');
    set('distance',marker ? distance+' m' : '—');
    fill('stage-fill',run ? run.step/5*100 : mission ? (state.stage+.5)/mission.stages.length*100 : 100);
    get('dispatch').hidden=!state.stars;
    const units=state.units.slice(0,3).map(unit=>
      '<div class="unit"><b>'+unit.id+'</b><span>'+unit.tactic+'</span><strong>'+
      Math.round(unit.car.mesh.position.distanceTo(p))+' m</strong></div>');
    if (state.stars>=4) units.push('<div class="unit air"><b>AIR-1</b><span>SPOTLIGHT</span><strong>'+
      Math.round(state.heli.root.position.distanceTo(p))+' m</strong></div>');
    get('units').innerHTML=units.join('');
    set('cash','$'+dollars.format(state.cash));
    get('stars').innerHTML='<b>'+'★'.repeat(state.stars)+'</b>'+'☆'.repeat(5-state.stars);
    get('stars').setAttribute('aria-label',state.stars+' of 5 wanted stars');
    const rank=Math.min(5,Math.floor(state.xp/800));
    set('rank',['ROOKIE','RUNNER','WHEELHAND','FIXER','HARBOR ACE','LEGEND'][rank]);
    set('xp',(state.xp%800)+' / 800 XP');
    fill('xp-fill',state.xp%800/8);
    set('nia-status',state.crew.nia ? Math.ceil(state.crew.nia)+'s' : 'READY');
    set('ivo-status',state.crew.ivo ? Math.ceil(state.crew.ivo)+'s' : 'READY');
    set('district',p.x<-78 ? 'CANNERY WARD' : 'JUNIPER MILE');
    set('standing',state.stars ? '● CONTESTED' : '● ALL CLEAR');
    fill('health',state.health);
    fill('armour',state.armour);
    get('telemetry').hidden=!state.car;
    if (state.car) {
      const kmh=Math.abs(state.car.speed)*3.6;
      set('car-name',state.car.name);
      set('gear',state.car.speed<0 ? 'R' : 'D'+Math.max(1,Math.ceil(kmh/34)));
      set('speed',Math.round(kmh));
      fill('speed-fill',kmh/1.5);
      set('damage',Math.round(state.car.damage)+'%');
      set('radio','♫  '+state.audio.label());
    }
    get('crosshair').hidden=Boolean(state.car || !(state.input.mouse.right || state.shot==='foot'));
    slots.forEach((item,i)=>item.classList.toggle('active',state.slot===i));
    const ride=!state.car && nearestRide(state);
    const prompt=ride ? 'E  Take '+ride.name : !run && !state.shot ? state.car ? 'R  Juniper Circuit' : 'C  Pier Courier' : '';
    get('prompt').hidden=!prompt;
    set('prompt',prompt);
    dialogue(state.message);
    map(state,marker);
  };
}
