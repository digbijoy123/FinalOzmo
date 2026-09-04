function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({length: m + 1}, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = Math.min(
        dp[i-1][j] + 1,
        dp[i][j-1] + 1,
        dp[i-1][j-1] + (a[i-1] === b[j-1] ? 0 : 1)
      );
    }
  }
  return dp[m][n];
}

const exactWake = new Set([
  'max', 'maxy', 'maxie', 'maxi', 'maks', 'macks', 'mack', 'mac', 'maxx', 'mex',
  'mark', 'marks', 'matt', 'matts', 'match', 'matches', 'mask', 'masks', 'mags', 'magz',
  'make', 'makes', 'mike', 'mikes', 'mix', 'map', 'maps', 'next', 'nex', 'axe',
  'heymax', 'okmax', 'himax', 'hellomax', 'yomax', 'amax',
  'heymark', 'heymarks', 'heymak', 'heymaks',
  'cozmo', 'cosmo', 'ozmo', 'osmo', 'robo', 'robot'
]);

function isWakeToken(token) {
  const t = String(token || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!t) return false;
  if (exactWake.has(t)) return true;

  // Fuzzy match: distance <= 1 from 'max', 'maks', 'mack', 'mex'
  if (t.length >= 2 && t.length <= 6) {
    if (levenshtein(t, 'max') <= 1) return true;
    if (levenshtein(t, 'maks') <= 1) return true;
    if (levenshtein(t, 'mack') <= 1) return true;
    if (levenshtein(t, 'mex') <= 1) return true;
  }
  return false;
}

const testPhrases = [
  "max", "hey max", "hello max", "hi marks", "ok mack", "marks", "match",
  "hey maks tell me a joke", "what is the time max", "yo cozmo",
  "hey maxy", "listen max", "wake up max", "hey next", "hey mask"
];

console.log("Testing phonetic wake words:");
testPhrases.forEach(p => {
  const tokens = p.toLowerCase().split(/\s+/);
  const matched = tokens.some(tok => isWakeToken(tok));
  console.log(`"${p}" -> ${matched ? "MATCHED" : "MISSED"}`);
});
