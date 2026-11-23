export const campaign=[
  {title:'A Favor at Low Tide',pay:750,stages:[
    ['Meet Nia on the promenade',15,18,'arrive','Port Authority paid somebody to make a freighter disappear. I need to know who.'],
    ['Borrow a car with E',7.7,42,'car','There’s a car on the curb. Ivo can deal with the plates later.'],
    ['Bring the car to Ivo',-9,-67,'arrive','Take it to Ivo Motor Co. He’ll fit a receiver.'],
  ]},
  {title:'The Ghost Manifest',pay:1350,stages:[
    ['Scan the first dock reader',18,-103,'arrive','The pier reader still has power. Get close enough to copy the manifest.'],
    ['Pick up the paper manifest',-52,-128,'arrive','There’s a paper copy in the old loading lane. That one has names.'],
    ['Return the manifest to Nia',16,-55,'arrive','Bring it to me before the shift changes.'],
  ]},
  {title:'Shift Change',pay:1800,stages:[
    ['Reach the Port Patrol depot',-104,-192,'arrive','The deputy keeps a spare archive key in his locker.'],
    ['Take the archive key on foot',-108,-200,'foot','Leave your ride and walk in from the service road.'],
    ['Shake the Port Patrol tail',-52,-64,'lose','They logged the missing key. Lose the tail before you call.'],
  ]},
  {title:'The Breakwater Job',pay:3100,stages:[
    ['Meet Ivo for the break-in',-52,-64,'arrive','Ivo opened the service gate. Get to the records room before Patrol changes shifts.'],
    ['Lift the port ledger',-104,-128,'foot','That ledger names every payout. Get it out of the archive.'],
    ['Lose Port Patrol on Bayfront',4,-104,'lose','Take the coast road. Ivo left a clean car by the pier.'],
    ['Deliver the ledger to Nia',16,-233,'arrive','I found us a sympathetic reporter. Bring the ledger to Juniper.'],
  ]},
  {title:'A Clean Copy',pay:4200,stages:[
    ['Get an aerial at the hotel',-52,0,'arrive','The reporter won’t touch the original. We need to transmit a copy.'],
    ['Transmit from the pier',44,-103,'foot','Hold the receiver out over the water. Ivo’s listening.'],
    ['Reach Ivo’s safe curb',-9,-67,'arrive','Copy received. Get off the waterfront.'],
  ]},
  {title:'Harbor Lights',pay:6500,stages:[
    ['Collect Nia’s recording',16,-233,'arrive','The deputy’s voice is on this tape. We can tie him to the ledger.'],
    ['Escape the harbor lockdown',-156,-256,'lose','They sent everyone. Don’t lead them to the reporter.'],
    ['Deliver the recording to Bay Social',-9,58,'arrive','The whole city gets to hear it tonight. See you at Bay Social.'],
  ]},
];

export function currentStage(state) {
  return campaign[state.mission]?.stages[state.stage];
}

export function announceStage(state) {
  const stage=currentStage(state);
  if (stage) state.speak('Nia',stage[4],8);
}

export function advanceStory(state) {
  const mission=campaign[state.mission];
  const step=currentStage(state);
  if (!step || state.activity) return;
  const [,, ,kind]=step;
  const pos=state.position();
  const near=Math.hypot(pos.x-step[1],pos.z-step[2])< (kind==='lose' ? 120 : 9);
  const done=kind==='car' ? Boolean(state.car) :
    near && (kind==='lose' ? state.stars===0 : kind==='foot' ? !state.car : true);
  if (!done) return;
  state.stage++;
  if (state.stage===mission.stages.length) {
    state.cash+=mission.pay;
    state.xp+=220+state.mission*55;
    state.mission++;
    state.stage=0;
    state.audio.effect(440,.35,'triangle');
    if (!currentStage(state)) state.speak('Nia','The recording is public. Juniper belongs to its people again.',12);
  }
  if (currentStage(state)?.[3]==='lose') state.alert(state.mission===5 ? 5 : state.mission===3 ? 4 : 2,18);
  announceStage(state);
  state.save();
}
