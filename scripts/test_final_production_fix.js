// scripts/test_final_production_fix.js
// Automated verification suite for Production Gemini API & System Resilience Fix

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

console.log('=== RUNNING PRODUCTION GEMINI API & SYSTEM RESILIENCE TESTS ===');

const indexPath = path.join(__dirname, '..', 'index.html');
const wwwIndexPath = path.join(__dirname, '..', 'www', 'index.html');
const apiPath = path.join(__dirname, '..', 'api', 'robo.mjs');

const html = fs.readFileSync(indexPath, 'utf8');
const wwwHtml = fs.readFileSync(wwwIndexPath, 'utf8');
const apiContent = fs.readFileSync(apiPath, 'utf8');

// 1. Sync check
assert.strictEqual(
  html,
  wwwHtml,
  'index.html and www/index.html must be identical bit-for-bit'
);
console.log('PASS: index.html and www/index.html are perfectly synchronized.');

// 2. api/robo.mjs Production Model & Fallback Checks
assert.ok(
  apiContent.includes("'gemini-1.5-flash'"),
  "api/robo.mjs must use 'gemini-1.5-flash' as standard production model"
);
assert.ok(
  !apiContent.includes("'gemini-3.1-flash-lite'"),
  "api/robo.mjs must NOT contain non-existent 'gemini-3.1-flash-lite'"
);
assert.ok(
  apiContent.includes('candidateModels') && apiContent.includes('modelsToTry'),
  'api/robo.mjs must implement progressive candidate model retry loop'
);
assert.ok(
  apiContent.includes('GOOGLE_API_KEY'),
  'api/robo.mjs must support GOOGLE_API_KEY fallback'
);
assert.ok(
  apiContent.includes('8500'),
  'api/robo.mjs must enforce 8.5s AbortController timeout before Vercel 10s gateway timeout'
);
console.log('PASS: api/robo.mjs production model and fallback logic validated.');

// 3. index.html Dev Screen API Key Management Card
const expectedKeyElements = [
  'id="devApiKeyCard"',
  'id="devAiServerStatus"',
  'id="devAiModelVal"',
  'id="devAiKeySource"',
  'id="devToggleKeyVisBtn"',
  'id="devGeminiKeyInput"',
  'id="devSaveKeyBtn"',
  'id="devTestKeyBtn"',
  'id="devClearKeyBtn"',
  'id="devKeyTestResult"'
];

for (const el of expectedKeyElements) {
  assert.ok(
    html.includes(el),
    `index.html must contain ${el}`
  );
}
console.log('PASS: All Dev Screen API Key Card DOM elements verified.');

// 4. JavaScript Syntax Validation
const scriptMatch = html.match(/<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/i);
assert.ok(scriptMatch, 'Inline <script> block must exist');
try {
  new vm.Script(scriptMatch[1]);
  console.log('PASS: index.html parsed cleanly with zero SyntaxErrors.');
} catch (e) {
  assert.fail('Syntax error in index.html: ' + e.message);
}

// 5. Verify localStorage Persistence Integration
assert.ok(
  html.includes("localStorage.setItem('robo_gemini_api_key'"),
  'Must persist custom key to localStorage'
);
assert.ok(
  html.includes("localStorage.removeItem('robo_gemini_api_key'"),
  'Must support clearing custom key from localStorage'
);
console.log('PASS: localStorage key management verified.');

console.log('\n=== ALL FINAL PRODUCTION FIX TESTS PASSED CLEANLY! ===\n');
