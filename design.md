# ROBO — UI Redesign Spec (Face / Camera / Dev)

## 0. Why this redesign

The current build (`legacy/index.html`) crams a camera popup, a floating
emoji avatar, HUD chips (state, battery, media status), a caption bubble,
a 6-button footer, and a dev-states panel onto one screen. It works, but
it's visually noisy and the dev tools compete with the "companion" feel.

This redesign replaces that single screen with **three full-screen
modes**, navigated by **exactly three buttons**, so each mode has one job:
talk to ROBO, look through its eyes, or debug it.

## 1. Information architecture

```
        ┌───────────────┐
        │  FACE (home)  │◀────────────────┐
        └───────┬───────┘                 │
                │  tap DEV                │  tap FACE
                ▼                         │
        ┌───────────────┐          ┌──────┴────────┐
        │   DEV PAGE    │          │  CAMERA MODE  │
        └───────────────┘          └───────────────┘
                ▲                         ▲
                └──────── tap CAMERA ──────┘ (from Face)
```

- **Face** is the home/default screen and the only one with the 3-button
  bar permanently visible.
- **Camera** and **Dev** are full-screen takeovers, each with a single
  clear way back to Face (a `FACE` button/icon in a consistent corner
  position — top-left is recommended so it doesn't collide with
  camera/dev content at the bottom).
- Voice interaction (mic tap + wake word) is only expected to be the
  primary interaction on the **Face** screen. It's fine if Camera/Dev
  don't show a mic button — wake word can keep listening in the
  background regardless of screen (reuses existing wake engine, unchanged).

## 2. Screen 1 — Face (home)

**Purpose**: this is ROBO. Calm, alive, minimal. Nothing on this screen
should look like a debug tool.

**Layout** (mobile-first, ~380px reference width):

```
┌─────────────────────────────┐
│                              │
│                              │
│                              │
│                              │
│         •       •            │  ← eyes
│                              │
│           ⌣                 │  ← mouth
│                              │
│                              │
│                              │
│   [caption — hidden by       │  ← optional, only shown while
│    default, fades in while   │    listening/thinking/talking;
│    listening/talking]        │    NOT visible at rest
│                              │
│  ┌────┐   ┌──────┐   ┌────┐  │
│  │DEV │   │ MIC  │   │ CAM │  │  ← bottom bar
│  └────┘   └──────┘   └────┘  │
└─────────────────────────────┘
```

Wait — re-read the requirement: **exactly 3 buttons**, and the mic is a
distinct, primary control, not one of the 3 nav buttons. Resolve this as
follows:

- The **3 nav buttons** are `DEV` · `CAMERA` · `FACE`. On the Face screen
  itself, `FACE` is simply the active/highlighted state (you're already
  there) — it does not need to be a separate visible button *on this
  screen specifically*, since tapping it while already on Face is a
  no-op. Render it anyway for layout consistency (disabled/active style),
  so the same 3-button bar appears identically on every screen and
  `FACE` always means "go home."
- The **mic** is a separate, larger, primary control — positioned above
  or integrated into the bottom bar, but visually distinct from the 3 nav
  buttons (reuse the existing orange circular `.mic` button style from
  `legacy/index.html`, just relocate it). It is not one of "the 3
  buttons" the requirement refers to.

**Face rendering — the actual redesign target:**

- Full-bleed **black background** (`#000` or very-near-black — do not
  reuse the legacy cream/parchment `--screen` gradient for this screen).
- Only **two eyes and a mouth** rendered on the black background — no
  emoji sphere, no aura/glow gradient sphere, no floating particles, no
  HUD chips, no camera popup, no orbit rings.
- Reuse the *emotion state machine* from `legacy/index.html`
  (`stateData`, `setState`, `inferEmotion`, the 15 states, blink timing,
  idle auto-cycling) — only the **rendering** changes, from a 3D emoji
  sphere to simple eye/mouth shapes (rounded rectangles or arcs, similar
  to the existing eye/mouth drawing code already inside `drawFace()`,
  just without the sphere/aura/particles layers around them). Emotion
  still changes eye shape/openness, brow-equivalent (eye tilt/squeeze),
  and mouth curve/motion exactly as today's `stateData` table drives it.
- Talking animation (mouth opens/moves with TTS playback) must be
  preserved — it's core to feeling alive.
- Caption text (what ROBO heard / what ROBO is saying) stays, but hidden
  at rest and only fades in during listening/thinking/talking, so the
  resting state is genuinely just a face on black.
- Reference photo: the builder will supply a reference image to adapt the
  face's visual style (proportions, eye shape, colors) from — treat the
  photo as a style reference for shape/color of the eyes and mouth, not
  as a literal texture/photo to composite.

## 3. Screen 2 — Dev Page

**Purpose**: everything needed to find and fix bugs, at a glance.

Carry over the **entire content set** of `legacy/index.html`'s `#devPage`
— do not drop any diagnostic panel, only reorganize visually if useful:

- Voice pipeline: browser, camera API, microphone API, mic permission
  state, speech recognition support, on-device STT availability, wake
  engine status, AI brain connection state, current pipeline stage, live
  mic level meter.
- Captured transcript (raw STT output).
- Event/error log (scrolling, with COPY LOGS / CLEAR actions — keep
  both).
- Memory & identity: memory status, active identity, active memory
  count, active fact count, total memory profiles, active profile ID,
  last memory change.
- Social awareness: human presence, people detected count, interaction
  state, perception confidence, last social change.
- Perception fusion: unified state, tracked target, identity, identity
  confidence, position, movement, fusion confidence.
- System check list (HTTPS/localhost, getUserMedia, SpeechRecognition,
  wake engine, speech synthesis, camera, face engine, memory engine,
  AI API key, etc.) — pass/fail per item, exactly as today.

Also relocate here (they don't have an obvious home on the new minimal
Face screen):
- The **emotion state test grid** (tap any of the 15 states to force it)
  and the **AUTO IDLE ON/OFF** toggle — these are dev/testing tools, not
  companion-facing controls.
- The **ESP32 / robot connect button** (`CONNECT ROBOT`, BLE or
  WebSocket) and its connection status — this is a hardware debug
  control.
- **ENROLL FACE** control — arguably dev/setup rather than daily-use;
  keep it here unless a later phase wants a friendlier onboarding flow
  for it.

**Layout**: keep the existing dark diagnostics theme (`#10131d`
background, monospace, card grid) — it already reads clearly as "this is
the technical view," which is the right signal. Add a `FACE` back-control
in the header, consistent with Camera mode.

## 4. Screen 3 — Camera Mode

**Purpose**: see what ROBO sees, full screen, with live overlays.

- Full-screen (edge-to-edge) live camera feed — not the small popup from
  the legacy build.
- Face-tracking overlay boxes on top of the feed (reuse
  `faceTrackingOverlay` rendering/positioning math from
  `legacy/index.html` — `mapVideoBoxToOverlay`, `updateFaceVisualElement`,
  the target vs. non-target box styling — just mounted full-screen
  instead of inside the small `.camera` container).
- Object-detection overlay boxes on top of the feed when a vision result
  is available (reuse `visionOverlay` / `renderVisionResult` box-drawing
  logic, same coordinate-mapping approach, full-screen scale instead of
  the small popup scale).
- Minimal chrome on top of the video: a `FACE` back-control (top-left,
  consistent with Dev), and optionally a front/rear camera switch control
  (`cameraSwitchBtn` logic already exists — keep it accessible somewhere
  on this screen, e.g. a small icon button top-right).
- Do not show the emoji/face avatar on this screen — full attention goes
  to the camera feed.
- Vision (Gemini) is still only triggered by an actual voice
  question, per the existing gating logic (`isVisionQuestion`) — being on
  the Camera screen does not itself trigger continuous Gemini vision
  calls. Face detection (client-side, face-api.js) can and should run
  continuously while this screen is open, since it's free/local; Gemini
  vision stays on-demand regardless of which screen is active.

## 5. Bottom bar — shared component

- Exactly 3 buttons: `DEV`, `CAMERA`, `FACE` (order can follow the
  original request order: Dev, Camera, Face).
- Rendered on the Face screen; Camera and Dev screens instead show a
  single `FACE` back-control (not the full 3-button bar) to keep those
  screens uncluttered and full-bleed. If simplicity is preferred, it's
  acceptable to keep the identical 3-button bar on all three screens —
  pick one approach and apply it consistently; do not mix (some screens
  with the full bar, others without, inconsistently).
- Active screen is visually indicated (e.g., the current screen's button
  styled as active/disabled).

## 6. What explicitly does NOT carry over to the new Face screen

- HUD chips (state chip, battery %, media dot, BLE dot) — these belong in
  Dev now, not floating over the face.
- The small inline camera popup — camera is now its own full-screen mode.
- The 3D emoji sphere avatar, orbit rings, aura/glow, floating particles.
- The 6-button footer (`LANDSCAPE TEST`, `DEV PAGE`, `CAMERA OFF`,
  `REAR CAM`, `ENROLL FACE`, `DEV STATES`) — replaced by the 3-button bar
  plus the mic; the removed controls relocate into Dev or Camera per
  above.

## 7. Open questions to resolve during implementation (flag, don't guess silently on the two-button vs three-button tension)

- Confirm the mic-vs-3-buttons resolution in §2 matches intent before
  building it — it's the one place this spec had to interpret an
  ambiguity in the original request (3 nav buttons *and* a mic must
  coexist somewhere).
- Landscape layout for Face/Camera/Dev is not specified here — default to
  reusing the legacy build's landscape adjustments where a screen has an
  obvious equivalent, otherwise portrait-first and revisit later.
