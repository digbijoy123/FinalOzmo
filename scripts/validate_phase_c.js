const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

// 1. Check Biometric HUD elements
const requiredElements = [
  'id="enrollmentHUD"',
  'id="biometricRing"',
  'id="biometricPercent"',
  'id="biometricInstructions"',
  'id="enrollPromptModal"',
  'id="enrollFaceBtn"',
  'id="enrollNameInput"',
  'id="enrollRelationInput"',
  'id="enrollModalStartBtn"',
  'id="enrollModalCancelBtn"',
  'id="enrollCancelBtn"'
];

let allElementsFound = true;
for (const el of requiredElements) {
  if (!html.includes(el)) {
    console.error('Missing required element:', el);
    allElementsFound = false;
  }
}

if (!allElementsFound) {
  process.exit(1);
}
console.log('ALL Phase C HTML elements confirmed in index.html.');

// 2. Validate script syntax
const scriptMatch = html.match(/<script[\s\S]*?>([\s\S]*?)<\/script>/i);
if (!scriptMatch) {
  console.error('No script tag found');
  process.exit(1);
}

try {
  // Test parsing via Function constructor
  new Function(scriptMatch[1]);
  console.log('JS syntax parsed cleanly without any SyntaxError!');
} catch (e) {
  console.error('JS Syntax Error:', e);
  process.exit(1);
}

// 3. Check for wizard and check in code
if (!html.includes('class FaceEnrollmentWizard')) {
  console.error('Missing FaceEnrollmentWizard class');
  process.exit(1);
}
if (!html.includes('Module 8.5 Face enrollment wizard')) {
  console.error('Missing Module 8.5 check in runDevChecks');
  process.exit(1);
}
console.log('Phase C FaceEnrollmentWizard and Dev Check confirmed!');
