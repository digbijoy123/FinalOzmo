const fs = require('fs');
const assert = require('assert');

const html = fs.readFileSync('index.html', 'utf8');

// 1. Verify code modifications are present in index.html
assert.ok(html.includes('activeTargetMismatchFrames'), 'activeTargetMismatchFrames must exist');
assert.ok(html.includes('identity-grace-hold'), 'identity-grace-hold must exist');
assert.ok(html.includes('consolidateDuplicatePersonProfiles'), 'consolidateDuplicatePersonProfiles must exist');
assert.ok(html.includes('arePersonRecordsRelated'), 'arePersonRecordsRelated must exist');

// 2. Extract consolidateDuplicatePersonProfiles and test consolidation logic
const extractFn = (name) => {
  const match = html.match(new RegExp(`function ${name}\\([\\s\\S]*?\\n  \\}`));
  assert.ok(match, `Could not extract function ${name}`);
  return match[0];
};

const normalizeFaceDescriptorFn = `
function normalizeFaceDescriptor(raw){
  if(!raw) return null;
  if(Array.isArray(raw) && raw.length === 128) return raw;
  if(raw.length === 128) return Array.from(raw);
  return null;
}
function faceDistance(d1, d2){
  if(!d1 || !d2) return Infinity;
  let sum = 0;
  for(let i = 0; i < 128; i++){
    const diff = d1[i] - d2[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}
function normalizePersonFaceProfileBank(p){
  return (p.faceProfiles || []).length;
}
function safeFixedNumber(num, decimals){
  return num != null ? Number(num).toFixed(decimals) : null;
}
function devLog(){ }
`;

const scopeCode = `
${normalizeFaceDescriptorFn}
let roboMemory = null;
${extractFn('areNamesPhoneticallySimilar')}
${extractFn('arePersonRecordsRelated')}
${extractFn('consolidateDuplicatePersonProfiles')}

// Create mock descriptors for Digbijoy and Digvijay with tiny distance 0.05
const baseDesc = new Array(128).fill(0.1);
const desc1 = baseDesc.slice();
const desc2 = baseDesc.slice();
desc2[0] = 0.12; // distance between desc1 and desc2 is ~0.02

const mockMemory = {
  activePersonId: 'person-1',
  persons: [
    {
      personId: 'person-1',
      displayName: 'Digbijoy',
      aliases: [],
      faceProfiles: [{ descriptor: desc1 }]
    },
    {
      personId: 'person-2',
      displayName: 'Digvijay',
      aliases: [],
      faceProfiles: [{ descriptor: desc2 }]
    },
    {
      personId: 'person-3',
      displayName: 'Alice',
      aliases: [],
      faceProfiles: [{ descriptor: new Array(128).fill(0.8) }]
    }
  ]
};

roboMemory = mockMemory;

// Test arePersonRecordsRelated
assert.strictEqual(arePersonRecordsRelated('person-1', 'person-2'), true, 'Digbijoy and Digvijay must be recognized as related');
assert.strictEqual(arePersonRecordsRelated('person-1', 'person-3'), false, 'Digbijoy and Alice must NOT be recognized as related');

// Test consolidateDuplicatePersonProfiles
const merged = consolidateDuplicatePersonProfiles(mockMemory);
assert.strictEqual(merged, 1, 'Exactly 1 duplicate profile must be consolidated');
assert.strictEqual(mockMemory.persons.length, 2, 'Should remain with 2 people (Digbijoy + Alice)');
const digbijoy = mockMemory.persons.find(p => p.personId === 'person-1');
assert.ok(digbijoy, 'Digbijoy must remain as primary record');
assert.ok(digbijoy.aliases.includes('Digvijay'), 'Digvijay must be preserved in aliases');
assert.strictEqual(digbijoy.faceProfiles.length, 2, 'Both face profiles must be retained in Digbijoy');

console.log('PASS: Profile consolidation unit tests succeeded!');
`;

eval(scopeCode);

// 3. Test that registerIdentityCandidate in index.html uses 0.42 quick-lock and threshold
assert.ok(html.includes('distance <= 0.42'), 'Must quick-lock on distance <= 0.42');
assert.ok(html.includes('Math.max(0.68, faceRecognitionThreshold)'), 'Must not hard-cap threshold below 0.68');

// 4. Test that mismatch has a debounce duration of 2200ms
assert.ok(html.includes('mismatchDuration>2200 && activeTargetMismatchFrames>=8'), 'Must debounce face-mismatch for 2200ms and 8 frames');

console.log('ALL ACTIVE FACE RECOGNITION TESTS PASSED SUCCESSFULLY!');
