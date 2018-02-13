// prefix correct event animation
export function whichAnimationEvent(){
  var t;
  var el = document.createElement('fakeelement');
  var animations = {
    'animation':'animationend',
    'OAnimation':'oAnimationEnd',
    'MozAnimation':'animationend',
    'WebkitAnimation':'webkitAnimationEnd'
  }

  for(t in animations){
      if( el.style[t] !== undefined ){
          return animations[t];
      }
  }
}
