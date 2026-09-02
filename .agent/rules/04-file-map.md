---
name: file-map
description: Where things live in this repo, and where new UI code should go.
alwaysApply: true
---

# File Map

```
/legacy/index.html        The existing v2.94 working build (frontend).
                           Single-file HTML/CSS/JS. Source of truth for
                           all pipeline logic: voice, AI brain calls,
                           vision, face tracking, memory, perception
                           fusion, emotion engine, TTS/STT. Treat as a
                           reference implementation to refactor the UI
                           of, not to throw away.

/legacy/api-robo.js       The existing v2.42 working backend
                           (Vercel serverless function, deploys as
                           /api/robo). Gemini + ElevenLabs adapter.
                           Keep as /api/robo.js in the new structure
                           unless a phase says to change the route.

/PRD.md                   What ROBO is and why, feature scope, success
                           criteria. Read for "why", not "how".

/architecture.md           System architecture: modules, data flow,
                           APIs, ESP32 protocol, what's staying vs.
                           changing from the legacy build.

/design.md                 The 3-screen UI redesign spec: Face / Camera
                           / Dev screens, exact layout, states, and
                           component inventory carried over from legacy.

/phases.md                 Ordered build phases for this session's work.
                           Follow in order; don't skip ahead.

/.agent/rules/              This rules folder (Antigravity reads these
                           automatically every session).
```

## Where new/moved UI code goes

Until a Next.js migration phase (if scheduled in `phases.md`) happens,
keep everything in `index.html` (single file, matching the legacy
pattern) so the app stays a zero-build static deploy. Organize the new
3-screen structure as three top-level `<section>`s toggled by a simple
`currentScreen` state (`'face' | 'camera' | 'dev'`), each owning its own
CSS scope, rather than three separate HTML files.

If/when a phase migrates this to Next.js/TS/React/Tailwind per
`architecture.md`'s target stack, the three screens become three route
segments or three client components switched by state — mirror the same
screen boundaries, don't redesign the IA again at that point.
