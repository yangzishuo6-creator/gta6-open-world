export const story=[
  {name:'The Dead Drop',cash:650,stages:[
    ['Meet Nia at Juniper Mile',-8,7,'use','The Authority wiped my badge. They missed a copy of the manifest.'],
    ['Collect the burner at Beacon Boardwalk',12,39,'use','Take the burner. I’ll point you to the right container.'],
    ['Reach the Port Exchange garage',-47,48,'visit','I left a Vela in the turnout. It’s yours.']]},
  {name:'Paper Harbor',cash:900,stages:[
    ['Pick up the container key',-93,48,'use','Container 17. The key still works.'],
    ['Reach the bonded warehouse',-144,96,'visit','They moved the ledger into a bonded customs bay.'],
    ['Copy the seal register',-146,104,'use','I need every seal number before we touch the ledger.'],
    ['Take the register to Nia',-96,144,'use','Those seals belong to the commissioner’s private fleet.']]},
  {name:'Ledger Run',cash:2450,stages:[
    ['Reach the customs lot',-48,96,'visit','We have a short window. Go.'],
    ['Lift the port authority ledger',-48,104,'use','I see it in your feed. Get the original.',4],
    ['Bring the ledger to Beacon Pier',3,101,'visit','They’ve put units on the coast road. I’ll meet you on the pier.'],
    ['Hand the ledger to Nia',32,105,'use','The whole city is about to learn whose boats those are.']]},
  {name:'Borrowed Frequency',cash:1350,stages:[
    ['Recover the transmitter',-42,151,'use','The main station went dark. We’ll make our own signal.'],
    ['Reach the Crown Heights relay',-143,192,'visit','Stay on the upper grid. I can jam one radio band.'],
    ['Patch the transmitter into the relay',-146,196,'use','Channel is open. Find me somewhere safe to read it.',2]]},
  {name:'Ghost Fleet',cash:1800,stages:[
    ['Meet the harbor pilot',11,170,'use','The pilot kept a second set of books.'],
    ['Recover the pilot’s log',-49,192,'use','That log puts the commissioner aboard on every run.',3],
    ['Return to the boardwalk',12,147,'visit','Put the log and ledger side by side. We’re ready.']]},
  {name:'Open Channel',cash:4200,stages:[
    ['Reach the waterfront broadcast post',-3,240,'visit','Start the broadcast where everyone can see it.'],
    ['Upload the ledger and the pilot’s log',10,238,'use','We’re live. Keep driving until the whole file goes out.',5],
    ['Keep moving to the southern relay',-94,144,'visit','Ninety percent. Make it past the patrols.'],
    ['Meet Nia on the pier',36,105,'use','The files are public. Harbor Bay gets its harbor back.']]}
];
export function currentObjective(state) {
  const mission=story[state.chapter];
  if(!mission)return null;
  const [text,x,z,action,line,heat]=mission.stages[state.stage];
  return {name:mission.name,text,x,z,action,line,heat,step:state.stage+1,total:mission.stages.length};
}
export function tickStory(state,player,input,raiseHeat,say,save) {
  const target=currentObjective(state);
  if(!target||Math.hypot(player.x-target.x,player.z-target.z)> (target.action==='use'?6.5:12))return false;
  if(target.action==='use'&&!input.tap('KeyE'))return false;
  player.xp+=115;
  say(target.line);
  if(target.heat)raiseHeat(target.heat);
  if(++state.stage===target.total){
    player.cash+=story[state.chapter].cash;
    state.chapter++;
    state.stage=0;
  }
  save();
  return target.action==='use';
}
