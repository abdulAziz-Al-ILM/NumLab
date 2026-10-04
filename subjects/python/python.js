const PYODIDE_INDEX='https://cdn.jsdelivr.net/pyodide/v314.0.7/full/';
let pyodideRuntime=null,pyodideLoading=null;
const realExamples={
function:`def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n-1)

for n in range(1, 8):
    print(n, factorial(n))`,
list:`numbers = [8, 3, 12, 1, 7]
squares = [x*x for x in numbers]
print("numbers:", numbers)
print("squares:", squares)
print("max:", max(numbers))`,
class:`class Vector:
    def __init__(self, x, y):
        self.x, self.y = x, y
    def norm(self):
        return (self.x**2 + self.y**2)**0.5

v = Vector(3, 4)
print("norm =", v.norm())`,
numpy:`import numpy as np
A = np.array([[2., 1.], [5., 7.]])
b = np.array([11., 13.])
x = np.linalg.solve(A, b)
print("x =", x)
print("residual =", np.linalg.norm(A @ x - b))`,
bisection:`def f(x):
    return x**3 - x - 2

def bisection(f, a, b, eps=1e-8):
    while b-a > eps:
        c = (a+b)/2
        if f(a)*f(c) <= 0:
            b = c
        else:
            a = c
    return (a+b)/2

root = bisection(f, 1, 2)
print(root, f(root))`
};
function loadRealExample(k){document.getElementById('real-code').value=realExamples[k]}
function clearRealOutput(){document.getElementById('real-output').textContent='';document.getElementById('real-meta').textContent=''}
async function getPyodideRuntime(){
  if(pyodideRuntime)return pyodideRuntime;
  if(pyodideLoading)return pyodideLoading;
  const status=document.getElementById('py-status');status.textContent='Python runtime yuklanmoqda…';
  pyodideLoading=(async()=>{const p=await loadPyodide({indexURL:PYODIDE_INDEX});pyodideRuntime=p;status.innerHTML='<b>Python tayyor.</b> Endi kodlarni erkin sinashingiz mumkin.';return p})();
  try{return await pyodideLoading}catch(e){pyodideLoading=null;status.textContent='Runtime yuklanmadi: '+e.message;throw e}
}
async function runRealPython(){
  const btn=document.getElementById('real-run'),out=document.getElementById('real-output'),meta=document.getElementById('real-meta'),code=document.getElementById('real-code').value;
  btn.disabled=true;btn.textContent='Ishlayapti…';out.textContent='';meta.textContent='';
  try{
    const py=await getPyodideRuntime();
    await py.loadPackagesFromImports(code);
    py.setStdout({batched:s=>{out.textContent+=s+'\n'}});py.setStderr({batched:s=>{out.textContent+='[stderr] '+s+'\n'}});
    const t0=performance.now();const result=await py.runPythonAsync(code);const ms=performance.now()-t0;
    if(result!==undefined&&result!==null){let shown;try{shown=result.toString()}catch{shown=String(result)}if(shown!=='None')out.textContent+='>>> '+shown+'\n';if(result&&result.destroy)result.destroy()}
    meta.innerHTML='<b>Bajarildi.</b> '+ms.toFixed(1)+' ms. Import qilingan Pyodide paketlari kerak bo‘lsa avtomatik yuklandi.';
  }catch(e){out.textContent+=e.toString();meta.innerHTML='<b>Xato:</b> traceback console’da ko‘rsatildi. Kodni tuzatib yana ishga tushiring.'}
  finally{btn.disabled=false;btn.textContent='▶ Run Python'}
}
document.querySelectorAll('.lab-tab').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.lab-tab').forEach(x=>x.classList.remove('active'));document.querySelectorAll('.lab-panel').forEach(x=>x.classList.remove('active'));b.classList.add('active');document.getElementById(b.dataset.lab).classList.add('active')}));
let steps=[],idx=0,timer=null;
const examples={basic:'x = 2\ny = 3\nz = x + y\nprint(z)',if:'x = 7\nif x > 5:\n    y = 10\nprint(y)',loop:'sum = 0\nfor i in range(5):\n    sum = sum + i\nprint(sum)',newton:'x = 1\nfor i in range(5):\n    x = 0.5 * (x + 2 / x)\nprint(x)'};
function loadExample(k){document.getElementById('code').value=examples[k]}
function safeEval(expr,env){if(!/^[0-9A-Za-z_+\-*/().<>=! ]+$/.test(expr))throw Error('Ruxsat etilmagan ifoda');return Function(...Object.keys(env),'return ('+expr+')')(...Object.values(env))}
function runCode(){try{steps=[];idx=0;const lines=document.getElementById('code').value.replace(/\t/g,'    ').split('\n');execBlock(lines,0,lines.length,{},[]);if(!steps.length)steps=[{line:'—',env:{},out:[],explain:'Bajariladigan satr topilmadi.'}];renderStep()}catch(e){steps=[{line:'XATO',env:{},out:[e.message],explain:'Mini-interpreter faqat assignment, print, if va for range(...) subsetini qo‘llaydi.'}];idx=0;renderStep()}}
function execBlock(lines,start,end,env,out){let i=start;while(i<end){const raw=lines[i],trim=raw.trim();if(!trim){i++;continue}const indent=raw.length-raw.trimStart().length;if(trim.startsWith('for ')){const m=trim.match(/^for\s+(\w+)\s+in\s+range\(([^)]+)\):$/);if(!m)throw Error('for sintaksisi tushunilmadi');const n=Number(safeEval(m[2],env)),bodyStart=i+1;let j=bodyStart;while(j<end&&(lines[j].trim()===''||lines[j].length-lines[j].trimStart().length>indent))j++;for(let v=0;v<n;v++){env[m[1]]=v;steps.push({line:trim,env:{...env},out:[...out],explain:m[1]+' = '+v+' bilan sikl tanasi bajariladi.'});execBlock(lines,bodyStart,j,env,out)}i=j;continue}
if(trim.startsWith('if ')){const m=trim.match(/^if\s+(.+):$/);if(!m)throw Error('if sintaksisi tushunilmadi');const ok=!!safeEval(m[1],env),bodyStart=i+1;let j=bodyStart;while(j<end&&(lines[j].trim()===''||lines[j].length-lines[j].trimStart().length>indent))j++;steps.push({line:trim,env:{...env},out:[...out],explain:'Shart '+(ok?'rost':'yolg‘on')+'.'});if(ok)execBlock(lines,bodyStart,j,env,out);i=j;continue}
if(trim.startsWith('print(')&&trim.endsWith(')')){const v=safeEval(trim.slice(6,-1),env);out.push(String(v));steps.push({line:trim,env:{...env},out:[...out],explain:'Ifoda hisoblandi va output ga chiqarildi.'});i++;continue}
const m=trim.match(/^(\w+)\s*=\s*(.+)$/);if(m){env[m[1]]=safeEval(m[2],env);steps.push({line:trim,env:{...env},out:[...out],explain:m[1]+' yangi qiymat oldi.'});i++;continue}
throw Error('Tushunilmagan satr: '+trim)}}
function renderStep(){const s=steps[idx];document.getElementById('current-line').textContent=(idx+1)+'/'+steps.length+'  '+s.line;document.getElementById('vars').textContent=Object.entries(s.env).map(([k,v])=>k+' = '+v).join('\n')||'—';document.getElementById('output').textContent=s.out.join('\n');document.getElementById('explain').innerHTML='<b>Nima bo‘ldi?</b> '+s.explain}
function stepNext(){if(steps.length){idx=Math.min(idx+1,steps.length-1);renderStep()}}
function stepPrev(){if(steps.length){idx=Math.max(idx-1,0);renderStep()}}
function playSteps(){if(!steps.length)runCode();if(timer){clearInterval(timer);timer=null;return}idx=0;renderStep();timer=setInterval(()=>{if(idx>=steps.length-1){clearInterval(timer);timer=null;return}idx++;renderStep()},700)}
function buildLoop(){const N=Math.max(1,+document.getElementById('loop-n').value);let sum=0,rows='';for(let i=0;i<N;i++){const before=sum;sum+=i;rows+='<tr><td>'+i+'</td><td>'+before+'</td><td>'+i+'</td><td>'+sum+'</td></tr>'}document.getElementById('loop-table').innerHTML='<table class="table"><tr><th>i</th><th>old sum</th><th>qo‘shildi</th><th>new sum</th></tr>'+rows+'</table>'}
function runNewton(){let x=+document.getElementById('newton-x0').value,n=Math.max(1,+document.getElementById('newton-n').value),rows='';for(let k=0;k<n;k++){const nx=.5*(x+2/x);rows+='<tr><td>'+k+'</td><td>'+x.toFixed(8)+'</td><td>'+nx.toFixed(8)+'</td></tr>';x=nx}document.getElementById('newton-table').innerHTML='<table class="table"><tr><th>k</th><th>xₖ</th><th>xₖ₊₁</th></tr>'+rows+'</table>';document.getElementById('newton-note').innerHTML='<b>Natija:</b> √2 ≈ '+x.toFixed(10)+'. Sonli usuldagi bir formula dasturda loop ichidagi bitta assignment bo‘lib qoldi.'}
runCode();buildLoop();runNewton();