export function createAudio() {
  let audio,engine,level,muted=false;
  const cues={reward:[392,523,659],interact:[220,330],pulse:[263,101]};

  function unlock(){
    try{
      if(!audio){
        audio=new AudioContext();
        engine=audio.createOscillator();
        engine.type='triangle';
        level=audio.createGain();
        level.gain.value=0;
        engine.connect(level).connect(audio.destination);
        engine.start();
      }
      void audio.resume().catch(()=>{});
    }catch{}
  }

  function play(cue){
    if(!audio||muted) return;
    cues[cue]?.forEach((frequency,i)=>{
      const osc=audio.createOscillator(),volume=audio.createGain();
      const start=audio.currentTime+i*.075;
      osc.frequency.value=frequency;
      volume.gain.setValueAtTime(.07,start);
      volume.gain.exponentialRampToValueAtTime(.001,start+.15);
      osc.connect(volume).connect(audio.destination);
      osc.start(start);
      osc.stop(start+.16);
    });
  }

  function update(state,running){
    if(!level) return;
    const speed=Math.abs(state.car?.speed??0);
    const nearby=state.police.some(car=>Math.hypot(car.x-state.player.x,car.y-state.player.y)<340 && car.stun<state.time);
    const hz=state.car?44+speed*.36:nearby?485+Math.sin(state.time*7)*145:42;
    engine.frequency.setTargetAtTime(hz,audio.currentTime,.075);
    level.gain.setTargetAtTime(!running||muted?0:state.car?.04:nearby?.022:0,audio.currentTime,.08);
  }

  function toggle(){
    muted=!muted;
    return muted;
  }
  return {unlock,play,update,toggle};
}
