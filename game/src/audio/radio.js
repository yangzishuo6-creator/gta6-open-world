const stations=[
  {name:'89.3  Shoreline FM',notes:[48,55,60,63,50,57,62,65],beat:.28,style:'triangle'},
  {name:'104.7  Port After Dark',notes:[43,43,50,58,46,53,55,58],beat:.21,style:'sine'},
  {name:'96.1  Juniper Jazz',notes:[51,58,62,65,53,60,63,67],beat:.33,style:'triangle'}
];
export function makeRadio() {
  let context;
  let index=0,mute=false,next=0,step=0;
  function unlock() {
    context??=new AudioContext();
    context.resume().catch(()=>{});
  }
  function tone(freq,duration,type='sine',volume=.06,start=context?.currentTime) {
    if(!context||context.state!=='running'||mute)return;
    const oscillator=context.createOscillator(), envelope=context.createGain();
    oscillator.type=type;
    oscillator.frequency.setValueAtTime(freq,start);
    envelope.gain.setValueAtTime(volume,start);
    envelope.gain.exponentialRampToValueAtTime(.001,start+duration);
    oscillator.connect(envelope).connect(context.destination);
    oscillator.start(start);
    oscillator.stop(start+duration);
  }
  function tick(enabled,speed=0) {
    if(!enabled||!context||context.state!=='running'||mute)return;
    const station=stations[index],now=context.currentTime;
    if(now<next)return;
    const n=station.notes[step%station.notes.length];
    tone(440*2**((n-69)/12),station.beat*.92,station.style,.035);
    if(step%2===0)tone(step%4===0?56:123,.12,'sine',.05);
    if(speed>0)tone(30+speed*1.25,station.beat*.88,'triangle',.027);
    next=now+station.beat;
    step++;
  }
  return {unlock,tone,tick,cycle:()=>{index=(index+1)%stations.length;},
    toggle:()=>{mute=!mute;},get label(){return mute?'Radio off':stations[index].name;}};
}
