export function bindInput(canvas) {
  const keys=new Set(),pressed=new Set();
  const input={keys,pressed,aimX:0,aimY:0,mouseDown:false,active:false};
  addEventListener('keydown',e=>{
    if(e.target instanceof HTMLButtonElement && ['Enter','Space'].includes(e.code)) return;
    if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault();
    if(!keys.has(e.code)) pressed.add(e.code);
    keys.add(e.code);
  });
  addEventListener('keyup',e=>keys.delete(e.code));
  addEventListener('blur',()=>{keys.clear();pressed.clear();input.mouseDown=false;});
  canvas.addEventListener('pointermove',e=>{
    input.aimX=e.clientX/innerWidth*2-1;
    input.aimY=1-e.clientY/innerHeight*2;
    input.active=true;
  });
  canvas.addEventListener('pointerdown',e=>{if(e.button===0)input.mouseDown=true;});
  addEventListener('pointerup',()=>input.mouseDown=false);
  input.down=(...codes)=>codes.some(code=>keys.has(code));
  input.tap=code=>pressed.has(code);
  return input;
}
export const neutralInput={down:()=>false,tap:()=>false,mouseDown:false,active:false};
