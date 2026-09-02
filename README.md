# Using this with Antigravity

This folder is the context package for Antigravity — drop it into your
project root, then add your two existing build files, and open the
project in Antigravity.

## 1. Add your existing files

Copy your current working build into this structure (these are referenced
by name throughout the other docs):

```
legacy/index.html      ← your current v2.94 frontend (the HTML you pasted)
legacy/api-robo.js     ← your current v2.42 backend (the /api/robo.js you pasted)
```

Then make a working copy that will actually get edited:

```
index.html             ← copy of legacy/index.html, this is what gets redesigned
api/robo.js             ← copy of legacy/api-robo.js
```

`legacy/` stays untouched as a reference the agent can diff against if
something breaks.

## 2. Final structure Antigravity should see

```
your-project/
├── .agent/
│   └── rules/
│       ├── 00-project-overview.md
│       ├── 01-coding-standards.md
│       ├── 02-ui-redesign-constraints.md
│       ├── 03-safety-and-scope.md
│       └── 04-file-map.md
├── legacy/
│   ├── index.html
│   └── api-robo.js
├── index.html
├── api/
│   └── robo.js
├── PRD.md
├── architecture.md
├── design.md
└── phases.md
```

## 3. First prompt to give the agent

Something like:

> Read PRD.md, architecture.md, design.md, and phases.md, plus every file
> in .agent/rules/. Confirm you understand the current build in
> legacy/index.html and legacy/api-robo.js, then start Phase 0 from
> phases.md. Stop after each phase for me to test before continuing.

Use **Planning mode** (not Fast mode) for this, since it's a multi-phase
structural change — you want the plan reviewed before code gets written.

## 4. Reminder

`design.md` §7 flags one real ambiguity in the original request (how the
mic control relates to the "3 buttons" requirement) — read that section
and confirm the resolution matches what you actually want before Phase 2
builds it.
