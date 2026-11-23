import {roadXs,roadZs} from '../world/cityBuilder.js';
export function drawMinimap(canvas,player,target,units,cars,events) {
  const ctx=canvas.getContext('2d'), size=canvas.width, c=size/2, scale=1.45;
  const rx=x=>c-(x-player.x)*scale,rz=z=>c-(z-player.z)*scale;
  ctx.clearRect(0,0,size,size);
  ctx.save();
  ctx.beginPath();ctx.arc(c,c,c-5,0,Math.PI*2);ctx.clip();
  ctx.fillStyle='#233844';ctx.fillRect(0,0,size,size);
  ctx.fillStyle='#146172';ctx.fillRect(0,0,rx(34),size);
  ctx.fillStyle='#81725c';ctx.fillRect(rx(34),0,30*scale,size);
  ctx.fillStyle='#566370';
  for(const x of roadXs)ctx.fillRect(rx(x+7.5),0,15*scale,size);
  for(const z of roadZs)ctx.fillRect(rx(6),rz(z+7.5),size,15*scale);
  ctx.strokeStyle='#a29d87';ctx.lineWidth=1.1;ctx.setLineDash([4,7]);
  ctx.beginPath();
  for(const x of roadXs){ctx.moveTo(rx(x),0);ctx.lineTo(rx(x),size);}
  for(const z of roadZs){ctx.moveTo(rx(6),rz(z));ctx.lineTo(size,rz(z));}
  ctx.stroke();ctx.setLineDash([]);
  const dot=(x,z,color,r)=>{ctx.fillStyle=color;ctx.beginPath();ctx.arc(rx(x),rz(z),r,0,7);ctx.fill();};
  for(const car of cars)dot(car.x,car.z,'#d3c8ad',2);
  for(const event of events)dot(event.x,event.z,'#79e3de',4);
  for(const police of units)if(police.active)dot(police.x,police.z,'#ff6c76',5);
  if(target) {
    const dx=rx(target.x)-c,dz=rz(target.z)-c,factor=Math.min(1,(c-15)/(Math.hypot(dx,dz)||1));
    ctx.setLineDash([5,6]);ctx.strokeStyle='#ffd276';ctx.lineWidth=2.6;
    ctx.beginPath();ctx.moveTo(c,c);ctx.lineTo(c+dx*factor,c+dz*factor);ctx.stroke();
    ctx.setLineDash([]);ctx.fillStyle='#ffcd70';
    ctx.beginPath();ctx.arc(c+dx*factor,c+dz*factor,5.4,0,7);ctx.fill();
  }
  ctx.translate(c,c);ctx.rotate(-(player.vehicle?.heading??player.heading));
  ctx.fillStyle='#fffcdf';ctx.beginPath();ctx.moveTo(0,-11);ctx.lineTo(7,7);ctx.lineTo(0,4);ctx.lineTo(-7,7);ctx.closePath();ctx.fill();
  ctx.restore();
  ctx.strokeStyle='#f3d19c';ctx.lineWidth=2;ctx.beginPath();ctx.arc(c,c,c-3,0,7);ctx.stroke();
}
