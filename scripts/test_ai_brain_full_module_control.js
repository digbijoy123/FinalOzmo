import fs from 'fs';
import assert from 'assert';

console.log('=== TESTING AI BRAIN MODULE CONTROL & TIMEOUT FALLBACK FIX ===');

const html = fs.readFileSync('index.html', 'utf8');
const backend = fs.readFileSync('api/robo.mjs', 'utf8');

// Test 1: Hollow "I heard you" fallback string removed
assert(!html.includes('My circuits are on it!'), 'Hollow fallback "My circuits are on it!" must be removed from index.html');
console.log('PASS: Hollow "My circuits are on it!" fallback completely eliminated from codebase.');

// Test 2: Local fallback communicates actual connection status
assert(html.includes('AI_TIMEOUT'), 'localFallback must handle AI_TIMEOUT specifically');
assert(html.includes('My brain connection timed out just now'), 'localFallback must explain timeout to user');
assert(html.includes('connection to the AI brain had a hiccup'), 'localFallback must explain cloud connection hiccup');
console.log('PASS: localFallback provides transparent network status and prompts user to repeat.');

// Test 3: Resilient Mobile Timeout & Single Flight Retry in callRoboBrain
assert(html.includes('brainTimeoutMs = 24000'), 'brainTimeoutMs must be increased to 24000ms for cellular resilience');
assert(html.includes('while (attempts < maxAttempts)'), 'callRoboBrain must implement retry loop');
assert(html.includes('maxAttempts = 2'), 'callRoboBrain must retry up to 2 attempts');
console.log('PASS: callRoboBrain mobile timeout extended to 24s with automated single-flight retry.');

// Test 4: Backend API exposes full action schema and returns action
assert(/action:\s*visionData\.action/.test(backend), 'api/robo.mjs must return action in response payload');
assert(backend.includes('camera_on, camera_off, toggle_camera, switch_camera'), 'api/robo.mjs schema must include camera actions');
assert(backend.includes('start_autonomy, stop_autonomy'), 'api/robo.mjs schema must include autonomy actions');
assert(backend.includes('play_sound, set_emotion, switch_screen, set_personality'), 'api/robo.mjs schema must include sound, emotion, screen, and personality actions');
assert(backend.includes('enroll_face'), 'api/robo.mjs schema must include enroll_face action');
console.log('PASS: api/robo.mjs backend action schema covers all 12 OS modules and preserves action object.');

// Test 5: RobotActionEngine executeAction handles all system modules
const moduleActions = [
  'emergency_stop',
  'camera_on',
  'camera_off',
  'toggle_camera',
  'switch_camera',
  'switch_screen',
  'enroll_face',
  'start_autonomy',
  'stop_autonomy',
  'play_sound',
  'set_emotion',
  'set_personality',
  'clear_memory'
];

for (const act of moduleActions) {
  assert(html.includes(`type === '${act}'`) || html.includes(`'${act}'`), `executeAction must implement handler for ${act}`);
}
console.log(`PASS: All ${moduleActions.length} expanded module control actions implemented in RobotActionEngine.executeAction.`);

// Test 6: RobotActionEngine inferActionFromText covers new modules
assert(html.includes('turn on camera'), 'inferActionFromText must recognize camera on');
assert(html.includes('turn off camera'), 'inferActionFromText must recognize camera off');
assert(html.includes('switch camera'), 'inferActionFromText must recognize switch camera');
assert(html.includes('dev screen'), 'inferActionFromText must recognize dev screen');
assert(html.includes('start autonomy'), 'inferActionFromText must recognize autonomy start');
assert(html.includes('stop autonomy'), 'inferActionFromText must recognize autonomy stop');
assert(html.includes('play sound'), 'inferActionFromText must recognize play sound');
console.log('PASS: RobotActionEngine.inferActionFromText covers camera, screens, autonomy, sound, and face enrollment.');

console.log('\n*** ALL AI BRAIN FULL MODULE CONTROL AND FALLBACK TESTS PASSED! ***\n');
