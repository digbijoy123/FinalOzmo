const assert = require('assert');

// Test the math and step validators of Phase C
const steps = [
  {
    index: 0,
    pct: 20,
    tag: 'frontal',
    evaluate: (pts) => {
      const noseX = pts[30]?.x;
      const leftEyeX = pts[36]?.x;
      const rightEyeX = pts[45]?.x;
      const midEyeX = (leftEyeX + rightEyeX) / 2;
      const eyeDist = Math.abs(rightEyeX - leftEyeX) || 1;
      const diff = Math.abs(noseX - midEyeX) / eyeDist;
      return diff < 0.28;
    }
  },
  {
    index: 1,
    pct: 40,
    tag: 'left-profile',
    evaluate: (pts) => {
      const noseX = pts[30]?.x;
      const jawLeftX = pts[0]?.x;
      const jawRightX = pts[16]?.x;
      const dLeft = Math.abs(noseX - jawLeftX);
      const dRight = Math.abs(jawRightX - noseX);
      return (dLeft / (dRight || 1) < 0.88) || (dRight / (dLeft || 1) > 1.14);
    }
  },
  {
    index: 2,
    pct: 60,
    tag: 'right-profile',
    evaluate: (pts) => {
      const noseX = pts[30]?.x;
      const jawLeftX = pts[0]?.x;
      const jawRightX = pts[16]?.x;
      const dLeft = Math.abs(noseX - jawLeftX);
      const dRight = Math.abs(jawRightX - noseX);
      return (dRight / (dLeft || 1) < 0.88) || (dLeft / (dRight || 1) > 1.14);
    }
  },
  {
    index: 3,
    pct: 80,
    tag: 'upward-tilt',
    evaluate: (pts) => {
      const noseTipY = pts[30]?.y;
      const chinY = pts[8]?.y;
      const mouthY = pts[57]?.y;
      return (chinY - mouthY) >= (mouthY - noseTipY) * 0.82;
    }
  },
  {
    index: 4,
    pct: 100,
    tag: 'smile-expression',
    evaluate: (pts) => {
      const mLeft = pts[48];
      const mRight = pts[54];
      const eLeft = pts[36];
      const eRight = pts[45];
      const mDist = Math.hypot(mRight.x - mLeft.x, mRight.y - mLeft.y);
      const eDist = Math.hypot(eRight.x - eLeft.x, eRight.y - eLeft.y);
      return (mDist / (eDist || 1)) > 0.65;
    }
  }
];

// 1. Test Frontal validator
const frontalPts = [];
frontalPts[30] = { x: 50, y: 50 }; // nose center
frontalPts[36] = { x: 30, y: 40 }; // left eye
frontalPts[45] = { x: 70, y: 40 }; // right eye
assert.strictEqual(steps[0].evaluate(frontalPts), true, 'Frontal centered face should pass');

// 2. Test Left Profile
const leftProfilePts = [];
leftProfilePts[30] = { x: 38, y: 50 }; // nose shifted left
leftProfilePts[0] = { x: 20, y: 50 };  // left jaw
leftProfilePts[16] = { x: 80, y: 50 }; // right jaw
assert.strictEqual(steps[1].evaluate(leftProfilePts), true, 'Left profile should pass');

// 3. Test Right Profile
const rightProfilePts = [];
rightProfilePts[30] = { x: 62, y: 50 }; // nose shifted right
rightProfilePts[0] = { x: 20, y: 50 };  // left jaw
rightProfilePts[16] = { x: 80, y: 50 }; // right jaw
assert.strictEqual(steps[2].evaluate(rightProfilePts), true, 'Right profile should pass');

// 4. Test Upward Tilt
const tiltPts = [];
tiltPts[30] = { x: 50, y: 45 }; // nose
tiltPts[57] = { x: 50, y: 55 }; // bottom lip
tiltPts[8] = { x: 50, y: 70 };  // chin
assert.strictEqual(steps[3].evaluate(tiltPts), true, 'Upward tilt should pass');

// 5. Test Smile
const smilePts = [];
smilePts[36] = { x: 35, y: 40 };
smilePts[45] = { x: 65, y: 40 }; // eye distance = 30
smilePts[48] = { x: 37, y: 60 };
smilePts[54] = { x: 63, y: 60 }; // mouth distance = 26 (26/30 = 0.866 > 0.65)
assert.strictEqual(steps[4].evaluate(smilePts), true, 'Smile should pass');

// 6. Test Ring Circumference Calculation
const C = 314.16;
steps.forEach(s => {
  const offset = C * (1 - (s.pct / 100));
  assert(offset >= 0 && offset <= C, `Offset for ${s.pct}% is valid: ${offset}`);
});

console.log('All 6 Biometric Face Wizard unit tests passed successfully!');
