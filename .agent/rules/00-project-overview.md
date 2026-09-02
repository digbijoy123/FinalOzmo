---
name: project-overview
description: What ROBO is, who it's for, and the non-negotiable shape of the project. Read this first, every session.
alwaysApply: true
---

# ROBO AIOS — Project Overview

ROBO is a solo-dev, phone-as-brain physical AI companion robot. This is a
personal project, not a company. Optimize for "actually works and is fun to
use," not for enterprise polish.

## What already exists (do not rebuild from scratch)

There is a working v2.94 single-file build already in this repo under
`legacy/index.html` (frontend) and `legacy/api-robo.js` (Vercel serverless
backend). It already has, working end to end:

- Voice: Web Speech API STT (`webkitSpeechRecognition`), a fuzzy wake-word
  engine for "Hey Robo", ElevenLabs TTS with browser `speechSynthesis`
  fallback.
- AI brain: Gemini (via `/api/robo`) with a structured JSON response schema
  (`answer`, `scene`, `objects[]` with normalized bounding boxes).
- Vision: camera frame capture sent to Gemini only on vision-relevant
  queries (not continuously — this is intentional, keep it that way).
- Face tracking + recognition: `face-api.js` (TinyFaceDetector +
  FaceLandmark68Tiny + FaceRecognitionNet) running fully client-side.
- Memory & identity: a multi-person registry in `localStorage`
  (`robo_aios_memory_v2`) — facts, preferences, memories, face descriptor
  profiles per person.
- Perception fusion: a layer that reconciles social-awareness (Module 6),
  memory/identity (Module 7), and face tracking (Module 8) into one
  coherent "who am I looking at" state.
- Emotion engine: rule-based `inferEmotion()` (keyword + negation +
  priority, not naive keyword matching) driving a canvas-rendered avatar
  through 15 emotional states.
- Hindi/Hinglish detection and matching-language replies.
- A developer diagnostics page with live pipeline status.

**Your job in this project is overwhelmingly UI/UX restructuring, not
rebuilding the AI/voice/vision/memory pipeline.** The pipeline works. Reuse
its functions, state variables, and API contracts. See `architecture.md`
and `design.md` for exactly what changes and what doesn't.

## What this session's work is

A UI redesign only, per `design.md`: collapse the current single crowded
screen into three full-screen modes — **Face**, **Camera**, **Dev** — with
exactly 3 buttons at the bottom of the Face screen. Follow `phases.md` in
order. Do not reintroduce the old cluttered HUD (HUD chips, inline camera
popup, dev panel overlay, 6-button footer) — those are explicitly being
replaced.

## Golden rules

1. **Don't touch the AI/voice/vision/memory logic** unless a phase
   explicitly calls for it. If the UI redesign requires a function to move
   or be renamed, move it — don't rewrite its behavior.
2. **One phase at a time.** Finish and manually verify a phase before
   starting the next one. See `phases.md`.
3. **ESP32 motor safety is untouchable.** The ESP32 always has final
   authority over motors; a communication-loss watchdog stops motors; the
   AI brain never writes to GPIO directly. Never relax this, even
   temporarily, even for testing.
4. **Ask before large deletions.** If a change would delete more than ~30
   lines of existing working logic (not UI markup), stop and flag it
   instead of proceeding silently.
5. This is a **mobile-first PWA**. Every screen must work at ~380px width
   first, then scale up.
