/* Stop ornamental motion when the hero is offscreen or the tab is hidden. */
(()=>{'use strict';
 const hero=document.querySelector('.mountain-visual');if(!hero)return;
 let visible=true;
 const sync=()=>{hero.dataset.suspended=String(document.hidden||!visible);};
 const observer='IntersectionObserver'in window?new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();},{rootMargin:'40px'}):null;
 observer?.observe(hero);document.addEventListener('visibilitychange',sync);sync();
 addEventListener('pagehide',()=>observer?.disconnect());
 addEventListener('pageshow',event=>{if(event.persisted){observer?.observe(hero);sync();}});
})();
