const events=[
  {name:'The Coast Circuit',kind:'Street race',x:3,z:-48,payout:850,limit:59,
    route:[[3,0],[3,48],[3,96],[-48,96],[-48,48],[-48,-48],[3,-48]]},
  {name:'Express Manifest',kind:'Courier sprint',x:-92,z:144,payout:540,limit:40,
    route:[[-96,96],[-48,96],[-48,48],[2,48],[12,66]]}
];
export function availableActivity(player) {
  return events.find(e=>Math.hypot(e.x-player.x,e.z-player.z)<10);
}
export function activityMarkers(){return events;}
export function startActivity(event) {
  return {event,index:0,time:event.limit};
}
export function activityObjective(active) {
  if(!active)return null;
  const {event,index,time}=active;
  const [x,z]=event.route[index];
  return {name:event.name,text:event.kind==='Street race'?'Hit the next race checkpoint':'Deliver the sealed manifest',
    x,z,step:index+1,total:event.route.length,time};
}
export function tickActivity(active,player,dt,say,save) {
  active.time-=dt;
  if(active.time<=0){say('Time’s up. Return to the start to run it again.');return null;}
  const target=activityObjective(active);
  if(Math.hypot(player.x-target.x,player.z-target.z)>9||!player.vehicle)return active;
  if(++active.index<active.event.route.length)return active;
  player.cash+=active.event.payout;
  player.xp+=250;
  say('Clean run. I’ve sent your payout.');
  save();
  return null;
}
