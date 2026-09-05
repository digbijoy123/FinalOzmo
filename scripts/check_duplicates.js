const fs = require('fs');

const content = fs.readFileSync('index.html', 'utf8');

// 1. Check duplicate IDs
const idRegex = /id=["']([^"']+)["']/g;
const idCounts = {};
let m;
while ((m = idRegex.exec(content)) !== null) {
  idCounts[m[1]] = (idCounts[m[1]] || 0) + 1;
}
const duplicateIds = Object.entries(idCounts).filter(([k, v]) => v > 1);
console.log('Duplicate IDs:', duplicateIds);

// 2. Check duplicate function declarations
const fnRegex = /function\s+([a-zA-Z0-9_$]+)\s*\(/g;
const fnCounts = {};
while ((m = fnRegex.exec(content)) !== null) {
  fnCounts[m[1]] = (fnCounts[m[1]] || 0) + 1;
}
const duplicateFns = Object.entries(fnCounts).filter(([k, v]) => v > 1);
console.log('Duplicate Functions:', duplicateFns);

// 3. Check duplicate class declarations
const classRegex = /class\s+([a-zA-Z0-9_$]+)\s*\{/g;
const classCounts = {};
while ((m = classRegex.exec(content)) !== null) {
  classCounts[m[1]] = (classCounts[m[1]] || 0) + 1;
}
const duplicateClasses = Object.entries(classCounts).filter(([k, v]) => v > 1);
console.log('Duplicate Classes:', duplicateClasses);
