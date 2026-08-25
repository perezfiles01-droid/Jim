/* Assemble the Figma plugin with LIVE EXTRACTION:
   The plugin fetches design.json from GitHub on each run, so it always
   reflects the current prototype without needing rebuild/re-import.

   Run this instead of build_plugin.js:
   node figma-plugin/build_plugin_live.js
*/
const fs = require('fs'), path = require('path');
const D = __dirname;

const MANIFEST = {
  name: 'ADB EDRMS Utilization Report',
  id: 'adb-edrms-utilization-report',
  api: '1.0.0',
  main: 'code.js',
  editorType: ['figma'],
  documentAccess: 'dynamic-page',
};

const RUNTIME = fs.readFileSync(path.join(D, 'runtime.js'), 'utf8');

/* Create code that fetches design.json from GitHub on each run */
const FETCH_WRAPPER = `
// Live Extraction: Fetch latest design.json from GitHub
// This ensures the plugin always reflects the current prototype state.
// On each run, the plugin fetches the latest design.json, so no rebuild needed.

(async () => {
  try {
    // Show loading indicator
    figma.showUI(
      '<div style="font-family: Inter, sans-serif; padding: 20px; text-align: center; color: #666;">' +
      '<p style="margin: 0 0 8px 0;">🔄 Loading design from GitHub...</p>' +
      '<p style="margin: 0; font-size: 12px; color: #999;">Fetching latest prototype state</p>' +
      '</div>',
      { width: 320, height: 120 }
    );

    // Fetch design.json from GitHub Pages
    const GITHUB_URL = 'https://perezfiles01-droid.github.io/Jim/figma-plugin/design.json';
    const response = await fetch(GITHUB_URL);

    if (!response.ok) {
      throw new Error('HTTP ' + response.status + ': Failed to fetch design from GitHub');
    }

    var DESIGN = await response.json();

    // Validate design object
    if (!DESIGN.tokens || !DESIGN.screens || !DESIGN.nav) {
      throw new Error('Invalid design data structure from GitHub');
    }

    // All runtime.js code will run here with DESIGN available in scope
`;

// Replace the final run() call with error handling wrapper
const RUNTIME_WITH_ERROR_HANDLER = RUNTIME.replace(
  'run();',
  '  } catch (error) { console.error("Plugin error:", error); figma.showUI(\'<div style="font-family: Inter, sans-serif; padding: 16px; color: #c00;"><p style="margin: 0 0 8px 0;"><strong>⚠️ Plugin error</strong></p><p style="margin: 0; font-size: 12px; line-height: 1.5;">\' + error.message + \'</p></div>\', { width: 400, height: 140 }); } })();'
);

const code = FETCH_WRAPPER + RUNTIME_WITH_ERROR_HANDLER;

fs.writeFileSync(path.join(D, 'manifest.json'), JSON.stringify(MANIFEST, null, 2));
fs.writeFileSync(path.join(D, 'code.js'), code);

console.log('✅ Live extraction plugin built');
console.log('   code.js', Math.round(code.length / 1024) + 'KB');
console.log('   Plugin will fetch design.json from GitHub on each run');
console.log('   URL: https://perezfiles01-droid.github.io/Jim/figma-plugin/design.json');
