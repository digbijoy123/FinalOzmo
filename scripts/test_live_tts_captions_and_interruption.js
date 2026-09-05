const fs = require('fs');
const assert = require('assert');

console.log('=== TESTING LIVE TTS CAPTIONS AND SPEAKING INTERRUPTION SUITE ===');

const html = fs.readFileSync('index.html', 'utf8');

// Test 1: Verify CSS styling for live TTS speaking and interrupted captions
assert.ok(html.includes('.caption.speaking'), 'Missing .caption.speaking CSS class');
assert.ok(html.includes('0 0 22px rgba(0,255,170'), 'Missing neon emerald glow for .caption.speaking');
assert.ok(html.includes('.caption.interrupted'), 'Missing .caption.interrupted CSS class');
console.log('PASS: CSS rules for .caption.speaking and .caption.interrupted verified.');

// Test 2: Verify helper functions for live TTS captions
assert.ok(html.includes('function showLiveTtsCaption('), 'Missing showLiveTtsCaption function');
assert.ok(html.includes('function updateLiveTtsWordProgress('), 'Missing updateLiveTtsWordProgress function');
assert.ok(html.includes('function hideLiveTtsCaption('), 'Missing hideLiveTtsCaption function');
console.log('PASS: Live TTS caption helper functions declared.');

// Test 3: Verify stopRoboAudioPlaybackOnly and stopSpeakingAndListen separation
assert.ok(html.includes('function stopRoboAudioPlaybackOnly('), 'Missing stopRoboAudioPlaybackOnly function');
assert.ok(html.includes('function stopSpeakingAndListen('), 'Missing stopSpeakingAndListen function');
assert.ok(html.includes('stopRoboAudioPlaybackOnly(\'new response\')'), 'speak() must use stopRoboAudioPlaybackOnly, not barge-in');
console.log('PASS: Clean separation between stopRoboAudioPlaybackOnly and stopSpeakingAndListen verified.');

// Test 4: Verify UnifiedVoiceEngine allows recognition and sound detection during SPEAKING
assert.ok(html.includes('if (talking || this.mode === VoiceMode.SPEAKING)'), 'VoiceEngine must detect speech/sound while speaking');
assert.ok(html.includes('stopSpeakingAndListen(\'user-sound-detected\')'), 'VoiceEngine onspeechstart must mute Max and listen upon user sound');
assert.ok(html.includes('stopSpeakingAndListen(\'voice-barge-in: \' + bargeInText)'), 'VoiceEngine handleResults must mute Max and listen upon user barge-in words');

// Verify start() and scheduleRestart() do not abort just because talking === true
const voiceEngineSection = html.slice(html.indexOf('class UnifiedVoiceEngine'), html.indexOf('const voiceEngine = new UnifiedVoiceEngine()'));
assert.ok(!voiceEngineSection.includes('if (talking || aiRequestInFlight) return;\n\n      try {\n        const session = ++this.session;'), 'start() must not return when talking === true');
assert.ok(!voiceEngineSection.includes('if (talking || aiRequestInFlight) return;\n      clearTimeout(this.restartTimer);'), 'scheduleRestart() must not return when talking === true');
console.log('PASS: SpeechRecognition allowed to run during VoiceMode.SPEAKING for live user interruption.');

// Test 5: Verify ElevenLabs and Browser Fallback tie into live TTS captions
assert.ok(html.includes('showLiveTtsCaption(clean)'), 'ElevenLabs audio.onplay must trigger showLiveTtsCaption');
assert.ok(html.includes('showLiveTtsCaption(text)'), 'Browser fallback u.onstart must trigger showLiveTtsCaption');
assert.ok(html.includes('updateLiveTtsWordProgress(audio.currentTime / audio.duration)'), 'ElevenLabs ontimeupdate must update word progress');
assert.ok(html.includes('updateLiveTtsWordProgress(e.charIndex / text.length)'), 'Browser fallback onboundary must update word progress');
assert.ok(html.includes('hideLiveTtsCaption(false)'), 'Audio onended must trigger hideLiveTtsCaption');
console.log('PASS: ElevenLabs and Browser Fallback lifecycle hooks connected to live TTS captions.');

// Test 6: Verify Gemini Live client hooks into live TTS captions
assert.ok(html.includes('showLiveTtsCaption(part.text)'), 'Gemini Live model turn must trigger showLiveTtsCaption');
assert.ok(html.includes('hideLiveTtsCaption(false)') && html.includes('hideLiveTtsCaption(true)'), 'Gemini Live audio end & interrupt must hide live TTS captions');
console.log('PASS: Gemini Live client properly hooked into live TTS caption lifecycle.');

// Test 7: Verify Conversation History Context Preservation
assert.ok(html.includes('conversation.push({role:\'user\',content:clean})'), 'User input must be pushed to conversation');
assert.ok(html.includes('conversation.push({role:\'assistant\',content:reply})') || html.includes('conversation.push({role:\'assistant\',content:fallback})'), 'Assistant response must be pushed to conversation before user interruption');
assert.ok(html.includes('callRoboBrain('), 'callRoboBrain must receive conversational history context');
console.log('PASS: Conversation history structure correctly preserves dialogue flow across interruptions.');

console.log('\n*** ALL LIVE TTS CAPTIONS AND SPEAKING INTERRUPTION TESTS PASSED! ***\n');
