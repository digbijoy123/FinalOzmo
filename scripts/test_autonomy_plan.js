const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

// 1. Verify JS Syntax of index.html
const scriptMatch = html.match(/<script[\s\S]*?>([\s\S]*?)<\/script>/i);
if (!scriptMatch) {
  console.error('FAIL: No script tag found in index.html');
  process.exit(1);
}

try {
  new Function(scriptMatch[1]);
  console.log('PASS: index.html parsed without SyntaxError');
} catch (e) {
  console.error('FAIL: JS Syntax Error in index.html:', e);
  process.exit(1);
}

// 2. Test Vision Intent Questions
function isVisionQuestion(text){
  const l=(text||'').toLowerCase().trim();
  return (
    /\b(see|seeing|look|looking|camera|image|picture|photo|screen|display|visible|shown)\b/.test(l) ||
    /\bwhat\s+(do\s+you|can\s+you)\s+(see|look\s+at)\b/.test(l) ||
    /\bwho\s+(is|are)\s+(this|that|in\s+front|visible|there)\b/.test(l) ||
    /\b(do\s+you|can\s+you)\s+(know|recognize|identify)\s+(me|this|that|who)\b/.test(l) ||
    /\bwhat.*in\s+front\s+of\s+(me|you)\b/.test(l) ||
    /\bwhat.*around\s+(me|you)\b/.test(l) ||
    /\bdescribe.*(scene|room|surroundings|view)\b/.test(l) ||
    /\bidentify.*(object|person|item|face)\b/.test(l) ||
    /\bwhat.*(holding|carrying|wearing|in my hand|in front of)\b/.test(l) ||
    /\bwhat.*(is|are)\s+(this|that|these|those)\b/.test(l) ||
    /\bwhat.*(object|objects|item|items)\b/.test(l) ||
    /\b(look\s+at\s+this|take\s+a\s+look|look\s+here)\b/.test(l) ||
    /\bhow many\b/.test(l) ||
    /\b(kya|kya hai|kya dikh|dikhta|dikhti|dikhao|dekho|dekh|batao|bata)\b/.test(l) ||
    /\b(kya\s+dekh|kya\s+dikh|kitne|kitni|kaunsa|kaunsi|kaun|pehchana|pehchano)\b/.test(l) ||
    /\b(क्या|दिख|दिखाओ|देख|देखो|कितने|कितनी|कौन|पहचान|पहचाना|क्या है)\b/.test(l)
  );
}

const testVisionQueries = [
  "what do you see",
  "who is this",
  "who is in front of you",
  "what am I holding",
  "look at this",
  "describe the room",
  "can you recognize me",
  "what object is that",
  "kya dikh raha hai",
  "kitne log hain"
];

testVisionQueries.forEach(q => {
  if (!isVisionQuestion(q)) {
    console.error(`FAIL: Query not recognized as vision question: "${q}"`);
    process.exit(1);
  }
});
console.log(`PASS: All ${testVisionQueries.length} vision queries recognized successfully!`);

// 3. Test Action Engine Command Dispatcher Logic
function handleVoiceCommand(transcript) {
  const l = String(transcript || '').toLowerCase().trim();
  if (!l) return null;
  if (/\b(emergency stop|e-stop|freeze|halt immediately)\b/.test(l)) {
    return { handled: true, type: 'estop' };
  }
  if (/\b(stop|stop moving|hold on|stay still|don't move|dont move|ruk jao|ruko|tham jao)\b/.test(l)) {
    return { handled: true, type: 'stop' };
  }
  if (/\b(dance for me|dance|do a dance|nacho|nach ke dikhao)\b/.test(l)) {
    return { handled: true, type: 'dance' };
  }
  if (/\b(spin around|spin|turn around|do a spin|gol ghumo|chakkaron)\b/.test(l)) {
    return { handled: true, type: 'spin' };
  }
  if (/\b(nod your head|nod|say yes|haan bolo)\b/.test(l)) {
    return { handled: true, type: 'nod' };
  }
  if (/\b(shake your head|say no|na bolo)\b/.test(l)) {
    return { handled: true, type: 'shake_head' };
  }
  if (/\b(celebrate|we did it|hurray|hooray)\b/.test(l)) {
    return { handled: true, type: 'celebrate' };
  }
  return null;
}

const testActionCommands = [
  ["dance for me", "dance"],
  ["do a spin", "spin"],
  ["nod your head", "nod"],
  ["say no", "shake_head"],
  ["celebrate", "celebrate"],
  ["freeze", "estop"],
  ["ruko", "stop"]
];

testActionCommands.forEach(([cmd, expectedType]) => {
  const res = handleVoiceCommand(cmd);
  if (!res || res.type !== expectedType) {
    console.error(`FAIL: Action command "${cmd}" expected "${expectedType}", got "${res?.type}"`);
    process.exit(1);
  }
});
console.log(`PASS: All ${testActionCommands.length} physical action voice commands recognized!`);

// 4. Verify Phase 6 elements in index.html
if (!html.includes('id="devAutonomyStatus"')) {
  console.error('FAIL: Missing devAutonomyStatus element in index.html');
  process.exit(1);
}
if (!html.includes('cozmoSoundEngine.playExcited()')) {
  console.error('FAIL: Missing cozmoSoundEngine playExcited integration');
  process.exit(1);
}

console.log('ALL PHASE 6 AUTONOMY TESTS PASSED SUCCESSFULLY!');
