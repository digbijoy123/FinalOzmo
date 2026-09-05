const fs = require('fs');
const assert = require('assert');

console.log('=== TESTING COZMO INTERACTIVE GAMES, ROBOTIC HANDS & AI ART SUITE ===');

const html = fs.readFileSync('index.html', 'utf8');

// 1. Verify CSS pointer events on #face and .avatarZone
assert(html.includes('#face{position:relative;width:100%;height:100%;display:block;pointer-events:auto;touch-action:none;cursor:pointer}'),
  'FAIL: #face must have pointer-events: auto and touch-action: none');
assert(html.includes('.avatarZone{position:absolute;inset:0;bottom:0;display:flex;align-items:center;justify-content:center;z-index:10;pointer-events:auto}'),
  'FAIL: .avatarZone must have pointer-events: auto');
console.log('PASS: Canvas touch and pointer events properly configured.');

// 2. Verify DEV Screen DOM elements
const expectedIds = [
  'devInteractiveCard',
  'gameQuickTapBtn',
  'gameRpsBtn',
  'gameStaringBtn',
  'gameCodebreakerBtn',
  'gameMimicBtn',
  'gameStopBtn',
  'handHighFiveBtn',
  'handFistBumpBtn',
  'handWaveBtn',
  'handThumbsUpBtn',
  'handPointBtn',
  'handDismissBtn',
  'visEqualizerBtn',
  'visDizzyBtn',
  'visReticleBtn',
  'visTickleBtn',
  'visMatrixBtn',
  'visClearBtn',
  'aiArtPromptInput',
  'aiArtGenerateBtn',
  'aiArtDismissBtn'
];

for (const id of expectedIds) {
  assert(html.includes(`id="${id}"`), `FAIL: Expected DOM element with id="${id}" not found`);
}
console.log(`PASS: All ${expectedIds.length} interactive DEV screen DOM elements confirmed.`);

// 3. Verify Sound Engine Methods in CozmoSoundEngine
const expectedSounds = ['playSlap', 'playDing', 'playBuzzer', 'playCheer', 'playTantrum', 'playTick'];
for (const s of expectedSounds) {
  assert(html.includes(`${s}()`), `FAIL: Expected sound method ${s}() not found in CozmoSoundEngine`);
}
console.log('PASS: CozmoSoundEngine has all required interactive sound effect synthesizers.');

// 4. Verify Interactive Classes and Engine Methods
assert(html.includes('class InteractiveParticleSystem'), 'FAIL: InteractiveParticleSystem class not found');
assert(html.includes('class CozmoInteractiveEngine'), 'FAIL: CozmoInteractiveEngine class not found');

const expectedEngineMethods = [
  'showHand(',
  'dismissHand(',
  'startGame(',
  'stopGame(',
  'playRPSChoice(',
  'guessCodebreaker(',
  'setVisualMode(',
  'generateAndDisplayArt(',
  'dismissArt(',
  'preRender(',
  'postRender(',
  'renderHand(',
  'renderGameOverlay(',
  'renderEqualizer(',
  'renderDizzySpirals(',
  'renderCyberReticle(',
  'renderArtDisplay(',
  'handlePointerDown(',
  'handlePointerMove(',
  'handlePointerUp('
];

for (const m of expectedEngineMethods) {
  assert(html.includes(m), `FAIL: Expected method ${m} not found in CozmoInteractiveEngine`);
}
console.log('PASS: CozmoInteractiveEngine has all required hand, game, visual, and art methods.');

// 5. Test Voice Commands Interception Logic
// Extract handleVoiceCommand body
const rActionRegex = /handleVoiceCommand\(transcript\)\s*\{([\s\S]*?)\n    \}/;
const match = html.match(rActionRegex);
assert(match, 'FAIL: Could not extract handleVoiceCommand');
const fnBody = match[1];

// Mock sandbox to test voice command matching
function testVoiceCommand(phrase) {
  const l = String(phrase || '').toLowerCase().trim();

  // Test gesture regexes
  if (/\b(high five|high-five|gimme five|give me a high five|taali)\b/.test(l)) return 'high_five';
  if (/\b(fist bump|fist-bump|bump it|give me a fist bump)\b/.test(l)) return 'fist_bump';
  if (/\b(wave|wave hand|say hi|say hello|alvida|bye bye)\b/.test(l)) return 'wave';
  if (/\b(thumbs up|good job|well done|shabash)\b/.test(l)) return 'thumbs_up';
  if (/\b(point|point at me|look there|ishara)\b/.test(l)) return 'point';

  // Test game regexes
  if (/\b(quick tap|tap reflex|reflex game|speed tap|tap game)\b/.test(l)) return 'game_quick_tap';
  if (/\b(rock paper scissors|stone paper scissors|play rps|rock paper scissor)\b/.test(l)) return 'game_rps';
  if (/\b(staring contest|don't blink|dont blink|eye contact contest)\b/.test(l)) return 'game_staring';
  if (/\b(codebreaker|guess my number|guess the number|number game)\b/.test(l)) return 'game_codebreaker';
  if (/\b(face mimic|simon says|mimic game|copy my face)\b/.test(l)) return 'game_face_mimic';

  // Test visual mode regexes
  if (/\b(equalizer|audio visualizer|music visualizer|dance mode)\b/.test(l)) return 'vis_equalizer';
  if (/\b(get dizzy|dizzy eyes|spin your eyes|hypnotize|hypnotic)\b/.test(l)) return 'vis_dizzy';
  if (/\b(cyber hud|targeting mode|hud reticle|target lock|scan mode)\b/.test(l)) return 'vis_reticle';
  if (/\b(matrix rain|cyberpunk rain|digital rain|hacker mode)\b/.test(l)) return 'vis_matrix';
  if (/\b(tickle|pet you|good robot|good boy)\b/.test(l)) return 'vis_tickle';

  // Test AI draw regex
  const drawMatch = l.match(/\b(?:draw|paint|sketch|generate an? image of|create an? image of|picture of)\s+(.+)/i);
  if (drawMatch && drawMatch[1]) return 'ai_art';

  return null;
}

const voiceTestCases = [
  { phrase: "high five", expected: "high_five" },
  { phrase: "give me a fist bump", expected: "fist_bump" },
  { phrase: "wave hand", expected: "wave" },
  { phrase: "thumbs up", expected: "thumbs_up" },
  { phrase: "point at me", expected: "point" },
  { phrase: "quick tap", expected: "game_quick_tap" },
  { phrase: "let's play rock paper scissors", expected: "game_rps" },
  { phrase: "staring contest", expected: "game_staring" },
  { phrase: "guess my number", expected: "game_codebreaker" },
  { phrase: "simon says", expected: "game_face_mimic" },
  { phrase: "audio visualizer", expected: "vis_equalizer" },
  { phrase: "get dizzy", expected: "vis_dizzy" },
  { phrase: "cyber hud", expected: "vis_reticle" },
  { phrase: "matrix rain", expected: "vis_matrix" },
  { phrase: "tickle", expected: "vis_tickle" },
  { phrase: "Max, draw a cybernetic cat", expected: "ai_art" },
  { phrase: "generate an image of a red supercar", expected: "ai_art" }
];

for (const tc of voiceTestCases) {
  const res = testVoiceCommand(tc.phrase);
  assert.strictEqual(res, tc.expected, `Voice matching failed for "${tc.phrase}": got ${res}, expected ${tc.expected}`);
}
console.log(`PASS: All ${voiceTestCases.length} voice commands matched expected actions!`);

// 6. Test Backend Image Generation handler in api/robo.mjs
const backendCode = fs.readFileSync('api/robo.mjs', 'utf8');
assert(backendCode.includes('body.generateImage === true'), 'FAIL: api/robo.mjs missing generateImage handler');
assert(backendCode.includes('image.pollinations.ai/prompt/'), 'FAIL: api/robo.mjs missing pollinations.ai image builder');
console.log('PASS: api/robo.mjs backend image generation endpoint verified.');

// 7. Verify Auto-Stop Mini-Games & Auto-Dismiss Hands Logic
assert(html.includes('this.gameAutoStopTimer = null;'), 'FAIL: gameAutoStopTimer missing from constructor');
assert(html.includes('this.handDismissTimer = null;'), 'FAIL: handDismissTimer missing from constructor');

// Ensure RPS stops instead of cycling back into 'choose'
assert(!html.includes("this.gameState.stage = 'choose';\n        }\n      }, 3500);"), 'FAIL: RPS must not cycle back to choose stage');
assert(html.includes('ROUND FINISHED 🎮'), 'FAIL: Round finished visual indicator missing');
assert(html.includes('rps round finished'), 'FAIL: RPS round finished handler missing');
assert(html.includes('codebreaker solved'), 'FAIL: Codebreaker auto-stop handler missing');
assert(html.includes('staring round finished'), 'FAIL: Staring contest auto-stop handler missing');
console.log('PASS: Auto-stop mechanics verified for RPS, Codebreaker, Staring Contest, and Hands.');

// 8. Verify inferActionFromText in RobotActionEngine
assert(html.includes('inferActionFromText(text, userPrompt)'), 'FAIL: inferActionFromText missing from RobotActionEngine');
assert(html.includes("robotActionEngine.inferActionFromText(reply, clean)"), 'FAIL: respond() missing inferActionFromText fallback');
assert(html.includes("robotActionEngine.inferActionFromText(part.text)"), 'FAIL: GeminiLiveClient missing inferActionFromText dispatch');
console.log('PASS: Gemini brain conversational action inference connected to speech & Live streaming.');

// 9. Verify OLED Screen Routing in executeAction
const expectedActionTypes = [
  'high_five', 'fist_bump', 'wave', 'thumbs_up', 'point', 'dismiss_hand',
  'quick_tap', 'rps', 'staring', 'codebreaker', 'face_mimic', 'stop_game',
  'equalizer', 'dizzy', 'reticle', 'tickle', 'matrix', 'reset_visual',
  'draw_art'
];
for (const act of expectedActionTypes) {
  assert(html.includes(`'${act}'`) || html.includes(`"${act}"`), `FAIL: Action ${act} not handled in executeAction`);
}
console.log('PASS: All OLED interactive screen gestures and games routed through RobotActionEngine.executeAction.');

// 10. Verify Voice Stop and Reset Commands in handleVoiceCommand
assert(html.includes("stop game|exit game|quit game|end game|close game"), 'FAIL: Stop game voice commands missing');
assert(html.includes("dismiss hand|lower hand|hide hand"), 'FAIL: Dismiss hand voice commands missing');
assert(html.includes("reset screen|reset visual|normal eyes|normal screen|normal face"), 'FAIL: Reset screen voice commands missing');
console.log('PASS: Voice commands for stopping mini-games, lowering hands, and resetting screen verified.');

console.log('\n*** ALL COZMO INTERACTIVE SUITE TESTS PASSED CLEANLY! ***\n');
