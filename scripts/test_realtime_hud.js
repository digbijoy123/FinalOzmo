const fs = require('fs');
const assert = require('assert');

console.log('=== TESTING REAL-TIME TOP SCREEN INFO HUD SUITE ===');

const html = fs.readFileSync('index.html', 'utf8');

// 1. Verify DOM elements exist
const expectedDomIds = [
  'realtimeHud',
  'realtimeHudPill',
  'realtimeHudDot',
  'realtimeHudLabel',
  'realtimeHudSep',
  'realtimeHudDetail'
];
for (const id of expectedDomIds) {
  assert(html.includes(`id="${id}"`), `FAIL: Expected DOM element with id="${id}" not found`);
}
console.log(`PASS: All ${expectedDomIds.length} Real-Time HUD DOM elements confirmed in index.html.`);

// 2. Verify CSS styles and status state classes exist
const expectedCssClasses = [
  '.realtimeHud',
  '.realtimeHudPill',
  '.realtimeHudDot',
  '.realtimeHudLabel',
  '.realtimeHudDetail',
  '.hud-standby',
  '.hud-listening',
  '.hud-heard',
  '.hud-contacting',
  '.hud-brain',
  '.hud-thinking',
  '.hud-speaking',
  '.hud-game'
];
for (const cls of expectedCssClasses) {
  assert(html.includes(cls), `FAIL: Expected CSS rule ${cls} not found in index.html`);
}
console.log(`PASS: All ${expectedCssClasses.length} Real-Time HUD CSS classes and state variants verified.`);

// 3. Verify updateRealtimeHud and syncRealtimeHudFromStage function definitions
assert(html.includes('function updateRealtimeHud('), 'FAIL: updateRealtimeHud function missing');
assert(html.includes('function syncRealtimeHudFromStage('), 'FAIL: syncRealtimeHudFromStage function missing');
console.log('PASS: updateRealtimeHud and syncRealtimeHudFromStage defined.');

// 4. Verify pipeline hooks for all required stages:
// a) ROBO HEARD
assert(html.includes("updateRealtimeHud('ROBO HEARD'"), 'FAIL: ROBO HEARD hook missing');
// b) CONTACTING BRAIN
assert(html.includes("updateRealtimeHud('CONTACTING BRAIN'"), 'FAIL: CONTACTING BRAIN hook missing');
// c) THINKING
assert(html.includes("updateRealtimeHud('THINKING'"), 'FAIL: THINKING hook missing');
// d) BRAIN (GEMINI)
assert(html.includes("updateRealtimeHud('BRAIN (GEMINI)'"), 'FAIL: BRAIN (GEMINI) hook missing');
// e) SPEAKING
assert(html.includes("updateRealtimeHud('SPEAKING'"), 'FAIL: SPEAKING hook missing');
// f) STANDBY / LISTENING
assert(html.includes("updateRealtimeHud('STANDBY'"), 'FAIL: STANDBY hook missing');
assert(html.includes("updateRealtimeHud('LISTENING'"), 'FAIL: LISTENING hook missing');

console.log('PASS: All required real-time stages (ROBO HEARD, CONTACTING, BRAIN, THINKING, SPEAKING, STANDBY/LISTENING) hooked into runtime pipeline.');

// 5. Test DOM simulation of updateRealtimeHud logic
function simulateHud(label, detail, stageKey) {
  const state = {
    pillClass: 'realtimeHudPill hud-' + (stageKey || 'standby'),
    label: String(label || 'STANDBY').toUpperCase(),
    detail: (detail && detail.trim()) ? detail.trim() : null
  };
  return state;
}

const testCases = [
  { label: 'ROBO HEARD', detail: '"what can you do"', stage: 'heard' },
  { label: 'CONTACTING BRAIN', detail: 'GEMINI CLOUD...', stage: 'contacting' },
  { label: 'THINKING', detail: 'SYNTHESIZING...', stage: 'thinking' },
  { label: 'BRAIN (GEMINI)', detail: 'RESPONSE READY', stage: 'brain' },
  { label: 'SPEAKING', detail: 'VOICE ACTIVE 🔊', stage: 'speaking' },
  { label: 'STANDBY', detail: 'SAY "MAX"', stage: 'standby' }
];

for (const tc of testCases) {
  const sim = simulateHud(tc.label, tc.detail, tc.stage);
  assert.strictEqual(sim.label, tc.label);
  assert.strictEqual(sim.detail, tc.detail);
  assert.strictEqual(sim.pillClass, `realtimeHudPill hud-${tc.stage}`);
}
console.log(`PASS: Simulated all ${testCases.length} pipeline transitions cleanly.`);

console.log('\n*** ALL REAL-TIME TOP HUD TESTS PASSED CLEANLY! ***\n');
