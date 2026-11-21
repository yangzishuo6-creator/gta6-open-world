import {districtAt,distance,SHORE,WIDTH,SOUTH} from './city.js';
import {activeContract,interactionLabel,mapMarkers} from './contracts.js';
import {box,disc,shape} from './city-art.js';

export function createInterface(city) {
  const select=id=>document.getElementById(id);
  const ids=['hud','menu','menu-title','menu-copy','play','new-game','district','chapter','mission','objective','distance','cash','stars','heat-label','health','mode','speed','prompt','toast','radar'];
  const node=Object.fromEntries(ids.map(id=>[id,select(id)]));
  const radar=node.radar.getContext('2d');
  let priorHeat=-1;

  function menu(open,started,saved) {
    node.menu.hidden=!open;
    node.hud.hidden=open;
    node['new-game'].hidden=started||!saved;
    node.play.firstChild.textContent=started?'Resume ':saved?'Continue story ':'Start story ';
    if(started){
      node['menu-title'].textContent='PAUSED';
      node['menu-copy'].textContent='Your story progress has been checkpointed.';
    }
    if(open) node.play.focus();
    else node.play.blur();
  }

  function refresh(state) {
    const p=state.player;
    const contract=activeContract(state);
    node.district.textContent=districtAt(p.x,p.y);
    node.chapter.textContent=contract.chapter;
    node.mission.textContent=contract.name;
    node.objective.textContent=contract.instruction;
    node.distance.textContent=!state.trial&&(state.stage===2||state.stage===4&&state.heat)
      ?'DISPATCH · '+Math.max(0,Math.ceil(state.heatUntil-state.time))+'s'
      :contract.target?contract.target.label.toUpperCase()+' · '+Math.round(distance(p,contract.target)/3)+' m':'';
    node.cash.textContent='$'+state.cash.toLocaleString('en-US');
    if(priorHeat!==state.heat){
      priorHeat=state.heat;
      node.stars.replaceChildren(...Array.from({length:3},(_,i)=>{
        const star=document.createElement('b');
        star.textContent='★';
        if(i>=priorHeat) star.className='inactive';
        return star;
      }));
      node['heat-label'].textContent=state.heat?'POLICE PURSUIT':'POLICE HEAT';
      node.stars.parentElement.parentElement.classList.toggle('hot',state.heat>0);
    }
    node.health.value=p.health;
    node.mode.textContent=state.car?(state.car.kind==='van'?'QUAYLINE VAN':'SOLARA COUPE'):'ON FOOT';
    node.speed.textContent=state.car?Math.round(Math.abs(state.car.speed)*.37)+' KM/H':'';
    const label=interactionLabel(state);
    node.prompt.textContent=label?'[ E ]  '+label:'';
    node.toast.textContent=state.time<state.toastUntil?state.toast:'';
    drawRadar(state);
  }

  function drawRadar(state) {
    const p=state.player,w=node.radar.width,h=node.radar.height,k=.19;
    const x=world=>w/2+(world-p.x)*k,y=world=>h/2+(world-p.y)*k;
    box(radar,'#22555d',0,0,w,h);
    box(radar,'#4a6564',x(SHORE-43),y(-66),(WIDTH-SHORE+43)*k,(SOUTH+66)*k);
    for(const b of city.blocks) box(radar,b.park?'#759974':'#273e42',x(b.x),y(b.y),b.size*k,b.size*k);
    for(const car of state.cars) disc(radar,'#8cadab',x(car.x),y(car.y),1.15);
    for(const car of state.police) disc(radar,'#ff8b77',x(car.x),y(car.y),3.3);
    for(const {point,color} of mapMarkers(state)){
      const px=x(point.x),py=y(point.y);
      const factor=Math.min(1,(w/2-8)/Math.abs(px-w/2),(h/2-8)/Math.abs(py-h/2));
      const a=w/2+(px-w/2)*factor,b=h/2+(py-h/2)*factor;
      shape(radar,color,[[a,b-5],[a+5,b],[a,b+5],[a-5,b]]);
    }
    radar.save();
    radar.translate(w/2,h/2);
    radar.rotate(p.angle);
    shape(radar,'#f9f7dc',[[8,0],[-5,5],[-3,0],[-5,-5]]);
    radar.restore();
  }

  return {menu,refresh,play:node.play,restart:node['new-game']};
}
