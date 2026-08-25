/* Assemble the Figma plugin: manifest.json and code.js, with design.json
   inlined into code.js because a Figma plugin runs one script and cannot fetch
   a local file beside it. Run extract_design.js first. */
const fs = require('fs'), path = require('path');
const D = __dirname;
const design = JSON.parse(fs.readFileSync(path.join(D, 'design.json'), 'utf8'));

const MANIFEST = {
  name: 'ADB EDRMS Utilization Report',
  id: 'adb-edrms-utilization-report',
  api: '1.0.0',
  main: 'code.js',
  editorType: ['figma'],
  documentAccess: 'dynamic-page',
};

const RUNTIME = fs.readFileSync(path.join(D, 'runtime.js'), 'utf8');
const code = 'const DESIGN = ' + JSON.stringify(design) + ';\n\n' + RUNTIME;

fs.writeFileSync(path.join(D, 'manifest.json'), JSON.stringify(MANIFEST, null, 2));
fs.writeFileSync(path.join(D, 'code.js'), code);
console.log('code.js', Math.round(code.length / 1024) + 'KB',
  '| screens', design.screens.length, '| nav items', design.nav.items.length);
