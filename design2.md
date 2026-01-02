COPILOT: Implement this entire spec in the Underfortress repo. Do not ask me questions. Do not invent story content. Do not add an “area picker” or any UI that asks the player to select an area to begin. The adventure MUST start from `u_entry_corridor` from quests.md. UI must render areas/choices from content+engine only.

============================================================
PHASE 1 — DETERMINE THE CURRENT ARCHITECTURE (YOU DO THIS)
============================================================
1) Scan the repo and identify:
   - Where content JSON is stored and loaded from (content loader module).
   - Where player state is stored (playerStore, Zustand, Redux, Context, etc).
   - Where navigation is defined (App.tsx, router, stack navigator).
   - Where GameScreen renders the area and choices.

2) Do NOT rewrite engine logic unless needed. The goal is to:
   - Fix startup flow
   - Fix starting area logic
   - Rebuild UI shell (TopNav + ChoiceBar + PageTurnArrow)
   - Remove area picker flow

============================================================
PHASE 2 — CONTENT: ADD CANONICAL START AREA METADATA
============================================================
CREATE FILE:
- `content/meta.json`
with exact content:
{
  "startAreaId": "u_entry_corridor"
}

UPDATE CONTENT LOADER:
- File is likely `src/engine/contentLoader.ts` or similar.
- Make it load `content/meta.json` at startup alongside areas/items/etc.
- Add and export:
  - `getStartAreaId(): string`
  - This returns meta.startAreaId.

VALIDATE (DEV):
- During load, verify:
  - meta.json exists
  - meta.startAreaId is a non-empty string
  - an area with that id exists in loaded areas
- If invalid, throw an Error with message:
  "Invalid startAreaId in content/meta.json: <value>"

============================================================
PHASE 3 — STORE: FORCE NEW GAME TO START AT THE META START AREA
============================================================
UPDATE PLAYER STORE FILE:
- Find the function that creates a new game (likely `newGame()`).
- Ensure it sets:
  currentAreaId = getStartAreaId()
- Remove any fallback:
  - getAreaById("start")
  - picking the first area in a list
  - area selection UI
- Keep other resets intact (stats/inventory/quests/flags).

ENSURE:
- Any code that initializes GameScreen must never default to "start".
- If currentAreaId is null/undefined, set it to getStartAreaId().

============================================================
PHASE 4 — NAVIGATION: REPLACE STARTUP FLOW WITH TITLE → MENU
============================================================
CREATE NEW SCREENS:
1) `src/screens/TitleScreen.tsx`
2) `src/screens/MainMenuScreen.tsx`

A) TitleScreen.tsx requirements:
- Visual: a book title page:
  - centered title: "Underfortress"
  - subtitle: optional (e.g. "A gamebook adventure")
  - parchment-ish background (plain styles ok)
- Bottom-right: a curving page-turn arrow button (icon or SVG).
- Press arrow: navigate to MainMenuScreen.
- No New/Load/Settings here.

B) MainMenuScreen.tsx requirements:
- Centered menu buttons:
  - New Game
  - Load Game
  - Settings
  - Exit
- New Game:
  - calls store.newGame()
  - navigates to GameScreen
- Load Game:
  - loads saved state (see Phase 9)
  - navigates to GameScreen if load succeeds, else show a message "No save found" and stay
- Settings:
  - navigates to SettingsScreen (create stub if missing)
- Exit:
  - Native (RN): `BackHandler.exitApp()`
  - Web: navigate back to TitleScreen (do NOT use window.close)

UPDATE `src/App.tsx`:
- Initial route must be TitleScreen.
- Register all routes/screens:
  - TitleScreen
  - MainMenuScreen
  - GameScreen
  - InventoryScreen
  - EquipmentScreen
  - SkillsScreen
  - SpellsScreen
  - QuestsScreen
  - MapScreen
  - SettingsScreen

REMOVE/DEACTIVATE:
- Any HomeScreen that is not TitleScreen/MainMenuScreen.
- Any “select area” route/screen.

============================================================
PHASE 5 — SHARED GAMEBOOK LAYOUT: FRAME + TOP NAV + BOTTOM UI
============================================================
CREATE COMPONENTS:
1) `src/components/GamebookFrame.tsx`
2) `src/components/TopNav.tsx`
3) `src/components/ChoiceBar.tsx`
4) `src/components/PageTurnArrow.tsx`

A) GamebookFrame.tsx
- Props: { children, showChoices, onNextPage, ...optional }
- Layout:
  - TopNav at top fixed/sticky
  - Content scroll area in middle
  - Bottom bar area:
    - if choices exist: render ChoiceBar
    - else: render PageTurnArrow overlay bottom-right

B) TopNav.tsx
- Buttons/links:
  - Inventory, Equipment, Skills, Spells, Quests, Map
- Responsive rule:
  - width < 768: show icons only (no text)
  - width >= 768: show text labels
- Implement breakpoint with:
  - RN: useWindowDimensions()
  - Web: CSS media query OR same width logic if shared
- Navigation:
  - must navigate to the respective screen
- Include a “Back to Game” affordance if your navigation pattern requires it:
  - simplest: other screens have a back button in header; TopNav just routes.

C) ChoiceBar.tsx (CRITICAL RULES)
- It must generate a single presented list of choices for the current area.
- Display at bottom as “gamebook options” (large buttons).
- Priority order:
  1) `area.choices[]` narrative options
  2) `actionsAvailable[]` (Talk/Investigate/etc)
  3) `area.exits[]` movement options
- EXITS:
  - render as labelled buttons, not N/S/E/W control rows
  - e.g. “Go to: Guard Junction”
- ACTIONS:
  - clicking an action shows a modal of sub-choices (reuse existing ActionModal if present)
- If after building the list there are 0 choices:
  - ChoiceBar should render nothing
  - GamebookFrame should show PageTurnArrow instead

D) PageTurnArrow.tsx
- Curving arrow icon button shown bottom-right.
- Label: accessibility “Next page”.
- On press: call onNextPage()

============================================================
PHASE 6 — GAME LOGIC: WHEN TO SHOW CHOICES VS TURN-PAGE ARROW
============================================================
UPDATE AREA TYPE (types only):
- Find where Area type/interface is defined (e.g. `src/types/Area.ts` or similar).
- Add optional:
  continueToAreaId?: string

DO NOT rewrite content. Just support the field.

IN GameScreen:
- Determine “presented choices count” based on the ChoiceBar’s computed list.
- If count > 0:
  - show choices
  - hide page-turn arrow
- If count == 0:
  - hide choices
  - show page-turn arrow

Arrow advance rules (onNextPage):
1) If `area.continueToAreaId` exists:
   - transition to that area id
2) Else if `area.exits` exists AND has exactly one exit:
   - transition via that exit
3) Else:
   - do nothing
   - console.warn("No choices and no unambiguous continue path for area:", area.id)

IMPORTANT:
- Remove the existing separate N/S/E/W movement UI row.
- Movement happens via exit buttons (ChoiceBar) or via arrow fallback.

============================================================
PHASE 7 — REMOVE “AREA PICKER” BEHAVIOUR COMPLETELY
============================================================
- Search the code for “select area”, “area picker”, “start area”, “choose area”, etc.
- Delete the screen or remove its route.
- Ensure New Game ALWAYS starts at meta start area.
- Ensure Load Game restores the saved area id.

============================================================
PHASE 8 — UI CONTENT RULES (STOP COPILOT INVENTING STORY)
============================================================
- GameScreen must render:
  - area title
  - area text/description
  - optional art if exists in content (do NOT invent new art links)
- Choices must only come from:
  - area.choices
  - actionsAvailable
  - exits
- Do not generate random choices or placeholder prose.

============================================================
PHASE 9 — SAVE/LOAD (MVP IMPLEMENTATION)
============================================================
Implement persistence for:
- currentAreaId
- player stats
- inventory
- quest state/flags
- anything else already in store that is required to resume without errors

Use:
- React Native: AsyncStorage
- Web: localStorage

Implementation pattern:
- A utility `src/utils/saveGame.ts` with:
  - `saveGame(state): Promise<void>`
  - `loadGame(): Promise<State | null>`
- Use platform detection to choose AsyncStorage vs localStorage.

MainMenu:
- Load Game tries loadGame(); if null => show “No save found”.

Store:
- After any area transition or significant state change, autosave.

Validation:
- If loaded area id is missing from content, discard save and start new game.

============================================================
PHASE 10 — STYLING (MINIMUM GAMEBOOK FEEL)
============================================================
- TitleScreen: parchment background, centered title text, arrow bottom-right.
- Game pages: readable serif font if available; otherwise default but styled.
- Choice buttons: big, bottom aligned, consistent padding, slightly rounded.

============================================================
PHASE 11 — FINAL VERIFICATION CHECKLIST (YOU MUST CONFIRM IN OUTPUT)
============================================================
After implementing, verify and state in your response that:
1) App launches into TitleScreen.
2) Arrow goes to MainMenu.
3) New Game goes to GameScreen and loads area `u_entry_corridor`.
4) There is NO area-selection screen anywhere.
5) TopNav exists and routes to Inventory/Equipment/Skills/Spells/Quests/Map.
6) On mobile (<768) TopNav shows icons only; desktop shows text.
7) Bottom shows choice buttons when available; otherwise shows page-turn arrow.
8) N/S/E/W row has been removed; exits are buttons.
9) Load Game works and restores currentAreaId.
10) Autosave triggers after transitions.

Implement now.

If you see multiple duplicated/competing implementations (e.g. two Home screens, two routers, two game engines), delete the unused ones and keep ONE clean path that satisfies the checklist.
