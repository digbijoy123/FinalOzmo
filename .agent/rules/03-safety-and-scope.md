---
name: safety-and-scope
description: Safety-critical boundaries and when the agent must stop and ask instead of proceeding.
alwaysApply: true
---

# Safety & Scope Boundaries

## Hardware safety (non-negotiable, applies even in simulation/dev mode)

- The ESP32 is always the final authority over motor output. The phone/AI
  brain issues *requests*, never direct GPIO control.
- A communication-loss watchdog (configurable, default ~750ms) must always
  stop the motors if the phone stops sending heartbeats/commands.
- If an obstacle is detected while moving forward, motors auto-stop
  regardless of what the AI brain wants to do next.
- Any code touching the ESP32 WebSocket protocol, motor commands, or the
  watchdog must preserve these three properties. If a requested change
  would weaken any of them — even "just for this test" — stop and ask
  first instead of implementing it.

## Cost/scope discipline

- Do not add continuous (always-on, every-frame) calls to the Gemini
  vision endpoint. Vision frames are attached only for explicit
  vision-relevant queries or fresh-vision follow-ups, exactly as the
  legacy `isVisionQuestion` / `isFreshVisionQuestion` logic already does.
  Keep that gate.
- Do not add new paid API integrations (STT, TTS, LLM, or otherwise)
  without it being called for in `phases.md` — cost surprises are a real
  risk for a solo hobbyist project.

## When to stop and ask instead of proceeding

- A change would delete or substantially rewrite more than ~30 lines of
  already-working pipeline logic (voice, vision, memory, face
  tracking, perception fusion).
- A phase's instructions conflict with something in `design.md` or
  `architecture.md`.
- Anything touching real hardware (ESP32 firmware, motor PWM values,
  sensor thresholds).
- A dependency or paid API would need to be added that isn't already
  listed in `architecture.md`.

In all of these cases: pause, summarize the conflict/risk in plain
language, and wait for a decision rather than picking an approach
unilaterally.
