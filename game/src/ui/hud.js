import {campaign,currentStage} from '../missions/storyMissions.js';
import {activityPoint,raceStandings} from '../missions/activities.js';
import {loadout} from '../combat/weapons.js';
import {nearestRide} from '../vehicles/vehicleController.js';
import {createDialogue,portrait} from './dialogue.js';
import {createMinimap} from './minimap.js';
import {garageNearby} from '../save/garage.js';

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
  portrait(get('nia-face'),'Nia');
  portrait(get('ivo-face'),'Ivo');
  const map=createMinimap();
  const dollars=new Intl.NumberFormat('en-US');
  const tags=Array.from({length:3},()=>{
    const node=document.createElement('span');
    node.className='rival-tag';
    get('rival-tags').append(node);
    return node;
  });
  const shapes=['M2 4h17v4h-8l-2 6H5l2-6H2z','M2 4h20v4h-8v5h-4V8H2z','M1 5h22v3H9l-4 5H1l2-5H1z','M1 5h8V3h10v2h4v3h-8l-1 5h-3V8H6l-3 3H1z','M7 7V5a5 5 0 0 1 10 0v2h2v8H5V7zm2 0h6V5a3 3 0 0 0-6 0z'];
  const slots=[...loadout,{name:'Locked'}].map((weapon,i)=>{
    const item=document.createElement('div');
    item.className='panel slot';
    item.title=weapon.name;
    item.innerHTML='<svg width="24" height="16" viewBox="0 0 24 16" aria-hidden="true"><path fill="currentColor" d="'+shapes[i]+'"/></svg><small></small>';
    item.classList.toggle('locked',i===loadout.length);
    get('slots').append(item);
    return item;
  });
  return state=>{
    const showing=state.mode==='play';
    get('hud').hidden=!showing;
    if (!showing) return;
    const run=state.activity;
    const racing=run?.kind==='race';
    const mission=campaign[state.mission];
    const step=currentStage(state);
    const marker=run ? activityPoint(run) : step ? [step[1],step[2]] : null;
    const p=state.position();
    const distance=marker ? Math.round(Math.hypot(p.x-marker[0],p.z-marker[1])) : 0;
    set('mission-name',run ? run.kind==='race' ? 'Juniper Circuit' : 'Pier Courier' : mission?.title ?? 'Harbor Bay');
    set('stage',run ? 'GATE '+(run.step+1)+' / '+(run.kind==='race' ? 6 : 5) : mission ? 'STAGE '+(state.stage+1)+'/'+mission.stages.length : 'CASE CLOSED');
    const objective=run ? 'Reach the next marker' : step?.[0] ?? 'Explore Juniper Mile';
    if (get('objective').textContent!==objective) {
      const split=objective.indexOf(' ');
      const emphasis=document.createElement('strong');
      emphasis.textContent=objective.slice(split+1);
      get('objective').replaceChildren(objective.slice(0,split+1),emphasis);
    }
    set('distance',marker ? distance+' m' : '—');
    const stages=run ? run.kind==='race' ? 6 : 5 : mission?.stages.length ?? 1;
    get('stage-fill').parentElement.style.setProperty('--segment',100/stages+'%');
    fill('stage-fill',run ? run.step/stages*100 : mission ? (state.stage+.5)/stages*100 : 100);
    get('dispatch').hidden=!state.stars;
    set('mission-tag',run ? 'SIDE ACTIVITY' : mission ? 'JOB '+(state.mission+1)+'/'+campaign.length : 'FREE ROAM');
    const seconds=Math.max(0,Math.ceil(run?.left ?? (state.stars ? state.heat : 0)));
    if (seconds) set('stage',Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0'));
    set('mission-next','NEXT: '+(run ? 'Clear the remaining checkpoints' :
      mission?.stages[state.stage+1]?.[0] ?? campaign[state.mission+1]?.title ?? 'Explore Harbor Bay'));
    const units=state.units.slice(0,3).map(unit=>
      '<div class="unit"><b>'+unit.id+'</b><span data-tactic="'+unit.tactic+'">'+unit.tactic+'</span><strong>'+
      Math.round(unit.car.mesh.position.distanceTo(p))+' m</strong></div>');
    if (state.stars>=4) units.push('<div class="unit air"><b>AIR-1</b><span data-tactic="SPOTLIGHT">SPOTLIGHT</span><strong>'+
      Math.round(state.heli.root.position.distanceTo(p))+' m</strong></div>');
    get('units').innerHTML=units.join('');
    set('unit-count',(state.units.length+Number(state.stars>=4))+' UNITS · '+state.stars+'★');
    set('dispatch-footer',[state.units.length>3 ? '+'+(state.units.length-3)+' more units' : '',
      state.units.some(unit=>unit.tactic==='ROADBLOCK') ? 'roadblock ahead' : ''].filter(Boolean).join(' · '));
    set('cash','$'+dollars.format(state.cash));
    const minute=(19*60+42+Math.floor(state.time/3))%1440;
    set('clock',String(Math.floor(minute/60)).padStart(2,'0')+':'+String(minute%60).padStart(2,'0'));
    get('wanted').hidden=!state.stars;
    get('air-status').hidden=state.stars<4;
    set('air-status','IN SIGHT — AIR UNIT HAS YOU');
    get('stars').innerHTML='WANTED <b>'+'★'.repeat(state.stars)+'</b>';
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
    get('race-status').hidden=!racing;
    get('nitro').hidden=!racing;
    get('boost-lines').hidden=!(racing && run.boosting) && !(state.car && Math.abs(state.car.speed)>27);
    if (racing) {
      const standings=raceStandings(state);
      set('race-position',state.car ? 'P'+(standings.indexOf(state.car)+1)+'/4' : 'ON FOOT');
      set('race-clock','LAP 1/1  ·  '+run.elapsed.toFixed(2)+'s');
      set('nitro','SHIFT · NITRO '+Math.round(run.nitro)+'%');
      run.rivals.forEach((car,i)=>{
        const point=car.mesh.position.clone();
        point.y+=2;
        point.project(state.view.camera);
        const node=tags[i];
        node.hidden=Math.abs(point.x)>.97 || Math.abs(point.y)>.97 || point.z>1;
        node.textContent='P'+(standings.indexOf(car)+1)+'  '+car.name;
        node.style.left=(point.x*.5+.5)*100+'%';
        node.style.top=(.5-point.y*.5)*100+'%';
      });
    } else tags.forEach(node=>{node.hidden=true;});
    if (state.car) {
      const kmh=Math.abs(state.car.speed)*3.6;
      set('car-name',state.car.name);
      set('gear',state.car.speed<0 ? 'R' : 'D'+Math.max(1,Math.ceil(kmh/34)));
      set('speed',Math.round(kmh));
      fill('speed-fill',kmh/1.5);
      set('damage',Math.round(100-state.car.damage)+'%');
      fill('condition',100-state.car.damage);
      set('radio','♫  '+state.audio.label());
    }
    const hit=state.hitUntil>state.time;
    get('crosshair').hidden=Boolean(state.car || !(state.input.mouse.right || state.shot==='foot' || hit));
    const crosshair=get('crosshair');
    crosshair.classList.toggle('hit',hit);
    if (state.hitPoint) {
      const point=state.hitPoint.clone().project(state.view.camera);
      crosshair.style.left=(point.x*.5+.5)*100+'%';
      crosshair.style.top=(.5-point.y*.5)*100+'%';
    }
    get('weapon-status').hidden=Boolean(state.car);
    const [rounds,reserve]=state.ammo[state.slot];
    set('weapon-status',loadout[state.slot].name+'  ·  '+rounds+' / '+reserve+'  ·  R RELOAD');
    slots.forEach((item,i)=>{
      item.classList.toggle('active',state.slot===i);
      const ammo=state.ammo[i];
      const label=ammo ? ammo.join('/') : 'LOCKED';
      if (item.lastElementChild.textContent!==label) item.lastElementChild.textContent=label;
    });
    const ride=!state.car && nearestRide(state);
    const prompt=garageNearby(state) && !state.shot ? 'IVO GARAGE  ·  H SAVE  ·  B AMMO $120' :
      ride ? 'E  Take '+ride.name : !run && !state.shot ? state.car ? 'R  Juniper Circuit' : 'C  Pier Courier' : '';
    get('prompt').hidden=!prompt;
    set('prompt',prompt);
    dialogue(state.message);
    map(state,marker);
  };
}
