const fs = require('fs');
const vm = require('vm');
const code = fs.readFileSync('app.js','utf8');
const document = {
  querySelectorAll: () => [],
  getElementById: () => ({ value: '', classList: { add(){}, remove(){}, toggle(){} } })
};
const ctx = { console, Math, document };
vm.createContext(ctx);
vm.runInContext(code + `
function __runTests(){
  const cases = [
    ['x^2=2', 2, 2],
    ['2x+3', 2, 7],
    ['sin x=0.7', 2, Math.sin(2)-0.7],
    ['e^x=3x', 2, Math.exp(2)-6],
    ['√(1+x²)', 2, Math.sqrt(5)],
    ['ln(x)', 2, Math.log(2)]
  ];
  for (const [s,x,want] of cases) {
    const got=compileExpr(s,['x'])(x);
    if (Math.abs(got-want)>1e-9) throw new Error('Expression failed: '+s+' -> '+got+' != '+want);
  }
  const sys=parseLinearEquations('2x+y-z=8\\n-3x-y+2z=-11\\n-2x+y+2z=-3');
  if (sys.M.length!==3 || sys.vars.join(',')!=='x,y,z') throw new Error('Linear equation parser failed');
  const root=calcRoot('bisection',compileExpr('x^2=2',['x']),0,2,1e-8,100).root;
  if (Math.abs(root-Math.sqrt(2))>1e-6) throw new Error('Bisection failed');
  const integ=integralMethod(compileExpr('sin(x)',['x']),0,Math.PI,10,'simpson').value;
  if (Math.abs(integ-2)>2e-4) throw new Error('Simpson failed: '+integ);
  const ode=calcODE('rk4',compileExpr('x+y',['x','y']),0,1,1,0.1).final;
  if (!Number.isFinite(ode)) throw new Error('RK4 failed');
  console.log('NumLab smoke tests: PASS');
}
__runTests();
`, ctx);
