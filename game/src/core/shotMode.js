export function configureShot(mode,{player,state,dispatch,crew,weapons,cars,starter,dialogue}) {
  if(mode==='title')return null;
  player.cash=18450;
  player.xp=1666;
  player.health=86;
  player.armor=64;
  state.chapter=2;
  state.stage=2;
  weapons.slot=mode==='foot'?2:1;
  crew[1].cooldown=23;
  if(mode==='foot') {
    Object.assign(player,{x:-8.1,z:38,heading:.03});
    dispatch.heat=2;
    dialogue.say('Across the avenue, by the hotel. Keep the ledger out of their hands.');
    return null;
  }
  player.vehicle=starter;
  Object.assign(starter,{x:2.65,z:mode==='chase'?-21:-48,heading:0,speed:111/3.6,damage:18});
  Object.assign(player,{x:starter.x,z:starter.z,heading:0});
  for(const car of cars)if(car!==starter&&car.x>0&&car.x<7&&car.z>-62&&car.z<68) car.z+=161;
  const cameos=cars.filter(c=>c!==starter).slice(0,4);
  [[-5,47,Math.PI],[-2,61,Math.PI],[5.1,70,0],[3.2,86,0]].forEach(([x,z,heading],i)=>
    Object.assign(cameos[i],{x,z,heading,speed:0,route:null}));
  if(mode==='chase') {
    dispatch.heat=4;
    dialogue.say('Two cruisers on you. Take the coast road to Beacon Pier.');
    return null;
  }
  starter.damage=4;
  starter.speed=26.5;
  dialogue.say('Keep your speed through the lights. I’ll call the next turn.');
  return {event:{name:'The Coast Circuit',kind:'Street race',route:[[3,-96],[3,-48],[3,0],[3,48],[3,96],[-48,96],[-48,48]],payout:850},index:2,time:42};
}
