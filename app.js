// ---------- UI ----------
document.querySelectorAll('.tab').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(x=>x.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
  });
});

function expr1(s){ return new Function('x', `"use strict"; return (${s});`); }
function expr2(s){ return new Function('x','y', `"use strict"; return (${s});`); }
function fmt(x){ return Number.isFinite(x) ? (+x.toFixed(10)).toString() : String(x); }
function esc(s){ return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

function drawAxes(ctx,w,h,xmin,xmax,ymin,ymax){
  ctx.clearRect(0,0,w,h); ctx.strokeStyle='#d1d5db'; ctx.lineWidth=1;
  const X=x=>40+(x-xmin)/(xmax-xmin)*(w-55);
  const Y=y=>h-30-(y-ymin)/(ymax-ymin)*(h-45);
  if(ymin<=0&&ymax>=0){ctx.beginPath();ctx.moveTo(40,Y(0));ctx.lineTo(w-15,Y(0));ctx.stroke();}
  if(xmin<=0&&xmax>=0){ctx.beginPath();ctx.moveTo(X(0),15);ctx.lineTo(X(0),h-30);ctx.stroke();}
  return {X,Y};
}
function plotFunction(canvas,f,xmin,xmax,points=[]){
  const ctx=canvas.getContext('2d'), w=canvas.width,h=canvas.height;
  let ys=[]; for(let i=0;i<=300;i++){let x=xmin+(xmax-xmin)*i/300;try{let y=f(x);if(Number.isFinite(y))ys.push(y)}catch{}}
  if(!ys.length)return;
  let ymin=Math.min(...ys), ymax=Math.max(...ys); if(ymin===ymax){ymin-=1;ymax+=1}
  const pad=(ymax-ymin)*.15; ymin-=pad; ymax+=pad;
  const {X,Y}=drawAxes(ctx,w,h,xmin,xmax,ymin,ymax);
  ctx.strokeStyle='#2563eb';ctx.lineWidth=2;ctx.beginPath();let started=false;
  for(let i=0;i<=500;i++){let x=xmin+(xmax-xmin)*i/500,y;try{y=f(x)}catch{continue}
    if(!Number.isFinite(y))continue; let px=X(x),py=Y(y); if(!started){ctx.moveTo(px,py);started=true}else ctx.lineTo(px,py)
  } ctx.stroke();
  ctx.fillStyle='#dc2626'; points.forEach(p=>{ctx.beginPath();ctx.arc(X(p.x),Y(p.y),4,0,Math.PI*2);ctx.fill();});
}

// ---------- ROOTS ----------
function solveRoot(method){
  let f; try{f=expr1(document.getElementById('root-f').value)}catch(e){alert('f(x) noto‘g‘ri');return}
  let a=+document.getElementById('root-a').value,b=+document.getElementById('root-b').value,eps=+document.getElementById('root-eps').value,max=+document.getElementById('root-max').value;
  let rows=[], x;
  try{
    if(method==='bisection'){
      let fa=f(a), fb=f(b); if(fa*fb>0) throw new Error('f(a) va f(b) qarama-qarshi ishorali emas.');
      for(let k=1;k<=max;k++){x=(a+b)/2; let fx=f(x),err=Math.abs(b-a)/2; rows.push([k,a,b,x,fx,err]); if(Math.abs(fx)<eps||err<eps)break; if(fa*fx<=0){b=x;fb=fx}else{a=x;fa=fx}}
    } else if(method==='newton'){
      x=(a+b)/2;
      for(let k=1;k<=max;k++){let h=1e-6*(1+Math.abs(x));let d=(f(x+h)-f(x-h))/(2*h); if(Math.abs(d)<1e-14) throw new Error('Hosila juda kichik.'); let nx=x-f(x)/d,err=Math.abs(nx-x);rows.push([k,x,d,nx,f(nx),err]);x=nx;if(err<eps||Math.abs(f(x))<eps)break}
    } else {
      let x0=a,x1=b;
      for(let k=1;k<=max;k++){let f0=f(x0),f1=f(x1),den=f1-f0;if(Math.abs(den)<1e-14)throw new Error('Secant maxraji 0 ga yaqin.');x=x1-f1*(x1-x0)/den;let err=Math.abs(x-x1);rows.push([k,x0,x1,x,f(x),err]);x0=x1;x1=x;if(err<eps||Math.abs(f(x))<eps)break}
    }
  }catch(e){document.getElementById('root-summary').innerHTML='<b>Xato:</b> '+esc(e.message);return}
  x=rows.at(-1)[3];
  document.getElementById('root-summary').innerHTML=`<b>${method.toUpperCase()}</b><br>Ildiz ≈ <b>${fmt(x)}</b><br>f(x) ≈ ${fmt(f(x))}<br>Iteratsiya: ${rows.length}`;
  let head=method==='newton'?['k','x_k',"f'(x_k)",'x_{k+1}','f(x)','xatolik']:['k','a/x0','b/x1','x','f(x)','xatolik'];
  document.getElementById('root-table').innerHTML='<tr>'+head.map(x=>'<th>'+x+'</th>').join('')+'</tr>'+rows.map(r=>'<tr>'+r.map(v=>'<td>'+fmt(v)+'</td>').join('')+'</tr>').join('');
  plotFunction(document.getElementById('root-canvas'),f,+document.getElementById('root-a').value,+document.getElementById('root-b').value,[{x,y:0}]);
}

// ---------- GAUSS ----------
function parseMatrix(s){return s.trim().split(/\n+/).map(r=>r.trim().split(/[\s,;]+/).map(Number));}
function matrixText(M){return M.map(r=>r.map(v=>fmt(v).padStart(10)).join(' ')).join('\n');}
function solveGauss(){
  let M=parseMatrix(document.getElementById('gauss-mat').value), n=M.length;
  if(!n||M.some(r=>r.length!==n+1||r.some(v=>!Number.isFinite(v)))){alert('n×(n+1) kengaytirilgan matritsa kiriting.');return}
  let steps=[];
  for(let k=0;k<n;k++){
    let p=k; for(let i=k+1;i<n;i++)if(Math.abs(M[i][k])>Math.abs(M[p][k]))p=i;
    if(Math.abs(M[p][k])<1e-14){document.getElementById('gauss-summary').textContent='Sistema yagona yechimga ega emas.';return}
    if(p!==k){[M[p],M[k]]=[M[k],M[p]];steps.push(`R${k+1} ↔ R${p+1}\n`+matrixText(M))}
    for(let i=k+1;i<n;i++){
      let m=M[i][k]/M[k][k]; for(let j=k;j<=n;j++)M[i][j]-=m*M[k][j];
      steps.push(`R${i+1} ← R${i+1} - (${fmt(m)})R${k+1}\n`+matrixText(M));
    }
  }
  let x=Array(n).fill(0);
  for(let i=n-1;i>=0;i--){let s=M[i][n];for(let j=i+1;j<n;j++)s-=M[i][j]*x[j];x[i]=s/M[i][i]}
  document.getElementById('gauss-summary').innerHTML=x.map((v,i)=>`x<sub>${i+1}</sub> = <b>${fmt(v)}</b>`).join('<br>');
  document.getElementById('gauss-steps').innerHTML=steps.map((s,i)=>`<div class="step"><b>${i+1}-bosqich</b><div class="matrix">${esc(s)}</div></div>`).join('');
}

// ---------- INTERPOLATION ----------
function parseNums(s){return s.split(/[\s,;]+/).filter(Boolean).map(Number)}
function lagrangeVal(xs,ys,x){let sum=0;for(let i=0;i<xs.length;i++){let L=1;for(let j=0;j<xs.length;j++)if(i!==j)L*=((x-xs[j])/(xs[i]-xs[j]));sum+=ys[i]*L}return sum}
function newtonCoeffs(xs,ys){let c=ys.slice(),n=xs.length;for(let j=1;j<n;j++)for(let i=n-1;i>=j;i--)c[i]=(c[i]-c[i-1])/(xs[i]-xs[i-j]);return c}
function newtonVal(xs,c,x){let s=c[c.length-1];for(let i=c.length-2;i>=0;i--)s=s*(x-xs[i])+c[i];return s}
function solveInterp(method){
  let xs=parseNums(document.getElementById('ix').value),ys=parseNums(document.getElementById('iy').value),t=+document.getElementById('itarget').value;
  if(xs.length!==ys.length||xs.length<2){alert('x va y sonlari teng bo‘lsin.');return}
  let c=newtonCoeffs(xs,ys), val=method==='lagrange'?lagrangeVal(xs,ys,t):newtonVal(xs,c,t);
  document.getElementById('interp-summary').innerHTML=`<b>${method==='lagrange'?'Lagrange':'Newton'}</b><br>P(${fmt(t)}) ≈ <b>${fmt(val)}</b>`;
  document.getElementById('interp-details').innerHTML=method==='newton'
    ? `<div class="step">Bo‘lingan ayirmalar koeffitsiyentlari:<br>${c.map((v,i)=>`a${i} = ${fmt(v)}`).join('<br>')}</div>`
    : `<div class="step">P(x*) = Σ yᵢLᵢ(x*) formulasi bilan hisoblandi. Har bir bazis ko‘phad boshqa tugunlarda 0, o‘z tugunida 1 bo‘ladi.</div>`;
  let xmin=Math.min(...xs),xmax=Math.max(...xs),f=x=>method==='lagrange'?lagrangeVal(xs,ys,x):newtonVal(xs,c,x);
  plotFunction(document.getElementById('interp-canvas'),f,xmin,xmax,xs.map((x,i)=>({x,y:ys[i]})).concat([{x:t,y:val}]));
}

// ---------- INTEGRAL ----------
function integralMethod(f,a,b,n,method){
  let h=(b-a)/n;
  if(method==='rect'){let s=0;for(let i=0;i<n;i++){let x=a+(i+.5)*h;s+=f(x)}return s*h}
  if(method==='trap'){let s=.5*(f(a)+f(b));for(let i=1;i<n;i++)s+=f(a+i*h);return s*h}
  if(method==='simpson'){if(n%2)n++;h=(b-a)/n;let s=f(a)+f(b);for(let i=1;i<n;i++)s+=(i%2?4:2)*f(a+i*h);return s*h/3}
}
function solveIntegral(method){
  let f;try{f=expr1(document.getElementById('int-f').value)}catch{alert('f(x) noto‘g‘ri');return}
  let a=+document.getElementById('int-a').value,b=+document.getElementById('int-b').value,n=+document.getElementById('int-n').value;
  let val=integralMethod(f,a,b,n,method);
  document.getElementById('int-summary').innerHTML=`<b>${method.toUpperCase()}</b><br>I ≈ <b>${fmt(val)}</b><br>n=${n}`;
  let ns=[4,8,16,32,64,128], vals=ns.map(k=>integralMethod(f,a,b,k,method));
  document.getElementById('int-conv').innerHTML='<table><tr><th>n</th><th>I_n</th><th>|I_n-I_prev|</th></tr>'+ns.map((k,i)=>`<tr><td>${k}</td><td>${fmt(vals[i])}</td><td>${i?fmt(Math.abs(vals[i]-vals[i-1])):'—'}</td></tr>`).join('')+'</table>';
  plotFunction(document.getElementById('int-canvas'),f,a,b,[]);
}

// ---------- ODE ----------
function solveODE(method){
  let f;try{f=expr2(document.getElementById('ode-f').value)}catch{alert("f(x,y) noto‘g‘ri");return}
  let x=+document.getElementById('ode-x0').value,y=+document.getElementById('ode-y0').value,x1=+document.getElementById('ode-x1').value,h=+document.getElementById('ode-h').value;
  let rows=[[0,x,y]],pts=[{x,y}],k=0;
  while(x < x1-1e-12 && k<10000){
    let hh=Math.min(h,x1-x),yn;
    if(method==='euler')yn=y+hh*f(x,y);
    else {let k1=f(x,y),k2=f(x+hh/2,y+hh*k1/2),k3=f(x+hh/2,y+hh*k2/2),k4=f(x+hh,y+hh*k3);yn=y+hh*(k1+2*k2+2*k3+k4)/6}
    x+=hh;y=yn;k++;rows.push([k,x,y]);pts.push({x,y});
  }
  document.getElementById('ode-summary').innerHTML=`<b>${method==='euler'?'Eyler':'Runge–Kutta 4'}</b><br>y(${fmt(x1)}) ≈ <b>${fmt(y)}</b><br>Qadamlar: ${k}`;
  document.getElementById('ode-table').innerHTML='<tr><th>k</th><th>x_k</th><th>y_k</th></tr>'+rows.map(r=>`<tr><td>${r[0]}</td><td>${fmt(r[1])}</td><td>${fmt(r[2])}</td></tr>`).join('');
  const c=document.getElementById('ode-canvas'),ctx=c.getContext('2d'),w=c.width,hh=c.height;
  let xs=pts.map(p=>p.x),ys=pts.map(p=>p.y),xmin=Math.min(...xs),xmax=Math.max(...xs),ymin=Math.min(...ys),ymax=Math.max(...ys);if(ymin===ymax){ymin--;ymax++}let pad=(ymax-ymin)*.15;ymin-=pad;ymax+=pad;let A=drawAxes(ctx,w,hh,xmin,xmax,ymin,ymax);
  ctx.strokeStyle='#2563eb';ctx.lineWidth=2;ctx.beginPath();pts.forEach((p,i)=>{let X=A.X(p.x),Y=A.Y(p.y);i?ctx.lineTo(X,Y):ctx.moveTo(X,Y)});ctx.stroke();
  ctx.fillStyle='#dc2626';pts.forEach(p=>{ctx.beginPath();ctx.arc(A.X(p.x),A.Y(p.y),3,0,Math.PI*2);ctx.fill()});
}

// ---------- PDE ----------
function solvePDE(){
  let N=+document.getElementById('pde-n').value,top=+document.getElementById('pde-top').value,other=+document.getElementById('pde-other').value,eps=+document.getElementById('pde-eps').value;
  N=Math.max(4,Math.min(40,N));
  let u=Array.from({length:N},()=>Array(N).fill(other));
  for(let j=0;j<N;j++)u[0][j]=top;
  let iter=0,err=Infinity;
  while(err>eps && iter<20000){
    let v=u.map(r=>r.slice());err=0;
    for(let i=1;i<N-1;i++)for(let j=1;j<N-1;j++){v[i][j]=(u[i-1][j]+u[i+1][j]+u[i][j-1]+u[i][j+1])/4;err=Math.max(err,Math.abs(v[i][j]-u[i][j]));}
    u=v;iter++;
  }
  document.getElementById('pde-summary').innerHTML=`Jacobi iteratsiyasi: <b>${iter}</b><br>Max o‘zgarish: <b>${fmt(err)}</b><br>Markaz u ≈ <b>${fmt(u[Math.floor(N/2)][Math.floor(N/2)])}</b>`;
  let mid=Math.floor(N/2);
  document.getElementById('pde-slice').innerHTML='<table><tr>'+u[mid].map((_,j)=>`<th>j=${j}</th>`).join('')+'</tr><tr>'+u[mid].map(v=>`<td>${fmt(v)}</td>`).join('')+'</tr></table>';
  const c=document.getElementById('pde-canvas'),ctx=c.getContext('2d'),w=c.width,h=c.height;ctx.clearRect(0,0,w,h);
  let cellW=w/N,cellH=h/N,maxv=Math.max(...u.flat()),minv=Math.min(...u.flat()),d=maxv-minv||1;
  for(let i=0;i<N;i++)for(let j=0;j<N;j++){let t=(u[i][j]-minv)/d;let g=Math.floor(255*(1-t));let b=Math.floor(255*t);ctx.fillStyle=`rgb(${Math.floor(255*t)},${g},${b})`;ctx.fillRect(j*cellW,i*cellH,cellW+1,cellH+1)}
}