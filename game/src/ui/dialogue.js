export function makeDialogue() {
  const element=document.querySelector('#dialogue');
  return {
    say(text,speaker='Nia',duration=8) {
      element.querySelector('strong').textContent=speaker;
      element.querySelector('p').textContent=text;
      element.hidden=false;
      this.until=duration;
    },
    tick(dt) {
      if(this.until>0){this.until-=dt;if(this.until<=0)element.hidden=true;}
    },
    hide(){element.hidden=true;this.until=0;}
  };
}
