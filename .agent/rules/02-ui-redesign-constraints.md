---
name: ui-redesign-constraints
description: Hard constraints for the 3-screen UI redesign. Check every UI change against this list.
alwaysApply: true
---

# UI Redesign — Hard Constraints

Full spec lives in `design.md`. These are the rules that must never be
violated by any generated UI code:

1. There are **exactly three screens**, navigated by **exactly three
   bottom buttons** that are visible only on the Face screen:
   `DEV` · `CAMERA` · `FACE`.
   - The Camera and Dev screens are full-screen takeovers with their own
     minimal way back (a visible FACE button/icon), not the same 3-button
     bar repeated on every screen unless `design.md` says so.
2. **Face screen** = black background, only the face (eyes + mouth, no
   emoji sphere, no HUD chips, no camera popup, no caption bubble visible
   by default) + the 3 buttons at the bottom. Nothing else competes for
   attention on this screen.
3. **Camera screen** = full-screen live camera feed with face-tracking
   overlay boxes and object-detection overlay boxes drawn on top. This
   reuses `faceTrackingOverlay` / `visionOverlay` rendering logic from the
   legacy build — don't reimplement box-drawing math from scratch.
4. **Dev screen** = the diagnostics content already built in
   `legacy/index.html`'s `#devPage` (voice pipeline, transcript, event
   log, memory/identity, social awareness, perception fusion, system
   checks). Carry all of it over; reorganize visually if needed, but do
   not drop a diagnostic panel without it being replaced by an equivalent.
5. Voice interaction (mic tap, wake word) must keep working **from the
   Face screen** — it is the primary interaction surface now that the mic
   button doesn't have a HUD full of competing controls around it.
6. Do not silently drop: emotion states, idle auto-cycling, wake-word
   engine, memory commands, ESP32 connect button. If any of these don't
   have an obvious home in the new 3-screen layout, stop and ask instead
   of deleting them. (Likely home: ESP32 connect + emotion test grid move
   into the Dev screen.)
7. Mobile-first: design for ~380px width, verify no overflow/clipping at
   that width before wider breakpoints.
