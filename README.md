
State Of Development
--------------------
Treasure Of The Underfortress is a fighting fantasy style web app for desktop or mobile. 
It is unfinished, the first few rooms demo the concept.
To complete I need to finish producing images with the Leonardo API pipeline for every area,
playtest, and probably add/rewrite quests, add more creatures, more goblin & orc classes
and equipment, balance loot and treasure hauls.

Game structure and flow
-----------------------
- The project is a data-driven illustrated gamebook where the world is modeled as a set of `areas` (nodes) with `exits`, `choices`, and `actionsAvailable`.
- Play loop: load an `area` → present `description` and `imagePrompt` → offer `choices` and `actions` → evaluate `requirements` → apply `effects` (add/remove items, set `flags`, start/advance `threat`s, change quests) → optionally move to another `area` via `exits` or `goToAreaId`.
- Content is authored as JSON fragments (per-act / per-arc files) under `/content/`. Authoring fragments are merged into canonical masters (`content/areas.json`, `content/items.json`, `content/jobs.json`, etc.) so the runtime engine reads a single authoritative dataset.
-- The engine contains modules for `requirements`, `effects`, `quests`, `threat` and `combat`. The validator enforces no "half-wiring" (every quest/job should have start and complete wiring) and cross-file references (area exits, item refs) must resolve.
- The project uses a single Vite + React web runner at the repository root (entry: `index.html`, `src/main.tsx`). The runner loads the canonical JSON masters from the `content/` folder and runs the engine in the browser for playtesting.

Goals
-----
- Provide a deterministic path to reproduce the content merge and validation pipeline.
- Provide a minimal stable web runner for quick playtesting of early campaign turns.
- Show how to port or re-use engine modules for full parity with the Expo app.

Prerequisites & environment
---------------------------
- Node.js: 18.x or later is recommended. (This repo has been tested with Node 18/20.)
- npm: 9.x (bundled with recent Node). Use `npm ci` in CI when lockfile is present.
- OS: any Unix-like environment (Linux/macOS). Windows will work but adapt path commands accordingly.
- Devcontainer: the repository was developed in a Codespaces/devcontainer running Ubuntu 24.04.3 LTS — this is useful for reproducing the same environment.

Repository layout (important files)
----------------------------------
- `content/` — content fragments and canonical masters created by the merge tool. Key outputs:
	- `content/areas.json`
	- `content/items.json`
	- `content/jobs.json`
	- `content/enemies.json`, `npcs.json`, `spells.json`, `recipes.json`
- `tools/` — authoring tools and scripts:
	- `tools/mergeContent.js` — merge/dedupe and write canonical masters.
	- `tools/validateContent.js` — cross-file reference validator.
	- `tools/generateAutowire*.js` — helpers that auto-generate hub areas for wiring quests for testing.
- `src/engine/` — core engine modules (TypeScript): content loader, schemas, requirements, effects, execute, quests, threat, combat, rng.
- `src/screens/` — React screens for Expo app (`Home`, `Game`, `ContentDebugScreen`).
- `web/` — minimal Vite + React web runner (entrypoint `web/src/App.tsx`). This runner fetches canonical `/content/*.json` and implements a subset of the engine required for early playtesting.

Content schemas & examples
--------------------------
The engine expects structured JSON. Canonical masters are arrays of objects with an `id` field. Below are the key schema concepts and example snippets to replicate behavior.

Area (essential fields):

```json
{
	"id": "u_entry_corridor",
	"title": "Under-Fortress: Entry Corridor",
	"description": "The corridor is built for marching...",
	"exits": { "n": "u_guard_junction", "s": "i_underfortress_entry" },
	"choices": [
		{
			"id": "keen_eye",
			"label": "Cast Keen Eye",
			"requirements": [{ "type": "knowsSpell", "spellId": "keen_eye" }],
			"effects": [{ "type": "castSpell", "spellId": "keen_eye" }, { "type": "flag", "key": "underfortress_patrol_timing", "value": true }]
		}
	],
	"actionsAvailable": { "investigate": { "text": "Boot scuffs...", "choices": [ ... ] } }
}
```

Common requirement types the engine supports (replicate in `src/engine/requirements`):
- `hasItem` { itemId, qty }
- `hasAmmo` { ammoType, minCount }
- `flagEquals` { key, value }
- `knowsSpell` { spellId }
- `flag` (used as an effect but also tested) 

Common effect types the engine supports (replicate in `src/engine/effects`):
- `addItem` / `removeItem` (itemId, qty)
- `flag` (key, value)
- `addXP` (amount)
- `castSpell` (spellId)
- `startThreat` / `advanceThreat` / `shootThreat` (threat operations used by the combat subsystem)

Jobs/Quests format notes
-----------------------
- `jobs.json` contains job/quest objects referenced by area triggers and quest wiring. The validator enforces that every quest has a start and a completion wired into some area unless intentionally standalone.

Merge logic and heuristics
-------------------------
- `tools/mergeContent.js` scans `/content` recursively for `.json` fragments. It classifies arrays by inspecting objects (e.g., presence of `area`-like fields vs `job`-like fields) and writes canonical masters.
- Deduplication: arrays are deduplicated by the `id` property. Last-write-wins ordering is deterministic (file traversal is sorted), so content authors should avoid duplicate `id`s across fragments.
- Special handling: the tool can extract `jobs` embedded inside quest fragments and place job-like objects into `jobs.json` so the runtime `jobs` master is complete.

Validator behavior and common failure modes
-----------------------------------------
- The validator (`tools/validateContent.js`) performs checks including:
	- Every `exit` target exists in `areas.json`.
	- Every `hasItem`/`removeItem`/`addItem` refers to an existing `itemId` in `items.json`.
	- All `goToAreaId` references exist.
	- Quest wiring: `questNoStart` / `questNoComplete` checks for missing area triggers.
- When the validator reports missing refs, fix by either:
	- Adding the missing `id` to the appropriate master, or
	- Correcting the typo in the referencing file, or
	- If the item/area is intentionally external, add a placeholder in `content/items_zz_patch_missing.json` / `content/areas_zz_patch_missing.json` before re-running the merge.

Engine internals (replication roadmap)
-------------------------------------
If you want to fully reproduce the runtime engine outside of Expo, follow these steps:

1. Port `src/engine/contentLoader.ts` behavior to your environment: it needs to read canonical JSON masters. For the web, use `fetch('/content/*.json')`.
2. Implement `schemas` (`zod` is used here); use the same schemas to validate canonical masters after merge.
3. Implement `requirements` and `effects` modules to evaluate and mutate a player state object (inventory, flags, active quests, threat table).
4. Implement `execute` to sequentially apply effects and enqueue threats/quest updates.
5. Implement a simple `threat` runner for early play (optional for first-turn playtesting) or stub `startThreat` effects out as logs until you implement combat.

Web runner specifics
--------------------
- The `/web` runner is intentionally small: it fetches `/content/areas.json` and `/content/items.json` at runtime. It uses a simplified in-memory state (inventory, flags) to support `hasItem`, `hasAmmo`, `addItem`, `removeItem`, and `flag` effects.
- To reproduce locally, make sure the Vite server can statically serve the `content` folder at `http://localhost:5173/content/...`. The included `vite.config.ts` allows Vite to access files outside `/web` so that `fetch('/content/areas.json')` works against the repository `content` folder.

Why `/web` duplicates parts of the project
-----------------------------------------
- Purpose: the `/web` folder intentionally contains a small, self-contained Vite + React runner that duplicates a narrow subset of the app's UI and engine logic (content fetch + a minimal choice/effects engine). This isolation was added to provide a stable, local-first path for quick playtesting without the fragility observed in Expo web previews.
- What is duplicated: `web/src/App.tsx` reimplements a trimmed version of content loading and effects handling (inventory, flags, simple `hasItem`/`addItem`/`removeItem`/`flag` semantics) rather than importing the full `src/engine` to avoid bundling complexity and keep the runner lightweight.
- Risks: duplication can drift from the main engine (`src/engine`) as features or schemas change, leading to subtle behavior differences during playtests.
- How to converge (recommended):
	1. Replace duplicated logic by importing the canonical engine modules from `src/engine` into `web/src` (e.g., `contentLoader`, `requirements`, `effects`).
	2. Update `web/vite.config.ts` to add an alias or allow access to the parent `src` directory (the current config already allows parent fs access). Example alias snippet:

```js
// vite.config.ts
import path from 'path'
export default {
	resolve: { alias: { '@root': path.resolve(__dirname, '..') } }
}
```

	3. Guard Node-only modules in shared code: ensure `contentLoader` uses `fetch` in browser contexts and only requires `fs`/`path` inside Node-only branches (e.g., `if (typeof window === 'undefined') { const fs = eval('require')('fs') }`). This prevents Vite/webpack from trying to bundle `fs`.
	4. Run `node tools/mergeContent.js` and then `cd web && npm run dev` to verify the web runner works using the canonical modules.

- If you prefer to keep `/web` isolated, add a periodic CI check that runs the validator and a lightweight integration test against `/web` to catch drift early.

Expo runner specifics and pitfalls
--------------------------------
- The original app uses Expo + React Native. Web bundling with Expo can break when Node-only modules (like `fs` or `path`) are imported. The repo resolves this by ensuring `contentLoader` uses `fetch` for the web and hides Node requires using `eval('require')` to avoid bundlers trying to include `fs`.
- Remote previews (Codespaces/GitHub.dev) may block WebSocket connections required by Expo DevTools; use the printed tunnel URL or run locally to avoid WSS 502 errors.

Testing and playtesting guidance
-------------------------------
- Quick test (web runner):
	1. `node tools/mergeContent.js`
	2. `cd web && npm install && npm run dev`
	3. Open the app and navigate the first few areas. The sidebar shows inventory and flags. Use choices to verify `addItem`/`removeItem` effects.
- Validator test: `node tools/validateContent.js` should return `Content audit passed: no missing references found` when content is clean.

Automated CI recipe (suggestion)
--------------------------------
- Job: `merge-and-validate`
	- Checkout
	- Node setup (18.x)
	- `node tools/mergeContent.js`
	- `node tools/validateContent.js`
	- Fail CI if validator reports missing refs

Authoring guidelines for new content
-----------------------------------
- IDs: use short, stable `snake_case` ids for areas/items/jobs (e.g., `u_entry_corridor`, `training_bow`).
- Image prompts: keep `imagePrompt` text concise; the engine preserves them for external image generation.
- Splitting content: author fragments in `content/areas_*.json` and `content/jobs_*.json` to make reviewable commits; always run the merge/validate steps before publishing.

Troubleshooting notes (common fixes)
-----------------------------------
- `Module not found: Can't resolve 'fs'` on web builds: ensure `src/engine/contentLoader.ts` uses `fetch` for browser and hides Node requires (use dynamic require inside an `if (typeof window === 'undefined')` block or `eval('require')`).
- Validator reports `questNoStart` / `questNoComplete`: generate or add minimal wiring areas using `tools/generateAutowire*.js` or add a hub area that triggers quest start/complete.
- Peer dependency conflicts when installing `web` deps: use compatible versions of `vite` and `@vitejs/plugin-react` (the project pins `vite` to `^4.2.0` to match `@vitejs/plugin-react@4.0.0`). If `npm install` fails, try `npm install --legacy-peer-deps`.

Extending the web runner toward parity
-------------------------------------
- Implement `startThreat`, `advanceThreat`, `shootThreat`, and basic combat in `web/src` by porting logic from `src/engine/threat` and `combat`. Aim for the same state shape (threat table, enemy groups). Start with deterministic rules to validate content flows before adding RNG.
- Add a small event log and replay for debugging content effects during playtests.

Appendix: useful commands
------------------------
- Merge content: `node tools/mergeContent.js`
- Validate content: `node tools/validateContent.js`
- Run web runner: `cd web && npm install && npm run dev`
- Run Expo app: `npm install && npm start`

Contact & next actions
----------------------
If you want, I can:
- Port additional engine effects into `/web` (threat/combat/spells), or
- Create a CI workflow that runs merge + validate automatically on PRs, or
- Produce a compact changelog or a PR-ready patch that splits the web runner into its own package.

---
This README now contains detailed replication steps, schemas, and troubleshooting notes to allow another AI or developer to reproduce, run, and iteratively extend the project.


