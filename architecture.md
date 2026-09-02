# ROBO — Architecture

## 1. High-level shape

```
┌─────────────────────────────── Phone (brain) ───────────────────────────────┐
│                                                                              │
│   UI Layer (3 screens: Face / Camera / Dev)                                 │
│        │                                                                    │
│   VoiceInputService ──STT──▶ IntentEngine ──▶ PersonalityEngine             │
│        │                          (LLM function-calling,   │  (system      │
│   FaceEngine (canvas/CSS,          later phase)            │   prompt +    │
│   emotion states)                                            │   memory     │
│        │                                                     │   lookup)   │
│   CameraService ──frames (on demand)──▶ Vision (Gemini)      │             │
│        │                                                     ▼             │
│   MemoryStore (localStorage, multi-person registry) ◀── PersonalityEngine  │
│        │                                                     │             │
│   SpeechService (TTS: ElevenLabs → browser fallback) ◀───────┘             │
│        │                                                                    │
│   RobotCommand ──▶ RobotConnection (Virtual | ESP32-WebSocket) ─────────────┼──▶ ESP32 (body)
│                                                                              │       │
└──────────────────────────────────────────────────────────────────────────── ┘   Motors,
                                                                                    ultrasonic,
              /api/robo (Vercel serverless) ──▶ Gemini (LLM+vision), ElevenLabs (TTS)
```

## 2. What's already built vs. what this engagement changes

| Layer | Status | This engagement touches it? |
|---|---|---|
| STT (Web Speech API) + wake word | Working, in `legacy/index.html` | No — reuse as-is |
| AI brain (Gemini via `/api/robo`) | Working | No — reuse as-is |
| TTS (ElevenLabs + browser fallback) | Working | No — reuse as-is |
| Vision (Gemini structured JSON, on-demand frames) | Working | No — reuse as-is |
| Face tracking + recognition (face-api.js) | Working | Only its *rendering surface* moves to the new Camera screen; detection logic unchanged |
| Memory & identity (localStorage registry) | Working | No — reuse as-is |
| Emotion engine (`inferEmotion`, 15 states) | Working | Only its *rendering surface* (avatar → minimal face) changes, not the logic |
| Perception fusion (Modules 6+7+8) | Working | No — reuse as-is |
| UI layout (single crowded HUD screen) | Working but cluttered | **Yes — this is the redesign target.** See `design.md`. |
| ESP32 motor control | Architected, protocol defined below, not wired to real hardware in `legacy/` | No — out of scope for this engagement |

## 3. Frontend stack

**Current (legacy build)**: single-file `index.html`, vanilla JS, CSS
custom properties for theming, `<canvas>` for the emoji avatar. Deploys
as a static asset with zero build step.

**Target stack (future migration, not required for the UI redesign
phases)**: Next.js + TypeScript + React + Tailwind CSS, WebSocket for
robot comms, mobile-first PWA. This is the previously-agreed direction
for when the project outgrows a single HTML file — it is **not** a
prerequisite for the 3-screen redesign in this engagement. Do the
redesign in the existing single-file structure first (see
`.agent/rules/04-file-map.md`); migrate later only if/when `phases.md`
schedules it.

Reasoning for staying vanilla for now: the redesign is primarily a
layout/IA change, not a data-flow change. Introducing a build step and a
framework migration at the same time as a UI restructure multiplies risk
for no MVP benefit.

## 4. Backend

- `/api/robo` (Vercel serverless function, Node runtime).
- `GET /api/robo` → health/config check (which provider, model, whether
  keys are configured) — used by the Dev screen's system checks.
- `POST /api/robo` with `{ messages, cameraEnabled, cameraSession,
  languageHint, image }` → Gemini structured response `{ text, provider,
  model, vision, visionData, cameraSession }`.
- `POST /api/robo` with `{ tts: true, text, languageHint }` → ElevenLabs
  audio (MP3), with response headers carrying language/voice/latency
  diagnostics consumed by the Dev screen.
- Secrets (`GEMINI_API_KEY`, `ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_ID`)
  stay server-side as Vercel environment variables. The browser never
  sees them.

## 5. AI / vision contract (do not change without a phase calling for it)

- LLM: Gemini (`gemini-3.1-flash-lite` default, env-overridable), called
  with a structured `responseSchema`: `{ answer: string, scene: string,
  objects: [{ name, count, confidence, box: [ymin,xmin,ymax,xmax]
  normalized 0–1000 }] }`.
- Vision frames are attached to a request **only** when the query is
  vision-relevant (`isVisionQuestion` / `isFreshVisionQuestion` gating in
  the legacy build) or when a "visual memory" follow-up needs the last
  observed frame's context. This keeps cost and latency bounded — do not
  make this continuous.
- System prompt lives server-side in `api/robo.js` and encodes the
  personality tone from `PRD.md` §3 plus a language instruction
  (English / Hindi-Hinglish / Bengali) derived from `languageHint`.

## 6. Face tracking / recognition contract

- `face-api.js` (TinyFaceDetector + FaceLandmark68Tiny +
  FaceRecognitionNet), models loaded from CDN, runs entirely client-side.
- Detector output is treated as a candidate stream requiring temporal
  consensus before becoming a "target" (`FACE_NEW_TARGET_CONFIRM_HITS`,
  IoU/distance checks) — this exists specifically to suppress detector
  hallucinations. Keep it.
- A confirmed physical target (Module 8.2) is the authority for "who is
  currently being tracked"; recognition (Module 7.5) verifies/attaches an
  identity to that target but cannot silently clear it — identity release
  only happens through the target lifecycle (reacquire window, then
  release). This asymmetry is intentional and prevents identity flicker.
- Perception fusion (`updatePerceptionFusion`) combines social presence
  (Module 6), the active target (Module 8), and identity (Module 7) into
  one state consumed by both the UI badges and the LLM context message.

## 7. Memory contract

- `localStorage` key `robo_aios_memory_v2`, schema-versioned.
- Multi-person registry: each person has `personId`, `displayName`,
  `aliases`, `relationship`, `facts[]`, `preferences{}`, `memories[]`,
  `faceProfiles[]` (up to 6 face descriptor samples each).
- One `activePersonId` at a time, driven by face recognition or explicit
  voice commands ("remember me as X", "this is Y and she's my sister").
- Memory is deliberately flat key-value + list, not a vector store — fine
  for MVP fact counts. Revisit only if fact volume becomes large enough
  that keyword lookup stops being adequate.

## 8. ESP32 / hardware protocol (architected, not live in `legacy/`)

- Transport: WebSocket over local Wi-Fi, IP entered by the user (not
  fixed/hardcoded).
- Message types: `command` (phone → ESP32: move/turn/stop), `state`
  (ESP32 → phone: battery, distance sensor, motor status), `event`
  (ESP32 → phone: obstacle detected, connection issue).
- **Safety invariants (never relax these):**
  - ESP32 has final authority over motors — it executes, it does not take
    orders that bypass its own safety checks.
  - Communication-loss watchdog (default ~750ms) stops motors if no
    heartbeat/command arrives in time.
  - Obstacle detected + moving forward → auto-stop, regardless of any
    pending AI-issued command.
  - The AI brain / LLM never writes to GPIO or motor state directly; it
    only ever emits a `RobotCommand` that passes through
    `RobotConnection`.
- `RobotConnection` has two implementations: `VirtualRobotConnection`
  (simulator, no hardware needed) and an ESP32 WebSocket implementation —
  swappable at runtime from the Dev screen, so the app is usable before
  hardware exists.

## 9. Known future fork (not a decision needed now)

Phone-as-brain has a ceiling: if/when ROBO needs always-on vision +
faster local inference than a phone can sustain (thermal/battery), the
likely next architecture is a small always-on companion compute tier
(e.g., a Raspberry Pi) alongside the phone. Not a current requirement —
noted so it isn't a surprise later.
