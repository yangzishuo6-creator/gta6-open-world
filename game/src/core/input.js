export function bindInput() {
  const keys=new Set();
  const pressed=new Set();
  const mouse={left:false,right:false,x:0,y:0,dx:0};
  window.addEventListener('keydown',event=>{
    if (['Space','ArrowUp','ArrowDown'].includes(event.code) && event.target===document.body) event.preventDefault();
    if (!keys.has(event.code)) pressed.add(event.code);
    keys.add(event.code);
  });
  window.addEventListener('keyup',event=>keys.delete(event.code));
  window.addEventListener('blur',()=>{
    keys.clear();
    pressed.clear();
    mouse.left=mouse.right=false;
  });
  window.addEventListener('contextmenu',event=>event.preventDefault());
  window.addEventListener('mousemove',event=>{
    mouse.x=event.clientX;
    mouse.y=event.clientY;
    if (document.pointerLockElement || mouse.right) mouse.dx+=event.movementX;
  });
  window.addEventListener('mousedown',event=>{
    if (event.target.tagName!=='CANVAS') return;
    if (event.button===0) mouse.left=true;
    if (event.button===2) {
      mouse.right=true;
      event.target.requestPointerLock?.()?.catch?.(()=>{});
    }
  });
  window.addEventListener('mouseup',event=>{
    if (event.button===0) mouse.left=false;
    if (event.button===2) mouse.right=false;
  });
  return {
    mouse,
    down:key=>keys.has(key),
    tap:key=>pressed.has(key),
    axis:(plus,minus)=>Number(keys.has(plus))-Number(keys.has(minus)),
    finish(){
      pressed.clear();
      mouse.dx=0;
    },
  };
}
