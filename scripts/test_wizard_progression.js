const assert = require('assert');

// Simulate the exact Wizard state machine progression
class TestFaceEnrollmentWizard {
  constructor() {
    this.active = false;
    this.targetPersonName = 'Digbijoy';
    this.currentStepIndex = 0;
    this.stepSteadyTicks = 0;
    this.stepHoldTicks = 0;
    this.collectedSamples = [];
    this.circumference = 314.16;

    this.steps = [
      { index: 0, pct: 20, tag: 'frontal', evaluate: () => true },
      { index: 1, pct: 40, tag: 'left-profile', evaluate: () => true },
      { index: 2, pct: 60, tag: 'right-profile', evaluate: () => true },
      { index: 3, pct: 80, tag: 'upward-tilt', evaluate: () => true },
      { index: 4, pct: 100, tag: 'smile-expression', evaluate: () => true }
    ];
  }

  tick(detection) {
    if (!detection) {
      this.stepSteadyTicks = 0;
      this.stepHoldTicks = 0;
      return { state: 'NO FACE DETECTED' };
    }

    const step = this.steps[this.currentStepIndex];
    if (!step) return { state: 'DONE' };

    const isGoodAngle = step.evaluate(detection.box, detection.landmarks);
    this.stepHoldTicks++;
    const passes = isGoodAngle ? (++this.stepSteadyTicks >= 2) : (this.stepHoldTicks >= 10);

    if (!passes) {
      return { state: 'ALIGNING', stepIndex: this.currentStepIndex, pct: (this.currentStepIndex > 0 ? this.steps[this.currentStepIndex-1].pct : 0) };
    }

    // Step captured!
    this.stepSteadyTicks = 0;
    this.stepHoldTicks = 0;
    const safeVector = detection.descriptor && detection.descriptor.length
      ? Array.from(detection.descriptor)
      : Array.from({ length: 128 }, (_, idx) => Math.sin(idx));

    this.collectedSamples.push({
      tag: step.tag,
      stepIndex: this.currentStepIndex,
      descriptor: safeVector
    });

    const capturedPct = step.pct;
    this.currentStepIndex++;

    if (this.currentStepIndex >= this.steps.length) {
      return { state: 'COMPLETE', pct: 100, samplesCount: this.collectedSamples.length };
    }

    return { state: 'ADVANCED', pct: capturedPct, nextStep: this.currentStepIndex };
  }
}

const wiz = new TestFaceEnrollmentWizard();
const fakeFace = { box: { x: 100, y: 100, width: 80, height: 80 }, landmarks: null, descriptor: null };

// Step 0: Tick 1 (aligning)
let res = wiz.tick(fakeFace);
assert.strictEqual(res.state, 'ALIGNING');

// Step 0: Tick 2 (captured step 0, advances to step 1 at 20%)
res = wiz.tick(fakeFace);
assert.strictEqual(res.state, 'ADVANCED');
assert.strictEqual(res.pct, 20);
assert.strictEqual(wiz.currentStepIndex, 1);

// Step 1: 40%
wiz.tick(fakeFace);
res = wiz.tick(fakeFace);
assert.strictEqual(res.state, 'ADVANCED');
assert.strictEqual(res.pct, 40);

// Step 2: 60%
wiz.tick(fakeFace);
res = wiz.tick(fakeFace);
assert.strictEqual(res.state, 'ADVANCED');
assert.strictEqual(res.pct, 60);

// Step 3: 80%
wiz.tick(fakeFace);
res = wiz.tick(fakeFace);
assert.strictEqual(res.state, 'ADVANCED');
assert.strictEqual(res.pct, 80);

// Step 4: 100%
wiz.tick(fakeFace);
res = wiz.tick(fakeFace);
assert.strictEqual(res.state, 'COMPLETE');
assert.strictEqual(res.pct, 100);
assert.strictEqual(res.samplesCount, 5);

console.log('Wizard state machine successfully advanced through all 5 steps to 100%!');
