const fs = require('fs');
const path = require('path');

const file = path.resolve(__dirname, '..', 'source', 'anime', 'index.html');
let content = fs.readFileSync(file, 'utf8');

// Replace the duplicated auth block (from "// ===== Site Auth" to just before "// ===== Anime Page Logic")
const startMarker = '// ===== Site Auth (shared module) =====';
const endMarker = '// ===== Anime Page Logic =====';

const startIdx = content.indexOf(startMarker);
const endIdx = content.indexOf(endMarker);

if (startIdx === -1 || endIdx === -1) {
  console.log('Markers not found. startIdx:', startIdx, 'endIdx:', endIdx);
  process.exit(1);
}

const replacement = startMarker + '\n// Loads site-auth.js dynamically\n(function(){\n  var s = document.createElement(\'script\');\n  s.src = \'/js/site-auth.js\';\n  document.head.appendChild(s);\n})();\n\n' + endMarker;

content = content.substring(0, startIdx) + replacement + content.substring(endIdx);
fs.writeFileSync(file, content, 'utf8');
console.log('Done: removed', endIdx - startIdx, 'bytes of duplicate auth code');
