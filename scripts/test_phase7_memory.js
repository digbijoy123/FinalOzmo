const fs = require('fs');
const assert = require('assert');

const html = fs.readFileSync('index.html', 'utf8');

// 1. Verify required elements exist in HTML
assert.ok(html.includes('id="devMemoryEpisodes"'), 'Must contain devMemoryEpisodes element');
assert.ok(html.includes('id="devMemoryLastEpisode"'), 'Must contain devMemoryLastEpisode element');
assert.ok(html.includes('id="devPersonalityCard"'), 'Must contain devPersonalityCard element');
assert.ok(html.includes('id="devHumorSlider"'), 'Must contain devHumorSlider element');
assert.ok(html.includes('id="devAttitudeSelect"'), 'Must contain devAttitudeSelect element');
assert.ok(html.includes('id="devVerbositySelect"'), 'Must contain devVerbositySelect element');
assert.ok(html.includes('id="devCustomDirectiveInput"'), 'Must contain devCustomDirectiveInput element');

console.log('PASS: All Phase 7 and Phase E DOM elements confirmed in index.html');

// 2. Extract and test schema and functions
const extractFn = (name) => {
  const match = html.match(new RegExp(`function ${name}\\([\\s\\S]*?\\n  \\}`));
  assert.ok(match, `Could not extract function ${name}`);
  return match[0];
};

const extractConst = (name) => {
  const match = html.match(new RegExp(`const ${name}\\s*=[\\s\\S]*?;`));
  assert.ok(match, `Could not extract const ${name}`);
  return match[0];
};

const mockScope = `
${extractConst('DEFAULT_PERSONALITY')}
${extractConst('DEFAULT_PERSON')}

const p = DEFAULT_PERSON();
assert.ok(Array.isArray(p.episodes), 'DEFAULT_PERSON must have episodes array');
assert.ok(p.workingContext && typeof p.workingContext === 'object', 'DEFAULT_PERSON must have workingContext');

const personality = DEFAULT_PERSONALITY();
assert.strictEqual(typeof personality.humor, 'number', 'humor must be number');
assert.strictEqual(personality.attitude, 'witty', 'attitude must be witty');
assert.strictEqual(personality.verbosity, 'concise', 'verbosity must be concise');

${extractFn('formatRelativeTime')}
assert.strictEqual(formatRelativeTime(Date.now() - 10000), 'just now');
assert.strictEqual(formatRelativeTime(Date.now() - 120000), '2 minutes ago');
assert.strictEqual(formatRelativeTime(Date.now() - 7200000), '2 hours ago');
assert.strictEqual(formatRelativeTime(Date.now() - 90000000), 'yesterday');

// Mock memory environment
let roboMemory = {
  activePersonId: 'primary-user',
  personality: DEFAULT_PERSONALITY(),
  persons: [p]
};

function getActivePerson(){
  return roboMemory.persons.find(x => x.personId === roboMemory.activePersonId);
}
function ensureMemoryRegistry(){ }
function saveRoboMemory(){ }
function renderMemoryDiagnostics(){ }
function devLog(){ }

${extractFn('recordEpisode')}
const ep1 = recordEpisode('Discussed building robot chassis', 'conversation', 'happy');
assert.ok(ep1 && ep1.id, 'recordEpisode must return created episode');
assert.strictEqual(p.episodes.length, 1);
assert.strictEqual(p.episodes[0].summary, 'Discussed building robot chassis');

// Test implicit memory extraction
function addFact(key, value){
  p.facts.push({ key, value });
}
${extractFn('extractImplicitMemories')}

assert.strictEqual(extractImplicitMemories('my birthday is on October 5th'), true);
assert.ok(p.facts.some(f => f.key === 'birthday' && f.value.includes('October 5th')));

assert.strictEqual(extractImplicitMemories('i work as a software engineer at Google'), true);
assert.ok(p.facts.some(f => f.key === 'profession' && f.value.includes('software engineer')));

assert.strictEqual(extractImplicitMemories('i live in Bangalore'), true);
assert.ok(p.facts.some(f => f.key === 'location' && f.value === 'Bangalore'));

assert.strictEqual(extractImplicitMemories("my dog's name is Bruno"), true);
assert.ok(p.facts.some(f => f.key === 'pet' && f.value === 'Bruno'));

console.log('PASS: Phase 7 Schema, Episodic Logger & Implicit Extraction validated!');
`;

eval(mockScope);

// 3. Verify handleMemoryCommand handles new commands
assert.ok(html.includes('what did we talk about'), 'Must support episodic recall');
assert.ok(html.includes('remember when'), 'Must support remember when');
assert.ok(html.includes('set humor to'), 'Must support set humor to');
assert.ok(html.includes('set attitude to'), 'Must support set attitude to');
assert.ok(html.includes('keep answers short'), 'Must support verbosity command');
assert.ok(html.includes('forget my'), 'Must support targeted forget');
assert.ok(html.includes('PERSONALITY TUNING'), 'Must inject personality into prompt');

console.log('ALL PHASE 7 & PHASE E TESTS PASSED CLEANLY!');
