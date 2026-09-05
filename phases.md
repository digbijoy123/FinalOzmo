# ROBO — Build Phases (UI Redesign Engagement)

Follow in order. Do not start a phase until the previous one has been
manually smoke-tested (see `.agent/rules/01-coding-standards.md` →
Testing discipline). Each phase should end with a working, deployable
state — never leave the app broken between phases.

## Phase 0 — Baseline & scaffolding

- Copy the current working build into `legacy/index.html` and
  `legacy/api-robo.js` (read-only reference, do not edit these once
  copied).
- Create a working copy at `index.html` and `api/robo.js` that will
  actually be modified from here on.
- Confirm the working copy runs identically to legacy before changing
  anything (deploy or run locally, do one voice round-trip, one camera
  toggle, open the existing dev page).
- Exit criteria: working copy behaves identically to `legacy/`, verified
  manually.

## Phase 1 — Introduce the 3-screen shell (no visual redesign yet)

- Add a `currentScreen` state (`'face' | 'camera' | 'dev'`), default
  `'face'`.
- Wrap the existing HUD/avatar/caption/mic markup in a `Face` screen
  section, the existing `#devPage` markup in a `Dev` screen section, and
  create a new (initially empty/placeholder) `Camera` screen section.
- Wire up the 3-button bar to switch `currentScreen` — at this point the
  Face screen still looks like the old cluttered HUD; only the
  navigation shell is new.
- Exit criteria: tapping DEV/CAMERA/FACE switches full-screen sections
  correctly, nothing else regressed (voice/camera/mic still work on
  Face).

## Phase 2 — Rebuild the Face screen per `design.md` §2

- Strip the Face screen down to: black background, eyes + mouth only,
  hidden-until-active caption, mic control, 3-button bar.
- Remove HUD chips, camera popup, emoji sphere/orbit/aura/particles from
  this screen (they move to Dev/Camera in later phases, not deleted from
  the codebase yet if their logic is still needed elsewhere).
- Rewrite the face rendering (`drawFace()` equivalent) to draw simple
  eye/mouth shapes instead of the 3D emoji sphere, still driven by the
  existing `stateData`/`setState`/`inferEmotion` state machine — reuse
  the state machine untouched, only replace the drawing routine.
- Verify: all 15 emotion states still visibly change the face; blinking
  and idle auto-cycling still work; talking animation (mouth moves with
  TTS) still works.
- Exit criteria: Face screen matches `design.md` §2 layout at ~380px
  width; emotion/voice pipeline unaffected.

## Phase 3 — Build the Camera screen per `design.md` §4

- Move the camera `<video>` element to full-screen within the Camera
  screen section.
- Move `faceTrackingOverlay` and `visionOverlay` rendering onto the
  full-screen camera container, adjusting the coordinate-mapping math
  (`mapVideoBoxToOverlay`, box-drawing in `renderVisionResult`) for the
  new full-screen dimensions instead of the old small popup dimensions.
- Add the `FACE` back-control and (optional) camera switch control on
  this screen.
- Verify: opening Camera screen starts the camera and face-tracking loop
  (client-side, continuous); object-detection boxes still only appear
  after an actual vision-triggering voice query, not continuously.
- Exit criteria: Camera screen matches `design.md` §4; face-api.js
  tracking and Gemini vision gating behave identically to before.

## Phase 4 — Build the Dev screen per `design.md` §3

- Confirm every diagnostic panel from the legacy `#devPage` is present
  and functioning identically (voice pipeline, transcript, event log,
  memory/identity, social awareness, perception fusion, system checks).
- Relocate the emotion state test grid + AUTO IDLE toggle, the ESP32
  connect control, and ENROLL FACE control into this screen.
- Add the `FACE` back-control, consistent with Camera.
- Exit criteria: nothing from the original dev tooling is missing;
  relocated controls (emotion grid, ESP32 connect, enroll face) work
  identically to before, just in a new location.

## Phase 5 — Cleanup pass

- Remove now-dead code paths only after confirming (via the Dev screen's
  own diagnostics) that nothing still references them — e.g., the old
  small camera popup container, the emoji sphere canvas layers, the old
  6-button footer markup, HUD chip elements, if fully superseded.
- Re-run the full manual smoke test: voice round-trip with a matching
  face emotion, camera screen with face + object detection, dev screen
  showing live diagnostics, all navigation working at ~380px and at a
  wider desktop width.
- Exit criteria: no dead/duplicate UI code remains; full smoke test
  passes clean (no new console errors or `devLog(...'ERROR'...)` lines).

## Phase 6 — Advanced Intelligence & Autonomous Behavior Engine

- **Multimodal Visual Reasoning & Scene Grounding**:
  - Contextual awareness: seamlessly merge real-time camera visual analysis (lighting, proximity, recognized items, emotional facial expressions) with spoken dialogue.
  - Smart vision follow-ups without requiring redundant user prompts (e.g., "What is this?" -> answers and tracks the object in scene memory).
- **Proactive Robotic Personality & Cozmo Behavioral Model**:
  - Max acts autonomously, not just as a passive Q&A assistant: expresses curiosity when seeing unfamiliar objects, yawns when idle, playfully reacts to sudden movements.
  - Procedural robotic sound effects library (Web Audio synthesizer producing Cozmo-like giggles, curious coos, grumbles, surprised whistles, and purrs synchronized with eye animations).
- **Autonomous Intent & Physical Action Planner (Modules 10 & 11)**:
  - Generate structured physical motor reactions (`RobotCommand`: head tilts, happy spins, curious nudges, celebratory dances) paired with spoken dialogue and emotion states.
  - Spatial gaze tracking: align virtual and physical orientation toward the active human speaker.
- **Exit criteria**: Max proactively exhibits behavioral agency, conversational reasoning, and personality-driven autonomous reactions verified in Dev diagnostics and live interaction.

## Phase 7 — Long-Term Memory, Episodic Recall & Identity System

- **Hierarchical Multi-Person Memory Architecture (Modules 7 & 7.5)**:
  - **Working Context (Short-Term)**: Immediate topic memory, active conversational thread, and recent visual snapshots.
  - **Semantic Memory (Long-Term Facts)**: User preferences, birthdays, habits, relationships, and personal facts stored in a structured, schema-versioned multi-person registry (`robo_aios_memory_v2`).
  - **Episodic Memory (Life Events & Shared History)**: Chronological diary of past interactions, conversations, and experiences ("Remember when we tested the camera yesterday?").
- **Biometric Face-to-Identity Binding**:
  - Link client-side 128D facial descriptors directly to individual memory profiles.
  - Instant zero-prompt profile recall: as soon as a recognized face enters camera view, Max greets them by name and restores their personalized context and memories.
- **Autonomous Memory Extraction & Evolution**:
  - LLM background extraction: automatically detect and store meaningful facts, preferences, and commitments from natural conversation without requiring manual "remember that..." commands.
  - Conversational recall & proactive check-ins ("How did your exam go? You mentioned it yesterday!").
  - Privacy and memory control: voice commands to inspect, edit, or delete memories ("What do you know about me?", "Forget my birthday").
- **Exit criteria**: Multi-person profiles automatically persist, update from conversations, and trigger personalized greetings and episodic memory retrieval across sessions.

## Phase 8 — Full-System Deep Code Audit, Dead Code Elimination & Performance Optimization

- **Exhaustive Module-by-Module Codebase Audit**:
  - Systematically audit every function, engine class, and subsystem:
    - `UnifiedVoiceEngine` & Speech Recognition / Synthesis pipelines
    - `FaceEngine` (OLED eye rendering, canvas procedural blinks, pupil gaze tracking)
    - `SocialPerceptionTracker` (MediaPipe face landmarks, object detection, proximity fusion)
    - `GeminiBrain` & `RoboAPI` (cloud & on-device multimodal perception routing)
    - Memory Graph (`robo_aios_memory_v2`, multi-person registries)
    - Hardware WebSocket Bridge (`HardwareBridge`) & Command Dispatcher
    - Developer Diagnostics & HUD Telemetry modules (Modules 1 through 13)
- **Dead & Redundant Code Elimination**:
  - Locate and remove all unreferenced variables, legacy fallback shims, duplicate listeners, and unused prototype methods.
  - Eliminate leftover prototype DOM elements, dead CSS rules, and obsolete debug scaffolding that bloat the runtime.
  - Purge orphaned intervals, lingering event listeners, and duplicated state tracking variables.
- **Runtime Latency, Garbage Collection & Battery Optimization**:
  - Optimize `requestAnimationFrame` canvas render cycles to guarantee stutter-free 60fps OLED rendering on low-power mobile hardware.
  - Prevent memory leaks: properly release Canvas contexts, audio buffer nodes, MediaStream tracks, and worker threads.
  - Implement intelligent idle throttling: scale down compute and sensor polling when Max is asleep or in low-activity idle.
  - Optimize string manipulations and JSON parsing in perception telemetry streams to minimize garbage collection (GC) pauses.
- **Safety Invariants & Verification**:
  - Verify that perception baseline (v2.81 fusion + v2.94 face overlay fixes) remains 100% intact and unaffected.
  - Ensure all 13 developer diagnostic modules report green status (`ROBO_DIAGNOSTICS_MODULES`).
  - Zero unhandled promise rejections, zero console warnings/errors, and reduced idle CPU footprint.
- **Exit criteria**: Clean, streamlined codebase with zero dead code, maximum execution efficiency, verified 60fps face render, and all 13 diagnostic modules passing clean.

## Phase 9 — Hardware Closed-Loop Embodiment & Real Chassis (Future)

- Connect ESP32 WebSocket bridge to physical motors, track treads, head tilt servo, and lift arm.
- Closed-loop telemetry: cliff/edge drop sensors (table safety), wheel odometry encoders, battery voltage ADC, and stall detection.
- Fail-safe watchdog enforcement: hardware stops motors if communication drops for >750ms.

---

## Active Enhancement Track: Phases A, B, C, D

### Phase A — Voice Recognition & Dev Diagnostics Overhaul [COMPLETED]
- Purged redundant SpeechRecognition wrappers and memory leaks.
- Upgraded `runDevChecks()` to production grade with automated status reporting for all 13 modules.
- Added live Cozmo soundboard with 8 procedural chirps/expressions.

### Phase B — Wake Word Detector & Continuous Voice Dialogue [COMPLETED]
- Multi-alternative speech scanning (`maxAlternatives = 3`) and Levenshtein distance fuzzy matching for "Max".
- Zero-dead-window hot-restart (15ms delay) with error recovery and barge-in (<50ms).
- 15-second multi-turn continuous conversation mode with graceful goodbye detection.

### Phase C — Visual Face Enrollment HUD & Multi-Angle Biometric Wizard [COMPLETED]
- Circular biometric reticle overlay with animated SVG progress ring (`0% → 100%`) and cybernetic crosshairs/corners.
- 5-angle biometric sampling sequence:
  1. Frontal (0% → 20%)
  2. Left profile (20% → 40%)
  3. Right profile (40% → 60%)
  4. Upward tilt (60% → 80%)
  5. Smiling expression (80% → 100%)
- Procedural audio feedback on each angle capture (`cozmoSoundEngine.playChirp`) and excited fanfare (`cozmoSoundEngine.playExcited`).
- Multi-angle descriptor vectors stored in persistent `roboMemory.persons` profile.
- Integrated into `runDevChecks()` as `Module 8.5 Face enrollment wizard` (`PASS`).
- Voice intent integration ("enroll my face", "start face enrollment").

### Phase D (Phase 6) — Advanced Intelligence & Autonomous Behavior Engine [COMPLETED]
- **Multimodal Visual Reasoning & Scene Grounding**:
  - Expanded implicit visual intent recognition ("who is in front of you", "what am I holding", "describe room", "look at this").
  - Seamless scene continuity: cached visual observations inject directly into conversation context.
- **Proactive Cozmo Personality & Curiosity Routines**:
  - Proactive arrival greeting: detects registered users by name with excited chirp and eye greeting.
  - Idle exploration cycles: organic micro-saccades, curious looking around (`turnLeft`, `turnRight`, `idleNod`), and sleepy yawn after extended inactivity.
- **Autonomous Physical & Virtual Intent Planning**:
  - Choreographed physical action routines (`dance`, `spin`, `nod`, `shakeHead`, `celebrate`) coupled with procedural Cozmo sound effects and OLED emotion states.
  - Precise visual servoing: calculates center coordinates against video frame dimensions.
  - Live autonomy telemetry readout (`#devAutonomyStatus`) in Dev screen.

### Phase E — Real-Time Adaptive Personality Engine & Live Developer Tuning [CURRENT PHASE]
- **Voice-Driven Personality & Trait Engine**:
  - Direct real-time verbal tuning of behavioral parameters via voice intent:
    - Humor level ("Max, set humor to 90%", "be more funny/witty")
    - Attitude / Sass ("Max, be sarcastic", "Max, be gentle and polite")
    - Verbosity ("Max, keep answers super short", "Max, explain in detail")
    - Dynamic custom directives ("Max, from now on call me Boss", "Max, act like an eccentric sci-fi droid")
    - Reset commands ("Max, reset your personality to default")
  - Seamless persistent storage in `roboMemory.personality` with instant verbal acknowledgment and Cozmo reaction sound.
  - Real-time injection into `/api/robo` requests: dynamic directives are prepended/appended to Gemini system prompts on the very next sentence without reloading.
- **Developer Screen Live Tuning Sliders (`#devScreen`)**:
  - Cybernetic OLED-styled tuning card on the Dev screen:
    - **Humor Slider**: `0%` (Deadpan/Serious) $\leftrightarrow$ `100%` (Stand-up Comedian)
    - **Sass / Attitude Slider**: `0%` (Gentle Assistant) $\leftrightarrow$ `100%` (Feisty Cozmo)
    - **Verbosity Control**: `Concise (1-2 sentences)` vs. `Detailed`
    - **Live Custom Directives Input**: Real-time editable rule textarea with live save
  - **Bidirectional Live Synchronization**: Changing a slider immediately updates `roboMemory.personality`; speaking a voice command immediately updates the Dev screen sliders in real time.
- **Antigravity Fast Iteration Workflow**:
  - Seamless pair-programming loop between Google Antigravity IDE and live Max runtime.
  - Integration with Antigravity slash commands:
    - `/learn`: Records and persists newly tuned behavioral patterns and voice commands into agent memory.
    - `/grill-me`: Rapid interview and architectural alignment for complex emergent behaviors.
    - `/goal`: Runs automated continuous calibration and regression test loops.
- **Exit criteria**: Speaking to Max changes his personality and behavior immediately; the Dev screen sliders reflect and manipulate traits in real time; all 5 test suites pass clean.




