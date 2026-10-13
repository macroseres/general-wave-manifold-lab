import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const css=readFileSync(new URL('../src/styles/scientific-ui.css',import.meta.url),'utf8');
const app=readFileSync(new URL('../src/App.jsx',import.meta.url),'utf8');
test('scientific UI stylesheet is loaded after legacy rules',()=>{
  assert.match(app,/import '\.\/style\.css';import '\.\/styles\/scientific-ui\.css'/);
});
test('UI tokens support accessibility and responsive layouts',()=>{
  for(const rule of ['focus-visible','prefers-reduced-motion','100dvh','max-width: 700px','--gwml-border-subtle'])assert.ok(css.includes(rule),rule);
});
test('UI stylesheet does not override scientific curves or meshes',()=>{
  for(const rule of ['.chartStable{','.chartUnstable{','.sonicMesh{','THREE.'])assert.ok(!css.includes(rule),rule);
});
