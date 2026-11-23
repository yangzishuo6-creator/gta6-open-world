export function makeCrew() {
  return [{key:'Q',name:'Nia',skill:'Signal jam',cooldown:0,limit:45},
    {key:'F',name:'Ivo',skill:'Field repair',cooldown:0,limit:60}];
}
export function tickCrew(crew,player,dispatch,input,dt,say) {
  for(const member of crew)member.cooldown=Math.max(0,member.cooldown-dt);
  if(input.tap('KeyQ')&&crew[0].cooldown===0&&dispatch.heat) {
    dispatch.heat=Math.max(0,dispatch.heat-2);
    dispatch.quiet=0;
    crew[0].cooldown=crew[0].limit;
    say('Patrol lost the channel. You have an opening.');
  }
  if(input.tap('KeyF')&&crew[1].cooldown===0&&player.vehicle) {
    player.vehicle.damage=Math.max(0,player.vehicle.damage-40);
    crew[1].cooldown=crew[1].limit;
    say('Ivo patched the damage. Bring it back in one piece.','Ivo');
  }
}
