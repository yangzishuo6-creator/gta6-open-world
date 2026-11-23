const stations=[
  {name:'88.5 Coastline FM — Copper Tide',bass:[45,45,48,43,45,52,48,43],lead:[69,72,76,74,67,72,69,64],beat:.24},
  {name:'103.1 Night Ferry — Last Crossing',bass:[41,41,48,44,46,46,51,43],lead:[65,72,77,75,70,73,75,67],beat:.31},
  {name:'RADIO OFF',bass:[],lead:[],beat:.3},
];

export function createRadio() {
  let audio;
  let index=0;
  let pulse=0;
  let next=0;
  let driveTone;
  let driveGain;
  let output;
  function tone(hz,duration,shape,volume,at=audio?.currentTime) {
    if (!audio || audio.state!=='running') return;
    const o=audio.createOscillator();
    const gain=audio.createGain();
    o.type=shape;
    o.frequency.setValueAtTime(hz,at);
    gain.gain.setValueAtTime(volume,at);
    gain.gain.exponentialRampToValueAtTime(.0001,at+duration);
    o.connect(gain).connect(output);
    o.start(at);
    o.stop(at+duration);
  }
  return {
    muted:false,
    unlock() {
      if (!audio) {
        audio=new AudioContext();
        output=audio.createGain();
        output.connect(audio.destination);
        driveTone=audio.createOscillator();
        driveGain=audio.createGain();
        driveTone.type='triangle';
        driveGain.gain.value=0;
        driveTone.connect(driveGain).connect(output);
        driveTone.start();
      }
      audio.resume();
    },
    cycle(){ index=(index+1)%stations.length; },
    label(){ return stations[index].name; },
    effect(hz,seconds,shape){ tone(hz,seconds,shape,.11); },
    update(state) {
      if (!audio || audio.state!=='running') return;
      output.gain.setTargetAtTime(this.muted ? 0 : 1,audio.currentTime,.05);
      const rolling=state.mode==='play' && state.car;
      driveGain.gain.setTargetAtTime(rolling ? .032 : 0,audio.currentTime,.12);
      driveTone.frequency.setTargetAtTime(rolling ? 34+Math.abs(state.car.speed)*3.1 : 34,audio.currentTime,.085);
      const station=stations[index];
      if (next<audio.currentTime) next=audio.currentTime+.02;
      if (!rolling || !station.bass.length) return;
      if (next<audio.currentTime+.12) {
        const hz=n=>440*2**((n-69)/12);
        const i=pulse++%8;
        tone(hz(station.bass[i]),.18,'triangle',.09,next);
        if (i%2===0) tone(62,.09,'sine',.15,next);
        if (i!==2) tone(hz(station.lead[i]),.17,'sine',.045,next+.04);
        next+=station.beat;
      }
    },
  };
}
