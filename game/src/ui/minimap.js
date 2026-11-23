import {avenues,crossStreets} from '../world/cityBuilder.js';
import {raceRoute} from '../missions/activities.js';

export function createMinimap() {
  const canvas=document.querySelector('#map');
  const ctx=canvas.getContext('2d');
  return (state,marker)=>{
    const p=state.position();
    const scale=1.13;
    const x=world=>110+(world-p.x)*scale;
    const y=world=>110+(world-p.z)*scale;
    ctx.fillStyle='#31535b';
    ctx.fillRect(0,0,220,220);
    ctx.strokeStyle='#66928e';
    ctx.lineWidth=1;
    for (let i=19;i<211;i+=24) {
      ctx.beginPath();
      ctx.moveTo(0,i);
      ctx.lineTo(220,i);
      ctx.stroke();
    }
    ctx.fillStyle='#bd967b';
    ctx.fillRect(0,0,x(52),220);
    ctx.fillStyle='#465868';
    ctx.fillRect(0,0,x(9),220);
    ctx.fillStyle='#baa78f';
    for (const lot of state.lots) {
      ctx.fillRect(x(lot.x-lot.w/2),y(lot.z-lot.d/2),lot.w*scale,lot.d*scale);
    }
    ctx.fillStyle='#e3c9a5';
    for (const avenue of avenues) ctx.fillRect(x(avenue-4),0,8*scale,220);
    for (const street of crossStreets) ctx.fillRect(0,y(street-3.4),x(4),6.8*scale);
    ctx.fillRect(x(18),0,2,220);
    ctx.fillRect(x(21),y(-105),x(105)-x(21),6);
    if (state.activity?.kind==='race') {
      ctx.strokeStyle='#66f8db';
      ctx.lineWidth=5;
      ctx.beginPath();
      ctx.moveTo(110,110);
      for (const [mx,mz] of raceRoute(state.activity).slice(1)) ctx.lineTo(x(mx),y(mz));
      ctx.stroke();
    }
    for (const unit of state.units) {
      const q=unit.car.mesh.position;
      ctx.fillStyle='#ff776e';
      ctx.strokeStyle='#463341';
      ctx.lineWidth=2;
      ctx.beginPath();
      ctx.arc(x(q.x),y(q.z),5.5,0,7);
      ctx.fill();
      ctx.stroke();
    }
    if (marker) {
      const dx=x(marker[0])-110;
      const dy=y(marker[1])-110;
      const fit=Math.min(1,96/Math.max(.1,Math.hypot(dx,dy)));
      ctx.save();
      ctx.translate(110+dx*fit,110+dy*fit);
      ctx.rotate(Math.PI/4);
      ctx.fillStyle='#ffd176';
      ctx.fillRect(-6,-6,12,12);
      ctx.strokeStyle='#3e3040';
      ctx.strokeRect(-6,-6,12,12);
      ctx.restore();
    }
    ctx.save();
    ctx.translate(110,110);
    ctx.rotate(-state.view.heading);
    ctx.fillStyle='#a1ffe4';
    ctx.strokeStyle='#202b3a';
    ctx.lineWidth=2.8;
    ctx.beginPath();
    ctx.moveTo(0,-11);
    ctx.lineTo(8,8);
    ctx.lineTo(0,5);
    ctx.lineTo(-8,8);
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
    ctx.restore();
  };
}
