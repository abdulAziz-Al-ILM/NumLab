// NumLab UZ v3.0 — Universal Input Academic Edition

document.querySelectorAll('.tab').forEach(btn=>btn.addEventListener('click',()=>{
  document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
  document.querySelectorAll('.panel').forEach(x=>x.classList.remove('active'));
  btn.classList.add('active'); document.getElementById(btn.dataset.tab).classList.add('active');
}));

document.querySelectorAll('step-box').forEach(el=>{
  const key=el.dataset.key;
  el.outerHTML=`<div class="step-card-wrap"><div class="step-toolbar"><h3>Qadam-baqadam yechim</h3><div><button class="small secondary" onclick="stepPrev('${key}')">← Oldingi</button><button class="small" onclick="stepNext('${key}')">Keyingi →</button><button class="small secondary" onclick="stepAll('${key}')">Hammasini och</button></div></div><div id="${key}-steps" class="steps"><div class="empty">Hisoblang — qadamlar shu yerda paydo bo‘ladi.</div></div></div>`;
});

function toggleHelp(){document.getElementById('help').classList.toggle('hidden')}
function setVal(id,v){document.getElementById(id).value=v}
function fmt(x){return Number.isFinite(x)?(+x.toFixed(10)).toString():String(x)}
function esc(s){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}
function table(headers,rows){return `<table class="compare-table"><tr>${headers.map(h=>`<th>${h}</th>`).join('')}</tr>${rows.map(r=>`<tr>${r.map(v=>`<td>${v}</td>`).join('')}</tr>`).join('')}</table>`}

// ---------- Expression engine ----------
const FN=['sin','cos','tan','asin','acos','atan','sqrt','abs','exp','ln','log','floor','ceil','round','sinh','cosh','tanh'];
function superscriptsToPowers(s){
  const map={'⁰':'0','¹':'1','²':'2','³':'3','⁴':'4','⁵':'5','⁶':'6','⁷':'7','⁸':'8','⁹':'9'};
  return s.replace(/([xy)])([⁰¹²³⁴⁵⁶⁷⁸⁹]+)/g,(_,v,p)=>v+'^'+[...p].map(c=>map[c]).join(''));
}
function normalizeExpr(raw,vars=['x']){
  let s=String(raw).trim(); if(!s) throw new Error('Ifoda bo‘sh.');
  s=s.replace(/−/g,'-').replace(/[×·]/g,'*').replace(/÷/g,'/').replace(/π/gi,'pi').replace(/√\s*\(/g,'sqrt(').replace(/√\s*([xy]|\d+(?:\.\d+)?)/g,'sqrt($1)');
  s=superscriptsToPowers(s).replace(/Math\./g,'').replace(/,/g,'.');
  const eq=s.split('='); if(eq.length===2) s=`(${eq[0]})-(${eq[1]})`; else if(eq.length>2) throw new Error('Bitta tenglik belgisi ishlating.');
  s=s.replace(/\^/g,'**');
  const fnRe=FN.join('|');
  s=s.replace(new RegExp(`\\b(${fnRe})\\s+([xy])\\b`,'gi'),'$1($2)');
  s=s.replace(/\bln\s*\(/gi,'log(');
  s=s.replace(/(\d|\)|x|y)\s*(?=(x|y|\())/g,'$1*');
  s=s.replace(/(\d|\)|x|y)\s*(?=(sin|cos|tan|asin|acos|atan|sqrt|abs|exp|log|floor|ceil|round|sinh|cosh|tanh)\s*\()/gi,'$1*');
  s=s.replace(/\)\s*(?=\d)/g,')*');
  s=s.replace(/\bpi\b/gi,'PI').replace(/\be\b/g,'E');
  const identifiers=s.match(/[A-Za-z_]\w*/g)||[];
  const allowed=new Set([...vars,'PI','E',...FN.filter(x=>x!=='ln')]);
  for(const id of identifiers){if(!allowed.has(id)) throw new Error(`Noma’lum belgi yoki funksiya: ${id}`)}
  if(/[;{}\[\]`]/.test(s)) throw new Error('Ruxsat etilmagan belgi ishlatildi.');
  return s;
}
function compileExpr(raw,vars=['x']){
  const s=normalizeExpr(raw,vars);
  const args=[...vars,'PI','E',...FN.filter(x=>x!=='ln')];
  const values=[Math.PI,Math.E,...FN.filter(x=>x!=='ln').map(n=>Math[n]||Math.log)];
  const fn=new Function(...args,`"use strict";return (${s});`);
  return (...vv)=>fn(...vv,...values);
}
function parseScalar(raw){const f=compileExpr(raw,[]);const v=f();if(!Number.isFinite(v))throw new Error('Sonli qiymat hosil bo‘lmadi.');return v}
function parseNums(s){return String(s).trim().split(/[\s,;]+/).filter(Boolean).map(x=>parseScalar(x))}

const stepState={};
function setSteps(key,steps){stepState[key]={steps,index:0};const box=document.getElementById(key+'-steps');box.innerHTML=steps.map((s,i)=>`<div class="step-card" data-i="${i}"><div><span class="step-no">${i+1}</span><span class="step-title">${s.title}</span></div><div class="step-body">${s.body}</div></div>`).join('');renderSteps(key)}
function renderSteps(key){const st=stepState[key];if(!st)return;document.querySelectorAll(`#${key}-steps .step-card`).forEach((el,i)=>el.classList.toggle('visible',i<=st.index))}
function stepNext(key){const st=stepState[key];if(st){st.index=Math.min(st.index+1,st.steps.length-1);renderSteps(key)}}
function stepPrev(key){const st=stepState[key];if(st){st.index=Math.max(st.index-1,0);renderSteps(key)}}
function stepAll(key){const st=stepState[key];if(st){st.index=st.steps.length-1;renderSteps(key)}}

function drawAxes(ctx,w,h,xmin,xmax,ymin,ymax){ctx.clearRect(0,0,w,h);ctx.strokeStyle='#d7dee9';ctx.lineWidth=1;const X=x=>45+(x-xmin)/(xmax-xmin)*(w-65),Y=y=>h-32-(y-ymin)/(ymax-ymin)*(h-52);if(ymin<=0&&ymax>=0){ctx.beginPath();ctx.moveTo(45,Y(0));ctx.lineTo(w-20,Y(0));ctx.stroke()}if(xmin<=0&&xmax>=0){ctx.beginPath();ctx.moveTo(X(0),18);ctx.lineTo(X(0),h-32);ctx.stroke()}return{X,Y}}
function plotFunction(canvas,f,xmin,xmax,points=[]){const ctx=canvas.getContext('2d'),w=canvas.width,h=canvas.height;let vals=[];for(let i=0;i<=400;i++){let x=xmin+(xmax-xmin)*i/400;try{let y=f(x);if(Number.isFinite(y)&&Math.abs(y)<1e8)vals.push(y)}catch{}}if(!vals.length)return;let ymin=Math.min(...vals),ymax=Math.max(...vals);if(ymin===ymax){ymin--;ymax++}const p=(ymax-ymin)*.15;ymin-=p;ymax+=p;const A=drawAxes(ctx,w,h,xmin,xmax,ymin,ymax);ctx.strokeStyle='#2563eb';ctx.lineWidth=2;ctx.beginPath();let started=false;for(let i=0;i<=700;i++){let x=xmin+(xmax-xmin)*i/700,y;try{y=f(x)}catch{continue}if(!Number.isFinite(y)||Math.abs(y)>1e8){started=false;continue}const px=A.X(x),py=A.Y(y);if(!started){ctx.moveTo(px,py);started=true}else ctx.lineTo(px,py)}ctx.stroke();ctx.fillStyle='#dc2626';for(const pnt of points){ctx.beginPath();ctx.arc(A.X(pnt.x),A.Y(pnt.y),4,0,Math.PI*2);ctx.fill()}}

const rootVisualState={method:null,f:null,rows:[],index:0,xmin:0,xmax:1,timer:null};
function rootVisualSetup(method,f,rows,xmin,xmax){
  if(rootVisualState.timer){clearInterval(rootVisualState.timer);rootVisualState.timer=null}
  rootVisualState.method=method;rootVisualState.f=f;rootVisualState.rows=rows;rootVisualState.index=0;
  rootVisualState.xmin=xmin;rootVisualState.xmax=xmax;
  drawRootVisual();
}
function rootVisualPrev(){if(!rootVisualState.rows.length)return;rootVisualState.index=Math.max(0,rootVisualState.index-1);drawRootVisual()}
function rootVisualNext(){if(!rootVisualState.rows.length)return;rootVisualState.index=Math.min(rootVisualState.rows.length-1,rootVisualState.index+1);drawRootVisual()}
function playRootVisual(){
  if(!rootVisualState.rows.length)return;
  if(rootVisualState.timer){clearInterval(rootVisualState.timer);rootVisualState.timer=null;return}
  rootVisualState.index=0;drawRootVisual();
  rootVisualState.timer=setInterval(()=>{
    if(rootVisualState.index>=rootVisualState.rows.length-1){clearInterval(rootVisualState.timer);rootVisualState.timer=null;return}
    rootVisualState.index++;drawRootVisual();
  },900);
}
function drawRootVisual(){
  const S=rootVisualState;if(!S.rows.length||!S.f)return;
  const d=S.rows[S.index],canvas=document.getElementById('root-canvas'),ctx=canvas.getContext('2d'),w=canvas.width,h=canvas.height;
  let xmin=S.xmin,xmax=S.xmax;if(!(xmax>xmin)){xmin-=1;xmax+=1}
  const extra=(xmax-xmin)*.12;xmin-=extra;xmax+=extra;
  let xs=[],ys=[];
  for(let i=0;i<=500;i++){const x=xmin+(xmax-xmin)*i/500;try{const y=S.f(x);if(Number.isFinite(y)&&Math.abs(y)<1e6){xs.push(x);ys.push(y)}}catch{}}
  const special=[];
  if(S.method==='bisection') special.push([d.a,S.f(d.a)],[d.b,S.f(d.b)],[d.x,d.fx],[d.x,0]);
  if(S.method==='newton') special.push([d.x,d.fx],[d.nx,0]);
  if(S.method==='vatar') special.push([d.a,d.fa],[d.b,d.fb],[d.x,0],[d.x,d.fx]);
  if(S.method==='secant') special.push([d.x0,d.f0],[d.x1,d.f1],[d.x2,0]);
  for(const p of special){if(Number.isFinite(p[1])&&Math.abs(p[1])<1e6)ys.push(p[1])}
  if(!ys.length)return;
  let ymin=Math.min(...ys,0),ymax=Math.max(...ys,0);if(ymin===ymax){ymin--;ymax++}
  const py=(ymax-ymin)*.18;ymin-=py;ymax+=py;
  const A=drawAxes(ctx,w,h,xmin,xmax,ymin,ymax);

  ctx.strokeStyle='#2563eb';ctx.lineWidth=2.2;ctx.beginPath();let started=false;
  for(let i=0;i<=700;i++){const x=xmin+(xmax-xmin)*i/700;let y;try{y=S.f(x)}catch{continue}
    if(!Number.isFinite(y)||Math.abs(y)>1e6){started=false;continue}
    const px=A.X(x),qy=A.Y(y);if(!started){ctx.moveTo(px,qy);started=true}else ctx.lineTo(px,qy)
  }ctx.stroke();

  const line=(x1,y1,x2,y2,stroke='#f59e0b',dash=[])=>{
    ctx.save();ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.setLineDash(dash);ctx.beginPath();ctx.moveTo(A.X(x1),A.Y(y1));ctx.lineTo(A.X(x2),A.Y(y2));ctx.stroke();ctx.restore();
  };
  const point=(x,y,label,fill='#dc2626')=>{
    ctx.fillStyle=fill;ctx.beginPath();ctx.arc(A.X(x),A.Y(y),5,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#111827';ctx.font='12px system-ui';ctx.fillText(label,A.X(x)+7,A.Y(y)-7);
  };
  const vertical=(x,stroke='#94a3b8')=>line(x,0,x,S.f(x),stroke,[5,5]);

  let note='';
  if(S.method==='bisection'){
    vertical(d.a);vertical(d.b);vertical(d.x,'#f59e0b');
    point(d.a,S.f(d.a),'a');point(d.b,S.f(d.b),'b');point(d.x,d.fx,'c');
    point(d.x,0,'c on Ox','#16a34a');
    note=`Iteratsiya ${d.k}: [a,b]=[${fmt(d.a)}, ${fmt(d.b)}]. O‘rta nuqta c=${fmt(d.x)}. Endi f(c) ishorasiga qarab kesmaning faqat kerakli yarmi qoladi.`;
  } else if(S.method==='newton'){
    const span=(xmax-xmin)*.35;
    const yL=d.fx+d.d*((d.x-span)-d.x),yR=d.fx+d.d*((d.x+span)-d.x);
    line(d.x-span,yL,d.x+span,yR,'#f59e0b');
    vertical(d.x);point(d.x,d.fx,'(xₖ,f(xₖ))');point(d.nx,0,'xₖ₊₁','#16a34a');
    note=`Iteratsiya ${d.k}: egri chiziqqa xₖ=${fmt(d.x)} nuqtada urinma chizildi. Urinmaning Ox bilan kesishishi xₖ₊₁=${fmt(d.nx)}.`;
  } else if(S.method==='vatar'){
    line(d.a,d.fa,d.b,d.fb,'#f59e0b');
    vertical(d.a);vertical(d.b);
    point(d.a,d.fa,'A');point(d.b,d.fb,'B');point(d.x,0,'x','#16a34a');
    note=`Iteratsiya ${d.k}: A(a,f(a)) va B(b,f(b)) vatar bilan tutashtirildi. Vatar Ox ni x=${fmt(d.x)} nuqtada kesdi; endi ishoraga qarab kesmaning bir uchi yangilanadi.`;
  } else {
    line(d.x0,d.f0,d.x1,d.f1,'#f59e0b');
    point(d.x0,d.f0,'x₀');point(d.x1,d.f1,'x₁');point(d.x2,0,'x₂','#16a34a');
    note=`Iteratsiya ${d.k}: oxirgi ikki nuqta orqali secant chizildi. Uning Ox bilan kesishishi yangi yaqinlashish x₂=${fmt(d.x2)}; keyingi qadamda eski juftlik oldinga suriladi.`;
  }
  ctx.fillStyle='#475569';ctx.font='12px system-ui';ctx.fillText(`${S.index+1}/${S.rows.length}`,w-55,22);
  document.getElementById('root-visual-note').innerHTML='<b>Grafikdagi ma’no:</b> '+esc(note);
}


function findBracket(f,a,b){let lo=Math.min(a,b),hi=Math.max(a,b);let fa=f(lo),fb=f(hi);if(Number.isFinite(fa)&&Number.isFinite(fb)&&fa*fb<=0)return[lo,hi];let center=(lo+hi)/2,span=Math.max(1,hi-lo);for(let level=0;level<8;level++){let L=center-span,R=center+span,prevX=L,prevY;try{prevY=f(L)}catch{prevY=NaN}for(let i=1;i<=400;i++){let x=L+(R-L)*i/400,y;try{y=f(x)}catch{y=NaN}if(Number.isFinite(prevY)&&Number.isFinite(y)&&prevY*y<=0)return[prevX,x];prevX=x;prevY=y}span*=2}return null}
function calcRoot(method,f,a,b,eps,max){const rows=[];if(method==='bisection'){const br=findBracket(f,a,b);if(!br)throw new Error('Belgilangan va kengaytirilgan oraliqda ishora almashishi topilmadi. Teng ikkiga bo‘lish usuli real ildizni qamragan interval talab qiladi.');[a,b]=br;let fa=f(a);for(let k=1;k<=max;k++){const x=(a+b)/2,fx=f(x),err=Math.abs(b-a)/2;rows.push({k,a,b,x,fx,err});if(Math.abs(fx)<eps||err<eps)return{root:x,rows,bracket:br};if(fa*fx<=0)b=x;else{a=x;fa=fx}}return{root:rows.at(-1).x,rows,bracket:br}}
if(method==='newton'){let x=(a+b)/2;for(let k=1;k<=max;k++){const h=1e-6*(1+Math.abs(x)),fx=f(x),d=(f(x+h)-f(x-h))/(2*h);if(!Number.isFinite(d)||Math.abs(d)<1e-14)throw new Error('Newton uchun hosila 0 ga juda yaqinlashdi. Boshlang‘ich oraliqni o‘zgartiring.');const nx=x-fx/d,err=Math.abs(nx-x);rows.push({k,x,fx,d,nx,err});x=nx;if(!Number.isFinite(x))throw new Error('Newton iteratsiyasi sonli sohadan chiqib ketdi.');if(err<eps||Math.abs(f(x))<eps)return{root:x,rows}}return{root:x,rows}}
if(method==='vatar'){const br=findBracket(f,a,b);if(!br)throw new Error('Vatarlar usuli uchun ildizni qamragan [a,b] interval topilmadi.');[a,b]=br;let fa=f(a),fb=f(b);for(let k=1;k<=max;k++){const den=fb-fa;if(!Number.isFinite(den)||Math.abs(den)<1e-14)throw new Error('Vatar formulasi maxraji 0 ga yaqinlashdi.');const x=(a*fb-b*fa)/den,fx=f(x),err=Math.min(Math.abs(x-a),Math.abs(b-x));rows.push({k,a,b,fa,fb,x,fx,err});if(Math.abs(fx)<eps||Math.abs(b-a)<eps)return{root:x,rows,bracket:br};if(fa*fx<=0){b=x;fb=fx}else{a=x;fa=fx}}return{root:rows.at(-1).x,rows,bracket:br}}
let x0=a,x1=b;for(let k=1;k<=max;k++){const f0=f(x0),f1=f(x1),den=f1-f0;if(!Number.isFinite(den)||Math.abs(den)<1e-14)throw new Error('Secant maxraji 0 ga yaqinlashdi.');const x2=x1-f1*(x1-x0)/den,err=Math.abs(x2-x1);rows.push({k,x0,x1,f0,f1,x2,err});x0=x1;x1=x2;if(!Number.isFinite(x1))throw new Error('Secant iteratsiyasi sonli sohadan chiqib ketdi.');if(err<eps||Math.abs(f(x1))<eps)return{root:x1,rows}}return{root:x1,rows}}
function rootInputs(){const raw=document.getElementById('root-f').value,f=compileExpr(raw,['x']),a=parseScalar(document.getElementById('root-a').value),b=parseScalar(document.getElementById('root-b').value),eps=parseScalar(document.getElementById('root-eps').value),max=+document.getElementById('root-max').value;if(!(eps>0)||max<1)throw new Error('ε > 0 va Max iter. ≥ 1 bo‘lishi kerak.');return{raw,f,a,b,eps,max}}
function solveRoot(method){try{const I=rootInputs(),r=calcRoot(method,I.f,I.a,I.b,I.eps,I.max),fx=I.f(r.root);document.getElementById('root-summary').innerHTML=`<b>${method==='bisection'?'Teng ikkiga bo‘lish':method==='newton'?'Newton':method==='vatar'?'Vatarlar':'Secant'}</b><br>x ≈ <b>${fmt(r.root)}</b><br>F(x) ≈ ${fmt(fx)}<br>Iteratsiya: ${r.rows.length}`;const steps=[{title:'Masalani standart ko‘rinishga keltirish',body:`<div class="math">Kiritildi: ${esc(I.raw)}\nNumLab ichki ko‘rinishi: F(x)=0</div>`}];steps.push({title:'Qog‘ozda avval nima qilamiz?',body:method==='bisection'?'<div class="paper-note">1) Tenglamani F(x)=0 ko‘rinishga keltiramiz. 2) f(a) va f(b) ni hisoblaymiz. 3) Ishora almashishini tekshiramiz. 4) Jadvalga a, b, c, f(c), xatolik ustunlarini chizamiz.</div>':method==='newton'?'<div class="paper-note">1) x₀ ni tanlaymiz. 2) f(x₀) va f′(x₀) ni topamiz. 3) Newton formulasiga qo‘yamiz. 4) Har qatorda xₖ, f(xₖ), f′(xₖ), xₖ₊₁ ni yozamiz.</div>':method==='vatar'?'<div class="paper-note">1) f(a)·f(b)&lt;0 bo‘lgan kesmani olamiz. 2) A(a,f(a)) va B(b,f(b)) nuqtalarni vatar bilan tutashtiramiz. 3) Vatarning Ox bilan kesishgan x nuqtasini formula orqali topamiz. 4) Ishoraga qarab a yoki b ni x bilan almashtiramiz.</div>':'<div class="paper-note">1) Ikki boshlang‘ich x₀ va x₁ olinadi. 2) f(x₀), f(x₁) hisoblanadi. 3) Secant formulasidan x₂ topiladi. 4) Keyingi qatorda x₀←x₁, x₁←x₂ qilinadi.</div>'});if((method==='bisection'||method==='vatar')&&r.bracket)steps.push({title:'Ildizni qamragan interval',body:`<div class="math">a=${fmt(r.bracket[0])}, b=${fmt(r.bracket[1])}\nF(a)=${fmt(I.f(r.bracket[0]))}, F(b)=${fmt(I.f(r.bracket[1]))}</div>Belgilar qarama-qarshi, demak uzluksiz holatda oraliqda kamida bitta ildiz bor.`});for(const d of r.rows){if(method==='bisection')steps.push({title:`${d.k}-iteratsiya`,body:`<div class="math">c=(a+b)/2 = (${fmt(d.a)}+${fmt(d.b)})/2 = ${fmt(d.x)}\nF(c)=${fmt(d.fx)}\nxatolik chegarasi ≤ |b-a|/2 = ${fmt(d.err)}</div><div class="paper-note"><b>Qog‘ozda:</b> c ni toping, f(c) ishorasini f(a) yoki f(b) bilan solishtiring va keyingi kesmani yozing.</div>`});else if(method==='newton')steps.push({title:`${d.k}-iteratsiya`,body:`<div class="math">xₖ=${fmt(d.x)}\nF(xₖ)=${fmt(d.fx)}\nF′(xₖ)≈${fmt(d.d)}\nxₖ₊₁=xₖ−F/F′=${fmt(d.nx)}\n|Δx|=${fmt(d.err)}</div><div class="paper-note"><b>Qog‘ozda:</b> avval f(xₖ) va f′(xₖ) ni alohida hisoblang. So‘ng formulaga sonlarni qo‘yib xₖ₊₁ ni yozing. Geometrik ma’nosi — urinmaning Ox bilan kesishishi.</div>`});else if(method==='vatar')steps.push({title:`${d.k}-iteratsiya`,body:`<div class="math">a=${fmt(d.a)}, b=${fmt(d.b)}\nF(a)=${fmt(d.fa)}, F(b)=${fmt(d.fb)}\nx = [a·F(b) - b·F(a)]/[F(b)-F(a)] = ${fmt(d.x)}\nF(x)=${fmt(d.fx)}</div><div class="paper-note"><b>Qog‘ozda:</b> A(a,F(a)) va B(b,F(b)) orqali o‘tgan vatar tenglamasining y=0 dagi kesishishini topyapmiz. Keyin F(a)·F(x) ishorasiga qarab kesmaning bir uchini x bilan almashtiramiz.</div>`});else steps.push({title:`${d.k}-iteratsiya`,body:`<div class="math">x₀=${fmt(d.x0)}, x₁=${fmt(d.x1)}\nF(x₀)=${fmt(d.f0)}, F(x₁)=${fmt(d.f1)}\nx₂=x₁−F(x₁)(x₁−x₀)/(F(x₁)−F(x₀))=${fmt(d.x2)}\n|Δx|=${fmt(d.err)}</div><div class="paper-note"><b>Qog‘ozda:</b> ikki eski nuqtani jadvalga yozing, f qiymatlarini hisoblang, secant formulasidan yangi x₂ ni toping. Keyingi qatorda (x₀,x₁) o‘rniga (x₁,x₂) yoziladi.</div>`})}steps.push({title:'Tekshiruv va xulosa',body:`<div class="math">x≈${fmt(r.root)}\nF(x)≈${fmt(fx)}</div>${Math.abs(fx)<=Math.max(I.eps*10,1e-8)?'<span class="ok">Qoldiq kichik — natija qabul qilinadi.</span>':'<span class="warn">Qoldiq ε dan katta; ko‘proq iteratsiya yoki boshqa boshlang‘ich qiymat kerak bo‘lishi mumkin.</span>'}`});setSteps('root',steps);const br=r.bracket||[Math.min(I.a,I.b),Math.max(I.a,I.b)];rootVisualSetup(method,I.f,r.rows,br[0],br[1])}catch(e){document.getElementById('root-summary').innerHTML=`<span class="err"><b>Xato:</b> ${esc(e.message)}</span>`}}
function compareRoots(){try{const I=rootInputs(),rows=[];for(const m of ['bisection','newton','vatar','secant']){try{const r=calcRoot(m,I.f,I.a,I.b,I.eps,I.max);rows.push([m,fmt(r.root),r.rows.length,fmt(Math.abs(I.f(r.root)))])}catch(e){rows.push([m,'—','—',esc(e.message)])}}const box=document.getElementById('root-compare');box.classList.remove('hidden');box.innerHTML='<h3>To‘rt usulni bir xil masalada taqqoslash</h3>'+table(['Usul','Ildiz','Iteratsiya','|F(x)|'],rows)}catch(e){alert(e.message)}}

function switchGaussMode(){const eq=document.getElementById('gauss-mode').value==='equations';document.getElementById('gauss-matrix-wrap').classList.toggle('hidden',eq);document.getElementById('gauss-equations-wrap').classList.toggle('hidden',!eq)}
function parseMatrix(s){return s.trim().split(/\n+/).map(r=>r.trim().split(/[\s;]+/).filter(Boolean).map(x=>parseScalar(x)))}
function parseLinearEquations(s){const lines=s.trim().split(/\n+/).map(x=>x.trim()).filter(Boolean);if(!lines.length)throw new Error('Tenglamalar kiritilmagan.');const varSet=new Set();for(const line of lines){for(const m of line.matchAll(/x\d+|[a-zA-Z]/g)){const v=m[0];if(!FN.includes(v)&&v!=='e')varSet.add(v)}}const vars=[...varSet];if(vars.length!==lines.length)throw new Error(`Kvadrat sistema kerak: ${lines.length} ta tenglama, ${vars.length} ta o‘zgaruvchi topildi.`);const M=[];for(const line of lines){const parts=line.split('=');if(parts.length!==2)throw new Error(`Tenglama noto‘g‘ri: ${line}`);const coeff=[];for(const v of vars){const replacedVars=Object.fromEntries(vars.map(z=>[z,0]));replacedVars[v]=1;const val=evaluateLinear(parts[0],replacedVars)-evaluateLinear(parts[0],Object.fromEntries(vars.map(z=>[z,0])));coeff.push(val)}const zero=evaluateLinear(parts[0],Object.fromEntries(vars.map(z=>[z,0])));const rhs=evaluateLinear(parts[1],Object.fromEntries(vars.map(z=>[z,0])))-zero;M.push([...coeff,rhs])}return{M,vars}}
function evaluateLinear(raw,obj){let s=String(raw).trim().replace(/−/g,'-').replace(/[×·]/g,'*').replace(/÷/g,'/').replace(/,/g,'.');s=s.replace(/(\d)\s*(?=[A-Za-z])/g,'$1*');const ids=s.match(/[A-Za-z_]\w*/g)||[];for(const id of ids){if(!(id in obj))throw new Error(`Noma’lum o‘zgaruvchi: ${id}`)}const vars=Object.keys(obj);return new Function(...vars,`"use strict";return (${s});`)(...vars.map(v=>obj[v]))}
function matrixText(M){return M.map(r=>r.map(v=>fmt(v).padStart(12)).join(' ')).join('\n')}
function solveGauss(){try{let M,vars;const mode=document.getElementById('gauss-mode').value;if(mode==='matrix'){M=parseMatrix(document.getElementById('gauss-mat').value);vars=Array.from({length:M.length},(_,i)=>`x${i+1}`)}else({M,vars}=parseLinearEquations(document.getElementById('gauss-eqs').value));const n=M.length;if(!n||M.some(r=>r.length!==n+1||r.some(v=>!Number.isFinite(v))))throw new Error('n×(n+1) kengaytirilgan matritsa kerak.');const original=M.map(r=>r.slice()),steps=[{title:'Boshlang‘ich kengaytirilgan matritsa',body:`<div class="matrix">${esc(matrixText(M))}</div>`}];for(let k=0;k<n;k++){let p=k;for(let i=k+1;i<n;i++)if(Math.abs(M[i][k])>Math.abs(M[p][k]))p=i;if(Math.abs(M[p][k])<1e-14)throw new Error('Matritsa singulyar yoki sistema yagona yechimga ega emas.');if(p!==k){[M[p],M[k]]=[M[k],M[p]];steps.push({title:`Pivot tanlash: R${k+1} ↔ R${p+1}`,body:`Sonli barqarorlik uchun modul bo‘yicha eng katta pivot yuqoriga olindi.<div class="matrix">${esc(matrixText(M))}</div>`})}for(let i=k+1;i<n;i++){const m=M[i][k]/M[k][k];for(let j=k;j<=n;j++)M[i][j]-=m*M[k][j];steps.push({title:`R${i+1} dan x${k+1} ni yo‘qotish`,body:`<div class="math">m = a${i+1}${k+1}/a${k+1}${k+1} = ${fmt(m)}\nR${i+1} ← R${i+1} − m·R${k+1}</div><div class="matrix">${esc(matrixText(M))}</div>`})}}
const x=Array(n).fill(0);for(let i=n-1;i>=0;i--){let s=M[i][n];for(let j=i+1;j<n;j++)s-=M[i][j]*x[j];x[i]=s/M[i][i];steps.push({title:`Teskari yurish: ${vars[i]}`,body:`<div class="math">${vars[i]} = ${fmt(x[i])}</div>`})}let res=0;for(let i=0;i<n;i++){let lhs=0;for(let j=0;j<n;j++)lhs+=original[i][j]*x[j];res=Math.max(res,Math.abs(lhs-original[i][n]))}document.getElementById('gauss-summary').innerHTML=x.map((v,i)=>`${esc(vars[i])} = <b>${fmt(v)}</b>`).join('<br>');document.getElementById('gauss-check').innerHTML=`Residual ‖Ax−b‖∞ = <b>${fmt(res)}</b>`;steps.push({title:'Tekshiruv',body:`<div class="math">‖Ax−b‖∞ = ${fmt(res)}</div>${res<1e-8?'<span class="ok">Yechim sistema bilan mos.</span>':'<span class="warn">Residual sezilarli.</span>'}`});setSteps('gauss',steps)}catch(e){document.getElementById('gauss-summary').innerHTML=`<span class="err"><b>Xato:</b> ${esc(e.message)}</span>`}}

function lagrangeVal(xs,ys,x){let sum=0;for(let i=0;i<xs.length;i++){let L=1;for(let j=0;j<xs.length;j++)if(i!==j)L*=(x-xs[j])/(xs[i]-xs[j]);sum+=ys[i]*L}return sum}
function newtonCoeffs(xs,ys){const c=ys.slice();for(let j=1;j<xs.length;j++)for(let i=xs.length-1;i>=j;i--)c[i]=(c[i]-c[i-1])/(xs[i]-xs[i-j]);return c}
function newtonVal(xs,c,x){let s=c.at(-1);for(let i=c.length-2;i>=0;i--)s=s*(x-xs[i])+c[i];return s}
function solveInterp(method){try{const xs=parseNums(document.getElementById('ix').value),ys=parseNums(document.getElementById('iy').value),t=parseScalar(document.getElementById('itarget').value);if(xs.length!==ys.length||xs.length<2)throw new Error('x va y sonlari teng va kamida 2 ta bo‘lishi kerak.');if(new Set(xs.map(fmt)).size!==xs.length)throw new Error('x tugunlar takrorlanmasligi kerak.');const c=newtonCoeffs(xs,ys),val=method==='lagrange'?lagrangeVal(xs,ys,t):newtonVal(xs,c,t),steps=[{title:'Berilgan tugunlar',body:table(['i','xᵢ','yᵢ'],xs.map((x,i)=>[i,fmt(x),fmt(ys[i])]))}];if(method==='lagrange'){for(let i=0;i<xs.length;i++){let terms=[];for(let j=0;j<xs.length;j++)if(i!==j)terms.push(`(${fmt(t)}-${fmt(xs[j])})/(${fmt(xs[i])}-${fmt(xs[j])})`);let L=1;for(let j=0;j<xs.length;j++)if(i!==j)L*=(t-xs[j])/(xs[i]-xs[j]);steps.push({title:`L${i}(x*) bazis`,body:`<div class="math">L${i}(${fmt(t)}) = ${terms.join(' · ')} = ${fmt(L)}\ny${i}L${i} = ${fmt(ys[i]*L)}</div>`})}}else{steps.push({title:'Bo‘lingan ayirmalar koeffitsiyentlari',body:table(['i','aᵢ'],c.map((v,i)=>[i,fmt(v)]))});steps.push({title:'Newton ko‘phadini Horner usulida hisoblash',body:`<div class="math">P(${fmt(t)}) = ${fmt(val)}</div>`})}steps.push({title:'Yakuniy natija',body:`P(${fmt(t)}) ≈ <b>${fmt(val)}</b>. Interpolant barcha berilgan tugunlardan o‘tadi.`});document.getElementById('interp-summary').innerHTML=`<b>${method==='lagrange'?'Lagrange':'Newton'}</b><br>P(${fmt(t)}) ≈ <b>${fmt(val)}</b><br>Tugunlar: ${xs.length}`;setSteps('interp',steps);const f=x=>method==='lagrange'?lagrangeVal(xs,ys,x):newtonVal(xs,c,x),xmin=Math.min(...xs),xmax=Math.max(...xs),pad=Math.max((xmax-xmin)*.1,.5);plotFunction(document.getElementById('interp-canvas'),f,xmin-pad,xmax+pad,xs.map((x,i)=>({x,y:ys[i]})).concat([{x:t,y:val}]))}catch(e){document.getElementById('interp-summary').innerHTML=`<span class="err"><b>Xato:</b> ${esc(e.message)}</span>`}}

function integralMethod(f,a,b,n,method){n=Math.max(1,Math.floor(n));let adjusted=false;if(method==='simpson'&&n%2){n++;adjusted=true}const h=(b-a)/n;let value;if(method==='rect'){let s=0;for(let i=0;i<n;i++)s+=f(a+(i+.5)*h);value=s*h}else if(method==='trap'){let s=.5*(f(a)+f(b));for(let i=1;i<n;i++)s+=f(a+i*h);value=s*h}else{let s=f(a)+f(b);for(let i=1;i<n;i++)s+=(i%2?4:2)*f(a+i*h);value=s*h/3}return{value,n,h,adjusted}}
function integralInputs(){const raw=document.getElementById('int-f').value,f=compileExpr(raw,['x']),a=parseScalar(document.getElementById('int-a').value),b=parseScalar(document.getElementById('int-b').value),n=+document.getElementById('int-n').value;if(!Number.isFinite(n)||n<1)throw new Error('n ≥ 1 bo‘lishi kerak.');return{raw,f,a,b,n}}
function intName(m){return m==='rect'?'O‘rta to‘g‘ri to‘rtburchak':m==='trap'?'Trapetsiya':'Simpson'}
function solveIntegral(method){try{const I=integralInputs(),r=integralMethod(I.f,I.a,I.b,I.n,method);const steps=[{title:'Oraliqni bo‘lish',body:`<div class="math">a=${fmt(I.a)}, b=${fmt(I.b)}\nn=${r.n}\nh=(b-a)/n=${fmt(r.h)}</div>${r.adjusted?'<span class="warn">Simpson formulasi uchun n juft bo‘lishi kerak; n avtomatik ravishda bittaga oshirildi.</span>':''}`}];if(method==='rect'){const rows=[];let s=0;for(let i=0;i<r.n;i++){const x=I.a+(i+.5)*r.h,y=I.f(x);s+=y;rows.push([i,fmt(x),fmt(y)])}steps.push({title:'O‘rta nuqtalardagi qiymatlar',body:table(['i','xᵢ*','f(xᵢ*)'],rows)});steps.push({title:'Formulaga qo‘yish',body:`<div class="math">I ≈ h Σf(xᵢ*) = ${fmt(r.h)} · ${fmt(s)} = ${fmt(r.value)}</div>`})}else if(method==='trap'){const rows=[];for(let i=0;i<=r.n;i++){const x=I.a+i*r.h;rows.push([i,fmt(x),fmt(I.f(x))])}steps.push({title:'To‘r qiymatlari',body:table(['i','xᵢ','f(xᵢ)'],rows)});steps.push({title:'Trapetsiya formulasi',body:`<div class="math">I ≈ h[(f₀+fₙ)/2 + Σfᵢ] = ${fmt(r.value)}</div>`})}else{const rows=[];for(let i=0;i<=r.n;i++){const x=I.a+i*r.h;rows.push([i,fmt(x),fmt(I.f(x)),i===0||i===r.n?1:(i%2?4:2)])}steps.push({title:'Simpson vaznlari',body:table(['i','xᵢ','f(xᵢ)','vazn'],rows)});steps.push({title:'Simpson formulasi',body:`<div class="math">I ≈ h/3 [f₀ + 4Σf_odd + 2Σf_even + fₙ] = ${fmt(r.value)}</div>`})}const ns=[4,8,16,32,64],vals=ns.map(n=>integralMethod(I.f,I.a,I.b,n,method).value);steps.push({title:'Konvergentsiyani tekshirish',body:table(['n','Iₙ','|Iₙ-Iold|'],ns.map((n,i)=>[n,fmt(vals[i]),i?fmt(Math.abs(vals[i]-vals[i-1])):'—']))});steps.push({title:'Yakuniy natija',body:`${intName(method)} usuli bilan I ≈ <b>${fmt(r.value)}</b>.`});document.getElementById('int-summary').innerHTML=`<b>${intName(method)}</b><br>I ≈ <b>${fmt(r.value)}</b><br>n=${r.n}, h=${fmt(r.h)}`;setSteps('int',steps);drawIntegralVisual(I.f,I.a,I.b,r.n,method)}catch(e){document.getElementById('int-summary').innerHTML=`<span class="err"><b>Xato:</b> ${esc(e.message)}</span>`}}

function drawIntegralVisual(f,a,b,n,method){
  const c=document.getElementById('int-canvas'),ctx=c.getContext('2d'),w=c.width,h=c.height;
  let xmin=Math.min(a,b),xmax=Math.max(a,b),ys=[0];
  for(let i=0;i<=500;i++){const x=xmin+(xmax-xmin)*i/500;try{const y=f(x);if(Number.isFinite(y)&&Math.abs(y)<1e6)ys.push(y)}catch{}}
  let ymin=Math.min(...ys),ymax=Math.max(...ys);if(ymin===ymax){ymin--;ymax++}
  const p=(ymax-ymin)*.16;ymin-=p;ymax+=p;const A=drawAxes(ctx,w,h,xmin,xmax,ymin,ymax);
  const hstep=(b-a)/n;
  ctx.save();ctx.globalAlpha=.18;ctx.fillStyle='#60a5fa';ctx.strokeStyle='#2563eb';ctx.lineWidth=1;
  if(method==='rect'){
    for(let i=0;i<n;i++){const x0=a+i*hstep,x1=x0+hstep,xm=(x0+x1)/2,y=f(xm);const left=Math.min(A.X(x0),A.X(x1)),right=Math.max(A.X(x0),A.X(x1)),top=A.Y(Math.max(0,y)),bottom=A.Y(Math.min(0,y));ctx.fillRect(left,top,right-left,bottom-top);ctx.strokeRect(left,top,right-left,bottom-top)}
  }else if(method==='trap'){
    for(let i=0;i<n;i++){const x0=a+i*hstep,x1=x0+hstep,y0=f(x0),y1=f(x1);ctx.beginPath();ctx.moveTo(A.X(x0),A.Y(0));ctx.lineTo(A.X(x0),A.Y(y0));ctx.lineTo(A.X(x1),A.Y(y1));ctx.lineTo(A.X(x1),A.Y(0));ctx.closePath();ctx.fill();ctx.stroke()}
  }else{
    for(let i=0;i<=n;i++){const x=a+i*hstep;ctx.beginPath();ctx.moveTo(A.X(x),A.Y(0));ctx.lineTo(A.X(x),A.Y(f(x)));ctx.stroke()}
    for(let i=0;i<n;i+=2){const x0=a+i*hstep,x2=a+(i+2)*hstep;ctx.fillRect(Math.min(A.X(x0),A.X(x2)),A.Y(Math.max(0,ymax*.92)),Math.abs(A.X(x2)-A.X(x0)),Math.abs(A.Y(ymin*.92)-A.Y(ymax*.92)))}
  }
  ctx.restore();
  ctx.strokeStyle='#111827';ctx.lineWidth=2.2;ctx.beginPath();let started=false;
  for(let i=0;i<=700;i++){const x=xmin+(xmax-xmin)*i/700;let y;try{y=f(x)}catch{continue}if(!Number.isFinite(y)||Math.abs(y)>1e6){started=false;continue}const px=A.X(x),py=A.Y(y);if(!started){ctx.moveTo(px,py);started=true}else ctx.lineTo(px,py)}ctx.stroke();
  const note=method==='rect'
    ? 'Har bo‘lakda funksiya o‘rta nuqtadagi balandlik bilan to‘g‘ri to‘rtburchakka almashtirildi. Ularning yuzalari yig‘indisi integralni yaqinlashtiradi.'
    :method==='trap'
      ? 'Egri chiziq har bo‘lakda to‘g‘ri chiziq bilan almashtirildi. Hosil bo‘lgan trapetsiyalar yuzasi yig‘ildi.'
      :'Har ikki bo‘lak bir guruh bo‘lib, uchta nuqta orqali parabola o‘tkaziladi. 1–4–2–4–…–1 vaznlar shu kvadratik yaqinlashuvdan keladi.';
  document.getElementById('int-visual-note').innerHTML='<b>Geometrik ma’no:</b> '+note;
}
function compareIntegrals(){try{const I=integralInputs(),rows=['rect','trap','simpson'].map(m=>{const r=integralMethod(I.f,I.a,I.b,I.n,m);return[intName(m),r.n,fmt(r.h),fmt(r.value)]});const box=document.getElementById('int-compare');box.classList.remove('hidden');box.innerHTML='<h3>Bir xil masalada metodlar</h3>'+table(['Usul','n','h','Natija'],rows)}catch(e){alert(e.message)}}

function calcODE(method,f,x0,y0,x1,h){if(h<=0)throw new Error('h > 0 bo‘lishi kerak.');if(x1<x0)h=-h;let x=x0,y=y0,rows=[{k:0,x,y}],details=[],k=0;const cond=()=>h>0?x<x1-1e-12:x>x1+1e-12;while(cond()&&k<20000){let hh=h;if(h>0&&x+hh>x1)hh=x1-x;if(h<0&&x+hh<x1)hh=x1-x;let yn,d;if(method==='euler'){const slope=f(x,y);yn=y+hh*slope;d={slope}}else{const k1=f(x,y),k2=f(x+hh/2,y+hh*k1/2),k3=f(x+hh/2,y+hh*k2/2),k4=f(x+hh,y+hh*k3);yn=y+hh*(k1+2*k2+2*k3+k4)/6;d={k1,k2,k3,k4}}if(!Number.isFinite(yn))throw new Error('Yechim sonli sohadan chiqib ketdi.');details.push({k:k+1,x,y,hh,yn,...d});x+=hh;y=yn;k++;rows.push({k,x,y})}return{rows,details,final:y}}
function odeInputs(){const raw=document.getElementById('ode-f').value,f=compileExpr(raw,['x','y']),x0=parseScalar(document.getElementById('ode-x0').value),y0=parseScalar(document.getElementById('ode-y0').value),x1=parseScalar(document.getElementById('ode-x1').value),h=Math.abs(parseScalar(document.getElementById('ode-h').value));return{raw,f,x0,y0,x1,h}}
function solveODE(method){try{const I=odeInputs(),r=calcODE(method,I.f,I.x0,I.y0,I.x1,I.h),steps=[{title:'Boshlang‘ich masala',body:`<div class="math">y′=${esc(I.raw)}\ny(${fmt(I.x0)})=${fmt(I.y0)}\nh=${fmt(I.h)}</div>`}];for(const d of r.details){const body=method==='euler'?`<div class="math">xₖ=${fmt(d.x)}, yₖ=${fmt(d.y)}\nf(xₖ,yₖ)=${fmt(d.slope)}\nyₖ₊₁=yₖ+h f=${fmt(d.yn)}</div>`:`<div class="math">xₖ=${fmt(d.x)}, yₖ=${fmt(d.y)}\nk₁=${fmt(d.k1)}\nk₂=${fmt(d.k2)}\nk₃=${fmt(d.k3)}\nk₄=${fmt(d.k4)}\nyₖ₊₁=${fmt(d.yn)}</div>`;steps.push({title:`${d.k}-qadam`,body})}steps.push({title:'Yakuniy qiymat',body:`y(${fmt(I.x1)}) ≈ <b>${fmt(r.final)}</b>.`});document.getElementById('ode-summary').innerHTML=`<b>${method==='euler'?'Eyler':'Runge–Kutta 4'}</b><br>y(${fmt(I.x1)}) ≈ <b>${fmt(r.final)}</b><br>Qadamlar: ${r.details.length}`;setSteps('ode',steps);odeVisualSetup(method,r.rows,r.details)}catch(e){document.getElementById('ode-summary').innerHTML=`<span class="err"><b>Xato:</b> ${esc(e.message)}</span>`}}
function plotODE(rows){const c=document.getElementById('ode-canvas'),ctx=c.getContext('2d'),w=c.width,h=c.height,xs=rows.map(p=>p.x),ys=rows.map(p=>p.y);let xmin=Math.min(...xs),xmax=Math.max(...xs),ymin=Math.min(...ys),ymax=Math.max(...ys);if(xmin===xmax){xmin--;xmax++}if(ymin===ymax){ymin--;ymax++}const p=(ymax-ymin)*.15;ymin-=p;ymax+=p;const A=drawAxes(ctx,w,h,xmin,xmax,ymin,ymax);ctx.strokeStyle='#2563eb';ctx.lineWidth=2;ctx.beginPath();rows.forEach((p,i)=>i?ctx.lineTo(A.X(p.x),A.Y(p.y)):ctx.moveTo(A.X(p.x),A.Y(p.y)));ctx.stroke();ctx.fillStyle='#dc2626';rows.forEach(p=>{ctx.beginPath();ctx.arc(A.X(p.x),A.Y(p.y),3,0,Math.PI*2);ctx.fill()})}

const odeVisualState={method:null,rows:[],details:[],index:0,timer:null};
function odeVisualSetup(method,rows,details){if(odeVisualState.timer){clearInterval(odeVisualState.timer);odeVisualState.timer=null}odeVisualState.method=method;odeVisualState.rows=rows;odeVisualState.details=details;odeVisualState.index=0;drawODEVisual()}
function odeVisualPrev(){if(!odeVisualState.rows.length)return;odeVisualState.index=Math.max(0,odeVisualState.index-1);drawODEVisual()}
function odeVisualNext(){if(!odeVisualState.rows.length)return;odeVisualState.index=Math.min(odeVisualState.rows.length-1,odeVisualState.index+1);drawODEVisual()}
function playODEVisual(){if(!odeVisualState.rows.length)return;if(odeVisualState.timer){clearInterval(odeVisualState.timer);odeVisualState.timer=null;return}odeVisualState.index=0;drawODEVisual();odeVisualState.timer=setInterval(()=>{if(odeVisualState.index>=odeVisualState.rows.length-1){clearInterval(odeVisualState.timer);odeVisualState.timer=null;return}odeVisualState.index++;drawODEVisual()},700)}
function drawODEVisual(){
  const S=odeVisualState,all=S.rows;if(!all.length)return;const shown=all.slice(0,S.index+1),c=document.getElementById('ode-canvas'),ctx=c.getContext('2d'),w=c.width,h=c.height;
  const xs=all.map(p=>p.x),ys=all.map(p=>p.y);let xmin=Math.min(...xs),xmax=Math.max(...xs),ymin=Math.min(...ys),ymax=Math.max(...ys);if(xmin===xmax){xmin--;xmax++}if(ymin===ymax){ymin--;ymax++}const p=(ymax-ymin)*.18;ymin-=p;ymax+=p;const A=drawAxes(ctx,w,h,xmin,xmax,ymin,ymax);
  ctx.strokeStyle='#2563eb';ctx.lineWidth=2.5;ctx.beginPath();shown.forEach((q,i)=>i?ctx.lineTo(A.X(q.x),A.Y(q.y)):ctx.moveTo(A.X(q.x),A.Y(q.y)));ctx.stroke();
  ctx.fillStyle='#dc2626';shown.forEach((q,i)=>{ctx.beginPath();ctx.arc(A.X(q.x),A.Y(q.y),4,0,Math.PI*2);ctx.fill();ctx.fillStyle='#334155';ctx.font='11px system-ui';ctx.fillText(String(i),A.X(q.x)+6,A.Y(q.y)-6);ctx.fillStyle='#dc2626'});
  let note='Boshlang‘ich nuqta y(x₀)=y₀ dan boshlaymiz.';
  if(S.index>0){const d=S.details[S.index-1];note=S.method==='euler'
    ? `Qadam ${S.index}: hozirgi qiyalik f(xₖ,yₖ)=${fmt(d.slope)} olinib, h uzunlikda shu yo‘nalish bo‘yicha yurildi. Yangi nuqta y=${fmt(d.yn)}.`
    : `Qadam ${S.index}: RK4 bitta qadam ichida k₁, k₂, k₃, k₄ qiyaliklarni tekshirib, vaznli o‘rtacha yo‘nalish bilan y=${fmt(d.yn)} nuqtaga o‘tdi.`;}
  document.getElementById('ode-visual-note').innerHTML='<b>Qadamning ma’nosi:</b> '+esc(note);
}

function compareODE(){try{const I=odeInputs(),e=calcODE('euler',I.f,I.x0,I.y0,I.x1,I.h),r=calcODE('rk4',I.f,I.x0,I.y0,I.x1,I.h);const box=document.getElementById('ode-compare');box.classList.remove('hidden');box.innerHTML='<h3>Eyler va RK4</h3>'+table(['Usul','Qadam','y(x oxiri)'],[['Eyler',e.details.length,fmt(e.final)],['RK4',r.details.length,fmt(r.final)]])}catch(e){alert(e.message)}}

// ---------- PDE ----------
function solvePDE(){try{const N=Math.max(4,Math.min(60,Math.floor(+document.getElementById('pde-n').value))),eps=parseScalar(document.getElementById('pde-eps').value);if(!(eps>0))throw new Error('ε > 0 bo‘lishi kerak.');const top=compileExpr(document.getElementById('pde-top').value,['x']),bottom=compileExpr(document.getElementById('pde-bottom').value,['x']),left=compileExpr(document.getElementById('pde-left').value,['y']),right=compileExpr(document.getElementById('pde-right').value,['y']);let u=Array.from({length:N},()=>Array(N).fill(0));for(let j=0;j<N;j++){const x=j/(N-1);u[0][j]=top(x);u[N-1][j]=bottom(x)}for(let i=0;i<N;i++){const y=1-i/(N-1);u[i][0]=left(y);u[i][N-1]=right(y)}// corners average conflicting boundary definitions
u[0][0]=(top(0)+left(1))/2;u[0][N-1]=(top(1)+right(1))/2;u[N-1][0]=(bottom(0)+left(0))/2;u[N-1][N-1]=(bottom(1)+right(0))/2;
let iter=0,err=Infinity;const snapshots=[],milestones=new Set([1,2,5,10,25,50,100,250,500,1000,2500,5000,10000]);while(err>eps&&iter<30000){const v=u.map(r=>r.slice());err=0;for(let i=1;i<N-1;i++)for(let j=1;j<N-1;j++){v[i][j]=(u[i-1][j]+u[i+1][j]+u[i][j-1]+u[i][j+1])/4;err=Math.max(err,Math.abs(v[i][j]-u[i][j]))}u=v;iter++;if(milestones.has(iter)||err<=eps)snapshots.push({iter,err,center:u[Math.floor(N/2)][Math.floor(N/2)]})}const center=u[Math.floor(N/2)][Math.floor(N/2)];document.getElementById('pde-summary').innerHTML=`Iteratsiya: <b>${iter}</b><br>max |Δu|=${fmt(err)}<br>Markaz u≈<b>${fmt(center)}</b>`;const steps=[{title:'Chegara shartlarini to‘rga qo‘yish',body:`<div class="math">N=${N}\nε=${fmt(eps)}\nu(x,1)=${esc(document.getElementById('pde-top').value)}\nu(x,0)=${esc(document.getElementById('pde-bottom').value)}\nu(0,y)=${esc(document.getElementById('pde-left').value)}\nu(1,y)=${esc(document.getElementById('pde-right').value)}</div>`},{title:'Diskret Laplace formulasi',body:'<div class="math">uᵢⱼ(new)=[uᵢ₋₁ⱼ+uᵢ₊₁ⱼ+uᵢⱼ₋₁+uᵢⱼ₊₁]/4</div>'}];for(const s of snapshots)steps.push({title:`${s.iter}-iteratsiya`,body:`<div class="math">max |Δu|=${fmt(s.err)}\nmarkaz u=${fmt(s.center)}</div>${s.err<=eps?'<span class="ok">To‘xtash sharti bajarildi.</span>':'Yaqinlashish davom etmoqda.'}`});steps.push({title:'Xulosa',body:`Jacobi usuli ${iter} iteratsiyada berilgan ε aniqlikka ${err<=eps?'yetdi':'yetmadi'}.`});setSteps('pde',steps);drawHeatmap(u)}catch(e){document.getElementById('pde-summary').innerHTML=`<span class="err"><b>Xato:</b> ${esc(e.message)}</span>`}}
function drawHeatmap(u){const c=document.getElementById('pde-canvas'),ctx=c.getContext('2d'),w=c.width,h=c.height,N=u.length;ctx.clearRect(0,0,w,h);const maxv=Math.max(...u.flat()),minv=Math.min(...u.flat()),d=maxv-minv||1,cw=w/N,ch=h/N;for(let i=0;i<N;i++)for(let j=0;j<N;j++){const t=(u[i][j]-minv)/d;ctx.fillStyle=`rgb(${Math.floor(240*t+15)},${Math.floor(80+120*(1-Math.abs(t-.5)*2))},${Math.floor(240*(1-t)+15)})`;ctx.fillRect(j*cw,i*ch,cw+1,ch+1)}}
