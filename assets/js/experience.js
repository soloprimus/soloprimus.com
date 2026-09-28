/* SoloPrimus: local, dependency-free interaction and conceptual graphics. */

(()=>{'use strict';

const t=(s,v)=>window.SoloLocale.t(s,v);

const root=document.documentElement,reduced=matchMedia('(prefers-reduced-motion: reduce)');

const menu=document.querySelector('.nav-links'),toggle=document.querySelector('.nav-toggle');

function closeMenu(){menu.classList.remove('is-open');toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label',t('Open menu'));}

toggle.addEventListener('click',()=>{const open=menu.classList.toggle('is-open');toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',t(open?'Close menu':'Open menu'));});

menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});document.addEventListener('click',e=>{if(!e.target.closest('.nav'))closeMenu();});

const themeButton=document.querySelector('.theme-toggle');function themeLabel(){themeButton.setAttribute('aria-label',t(root.dataset.theme==='dark'?'Switch to light theme':'Switch to dark theme'));}themeLabel();themeButton.addEventListener('click',()=>{root.dataset.theme=root.dataset.theme==='dark'?'light':'dark';try{localStorage.setItem('soloprimus-theme',root.dataset.theme);}catch(_){}themeLabel();drawAll();});document.querySelector('[data-year]').textContent=new Date().getFullYear();

if('IntersectionObserver'in window&&!reduced.matches){const obs=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');obs.unobserve(e.target);}}),{threshold:.08});document.querySelectorAll('.reveal').forEach(el=>{if(el.getBoundingClientRect().top>innerHeight){el.classList.add('is-observed');obs.observe(el);}});}

document.querySelectorAll('.faq details').forEach(item=>item.addEventListener('toggle',()=>{if(item.open)item.parentElement.querySelectorAll('details').forEach(other=>{if(other!==item)other.open=false;});}));

const dialog=document.querySelector('#reader'),body=document.querySelector('#reader-body');

const articles={investing:`<h2 id="reader-title"><span data-l10n="28">Build a thesis you can challenge</span></h2><p><span data-l10n="166">Essay · Investing</span></p><p><span data-l10n="167">Before asking where a price will go, ask what you own and why its value might change. A useful investment thesis starts with the business, not with a target price.</span></p><h3><span data-l10n="168">Start with the engine.</span></h3><p><span data-l10n="169">Describe who pays the company, what they pay for, and what has to happen for revenue to become cash. Separate growth in volume from changes in price or product mix.</span></p><h3><span data-l10n="170">Write the counterargument.</span></h3><p><span data-l10n="171">Choose the strongest explanation for why your thesis could be wrong. A competitor might lower prices, a customer might leave, or growth might require more capital than you expected.</span></p><h3><span data-l10n="172">Name the next evidence.</span></h3><p><span data-l10n="173">Record the operating indicator you expect to change, when you expect to see it, and what result would make you reconsider. The point is a decision you can revisit, not a prediction you have to defend.</span></p><p class="article-note"><span data-l10n="174">An illustrative research framework, not a current market report or personalized investment advice. No performance or return is implied.</span></p>`,ai:`<h2 id="reader-title"><span data-l10n="32">Give AI a job, not a wish list</span></h2><p><span data-l10n="175">Essay · Applied AI</span></p><p><span data-l10n="176">A new model is interesting. A repeatable improvement in your work is useful. Start the evaluation with one task you already do, and a clear definition of a good result.</span></p><h3><span data-l10n="177">Choose one bounded task.</span></h3><p><span data-l10n="178">Try structuring source notes, reviewing a draft, or classifying documents. Keep sensitive information out of a service until you understand its access and data controls.</span></p><h3><span data-l10n="179">Measure the whole workflow.</span></h3><p><span data-l10n="180">Include the time spent writing instructions, checking output, and correcting mistakes. A fast first draft that requires extensive repair may not save time.</span></p><h3><span data-l10n="181">Keep a human checkpoint.</span></h3><p><span data-l10n="182">Decide which claims need sources and which actions require your approval. Save a small set of examples so the same workflow can be tested again when tools change.</span></p><p class="article-note"><span data-l10n="183">An illustrative workflow guide. No particular product, benchmark, or outcome is endorsed or guaranteed.</span></p>`};

const info={about:`<h2 id="reader-title"><span data-l10n="184">Independent thinking, shared openly.</span></h2><p><span data-l10n="185">SoloPrimus is a research space for people making their own decisions about capital, technology, and creative work. We care about how an argument is built, what would change it, and how an idea holds up in practice.</span></p><p><span data-l10n="186">Every essay and resource we publish is free to read and use for your own learning.</span></p>`,legal:`<h2 id="reader-title"><span data-l10n="187">Terms & privacy</span></h2><p><span data-l10n="188">This site offers free access without registration and does not collect payments. External platforms, including Substack, have their own privacy policies.</span></p><p><span data-l10n="189">Research is educational and does not constitute personalized financial advice. This website stores your selected language and color theme locally in your browser.</span></p>`};

let lastFocus;function show(content){if(!content)return;lastFocus=document.activeElement;body.innerHTML=content;window.SoloLocale.translate(body);dialog.showModal();dialog.scrollTop=0;document.body.style.overflow='hidden';}

document.querySelectorAll('[data-read]').forEach(b=>b.addEventListener('click',()=>show(articles[b.dataset.read])));document.querySelectorAll('[data-info]').forEach(b=>b.addEventListener('click',()=>show(info[b.dataset.info])));document.querySelector('.close-dialog').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});dialog.addEventListener('close',()=>{document.body.style.overflow='';lastFocus?.focus();});

function filter(category){category=['all','investing','ai','creator'].includes(category)?category:'all';document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.filter===category)));let count=0;document.querySelectorAll('.library-card').forEach(c=>{c.hidden=category!=='all'&&c.dataset.category!==category;if(!c.hidden)count++;});const label=document.querySelector('.result-count');if(label)label.textContent=t('{count} entries',{count});}

document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{filter(b.dataset.filter);const url=new URL(location.href);if(b.dataset.filter==='all')url.searchParams.delete('category');else url.searchParams.set('category',b.dataset.filter);history.replaceState(null,'',url);}));const params=new URLSearchParams(location.search);if(document.querySelector('.library-grid')){filter(params.get('category')||'all');if(articles[params.get('read')])show(articles[params.get('read')]);}

// Motion depicts connected research concepts; it is not market data or a performance claim.

let paused=false,frame=0,last=0,elapsed=0;

const canvases=[...document.querySelectorAll('canvas[data-visual]')].map(canvas=>({canvas,c:canvas.getContext('2d'),visible:true,w:0,h:0})).filter(s=>s.c);

const canvasObserver='IntersectionObserver'in window?new IntersectionObserver(es=>{for(const e of es){const s=canvases.find(s=>s.canvas===e.target);if(s)s.visible=e.isIntersecting;}},{rootMargin:'40px'}):null;

canvases.forEach(s=>canvasObserver?.observe(s.canvas));

function draw(s,t){if(!s.w||!s.h)return;const{c,w,h}=s,style=getComputedStyle(root),accent=style.getPropertyValue('--graph').trim(),line=style.getPropertyValue('--line').trim();c.clearRect(0,0,w,h);c.lineCap='round';const phase=t*.00035;

if(s.canvas.dataset.visual==='market'){c.strokeStyle=line;c.lineWidth=.8;for(let i=1;i<5;i++){c.beginPath();c.moveTo(0,h*i/5);c.lineTo(w,h*i/5);c.stroke();}for(let n=0;n<3;n++){c.beginPath();c.lineWidth=n===2?2.8:1.2;c.strokeStyle=n===2?accent:line;for(let x=0;x<=w;x+=3){const p=x/w,y=h*.82-Math.pow(p,1.6)*h*(.35+n*.14)+Math.sin(p*13+phase+n)*h*.025;x===0?c.moveTo(x,y):c.lineTo(x,y);}c.stroke();}const p=(Math.sin(phase*.5)*.5+.5)*.75+.12,x=w*p,y=h*.82-Math.pow(p,1.6)*h*.63+Math.sin(p*13+phase+2)*h*.025;c.fillStyle=accent;c.beginPath();c.arc(x,y,4.5,0,Math.PI*2);c.fill();}

else if(s.canvas.dataset.visual==='network'){const cx=w*.57,cy=h*.46,rad=Math.min(w,h)*.29,points=[];for(let i=0;i<8;i++){const a=i*Math.PI/4+phase*.12;points.push([cx+Math.cos(a)*rad,cy+Math.sin(a)*rad]);}c.strokeStyle=line;c.lineWidth=1;points.forEach((p,i)=>{for(let j=i+1;j<points.length;j++)if((i+j)%3===0){c.beginPath();c.moveTo(...p);c.lineTo(...points[j]);c.stroke();}c.beginPath();c.moveTo(...p);c.lineTo(cx,cy);c.stroke();});points.forEach((p,i)=>{c.fillStyle=i%3===0?accent:line;c.beginPath();c.arc(...p,3.5,0,Math.PI*2);c.fill();const k=(phase*.3+i*.15)%1;c.fillStyle=accent;c.beginPath();c.arc(p[0]+(cx-p[0])*k,p[1]+(cy-p[1])*k,2,0,Math.PI*2);c.fill();});c.fillStyle=accent;c.beginPath();c.arc(cx,cy,9,0,Math.PI*2);c.fill();}

else{const cy=h*.52;for(let i=0;i<18;i++){const p=i/17,v=(Math.sin(p*Math.PI)**1.1)*(h*.3)*(.55+.45*Math.sin(phase*1.5+i*.32)**2),x=w*.08+p*w*.84;c.strokeStyle=i%4===0?accent:line;c.lineWidth=3;c.beginPath();c.moveTo(x,cy-v);c.lineTo(x,cy+v);c.stroke();}}}

function drawAll(){canvases.forEach(s=>draw(s,elapsed));}

const resize='ResizeObserver'in window?new ResizeObserver(es=>{for(const e of es){const s=canvases.find(s=>s.canvas===e.target);if(!s)continue;s.w=e.contentRect.width;s.h=e.contentRect.height;const dpr=Math.min(devicePixelRatio||1,2);s.canvas.width=Math.round(s.w*dpr);s.canvas.height=Math.round(s.h*dpr);s.c.setTransform(dpr,0,0,dpr,0,0);draw(s,elapsed);}}):null;canvases.forEach(s=>resize?.observe(s.canvas));

function tick(now){if(now-last>32){if(!paused&&!reduced.matches&&!document.hidden){elapsed+=Math.min(now-last,80);canvases.filter(s=>s.visible).forEach(s=>draw(s,elapsed));}last=now;}frame=requestAnimationFrame(tick);}if(canvases.length)frame=requestAnimationFrame(tick);reduced.addEventListener('change',drawAll);

document.querySelector('.motion-toggle')?.addEventListener('click',e=>{paused=!paused;root.classList.toggle('motion-paused',paused);const b=e.currentTarget;b.setAttribute('aria-pressed',String(paused));b.setAttribute('aria-label',t(paused?'Play animations':'Pause animations'));b.querySelector('.motion-label').textContent=t(paused?'Play motion':'Pause motion');b.querySelector('.pause-symbol').textContent=paused?'▷':'Ⅱ';});

addEventListener('languagechange',()=>{themeLabel();toggle.setAttribute('aria-label',t(menu.classList.contains('is-open')?'Close menu':'Open menu'));const b=document.querySelector('.motion-toggle');if(b){b.setAttribute('aria-label',t(paused?'Play animations':'Pause animations'));b.querySelector('.motion-label').textContent=t(paused?'Play motion':'Pause motion');}const label=document.querySelector('.result-count');if(label)label.textContent=t('{count} entries',{count:document.querySelectorAll('.library-card:not([hidden])').length});});

addEventListener('pagehide',()=>{cancelAnimationFrame(frame);resize?.disconnect();canvasObserver?.disconnect();});

addEventListener('pageshow',e=>{if(e.persisted){canvases.forEach(s=>{resize?.observe(s.canvas);canvasObserver?.observe(s.canvas);});if(canvases.length)frame=requestAnimationFrame(tick);}});

})();

