# ROBO — Product Requirements Document

## 1. What ROBO is

ROBO is a physical AI robot companion, not a chatbot wearing a robot
costume. An Android phone is the robot's brain (screen, mic, speaker,
camera); an ESP32-driven 2-wheel chassis is its body. The phone runs a
PWA that gives ROBO a face, a voice, a personality, memory, and (later)
physical reactions to the world around it.

This is a solo hobby build. The goal is a robot companion that's
genuinely fun to have around — not a product, not a startup pitch.

## 2. Who it's for

Just the builder (Digbijoy), at least through MVP and the full feature
set described here. Design decisions should optimize for "delightful to
use daily," not for multi-user scale, onboarding flows, or app-store
polish.

## 3. Personality (the thing that has to land)

ROBO should feel like a living personality, not a customer-service bot:

- Funny, playful, chaotic, mischievous, occasionally dark, sarcastic,
  witty, emotionally expressive, intelligent, confident, unpredictable.
- Never permanently cheerful. Never a customer-service tone.
- Capable of dry humour, dark humour, sarcasm, teasing, self-aware jokes,
  situational humour, playful insults where appropriate — and knowing
  when *not* to joke.
- Underneath the humour, genuinely useful and loyal.

**Voice**: natural, human-quality. English: intelligent, deep/warm,
conversational, natural pauses. Hindi/Hinglish: natural Indian
pronunciation (not forced British, not Americanized), comfortable
switching between Hindi, English, and Hinglish mid-conversation. Delivery
changes with emotional state.

**Emotion**: not keyword-triggered — driven by conversational context.
States: happy, sad, angry, excited, curious, confused, surprised, amused,
annoyed, suspicious, playful, thinking, concerned, calm, mischievous.
Emotion affects face, voice, wording, timing, and behaviour together, not
just a face icon changing.

## 4. Feature scope (target, not all-at-once — see phases.md)

1. Speech recognition
2. NLP / language understanding
3. AI brain (LLM-driven personality + reasoning)
4. Text-to-speech
5. Vision intelligence (scene/object understanding)
6. Object/face tracking
7. Personality/emotion engine
8. User perception / social awareness
9. Memory and identity (persistent, per-person)
10. Intent/action engine (turn understanding into robot actions)
11. Planning/autonomy
12. ESP32 communication for motor control
13. Safety/permission/recovery (motor watchdog, obstacle stop, AI never
    controls GPIO directly)

Continuous environmental perception (always looking, not just on
request) and face/object tracking that recognizes known people and
reacts differently to them are explicit long-term goals — not MVP scope.
Memory should influence personality/behaviour over time, not just store
text for retrieval.

## 5. Current status (do not re-plan from zero)

A working build already exists (see `/legacy/`) implementing items 1–9
above end-to-end in a phone-only PWA (no ESP32 wiring live yet in this
build; item 12/13 are architected but not connected to real hardware in
`legacy/`). This PRD's active scope for the current engagement is a **UI
redesign** of that existing build — see `design.md` and `phases.md` — not
a rebuild of the AI pipeline.

## 6. UI requirement for this engagement

Redesign the interface to exactly three full-screen modes, switched by
exactly three bottom buttons on the home screen:

- **Face** (home): black background, minimalist face — only eyes and
  mouth, no other chrome — with the 3 buttons below it.
- **Dev page**: full analytics/diagnostics of the running software, for
  finding and fixing bugs.
- **Camera mode**: full-screen live camera with face detection and object
  detection overlays.
- The third button returns to the Face screen from wherever you are.

Face design will be adapted from a reference photo the builder provides
separately.

## 7. Non-goals (explicitly out of scope right now)

- Multi-user accounts, cloud sync, or a companion mobile app store
  listing.
- A native Android app (stays a PWA for now — see `architecture.md` for
  the future-fork note on this).
- Full autonomous navigation/planning (item 11) — placeholder only for
  now.
- Company-grade privacy/consent flows — this runs on the builder's own
  phone with local storage.

## 8. Success criteria

- MVP: talk to ROBO, get a personality-appropriate spoken response with a
  matching face emotion, in under ~2 seconds end-to-end where possible.
- UI redesign (this engagement): the 3-screen structure works cleanly on
  a real phone at ~380px width, nothing from the existing diagnostics or
  pipeline is lost, and the Face screen is genuinely calm/minimal instead
  of the current cluttered HUD.
- Long-term: ROBO recognizes the builder by face, remembers prior
  conversations and preferences, and reacts physically (turns toward
  voice, small movements) to its environment.
