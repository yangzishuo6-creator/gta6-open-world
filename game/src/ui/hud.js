import {drawMinimap} from './minimap.js';
import {districtAt} from '../world/cityBuilder.js';
import {activityMarkers} from '../missions/activities.js';

const byId=id=>document.getElementById(id);
const currency=new Intl.NumberFormat('en-US',{maximumFractionDigits:0});
export function updateHUD(player,dispatch,target,crew,weapons,radio,cars,hint,position) {
  byId('cash').textContent='$'+currency.format(player.cash);
  byId('stars').innerHTML=Array.from({length:5},(_,i)=>'<span class="'+(i<dispatch.heat?'lit':'')+'">★</span>').join('');
  byId('stars').setAttribute('aria-label',dispatch.heat+' wanted stars');
  byId('district').textContent=districtAt(player.x,player.z);
  const rank=1+Math.floor(player.xp/350);
  byId('rank').textContent='RANK '+String(rank).padStart(2,'0');
  byId('xp').textContent=(player.xp%350)+' / 350 XP';
  byId('reputation').textContent=rank>=5?'RESPECTED':rank>=3?'KNOWN':'NEW ARRIVAL';
  byId('xp-bar').style.width=(player.xp%350)/3.5+'%';
  byId('dispatch').hidden=!dispatch.heat;
  byId('unit-list').innerHTML=dispatch.units.filter(c=>c.active).map(c=>
    '<li><b>'+c.id+'</b><span>'+c.tactic+'</span><strong>'+Math.round(Math.hypot(c.x-player.x,c.z-player.z))+' m</strong></li>').join('')
    +(dispatch.heat>=4?'<li><b>AIR</b><span>Spotlight</span><strong>LIVE</strong></li>':'');
  byId('mission-tag').textContent=target?.time!=null?'CHECKPOINT '+target.step+'/'+target.total:'STAGE '+(target?.step??'—')+'/'+(target?.total??'—');
  byId('mission-name').textContent=target?.name??'Free Roam';
  byId('mission-objective').textContent=target?.text??'Explore Harbor Bay';
  byId('mission-bar').style.width=(target?target.step/target.total*100:100)+'%';
  byId('mission-distance').textContent=target?(target.time!=null?
    [position?'P'+position:'',Math.ceil(target.time)+' SEC'].filter(Boolean).join(' · '):
    Math.round(Math.hypot(target.x-player.x,target.z-player.z))+' M'):'';
  byId('health').style.width=Math.max(0,player.health)+'%';
  byId('armor').style.width=Math.max(0,player.armor)+'%';
  byId('weapons').innerHTML=weapons.slots.map((weapon,i)=>
    '<div class="'+(i===weapons.slot?'selected':'')+'"><kbd>'+(i+1)+'</kbd><b>'+weapon.name+'</b><small>'+(i?weapon.ammo:'∞')+'</small></div>').join('');
  byId('crew').innerHTML=crew.map(c=>'<div><kbd>'+c.key+'</kbd><span><b>'+c.name+'</b><small>'+c.skill+'</small></span><i class="'+(c.cooldown?'cool':'')+'">'+(c.cooldown?Math.ceil(c.cooldown)+'s':'●')+'</i></div>').join('');
  byId('vehicle').hidden=!player.vehicle;
  if(player.vehicle) {
    byId('speed').textContent=String(Math.round(Math.abs(player.vehicle.speed)*3.6)).padStart(2,'0');
    byId('car-name').textContent=player.vehicle.name;
    byId('damage').textContent=Math.round(player.vehicle.damage)+'% DMG';
    byId('speed-fill').style.width=Math.min(100,Math.abs(player.vehicle.speed)*100/43)+'%';
  }
  byId('radio').textContent=radio.label;
  byId('interact').hidden=!hint;
  byId('hint').textContent=hint;
  drawMinimap(byId('map'),player,target,dispatch.units,cars,activityMarkers());
}
