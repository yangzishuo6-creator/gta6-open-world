function polygon(ctx,color,points) {
  ctx.fillStyle=color;
  ctx.beginPath();
  points.forEach(([x,y],i)=>i ? ctx.lineTo(x,y) : ctx.moveTo(x,y));
  ctx.closePath();
  ctx.fill();
}

export function portrait(canvas,speaker) {
  const ctx=canvas.getContext('2d');
  const nia=speaker==='Nia';
  ctx.fillStyle=nia ? '#78ac9b' : '#c38d69';
  ctx.fillRect(0,0,88,88);
  ctx.fillStyle='#ead69b';
  ctx.beginPath();
  ctx.arc(64,23,17,0,7);
  ctx.fill();
  polygon(ctx,'#424556',[[0,76],[21,63],[36,62],[66,69],[88,82],[88,88],[0,88]]);
  polygon(ctx,'#27293b',[[14,61],[19,21],[35,9],[53,8],[69,18],[73,40],[68,64],[54,74],[27,74]]);
  polygon(ctx,nia ? '#b16c55' : '#bb845d',[[32,27],[51,18],[65,30],[65,48],[61,59],[49,69],[36,64],[27,49]]);
  polygon(ctx,'#e7ad7a',[[48,30],[64,30],[65,47],[57,59],[49,62],[52,48],[47,44]]);
  polygon(ctx,'#292937',[[26,40],[29,22],[45,14],[65,22],[67,33],[52,25],[40,28],[31,44]]);
  polygon(ctx,'#443241',[[35,40],[46,38],[46,42],[38,43]]);
  polygon(ctx,'#443241',[[53,39],[63,40],[61,43],[53,42]]);
  polygon(ctx,'#754453',[[43,56],[53,55],[57,57],[50,60],[44,59]]);
  if (nia) polygon(ctx,'#ffd580',[[27,48],[31,49],[29,53],[28,58],[24,57],[24,50]]);
  else polygon(ctx,'#3e333c',[[35,53],[42,61],[55,62],[64,49],[61,62],[49,72],[38,66]]);
  polygon(ctx,nia ? '#d69c63' : '#536d74',[[18,72],[35,68],[49,78],[64,67],[78,75],[83,88],[13,88]]);
}

export function createDialogue() {
  const root=document.querySelector('#dialogue');
  const canvas=document.querySelector('#portrait');
  const name=document.querySelector('#speaker');
  const quote=document.querySelector('#quote');
  let previous;
  return message=>{
    root.hidden=!message;
    if (!message || message===previous) return;
    previous=message;
    portrait(canvas,message.speaker);
    name.textContent=message.speaker.toUpperCase()+' · '+(message.speaker==='Nia' ? 'FIXER' : 'MECHANIC');
    quote.textContent=message.line;
  };
}
