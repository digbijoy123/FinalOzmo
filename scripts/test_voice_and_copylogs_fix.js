const fs = require('fs');
const assert = require('assert');

const html = fs.readFileSync('index.html', 'utf8');

// Test 1: Verify parseWakeUtterance in index.html has isStandby parameter and discriminatory tokens
assert.ok(html.includes('parseWakeUtterance(text, isStandby = false)'), 'parseWakeUtterance must accept isStandby flag');
assert.ok(html.includes('for (let i = e.resultIndex; i < e.results.length; i++)'), 'handleResults must process from e.resultIndex');
assert.ok(html.includes('stopSession('), 'stopSession method must exist');

// Test 2: Extract parseWakeUtterance implementation and test both standby and active modes
const scriptMatch = html.match(/parseWakeUtterance\(text, isStandby = false\) \{([\s\S]*?)\n    \}/);
assert.ok(scriptMatch, 'Could not locate parseWakeUtterance method in index.html');

// Create test instance
const wakeClass = {
  normalize(text) {
    return String(text || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
  },
  isWakeToken(token) {
    const directTokens = ['max', 'maks', 'mack', 'mex', 'maxy', 'cozmo', 'robot'];
    const phoneticTokens = ['match', 'mark', 'marks', 'mask', 'matt', 'make', 'mix', 'mass', 'next', 'math', 'maps'];
    if (directTokens.includes(token)) return true;
    if (phoneticTokens.includes(token)) return true;
    for (const t of ['max', 'maks', 'mack', 'mex']) {
      let d = 0;
      const minLen = Math.min(token.length, t.length);
      const maxLen = Math.max(token.length, t.length);
      if (maxLen - minLen > 1) continue;
      for (let i = 0; i < minLen; i++) {
        if (token[i] !== t[i]) d++;
      }
      d += (maxLen - minLen);
      if (d <= 1) return true;
    }
    return false;
  }
};
// Bind the extracted method body
const fnBody = scriptMatch[1];
wakeClass.parseWakeUtterance = new Function('text', 'isStandby = false', fnBody).bind(wakeClass);

// Test standby mode:
console.log('--- Testing Standby Mode (isStandby = true) ---');
const standby1 = wakeClass.parseWakeUtterance('hey max tell me a joke', true);
assert.strictEqual(standby1.woken, true);
assert.strictEqual(standby1.command, 'tell me a joke');
console.log('PASS: Standby "hey max tell me a joke" -> woken:', standby1.woken, 'command:', standby1.command);

const standby2 = wakeClass.parseWakeUtterance('wake up marks', true);
assert.strictEqual(standby2.woken, true);
console.log('PASS: Standby "wake up marks" -> woken:', standby2.woken);

// Test active mode:
console.log('--- Testing Active Dialogue Mode (isStandby = false) ---');
// User says "Can you make a cake?" -> In active mode, "make" should NOT be intercepted as wake word!
const activeSentence1 = wakeClass.parseWakeUtterance('can you make a cake', false);
assert.strictEqual(activeSentence1.woken, false, 'In active conversation, "make" must NOT trigger wake interception!');
console.log('PASS: Active "can you make a cake" -> not intercepted as wake word (preserves natural dialogue)');

// User says "What is next?" -> In active mode, "next" should NOT be intercepted!
const activeSentence2 = wakeClass.parseWakeUtterance('what is next', false);
assert.strictEqual(activeSentence2.woken, false, 'In active conversation, "next" must NOT trigger wake interception!');
console.log('PASS: Active "what is next" -> not intercepted as wake word (preserves natural dialogue)');

// User explicitly says "Hey Max" in active mode:
const activeWake = wakeClass.parseWakeUtterance('hey max', false);
assert.strictEqual(activeWake.woken, true, 'In active mode, explicit "hey max" MUST still be recognized');
console.log('PASS: Active "hey max" -> woken:', activeWake.woken);

// Test 3: Check copyLogs button does not throw when elements are null
console.log('--- Testing Copy Logs Resilience ---');
assert.ok(html.includes('getText(devStage)'), 'copyLogs must use safe getText helper');
assert.ok(html.includes('COPIED!'), 'copyLogs must provide visual feedback');
assert.ok(html.includes('document.execCommand("copy")'), 'copyLogs must support execCommand fallback');
console.log('PASS: copyLogs contains safe getText helper, COPIED! feedback, and execCommand fallback');

console.log('\nALL VOICE REPETITION, WAKE SEPARATION & COPY LOGS TESTS PASSED!');
