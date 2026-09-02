---
name: coding-standards
description: Stack, style, and technical constraints to follow for every change in this repo.
alwaysApply: true
---

# Coding Standards

## Stack (do not introduce alternatives without asking)

- Frontend: plain HTML/CSS/JS today (see `legacy/index.html`). If migrating
  to Next.js/TS/React/Tailwind per `architecture.md`, do it in the phase
  where it's scheduled — not opportunistically mid-task.
- Backend: Vercel serverless functions (`/api/*.js`), Node runtime.
- AI: Gemini via REST (`generateContent`), structured JSON output via
  `responseSchema`. Keep the existing schema shape (`answer`, `scene`,
  `objects[]`) unless a phase says otherwise.
- TTS: ElevenLabs REST API, with `speechSynthesis` as an automatic
  fallback on any ElevenLabs error (including quota exhaustion).
- STT: Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition`).
- Face detection/recognition: `face-api.js`, loaded from the CDN model URI
  already used in `legacy/index.html`. Keep detector thresholds and
  temporal-consensus logic (`FACE_NEW_TARGET_CONFIRM_HITS`, hysteresis
  distances, etc.) — they were tuned through real bug fixing. Do not
  "simplify" them without being told to.
- Storage: `localStorage` for MVP. Do not add a backend database unless a
  phase explicitly calls for it.
- Hardware: ESP32 over WebSocket (see `architecture.md` for the message
  protocol). BLE (Web Bluetooth) scaffold exists in the legacy build for an
  earlier hardware plan — treat WebSocket as the current source of truth
  unless told otherwise.

## Style

- No build step assumptions unless the phase says "migrate to Next.js."
  Until then, this stays a single deployable static frontend + serverless
  API, matching the legacy build.
- Prefer editing/moving existing functions over rewriting them. Preserve
  function names (`speak`, `respond`, `startSTT`, `toggleCamera`,
  `faceTrackingTick`, `updatePerceptionFusion`, etc.) so diffs stay
  reviewable and so the diagnostics/log lines that reference these stages
  by name stay meaningful.
- Every new UI screen must have a corresponding entry in the dev
  diagnostics page (see `design.md` → Dev screen) if it introduces a new
  subsystem or state.
- Keep all `devLog(...)` calls when moving code — the event log is how
  bugs get diagnosed on-device. Don't strip logging to "clean up" code.
- CSS: keep using CSS custom properties (`--void`, `--cyan`, etc. pattern)
  for theming rather than hardcoded hex values scattered through markup.
- No new npm dependencies for the MVP UI redesign phases unless a phase
  explicitly introduces one (e.g., the eventual Next.js migration).

## Testing discipline

- After each phase, do a manual smoke test on a real phone-width viewport
  (~380px) before moving on: face renders, all 3 buttons switch screens,
  camera permission flow still works, mic still works, dev page still
  shows live diagnostics.
- Never mark a phase complete if `console.error` or a new `devLog('...
  ERROR', ...)` line appears during that smoke test.
