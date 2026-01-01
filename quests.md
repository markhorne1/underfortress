Campaign scenario list (city → sewers → caves → fortress → war skirmishes)

Use these as your campaign beats (each beat can be ~6–20 “pages” / grid squares depending on scope):

The City Under Strain (Tutorial)

Learn: movement, inventory, basic checks.

Jobs board rumours: missing patrols, sewer stink, black-market relics.

Key NPCs: tavern keeper, street-scribe, militia sergeant, hedge mage.

Market Intrigue

Pick a patron: temple, thieves’ guild, militia, or scholar.

Fetch quest with moral fork: return stolen medicine or profit.

The Smith and the Oath

First gear upgrade and crafting intro.

Choose a vow (affects perks/flags): “Protect the helpless”, “Seek the relic”, “Serve the city”.

Sewer Mouth

Find entry: grate key, bribed guard, or hidden culvert.

First “Open/Take/Investigate” chain with traps.

The Rat-King Tunnels

Early combat skirmishes.

Optional ally: a terrified lamplighter who knows the routes.

Smugglers’ Junction

Talk-focused resolution possible (bribe, bargain, intimidate).

Loot: contraband alchemy kit (unlocks recipes).

The Flooded Shrine

Luck/skill checks, puzzle with valves.

Reward: blessing charm (minor stat buff) OR cursed coin (tempting gold).

Cave Mouth Beyond the Outflow

Transition from city grime to wild under-earth.

Ambush by goblins scouting the warfront.

The Fungus Groves

Resource node for crafting (spores, glowcaps).

Optional non-hostile creature encounter (trade for safe passage).

The Echo Bridge

High-risk crossing; choice to sneak, fight, or lure enemies away.

Consequence: injury, lost item, or shortcut.

The Underground Gatehouse

Fortification puzzle: find lever room, steal gate sigil, or talk to a deserter.

Branch: stealth infiltration vs frontal fight.

Prison Cells / The Captive Noble

Rescue: princess, envoy, or strategist (your choice).

Escort mechanic: keep them safe for a few nodes.

The Relic Vault (Crystal Ball / War-Rune)

Dungeon “boss” encounter (troll champion, corrupted mage, or spectral knight).

Big choice: take relic now (danger) vs sabotage and flee.

The Return Run

Chase sequence through earlier areas now changed (flooded tunnels, new patrols).

Time pressure; optional sacrifice (drop loot to escape).

Skirmish at the Outer Wall

You’re a small part of a bigger battle: multiple mini-fights, triage choices, delivering the relic.

Outcomes set the next arc: siege continues, uneasy truce, or city’s retreat.

Veteran’s Path (Midgame Branches)

Hunt a warlord, broker alliance with “civilised” goblin clan, or cleanse a demon-tainted district.

Introduce stronger spells, rare crafting, named weapons.

Endgame Seeds

The relic reveals a deeper threat (ancient under-city, dragon cult, planar breach).

Sets up sequel/expansion campaign.

If you want, I can also generate a starter content pack (areas/items/enemies/recipes/spells) that fits the schemas above—so Copilot has real data to wire into the MVP immediately.

yes please, I'm particularly interested in a long set of city quests at the start where players help the war effort by transporting weapons and armour between troops on the battlements, bring blank scrolls to the mage tower scribes room, work in the armoury sewing leather armour pieces, when they have a few levels of experience and have earned their first complete armour set and proper weapons as quest rewards for helping the city they go on to more dangerous quest like gather resources like food from the farms outside the city, or chop timber outside the city for barricades, where they are likely to meet small goblin raiding parties which will test the adventurer's mettle e.g. "You see a goblin raiding party approaching from the north, will you: 1. Open fire with my bow, 2. Set my spikes infront of me, 3. Retreat S/W/E (choose) and ready bow." - players can manage missile fire over distance of several areas by allowing them the option to fire and retreat as the enemy closes distance.
Thought for 29s

Absolutely — here’s a starter content pack you can drop into /content that gives you a long city quest chain (war-effort errands + crafting in the armoury + mage tower deliveries), and then pushes the player outside the walls into farm/timber quests where goblin raiding parties introduce ranged fire + retreat across multiple areas.

Below are ready-to-use JSON files (original text, original locations/NPCs).

0) How this pack expects your engine to work (tiny spec)

To support the “goblin raid approaching” gameplay, this pack uses a simple Threat / Pursuit concept:

A Threat has distance (in tiles/areas), speed, enemyGroupId, direction, and optional hazards.

Certain pages can start a threat (startThreat).

Choices can:

shootThreat (requires bow + arrows; applies damage; may reduce morale or kill members)

placeHazard (e.g., spikes; damages threat when it advances)

retreat (moves player to a connected area + increases threat distance)

advanceThreat (usually happens after player actions / movement; reduces distance by speed; triggers melee when distance hits 0)

If you don’t have this yet, you can stub it cheaply:

Store activeThreat in player state.

After every player action, run one advanceThreat tick.

If distance <= 0: auto-enter combat with the threat’s group.

1) /content/items.json
[
  {
    "id": "gold_coin",
    "name": "Gold Coin",
    "type": "currency",
    "stackable": true,
    "value": 1,
    "description": "Stamped city coinage. Still accepted, despite the war."
  },
  {
    "id": "ration_pack",
    "name": "Ration Pack",
    "type": "consumable",
    "stackable": true,
    "value": 5,
    "effects": [{ "type": "heal", "amount": 2 }],
    "description": "Hard biscuit, dried meat, and sharp cheese. Better than hunger."
  },
  {
    "id": "arrow_bundle",
    "name": "Bundle of Arrows",
    "type": "ammo",
    "stackable": true,
    "value": 8,
    "meta": { "ammoType": "arrow", "count": 10 },
    "description": "Fletched shafts for a hunting bow."
  },
  {
    "id": "training_bow",
    "name": "Militia Bow",
    "type": "weapon",
    "slot": "mainHand",
    "value": 30,
    "meta": { "weaponType": "bow", "range": 3, "damage": "1d6", "requiresAmmo": "arrow" },
    "description": "A serviceable bow issued to auxiliaries. Light but reliable."
  },
  {
    "id": "short_sword",
    "name": "Short Sword",
    "type": "weapon",
    "slot": "mainHand",
    "value": 45,
    "meta": { "weaponType": "melee", "damage": "1d6" },
    "description": "A compact blade, good in alleys and tunnels."
  },
  {
    "id": "wooden_shield",
    "name": "Wooden Shield",
    "type": "armor",
    "slot": "offHand",
    "value": 25,
    "meta": { "armor": 1 },
    "description": "Planked oak with iron nails. It will turn a glancing blow."
  },
  {
    "id": "leather_cap",
    "name": "Leather Cap",
    "type": "armor",
    "slot": "head",
    "value": 20,
    "meta": { "armor": 1 },
    "description": "Stitched leather, reinforced at the brow."
  },
  {
    "id": "leather_jack",
    "name": "Leather Jack",
    "type": "armor",
    "slot": "body",
    "value": 60,
    "meta": { "armor": 2 },
    "description": "A snug leather jacket hardened with wax and patience."
  },
  {
    "id": "leather_bracers",
    "name": "Leather Bracers",
    "type": "armor",
    "slot": "arms",
    "value": 25,
    "meta": { "armor": 1 },
    "description": "Forearm guards. Less heroic than they sound, more useful than you'd think."
  },
  {
    "id": "leather_greaves",
    "name": "Leather Greaves",
    "type": "armor",
    "slot": "legs",
    "value": 35,
    "meta": { "armor": 1 },
    "description": "Leg protection. Makes running away slightly less painful."
  },
  {
    "id": "blank_scroll_stack",
    "name": "Blank Scrolls",
    "type": "quest",
    "stackable": true,
    "value": 0,
    "description": "Trimmed parchment, ready for spells or proclamations."
  },
  {
    "id": "ink_vial",
    "name": "Ink Vial",
    "type": "material",
    "stackable": true,
    "value": 3,
    "description": "Dark ink that smells faintly of iron and vinegar."
  },
  {
    "id": "wax_cake",
    "name": "Wax Cake",
    "type": "material",
    "stackable": true,
    "value": 4,
    "description": "Beeswax used to harden leather and seal seams."
  },
  {
    "id": "leather_panels",
    "name": "Leather Panels",
    "type": "material",
    "stackable": true,
    "value": 6,
    "description": "Cut leather pieces, ready to be stitched into armor."
  },
  {
    "id": "linen_thread",
    "name": "Linen Thread",
    "type": "material",
    "stackable": true,
    "value": 2,
    "description": "Strong thread for sewing and repairs."
  },
  {
    "id": "stitching_kit",
    "name": "Stitching Kit",
    "type": "tool",
    "stackable": false,
    "value": 15,
    "description": "Awl, needles, and waxed thread. Essential for armoury work."
  },
  {
    "id": "weapon_crate",
    "name": "Weapon Crate",
    "type": "quest",
    "stackable": false,
    "value": 0,
    "description": "A heavy crate of spearheads and sword belts. Deliver it quickly."
  },
  {
    "id": "armour_bundle",
    "name": "Armour Bundle",
    "type": "quest",
    "stackable": false,
    "value": 0,
    "description": "Wrapped leather pieces tagged for the battlements."
  },
  {
    "id": "spike_bundle",
    "name": "Bundle of Spikes",
    "type": "tool",
    "stackable": true,
    "value": 12,
    "meta": { "hazard": "spikes", "uses": 1, "damage": 3 },
    "description": "Iron spikes with short chains. Best planted before trouble arrives."
  },
  {
    "id": "timber_bundle",
    "name": "Bundled Timber",
    "type": "quest",
    "stackable": true,
    "value": 0,
    "description": "Fresh-cut wood for barricades, braces, and quick repairs."
  },
  {
    "id": "farm_sack",
    "name": "Sack of Grain",
    "type": "quest",
    "stackable": true,
    "value": 0,
    "description": "A heavy sack of grain bound for the city stores."
  }
]

2) /content/enemies.json
[
  {
    "id": "goblin_scout",
    "name": "Goblin Scout",
    "kind": "humanoid",
    "skill": 6,
    "stamina": 5,
    "loot": [
      { "itemId": "gold_coin", "min": 0, "max": 4 },
      { "itemId": "arrow_bundle", "min": 0, "max": 1 }
    ],
    "tags": ["goblin", "light", "skirmisher"]
  },
  {
    "id": "goblin_raider",
    "name": "Goblin Raider",
    "kind": "humanoid",
    "skill": 7,
    "stamina": 7,
    "loot": [
      { "itemId": "gold_coin", "min": 1, "max": 6 }
    ],
    "tags": ["goblin", "melee"]
  },
  {
    "id": "goblin_bowman",
    "name": "Goblin Bowman",
    "kind": "humanoid",
    "skill": 6,
    "stamina": 6,
    "meta": { "ranged": true, "range": 3, "damage": "1d6", "ammoType": "arrow" },
    "loot": [
      { "itemId": "arrow_bundle", "min": 0, "max": 1 },
      { "itemId": "gold_coin", "min": 0, "max": 5 }
    ],
    "tags": ["goblin", "ranged"]
  },
  {
    "id": "goblin_raiding_party",
    "name": "Goblin Raiding Party",
    "kind": "group",
    "members": [
      { "enemyId": "goblin_raider", "count": 2 },
      { "enemyId": "goblin_scout", "count": 1 },
      { "enemyId": "goblin_bowman", "count": 1 }
    ],
    "meta": {
      "pursuit": { "speed": 1, "startDistance": 3, "morale": 8 }
    },
    "tags": ["goblin", "group", "pursuit"]
  }
]

3) /content/recipes.json
[
  {
    "id": "craft_spikes",
    "name": "Assemble Spikes",
    "requiresTool": "stitching_kit",
    "inputs": [
      { "itemId": "linen_thread", "qty": 1 }
    ],
    "outputs": [
      { "itemId": "spike_bundle", "qty": 1 }
    ],
    "description": "Tie spikes into a quick-deploy bundle with a chain loop."
  },
  {
    "id": "sew_leather_cap",
    "name": "Sew Leather Cap",
    "requiresTool": "stitching_kit",
    "inputs": [
      { "itemId": "leather_panels", "qty": 1 },
      { "itemId": "linen_thread", "qty": 1 }
    ],
    "outputs": [
      { "itemId": "leather_cap", "qty": 1 }
    ],
    "description": "A simple stitched cap that fits beneath a hood or helm."
  },
  {
    "id": "sew_leather_bracers",
    "name": "Sew Leather Bracers",
    "requiresTool": "stitching_kit",
    "inputs": [
      { "itemId": "leather_panels", "qty": 1 },
      { "itemId": "linen_thread", "qty": 1 }
    ],
    "outputs": [
      { "itemId": "leather_bracers", "qty": 1 }
    ],
    "description": "Reinforced forearm guards. Good for bow work."
  },
  {
    "id": "sew_leather_greaves",
    "name": "Sew Leather Greaves",
    "requiresTool": "stitching_kit",
    "inputs": [
      { "itemId": "leather_panels", "qty": 2 },
      { "itemId": "linen_thread", "qty": 1 }
    ],
    "outputs": [
      { "itemId": "leather_greaves", "qty": 1 }
    ],
    "description": "Tough leather guards shaped to the shin and calf."
  },
  {
    "id": "sew_leather_jack",
    "name": "Sew Leather Jack",
    "requiresTool": "stitching_kit",
    "inputs": [
      { "itemId": "leather_panels", "qty": 3 },
      { "itemId": "linen_thread", "qty": 2 },
      { "itemId": "wax_cake", "qty": 1 }
    ],
    "outputs": [
      { "itemId": "leather_jack", "qty": 1 }
    ],
    "description": "Stitch, seal, and harden the jacket with wax for better protection."
  }
]

4) /content/spells.json (small starter)
[
  {
    "id": "spark",
    "name": "Spark",
    "cost": 1,
    "description": "A brief flash that can ignite dry tinder or startle a foe.",
    "effects": [{ "type": "flag", "key": "used_spark", "value": true }]
  },
  {
    "id": "ward",
    "name": "Ward",
    "cost": 2,
    "description": "A thin barrier of force that blunts the next hit.",
    "effects": [{ "type": "tempArmor", "amount": 1, "durationTurns": 3 }]
  },
  {
    "id": "heal_touch",
    "name": "Heal Touch",
    "cost": 2,
    "description": "Warmth in the blood and steadier breathing.",
    "effects": [{ "type": "heal", "amount": 4 }]
  }
]

5) /content/areas_city_arc.json

City tutorial + long war-effort quest loop (deliveries + scribes + armoury sewing + battlements)

[
  {
    "id": "a_city_gate_square",
    "title": "Gate Square",
    "x": 0, "y": 0, "floorId": "city",
    "tileStyle": "city_street",
    "imagePrompt": "fantasy illustration, inked linework + painterly color, moody lighting, 16th century European fantasy city, busy gate square with militia banners and anxious townsfolk, distant battlements, cinematic composition, no text, no watermark",
    "description": "The city gate towers over you, stone blocks darkened by soot and rain. A runner darts past with a satchel of orders. The air tastes of iron and worry.\n\nA notice board lists urgent tasks for anyone steady enough to help.",
    "exits": { "n": "a_tavern_row", "e": "a_market_lane", "w": "a_temple_steps", "s": "a_outer_gate" },
    "actionsAvailable": {
      "investigate": {
        "text": "You study the notice board. Most jobs are small, but they lead deeper into the city’s war machine.",
        "choices": [
          {
            "id": "pick_quartermaster",
            "label": "Offer help to the Quartermaster (deliver supplies).",
            "effects": [
              { "type": "flag", "key": "questline_city", "value": "quartermaster_intro" }
            ]
          },
          {
            "id": "pick_scribes",
            "label": "Offer help to the Mage Tower scribes (deliver blank scrolls).",
            "effects": [
              { "type": "flag", "key": "questline_city", "value": "scribes_intro" }
            ]
          },
          {
            "id": "pick_armoury",
            "label": "Offer help in the Armoury (sew leather armor pieces).",
            "effects": [
              { "type": "flag", "key": "questline_city", "value": "armoury_intro" }
            ]
          }
        ]
      },
      "talk": {
        "text": "A weary militia sergeant sizes you up. \"If you can carry, stitch, or shoot — the city can use you.\"",
        "choices": [
          {
            "id": "ask_training",
            "label": "Ask for basic kit.",
            "requirements": [{ "type": "notFlag", "key": "got_starter_kit" }],
            "effects": [
              { "type": "addItem", "itemId": "training_bow", "qty": 1 },
              { "type": "addItem", "itemId": "arrow_bundle", "qty": 1 },
              { "type": "addItem", "itemId": "ration_pack", "qty": 2 },
              { "type": "flag", "key": "got_starter_kit", "value": true }
            ]
          }
        ]
      }
    }
  },

  {
    "id": "a_outer_gate",
    "title": "Outer Gate",
    "x": 0, "y": -1, "floorId": "city",
    "tileStyle": "city_gate",
    "imagePrompt": "fantasy illustration, inked linework + painterly color, rainy city gate exterior, muddy road, watchmen silhouettes, distant farms, ominous clouds, cinematic composition, no text, no watermark",
    "description": "Beyond the gate the road bends toward farms and timberland. Guards watch the horizon with crossbows resting on the parapet.\n\nYou are safer inside — for now.",
    "exits": { "n": "a_city_gate_square", "s": "b_farm_road_edge" },
    "choices": [
      {
        "id": "leave_city",
        "label": "Step out along the road toward the farms.",
        "requirements": [{ "type": "flagEquals", "key": "city_ready_to_leave", "value": true }],
        "goToAreaId": "b_farm_road_edge"
      },
      {
        "id": "stay_city",
        "label": "Stay within the city walls.",
        "goToAreaId": "a_city_gate_square"
      }
    ]
  },

  {
    "id": "a_tavern_row",
    "title": "Tavern Row",
    "x": 0, "y": 1, "floorId": "city",
    "tileStyle": "city_street",
    "imagePrompt": "fantasy illustration, inked linework + painterly color, narrow city street of taverns with hanging signs, lantern glow, soldiers drinking, rumor and tension, cinematic composition, no text, no watermark",
    "description": "Lantern light spills onto wet cobbles. The taverns are full of soldiers on short leave, and civilians speaking in half-voices.\n\nRumours travel faster than arrows here.",
    "exits": { "s": "a_city_gate_square", "e": "a_armoury_front", "w": "a_militia_yard" },
    "actionsAvailable": {
      "talk": {
        "text": "Over cheap ale you hear talk of goblin raids near the farms, and something worse in the old quarry woods.",
        "choices": [
          {
            "id": "learn_raid_warning",
            "label": "Listen for routes and timings.",
            "effects": [
              { "type": "flag", "key": "knows_farm_raids", "value": true }
            ]
          }
        ]
      }
    }
  },

  {
    "id": "a_market_lane",
    "title": "Market Lane",
    "x": 1, "y": 0, "floorId": "city",
    "tileStyle": "city_market",
    "imagePrompt": "fantasy illustration, inked linework + painterly color, medieval market lane with stalls, parchment seller, smithy smoke, anxious buyers, cinematic composition, no text, no watermark",
    "description": "Stalls crowd the lane: onions, candles, cheap charms, ration tins. A parchment seller shouts about bulk discounts for ‘official work’.",
    "exits": { "w": "a_city_gate_square", "n": "a_mage_tower_base", "e": "a_stationers_shop", "s": "a_grain_store" },
    "actionsAvailable": {
      "take": {
        "text": "You can purchase or receive supplies depending on who you’re working for.",
        "choices": [
          {
            "id": "buy_thread",
            "label": "Buy linen thread (2 gold).",
            "requirements": [{ "type": "goldAtLeast", "amount": 2 }],
            "effects": [
              { "type": "spendGold", "amount": 2 },
              { "type": "addItem", "itemId": "linen_thread", "qty": 1 }
            ]
          },
          {
            "id": "buy_leather",
            "label": "Buy leather panels (6 gold).",
            "requirements": [{ "type": "goldAtLeast", "amount": 6 }],
            "effects": [
              { "type": "spendGold", "amount": 6 },
              { "type": "addItem", "itemId": "leather_panels", "qty": 1 }
            ]
          }
        ]
      }
    }
  },

  {
    "id": "a_stationers_shop",
    "title": "The Stationer’s Shop",
    "x": 2, "y": 0, "floorId": "city",
    "tileStyle": "shop",
    "imagePrompt": "fantasy illustration, inked linework + painterly color, cramped parchment and ink shop, shelves of scrolls, candlelight, quiet clerk, cinematic composition, no text, no watermark",
    "description": "Parchment rolls and ink vials fill every shelf. A clerk counts sheets like they’re coin — which, in war, they practically are.",
    "exits": { "w": "a_market_lane" },
    "actionsAvailable": {
      "talk": {
        "text": "The clerk peers over spectacles. \"Official work? Then say who sends you.\"",
        "choices": [
          {
            "id": "request_scrolls",
            "label": "Request blank scrolls for the Mage Tower scribes.",
            "requirements": [{ "type": "flagEquals", "key": "questline_city", "value": "scribes_intro" }],
            "effects": [
              { "type": "addItem", "itemId": "blank_scroll_stack", "qty": 5 },
              { "type": "flag", "key": "questline_city", "value": "scribes_scrolls_taken" }
            ]
          }
        ]
      }
    }
  },

  {
    "id": "a_mage_tower_base",
    "title": "Mage Tower Courtyard",
    "x": 1, "y": 1, "floorId": "city",
    "tileStyle": "mage_tower",
    "imagePrompt": "fantasy illustration, inked linework + painterly color, arcane tower courtyard with runes carved in stone, robed apprentices, faint magical glow, cinematic composition, no text, no watermark",
    "description": "A cold stillness lives here. Apprentices hurry with bundles of paper, while robed mages argue in murmurs about wards and shortages.",
    "exits": { "s": "a_market_lane", "n": "a_scribes_room", "e": "a_apprentice_dorms" },
    "actionsAvailable": {
      "investigate": {
        "text": "A chalkboard lists urgent needs: parchment, ink, lamp oil, and ‘silence’.",
        "choices": [
          {
            "id": "take_ink_request",
            "label": "Offer to bring ink vials to the scribes.",
            "effects": [
              { "type": "flag", "key": "scribes_need_ink", "value": true }
            ]
          }
        ]
      }
    }
  },

  {
    "id": "a_scribes_room",
    "title": "Scribes Room",
    "x": 1, "y": 2, "floorId": "city",
    "tileStyle": "mage_tower",
    "imagePrompt": "fantasy illustration, inked linework + painterly color, scribes room with long desks, stacks of parchment, enchanted quills, tired mage-scribes, cinematic composition, no text, no watermark",
    "description": "Rows of desks. Quills scratch. Seals stamp. A chief scribe rubs aching fingers and looks up as you enter.",
    "exits": { "s": "a_mage_tower_base" },
    "actionsAvailable": {
      "talk": {
        "text": "\"If you’ve brought blank scrolls, set them on the left — if you’ve brought ink, set it on the right. If you’ve brought trouble, take it outside.\"",
        "choices": [
          {
            "id": "deliver_scrolls",
            "label": "Deliver the blank scrolls.",
            "requirements": [{ "type": "hasItem", "itemId": "blank_scroll_stack", "qty": 5 }],
            "effects": [
              { "type": "removeItem", "itemId": "blank_scroll_stack", "qty": 5 },
              { "type": "addGold", "amount": 8 },
              { "type": "addXP", "amount": 12 },
              { "type": "flag", "key": "questline_city", "value": "scribes_scrolls_delivered" }
            ]
          },
          {
            "id": "deliver_ink",
            "label": "Deliver ink vials.",
            "requirements": [{ "type": "flagEquals", "key": "scribes_need_ink", "value": true }, { "type": "hasItem", "itemId": "ink_vial", "qty": 1 }],
            "effects": [
              { "type": "removeItem", "itemId": "ink_vial", "qty": 1 },
              { "type": "addGold", "amount": 2 },
              { "type": "addXP", "amount": 6 }
            ]
          },
          {
            "id": "learn_minor_spell",
            "label": "Ask for a simple spell as payment.",
            "requirements": [{ "type": "flagEquals", "key": "questline_city", "value": "scribes_scrolls_delivered" }],
            "effects": [
              { "type": "learnSpell", "spellId": "spark" },
              { "type": "flag", "key": "learned_spell_spark", "value": true }
            ]
          }
        ]
      }
    }
  },

  {
    "id": "a_armoury_front",
    "title": "Armoury Entrance",
    "x": 1, "y": 1, "floorId": "city",
    "tileStyle": "armoury",
    "imagePrompt": "fantasy illustration, inked linework + painterly color, city armoury with racks of spears and shields, workers carrying leather bundles, stern quartermaster, cinematic composition, no text, no watermark",
    "description": "Hammers ring within. Leather smell mingles with oil and smoke. A quartermaster barks names and numbers like commands.",
    "exits": { "w": "a_tavern_row", "n": "a_armoury_workroom", "e": "a_barracks_lane" },
    "actionsAvailable": {
      "talk": {
        "text": "The quartermaster points at you. \"Can you carry a crate without dropping it, and stitch a seam without crying?\"",
        "choices": [
          {
            "id": "take_weapon_crate",
            "label": "Take a weapon crate up to the battlements.",
            "requirements": [{ "type": "flagEquals", "key": "questline_city", "value": "quartermaster_intro" }],
            "effects": [
              { "type": "addItem", "itemId": "weapon_crate", "qty": 1 },
              { "type": "flag", "key": "questline_city", "value": "crate_taken" }
            ]
          },
          {
            "id": "take_armour_bundle",
            "label": "Take an armour bundle up to the north wall tower.",
            "requirements": [{ "type": "flagEquals", "key": "questline_city", "value": "quartermaster_intro" }],
            "effects": [
              { "type": "addItem", "itemId": "armour_bundle", "qty": 1 },
              { "type": "flag", "key": "questline_city", "value": "armour_bundle_taken" }
            ]
          },
          {
            "id": "get_stitching_kit",
            "label": "Volunteer for sewing duty (receive a stitching kit).",
            "requirements": [{ "type": "flagEquals", "key": "questline_city", "value": "armoury_intro" }, { "type": "notHasItem", "itemId": "stitching_kit" }],
            "effects": [
              { "type": "addItem", "itemId": "stitching_kit", "qty": 1 },
              { "type": "flag", "key": "armoury_can_sew", "value": true }
            ]
          }
        ]
      }
    }
  },

  {
    "id": "a_armoury_workroom",
    "title": "Armoury Workroom",
    "x": 1, "y": 2, "floorId": "city",
    "tileStyle": "armoury",
    "imagePrompt": "fantasy illustration, inked linework + painterly color, armoury workroom with sewing tables, leather pieces, needles, workers stitching, warm firelight, cinematic composition, no text, no watermark",
    "description": "Tables are crowded with leather panels, wax, and thread. Workers stitch and curse in equal measure. A forewoman nods at the empty seat beside her.",
    "exits": { "s": "a_armoury_front" },
    "actionsAvailable": {
      "craft": {
        "text": "You can sew armour pieces here if you have materials and a stitching kit.",
        "recipes": ["sew_leather_cap", "sew_leather_bracers", "sew_leather_greaves", "sew_leather_jack"]
      },
      "talk": {
        "text": "\"If you finish a proper set, I’ll mark you as reliable,\" the forewoman says. \"Reliable people get better work — and better pay.\"",
        "choices": [
          {
            "id": "claim_leather_materials",
            "label": "Request a small allotment of leather for city work.",
            "requirements": [{ "type": "flagEquals", "key": "armoury_can_sew", "value": true }, { "type": "notFlag", "key": "claimed_armoury_leather" }],
            "effects": [
              { "type": "addItem", "itemId": "leather_panels", "qty": 3 },
              { "type": "addItem", "itemId": "linen_thread", "qty": 2 },
              { "type": "addItem", "itemId": "wax_cake", "qty": 1 },
              { "type": "flag", "key": "claimed_armoury_leather", "value": true }
            ]
          },
          {
            "id": "submit_completed_set",
            "label": "Submit your stitched pieces for inspection.",
            "requirements": [
              { "type": "hasItem", "itemId": "leather_cap", "qty": 1 },
              { "type": "hasItem", "itemId": "leather_jack", "qty": 1 }
            ],
            "effects": [
              { "type": "addXP", "amount": 20 },
              { "type": "addGold", "amount": 10 },
              { "type": "flag", "key": "armoury_reliable", "value": true }
            ]
          }
        ]
      }
    }
  },

  {
    "id": "a_barracks_lane",
    "title": "Barracks Lane",
    "x": 2, "y": 1, "floorId": "city",
    "tileStyle": "city_street",
    "imagePrompt": "fantasy illustration, inked linework + painterly color, barracks lane with marching soldiers, weapon racks, banners, stern captains, cinematic composition, no text, no watermark",
    "description": "Boots thud on stone. A captain shouts drilling commands. A runner nearly collides with you, then vanishes into the barracks doors.",
    "exits": { "w": "a_armoury_front", "n": "a_battlement_stairs", "e": "a_north_wall_tower" }
  },

  {
    "id": "a_battlement_stairs",
    "title": "Battlement Stairs",
    "x": 2, "y": 2, "floorId": "city",
    "tileStyle": "battlements",
    "imagePrompt": "fantasy illustration, inked linework + painterly color, steep stone stairs to battlements, torchlight, silhouettes of archers above, cinematic composition, no text, no watermark",
    "description": "The stairs are narrow and worn, polished by urgent footsteps. Above, you hear the creak of bows and the distant murmur of the warfront.",
    "exits": { "s": "a_barracks_lane", "n": "a_battlement_walk" }
  },

  {
    "id": "a_battlement_walk",
    "title": "Battlement Walk",
    "x": 2, "y": 3, "floorId": "city",
    "tileStyle": "battlements",
    "imagePrompt": "fantasy illustration, inked linework + painterly color, city battlements with archers, rain, distant fires beyond the walls, cinematic composition, no text, no watermark",
    "description": "Rain slicks the stone. Archers stand shoulder-to-shoulder, scanning the countryside. A sergeant checks quivers and curses shortages.",
    "exits": { "s": "a_battlement_stairs", "e": "a_north_wall_tower" },
    "actionsAvailable": {
      "talk": {
        "text": "\"Deliveries? Put them there. And keep your head down.\"",
        "choices": [
          {
            "id": "deliver_weapon_crate",
            "label": "Deliver the weapon crate.",
            "requirements": [{ "type": "hasItem", "itemId": "weapon_crate", "qty": 1 }],
            "effects": [
              { "type": "removeItem", "itemId": "weapon_crate", "qty": 1 },
              { "type": "addXP", "amount": 18 },
              { "type": "addGold", "amount": 6 },
              { "type": "flag", "key": "quartermaster_delivery_done", "value": true }
            ]
          },
          {
            "id": "request_shield_reward",
            "label": "Ask for a proper shield for steady work.",
            "requirements": [{ "type": "flagEquals", "key": "quartermaster_delivery_done", "value": true }, { "type": "notHasItem", "itemId": "wooden_shield" }],
            "effects": [
              { "type": "addItem", "itemId": "wooden_shield", "qty": 1 },
              { "type": "flag", "key": "earned_shield", "value": true }
            ]
          }
        ]
      }
    }
  },

  {
    "id": "a_north_wall_tower",
    "title": "North Wall Tower",
    "x": 3, "y": 3, "floorId": "city",
    "tileStyle": "battlements",
    "imagePrompt": "fantasy illustration, inked linework + painterly color, fortified north wall tower interior, arrow slits, stacked supplies, grim officer, cinematic composition, no text, no watermark",
    "description": "Inside the tower, supplies are stacked in tidy, desperate piles. An officer watches the countryside through an arrow slit as if staring hard enough can prevent disaster.",
    "exits": { "w": "a_battlement_walk", "s": "a_barracks_lane" },
    "actionsAvailable": {
      "talk": {
        "text": "\"If you’ve brought armour, set it down and sign the chalk mark. If you’ve brought excuses, don’t.\"",
        "choices": [
          {
            "id": "deliver_armour_bundle",
            "label": "Deliver the armour bundle.",
            "requirements": [{ "type": "hasItem", "itemId": "armour_bundle", "qty": 1 }],
            "effects": [
              { "type": "removeItem", "itemId": "armour_bundle", "qty": 1 },
              { "type": "addXP", "amount": 18 },
              { "type": "addGold", "amount": 6 },
              { "type": "flag", "key": "armour_bundle_delivery_done", "value": true }
            ]
          },
          {
            "id": "reward_short_sword",
            "label": "Accept a proper short sword for your help.",
            "requirements": [{ "type": "flagEquals", "key": "armour_bundle_delivery_done", "value": true }, { "type": "notHasItem", "itemId": "short_sword" }],
            "effects": [
              { "type": "addItem", "itemId": "short_sword", "qty": 1 },
              { "type": "flag", "key": "earned_short_sword", "value": true }
            ]
          },
          {
            "id": "unlock_outside_work",
            "label": "Volunteer for outside-the-walls work (farms and timber).",
            "requirements": [
              { "type": "flagEquals", "key": "earned_short_sword", "value": true },
              { "type": "flagEquals", "key": "earned_shield", "value": true }
            ],
            "effects": [
              { "type": "flag", "key": "city_ready_to_leave", "value": true }
            ]
          }
        ]
      }
    }
  },

  {
    "id": "a_militia_yard",
    "title": "Militia Yard",
    "x": -1, "y": 1, "floorId": "city",
    "tileStyle": "training_yard",
    "imagePrompt": "fantasy illustration, inked linework + painterly color, militia training yard with targets, straw dummies, archers practicing, muddy ground, cinematic composition, no text, no watermark",
    "description": "Targets line the yard. A bow instructor barks advice with the patience of a stone wall.",
    "exits": { "e": "a_tavern_row" },
    "actionsAvailable": {
      "investigate": {
        "text": "You can practice here. It won’t make you a hero, but it might keep you alive.",
        "choices": [
          {
            "id": "practice_archery",
            "label": "Practice archery drills (+XP).",
            "effects": [{ "type": "addXP", "amount": 5 }]
          }
        ]
      }
    }
  },

  {
    "id": "a_temple_steps",
    "title": "Temple Steps",
    "x": -1, "y": 0, "floorId": "city",
    "tileStyle": "temple",
    "imagePrompt": "fantasy illustration, inked linework + painterly color, temple steps with candles and weary pilgrims, healer-priest, dusk rain, cinematic composition, no text, no watermark",
    "description": "Candle smoke and quiet prayers. A healer-priest nods at your bruises like they’ve seen a thousand more.",
    "exits": { "e": "a_city_gate_square" },
    "actionsAvailable": {
      "talk": {
        "text": "\"Small kindnesses keep a city standing,\" the priest says.",
        "choices": [
          {
            "id": "receive_blessing",
            "label": "Receive a minor blessing (once).",
            "requirements": [{ "type": "notFlag", "key": "temple_blessed" }],
            "effects": [
              { "type": "heal", "amount": 3 },
              { "type": "flag", "key": "temple_blessed", "value": true }
            ]
          }
        ]
      }
    }
  },

  {
    "id": "a_grain_store",
    "title": "City Grain Store",
    "x": 1, "y": -1, "floorId": "city",
    "tileStyle": "warehouse",
    "imagePrompt": "fantasy illustration, inked linework + painterly color, warehouse with sacks of grain, anxious clerks, guarded doors, cinematic composition, no text, no watermark",
    "description": "Sacks are piled to the rafters, guarded like treasure. A clerk frowns at a ledger full of shortages.",
    "exits": { "n": "a_market_lane" },
    "actionsAvailable": {
      "talk": {
        "text": "\"If you’re going outside, bring food back. We’re feeding a wall of soldiers.\"",
        "choices": [
          {
            "id": "accept_grain_contract",
            "label": "Accept a contract: retrieve grain sacks from the outer farms.",
            "requirements": [{ "type": "flagEquals", "key": "city_ready_to_leave", "value": true }],
            "effects": [
              { "type": "flag", "key": "farm_contract_active", "value": true }
            ]
          }
        ]
      }
    }
  }
]

6) /content/areas_outside_arc.json

Farms + timber + goblin raiding party with ranged + retreat across multiple areas

[
  {
    "id": "b_farm_road_edge",
    "title": "Road Beyond the Gate",
    "x": 0, "y": -2, "floorId": "outside",
    "tileStyle": "road",
    "imagePrompt": "fantasy illustration, inked linework + painterly color, muddy road outside city walls, distant farms, low fog, watchtower silhouette, cinematic composition, no text, no watermark",
    "description": "The city wall looms behind you. Ahead, the road dips between hedgerows toward scattered farms.\n\nSomewhere out there, goblins have learned the value of grain and timber.",
    "exits": { "n": "a_outer_gate", "s": "b_farm_crossroads", "e": "b_timber_track", "w": "b_ditch_path" }
  },

  {
    "id": "b_farm_crossroads",
    "title": "Farm Crossroads",
    "x": 0, "y": -3, "floorId": "outside",
    "tileStyle": "crossroads",
    "imagePrompt": "fantasy illustration, inked linework + painterly color, countryside crossroads with signpost, distant smoke from chimneys, uneasy quiet, cinematic composition, no text, no watermark",
    "description": "A signpost points toward the outer farms. The air is quiet in a way that feels deliberate.\n\nIn the distance, you spot movement — too low to be deer.",
    "exits": { "n": "b_farm_road_edge", "s": "b_outer_farms", "e": "b_timber_track" },
    "choices": [
      {
        "id": "spot_raid_start",
        "label": "Investigate the movement to the north field line.",
        "effects": [
          {
            "type": "startThreat",
            "threat": {
              "threatId": "t_goblin_raid_01",
              "enemyGroupId": "goblin_raiding_party",
              "distance": 3,
              "direction": "n",
              "speed": 1,
              "targetAreaId": "b_farm_crossroads",
              "hazards": []
            }
          }
        ],
        "goToAreaId": "b_raid_contact"
      },
      {
        "id": "avoid_trouble",
        "label": "Avoid the fields and move on.",
        "goToAreaId": "b_outer_farms"
      }
    ]
  },

  {
    "id": "b_raid_contact",
    "title": "Field Line",
    "x": 0, "y": -4, "floorId": "outside",
    "tileStyle": "field",
    "imagePrompt": "fantasy illustration, inked linework + painterly color, field edge with tall grass, distant goblin silhouettes approaching, tense atmosphere, cinematic composition, no text, no watermark",
    "description": "You crouch at the field line. A goblin raiding party approaches from the north, spread out and careless.\n\nThey haven’t seen you yet — but they will.",
    "exits": { "s": "b_farm_crossroads", "e": "b_timber_track", "w": "b_ditch_path" },

    "choices": [
      {
        "id": "open_fire",
        "label": "Open fire with my bow.",
        "requirements": [
          { "type": "hasItem", "itemId": "training_bow", "qty": 1 },
          { "type": "hasAmmo", "ammoType": "arrow", "minCount": 1 }
        ],
        "effects": [
          { "type": "shootThreat", "threatId": "t_goblin_raid_01", "ammoType": "arrow", "ammoToConsume": 1, "damage": { "mode": "roll", "expr": "1d6" } },
          { "type": "advanceThreat", "threatId": "t_goblin_raid_01" }
        ]
      },
      {
        "id": "set_spikes",
        "label": "Set my spikes in front of me.",
        "requirements": [{ "type": "hasItem", "itemId": "spike_bundle", "qty": 1 }],
        "effects": [
          { "type": "removeItem", "itemId": "spike_bundle", "qty": 1 },
          { "type": "placeHazard", "threatId": "t_goblin_raid_01", "hazard": { "kind": "spikes", "damage": 3, "triggerAtDistance": 1 } },
          { "type": "advanceThreat", "threatId": "t_goblin_raid_01" }
        ]
      },
      {
        "id": "retreat_south_ready",
        "label": "Retreat south and ready my bow.",
        "effects": [
          { "type": "move", "to": "b_farm_crossroads" },
          { "type": "threatRetreat", "threatId": "t_goblin_raid_01", "distanceDelta": 1 },
          { "type": "flag", "key": "ready_ranged", "value": true }
        ],
        "goToAreaId": "b_farm_crossroads"
      },
      {
        "id": "retreat_east_ready",
        "label": "Retreat east and ready my bow.",
        "effects": [
          { "type": "move", "to": "b_timber_track" },
          { "type": "threatRetreat", "threatId": "t_goblin_raid_01", "distanceDelta": 1 },
          { "type": "flag", "key": "ready_ranged", "value": true }
        ],
        "goToAreaId": "b_timber_track"
      },
      {
        "id": "retreat_west_ready",
        "label": "Retreat west and ready my bow.",
        "effects": [
          { "type": "move", "to": "b_ditch_path" },
          { "type": "threatRetreat", "threatId": "t_goblin_raid_01", "distanceDelta": 1 },
          { "type": "flag", "key": "ready_ranged", "value": true }
        ],
        "goToAreaId": "b_ditch_path"
      }
    ]
  },

  {
    "id": "b_outer_farms",
    "title": "Outer Farms",
    "x": 0, "y": -4, "floorId": "outside",
    "tileStyle": "farm",
    "imagePrompt": "fantasy illustration, inked linework + painterly color, farmyard with grain sacks, worried farmers, distant smoke, cinematic composition, no text, no watermark",
    "description": "Farmers stack grain sacks in a hurry. A woman with dirt on her cheeks presses her lips thin.\n\n\"We can’t fight them,\" she says. \"But we can’t lose the harvest either.\"",
    "exits": { "n": "b_farm_crossroads", "e": "b_timber_track" },
    "actionsAvailable": {
      "take": {
        "text": "If you’re here on city contract, you can take grain sacks to carry back.",
        "choices": [
          {
            "id": "take_grain",
            "label": "Take a sack of grain (contract).",
            "requirements": [{ "type": "flagEquals", "key": "farm_contract_active", "value": true }],
            "effects": [
              { "type": "addItem", "itemId": "farm_sack", "qty": 1 },
              { "type": "addXP", "amount": 6 }
            ]
          }
        ]
      }
    }
  },

  {
    "id": "b_timber_track",
    "title": "Timber Track",
    "x": 1, "y": -3, "floorId": "outside",
    "tileStyle": "forest_edge",
    "imagePrompt": "fantasy illustration, inked linework + painterly color, forest edge track with stacked logs, axe marks, uneasy shadows, cinematic composition, no text, no watermark",
    "description": "A narrow track leads to timberland. Fresh axe marks scar tree trunks. The war has eaten half this wood already.\n\nSomething else has been eating the other half.",
    "exits": { "w": "b_farm_crossroads", "e": "b_timber_clearing", "n": "b_farm_road_edge" },
    "actionsAvailable": {
      "investigate": {
        "text": "You see small footprints — goblin-sized — circling the track like wolves.",
        "choices": [
          {
            "id": "start_raid_here",
            "label": "Press on anyway (risk encounter).",
            "effects": [
              {
                "type": "startThreat",
                "threat": {
                  "threatId": "t_goblin_raid_02",
                  "enemyGroupId": "goblin_raiding_party",
                  "distance": 2,
                  "direction": "e",
                  "speed": 1,
                  "targetAreaId": "b_timber_track",
                  "hazards": []
                }
              }
            ],
            "goToAreaId": "b_timber_clearing"
          }
        ]
      }
    }
  },

  {
    "id": "b_timber_clearing",
    "title": "Timber Clearing",
    "x": 2, "y": -3, "floorId": "outside",
    "tileStyle": "forest",
    "imagePrompt": "fantasy illustration, inked linework + painterly color, forest clearing with felled trees, log piles, shafts of light, tension, cinematic composition, no text, no watermark",
    "description": "Felled trunks lie in rough piles. You can gather enough timber for barricades — if you’re not interrupted.\n\nA distant cackle carries through the trees.",
    "exits": { "w": "b_timber_track", "e": "b_quarry_path" },
    "actionsAvailable": {
      "take": {
        "text": "You can bundle timber for the city.",
        "choices": [
          {
            "id": "take_timber",
            "label": "Bundle timber for the city (1 bundle).",
            "effects": [
              { "type": "addItem", "itemId": "timber_bundle", "qty": 1 },
              { "type": "addXP", "amount": 8 },
              { "type": "advanceThreatIfActive", "threatId": "t_goblin_raid_02" }
            ]
          }
        ]
      }
    }
  },

  {
    "id": "b_quarry_path",
    "title": "Old Quarry Path",
    "x": 3, "y": -3, "floorId": "outside",
    "tileStyle": "rocky_path",
    "imagePrompt": "fantasy illustration, inked linework + painterly color, rocky quarry path with mist, jagged stones, ominous cave mouth hinted, cinematic composition, no text, no watermark",
    "description": "The path grows rocky and steep. You can see where the old quarry once fed stone to the city walls.\n\nNow it feels like the quarry is watching you back.",
    "exits": { "w": "b_timber_clearing" }
  },

  {
    "id": "b_ditch_path",
    "title": "Ditch Path",
    "x": -1, "y": -4, "floorId": "outside",
    "tileStyle": "ditch",
    "imagePrompt": "fantasy illustration, inked linework + painterly color, muddy ditch path with reeds, low cover, gloomy sky, cinematic composition, no text, no watermark",
    "description": "A ditch provides low cover. It’s uncomfortable, but it’s better than being a clear target in open field.",
    "exits": { "e": "b_farm_crossroads", "n": "b_farm_road_edge" }
  }
]

7) “City quest loop” reward pacing (what this pack achieves)

By doing the city chain:

Player gets Militia Bow + arrows + rations (starter kit)

Delivers to battlements and tower to earn:

Wooden Shield

Short Sword

Armoury sewing provides:

A path to Leather Jack (+ optional cap/bracers/greaves) as “earned first complete armour set”

Then the tower unlocks city_ready_to_leave = true to begin:

Farm grain runs

Timber runs

And the goblin raid ranged-retreat mechanic

8) If you want, I can add next (without you having to ask again)

I can extend this pack with:

10–20 more city areas (battlement sub-tiles, messenger routes, infirmary, siege workshop, watch rota, spy-hunting questline)

A proper “delivery job system” (repeatable contracts with cooldowns)

More ranged tactics:

“Volley” vs “Aimed Shot”

Enemy bowmen returning fire at distance

“Break line-of-sight” via alley/ditch/forest tiles

A sewer arc that begins once goblin raids reveal the “inside job” (smugglers opening gates)

If you want that expansion, tell me how big you want the city opener in total (e.g., 30 pages, 60 pages, 100 pages) and whether the city should feel more gritty or more high-fantasy in tone.

yes go ahead with all of that and use the following link from another project of mine to find other useful quest narratives, NPC encounters, combat encounters, spells and equipment for my page by page game rather than an RTS game - https://chatgpt.com/share/69540b35-eea8-800f-b72c-e33f36993919
Thought for 49s

I tried to open your shared link, but it’s showing a ChatGPT login / sign-up gate in the web viewer, so I can’t actually read the underlying content to reuse those quest ideas. 
ChatGPT
+1

No problem though — I’ll go ahead and build out the full city opener + delivery system + ranged pursuit + sewer “inside job” arc as a drop-in content expansion your Copilot-built engine can consume.

Below are new/expanded /content files (all original text). They’re designed to plug into the schema style we started (areas/items/enemies/recipes/spells) plus two new ones: jobs.json and npcs.json.

A) Add these engine effect/requirement types (so content works)

Minimal new effects/requirements this pack uses:

Requirements

cooldownReady(jobId)

hasFlag(key), flagEquals

hasItem, notHasItem

goldAtLeast

Effects

startJob(jobId) → sets active job + starts cooldown timer

completeJob(jobId) → grants rewards + marks cooldown start

setCooldown(jobId, minutes)

advanceTime(minutes) (optional)

Threat/pursuit:

startThreat, shootThreat, placeHazard, advanceThreat, threatRetreat

enemyReturnFireIfInRange (checks threat group has ranged members + LOS)

breakLOS (sets a flag on threat like losBroken=true for 1–2 turns)

Map/cover:

area property cover: "none" | "low" | "full" and blocksLOS: true/false

If you want ultra-simple MVP: implement advanceThreat after every player action, and only implement enemyReturnFireIfInRange when distance <= 2 and LOS not broken.

B) /content/jobs.json (repeatable city war-effort contracts + cooldowns)
[
  {
    "id": "job_crate_to_walk",
    "name": "Carry Weapon Crate to Battlement Walk",
    "giverNpcId": "npc_quartermaster_helka",
    "startAreaId": "a_armoury_front",
    "objective": { "type": "deliverItem", "itemId": "weapon_crate", "toAreaId": "a_battlement_walk" },
    "grantsOnStart": [{ "itemId": "weapon_crate", "qty": 1 }],
    "rewards": { "gold": 6, "xp": 14, "items": [] },
    "cooldownMinutes": 30
  },
  {
    "id": "job_armour_to_tower",
    "name": "Carry Armour Bundle to North Wall Tower",
    "giverNpcId": "npc_quartermaster_helka",
    "startAreaId": "a_armoury_front",
    "objective": { "type": "deliverItem", "itemId": "armour_bundle", "toAreaId": "a_north_wall_tower" },
    "grantsOnStart": [{ "itemId": "armour_bundle", "qty": 1 }],
    "rewards": { "gold": 6, "xp": 14, "items": [] },
    "cooldownMinutes": 30
  },
  {
    "id": "job_scrolls_to_scribes",
    "name": "Deliver Blank Scrolls to Scribes Room",
    "giverNpcId": "npc_chief_scribe_maelin",
    "startAreaId": "a_stationers_shop",
    "objective": { "type": "deliverItem", "itemId": "blank_scroll_stack", "qty": 5, "toAreaId": "a_scribes_room" },
    "grantsOnStart": [{ "itemId": "blank_scroll_stack", "qty": 5 }],
    "rewards": { "gold": 8, "xp": 16, "items": [{ "itemId": "ink_vial", "qty": 1 }] },
    "cooldownMinutes": 45
  },
  {
    "id": "job_sew_bracers",
    "name": "Armoury Shift: Sew Leather Bracers",
    "giverNpcId": "npc_armoury_forewoman_rusk",
    "startAreaId": "a_armoury_workroom",
    "objective": { "type": "craftItem", "recipeId": "sew_leather_bracers" },
    "grantsOnStart": [
      { "itemId": "leather_panels", "qty": 1 },
      { "itemId": "linen_thread", "qty": 1 }
    ],
    "rewards": { "gold": 6, "xp": 18, "items": [] },
    "cooldownMinutes": 40
  },
  {
    "id": "job_messenger_run",
    "name": "Messenger Run: Orders to Watchhouse",
    "giverNpcId": "npc_runner_tamm",
    "startAreaId": "a_city_gate_square",
    "objective": { "type": "deliverFlag", "flagKey": "sealed_orders", "toAreaId": "c_watchhouse" },
    "grantsOnStart": [],
    "rewards": { "gold": 5, "xp": 15, "items": [{ "itemId": "ration_pack", "qty": 1 }] },
    "cooldownMinutes": 25
  },
  {
    "id": "job_infirmary_bandages",
    "name": "Infirmary: Deliver Linen & Wax",
    "giverNpcId": "npc_healer_priest_seren",
    "startAreaId": "c_infirmary",
    "objective": { "type": "deliverItems", "items": [{ "itemId": "linen_thread", "qty": 2 }, { "itemId": "wax_cake", "qty": 1 }], "toAreaId": "c_infirmary" },
    "grantsOnStart": [],
    "rewards": { "gold": 4, "xp": 14, "items": [{ "itemId": "leather_cap", "qty": 1 }] },
    "cooldownMinutes": 60
  }
]

C) /content/npcs.json (city quest-givers + a sewer insider)
[
  {
    "id": "npc_quartermaster_helka",
    "name": "Quartermaster Helka",
    "role": "Armoury Quartermaster",
    "portraitPrompt": "fantasy character portrait, stern quartermaster woman, leather apron, ink-stained fingers, warm torchlight, painterly, no text",
    "dialogue": {
      "greeting": "If you’re here to help, pick a load. If you’re here to gawk, go gawk elsewhere.",
      "nodes": [
        {
          "id": "offer_jobs",
          "text": "I’ve got crates, bundles, and complaints. You can carry at least one of those.",
          "choices": [
            {
              "label": "Take a weapon crate run (repeatable).",
              "requirements": [{ "type": "cooldownReady", "jobId": "job_crate_to_walk" }],
              "effects": [{ "type": "startJob", "jobId": "job_crate_to_walk" }]
            },
            {
              "label": "Take an armour bundle run (repeatable).",
              "requirements": [{ "type": "cooldownReady", "jobId": "job_armour_to_tower" }],
              "effects": [{ "type": "startJob", "jobId": "job_armour_to_tower" }]
            }
          ]
        }
      ]
    }
  },
  {
    "id": "npc_armoury_forewoman_rusk",
    "name": "Forewoman Rusk",
    "role": "Armoury Workroom Forewoman",
    "portraitPrompt": "fantasy character portrait, tough middle-aged forewoman, needle at ear, rolled sleeves, pragmatic expression, painterly, no text",
    "dialogue": {
      "greeting": "Sit. Stitch. Don’t bleed on the leather unless you’re paying for it.",
      "nodes": [
        {
          "id": "armoury_shift",
          "text": "If you can keep a seam straight, I can keep you fed.",
          "choices": [
            {
              "label": "Take a sewing shift: bracers (repeatable).",
              "requirements": [{ "type": "cooldownReady", "jobId": "job_sew_bracers" }],
              "effects": [{ "type": "startJob", "jobId": "job_sew_bracers" }]
            },
            {
              "label": "Ask about earning a full set.",
              "effects": [{ "type": "flag", "key": "armoury_set_goal", "value": true }]
            }
          ]
        }
      ]
    }
  },
  {
    "id": "npc_chief_scribe_maelin",
    "name": "Chief Scribe Maelin",
    "role": "Mage Tower Scribes Room",
    "portraitPrompt": "fantasy character portrait, tired chief scribe with ink-smudged hands, faint rune glow, calm eyes, painterly, no text",
    "dialogue": {
      "greeting": "Parchment is a weapon. Treat it like one.",
      "nodes": [
        {
          "id": "scribe_delivery",
          "text": "Scrolls, ink, seals — the city runs on quiet work.",
          "choices": [
            {
              "label": "Take a scroll delivery job (repeatable).",
              "requirements": [{ "type": "cooldownReady", "jobId": "job_scrolls_to_scribes" }],
              "effects": [{ "type": "startJob", "jobId": "job_scrolls_to_scribes" }]
            },
            {
              "label": "Ask for a defensive spell lesson.",
              "requirements": [{ "type": "flagEquals", "key": "armoury_reliable", "value": true }],
              "effects": [{ "type": "learnSpell", "spellId": "ward" }]
            }
          ]
        }
      ]
    }
  },
  {
    "id": "npc_runner_tamm",
    "name": "Runner Tamm",
    "role": "Messenger",
    "portraitPrompt": "fantasy character portrait, young messenger with satchel, alert eyes, rain-soaked cloak, painterly, no text",
    "dialogue": {
      "greeting": "You look like you can move fast. Can you move fast with purpose?",
      "nodes": [
        {
          "id": "orders_run",
          "text": "Take sealed orders to the watchhouse. Don’t read them. Don’t lose them. Don’t die.",
          "choices": [
            {
              "label": "Take messenger run (repeatable).",
              "requirements": [{ "type": "cooldownReady", "jobId": "job_messenger_run" }],
              "effects": [
                { "type": "flag", "key": "sealed_orders", "value": true },
                { "type": "startJob", "jobId": "job_messenger_run" }
              ]
            }
          ]
        }
      ]
    }
  },
  {
    "id": "npc_healer_priest_seren",
    "name": "Priest Seren",
    "role": "Infirmary Healer",
    "portraitPrompt": "fantasy character portrait, gentle healer priest, candlelight, linen bandages, compassionate expression, painterly, no text",
    "dialogue": {
      "greeting": "The city bleeds quietly, one cut at a time.",
      "nodes": [
        {
          "id": "infirmary_help",
          "text": "If you can bring supplies, I can keep soldiers breathing.",
          "choices": [
            {
              "label": "Take infirmary supply job (repeatable).",
              "requirements": [{ "type": "cooldownReady", "jobId": "job_infirmary_bandages" }],
              "effects": [{ "type": "startJob", "jobId": "job_infirmary_bandages" }]
            },
            {
              "label": "Receive a once-only blessing.",
              "requirements": [{ "type": "notFlag", "key": "temple_blessed" }],
              "effects": [{ "type": "heal", "amount": 3 }, { "type": "flag", "key": "temple_blessed", "value": true }]
            }
          ]
        }
      ]
    }
  },
  {
    "id": "npc_drainman_voll",
    "name": "Voll the Drainman",
    "role": "Sewer Access Keeper (Secretive)",
    "portraitPrompt": "fantasy character portrait, thin drainman with lantern, stained gloves, suspicious gaze, painterly, no text",
    "dialogue": {
      "greeting": "Sewers are honest. They stink, and they kill you. People lie about both.",
      "nodes": [
        {
          "id": "sewer_hint",
          "text": "Someone’s been moving crates through the drains. Not ours. Not theirs. Someone else’s.",
          "choices": [
            {
              "label": "Ask for sewer access.",
              "requirements": [{ "type": "flagEquals", "key": "city_ready_to_leave", "value": true }],
              "effects": [{ "type": "flag", "key": "sewer_access_granted", "value": true }]
            }
          ]
        }
      ]
    }
  }
]

D) /content/spells_extended.json (adds utility + ranged/combat support)
[
  {
    "id": "keen_eye",
    "name": "Keen Eye",
    "cost": 1,
    "description": "A brief sharpening of sight; you notice cover, distance, and movement.",
    "effects": [
      { "type": "flag", "key": "keen_eye_active", "value": true },
      { "type": "tempBuff", "stat": "skill", "amount": 1, "durationTurns": 3 }
    ]
  },
  {
    "id": "muffle_steps",
    "name": "Muffle Steps",
    "cost": 1,
    "description": "Your footfalls soften. Useful for breaking line-of-sight or slipping away.",
    "effects": [
      { "type": "breakLOS", "durationTurns": 2 }
    ]
  },
  {
    "id": "scribe_mark",
    "name": "Scribe’s Mark",
    "cost": 1,
    "description": "A faint rune that proves official purpose to guards and clerks.",
    "effects": [
      { "type": "flag", "key": "has_scribe_mark", "value": true }
    ]
  }
]


(Keep your original spells.json too; just load both or merge.)

E) /content/enemies_extended.json (rats, smugglers, sewer threats, goblin variants)
[
  {
    "id": "sewer_rat",
    "name": "Sewer Rat",
    "kind": "beast",
    "skill": 5,
    "stamina": 4,
    "loot": [{ "itemId": "gold_coin", "min": 0, "max": 1 }],
    "tags": ["sewer", "beast"]
  },
  {
    "id": "dockside_cutthroat",
    "name": "Dockside Cutthroat",
    "kind": "humanoid",
    "skill": 7,
    "stamina": 6,
    "loot": [{ "itemId": "gold_coin", "min": 1, "max": 6 }],
    "tags": ["human", "criminal"]
  },
  {
    "id": "smuggler_runner",
    "name": "Smuggler Runner",
    "kind": "humanoid",
    "skill": 6,
    "stamina": 6,
    "meta": { "ranged": false },
    "loot": [{ "itemId": "gold_coin", "min": 1, "max": 4 }],
    "tags": ["human", "smuggler"]
  },
  {
    "id": "smuggler_bow",
    "name": "Smuggler Bowman",
    "kind": "humanoid",
    "skill": 6,
    "stamina": 6,
    "meta": { "ranged": true, "range": 3, "damage": "1d6", "ammoType": "arrow" },
    "loot": [{ "itemId": "arrow_bundle", "min": 0, "max": 1 }, { "itemId": "gold_coin", "min": 1, "max": 5 }],
    "tags": ["human", "smuggler", "ranged"]
  },
  {
    "id": "sewer_smuggler_cell",
    "name": "Smuggler Cell",
    "kind": "group",
    "members": [
      { "enemyId": "smuggler_runner", "count": 2 },
      { "enemyId": "smuggler_bow", "count": 1 }
    ],
    "meta": { "pursuit": { "speed": 1, "startDistance": 2, "morale": 7 } },
    "tags": ["group", "smuggler", "pursuit"]
  }
]

F) /content/items_extended.json (adds cover/LOS utility + “official work” progression)
[
  {
    "id": "city_writ",
    "name": "City Writ",
    "type": "quest",
    "stackable": false,
    "value": 0,
    "description": "A stamped paper authorizing movement for war work. Guards take it seriously."
  },
  {
    "id": "cloak_dullgrey",
    "name": "Dull Grey Cloak",
    "type": "armor",
    "slot": "cloak",
    "value": 40,
    "meta": { "armor": 0, "stealth": 1 },
    "description": "A plain cloak that blends into rain and stone."
  },
  {
    "id": "field_kit",
    "name": "Field Kit",
    "type": "tool",
    "stackable": false,
    "value": 25,
    "description": "Twine, flint, a small hammer, and a folding saw. Makes outside work faster."
  },
  {
    "id": "oil_lamp",
    "name": "Oil Lamp",
    "type": "tool",
    "stackable": false,
    "value": 18,
    "description": "A hooded lamp. Helps in sewers and can signal allies."
  }
]

G) /content/areas_city_extended.json (adds 20+ city squares + watchhouse + docks + sewer entry)
[
  {
    "id": "c_watchhouse",
    "title": "Watchhouse",
    "x": -2, "y": 2, "floorId": "city",
    "tileStyle": "watchhouse",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, city watchhouse with lanterns and notice boards, guards in rain cloaks, cinematic, no text",
    "description": "A squat stone building with barred windows. Guards trade shift notes and stare at anyone who lingers.",
    "exits": { "e": "a_militia_yard" },
    "actionsAvailable": {
      "talk": {
        "text": "A watch sergeant takes your message without warmth.",
        "choices": [
          {
            "id": "complete_orders",
            "label": "Hand over the sealed orders.",
            "requirements": [{ "type": "flagEquals", "key": "sealed_orders", "value": true }],
            "effects": [
              { "type": "flag", "key": "sealed_orders", "value": false },
              { "type": "completeJob", "jobId": "job_messenger_run" }
            ]
          }
        ]
      }
    }
  },
  {
    "id": "c_infirmary",
    "title": "Infirmary Hall",
    "x": -2, "y": 0, "floorId": "city",
    "tileStyle": "infirmary",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, infirmary hall with cots, bandaged soldiers, healer priests, candles, cinematic, no text",
    "description": "Rows of cots. Quiet groans. Priest Seren moves between the wounded with steady hands.",
    "exits": { "e": "a_temple_steps" }
  },
  {
    "id": "c_siege_workshop",
    "title": "Siege Workshop",
    "x": 4, "y": 1, "floorId": "city",
    "tileStyle": "workshop",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, siege workshop with ballista parts, carpenters, engineers, sawdust in torchlight, cinematic, no text",
    "description": "Engineers argue over rope tension and bolt heads. A half-built ballista squats like a beast waiting to wake.",
    "exits": { "w": "a_barracks_lane", "e": "c_docks_ward" },
    "actionsAvailable": {
      "talk": {
        "text": "A foreman grunts. \"Bring timber and we’ll turn it into something that keeps monsters off the wall.\"",
        "choices": [
          {
            "id": "register_timber_delivery",
            "label": "Register your timber bundles for barricade work.",
            "requirements": [{ "type": "hasItem", "itemId": "timber_bundle", "qty": 1 }],
            "effects": [
              { "type": "removeItem", "itemId": "timber_bundle", "qty": 1 },
              { "type": "addXP", "amount": 14 },
              { "type": "addGold", "amount": 6 },
              { "type": "flag", "key": "timber_delivered", "value": true }
            ]
          }
        ]
      }
    }
  },
  {
    "id": "c_docks_ward",
    "title": "Docks Ward",
    "x": 5, "y": 1, "floorId": "city",
    "tileStyle": "docks",
    "cover": "low",
    "blocksLOS": false,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, city docks with wet planks, cargo, hooded figures, lantern reflections, cinematic, no text",
    "description": "Cargo shifts under tarps. Lanterns ripple in puddles. You feel eyes measuring your pockets and your purpose.",
    "exits": { "w": "c_siege_workshop", "s": "c_drain_grate" },
    "actionsAvailable": {
      "investigate": {
        "text": "A grate near the quay looks recently disturbed — bolts scraped clean.",
        "choices": [
          { "id": "mark_grate", "label": "Mark the grate as suspicious.", "effects": [{ "type": "flag", "key": "sus_grate_marked", "value": true }] }
        ]
      }
    }
  },
  {
    "id": "c_drain_grate",
    "title": "Drain Grate",
    "x": 5, "y": 0, "floorId": "city",
    "tileStyle": "sewer_entry",
    "cover": "low",
    "blocksLOS": false,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, drain grate by dock wall, lantern light, damp stone, ominous darkness below, cinematic, no text",
    "description": "A drain grate set into stone. The smell is honest, but the scratch marks around the bolts are not.",
    "exits": { "n": "c_docks_ward", "s": "d_sewer_drop" },
    "choices": [
      {
        "id": "enter_sewer",
        "label": "Descend into the sewer.",
        "requirements": [{ "type": "flagEquals", "key": "sewer_access_granted", "value": true }],
        "goToAreaId": "d_sewer_drop"
      },
      {
        "id": "cant_enter",
        "label": "Leave it for now.",
        "goToAreaId": "c_docks_ward"
      }
    ]
  }
]

H) /content/areas_sewer_arc.json (inside-job arc + ranged pursuit in tunnels)
[
  {
    "id": "d_sewer_drop",
    "title": "Sewer Drop",
    "x": 5, "y": -1, "floorId": "sewer",
    "tileStyle": "sewer",
    "cover": "low",
    "blocksLOS": false,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, sewer ladder down into damp tunnel, lantern glow, dripping water, cinematic, no text",
    "description": "You climb down. The city becomes a ceiling. Drips count time. The tunnel ahead bends into darkness.",
    "exits": { "n": "c_drain_grate", "s": "d_junction_1" },
    "actionsAvailable": {
      "investigate": {
        "text": "Fresh boot prints — not militia — lead deeper.",
        "choices": [{ "id": "track_boots", "label": "Follow the prints.", "effects": [{ "type": "flag", "key": "tracking_smugglers", "value": true }] }]
      }
    }
  },
  {
    "id": "d_junction_1",
    "title": "Sewer Junction",
    "x": 5, "y": -2, "floorId": "sewer",
    "tileStyle": "sewer",
    "cover": "low",
    "blocksLOS": false,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, sewer junction with branching tunnels, chalk marks, shallow water, cinematic, no text",
    "description": "Three tunnels meet. Someone has chalked a crude arrow on the wall — a smuggler’s sign.",
    "exits": { "n": "d_sewer_drop", "s": "d_rat_run", "w": "d_side_sluice", "e": "d_long_channel" }
  },
  {
    "id": "d_rat_run",
    "title": "Rat Run",
    "x": 5, "y": -3, "floorId": "sewer",
    "tileStyle": "sewer",
    "cover": "none",
    "blocksLOS": false,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, narrow sewer run with scurrying rats, splashing water, claustrophobic, cinematic, no text",
    "description": "Rats scatter as you approach — then one turns back, bold with hunger.",
    "actionsAvailable": {
      "fight": {
        "text": "The rats lunge from the shadows.",
        "enemyGroup": [{ "enemyId": "sewer_rat", "count": 2 }]
      }
    },
    "exits": { "n": "d_junction_1", "s": "d_smuggler_gate" }
  },
  {
    "id": "d_smuggler_gate",
    "title": "Smuggler Gate",
    "x": 5, "y": -4, "floorId": "sewer",
    "tileStyle": "sewer",
    "cover": "low",
    "blocksLOS": false,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, barred sewer gate with fresh pry marks, lantern glow, hidden passage vibe, cinematic, no text",
    "description": "A barred gate. The lock is new. The pry marks are newer.\n\nYou hear voices ahead — close.",
    "choices": [
      {
        "id": "approach_gate",
        "label": "Approach quietly.",
        "effects": [
          {
            "type": "startThreat",
            "threat": {
              "threatId": "t_smuggler_cell_01",
              "enemyGroupId": "sewer_smuggler_cell",
              "distance": 2,
              "direction": "s",
              "speed": 1,
              "targetAreaId": "d_smuggler_gate",
              "hazards": []
            }
          }
        ],
        "goToAreaId": "d_smuggler_contact"
      }
    ],
    "exits": { "n": "d_rat_run", "s": "d_smuggler_contact" }
  },
  {
    "id": "d_smuggler_contact",
    "title": "Lantern Alcove",
    "x": 5, "y": -5, "floorId": "sewer",
    "tileStyle": "sewer",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, sewer alcove with lantern on crate, smuggler silhouettes, tense standoff, cinematic, no text",
    "description": "A lantern burns atop a crate. Smugglers freeze when they see you.\n\nOne raises a hand — the other reaches for a bow.",
    "choices": [
      {
        "id": "shoot_then_fall_back",
        "label": "Loose an arrow, then fall back to cover.",
        "requirements": [
          { "type": "hasItem", "itemId": "training_bow", "qty": 1 },
          { "type": "hasAmmo", "ammoType": "arrow", "minCount": 1 }
        ],
        "effects": [
          { "type": "shootThreat", "threatId": "t_smuggler_cell_01", "ammoType": "arrow", "ammoToConsume": 1, "damage": { "mode": "roll", "expr": "1d6" } },
          { "type": "breakLOS", "durationTurns": 1 },
          { "type": "enemyReturnFireIfInRange", "threatId": "t_smuggler_cell_01" },
          { "type": "advanceThreat", "threatId": "t_smuggler_cell_01" }
        ]
      },
      {
        "id": "retreat_to_gate",
        "label": "Retreat north toward the gate and ready my bow.",
        "effects": [
          { "type": "move", "to": "d_smuggler_gate" },
          { "type": "threatRetreat", "threatId": "t_smuggler_cell_01", "distanceDelta": 1 },
          { "type": "flag", "key": "ready_ranged", "value": true }
        ],
        "goToAreaId": "d_smuggler_gate"
      },
      {
        "id": "fight_now",
        "label": "Close in and fight.",
        "effects": [{ "type": "forceCombatFromThreat", "threatId": "t_smuggler_cell_01" }]
      }
    ],
    "exits": { "n": "d_smuggler_gate" }
  },
  {
    "id": "d_side_sluice",
    "title": "Side Sluice",
    "x": 4, "y": -2, "floorId": "sewer",
    "tileStyle": "sewer",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, narrow side sluice with iron bars, rushing water, cramped cover, cinematic, no text",
    "description": "A side sluice offers tight cover. If arrows start flying, this place could save your life — or trap you in it.",
    "exits": { "e": "d_junction_1" }
  },
  {
    "id": "d_long_channel",
    "title": "Long Channel",
    "x": 6, "y": -2, "floorId": "sewer",
    "tileStyle": "sewer",
    "cover": "none",
    "blocksLOS": false,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, long sewer channel vanishing into darkness, rippling water, distant lantern, cinematic, no text",
    "description": "A long channel runs straight as a spear. If something chases you here, you’ll need distance — or luck.",
    "exits": { "w": "d_junction_1" }
  }
]

I) Ranged “fire & retreat” template (copy for goblin raids anywhere)

Use this choice pattern on any page where a threat approaches (you already liked the goblin version). The key is: shoot → advance threat → return fire if in range, and allow retreat to adjacent areas to preserve distance.

Here’s a reusable snippet you can paste into any area’s choices:

[
  {
    "id": "shoot",
    "label": "Open fire with my bow.",
    "requirements": [
      { "type": "hasItem", "itemId": "training_bow", "qty": 1 },
      { "type": "hasAmmo", "ammoType": "arrow", "minCount": 1 }
    ],
    "effects": [
      { "type": "shootThreat", "threatId": "THREAT_ID", "ammoType": "arrow", "ammoToConsume": 1, "damage": { "mode": "roll", "expr": "1d6" } },
      { "type": "enemyReturnFireIfInRange", "threatId": "THREAT_ID" },
      { "type": "advanceThreat", "threatId": "THREAT_ID" }
    ]
  },
  {
    "id": "spikes",
    "label": "Set my spikes in front of me.",
    "requirements": [{ "type": "hasItem", "itemId": "spike_bundle", "qty": 1 }],
    "effects": [
      { "type": "removeItem", "itemId": "spike_bundle", "qty": 1 },
      { "type": "placeHazard", "threatId": "THREAT_ID", "hazard": { "kind": "spikes", "damage": 3, "triggerAtDistance": 1 } },
      { "type": "advanceThreat", "threatId": "THREAT_ID" }
    ]
  },
  {
    "id": "retreat",
    "label": "Retreat (choose direction) and ready bow.",
    "effects": [
      { "type": "threatRetreat", "threatId": "THREAT_ID", "distanceDelta": 1 },
      { "type": "flag", "key": "ready_ranged", "value": true }
    ]
  }
]

If you can paste the other-project quest content here

If you want me to truly “mine” that other project for specific narrative beats, paste the relevant sections (or export them to a public doc) and I’ll convert them into page-by-page areas + Leonardo prompts + choices in the same JSON format.

If you say nothing else, your next Copilot step is: load these new files, implement the new job/threat effects, and you’ll have a long, replayable city opener + the sewer inside-job arc with ranged pursuit working end-to-end.

excellent, forget about the link you're doing fine, carry on with your ideas and add shops in the city where players can do quests in exchange for items if they can't afford to buy them, add a city council quest line after the quest line where the player resupplies the battlements etc - they become trusted enough to gain delivery and low level combat quests that reward a basic magic item or special items that can be combined or exchanged for other quest items later to complete them. See how imaginative you can make the quests and whether you can knit them all together into scenario stages that progress logically as per my core story of impending mass battle at the gates.

Awesome — here’s the next expansion: city shops with barter/quest-for-gear, plus a City Council questline that unlocks after battlement resupply, and a set of special “sigil” items used as quest currencies that later combine/exchange into keys, warrants, and magic items. Everything ties into escalating preparations for the impending mass battle at the gates.

I’m going to add four new content files (drop-in JSON), and a clear scenario-stage progression so Copilot can wire the gating.

1) Scenario stages (the logical progression)

Stage 0 — The Helpful Stranger (Tutorial / War-effort errands)

Repeatable delivery jobs (crates/armour/scrolls), sewing shifts, messenger runs.

Unlock condition: armour_bundle_delivery_done && quartermaster_delivery_done && armoury_reliable

Stage 1 — Trusted Auxiliary (Shops unlock “work for goods”)

Shops offer “quest exchange” if you can’t afford items.

Unlock condition: armoury_reliable == true (or player level >= 2)

Stage 2 — Council Notice (political + logistics)

City Council grants a City Writ and “special tokens” to authorize movement.

Introduces low-level combat inside the city (saboteurs, rats, smugglers) and outside escorts.

Unlock condition: city_ready_to_leave == true AND sus_grate_marked == true OR sewer_access_granted == true

Stage 3 — The Hidden Supply War (sabotage + procurement)

Discover that supply shortages are engineered.

Tokens combine/exchange into keys / warrants / ward-stones.

Unlock condition: completion of at least 2 council jobs + one sewer investigation milestone.

Stage 4 — Final Preparations (pre-battle skirmishes)

Escort convoys, hold a breach point, disable a siege threat.

Culminates in Battle at the Gates (Act I climax).

Unlock condition: council_trusted == true AND barricades_ready == true AND stores_secured == true

Below, I’m adding the content that implements Stages 1–3.

2) New “special items” (quest currencies that combine/exchange later)

Create /content/items_council_tokens.json:

[
  {
    "id": "council_sigil_bronze",
    "name": "Bronze Council Sigil",
    "type": "quest",
    "stackable": true,
    "value": 0,
    "description": "A stamped bronze token used as proof of council-authorized work."
  },
  {
    "id": "council_sigil_silver",
    "name": "Silver Council Sigil",
    "type": "quest",
    "stackable": true,
    "value": 0,
    "description": "A silver token issued to trusted auxiliaries. Opens doors that coin cannot."
  },
  {
    "id": "ward_shard",
    "name": "Ward Shard",
    "type": "quest",
    "stackable": true,
    "value": 0,
    "description": "A rune-etched shard that hums faintly. Three can be fused into a ward-stone."
  },
  {
    "id": "ward_stone",
    "name": "Ward-Stone",
    "type": "quest",
    "stackable": false,
    "value": 0,
    "description": "A fused ward focus used to reinforce gates, towers, or keep creatures at bay."
  },
  {
    "id": "council_warrant",
    "name": "Council Warrant",
    "type": "quest",
    "stackable": false,
    "value": 0,
    "description": "A signed warrant that authorizes searches and seizures in the name of the city."
  },
  {
    "id": "minor_charm_ironluck",
    "name": "Ironluck Charm",
    "type": "accessory",
    "slot": "amulet",
    "stackable": false,
    "value": 0,
    "meta": { "luckBonus": 1 },
    "description": "A small iron charm that seems to turn mishaps aside — once in a while."
  },
  {
    "id": "ring_quickstep",
    "name": "Ring of Quickstep",
    "type": "accessory",
    "slot": "ring1",
    "stackable": false,
    "value": 0,
    "meta": { "moveBonus": 1 },
    "description": "A plain band etched with a running figure. You feel lighter when danger closes."
  }
]

3) Token crafting/exchange (combine shards → ward-stone; sigils → warrant)

Create /content/recipes_council.json:

[
  {
    "id": "fuse_ward_stone",
    "name": "Fuse Ward-Stone",
    "requiresTool": "oil_lamp",
    "inputs": [{ "itemId": "ward_shard", "qty": 3 }],
    "outputs": [{ "itemId": "ward_stone", "qty": 1 }],
    "description": "Heat the rune metal and align the glyphs until they lock into one humming focus."
  },
  {
    "id": "trade_bronze_to_silver",
    "name": "Exchange Bronze Sigils for Silver",
    "inputs": [{ "itemId": "council_sigil_bronze", "qty": 5 }],
    "outputs": [{ "itemId": "council_sigil_silver", "qty": 1 }],
    "description": "Five bronze sigils exchanged at the council clerk’s desk becomes one silver sigil."
  },
  {
    "id": "issue_council_warrant",
    "name": "Issue Council Warrant",
    "inputs": [{ "itemId": "council_sigil_silver", "qty": 2 }],
    "outputs": [{ "itemId": "council_warrant", "qty": 1 }],
    "description": "Two silver sigils and a signature becomes authority — at least on paper."
  }
]

4) City shops with “work for items” quests

Create /content/shops_and_quests.json (this is a jobs list + shop inventory in one file; if you prefer separate schemas, split it).

{
  "shops": [
    {
      "id": "shop_blacksmith",
      "name": "Harrow & Tongs Blacksmith",
      "areaId": "c_blacksmith",
      "imagePrompt": "fantasy illustration, inked linework + painterly color, busy blacksmith shop, sparks, weapon racks, stern smith, cinematic, no text",
      "inventory": [
        { "itemId": "short_sword", "priceGold": 55 },
        { "itemId": "arrow_bundle", "priceGold": 10 },
        { "itemId": "wooden_shield", "priceGold": 30 }
      ],
      "workForGoods": [
        {
          "id": "q_smith_quench_oil",
          "title": "Quench Oil Shortage",
          "description": "Carry lamp oil from the docks ward to the smithy without spilling it.",
          "requirements": [{ "type": "notFlag", "key": "q_smith_quench_oil_done" }],
          "objective": { "type": "deliverFlag", "flagKey": "oil_crate", "toAreaId": "c_blacksmith" },
          "onAccept": [{ "type": "flag", "key": "oil_crate", "value": true }],
          "rewards": [
            { "type": "addItem", "itemId": "wooden_shield", "qty": 1 },
            { "type": "addXP", "amount": 14 },
            { "type": "flag", "key": "q_smith_quench_oil_done", "value": true }
          ]
        },
        {
          "id": "q_smith_horseshoe_nails",
          "title": "Nails for Barricades",
          "description": "Sort and bundle nails for barricade teams. It’s mindless work, but vital.",
          "requirements": [{ "type": "cooldownReady", "jobId": "job_smith_nails" }],
          "objective": { "type": "simpleTask" },
          "rewards": [
            { "type": "addItem", "itemId": "arrow_bundle", "qty": 1 },
            { "type": "addGold", "amount": 4 },
            { "type": "addXP", "amount": 10 }
          ]
        }
      ]
    },
    {
      "id": "shop_apothecary",
      "name": "Moss & Mortar Apothecary",
      "areaId": "c_apothecary",
      "imagePrompt": "fantasy illustration, inked linework + painterly color, apothecary with herbs, bottles, mortar and pestle, greenish light, cinematic, no text",
      "inventory": [
        { "itemId": "ration_pack", "priceGold": 6 },
        { "itemId": "wax_cake", "priceGold": 5 },
        { "itemId": "ink_vial", "priceGold": 4 }
      ],
      "workForGoods": [
        {
          "id": "q_apoth_sort_herbs",
          "title": "Sort the Drying Herbs",
          "description": "Help sort and hang herbs for the infirmary shipments.",
          "requirements": [{ "type": "cooldownReady", "jobId": "job_apoth_sort" }],
          "objective": { "type": "simpleTask" },
          "rewards": [
            { "type": "addItem", "itemId": "ration_pack", "qty": 2 },
            { "type": "addXP", "amount": 12 }
          ]
        },
        {
          "id": "q_apoth_rat_cellar",
          "title": "Rats in the Cellar",
          "description": "Clear the cellar vermin before they chew through the stores.",
          "requirements": [{ "type": "notFlag", "key": "q_apoth_rat_cellar_done" }],
          "objective": { "type": "winCombat", "enemyGroup": [{ "enemyId": "sewer_rat", "count": 3 }] },
          "rewards": [
            { "type": "addItem", "itemId": "wax_cake", "qty": 2 },
            { "type": "addItem", "itemId": "spike_bundle", "qty": 1 },
            { "type": "addXP", "amount": 18 },
            { "type": "flag", "key": "q_apoth_rat_cellar_done", "value": true }
          ]
        }
      ]
    },
    {
      "id": "shop_fletcher",
      "name": "Feather & Shaft Fletcher",
      "areaId": "c_fletcher",
      "imagePrompt": "fantasy illustration, inked linework + painterly color, fletcher shop with feathers, arrow racks, bowstrings, artisan at bench, cinematic, no text",
      "inventory": [
        { "itemId": "arrow_bundle", "priceGold": 9 },
        { "itemId": "spike_bundle", "priceGold": 14 }
      ],
      "workForGoods": [
        {
          "id": "q_fletcher_string",
          "title": "Stringing Duty",
          "description": "Twist and wax bowstrings for the battlements.",
          "requirements": [{ "type": "cooldownReady", "jobId": "job_fletcher_string" }],
          "objective": { "type": "simpleTask" },
          "rewards": [
            { "type": "addItem", "itemId": "arrow_bundle", "qty": 1 },
            { "type": "addXP", "amount": 10 }
          ]
        }
      ]
    }
  ]
}


Note: You’ll want to add jobs entries for job_smith_nails, job_apoth_sort, job_fletcher_string (simple cooldown jobs). If you like, I’ll append them into jobs.json next.

5) City Council questline (trusted deliveries → warrants → magic item reward)

Create /content/council_jobs.json:

[
  {
    "id": "council_intro",
    "name": "Council Audience: Auxiliary Status",
    "giverNpcId": "npc_council_clerk_elm",
    "startAreaId": "c_council_hall",
    "objective": { "type": "flagSet", "key": "council_introduced", "value": true },
    "rewards": { "gold": 0, "xp": 20, "items": [{ "itemId": "city_writ", "qty": 1 }, { "itemId": "council_sigil_bronze", "qty": 2 }] },
    "cooldownMinutes": 99999
  },
  {
    "id": "council_job_ward_shards",
    "name": "Recover Ward Shards from the Old Drain",
    "giverNpcId": "npc_councilor_vayne",
    "startAreaId": "c_council_hall",
    "objective": { "type": "deliverItems", "items": [{ "itemId": "ward_shard", "qty": 3 }], "toAreaId": "c_council_hall" },
    "grantsOnStart": [],
    "rewards": { "gold": 6, "xp": 24, "items": [{ "itemId": "council_sigil_bronze", "qty": 2 }] },
    "cooldownMinutes": 120
  },
  {
    "id": "council_job_search_warrant",
    "name": "Issue a Search Warrant",
    "giverNpcId": "npc_council_clerk_elm",
    "startAreaId": "c_council_hall",
    "objective": { "type": "craftItem", "recipeId": "issue_council_warrant" },
    "grantsOnStart": [],
    "rewards": { "gold": 0, "xp": 18, "items": [] },
    "cooldownMinutes": 99999
  },
  {
    "id": "council_job_docks_raid",
    "name": "Disrupt the Docks Ward Contraband",
    "giverNpcId": "npc_councilor_vayne",
    "startAreaId": "c_council_hall",
    "objective": { "type": "setFlag", "key": "docks_contraband_disrupted", "value": true },
    "grantsOnStart": [],
    "rewards": { "gold": 8, "xp": 28, "items": [{ "itemId": "council_sigil_silver", "qty": 1 }, { "itemId": "ward_shard", "qty": 2 }] },
    "cooldownMinutes": 180
  },
  {
    "id": "council_job_reward_charm",
    "name": "Council Reward: Choose a Minor Charm",
    "giverNpcId": "npc_councilor_vayne",
    "startAreaId": "c_council_hall",
    "objective": { "type": "choiceReward" },
    "rewards": { "gold": 0, "xp": 10, "items": [] },
    "cooldownMinutes": 99999
  }
]


This expects:

You can grant ward_shard drops in sewers / contraband caches.

Council Reward is implemented as a choice node: pick Ironluck Charm or Ring of Quickstep.

6) Council Hall + key city areas

Create /content/areas_council_stage.json:

[
  {
    "id": "c_council_hall",
    "title": "City Council Hall",
    "x": -1, "y": 2, "floorId": "city",
    "tileStyle": "council",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, council hall with banners, long table, scribes, guarded doors, cinematic, no text",
    "description": "A long hall of stone and banners. Scribes whisper over ledgers. A councilor’s gaze can feel heavier than a shield.",
    "exits": { "e": "a_militia_yard", "s": "a_temple_steps" },
    "actionsAvailable": {
      "talk": {
        "text": "A clerk in plain robes tilts their head. \"Names, duties, and proofs. The city is done with guesswork.\"",
        "choices": [
          {
            "id": "council_intro_start",
            "label": "Present yourself as a helpful auxiliary (request writ).",
            "requirements": [
              { "type": "flagEquals", "key": "armoury_reliable", "value": true },
              { "type": "notFlag", "key": "council_introduced" }
            ],
            "effects": [{ "type": "startJob", "jobId": "council_intro" }]
          },
          {
            "id": "exchange_bronze",
            "label": "Exchange 5 Bronze Sigils for 1 Silver Sigil.",
            "requirements": [{ "type": "hasItem", "itemId": "council_sigil_bronze", "qty": 5 }],
            "effects": [{ "type": "craft", "recipeId": "trade_bronze_to_silver" }]
          },
          {
            "id": "issue_warrant",
            "label": "Issue a Council Warrant (costs 2 Silver Sigils).",
            "requirements": [{ "type": "hasItem", "itemId": "council_sigil_silver", "qty": 2 }],
            "effects": [{ "type": "startJob", "jobId": "council_job_search_warrant" }]
          }
        ]
      },
      "craft": {
        "text": "A clerk’s brazier can fuse rune-metal if you have the shards and a lamp.",
        "recipes": ["fuse_ward_stone", "trade_bronze_to_silver", "issue_council_warrant"]
      }
    }
  },

  {
    "id": "c_blacksmith",
    "title": "Harrow & Tongs Blacksmith",
    "x": 2, "y": 2, "floorId": "city",
    "tileStyle": "shop",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, blacksmith interior, sparks, sword rack, stern smith, cinematic, no text",
    "description": "Heat, hammer, and impatience. The smith looks you over like a bent nail.",
    "exits": { "w": "a_barracks_lane" },
    "actionsAvailable": {
      "talk": {
        "text": "\"Coin buys steel. Work buys it too — if your hands aren’t soft.\"",
        "choices": [
          { "id": "open_shop", "label": "Browse goods (if you can pay).", "effects": [{ "type": "openShop", "shopId": "shop_blacksmith" }] },
          { "id": "work_for_goods", "label": "Ask for work in exchange for gear.", "effects": [{ "type": "openShopWork", "shopId": "shop_blacksmith" }] }
        ]
      }
    }
  },

  {
    "id": "c_apothecary",
    "title": "Moss & Mortar Apothecary",
    "x": 0, "y": 2, "floorId": "city",
    "tileStyle": "shop",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, apothecary shelves with herbs and bottles, green glow, cautious apothecary, cinematic, no text",
    "description": "Herbs hang from rafters. Bottles clink softly. The apothecary’s eyes miss nothing.",
    "exits": { "s": "a_mage_tower_base", "w": "c_council_hall" },
    "actionsAvailable": {
      "talk": {
        "text": "\"If you can’t pay, you can still be useful.\"",
        "choices": [
          { "id": "open_shop", "label": "Browse goods (if you can pay).", "effects": [{ "type": "openShop", "shopId": "shop_apothecary" }] },
          { "id": "work_for_goods", "label": "Ask for work in exchange for supplies.", "effects": [{ "type": "openShopWork", "shopId": "shop_apothecary" }] }
        ]
      }
    }
  },

  {
    "id": "c_fletcher",
    "title": "Feather & Shaft Fletcher",
    "x": 1, "y": 3, "floorId": "city",
    "tileStyle": "shop",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, fletcher bench, feathers, arrow shafts, artisan working, cinematic, no text",
    "description": "Feathers drift like snow. Arrow shafts line the walls in tidy ranks.",
    "exits": { "s": "a_battlement_stairs" },
    "actionsAvailable": {
      "talk": {
        "text": "\"Arrows win wars. Or at least keep wars from chewing on you personally.\"",
        "choices": [
          { "id": "open_shop", "label": "Browse arrows and gear.", "effects": [{ "type": "openShop", "shopId": "shop_fletcher" }] },
          { "id": "work_for_goods", "label": "Offer labour in exchange for arrows.", "effects": [{ "type": "openShopWork", "shopId": "shop_fletcher" }] }
        ]
      }
    }
  }
]

7) How the quests knit together into a coherent story (imaginative but logical)
The connective tissue (what the player gradually realizes)

At first, the city is simply under-supplied.

Then patterns emerge: missing crates, wrong ledgers, scraped bolts on dock grates, “official” stamps that aren’t.

The City Council doesn’t just want help — it wants proof, authorization, and quiet investigators who won’t cause panic.

The “special items” (sigils/shards) are not arbitrary currency: they are logistics control and magical infrastructure:

Sigils: authority + access (who can move where during a siege).

Ward shards: the crumbling magical defenses that keep monsters from simply climbing the walls at night.

The arc (beats that feel like escalating responsibility)

Earn trust by resupplying battlements and learning the city’s geography.

Gain access to shops and specialist work (work-for-gear).

Council deputizes you because they need deniable competence:

recover ward shards,

disrupt contraband that’s undermining supplies,

issue warrants and quietly check docks / drains.

Build the city’s readiness:

fuse ward-stones,

deliver timber,

keep food flowing,

and reduce enemy scouting pressure outside the walls.

Mass battle approaches: your actions determine:

how strong the gate wards are,

how many archers have arrows,

whether the enemy has inside help.

8) Next “carry on” additions I can output immediately after this

To keep momentum, the next batch should be:

Add the missing cooldown jobs (job_smith_nails, job_apoth_sort, job_fletcher_string) to jobs.json.

Add a Docks Contraband encounter chain that rewards ward_shard and sets docks_contraband_disrupted=true.

Add Council Reward choice node: Ironluck Charm vs Ring of Quickstep.

Add pre-battle readiness flags:

barricades_ready (timber deliveries + smith nails)

stores_secured (grain + apothecary + rat cellar + contraband disrupted)

gate_warded (ward-stone fused + installed)

Add Battle-at-the-Gates prologue pages (archer positions, sortie option, triage).

If you want me to keep everything in the same style as earlier, I’ll output the next batch as:

jobs_city_minor.json

areas_docks_contraband.json

areas_gate_prebattle.json

enemy_gate_skirmish.json

spells_battlefield.json (a couple of “siege utility” spells)

Just say “continue” and I’ll paste the next files.

continue
Thought for 37s

Here you go — next batch of ready-to-drop content files: minor repeatable shop jobs, a full Docks Contraband quest chain (council + warrant + sewer/drain tie-in), Council reward choice (magic item), readiness flags (barricades/stores/gate wards), and gate pre-battle + first probe skirmish pages with ranged retreat.

/content/jobs_city_minor.json
[
  {
    "id": "job_smith_nails",
    "name": "Blacksmith Shift: Sort Nails for Barricades",
    "giverNpcId": "npc_smith_harrow",
    "startAreaId": "c_blacksmith",
    "objective": { "type": "simpleTask" },
    "rewards": { "gold": 4, "xp": 10, "items": [{ "itemId": "council_sigil_bronze", "qty": 1 }] },
    "cooldownMinutes": 35
  },
  {
    "id": "job_apoth_sort",
    "name": "Apothecary Shift: Sort Infirmary Herbs",
    "giverNpcId": "npc_apothecary_moss",
    "startAreaId": "c_apothecary",
    "objective": { "type": "simpleTask" },
    "rewards": { "gold": 3, "xp": 12, "items": [{ "itemId": "ration_pack", "qty": 1 }] },
    "cooldownMinutes": 40
  },
  {
    "id": "job_fletcher_string",
    "name": "Fletcher Shift: Wax and Twist Bowstrings",
    "giverNpcId": "npc_fletcher_ren",
    "startAreaId": "c_fletcher",
    "objective": { "type": "simpleTask" },
    "rewards": { "gold": 3, "xp": 10, "items": [{ "itemId": "arrow_bundle", "qty": 1 }] },
    "cooldownMinutes": 35
  }
]

/content/npcs_council_and_shops.json
[
  {
    "id": "npc_council_clerk_elm",
    "name": "Clerk Elm",
    "role": "Council Clerk",
    "portraitPrompt": "fantasy character portrait, city clerk in plain robes, sharp eyes, wax seals and ledgers, painterly, no text",
    "dialogue": {
      "greeting": "Speak clearly. The city has no patience left for confusion.",
      "nodes": [
        {
          "id": "clerks_desk",
          "text": "We issue writs, warrants, and consequences.",
          "choices": [
            {
              "label": "Exchange 5 Bronze Sigils for 1 Silver Sigil.",
              "requirements": [{ "type": "hasItem", "itemId": "council_sigil_bronze", "qty": 5 }],
              "effects": [{ "type": "craft", "recipeId": "trade_bronze_to_silver" }]
            },
            {
              "label": "Issue a Council Warrant (costs 2 Silver Sigils).",
              "requirements": [{ "type": "hasItem", "itemId": "council_sigil_silver", "qty": 2 }],
              "effects": [{ "type": "craft", "recipeId": "issue_council_warrant" }]
            }
          ]
        }
      ]
    }
  },
  {
    "id": "npc_councilor_vayne",
    "name": "Councilor Vayne",
    "role": "Councilor of Supply & Defense",
    "portraitPrompt": "fantasy character portrait, severe councilor with signet ring, city banners behind, calculating expression, painterly, no text",
    "dialogue": {
      "greeting": "You’ve been seen. That is not the same as being trusted — yet.",
      "nodes": [
        {
          "id": "vayne_work",
          "text": "Our enemies probe the walls, but our true weakness is missing supplies and quiet betrayal.",
          "choices": [
            {
              "label": "Accept: Disrupt contraband at the docks (low-level combat likely).",
              "requirements": [{ "type": "flagEquals", "key": "council_introduced", "value": true }, { "type": "notFlag", "key": "council_job_docks_taken" }],
              "effects": [
                { "type": "flag", "key": "council_job_docks_taken", "value": true },
                { "type": "startJob", "jobId": "council_job_docks_raid" }
              ]
            },
            {
              "label": "Report: Contraband disrupted. Request your reward.",
              "requirements": [{ "type": "flagEquals", "key": "docks_contraband_disrupted", "value": true }, { "type": "notFlag", "key": "council_reward_claimed" }],
              "effects": [
                { "type": "flag", "key": "council_reward_ready", "value": true }
              ]
            }
          ]
        },
        {
          "id": "reward_choice",
          "text": "You’ve proven useful. Choose something that keeps you useful.",
          "choices": [
            {
              "label": "Take the Ironluck Charm (+1 Luck).",
              "requirements": [{ "type": "flagEquals", "key": "council_reward_ready", "value": true }, { "type": "notFlag", "key": "council_reward_claimed" }],
              "effects": [
                { "type": "addItem", "itemId": "minor_charm_ironluck", "qty": 1 },
                { "type": "addItem", "itemId": "council_sigil_silver", "qty": 1 },
                { "type": "flag", "key": "council_reward_claimed", "value": true },
                { "type": "flag", "key": "council_trusted", "value": true }
              ]
            },
            {
              "label": "Take the Ring of Quickstep (+1 movement distance in pursuits).",
              "requirements": [{ "type": "flagEquals", "key": "council_reward_ready", "value": true }, { "type": "notFlag", "key": "council_reward_claimed" }],
              "effects": [
                { "type": "addItem", "itemId": "ring_quickstep", "qty": 1 },
                { "type": "addItem", "itemId": "council_sigil_silver", "qty": 1 },
                { "type": "flag", "key": "council_reward_claimed", "value": true },
                { "type": "flag", "key": "council_trusted", "value": true }
              ]
            }
          ]
        }
      ]
    }
  },
  {
    "id": "npc_smith_harrow",
    "name": "Harrow the Smith",
    "role": "Blacksmith",
    "portraitPrompt": "fantasy character portrait, blacksmith with soot and sparks, heavy apron, stern eyes, painterly, no text",
    "dialogue": { "greeting": "If you can’t pay, you can sweat." }
  },
  {
    "id": "npc_apothecary_moss",
    "name": "Moss the Apothecary",
    "role": "Apothecary",
    "portraitPrompt": "fantasy character portrait, apothecary with herb-stained hands, shelves of bottles, watchful gaze, painterly, no text",
    "dialogue": { "greeting": "Everything heals or harms — sometimes both." }
  },
  {
    "id": "npc_fletcher_ren",
    "name": "Ren the Fletcher",
    "role": "Fletcher",
    "portraitPrompt": "fantasy character portrait, fletcher artisan with feathers and wax, calm focus, painterly, no text",
    "dialogue": { "greeting": "Keep your bow dry. Keep your hands steady." }
  }
]

/content/enemies_gate_skirmish.json
[
  {
    "id": "goblin_sapper",
    "name": "Goblin Sapper",
    "kind": "humanoid",
    "skill": 7,
    "stamina": 8,
    "meta": { "special": "bomb" },
    "loot": [{ "itemId": "gold_coin", "min": 0, "max": 6 }],
    "tags": ["goblin", "sapper"]
  },
  {
    "id": "goblin_probe_group",
    "name": "Goblin Probe",
    "kind": "group",
    "members": [
      { "enemyId": "goblin_raider", "count": 2 },
      { "enemyId": "goblin_bowman", "count": 1 }
    ],
    "meta": { "pursuit": { "speed": 1, "startDistance": 3, "morale": 7 } },
    "tags": ["goblin", "group", "pursuit"]
  },
  {
    "id": "goblin_sapper_team",
    "name": "Sapper Team",
    "kind": "group",
    "members": [
      { "enemyId": "goblin_sapper", "count": 1 },
      { "enemyId": "goblin_scout", "count": 2 }
    ],
    "meta": { "pursuit": { "speed": 1, "startDistance": 2, "morale": 8 } },
    "tags": ["goblin", "group", "pursuit"]
  }
]

/content/spells_battlefield.json
[
  {
    "id": "flare_signal",
    "name": "Flare Signal",
    "cost": 2,
    "description": "A bright flare that warns allies and rattles foes.",
    "effects": [
      { "type": "flag", "key": "flare_used_recently", "value": true },
      { "type": "threatMoraleDelta", "amount": -1 }
    ]
  },
  {
    "id": "stonebind",
    "name": "Stonebind",
    "cost": 2,
    "description": "Stone grips ankles like hands. Slows an approaching threat.",
    "effects": [
      { "type": "threatSpeedDelta", "amount": -1, "durationTurns": 2 }
    ]
  },
  {
    "id": "wardseal",
    "name": "Wardseal",
    "cost": 3,
    "description": "Reinforces a ward-stone or barrier for a short time.",
    "effects": [
      { "type": "flag", "key": "wardseal_active", "value": true },
      { "type": "tempArmor", "amount": 1, "durationTurns": 3 }
    ]
  }
]

/content/areas_docks_contraband.json
[
  {
    "id": "c_tarpaulin_row",
    "title": "Tarpaulin Row",
    "x": 6, "y": 1, "floorId": "city",
    "tileStyle": "docks",
    "cover": "low",
    "blocksLOS": false,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, dockside tarpaulins over crates, rain, lantern reflections, suspicious figures, cinematic, no text",
    "description": "Tarps flap over stacked crates. A gull shrieks, and somewhere a chain rattles — too quick to be the tide.\n\nThis is where supplies vanish before they ever reach the walls.",
    "exits": { "w": "c_docks_ward", "s": "c_quay_steps" },
    "actionsAvailable": {
      "investigate": {
        "text": "You spot a crate brand that doesn’t match any city ledger mark.",
        "choices": [
          {
            "id": "search_with_warrant",
            "label": "Search the crates using a Council Warrant.",
            "requirements": [{ "type": "hasItem", "itemId": "council_warrant", "qty": 1 }],
            "effects": [
              { "type": "flag", "key": "contraband_found", "value": true }
            ],
            "goToAreaId": "c_contraband_cache"
          },
          {
            "id": "sneak_and_peek",
            "label": "Sneak closer and listen.",
            "effects": [
              { "type": "flag", "key": "contraband_sneak", "value": true }
            ],
            "goToAreaId": "c_quay_steps"
          }
        ]
      }
    }
  },

  {
    "id": "c_quay_steps",
    "title": "Quay Steps",
    "x": 6, "y": 0, "floorId": "city",
    "tileStyle": "docks",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, stone quay steps descending to dark water, lantern on hook, hidden nook, cinematic, no text",
    "description": "Stone steps descend to black water. Here the dock noise thins — perfect for whispers.\n\nYou hear it: ‘…move it through the grate. Tonight.’",
    "exits": { "n": "c_tarpaulin_row", "w": "c_docks_ward", "s": "c_drain_grate" },
    "choices": [
      {
        "id": "set_ambush",
        "label": "Set an ambush and confront them.",
        "effects": [
          {
            "type": "startThreat",
            "threat": {
              "threatId": "t_smuggler_cell_docks",
              "enemyGroupId": "sewer_smuggler_cell",
              "distance": 2,
              "direction": "n",
              "speed": 1,
              "targetAreaId": "c_quay_steps",
              "hazards": []
            }
          }
        ],
        "goToAreaId": "c_docks_standoff"
      },
      {
        "id": "follow_to_grate",
        "label": "Follow at a distance toward the drain grate.",
        "effects": [{ "type": "flag", "key": "followed_to_grate", "value": true }],
        "goToAreaId": "c_drain_grate"
      }
    ]
  },

  {
    "id": "c_docks_standoff",
    "title": "Dockside Standoff",
    "x": 6, "y": -1, "floorId": "city",
    "tileStyle": "docks",
    "cover": "low",
    "blocksLOS": false,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, tense dock standoff, hooded smugglers, one raising a bow, rain and lanterns, cinematic, no text",
    "description": "Hooded figures freeze. One’s hand goes to a bow. Another shifts a crate as if it weighs nothing.\n\nThey’re ready to run — or kill.",
    "choices": [
      {
        "id": "shoot",
        "label": "Open fire with my bow.",
        "requirements": [
          { "type": "hasItem", "itemId": "training_bow", "qty": 1 },
          { "type": "hasAmmo", "ammoType": "arrow", "minCount": 1 }
        ],
        "effects": [
          { "type": "shootThreat", "threatId": "t_smuggler_cell_docks", "ammoType": "arrow", "ammoToConsume": 1, "damage": { "mode": "roll", "expr": "1d6" } },
          { "type": "enemyReturnFireIfInRange", "threatId": "t_smuggler_cell_docks" },
          { "type": "advanceThreat", "threatId": "t_smuggler_cell_docks" }
        ]
      },
      {
        "id": "flare",
        "label": "Cast Flare Signal (warn nearby guards).",
        "requirements": [{ "type": "knowsSpell", "spellId": "flare_signal" }],
        "effects": [
          { "type": "castSpell", "spellId": "flare_signal" },
          { "type": "threatMoraleDelta", "threatId": "t_smuggler_cell_docks", "amount": -2 }
        ]
      },
      {
        "id": "force_fight",
        "label": "Close in and fight.",
        "effects": [{ "type": "forceCombatFromThreat", "threatId": "t_smuggler_cell_docks" }]
      },
      {
        "id": "retreat",
        "label": "Retreat west to the Docks Ward and ready my bow.",
        "effects": [
          { "type": "move", "to": "c_docks_ward" },
          { "type": "threatRetreat", "threatId": "t_smuggler_cell_docks", "distanceDelta": 1 },
          { "type": "flag", "key": "ready_ranged", "value": true }
        ],
        "goToAreaId": "c_docks_ward"
      }
    ],
    "exits": { "n": "c_quay_steps", "w": "c_docks_ward" }
  },

  {
    "id": "c_contraband_cache",
    "title": "Contraband Cache",
    "x": 7, "y": 1, "floorId": "city",
    "tileStyle": "warehouse",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, hidden dock warehouse cache, cracked crate revealing rune-metal shards, lantern glow, cinematic, no text",
    "description": "Inside the crate: rune-metal shards wrapped in oiled cloth. Not food. Not arrows.\n\nWard shards — the kind used to reinforce gate wards.\n\nSomeone is stealing the city’s protection.",
    "exits": { "w": "c_tarpaulin_row" },
    "choices": [
      {
        "id": "take_shards",
        "label": "Secure the ward shards and mark the cache.",
        "effects": [
          { "type": "addItem", "itemId": "ward_shard", "qty": 3 },
          { "type": "addItem", "itemId": "council_sigil_bronze", "qty": 2 },
          { "type": "addXP", "amount": 22 },
          { "type": "flag", "key": "docks_contraband_disrupted", "value": true },
          { "type": "completeJob", "jobId": "council_job_docks_raid" }
        ]
      },
      {
        "id": "follow_trail",
        "label": "Follow the trail to the drain grate (they moved more than this).",
        "effects": [{ "type": "flag", "key": "sewer_trail_from_docks", "value": true }],
        "goToAreaId": "c_drain_grate"
      }
    ]
  }
]

/content/areas_gate_prebattle.json
[
  {
    "id": "c_gate_inner_yard",
    "title": "Inner Gate Yard",
    "x": 0, "y": -1, "floorId": "city",
    "tileStyle": "gate_yard",
    "cover": "low",
    "blocksLOS": false,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, inner gate yard with barricade materials, soldiers, carts, tense preparation, cinematic, no text",
    "description": "Carts creak. Ropes tighten. Soldiers hammer planks into place. The gate is a throat — and the city is swallowing fear.\n\nA captain shouts: \"Timber here! Grain there! Arrows to the parapet!\"",
    "exits": { "n": "a_outer_gate", "e": "c_barricade_line", "w": "c_granary_checkpoint", "s": "c_parapet_post" },
    "actionsAvailable": {
      "talk": {
        "text": "A captain eyes your gear. \"If you’ve got council backing, you’re not just a runner — you’re a fix.\"",
        "choices": [
          {
            "id": "unlock_prebattle",
            "label": "Offer help to finalize defenses (pre-battle readiness).",
            "requirements": [{ "type": "flagEquals", "key": "council_trusted", "value": true }],
            "effects": [{ "type": "flag", "key": "prebattle_active", "value": true }]
          }
        ]
      }
    }
  },

  {
    "id": "c_barricade_line",
    "title": "Barricade Line",
    "x": 1, "y": -1, "floorId": "city",
    "tileStyle": "barricade",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, barricade line being built, stacked timber, nails, engineers, torchlight, cinematic, no text",
    "description": "Timber stacks become walls in fast hands. Nail buckets clatter. Engineers argue angles like it’s religion.\n\nThis line will decide how much blood reaches the gate.",
    "exits": { "w": "c_gate_inner_yard" },
    "actionsAvailable": {
      "take": {
        "text": "You can contribute materials directly.",
        "choices": [
          {
            "id": "deliver_timber",
            "label": "Deliver 1 timber bundle to the barricade teams.",
            "requirements": [{ "type": "hasItem", "itemId": "timber_bundle", "qty": 1 }],
            "effects": [
              { "type": "removeItem", "itemId": "timber_bundle", "qty": 1 },
              { "type": "addXP", "amount": 16 },
              { "type": "addGold", "amount": 6 },
              { "type": "flag", "key": "barricades_ready", "value": true }
            ]
          }
        ]
      },
      "investigate": {
        "text": "A foreman points at empty nail buckets. \"We’re building walls with wishes at this rate.\"",
        "choices": [
          {
            "id": "nail_help",
            "label": "Offer to run nail duty at the blacksmith.",
            "effects": [{ "type": "flag", "key": "needs_nails", "value": true }]
          }
        ]
      }
    }
  },

  {
    "id": "c_granary_checkpoint",
    "title": "Granary Checkpoint",
    "x": -1, "y": -1, "floorId": "city",
    "tileStyle": "warehouse",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, granary checkpoint with grain sacks, armed clerks, ration ledgers, cinematic, no text",
    "description": "Clerks with spears guard sacks like jewels. Hunger makes thieves of honest folk.\n\nThe city’s stomach must be full before its fist can swing.",
    "exits": { "e": "c_gate_inner_yard", "n": "a_grain_store" },
    "actionsAvailable": {
      "talk": {
        "text": "\"If you’ve brought grain, stack it. If you’ve brought trouble, sign the ledger first.\"",
        "choices": [
          {
            "id": "deliver_grain",
            "label": "Deliver 1 sack of grain to the stores.",
            "requirements": [{ "type": "hasItem", "itemId": "farm_sack", "qty": 1 }],
            "effects": [
              { "type": "removeItem", "itemId": "farm_sack", "qty": 1 },
              { "type": "addXP", "amount": 14 },
              { "type": "addGold", "amount": 5 },
              { "type": "flag", "key": "stores_secured", "value": true }
            ]
          }
        ]
      }
    }
  },

  {
    "id": "c_ward_installation",
    "title": "Ward Installation Plinth",
    "x": 0, "y": -2, "floorId": "city",
    "tileStyle": "ward_site",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, rune plinth near the gate, ward-stone socket, mage-priest, glowing sigils, cinematic, no text",
    "description": "A rune plinth stands near the gate, its socket empty. A mage-priest wipes rain from a glyph and exhales.\n\n\"Without a ward-stone,\" they say, \"the gate is just a door.\"",
    "exits": { "n": "c_gate_inner_yard" },
    "actionsAvailable": {
      "open": {
        "text": "The plinth accepts a ward-stone.",
        "choices": [
          {
            "id": "install_ward",
            "label": "Install a ward-stone into the plinth.",
            "requirements": [{ "type": "hasItem", "itemId": "ward_stone", "qty": 1 }],
            "effects": [
              { "type": "removeItem", "itemId": "ward_stone", "qty": 1 },
              { "type": "addXP", "amount": 22 },
              { "type": "flag", "key": "gate_warded", "value": true }
            ]
          },
          {
            "id": "cast_wardseal",
            "label": "Cast Wardseal to strengthen the plinth temporarily.",
            "requirements": [{ "type": "knowsSpell", "spellId": "wardseal" }],
            "effects": [{ "type": "castSpell", "spellId": "wardseal" }]
          }
        ]
      }
    }
  },

  {
    "id": "c_parapet_post",
    "title": "Parapet Post",
    "x": 0, "y": -3, "floorId": "city",
    "tileStyle": "battlements",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, parapet post overlooking fields, archers, arrow barrels, stormy horizon, cinematic, no text",
    "description": "You look out over wet fields toward the tree line. Somewhere out there, the enemy counts the same distance.\n\nA sergeant points to empty arrow barrels. \"If we run dry, we die.\"",
    "exits": { "n": "c_gate_inner_yard" },
    "actionsAvailable": {
      "take": {
        "text": "You can deliver arrows here to stock the parapet.",
        "choices": [
          {
            "id": "deliver_arrows",
            "label": "Deliver 1 bundle of arrows to the parapet barrels.",
            "requirements": [{ "type": "hasItem", "itemId": "arrow_bundle", "qty": 1 }],
            "effects": [
              { "type": "removeItem", "itemId": "arrow_bundle", "qty": 1 },
              { "type": "addXP", "amount": 12 },
              { "type": "flag", "key": "parapet_stocked", "value": true }
            ]
          },
          {
            "id": "finalize_readiness",
            "label": "Report readiness to the captain (if key tasks are done).",
            "requirements": [
              { "type": "flagEquals", "key": "barricades_ready", "value": true },
              { "type": "flagEquals", "key": "stores_secured", "value": true },
              { "type": "flagEquals", "key": "gate_warded", "value": true }
            ],
            "effects": [
              { "type": "flag", "key": "city_battle_ready", "value": true }
            ],
            "goToAreaId": "c_gate_inner_yard"
          }
        ]
      }
    }
  }
]

/content/areas_gate_probe_skirmish.json
[
  {
    "id": "b_gate_approach",
    "title": "Gate Approach Road",
    "x": 0, "y": -4, "floorId": "outside",
    "tileStyle": "road",
    "cover": "none",
    "blocksLOS": false,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, road facing the city gate from outside, muddy ruts, distant barricades, storm clouds, cinematic, no text",
    "description": "The road outside the walls is a wound in the earth. From here, you can see the gate’s outline — and imagine it broken.\n\nMovement flickers at the far field line.",
    "exits": { "n": "a_outer_gate", "s": "b_farm_road_edge" },
    "choices": [
      {
        "id": "start_probe",
        "label": "Advance cautiously toward the field line.",
        "effects": [
          {
            "type": "startThreat",
            "threat": {
              "threatId": "t_goblin_probe_01",
              "enemyGroupId": "goblin_probe_group",
              "distance": 3,
              "direction": "s",
              "speed": 1,
              "targetAreaId": "b_gate_approach",
              "hazards": []
            }
          }
        ],
        "goToAreaId": "b_probe_contact"
      }
    ]
  },

  {
    "id": "b_probe_contact",
    "title": "Field Line: Goblin Probe",
    "x": 0, "y": -5, "floorId": "outside",
    "tileStyle": "field",
    "cover": "low",
    "blocksLOS": false,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, field line with goblin silhouettes and bows, tension, rain, cinematic, no text",
    "description": "A goblin probe spreads out like stains in the grass. One raises a horn — another nocks an arrow.\n\nIf this is only a probe, the real wave is close behind.",
    "exits": { "n": "b_gate_approach", "w": "b_ditch_path", "e": "b_timber_track" },
    "choices": [
      {
        "id": "shoot",
        "label": "Open fire with my bow.",
        "requirements": [
          { "type": "hasItem", "itemId": "training_bow", "qty": 1 },
          { "type": "hasAmmo", "ammoType": "arrow", "minCount": 1 }
        ],
        "effects": [
          { "type": "shootThreat", "threatId": "t_goblin_probe_01", "ammoType": "arrow", "ammoToConsume": 1, "damage": { "mode": "roll", "expr": "1d6" } },
          { "type": "enemyReturnFireIfInRange", "threatId": "t_goblin_probe_01" },
          { "type": "advanceThreat", "threatId": "t_goblin_probe_01" }
        ]
      },
      {
        "id": "spikes",
        "label": "Set my spikes in front of me.",
        "requirements": [{ "type": "hasItem", "itemId": "spike_bundle", "qty": 1 }],
        "effects": [
          { "type": "removeItem", "itemId": "spike_bundle", "qty": 1 },
          { "type": "placeHazard", "threatId": "t_goblin_probe_01", "hazard": { "kind": "spikes", "damage": 3, "triggerAtDistance": 1 } },
          { "type": "advanceThreat", "threatId": "t_goblin_probe_01" }
        ]
      },
      {
        "id": "stonebind",
        "label": "Cast Stonebind to slow them.",
        "requirements": [{ "type": "knowsSpell", "spellId": "stonebind" }],
        "effects": [
          { "type": "castSpell", "spellId": "stonebind", "threatId": "t_goblin_probe_01" },
          { "type": "advanceThreat", "threatId": "t_goblin_probe_01" }
        ]
      },
      {
        "id": "retreat_north",
        "label": "Retreat north toward the gate and ready bow.",
        "effects": [
          { "type": "move", "to": "b_gate_approach" },
          { "type": "threatRetreat", "threatId": "t_goblin_probe_01", "distanceDelta": 1 },
          { "type": "flag", "key": "ready_ranged", "value": true }
        ],
        "goToAreaId": "b_gate_approach"
      },
      {
        "id": "retreat_west",
        "label": "Retreat west into the ditch for cover.",
        "effects": [
          { "type": "move", "to": "b_ditch_path" },
          { "type": "threatRetreat", "threatId": "t_goblin_probe_01", "distanceDelta": 1 },
          { "type": "flag", "key": "ready_ranged", "value": true }
        ],
        "goToAreaId": "b_ditch_path"
      },
      {
        "id": "force_fight",
        "label": "Stand my ground and fight.",
        "effects": [{ "type": "forceCombatFromThreat", "threatId": "t_goblin_probe_01" }]
      }
    ]
  }
]

Next file set (I’ll continue immediately whenever you say)

Sealed gate sabotage arc (goblin sappers attempt a breach; you intercept supply powder kegs; council warrant used to arrest a “respectable” dock factor).

Battle at the gates (Act I climax) as 8–12 pages: hold points, triage, retreat choices, and outcomes that carry forward.

A proper “special-item exchange chain” where sigils + shards unlock a unique key item (e.g., “Gatewarden’s Seal”) that later grants access to the underground fortress route.

Say continue again and I’ll paste that next batch.

continue
/content/items_sabotage.json
[
  {
    "id": "powder_keg",
    "name": "Black Powder Keg",
    "type": "quest",
    "stackable": false,
    "value": 0,
    "description": "A sealed keg marked for the siege workshop. If this explodes in the wrong place, it won’t matter who wins the war."
  },
  {
    "id": "fuse_coil",
    "name": "Fuse Coil",
    "type": "quest",
    "stackable": true,
    "value": 0,
    "description": "Slow-burning fuse. Smugglers love it. Sappers worship it."
  },
  {
    "id": "dock_ledger_page",
    "name": "Dock Ledger Page",
    "type": "quest",
    "stackable": true,
    "value": 0,
    "description": "A torn page listing ‘missing’ crates. The handwriting is careful. The numbers are not."
  },
  {
    "id": "gate_key_fragment",
    "name": "Gate Key Fragment",
    "type": "quest",
    "stackable": true,
    "value": 0,
    "description": "A shard of an old key. It fits nothing alone — but it remembers a lock."
  },
  {
    "id": "gatewarden_seal",
    "name": "Gatewarden’s Seal",
    "type": "quest",
    "stackable": false,
    "value": 0,
    "description": "A council-and-ward fused seal granting emergency access to restricted gate mechanisms and inner tunnels."
  },
  {
    "id": "water_skin",
    "name": "Water Skin",
    "type": "tool",
    "stackable": false,
    "value": 10,
    "description": "A leather skin of clean water. Useful for travel, or ruining a fuse at the right moment."
  },
  {
    "id": "smoke_pellet",
    "name": "Smoke Pellet",
    "type": "tool",
    "stackable": true,
    "value": 14,
    "meta": { "breakLOS": 2 },
    "description": "A compressed pellet that blooms into choking smoke. Perfect for escapes and ambushes."
  }
]

/content/recipes_exchange_chain.json
[
  {
    "id": "bind_gate_key",
    "name": "Bind Gate Key",
    "inputs": [
      { "itemId": "gate_key_fragment", "qty": 3 },
      { "itemId": "council_sigil_silver", "qty": 1 }
    ],
    "outputs": [{ "itemId": "gatewarden_seal", "qty": 1 }],
    "description": "Three fragments, one sigil, and a council signature. It becomes less a key and more a command."
  },
  {
    "id": "seal_from_ledger",
    "name": "Forge Emergency Seal",
    "requiresTool": "oil_lamp",
    "inputs": [
      { "itemId": "ward_stone", "qty": 1 },
      { "itemId": "dock_ledger_page", "qty": 2 },
      { "itemId": "council_sigil_silver", "qty": 1 }
    ],
    "outputs": [{ "itemId": "gatewarden_seal", "qty": 1 }],
    "description": "Proof of betrayal, proof of magic, proof of authority. Together, they open what should remain shut."
  }
]

/content/enemies_sabotage.json
[
  {
    "id": "city_saboteur",
    "name": "City Saboteur",
    "kind": "humanoid",
    "skill": 8,
    "stamina": 7,
    "meta": { "ranged": false, "special": "ignite_fuse" },
    "loot": [
      { "itemId": "fuse_coil", "min": 1, "max": 2 },
      { "itemId": "dock_ledger_page", "min": 0, "max": 1 },
      { "itemId": "gold_coin", "min": 1, "max": 8 }
    ],
    "tags": ["human", "saboteur"]
  },
  {
    "id": "goblin_sapper",
    "name": "Goblin Sapper",
    "kind": "humanoid",
    "skill": 7,
    "stamina": 8,
    "meta": { "special": "bomb" },
    "loot": [
      { "itemId": "fuse_coil", "min": 0, "max": 1 },
      { "itemId": "gold_coin", "min": 0, "max": 6 }
    ],
    "tags": ["goblin", "sapper"]
  },
  {
    "id": "goblin_sapper_team",
    "name": "Sapper Team",
    "kind": "group",
    "members": [
      { "enemyId": "goblin_sapper", "count": 1 },
      { "enemyId": "goblin_scout", "count": 2 }
    ],
    "meta": { "pursuit": { "speed": 1, "startDistance": 2, "morale": 8 } },
    "tags": ["goblin", "group", "pursuit"]
  },
  {
    "id": "gate_breach_probe",
    "name": "Breach Probe",
    "kind": "group",
    "members": [
      { "enemyId": "goblin_raider", "count": 3 },
      { "enemyId": "goblin_bowman", "count": 1 }
    ],
    "meta": { "pursuit": { "speed": 1, "startDistance": 3, "morale": 8 } },
    "tags": ["goblin", "group", "pursuit"]
  }
]

/content/npcs_gate_sabotage.json
[
  {
    "id": "npc_gatewarden_holt",
    "name": "Gatewarden Holt",
    "role": "Gate Mechanisms & Keys",
    "portraitPrompt": "fantasy character portrait, weathered gatewarden with keys and iron gauntlet, torchlight, grim but steady, painterly, no text",
    "dialogue": {
      "greeting": "The gate doesn’t care who you are. It cares what you can prove.",
      "nodes": [
        {
          "id": "gatewarden_main",
          "text": "If something’s wrong, it’ll be wrong at the worst moment. That’s how gates work.",
          "choices": [
            {
              "label": "Show the Gatewarden’s Seal.",
              "requirements": [{ "type": "hasItem", "itemId": "gatewarden_seal", "qty": 1 }],
              "effects": [{ "type": "flag", "key": "gatewarden_access", "value": true }]
            },
            {
              "label": "Request access to the inner mechanisms (emergency).",
              "requirements": [{ "type": "flagEquals", "key": "gatewarden_access", "value": true }],
              "effects": [{ "type": "flag", "key": "inner_mechanism_access", "value": true }]
            }
          ]
        }
      ]
    }
  },
  {
    "id": "npc_dock_factor_merris",
    "name": "Factor Merris",
    "role": "Dock Factor (Respectable, Dangerous)",
    "portraitPrompt": "fantasy character portrait, well-dressed dock factor with ledger, polite smile, cold eyes, rainy dock lanterns, painterly, no text",
    "dialogue": {
      "greeting": "Supplies are complex. Rumours are simple. Which do you trade in?",
      "nodes": [
        {
          "id": "factor_deflect",
          "text": "The docks are chaos. Losses happen. Accusations happen too. Usually from fools.",
          "choices": [
            {
              "label": "Present a Council Warrant and demand the ledger.",
              "requirements": [{ "type": "hasItem", "itemId": "council_warrant", "qty": 1 }],
              "effects": [
                { "type": "flag", "key": "factor_confronted", "value": true }
              ]
            },
            {
              "label": "If he resists, arrest him (guards will be called).",
              "requirements": [{ "type": "flagEquals", "key": "factor_confronted", "value": true }],
              "effects": [
                { "type": "flag", "key": "factor_arrested", "value": true },
                { "type": "addItem", "itemId": "dock_ledger_page", "qty": 2 },
                { "type": "addXP", "amount": 24 }
              ]
            }
          ]
        }
      ]
    }
  },
  {
    "id": "npc_captain_roth",
    "name": "Captain Roth",
    "role": "Gate Yard Captain",
    "portraitPrompt": "fantasy character portrait, battle-worn city captain with rain cloak and scar, tense jaw, banners behind, painterly, no text",
    "dialogue": {
      "greeting": "If you’re here, you’re either brave, useful, or lost. Pick one fast.",
      "nodes": [
        {
          "id": "roth_ready",
          "text": "We’re minutes from a bad day. Tell me what you’ve fixed.",
          "choices": [
            {
              "label": "Report the contraband disruption and sabotage evidence.",
              "requirements": [{ "type": "flagEquals", "key": "docks_contraband_disrupted", "value": true }],
              "effects": [{ "type": "flag", "key": "roth_informed_contraband", "value": true }]
            },
            {
              "label": "Report the docks factor arrest.",
              "requirements": [{ "type": "flagEquals", "key": "factor_arrested", "value": true }],
              "effects": [{ "type": "flag", "key": "roth_informed_factor", "value": true }]
            },
            {
              "label": "Begin the battle sequence (if the city is battle-ready).",
              "requirements": [{ "type": "flagEquals", "key": "city_battle_ready", "value": true }],
              "effects": [{ "type": "flag", "key": "battle_act1_started", "value": true }],
              "goToAreaId": "e_battle_horns"
            }
          ]
        }
      ]
    }
  }
]

/content/jobs_sabotage_and_battle.json
[
  {
    "id": "council_job_powder_security",
    "name": "Secure the Powder Kegs",
    "giverNpcId": "npc_councilor_vayne",
    "startAreaId": "c_council_hall",
    "objective": { "type": "setFlag", "key": "powder_secured", "value": true },
    "grantsOnStart": [],
    "rewards": { "gold": 6, "xp": 24, "items": [{ "itemId": "council_sigil_bronze", "qty": 2 }] },
    "cooldownMinutes": 99999
  },
  {
    "id": "council_job_arrest_factor",
    "name": "Execute Warrant: Dock Factor",
    "giverNpcId": "npc_council_clerk_elm",
    "startAreaId": "c_council_hall",
    "objective": { "type": "setFlag", "key": "factor_arrested", "value": true },
    "grantsOnStart": [],
    "rewards": { "gold": 0, "xp": 26, "items": [{ "itemId": "council_sigil_silver", "qty": 1 }] },
    "cooldownMinutes": 99999
  },
  {
    "id": "battle_job_hold_barricade",
    "name": "Hold the Barricade Line",
    "giverNpcId": "npc_captain_roth",
    "startAreaId": "c_gate_inner_yard",
    "objective": { "type": "setFlag", "key": "barricade_held", "value": true },
    "grantsOnStart": [],
    "rewards": { "gold": 0, "xp": 35, "items": [{ "itemId": "council_sigil_silver", "qty": 1 }] },
    "cooldownMinutes": 99999
  }
]

/content/areas_sabotage_arc.json
[
  {
    "id": "c_powder_magazine",
    "title": "Powder Magazine",
    "x": 4, "y": 0, "floorId": "city",
    "tileStyle": "warehouse",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, guarded powder magazine doors, warning sigils, rain, torchlight, cinematic, no text",
    "description": "A thick door, two locks, and a guard who looks like he sleeps with his spear.\n\nA sign reads: NO OPEN FLAME.\n\nYou notice: someone has scraped wax from a seal recently.",
    "exits": { "e": "c_siege_workshop", "w": "c_gate_inner_yard" },
    "actionsAvailable": {
      "investigate": {
        "text": "The seal scrapings suggest tampering. If a fuse is already laid, the city might lose the gate before the enemy arrives.",
        "choices": [
          {
            "id": "enter_magazine",
            "label": "Enter and inspect the kegs.",
            "requirements": [{ "type": "flagEquals", "key": "council_trusted", "value": true }],
            "goToAreaId": "c_magazine_inside"
          }
        ]
      }
    }
  },

  {
    "id": "c_magazine_inside",
    "title": "Inside the Magazine",
    "x": 4, "y": -1, "floorId": "city",
    "tileStyle": "warehouse",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, powder kegs stacked in rows, dim lantern behind shuttered glass, suspicious shadow, cinematic, no text",
    "description": "Rows of kegs. The air is dry and wrong.\n\nA shadow moves between stacks — too careful for a guard.\n\nYou catch the faint smell of burned cord: fuse.",
    "exits": { "n": "c_powder_magazine" },
    "choices": [
      {
        "id": "confront",
        "label": "Step in and confront the intruder.",
        "effects": [
          { "type": "flag", "key": "intruder_spotted", "value": true }
        ],
        "goToAreaId": "c_magazine_standoff"
      },
      {
        "id": "snuff_fuse_water",
        "label": "Quietly soak the fuse with my water skin.",
        "requirements": [{ "type": "hasItem", "itemId": "water_skin", "qty": 1 }],
        "effects": [
          { "type": "flag", "key": "fuse_ruined", "value": true },
          { "type": "addXP", "amount": 14 }
        ],
        "goToAreaId": "c_magazine_standoff"
      }
    ]
  },

  {
    "id": "c_magazine_standoff",
    "title": "Magazine Standoff",
    "x": 4, "y": -2, "floorId": "city",
    "tileStyle": "warehouse",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, saboteur with flint and fuse near powder kegs, tense close quarters, cinematic, no text",
    "description": "The intruder turns — a city man, not a goblin. He holds flint and cord like holy objects.\n\n\"You shouldn’t be here,\" he says. \"This is bigger than you.\"",
    "choices": [
      {
        "id": "talk_down",
        "label": "Talk: \"Who’s paying you?\"",
        "effects": [{ "type": "flag", "key": "saboteur_parley", "value": true }],
        "goToAreaId": "c_magazine_parley"
      },
      {
        "id": "fight",
        "label": "Fight him before he lights anything.",
        "effects": [
          { "type": "startCombat", "enemyGroup": [{ "enemyId": "city_saboteur", "count": 1 }] }
        ],
        "goToAreaId": "c_magazine_after"
      },
      {
        "id": "smoke_escape",
        "label": "Throw a smoke pellet and rush him.",
        "requirements": [{ "type": "hasItem", "itemId": "smoke_pellet", "qty": 1 }],
        "effects": [
          { "type": "removeItem", "itemId": "smoke_pellet", "qty": 1 },
          { "type": "breakLOS", "durationTurns": 2 },
          { "type": "startCombat", "enemyGroup": [{ "enemyId": "city_saboteur", "count": 1 }] }
        ],
        "goToAreaId": "c_magazine_after"
      }
    ]
  },

  {
    "id": "c_magazine_parley",
    "title": "A Dirty Confession",
    "x": 4, "y": -3, "floorId": "city",
    "tileStyle": "warehouse",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, close-up parley in dim warehouse, nervous saboteur, fuse cord, cinematic, no text",
    "description": "His eyes flick to the kegs.\n\n\"It’s not the goblins,\" he whispers. \"It’s… a ‘friend of the docks’. They said the city must ‘change hands’ to survive. They said the gate wards are a lie.\"",
    "choices": [
      {
        "id": "accept_surrender",
        "label": "Accept his surrender and take evidence.",
        "effects": [
          { "type": "addItem", "itemId": "dock_ledger_page", "qty": 1 },
          { "type": "addItem", "itemId": "fuse_coil", "qty": 1 },
          { "type": "flag", "key": "powder_secured", "value": true },
          { "type": "addXP", "amount": 22 }
        ],
        "goToAreaId": "c_magazine_after"
      },
      {
        "id": "refuse",
        "label": "Refuse: strike and disable him.",
        "effects": [
          { "type": "startCombat", "enemyGroup": [{ "enemyId": "city_saboteur", "count": 1 }] }
        ],
        "goToAreaId": "c_magazine_after"
      }
    ]
  },

  {
    "id": "c_magazine_after",
    "title": "Secured Kegs",
    "x": 4, "y": -4, "floorId": "city",
    "tileStyle": "warehouse",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, sealed powder kegs with fresh wax seals, guards arriving, relief and tension, cinematic, no text",
    "description": "Guards arrive, breathless. You point to scraped seals, the fuse cord, the ledger page.\n\nThe captain’s messenger blanches. \"If this had gone off…\"\n\nIt didn’t. Not today.",
    "exits": { "n": "c_powder_magazine", "w": "c_gate_inner_yard" },
    "actionsAvailable": {
      "talk": {
        "text": "A guard captain nods grimly. \"Report this to the council. And don’t leave the gate yard once the horns start.\"",
        "choices": [
          {
            "id": "report_council",
            "label": "Report sabotage evidence to the council.",
            "requirements": [{ "type": "hasItem", "itemId": "dock_ledger_page", "qty": 1 }],
            "effects": [
              { "type": "flag", "key": "sabotage_evidence_reported", "value": true },
              { "type": "addItem", "itemId": "council_sigil_bronze", "qty": 2 }
            ]
          }
        ]
      }
    }
  },

  {
    "id": "c_dock_factor_office",
    "title": "Factor’s Office",
    "x": 7, "y": 2, "floorId": "city",
    "tileStyle": "office",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, dock office with ledgers, sealing wax, fine chair, rain at window, cinematic, no text",
    "description": "The office smells of wax, ink, and expensive soap. A man smiles like he’s never been hungry.\n\nFactor Merris stands behind a ledger stack as if it’s a fortress.",
    "exits": { "s": "c_tarpaulin_row" },
    "actionsAvailable": {
      "talk": {
        "text": "Merris’s smile is practiced. \"I’m very busy.\"",
        "choices": [
          {
            "id": "warrant",
            "label": "Present the Council Warrant.",
            "requirements": [{ "type": "hasItem", "itemId": "council_warrant", "qty": 1 }],
            "effects": [
              { "type": "flag", "key": "factor_confronted", "value": true }
            ],
            "goToAreaId": "c_factor_outcome"
          }
        ]
      }
    }
  },

  {
    "id": "c_factor_outcome",
    "title": "Warrant Executed",
    "x": 7, "y": 3, "floorId": "city",
    "tileStyle": "office",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, guards seizing ledgers, factor losing composure, wax seals, cinematic, no text",
    "description": "His composure fractures when the warrant seal catches the light.\n\n\"This is absurd—\" he begins.\n\nA guard’s hand closes on his shoulder. The ledger pages you take feel heavier than coin.",
    "exits": { "n": "c_dock_factor_office", "w": "c_docks_ward" },
    "choices": [
      {
        "id": "arrest",
        "label": "Arrest Merris and seize the ledger pages.",
        "effects": [
          { "type": "flag", "key": "factor_arrested", "value": true },
          { "type": "addItem", "itemId": "dock_ledger_page", "qty": 2 },
          { "type": "addXP", "amount": 26 }
        ],
        "goToAreaId": "c_docks_ward"
      }
    ]
  }
]

/content/areas_battle_act1.json
[
  {
    "id": "e_battle_horns",
    "title": "The Horns",
    "x": 0, "y": -10, "floorId": "battle",
    "tileStyle": "battle_start",
    "cover": "none",
    "blocksLOS": false,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, city gate in storm rain, horns blowing, soldiers rushing, cinematic, no text",
    "description": "A horn bellows from the wall — then another answers from the fields.\n\nRain turns to needles. Somewhere beyond sight, something huge moves.\n\nCaptain Roth shouts: \"TO YOUR POSTS! THIS IS IT!\"",
    "choices": [
      {
        "id": "to_barricade",
        "label": "Run to the barricade line.",
        "goToAreaId": "e_barricade_hold"
      },
      {
        "id": "to_ward_plinth",
        "label": "Run to the ward plinth near the gate.",
        "goToAreaId": "e_ward_crisis"
      },
      {
        "id": "to_parapet",
        "label": "Climb to the parapet post to support archers.",
        "goToAreaId": "e_parapet_volley"
      }
    ]
  },

  {
    "id": "e_barricade_hold",
    "title": "Hold the Barricade",
    "x": 1, "y": -10, "floorId": "battle",
    "tileStyle": "barricade",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, defenders behind barricade, goblins charging in rain, torchlight, cinematic, no text",
    "description": "The first wave hits like a thrown sack of knives.\n\nYour barricade teams look to you — not because you’re in charge, but because you’re still standing.",
    "choices": [
      {
        "id": "start_hold",
        "label": "Brace and hold.",
        "effects": [
          {
            "type": "startThreat",
            "threat": {
              "threatId": "t_breach_probe_01",
              "enemyGroupId": "gate_breach_probe",
              "distance": 3,
              "direction": "s",
              "speed": 1,
              "targetAreaId": "e_barricade_hold",
              "hazards": []
            }
          }
        ],
        "goToAreaId": "e_barricade_choices"
      }
    ]
  },

  {
    "id": "e_barricade_choices",
    "title": "Rain and Arrows",
    "x": 1, "y": -11, "floorId": "battle",
    "tileStyle": "barricade",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, close combat at barricade, arrows and shields, chaos, cinematic, no text",
    "description": "The enemy closes. Archers fire past your shoulder.\n\nIf your preparations mattered, you’ll feel it now.",
    "choices": [
      {
        "id": "volley_support",
        "label": "Support with bow fire (and retreat behind cover).",
        "requirements": [
          { "type": "hasItem", "itemId": "training_bow", "qty": 1 },
          { "type": "hasAmmo", "ammoType": "arrow", "minCount": 1 }
        ],
        "effects": [
          { "type": "shootThreat", "threatId": "t_breach_probe_01", "ammoType": "arrow", "ammoToConsume": 1, "damage": { "mode": "roll", "expr": "1d6" } },
          { "type": "enemyReturnFireIfInRange", "threatId": "t_breach_probe_01" },
          { "type": "advanceThreat", "threatId": "t_breach_probe_01" }
        ]
      },
      {
        "id": "spikes",
        "label": "Plant spikes at the choke point.",
        "requirements": [{ "type": "hasItem", "itemId": "spike_bundle", "qty": 1 }],
        "effects": [
          { "type": "removeItem", "itemId": "spike_bundle", "qty": 1 },
          { "type": "placeHazard", "threatId": "t_breach_probe_01", "hazard": { "kind": "spikes", "damage": 3, "triggerAtDistance": 1 } },
          { "type": "advanceThreat", "threatId": "t_breach_probe_01" }
        ]
      },
      {
        "id": "stonebind",
        "label": "Cast Stonebind to slow the wave.",
        "requirements": [{ "type": "knowsSpell", "spellId": "stonebind" }],
        "effects": [
          { "type": "castSpell", "spellId": "stonebind", "threatId": "t_breach_probe_01" },
          { "type": "advanceThreat", "threatId": "t_breach_probe_01" }
        ]
      },
      {
        "id": "force_fight",
        "label": "When they hit, fight.",
        "effects": [{ "type": "forceCombatFromThreat", "threatId": "t_breach_probe_01" }],
        "goToAreaId": "e_barricade_result"
      }
    ]
  },

  {
    "id": "e_barricade_result",
    "title": "The Line Holds",
    "x": 1, "y": -12, "floorId": "battle",
    "tileStyle": "barricade",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, defenders pushing back goblins, broken shields, victory moment, cinematic, no text",
    "description": "The first press breaks — not cleanly, not kindly — but it breaks.\n\nCaptain Roth’s runner screams over the din: \"SAPPERS! AT THE WARD PLINTH!\"",
    "effectsOnEnter": [
      { "type": "flag", "key": "barricade_held", "value": true },
      { "type": "addXP", "amount": 20 }
    ],
    "choices": [
      {
        "id": "to_ward",
        "label": "Sprint to the ward plinth.",
        "goToAreaId": "e_ward_crisis"
      },
      {
        "id": "to_triage",
        "label": "Run wounded to triage (short breather).",
        "goToAreaId": "e_triage"
      }
    ]
  },

  {
    "id": "e_ward_crisis",
    "title": "Ward Crisis",
    "x": 0, "y": -11, "floorId": "battle",
    "tileStyle": "ward_site",
    "cover": "low",
    "blocksLOS": false,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, ward plinth under attack, goblin sappers with fuse, defenders panicking, cinematic, no text",
    "description": "A goblin sapper team rushes the plinth, fuse cords in hand.\n\nIf the ward fails, the gate becomes a suggestion.",
    "choices": [
      {
        "id": "start_sappers",
        "label": "Intercept the sappers!",
        "effects": [
          {
            "type": "startThreat",
            "threat": {
              "threatId": "t_sapper_team_01",
              "enemyGroupId": "goblin_sapper_team",
              "distance": 2,
              "direction": "s",
              "speed": 1,
              "targetAreaId": "e_ward_crisis",
              "hazards": []
            }
          }
        ],
        "goToAreaId": "e_ward_choices"
      }
    ]
  },

  {
    "id": "e_ward_choices",
    "title": "Fuses in the Rain",
    "x": 0, "y": -12, "floorId": "battle",
    "tileStyle": "ward_site",
    "cover": "low",
    "blocksLOS": false,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, close-up sapper lighting fuse, arrows flying, rain steam, cinematic, no text",
    "description": "One sapper shields a spark. Another laughs.\n\nYou have seconds.",
    "choices": [
      {
        "id": "shoot",
        "label": "Shoot the sapper with the fuse.",
        "requirements": [
          { "type": "hasItem", "itemId": "training_bow", "qty": 1 },
          { "type": "hasAmmo", "ammoType": "arrow", "minCount": 1 }
        ],
        "effects": [
          { "type": "shootThreat", "threatId": "t_sapper_team_01", "ammoType": "arrow", "ammoToConsume": 1, "damage": { "mode": "roll", "expr": "1d6" } },
          { "type": "enemyReturnFireIfInRange", "threatId": "t_sapper_team_01" },
          { "type": "advanceThreat", "threatId": "t_sapper_team_01" }
        ]
      },
      {
        "id": "water",
        "label": "Soak the fuse with a water skin.",
        "requirements": [{ "type": "hasItem", "itemId": "water_skin", "qty": 1 }],
        "effects": [
          { "type": "flag", "key": "ward_fuse_doused", "value": true },
          { "type": "threatMoraleDelta", "threatId": "t_sapper_team_01", "amount": -2 },
          { "type": "advanceThreat", "threatId": "t_sapper_team_01" }
        ]
      },
      {
        "id": "flare",
        "label": "Cast Flare Signal to rally defenders and panic the sappers.",
        "requirements": [{ "type": "knowsSpell", "spellId": "flare_signal" }],
        "effects": [
          { "type": "castSpell", "spellId": "flare_signal", "threatId": "t_sapper_team_01" },
          { "type": "threatMoraleDelta", "threatId": "t_sapper_team_01", "amount": -2 },
          { "type": "advanceThreat", "threatId": "t_sapper_team_01" }
        ]
      },
      {
        "id": "fight",
        "label": "Close and fight.",
        "effects": [{ "type": "forceCombatFromThreat", "threatId": "t_sapper_team_01" }],
        "goToAreaId": "e_ward_after"
      }
    ]
  },

  {
    "id": "e_ward_after",
    "title": "Ward Saved",
    "x": 0, "y": -13, "floorId": "battle",
    "tileStyle": "ward_site",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, ward plinth glowing stable, defenders relieved, broken fuse on stone, cinematic, no text",
    "description": "The fuse dies. The ward hum steadies.\n\nA mage-priest grips your shoulder hard enough to bruise. \"You kept the gate alive.\"",
    "effectsOnEnter": [
      { "type": "flag", "key": "ward_saved", "value": true },
      { "type": "addXP", "amount": 22 }
    ],
    "choices": [
      {
        "id": "to_triage",
        "label": "Head to triage.",
        "goToAreaId": "e_triage"
      },
      {
        "id": "to_parapet",
        "label": "Return to the parapet for the next wave.",
        "goToAreaId": "e_parapet_volley"
      }
    ]
  },

  {
    "id": "e_parapet_volley",
    "title": "Parapet Volley",
    "x": 0, "y": -14, "floorId": "battle",
    "tileStyle": "battlements",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, archers firing from parapet into storm, enemies below as silhouettes, cinematic, no text",
    "description": "Archers loose volleys into the storm.\n\nIf you stocked the barrels earlier, the firing doesn’t slow. If you didn’t… hands reach for empty air.",
    "choices": [
      {
        "id": "support_archers",
        "label": "Support the archers (spend 1 bundle of arrows if you have it).",
        "requirements": [{ "type": "hasItem", "itemId": "arrow_bundle", "qty": 1 }],
        "effects": [
          { "type": "removeItem", "itemId": "arrow_bundle", "qty": 1 },
          { "type": "addXP", "amount": 16 },
          { "type": "flag", "key": "parapet_helped_in_battle", "value": true }
        ],
        "goToAreaId": "e_triage"
      },
      {
        "id": "if_stocked",
        "label": "If the parapet is stocked, coordinate volleys.",
        "requirements": [{ "type": "flagEquals", "key": "parapet_stocked", "value": true }],
        "effects": [{ "type": "addXP", "amount": 14 }],
        "goToAreaId": "e_triage"
      }
    ]
  },

  {
    "id": "e_triage",
    "title": "Triage Under Lanterns",
    "x": -1, "y": -12, "floorId": "battle",
    "tileStyle": "triage",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, triage tent near gate, lanterns, healers, wounded soldiers, rain outside, cinematic, no text",
    "description": "Healers work fast. Bandages run red.\n\nA runner arrives with a message: \"The first wave is only a test. The real push is coming.\"",
    "choices": [
      {
        "id": "act1_end",
        "label": "Steel yourself for the next phase of the battle.",
        "effects": [{ "type": "flag", "key": "battle_act1_complete", "value": true }]
      }
    ]
  }
]

What this batch “locks in” for your overarching story

Sabotage arc proves the war isn’t only outside the walls: it’s in ledgers, seals, and powder rooms.

Council warrant becomes a real tool: you can arrest a “respectable” traitor, not just fight goblins.

The battle preps now matter during Act I:

parapet_stocked changes parapet options

gate_warded + ward_saved directly supports the gate surviving

powder_secured prevents catastrophic failure later (Act II hook)

If you want me to keep rolling immediately: next batch is Battle Act II (the real push): a breach attempt, a gate mechanism emergency unlocked by Gatewarden’s Seal, and a branching outcome (hold / partial breach / fallback to inner streets) that leads naturally into sewers → caves → underground fortress for your campaign arc.

go ahead
Thought for 14s

Absolutely — here’s Battle Act II (the real push), including a gate mechanism emergency that uses the Gatewarden’s Seal, plus branching outcomes that flow naturally into inner-streets defense → sewer descent → caves → the underground fortress route.

You’ll get 4 new drop-in files:

/content/enemies_battle_act2.json

/content/items_battle_act2.json

/content/areas_battle_act2.json

/content/areas_post_battle_to_caves.json

/content/enemies_battle_act2.json
[
  {
    "id": "orc_shocktrooper",
    "name": "Orc Shocktrooper",
    "kind": "humanoid",
    "skill": 9,
    "stamina": 12,
    "meta": { "ranged": false },
    "loot": [{ "itemId": "gold_coin", "min": 2, "max": 10 }],
    "tags": ["orc", "shock"]
  },
  {
    "id": "orc_bow",
    "name": "Orc Bowman",
    "kind": "humanoid",
    "skill": 8,
    "stamina": 9,
    "meta": { "ranged": true, "range": 3, "damage": "1d6", "ammoType": "arrow" },
    "loot": [{ "itemId": "arrow_bundle", "min": 0, "max": 1 }, { "itemId": "gold_coin", "min": 1, "max": 8 }],
    "tags": ["orc", "ranged"]
  },
  {
    "id": "troll_brute",
    "name": "Troll Brute",
    "kind": "monster",
    "skill": 10,
    "stamina": 18,
    "meta": { "special": "regenerate_light" },
    "loot": [{ "itemId": "gold_coin", "min": 3, "max": 15 }],
    "tags": ["troll", "brute"]
  },
  {
    "id": "goblin_infiltrator",
    "name": "Goblin Infiltrator",
    "kind": "humanoid",
    "skill": 8,
    "stamina": 7,
    "meta": { "ranged": false, "special": "cut_rope" },
    "loot": [{ "itemId": "gate_key_fragment", "min": 0, "max": 1 }, { "itemId": "gold_coin", "min": 0, "max": 5 }],
    "tags": ["goblin", "infiltrator"]
  },
  {
    "id": "orc_assault_wave",
    "name": "Orc Assault Wave",
    "kind": "group",
    "members": [
      { "enemyId": "orc_shocktrooper", "count": 2 },
      { "enemyId": "orc_bow", "count": 1 }
    ],
    "meta": { "pursuit": { "speed": 1, "startDistance": 3, "morale": 9 } },
    "tags": ["orc", "group", "pursuit"]
  },
  {
    "id": "troll_push",
    "name": "Troll Push",
    "kind": "group",
    "members": [
      { "enemyId": "troll_brute", "count": 1 },
      { "enemyId": "orc_shocktrooper", "count": 1 }
    ],
    "meta": { "pursuit": { "speed": 1, "startDistance": 2, "morale": 10 } },
    "tags": ["troll", "orc", "group", "pursuit"]
  },
  {
    "id": "infiltrator_cell",
    "name": "Infiltrator Cell",
    "kind": "group",
    "members": [
      { "enemyId": "goblin_infiltrator", "count": 3 }
    ],
    "meta": { "pursuit": { "speed": 1, "startDistance": 2, "morale": 8 } },
    "tags": ["goblin", "group", "pursuit"]
  }
]

/content/items_battle_act2.json
[
  {
    "id": "resin_patch",
    "name": "Resin Patch",
    "type": "tool",
    "stackable": true,
    "value": 18,
    "description": "Sticky alchemical resin used to seal cracks, reinforce hinges, or gum a mechanism at the right moment."
  },
  {
    "id": "chain_hook",
    "name": "Chain Hook",
    "type": "tool",
    "stackable": false,
    "value": 25,
    "description": "A heavy iron hook for grabbing chains and pulling hard. Gate crews use these in emergencies."
  },
  {
    "id": "signal_whistle",
    "name": "Signal Whistle",
    "type": "tool",
    "stackable": false,
    "value": 12,
    "description": "A sharp whistle that cuts through battle noise. Useful for rallying defenders to your position."
  }
]

/content/areas_battle_act2.json
[
  {
    "id": "f_act2_real_push",
    "title": "The Real Push",
    "x": 0, "y": -20, "floorId": "battle",
    "tileStyle": "battle_start",
    "cover": "none",
    "blocksLOS": false,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, massive enemy wave in rain, drums, torches, silhouettes of orcs and a troll, city gate looming, cinematic, no text",
    "description": "Drums thud like a second heart.\n\nThe field erupts with torches and black shapes — orcs in tight ranks, and behind them something huge that lumbers as if the world owes it space.\n\nA runner screams: \"THEY’RE PUSHING THE RAM! AND SOMETHING’S INSIDE THE WALLS!\"",
    "effectsOnEnter": [{ "type": "flag", "key": "battle_act2_started", "value": true }],
    "choices": [
      { "id": "to_gateface", "label": "Run to the gate face and join the defenders.", "goToAreaId": "f_gate_face" },
      { "id": "to_mechanisms", "label": "Run to the gate mechanisms (emergency access).", "goToAreaId": "f_mechanism_entry" },
      { "id": "to_infiltrators", "label": "Hunt the infiltrators inside the walls.", "goToAreaId": "f_infiltrator_alert" }
    ]
  },

  {
    "id": "f_gate_face",
    "title": "Gate Face",
    "x": 0, "y": -21, "floorId": "battle",
    "tileStyle": "gate_yard",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, defenders at gate with shields, arrows raining, huge ram approaching, cinematic, no text",
    "description": "A battering ram surges forward under a roof of shields.\n\nIf the ward holds, the ram hits like a blunt prayer. If it fails, it hits like a verdict.",
    "choices": [
      {
        "id": "ward_matters",
        "label": "If the gate is warded, focus fire on the ram crew.",
        "requirements": [{ "type": "flagEquals", "key": "gate_warded", "value": true }],
        "effects": [
          {
            "type": "startThreat",
            "threat": {
              "threatId": "t_orc_assault_01",
              "enemyGroupId": "orc_assault_wave",
              "distance": 3,
              "direction": "s",
              "speed": 1,
              "targetAreaId": "f_gate_face",
              "hazards": []
            }
          }
        ],
        "goToAreaId": "f_gate_face_choices"
      },
      {
        "id": "if_not_warded",
        "label": "If the ward is weak, brace for impact and prepare to fall back.",
        "requirements": [{ "type": "notFlag", "key": "gate_warded" }],
        "effects": [
          {
            "type": "startThreat",
            "threat": {
              "threatId": "t_troll_push_01",
              "enemyGroupId": "troll_push",
              "distance": 2,
              "direction": "s",
              "speed": 1,
              "targetAreaId": "f_gate_face",
              "hazards": []
            }
          }
        ],
        "goToAreaId": "f_gate_breach_risk"
      }
    ]
  },

  {
    "id": "f_gate_face_choices",
    "title": "Arrowstorm",
    "x": 0, "y": -22, "floorId": "battle",
    "tileStyle": "gate_yard",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, arrow volleys from parapet, orcs pushing forward, rain streaks, cinematic, no text",
    "description": "The ram crew advances in a tight wedge.\n\nYour choices are simple: thin them out, slow them down, or meet them when they hit.",
    "choices": [
      {
        "id": "shoot",
        "label": "Open fire with my bow.",
        "requirements": [
          { "type": "hasItem", "itemId": "training_bow", "qty": 1 },
          { "type": "hasAmmo", "ammoType": "arrow", "minCount": 1 }
        ],
        "effects": [
          { "type": "shootThreat", "threatId": "t_orc_assault_01", "ammoType": "arrow", "ammoToConsume": 1, "damage": { "mode": "roll", "expr": "1d6" } },
          { "type": "enemyReturnFireIfInRange", "threatId": "t_orc_assault_01" },
          { "type": "advanceThreat", "threatId": "t_orc_assault_01" }
        ]
      },
      {
        "id": "stonebind",
        "label": "Cast Stonebind to slow the front ranks.",
        "requirements": [{ "type": "knowsSpell", "spellId": "stonebind" }],
        "effects": [
          { "type": "castSpell", "spellId": "stonebind", "threatId": "t_orc_assault_01" },
          { "type": "advanceThreat", "threatId": "t_orc_assault_01" }
        ]
      },
      {
        "id": "fight",
        "label": "Fight when they reach the line.",
        "effects": [{ "type": "forceCombatFromThreat", "threatId": "t_orc_assault_01" }],
        "goToAreaId": "f_gate_face_outcome"
      }
    ]
  },

  {
    "id": "f_gate_face_outcome",
    "title": "A Cracked Moment",
    "x": 0, "y": -23, "floorId": "battle",
    "tileStyle": "gate_yard",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, gate shaking, defenders grimacing, ward glow straining, cinematic, no text",
    "description": "The ram hits. The ward flares. The gate shudders.\n\nYou hear it — a crack that isn’t wood. It’s certainty.",
    "choices": [
      {
        "id": "mechanisms_now",
        "label": "Sprint to the gate mechanisms to reinforce the lift chains.",
        "goToAreaId": "f_mechanism_entry"
      },
      {
        "id": "hold_more",
        "label": "Stay and hold one more impact.",
        "effects": [{ "type": "addXP", "amount": 10 }],
        "goToAreaId": "f_gate_breach_risk"
      }
    ]
  },

  {
    "id": "f_gate_breach_risk",
    "title": "Breach Risk",
    "x": 0, "y": -24, "floorId": "battle",
    "tileStyle": "gate_yard",
    "cover": "low",
    "blocksLOS": false,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, troll brute pushing forward, orcs yelling, gate splintering, cinematic, no text",
    "description": "A troll brute crashes into the press like a living siege engine.\n\nDefenders stumble. Someone screams: \"THE HINGE!\"",
    "choices": [
      {
        "id": "start_troll",
        "label": "Engage the troll push!",
        "effects": [
          {
            "type": "startThreat",
            "threat": {
              "threatId": "t_troll_push_01",
              "enemyGroupId": "troll_push",
              "distance": 2,
              "direction": "s",
              "speed": 1,
              "targetAreaId": "f_gate_breach_risk",
              "hazards": []
            }
          }
        ],
        "goToAreaId": "f_breach_choices"
      }
    ]
  },

  {
    "id": "f_breach_choices",
    "title": "Hinge and Chain",
    "x": 0, "y": -25, "floorId": "battle",
    "tileStyle": "gate_yard",
    "cover": "low",
    "blocksLOS": false,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, close view of gate hinge and chain under strain, defenders fighting in rain, cinematic, no text",
    "description": "If the chain holds, the gate holds.\n\nIf the chain slips, the city becomes a maze of last stands.",
    "choices": [
      {
        "id": "resin_patch",
        "label": "Use a resin patch to reinforce the hinge seam.",
        "requirements": [{ "type": "hasItem", "itemId": "resin_patch", "qty": 1 }],
        "effects": [
          { "type": "removeItem", "itemId": "resin_patch", "qty": 1 },
          { "type": "flag", "key": "hinge_reinforced", "value": true },
          { "type": "addXP", "amount": 12 }
        ],
        "goToAreaId": "f_mechanism_entry"
      },
      {
        "id": "fight",
        "label": "Fight through the press and buy time.",
        "effects": [{ "type": "forceCombatFromThreat", "threatId": "t_troll_push_01" }],
        "goToAreaId": "f_breach_outcome"
      },
      {
        "id": "fall_back",
        "label": "Fall back to the inner streets and organize a choke point.",
        "effects": [{ "type": "flag", "key": "gate_breached_partial", "value": true }],
        "goToAreaId": "g_inner_streets_intro"
      }
    ]
  },

  {
    "id": "f_breach_outcome",
    "title": "Splinters and Smoke",
    "x": 0, "y": -26, "floorId": "battle",
    "tileStyle": "gate_yard",
    "cover": "low",
    "blocksLOS": false,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, gate splintering, smoke and rain, defenders retreating, cinematic, no text",
    "description": "You win seconds — not safety.\n\nThe gate gives a handspan. Then another.\n\nA narrow breach opens. Enough for knives. Enough for screams.",
    "choices": [
      {
        "id": "hold_or_fall",
        "label": "Fall back to the inner streets to prevent a full spill-in.",
        "effects": [{ "type": "flag", "key": "gate_breached_partial", "value": true }],
        "goToAreaId": "g_inner_streets_intro"
      },
      {
        "id": "mechanisms_last_chance",
        "label": "Last chance: run to the mechanisms to lift and slam the portcullis.",
        "goToAreaId": "f_mechanism_entry"
      }
    ]
  },

  {
    "id": "f_mechanism_entry",
    "title": "Mechanism Door",
    "x": -1, "y": -21, "floorId": "battle",
    "tileStyle": "mechanism",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, iron door to gate mechanisms, guards, sparks, rumbling gate, cinematic, no text",
    "description": "An iron door set into the inner wall.\n\nA guard blocks you. \"Only the Gatewarden—\"\n\nThe wall shakes. Dust sifts down like slow snow.",
    "choices": [
      {
        "id": "use_seal",
        "label": "Show the Gatewarden’s Seal.",
        "requirements": [{ "type": "hasItem", "itemId": "gatewarden_seal", "qty": 1 }],
        "effects": [{ "type": "flag", "key": "inner_mechanism_access", "value": true }],
        "goToAreaId": "f_mechanism_room"
      },
      {
        "id": "if_already_access",
        "label": "Enter (you already have access).",
        "requirements": [{ "type": "flagEquals", "key": "inner_mechanism_access", "value": true }],
        "goToAreaId": "f_mechanism_room"
      },
      {
        "id": "no_access",
        "label": "No seal—fall back to the inner streets.",
        "effects": [{ "type": "flag", "key": "gate_breached_partial", "value": true }],
        "goToAreaId": "g_inner_streets_intro"
      }
    ]
  },

  {
    "id": "f_mechanism_room",
    "title": "Gate Mechanisms",
    "x": -2, "y": -21, "floorId": "battle",
    "tileStyle": "mechanism",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, gate mechanism room with chains and winch, sparks, defenders straining, cinematic, no text",
    "description": "Chains groan. A winch screams. The portcullis is half-raised — stuck between fate and physics.\n\nA crewman shouts: \"Something’s cutting the ropes from inside!\"",
    "choices": [
      {
        "id": "hook_chain",
        "label": "Use a chain hook to re-seat the slipping chain (risky).",
        "requirements": [{ "type": "hasItem", "itemId": "chain_hook", "qty": 1 }],
        "effects": [
          { "type": "flag", "key": "portcullis_stabilized", "value": true },
          { "type": "addXP", "amount": 18 }
        ],
        "goToAreaId": "f_mechanism_infiltration"
      },
      {
        "id": "wardseal",
        "label": "Cast Wardseal to steady the mechanism room’s ward-lines.",
        "requirements": [{ "type": "knowsSpell", "spellId": "wardseal" }],
        "effects": [{ "type": "castSpell", "spellId": "wardseal" }, { "type": "addXP", "amount": 10 }],
        "goToAreaId": "f_mechanism_infiltration"
      },
      {
        "id": "rush_infiltrators",
        "label": "Ignore the chain—hunt whoever is cutting from inside.",
        "goToAreaId": "f_mechanism_infiltration"
      }
    ]
  },

  {
    "id": "f_mechanism_infiltration",
    "title": "Ropes Cut From Within",
    "x": -3, "y": -21, "floorId": "battle",
    "tileStyle": "tunnel",
    "cover": "low",
    "blocksLOS": false,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, narrow inner-wall tunnel, goblin infiltrators with knives, hanging ropes, cinematic, no text",
    "description": "A narrow service tunnel runs inside the wall.\n\nGoblin infiltrators — soaked, laughing — slash at rope lines like children ruining toys.\n\nOne drops something that clinks: a key fragment.",
    "choices": [
      {
        "id": "start_infiltrators",
        "label": "Stop the infiltrators!",
        "effects": [
          {
            "type": "startThreat",
            "threat": {
              "threatId": "t_infil_cell_01",
              "enemyGroupId": "infiltrator_cell",
              "distance": 2,
              "direction": "s",
              "speed": 1,
              "targetAreaId": "f_mechanism_infiltration",
              "hazards": []
            }
          }
        ],
        "goToAreaId": "f_infiltration_choices"
      }
    ]
  },

  {
    "id": "f_infiltration_choices",
    "title": "Knives on Ropes",
    "x": -4, "y": -21, "floorId": "battle",
    "tileStyle": "tunnel",
    "cover": "low",
    "blocksLOS": false,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, close fight in tunnel, goblins slashing ropes, sparks and rain drip, cinematic, no text",
    "description": "If they finish cutting, the portcullis drops crooked — and jams open.\n\nYou must stop them now.",
    "choices": [
      {
        "id": "shoot",
        "label": "Shoot and retreat to keep distance in the tunnel.",
        "requirements": [
          { "type": "hasItem", "itemId": "training_bow", "qty": 1 },
          { "type": "hasAmmo", "ammoType": "arrow", "minCount": 1 }
        ],
        "effects": [
          { "type": "shootThreat", "threatId": "t_infil_cell_01", "ammoType": "arrow", "ammoToConsume": 1, "damage": { "mode": "roll", "expr": "1d6" } },
          { "type": "breakLOS", "durationTurns": 1 },
          { "type": "advanceThreat", "threatId": "t_infil_cell_01" }
        ]
      },
      {
        "id": "smoke",
        "label": "Use a smoke pellet to break line of sight and rush them.",
        "requirements": [{ "type": "hasItem", "itemId": "smoke_pellet", "qty": 1 }],
        "effects": [
          { "type": "removeItem", "itemId": "smoke_pellet", "qty": 1 },
          { "type": "breakLOS", "durationTurns": 2 },
          { "type": "forceCombatFromThreat", "threatId": "t_infil_cell_01" }
        ],
        "goToAreaId": "f_infiltration_after"
      },
      {
        "id": "fight",
        "label": "Fight.",
        "effects": [{ "type": "forceCombatFromThreat", "threatId": "t_infil_cell_01" }],
        "goToAreaId": "f_infiltration_after"
      }
    ]
  },

  {
    "id": "f_infiltration_after",
    "title": "A Slam of Iron",
    "x": -5, "y": -21, "floorId": "battle",
    "tileStyle": "mechanism",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, portcullis slamming down, sparks, defenders cheering briefly, cinematic, no text",
    "description": "The last rope holds.\n\nThe portcullis drops clean.\n\nFor a heartbeat, the city breathes.",
    "effectsOnEnter": [
      { "type": "flag", "key": "portcullis_slammed", "value": true },
      { "type": "addItem", "itemId": "gate_key_fragment", "qty": 1 },
      { "type": "addXP", "amount": 22 }
    ],
    "choices": [
      {
        "id": "act2_win",
        "label": "Return to the inner yard and see what remains.",
        "effects": [{ "type": "flag", "key": "battle_act2_complete", "value": true }],
        "goToAreaId": "h_after_act2"
      }
    ]
  },

  {
    "id": "f_infiltrator_alert",
    "title": "Infiltrator Alert",
    "x": -1, "y": -20, "floorId": "battle",
    "tileStyle": "alley",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, inner alley with panicked citizens, guard pointing, shadowy movement, cinematic, no text",
    "description": "A guard points into an alley. \"They’re inside! They cut ropes and open doors — they want the gate to fail from within!\"",
    "choices": [
      { "id": "to_tunnel", "label": "Chase them into the inner wall tunnel.", "goToAreaId": "f_mechanism_infiltration" },
      { "id": "to_streets", "label": "Fall back to organize inner street choke points.", "goToAreaId": "g_inner_streets_intro" }
    ]
  }
]

/content/areas_post_battle_to_caves.json

This file handles post-Act II outcomes:

If you slammed the portcullis: you get a temporary victory, and the Council now gives you a covert mission.

If the gate partially breaches: you do an inner streets hold, then you’re sent into the sewers to stop the “second mouth” (a hidden culvert/fortress approach).

[
  {
    "id": "h_after_act2",
    "title": "After the Iron Falls",
    "x": 0, "y": -30, "floorId": "battle",
    "tileStyle": "gate_yard",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, exhausted defenders in gate yard, rain easing, broken shields, cinematic, no text",
    "description": "The yard is mud, blood, and splintered courage.\n\nThe enemy recoils — not defeated, only delayed.\n\nA messenger finds you: \"Councilor Vayne wants you. Now.\"",
    "choices": [
      { "id": "to_council", "label": "Go to the council hall for a covert assignment.", "goToAreaId": "h_council_covert" },
      {
        "id": "forge_seal",
        "label": "If you have 3 key fragments, bind them into a Gatewarden’s Seal.",
        "requirements": [{ "type": "hasItem", "itemId": "gate_key_fragment", "qty": 3 }],
        "effects": [{ "type": "craft", "recipeId": "bind_gate_key" }],
        "goToAreaId": "h_council_covert"
      }
    ]
  },

  {
    "id": "h_council_covert",
    "title": "Covert Assignment",
    "x": -1, "y": -30, "floorId": "city",
    "tileStyle": "council",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, councilor leaning over map with candles, urgent whispers, cinematic, no text",
    "description": "Vayne speaks without ceremony.\n\n\"They tested the gate — and they tested our inside.\n\nThere is another way in: old sewers that lead into limestone caves. From there, a forgotten under-fortress sits like a thorn.\n\nIf they hold it, they can pour into the city behind the gate. We need a knife in the dark.\"",
    "choices": [
      {
        "id": "accept",
        "label": "Accept the mission: descend into the sewers and find the under-fortress approach.",
        "effects": [
          { "type": "flag", "key": "mission_underfortress", "value": true },
          { "type": "addItem", "itemId": "council_sigil_silver", "qty": 1 }
        ],
        "goToAreaId": "h_sewer_descent_entry"
      },
      {
        "id": "if_breached",
        "label": "If the gate breached, offer to lead citizens to a safe route first.",
        "requirements": [{ "type": "flagEquals", "key": "gate_breached_partial", "value": true }],
        "effects": [{ "type": "flag", "key": "evac_helper", "value": true }],
        "goToAreaId": "g_inner_streets_intro"
      }
    ]
  },

  {
    "id": "g_inner_streets_intro",
    "title": "Inner Streets: Choke Point",
    "x": 0, "y": -31, "floorId": "city",
    "tileStyle": "alley",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, narrow medieval street barricade, citizens fleeing, defenders forming line, cinematic, no text",
    "description": "A narrow street becomes a funnel. Barrels roll. Planks slam down.\n\nIf the gate spill widens, this is where the city dies — or holds.",
    "choices": [
      {
        "id": "hold_short",
        "label": "Hold for a short time to let civilians move.",
        "effects": [{ "type": "addXP", "amount": 18 }, { "type": "flag", "key": "inner_streets_held", "value": true }],
        "goToAreaId": "h_sewer_descent_entry"
      },
      {
        "id": "retreat_to_sewers",
        "label": "Slip into the sewer access route (covert).",
        "requirements": [{ "type": "flagEquals", "key": "mission_underfortress", "value": true }],
        "goToAreaId": "h_sewer_descent_entry"
      }
    ]
  },

  {
    "id": "h_sewer_descent_entry",
    "title": "Old Sewer Access",
    "x": 5, "y": -2, "floorId": "sewer",
    "tileStyle": "sewer_entry",
    "cover": "low",
    "blocksLOS": false,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, hidden sewer hatch with lantern, rainwater running into darkness, cinematic, no text",
    "description": "A hatch hidden behind a collapsed brick screen.\n\nWarm air breathes up from below — carrying rot, old water, and something like wet fur.\n\nThis route predates the city’s current walls. That’s why it’s dangerous. That’s why it matters.",
    "choices": [
      { "id": "down", "label": "Descend.", "goToAreaId": "h_sewer_run_1" }
    ]
  },

  {
    "id": "h_sewer_run_1",
    "title": "Sewer Run: Whispering Water",
    "x": 5, "y": -3, "floorId": "sewer",
    "tileStyle": "sewer",
    "cover": "none",
    "blocksLOS": false,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, sewer tunnel with fast shallow water, echoes, lantern glow, cinematic, no text",
    "description": "Water whispers along the floor, carrying every sound.\n\nYou see chalk marks: old smugglers. New gouges: something clawed.",
    "choices": [
      {
        "id": "keen_eye",
        "label": "Cast Keen Eye to read the marks and find the safer route.",
        "requirements": [{ "type": "knowsSpell", "spellId": "keen_eye" }],
        "effects": [{ "type": "castSpell", "spellId": "keen_eye" }, { "type": "addXP", "amount": 6 }],
        "goToAreaId": "h_sewer_split"
      },
      { "id": "continue", "label": "Continue carefully.", "goToAreaId": "h_sewer_split" }
    ]
  },

  {
    "id": "h_sewer_split",
    "title": "Split: Brickwork and Stone",
    "x": 5, "y": -4, "floorId": "sewer",
    "tileStyle": "sewer",
    "cover": "low",
    "blocksLOS": false,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, sewer split with one brick tunnel and one rough stone tunnel, cinematic, no text",
    "description": "Two paths.\n\nLeft: newer brick, tighter, with iron brackets.\nRight: older stone, rough and damp, opening downward.\n\nThe older route smells like caves.",
    "choices": [
      { "id": "brick", "label": "Take the brick route (risk of patrols).", "goToAreaId": "h_brick_patrol" },
      { "id": "stone", "label": "Take the old stone route (risk of beasts).", "goToAreaId": "h_stone_drop" }
    ]
  },

  {
    "id": "h_brick_patrol",
    "title": "Brick Route: Patrol Shadows",
    "x": 4, "y": -4, "floorId": "sewer",
    "tileStyle": "sewer",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, brick sewer with lantern light ahead, shadowy figures, tense stealth, cinematic, no text",
    "description": "Lantern light ahead.\n\nVoices — not guards. Too harsh. Too amused.\n\nSmugglers… or something worse wearing their confidence.",
    "choices": [
      {
        "id": "sneak",
        "label": "Use Muffle Steps and slip past.",
        "requirements": [{ "type": "knowsSpell", "spellId": "muffle_steps" }],
        "effects": [{ "type": "castSpell", "spellId": "muffle_steps" }, { "type": "addXP", "amount": 10 }],
        "goToAreaId": "h_cave_mouth"
      },
      {
        "id": "fight",
        "label": "Confront them.",
        "effects": [{ "type": "startCombat", "enemyGroup": [{ "enemyId": "dockside_cutthroat", "count": 2 }] }],
        "goToAreaId": "h_cave_mouth"
      }
    ]
  },

  {
    "id": "h_stone_drop",
    "title": "Stone Drop",
    "x": 6, "y": -4, "floorId": "sewer",
    "tileStyle": "sewer",
    "cover": "low",
    "blocksLOS": false,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, rough stone tunnel descending, water dripping, claw marks, cinematic, no text",
    "description": "The stone route slopes down.\n\nClaw marks rake the wall. Something uses this as a corridor — not a home.\n\nHomes are safer than corridors.",
    "choices": [
      {
        "id": "rats",
        "label": "Proceed (and be ready for vermin).",
        "effects": [{ "type": "startCombat", "enemyGroup": [{ "enemyId": "sewer_rat", "count": 2 }] }],
        "goToAreaId": "h_cave_mouth"
      }
    ]
  },

  {
    "id": "h_cave_mouth",
    "title": "Cave Mouth: Limestone Breath",
    "x": 5, "y": -5, "floorId": "caves",
    "tileStyle": "cave",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, limestone cave mouth beyond sewer arch, mist, faint crystals, cinematic, no text",
    "description": "The sewer ends in a limestone throat.\n\nMist curls from fissures. In the distance, faint crystals catch your lantern like eyes.\n\nSomewhere deeper, stone echoes with bootsteps — disciplined, not animal.\n\nThe under-fortress is real.",
    "choices": [
      { "id": "continue", "label": "Enter the caves toward the under-fortress.", "goToAreaId": "i_cave_junction_1" }
    ]
  },

  {
    "id": "i_cave_junction_1",
    "title": "Cave Junction: The Forked Dark",
    "x": 5, "y": -6, "floorId": "caves",
    "tileStyle": "cave",
    "cover": "low",
    "blocksLOS": false,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, cave junction with two tunnels, one with faint torch soot, one with crystal glimmer, cinematic, no text",
    "description": "Two tunnels.\n\nLeft: soot on stone — torches. People.\nRight: crystal glimmer — natural… or bait.\n\nIf you want the fortress, you follow people. If you want answers, you follow the earth.",
    "choices": [
      { "id": "soot", "label": "Follow the soot trail (toward the under-fortress).", "goToAreaId": "i_underfortress_outer" },
      { "id": "crystal", "label": "Follow the crystal glimmer (side loot / ward shards).", "goToAreaId": "i_crystal_grotto" }
    ]
  },

  {
    "id": "i_crystal_grotto",
    "title": "Crystal Grotto",
    "x": 6, "y": -6, "floorId": "caves",
    "tileStyle": "cave",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, crystal grotto with glowing shards, shallow pool, eerie beauty, cinematic, no text",
    "description": "Crystals stud the walls like frozen lightning.\n\nIn the pool, something metallic gleams — rune-metal, broken into familiar shapes.\n\nWard shards. Enough to make another stone… or strengthen a seal.",
    "choices": [
      {
        "id": "take_shards",
        "label": "Take the ward shards.",
        "effects": [{ "type": "addItem", "itemId": "ward_shard", "qty": 2 }, { "type": "addXP", "amount": 14 }],
        "goToAreaId": "i_cave_junction_1"
      }
    ]
  },

  {
    "id": "i_underfortress_outer",
    "title": "Under-Fortress Outer Wall",
    "x": 5, "y": -7, "floorId": "caves",
    "tileStyle": "fortress",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, ancient underground fortress wall carved into rock, torchlight, skull motifs, cinematic, no text",
    "description": "Stonework rises from rock as if it grew there.\n\nAn under-fortress — old as the first wars.\n\nYou hear orders in guttural tongues.\n\nIf this place feeds the invasion, cutting it will save the city more than any heroics at the gate.",
    "choices": [
      { "id": "approach", "label": "Approach the under-fortress entrance.", "goToAreaId": "i_underfortress_entry" }
    ]
  },

  {
    "id": "i_underfortress_entry",
    "title": "Under-Fortress Entry",
    "x": 5, "y": -8, "floorId": "caves",
    "tileStyle": "fortress",
    "cover": "low",
    "blocksLOS": false,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, underground fortress gate with iron bars, torch sconces, guards in silhouette, cinematic, no text",
    "description": "A barred entry with two sentries.\n\nBeyond the bars: a corridor, disciplined footsteps, and the smell of oil.\n\nThis is where your city questing becomes war.",
    "choices": [
      { "id": "next", "label": "Proceed into Under-Fortress Scenario I (next chapter).", "effects": [{ "type": "flag", "key": "chapter_underfortress_started", "value": true }] }
    ]
  }
]

What you’ve now got (campaign logic)

Act II resolves the “gate crisis” in two ways:

Seal + mechanisms path = you become the “trusted fixer” who saves the portcullis.

Partial breach path = you become the “street captain” who holds choke points.

Either way, the story naturally pivots into a covert counterstrike:

Sewers → caves → under-fortress to stop the enemy getting behind the gate.

The Gatewarden’s Seal now matters mechanically and narratively.

If you say go ahead again, the next batch will be Under-Fortress Scenario I: stealth options, prisoner cells, the first “princess / VIP captive” thread, a “lost crystal ball” rumor seeded via documents, and a boss encounter that drops the next key fragments + a unique crafting component for a stronger ward.

go ahead

Perfect — here’s Under-Fortress Scenario I as a clean, drop-in set of content files with stealth routes, prisoner rescue (VIP/princess thread), crystal ball rumor seeded via documents, a mini-boss, and a strong “next chapter” hook.

You’ll get 6 files:

/content/areas_underfortress_ch1.json

/content/enemies_underfortress_ch1.json

/content/items_underfortress_ch1.json

/content/npcs_underfortress_ch1.json

/content/quests_underfortress_ch1.json

/content/spells_stealth_util.json (adds the spells referenced earlier: Keen Eye + Muffle Steps)

/content/items_underfortress_ch1.json
[
  {
    "id": "fortress_key_iron",
    "name": "Iron Fortress Key",
    "type": "quest",
    "stackable": false,
    "value": 0,
    "description": "Cold iron with an angular ward notch. It smells faintly of oil."
  },
  {
    "id": "prison_ring_token",
    "name": "Prison Ring Token",
    "type": "quest",
    "stackable": true,
    "value": 0,
    "description": "A stamped token issued to prison runners. It buys passage from some guards — once."
  },
  {
    "id": "ward_core_splinter",
    "name": "Ward-Core Splinter",
    "type": "quest",
    "stackable": true,
    "value": 0,
    "description": "A splinter of rune-metal fused to black stone. It hums when held near wards."
  },
  {
    "id": "crystal_ball_clue_page",
    "name": "Clue: The Crystal Ball",
    "type": "quest",
    "stackable": true,
    "value": 0,
    "description": "A smear-stained order: ‘Deliver the SIGHT ORB to the Deep Reliquary. No delays. No witnesses.’"
  },
  {
    "id": "vip_signet_half",
    "name": "VIP Signet (Broken Half)",
    "type": "quest",
    "stackable": true,
    "value": 0,
    "description": "Half a signet seal bearing a human noble crest. Proof of who was taken — and by whom."
  },
  {
    "id": "lockpick_bundle",
    "name": "Lockpick Bundle",
    "type": "tool",
    "stackable": true,
    "value": 22,
    "description": "Basic picks made from spring steel. Better than prayer."
  },
  {
    "id": "oil_flask",
    "name": "Flask of Lamp Oil",
    "type": "tool",
    "stackable": true,
    "value": 10,
    "description": "Useful for lamps, distractions, and convincing fire to happen elsewhere."
  },
  {
    "id": "salted_meat",
    "name": "Salted Meat Strip",
    "type": "consumable",
    "stackable": true,
    "value": 6,
    "meta": { "heal": 2 },
    "description": "Chewy and grim. Still better than sewer water."
  },
  {
    "id": "shadow_cloak_pin",
    "name": "Shadow Cloak Pin",
    "type": "accessory",
    "slot": "amulet",
    "stackable": false,
    "value": 0,
    "meta": { "stealthBonus": 1 },
    "description": "A dark pin etched with a closed eye. It makes you feel less noticeable in torchlight."
  }
]

/content/enemies_underfortress_ch1.json
[
  {
    "id": "orc_sentry",
    "name": "Orc Sentry",
    "kind": "humanoid",
    "skill": 9,
    "stamina": 10,
    "meta": { "ranged": false },
    "loot": [{ "itemId": "gold_coin", "min": 1, "max": 10 }],
    "tags": ["orc", "guard"]
  },
  {
    "id": "goblin_runner",
    "name": "Goblin Runner",
    "kind": "humanoid",
    "skill": 8,
    "stamina": 6,
    "meta": { "ranged": false, "special": "alarm" },
    "loot": [{ "itemId": "prison_ring_token", "min": 0, "max": 1 }, { "itemId": "gold_coin", "min": 0, "max": 6 }],
    "tags": ["goblin", "runner"]
  },
  {
    "id": "troll_hound",
    "name": "Troll-Hound",
    "kind": "monster",
    "skill": 8,
    "stamina": 11,
    "meta": { "special": "scent_track" },
    "loot": [{ "itemId": "gold_coin", "min": 0, "max": 5 }],
    "tags": ["beast", "hound"]
  },
  {
    "id": "orc_jailer",
    "name": "Orc Jailer",
    "kind": "humanoid",
    "skill": 10,
    "stamina": 13,
    "meta": { "special": "keyring" },
    "loot": [{ "itemId": "fortress_key_iron", "min": 1, "max": 1 }, { "itemId": "gold_coin", "min": 3, "max": 14 }],
    "tags": ["orc", "jailer", "boss"]
  },
  {
    "id": "sentry_pair",
    "name": "Sentry Pair",
    "kind": "group",
    "members": [{ "enemyId": "orc_sentry", "count": 2 }],
    "meta": { "pursuit": { "speed": 1, "startDistance": 2, "morale": 9 } },
    "tags": ["orc", "group", "pursuit"]
  },
  {
    "id": "prison_patrol",
    "name": "Prison Patrol",
    "kind": "group",
    "members": [{ "enemyId": "orc_sentry", "count": 1 }, { "enemyId": "goblin_runner", "count": 2 }],
    "meta": { "pursuit": { "speed": 1, "startDistance": 3, "morale": 8 } },
    "tags": ["mixed", "group", "pursuit"]
  },
  {
    "id": "hound_team",
    "name": "Hound Team",
    "kind": "group",
    "members": [{ "enemyId": "troll_hound", "count": 1 }, { "enemyId": "goblin_runner", "count": 1 }],
    "meta": { "pursuit": { "speed": 1, "startDistance": 2, "morale": 9 } },
    "tags": ["beast", "group", "pursuit"]
  }
]

/content/npcs_underfortress_ch1.json
[
  {
    "id": "npc_vip_prisoner_liora",
    "name": "Liora Vale",
    "role": "VIP Captive (Noble Courier)",
    "portraitPrompt": "fantasy character portrait, noble courier woman with torn cloak, stubborn gaze, bruised but unbroken, torchlit dungeon, painterly, no text",
    "dialogue": {
      "greeting": "If you’ve come to bargain, I have nothing. If you’ve come to rescue, be quiet.",
      "nodes": [
        {
          "id": "liora_info",
          "text": "They took me for what I carried — not who I am. Their officers speak of a ‘sight orb’ being moved deeper. And they’re terrified of losing it.",
          "choices": [
            {
              "label": "Ask: What is the ‘sight orb’?",
              "effects": [{ "type": "flag", "key": "crystal_orb_rumor_heard", "value": true }]
            },
            {
              "label": "Promise: I’ll get you out.",
              "effects": [{ "type": "flag", "key": "vip_rescue_promised", "value": true }]
            }
          ]
        }
      ]
    }
  },
  {
    "id": "npc_prisoner_old_scribe",
    "name": "Old Scribe",
    "role": "Broken Scribe (Knows Layout)",
    "portraitPrompt": "fantasy character portrait, elderly scribe in rags, ink-stained fingers, haunted eyes, dungeon bars, painterly, no text",
    "dialogue": {
      "greeting": "Walls have ears. Floors have teeth.",
      "nodes": [
        {
          "id": "scribe_layout",
          "text": "There’s a maintenance slit behind the cistern. Leads to the chain gallery. Don’t go where the drums echo.",
          "choices": [
            { "label": "Thank him and ask about keys.", "effects": [{ "type": "flag", "key": "hint_chain_gallery", "value": true }] }
          ]
        }
      ]
    }
  }
]

/content/quests_underfortress_ch1.json
[
  {
    "id": "q_underfortress_ch1_main",
    "name": "Under-Fortress: Cut the Supply Vein",
    "giverNpcId": "npc_councilor_vayne",
    "startAreaId": "i_underfortress_entry",
    "objective": { "type": "setFlag", "key": "underfortress_ch1_complete", "value": true },
    "grantsOnStart": [],
    "rewards": {
      "gold": 0,
      "xp": 40,
      "items": [{ "itemId": "council_sigil_silver", "qty": 1 }]
    },
    "cooldownMinutes": 99999
  },
  {
    "id": "q_rescue_vip",
    "name": "Rescue the VIP Captive",
    "giverNpcId": "npc_vip_prisoner_liora",
    "startAreaId": "u_prison_cells",
    "objective": { "type": "setFlag", "key": "vip_rescued", "value": true },
    "grantsOnStart": [],
    "rewards": {
      "gold": 0,
      "xp": 35,
      "items": [{ "itemId": "vip_signet_half", "qty": 1 }]
    },
    "cooldownMinutes": 99999
  },
  {
    "id": "q_crystal_ball_rumor",
    "name": "Trace the ‘Sight Orb’ Orders",
    "giverNpcId": "npc_vip_prisoner_liora",
    "startAreaId": "u_prison_cells",
    "objective": { "type": "deliverItems", "items": [{ "itemId": "crystal_ball_clue_page", "qty": 1 }], "toAreaId": "i_underfortress_entry" },
    "grantsOnStart": [],
    "rewards": {
      "gold": 0,
      "xp": 22,
      "items": [{ "itemId": "ward_core_splinter", "qty": 1 }]
    },
    "cooldownMinutes": 99999
  }
]

/content/spells_stealth_util.json
[
  {
    "id": "keen_eye",
    "name": "Keen Eye",
    "cost": 1,
    "description": "Briefly sharpens perception. Reveals hidden notes, weak stonework, and fresh tracks.",
    "effects": [{ "type": "flag", "key": "keen_eye_active", "value": true }]
  },
  {
    "id": "muffle_steps",
    "name": "Muffle Steps",
    "cost": 2,
    "description": "Softens your footfalls for a short time. Better for slipping past patrols than fighting them.",
    "effects": [{ "type": "flag", "key": "muffle_steps_active", "value": true }]
  }
]

/content/areas_underfortress_ch1.json
[
  {
    "id": "u_entry_corridor",
    "title": "Under-Fortress: Entry Corridor",
    "x": 5, "y": -9, "floorId": "underfortress",
    "tileStyle": "fortress",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, underground fortress corridor, iron sconces, damp stone, distant marching, cinematic, no text",
    "description": "The corridor is built for marching, not living.\n\nTorch soot stains the ceiling. The stonework is older than the current war — and it remembers other wars.\n\nAhead: a junction and a prison bell.",
    "exits": { "n": "u_guard_junction", "s": "i_underfortress_entry" },
    "actionsAvailable": {
      "investigate": {
        "text": "Boot scuffs show a heavy traffic pattern. Something important moves through here on schedule.",
        "choices": [
          {
            "id": "keen_eye",
            "label": "Cast Keen Eye to read the traffic pattern.",
            "requirements": [{ "type": "knowsSpell", "spellId": "keen_eye" }],
            "effects": [{ "type": "castSpell", "spellId": "keen_eye" }, { "type": "flag", "key": "underfortress_patrol_timing", "value": true }]
          }
        ]
      }
    }
  },

  {
    "id": "u_guard_junction",
    "title": "Junction of Iron Sconces",
    "x": 5, "y": -10, "floorId": "underfortress",
    "tileStyle": "fortress",
    "cover": "low",
    "blocksLOS": false,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, underground junction with two paths, torch sconces, shadows, cinematic, no text",
    "description": "Two corridors split.\n\nLeft: louder — voices, keys, the stink of prisoners.\nRight: quieter — a drip, a cistern echo, and the smell of damp rope.",
    "exits": { "s": "u_entry_corridor", "w": "u_prison_antechamber", "e": "u_cistern_run" },
    "choices": [
      {
        "id": "stealth_pass",
        "label": "If Muffle Steps is active, slip past the nearest patrol shadow.",
        "requirements": [{ "type": "flagEquals", "key": "muffle_steps_active", "value": true }],
        "effects": [{ "type": "addXP", "amount": 8 }]
      },
      {
        "id": "start_patrol",
        "label": "A patrol turns the corner—prepare for trouble.",
        "effects": [
          {
            "type": "startThreat",
            "threat": {
              "threatId": "t_prison_patrol_01",
              "enemyGroupId": "prison_patrol",
              "distance": 2,
              "direction": "n",
              "speed": 1,
              "targetAreaId": "u_guard_junction",
              "hazards": []
            }
          }
        ],
        "goToAreaId": "u_patrol_contact"
      }
    ]
  },

  {
    "id": "u_patrol_contact",
    "title": "Patrol Contact",
    "x": 5, "y": -11, "floorId": "underfortress",
    "tileStyle": "fortress",
    "cover": "low",
    "blocksLOS": false,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, orc guard and goblin runner patrol, lantern, tense moment, cinematic, no text",
    "description": "An orc guard and two goblin runners swing a lantern toward you.\n\nOne goblin opens its mouth to shout.",
    "choices": [
      {
        "id": "shoot_runner",
        "label": "Shoot the goblin runner before it raises the alarm.",
        "requirements": [
          { "type": "hasItem", "itemId": "training_bow", "qty": 1 },
          { "type": "hasAmmo", "ammoType": "arrow", "minCount": 1 }
        ],
        "effects": [
          { "type": "shootThreat", "threatId": "t_prison_patrol_01", "ammoType": "arrow", "ammoToConsume": 1, "damage": { "mode": "roll", "expr": "1d6" } },
          { "type": "advanceThreat", "threatId": "t_prison_patrol_01" }
        ]
      },
      {
        "id": "smoke",
        "label": "Use a smoke pellet and slip into the prison antechamber.",
        "requirements": [{ "type": "hasItem", "itemId": "smoke_pellet", "qty": 1 }],
        "effects": [
          { "type": "removeItem", "itemId": "smoke_pellet", "qty": 1 },
          { "type": "breakLOS", "durationTurns": 2 }
        ],
        "goToAreaId": "u_prison_antechamber"
      },
      {
        "id": "fight",
        "label": "Fight.",
        "effects": [{ "type": "forceCombatFromThreat", "threatId": "t_prison_patrol_01" }],
        "goToAreaId": "u_guard_junction"
      }
    ]
  },

  {
    "id": "u_prison_antechamber",
    "title": "Prison Antechamber",
    "x": 4, "y": -10, "floorId": "underfortress",
    "tileStyle": "prison",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, prison antechamber with key hooks, barred door, dripping stone, cinematic, no text",
    "description": "Hooks on the wall where keys should hang.\n\nA barred door ahead. A ledger desk to the side.\n\nInk stains and a faint wax seal imprint — recent.",
    "exits": { "e": "u_guard_junction", "w": "u_prison_cells", "n": "u_jailer_gallery" },
    "actionsAvailable": {
      "investigate": {
        "text": "The desk ledger lists prisoners by number, not name. One entry is circled twice: ‘VALE — transfer pending.’",
        "choices": [
          {
            "id": "take_clue",
            "label": "Take the transfer order page.",
            "effects": [{ "type": "addItem", "itemId": "crystal_ball_clue_page", "qty": 1 }, { "type": "addXP", "amount": 10 }]
          }
        ]
      },
      "open": {
        "text": "The barred door to the cell block is locked.",
        "choices": [
          {
            "id": "use_picks",
            "label": "Pick the lock.",
            "requirements": [{ "type": "hasItem", "itemId": "lockpick_bundle", "qty": 1 }],
            "effects": [{ "type": "removeItem", "itemId": "lockpick_bundle", "qty": 1 }, { "type": "addXP", "amount": 8 }],
            "goToAreaId": "u_prison_cells"
          },
          {
            "id": "use_key",
            "label": "Use an iron fortress key.",
            "requirements": [{ "type": "hasItem", "itemId": "fortress_key_iron", "qty": 1 }],
            "goToAreaId": "u_prison_cells"
          }
        ]
      }
    }
  },

  {
    "id": "u_prison_cells",
    "title": "Prison Cells",
    "x": 3, "y": -10, "floorId": "underfortress",
    "tileStyle": "prison",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, dungeon cell corridor, barred cells, prisoners in shadow, torchlight, cinematic, no text",
    "description": "Barred doors line the corridor.\n\nA woman’s voice cuts through the dark: \"Don’t rattle the bars. Listen first.\"",
    "exits": { "e": "u_prison_antechamber", "w": "u_cell_end" },
    "actionsAvailable": {
      "talk": {
        "text": "You find the speaker: a noble courier with torn cloak and steady eyes.",
        "choices": [
          {
            "id": "talk_vip",
            "label": "Talk to Liora Vale.",
            "effects": [{ "type": "openDialogue", "npcId": "npc_vip_prisoner_liora" }]
          },
          {
            "id": "start_rescue",
            "label": "Start the rescue quest.",
            "effects": [{ "type": "startJob", "jobId": "q_rescue_vip" }]
          }
        ]
      },
      "open": {
        "text": "Liora’s cell is locked.",
        "choices": [
          {
            "id": "pick",
            "label": "Pick the lock quietly.",
            "requirements": [{ "type": "hasItem", "itemId": "lockpick_bundle", "qty": 1 }],
            "effects": [{ "type": "removeItem", "itemId": "lockpick_bundle", "qty": 1 }, { "type": "flag", "key": "vip_cell_open", "value": true }]
          },
          {
            "id": "key",
            "label": "Use an iron fortress key.",
            "requirements": [{ "type": "hasItem", "itemId": "fortress_key_iron", "qty": 1 }],
            "effects": [{ "type": "flag", "key": "vip_cell_open", "value": true }]
          }
        ]
      }
    },
    "choices": [
      {
        "id": "free_vip",
        "label": "If her cell is open, free Liora and move.",
        "requirements": [{ "type": "flagEquals", "key": "vip_cell_open", "value": true }],
        "effects": [
          { "type": "flag", "key": "vip_rescued", "value": true },
          { "type": "completeJob", "jobId": "q_rescue_vip" },
          { "type": "addItem", "itemId": "vip_signet_half", "qty": 1 },
          { "type": "addXP", "amount": 18 }
        ],
        "goToAreaId": "u_escape_route_choice"
      }
    ]
  },

  {
    "id": "u_cell_end",
    "title": "Cell Block End",
    "x": 2, "y": -10, "floorId": "underfortress",
    "tileStyle": "prison",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, end of prison corridor, cracked stone, old drain slit, cinematic, no text",
    "description": "The corridor ends in cracked stone and an old drain slit.\n\nIt’s narrow — but it goes somewhere.\n\nYou hear drums deeper in the fortress. Not here. Not yet.",
    "exits": { "e": "u_prison_cells", "w": "u_drain_slit" }
  },

  {
    "id": "u_drain_slit",
    "title": "Drain Slit",
    "x": 1, "y": -10, "floorId": "underfortress",
    "tileStyle": "tunnel",
    "cover": "low",
    "blocksLOS": false,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, narrow maintenance slit behind cistern, squeezing through stone gap, cinematic, no text",
    "description": "You squeeze sideways through stone.\n\nCold water runs over your boots.\n\nBeyond: a maintenance passage that smells of rope and iron.",
    "exits": { "e": "u_cell_end", "w": "u_chain_gallery" }
  },

  {
    "id": "u_chain_gallery",
    "title": "Chain Gallery",
    "x": 0, "y": -10, "floorId": "underfortress",
    "tileStyle": "mechanism",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, underground chain gallery with pulleys, massive chains, dripping water, cinematic, no text",
    "description": "Massive chains run through pulleys.\n\nA chalk mark: ‘TRANSFER ROUTE →’ and a crude skull.\n\nThis is infrastructure — and infrastructure is always guarded.",
    "exits": { "e": "u_drain_slit", "n": "u_jailer_gallery", "w": "u_supply_lift" },
    "choices": [
      {
        "id": "muffle",
        "label": "Cast Muffle Steps to cross the chain gallery quietly.",
        "requirements": [{ "type": "knowsSpell", "spellId": "muffle_steps" }],
        "effects": [{ "type": "castSpell", "spellId": "muffle_steps" }, { "type": "addXP", "amount": 8 }]
      },
      {
        "id": "hound_risk",
        "label": "A troll-hound sniffs the air…",
        "effects": [
          {
            "type": "startThreat",
            "threat": {
              "threatId": "t_hound_team_01",
              "enemyGroupId": "hound_team",
              "distance": 2,
              "direction": "w",
              "speed": 1,
              "targetAreaId": "u_chain_gallery",
              "hazards": []
            }
          }
        ],
        "goToAreaId": "u_hound_contact"
      }
    ]
  },

  {
    "id": "u_hound_contact",
    "title": "Hound Contact",
    "x": -1, "y": -10, "floorId": "underfortress",
    "tileStyle": "mechanism",
    "cover": "low",
    "blocksLOS": false,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, troll-hound baring teeth, goblin handler, chain shadows, cinematic, no text",
    "description": "A troll-hound lowers its head and growls.\n\nA goblin handler grins. \"SMELL HUMAN.\"",
    "choices": [
      {
        "id": "oil_distraction",
        "label": "Spill oil and throw it to distract the hound.",
        "requirements": [{ "type": "hasItem", "itemId": "oil_flask", "qty": 1 }],
        "effects": [{ "type": "removeItem", "itemId": "oil_flask", "qty": 1 }, { "type": "addXP", "amount": 10 }],
        "goToAreaId": "u_supply_lift"
      },
      {
        "id": "fight",
        "label": "Fight.",
        "effects": [{ "type": "forceCombatFromThreat", "threatId": "t_hound_team_01" }],
        "goToAreaId": "u_supply_lift"
      }
    ]
  },

  {
    "id": "u_jailer_gallery",
    "title": "Jailer’s Gallery",
    "x": 4, "y": -11, "floorId": "underfortress",
    "tileStyle": "prison",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, jailer station with keyrings and whip, prisoner ledger, torchlight, cinematic, no text",
    "description": "Keyrings hang like trophies.\n\nA heavy orc in a stained apron turns slowly.\n\n\"Lost?\" the jailer rumbles. \"Everyone’s lost down here. It’s why we keep them.\"",
    "exits": { "s": "u_prison_antechamber", "w": "u_chain_gallery" },
    "choices": [
      {
        "id": "boss",
        "label": "Fight the Orc Jailer.",
        "effects": [{ "type": "startCombat", "enemyGroup": [{ "enemyId": "orc_jailer", "count": 1 }] }],
        "goToAreaId": "u_jailer_loot"
      },
      {
        "id": "bribe",
        "label": "Offer a Prison Ring Token for passage (if you have one).",
        "requirements": [{ "type": "hasItem", "itemId": "prison_ring_token", "qty": 1 }],
        "effects": [{ "type": "removeItem", "itemId": "prison_ring_token", "qty": 1 }, { "type": "flag", "key": "jailer_bribed", "value": true }],
        "goToAreaId": "u_supply_lift"
      }
    ]
  },

  {
    "id": "u_jailer_loot",
    "title": "Keyring Taken",
    "x": 4, "y": -12, "floorId": "underfortress",
    "tileStyle": "prison",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, fallen jailer, keys spilled, torchlight, cinematic, no text",
    "description": "The jailer drops like a sack of iron.\n\nYou take the key — and a small black-stone splinter humming with ward energy.\n\nSomewhere deeper, a horn answers another horn.",
    "effectsOnEnter": [
      { "type": "addItem", "itemId": "fortress_key_iron", "qty": 1 },
      { "type": "addItem", "itemId": "ward_core_splinter", "qty": 1 },
      { "type": "addXP", "amount": 24 }
    ],
    "exits": { "n": "u_supply_lift", "s": "u_prison_antechamber" }
  },

  {
    "id": "u_supply_lift",
    "title": "Supply Lift Platform",
    "x": -1, "y": -11, "floorId": "underfortress",
    "tileStyle": "lift",
    "cover": "low",
    "blocksLOS": false,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, creaking lift platform over dark shaft, chains, torchlight, cinematic, no text",
    "description": "A lift platform hangs over a black shaft.\n\nCrates are marked with crude runes: FOOD. IRON. PRISON.\n\nOne mark is newer: RELIQUARY.",
    "exits": { "e": "u_chain_gallery", "n": "u_reliquary_stairs" },
    "actionsAvailable": {
      "take": {
        "text": "A crate lid is loose.",
        "choices": [
          { "id": "take_meat", "label": "Take salted meat.", "effects": [{ "type": "addItem", "itemId": "salted_meat", "qty": 2 }] },
          { "id": "take_picks", "label": "Take lockpicks.", "effects": [{ "type": "addItem", "itemId": "lockpick_bundle", "qty": 1 }] }
        ]
      }
    }
  },

  {
    "id": "u_escape_route_choice",
    "title": "Escape Route Choice",
    "x": 2, "y": -11, "floorId": "underfortress",
    "tileStyle": "fortress",
    "cover": "low",
    "blocksLOS": false,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, two routes in underground corridor, one lit by torches, one narrow and dark, cinematic, no text",
    "description": "With the VIP freed, every corridor feels louder.\n\nYou must choose: speed, or stealth.",
    "choices": [
      {
        "id": "fast",
        "label": "Take the faster torch-lit route (risk patrols).",
        "effects": [
          {
            "type": "startThreat",
            "threat": {
              "threatId": "t_sentry_pair_02",
              "enemyGroupId": "sentry_pair",
              "distance": 2,
              "direction": "n",
              "speed": 1,
              "targetAreaId": "u_escape_route_choice",
              "hazards": []
            }
          }
        ],
        "goToAreaId": "u_guard_junction"
      },
      {
        "id": "quiet",
        "label": "Slip via the drain slit and chain gallery (safer, slower).",
        "goToAreaId": "u_drain_slit"
      }
    ]
  },

  {
    "id": "u_reliquary_stairs",
    "title": "Reliquary Stairs",
    "x": -1, "y": -12, "floorId": "underfortress",
    "tileStyle": "fortress",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, descending stairs with old carvings, relic motifs, torch soot, cinematic, no text",
    "description": "Stairs descend into older stone.\n\nCarvings show a sphere held over a battlefield — armies moving like pieces.\n\nThe ‘sight orb’ isn’t a rumor. It’s a weapon.",
    "choices": [
      {
        "id": "seed_rumor",
        "label": "Study the carvings (learn more).",
        "effects": [{ "type": "flag", "key": "crystal_orb_confirmed", "value": true }, { "type": "addXP", "amount": 10 }]
      },
      {
        "id": "next_chapter",
        "label": "Proceed into Under-Fortress Scenario II: The Deep Reliquary.",
        "effects": [{ "type": "flag", "key": "chapter_underfortress_2_unlocked", "value": true }, { "type": "flag", "key": "underfortress_ch1_complete", "value": true }]
      }
    ]
  }
]

What this chapter gives you (mechanically + narratively)

Two main goals you can complete in parallel:

Rescue VIP captive (Liora Vale) → unlocks political leverage later + “princess/VIP” thread.

Trace the Crystal Ball (“Sight Orb”) → the plot-key that will turn later battles.

Stealth route vs patrol risk that plays well with “page by page” choice flow.

A mini-boss (Orc Jailer) with satisfying loot: Iron Fortress Key + Ward-Core Splinter

Hard pivot to Scenario II: The Deep Reliquary (where the crystal ball is being moved).

If you want, I’ll now produce Under-Fortress Scenario II as the next batch: reliquary puzzles, ward traps, the “orb convoy” interception, a named orc commander, and an escape route that loops you back toward cave networks (and optionally the princess/prisoner transfer track if you missed it).

continue
/content/items_underfortress_ch2.json
[
  {
    "id": "sight_orb_crystal_ball",
    "name": "The Sight Orb (Crystal Ball)",
    "type": "quest",
    "stackable": false,
    "value": 0,
    "description": "A flawless sphere that shows moving lights like armies on a board. It feels warm, like it’s watching you back."
  },
  {
    "id": "reliquary_seal_wax",
    "name": "Reliquary Seal Wax",
    "type": "quest",
    "stackable": true,
    "value": 0,
    "description": "Hard black wax stamped with a deep reliquary emblem. Useful as proof you were here."
  },
  {
    "id": "ward_sigiled_chain",
    "name": "Ward-Sigiled Chain",
    "type": "quest",
    "stackable": true,
    "value": 0,
    "description": "A chain link etched with ward runes. It hums near trap-lines and mechanism rooms."
  },
  {
    "id": "reliquary_pass_mark",
    "name": "Reliquary Pass Mark",
    "type": "quest",
    "stackable": false,
    "value": 0,
    "description": "A chalk-and-wax mark used by reliquary staff to avoid certain ward traps."
  },
  {
    "id": "glow_chalk",
    "name": "Glow Chalk",
    "type": "tool",
    "stackable": true,
    "value": 9,
    "description": "Marks stone surfaces and faintly glows. Good for mapping tunnels or identifying fresh footprints."
  },
  {
    "id": "ward_damper",
    "name": "Ward Damper",
    "type": "tool",
    "stackable": true,
    "value": 0,
    "meta": { "trapReduce": 1 },
    "description": "A small rune-clamp that dulls a ward line briefly. Single-use, delicate."
  },
  {
    "id": "commander_signet",
    "name": "Commander’s Signet",
    "type": "quest",
    "stackable": false,
    "value": 0,
    "description": "A brutal signet ring etched with a commander’s mark. It smells of oil and blood."
  },
  {
    "id": "map_scrap_reliquary",
    "name": "Map Scrap: Reliquary Routes",
    "type": "quest",
    "stackable": true,
    "value": 0,
    "description": "A torn sketch showing hidden service routes and a ‘breakwater tunnel’ back into the caves."
  }
]

/content/enemies_underfortress_ch2.json
[
  {
    "id": "orc_reliquary_guard",
    "name": "Orc Reliquary Guard",
    "kind": "humanoid",
    "skill": 10,
    "stamina": 12,
    "meta": { "ranged": false },
    "loot": [{ "itemId": "gold_coin", "min": 2, "max": 12 }],
    "tags": ["orc", "guard"]
  },
  {
    "id": "goblin_lanternist",
    "name": "Goblin Lanternist",
    "kind": "humanoid",
    "skill": 9,
    "stamina": 7,
    "meta": { "special": "flash_smoke" },
    "loot": [{ "itemId": "smoke_pellet", "min": 0, "max": 1 }, { "itemId": "gold_coin", "min": 0, "max": 6 }],
    "tags": ["goblin", "support"]
  },
  {
    "id": "ward_priest_adept",
    "name": "Ward Adept",
    "kind": "humanoid",
    "skill": 9,
    "stamina": 9,
    "meta": { "special": "ward_bolt" },
    "loot": [{ "itemId": "ward_sigiled_chain", "min": 0, "max": 1 }, { "itemId": "gold_coin", "min": 1, "max": 10 }],
    "tags": ["caster", "ward"]
  },
  {
    "id": "orc_commander_kargan",
    "name": "Commander Kargan (Reliquary)",
    "kind": "humanoid",
    "skill": 11,
    "stamina": 16,
    "meta": { "special": "order_wave", "ranged": false },
    "loot": [
      { "itemId": "commander_signet", "min": 1, "max": 1 },
      { "itemId": "map_scrap_reliquary", "min": 1, "max": 1 },
      { "itemId": "gold_coin", "min": 6, "max": 20 }
    ],
    "tags": ["orc", "boss"]
  },
  {
    "id": "reliquary_patrol",
    "name": "Reliquary Patrol",
    "kind": "group",
    "members": [
      { "enemyId": "orc_reliquary_guard", "count": 1 },
      { "enemyId": "goblin_lanternist", "count": 1 }
    ],
    "meta": { "pursuit": { "speed": 1, "startDistance": 2, "morale": 9 } },
    "tags": ["mixed", "group", "pursuit"]
  },
  {
    "id": "orb_convoy",
    "name": "Orb Convoy",
    "kind": "group",
    "members": [
      { "enemyId": "orc_reliquary_guard", "count": 2 },
      { "enemyId": "ward_priest_adept", "count": 1 }
    ],
    "meta": { "pursuit": { "speed": 1, "startDistance": 3, "morale": 10 }, "objective": "protect_orb" },
    "tags": ["convoy", "group", "pursuit"]
  }
]

/content/npcs_underfortress_ch2.json
[
  {
    "id": "npc_captive_mage_apprentice",
    "name": "Tess of the Tower",
    "role": "Caged Mage Apprentice",
    "portraitPrompt": "fantasy character portrait, young mage apprentice in torn robe, glowing runes on wrists, determined eyes, reliquary cell, painterly, no text",
    "dialogue": {
      "greeting": "Don’t touch the runes. They bite.",
      "nodes": [
        {
          "id": "tess_help",
          "text": "The orb isn’t just seeing. It’s steering. It ‘nudges’ troop movement—like a hand on a chess piece. Break its cradle and it loses focus for days.",
          "choices": [
            { "label": "Ask how to break the cradle.", "effects": [{ "type": "flag", "key": "orb_cradle_hint", "value": true }] },
            { "label": "Free Tess (if possible).", "effects": [{ "type": "flag", "key": "tess_freed", "value": true }] }
          ]
        }
      ]
    }
  },
  {
    "id": "npc_ward_adept_defector",
    "name": "Adept Sorn",
    "role": "Defector (Wants Out)",
    "portraitPrompt": "fantasy character portrait, nervous ward adept with inked fingers, cracked ward charm, guilty eyes, torchlight, painterly, no text",
    "dialogue": {
      "greeting": "You shouldn’t be here. Neither should I.",
      "nodes": [
        {
          "id": "sorn_deal",
          "text": "Give me a way out and I’ll mark the safe path through the ward lines. They’ll kill me when the orb is moved.",
          "choices": [
            {
              "label": "Accept: mark me a safe route.",
              "effects": [
                { "type": "addItem", "itemId": "reliquary_pass_mark", "qty": 1 },
                { "type": "flag", "key": "reliquary_safe_marked", "value": true }
              ]
            }
          ]
        }
      ]
    }
  }
]

/content/quests_underfortress_ch2.json
[
  {
    "id": "q_underfortress_ch2_orb",
    "name": "Under-Fortress II: Seize or Sabotage the Sight Orb",
    "giverNpcId": "npc_councilor_vayne",
    "startAreaId": "u_reliquary_antechamber",
    "objective": { "type": "setFlag", "key": "underfortress_ch2_complete", "value": true },
    "grantsOnStart": [],
    "rewards": { "gold": 0, "xp": 55, "items": [{ "itemId": "council_sigil_silver", "qty": 1 }] },
    "cooldownMinutes": 99999
  },
  {
    "id": "q_free_tess",
    "name": "Free the Tower Apprentice",
    "giverNpcId": "npc_captive_mage_apprentice",
    "startAreaId": "u_reliquary_cells",
    "objective": { "type": "setFlag", "key": "tess_freed", "value": true },
    "grantsOnStart": [],
    "rewards": { "gold": 0, "xp": 22, "items": [{ "itemId": "ward_damper", "qty": 1 }] },
    "cooldownMinutes": 99999
  }
]

/content/areas_underfortress_ch2.json
[
  {
    "id": "u_reliquary_antechamber",
    "title": "Deep Reliquary: Antechamber",
    "x": -1, "y": -13, "floorId": "underfortress",
    "tileStyle": "fortress",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, ancient reliquary antechamber, carved sphere motifs, ward lines glowing faintly, cinematic, no text",
    "description": "The stone here is older and cleaner. Carvings show a sphere hovering over battle lines.\n\nThin ward lines thread the walls like veins.\n\nA plaque in rough script: ‘SIGHT MAKES KINGS.’",
    "exits": { "s": "u_reliquary_stairs", "n": "u_ward_hall", "e": "u_reliquary_cells", "w": "u_service_sluice" },
    "actionsAvailable": {
      "investigate": {
        "text": "Some ward lines are scuffed, as if boots intentionally avoided them.",
        "choices": [
          {
            "id": "keen_eye",
            "label": "Cast Keen Eye to identify the safe path.",
            "requirements": [{ "type": "knowsSpell", "spellId": "keen_eye" }],
            "effects": [{ "type": "castSpell", "spellId": "keen_eye" }, { "type": "flag", "key": "reliquary_safe_path_seen", "value": true }, { "type": "addXP", "amount": 8 }]
          }
        ]
      }
    }
  },

  {
    "id": "u_ward_hall",
    "title": "Ward Hall: Threaded Stone",
    "x": -1, "y": -14, "floorId": "underfortress",
    "tileStyle": "ward_site",
    "cover": "low",
    "blocksLOS": false,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, corridor with glowing ward threads on floor, skull carvings, tense, cinematic, no text",
    "description": "Ward threads cross the floor like a net.\n\nStep wrong and the net tightens.",
    "exits": { "s": "u_reliquary_antechamber", "n": "u_orb_cradle_room" },
    "choices": [
      {
        "id": "safe_mark",
        "label": "If you have a Reliquary Pass Mark, follow the marked safe route.",
        "requirements": [{ "type": "hasItem", "itemId": "reliquary_pass_mark", "qty": 1 }],
        "effects": [{ "type": "addXP", "amount": 8 }, { "type": "flag", "key": "ward_hall_passed", "value": true }],
        "goToAreaId": "u_orb_cradle_room"
      },
      {
        "id": "careful",
        "label": "Proceed carefully (risk a ward trap).",
        "effects": [
          { "type": "skillCheck", "skill": "luck", "dc": 8, "onFail": [{ "type": "takeDamage", "amount": 2 }], "onPass": [{ "type": "addXP", "amount": 6 }] }
        ],
        "goToAreaId": "u_orb_cradle_room"
      },
      {
        "id": "use_damper",
        "label": "Use a Ward Damper to dull the trap lines.",
        "requirements": [{ "type": "hasItem", "itemId": "ward_damper", "qty": 1 }],
        "effects": [
          { "type": "removeItem", "itemId": "ward_damper", "qty": 1 },
          { "type": "flag", "key": "ward_hall_damped", "value": true },
          { "type": "addXP", "amount": 10 }
        ],
        "goToAreaId": "u_orb_cradle_room"
      }
    ]
  },

  {
    "id": "u_reliquary_cells",
    "title": "Reliquary Cells",
    "x": 0, "y": -13, "floorId": "underfortress",
    "tileStyle": "prison",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, small cells near reliquary, runes on bars, mage in chains, cinematic, no text",
    "description": "Smaller cells, newer bars, better locks.\n\nA young mage apprentice looks up. Runes glow on her wrists like shackles made of light.",
    "exits": { "w": "u_reliquary_antechamber" },
    "actionsAvailable": {
      "talk": {
        "text": "The apprentice’s eyes flash with stubborn clarity.",
        "choices": [
          { "id": "dialogue", "label": "Talk to Tess of the Tower.", "effects": [{ "type": "openDialogue", "npcId": "npc_captive_mage_apprentice" }] },
          { "id": "start_quest", "label": "Start: Free the Tower Apprentice.", "effects": [{ "type": "startJob", "jobId": "q_free_tess" }] }
        ]
      },
      "open": {
        "text": "Her cell lock is intricate.",
        "choices": [
          {
            "id": "pick",
            "label": "Pick the lock (quietly).",
            "requirements": [{ "type": "hasItem", "itemId": "lockpick_bundle", "qty": 1 }],
            "effects": [{ "type": "removeItem", "itemId": "lockpick_bundle", "qty": 1 }, { "type": "flag", "key": "tess_freed", "value": true }, { "type": "completeJob", "jobId": "q_free_tess" }, { "type": "addXP", "amount": 12 }]
          },
          {
            "id": "key",
            "label": "Use an iron fortress key.",
            "requirements": [{ "type": "hasItem", "itemId": "fortress_key_iron", "qty": 1 }],
            "effects": [{ "type": "flag", "key": "tess_freed", "value": true }, { "type": "completeJob", "jobId": "q_free_tess" }, { "type": "addXP", "amount": 10 }]
          }
        ]
      }
    }
  },

  {
    "id": "u_service_sluice",
    "title": "Service Sluice",
    "x": -2, "y": -13, "floorId": "underfortress",
    "tileStyle": "sewer",
    "cover": "low",
    "blocksLOS": false,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, hidden sluice tunnel with trickling water, narrow ledge, maintenance hooks, cinematic, no text",
    "description": "A narrow maintenance sluice runs beside trickling water.\n\nIt bypasses the ward hall — but it’s cramped and loud if you slip.",
    "exits": { "e": "u_reliquary_antechamber", "n": "u_orb_convoy_intercept" },
    "choices": [
      {
        "id": "muffle",
        "label": "Cast Muffle Steps before climbing the ledge.",
        "requirements": [{ "type": "knowsSpell", "spellId": "muffle_steps" }],
        "effects": [{ "type": "castSpell", "spellId": "muffle_steps" }, { "type": "addXP", "amount": 6 }]
      },
      {
        "id": "cross",
        "label": "Cross the ledge carefully.",
        "effects": [{ "type": "skillCheck", "skill": "skill", "dc": 7, "onFail": [{ "type": "takeDamage", "amount": 1 }], "onPass": [{ "type": "addXP", "amount": 5 }] }],
        "goToAreaId": "u_orb_convoy_intercept"
      }
    ]
  },

  {
    "id": "u_orb_cradle_room",
    "title": "Orb Cradle Room",
    "x": -1, "y": -15, "floorId": "underfortress",
    "tileStyle": "reliquary",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, reliquary chamber with orb cradle pedestal, rune rings, guards, eerie glow, cinematic, no text",
    "description": "A pedestal holds an empty cradle — ringed by runes.\n\nThe orb was here. Recently.\n\nA wax smear on the rim suggests it was sealed for transport.",
    "exits": { "s": "u_ward_hall", "e": "u_orb_convoy_intercept" },
    "actionsAvailable": {
      "investigate": {
        "text": "The cradle’s ring is cracked in one spot—intentional weak point, like a hinge for removal.",
        "choices": [
          { "id": "take_wax", "label": "Take a chunk of reliquary seal wax as proof.", "effects": [{ "type": "addItem", "itemId": "reliquary_seal_wax", "qty": 1 }, { "type": "addXP", "amount": 6 }] }
        ]
      }
    }
  },

  {
    "id": "u_orb_convoy_intercept",
    "title": "Convoy Intercept Gallery",
    "x": 0, "y": -14, "floorId": "underfortress",
    "tileStyle": "fortress",
    "cover": "low",
    "blocksLOS": false,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, corridor where convoy passes, crate on cart, guards, ward adept, cinematic, no text",
    "description": "Boots. Wheels. A murmured chant.\n\nThe convoy approaches: a cart under canvas, guards tight, a ward adept watching the shadows.\n\nIf the orb is on that cart, this is your moment.",
    "choices": [
      {
        "id": "start_convoy",
        "label": "Ambush the convoy.",
        "effects": [
          {
            "type": "startThreat",
            "threat": {
              "threatId": "t_orb_convoy_01",
              "enemyGroupId": "orb_convoy",
              "distance": 3,
              "direction": "n",
              "speed": 1,
              "targetAreaId": "u_orb_convoy_intercept",
              "hazards": []
            }
          }
        ],
        "goToAreaId": "u_convoy_choices"
      },
      {
        "id": "shadow_wait",
        "label": "Wait in shadow and look for a defecting adept.",
        "effects": [{ "type": "flag", "key": "defector_chance", "value": true }],
        "goToAreaId": "u_defector_meet"
      }
    ]
  },

  {
    "id": "u_defector_meet",
    "title": "Adept in the Dark",
    "x": 1, "y": -14, "floorId": "underfortress",
    "tileStyle": "fortress",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, nervous adept stepping from shadow, ward charm cracking, cinematic, no text",
    "description": "A hooded figure steps from a recess.\n\n\"If you’re going to strike,\" he whispers, \"do it clean. They’ll kill me when it’s moved.\"",
    "actionsAvailable": {
      "talk": {
        "text": "He glances both ways, shaking.",
        "choices": [
          { "id": "dialogue", "label": "Talk to Adept Sorn.", "effects": [{ "type": "openDialogue", "npcId": "npc_ward_adept_defector" }] }
        ]
      }
    },
    "choices": [
      { "id": "back", "label": "Return to intercept position.", "goToAreaId": "u_orb_convoy_intercept" }
    ]
  },

  {
    "id": "u_convoy_choices",
    "title": "Canvas and Candlelight",
    "x": 0, "y": -15, "floorId": "underfortress",
    "tileStyle": "fortress",
    "cover": "low",
    "blocksLOS": false,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, ambush moment, canvas-covered cart, guard lantern swinging, cinematic, no text",
    "description": "The cart is within reach.\n\nThe ward adept’s eyes flick to the floor, counting steps. The guards’ grips tighten.\n\nYou can take the orb… or make sure nobody uses it soon.",
    "choices": [
      {
        "id": "shoot_adept",
        "label": "Shoot the ward adept first.",
        "requirements": [
          { "type": "hasItem", "itemId": "training_bow", "qty": 1 },
          { "type": "hasAmmo", "ammoType": "arrow", "minCount": 1 }
        ],
        "effects": [
          { "type": "shootThreat", "threatId": "t_orb_convoy_01", "ammoType": "arrow", "ammoToConsume": 1, "damage": { "mode": "roll", "expr": "1d6" } },
          { "type": "advanceThreat", "threatId": "t_orb_convoy_01" }
        ]
      },
      {
        "id": "fight",
        "label": "Fight and seize the cart.",
        "effects": [{ "type": "forceCombatFromThreat", "threatId": "t_orb_convoy_01" }],
        "goToAreaId": "u_convoy_after"
      },
      {
        "id": "sabotage_cradle",
        "label": "If you learned the cradle weakness, sabotage the cart cradle and flee (orb delayed).",
        "requirements": [{ "type": "flagEquals", "key": "orb_cradle_hint", "value": true }],
        "effects": [
          { "type": "flag", "key": "orb_sabotaged", "value": true },
          { "type": "addXP", "amount": 18 }
        ],
        "goToAreaId": "u_escape_breakwater"
      }
    ]
  },

  {
    "id": "u_convoy_after",
    "title": "The Orb Revealed",
    "x": 0, "y": -16, "floorId": "underfortress",
    "tileStyle": "reliquary",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, canvas pulled back revealing crystal orb glowing, reflections like armies, cinematic, no text",
    "description": "Under the canvas: the crystal orb.\n\nInside it, lights move like troops on a map.\n\nYou feel the urge to look longer — and the fear that it’s looking back.",
    "choices": [
      {
        "id": "take_orb",
        "label": "Take the Sight Orb.",
        "effects": [
          { "type": "addItem", "itemId": "sight_orb_crystal_ball", "qty": 1 },
          { "type": "flag", "key": "orb_taken", "value": true },
          { "type": "addXP", "amount": 22 }
        ],
        "goToAreaId": "u_commander_chamber"
      },
      {
        "id": "leave_and_mark",
        "label": "Don’t carry it—take proof and flee (orb remains, but you have evidence).",
        "effects": [
          { "type": "addItem", "itemId": "reliquary_seal_wax", "qty": 1 },
          { "type": "flag", "key": "orb_not_taken_proof_only", "value": true },
          { "type": "addXP", "amount": 14 }
        ],
        "goToAreaId": "u_escape_breakwater"
      }
    ]
  },

  {
    "id": "u_commander_chamber",
    "title": "Commander’s Chamber",
    "x": 1, "y": -16, "floorId": "underfortress",
    "tileStyle": "fortress",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, command chamber with crude map table, torches, orc commander turning, cinematic, no text",
    "description": "A heavy door opens onto a command space.\n\nAn orc commander turns from a map table.\n\n\"Thief,\" he says calmly. \"Good. I wanted to see the one who thought they could.\"",
    "choices": [
      {
        "id": "boss",
        "label": "Fight Commander Kargan.",
        "effects": [{ "type": "startCombat", "enemyGroup": [{ "enemyId": "orc_commander_kargan", "count": 1 }] }],
        "goToAreaId": "u_commander_loot"
      },
      {
        "id": "escape_now",
        "label": "If you have smoke, escape instead of fighting.",
        "requirements": [{ "type": "hasItem", "itemId": "smoke_pellet", "qty": 1 }],
        "effects": [{ "type": "removeItem", "itemId": "smoke_pellet", "qty": 1 }, { "type": "flag", "key": "escaped_commander", "value": true }],
        "goToAreaId": "u_escape_breakwater"
      }
    ]
  },

  {
    "id": "u_commander_loot",
    "title": "Signet and Routes",
    "x": 1, "y": -17, "floorId": "underfortress",
    "tileStyle": "fortress",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, fallen commander, signet ring gleaming, torn route map, cinematic, no text",
    "description": "Kargan falls hard.\n\nYou take his signet and a torn route sketch.\n\nOne scribble stands out: ‘BREAKWATER TUNNEL → CAVES → CITY DRAINS.’\n\nA way out.",
    "effectsOnEnter": [
      { "type": "addItem", "itemId": "commander_signet", "qty": 1 },
      { "type": "addItem", "itemId": "map_scrap_reliquary", "qty": 1 },
      { "type": "addXP", "amount": 26 }
    ],
    "choices": [
      {
        "id": "escape",
        "label": "Use the breakwater tunnel route.",
        "goToAreaId": "u_escape_breakwater"
      }
    ]
  },

  {
    "id": "u_escape_breakwater",
    "title": "Breakwater Tunnel",
    "x": -3, "y": -14, "floorId": "underfortress",
    "tileStyle": "tunnel",
    "cover": "low",
    "blocksLOS": false,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, rushing underground water tunnel, narrow ledges, torchlight fading, cinematic, no text",
    "description": "A water tunnel roars like an animal.\n\nThe ledge is narrow. The air tastes like wet stone.\n\nIf you’re carrying the orb, every step feels louder.",
    "choices": [
      {
        "id": "mark_route",
        "label": "Use glow chalk to mark your route for the return.",
        "requirements": [{ "type": "hasItem", "itemId": "glow_chalk", "qty": 1 }],
        "effects": [{ "type": "removeItem", "itemId": "glow_chalk", "qty": 1 }, { "type": "flag", "key": "route_marked", "value": true }, { "type": "addXP", "amount": 8 }]
      },
      {
        "id": "to_caves",
        "label": "Follow the tunnel back into the limestone caves.",
        "effects": [{ "type": "flag", "key": "underfortress_ch2_complete", "value": true }],
        "goToAreaId": "j_caves_return_1"
      }
    ]
  },

  {
    "id": "j_caves_return_1",
    "title": "Caves Return: Cold Air, New Weight",
    "x": 5, "y": -9, "floorId": "caves",
    "tileStyle": "cave",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, cave mouth with fresher air, distant city glow, exhausted adventurer, cinematic, no text",
    "description": "You emerge into caves again.\n\nSomewhere far above: a city clinging to its walls.\n\nIf the orb is with you, you’re carrying the future. If not, you’re carrying proof and a plan.",
    "choices": [
      {
        "id": "return_city",
        "label": "Return toward the city drains to report to the council.",
        "effects": [{ "type": "flag", "key": "chapter_underfortress_2_complete", "value": true }],
        "goToAreaId": "k_city_drain_return"
      }
    ]
  },

  {
    "id": "k_city_drain_return",
    "title": "City Drain Return",
    "x": 5, "y": -2, "floorId": "sewer",
    "tileStyle": "sewer_entry",
    "cover": "low",
    "blocksLOS": false,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, sewer arch leading to hidden city hatch, lantern glow, rain sounds above, cinematic, no text",
    "description": "The hatch above is a promise: back to streets, back to politics, back to the war.\n\nAnd now you have something the enemy wanted badly enough to hide underground.",
    "choices": [
      {
        "id": "report",
        "label": "Report to Councilor Vayne (next chapter: planning the counterstroke).",
        "effects": [{ "type": "flag", "key": "council_report_ready_orb", "value": true }]
      }
    ]
  }
]

What this chapter does for the campaign

Orb is now a campaign pivot item:

Taken → enemy loses strategic “steering”; city gains insight for upcoming gate battle phases.

Sabotaged → orb not acquired, but enemy plans are delayed for days (sets up “breathing room” quests).

Proof only → still meaningful: council can rally mages, expose traitors, and plan a raid later.

Boss fight yields a route map that “unlocks” your next scenario stage cleanly.

The return route naturally loops you to city drains and back into political + supply quests before the next major battle.

If you say continue again, I’ll generate the post-reliquary city chapter (short “victory window” quests + council strategy meeting), then kick off the overland campaign: farms/woodcutting → goblin raids → field skirmishes → siege lines → the next dungeon chain that ends with a princess rescue / hostage swap decision that affects the final mass battle at the gates.

continue
/content/npcs_city_strategy.json
[
  {
    "id": "npc_councilor_vayne",
    "name": "Councilor Vayne",
    "role": "War Council (Cold Strategist)",
    "portraitPrompt": "fantasy character portrait, councilor in dark robes over armor, candlelit map table, sharp eyes, painterly, no text",
    "dialogue": {
      "greeting": "Close the door. Speak fast. The city’s time is measured in breaths now.",
      "nodes": [
        {
          "id": "vayne_report",
          "text": "Tell me what you found below. Not what you felt. Not what you feared. What you found.",
          "choices": [
            {
              "label": "Report: I seized the Sight Orb.",
              "requirements": [{ "type": "hasItem", "itemId": "sight_orb_crystal_ball", "qty": 1 }],
              "effects": [
                { "type": "flag", "key": "orb_reported_taken", "value": true },
                { "type": "addXP", "amount": 18 }
              ]
            },
            {
              "label": "Report: I sabotaged the orb cradle / convoy.",
              "requirements": [{ "type": "flagEquals", "key": "orb_sabotaged", "value": true }],
              "effects": [
                { "type": "flag", "key": "orb_reported_sabotaged", "value": true },
                { "type": "addXP", "amount": 14 }
              ]
            },
            {
              "label": "Report: I brought proof (seal wax / documents).",
              "requirements": [{ "type": "hasItem", "itemId": "reliquary_seal_wax", "qty": 1 }],
              "effects": [
                { "type": "flag", "key": "orb_reported_proof", "value": true },
                { "type": "addXP", "amount": 12 }
              ]
            },
            {
              "label": "Present Commander’s Signet.",
              "requirements": [{ "type": "hasItem", "itemId": "commander_signet", "qty": 1 }],
              "effects": [{ "type": "flag", "key": "kargan_confirmed_dead", "value": true }]
            }
          ]
        },
        {
          "id": "vayne_next_steps",
          "text": "Good. Then we buy time. And we spend it like coin: on wood, food, and knives in the dark.\n\nYou are no longer a runner. You are an asset.",
          "choices": [
            {
              "label": "Ask: What do you need first?",
              "effects": [{ "type": "flag", "key": "victory_window_open", "value": true }]
            },
            {
              "label": "Accept fieldwork orders (outside the walls).",
              "requirements": [{ "type": "flagEquals", "key": "victory_window_open", "value": true }],
              "effects": [{ "type": "flag", "key": "chapter_overland_unlocked", "value": true }]
            }
          ]
        }
      ]
    }
  },
  {
    "id": "npc_quartermaster_brevin",
    "name": "Quartermaster Brevin",
    "role": "Logistics (Honest Exhaustion)",
    "portraitPrompt": "fantasy character portrait, tired quartermaster with ink-stained hands, stacks of crates, lantern light, painterly, no text",
    "dialogue": {
      "greeting": "If it’s not nailed down, it’s already gone. If it is nailed down, someone is prying.",
      "nodes": [
        {
          "id": "brevin_tasks",
          "text": "The council wants miracles. I settle for wagons that arrive and arrows that exist.",
          "choices": [
            { "label": "Offer help moving supplies to the battlements.", "effects": [{ "type": "flag", "key": "battlement_runs_available", "value": true }] },
            { "label": "Ask for a work-for-gear contract.", "effects": [{ "type": "flag", "key": "work_for_gear_enabled", "value": true }] }
          ]
        }
      ]
    }
  },
  {
    "id": "npc_mage_tower_scribe_orrin",
    "name": "Scribe Orrin",
    "role": "Mage Tower Scribe",
    "portraitPrompt": "fantasy character portrait, young scribe with spectacles and quills, rune-lit desk, scroll racks, painterly, no text",
    "dialogue": {
      "greeting": "If you brought blank scrolls, I can make them priceless. If you didn’t, please don’t bleed on my floor.",
      "nodes": [
        {
          "id": "orrin_scrolls",
          "text": "We’re binding ward-lines faster than we can copy them. Blank stock is life.",
          "choices": [
            { "label": "Deliver blank scroll stock.", "effects": [{ "type": "flag", "key": "scroll_delivery_ready", "value": true }] }
          ]
        }
      ]
    }
  }
]

/content/items_city_victory_window.json
[
  {
    "id": "blank_scroll_bundle",
    "name": "Blank Scroll Bundle",
    "type": "quest",
    "stackable": true,
    "value": 0,
    "description": "Clean vellum ready for ward scripts and battle charms."
  },
  {
    "id": "leather_panels",
    "name": "Leather Armor Panels",
    "type": "quest",
    "stackable": true,
    "value": 0,
    "description": "Pre-cut panels for sewing brigandine and light armor. Smells of tannin and sweat."
  },
  {
    "id": "work_contract_token",
    "name": "Work Contract Token",
    "type": "quest",
    "stackable": true,
    "value": 0,
    "description": "A stamped token proving you completed paid work for a shop or guild. Trade-in for gear, favors, or upgrades."
  },
  {
    "id": "field_ration_pack",
    "name": "Field Ration Pack",
    "type": "consumable",
    "stackable": true,
    "value": 8,
    "meta": { "heal": 3 },
    "description": "Bread, salted fat, and dried fruit. Not good. Not negotiable."
  }
]

/content/quests_city_victory_window.json
[
  {
    "id": "q_city_victory_report",
    "name": "Report to the War Council",
    "giverNpcId": "npc_councilor_vayne",
    "startAreaId": "k_city_drain_return",
    "objective": { "type": "setFlag", "key": "victory_window_open", "value": true },
    "grantsOnStart": [],
    "rewards": { "gold": 5, "xp": 18, "items": [{ "itemId": "field_ration_pack", "qty": 2 }] },
    "cooldownMinutes": 99999
  },
  {
    "id": "q_city_battlement_runs",
    "name": "Battlement Runs: Bolts and Bandages",
    "giverNpcId": "npc_quartermaster_brevin",
    "startAreaId": "c_quartermaster_depot",
    "objective": { "type": "setFlag", "key": "battlement_runs_completed", "value": true },
    "grantsOnStart": [{ "itemId": "field_ration_pack", "qty": 1 }],
    "rewards": {
      "gold": 8,
      "xp": 22,
      "items": [{ "itemId": "work_contract_token", "qty": 1 }, { "itemId": "arrow_bundle", "qty": 1 }]
    },
    "cooldownMinutes": 99999
  },
  {
    "id": "q_city_scroll_delivery",
    "name": "Mage Tower: Blank Scroll Delivery",
    "giverNpcId": "npc_mage_tower_scribe_orrin",
    "startAreaId": "c_mage_tower_scribes",
    "objective": { "type": "deliverItems", "items": [{ "itemId": "blank_scroll_bundle", "qty": 1 }], "toAreaId": "c_mage_tower_scribes" },
    "grantsOnStart": [],
    "rewards": {
      "gold": 6,
      "xp": 20,
      "items": [{ "itemId": "work_contract_token", "qty": 1 }]
    },
    "cooldownMinutes": 99999
  },
  {
    "id": "q_city_armoury_sewing",
    "name": "Armoury: Sew Leather Panels",
    "giverNpcId": "npc_quartermaster_brevin",
    "startAreaId": "c_armoury_workroom",
    "objective": { "type": "setFlag", "key": "armoury_sewing_done", "value": true },
    "grantsOnStart": [{ "itemId": "leather_panels", "qty": 1 }],
    "rewards": {
      "gold": 4,
      "xp": 18,
      "items": [{ "itemId": "work_contract_token", "qty": 1 }]
    },
    "cooldownMinutes": 99999
  },
  {
    "id": "q_city_work_for_gear_trade",
    "name": "Work-for-Gear: Trade Contract Tokens",
    "giverNpcId": "npc_quartermaster_brevin",
    "startAreaId": "c_quartermaster_depot",
    "objective": { "type": "setFlag", "key": "work_for_gear_trade_open", "value": true },
    "grantsOnStart": [],
    "rewards": { "gold": 0, "xp": 8, "items": [] },
    "cooldownMinutes": 99999
  },
  {
    "id": "q_overland_orders",
    "name": "Outside the Walls: Food and Timber",
    "giverNpcId": "npc_councilor_vayne",
    "startAreaId": "c_council_hall",
    "objective": { "type": "setFlag", "key": "overland_orders_active", "value": true },
    "grantsOnStart": [{ "itemId": "field_ration_pack", "qty": 2 }],
    "rewards": { "gold": 0, "xp": 25, "items": [{ "itemId": "work_contract_token", "qty": 1 }] },
    "cooldownMinutes": 99999
  }
]

/content/areas_city_victory_window.json
[
  {
    "id": "c_council_hall",
    "title": "Council Hall: War Map Chamber",
    "x": 2, "y": 1, "floorId": "city",
    "tileStyle": "council",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, medieval council war room, candlelit map table, tired officials, cinematic, no text",
    "description": "Candles gutter over a map scratched with siege lines.\n\nA clerk dips his quill in ink like it’s blood.\n\nCouncilor Vayne gestures you in. \"Report.\"",
    "actionsAvailable": {
      "talk": {
        "text": "Vayne’s gaze is a blade.",
        "choices": [
          { "id": "vayne", "label": "Talk to Councilor Vayne.", "effects": [{ "type": "openDialogue", "npcId": "npc_councilor_vayne" }] },
          { "id": "start_orders", "label": "Accept Outside-the-Walls orders.", "effects": [{ "type": "startJob", "jobId": "q_overland_orders" }] }
        ]
      }
    },
    "exits": { "s": "c_market_square", "e": "c_gate_inner_yard" }
  },
  {
    "id": "c_quartermaster_depot",
    "title": "Quartermaster Depot",
    "x": 1, "y": 0, "floorId": "city",
    "tileStyle": "warehouse",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, crate-stacked depot, soldiers hauling bundles, quartermaster with ledger, cinematic, no text",
    "description": "Crates rise like walls.\n\nQuartermaster Brevin barks numbers at runners.\n\nA sign reads: WORK EARNS WHAT COIN CAN’T.",
    "actionsAvailable": {
      "talk": {
        "text": "Brevin looks up without smiling.",
        "choices": [
          { "id": "brevin", "label": "Talk to Quartermaster Brevin.", "effects": [{ "type": "openDialogue", "npcId": "npc_quartermaster_brevin" }] },
          { "id": "start_runs", "label": "Start: Battlement Runs.", "effects": [{ "type": "startJob", "jobId": "q_city_battlement_runs" }] },
          {
            "id": "trade_tokens",
            "label": "Trade Work Contract Tokens for gear (opens shop exchange).",
            "requirements": [{ "type": "hasItem", "itemId": "work_contract_token", "qty": 1 }],
            "effects": [{ "type": "startJob", "jobId": "q_city_work_for_gear_trade" }]
          }
        ]
      }
    },
    "exits": { "e": "c_market_square", "n": "c_battlements_post", "w": "c_armoury_workroom" }
  },
  {
    "id": "c_mage_tower_scribes",
    "title": "Mage Tower: Scribes’ Room",
    "x": 3, "y": 0, "floorId": "city",
    "tileStyle": "tower",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, mage tower scribes room, scroll racks, glowing runes, scribes writing fast, cinematic, no text",
    "description": "Quills scratch like insects.\n\nScribe Orrin stacks blank vellum beside rune-lamps.\n\n\"If you brought scrolls,\" he says, \"you brought time.\"",
    "actionsAvailable": {
      "talk": {
        "text": "Orrin barely looks up.",
        "choices": [
          { "id": "orrin", "label": "Talk to Scribe Orrin.", "effects": [{ "type": "openDialogue", "npcId": "npc_mage_tower_scribe_orrin" }] },
          { "id": "start_scrolls", "label": "Start: Blank Scroll Delivery.", "effects": [{ "type": "startJob", "jobId": "q_city_scroll_delivery" }] }
        ]
      }
    },
    "exits": { "w": "c_market_square" }
  },
  {
    "id": "c_armoury_workroom",
    "title": "Armoury Workroom",
    "x": 0, "y": 0, "floorId": "city",
    "tileStyle": "armoury",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, armoury sewing benches, leather panels, awls, tired workers, cinematic, no text",
    "description": "Leather panels, needles, rivets.\n\nA master cobbler points at a pile: \"Stitch straight. Loose seams kill.\"",
    "actionsAvailable": {
      "craft": {
        "text": "You can assist with stitching and fitting.",
        "choices": [
          { "id": "start_sewing", "label": "Start: Sew Leather Panels.", "effects": [{ "type": "startJob", "jobId": "q_city_armoury_sewing" }] }
        ]
      }
    },
    "exits": { "e": "c_quartermaster_depot", "n": "c_gate_inner_yard" }
  },
  {
    "id": "c_battlements_post",
    "title": "Battlements Post",
    "x": 1, "y": 1, "floorId": "city",
    "tileStyle": "battlements",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, battlements in drizzle, archers, stacked arrows, distant siege fires, cinematic, no text",
    "description": "Archers stand in wet silence.\n\nBeyond the fields, siege fires glow like coals.\n\nA runner takes your bundle and nods once. \"Good. Again.\"",
    "choices": [
      {
        "id": "complete_runs",
        "label": "Complete the delivery for Battlement Runs (if active).",
        "requirements": [{ "type": "flagEquals", "key": "battlement_runs_available", "value": true }],
        "effects": [
          { "type": "flag", "key": "battlement_runs_completed", "value": true },
          { "type": "completeJob", "jobId": "q_city_battlement_runs" }
        ],
        "goToAreaId": "c_quartermaster_depot"
      }
    ],
    "exits": { "s": "c_quartermaster_depot" }
  }
]

Overland Campaign Act I

This kicks you outside the walls for food + timber, then tests missile/retreat combat across multiple squares.

/content/items_overland_act1.json
[
  {
    "id": "timber_bundle",
    "name": "Timber Bundle",
    "type": "quest",
    "stackable": true,
    "value": 0,
    "description": "Fresh-cut timber for barricades and repairs."
  },
  {
    "id": "grain_sack",
    "name": "Grain Sack",
    "type": "quest",
    "stackable": true,
    "value": 0,
    "description": "A heavy sack of grain. Worth its weight in time."
  },
  {
    "id": "spike_bundle",
    "name": "Field Spikes",
    "type": "tool",
    "stackable": true,
    "value": 18,
    "description": "Deployable spikes for slowing pursuers at chokepoints."
  },
  {
    "id": "hunting_bow",
    "name": "Hunting Bow",
    "type": "weapon",
    "stackable": false,
    "value": 35,
    "meta": { "damage": "1d6", "range": 3, "ammoType": "arrow" },
    "description": "A sturdier bow suited for field work and ambushes."
  }
]

/content/enemies_overland_act1.json
[
  {
    "id": "goblin_raider",
    "name": "Goblin Raider",
    "kind": "humanoid",
    "skill": 7,
    "stamina": 7,
    "meta": { "ranged": false },
    "loot": [{ "itemId": "gold_coin", "min": 0, "max": 6 }],
    "tags": ["goblin", "raider"]
  },
  {
    "id": "goblin_bowman",
    "name": "Goblin Bowman",
    "kind": "humanoid",
    "skill": 7,
    "stamina": 6,
    "meta": { "ranged": true, "range": 3, "damage": "1d6", "ammoType": "arrow" },
    "loot": [{ "itemId": "arrow_bundle", "min": 0, "max": 1 }, { "itemId": "gold_coin", "min": 0, "max": 5 }],
    "tags": ["goblin", "ranged"]
  },
  {
    "id": "goblin_raiding_party",
    "name": "Goblin Raiding Party",
    "kind": "group",
    "members": [
      { "enemyId": "goblin_raider", "count": 3 },
      { "enemyId": "goblin_bowman", "count": 1 }
    ],
    "meta": { "pursuit": { "speed": 1, "startDistance": 3, "morale": 8 } },
    "tags": ["goblin", "group", "pursuit"]
  }
]

/content/areas_overland_act1.json
[
  {
    "id": "o_city_gate_outside",
    "title": "Outside the Walls",
    "x": 10, "y": 0, "floorId": "overland",
    "tileStyle": "road_gate",
    "cover": "none",
    "blocksLOS": false,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, city gate behind, muddy road ahead, distant farms and tree line, cinematic, no text",
    "description": "The gate closes behind you with a sound like finality.\n\nAhead: farms, timber lines, and the uneasy quiet of a land pretending it isn’t at war.\n\nA militia runner hands you a slate: FOOD and WOOD. \"Bring both. Fast.\"",
    "choices": [
      { "id": "to_farms", "label": "Head to the farms for food.", "goToAreaId": "o_farm_lane" },
      { "id": "to_woodline", "label": "Head to the woodline for timber.", "goToAreaId": "o_woodline_edge" }
    ]
  },

  {
    "id": "o_farm_lane",
    "title": "Farm Lane",
    "x": 11, "y": 0, "floorId": "overland",
    "tileStyle": "farm",
    "cover": "low",
    "blocksLOS": false,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, farm lane with hedges, distant barn, scarecrow, overcast, cinematic, no text",
    "description": "Hedges line the lane. A barn sits like a tired animal.\n\nA farmer waves frantically from behind a cart. \"They’ve been skimming our stores at night.\"",
    "actionsAvailable": {
      "take": {
        "text": "You can load grain sacks onto a cart.",
        "choices": [
          { "id": "grain", "label": "Take a grain sack.", "effects": [{ "type": "addItem", "itemId": "grain_sack", "qty": 1 }] }
        ]
      },
      "talk": {
        "text": "The farmer points north.",
        "choices": [
          { "id": "hint", "label": "Listen.", "effects": [{ "type": "flag", "key": "goblin_raids_reported", "value": true }] }
        ]
      }
    },
    "exits": { "w": "o_city_gate_outside", "e": "o_farm_barnyard", "n": "o_hedge_crossing" }
  },

  {
    "id": "o_farm_barnyard",
    "title": "Barnyard",
    "x": 12, "y": 0, "floorId": "overland",
    "tileStyle": "farm",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, barnyard with stacked sacks, chickens scattering, muddy footprints, cinematic, no text",
    "description": "Sacks are stacked under tarp.\n\nSmall muddy footprints lead away toward the hedge line.\n\nYou hear distant yips — too organized for foxes.",
    "choices": [
      {
        "id": "ambush_trigger",
        "label": "Investigate the footprints.",
        "effects": [
          {
            "type": "startThreat",
            "threat": {
              "threatId": "t_goblin_raid_01",
              "enemyGroupId": "goblin_raiding_party",
              "distance": 3,
              "direction": "n",
              "speed": 1,
              "targetAreaId": "o_farm_barnyard",
              "hazards": []
            }
          }
        ],
        "goToAreaId": "o_goblin_raid_contact"
      }
    ],
    "exits": { "w": "o_farm_lane" }
  },

  {
    "id": "o_woodline_edge",
    "title": "Woodline Edge",
    "x": 11, "y": -1, "floorId": "overland",
    "tileStyle": "forest_edge",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, forest edge with tall trunks, fog, axe stump, cinematic, no text",
    "description": "Tall trunks and damp fog.\n\nFresh stumps show someone already worked here—recently.\n\nA crow calls once. Then stops.",
    "actionsAvailable": {
      "take": {
        "text": "You can cut and bundle timber.",
        "choices": [
          { "id": "timber", "label": "Collect a timber bundle.", "effects": [{ "type": "addItem", "itemId": "timber_bundle", "qty": 1 }, { "type": "addXP", "amount": 6 }] }
        ]
      }
    },
    "choices": [
      {
        "id": "raid_trigger",
        "label": "You hear yips in the trees… ready yourself.",
        "effects": [
          {
            "type": "startThreat",
            "threat": {
              "threatId": "t_goblin_raid_02",
              "enemyGroupId": "goblin_raiding_party",
              "distance": 3,
              "direction": "e",
              "speed": 1,
              "targetAreaId": "o_woodline_edge",
              "hazards": []
            }
          }
        ],
        "goToAreaId": "o_goblin_raid_contact"
      }
    ],
    "exits": { "s": "o_city_gate_outside", "n": "o_forest_track" }
  },

  {
    "id": "o_goblin_raid_contact",
    "title": "Goblin Raid Approaching",
    "x": 12, "y": -1, "floorId": "overland",
    "tileStyle": "open_field",
    "cover": "low",
    "blocksLOS": false,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, goblin raiding party emerging from hedge/trees, spears and bows, cinematic, no text",
    "description": "A goblin raiding party approaches.\n\nThey’re not charging blindly — they’re spreading, trying to surround.\n\nYou can manage distance if you act fast.",
    "choices": [
      {
        "id": "open_fire",
        "label": "1. Open fire with my bow.",
        "requirements": [
          { "type": "hasAnyItem", "itemIds": ["training_bow", "hunting_bow"], "qty": 1 },
          { "type": "hasAmmo", "ammoType": "arrow", "minCount": 1 }
        ],
        "effects": [
          { "type": "shootThreat", "threatId": "t_goblin_raid_01", "ammoType": "arrow", "ammoToConsume": 1, "damage": { "mode": "roll", "expr": "1d6" } },
          { "type": "advanceThreat", "threatId": "t_goblin_raid_01" }
        ],
        "goToAreaId": "o_raid_distance_loop"
      },
      {
        "id": "set_spikes",
        "label": "2. Set my spikes in front of me.",
        "requirements": [{ "type": "hasItem", "itemId": "spike_bundle", "qty": 1 }],
        "effects": [
          { "type": "removeItem", "itemId": "spike_bundle", "qty": 1 },
          { "type": "placeHazard", "threatId": "t_goblin_raid_01", "hazard": { "kind": "spikes", "damage": 2, "triggerAtDistance": 1 } },
          { "type": "advanceThreat", "threatId": "t_goblin_raid_01" }
        ],
        "goToAreaId": "o_raid_distance_loop"
      },
      {
        "id": "retreat_choice",
        "label": "3. Retreat (S/W/E) and ready bow.",
        "effects": [{ "type": "flag", "key": "raid_retreat_prompt", "value": true }],
        "goToAreaId": "o_raid_retreat_menu"
      },
      {
        "id": "fight_now",
        "label": "4. Stand and fight when they close.",
        "effects": [{ "type": "forceCombatFromThreat", "threatId": "t_goblin_raid_01" }],
        "goToAreaId": "o_raid_aftermath"
      }
    ]
  },

  {
    "id": "o_raid_retreat_menu",
    "title": "Choose Retreat Direction",
    "x": 12, "y": -2, "floorId": "overland",
    "tileStyle": "open_field",
    "cover": "none",
    "blocksLOS": false,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, adventurer backing away through muddy field, goblins closing, cinematic, no text",
    "description": "Retreat buys distance — but not forever.\n\nChoose a direction and keep your weapon ready.",
    "choices": [
      { "id": "ret_s", "label": "Retreat South.", "effects": [{ "type": "advanceThreat", "threatId": "t_goblin_raid_01" }], "goToAreaId": "o_city_gate_outside" },
      { "id": "ret_w", "label": "Retreat West.", "effects": [{ "type": "advanceThreat", "threatId": "t_goblin_raid_01" }], "goToAreaId": "o_farm_lane" },
      { "id": "ret_e", "label": "Retreat East.", "effects": [{ "type": "advanceThreat", "threatId": "t_goblin_raid_01" }], "goToAreaId": "o_farm_barnyard" }
    ]
  },

  {
    "id": "o_raid_distance_loop",
    "title": "Skirmish Distance",
    "x": 12, "y": -3, "floorId": "overland",
    "tileStyle": "open_field",
    "cover": "low",
    "blocksLOS": false,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, arrows flying across open ground, goblins weaving, cinematic, no text",
    "description": "You can keep them at range for a moment longer.\n\nIf you keep backing up and firing, you might break their nerve — or run out of space.",
    "choices": [
      {
        "id": "fire_again",
        "label": "Fire again, then retreat one square.",
        "requirements": [
          { "type": "hasAnyItem", "itemIds": ["training_bow", "hunting_bow"], "qty": 1 },
          { "type": "hasAmmo", "ammoType": "arrow", "minCount": 1 }
        ],
        "effects": [
          { "type": "shootThreat", "threatId": "t_goblin_raid_01", "ammoType": "arrow", "ammoToConsume": 1, "damage": { "mode": "roll", "expr": "1d6" } },
          { "type": "advanceThreat", "threatId": "t_goblin_raid_01" }
        ],
        "goToAreaId": "o_raid_retreat_menu"
      },
      {
        "id": "hold_ground",
        "label": "Hold ground and fight.",
        "effects": [{ "type": "forceCombatFromThreat", "threatId": "t_goblin_raid_01" }],
        "goToAreaId": "o_raid_aftermath"
      }
    ]
  },

  {
    "id": "o_raid_aftermath",
    "title": "After the Raid",
    "x": 12, "y": -4, "floorId": "overland",
    "tileStyle": "open_field",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, goblin bodies and discarded gear in mud, quiet after fight, cinematic, no text",
    "description": "The field goes quiet.\n\nIf you survived, you’ve earned something more valuable than timber: confidence.\n\nNow you must carry the supplies back before another party finds you.",
    "effectsOnEnter": [
      { "type": "flag", "key": "goblin_raid_defeated", "value": true },
      { "type": "addXP", "amount": 18 }
    ],
    "choices": [
      { "id": "return_city", "label": "Return to the city with supplies.", "goToAreaId": "o_city_gate_outside" },
      { "id": "push_further", "label": "Press deeper into the countryside (dangerous).", "goToAreaId": "o_forest_track" }
    ]
  },

  {
    "id": "o_forest_track",
    "title": "Forest Track",
    "x": 11, "y": -2, "floorId": "overland",
    "tileStyle": "forest",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, narrow forest track, fog, broken cart wheel, ominous, cinematic, no text",
    "description": "A broken cart wheel lies half-buried.\n\nThe track has been used recently — too recently.\n\nSomewhere ahead, you hear metal tapping stone: a signal, not an accident.",
    "choices": [
      {
        "id": "next_stage_tease",
        "label": "Follow the signal toward the raiders’ field camp (next stage).",
        "effects": [{ "type": "flag", "key": "overland_stage2_unlocked", "value": true }]
      }
    ],
    "exits": { "s": "o_woodline_edge" }
  }
]

What’s next when you say “continue” again

Overland Act II (Raiders’ Field Camp → Siege Lines):

You find a goblin forward camp supplying the siege.

You can burn stores / poison rations / free captive farmers (choices affect later battle morale + enemy numbers).

You uncover a tunnel survey pointing to a second under-route (links into the “princess/hostage swap” dungeon chain).

Ends with a field skirmish at the siege lines where you play a small but critical role.

Say continue and I’ll generate those files next (areas + enemies + items + the big branching choice that echoes into the final battle at the gates).

continue
Thought for 14s

Absolutely — here’s Overland Act II: Raiders’ Field Camp → Siege Lines, with the big branching sabotage choices that echo forward into the final battle at the gates and unlock the hostage-swap / “princess transfer” dungeon chain via a discovered tunnel survey.

You’ll get 5 drop-in files:

/content/items_overland_act2.json

/content/enemies_overland_act2.json

/content/npcs_overland_act2.json

/content/quests_overland_act2.json

/content/areas_overland_act2.json

/content/items_overland_act2.json
[
  {
    "id": "torch_bundle",
    "name": "Torch Bundle",
    "type": "tool",
    "stackable": true,
    "value": 8,
    "description": "Dry pitch torches. Useful for burning supplies… or lighting your own retreat."
  },
  {
    "id": "bitterroot_vial",
    "name": "Bitterroot Vial",
    "type": "tool",
    "stackable": true,
    "value": 0,
    "description": "A pungent herbal concentrate. In small doses it dulls pain. In soup pots it ruins an army’s day."
  },
  {
    "id": "camp_scout_badge",
    "name": "Camp Scout Badge",
    "type": "quest",
    "stackable": false,
    "value": 0,
    "description": "A crude badge used by goblin scouts. Wearing it might fool someone for a heartbeat."
  },
  {
    "id": "tunnel_survey_map",
    "name": "Tunnel Survey Map",
    "type": "quest",
    "stackable": false,
    "value": 0,
    "description": "A charcoal sketch marking a ‘second mouth’ into the city drains—and a deeper route labeled: RED KNIFE HOLD (TRANSFER)."
  },
  {
    "id": "siege_order_strip",
    "name": "Siege Order Strip",
    "type": "quest",
    "stackable": true,
    "value": 0,
    "description": "A bark-paper order: ‘Tomorrow: push ladders at dawn. If the orb is lost, hold until the Hold delivers the prize.’"
  },
  {
    "id": "shackle_key",
    "name": "Shackle Key",
    "type": "tool",
    "stackable": false,
    "value": 12,
    "description": "A small key for simple iron shackles. Not for cell locks—just cages and chains."
  },
  {
    "id": "smoke_jar",
    "name": "Smoke Jar",
    "type": "tool",
    "stackable": true,
    "value": 18,
    "description": "A clay jar that cracks into thick smoke when thrown. Cruder than pellets, but effective."
  }
]

/content/enemies_overland_act2.json
[
  {
    "id": "goblin_scout",
    "name": "Goblin Scout",
    "kind": "humanoid",
    "skill": 8,
    "stamina": 7,
    "meta": { "ranged": false, "special": "whistle_alarm" },
    "loot": [{ "itemId": "camp_scout_badge", "min": 0, "max": 1 }, { "itemId": "gold_coin", "min": 0, "max": 6 }],
    "tags": ["goblin", "scout"]
  },
  {
    "id": "goblin_cook",
    "name": "Goblin Camp Cook",
    "kind": "humanoid",
    "skill": 6,
    "stamina": 6,
    "meta": { "ranged": false, "special": "kettle_splash" },
    "loot": [{ "itemId": "bitterroot_vial", "min": 0, "max": 1 }, { "itemId": "gold_coin", "min": 0, "max": 4 }],
    "tags": ["goblin", "support"]
  },
  {
    "id": "orc_taskmaster",
    "name": "Orc Taskmaster",
    "kind": "humanoid",
    "skill": 10,
    "stamina": 14,
    "meta": { "ranged": false, "special": "cruel_shout" },
    "loot": [{ "itemId": "shackle_key", "min": 0, "max": 1 }, { "itemId": "gold_coin", "min": 3, "max": 12 }],
    "tags": ["orc", "camp"]
  },
  {
    "id": "goblin_sapper",
    "name": "Goblin Sapper",
    "kind": "humanoid",
    "skill": 8,
    "stamina": 8,
    "meta": { "ranged": false, "special": "firepot" },
    "loot": [{ "itemId": "smoke_jar", "min": 0, "max": 1 }, { "itemId": "gold_coin", "min": 1, "max": 8 }],
    "tags": ["goblin", "sapper"]
  },
  {
    "id": "siege_line_spearman",
    "name": "Siege-Line Spearman",
    "kind": "humanoid",
    "skill": 9,
    "stamina": 10,
    "meta": { "ranged": false },
    "loot": [{ "itemId": "gold_coin", "min": 1, "max": 10 }],
    "tags": ["orc", "siege"]
  },
  {
    "id": "siege_line_bow",
    "name": "Siege-Line Bowman",
    "kind": "humanoid",
    "skill": 8,
    "stamina": 8,
    "meta": { "ranged": true, "range": 3, "damage": "1d6", "ammoType": "arrow" },
    "loot": [{ "itemId": "arrow_bundle", "min": 0, "max": 1 }, { "itemId": "gold_coin", "min": 0, "max": 8 }],
    "tags": ["orc", "ranged", "siege"]
  },
  {
    "id": "camp_patrol",
    "name": "Camp Patrol",
    "kind": "group",
    "members": [
      { "enemyId": "goblin_scout", "count": 2 },
      { "enemyId": "goblin_sapper", "count": 1 }
    ],
    "meta": { "pursuit": { "speed": 1, "startDistance": 3, "morale": 8 } },
    "tags": ["goblin", "group", "pursuit"]
  },
  {
    "id": "taskmaster_detail",
    "name": "Taskmaster Detail",
    "kind": "group",
    "members": [
      { "enemyId": "orc_taskmaster", "count": 1 },
      { "enemyId": "goblin_scout", "count": 2 }
    ],
    "meta": { "pursuit": { "speed": 1, "startDistance": 2, "morale": 9 } },
    "tags": ["mixed", "group", "pursuit"]
  },
  {
    "id": "siege_skirmish_line",
    "name": "Siege Skirmish Line",
    "kind": "group",
    "members": [
      { "enemyId": "siege_line_spearman", "count": 2 },
      { "enemyId": "siege_line_bow", "count": 1 }
    ],
    "meta": { "pursuit": { "speed": 1, "startDistance": 3, "morale": 9 } },
    "tags": ["siege", "group", "pursuit"]
  }
]

/content/npcs_overland_act2.json
[
  {
    "id": "npc_captive_farmer_rill",
    "name": "Rill Dane",
    "role": "Captive Farmer (Knows Back Roads)",
    "portraitPrompt": "fantasy character portrait, exhausted farmer in torn shirt with rope burns, dirt-streaked face, defiant eyes, torchlit cage, painterly, no text",
    "dialogue": {
      "greeting": "Don’t talk loud. They like it when we beg.",
      "nodes": [
        {
          "id": "rill_info",
          "text": "They’re feeding the siege with our grain. And they’re moving a ‘prize’ through the old sinkholes—deeper than these woods. Red Knife Hold. That name keeps coming up.",
          "choices": [
            { "label": "Ask about the sinkholes route.", "effects": [{ "type": "flag", "key": "sinkhole_route_hint", "value": true }] },
            { "label": "Promise to free the captives.", "effects": [{ "type": "flag", "key": "farmers_rescue_promised", "value": true }] }
          ]
        }
      ]
    }
  }
]

/content/quests_overland_act2.json
[
  {
    "id": "q_overland_act2_field_camp",
    "name": "Overland II: Break the Raiders’ Field Camp",
    "giverNpcId": "npc_councilor_vayne",
    "startAreaId": "o_forest_track",
    "objective": { "type": "setFlag", "key": "overland_act2_complete", "value": true },
    "grantsOnStart": [],
    "rewards": { "gold": 10, "xp": 40, "items": [{ "itemId": "field_ration_pack", "qty": 2 }] },
    "cooldownMinutes": 99999
  },
  {
    "id": "q_free_farmers",
    "name": "Free the Captive Farmers",
    "giverNpcId": "npc_captive_farmer_rill",
    "startAreaId": "o_cage_pens",
    "objective": { "type": "setFlag", "key": "farmers_freed", "value": true },
    "grantsOnStart": [],
    "rewards": { "gold": 0, "xp": 26, "items": [{ "itemId": "work_contract_token", "qty": 1 }] },
    "cooldownMinutes": 99999
  },
  {
    "id": "q_siege_lines_recon",
    "name": "Recon the Siege Lines",
    "giverNpcId": "npc_councilor_vayne",
    "startAreaId": "o_siege_overlook",
    "objective": { "type": "setFlag", "key": "siege_lines_reconned", "value": true },
    "grantsOnStart": [],
    "rewards": { "gold": 0, "xp": 22, "items": [{ "itemId": "work_contract_token", "qty": 1 }] },
    "cooldownMinutes": 99999
  }
]

/content/areas_overland_act2.json
[
  {
    "id": "o_field_camp_edge",
    "title": "Forward Camp Edge",
    "x": 12, "y": -2, "floorId": "overland",
    "tileStyle": "forest_edge",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, hidden view of goblin camp through trees, smoke from cookfires, crude palisade, cinematic, no text",
    "description": "Through the trees you see it: a forward camp.\n\nLow palisade. Cookfires. Crates.\n\nNot a fortress—just a mouth feeding the siege.",
    "choices": [
      {
        "id": "stealth_in",
        "label": "Approach quietly (best with Muffle Steps).",
        "requirements": [{ "type": "knowsSpell", "spellId": "muffle_steps" }],
        "effects": [{ "type": "castSpell", "spellId": "muffle_steps" }, { "type": "addXP", "amount": 6 }],
        "goToAreaId": "o_camp_inner_lane"
      },
      {
        "id": "rush_in",
        "label": "Rush in before patrol loops back.",
        "effects": [{ "type": "addXP", "amount": 3 }],
        "goToAreaId": "o_camp_inner_lane"
      }
    ],
    "exits": { "w": "o_forest_track", "e": "o_camp_inner_lane" }
  },

  {
    "id": "o_camp_inner_lane",
    "title": "Camp Inner Lane",
    "x": 13, "y": -2, "floorId": "overland",
    "tileStyle": "camp",
    "cover": "low",
    "blocksLOS": false,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, muddy lane between crude tents, goblin scouts, lanterns, cinematic, no text",
    "description": "Tents sag in the rain. Goblins trot with bundles.\n\nA patrol whistles a crude rhythm.\n\nYou can still turn this into a quiet victory—or a loud one.",
    "choices": [
      {
        "id": "patrol",
        "label": "A patrol turns in—avoid or fight.",
        "effects": [
          {
            "type": "startThreat",
            "threat": {
              "threatId": "t_camp_patrol_01",
              "enemyGroupId": "camp_patrol",
              "distance": 3,
              "direction": "e",
              "speed": 1,
              "targetAreaId": "o_camp_inner_lane",
              "hazards": []
            }
          }
        ],
        "goToAreaId": "o_camp_patrol_contact"
      },
      { "id": "to_supplies", "label": "Slip toward the supply tents.", "goToAreaId": "o_supply_tents" },
      { "id": "to_kettle", "label": "Move toward the mess kettle.", "goToAreaId": "o_mess_kettle" },
      { "id": "to_cages", "label": "Head toward the cage pens.", "goToAreaId": "o_cage_pens" },
      { "id": "to_signal", "label": "Climb toward the signal post.", "goToAreaId": "o_signal_post" }
    ]
  },

  {
    "id": "o_camp_patrol_contact",
    "title": "Patrol Contact: Whistles and Teeth",
    "x": 14, "y": -2, "floorId": "overland",
    "tileStyle": "camp",
    "cover": "low",
    "blocksLOS": false,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, goblin patrol with lantern catching an intruder, tense moment, cinematic, no text",
    "description": "A goblin scout’s lantern swings your way.\n\nIt inhales—about to whistle.\n\nYou have one clean moment.",
    "choices": [
      {
        "id": "shoot",
        "label": "Shoot the scout before it whistles.",
        "requirements": [
          { "type": "hasAnyItem", "itemIds": ["training_bow", "hunting_bow"], "qty": 1 },
          { "type": "hasAmmo", "ammoType": "arrow", "minCount": 1 }
        ],
        "effects": [
          { "type": "shootThreat", "threatId": "t_camp_patrol_01", "ammoType": "arrow", "ammoToConsume": 1, "damage": { "mode": "roll", "expr": "1d6" } },
          { "type": "advanceThreat", "threatId": "t_camp_patrol_01" }
        ],
        "goToAreaId": "o_camp_inner_lane"
      },
      {
        "id": "smoke",
        "label": "Throw a smoke jar and slip away.",
        "requirements": [{ "type": "hasItem", "itemId": "smoke_jar", "qty": 1 }],
        "effects": [{ "type": "removeItem", "itemId": "smoke_jar", "qty": 1 }, { "type": "breakLOS", "durationTurns": 2 }],
        "goToAreaId": "o_supply_tents"
      },
      {
        "id": "fight",
        "label": "Fight.",
        "effects": [{ "type": "forceCombatFromThreat", "threatId": "t_camp_patrol_01" }],
        "goToAreaId": "o_camp_inner_lane"
      }
    ]
  },

  {
    "id": "o_supply_tents",
    "title": "Supply Tents",
    "x": 13, "y": -3, "floorId": "overland",
    "tileStyle": "camp_supplies",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, supply tents with crates, sacks of grain, stacked arrows, torchlight, cinematic, no text",
    "description": "Crates. Grain sacks. Spare spearheads.\n\nThis camp’s purpose is simple: keep the siege alive.\n\nBurning this would save lives. But it would also light you up like a beacon.",
    "actionsAvailable": {
      "investigate": {
        "text": "A crate is marked with charcoal: ‘TUNNEL—TOOLS’ and ‘TRANSFER—HOLD.’",
        "choices": [
          {
            "id": "take_map",
            "label": "Take the Tunnel Survey Map.",
            "effects": [
              { "type": "addItem", "itemId": "tunnel_survey_map", "qty": 1 },
              { "type": "flag", "key": "hostage_swap_chain_unlocked", "value": true },
              { "type": "addXP", "amount": 12 }
            ]
          },
          {
            "id": "take_orders",
            "label": "Take a strip of siege orders.",
            "effects": [{ "type": "addItem", "itemId": "siege_order_strip", "qty": 1 }, { "type": "addXP", "amount": 6 }]
          }
        ]
      }
    },
    "choices": [
      {
        "id": "burn_supplies",
        "label": "Burn the supplies (major sabotage).",
        "requirements": [{ "type": "hasItem", "itemId": "torch_bundle", "qty": 1 }],
        "effects": [
          { "type": "removeItem", "itemId": "torch_bundle", "qty": 1 },
          { "type": "flag", "key": "siege_supplies_burned", "value": true },
          { "type": "flag", "key": "enemy_morale_reduced", "value": true },
          { "type": "addXP", "amount": 18 }
        ],
        "goToAreaId": "o_alarm_rising"
      },
      {
        "id": "leave",
        "label": "Leave quietly.",
        "goToAreaId": "o_camp_inner_lane"
      }
    ]
  },

  {
    "id": "o_mess_kettle",
    "title": "Mess Kettle",
    "x": 14, "y": -3, "floorId": "overland",
    "tileStyle": "camp_kitchen",
    "cover": "low",
    "blocksLOS": false,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, camp cookfire with huge kettle, goblin cook stirring, greasy smoke, cinematic, no text",
    "description": "A goblin cook stirs a kettle that could feed fifty.\n\nIf you poison this, the siege line weakens tomorrow.\n\nBut you must be quick and quiet.",
    "choices": [
      {
        "id": "poison",
        "label": "Poison the kettle with Bitterroot.",
        "requirements": [{ "type": "hasItem", "itemId": "bitterroot_vial", "qty": 1 }],
        "effects": [
          { "type": "removeItem", "itemId": "bitterroot_vial", "qty": 1 },
          { "type": "flag", "key": "enemy_rations_poisoned", "value": true },
          { "type": "flag", "key": "enemy_stamina_penalty_next_battle", "value": true },
          { "type": "addXP", "amount": 16 }
        ],
        "goToAreaId": "o_alarm_rising"
      },
      {
        "id": "fight_cook",
        "label": "Confront the cook (risk a shout).",
        "effects": [{ "type": "startCombat", "enemyGroup": [{ "enemyId": "goblin_cook", "count": 1 }] }],
        "goToAreaId": "o_camp_inner_lane"
      },
      { "id": "leave", "label": "Leave quietly.", "goToAreaId": "o_camp_inner_lane" }
    ]
  },

  {
    "id": "o_cage_pens",
    "title": "Cage Pens",
    "x": 12, "y": -3, "floorId": "overland",
    "tileStyle": "camp_cages",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, crude cages with frightened farmers, orc taskmaster, rain and mud, cinematic, no text",
    "description": "Cages. People.\n\nAn orc taskmaster paces with a cudgel.\n\nA farmer meets your eyes—defiant, not broken.",
    "actionsAvailable": {
      "talk": {
        "text": "The captive whispers through the bars.",
        "choices": [
          { "id": "dialogue", "label": "Talk to Rill Dane.", "effects": [{ "type": "openDialogue", "npcId": "npc_captive_farmer_rill" }] },
          { "id": "start_q", "label": "Start: Free the Captive Farmers.", "effects": [{ "type": "startJob", "jobId": "q_free_farmers" }] }
        ]
      }
    },
    "choices": [
      {
        "id": "free_with_key",
        "label": "Free the captives (if you have a shackle key).",
        "requirements": [{ "type": "hasItem", "itemId": "shackle_key", "qty": 1 }],
        "effects": [
          { "type": "flag", "key": "farmers_freed", "value": true },
          { "type": "completeJob", "jobId": "q_free_farmers" },
          { "type": "addXP", "amount": 16 }
        ],
        "goToAreaId": "o_farmer_escape_lane"
      },
      {
        "id": "fight_taskmaster",
        "label": "Fight the taskmaster and his detail.",
        "effects": [
          {
            "type": "startThreat",
            "threat": {
              "threatId": "t_taskmaster_01",
              "enemyGroupId": "taskmaster_detail",
              "distance": 2,
              "direction": "e",
              "speed": 1,
              "targetAreaId": "o_cage_pens",
              "hazards": []
            }
          }
        ],
        "goToAreaId": "o_taskmaster_fight"
      }
    ]
  },

  {
    "id": "o_taskmaster_fight",
    "title": "Taskmaster Fight",
    "x": 12, "y": -4, "floorId": "overland",
    "tileStyle": "camp",
    "cover": "low",
    "blocksLOS": false,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, orc taskmaster raising cudgel, goblins swarming, muddy camp, cinematic, no text",
    "description": "The taskmaster bellows and charges.\n\nIf you drop him, you’ll have time to free the cages.\n\nIf you don’t, you’ll be the next lesson.",
    "choices": [
      {
        "id": "fight",
        "label": "Fight.",
        "effects": [{ "type": "forceCombatFromThreat", "threatId": "t_taskmaster_01" }],
        "goToAreaId": "o_taskmaster_after"
      }
    ]
  },

  {
    "id": "o_taskmaster_after",
    "title": "Keys in the Mud",
    "x": 12, "y": -5, "floorId": "overland",
    "tileStyle": "camp_cages",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, fallen orc, keys in mud, cages behind, cinematic, no text",
    "description": "The taskmaster falls.\n\nA key glints in the mud.\n\nThe cages rattle—not with begging, but with readiness.",
    "effectsOnEnter": [
      { "type": "addItem", "itemId": "shackle_key", "qty": 1 },
      { "type": "addXP", "amount": 12 }
    ],
    "choices": [
      {
        "id": "free_now",
        "label": "Free the captives.",
        "effects": [
          { "type": "flag", "key": "farmers_freed", "value": true },
          { "type": "completeJob", "jobId": "q_free_farmers" },
          { "type": "addXP", "amount": 10 }
        ],
        "goToAreaId": "o_farmer_escape_lane"
      },
      { "id": "leave", "label": "Leave before the alarm rises.", "goToAreaId": "o_alarm_rising" }
    ]
  },

  {
    "id": "o_farmer_escape_lane",
    "title": "Escape Lane: Back Roads",
    "x": 11, "y": -4, "floorId": "overland",
    "tileStyle": "hedgerow",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, hedgerow lane with fleeing captives, distant camp fires, cinematic, no text",
    "description": "The freed farmers slip into hedgerows like ghosts.\n\nRill whispers: \"There’s an overlook on the ridge. You’ll see the siege lines from there.\"\n\n\"And the sinkholes—those are real. The map you took… it’s a death road.\"",
    "choices": [
      { "id": "to_overlook", "label": "Go to the ridge overlook.", "goToAreaId": "o_siege_overlook" },
      { "id": "to_city", "label": "Escort them toward the city road.", "effects": [{ "type": "flag", "key": "farmers_reached_city", "value": true }], "goToAreaId": "o_city_gate_outside" }
    ]
  },

  {
    "id": "o_signal_post",
    "title": "Signal Post",
    "x": 14, "y": -4, "floorId": "overland",
    "tileStyle": "camp_signal",
    "cover": "low",
    "blocksLOS": false,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, crude signal post with horns and flags, goblin scout watching horizon, cinematic, no text",
    "description": "A crude post with horns and flags.\n\nOne good signal could call half the camp.\n\nOne broken signal buys you minutes.",
    "choices": [
      {
        "id": "cut_signal",
        "label": "Sabotage the signal horn (quiet).",
        "effects": [{ "type": "flag", "key": "camp_signal_sabotaged", "value": true }, { "type": "addXP", "amount": 10 }],
        "goToAreaId": "o_alarm_rising"
      },
      {
        "id": "fight_scout",
        "label": "Fight the scout on duty.",
        "effects": [{ "type": "startCombat", "enemyGroup": [{ "enemyId": "goblin_scout", "count": 1 }] }],
        "goToAreaId": "o_alarm_rising"
      }
    ]
  },

  {
    "id": "o_alarm_rising",
    "title": "Alarm Rising",
    "x": 13, "y": -5, "floorId": "overland",
    "tileStyle": "camp",
    "cover": "low",
    "blocksLOS": false,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, camp in chaos, torches flaring, goblins shouting, smoke, cinematic, no text",
    "description": "Somewhere a whistle shrieks.\n\nTorches flare.\n\nThe camp wakes like a kicked hive.\n\nYou must choose: slip away now—or risk a last look at the siege line itself.",
    "choices": [
      { "id": "to_overlook", "label": "Go to the ridge overlook (recon).", "goToAreaId": "o_siege_overlook" },
      { "id": "escape", "label": "Escape into the forest track.", "goToAreaId": "o_forest_track" }
    ]
  },

  {
    "id": "o_siege_overlook",
    "title": "Ridge Overlook",
    "x": 15, "y": -6, "floorId": "overland",
    "tileStyle": "ridge",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, high ridge overlooking siege lines, campfires like stars, city walls distant, cinematic, no text",
    "description": "From the ridge you see it: the siege line.\n\nLadders stacked like teeth. Fires in long rows. Shapes moving with purpose.\n\nYour city is a dark shape beyond—still standing.\n\nFor now.",
    "choices": [
      {
        "id": "start_recon",
        "label": "Complete recon of the siege lines (and count ladders).",
        "effects": [
          { "type": "flag", "key": "siege_lines_reconned", "value": true },
          { "type": "completeJob", "jobId": "q_siege_lines_recon" },
          { "type": "addXP", "amount": 12 }
        ],
        "goToAreaId": "o_siege_skirmish_prompt"
      }
    ],
    "exits": { "w": "o_forest_track" }
  },

  {
    "id": "o_siege_skirmish_prompt",
    "title": "A Small Role in a Big War",
    "x": 15, "y": -7, "floorId": "overland",
    "tileStyle": "ridge",
    "cover": "low",
    "blocksLOS": false,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, skirmish breaking out near siege stores, sentries turning, cinematic, no text",
    "description": "A small supply knot sits apart from the main line—guarded lightly.\n\nIf you strike it, you’ll thin tomorrow’s push.\n\nBut you might not walk away.",
    "choices": [
      {
        "id": "skirmish",
        "label": "Strike the siege skirmish line and flee.",
        "effects": [
          {
            "type": "startThreat",
            "threat": {
              "threatId": "t_siege_skirmish_01",
              "enemyGroupId": "siege_skirmish_line",
              "distance": 3,
              "direction": "n",
              "speed": 1,
              "targetAreaId": "o_siege_skirmish_prompt",
              "hazards": []
            }
          }
        ],
        "goToAreaId": "o_siege_skirmish_loop"
      },
      {
        "id": "withdraw",
        "label": "Withdraw and return to the city with what you learned.",
        "effects": [{ "type": "flag", "key": "overland_act2_complete", "value": true }],
        "goToAreaId": "o_city_gate_outside"
      }
    ]
  },

  {
    "id": "o_siege_skirmish_loop",
    "title": "Skirmish at Distance",
    "x": 15, "y": -8, "floorId": "overland",
    "tileStyle": "open_field",
    "cover": "low",
    "blocksLOS": false,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, arrows exchanged near siege stores, smoke rising, cinematic, no text",
    "description": "You can fight and retreat—buying distance square by square.\n\nIf you break them quickly, you escape.\n\nIf you linger, the full line notices.",
    "choices": [
      {
        "id": "fire_retreat",
        "label": "Fire, then retreat one square.",
        "requirements": [
          { "type": "hasAnyItem", "itemIds": ["training_bow", "hunting_bow"], "qty": 1 },
          { "type": "hasAmmo", "ammoType": "arrow", "minCount": 1 }
        ],
        "effects": [
          { "type": "shootThreat", "threatId": "t_siege_skirmish_01", "ammoType": "arrow", "ammoToConsume": 1, "damage": { "mode": "roll", "expr": "1d6" } },
          { "type": "advanceThreat", "threatId": "t_siege_skirmish_01" }
        ],
        "goToAreaId": "o_siege_escape_choice"
      },
      {
        "id": "fight",
        "label": "Fight to finish it.",
        "effects": [{ "type": "forceCombatFromThreat", "threatId": "t_siege_skirmish_01" }],
        "goToAreaId": "o_siege_skirmish_after"
      }
    ]
  },

  {
    "id": "o_siege_escape_choice",
    "title": "Escape Choice",
    "x": 14, "y": -8, "floorId": "overland",
    "tileStyle": "open_field",
    "cover": "none",
    "blocksLOS": false,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, adventurer sprinting through grass, city walls far away, pursuit behind, cinematic, no text",
    "description": "Distance is your friend.\n\nChoose a direction and don’t stop moving.",
    "choices": [
      { "id": "to_forest", "label": "Retreat toward the forest track.", "effects": [{ "type": "advanceThreat", "threatId": "t_siege_skirmish_01" }], "goToAreaId": "o_forest_track" },
      { "id": "to_city", "label": "Retreat toward the city road.", "effects": [{ "type": "advanceThreat", "threatId": "t_siege_skirmish_01" }], "goToAreaId": "o_city_gate_outside" }
    ]
  },

  {
    "id": "o_siege_skirmish_after",
    "title": "Quiet After Fire",
    "x": 15, "y": -9, "floorId": "overland",
    "tileStyle": "open_field",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, burned supply knot, fallen spears, smoke drifting, cinematic, no text",
    "description": "You leave them in the grass.\n\nSmoke rises from a small supply knot.\n\nIt isn’t a victory the bards will sing—but it’s one the city will feel.",
    "effectsOnEnter": [
      { "type": "flag", "key": "siege_knot_destroyed", "value": true },
      { "type": "flag", "key": "enemy_morale_reduced", "value": true },
      { "type": "addXP", "amount": 18 }
    ],
    "choices": [
      {
        "id": "complete",
        "label": "Return to the city with your report.",
        "effects": [{ "type": "flag", "key": "overland_act2_complete", "value": true }],
        "goToAreaId": "o_city_gate_outside"
      }
    ]
  }
]

What this Act II unlocks / changes later (flags you now have)

These are the big levers that should influence your next gate battle:

siege_supplies_burned → fewer ladders / fewer waves / slower siege tempo

enemy_rations_poisoned + enemy_stamina_penalty_next_battle → enemies start key fights “tired”

farmers_freed + farmers_reached_city → city morale + extra militia helpers

camp_signal_sabotaged → fewer reinforcements arrive during your next mission

hostage_swap_chain_unlocked (from tunnel_survey_map) → opens the Red Knife Hold transfer / hostage-swap dungeon chain (this is where the “princess/VIP” thread becomes a strategic choice)

If you say continue again, I’ll generate the next chapter as a full set of files:

Hostage-Swap Dungeon Chain (Red Knife Hold)

sinkholes → chalk caverns → guarded transfer tunnels

the hostage/princess and a swap offer (save one, or take a tactical advantage)

outcomes that directly change the final mass battle at the gates (enemy commander behaviour, allied morale, and whether the enemy gets a “second mouth” into the city).

continue
Thought for 15s

Here you go — Hostage-Swap Dungeon Chain: “Red Knife Hold” (sinkholes → chalk caverns → transfer tunnels → the hostage/princess swap decision), as drop-in JSON content.

You’ll get 5 files:

/content/items_redknife_hold.json

/content/enemies_redknife_hold.json

/content/npcs_redknife_hold.json

/content/quests_redknife_hold.json

/content/areas_redknife_hold.json

This chain is unlocked by your earlier flag: hostage_swap_chain_unlocked (from tunnel_survey_map).

/content/items_redknife_hold.json
[
  {
    "id": "redknife_transfer_orders",
    "name": "Red Knife Transfer Orders",
    "type": "quest",
    "stackable": true,
    "value": 0,
    "description": "Bark-paper orders stamped with a jagged red blade: ‘MOVE PRIZE BEFORE DAWN. NO WITNESSES.’"
  },
  {
    "id": "princess_locket",
    "name": "Silver Locket (Royal Crest)",
    "type": "quest",
    "stackable": false,
    "value": 0,
    "description": "A silver locket bearing a royal crest. Proof for the council—and leverage for alliances."
  },
  {
    "id": "redknife_cord",
    "name": "Red Knife Cord",
    "type": "quest",
    "stackable": true,
    "value": 0,
    "description": "A crimson cord worn by Red Knife captains. Guards hesitate when they see it."
  },
  {
    "id": "mine_charge",
    "name": "Mine Charge",
    "type": "tool",
    "stackable": true,
    "value": 0,
    "description": "A wrapped bundle of blasting powder with a crude fuse. Loud, dangerous, effective."
  },
  {
    "id": "chalk_shard",
    "name": "Chalk Shard",
    "type": "tool",
    "stackable": true,
    "value": 4,
    "description": "Bright chalk that marks stone. Useful for navigating the caverns and tracking patrol routes."
  },
  {
    "id": "gag_cloth",
    "name": "Gag Cloth",
    "type": "tool",
    "stackable": true,
    "value": 2,
    "description": "A strip of cloth. Useful to keep a freed captive from shouting at the wrong moment."
  },
  {
    "id": "ransom_token",
    "name": "Ransom Token",
    "type": "quest",
    "stackable": false,
    "value": 0,
    "description": "A stamped token used in hostage exchanges. Whoever holds it can claim ‘terms’—for a moment."
  },
  {
    "id": "ward_splinter_focus",
    "name": "Ward Splinter Focus",
    "type": "tool",
    "stackable": false,
    "value": 0,
    "description": "A refined ward-core splinter mounted in wire. It vibrates near weak supports and hidden runes."
  }
]


Note: If you already have ward_core_splinter, you can craft/upgrade it into ward_splinter_focus in-game later (optional). For now it’s a simple “tool-gate” for clever routes.

/content/enemies_redknife_hold.json
[
  {
    "id": "goblin_redknife",
    "name": "Red Knife Goblin",
    "kind": "humanoid",
    "skill": 8,
    "stamina": 8,
    "meta": { "ranged": false },
    "loot": [{ "itemId": "gold_coin", "min": 0, "max": 8 }],
    "tags": ["goblin", "redknife"]
  },
  {
    "id": "goblin_slingshot",
    "name": "Goblin Slingman",
    "kind": "humanoid",
    "skill": 8,
    "stamina": 7,
    "meta": { "ranged": true, "range": 3, "damage": "1d6", "ammoType": "stone" },
    "loot": [{ "itemId": "gold_coin", "min": 0, "max": 6 }],
    "tags": ["goblin", "ranged", "redknife"]
  },
  {
    "id": "orc_tunnel_guard",
    "name": "Orc Tunnel Guard",
    "kind": "humanoid",
    "skill": 10,
    "stamina": 12,
    "meta": { "ranged": false },
    "loot": [{ "itemId": "gold_coin", "min": 2, "max": 12 }],
    "tags": ["orc", "tunnel"]
  },
  {
    "id": "redknife_handler",
    "name": "Red Knife Handler",
    "kind": "humanoid",
    "skill": 9,
    "stamina": 9,
    "meta": { "special": "threaten_hostage" },
    "loot": [{ "itemId": "ransom_token", "min": 1, "max": 1 }, { "itemId": "gold_coin", "min": 2, "max": 10 }],
    "tags": ["goblin", "handler", "redknife"]
  },
  {
    "id": "captain_redknife_varg",
    "name": "Captain Varg of the Red Knife",
    "kind": "humanoid",
    "skill": 11,
    "stamina": 16,
    "meta": { "special": "bleed_cut" },
    "loot": [
      { "itemId": "redknife_cord", "min": 1, "max": 1 },
      { "itemId": "redknife_transfer_orders", "min": 1, "max": 1 },
      { "itemId": "gold_coin", "min": 6, "max": 22 }
    ],
    "tags": ["boss", "goblin", "redknife"]
  },
  {
    "id": "chalk_cavern_patrol",
    "name": "Chalk Cavern Patrol",
    "kind": "group",
    "members": [
      { "enemyId": "goblin_redknife", "count": 2 },
      { "enemyId": "goblin_slingshot", "count": 1 }
    ],
    "meta": { "pursuit": { "speed": 1, "startDistance": 3, "morale": 8 } },
    "tags": ["group", "pursuit", "redknife"]
  },
  {
    "id": "transfer_guard_detail",
    "name": "Transfer Guard Detail",
    "kind": "group",
    "members": [
      { "enemyId": "orc_tunnel_guard", "count": 1 },
      { "enemyId": "goblin_redknife", "count": 2 }
    ],
    "meta": { "pursuit": { "speed": 1, "startDistance": 2, "morale": 9 } },
    "tags": ["group", "pursuit", "tunnel"]
  }
]

/content/npcs_redknife_hold.json
[
  {
    "id": "npc_princess_seren",
    "name": "Lady Seren Arclight",
    "role": "Royal Hostage (Princess Thread)",
    "portraitPrompt": "fantasy character portrait, young noblewoman with dirt-streaked face, hair pinned back, chain marks on wrists, determined eyes, torchlit cavern, painterly, no text",
    "dialogue": {
      "greeting": "If you’re here to trade, don’t. If you’re here to fight, do it fast.",
      "nodes": [
        {
          "id": "seren_truth",
          "text": "They aren’t holding me for ransom alone. They want the gate opened from within. There’s a ‘second mouth’ into the drains—mapped, measured, ready.",
          "choices": [
            {
              "label": "Ask about the ‘second mouth’.",
              "effects": [{ "type": "flag", "key": "second_mouth_confirmed", "value": true }]
            },
            {
              "label": "Promise: I’ll get you out alive.",
              "effects": [{ "type": "flag", "key": "princess_rescue_promised", "value": true }]
            }
          ]
        }
      ]
    }
  },
  {
    "id": "npc_defector_runner_mip",
    "name": "Mip",
    "role": "Terrified Goblin Runner (Wants Amends)",
    "portraitPrompt": "fantasy character portrait, small goblin with torn hood, wide fearful eyes, holding a cracked token, cavern shadows, painterly, no text",
    "dialogue": {
      "greeting": "Don’t kill me! I know where they keep the iron wedges. I know where the roof is weak.",
      "nodes": [
        {
          "id": "mip_deal",
          "text": "Captain Varg will trade. He loves trades. But he cheats. Always.\n\nIf you want to collapse the tunnel, the ‘breath pillars’ are the key. Three of them.",
          "choices": [
            {
              "label": "Accept the info (mark weak supports).",
              "effects": [{ "type": "flag", "key": "breath_pillars_hint", "value": true }, { "type": "addItem", "itemId": "chalk_shard", "qty": 1 }]
            }
          ]
        }
      ]
    }
  }
]

/content/quests_redknife_hold.json
[
  {
    "id": "q_redknife_hold_main",
    "name": "Red Knife Hold: Break the Transfer",
    "giverNpcId": "npc_councilor_vayne",
    "startAreaId": "o_forest_track",
    "objective": { "type": "setFlag", "key": "redknife_hold_complete", "value": true },
    "grantsOnStart": [],
    "rewards": { "gold": 12, "xp": 55, "items": [{ "itemId": "work_contract_token", "qty": 1 }] },
    "cooldownMinutes": 99999
  },
  {
    "id": "q_rescue_princess",
    "name": "Rescue Lady Seren",
    "giverNpcId": "npc_princess_seren",
    "startAreaId": "r_hostage_vault",
    "objective": { "type": "setFlag", "key": "princess_rescued", "value": true },
    "grantsOnStart": [],
    "rewards": { "gold": 0, "xp": 40, "items": [{ "itemId": "princess_locket", "qty": 1 }] },
    "cooldownMinutes": 99999
  },
  {
    "id": "q_collapse_second_mouth",
    "name": "Collapse the Second Mouth",
    "giverNpcId": "npc_councilor_vayne",
    "startAreaId": "r_second_mouth_choke",
    "objective": { "type": "setFlag", "key": "second_mouth_collapsed", "value": true },
    "grantsOnStart": [],
    "rewards": { "gold": 0, "xp": 38, "items": [{ "itemId": "ward_sigiled_chain", "qty": 1 }] },
    "cooldownMinutes": 99999
  }
]

/content/areas_redknife_hold.json
[
  {
    "id": "r_sinkhole_ravine",
    "title": "Sinkhole Ravine",
    "x": 16, "y": -2, "floorId": "overland",
    "tileStyle": "sinkhole",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, forest ravine with yawning sinkhole, mist rising, broken roots, cinematic, no text",
    "description": "The ground here has collapsed into a ragged throat.\n\nCold air breathes up from below.\n\nThe tunnel survey map’s charcoal lines match the landscape too well for comfort.",
    "choices": [
      {
        "id": "enter",
        "label": "Climb down into the sinkhole.",
        "requirements": [{ "type": "flagEquals", "key": "hostage_swap_chain_unlocked", "value": true }],
        "effects": [{ "type": "addXP", "amount": 6 }],
        "goToAreaId": "r_chalk_caverns_entrance"
      },
      {
        "id": "mark",
        "label": "Mark the rim with chalk for your return.",
        "requirements": [{ "type": "hasAnyItem", "itemIds": ["glow_chalk", "chalk_shard"], "qty": 1 }],
        "effects": [{ "type": "flag", "key": "sinkhole_marked", "value": true }, { "type": "addXP", "amount": 4 }]
      }
    ],
    "exits": { "w": "o_forest_track" }
  },

  {
    "id": "r_chalk_caverns_entrance",
    "title": "Chalk Caverns: White Mouth",
    "x": 16, "y": -3, "floorId": "caves",
    "tileStyle": "chalk_cave",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, chalk-white cavern walls, dripping water, footprints, torch glow, cinematic, no text",
    "description": "The cave walls are chalk-white and damp.\n\nFootprints crisscross the powder like scribbles.\n\nSome prints are barefoot—prisoners.",
    "exits": { "s": "r_sinkhole_ravine", "n": "r_chalk_caverns_fork" },
    "actionsAvailable": {
      "investigate": {
        "text": "Fresh drag marks lead north, toward torchlight flicker.",
        "choices": [
          {
            "id": "keen_eye",
            "label": "Cast Keen Eye to identify patrol loops.",
            "requirements": [{ "type": "knowsSpell", "spellId": "keen_eye" }],
            "effects": [{ "type": "castSpell", "spellId": "keen_eye" }, { "type": "flag", "key": "chalk_patrols_mapped", "value": true }, { "type": "addXP", "amount": 8 }]
          }
        ]
      }
    }
  },

  {
    "id": "r_chalk_caverns_fork",
    "title": "Chalk Caverns Fork",
    "x": 16, "y": -4, "floorId": "caves",
    "tileStyle": "chalk_cave",
    "cover": "low",
    "blocksLOS": false,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, forked chalk cave passage, one side with smoke, one with silence, cinematic, no text",
    "description": "Two passages split.\n\nLeft: smoke and the smell of cookfires.\nRight: silence, but with scuffed chalk where someone tried to hide their trail.",
    "exits": { "s": "r_chalk_caverns_entrance", "w": "r_mip_hide", "e": "r_patrol_gallery" }
  },

  {
    "id": "r_mip_hide",
    "title": "A Whisper in the Chalk",
    "x": 15, "y": -4, "floorId": "caves",
    "tileStyle": "chalk_cave",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, small goblin hiding behind chalk pillar, terrified eyes, cinematic, no text",
    "description": "A small figure trembles behind a chalk pillar.\n\nIt raises both hands in surrender.\n\n\"Mip,\" it whispers. \"I don’t want the Red Knife to win.\"",
    "actionsAvailable": {
      "talk": {
        "text": "Mip glances down the tunnel like it expects death to arrive on schedule.",
        "choices": [
          { "id": "mip", "label": "Talk to Mip.", "effects": [{ "type": "openDialogue", "npcId": "npc_defector_runner_mip" }] }
        ]
      }
    },
    "exits": { "e": "r_chalk_caverns_fork" }
  },

  {
    "id": "r_patrol_gallery",
    "title": "Patrol Gallery",
    "x": 17, "y": -4, "floorId": "caves",
    "tileStyle": "chalk_cave",
    "cover": "low",
    "blocksLOS": false,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, cavern gallery with torch patrol, chalk dust in air, cinematic, no text",
    "description": "Torchlight sweeps over chalk dust.\n\nA patrol moves with practiced boredom.\n\nIf they spot you, the tunnels will fill with whistles.",
    "choices": [
      {
        "id": "muffle",
        "label": "Cast Muffle Steps and slip past.",
        "requirements": [{ "type": "knowsSpell", "spellId": "muffle_steps" }],
        "effects": [{ "type": "castSpell", "spellId": "muffle_steps" }, { "type": "addXP", "amount": 8 }],
        "goToAreaId": "r_redknife_outer"
      },
      {
        "id": "patrol_threat",
        "label": "A patrol turns in—avoid or fight.",
        "effects": [
          {
            "type": "startThreat",
            "threat": {
              "threatId": "t_chalk_patrol_01",
              "enemyGroupId": "chalk_cavern_patrol",
              "distance": 3,
              "direction": "n",
              "speed": 1,
              "targetAreaId": "r_patrol_gallery",
              "hazards": []
            }
          }
        ],
        "goToAreaId": "r_patrol_contact"
      }
    ],
    "exits": { "w": "r_chalk_caverns_fork" }
  },

  {
    "id": "r_patrol_contact",
    "title": "Chalk Patrol Contact",
    "x": 18, "y": -4, "floorId": "caves",
    "tileStyle": "chalk_cave",
    "cover": "low",
    "blocksLOS": false,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, goblin patrol with slingmen, lantern catching intruder, cinematic, no text",
    "description": "A goblin slingman raises a pouch of stones.\n\nA Red Knife goblin grins. \"Lost?\"",
    "choices": [
      {
        "id": "shoot_and_back",
        "label": "Shoot and retreat one square.",
        "requirements": [
          { "type": "hasAnyItem", "itemIds": ["training_bow", "hunting_bow"], "qty": 1 },
          { "type": "hasAmmo", "ammoType": "arrow", "minCount": 1 }
        ],
        "effects": [
          { "type": "shootThreat", "threatId": "t_chalk_patrol_01", "ammoType": "arrow", "ammoToConsume": 1, "damage": { "mode": "roll", "expr": "1d6" } },
          { "type": "advanceThreat", "threatId": "t_chalk_patrol_01" }
        ],
        "goToAreaId": "r_chalk_caverns_fork"
      },
      {
        "id": "fight",
        "label": "Fight.",
        "effects": [{ "type": "forceCombatFromThreat", "threatId": "t_chalk_patrol_01" }],
        "goToAreaId": "r_redknife_outer"
      }
    ]
  },

  {
    "id": "r_redknife_outer",
    "title": "Red Knife Outer Works",
    "x": 17, "y": -5, "floorId": "caves",
    "tileStyle": "cave_fort",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, crude underground fortifications, red cloth cords, iron wedges, torch smoke, cinematic, no text",
    "description": "Palisades and wedge-stakes hold the cave like rotten teeth.\n\nRed cords hang from belts and posts.\n\nYou hear a voice barking orders: \"TRANSFER BEFORE DAWN.\"",
    "exits": { "s": "r_patrol_gallery", "n": "r_transfer_tunnels", "e": "r_second_mouth_choke", "w": "r_hostage_vault" },
    "actionsAvailable": {
      "investigate": {
        "text": "You spot iron wedges hammered into support beams—temporary, rushed construction.",
        "choices": [
          {
            "id": "focus",
            "label": "If you have a Ward Splinter Focus, locate the weakest supports.",
            "requirements": [{ "type": "hasItem", "itemId": "ward_splinter_focus", "qty": 1 }],
            "effects": [{ "type": "flag", "key": "weak_supports_found", "value": true }, { "type": "addXP", "amount": 10 }]
          }
        ]
      }
    }
  },

  {
    "id": "r_hostage_vault",
    "title": "Hostage Vault",
    "x": 16, "y": -5, "floorId": "caves",
    "tileStyle": "vault",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, underground vault cell with noble hostage chained, guarded by handler, cinematic, no text",
    "description": "A reinforced vault door.\n\nInside: a noblewoman chained to a ringbolt, calm in the way only desperate courage can be.\n\nA handler watches with a ransom token in hand.",
    "actionsAvailable": {
      "talk": {
        "text": "The hostage meets your eyes without flinching.",
        "choices": [
          { "id": "princess", "label": "Talk to Lady Seren.", "effects": [{ "type": "openDialogue", "npcId": "npc_princess_seren" }] },
          { "id": "start_rescue", "label": "Start: Rescue Lady Seren.", "effects": [{ "type": "startJob", "jobId": "q_rescue_princess" }] }
        ]
      }
    },
    "choices": [
      {
        "id": "swap_offer",
        "label": "The handler offers a swap: ‘Leave the second mouth untouched, and she walks.’",
        "effects": [{ "type": "flag", "key": "swap_offer_presented", "value": true }],
        "goToAreaId": "r_swap_decision"
      },
      {
        "id": "fight_handler",
        "label": "Fight the handler now.",
        "effects": [{ "type": "startCombat", "enemyGroup": [{ "enemyId": "redknife_handler", "count": 1 }] }],
        "goToAreaId": "r_hostage_vault_after"
      }
    ],
    "exits": { "e": "r_redknife_outer" }
  },

  {
    "id": "r_hostage_vault_after",
    "title": "Chains Loosened",
    "x": 16, "y": -6, "floorId": "caves",
    "tileStyle": "vault",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, broken chain, hostage standing, torchlight, cinematic, no text",
    "description": "The handler falls.\n\nThe key is crude, but the chain gives.\n\nLady Seren exhales once—like she’s been holding her breath for days.",
    "choices": [
      {
        "id": "free",
        "label": "Free Lady Seren and prepare to move.",
        "effects": [
          { "type": "flag", "key": "princess_rescued", "value": true },
          { "type": "completeJob", "jobId": "q_rescue_princess" },
          { "type": "addItem", "itemId": "princess_locket", "qty": 1 },
          { "type": "addXP", "amount": 14 }
        ],
        "goToAreaId": "r_escape_choice"
      }
    ],
    "exits": { "e": "r_redknife_outer" }
  },

  {
    "id": "r_swap_decision",
    "title": "The Swap Decision",
    "x": 15, "y": -6, "floorId": "caves",
    "tileStyle": "vault",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, hostage handler holding token, shadows, tense negotiation, cinematic, no text",
    "description": "A ransom token flips between fingers.\n\n\"Trade,\" the handler whispers. \"No collapse. No fire. No heroics. Take her and go.\"\n\nYou understand the cost: if you accept, the enemy keeps a ‘second mouth’ into the city drains.\n\nIf you refuse, you can stop the infiltration—but she may die in the chaos.",
    "choices": [
      {
        "id": "accept_swap",
        "label": "Accept the swap: rescue Seren, leave the second mouth intact.",
        "effects": [
          { "type": "flag", "key": "hostage_swap_accepted", "value": true },
          { "type": "flag", "key": "enemy_second_mouth_active", "value": true },
          { "type": "flag", "key": "princess_rescued", "value": true },
          { "type": "completeJob", "jobId": "q_rescue_princess" },
          { "type": "addItem", "itemId": "princess_locket", "qty": 1 },
          { "type": "addXP", "amount": 18 }
        ],
        "goToAreaId": "r_escape_choice"
      },
      {
        "id": "refuse_swap",
        "label": "Refuse: attempt to collapse the second mouth (high risk).",
        "effects": [
          { "type": "flag", "key": "hostage_swap_refused", "value": true },
          { "type": "flag", "key": "collapse_plan_active", "value": true }
        ],
        "goToAreaId": "r_second_mouth_choke"
      },
      {
        "id": "trick_swap",
        "label": "Attempt a trick: use smoke to grab Seren and run, then collapse behind you (very high risk).",
        "requirements": [{ "type": "hasAnyItem", "itemIds": ["smoke_pellet", "smoke_jar"], "qty": 1 }],
        "effects": [{ "type": "flag", "key": "double_play_attempt", "value": true }],
        "goToAreaId": "r_double_play"
      }
    ]
  },

  {
    "id": "r_double_play",
    "title": "Double Play",
    "x": 15, "y": -7, "floorId": "caves",
    "tileStyle": "vault",
    "cover": "low",
    "blocksLOS": false,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, smoke filling vault, hostage pulled free, chaotic motion, cinematic, no text",
    "description": "Smoke blooms.\n\nFor a second, everything is shapes.\n\nYou pull Seren toward the tunnels while footsteps hammer toward you.",
    "choices": [
      {
        "id": "skill_check",
        "label": "Run the double play (luck check).",
        "effects": [
          {
            "type": "skillCheck",
            "skill": "luck",
            "dc": 9,
            "onPass": [
              { "type": "flag", "key": "princess_rescued", "value": true },
              { "type": "completeJob", "jobId": "q_rescue_princess" },
              { "type": "addItem", "itemId": "princess_locket", "qty": 1 },
              { "type": "flag", "key": "collapse_plan_active", "value": true },
              { "type": "addXP", "amount": 22 }
            ],
            "onFail": [
              { "type": "takeDamage", "amount": 3 },
              { "type": "flag", "key": "princess_injured", "value": true },
              { "type": "flag", "key": "collapse_plan_active", "value": true }
            ]
          }
        ],
        "goToAreaId": "r_second_mouth_choke"
      }
    ]
  },

  {
    "id": "r_transfer_tunnels",
    "title": "Transfer Tunnels",
    "x": 17, "y": -6, "floorId": "caves",
    "tileStyle": "tunnel",
    "cover": "low",
    "blocksLOS": false,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, narrow tunnel with carts and ropes, torchlight, guards, cinematic, no text",
    "description": "Carts. Ropes. Drag marks.\n\nThe transfer route is active.\n\nIf you let it run, the enemy gets what it wants—hostages moved beyond reach.",
    "choices": [
      {
        "id": "detail",
        "label": "A guard detail approaches—avoid or fight.",
        "effects": [
          {
            "type": "startThreat",
            "threat": {
              "threatId": "t_transfer_detail_01",
              "enemyGroupId": "transfer_guard_detail",
              "distance": 2,
              "direction": "n",
              "speed": 1,
              "targetAreaId": "r_transfer_tunnels",
              "hazards": []
            }
          }
        ],
        "goToAreaId": "r_transfer_contact"
      },
      {
        "id": "push_to_boss",
        "label": "Follow the tunnel to the Red Knife captain.",
        "goToAreaId": "r_captain_den"
      }
    ],
    "exits": { "s": "r_redknife_outer" }
  },

  {
    "id": "r_transfer_contact",
    "title": "Transfer Contact",
    "x": 18, "y": -6, "floorId": "caves",
    "tileStyle": "tunnel",
    "cover": "low",
    "blocksLOS": false,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, orc guard with goblins in tunnel, lantern glare, cinematic, no text",
    "description": "A lantern flares.\n\nAn orc squints. \"Smell… human.\"",
    "choices": [
      {
        "id": "shoot_retreat",
        "label": "Shoot and retreat (manage distance).",
        "requirements": [
          { "type": "hasAnyItem", "itemIds": ["training_bow", "hunting_bow"], "qty": 1 },
          { "type": "hasAmmo", "ammoType": "arrow", "minCount": 1 }
        ],
        "effects": [
          { "type": "shootThreat", "threatId": "t_transfer_detail_01", "ammoType": "arrow", "ammoToConsume": 1, "damage": { "mode": "roll", "expr": "1d6" } },
          { "type": "advanceThreat", "threatId": "t_transfer_detail_01" }
        ],
        "goToAreaId": "r_redknife_outer"
      },
      {
        "id": "fight",
        "label": "Fight.",
        "effects": [{ "type": "forceCombatFromThreat", "threatId": "t_transfer_detail_01" }],
        "goToAreaId": "r_transfer_tunnels"
      }
    ]
  },

  {
    "id": "r_captain_den",
    "title": "Captain’s Den: Red Knife Varg",
    "x": 18, "y": -7, "floorId": "caves",
    "tileStyle": "den",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, goblin captain with red cord, crude table with maps and tokens, torch smoke, cinematic, no text",
    "description": "A goblin captain stands over a map scratched into stone.\n\nA red cord hangs at his throat.\n\n\"You’re late,\" he says. \"Good. Late means desperate.\"",
    "choices": [
      {
        "id": "boss",
        "label": "Fight Captain Varg.",
        "effects": [{ "type": "startCombat", "enemyGroup": [{ "enemyId": "captain_redknife_varg", "count": 1 }] }],
        "goToAreaId": "r_captain_loot"
      },
      {
        "id": "parley",
        "label": "If you have a ransom token, attempt to parley (short window).",
        "requirements": [{ "type": "hasItem", "itemId": "ransom_token", "qty": 1 }],
        "effects": [{ "type": "flag", "key": "varg_parley_open", "value": true }],
        "goToAreaId": "r_swap_decision"
      }
    ],
    "exits": { "w": "r_transfer_tunnels" }
  },

  {
    "id": "r_captain_loot",
    "title": "Orders and Cord",
    "x": 18, "y": -8, "floorId": "caves",
    "tileStyle": "den",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, fallen goblin captain, red cord and orders on stone table, cinematic, no text",
    "description": "Varg collapses, still smiling.\n\nYou take the red cord and the transfer orders.\n\nThe orders mention the city drains like a lover’s name.",
    "effectsOnEnter": [
      { "type": "addItem", "itemId": "redknife_cord", "qty": 1 },
      { "type": "addItem", "itemId": "redknife_transfer_orders", "qty": 1 },
      { "type": "addXP", "amount": 22 }
    ],
    "choices": [
      {
        "id": "to_second_mouth",
        "label": "Move to the second mouth choke-point.",
        "goToAreaId": "r_second_mouth_choke"
      }
    ]
  },

  {
    "id": "r_second_mouth_choke",
    "title": "Second Mouth Choke-Point",
    "x": 17, "y": -7, "floorId": "caves",
    "tileStyle": "choke",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, narrow choke tunnel with heavy supports, iron wedges, marked pillars, cinematic, no text",
    "description": "A narrow choke tunnel held by thick supports.\n\nThree pillars carry the roof—‘breath pillars,’ as Mip called them.\n\nIf this collapses, the enemy loses its second mouth.\n\nBut collapse is never polite.",
    "actionsAvailable": {
      "investigate": {
        "text": "The supports show stress cracks in the chalk dust.",
        "choices": [
          {
            "id": "keen_eye",
            "label": "Cast Keen Eye to spot the most fragile pillar.",
            "requirements": [{ "type": "knowsSpell", "spellId": "keen_eye" }],
            "effects": [{ "type": "castSpell", "spellId": "keen_eye" }, { "type": "flag", "key": "pillar_targeted", "value": true }, { "type": "addXP", "amount": 10 }]
          }
        ]
      }
    },
    "choices": [
      {
        "id": "collapse_charge",
        "label": "Plant a mine charge and collapse the tunnel (stops infiltration).",
        "requirements": [{ "type": "hasItem", "itemId": "mine_charge", "qty": 1 }],
        "effects": [
          { "type": "removeItem", "itemId": "mine_charge", "qty": 1 },
          { "type": "flag", "key": "second_mouth_collapsed", "value": true },
          { "type": "flag", "key": "enemy_second_mouth_active", "value": false },
          { "type": "completeJob", "jobId": "q_collapse_second_mouth" },
          { "type": "addXP", "amount": 22 }
        ],
        "goToAreaId": "r_escape_choice"
      },
      {
        "id": "collapse_manual",
        "label": "Use the ‘breath pillars’ hint to collapse the tunnel (luck check).",
        "requirements": [{ "type": "flagEquals", "key": "breath_pillars_hint", "value": true }],
        "effects": [
          {
            "type": "skillCheck",
            "skill": "luck",
            "dc": 8,
            "onPass": [
              { "type": "flag", "key": "second_mouth_collapsed", "value": true },
              { "type": "flag", "key": "enemy_second_mouth_active", "value": false },
              { "type": "completeJob", "jobId": "q_collapse_second_mouth" },
              { "type": "addXP", "amount": 20 }
            ],
            "onFail": [
              { "type": "takeDamage", "amount": 3 },
              { "type": "flag", "key": "collapse_partial", "value": true }
            ]
          }
        ],
        "goToAreaId": "r_escape_choice"
      },
      {
        "id": "do_nothing",
        "label": "Don’t collapse it—leave quietly (enemy keeps the second mouth).",
        "effects": [{ "type": "flag", "key": "enemy_second_mouth_active", "value": true }, { "type": "addXP", "amount": 6 }],
        "goToAreaId": "r_escape_choice"
      }
    ],
    "exits": { "w": "r_redknife_outer", "n": "k_city_drain_return" }
  },

  {
    "id": "r_escape_choice",
    "title": "Escape: What You Save, What You Lose",
    "x": 16, "y": -7, "floorId": "caves",
    "tileStyle": "escape",
    "cover": "low",
    "blocksLOS": false,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, fleeing through chalk tunnel, distant collapse dust, torchlight fading, cinematic, no text",
    "description": "You move fast, because caves remember footsteps.\n\nIf the second mouth stands, the enemy can slip into the drains later.\n\nIf it fell, the enemy will be furious—and blind in that direction.\n\nEither way: the city must be told.",
    "choices": [
      {
        "id": "return_city",
        "label": "Return to the city drains and report to the council.",
        "effects": [
          { "type": "flag", "key": "redknife_hold_complete", "value": true },
          { "type": "addXP", "amount": 12 }
        ],
        "goToAreaId": "k_city_drain_return"
      }
    ]
  }
]

What this chapter guarantees (the big campaign consequences)

You now have a clean, explicit fork that can drive your gate battle logic later:

If player rescues Seren (princess_rescued = true)

City morale/alliances rise; you can unlock a Royal Support layer later (extra archers, better supplies, a mage escort, etc.)

If player collapses the “second mouth” (second_mouth_collapsed = true)

Prevents a later infiltration event during the siege

Makes the enemy’s next actions more “frontal” (more ladders, fewer sabotage events inside)

If player accepts the swap or leaves it intact (enemy_second_mouth_active = true)

Later, during the big gate battle, you can trigger:

“Drains Breach” mini-scenario inside the city (small skirmishes, fires, sabotage attempts)

Strong narrative consequence: “You saved her, but the city bleeds from below.”

If you say continue again, I’ll generate the Gate Battle Act as a structured multi-stage scenario with:

battlements defense + ladder waves

optional drains breach branch if enemy_second_mouth_active

a “small role in a big war” mission chain (cut ladder ropes, assassinate a banner captain, hold a chokepoint, deliver the orb/proof to mages)

end-of-act outcome flags that set up the next biome (sewers → caves → fortress chain continues).

continue, and add a few 'chase-down' quests where goblins who breach the defenses can be chased after through the streets and back alleys of the city by the player and dealt with, add consequences forletting too many slip by - "Guards are reporting incidents of arson around the city! Make sure the walls are defended!" escalating to "Guards are reporting civilian casualties around the city! Seek out the infiltrators with due haste!"
Thought for 11s

Got it — here’s the Gate Battle Act plus city chase-down quests with escalating consequences (arson → civilian casualties) if too many infiltrators slip through.

You’ll get 5 drop-in files:

/content/items_gate_battle.json

/content/enemies_gate_battle.json

/content/npcs_gate_battle.json

/content/quests_gate_battle.json

/content/areas_gate_battle.json

These assume your earlier flags may exist:

enemy_second_mouth_active (true/false)

optional soft modifiers: siege_supplies_burned, enemy_stamina_penalty_next_battle, camp_signal_sabotaged, farmers_reached_city, orb_taken etc.

/content/items_gate_battle.json
[
  {
    "id": "bucket_sand",
    "name": "Bucket of Sand",
    "type": "tool",
    "stackable": true,
    "value": 4,
    "description": "Thrown onto small fires to smother them quickly."
  },
  {
    "id": "hook_knife",
    "name": "Hook Knife",
    "type": "tool",
    "stackable": false,
    "value": 16,
    "description": "A curved blade used to cut ropes and ladder lashings from the battlements."
  },
  {
    "id": "signal_whistle_city",
    "name": "City Signal Whistle",
    "type": "tool",
    "stackable": false,
    "value": 0,
    "description": "A sharp whistle issued to trusted runners. Summons guards faster in street chases."
  },
  {
    "id": "burnt_oil_flask",
    "name": "Burnt Oil Flask",
    "type": "tool",
    "stackable": true,
    "value": 10,
    "description": "A blackened oil flask. Useful for making surfaces slippery or ruining torches and fuses."
  },
  {
    "id": "arsonist_tinder_pouch",
    "name": "Arsonist’s Tinder Pouch",
    "type": "quest",
    "stackable": true,
    "value": 0,
    "description": "Greasy tinder, pitch cloth, and small fire-starters. Proof of infiltrator intent."
  },
  {
    "id": "infiltrator_token_black",
    "name": "Black Infiltrator Token",
    "type": "quest",
    "stackable": true,
    "value": 0,
    "description": "A black token used to identify city infiltrators. Worth more than coin to the council."
  }
]

/content/enemies_gate_battle.json
[
  {
    "id": "orc_ladder_brute",
    "name": "Orc Ladder Brute",
    "kind": "humanoid",
    "skill": 10,
    "stamina": 14,
    "meta": { "ranged": false, "special": "shove_off_wall" },
    "loot": [{ "itemId": "gold_coin", "min": 1, "max": 10 }],
    "tags": ["orc", "siege"]
  },
  {
    "id": "goblin_ladder_runner",
    "name": "Goblin Ladder Runner",
    "kind": "humanoid",
    "skill": 8,
    "stamina": 7,
    "meta": { "ranged": false, "special": "scurry" },
    "loot": [{ "itemId": "infiltrator_token_black", "min": 0, "max": 1 }],
    "tags": ["goblin", "siege"]
  },
  {
    "id": "goblin_firebug",
    "name": "Goblin Firebug",
    "kind": "humanoid",
    "skill": 8,
    "stamina": 8,
    "meta": { "ranged": false, "special": "ignite" },
    "loot": [{ "itemId": "arsonist_tinder_pouch", "min": 1, "max": 2 }],
    "tags": ["goblin", "infiltrator", "arson"]
  },
  {
    "id": "goblin_alley_cutthroat",
    "name": "Goblin Alley Cutthroat",
    "kind": "humanoid",
    "skill": 9,
    "stamina": 9,
    "meta": { "ranged": false, "special": "dirty_stab" },
    "loot": [{ "itemId": "gold_coin", "min": 0, "max": 8 }, { "itemId": "infiltrator_token_black", "min": 1, "max": 1 }],
    "tags": ["goblin", "infiltrator"]
  },
  {
    "id": "orc_breach_sergeant",
    "name": "Orc Breach Sergeant",
    "kind": "humanoid",
    "skill": 11,
    "stamina": 16,
    "meta": { "ranged": false, "special": "banner_bellow" },
    "loot": [{ "itemId": "gold_coin", "min": 4, "max": 16 }],
    "tags": ["orc", "siege", "elite"]
  },

  {
    "id": "wave_gate_1",
    "name": "Gate Wave I (Ladders)",
    "kind": "group",
    "members": [
      { "enemyId": "goblin_ladder_runner", "count": 3 },
      { "enemyId": "orc_ladder_brute", "count": 1 }
    ],
    "meta": { "pursuit": { "speed": 1, "startDistance": 3, "morale": 8 } },
    "tags": ["wave", "siege", "group"]
  },
  {
    "id": "wave_gate_2",
    "name": "Gate Wave II (Brutes)",
    "kind": "group",
    "members": [
      { "enemyId": "orc_ladder_brute", "count": 2 },
      { "enemyId": "goblin_ladder_runner", "count": 2 }
    ],
    "meta": { "pursuit": { "speed": 1, "startDistance": 3, "morale": 9 } },
    "tags": ["wave", "siege", "group"]
  },
  {
    "id": "wave_gate_3",
    "name": "Gate Wave III (Sergeant Push)",
    "kind": "group",
    "members": [
      { "enemyId": "orc_breach_sergeant", "count": 1 },
      { "enemyId": "orc_ladder_brute", "count": 1 },
      { "enemyId": "goblin_ladder_runner", "count": 2 }
    ],
    "meta": { "pursuit": { "speed": 1, "startDistance": 2, "morale": 10 } },
    "tags": ["wave", "siege", "group", "elite"]
  },

  {
    "id": "infiltrator_pack_small",
    "name": "Infiltrator Pack (Small)",
    "kind": "group",
    "members": [
      { "enemyId": "goblin_alley_cutthroat", "count": 1 },
      { "enemyId": "goblin_firebug", "count": 1 }
    ],
    "meta": { "pursuit": { "speed": 1, "startDistance": 3, "morale": 8 } },
    "tags": ["infiltrator", "group", "pursuit"]
  },
  {
    "id": "infiltrator_pack_large",
    "name": "Infiltrator Pack (Large)",
    "kind": "group",
    "members": [
      { "enemyId": "goblin_alley_cutthroat", "count": 2 },
      { "enemyId": "goblin_firebug", "count": 1 }
    ],
    "meta": { "pursuit": { "speed": 1, "startDistance": 2, "morale": 9 } },
    "tags": ["infiltrator", "group", "pursuit"]
  }
]

/content/npcs_gate_battle.json
[
  {
    "id": "npc_captain_harl",
    "name": "Captain Harl",
    "role": "Battlements Captain",
    "portraitPrompt": "fantasy character portrait, battle-worn city captain on battlements, rain on armor, stern eyes, torchlight, painterly, no text",
    "dialogue": {
      "greeting": "No speeches. No prayers. Hold the wall.",
      "nodes": [
        {
          "id": "harl_orders",
          "text": "If goblins slip past, they’ll set the city alight. Chase them if you must—just don’t lose the gate for it.",
          "choices": [
            { "label": "Ask for tools.", "effects": [{ "type": "addItem", "itemId": "hook_knife", "qty": 1 }] },
            { "label": "Request a city whistle for chases.", "effects": [{ "type": "addItem", "itemId": "signal_whistle_city", "qty": 1 }] }
          ]
        }
      ]
    }
  },
  {
    "id": "npc_guard_serjeant_mara",
    "name": "Serjeant Mara",
    "role": "Street Patrol Leader",
    "portraitPrompt": "fantasy character portrait, city guard serjeant with spear and lantern, narrow alley, determined face, painterly, no text",
    "dialogue": {
      "greeting": "You again. Good. Means you’re still breathing.",
      "nodes": [
        {
          "id": "mara_arson",
          "text": "Reports of arson are coming in. If we don’t catch them early, it becomes bodies. That’s how it always goes.",
          "choices": [
            { "label": "Accept chase orders.", "effects": [{ "type": "flag", "key": "chase_orders_taken", "value": true }] }
          ]
        }
      ]
    }
  }
]

/content/quests_gate_battle.json
[
  {
    "id": "q_gate_battle_main",
    "name": "The Gate Battle: Hold the Battlements",
    "giverNpcId": "npc_captain_harl",
    "startAreaId": "g_battlements_wallwalk",
    "objective": { "type": "setFlag", "key": "gate_battle_complete", "value": true },
    "grantsOnStart": [],
    "rewards": { "gold": 15, "xp": 65, "items": [{ "itemId": "work_contract_token", "qty": 1 }] },
    "cooldownMinutes": 99999
  },

  {
    "id": "q_chase_arsonists",
    "name": "Chase-Down I: Arson in the Streets",
    "giverNpcId": "npc_guard_serjeant_mara",
    "startAreaId": "g_inner_gate_yard",
    "objective": { "type": "setFlag", "key": "arsonists_stopped", "value": true },
    "grantsOnStart": [],
    "rewards": { "gold": 6, "xp": 28, "items": [{ "itemId": "bucket_sand", "qty": 2 }] },
    "cooldownMinutes": 99999
  },

  {
    "id": "q_chase_casualties",
    "name": "Chase-Down II: Civilian Casualties Reported",
    "giverNpcId": "npc_guard_serjeant_mara",
    "startAreaId": "g_market_square_panic",
    "objective": { "type": "setFlag", "key": "infiltrators_eliminated", "value": true },
    "grantsOnStart": [],
    "rewards": { "gold": 8, "xp": 36, "items": [{ "itemId": "field_ration_pack", "qty": 2 }] },
    "cooldownMinutes": 99999
  },

  {
    "id": "q_drains_breach",
    "name": "Drains Breach: Seal the Second Mouth",
    "giverNpcId": "npc_councilor_vayne",
    "startAreaId": "g_drains_junction",
    "objective": { "type": "setFlag", "key": "drains_breach_resolved", "value": true },
    "grantsOnStart": [],
    "rewards": { "gold": 10, "xp": 45, "items": [{ "itemId": "ward_damper", "qty": 1 }] },
    "cooldownMinutes": 99999
  }
]

/content/areas_gate_battle.json
[
  {
    "id": "g_battlements_wallwalk",
    "title": "Battlements: Wallwalk",
    "x": 2, "y": 2, "floorId": "city",
    "tileStyle": "battlements",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, rain-slick battlements, archers, ladders below, siege fires beyond, cinematic, no text",
    "description": "Rain slicks the stones.\n\nBelow, ladders shift into place like the legs of insects.\n\nCaptain Harl’s voice cuts through the wind: \"Hold. The. Wall.\"",
    "actionsAvailable": {
      "talk": {
        "text": "Harl points to the parapet edge.",
        "choices": [
          { "id": "harl", "label": "Talk to Captain Harl.", "effects": [{ "type": "openDialogue", "npcId": "npc_captain_harl" }] },
          { "id": "start_main", "label": "Start: The Gate Battle.", "effects": [{ "type": "startJob", "jobId": "q_gate_battle_main" }] }
        ]
      }
    },
    "choices": [
      {
        "id": "begin_wave_1",
        "label": "The first ladders bite the stone…",
        "effects": [
          { "type": "flag", "key": "gate_wave_index", "value": 1 },
          {
            "type": "startThreat",
            "threat": {
              "threatId": "t_gate_wave_1",
              "enemyGroupId": "wave_gate_1",
              "distance": 3,
              "direction": "n",
              "speed": 1,
              "targetAreaId": "g_battlements_wallwalk",
              "hazards": []
            }
          }
        ],
        "goToAreaId": "g_gate_wave_loop"
      }
    ],
    "exits": { "s": "g_inner_gate_yard" }
  },

  {
    "id": "g_gate_wave_loop",
    "title": "Wall Defense: Ladder Clash",
    "x": 2, "y": 3, "floorId": "city",
    "tileStyle": "battlements",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, melee on battlements, ladder tops, goblins scrambling, orc brute climbing, cinematic, no text",
    "description": "Steel on stone. Breath on rain.\n\nYou can thin them at range, cut ladders, or let them climb and fight them on the wall.\n\nBut if you focus only here, some smaller shapes may slip below into the city.",
    "choices": [
      {
        "id": "shoot_then_hold",
        "label": "1. Fire from the parapet, then hold position.",
        "requirements": [
          { "type": "hasAnyItem", "itemIds": ["training_bow", "hunting_bow"], "qty": 1 },
          { "type": "hasAmmo", "ammoType": "arrow", "minCount": 1 }
        ],
        "effects": [
          { "type": "shootThreat", "threatId": "t_gate_wave_1", "ammoType": "arrow", "ammoToConsume": 1, "damage": { "mode": "roll", "expr": "1d6" } },
          { "type": "advanceThreat", "threatId": "t_gate_wave_1" }
        ],
        "goToAreaId": "g_gate_wave_loop"
      },
      {
        "id": "cut_ladder",
        "label": "2. Cut a ladder rope (reduces future wave strength).",
        "requirements": [{ "type": "hasItem", "itemId": "hook_knife", "qty": 1 }],
        "effects": [
          { "type": "flag", "key": "ladders_cut_count", "value": 1 },
          { "type": "addXP", "amount": 8 },
          { "type": "advanceThreat", "threatId": "t_gate_wave_1" }
        ],
        "goToAreaId": "g_gate_wave_loop"
      },
      {
        "id": "fight_now",
        "label": "3. Fight them on the wall.",
        "effects": [{ "type": "forceCombatFromThreat", "threatId": "t_gate_wave_1" }],
        "goToAreaId": "g_between_waves"
      },
      {
        "id": "pursue_slips",
        "label": "4. Break from the wall and chase infiltrators below (risk the battlements).",
        "effects": [
          { "type": "flag", "key": "infiltrators_slipped", "value": true },
          { "type": "addToCounter", "key": "infiltrators_slipped_count", "amount": 1 }
        ],
        "goToAreaId": "g_inner_gate_yard"
      }
    ]
  },

  {
    "id": "g_between_waves",
    "title": "Between Waves",
    "x": 2, "y": 4, "floorId": "city",
    "tileStyle": "battlements",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, brief lull on battlements, bodies cleared, distant horns, cinematic, no text",
    "description": "A lull—only a lull.\n\nThe next horn will come.\n\nA runner shouts from below: \"Small ones slipped through!\"",
    "choices": [
      {
        "id": "wave_2",
        "label": "Hold the wall for Wave II.",
        "effects": [
          { "type": "flag", "key": "gate_wave_index", "value": 2 },
          {
            "type": "startThreat",
            "threat": {
              "threatId": "t_gate_wave_2",
              "enemyGroupId": "wave_gate_2",
              "distance": 3,
              "direction": "n",
              "speed": 1,
              "targetAreaId": "g_battlements_wallwalk",
              "hazards": []
            }
          }
        ],
        "goToAreaId": "g_gate_wave_2_loop"
      },
      {
        "id": "chase_now",
        "label": "Go after the infiltrators now (street chase).",
        "effects": [{ "type": "addToCounter", "key": "infiltrators_slipped_count", "amount": 1 }],
        "goToAreaId": "g_inner_gate_yard"
      }
    ]
  },

  {
    "id": "g_gate_wave_2_loop",
    "title": "Wall Defense: Brute Push",
    "x": 2, "y": 5, "floorId": "city",
    "tileStyle": "battlements",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, orc brutes cresting ladders, shields up, goblins behind, cinematic, no text",
    "description": "Wave II hits harder.\n\nBrutes crest the ladder tops with shields raised.\n\nYou can keep them off—if you don’t split your attention too far.",
    "choices": [
      {
        "id": "fight",
        "label": "Fight.",
        "effects": [{ "type": "forceCombatFromThreat", "threatId": "t_gate_wave_2" }],
        "goToAreaId": "g_pre_final_wave"
      },
      {
        "id": "hold_but_slip",
        "label": "Hold the wall—accept that some goblins slip below.",
        "effects": [
          { "type": "addToCounter", "key": "infiltrators_slipped_count", "amount": 1 },
          { "type": "forceCombatFromThreat", "threatId": "t_gate_wave_2" }
        ],
        "goToAreaId": "g_pre_final_wave"
      }
    ]
  },

  {
    "id": "g_pre_final_wave",
    "title": "The Sergeant Push",
    "x": 2, "y": 6, "floorId": "city",
    "tileStyle": "battlements",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, orc sergeant with banner roaring, final push at the ladders, cinematic, no text",
    "description": "A heavier horn.\n\nA banner rises—orc sergeant at its heart.\n\nIf that banner reaches the wall, the line breaks.",
    "choices": [
      {
        "id": "start_wave_3",
        "label": "Meet the sergeant push head-on.",
        "effects": [
          {
            "type": "startThreat",
            "threat": {
              "threatId": "t_gate_wave_3",
              "enemyGroupId": "wave_gate_3",
              "distance": 2,
              "direction": "n",
              "speed": 1,
              "targetAreaId": "g_battlements_wallwalk",
              "hazards": []
            }
          }
        ],
        "goToAreaId": "g_final_wave_loop"
      }
    ]
  },

  {
    "id": "g_final_wave_loop",
    "title": "Final Wave: Banner on the Stones",
    "x": 2, "y": 7, "floorId": "city",
    "tileStyle": "battlements",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, elite orc sergeant fighting on battlements, banner whipping in rain, cinematic, no text",
    "description": "This one matters.\n\nIf you win, the wall holds.\n\nIf you lose, the fight moves into streets and fire.",
    "choices": [
      {
        "id": "fight",
        "label": "Fight the sergeant push.",
        "effects": [{ "type": "forceCombatFromThreat", "threatId": "t_gate_wave_3" }],
        "goToAreaId": "g_gate_battle_resolution"
      }
    ]
  },

  {
    "id": "g_gate_battle_resolution",
    "title": "Wall Held (For Now)",
    "x": 2, "y": 8, "floorId": "city",
    "tileStyle": "battlements",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, dawn light over battered battlements, exhausted defenders, smoke in distance, cinematic, no text",
    "description": "The horn fades.\n\nThe wall still stands.\n\nBut the city is not safe yet.\n\nIf infiltrators slipped through, the damage will already be starting.",
    "effectsOnEnter": [
      { "type": "completeJob", "jobId": "q_gate_battle_main" },
      { "type": "flag", "key": "gate_battle_complete", "value": true }
    ],
    "choices": [
      {
        "id": "check_infiltration",
        "label": "Descend into the city to deal with infiltrators.",
        "goToAreaId": "g_inner_gate_yard"
      }
    ],
    "exits": { "s": "g_inner_gate_yard" }
  },

  {
    "id": "g_inner_gate_yard",
    "title": "Inner Gate Yard",
    "x": 2, "y": 1, "floorId": "city",
    "tileStyle": "yard",
    "cover": "low",
    "blocksLOS": false,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, inner gate yard with panicked runners, lanterns, smoke plume, cinematic, no text",
    "description": "Runners collide in the yard.\n\nA guard points into the streets: \"They’re in the alleys!\"\n\nAnother shouts: \"Smoke by the granary!\"\n\nIf too many slipped through, tonight becomes fire… and then screams.",
    "actionsAvailable": {
      "talk": {
        "text": "Serjeant Mara is rallying patrols.",
        "choices": [
          { "id": "mara", "label": "Talk to Serjeant Mara.", "effects": [{ "type": "openDialogue", "npcId": "npc_guard_serjeant_mara" }] }
        ]
      }
    },
    "choices": [
      {
        "id": "spawn_infiltrators",
        "label": "Track the infiltrators (start a chase).",
        "effects": [
          {
            "type": "startThreat",
            "threat": {
              "threatId": "t_infiltrators_01",
              "enemyGroupId": "infiltrator_pack_small",
              "distance": 3,
              "direction": "e",
              "speed": 1,
              "targetAreaId": "g_back_alley_fork",
              "hazards": []
            }
          }
        ],
        "goToAreaId": "g_back_alley_fork"
      },
      {
        "id": "evaluate_consequences",
        "label": "Assess the damage reports.",
        "effects": [
          {
            "type": "conditional",
            "when": [
              { "key": "infiltrators_slipped_count", "op": ">=", "value": 2 }
            ],
            "then": [{ "type": "flag", "key": "arson_reports_active", "value": true }],
            "else": [{ "type": "flag", "key": "arson_reports_active", "value": false }]
          },
          {
            "type": "conditional",
            "when": [
              { "key": "infiltrators_slipped_count", "op": ">=", "value": 4 }
            ],
            "then": [{ "type": "flag", "key": "civilian_casualties_active", "value": true }],
            "else": [{ "type": "flag", "key": "civilian_casualties_active", "value": false }]
          }
        ]
      },
      {
        "id": "drains_branch",
        "label": "If the enemy has a second mouth, respond to the drains breach.",
        "requirements": [{ "type": "flagEquals", "key": "enemy_second_mouth_active", "value": true }],
        "effects": [{ "type": "startJob", "jobId": "q_drains_breach" }],
        "goToAreaId": "g_drains_junction"
      }
    ],
    "exits": { "n": "g_battlements_wallwalk", "e": "g_market_square_panic" }
  },

  {
    "id": "g_back_alley_fork",
    "title": "Back Alley Fork",
    "x": 3, "y": 1, "floorId": "city",
    "tileStyle": "alley",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, narrow wet alley splitting left and right, lantern swinging, footprints, cinematic, no text",
    "description": "Wet stones. Tight walls.\n\nYou hear a match-scratch somewhere ahead.\n\nThis is where chase work is done — fast choices, dirty corners.",
    "choices": [
      {
        "id": "open_fire",
        "label": "1. Open fire with my bow, then advance carefully.",
        "requirements": [
          { "type": "hasAnyItem", "itemIds": ["training_bow", "hunting_bow"], "qty": 1 },
          { "type": "hasAmmo", "ammoType": "arrow", "minCount": 1 }
        ],
        "effects": [
          { "type": "shootThreat", "threatId": "t_infiltrators_01", "ammoType": "arrow", "ammoToConsume": 1, "damage": { "mode": "roll", "expr": "1d6" } },
          { "type": "advanceThreat", "threatId": "t_infiltrators_01" }
        ],
        "goToAreaId": "g_chase_distance_loop"
      },
      {
        "id": "set_spikes",
        "label": "2. Set spikes at the fork to slow them.",
        "requirements": [{ "type": "hasItem", "itemId": "spike_bundle", "qty": 1 }],
        "effects": [
          { "type": "removeItem", "itemId": "spike_bundle", "qty": 1 },
          { "type": "placeHazard", "threatId": "t_infiltrators_01", "hazard": { "kind": "spikes", "damage": 2, "triggerAtDistance": 1 } },
          { "type": "advanceThreat", "threatId": "t_infiltrators_01" }
        ],
        "goToAreaId": "g_chase_distance_loop"
      },
      {
        "id": "retreat",
        "label": "3. Retreat and call guards (whistle).",
        "requirements": [{ "type": "hasItem", "itemId": "signal_whistle_city", "qty": 1 }],
        "effects": [{ "type": "flag", "key": "guards_join_chase", "value": true }, { "type": "addXP", "amount": 6 }],
        "goToAreaId": "g_chase_distance_loop"
      },
      {
        "id": "fight",
        "label": "4. Fight when they close.",
        "effects": [{ "type": "forceCombatFromThreat", "threatId": "t_infiltrators_01" }],
        "goToAreaId": "g_chase_aftermath"
      }
    ],
    "exits": { "w": "g_inner_gate_yard", "e": "g_chase_distance_loop" }
  },

  {
    "id": "g_chase_distance_loop",
    "title": "Chase Distance",
    "x": 4, "y": 1, "floorId": "city",
    "tileStyle": "alley",
    "cover": "low",
    "blocksLOS": false,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, goblins sprinting between alleys, lantern streaks, arrows flying, cinematic, no text",
    "description": "You manage distance in bursts: corner to corner.\n\nIf you lose them, the city pays.\n\nIf you press too hard, you run into a knife waiting in the dark.",
    "choices": [
      {
        "id": "fire_and_push",
        "label": "Fire again, then push forward.",
        "requirements": [
          { "type": "hasAnyItem", "itemIds": ["training_bow", "hunting_bow"], "qty": 1 },
          { "type": "hasAmmo", "ammoType": "arrow", "minCount": 1 }
        ],
        "effects": [
          { "type": "shootThreat", "threatId": "t_infiltrators_01", "ammoType": "arrow", "ammoToConsume": 1, "damage": { "mode": "roll", "expr": "1d6" } },
          { "type": "advanceThreat", "threatId": "t_infiltrators_01" }
        ],
        "goToAreaId": "g_chase_fire_scene"
      },
      {
        "id": "fight_now",
        "label": "Close and fight.",
        "effects": [{ "type": "forceCombatFromThreat", "threatId": "t_infiltrators_01" }],
        "goToAreaId": "g_chase_aftermath"
      },
      {
        "id": "lose_them",
        "label": "You hesitate… and they slip away into the dark.",
        "effects": [
          { "type": "addToCounter", "key": "infiltrators_slipped_count", "amount": 1 },
          { "type": "flag", "key": "infiltrators_got_away", "value": true }
        ],
        "goToAreaId": "g_escalation_reports"
      }
    ]
  },

  {
    "id": "g_chase_fire_scene",
    "title": "Smoke by the Granary",
    "x": 5, "y": 1, "floorId": "city",
    "tileStyle": "street",
    "cover": "low",
    "blocksLOS": false,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, granary street with smoke and small flames, goblin firebug fleeing, civilians shouting, cinematic, no text",
    "description": "A firebug bolts past a granary door.\n\nSmoke curls from fresh pitch.\n\nThis is the first warning. If you fail here, the next warning is bodies.",
    "choices": [
      {
        "id": "extinguish",
        "label": "Smother the fire quickly (bucket of sand).",
        "requirements": [{ "type": "hasItem", "itemId": "bucket_sand", "qty": 1 }],
        "effects": [
          { "type": "removeItem", "itemId": "bucket_sand", "qty": 1 },
          { "type": "flag", "key": "arson_prevented", "value": true },
          { "type": "addXP", "amount": 10 }
        ],
        "goToAreaId": "g_chase_aftermath"
      },
      {
        "id": "pursue_firebug",
        "label": "Ignore the flames and pursue the firebug.",
        "effects": [
          { "type": "addToCounter", "key": "arson_damage_count", "amount": 1 },
          { "type": "flag", "key": "arson_started", "value": true }
        ],
        "goToAreaId": "g_chase_aftermath"
      }
    ]
  },

  {
    "id": "g_chase_aftermath",
    "title": "Infiltrators Dealt With",
    "x": 6, "y": 1, "floorId": "city",
    "tileStyle": "street",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, alley aftermath, dropped tinder pouch, guard lanterns arriving, cinematic, no text",
    "description": "The chase ends in wet stone and hard breathing.\n\nYou gather proof: tinder pouches and black tokens.\n\nSerjeant Mara arrives with lanterns. \"Good. Now—how many got away?\"",
    "effectsOnEnter": [
      { "type": "flag", "key": "arsonists_stopped", "value": true },
      { "type": "completeJob", "jobId": "q_chase_arsonists" },
      { "type": "addXP", "amount": 14 }
    ],
    "choices": [
      { "id": "reports", "label": "Hear the latest reports.", "goToAreaId": "g_escalation_reports" },
      { "id": "back", "label": "Return to the Inner Gate Yard.", "goToAreaId": "g_inner_gate_yard" }
    ]
  },

  {
    "id": "g_escalation_reports",
    "title": "Escalating Reports",
    "x": 7, "y": 1, "floorId": "city",
    "tileStyle": "civic",
    "cover": "low",
    "blocksLOS": false,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, guard runner delivering report in rainy street, worried faces, cinematic, no text",
    "description": "A runner arrives soaked.\n\nIf you let infiltrators slip by, the city’s pain spreads in stages.\n\nFirst fire. Then blood.",
    "choices": [
      {
        "id": "arson_stage",
        "label": "If slip count is high, arson reports escalate.",
        "effects": [
          {
            "type": "conditional",
            "when": [{ "key": "infiltrators_slipped_count", "op": ">=", "value": 2 }],
            "then": [
              { "type": "flag", "key": "arson_reports_active", "value": true },
              { "type": "startJob", "jobId": "q_chase_arsonists" }
            ],
            "else": [{ "type": "flag", "key": "arson_reports_active", "value": false }]
          }
        ],
        "goToAreaId": "g_market_square_panic"
      },
      {
        "id": "casualties_stage",
        "label": "If slip count is very high, civilian casualties are reported.",
        "effects": [
          {
            "type": "conditional",
            "when": [{ "key": "infiltrators_slipped_count", "op": ">=", "value": 4 }],
            "then": [
              { "type": "flag", "key": "civilian_casualties_active", "value": true },
              { "type": "startJob", "jobId": "q_chase_casualties" }
            ],
            "else": [{ "type": "flag", "key": "civilian_casualties_active", "value": false }]
          }
        ],
        "goToAreaId": "g_market_square_panic"
      }
    ],
    "exits": { "w": "g_inner_gate_yard" }
  },

  {
    "id": "g_market_square_panic",
    "title": "Market Square: Panic and Smoke",
    "x": 3, "y": 0, "floorId": "city",
    "tileStyle": "market",
    "cover": "low",
    "blocksLOS": false,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, market square at night with smoke, civilians running, guards shouting, cinematic, no text",
    "description": "The market is chaos.\n\nIf fires started, merchants scream about burning stalls.\n\nIf casualties began, guards carry bodies under cloaks.\n\n\"Seek out the infiltrators with due haste!\"",
    "choices": [
      {
        "id": "hunt_more",
        "label": "Hunt another infiltrator pack through the alleys (harder).",
        "effects": [
          {
            "type": "startThreat",
            "threat": {
              "threatId": "t_infiltrators_02",
              "enemyGroupId": "infiltrator_pack_large",
              "distance": 2,
              "direction": "n",
              "speed": 1,
              "targetAreaId": "g_tenements_lane",
              "hazards": []
            }
          }
        ],
        "goToAreaId": "g_tenements_lane"
      },
      {
        "id": "resolve",
        "label": "If you’ve stopped enough packs, declare the streets secured.",
        "effects": [
          { "type": "flag", "key": "infiltrators_eliminated", "value": true },
          { "type": "completeJob", "jobId": "q_chase_casualties" },
          { "type": "addXP", "amount": 10 }
        ],
        "goToAreaId": "g_inner_gate_yard"
      }
    ],
    "exits": { "w": "g_inner_gate_yard" }
  },

  {
    "id": "g_tenements_lane",
    "title": "Tenements Lane",
    "x": 3, "y": -1, "floorId": "city",
    "tileStyle": "tenements",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, cramped tenement street, shuttered windows, blood on cobbles, lantern light, cinematic, no text",
    "description": "Shutters slam.\n\nA child cries somewhere above.\n\nA goblin laughs—then stops when it hears your boots.",
    "choices": [
      {
        "id": "fight",
        "label": "Fight the infiltrators here.",
        "effects": [{ "type": "forceCombatFromThreat", "threatId": "t_infiltrators_02" }],
        "goToAreaId": "g_infiltrator_cleanup"
      }
    ],
    "exits": { "s": "g_market_square_panic" }
  },

  {
    "id": "g_infiltrator_cleanup",
    "title": "Street Secured",
    "x": 3, "y": -2, "floorId": "city",
    "tileStyle": "civic",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, guards arriving, lanterns, captured goblin token, weary civilians, cinematic, no text",
    "description": "Guards arrive in numbers.\n\nThe immediate threat is gone.\n\nThe consequences remain—but you kept them from becoming worse.",
    "effectsOnEnter": [
      { "type": "addXP", "amount": 18 },
      { "type": "flag", "key": "infiltrators_eliminated", "value": true },
      { "type": "completeJob", "jobId": "q_chase_casualties" }
    ],
    "choices": [
      { "id": "back", "label": "Return to report in the Inner Gate Yard.", "goToAreaId": "g_inner_gate_yard" }
    ]
  },

  {
    "id": "g_drains_junction",
    "title": "Drains Junction: Wet Stone and Whispering",
    "x": 1, "y": 0, "floorId": "sewer",
    "tileStyle": "sewer",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, sewer junction with rushing water, lantern reflections, shadowy figures, cinematic, no text",
    "description": "If the enemy kept a ‘second mouth,’ this is where it bites.\n\nYou hear splashing that isn’t water.\n\nSomething is moving upstream.",
    "choices": [
      {
        "id": "resolve_breach",
        "label": "Seal the breach (fight in the drains).",
        "effects": [
          { "type": "startCombat", "enemyGroup": [{ "enemyId": "goblin_alley_cutthroat", "count": 2 }, { "enemyId": "goblin_firebug", "count": 1 }] },
          { "type": "flag", "key": "drains_breach_resolved", "value": true },
          { "type": "completeJob", "jobId": "q_drains_breach" },
          { "type": "addXP", "amount": 20 }
        ],
        "goToAreaId": "g_inner_gate_yard"
      }
    ],
    "exits": { "n": "k_city_drain_return" }
  }
]

How the escalation works (the exact feel you asked for)

You now have a clean “pressure valve” via infiltrators_slipped_count:

If infiltrators_slipped_count >= 2
→ “Guards are reporting incidents of arson around the city! Make sure the walls are defended!”
(starts q_chase_arsonists / pushes you toward granary smoke scenes)

If infiltrators_slipped_count >= 4
→ “Guards are reporting civilian casualties around the city! Seek out the infiltrators with due haste!”
(starts q_chase_casualties / tenements lane, more dangerous packs)

And the player feels the tradeoff:
hold the wall vs chase the small ones.

If you say continue again, I’ll generate the post-battle “Victory Window II” chapter:

council debrief + rewards based on which flags you achieved (orb, sabotage, farmers, second mouth)

a short set of rebuilding/triage quests (extinguish hotspots, guard funerals, interrogate captured token carriers)

then the campaign pivots to the next major arc: counterstrike raid beyond the siege line into a captured watchfort that becomes your next dungeon chain.

continue
Thought for 18s

Absolutely — here’s Post-Battle “Victory Window II” (council debrief + rewards that react to your flags), a set of triage / rebuild / interrogation quests, and then the pivot into the next arc: Counterstrike Raid → Captured Watchfort (a full mini-dungeon chain with combat, stealth, prisoners, and siege-plan theft).

You’ll get 9 drop-in files:

/content/items_victory_window_2.json

/content/npcs_victory_window_2.json

/content/quests_victory_window_2.json

/content/areas_victory_window_2.json

/content/items_watchfort_arc.json

/content/enemies_watchfort_arc.json

/content/npcs_watchfort_arc.json

/content/quests_watchfort_arc.json

/content/areas_watchfort_arc.json

These react to flags/counters you’ve already introduced:

princess_rescued, princess_injured

second_mouth_collapsed, enemy_second_mouth_active

siege_supplies_burned, enemy_stamina_penalty_next_battle, camp_signal_sabotaged, farmers_reached_city

infiltrators_slipped_count, arson_damage_count

gate_battle_complete, drains_breach_resolved

/content/items_victory_window_2.json
[
  {
    "id": "council_writ",
    "name": "Council Writ",
    "type": "quest",
    "stackable": false,
    "value": 0,
    "description": "A sealed writ granting you authority to requisition supplies and pass guarded streets during curfew."
  },
  {
    "id": "royal_writ",
    "name": "Royal Writ (Arclight Seal)",
    "type": "quest",
    "stackable": false,
    "value": 0,
    "description": "A royal seal that opens doors normally closed. Proof that you were trusted when it mattered."
  },
  {
    "id": "triage_bandage_roll",
    "name": "Triage Bandage Roll",
    "type": "consumable",
    "stackable": true,
    "value": 6,
    "description": "Rough linen bandages. Restores a small amount of stamina after a fight or stabilizes injuries."
  },
  {
    "id": "hotspot_report",
    "name": "Hotspot Report",
    "type": "quest",
    "stackable": true,
    "value": 0,
    "description": "A runner’s slate listing fires, breaches, and panic zones. Updated hourly—while the city lasts."
  },
  {
    "id": "infiltrator_confession",
    "name": "Infiltrator Confession",
    "type": "quest",
    "stackable": false,
    "value": 0,
    "description": "A scribbled confession naming a watchfort relay point and a ‘banner captain’ who coordinates signal fires."
  },
  {
    "id": "signal_lantern_blue",
    "name": "Blue Signal Lantern",
    "type": "tool",
    "stackable": false,
    "value": 0,
    "description": "A shuttered lantern for signaling friendly patrols during curfew. Used to avoid accidental arrests."
  }
]

/content/npcs_victory_window_2.json
[
  {
    "id": "npc_councilor_vayne",
    "name": "Councilor Vayne",
    "role": "War Council (Cold Strategist)",
    "portraitPrompt": "fantasy character portrait, stern city councilor in dark robes, candlelit council chamber, battle maps on table, painterly, no text",
    "dialogue": {
      "greeting": "You did not die. Excellent. Tell me what you changed.",
      "nodes": [
        {
          "id": "debrief",
          "text": "We measure victories in hours, not songs.\n\nIf you cut ladders, poisoned rations, burned supplies—we felt it.\n\nIf infiltrators slipped through, we feel that too.",
          "choices": [
            { "label": "Report everything honestly.", "effects": [{ "type": "flag", "key": "debrief_honest", "value": true }] },
            { "label": "Emphasize successes, omit failures.", "effects": [{ "type": "flag", "key": "debrief_spun", "value": true }] }
          ]
        }
      ]
    }
  },
  {
    "id": "npc_medic_sister_elin",
    "name": "Sister Elin",
    "role": "Field Medic (Triage Lead)",
    "portraitPrompt": "fantasy character portrait, weary healer in simple robes with bloodstained sleeves, infirmary lanterns, compassionate eyes, painterly, no text",
    "dialogue": {
      "greeting": "If you can stand, you can carry water or bandages.",
      "nodes": [
        {
          "id": "triage",
          "text": "We’re keeping people alive by inches.\n\nIf arson spreads, smoke kills faster than steel.\n\nIf knives are loose in the streets, the wounded never reach us.",
          "choices": [
            { "label": "Offer help immediately.", "effects": [{ "type": "flag", "key": "triage_volunteer", "value": true }] }
          ]
        }
      ]
    }
  },
  {
    "id": "npc_inquisitor_dran",
    "name": "Inquisitor Dran",
    "role": "Interrogator (Truth at Any Cost)",
    "portraitPrompt": "fantasy character portrait, hooded inquisitor with ink-stained gloves, small cell doorway, cold lantern light, painterly, no text",
    "dialogue": {
      "greeting": "They lie. You decide how quickly they stop.",
      "nodes": [
        {
          "id": "interrogate",
          "text": "We caught a token carrier. Not a fighter—an errand goblin.\n\nOffer mercy, offer fear, offer cleverness. Choose your method.",
          "choices": [
            { "label": "Promise leniency (if it talks).", "effects": [{ "type": "flag", "key": "interrogation_mercy", "value": true }] },
            { "label": "Threaten consequences (hard line).", "effects": [{ "type": "flag", "key": "interrogation_hardline", "value": true }] }
          ]
        }
      ]
    }
  }
]

/content/quests_victory_window_2.json
[
  {
    "id": "q_council_debrief",
    "name": "Victory Window II: Council Debrief",
    "giverNpcId": "npc_councilor_vayne",
    "startAreaId": "v_council_chamber",
    "objective": { "type": "setFlag", "key": "council_debrief_complete", "value": true },
    "grantsOnStart": [],
    "rewards": { "gold": 8, "xp": 22, "items": [{ "itemId": "council_writ", "qty": 1 }] },
    "cooldownMinutes": 99999
  },
  {
    "id": "q_triage_hotspots",
    "name": "Triage: Hotspots and Smoke",
    "giverNpcId": "npc_medic_sister_elin",
    "startAreaId": "v_infirmary_triage",
    "objective": { "type": "setFlag", "key": "hotspots_resolved", "value": true },
    "grantsOnStart": [],
    "rewards": { "gold": 0, "xp": 26, "items": [{ "itemId": "triage_bandage_roll", "qty": 2 }, { "itemId": "hotspot_report", "qty": 1 }] },
    "cooldownMinutes": 99999
  },
  {
    "id": "q_interrogate_token_carrier",
    "name": "Interrogation: The Token Carrier",
    "giverNpcId": "npc_inquisitor_dran",
    "startAreaId": "v_hold_cells",
    "objective": { "type": "setFlag", "key": "interrogation_complete", "value": true },
    "grantsOnStart": [],
    "rewards": { "gold": 0, "xp": 30, "items": [{ "itemId": "infiltrator_confession", "qty": 1 }] },
    "cooldownMinutes": 99999
  },
  {
    "id": "q_guard_memorial",
    "name": "Memorial Watch (Curfew Duty)",
    "giverNpcId": "npc_captain_harl",
    "startAreaId": "v_memorial_square",
    "objective": { "type": "setFlag", "key": "memorial_watch_complete", "value": true },
    "grantsOnStart": [],
    "rewards": { "gold": 5, "xp": 18, "items": [{ "itemId": "signal_lantern_blue", "qty": 1 }] },
    "cooldownMinutes": 99999
  }
]

/content/areas_victory_window_2.json
[
  {
    "id": "v_council_chamber",
    "title": "Council Chamber: Maps and Candles",
    "x": 0, "y": 2, "floorId": "city",
    "tileStyle": "council",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, city council chamber, war maps, candles, exhausted officials, cinematic, no text",
    "description": "War maps cover the table. Wax drips like slow blood.\n\nCouncilor Vayne waits with a quill.\n\nOutside: the city breathes smoke and relief.",
    "actionsAvailable": {
      "talk": {
        "text": "The council is ready to hear what you changed.",
        "choices": [
          { "id": "vayne", "label": "Talk to Councilor Vayne.", "effects": [{ "type": "openDialogue", "npcId": "npc_councilor_vayne" }] },
          { "id": "start", "label": "Start: Council Debrief.", "effects": [{ "type": "startJob", "jobId": "q_council_debrief" }] }
        ]
      }
    },
    "choices": [
      {
        "id": "debrief_rewards",
        "label": "Deliver your report and receive judgment.",
        "effects": [
          { "type": "flag", "key": "council_debrief_complete", "value": true },
          { "type": "completeJob", "jobId": "q_council_debrief" },

          {
            "type": "conditional",
            "when": [{ "key": "princess_rescued", "op": "==", "value": true }],
            "then": [
              { "type": "addItem", "itemId": "royal_writ", "qty": 1 },
              { "type": "addXP", "amount": 12 },
              { "type": "flag", "key": "royal_support_unlocked", "value": true }
            ],
            "else": []
          },

          {
            "type": "conditional",
            "when": [{ "key": "second_mouth_collapsed", "op": "==", "value": true }],
            "then": [
              { "type": "addXP", "amount": 10 },
              { "type": "flag", "key": "drains_risk_reduced", "value": true }
            ],
            "else": []
          },

          {
            "type": "conditional",
            "when": [{ "key": "enemy_second_mouth_active", "op": "==", "value": true }],
            "then": [
              { "type": "flag", "key": "drains_threat_persistent", "value": true },
              { "type": "addXP", "amount": 4 }
            ],
            "else": []
          },

          {
            "type": "conditional",
            "when": [{ "key": "infiltrators_slipped_count", "op": ">=", "value": 2 }],
            "then": [
              { "type": "flag", "key": "city_damage_high", "value": true },
              { "type": "addItem", "itemId": "hotspot_report", "qty": 1 }
            ],
            "else": [{ "type": "flag", "key": "city_damage_high", "value": false }]
          }
        ],
        "goToAreaId": "v_infirmary_triage"
      }
    ],
    "exits": { "s": "g_inner_gate_yard", "e": "v_infirmary_triage" }
  },

  {
    "id": "v_infirmary_triage",
    "title": "Infirmary: Triage by Lantern",
    "x": 1, "y": 2, "floorId": "city",
    "tileStyle": "infirmary",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, crowded infirmary, healers working by lantern light, raincoats steaming, cinematic, no text",
    "description": "Bandages, lanterns, and prayers.\n\nSister Elin doesn’t look up. \"If you’re not bleeding, you’re useful.\"",
    "actionsAvailable": {
      "talk": {
        "text": "Elin points to a slate of locations marked in charcoal.",
        "choices": [
          { "id": "elin", "label": "Talk to Sister Elin.", "effects": [{ "type": "openDialogue", "npcId": "npc_medic_sister_elin" }] },
          { "id": "start", "label": "Start: Triage Hotspots.", "effects": [{ "type": "startJob", "jobId": "q_triage_hotspots" }] }
        ]
      }
    },
    "choices": [
      {
        "id": "to_burnt_quarter",
        "label": "Take a hotspot report and head into the smoke.",
        "effects": [{ "type": "addItem", "itemId": "hotspot_report", "qty": 1 }],
        "goToAreaId": "v_burnt_quarter"
      },
      {
        "id": "to_cells",
        "label": "The inquisitor requests you at the holding cells.",
        "goToAreaId": "v_hold_cells"
      }
    ],
    "exits": { "w": "v_council_chamber", "s": "g_inner_gate_yard" }
  },

  {
    "id": "v_burnt_quarter",
    "title": "Burnt Quarter: Smoke and Embers",
    "x": 2, "y": 2, "floorId": "city",
    "tileStyle": "burnt",
    "cover": "low",
    "blocksLOS": false,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, smoky street with burning timber, civilians carrying buckets, guards shouting, cinematic, no text",
    "description": "Smoke stings your eyes.\n\nIf infiltrators slipped through, they left tinder behind.\n\nYou can save buildings—or chase shadows.",
    "choices": [
      {
        "id": "smother_fires",
        "label": "Smother fires and stabilize the quarter (good outcome).",
        "effects": [
          { "type": "flag", "key": "hotspots_resolved", "value": true },
          { "type": "completeJob", "jobId": "q_triage_hotspots" },
          { "type": "addXP", "amount": 14 }
        ],
        "goToAreaId": "v_memorial_square"
      },
      {
        "id": "fail_spread",
        "label": "You arrive too late — the fire spreads (city damage increases).",
        "effects": [
          { "type": "addToCounter", "key": "arson_damage_count", "amount": 1 },
          { "type": "flag", "key": "city_damage_high", "value": true }
        ],
        "goToAreaId": "v_memorial_square"
      }
    ]
  },

  {
    "id": "v_hold_cells",
    "title": "Holding Cells: Lantern and Ink",
    "x": 1, "y": 1, "floorId": "city",
    "tileStyle": "cells",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, narrow holding cells, hooded inquisitor, frightened captive goblin, cinematic, no text",
    "description": "The air smells of iron and ink.\n\nInquisitor Dran folds his sleeves.\n\n\"We need a location. A name. A route.\"",
    "actionsAvailable": {
      "talk": {
        "text": "Dran gestures toward a shaking goblin courier.",
        "choices": [
          { "id": "dran", "label": "Talk to Inquisitor Dran.", "effects": [{ "type": "openDialogue", "npcId": "npc_inquisitor_dran" }] },
          { "id": "start", "label": "Start: Interrogate the Token Carrier.", "effects": [{ "type": "startJob", "jobId": "q_interrogate_token_carrier" }] }
        ]
      }
    },
    "choices": [
      {
        "id": "interrogate_skill",
        "label": "Interrogate (skill check: mind).",
        "effects": [
          {
            "type": "skillCheck",
            "skill": "mind",
            "dc": 9,
            "onPass": [
              { "type": "flag", "key": "interrogation_complete", "value": true },
              { "type": "completeJob", "jobId": "q_interrogate_token_carrier" },
              { "type": "addItem", "itemId": "infiltrator_confession", "qty": 1 },
              { "type": "addXP", "amount": 18 },
              { "type": "flag", "key": "watchfort_arc_unlocked", "value": true }
            ],
            "onFail": [
              { "type": "flag", "key": "interrogation_complete", "value": true },
              { "type": "completeJob", "jobId": "q_interrogate_token_carrier" },
              { "type": "addXP", "amount": 10 },
              { "type": "flag", "key": "watchfort_arc_unlocked", "value": true },
              { "type": "flag", "key": "watchfort_alerted", "value": true }
            ]
          }
        ],
        "goToAreaId": "v_memorial_square"
      }
    ],
    "exits": { "n": "v_infirmary_triage", "e": "v_memorial_square" }
  },

  {
    "id": "v_memorial_square",
    "title": "Memorial Square: Quiet After Screams",
    "x": 2, "y": 1, "floorId": "city",
    "tileStyle": "memorial",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, memorial square with candles and cloaked bodies, guard lanterns, solemn rain, cinematic, no text",
    "description": "Cloaks over bodies.\n\nCandles gutter in rain.\n\nThis is the bill the city pays when enemies step inside the walls.",
    "choices": [
      {
        "id": "watch_duty",
        "label": "Take memorial watch duty (curfew patrol).",
        "effects": [
          { "type": "startJob", "jobId": "q_guard_memorial" },
          { "type": "flag", "key": "memorial_watch_complete", "value": true },
          { "type": "completeJob", "jobId": "q_guard_memorial" },
          { "type": "addXP", "amount": 12 }
        ],
        "goToAreaId": "v_postern_gate"
      }
    ],
    "exits": { "w": "v_hold_cells", "s": "g_market_square_panic" }
  },

  {
    "id": "v_postern_gate",
    "title": "Postern Gate: A Thin Door in a Thick Wall",
    "x": 0, "y": 0, "floorId": "city",
    "tileStyle": "postern",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, small hidden city gate at night, guards with lanterns, beyond is foggy field, cinematic, no text",
    "description": "A small gate—barely more than a slit.\n\nThe confession names a relay point: a captured watchfort beyond the siege line.\n\nStrike it, and the enemy’s coordination falters.\n\nFail, and you won’t make it back to this door.",
    "choices": [
      {
        "id": "depart",
        "label": "Begin the counterstrike: go beyond the walls to the captured watchfort.",
        "requirements": [{ "type": "flagEquals", "key": "watchfort_arc_unlocked", "value": true }],
        "effects": [{ "type": "addXP", "amount": 8 }],
        "goToAreaId": "w_no_mans_land"
      }
    ]
  }
]

WATCHFORT ARC (Counterstrike Raid)
/content/items_watchfort_arc.json
[
  {
    "id": "watchfort_gate_key",
    "name": "Watchfort Gate Key",
    "type": "tool",
    "stackable": false,
    "value": 0,
    "description": "A heavy iron key with old city markings. Fits the watchfort gate and some inner locks."
  },
  {
    "id": "siege_signal_codebook",
    "name": "Siege Signal Codebook",
    "type": "quest",
    "stackable": false,
    "value": 0,
    "description": "A greasy codebook detailing horn patterns and lantern colors for coordinating siege pushes."
  },
  {
    "id": "watchfort_map_slate",
    "name": "Watchfort Map Slate",
    "type": "quest",
    "stackable": false,
    "value": 0,
    "description": "A slate map showing patrol routes, a prisoners’ pen, and a ‘banner relay’ tower."
  },
  {
    "id": "rope_grapnel",
    "name": "Rope & Grapnel",
    "type": "tool",
    "stackable": false,
    "value": 14,
    "description": "Lets you scale low walls or reach alternative entries. Quiet if used carefully."
  },
  {
    "id": "oil_rag_bundle",
    "name": "Oil Rag Bundle",
    "type": "tool",
    "stackable": true,
    "value": 6,
    "description": "Oily rags for sabotage: smoke, slick floors, or ruined fuses."
  }
]

/content/enemies_watchfort_arc.json
[
  {
    "id": "goblin_watch_scout",
    "name": "Watchfort Scout",
    "kind": "humanoid",
    "skill": 8,
    "stamina": 8,
    "meta": { "ranged": true, "range": 3, "damage": "1d6", "ammoType": "arrow" },
    "loot": [{ "itemId": "gold_coin", "min": 0, "max": 8 }],
    "tags": ["goblin", "watchfort", "ranged"]
  },
  {
    "id": "orc_watch_sentinel",
    "name": "Orc Sentinel",
    "kind": "humanoid",
    "skill": 10,
    "stamina": 14,
    "meta": { "ranged": false, "special": "alarm_roar" },
    "loot": [{ "itemId": "gold_coin", "min": 2, "max": 12 }],
    "tags": ["orc", "watchfort"]
  },
  {
    "id": "hobgoblin_banner_captain",
    "name": "Banner Captain (Relay Commander)",
    "kind": "humanoid",
    "skill": 12,
    "stamina": 18,
    "meta": { "special": "signal_orders" },
    "loot": [{ "itemId": "siege_signal_codebook", "min": 1, "max": 1 }, { "itemId": "gold_coin", "min": 6, "max": 18 }],
    "tags": ["boss", "hobgoblin", "watchfort"]
  },
  {
    "id": "troll_chain_guard",
    "name": "Chain Troll (Pen Guard)",
    "kind": "monster",
    "skill": 11,
    "stamina": 20,
    "meta": { "special": "sweep_chain" },
    "loot": [{ "itemId": "gold_coin", "min": 4, "max": 14 }],
    "tags": ["troll", "watchfort", "elite"]
  },

  {
    "id": "outer_patrol",
    "name": "Outer Patrol",
    "kind": "group",
    "members": [
      { "enemyId": "goblin_watch_scout", "count": 2 },
      { "enemyId": "orc_watch_sentinel", "count": 1 }
    ],
    "meta": { "pursuit": { "speed": 1, "startDistance": 3, "morale": 8 } },
    "tags": ["group", "pursuit", "watchfort"]
  },
  {
    "id": "inner_patrol",
    "name": "Inner Patrol",
    "kind": "group",
    "members": [
      { "enemyId": "orc_watch_sentinel", "count": 2 }
    ],
    "meta": { "pursuit": { "speed": 1, "startDistance": 2, "morale": 9 } },
    "tags": ["group", "pursuit", "watchfort"]
  }
]

/content/npcs_watchfort_arc.json
[
  {
    "id": "npc_scout_lieut_kess",
    "name": "Lieutenant Kess",
    "role": "City Scout (Counterstrike Contact)",
    "portraitPrompt": "fantasy character portrait, city scout lieutenant in hooded cloak, rain beading on leather, watchfort silhouette behind, painterly, no text",
    "dialogue": {
      "greeting": "We don’t have an army for this. We have you.",
      "nodes": [
        {
          "id": "brief",
          "text": "That watchfort used to be ours. Now it’s a relay hub.\n\nSteal their signal book, free our people, and cut the banner captain out of the chain.\n\nIf you’re seen, the siege line will learn the postern gate exists.",
          "choices": [
            { "label": "Accept the raid.", "effects": [{ "type": "flag", "key": "watchfort_raid_accepted", "value": true }] }
          ]
        }
      ]
    }
  },
  {
    "id": "npc_prisoner_sergeant_bram",
    "name": "Sergeant Bram",
    "role": "Captured City Soldier",
    "portraitPrompt": "fantasy character portrait, bruised sergeant in torn tabard behind iron bars, stubborn eyes, torchlit pen, painterly, no text",
    "dialogue": {
      "greeting": "If you’re real, cut these bars. If you’re not, stop wasting my breath.",
      "nodes": [
        {
          "id": "intel",
          "text": "The banner captain lives in the relay tower.\n\nThere’s a hidden sally hatch behind the armory rack—old city workmanship.\n\nAnd there’s a troll on a chain. Don’t fight it in open ground.",
          "choices": [
            { "label": "Take the intel.", "effects": [{ "type": "flag", "key": "bram_intel_taken", "value": true }, { "type": "addXP", "amount": 8 }] }
          ]
        }
      ]
    }
  }
]

/content/quests_watchfort_arc.json
[
  {
    "id": "q_watchfort_raid",
    "name": "Counterstrike: The Captured Watchfort",
    "giverNpcId": "npc_scout_lieut_kess",
    "startAreaId": "w_no_mans_land",
    "objective": { "type": "setFlag", "key": "watchfort_raid_complete", "value": true },
    "grantsOnStart": [],
    "rewards": { "gold": 14, "xp": 60, "items": [{ "itemId": "work_contract_token", "qty": 1 }] },
    "cooldownMinutes": 99999
  },
  {
    "id": "q_watchfort_free_prisoners",
    "name": "Watchfort: Free the Prisoners",
    "giverNpcId": "npc_prisoner_sergeant_bram",
    "startAreaId": "w_prison_pen",
    "objective": { "type": "setFlag", "key": "watchfort_prisoners_freed", "value": true },
    "grantsOnStart": [],
    "rewards": { "gold": 0, "xp": 34, "items": [{ "itemId": "watchfort_gate_key", "qty": 1 }] },
    "cooldownMinutes": 99999
  },
  {
    "id": "q_watchfort_steal_signals",
    "name": "Watchfort: Steal the Signal Codebook",
    "giverNpcId": "npc_scout_lieut_kess",
    "startAreaId": "w_relay_tower_base",
    "objective": { "type": "setFlag", "key": "signal_codebook_taken", "value": true },
    "grantsOnStart": [],
    "rewards": { "gold": 0, "xp": 40, "items": [{ "itemId": "siege_signal_codebook", "qty": 1 }] },
    "cooldownMinutes": 99999
  }
]

/content/areas_watchfort_arc.json
[
  {
    "id": "w_no_mans_land",
    "title": "No-Man’s Land: Low Fog and Old Stakes",
    "x": 10, "y": -1, "floorId": "overland",
    "tileStyle": "fog_field",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, foggy field with broken stakes and distant watchfort silhouette, moonlight, cinematic, no text",
    "description": "Fog turns distance into lies.\n\nAhead: the captured watchfort, a black tooth against the sky.\n\nA city scout waits in the grass.",
    "actionsAvailable": {
      "talk": {
        "text": "Lieutenant Kess keeps their voice low.",
        "choices": [
          { "id": "kess", "label": "Talk to Lieutenant Kess.", "effects": [{ "type": "openDialogue", "npcId": "npc_scout_lieut_kess" }] },
          { "id": "start", "label": "Start: The Watchfort Raid.", "effects": [{ "type": "startJob", "jobId": "q_watchfort_raid" }] }
        ]
      }
    },
    "choices": [
      {
        "id": "approach",
        "label": "Approach the watchfort through the fog.",
        "effects": [{ "type": "addXP", "amount": 6 }],
        "goToAreaId": "w_watchfort_approach"
      }
    ],
    "exits": { "w": "v_postern_gate" }
  },

  {
    "id": "w_watchfort_approach",
    "title": "Watchfort Approach: Ditch and Wall",
    "x": 11, "y": -1, "floorId": "overland",
    "tileStyle": "watchfort_outer",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, stone watchfort with ditch, crude banners, sentries with lanterns, cinematic, no text",
    "description": "A shallow ditch circles the fort.\n\nSentries pace the parapet.\n\nYou can try a quiet climb, or bait patrols away.",
    "choices": [
      {
        "id": "grapnel",
        "label": "Use rope & grapnel to reach a blind section of wall.",
        "requirements": [{ "type": "hasItem", "itemId": "rope_grapnel", "qty": 1 }],
        "effects": [{ "type": "addXP", "amount": 8 }],
        "goToAreaId": "w_outer_wall_top"
      },
      {
        "id": "patrol",
        "label": "A patrol turns—avoid or fight.",
        "effects": [
          {
            "type": "startThreat",
            "threat": {
              "threatId": "t_outer_patrol_01",
              "enemyGroupId": "outer_patrol",
              "distance": 3,
              "direction": "n",
              "speed": 1,
              "targetAreaId": "w_watchfort_approach",
              "hazards": []
            }
          }
        ],
        "goToAreaId": "w_patrol_contact"
      }
    ]
  },

  {
    "id": "w_patrol_contact",
    "title": "Outer Patrol Contact",
    "x": 12, "y": -1, "floorId": "overland",
    "tileStyle": "watchfort_outer",
    "cover": "low",
    "blocksLOS": false,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, patrol lanterns flaring in fog, orc sentinel and goblin scouts, cinematic, no text",
    "description": "Lantern light snaps toward you.\n\nAn orc sentinel snorts and reaches for a horn.\n\nYou have one clean moment.",
    "choices": [
      {
        "id": "shoot",
        "label": "Shoot the horn-bearer, then retreat into cover.",
        "requirements": [
          { "type": "hasAnyItem", "itemIds": ["training_bow", "hunting_bow"], "qty": 1 },
          { "type": "hasAmmo", "ammoType": "arrow", "minCount": 1 }
        ],
        "effects": [
          { "type": "shootThreat", "threatId": "t_outer_patrol_01", "ammoType": "arrow", "ammoToConsume": 1, "damage": { "mode": "roll", "expr": "1d6" } },
          { "type": "advanceThreat", "threatId": "t_outer_patrol_01" }
        ],
        "goToAreaId": "w_watchfort_approach"
      },
      {
        "id": "fight",
        "label": "Fight.",
        "effects": [{ "type": "forceCombatFromThreat", "threatId": "t_outer_patrol_01" }],
        "goToAreaId": "w_outer_gatehouse"
      }
    ]
  },

  {
    "id": "w_outer_wall_top",
    "title": "Outer Wall Top",
    "x": 11, "y": -2, "floorId": "watchfort",
    "tileStyle": "wallwalk",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, wallwalk above ditch, wet stone, crude banners, moonlit, cinematic, no text",
    "description": "You pull yourself onto wet stone.\n\nBelow: the courtyard.\n\nAhead: the relay tower, a thinner silhouette against the sky.",
    "choices": [
      { "id": "to_gatehouse", "label": "Move along the wall to the gatehouse.", "goToAreaId": "w_outer_gatehouse" },
      { "id": "drop_courtyard", "label": "Drop into the courtyard (risk noise).", "effects": [{ "type": "flag", "key": "watchfort_noise_made", "value": true }], "goToAreaId": "w_courtyard" }
    ]
  },

  {
    "id": "w_outer_gatehouse",
    "title": "Gatehouse: Broken Portcullis",
    "x": 12, "y": -2, "floorId": "watchfort",
    "tileStyle": "gatehouse",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, gatehouse interior, broken portcullis, guard benches, torchlight, cinematic, no text",
    "description": "The portcullis is half-lowered—jammed.\n\nA good place to open from within.\n\nA bad place to be discovered.",
    "choices": [
      {
        "id": "inner_patrol",
        "label": "An inner patrol approaches.",
        "effects": [
          {
            "type": "startThreat",
            "threat": {
              "threatId": "t_inner_patrol_01",
              "enemyGroupId": "inner_patrol",
              "distance": 2,
              "direction": "e",
              "speed": 1,
              "targetAreaId": "w_outer_gatehouse",
              "hazards": []
            }
          }
        ],
        "goToAreaId": "w_gatehouse_contact"
      },
      { "id": "to_courtyard", "label": "Slip into the courtyard.", "goToAreaId": "w_courtyard" }
    ]
  },

  {
    "id": "w_gatehouse_contact",
    "title": "Gatehouse Contact",
    "x": 13, "y": -2, "floorId": "watchfort",
    "tileStyle": "gatehouse",
    "cover": "low",
    "blocksLOS": false,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, two orc sentinels entering gatehouse, lantern glare, cinematic, no text",
    "description": "Two orcs step in.\n\nOne sniffs the air.\n\nIf they shout, the whole fort wakes.",
    "choices": [
      { "id": "fight", "label": "Fight.", "effects": [{ "type": "forceCombatFromThreat", "threatId": "t_inner_patrol_01" }], "goToAreaId": "w_courtyard" }
    ]
  },

  {
    "id": "w_courtyard",
    "title": "Courtyard: Mud and Orders",
    "x": 12, "y": -3, "floorId": "watchfort",
    "tileStyle": "courtyard",
    "cover": "low",
    "blocksLOS": false,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, muddy courtyard, stacked crates, prisoners' pen visible, relay tower looming, cinematic, no text",
    "description": "Crates stamped with siege marks.\n\nA prisoners’ pen sits under a torch.\n\nThe relay tower rises above it all—where signals become slaughter.",
    "choices": [
      { "id": "to_prison", "label": "Go to the prisoners’ pen.", "goToAreaId": "w_prison_pen" },
      { "id": "to_armory", "label": "Slip into the armory.", "goToAreaId": "w_armory" },
      { "id": "to_tower", "label": "Approach the relay tower.", "goToAreaId": "w_relay_tower_base" }
    ],
    "actionsAvailable": {
      "investigate": {
        "text": "A slate map lies under a weight-stone.",
        "choices": [
          { "id": "take_map", "label": "Take the watchfort map slate.", "effects": [{ "type": "addItem", "itemId": "watchfort_map_slate", "qty": 1 }, { "type": "addXP", "amount": 10 }] }
        ]
      }
    }
  },

  {
    "id": "w_prison_pen",
    "title": "Prisoners’ Pen: Chain and Breath",
    "x": 11, "y": -3, "floorId": "watchfort",
    "tileStyle": "prison",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, prisoners behind bars, huge chained troll guarding, torch smoke, cinematic, no text",
    "description": "A troll on a chain.\n\nIt doesn’t look smart.\n\nIt looks patient.\n\nBehind it: prisoners—alive, barely.",
    "actionsAvailable": {
      "talk": {
        "text": "A sergeant grips the bars.",
        "choices": [
          { "id": "bram", "label": "Talk to Sergeant Bram.", "effects": [{ "type": "openDialogue", "npcId": "npc_prisoner_sergeant_bram" }] },
          { "id": "start", "label": "Start: Free the Prisoners.", "effects": [{ "type": "startJob", "jobId": "q_watchfort_free_prisoners" }] }
        ]
      }
    },
    "choices": [
      {
        "id": "bait_troll",
        "label": "Bait the troll into the corner, then slip the lock (luck check).",
        "effects": [
          {
            "type": "skillCheck",
            "skill": "luck",
            "dc": 9,
            "onPass": [
              { "type": "flag", "key": "watchfort_prisoners_freed", "value": true },
              { "type": "completeJob", "jobId": "q_watchfort_free_prisoners" },
              { "type": "addItem", "itemId": "watchfort_gate_key", "qty": 1 },
              { "type": "addXP", "amount": 18 }
            ],
            "onFail": [
              { "type": "startCombat", "enemyGroup": [{ "enemyId": "troll_chain_guard", "count": 1 }] },
              { "type": "flag", "key": "watchfort_noise_made", "value": true }
            ]
          }
        ],
        "goToAreaId": "w_courtyard"
      },
      {
        "id": "fight_troll",
        "label": "Fight the chained troll (dangerous).",
        "effects": [{ "type": "startCombat", "enemyGroup": [{ "enemyId": "troll_chain_guard", "count": 1 }] }],
        "goToAreaId": "w_prison_after"
      }
    ]
  },

  {
    "id": "w_prison_after",
    "title": "Pen Aftermath",
    "x": 11, "y": -4, "floorId": "watchfort",
    "tileStyle": "prison",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, fallen troll chain slack, prisoners stepping out, cinematic, no text",
    "description": "The chain slackens.\n\nThe prisoners move like people remembering how to be alive.\n\nBram nods once. \"Now hit their tower.\"",
    "effectsOnEnter": [
      { "type": "flag", "key": "watchfort_prisoners_freed", "value": true },
      { "type": "completeJob", "jobId": "q_watchfort_free_prisoners" },
      { "type": "addItem", "itemId": "watchfort_gate_key", "qty": 1 },
      { "type": "addXP", "amount": 16 }
    ],
    "choices": [
      { "id": "to_tower", "label": "Go to the relay tower.", "goToAreaId": "w_relay_tower_base" }
    ]
  },

  {
    "id": "w_armory",
    "title": "Armory: Old City Workmanship",
    "x": 13, "y": -3, "floorId": "watchfort",
    "tileStyle": "armory",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, cramped armory with racks, city-made hinges, hidden hatch outline, cinematic, no text",
    "description": "Racks of mixed gear.\n\nCity-made hinges—old quality.\n\nBehind a rack, you see it: an outline of a sally hatch.",
    "choices": [
      {
        "id": "open_hatch",
        "label": "Open the hidden sally hatch (escape route).",
        "effects": [{ "type": "flag", "key": "watchfort_escape_route_found", "value": true }, { "type": "addXP", "amount": 10 }],
        "goToAreaId": "w_escape_tunnel"
      },
      { "id": "back", "label": "Return to the courtyard.", "goToAreaId": "w_courtyard" }
    ]
  },

  {
    "id": "w_relay_tower_base",
    "title": "Relay Tower Base",
    "x": 12, "y": -4, "floorId": "watchfort",
    "tileStyle": "tower_base",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, stone tower stairwell, horn racks, lantern hooks, ominous climb, cinematic, no text",
    "description": "Horn racks on the wall.\n\nLantern hooks at measured intervals.\n\nThis is where signals become orders.",
    "choices": [
      { "id": "start", "label": "Start: Steal the Signal Codebook.", "effects": [{ "type": "startJob", "jobId": "q_watchfort_steal_signals" }], "goToAreaId": "w_relay_tower_top" },
      { "id": "climb", "label": "Climb to the top.", "goToAreaId": "w_relay_tower_top" }
    ]
  },

  {
    "id": "w_relay_tower_top",
    "title": "Relay Tower Top: The Banner Captain",
    "x": 12, "y": -5, "floorId": "watchfort",
    "tileStyle": "tower_top",
    "cover": "low",
    "blocksLOS": false,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, tower top with signal lanterns, horn, banner captain poised, storm sky, cinematic, no text",
    "description": "Lanterns. Horns. A banner captain.\n\nTheir hands are steady.\n\nIf they sound the wrong pattern, the next dawn at your city wall will be worse.",
    "choices": [
      {
        "id": "fight_boss",
        "label": "Fight the Banner Captain.",
        "effects": [{ "type": "startCombat", "enemyGroup": [{ "enemyId": "hobgoblin_banner_captain", "count": 1 }] }],
        "goToAreaId": "w_tower_loot"
      },
      {
        "id": "silent_take",
        "label": "Attempt to steal the codebook without a full fight (mind check).",
        "effects": [
          {
            "type": "skillCheck",
            "skill": "mind",
            "dc": 10,
            "onPass": [
              { "type": "flag", "key": "signal_codebook_taken", "value": true },
              { "type": "completeJob", "jobId": "q_watchfort_steal_signals" },
              { "type": "addItem", "itemId": "siege_signal_codebook", "qty": 1 },
              { "type": "addXP", "amount": 22 }
            ],
            "onFail": [
              { "type": "flag", "key": "watchfort_alerted", "value": true },
              { "type": "startCombat", "enemyGroup": [{ "enemyId": "hobgoblin_banner_captain", "count": 1 }] }
            ]
          }
        ],
        "goToAreaId": "w_tower_loot"
      }
    ]
  },

  {
    "id": "w_tower_loot",
    "title": "Signals Broken",
    "x": 12, "y": -6, "floorId": "watchfort",
    "tileStyle": "tower_top",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, fallen banner captain, codebook in hand, lanterns dimmed, cinematic, no text",
    "description": "The tower feels quieter.\n\nNot peaceful—just less coordinated.\n\nYou take the codebook. You take the future away from their hands.",
    "effectsOnEnter": [
      { "type": "flag", "key": "signal_codebook_taken", "value": true },
      { "type": "completeJob", "jobId": "q_watchfort_steal_signals" },
      { "type": "addItem", "itemId": "siege_signal_codebook", "qty": 1 },
      { "type": "addXP", "amount": 20 }
    ],
    "choices": [
      {
        "id": "escape",
        "label": "Escape the watchfort (use the hidden hatch if found).",
        "effects": [{ "type": "flag", "key": "watchfort_raid_complete", "value": true }, { "type": "completeJob", "jobId": "q_watchfort_raid" }],
        "goToAreaId": "w_escape_tunnel"
      },
      {
        "id": "escape_open",
        "label": "Escape through the courtyard (risk pursuit).",
        "effects": [
          { "type": "flag", "key": "watchfort_raid_complete", "value": true },
          { "type": "completeJob", "jobId": "q_watchfort_raid" },
          { "type": "flag", "key": "watchfort_pursuit_active", "value": true }
        ],
        "goToAreaId": "w_watchfort_approach"
      }
    ]
  },

  {
    "id": "w_escape_tunnel",
    "title": "Escape Tunnel: Cold Air, Fast Feet",
    "x": 11, "y": -6, "floorId": "watchfort",
    "tileStyle": "tunnel",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, narrow escape tunnel, distant torchlight behind, breath fog, cinematic, no text",
    "description": "A thin tunnel leading back toward the fog field.\n\nIf you’re quick, you vanish.\n\nIf you’re slow, you become a lesson.",
    "choices": [
      {
        "id": "return_city",
        "label": "Return to the postern gate with prisoners and codebook.",
        "effects": [
          { "type": "flag", "key": "watchfort_returned", "value": true },
          { "type": "addXP", "amount": 14 }
        ],
        "goToAreaId": "v_postern_gate"
      }
    ]
  }
]

How this “Victory Window II → Watchfort” arc changes your next siege chapter

You now have story-tight levers for the next phase:

City pressure & consequences

infiltrators_slipped_count >= 2 and/or arson_damage_count > 0 → more rebuild / panic quests later, fewer supplies

city_damage_high = true → council may restrict aid, or demand harsher patrols

drains_threat_persistent = true → sewer incidents remain a recurring threat until you finally seal/clear them

Counterstrike benefits

signal_codebook_taken = true → reduces siege “coordination” later (fewer simultaneous attacks, delayed ladder pushes)

watchfort_prisoners_freed = true → adds allied help (militia knowledge, a scout bonus, or a future companion)

watchfort_alerted = true → next raid nodes start harder (extra patrols, faster alarms)

If you say continue again, I’ll generate the next big step:

Return debrief (codebook delivered, prisoners welcomed, council politics)

A “False Dawn” siege event where the enemy tries an unexpected coordinated push — and you can counter-signal using the stolen codebook

Then the campaign pivots down into Sewers → Deep Caves → Under-Fortress, with the crystal ball / war-turning artifact thread taking center stage.

continue

Perfect — picking up right where we left off:

Return Debrief (Watchfort results land politically + mechanically)

“False Dawn” siege event where you can counter-signal using the stolen siege_signal_codebook

Pivot into Sewers → Deep Caves → Under-Fortress for the Crystal Ball / war-turning artifact arc (with optional drains-breach complications if you left the second mouth active)

You’ll get 10 drop-in files:

/content/items_false_dawn.json

/content/enemies_false_dawn.json

/content/npcs_false_dawn.json

/content/quests_false_dawn.json

/content/areas_false_dawn.json

/content/items_crystal_arc.json

/content/enemies_crystal_arc.json

/content/npcs_crystal_arc.json

/content/quests_crystal_arc.json

/content/areas_crystal_arc.json

/content/items_false_dawn.json
[
  {
    "id": "counter_signal_slip",
    "name": "Counter-Signal Slip",
    "type": "quest",
    "stackable": false,
    "value": 0,
    "description": "A copied sequence of horn and lantern codes. Lets you fake orders briefly during a siege."
  },
  {
    "id": "dawn_lantern_shutter",
    "name": "Lantern Shutter",
    "type": "tool",
    "stackable": false,
    "value": 8,
    "description": "A metal shutter that changes lantern patterns quickly. Used in signal towers."
  },
  {
    "id": "sapper_fuse_bundle",
    "name": "Sapper Fuse Bundle",
    "type": "quest",
    "stackable": true,
    "value": 0,
    "description": "Short fuses and crude blasting caps. Proof of an upcoming wall-breach attempt."
  },
  {
    "id": "barricade_spike_crate",
    "name": "Barricade Spike Crate",
    "type": "tool",
    "stackable": false,
    "value": 10,
    "description": "A crate of spikes for street barricades. Improves city defense if installed before the next push."
  }
]

/content/enemies_false_dawn.json
[
  {
    "id": "goblin_signalman",
    "name": "Goblin Signalman",
    "kind": "humanoid",
    "skill": 8,
    "stamina": 8,
    "meta": { "ranged": false, "special": "signal_horn" },
    "loot": [{ "itemId": "gold_coin", "min": 0, "max": 6 }],
    "tags": ["goblin", "siege", "signal"]
  },
  {
    "id": "orc_sapper",
    "name": "Orc Sapper",
    "kind": "humanoid",
    "skill": 10,
    "stamina": 14,
    "meta": { "ranged": false, "special": "plant_charge" },
    "loot": [{ "itemId": "sapper_fuse_bundle", "min": 1, "max": 1 }, { "itemId": "gold_coin", "min": 2, "max": 12 }],
    "tags": ["orc", "siege", "sapper"]
  },
  {
    "id": "warg_rider",
    "name": "Warg Rider",
    "kind": "humanoid",
    "skill": 11,
    "stamina": 13,
    "meta": { "ranged": false, "special": "charge" },
    "loot": [{ "itemId": "gold_coin", "min": 2, "max": 14 }],
    "tags": ["goblin", "cavalry", "siege"]
  },
  {
    "id": "drain_knifer",
    "name": "Drain Knifer",
    "kind": "humanoid",
    "skill": 9,
    "stamina": 9,
    "meta": { "ranged": false, "special": "backstab" },
    "loot": [{ "itemId": "infiltrator_token_black", "min": 1, "max": 1 }],
    "tags": ["infiltrator", "drains"]
  },

  {
    "id": "false_dawn_wave",
    "name": "False Dawn Push (Signals & Sappers)",
    "kind": "group",
    "members": [
      { "enemyId": "goblin_signalman", "count": 2 },
      { "enemyId": "orc_sapper", "count": 1 },
      { "enemyId": "warg_rider", "count": 1 }
    ],
    "meta": { "pursuit": { "speed": 1, "startDistance": 3, "morale": 10 } },
    "tags": ["wave", "siege", "group"]
  },

  {
    "id": "drains_breach_pack",
    "name": "Drains Breach Pack",
    "kind": "group",
    "members": [
      { "enemyId": "drain_knifer", "count": 2 }
    ],
    "meta": { "pursuit": { "speed": 1, "startDistance": 2, "morale": 8 } },
    "tags": ["group", "drains", "pursuit"]
  }
]

/content/npcs_false_dawn.json
[
  {
    "id": "npc_mage_archivist_salenne",
    "name": "Archivist Salenne",
    "role": "Mage Tower Liaison (War Scrying)",
    "portraitPrompt": "fantasy character portrait, mage archivist with ink and chalk on fingers, scrolls and lanterns, tired sharp eyes, painterly, no text",
    "dialogue": {
      "greeting": "The enemy believes dawn makes them brave. Dawn only makes them visible.",
      "nodes": [
        {
          "id": "scry",
          "text": "Their signals are a language. If you stole their grammar, you can lie in it.\n\nIf you bring me the crystal ball later, I can see what the enemy hides behind smoke.",
          "choices": [
            { "label": "Ask about the crystal ball.", "effects": [{ "type": "flag", "key": "crystal_ball_thread_known", "value": true }] }
          ]
        }
      ]
    }
  }
]

/content/quests_false_dawn.json
[
  {
    "id": "q_watchfort_return_debrief",
    "name": "Return Debrief: Codebook and Prisoners",
    "giverNpcId": "npc_councilor_vayne",
    "startAreaId": "f_postern_return",
    "objective": { "type": "setFlag", "key": "watchfort_debrief_complete", "value": true },
    "grantsOnStart": [],
    "rewards": { "gold": 10, "xp": 26, "items": [{ "itemId": "counter_signal_slip", "qty": 1 }] },
    "cooldownMinutes": 99999
  },
  {
    "id": "q_false_dawn",
    "name": "False Dawn: Break the Coordinated Push",
    "giverNpcId": "npc_captain_harl",
    "startAreaId": "f_signal_tower",
    "objective": { "type": "setFlag", "key": "false_dawn_complete", "value": true },
    "grantsOnStart": [],
    "rewards": { "gold": 12, "xp": 55, "items": [{ "itemId": "barricade_spike_crate", "qty": 1 }] },
    "cooldownMinutes": 99999
  },
  {
    "id": "q_false_dawn_drains",
    "name": "False Dawn Complication: Drains Knifers",
    "giverNpcId": "npc_guard_serjeant_mara",
    "startAreaId": "f_inner_yard_dawn",
    "objective": { "type": "setFlag", "key": "false_dawn_drains_resolved", "value": true },
    "grantsOnStart": [],
    "rewards": { "gold": 6, "xp": 24, "items": [{ "itemId": "triage_bandage_roll", "qty": 2 }] },
    "cooldownMinutes": 99999
  },

  {
    "id": "q_crystal_arc_start",
    "name": "The Crystal Ball: A War-Turning Sight",
    "giverNpcId": "npc_mage_archivist_salenne",
    "startAreaId": "f_mage_tower_brief",
    "objective": { "type": "setFlag", "key": "crystal_arc_started", "value": true },
    "grantsOnStart": [],
    "rewards": { "gold": 0, "xp": 18, "items": [] },
    "cooldownMinutes": 99999
  }
]

/content/areas_false_dawn.json
[
  {
    "id": "f_postern_return",
    "title": "Postern Gate: Return from Fog",
    "x": 0, "y": -1, "floorId": "city",
    "tileStyle": "postern",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, small postern gate at night, scouts returning through fog, lanterns, cinematic, no text",
    "description": "The gate opens a finger-width.\n\nFriendly lantern code flashes once.\n\nIf you brought prisoners and the codebook, the city breathes easier.",
    "choices": [
      {
        "id": "start_debrief",
        "label": "Report immediately to the council.",
        "effects": [{ "type": "startJob", "jobId": "q_watchfort_return_debrief" }],
        "goToAreaId": "f_council_return_debrief"
      }
    ],
    "exits": { "n": "v_council_chamber" }
  },

  {
    "id": "f_council_return_debrief",
    "title": "Council Return Debrief",
    "x": 0, "y": 0, "floorId": "city",
    "tileStyle": "council",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, council chamber with codebook on table, exhausted officials leaning in, cinematic, no text",
    "description": "The stolen codebook thuds onto the council table.\n\nVayne’s mouth tightens in approval.\n\n\"Good. Now we can make them mishear themselves.\"",
    "choices": [
      {
        "id": "deliver",
        "label": "Deliver the codebook and prisoner intel.",
        "effects": [
          { "type": "flag", "key": "watchfort_debrief_complete", "value": true },
          { "type": "completeJob", "jobId": "q_watchfort_return_debrief" },

          {
            "type": "conditional",
            "when": [{ "key": "signal_codebook_taken", "op": "==", "value": true }],
            "then": [
              { "type": "flag", "key": "counter_signal_unlocked", "value": true },
              { "type": "addItem", "itemId": "counter_signal_slip", "qty": 1 },
              { "type": "addXP", "amount": 12 }
            ],
            "else": []
          },

          {
            "type": "conditional",
            "when": [{ "key": "watchfort_prisoners_freed", "op": "==", "value": true }],
            "then": [{ "type": "flag", "key": "militia_bolstered", "value": true }, { "type": "addXP", "amount": 8 }],
            "else": []
          },

          {
            "type": "conditional",
            "when": [{ "key": "watchfort_alerted", "op": "==", "value": true }],
            "then": [{ "type": "flag", "key": "enemy_suspicious_signals", "value": true }],
            "else": []
          }
        ],
        "goToAreaId": "f_mage_tower_brief"
      }
    ],
    "exits": { "s": "g_inner_gate_yard" }
  },

  {
    "id": "f_mage_tower_brief",
    "title": "Mage Tower: The Next Edge",
    "x": 1, "y": 0, "floorId": "city",
    "tileStyle": "tower",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, mage tower study with star charts, crystal lenses, war maps, cinematic, no text",
    "description": "Archivist Salenne spreads a thin map of underways.\n\n\"There is a crystal ball taken from the city long ago,\" she says.\n\n\"With it, we can see enemy movements before they become screams.\"",
    "actionsAvailable": {
      "talk": {
        "text": "Salenne speaks quickly—like time is a leaking cup.",
        "choices": [
          { "id": "salenne", "label": "Talk to Archivist Salenne.", "effects": [{ "type": "openDialogue", "npcId": "npc_mage_archivist_salenne" }] },
          { "id": "start", "label": "Start: The Crystal Ball thread.", "effects": [{ "type": "startJob", "jobId": "q_crystal_arc_start" }] }
        ]
      }
    },
    "choices": [
      {
        "id": "to_false_dawn",
        "label": "A horn sounds—another push at ‘false dawn’. Go to the signal tower.",
        "effects": [{ "type": "startJob", "jobId": "q_false_dawn" }],
        "goToAreaId": "f_signal_tower"
      }
    ]
  },

  {
    "id": "f_signal_tower",
    "title": "Signal Tower: Dawn That Isn’t Dawn",
    "x": 2, "y": 0, "floorId": "city",
    "tileStyle": "signal",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, city signal tower with lantern shutters and horns, pre-dawn mist, cinematic, no text",
    "description": "The sky is dark—but the enemy horns say ‘dawn push’.\n\nThis is a trick.\n\nOr an opportunity.\n\nIf you can lie in their signal language, you can turn their coordination into confusion.",
    "choices": [
      {
        "id": "counter_signal",
        "label": "Counter-signal using the stolen codebook (mind check).",
        "requirements": [{ "type": "flagEquals", "key": "counter_signal_unlocked", "value": true }],
        "effects": [
          {
            "type": "skillCheck",
            "skill": "mind",
            "dc": 10,
            "onPass": [
              { "type": "flag", "key": "false_dawn_confused_enemy", "value": true },
              { "type": "flag", "key": "enemy_stamina_penalty_next_battle", "value": true },
              { "type": "addXP", "amount": 16 }
            ],
            "onFail": [
              { "type": "flag", "key": "false_dawn_confused_enemy", "value": false },
              { "type": "flag", "key": "enemy_suspicious_signals", "value": true }
            ]
          }
        ],
        "goToAreaId": "f_battlements_false_dawn"
      },
      {
        "id": "no_counter",
        "label": "Ignore signals; go to the battlements to fight it straight.",
        "goToAreaId": "f_battlements_false_dawn"
      }
    ],
    "exits": { "w": "g_battlements_wallwalk" }
  },

  {
    "id": "f_battlements_false_dawn",
    "title": "Battlements: The False Dawn Push",
    "x": 2, "y": 1, "floorId": "city",
    "tileStyle": "battlements",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, battlements under gray pre-dawn sky, sappers and riders below, horns blaring, cinematic, no text",
    "description": "Sappers move low under shields.\n\nA goblin signalman blasts a horn pattern.\n\nA warg rider circles like a knife finding a seam.",
    "choices": [
      {
        "id": "weakened_wave",
        "label": "If counter-signal succeeded, their timing is off—press the advantage.",
        "requirements": [{ "type": "flagEquals", "key": "false_dawn_confused_enemy", "value": true }],
        "effects": [
          {
            "type": "startThreat",
            "threat": {
              "threatId": "t_false_dawn_01",
              "enemyGroupId": "false_dawn_wave",
              "distance": 3,
              "direction": "n",
              "speed": 1,
              "targetAreaId": "f_battlements_false_dawn",
              "hazards": []
            }
          },
          { "type": "addXP", "amount": 6 }
        ],
        "goToAreaId": "f_false_dawn_fight"
      },
      {
        "id": "normal_wave",
        "label": "Meet the push head-on.",
        "effects": [
          {
            "type": "startThreat",
            "threat": {
              "threatId": "t_false_dawn_01",
              "enemyGroupId": "false_dawn_wave",
              "distance": 3,
              "direction": "n",
              "speed": 1,
              "targetAreaId": "f_battlements_false_dawn",
              "hazards": []
            }
          }
        ],
        "goToAreaId": "f_false_dawn_fight"
      }
    ],
    "exits": { "s": "f_inner_yard_dawn" }
  },

  {
    "id": "f_false_dawn_fight",
    "title": "Clash: Sappers and Signals",
    "x": 2, "y": 2, "floorId": "city",
    "tileStyle": "battlements",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, melee at battlements edge, sapper reaching for charge, signalman horn raised, cinematic, no text",
    "description": "Stop the sapper or the wall cracks.\n\nStop the signalman or the push stays coordinated.\n\nChoose your target first—and live with it.",
    "choices": [
      {
        "id": "shoot_sapper",
        "label": "Shoot the sapper, then hold position.",
        "requirements": [
          { "type": "hasAnyItem", "itemIds": ["training_bow", "hunting_bow"], "qty": 1 },
          { "type": "hasAmmo", "ammoType": "arrow", "minCount": 1 }
        ],
        "effects": [
          { "type": "shootThreat", "threatId": "t_false_dawn_01", "ammoType": "arrow", "ammoToConsume": 1, "damage": { "mode": "roll", "expr": "1d6" } },
          { "type": "advanceThreat", "threatId": "t_false_dawn_01" }
        ],
        "goToAreaId": "f_false_dawn_fight"
      },
      {
        "id": "fight",
        "label": "Fight.",
        "effects": [{ "type": "forceCombatFromThreat", "threatId": "t_false_dawn_01" }],
        "goToAreaId": "f_false_dawn_resolution"
      }
    ]
  },

  {
    "id": "f_inner_yard_dawn",
    "title": "Inner Yard: Dawn Smoke",
    "x": 1, "y": 1, "floorId": "city",
    "tileStyle": "yard",
    "cover": "low",
    "blocksLOS": false,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, inner yard with runners and smoke, dawn light barely starting, cinematic, no text",
    "description": "Runners shout conflicting reports.\n\nIf the enemy still has a drains route, knives may already be inside the city.\n\nYou can’t be everywhere—so your choices matter.",
    "choices": [
      {
        "id": "drains_complication",
        "label": "If drains threat persists, respond to knifers inside the walls.",
        "requirements": [{ "type": "flagEquals", "key": "drains_threat_persistent", "value": true }],
        "effects": [{ "type": "startJob", "jobId": "q_false_dawn_drains" }],
        "goToAreaId": "f_drains_knifers"
      },
      {
        "id": "stay_wall",
        "label": "Ignore reports and stay focused on the battlements.",
        "goToAreaId": "f_false_dawn_fight"
      }
    ]
  },

  {
    "id": "f_drains_knifers",
    "title": "Drains Knifers: Inside the Walls",
    "x": 1, "y": 0, "floorId": "sewer",
    "tileStyle": "sewer",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, narrow sewer tunnel, lantern reflections, knife glint in darkness, cinematic, no text",
    "description": "A knife flashes.\n\nA whisper in the wet.\n\nThey aren’t here to win a fight—they’re here to start fires and fear.",
    "choices": [
      {
        "id": "fight",
        "label": "Fight the knifers.",
        "effects": [
          { "type": "startCombat", "enemyGroup": [{ "enemyId": "drain_knifer", "count": 2 }] },
          { "type": "flag", "key": "false_dawn_drains_resolved", "value": true },
          { "type": "completeJob", "jobId": "q_false_dawn_drains" },
          { "type": "addXP", "amount": 16 }
        ],
        "goToAreaId": "f_false_dawn_resolution"
      }
    ]
  },

  {
    "id": "f_false_dawn_resolution",
    "title": "False Dawn Broken",
    "x": 2, "y": 3, "floorId": "city",
    "tileStyle": "battlements",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, dawn light finally arriving, broken sapper tools, defenders leaning on walls, cinematic, no text",
    "description": "The push falters.\n\nThe horn pattern stutters.\n\nFor once, dawn arrives after the fighting—not during it.",
    "effectsOnEnter": [
      { "type": "flag", "key": "false_dawn_complete", "value": true },
      { "type": "completeJob", "jobId": "q_false_dawn" }
    ],
    "choices": [
      {
        "id": "install_barricades",
        "label": "Install barricade spikes in key streets (improves next city defense).",
        "requirements": [{ "type": "hasItem", "itemId": "barricade_spike_crate", "qty": 1 }],
        "effects": [
          { "type": "removeItem", "itemId": "barricade_spike_crate", "qty": 1 },
          { "type": "flag", "key": "city_barricades_installed", "value": true },
          { "type": "addXP", "amount": 10 }
        ]
      },
      {
        "id": "begin_descent",
        "label": "Salenne’s map calls: descend to retrieve the crystal ball.",
        "requirements": [{ "type": "flagEquals", "key": "crystal_ball_thread_known", "value": true }],
        "effects": [{ "type": "flag", "key": "crystal_arc_ready", "value": true }],
        "goToAreaId": "c_sewer_gate_descent"
      }
    ]
  }
]

CRYSTAL BALL ARC (Sewers → Deep Caves → Under-Fortress)
/content/items_crystal_arc.json
[
  {
    "id": "lumen_key_fragment",
    "name": "Lumen Key Fragment",
    "type": "quest",
    "stackable": true,
    "value": 0,
    "description": "A shard of carved crystal key. Three fragments will unlock the Lumen Vault."
  },
  {
    "id": "crystal_ball_shard",
    "name": "Crystal Ball Shard",
    "type": "quest",
    "stackable": true,
    "value": 0,
    "description": "A shard of scrying crystal. Warm to the touch when near old wardwork."
  },
  {
    "id": "ward_salt_pouch",
    "name": "Ward Salt Pouch",
    "type": "tool",
    "stackable": true,
    "value": 6,
    "description": "Salt mixed with ash and silver filings. Reveals faint ward-lines and weak glamours."
  },
  {
    "id": "fungal_tonic",
    "name": "Fungal Tonic",
    "type": "consumable",
    "stackable": true,
    "value": 8,
    "description": "Bitter tonic brewed from cave fungi. Helps resist spores and reduces fatigue for a short time."
  },
  {
    "id": "lumen_vault_crystal_ball",
    "name": "The Crystal Ball of Lumen",
    "type": "quest",
    "stackable": false,
    "value": 0,
    "description": "A flawless sphere of scrying crystal. With it, the city can see enemy movements before they strike."
  }
]

/content/enemies_crystal_arc.json
[
  {
    "id": "rat_king_swarm",
    "name": "Rat Swarm",
    "kind": "monster",
    "skill": 7,
    "stamina": 7,
    "meta": { "special": "swarm_bite" },
    "loot": [{ "itemId": "gold_coin", "min": 0, "max": 2 }],
    "tags": ["sewer", "swarm"]
  },
  {
    "id": "spore_thrall",
    "name": "Spore Thrall",
    "kind": "humanoid",
    "skill": 9,
    "stamina": 10,
    "meta": { "special": "spore_burst" },
    "loot": [{ "itemId": "fungal_tonic", "min": 0, "max": 1 }],
    "tags": ["cave", "spore"]
  },
  {
    "id": "underway_cult_warder",
    "name": "Underway Warder",
    "kind": "humanoid",
    "skill": 10,
    "stamina": 12,
    "meta": { "special": "ward_strike" },
    "loot": [{ "itemId": "lumen_key_fragment", "min": 1, "max": 1 }],
    "tags": ["underfortress", "warder"]
  },
  {
    "id": "glass_eye_shaman",
    "name": "Shaman of the Glass Eye",
    "kind": "humanoid",
    "skill": 12,
    "stamina": 17,
    "meta": { "special": "hex_glare" },
    "loot": [
      { "itemId": "lumen_key_fragment", "min": 1, "max": 1 },
      { "itemId": "crystal_ball_shard", "min": 1, "max": 1 },
      { "itemId": "gold_coin", "min": 6, "max": 18 }
    ],
    "tags": ["boss", "shaman", "underfortress"]
  },

  {
    "id": "sewer_pack",
    "name": "Sewer Pack",
    "kind": "group",
    "members": [
      { "enemyId": "rat_king_swarm", "count": 2 }
    ],
    "meta": { "pursuit": { "speed": 1, "startDistance": 3, "morale": 7 } },
    "tags": ["group", "sewer"]
  },
  {
    "id": "cave_spore_pack",
    "name": "Spore Pack",
    "kind": "group",
    "members": [
      { "enemyId": "spore_thrall", "count": 2 }
    ],
    "meta": { "pursuit": { "speed": 1, "startDistance": 2, "morale": 8 } },
    "tags": ["group", "cave"]
  }
]

/content/npcs_crystal_arc.json
[
  {
    "id": "npc_ratcatcher_pella",
    "name": "Pella",
    "role": "Ratcatcher Guide (Knows the Underways)",
    "portraitPrompt": "fantasy character portrait, streetwise ratcatcher with lantern and hooked pole, sewer backdrop, sharp grin, painterly, no text",
    "dialogue": {
      "greeting": "Down there? It’s not ‘dark’. It’s hungry.",
      "nodes": [
        {
          "id": "deal",
          "text": "I’ll guide you to the old underways.\n\nBut you pay in safety: don’t kick doors, don’t shout names, and if you smell mushrooms—hold your breath.",
          "choices": [
            { "label": "Accept Pella’s guidance.", "effects": [{ "type": "flag", "key": "pella_guiding", "value": true }] }
          ]
        }
      ]
    }
  }
]

/content/quests_crystal_arc.json
[
  {
    "id": "q_crystal_descent",
    "name": "Descent: Into the Underways",
    "giverNpcId": "npc_mage_archivist_salenne",
    "startAreaId": "c_sewer_gate_descent",
    "objective": { "type": "setFlag", "key": "underways_reached", "value": true },
    "grantsOnStart": [],
    "rewards": { "gold": 0, "xp": 22, "items": [{ "itemId": "ward_salt_pouch", "qty": 1 }] },
    "cooldownMinutes": 99999
  },
  {
    "id": "q_lumen_key",
    "name": "Gather the Lumen Key (3 Fragments)",
    "giverNpcId": "npc_ratcatcher_pella",
    "startAreaId": "c_underway_threshold",
    "objective": { "type": "counterAtLeast", "key": "lumen_key_fragments", "value": 3 },
    "grantsOnStart": [],
    "rewards": { "gold": 0, "xp": 40, "items": [] },
    "cooldownMinutes": 99999
  },
  {
    "id": "q_lumen_vault",
    "name": "The Lumen Vault: Retrieve the Crystal Ball",
    "giverNpcId": "npc_mage_archivist_salenne",
    "startAreaId": "c_lumen_vault_door",
    "objective": { "type": "setFlag", "key": "crystal_ball_recovered", "value": true },
    "grantsOnStart": [],
    "rewards": { "gold": 20, "xp": 70, "items": [{ "itemId": "lumen_vault_crystal_ball", "qty": 1 }] },
    "cooldownMinutes": 99999
  }
]

/content/areas_crystal_arc.json
[
  {
    "id": "c_sewer_gate_descent",
    "title": "Sewer Gate: Below the City’s Breath",
    "x": 1, "y": -1, "floorId": "sewer",
    "tileStyle": "sewer_gate",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, iron sewer gate opened into darkness, lantern glow, damp stone, cinematic, no text",
    "description": "The air changes at the sewer gate.\n\nAbove: smoke, sweat, and war.\n\nBelow: wet stone and older secrets.",
    "choices": [
      {
        "id": "start_descent",
        "label": "Begin the descent into the underways.",
        "effects": [{ "type": "startJob", "jobId": "q_crystal_descent" }],
        "goToAreaId": "c_sewer_junction"
      }
    ]
  },

  {
    "id": "c_sewer_junction",
    "title": "Sewer Junction: Three Flows",
    "x": 2, "y": -1, "floorId": "sewer",
    "tileStyle": "sewer",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, sewer junction with three channels, drifting debris, lantern reflections, cinematic, no text",
    "description": "Three channels diverge.\n\nOne smells of rot.\n\nOne smells of mushrooms.\n\nOne smells… clean. Too clean.",
    "choices": [
      {
        "id": "rats",
        "label": "Follow the rot channel (rats and swarms).",
        "effects": [
          {
            "type": "startThreat",
            "threat": {
              "threatId": "t_sewer_pack_01",
              "enemyGroupId": "sewer_pack",
              "distance": 3,
              "direction": "n",
              "speed": 1,
              "targetAreaId": "c_sewer_junction",
              "hazards": []
            }
          }
        ],
        "goToAreaId": "c_sewer_swarm_run"
      },
      {
        "id": "meet_pella",
        "label": "Follow the ‘too clean’ channel (someone lives down here).",
        "goToAreaId": "c_pella_nook"
      }
    ]
  },

  {
    "id": "c_sewer_swarm_run",
    "title": "Sewer Run: Teeth in the Dark",
    "x": 2, "y": -2, "floorId": "sewer",
    "tileStyle": "sewer",
    "cover": "low",
    "blocksLOS": false,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, rats swarming across wet stones, lantern light, boots splashing, cinematic, no text",
    "description": "Rats pour from cracks.\n\nYou can run, fight, or climb to a maintenance ledge.",
    "choices": [
      { "id": "fight", "label": "Fight.", "effects": [{ "type": "forceCombatFromThreat", "threatId": "t_sewer_pack_01" }], "goToAreaId": "c_pella_nook" },
      { "id": "run", "label": "Run hard and lose them (take 1 damage).", "effects": [{ "type": "takeDamage", "amount": 1 }], "goToAreaId": "c_pella_nook" }
    ]
  },

  {
    "id": "c_pella_nook",
    "title": "Ratcatcher Nook",
    "x": 3, "y": -1, "floorId": "sewer",
    "tileStyle": "nook",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, small sewer nook with dry platform, rat traps, lantern, a figure waiting, cinematic, no text",
    "description": "A dry platform. Traps. A lantern that doesn’t flicker.\n\nPella watches you like you’re the danger.\n\n\"You want the old underways? Then talk.\"",
    "actionsAvailable": {
      "talk": {
        "text": "Pella taps a hooked pole on stone.",
        "choices": [
          { "id": "pella", "label": "Talk to Pella.", "effects": [{ "type": "openDialogue", "npcId": "npc_ratcatcher_pella" }] },
          { "id": "start_key", "label": "Start: Gather the Lumen Key.", "effects": [{ "type": "startJob", "jobId": "q_lumen_key" }] }
        ]
      }
    },
    "choices": [
      { "id": "to_underways", "label": "Proceed to the old underways threshold.", "effects": [{ "type": "addXP", "amount": 8 }], "goToAreaId": "c_underway_threshold" }
    ]
  },

  {
    "id": "c_underway_threshold",
    "title": "Underway Threshold: Old Stone, Older Wards",
    "x": 4, "y": -1, "floorId": "underways",
    "tileStyle": "underway",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, ancient stone archway under city, faint glowing ward lines, cinematic, no text",
    "description": "An archway cut with precise stonework.\n\nFaint ward-lines shimmer when your lantern passes.\n\nPella whispers: \"Don’t step on the bright lines.\"",
    "choices": [
      {
        "id": "use_salt",
        "label": "Use ward salt to reveal safe steps (reduces risk).",
        "requirements": [{ "type": "hasItem", "itemId": "ward_salt_pouch", "qty": 1 }],
        "effects": [{ "type": "removeItem", "itemId": "ward_salt_pouch", "qty": 1 }, { "type": "flag", "key": "underways_safe_steps", "value": true }, { "type": "addXP", "amount": 10 }],
        "goToAreaId": "c_echo_caves"
      },
      { "id": "risk_it", "label": "Proceed without ward salt (risk a ward sting).", "effects": [{ "type": "takeDamage", "amount": 1 }], "goToAreaId": "c_echo_caves" }
    ]
  },

  {
    "id": "c_echo_caves",
    "title": "Echo Caves: The Sound of Footsteps",
    "x": 5, "y": -1, "floorId": "caves",
    "tileStyle": "echo",
    "cover": "low",
    "blocksLOS": false,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, cavern where every drip echoes, chalky stone, distant shapes, cinematic, no text",
    "description": "Every step echoes too long.\n\nSomething hears you.\n\nSomething moves where echoes don’t reach.",
    "choices": [
      {
        "id": "spore_pack",
        "label": "Shadows resolve into thralls—avoid or fight.",
        "effects": [
          {
            "type": "startThreat",
            "threat": {
              "threatId": "t_spore_pack_01",
              "enemyGroupId": "cave_spore_pack",
              "distance": 2,
              "direction": "n",
              "speed": 1,
              "targetAreaId": "c_echo_caves",
              "hazards": []
            }
          }
        ],
        "goToAreaId": "c_fungal_grove"
      }
    ]
  },

  {
    "id": "c_fungal_grove",
    "title": "Fungal Grove: Breath Held",
    "x": 6, "y": -1, "floorId": "caves",
    "tileStyle": "fungal",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, glowing fungi grove, spores in air like dust motes, eerie beauty, cinematic, no text",
    "description": "Glowing fungi like lanterns that hate you.\n\nSpores drift.\n\nPella’s advice returns: hold your breath.",
    "choices": [
      { "id": "fight", "label": "Fight through the thralls.", "effects": [{ "type": "forceCombatFromThreat", "threatId": "t_spore_pack_01" }], "goToAreaId": "c_fragment_shrine" },
      { "id": "tonic", "label": "Drink fungal tonic (if you have one) to resist spores.", "requirements": [{ "type": "hasItem", "itemId": "fungal_tonic", "qty": 1 }], "effects": [{ "type": "removeItem", "itemId": "fungal_tonic", "qty": 1 }, { "type": "flag", "key": "spore_resist", "value": true }], "goToAreaId": "c_fragment_shrine" }
    ]
  },

  {
    "id": "c_fragment_shrine",
    "title": "Ward Shrine: Lumen Fragment",
    "x": 7, "y": -1, "floorId": "underways",
    "tileStyle": "shrine",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, small shrine with glowing crystal fragment embedded, old ward carvings, cinematic, no text",
    "description": "A small shrine. Wards carved like handwriting.\n\nA crystal fragment sits in the center—part of a key.\n\nTaking it may wake the shrine’s guardians.",
    "choices": [
      {
        "id": "take_fragment",
        "label": "Take the Lumen Key Fragment.",
        "effects": [
          { "type": "addItem", "itemId": "lumen_key_fragment", "qty": 1 },
          { "type": "addToCounter", "key": "lumen_key_fragments", "amount": 1 },
          { "type": "addXP", "amount": 12 }
        ],
        "goToAreaId": "c_underfortress_steps"
      }
    ]
  },

  {
    "id": "c_underfortress_steps",
    "title": "Basalt Steps: Under-Fortress Descent",
    "x": 8, "y": -1, "floorId": "underfortress",
    "tileStyle": "basalt",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, descending basalt stairs into ancient fortress, cold blue light, cinematic, no text",
    "description": "Basalt steps descend into a place built for war long before your city existed.\n\nBelow: warders.\n\nBelow: a vault door that remembers being closed.",
    "choices": [
      {
        "id": "warder",
        "label": "A warder blocks the way—fight.",
        "effects": [{ "type": "startCombat", "enemyGroup": [{ "enemyId": "underway_cult_warder", "count": 1 }] }],
        "goToAreaId": "c_second_fragment_chamber"
      }
    ]
  },

  {
    "id": "c_second_fragment_chamber",
    "title": "Chamber of Seals: Second Fragment",
    "x": 9, "y": -1, "floorId": "underfortress",
    "tileStyle": "seal_room",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, sealed chamber with crystal fragment in ironwork, ward glyphs, cinematic, no text",
    "description": "The chamber is all seals and silence.\n\nA second key fragment is mounted in ironwork.\n\nA faint hum resonates in your teeth.",
    "choices": [
      {
        "id": "take",
        "label": "Take the second fragment.",
        "effects": [
          { "type": "addItem", "itemId": "lumen_key_fragment", "qty": 1 },
          { "type": "addToCounter", "key": "lumen_key_fragments", "amount": 1 },
          { "type": "addXP", "amount": 12 }
        ],
        "goToAreaId": "c_shaman_gallery"
      }
    ]
  },

  {
    "id": "c_shaman_gallery",
    "title": "Gallery: The Glass Eye",
    "x": 10, "y": -1, "floorId": "underfortress",
    "tileStyle": "gallery",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, fortress gallery with hanging charms and bones, shaman silhouette, crystal glint, cinematic, no text",
    "description": "Charms sway without wind.\n\nA shaman’s eye glints like glass.\n\n\"You come for the city’s sight,\" it says.\n\n\"Then pay in fear.\"",
    "choices": [
      {
        "id": "boss",
        "label": "Fight the Shaman of the Glass Eye.",
        "effects": [{ "type": "startCombat", "enemyGroup": [{ "enemyId": "glass_eye_shaman", "count": 1 }] }],
        "goToAreaId": "c_shaman_loot"
      }
    ]
  },

  {
    "id": "c_shaman_loot",
    "title": "Shaman’s Relics: Third Fragment and Shard",
    "x": 11, "y": -1, "floorId": "underfortress",
    "tileStyle": "gallery",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, fallen shaman, crystal shard and key fragment on cloth, eerie blue glow, cinematic, no text",
    "description": "The shaman’s charms fall silent.\n\nYou take the third fragment.\n\nYou also take a shard of scrying crystal—proof the vault holds the real prize.",
    "effectsOnEnter": [
      { "type": "addItem", "itemId": "lumen_key_fragment", "qty": 1 },
      { "type": "addToCounter", "key": "lumen_key_fragments", "amount": 1 },
      { "type": "addItem", "itemId": "crystal_ball_shard", "qty": 1 },
      { "type": "addXP", "amount": 18 }
    ],
    "choices": [
      {
        "id": "to_vault",
        "label": "Go to the Lumen Vault Door.",
        "effects": [{ "type": "startJob", "jobId": "q_lumen_vault" }],
        "goToAreaId": "c_lumen_vault_door"
      }
    ]
  },

  {
    "id": "c_lumen_vault_door",
    "title": "The Lumen Vault Door",
    "x": 12, "y": -1, "floorId": "underfortress",
    "tileStyle": "vault_door",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, massive vault door with crystal keyholes, faint ward glow, cinematic, no text",
    "description": "A door built to outlast kings.\n\nThree key sockets wait.\n\nIf you have the fragments, the door will remember how to open.",
    "choices": [
      {
        "id": "unlock",
        "label": "Insert the 3 fragments and unlock the vault.",
        "requirements": [{ "type": "counterAtLeast", "key": "lumen_key_fragments", "value": 3 }],
        "effects": [{ "type": "addXP", "amount": 14 }],
        "goToAreaId": "c_lumen_vault_core"
      },
      {
        "id": "not_ready",
        "label": "You lack fragments—retreat and search for more.",
        "goToAreaId": "c_underway_threshold"
      }
    ]
  },

  {
    "id": "c_lumen_vault_core",
    "title": "Lumen Vault: The City’s Sight",
    "x": 13, "y": -1, "floorId": "underfortress",
    "tileStyle": "vault",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, glowing crystal vault chamber, crystal ball on pedestal, ward light swirling, cinematic, no text",
    "description": "The crystal ball sits on a pedestal like a calm moon.\n\nWhen you touch it, you feel the city above—like a heartbeat through stone.\n\nThis will change the war.",
    "choices": [
      {
        "id": "take_ball",
        "label": "Take the Crystal Ball of Lumen.",
        "effects": [
          { "type": "addItem", "itemId": "lumen_vault_crystal_ball", "qty": 1 },
          { "type": "flag", "key": "crystal_ball_recovered", "value": true },
          { "type": "completeJob", "jobId": "q_lumen_vault" },
          { "type": "addXP", "amount": 26 }
        ],
        "goToAreaId": "c_escape_run"
      }
    ]
  },

  {
    "id": "c_escape_run",
    "title": "Escape Run: Upward to War",
    "x": 14, "y": -1, "floorId": "underways",
    "tileStyle": "escape",
    "cover": "low",
    "blocksLOS": false,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, running through underways with crystal glow in pack, shadows chasing, cinematic, no text",
    "description": "The underways feel narrower on the way back.\n\nAs if the fortress resents you.\n\nAbove, the city will need this sight before the next assault.",
    "choices": [
      {
        "id": "return_mage",
        "label": "Return to the Mage Tower with the crystal ball.",
        "effects": [{ "type": "flag", "key": "crystal_ball_delivered_ready", "value": true }],
        "goToAreaId": "f_mage_tower_brief"
      }
    ]
  }
]

What this sets up next (cleanly, with consequences)

You now have two major “strategic levers” for the next siege chapter:

1) Signals War

counter_signal_unlocked = true

enemy_suspicious_signals = true if you failed checks / made noise
→ lets you run future fights as “coordination puzzles” instead of only combat.

2) The Crystal Ball Turns the War

crystal_ball_recovered = true
→ unlocks: pre-warning of raids, spotting sabotage, choosing the battlefield, and “you have one move ahead” options in later siege scenes.

Drains Consequences still bite

drains_threat_persistent = true (if you left second mouth active)
→ can keep injecting knife incidents and arson pressure until you finally eliminate the route.

If you say continue again, I’ll generate the Crystal Ball Delivery + Scrying Chapter:

council + mage tower scene where the ball reveals an incoming night assault and a traitor inside the city

a multi-stage “choose your response” defense: save the granary, reinforce the postern, or ambush the siege command tent

and then the campaign opens the next big dungeon: Enemy Siege Camp → Command Tunnels → War-Standard Vault (steal a banner/standard that breaks morale).

continue
Thought for 19s

Right — here’s the Crystal Ball Delivery + Scrying Chapter, including:

the night assault revealed in advance

a traitor inside the city thread you can investigate/catch

a multi-stage defense choice: save the granary, reinforce the postern, or ambush the siege command tent

then the next major dungeon arc: Enemy Siege Camp → Command Tunnels → War-Standard Vault (steal a standard that breaks morale)

You’ll get 10 drop-in files:

/content/items_scrying_night_assault.json

/content/enemies_scrying_night_assault.json

/content/npcs_scrying_night_assault.json

/content/quests_scrying_night_assault.json

/content/areas_scrying_night_assault.json

/content/items_siege_camp_arc.json

/content/enemies_siege_camp_arc.json

/content/npcs_siege_camp_arc.json

/content/quests_siege_camp_arc.json

/content/areas_siege_camp_arc.json

These react cleanly to your existing flags:

crystal_ball_recovered, crystal_ball_delivered_ready

counter_signal_unlocked, enemy_suspicious_signals

drains_threat_persistent

city_barricades_installed, militia_bolstered, city_damage_high

watchfort_returned, signal_codebook_taken

/content/items_scrying_night_assault.json
[
  {
    "id": "scrying_transcript",
    "name": "Scrying Transcript",
    "type": "quest",
    "stackable": false,
    "value": 0,
    "description": "A hurried transcript of what the crystal ball revealed: timings, routes, and a single identifying detail of the traitor."
  },
  {
    "id": "traitor_ring_blackwax",
    "name": "Blackwax Signet Ring",
    "type": "quest",
    "stackable": false,
    "value": 0,
    "description": "A ring stamped with a wax-seal sigil used for covert requisitions. It smells faintly of pitch and lamp oil."
  },
  {
    "id": "warden_pass",
    "name": "Warden’s Pass",
    "type": "quest",
    "stackable": false,
    "value": 0,
    "description": "A curfew pass signed by the council. Lets you move through locked streets without being detained."
  },
  {
    "id": "mage_ward_chalk",
    "name": "Mage Ward Chalk",
    "type": "tool",
    "stackable": true,
    "value": 5,
    "description": "Drawn across thresholds to disrupt minor glamours and tripwire stealthy infiltrators."
  },
  {
    "id": "smoke_mask",
    "name": "Smoke Mask",
    "type": "tool",
    "stackable": false,
    "value": 12,
    "description": "Cloth and resin filter. Helps you act in heavy smoke without losing stamina."
  }
]

/content/enemies_scrying_night_assault.json
[
  {
    "id": "goblin_fireteam",
    "name": "Goblin Fireteam",
    "kind": "humanoid",
    "skill": 9,
    "stamina": 10,
    "meta": { "special": "ignite_bundle" },
    "loot": [{ "itemId": "arsonist_tinder_pouch", "min": 1, "max": 2 }],
    "tags": ["goblin", "arson", "night"]
  },
  {
    "id": "orc_postern_breaker",
    "name": "Orc Postern Breaker",
    "kind": "humanoid",
    "skill": 11,
    "stamina": 16,
    "meta": { "special": "door_breach" },
    "loot": [{ "itemId": "gold_coin", "min": 2, "max": 14 }],
    "tags": ["orc", "breach", "night"]
  },
  {
    "id": "drains_knifer_veteran",
    "name": "Veteran Drains Knifer",
    "kind": "humanoid",
    "skill": 10,
    "stamina": 11,
    "meta": { "special": "backstab" },
    "loot": [{ "itemId": "infiltrator_token_black", "min": 1, "max": 1 }],
    "tags": ["infiltrator", "drains", "night"]
  },
  {
    "id": "traitor_bodyguard",
    "name": "Traitor’s Bodyguard",
    "kind": "humanoid",
    "skill": 11,
    "stamina": 14,
    "meta": { "special": "shield_intercept" },
    "loot": [{ "itemId": "gold_coin", "min": 3, "max": 12 }],
    "tags": ["city", "traitor", "elite"]
  },

  {
    "id": "night_assault_granary",
    "name": "Night Assault: Granary Fire",
    "kind": "group",
    "members": [{ "enemyId": "goblin_fireteam", "count": 2 }],
    "meta": { "pursuit": { "speed": 1, "startDistance": 3, "morale": 9 } },
    "tags": ["group", "night", "arson"]
  },
  {
    "id": "night_assault_postern",
    "name": "Night Assault: Postern Breach",
    "kind": "group",
    "members": [{ "enemyId": "orc_postern_breaker", "count": 1 }, { "enemyId": "goblin_fireteam", "count": 1 }],
    "meta": { "pursuit": { "speed": 1, "startDistance": 3, "morale": 10 } },
    "tags": ["group", "night", "breach"]
  },
  {
    "id": "night_assault_drains",
    "name": "Night Assault: Drains Knifers",
    "kind": "group",
    "members": [{ "enemyId": "drains_knifer_veteran", "count": 2 }],
    "meta": { "pursuit": { "speed": 1, "startDistance": 2, "morale": 8 } },
    "tags": ["group", "night", "drains"]
  }
]

/content/npcs_scrying_night_assault.json
[
  {
    "id": "npc_mage_archivist_salenne",
    "name": "Archivist Salenne",
    "role": "Mage Tower Liaison (War Scrying)",
    "portraitPrompt": "fantasy character portrait, mage archivist with crystal ball glow on face, scrolls and candle smoke, painterly, no text",
    "dialogue": {
      "greeting": "If you brought the city its sight, then listen carefully—because sight is useless without action.",
      "nodes": [
        {
          "id": "vision",
          "text": "The ball shows three threats:\n\n1) Fire at the granary.\n2) Breach attempt at the postern.\n3) Knifers in the drains.\n\nAnd one more thing: a city hand delivering wax-sealed orders to the enemy.\n\nA ring. Black wax. A courier’s seal used from inside our walls.",
          "choices": [
            { "label": "Ask for a transcript.", "effects": [{ "type": "addItem", "itemId": "scrying_transcript", "qty": 1 }] },
            { "label": "Ask for ward chalk.", "effects": [{ "type": "addItem", "itemId": "mage_ward_chalk", "qty": 2 }] }
          ]
        }
      ]
    }
  },
  {
    "id": "npc_councilor_vayne",
    "name": "Councilor Vayne",
    "role": "War Council (Cold Strategist)",
    "portraitPrompt": "fantasy character portrait, councilor with tired eyes, crystal glow reflected in ringed fingers, painterly, no text",
    "dialogue": {
      "greeting": "Choose what we save. Choose what we lose. That is leadership.",
      "nodes": [
        {
          "id": "triage_choice",
          "text": "We cannot stop all three strikes.\n\nPick your priority:\n- Granary (food and winter).\n- Postern (a door into the city).\n- Command tent (cut the head, risk the body).\n\nAnd while you do… find the traitor.",
          "choices": [
            { "label": "Take a curfew pass.", "effects": [{ "type": "addItem", "itemId": "warden_pass", "qty": 1 }] },
            { "label": "Request a smoke mask.", "effects": [{ "type": "addItem", "itemId": "smoke_mask", "qty": 1 }] }
          ]
        }
      ]
    }
  },
  {
    "id": "npc_master_of_stores_rell",
    "name": "Master of Stores Rell",
    "role": "Quartermaster (Possible Traitor)",
    "portraitPrompt": "fantasy character portrait, quartermaster in ledger room, keys at belt, wary expression, lantern light, painterly, no text",
    "dialogue": {
      "greeting": "If you need supplies, file a request like everyone else—oh, you don’t have time. No one does.",
      "nodes": [
        {
          "id": "rell_probe",
          "text": "Requisitions? Wax seals? I stamp what the council authorizes.\n\nUnless… someone has a seal they shouldn’t.",
          "choices": [
            { "label": "Investigate his ledgers.", "effects": [{ "type": "flag", "key": "rell_ledgers_checked", "value": true }] },
            { "label": "Leave him for now.", "effects": [] }
          ]
        }
      ]
    }
  }
]

/content/quests_scrying_night_assault.json
[
  {
    "id": "q_crystal_delivery_scry",
    "name": "Crystal Ball Delivered: The Scrying",
    "giverNpcId": "npc_mage_archivist_salenne",
    "startAreaId": "s_mage_scrying_chamber",
    "objective": { "type": "setFlag", "key": "scrying_complete", "value": true },
    "grantsOnStart": [],
    "rewards": { "gold": 0, "xp": 24, "items": [{ "itemId": "scrying_transcript", "qty": 1 }] },
    "cooldownMinutes": 99999
  },
  {
    "id": "q_night_assault",
    "name": "Night Assault: Choose What to Save",
    "giverNpcId": "npc_councilor_vayne",
    "startAreaId": "s_council_emergency",
    "objective": { "type": "setFlag", "key": "night_assault_complete", "value": true },
    "grantsOnStart": [],
    "rewards": { "gold": 14, "xp": 60, "items": [] },
    "cooldownMinutes": 99999
  },
  {
    "id": "q_traitor_hunt",
    "name": "The Traitor: Blackwax Seal",
    "giverNpcId": "npc_councilor_vayne",
    "startAreaId": "s_council_emergency",
    "objective": { "type": "setFlag", "key": "traitor_resolved", "value": true },
    "grantsOnStart": [],
    "rewards": { "gold": 10, "xp": 40, "items": [{ "itemId": "traitor_ring_blackwax", "qty": 1 }] },
    "cooldownMinutes": 99999
  }
]

/content/areas_scrying_night_assault.json
[
  {
    "id": "s_mage_scrying_chamber",
    "title": "Mage Tower: Scrying Chamber",
    "x": 2, "y": 2, "floorId": "city",
    "tileStyle": "tower",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, crystal ball on pedestal in mage chamber, light swirling, anxious scribes, cinematic, no text",
    "description": "The crystal ball hums like a held breath.\n\nSalenne steadies it with both hands.\n\nImages appear: smoke, a door, water… and a ring stamping black wax on stolen orders.",
    "choices": [
      {
        "id": "start_scry",
        "label": "Begin the scrying (learn the night assault and traitor clue).",
        "effects": [
          { "type": "startJob", "jobId": "q_crystal_delivery_scry" },
          { "type": "flag", "key": "scrying_complete", "value": true },
          { "type": "completeJob", "jobId": "q_crystal_delivery_scry" },
          { "type": "flag", "key": "night_assault_known", "value": true },
          { "type": "flag", "key": "traitor_clue_blackwax_ring", "value": true }
        ],
        "goToAreaId": "s_council_emergency"
      }
    ]
  },

  {
    "id": "s_council_emergency",
    "title": "Council Emergency: Three Knives at Once",
    "x": 1, "y": 2, "floorId": "city",
    "tileStyle": "council",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, emergency council meeting, maps with three marked targets, lantern light, cinematic, no text",
    "description": "The council marks three points on the city map:\n\n- Granary quarter.\n- Postern gate.\n- Drains junction.\n\n\"They hit all three at once,\" Vayne says.\n\n\"And someone inside stamped the orders.\"",
    "actionsAvailable": {
      "talk": {
        "text": "Vayne’s finger rests on the map like a blade.",
        "choices": [
          { "id": "vayne", "label": "Talk to Councilor Vayne.", "effects": [{ "type": "openDialogue", "npcId": "npc_councilor_vayne" }] },
          { "id": "start_assault", "label": "Start: Night Assault.", "effects": [{ "type": "startJob", "jobId": "q_night_assault" }] },
          { "id": "start_traitor", "label": "Start: Traitor Hunt.", "effects": [{ "type": "startJob", "jobId": "q_traitor_hunt" }] }
        ]
      }
    },
    "choices": [
      {
        "id": "choice_granary",
        "label": "1. Save the Granary (food and winter).",
        "effects": [{ "type": "flag", "key": "night_choice", "value": "granary" }],
        "goToAreaId": "s_granary_quarter"
      },
      {
        "id": "choice_postern",
        "label": "2. Reinforce the Postern (stop a breach).",
        "effects": [{ "type": "flag", "key": "night_choice", "value": "postern" }],
        "goToAreaId": "s_postern_night"
      },
      {
        "id": "choice_ambush",
        "label": "3. Ambush the Siege Command Tent (cut the head).",
        "effects": [{ "type": "flag", "key": "night_choice", "value": "ambush" }],
        "goToAreaId": "s_postern_to_field"
      },
      {
        "id": "investigate_quartermaster",
        "label": "Investigate the quartermaster’s ledgers for blackwax seals.",
        "goToAreaId": "s_stores_ledger_room"
      }
    ]
  },

  {
    "id": "s_stores_ledger_room",
    "title": "Stores Ledger Room: Wax and Numbers",
    "x": 0, "y": 2, "floorId": "city",
    "tileStyle": "ledger",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, ledger room with keys, wax seals, shelves of supplies, tense mood, cinematic, no text",
    "description": "Ledgers. Keys. Wax.\n\nMaster of Stores Rell watches you like you’re the thief.\n\nBut the scrying showed a ring… and a seal no honest hand should hold.",
    "actionsAvailable": {
      "talk": {
        "text": "Rell’s mouth is polite; his eyes are not.",
        "choices": [
          { "id": "rell", "label": "Talk to Rell.", "effects": [{ "type": "openDialogue", "npcId": "npc_master_of_stores_rell" }] }
        ]
      }
    },
    "choices": [
      {
        "id": "search_ledgers",
        "label": "Search for suspicious requisitions (mind check).",
        "effects": [
          {
            "type": "skillCheck",
            "skill": "mind",
            "dc": 9,
            "onPass": [
              { "type": "flag", "key": "traitor_identified", "value": "rell" },
              { "type": "addXP", "amount": 12 }
            ],
            "onFail": [
              { "type": "flag", "key": "traitor_identified", "value": "unknown" },
              { "type": "addXP", "amount": 6 }
            ]
          }
        ],
        "goToAreaId": "s_traitor_confrontation"
      },
      {
        "id": "leave",
        "label": "Leave and focus on the night assault.",
        "goToAreaId": "s_council_emergency"
      }
    ]
  },

  {
    "id": "s_traitor_confrontation",
    "title": "Confrontation: Blackwax in Hand",
    "x": 0, "y": 1, "floorId": "city",
    "tileStyle": "civic",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, tense confrontation in ledger room doorway, guard lanterns, a ring glint, cinematic, no text",
    "description": "The ring glints.\n\nA bodyguard shifts closer.\n\nRell’s voice stays calm: \"You’re exhausted. You’re seeing enemies everywhere.\"\n\nBut you can smell pitch on the wax—fresh.",
    "choices": [
      {
        "id": "arrest",
        "label": "1. Call guards and attempt an arrest.",
        "effects": [
          { "type": "flag", "key": "traitor_arrest_attempted", "value": true },
          { "type": "startCombat", "enemyGroup": [{ "enemyId": "traitor_bodyguard", "count": 1 }] }
        ],
        "goToAreaId": "s_traitor_resolved"
      },
      {
        "id": "talk_down",
        "label": "2. Talk him down (mind check).",
        "effects": [
          {
            "type": "skillCheck",
            "skill": "mind",
            "dc": 10,
            "onPass": [
              { "type": "flag", "key": "traitor_confessed", "value": true },
              { "type": "addXP", "amount": 14 }
            ],
            "onFail": [
              { "type": "startCombat", "enemyGroup": [{ "enemyId": "traitor_bodyguard", "count": 1 }] }
            ]
          }
        ],
        "goToAreaId": "s_traitor_resolved"
      }
    ]
  },

  {
    "id": "s_traitor_resolved",
    "title": "Traitor Resolved",
    "x": 0, "y": 0, "floorId": "city",
    "tileStyle": "civic",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, guards seizing a ring and wax seal, lanterns, grim faces, cinematic, no text",
    "description": "The ring is taken.\n\nBlack wax crumbles under a guard’s thumb.\n\nWhether confession or force, the city has one less knife behind its back.",
    "effectsOnEnter": [
      { "type": "flag", "key": "traitor_resolved", "value": true },
      { "type": "completeJob", "jobId": "q_traitor_hunt" },
      { "type": "addItem", "itemId": "traitor_ring_blackwax", "qty": 1 },
      { "type": "addXP", "amount": 16 },
      { "type": "flag", "key": "night_assault_enemy_coordination_reduced", "value": true }
    ],
    "choices": [
      { "id": "back", "label": "Return to the council’s triage choice.", "goToAreaId": "s_council_emergency" }
    ]
  },

  {
    "id": "s_granary_quarter",
    "title": "Granary Quarter: Smoke Before Screams",
    "x": 2, "y": 1, "floorId": "city",
    "tileStyle": "market",
    "cover": "low",
    "blocksLOS": false,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, granary street at night, smoke pouring from door seams, goblins with tinder, cinematic, no text",
    "description": "The scrying was right.\n\nSmoke leaks from seams.\n\nIf the granary burns, winter becomes an enemy too.",
    "choices": [
      {
        "id": "start_granary_threat",
        "label": "Fight the fireteam before they ignite the stores.",
        "effects": [
          {
            "type": "startThreat",
            "threat": {
              "threatId": "t_night_granary",
              "enemyGroupId": "night_assault_granary",
              "distance": 3,
              "direction": "n",
              "speed": 1,
              "targetAreaId": "s_granary_quarter",
              "hazards": []
            }
          }
        ],
        "goToAreaId": "s_granary_fight"
      }
    ]
  },

  {
    "id": "s_granary_fight",
    "title": "Granary: Fire in the Doorframe",
    "x": 3, "y": 1, "floorId": "city",
    "tileStyle": "market",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, close fight at granary door, flames starting, goblins fleeing, cinematic, no text",
    "description": "You can fight them—or smother the flames first.\n\nIf you spend time on one, the other worsens.",
    "choices": [
      { "id": "fight", "label": "Fight.", "effects": [{ "type": "forceCombatFromThreat", "threatId": "t_night_granary" }], "goToAreaId": "s_night_resolution" },
      {
        "id": "smother",
        "label": "Smother flames with ward chalk + water (luck check).",
        "effects": [
          {
            "type": "skillCheck",
            "skill": "luck",
            "dc": 9,
            "onPass": [{ "type": "flag", "key": "granary_saved", "value": true }, { "type": "addXP", "amount": 10 }],
            "onFail": [{ "type": "flag", "key": "granary_damaged", "value": true }, { "type": "addToCounter", "key": "arson_damage_count", "amount": 1 }]
          }
        ],
        "goToAreaId": "s_night_resolution"
      }
    ]
  },

  {
    "id": "s_postern_night",
    "title": "Postern Gate: Breach at Midnight",
    "x": 1, "y": 0, "floorId": "city",
    "tileStyle": "postern",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, postern gate at night, orc with ram and tools, torches, cinematic, no text",
    "description": "The small gate shudders.\n\nAn orc breaker works like a craftsman of destruction.\n\nIf this door opens, the city’s back becomes its throat.",
    "choices": [
      {
        "id": "start_postern_threat",
        "label": "Stop the postern breach.",
        "effects": [
          {
            "type": "startThreat",
            "threat": {
              "threatId": "t_night_postern",
              "enemyGroupId": "night_assault_postern",
              "distance": 3,
              "direction": "w",
              "speed": 1,
              "targetAreaId": "s_postern_night",
              "hazards": []
            }
          }
        ],
        "goToAreaId": "s_postern_fight"
      }
    ]
  },

  {
    "id": "s_postern_fight",
    "title": "Postern: Iron on Wood",
    "x": 1, "y": -1, "floorId": "city",
    "tileStyle": "postern",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, clash at narrow gate, orc breaker snarling, sparks, cinematic, no text",
    "description": "The breaker is close.\n\nIf you have barricades installed, the angle is tighter and the ram hits poorly.\n\nIf you fail, the breach becomes a flood.",
    "choices": [
      {
        "id": "fight",
        "label": "Fight.",
        "effects": [{ "type": "forceCombatFromThreat", "threatId": "t_night_postern" }],
        "goToAreaId": "s_night_resolution"
      }
    ]
  },

  {
    "id": "s_postern_to_field",
    "title": "Postern Exit: Into the Dark Field",
    "x": 0, "y": -2, "floorId": "overland",
    "tileStyle": "fog_field",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, slipping out a small gate into fog field, distant camp lights, cinematic, no text",
    "description": "You slip outside the walls.\n\nCamp lights flicker beyond the fog.\n\nIf you strike the command tent, you may save the city by confusing the head.\n\nOr die alone in grass.",
    "choices": [
      { "id": "to_camp_arc", "label": "Approach the enemy siege camp.", "goToAreaId": "p_siege_camp_approach" }
    ]
  },

  {
    "id": "s_night_resolution",
    "title": "Night Assault Ends",
    "x": 2, "y": 0, "floorId": "city",
    "tileStyle": "civic",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, exhausted guards at dawn edge, smoke thinning, lanterns dying, cinematic, no text",
    "description": "The night assault fades.\n\nWhatever you saved stands.\n\nWhatever you failed to save will hurt later.\n\nAnd now the question becomes: do you keep reacting… or do you take the war to them?",
    "effectsOnEnter": [
      { "type": "flag", "key": "night_assault_complete", "value": true },
      { "type": "completeJob", "jobId": "q_night_assault" }
    ],
    "choices": [
      {
        "id": "unlock_camp_arc",
        "label": "Begin a counterstrike: infiltrate the siege camp and steal their war standard.",
        "effects": [{ "type": "flag", "key": "siege_camp_arc_unlocked", "value": true }, { "type": "addXP", "amount": 10 }],
        "goToAreaId": "p_siege_camp_approach"
      }
    ]
  }
]

SIEGE CAMP ARC (Enemy Siege Camp → Command Tunnels → War-Standard Vault)
/content/items_siege_camp_arc.json
[
  {
    "id": "war_standard_black",
    "name": "Black War Standard",
    "type": "quest",
    "stackable": false,
    "value": 0,
    "description": "A heavy banner used to rally and coordinate the siege. If taken, enemy morale cracks."
  },
  {
    "id": "command_seal_plate",
    "name": "Command Seal Plate",
    "type": "quest",
    "stackable": false,
    "value": 0,
    "description": "A brass seal plate used to stamp orders in the camp. Proof—and leverage—for the city."
  },
  {
    "id": "camp_ration_sack",
    "name": "Camp Ration Sack",
    "type": "consumable",
    "stackable": true,
    "value": 6,
    "description": "Hard rations taken from the siege camp. Restores stamina when you rest."
  },
  {
    "id": "tunnel_chalk_mark",
    "name": "Tunnel Chalk Mark",
    "type": "quest",
    "stackable": true,
    "value": 0,
    "description": "A chalk mark you place to remember the path through command tunnels."
  }
]

/content/enemies_siege_camp_arc.json
[
  {
    "id": "goblin_picket",
    "name": "Goblin Picket",
    "kind": "humanoid",
    "skill": 8,
    "stamina": 8,
    "meta": { "ranged": true, "range": 3, "damage": "1d6", "ammoType": "arrow" },
    "loot": [{ "itemId": "gold_coin", "min": 0, "max": 6 }],
    "tags": ["goblin", "camp", "ranged"]
  },
  {
    "id": "orc_drillmaster",
    "name": "Orc Drillmaster",
    "kind": "humanoid",
    "skill": 11,
    "stamina": 16,
    "meta": { "special": "bellow_command" },
    "loot": [{ "itemId": "gold_coin", "min": 4, "max": 16 }],
    "tags": ["orc", "camp", "elite"]
  },
  {
    "id": "siege_engineer",
    "name": "Siege Engineer",
    "kind": "humanoid",
    "skill": 10,
    "stamina": 12,
    "meta": { "special": "ignite_pitch" },
    "loot": [{ "itemId": "burnt_oil_flask", "min": 1, "max": 1 }, { "itemId": "gold_coin", "min": 2, "max": 12 }],
    "tags": ["camp", "sapper"]
  },
  {
    "id": "standard_guardian",
    "name": "Standard Guardian",
    "kind": "humanoid",
    "skill": 12,
    "stamina": 18,
    "meta": { "special": "guardian_stance" },
    "loot": [{ "itemId": "command_seal_plate", "min": 1, "max": 1 }],
    "tags": ["boss", "vault"]
  },

  {
    "id": "camp_picket_line",
    "name": "Picket Line",
    "kind": "group",
    "members": [{ "enemyId": "goblin_picket", "count": 3 }],
    "meta": { "pursuit": { "speed": 1, "startDistance": 3, "morale": 8 } },
    "tags": ["group", "pursuit", "camp"]
  },
  {
    "id": "camp_inner_guard",
    "name": "Inner Camp Guard",
    "kind": "group",
    "members": [{ "enemyId": "orc_drillmaster", "count": 1 }, { "enemyId": "goblin_picket", "count": 1 }],
    "meta": { "pursuit": { "speed": 1, "startDistance": 2, "morale": 9 } },
    "tags": ["group", "pursuit", "camp"]
  }
]

/content/npcs_siege_camp_arc.json
[
  {
    "id": "npc_lieut_kess",
    "name": "Lieutenant Kess",
    "role": "Scout (Camp Infiltration Contact)",
    "portraitPrompt": "fantasy character portrait, scout lieutenant in mud-stained cloak, campfires behind, tense whisper, painterly, no text",
    "dialogue": {
      "greeting": "That camp runs on fear and a banner. Take the banner, and fear turns sideways.",
      "nodes": [
        {
          "id": "brief",
          "text": "Their standard is kept below the command trench.\n\nThey call it a ‘vault’—it’s more like a buried shrine.\n\nIf you have the codebook, you can fake a horn pattern to pull guards away—once.",
          "choices": [
            { "label": "Accept the plan.", "effects": [{ "type": "flag", "key": "camp_raid_accepted", "value": true }] }
          ]
        }
      ]
    }
  }
]

/content/quests_siege_camp_arc.json
[
  {
    "id": "q_siege_camp_raid",
    "name": "Counterstrike: Steal the War Standard",
    "giverNpcId": "npc_lieut_kess",
    "startAreaId": "p_siege_camp_approach",
    "objective": { "type": "setFlag", "key": "war_standard_taken", "value": true },
    "grantsOnStart": [],
    "rewards": { "gold": 18, "xp": 75, "items": [{ "itemId": "war_standard_black", "qty": 1 }] },
    "cooldownMinutes": 99999
  }
]

/content/areas_siege_camp_arc.json
[
  {
    "id": "p_siege_camp_approach",
    "title": "Siege Camp Approach: Firelight in Fog",
    "x": 20, "y": -5, "floorId": "overland",
    "tileStyle": "fog_field",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, fog field with scattered campfires ahead, silhouettes of tents and siege engines, cinematic, no text",
    "description": "Campfires make the fog glow.\n\nSomewhere in that sprawl is the standard that keeps them brave.\n\nKess waits low in the grass.",
    "actionsAvailable": {
      "talk": {
        "text": "Kess points toward a darker trench line.",
        "choices": [
          { "id": "kess", "label": "Talk to Lieutenant Kess.", "effects": [{ "type": "openDialogue", "npcId": "npc_lieut_kess" }] },
          { "id": "start", "label": "Start: Steal the War Standard.", "effects": [{ "type": "startJob", "jobId": "q_siege_camp_raid" }] }
        ]
      }
    },
    "choices": [
      { "id": "to_pickets", "label": "Slip toward the picket line.", "goToAreaId": "p_picket_line" }
    ]
  },

  {
    "id": "p_picket_line",
    "title": "Picket Line: Whispering Arrows",
    "x": 21, "y": -5, "floorId": "camp",
    "tileStyle": "camp_edge",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, goblin pickets with bows near stake fence, campfire glow, cinematic, no text",
    "description": "Three goblins watch the fog.\n\nThey are bored.\n\nBored creatures shoot first to feel alive.",
    "choices": [
      {
        "id": "fake_signal",
        "label": "Use the stolen codebook to fake a recall signal (mind check).",
        "requirements": [{ "type": "flagEquals", "key": "counter_signal_unlocked", "value": true }],
        "effects": [
          {
            "type": "skillCheck",
            "skill": "mind",
            "dc": 10,
            "onPass": [
              { "type": "flag", "key": "camp_guards_pulled_away", "value": true },
              { "type": "addXP", "amount": 12 }
            ],
            "onFail": [
              { "type": "flag", "key": "camp_alarm_level", "value": 1 },
              { "type": "flag", "key": "enemy_suspicious_signals", "value": true }
            ]
          }
        ],
        "goToAreaId": "p_trench_entry"
      },
      {
        "id": "fight_pickets",
        "label": "Fight through the pickets.",
        "effects": [
          {
            "type": "startThreat",
            "threat": {
              "threatId": "t_camp_pickets",
              "enemyGroupId": "camp_picket_line",
              "distance": 3,
              "direction": "n",
              "speed": 1,
              "targetAreaId": "p_picket_line",
              "hazards": []
            }
          },
          { "type": "flag", "key": "camp_alarm_level", "value": 1 }
        ],
        "goToAreaId": "p_picket_fight"
      }
    ]
  },

  {
    "id": "p_picket_fight",
    "title": "Picket Clash",
    "x": 22, "y": -5, "floorId": "camp",
    "tileStyle": "camp_edge",
    "cover": "low",
    "blocksLOS": false,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, arrows in fog, close melee at stake fence, cinematic, no text",
    "description": "The fog turns chaotic.\n\nA goblin screams.\n\nIf the camp wakes, the raid becomes a chase.",
    "choices": [
      { "id": "fight", "label": "Fight.", "effects": [{ "type": "forceCombatFromThreat", "threatId": "t_camp_pickets" }], "goToAreaId": "p_trench_entry" }
    ]
  },

  {
    "id": "p_trench_entry",
    "title": "Command Trench Entry",
    "x": 23, "y": -5, "floorId": "camp",
    "tileStyle": "trench",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, trench line with crude boards, lanterns, muffled voices, cinematic, no text",
    "description": "The trench smells of pitch and wet wool.\n\nOrders travel here like disease.\n\nSomewhere below is the ‘vault’ and its banner.",
    "choices": [
      { "id": "to_command_tent", "label": "Move toward the command tent.", "goToAreaId": "p_command_tent" },
      { "id": "to_tunnels", "label": "Find the tunnel drop leading to the buried vault.", "goToAreaId": "p_command_tunnels" }
    ]
  },

  {
    "id": "p_command_tent",
    "title": "Command Tent: Maps on Bloodwood",
    "x": 24, "y": -5, "floorId": "camp",
    "tileStyle": "tent",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, command tent interior, maps, wax seals, helmets, torch smoke, cinematic, no text",
    "description": "Maps. Wax seals. A brass stamping plate.\n\nThis is where they decide which streets burn.\n\nTake what you can before footsteps arrive.",
    "choices": [
      {
        "id": "take_plate",
        "label": "Take the command seal plate.",
        "effects": [{ "type": "addItem", "itemId": "command_seal_plate", "qty": 1 }, { "type": "addXP", "amount": 12 }],
        "goToAreaId": "p_command_tunnels"
      },
      {
        "id": "inner_guard",
        "label": "An inner guard approaches.",
        "effects": [
          {
            "type": "startThreat",
            "threat": {
              "threatId": "t_camp_inner",
              "enemyGroupId": "camp_inner_guard",
              "distance": 2,
              "direction": "w",
              "speed": 1,
              "targetAreaId": "p_command_tent",
              "hazards": []
            }
          },
          { "type": "flag", "key": "camp_alarm_level", "value": 2 }
        ],
        "goToAreaId": "p_tent_contact"
      }
    ]
  },

  {
    "id": "p_tent_contact",
    "title": "Tent Contact",
    "x": 25, "y": -5, "floorId": "camp",
    "tileStyle": "tent",
    "cover": "low",
    "blocksLOS": false,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, orc drillmaster entering tent, goblin behind, torch flare, cinematic, no text",
    "description": "The drillmaster fills the entrance.\n\nYou don’t have room to run.\n\nYou have room to win.",
    "choices": [
      { "id": "fight", "label": "Fight.", "effects": [{ "type": "forceCombatFromThreat", "threatId": "t_camp_inner" }], "goToAreaId": "p_command_tunnels" }
    ]
  },

  {
    "id": "p_command_tunnels",
    "title": "Command Tunnels: Chalk and Breath",
    "x": 23, "y": -6, "floorId": "camp",
    "tileStyle": "tunnel",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, narrow tunnels under camp, dripping earth, lanterns, chalk marks, cinematic, no text",
    "description": "Earth tunnels beneath the trench.\n\nIf you get lost, you die quietly.\n\nA vault waits ahead—guarded by something that believes in the banner.",
    "choices": [
      { "id": "mark", "label": "Mark the tunnel path with chalk.", "effects": [{ "type": "addItem", "itemId": "tunnel_chalk_mark", "qty": 1 }, { "type": "addXP", "amount": 6 }], "goToAreaId": "p_war_standard_vault" },
      { "id": "press", "label": "Press on without marking.", "goToAreaId": "p_war_standard_vault" }
    ]
  },

  {
    "id": "p_war_standard_vault",
    "title": "War-Standard Vault: The Banner That Bites",
    "x": 23, "y": -7, "floorId": "camp",
    "tileStyle": "vault",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, buried vault chamber, black banner on rack, guardian in shadow, cinematic, no text",
    "description": "The banner hangs heavy, as if soaked in fear.\n\nA guardian stands before it.\n\nNot a soldier.\n\nA believer.",
    "choices": [
      {
        "id": "boss",
        "label": "Fight the Standard Guardian.",
        "effects": [{ "type": "startCombat", "enemyGroup": [{ "enemyId": "standard_guardian", "count": 1 }] }],
        "goToAreaId": "p_vault_loot"
      }
    ]
  },

  {
    "id": "p_vault_loot",
    "title": "Banner Taken",
    "x": 23, "y": -8, "floorId": "camp",
    "tileStyle": "vault",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, player lifting heavy black banner, torchlight, shattered rack, cinematic, no text",
    "description": "You take the war standard.\n\nIt feels like lifting a piece of the enemy’s spine.\n\nAbove, the camp still thinks it is winning.\n\nNot for long.",
    "effectsOnEnter": [
      { "type": "addItem", "itemId": "war_standard_black", "qty": 1 },
      { "type": "flag", "key": "war_standard_taken", "value": true },
      { "type": "flag", "key": "enemy_morale_shaken", "value": true },
      { "type": "completeJob", "jobId": "q_siege_camp_raid" },
      { "type": "addXP", "amount": 22 }
    ],
    "choices": [
      {
        "id": "escape",
        "label": "Escape back through the fog to the postern gate.",
        "effects": [{ "type": "flag", "key": "camp_raid_escape", "value": true }],
        "goToAreaId": "f_postern_return"
      }
    ]
  }
]

What you’ve unlocked for the next “Battle at the Gates” chapter

You now have three huge story levers that feel very Fighting Fantasy:

Crystal Ball → lets you pre-empt threats instead of only reacting

Traitor resolved → reduces future “inside the walls” incidents, and can expose a chain of collaborators later

War Standard stolen (enemy_morale_shaken) → later siege waves become less coordinated, more prone to panic retreats, and you can force “morale choice pages” where enemies break or surrender

If you say continue again, I’ll generate:

Return with the banner (city morale surge, council politics, public recognition vs secrecy)

a major siege chapter where the enemy launches the biggest assault yet—and you use:

crystal ball forewarning + counter-signals + morale break from missing standard

plus a branch into the Under-Fortress route to permanently eliminate the “second mouth” if it’s still active.

continue

Alright — Banner Return → “Great Assault” siege chapter → optional “Second Mouth” permanent fix.

You’ll get 12 drop-in files:

/content/items_banner_return.json

/content/npcs_banner_return.json

/content/enemies_banner_return.json

/content/quests_banner_return.json

/content/areas_banner_return.json

/content/items_great_assault.json

/content/npcs_great_assault.json

/content/enemies_great_assault.json

/content/quests_great_assault.json

/content/areas_great_assault.json

/content/enemies_second_mouth_fix.json

/content/areas_second_mouth_fix.json

These react to your flags:

war_standard_taken, enemy_morale_shaken

crystal_ball_recovered, night_assault_known

counter_signal_unlocked, enemy_suspicious_signals

drains_threat_persistent, second_mouth_collapsed, enemy_second_mouth_active

city_damage_high, city_barricades_installed, militia_bolstered

/content/items_banner_return.json
[
  {
    "id": "banner_cloth_strip",
    "name": "Strip of Black Banner Cloth",
    "type": "quest",
    "stackable": true,
    "value": 0,
    "description": "A strip cut from the stolen war standard. Proof for skeptics, leverage for allies."
  },
  {
    "id": "civic_medal_ironleaf",
    "name": "Ironleaf Civic Medal",
    "type": "trinket",
    "stackable": false,
    "value": 0,
    "description": "A simple iron medal awarded by the city. Adds authority in civic encounters."
  },
  {
    "id": "sealed_orders_packet",
    "name": "Sealed Orders Packet",
    "type": "quest",
    "stackable": false,
    "value": 0,
    "description": "Council orders granting you emergency authority during the Great Assault."
  },
  {
    "id": "tower_signal_shutter_set",
    "name": "Signal Shutter Set",
    "type": "tool",
    "stackable": false,
    "value": 14,
    "description": "A kit of shutters and lenses for rapid lantern patterns. Improves counter-signal checks."
  },
  {
    "id": "holy_pitch_vial",
    "name": "Holy Pitch Vial",
    "type": "tool",
    "stackable": true,
    "value": 10,
    "description": "Blessed pitch used to seal cracks and choke crawlspaces. Useful against drains routes."
  }
]

/content/npcs_banner_return.json
[
  {
    "id": "npc_captain_harl",
    "name": "Captain Harl",
    "role": "City Guard Captain",
    "portraitPrompt": "fantasy character portrait, battle-worn guard captain in lamellar armor, torchlit gatehouse, rain droplets, painterly, no text",
    "dialogue": {
      "greeting": "You brought it back? Saints. The camp will howl when they notice.",
      "nodes": [
        {
          "id": "banner_return",
          "text": "We can show the banner to the people—raise morale.\n\nOr keep it secret—use it as bait, or as proof only when needed.\n\nChoose. Either choice has teeth.",
          "choices": [
            { "label": "Hold a public reveal (morale surge, enemy adapts).", "effects": [{ "type": "flag", "key": "banner_revealed_publicly", "value": true }] },
            { "label": "Keep it secret (tactical advantage, less morale).", "effects": [{ "type": "flag", "key": "banner_kept_secret", "value": true }] }
          ]
        }
      ]
    }
  },
  {
    "id": "npc_councilor_vayne",
    "name": "Councilor Vayne",
    "role": "War Council",
    "portraitPrompt": "fantasy character portrait, stern councilor with wax seals and maps, crystal glow, painterly, no text",
    "dialogue": {
      "greeting": "The enemy loses coordination when their symbols die. Good.",
      "nodes": [
        {
          "id": "orders",
          "text": "The Great Assault is coming within the day.\n\nWe’ll issue emergency authority.\n\nAnd we’ll decide whether the banner becomes hope—or becomes a knife.",
          "choices": [
            { "label": "Request emergency orders.", "effects": [{ "type": "addItem", "itemId": "sealed_orders_packet", "qty": 1 }] },
            { "label": "Request signal equipment.", "effects": [{ "type": "addItem", "itemId": "tower_signal_shutter_set", "qty": 1 }] }
          ]
        }
      ]
    }
  },
  {
    "id": "npc_archivist_salenne",
    "name": "Archivist Salenne",
    "role": "Mage Tower Scrying Lead",
    "portraitPrompt": "fantasy character portrait, mage archivist with crystal ball light, chalk runes, painterly, no text",
    "dialogue": {
      "greeting": "The ball shows a single, clean truth: the next assault is their biggest.",
      "nodes": [
        {
          "id": "warning",
          "text": "They will push three fronts:\n\n1) A siege tower at the main wall.\n2) A ram at the gate.\n3) A drains surge—if the ‘second mouth’ still lives.\n\nIf you choose correctly, thousands live.\n\nIf not, the city becomes a corridor.",
          "choices": [
            { "label": "Ask how to counter-signal under pressure.", "effects": [{ "type": "flag", "key": "salenne_signal_coaching", "value": true }] },
            { "label": "Ask how to blunt the drains surge.", "effects": [{ "type": "addItem", "itemId": "holy_pitch_vial", "qty": 1 }] }
          ]
        }
      ]
    }
  }
]

/content/enemies_banner_return.json
[
  {
    "id": "city_rioter",
    "name": "Panicked Rioter",
    "kind": "humanoid",
    "skill": 7,
    "stamina": 7,
    "meta": { "special": "panic_shove" },
    "loot": [{ "itemId": "gold_coin", "min": 0, "max": 2 }],
    "tags": ["city", "panic"]
  },
  {
    "id": "enemy_scout_sniper",
    "name": "Enemy Scout Sniper",
    "kind": "humanoid",
    "skill": 10,
    "stamina": 9,
    "meta": { "ranged": true, "range": 3, "damage": "1d6", "ammoType": "arrow" },
    "loot": [{ "itemId": "gold_coin", "min": 1, "max": 10 }],
    "tags": ["enemy", "scout", "ranged"]
  }
]

/content/quests_banner_return.json
[
  {
    "id": "q_banner_return",
    "name": "Return with the War Standard",
    "giverNpcId": "npc_captain_harl",
    "startAreaId": "br_postern_arrival",
    "objective": { "type": "setFlag", "key": "banner_return_complete", "value": true },
    "grantsOnStart": [],
    "rewards": { "gold": 8, "xp": 24, "items": [{ "itemId": "banner_cloth_strip", "qty": 1 }] },
    "cooldownMinutes": 99999
  },
  {
    "id": "q_banner_choice",
    "name": "Banner Policy: Hope or Knife",
    "giverNpcId": "npc_councilor_vayne",
    "startAreaId": "br_council_banner",
    "objective": { "type": "setFlag", "key": "banner_policy_set", "value": true },
    "grantsOnStart": [],
    "rewards": { "gold": 0, "xp": 18, "items": [{ "itemId": "civic_medal_ironleaf", "qty": 1 }] },
    "cooldownMinutes": 99999
  }
]

/content/areas_banner_return.json
[
  {
    "id": "br_postern_arrival",
    "title": "Postern Gate: Banner Under Cloak",
    "x": 0, "y": -1, "floorId": "city",
    "tileStyle": "postern",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, returning through postern gate with bundled banner, lantern code flash, rain, cinematic, no text",
    "description": "The banner is heavier than cloth should be.\n\nThe guards stare as if you carried a piece of tomorrow.\n\nCaptain Harl arrives, breathless.",
    "choices": [
      {
        "id": "start_return",
        "label": "Report the banner return.",
        "effects": [
          { "type": "startJob", "jobId": "q_banner_return" },
          { "type": "flag", "key": "banner_return_complete", "value": true },
          { "type": "completeJob", "jobId": "q_banner_return" },
          { "type": "flag", "key": "banner_in_city", "value": true }
        ],
        "goToAreaId": "br_barracks_react"
      }
    ]
  },

  {
    "id": "br_barracks_react",
    "title": "Barracks: The City Hears a Rumour",
    "x": 1, "y": -1, "floorId": "city",
    "tileStyle": "barracks",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, barracks with soldiers whispering, bundled banner on table, captain gesturing, cinematic, no text",
    "description": "Word spreads faster than arrows.\n\nSome beg you to show it.\n\nSome beg you to hide it.\n\nHarl watches your face for the decision.",
    "actionsAvailable": {
      "talk": {
        "text": "Harl is blunt: the people are brittle right now.",
        "choices": [
          { "id": "harl", "label": "Talk to Captain Harl.", "effects": [{ "type": "openDialogue", "npcId": "npc_captain_harl" }] }
        ]
      }
    },
    "choices": [
      {
        "id": "to_council",
        "label": "Bring the matter to the council immediately.",
        "goToAreaId": "br_council_banner"
      }
    ]
  },

  {
    "id": "br_council_banner",
    "title": "Council Chamber: Banner Policy",
    "x": 1, "y": 0, "floorId": "city",
    "tileStyle": "council",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, council chamber with black banner bundle on map table, officials arguing, cinematic, no text",
    "description": "Vayne’s eyes flick to the banner.\n\n\"Symbols are weapons,\" she says.\n\n\"Decide how we wield this one.\"",
    "choices": [
      {
        "id": "set_policy",
        "label": "Set banner policy now.",
        "effects": [
          { "type": "startJob", "jobId": "q_banner_choice" },
          { "type": "flag", "key": "banner_policy_set", "value": true },
          { "type": "completeJob", "jobId": "q_banner_choice" },
          {
            "type": "conditional",
            "when": [{ "key": "banner_revealed_publicly", "op": "==", "value": true }],
            "then": [
              { "type": "flag", "key": "city_morale_boosted", "value": true },
              { "type": "flag", "key": "enemy_adapts_to_missing_banner", "value": true },
              { "type": "addXP", "amount": 10 }
            ],
            "else": []
          },
          {
            "type": "conditional",
            "when": [{ "key": "banner_kept_secret", "op": "==", "value": true }],
            "then": [
              { "type": "flag", "key": "city_morale_boosted", "value": false },
              { "type": "flag", "key": "enemy_adapts_to_missing_banner", "value": false },
              { "type": "addXP", "amount": 8 }
            ],
            "else": []
          }
        ],
        "goToAreaId": "br_mage_warning"
      }
    ],
    "actionsAvailable": {
      "talk": {
        "text": "Vayne will issue emergency authority either way.",
        "choices": [
          { "id": "vayne", "label": "Talk to Councilor Vayne.", "effects": [{ "type": "openDialogue", "npcId": "npc_councilor_vayne" }] }
        ]
      }
    }
  },

  {
    "id": "br_mage_warning",
    "title": "Mage Tower: The Great Assault Foretold",
    "x": 2, "y": 0, "floorId": "city",
    "tileStyle": "tower",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, mage tower chamber, crystal ball showing siege tower and ram, anxious scribes, cinematic, no text",
    "description": "Salenne turns the crystal ball.\n\nImages rotate: a siege tower, a ram, water churning under streets.\n\n\"Within the day,\" she says. \"Their biggest push.\"",
    "actionsAvailable": {
      "talk": {
        "text": "Salenne offers you one clear advantage: foreknowledge.",
        "choices": [
          { "id": "salenne", "label": "Talk to Archivist Salenne.", "effects": [{ "type": "openDialogue", "npcId": "npc_archivist_salenne" }] }
        ]
      }
    },
    "choices": [
      {
        "id": "to_assault",
        "label": "Go to the battlements: the Great Assault begins.",
        "effects": [{ "type": "flag", "key": "great_assault_unlocked", "value": true }],
        "goToAreaId": "ga_battlements_start"
      }
    ]
  }
]

GREAT ASSAULT (Biggest siege yet)
/content/items_great_assault.json
[
  {
    "id": "assault_priority_token",
    "name": "Assault Priority Token",
    "type": "quest",
    "stackable": false,
    "value": 0,
    "description": "A council-marked token declaring your chosen priority during the Great Assault."
  },
  {
    "id": "signal_script_braid",
    "name": "Signal Script Braid",
    "type": "quest",
    "stackable": false,
    "value": 0,
    "description": "A braided cord with knots representing a signal sequence. Lowers the difficulty of one counter-signal check."
  },
  {
    "id": "gate_chain_hook",
    "name": "Gate Chain Hook",
    "type": "tool",
    "stackable": false,
    "value": 10,
    "description": "A heavy hook used to drag a ram off-line or snag ladders. Useful in wall defense."
  }
]

/content/npcs_great_assault.json
[
  {
    "id": "npc_guard_serjeant_mara",
    "name": "Serjeant Mara",
    "role": "Wall Serjeant (Hands-On Defense)",
    "portraitPrompt": "fantasy character portrait, gritty serjeant with scarred face and spear, battlements behind, rain and smoke, painterly, no text",
    "dialogue": {
      "greeting": "Pick a front. If you try to fight everywhere, you die everywhere.",
      "nodes": [
        {
          "id": "fronts",
          "text": "Three threats:\n\n- Siege tower at the main wall.\n- Ram at the gate.\n- Drains surge (if the mouth still lives).\n\nTell me where you go first.",
          "choices": [
            { "label": "Main wall (siege tower).", "effects": [{ "type": "flag", "key": "ga_choice", "value": "wall" }] },
            { "label": "Gate (ram).", "effects": [{ "type": "flag", "key": "ga_choice", "value": "gate" }] },
            { "label": "Drains (inner knife).", "effects": [{ "type": "flag", "key": "ga_choice", "value": "drains" }] }
          ]
        }
      ]
    }
  }
]

/content/enemies_great_assault.json
[
  {
    "id": "goblin_ladderman",
    "name": "Goblin Ladderman",
    "kind": "humanoid",
    "skill": 8,
    "stamina": 9,
    "meta": { "special": "set_ladder" },
    "loot": [{ "itemId": "gold_coin", "min": 0, "max": 6 }],
    "tags": ["goblin", "siege"]
  },
  {
    "id": "orc_ram_crew",
    "name": "Orc Ram Crew",
    "kind": "humanoid",
    "skill": 11,
    "stamina": 16,
    "meta": { "special": "ram_swing" },
    "loot": [{ "itemId": "gold_coin", "min": 2, "max": 14 }],
    "tags": ["orc", "siege", "gate"]
  },
  {
    "id": "siege_tower_vanguard",
    "name": "Siege Tower Vanguard",
    "kind": "humanoid",
    "skill": 12,
    "stamina": 18,
    "meta": { "special": "tower_push" },
    "loot": [{ "itemId": "gold_coin", "min": 4, "max": 16 }],
    "tags": ["orc", "siege", "tower"]
  },
  {
    "id": "panic_mob",
    "name": "Panic Mob",
    "kind": "group",
    "members": [{ "enemyId": "city_rioter", "count": 3 }],
    "meta": { "pursuit": { "speed": 1, "startDistance": 2, "morale": 6 } },
    "tags": ["city", "panic", "group"]
  },

  {
    "id": "ga_wall_wave",
    "name": "Great Assault: Wall Wave",
    "kind": "group",
    "members": [{ "enemyId": "goblin_ladderman", "count": 3 }, { "enemyId": "siege_tower_vanguard", "count": 1 }],
    "meta": { "pursuit": { "speed": 1, "startDistance": 3, "morale": 10 } },
    "tags": ["group", "siege", "wall"]
  },
  {
    "id": "ga_gate_wave",
    "name": "Great Assault: Gate Wave",
    "kind": "group",
    "members": [{ "enemyId": "orc_ram_crew", "count": 1 }, { "enemyId": "goblin_ladderman", "count": 1 }],
    "meta": { "pursuit": { "speed": 1, "startDistance": 3, "morale": 10 } },
    "tags": ["group", "siege", "gate"]
  }
]

/content/quests_great_assault.json
[
  {
    "id": "q_great_assault",
    "name": "The Great Assault: Hold the City",
    "giverNpcId": "npc_guard_serjeant_mara",
    "startAreaId": "ga_battlements_start",
    "objective": { "type": "setFlag", "key": "great_assault_complete", "value": true },
    "grantsOnStart": [],
    "rewards": { "gold": 20, "xp": 90, "items": [] },
    "cooldownMinutes": 99999
  }
]

/content/areas_great_assault.json
[
  {
    "id": "ga_battlements_start",
    "title": "Battlements: The Biggest Push",
    "x": 3, "y": 2, "floorId": "city",
    "tileStyle": "battlements",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, massive siege lines, siege tower rolling, ram at gate, arrows, smoke, cinematic, no text",
    "description": "It begins.\n\nSiege tower wheels forward.\n\nA ram pounds the gate.\n\nSomewhere below, water churns under streets.\n\nYou can’t stop everything. Choose.",
    "actionsAvailable": {
      "talk": {
        "text": "Serjeant Mara grips your shoulder.",
        "choices": [
          { "id": "mara", "label": "Talk to Serjeant Mara.", "effects": [{ "type": "openDialogue", "npcId": "npc_guard_serjeant_mara" }] },
          { "id": "start", "label": "Start: The Great Assault.", "effects": [{ "type": "startJob", "jobId": "q_great_assault" }] }
        ]
      }
    },
    "choices": [
      {
        "id": "prep_signal",
        "label": "If you have shutters, prep a counter-signal (one free advantage).",
        "requirements": [{ "type": "hasItem", "itemId": "tower_signal_shutter_set", "qty": 1 }],
        "effects": [{ "type": "addItem", "itemId": "signal_script_braid", "qty": 1 }],
        "goToAreaId": "ga_choice_page"
      },
      {
        "id": "no_prep",
        "label": "No time—choose a front now.",
        "goToAreaId": "ga_choice_page"
      }
    ]
  },

  {
    "id": "ga_choice_page",
    "title": "Choice: Where You Stand Matters",
    "x": 3, "y": 3, "floorId": "city",
    "tileStyle": "civic",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, war map on battlement table with three marked fronts, hands pointing, cinematic, no text",
    "description": "The city is a body.\n\nThe wall is its ribs.\n\nThe gate is its throat.\n\nThe drains are its veins.\n\nChoose where you fight first.",
    "choices": [
      {
        "id": "go_wall",
        "label": "1) Main Wall: stop the siege tower and ladders.",
        "effects": [{ "type": "addItem", "itemId": "assault_priority_token", "qty": 1 }, { "type": "flag", "key": "ga_choice", "value": "wall" }],
        "goToAreaId": "ga_main_wall"
      },
      {
        "id": "go_gate",
        "label": "2) Gate: stop the ram.",
        "effects": [{ "type": "addItem", "itemId": "assault_priority_token", "qty": 1 }, { "type": "flag", "key": "ga_choice", "value": "gate" }],
        "goToAreaId": "ga_gatehouse"
      },
      {
        "id": "go_drains",
        "label": "3) Drains: stop an inner surge (only if the mouth still lives).",
        "requirements": [{ "type": "flagEquals", "key": "drains_threat_persistent", "value": true }],
        "effects": [{ "type": "addItem", "itemId": "assault_priority_token", "qty": 1 }, { "type": "flag", "key": "ga_choice", "value": "drains" }],
        "goToAreaId": "ga_drains_entry"
      }
    ]
  },

  {
    "id": "ga_main_wall",
    "title": "Main Wall: Tower and Ladders",
    "x": 4, "y": 3, "floorId": "city",
    "tileStyle": "battlements",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, siege tower nearing wall, ladders rising, defenders shouting, cinematic, no text",
    "description": "Ladders bite the stone.\n\nThe siege tower rolls like an oncoming house.\n\nIf the enemy lacks their standard, their courage wavers—if you push them hard enough.",
    "choices": [
      {
        "id": "counter_signal_wall",
        "label": "Counter-signal: confuse ladder timings (mind check).",
        "requirements": [{ "type": "flagEquals", "key": "counter_signal_unlocked", "value": true }],
        "effects": [
          {
            "type": "skillCheck",
            "skill": "mind",
            "dc": 10,
            "onPass": [
              { "type": "flag", "key": "ga_wall_confused", "value": true },
              { "type": "addXP", "amount": 12 }
            ],
            "onFail": [
              { "type": "flag", "key": "enemy_suspicious_signals", "value": true }
            ]
          }
        ],
        "goToAreaId": "ga_wall_fight"
      },
      {
        "id": "fight_wall",
        "label": "Fight the wall wave.",
        "goToAreaId": "ga_wall_fight"
      }
    ]
  },

  {
    "id": "ga_wall_fight",
    "title": "Wall Clash",
    "x": 5, "y": 3, "floorId": "city",
    "tileStyle": "battlements",
    "cover": "low",
    "blocksLOS": false,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, close combat on wall, ladders, arrows, rain, cinematic, no text",
    "description": "A ladderman climbs.\n\nA vanguard shoves.\n\nWin here and the tower stalls.\n\nLose here and the city bleeds.",
    "choices": [
      {
        "id": "start_wall_threat",
        "label": "Fight the wave.",
        "effects": [
          {
            "type": "startThreat",
            "threat": {
              "threatId": "t_ga_wall",
              "enemyGroupId": "ga_wall_wave",
              "distance": 3,
              "direction": "n",
              "speed": 1,
              "targetAreaId": "ga_wall_fight",
              "hazards": []
            }
          }
        ],
        "goToAreaId": "ga_wall_resolution"
      }
    ]
  },

  {
    "id": "ga_wall_resolution",
    "title": "Wall Resolution: Morale Break",
    "x": 6, "y": 3, "floorId": "city",
    "tileStyle": "battlements",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, enemies faltering, ladder slipping, defenders pushing back, cinematic, no text",
    "description": "Without their banner, some hesitate.\n\nHesitation is how armies die.\n\nIf you press, they may break.",
    "choices": [
      {
        "id": "press_morale",
        "label": "Press the morale break (luck check).",
        "effects": [
          {
            "type": "skillCheck",
            "skill": "luck",
            "dc": 9,
            "onPass": [
              { "type": "flag", "key": "ga_wall_enemy_retreat", "value": true },
              { "type": "flag", "key": "enemy_morale_shaken", "value": true },
              { "type": "addXP", "amount": 14 }
            ],
            "onFail": [
              { "type": "flag", "key": "ga_wall_enemy_retreat", "value": false },
              { "type": "addXP", "amount": 6 }
            ]
          }
        ],
        "goToAreaId": "ga_end"
      },
      { "id": "move_on", "label": "Leave the wall and run to another front.", "goToAreaId": "ga_end" }
    ]
  },

  {
    "id": "ga_gatehouse",
    "title": "Gatehouse: The Ram",
    "x": 4, "y": 2, "floorId": "city",
    "tileStyle": "gatehouse",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, gatehouse shaking under ram hits, splinters flying, defenders bracing, cinematic, no text",
    "description": "The ram strikes like a drum calling death.\n\nIf you installed barricades, the approach is tighter.\n\nIf you brought a chain hook, you might pull the ram off-line.",
    "choices": [
      {
        "id": "hook",
        "label": "Use gate chain hook to drag the ram sideways (luck check).",
        "requirements": [{ "type": "hasItem", "itemId": "gate_chain_hook", "qty": 1 }],
        "effects": [
          {
            "type": "skillCheck",
            "skill": "luck",
            "dc": 9,
            "onPass": [{ "type": "flag", "key": "ga_gate_ram_offline", "value": true }, { "type": "addXP", "amount": 12 }],
            "onFail": [{ "type": "takeDamage", "amount": 1 }]
          }
        ],
        "goToAreaId": "ga_gate_fight"
      },
      { "id": "fight_gate", "label": "Fight the gate wave.", "goToAreaId": "ga_gate_fight" }
    ]
  },

  {
    "id": "ga_gate_fight",
    "title": "Gate Clash",
    "x": 5, "y": 2, "floorId": "city",
    "tileStyle": "gatehouse",
    "cover": "low",
    "blocksLOS": false,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, melee at gate, orc ram crew roaring, sparks and smoke, cinematic, no text",
    "description": "The ram crew fights like they’ve been promised glory.\n\nWithout the banner, that promise rings hollow.\n\nMake it ring.",
    "choices": [
      {
        "id": "start_gate_threat",
        "label": "Fight the wave.",
        "effects": [
          {
            "type": "startThreat",
            "threat": {
              "threatId": "t_ga_gate",
              "enemyGroupId": "ga_gate_wave",
              "distance": 3,
              "direction": "n",
              "speed": 1,
              "targetAreaId": "ga_gate_fight",
              "hazards": []
            }
          }
        ],
        "goToAreaId": "ga_gate_resolution"
      }
    ]
  },

  {
    "id": "ga_gate_resolution",
    "title": "Gate Resolution: The Door Holds",
    "x": 6, "y": 2, "floorId": "city",
    "tileStyle": "gatehouse",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, gate still standing, broken ram pieces, exhausted defenders, cinematic, no text",
    "description": "If the gate holds, the city keeps its spine.\n\nIf it fails, the streets become a slaughterhouse.\n\nThe assault still rages elsewhere—run if you must.",
    "choices": [
      { "id": "to_end", "label": "Sprint to the final consolidation.", "goToAreaId": "ga_end" }
    ]
  },

  {
    "id": "ga_drains_entry",
    "title": "Drains Entry: The Inner Surge",
    "x": 3, "y": 1, "floorId": "sewer",
    "tileStyle": "sewer",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, sewer entry with churning water and shadows, lantern reflection, cinematic, no text",
    "description": "Water churns like something breathing.\n\nIf the ‘second mouth’ still lives, it can vomit enemies into the city.\n\nStop them now—or stop the mouth forever later.",
    "choices": [
      {
        "id": "seal_with_pitch",
        "label": "Use holy pitch to choke the crawlspace (luck check).",
        "requirements": [{ "type": "hasItem", "itemId": "holy_pitch_vial", "qty": 1 }],
        "effects": [
          { "type": "removeItem", "itemId": "holy_pitch_vial", "qty": 1 },
          {
            "type": "skillCheck",
            "skill": "luck",
            "dc": 9,
            "onPass": [{ "type": "flag", "key": "ga_drains_delayed", "value": true }, { "type": "addXP", "amount": 12 }],
            "onFail": [{ "type": "takeDamage", "amount": 1 }]
          }
        ],
        "goToAreaId": "ga_end"
      },
      {
        "id": "commit_fix",
        "label": "Commit to the permanent fix: hunt the second mouth after the assault.",
        "effects": [{ "type": "flag", "key": "second_mouth_fix_unlocked", "value": true }],
        "goToAreaId": "ga_end"
      }
    ]
  },

  {
    "id": "ga_end",
    "title": "Great Assault: Consolidation",
    "x": 3, "y": 4, "floorId": "city",
    "tileStyle": "civic",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, defenders regrouping, wounded treated, smoke thinning, dawn light, cinematic, no text",
    "description": "Hours later, the city still stands.\n\nNot whole. Not safe.\n\nBut standing.\n\nNow you decide what ends this war faster:\n\n- Keep striking the enemy’s command.\n- Or seal the drains route forever.",
    "effectsOnEnter": [
      { "type": "flag", "key": "great_assault_complete", "value": true },
      { "type": "completeJob", "jobId": "q_great_assault" }
    ],
    "choices": [
      {
        "id": "to_second_mouth_fix",
        "label": "If drains threat persists, pursue the permanent fix beneath the city.",
        "requirements": [{ "type": "flagEquals", "key": "drains_threat_persistent", "value": true }],
        "goToAreaId": "smf_descent"
      },
      {
        "id": "to_next_war",
        "label": "Prepare the next counterstrike (future arc): break their siege engines for good.",
        "effects": [{ "type": "flag", "key": "siege_engines_arc_unlocked", "value": true }],
        "goToAreaId": "br_mage_warning"
      }
    ]
  }
]

SECOND MOUTH PERMANENT FIX (optional branch)
/content/enemies_second_mouth_fix.json
[
  {
    "id": "mouth_crawler",
    "name": "Mouth Crawler",
    "kind": "monster",
    "skill": 10,
    "stamina": 12,
    "meta": { "special": "cling_and_slice" },
    "loot": [{ "itemId": "gold_coin", "min": 0, "max": 6 }],
    "tags": ["drains", "monster"]
  },
  {
    "id": "sewer_fanatic",
    "name": "Sewer Fanatic",
    "kind": "humanoid",
    "skill": 10,
    "stamina": 11,
    "meta": { "special": "smoke_bomb" },
    "loot": [{ "itemId": "mage_ward_chalk", "min": 0, "max": 1 }],
    "tags": ["drains", "cult"]
  },
  {
    "id": "maw_priest",
    "name": "Maw Priest of the Second Mouth",
    "kind": "humanoid",
    "skill": 13,
    "stamina": 20,
    "meta": { "special": "call_crawlers" },
    "loot": [{ "itemId": "gold_coin", "min": 8, "max": 22 }],
    "tags": ["boss", "drains", "cult"]
  },
  {
    "id": "smf_pack",
    "name": "Mouth Pack",
    "kind": "group",
    "members": [{ "enemyId": "mouth_crawler", "count": 2 }, { "enemyId": "sewer_fanatic", "count": 1 }],
    "meta": { "pursuit": { "speed": 1, "startDistance": 2, "morale": 9 } },
    "tags": ["group", "drains"]
  }
]

/content/areas_second_mouth_fix.json
[
  {
    "id": "smf_descent",
    "title": "Descent: Wet Steps, Old Hate",
    "x": 0, "y": -3, "floorId": "sewer",
    "tileStyle": "sewer",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, descending sewer stairs, black water below, rune marks, cinematic, no text",
    "description": "The city’s stone sweats above you.\n\nThe deeper tunnels feel… shaped.\n\nAs if a throat was carved into the earth.",
    "choices": [
      {
        "id": "pack",
        "label": "Shadows move—something hunts these tunnels.",
        "effects": [
          {
            "type": "startThreat",
            "threat": {
              "threatId": "t_smf_pack",
              "enemyGroupId": "smf_pack",
              "distance": 2,
              "direction": "n",
              "speed": 1,
              "targetAreaId": "smf_descent",
              "hazards": []
            }
          }
        ],
        "goToAreaId": "smf_tunnel_clash"
      }
    ]
  },

  {
    "id": "smf_tunnel_clash",
    "title": "Tunnel Clash: Teeth in the Drip",
    "x": 0, "y": -4, "floorId": "sewer",
    "tileStyle": "sewer",
    "cover": "low",
    "blocksLOS": false,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, tight sewer fight, clawed creature on wall, lantern glare, cinematic, no text",
    "description": "A crawler clings to the wall like a spider.\n\nA fanatic laughs behind it.\n\nIf you’re here, you finish this—no more half measures.",
    "choices": [
      { "id": "fight", "label": "Fight.", "effects": [{ "type": "forceCombatFromThreat", "threatId": "t_smf_pack" }], "goToAreaId": "smf_mouth_chamber" }
    ]
  },

  {
    "id": "smf_mouth_chamber",
    "title": "The Second Mouth: Chamber of Breathing Stone",
    "x": 0, "y": -5, "floorId": "sewer",
    "tileStyle": "mouth",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, grotesque sewer chamber like a carved throat, water swirling, cult candles, cinematic, no text",
    "description": "Stone curves like ribs.\n\nWater spirals into a dark throat.\n\nA priest stands at the edge, chanting.\n\nThis is where the city gets stabbed from within.",
    "choices": [
      {
        "id": "boss",
        "label": "Fight the Maw Priest.",
        "effects": [{ "type": "startCombat", "enemyGroup": [{ "enemyId": "maw_priest", "count": 1 }] }],
        "goToAreaId": "smf_choice"
      }
    ]
  },

  {
    "id": "smf_choice",
    "title": "End It: Collapse or Sanctify",
    "x": 0, "y": -6, "floorId": "sewer",
    "tileStyle": "mouth",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, cracked stone throat with ward lines glowing, player holding chalk and tools, cinematic, no text",
    "description": "The mouth shudders without the priest’s chant.\n\nYou can collapse it with brute force.\n\nOr sanctify it with wardwork so it cannot be reopened.\n\nBoth are risky. Both are final.",
    "choices": [
      {
        "id": "collapse",
        "label": "1) Collapse the mouth (strength check).",
        "effects": [
          {
            "type": "skillCheck",
            "skill": "body",
            "dc": 10,
            "onPass": [
              { "type": "flag", "key": "second_mouth_collapsed", "value": true },
              { "type": "flag", "key": "drains_threat_persistent", "value": false },
              { "type": "flag", "key": "enemy_second_mouth_active", "value": false },
              { "type": "addXP", "amount": 22 }
            ],
            "onFail": [
              { "type": "takeDamage", "amount": 2 },
              { "type": "flag", "key": "second_mouth_collapse_partial", "value": true },
              { "type": "addXP", "amount": 10 }
            ]
          }
        ],
        "goToAreaId": "smf_return"
      },
      {
        "id": "sanctify",
        "label": "2) Sanctify the mouth with chalk wards (mind check).",
        "requirements": [{ "type": "hasItem", "itemId": "mage_ward_chalk", "qty": 1 }],
        "effects": [
          { "type": "removeItem", "itemId": "mage_ward_chalk", "qty": 1 },
          {
            "type": "skillCheck",
            "skill": "mind",
            "dc": 10,
            "onPass": [
              { "type": "flag", "key": "second_mouth_collapsed", "value": true },
              { "type": "flag", "key": "drains_threat_persistent", "value": false },
              { "type": "flag", "key": "enemy_second_mouth_active", "value": false },
              { "type": "flag", "key": "wards_strengthened", "value": true },
              { "type": "addXP", "amount": 24 }
            ],
            "onFail": [
              { "type": "takeDamage", "amount": 1 },
              { "type": "flag", "key": "wards_flicker", "value": true },
              { "type": "addXP", "amount": 10 }
            ]
          }
        ],
        "goToAreaId": "smf_return"
      }
    ]
  },

  {
    "id": "smf_return",
    "title": "Return: The City’s Veins Quiet",
    "x": 0, "y": -2, "floorId": "sewer",
    "tileStyle": "sewer",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, ascending sewer steps toward lantern light, water calmer, cinematic, no text",
    "description": "The water runs differently now.\n\nLess like breath.\n\nMore like water.\n\nIf you sealed the mouth, the city is safer from inside.\n\nNow the war becomes simpler: walls, gates, and open steel.",
    "choices": [
      {
        "id": "back_to_city",
        "label": "Return to the surface and prepare the next counterstrike.",
        "effects": [{ "type": "addXP", "amount": 12 }],
        "goToAreaId": "ga_end"
      }
    ]
  }
]


If you want me to continue, the next logical scenario stage is:

“Siege Engines Arc” (the one Vayne will call “the last piece of their confidence”):

sabotage / steal parts from their tower wheels, ram heads, and pitch cauldrons

a stealth-heavy mini-dungeon: Engine Yard → Pitch Pits → Foreman’s Cage

and then it feeds directly into the final mass battle at the gates, where your earlier choices (banner policy, scrying, signals, drains fix) all change which waves even appear.

continue
Thought for 10s

Absolutely — here’s the Siege Engines Arc (Engine Yard → Pitch Pits → Wheelhouse → Foreman’s Cage), and then the Final Battle at the Gates setup where all your earlier flags actually matter (banner policy, scrying, counter-signals, drains fix, engine sabotage).

You’ll get 10 drop-in files:

/content/items_siege_engines_arc.json

/content/enemies_siege_engines_arc.json

/content/npcs_siege_engines_arc.json

/content/quests_siege_engines_arc.json

/content/areas_siege_engines_arc.json

/content/items_final_battle.json

/content/enemies_final_battle.json

/content/npcs_final_battle.json

/content/quests_final_battle.json

/content/areas_final_battle.json

/content/items_siege_engines_arc.json
[
  {
    "id": "axle_spike_wedge",
    "name": "Axle Spike Wedge",
    "type": "tool",
    "stackable": true,
    "value": 8,
    "description": "A hardened wedge you can hammer into wheel hubs. Sabotages siege tower wheels if planted correctly."
  },
  {
    "id": "pitch_sand_sack",
    "name": "Sack of Sand (Pitch Spoiler)",
    "type": "tool",
    "stackable": false,
    "value": 6,
    "description": "Dumped into pitch cauldrons, it ruins the pour and clogs the spouts."
  },
  {
    "id": "ram_head_chain",
    "name": "Ram Head Chain",
    "type": "quest",
    "stackable": false,
    "value": 0,
    "description": "A heavy chain binding the ram’s metal head. If stolen, the ram becomes far less effective."
  },
  {
    "id": "engine_yard_key",
    "name": "Engine Yard Key",
    "type": "quest",
    "stackable": false,
    "value": 0,
    "description": "A crude iron key taken from a foreman’s belt. Opens the cage pens and the wheelhouse hatch."
  },
  {
    "id": "oily_rag_bundle",
    "name": "Oily Rag Bundle",
    "type": "tool",
    "stackable": true,
    "value": 4,
    "description": "Useful for smothering small flames or making a smoky distraction."
  },
  {
    "id": "cage_list_names",
    "name": "Cage List (Names & Places)",
    "type": "quest",
    "stackable": false,
    "value": 0,
    "description": "A scribbled list of captives and their origins. Proof of enemy slave labor operations and a hook for later quests."
  }
]

/content/enemies_siege_engines_arc.json
[
  {
    "id": "goblin_oiler",
    "name": "Goblin Oiler",
    "kind": "humanoid",
    "skill": 8,
    "stamina": 8,
    "meta": { "special": "slick_throw" },
    "loot": [{ "itemId": "oily_rag_bundle", "min": 0, "max": 1 }],
    "tags": ["camp", "engine", "utility"]
  },
  {
    "id": "orc_engine_guard",
    "name": "Orc Engine Guard",
    "kind": "humanoid",
    "skill": 12,
    "stamina": 18,
    "meta": { "special": "brace_and_shove" },
    "loot": [{ "itemId": "gold_coin", "min": 2, "max": 14 }],
    "tags": ["orc", "engine", "elite"]
  },
  {
    "id": "hobgoblin_foreman",
    "name": "Hobgoblin Foreman",
    "kind": "humanoid",
    "skill": 12,
    "stamina": 16,
    "meta": { "special": "whistle_alarm" },
    "loot": [{ "itemId": "engine_yard_key", "min": 1, "max": 1 }, { "itemId": "gold_coin", "min": 4, "max": 18 }],
    "tags": ["boss", "engine", "foreman"]
  },
  {
    "id": "pitch_pit_torchman",
    "name": "Pitch Pit Torchman",
    "kind": "humanoid",
    "skill": 10,
    "stamina": 12,
    "meta": { "special": "ignite_pitch" },
    "loot": [{ "itemId": "gold_coin", "min": 1, "max": 10 }],
    "tags": ["engine", "pitch"]
  },

  {
    "id": "engine_yard_patrol",
    "name": "Engine Yard Patrol",
    "kind": "group",
    "members": [{ "enemyId": "orc_engine_guard", "count": 1 }, { "enemyId": "goblin_oiler", "count": 1 }],
    "meta": { "pursuit": { "speed": 1, "startDistance": 3, "morale": 10 } },
    "tags": ["group", "engine", "pursuit"]
  },
  {
    "id": "pitch_pit_team",
    "name": "Pitch Pit Team",
    "kind": "group",
    "members": [{ "enemyId": "pitch_pit_torchman", "count": 1 }, { "enemyId": "goblin_oiler", "count": 2 }],
    "meta": { "pursuit": { "speed": 1, "startDistance": 2, "morale": 9 } },
    "tags": ["group", "engine", "pitch"]
  }
]

/content/npcs_siege_engines_arc.json
[
  {
    "id": "npc_scout_kess",
    "name": "Lieutenant Kess",
    "role": "Scout (Enemy Camp Sabotage)",
    "portraitPrompt": "fantasy character portrait, scout lieutenant muddy cloak, eyes reflecting campfire, tense, painterly, no text",
    "dialogue": {
      "greeting": "They rebuild confidence with wood and iron. Break the machines and you break their courage.",
      "nodes": [
        {
          "id": "options",
          "text": "Three targets. You can’t guarantee all three.\n\n1) Siege tower wheels.\n2) Gate ram head.\n3) Pitch cauldrons.\n\nIf you kept the banner secret, they won’t be looking for you.\nIf you revealed it publicly, expect tighter patrols.",
          "choices": [
            { "label": "Accept the sabotage mission.", "effects": [{ "type": "flag", "key": "siege_engines_mission_accepted", "value": true }] }
          ]
        }
      ]
    }
  },
  {
    "id": "npc_cage_prisoner_elin",
    "name": "Elin of the Far Farms",
    "role": "Captive Carpenter (Knows the Wheelhouse)",
    "portraitPrompt": "fantasy character portrait, exhausted carpenter prisoner behind bars, splinters in hands, determined eyes, painterly, no text",
    "dialogue": {
      "greeting": "If you’re here to kill us, do it quick. If you’re here to help… listen.",
      "nodes": [
        {
          "id": "intel",
          "text": "The wheelhouse hub has a soft join—hammer a wedge there and the tower limps.\n\nThe ram head chain is kept by the foreman.\n\nAnd the pitch pits… sand ruins it better than water.",
          "choices": [
            { "label": "Promise to free the cages if possible.", "effects": [{ "type": "flag", "key": "promised_free_cages", "value": true }] }
          ]
        }
      ]
    }
  }
]

/content/quests_siege_engines_arc.json
[
  {
    "id": "q_siege_engines_arc",
    "name": "Siege Engines: Break Their Machines",
    "giverNpcId": "npc_scout_kess",
    "startAreaId": "se_approach",
    "objective": { "type": "setFlag", "key": "siege_engines_arc_complete", "value": true },
    "grantsOnStart": [],
    "rewards": {
      "gold": 16,
      "xp": 85,
      "items": [{ "itemId": "axle_spike_wedge", "qty": 1 }, { "itemId": "pitch_sand_sack", "qty": 1 }]
    },
    "cooldownMinutes": 99999
  }
]

/content/areas_siege_engines_arc.json
[
  {
    "id": "se_approach",
    "title": "Engine Yard Approach: Wood, Iron, Confidence",
    "x": 30, "y": -6, "floorId": "overland",
    "tileStyle": "fog_field",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, fog field overlooking enemy engine yard, silhouettes of siege tower and ram, campfires, cinematic, no text",
    "description": "Beyond the fog: the engine yard.\n\nA siege tower like a moving barn.\n\nA ram head that shines wetly.\n\nPitch pits bubbling like black soup.\n\nKess crouches beside you.",
    "actionsAvailable": {
      "talk": {
        "text": "Kess points to weak points like a surgeon.",
        "choices": [
          { "id": "kess", "label": "Talk to Lieutenant Kess.", "effects": [{ "type": "openDialogue", "npcId": "npc_scout_kess" }] },
          { "id": "start", "label": "Start: Siege Engines sabotage.", "effects": [{ "type": "startJob", "jobId": "q_siege_engines_arc" }] }
        ]
      }
    },
    "choices": [
      {
        "id": "sneak_in",
        "label": "Sneak into the yard (luck check).",
        "effects": [
          {
            "type": "skillCheck",
            "skill": "luck",
            "dc": 9,
            "onPass": [{ "type": "flag", "key": "engine_yard_sneak_success", "value": true }, { "type": "addXP", "amount": 10 }],
            "onFail": [{ "type": "flag", "key": "camp_alarm_level", "value": 1 }]
          }
        ],
        "goToAreaId": "se_engine_yard"
      }
    ]
  },

  {
    "id": "se_engine_yard",
    "title": "Engine Yard: Patrols and Pulleys",
    "x": 31, "y": -6, "floorId": "camp",
    "tileStyle": "engine_yard",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, enemy engine yard with siege tower wheel frames, pulleys, guards, cinematic, no text",
    "description": "Everything creaks.\n\nRopes, frames, wheel hubs.\n\nA patrol circles.\n\nTo the left: the wheelhouse.\nTo the right: the pitch pits.\nAhead: cages and a foreman’s platform.",
    "choices": [
      {
        "id": "avoid_patrol",
        "label": "Avoid patrols (mind check).",
        "effects": [
          {
            "type": "skillCheck",
            "skill": "mind",
            "dc": 10,
            "onPass": [{ "type": "flag", "key": "engine_yard_patrol_avoided", "value": true }, { "type": "addXP", "amount": 8 }],
            "onFail": [
              {
                "type": "startThreat",
                "threat": { "threatId": "t_engine_patrol", "enemyGroupId": "engine_yard_patrol", "distance": 3, "direction": "n", "speed": 1, "targetAreaId": "se_engine_yard", "hazards": [] }
              }
            ]
          }
        ],
        "goToAreaId": "se_choice_targets"
      },
      { "id": "rush", "label": "Move fast and accept the risk.", "effects": [{ "type": "flag", "key": "camp_alarm_level", "value": 1 }], "goToAreaId": "se_choice_targets" }
    ]
  },

  {
    "id": "se_choice_targets",
    "title": "Choice: What You Break First",
    "x": 32, "y": -6, "floorId": "camp",
    "tileStyle": "engine_yard",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, close view of three targets: wheel hub, ram chain, pitch cauldron, cinematic, no text",
    "description": "Three targets.\n\nThree chances to tilt the final battle.\n\nPick one to attempt first (you may manage more if you stay alive).",
    "choices": [
      { "id": "wheelhouse", "label": "1) Wheelhouse: cripple the siege tower.", "goToAreaId": "se_wheelhouse" },
      { "id": "pitch_pits", "label": "2) Pitch pits: ruin the pour.", "goToAreaId": "se_pitch_pits" },
      { "id": "cages", "label": "3) Cages: question prisoners / locate foreman keys.", "goToAreaId": "se_cage_row" }
    ]
  },

  {
    "id": "se_wheelhouse",
    "title": "Wheelhouse: The Hub That Holds",
    "x": 33, "y": -6, "floorId": "camp",
    "tileStyle": "wheelhouse",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, wooden wheelhouse interior, massive wheel hub, grease, lantern, cinematic, no text",
    "description": "The siege tower’s wheel hub is the heart of the machine.\n\nA wedge in the wrong place does nothing.\n\nA wedge in the right place makes a monster limp.",
    "choices": [
      {
        "id": "plant_wedge",
        "label": "Plant an axle wedge (mind check).",
        "requirements": [{ "type": "hasItem", "itemId": "axle_spike_wedge", "qty": 1 }],
        "effects": [
          {
            "type": "skillCheck",
            "skill": "mind",
            "dc": 10,
            "onPass": [
              { "type": "flag", "key": "siege_tower_wheels_sabotaged", "value": true },
              { "type": "addXP", "amount": 14 }
            ],
            "onFail": [
              { "type": "flag", "key": "camp_alarm_level", "value": 2 },
              { "type": "takeDamage", "amount": 1 }
            ]
          }
        ],
        "goToAreaId": "se_choice_targets"
      },
      { "id": "leave", "label": "Back away quietly.", "goToAreaId": "se_choice_targets" }
    ]
  },

  {
    "id": "se_pitch_pits",
    "title": "Pitch Pits: Black Boil",
    "x": 32, "y": -7, "floorId": "camp",
    "tileStyle": "pitch",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, bubbling pitch cauldrons, torchmen, smoke, chains, cinematic, no text",
    "description": "Pitch bubbles like anger.\n\nA torchman watches the ladle.\n\nIf you spoil the cauldrons, the enemy loses a terrifying weapon on the wall.",
    "choices": [
      {
        "id": "spoil_sand",
        "label": "Dump sand to ruin the pitch (luck check).",
        "requirements": [{ "type": "hasItem", "itemId": "pitch_sand_sack", "qty": 1 }],
        "effects": [
          { "type": "removeItem", "itemId": "pitch_sand_sack", "qty": 1 },
          {
            "type": "skillCheck",
            "skill": "luck",
            "dc": 9,
            "onPass": [{ "type": "flag", "key": "pitch_cauldron_ruined", "value": true }, { "type": "addXP", "amount": 12 }],
            "onFail": [
              {
                "type": "startThreat",
                "threat": { "threatId": "t_pitch_team", "enemyGroupId": "pitch_pit_team", "distance": 2, "direction": "n", "speed": 1, "targetAreaId": "se_pitch_pits", "hazards": [] }
              }
            ]
          }
        ],
        "goToAreaId": "se_pitch_fight"
      },
      { "id": "leave", "label": "Retreat to the yard.", "goToAreaId": "se_choice_targets" }
    ]
  },

  {
    "id": "se_pitch_fight",
    "title": "Pitch Pit Clash",
    "x": 33, "y": -7, "floorId": "camp",
    "tileStyle": "pitch",
    "cover": "low",
    "blocksLOS": false,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, fight near bubbling pitch, torch flare, smoke, cinematic, no text",
    "description": "Smoke bites your lungs.\n\nA torchman swings.\n\nOne misstep and the pit becomes your grave.",
    "choices": [
      { "id": "fight", "label": "Fight.", "effects": [{ "type": "forceCombatFromThreat", "threatId": "t_pitch_team" }], "goToAreaId": "se_choice_targets" }
    ]
  },

  {
    "id": "se_cage_row",
    "title": "Cage Row: The Enemy’s Labor",
    "x": 31, "y": -7, "floorId": "camp",
    "tileStyle": "cages",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, prisoner cages in rain, guards nearby, desperate faces, cinematic, no text",
    "description": "Cages line the mud.\n\nCarpenters. Haulers. Captured villagers.\n\nA woman with splintered hands whispers:\n\n\"Wheelhouse hub. Foreman key. Ram chain.\"",
    "actionsAvailable": {
      "talk": {
        "text": "One prisoner meets your eyes and refuses to look away.",
        "choices": [
          { "id": "elin", "label": "Talk to Elin.", "effects": [{ "type": "openDialogue", "npcId": "npc_cage_prisoner_elin" }] }
        ]
      }
    },
    "choices": [
      {
        "id": "steal_list",
        "label": "Take the cage list (proof and future hooks).",
        "effects": [{ "type": "addItem", "itemId": "cage_list_names", "qty": 1 }, { "type": "addXP", "amount": 8 }],
        "goToAreaId": "se_foreman_platform"
      },
      { "id": "to_foreman", "label": "Approach the foreman’s platform.", "goToAreaId": "se_foreman_platform" }
    ]
  },

  {
    "id": "se_foreman_platform",
    "title": "Foreman’s Platform: The Key and the Chain",
    "x": 30, "y": -7, "floorId": "camp",
    "tileStyle": "platform",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, raised platform with foreman barking orders, key ring at belt, lanterns, cinematic, no text",
    "description": "The foreman watches everything.\n\nA ring of keys hangs at his belt.\n\nA thick chain runs from his platform toward the ram shed.",
    "choices": [
      {
        "id": "boss",
        "label": "Confront the Hobgoblin Foreman.",
        "effects": [{ "type": "startCombat", "enemyGroup": [{ "enemyId": "hobgoblin_foreman", "count": 1 }] }],
        "goToAreaId": "se_ram_shed"
      },
      {
        "id": "pickpocket",
        "label": "Try to steal the key ring without fighting (luck check).",
        "effects": [
          {
            "type": "skillCheck",
            "skill": "luck",
            "dc": 10,
            "onPass": [{ "type": "addItem", "itemId": "engine_yard_key", "qty": 1 }, { "type": "addXP", "amount": 14 }],
            "onFail": [{ "type": "flag", "key": "camp_alarm_level", "value": 2 }]
          }
        ],
        "goToAreaId": "se_ram_shed"
      }
    ]
  },

  {
    "id": "se_ram_shed",
    "title": "Ram Shed: The Metal Head",
    "x": 29, "y": -7, "floorId": "camp",
    "tileStyle": "shed",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, shed with massive ram head, chains, tools, wet metal shine, cinematic, no text",
    "description": "The ram head sits like a beast’s skull.\n\nIts chain is thick.\n\nIf you take it, the gate has a better chance.\n\nIf you’re caught, the camp will chase you to the walls.",
    "choices": [
      {
        "id": "steal_chain",
        "label": "Steal the ram chain and disable the ram (mind check).",
        "requirements": [{ "type": "hasItem", "itemId": "engine_yard_key", "qty": 1 }],
        "effects": [
          {
            "type": "skillCheck",
            "skill": "mind",
            "dc": 10,
            "onPass": [
              { "type": "addItem", "itemId": "ram_head_chain", "qty": 1 },
              { "type": "flag", "key": "ram_head_stolen", "value": true },
              { "type": "addXP", "amount": 16 }
            ],
            "onFail": [
              { "type": "flag", "key": "camp_alarm_level", "value": 3 },
              { "type": "takeDamage", "amount": 1 }
            ]
          }
        ],
        "goToAreaId": "se_escape"
      },
      { "id": "escape_anyway", "label": "You’ve done enough—escape now.", "goToAreaId": "se_escape" }
    ]
  },

  {
    "id": "se_escape",
    "title": "Escape: Mud and Whistles",
    "x": 30, "y": -5, "floorId": "overland",
    "tileStyle": "fog_field",
    "cover": "low",
    "blocksLOS": false,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, sprinting through fog with stolen chain over shoulder, lanterns behind, cinematic, no text",
    "description": "Whistles rise behind you.\n\nBoots splash.\n\nIf you make it back with even one sabotage, the final battle changes.\n\nIf you made all three… the war might end today.",
    "effectsOnEnter": [
      {
        "type": "conditional",
        "when": [
          { "key": "siege_tower_wheels_sabotaged", "op": "==", "value": true },
          { "key": "pitch_cauldron_ruined", "op": "==", "value": true },
          { "key": "ram_head_stolen", "op": "==", "value": true }
        ],
        "then": [{ "type": "flag", "key": "siege_engines_total_sabotage", "value": true }],
        "else": []
      },
      { "type": "flag", "key": "siege_engines_arc_complete", "value": true },
      { "type": "completeJob", "jobId": "q_siege_engines_arc" }
    ],
    "choices": [
      { "id": "return_city", "label": "Return to the city with what you stole/broke.", "goToAreaId": "fb_prebattle_council" }
    ]
  }
]

FINAL BATTLE AT THE GATES (setup + first decisions)
/content/items_final_battle.json
[
  {
    "id": "battle_token_wall",
    "name": "Battle Token: Wall",
    "type": "quest",
    "stackable": false,
    "value": 0,
    "description": "Marks your assignment to the wall line during the final assault."
  },
  {
    "id": "battle_token_gate",
    "name": "Battle Token: Gate",
    "type": "quest",
    "stackable": false,
    "value": 0,
    "description": "Marks your assignment to the gatehouse during the final assault."
  },
  {
    "id": "battle_token_streets",
    "name": "Battle Token: Streets",
    "type": "quest",
    "stackable": false,
    "value": 0,
    "description": "Marks your assignment to street defense and chase-down response during the final assault."
  },
  {
    "id": "signal_master_whistle",
    "name": "Signal Master’s Whistle",
    "type": "tool",
    "stackable": false,
    "value": 0,
    "description": "Lets you issue quick tactical calls to allied squads during the final assault (one advantage on a battle check)."
  }
]

/content/enemies_final_battle.json
[
  {
    "id": "orc_berserker",
    "name": "Orc Berserker",
    "kind": "humanoid",
    "skill": 13,
    "stamina": 20,
    "meta": { "special": "frenzy" },
    "loot": [{ "itemId": "gold_coin", "min": 4, "max": 20 }],
    "tags": ["orc", "final"]
  },
  {
    "id": "goblin_sapper_team",
    "name": "Goblin Sapper Team",
    "kind": "humanoid",
    "skill": 10,
    "stamina": 12,
    "meta": { "special": "plant_charge" },
    "loot": [{ "itemId": "sapper_fuse_bundle", "min": 1, "max": 1 }],
    "tags": ["goblin", "sapper", "final"]
  },
  {
    "id": "troll_wallbreaker",
    "name": "Troll Wallbreaker",
    "kind": "monster",
    "skill": 12,
    "stamina": 26,
    "meta": { "special": "stone_heave" },
    "loot": [{ "itemId": "gold_coin", "min": 6, "max": 24 }],
    "tags": ["troll", "final"]
  },
  {
    "id": "panic_mob_final",
    "name": "Panic Mob (Final Assault)",
    "kind": "group",
    "members": [{ "enemyId": "city_rioter", "count": 4 }],
    "meta": { "pursuit": { "speed": 1, "startDistance": 2, "morale": 5 } },
    "tags": ["city", "panic", "group", "final"]
  },

  {
    "id": "final_wall_wave",
    "name": "Final Assault: Wall Wave",
    "kind": "group",
    "members": [{ "enemyId": "troll_wallbreaker", "count": 1 }, { "enemyId": "goblin_ladderman", "count": 2 }],
    "meta": { "pursuit": { "speed": 1, "startDistance": 3, "morale": 11 } },
    "tags": ["group", "final", "wall"]
  },
  {
    "id": "final_gate_wave",
    "name": "Final Assault: Gate Wave",
    "kind": "group",
    "members": [{ "enemyId": "orc_berserker", "count": 1 }, { "enemyId": "goblin_sapper_team", "count": 1 }],
    "meta": { "pursuit": { "speed": 1, "startDistance": 3, "morale": 11 } },
    "tags": ["group", "final", "gate"]
  }
]

/content/npcs_final_battle.json
[
  {
    "id": "npc_warcouncil_vayne_final",
    "name": "Councilor Vayne",
    "role": "War Council (Final Orders)",
    "portraitPrompt": "fantasy character portrait, councilor with battle map, ink stains, hard eyes, painterly, no text",
    "dialogue": {
      "greeting": "This is the day the city becomes a story—or a warning.",
      "nodes": [
        {
          "id": "summary",
          "text": "Your actions changed the board:\n\n- If wheels were sabotaged: the siege tower arrives late or breaks.\n- If pitch was ruined: fewer burning pours on the wall.\n- If the ram chain was taken: the gate holds longer.\n- If the second mouth is sealed: fewer knives inside.\n\nNow choose where *you* stand.",
          "choices": [
            { "label": "Request the Signal Master’s whistle.", "effects": [{ "type": "addItem", "itemId": "signal_master_whistle", "qty": 1 }] }
          ]
        }
      ]
    }
  },
  {
    "id": "npc_serjeant_mara_final",
    "name": "Serjeant Mara",
    "role": "Frontline Coordinator",
    "portraitPrompt": "fantasy character portrait, serjeant in rain and soot, spear tip nicked, painterly, no text",
    "dialogue": {
      "greeting": "Pick a lane and commit. Heroes die when they try to be everywhere.",
      "nodes": [
        {
          "id": "lanes",
          "text": "Three lanes:\n\n1) Wall line.\n2) Gatehouse.\n3) Streets (chase-down response and fires).\n\nIf you leave the streets unattended, the city burns from within even if the wall holds.",
          "choices": [
            { "label": "I’ll take the wall.", "effects": [{ "type": "flag", "key": "final_lane", "value": "wall" }] },
            { "label": "I’ll take the gate.", "effects": [{ "type": "flag", "key": "final_lane", "value": "gate" }] },
            { "label": "I’ll take the streets.", "effects": [{ "type": "flag", "key": "final_lane", "value": "streets" }] }
          ]
        }
      ]
    }
  }
]

/content/quests_final_battle.json
[
  {
    "id": "q_final_battle",
    "name": "Battle at the Gates: The Last Push",
    "giverNpcId": "npc_warcouncil_vayne_final",
    "startAreaId": "fb_prebattle_council",
    "objective": { "type": "setFlag", "key": "final_battle_complete", "value": true },
    "grantsOnStart": [],
    "rewards": { "gold": 40, "xp": 140, "items": [] },
    "cooldownMinutes": 99999
  }
]

/content/areas_final_battle.json
[
  {
    "id": "fb_prebattle_council",
    "title": "Pre-Battle Council: The City Holds Its Breath",
    "x": 2, "y": 1, "floorId": "city",
    "tileStyle": "council",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, war council before dawn, city map, exhausted faces, cinematic, no text",
    "description": "You return from the engine yard with mud on your boots and war in your hands.\n\nVayne spreads the map.\n\n\"This is it,\" she says.\n\n\"Choose your lane.\"",
    "actionsAvailable": {
      "talk": {
        "text": "Final orders are spoken like prayers.",
        "choices": [
          { "id": "vayne", "label": "Talk to Councilor Vayne.", "effects": [{ "type": "openDialogue", "npcId": "npc_warcouncil_vayne_final" }] },
          { "id": "start", "label": "Start: Battle at the Gates.", "effects": [{ "type": "startJob", "jobId": "q_final_battle" }] }
        ]
      }
    },
    "choices": [
      { "id": "to_mara", "label": "Go to the battlements for lane assignment.", "goToAreaId": "fb_lane_assignment" }
    ]
  },

  {
    "id": "fb_lane_assignment",
    "title": "Lane Assignment: Wall, Gate, or Streets",
    "x": 3, "y": 1, "floorId": "city",
    "tileStyle": "battlements",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, battlement staging area, arrows stacked, smoke, serjeant pointing, cinematic, no text",
    "description": "Mara shouts over the roar.\n\nThe enemy surges like a tide.\n\nPick where you fight, and accept what you can’t save.",
    "actionsAvailable": {
      "talk": {
        "text": "Mara’s eyes don’t blink.",
        "choices": [
          { "id": "mara", "label": "Talk to Serjeant Mara.", "effects": [{ "type": "openDialogue", "npcId": "npc_serjeant_mara_final" }] }
        ]
      }
    },
    "choices": [
      {
        "id": "lane_wall",
        "label": "1) Take the Wall Line.",
        "effects": [{ "type": "addItem", "itemId": "battle_token_wall", "qty": 1 }, { "type": "flag", "key": "final_lane", "value": "wall" }],
        "goToAreaId": "fb_wall_start"
      },
      {
        "id": "lane_gate",
        "label": "2) Take the Gatehouse.",
        "effects": [{ "type": "addItem", "itemId": "battle_token_gate", "qty": 1 }, { "type": "flag", "key": "final_lane", "value": "gate" }],
        "goToAreaId": "fb_gate_start"
      },
      {
        "id": "lane_streets",
        "label": "3) Take the Streets (chase-down response).",
        "effects": [{ "type": "addItem", "itemId": "battle_token_streets", "qty": 1 }, { "type": "flag", "key": "final_lane", "value": "streets" }],
        "goToAreaId": "fb_streets_start"
      }
    ]
  },

  {
    "id": "fb_wall_start",
    "title": "Final Battle: Wall Line",
    "x": 4, "y": 1, "floorId": "city",
    "tileStyle": "battlements",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, wall line with smoke and ladders, distant siege tower silhouette, cinematic, no text",
    "description": "The wall shakes with impact.\n\nA troll wallbreaker heaves stone.\n\nIf the tower wheels were sabotaged, the tower arrives late—or breaks.\n\nIf pitch pits were ruined, fewer burning pours reach the parapet.",
    "choices": [
      {
        "id": "apply_engine_effects",
        "label": "Assess the wall assault (automatic outcomes from sabotage flags).",
        "effects": [
          {
            "type": "conditional",
            "when": [{ "key": "siege_tower_wheels_sabotaged", "op": "==", "value": true }],
            "then": [{ "type": "flag", "key": "final_wall_tower_delayed", "value": true }],
            "else": [{ "type": "flag", "key": "final_wall_tower_delayed", "value": false }]
          },
          {
            "type": "conditional",
            "when": [{ "key": "pitch_cauldron_ruined", "op": "==", "value": true }],
            "then": [{ "type": "flag", "key": "final_wall_pitch_reduced", "value": true }],
            "else": [{ "type": "flag", "key": "final_wall_pitch_reduced", "value": false }]
          }
        ],
        "goToAreaId": "fb_wall_fight"
      }
    ]
  },

  {
    "id": "fb_wall_fight",
    "title": "Wall Clash: Break the Breaker",
    "x": 5, "y": 1, "floorId": "city",
    "tileStyle": "battlements",
    "cover": "low",
    "blocksLOS": false,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, troll wallbreaker and laddermen at wall, defenders striking, cinematic, no text",
    "description": "You can target the troll (stop breaches) or the laddermen (stop boarding).\n\nIf enemy morale is shaken, they hesitate when the troll falls.\n\nChoose.",
    "choices": [
      {
        "id": "target_troll",
        "label": "1) Target the Troll Wallbreaker first.",
        "effects": [{ "type": "startCombat", "enemyGroup": [{ "enemyId": "troll_wallbreaker", "count": 1 }] }],
        "goToAreaId": "fb_wall_wave"
      },
      {
        "id": "target_ladders",
        "label": "2) Drive off the laddermen first.",
        "effects": [{ "type": "startCombat", "enemyGroup": [{ "enemyId": "goblin_ladderman", "count": 2 }] }],
        "goToAreaId": "fb_wall_wave"
      }
    ]
  },

  {
    "id": "fb_wall_wave",
    "title": "Wall Wave: The Tide",
    "x": 6, "y": 1, "floorId": "city",
    "tileStyle": "battlements",
    "cover": "low",
    "blocksLOS": false,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, massive wall melee, ladders, shields, rain, cinematic, no text",
    "description": "The wave hits.\n\nIf the banner is missing, some enemy fighters glance behind them—looking for courage that isn’t there.\n\nNow is where legends happen.",
    "choices": [
      {
        "id": "fight_wave",
        "label": "Fight the wall wave.",
        "effects": [
          {
            "type": "startThreat",
            "threat": { "threatId": "t_final_wall", "enemyGroupId": "final_wall_wave", "distance": 3, "direction": "n", "speed": 1, "targetAreaId": "fb_wall_wave", "hazards": [] }
          }
        ],
        "goToAreaId": "fb_final_consolidation"
      }
    ]
  },

  {
    "id": "fb_gate_start",
    "title": "Final Battle: Gatehouse",
    "x": 4, "y": 0, "floorId": "city",
    "tileStyle": "gatehouse",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, gatehouse under ram assault, chains, splinters, berserkers, cinematic, no text",
    "description": "The gate trembles.\n\nIf the ram chain was stolen, the ram hits wrong—less force, more rage.\n\nIf not, the gate must survive on courage and wood.",
    "choices": [
      {
        "id": "apply_ram_effect",
        "label": "Assess the gate assault (automatic outcome from ram sabotage).",
        "effects": [
          {
            "type": "conditional",
            "when": [{ "key": "ram_head_stolen", "op": "==", "value": true }],
            "then": [{ "type": "flag", "key": "final_gate_ram_weakened", "value": true }],
            "else": [{ "type": "flag", "key": "final_gate_ram_weakened", "value": false }]
          }
        ],
        "goToAreaId": "fb_gate_fight"
      }
    ]
  },

  {
    "id": "fb_gate_fight",
    "title": "Gate Clash: Berserker and Sapper",
    "x": 5, "y": 0, "floorId": "city",
    "tileStyle": "gatehouse",
    "cover": "low",
    "blocksLOS": false,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, berserker at gate, sapper crouched, sparks, cinematic, no text",
    "description": "A berserker roars.\n\nA sapper reaches for a charge.\n\nIf the gate falls, the battle becomes street-by-street.\n\nPick a target.",
    "choices": [
      {
        "id": "fight_berserker",
        "label": "1) Stop the berserker first.",
        "effects": [{ "type": "startCombat", "enemyGroup": [{ "enemyId": "orc_berserker", "count": 1 }] }],
        "goToAreaId": "fb_gate_wave"
      },
      {
        "id": "fight_sapper",
        "label": "2) Stop the sapper first.",
        "effects": [{ "type": "startCombat", "enemyGroup": [{ "enemyId": "goblin_sapper_team", "count": 1 }] }],
        "goToAreaId": "fb_gate_wave"
      }
    ]
  },

  {
    "id": "fb_gate_wave",
    "title": "Gate Wave",
    "x": 6, "y": 0, "floorId": "city",
    "tileStyle": "gatehouse",
    "cover": "low",
    "blocksLOS": false,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, gate melee with smoke and splinters, cinematic, no text",
    "description": "The wave surges.\n\nIf morale is shaken, some enemies hesitate at the threshold.\n\nIf your signals are trusted, allied squads arrive faster.\n\nHold the line.",
    "choices": [
      {
        "id": "fight_wave",
        "label": "Fight the gate wave.",
        "effects": [
          {
            "type": "startThreat",
            "threat": { "threatId": "t_final_gate", "enemyGroupId": "final_gate_wave", "distance": 3, "direction": "n", "speed": 1, "targetAreaId": "fb_gate_wave", "hazards": [] }
          }
        ],
        "goToAreaId": "fb_final_consolidation"
      }
    ]
  },

  {
    "id": "fb_streets_start",
    "title": "Final Battle: Streets (Chase-Down Response)",
    "x": 3, "y": -1, "floorId": "city",
    "tileStyle": "streets",
    "cover": "low",
    "blocksLOS": false,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, dark streets with lanterns, citizens running, shadowy infiltrators, cinematic, no text",
    "description": "Even if the wall holds, the city can burn.\n\nInfiltrators slip through gaps.\n\nArson starts small.\n\nIf too many get away, the council will later say: ‘We won the battle and lost the city.’",
    "choices": [
      {
        "id": "chase_1",
        "label": "Chase a goblin arson team into the alleys.",
        "effects": [{ "type": "flag", "key": "street_chase_active", "value": true }],
        "goToAreaId": "fb_alley_chase"
      },
      {
        "id": "panic_control",
        "label": "Control panic at the market square first (mind check).",
        "effects": [
          {
            "type": "skillCheck",
            "skill": "mind",
            "dc": 9,
            "onPass": [{ "type": "flag", "key": "panic_reduced", "value": true }, { "type": "addXP", "amount": 10 }],
            "onFail": [
              {
                "type": "startThreat",
                "threat": { "threatId": "t_panic_mob_final", "enemyGroupId": "panic_mob_final", "distance": 2, "direction": "n", "speed": 1, "targetAreaId": "fb_streets_start", "hazards": [] }
              }
            ]
          }
        ],
        "goToAreaId": "fb_streets_resolution"
      }
    ]
  },

  {
    "id": "fb_alley_chase",
    "title": "Alley Chase: Lanterns and Teeth",
    "x": 2, "y": -2, "floorId": "city",
    "tileStyle": "alleys",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, narrow alley chase, goblin with tinder pouch, lantern light, cinematic, no text",
    "description": "Footsteps slap wet stone.\n\nA goblin darts ahead with a tinder pouch.\n\nYou can shoot, set a trap, or sprint to tackle.",
    "choices": [
      {
        "id": "shoot_retreat",
        "label": "1) Shoot, then advance carefully.",
        "requirements": [
          { "type": "hasAnyItem", "itemIds": ["training_bow", "hunting_bow"], "qty": 1 },
          { "type": "hasAmmo", "ammoType": "arrow", "minCount": 1 }
        ],
        "effects": [{ "type": "addXP", "amount": 8 }],
        "goToAreaId": "fb_streets_resolution"
      },
      {
        "id": "tackle",
        "label": "2) Sprint and tackle (body check).",
        "effects": [
          {
            "type": "skillCheck",
            "skill": "body",
            "dc": 9,
            "onPass": [{ "type": "flag", "key": "arson_team_stopped", "value": true }, { "type": "addXP", "amount": 12 }],
            "onFail": [{ "type": "addToCounter", "key": "arson_damage_count", "amount": 1 }]
          }
        ],
        "goToAreaId": "fb_streets_resolution"
      }
    ]
  },

  {
    "id": "fb_streets_resolution",
    "title": "Streets: Fires Contained (or Not)",
    "x": 3, "y": -2, "floorId": "city",
    "tileStyle": "streets",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, bucket line fighting fires, guards dragging captives, cinematic, no text",
    "description": "Buckets pass hand to hand.\n\nIf too many infiltrators slipped by, smoke rises across multiple districts.\n\nReports come in:\n\n- \"Arson incidents!\"\n- \"Civilian casualties!\"\n\nHow bad it gets depends on what you stopped earlier.",
    "choices": [
      { "id": "to_consolidation", "label": "Return to final consolidation.", "goToAreaId": "fb_final_consolidation" }
    ]
  },

  {
    "id": "fb_final_consolidation",
    "title": "Final Consolidation: Victory’s Price",
    "x": 4, "y": -1, "floorId": "city",
    "tileStyle": "civic",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, exhausted defenders at dawn, banner torn, wounded tended, city skyline smoking, cinematic, no text",
    "description": "Dawn arrives.\n\nNot gentle.\n\nBut real.\n\nThe enemy’s final push breaks or stalls depending on what you sabotaged and what you chose to defend.\n\nNow the war shifts from survival to pursuit: the enemy retreats to deeper holds… and something older stirs beneath them.",
    "effectsOnEnter": [
      { "type": "flag", "key": "final_battle_complete", "value": true },
      { "type": "completeJob", "jobId": "q_final_battle" },
      {
        "type": "conditional",
        "when": [{ "key": "siege_engines_total_sabotage", "op": "==", "value": true }],
        "then": [{ "type": "flag", "key": "enemy_rout_triggered", "value": true }, { "type": "addXP", "amount": 30 }],
        "else": [{ "type": "addXP", "amount": 18 }]
      }
    ],
    "choices": [
      {
        "id": "epilogue_city",
        "label": "Proceed to the city epilogue (rewards, politics, promotions).",
        "effects": [{ "type": "flag", "key": "city_epilogue_unlocked", "value": true }]
      },
      {
        "id": "pursuit_arc",
        "label": "Begin the pursuit arc: hunt the enemy to their deeper fortress and end this war.",
        "effects": [{ "type": "flag", "key": "pursuit_arc_unlocked", "value": true }]
      }
    ]
  }
]


If you say continue again, I’ll generate the post-battle campaign transition that takes you from “city defender” to “veteran raider”:

City epilogue (titles, medals, faction politics, new shop unlocks, special crafting access)

Pursuit arc (enemy retreat → mountain passes → under-fortress metropolis → princess/crystal nexus finale)

and a proper veteran-tier item progression (named weapons, warded armour, ring/amulet accessories, spell tiers) that matches the tone of Fighting Fantasy.

continue
Thought for 16s

Perfect — here’s the City Epilogue (promotions, politics, shop unlocks, crafting access) and the next full campaign leg: Pursuit Arc (enemy retreat → mountain passes → under-fortress entry → prisoner vault / crystal nexus). I’m also adding veteran-tier named gear + spell tiers that fit your Fighting Fantasy tone.

You’ll get 12 drop-in files:

/content/items_city_epilogue.json

/content/npcs_city_epilogue.json

/content/quests_city_epilogue.json

/content/areas_city_epilogue.json

/content/items_veteran_progression.json

/content/spells_veteran_tiers.json

/content/enemies_pursuit_arc.json

/content/npcs_pursuit_arc.json

/content/quests_pursuit_arc.json

/content/areas_pursuit_arc.json

/content/items_under_fortress.json

/content/areas_under_fortress.json

/content/items_city_epilogue.json
[
  {
    "id": "title_ironleaf_warden",
    "name": "Title: Ironleaf Warden",
    "type": "quest",
    "stackable": false,
    "value": 0,
    "description": "A civic title granting you authority during emergency actions, discounts in some guild shops, and access to war-issue equipment."
  },
  {
    "id": "warden_cloak_ironleaf",
    "name": "Ironleaf Warden’s Cloak",
    "type": "armor_cloak",
    "stackable": false,
    "value": 0,
    "description": "A heavy cloak stitched with ironleaf thread. It’s not magic—yet. But it carries weight."
  },
  {
    "id": "council_signet_temp",
    "name": "Temporary Council Signet",
    "type": "tool",
    "stackable": false,
    "value": 0,
    "description": "Lets you bypass minor bureaucracy and request limited aid (once per chapter)."
  },
  {
    "id": "guild_credit_chit",
    "name": "Guild Credit Chit",
    "type": "currency",
    "stackable": true,
    "value": 0,
    "description": "A chit accepted by specific city guilds. Used to claim services or parts you can’t afford outright."
  },
  {
    "id": "order_to_pursue",
    "name": "Order to Pursue",
    "type": "quest",
    "stackable": false,
    "value": 0,
    "description": "A sealed order authorizing you to pursue the retreating enemy beyond the walls."
  }
]

/content/npcs_city_epilogue.json
[
  {
    "id": "npc_guildmaster_orrow",
    "name": "Guildmaster Orrow",
    "role": "Armourers’ Guild (Craft Access)",
    "portraitPrompt": "fantasy character portrait, stern guildmaster smith with leather apron, glowing forge behind, guild seals on wall, painterly, no text",
    "dialogue": {
      "greeting": "You fought like a veteran. Now you’ll be equipped like one—if you pay in sweat and sense.",
      "nodes": [
        {
          "id": "craft_access",
          "text": "The guild will back you.\n\nBring components and I’ll grant you one of these:\n\n- Warded leather reinforcements.\n- A named blade fitting.\n- A shield boss etched for enchantment.\n\nOr a credit chit, if you’re broke and useful.",
          "choices": [
            { "label": "Request a Guild Credit Chit.", "effects": [{ "type": "addItem", "itemId": "guild_credit_chit", "qty": 1 }] },
            { "label": "Unlock advanced crafting access.", "effects": [{ "type": "flag", "key": "advanced_crafting_unlocked", "value": true }] }
          ]
        }
      ]
    }
  },
  {
    "id": "npc_scribe_prefect_luvara",
    "name": "Prefect Luvara",
    "role": "Scribes’ Conclave (Spell Access)",
    "portraitPrompt": "fantasy character portrait, scribe prefect in tall hat, ink-stained fingers, scroll racks, candle glow, painterly, no text",
    "dialogue": {
      "greeting": "Ink is slower than steel, but it wins wars that steel cannot.",
      "nodes": [
        {
          "id": "scroll_access",
          "text": "We can issue you sanctioned spellwork—if you keep the city’s interests first.\n\nBring blank scrolls, rare inks, or proofs of enemy movements.\n\nAnd mind this: reckless magic gets people hanged, not celebrated.",
          "choices": [
            { "label": "Unlock veteran spell tiers.", "effects": [{ "type": "flag", "key": "veteran_spells_unlocked", "value": true }] },
            { "label": "Request one emergency scroll (single use).", "effects": [{ "type": "addItem", "itemId": "scroll_emergency_ward", "qty": 1 }] }
          ]
        }
      ]
    }
  },
  {
    "id": "npc_councilor_vayne_epilogue",
    "name": "Councilor Vayne",
    "role": "War Council (Politics / Promotions)",
    "portraitPrompt": "fantasy character portrait, councilor in dawn light, city skyline smoking behind window, painterly, no text",
    "dialogue": {
      "greeting": "We survived. That’s not a victory. It’s permission to continue.",
      "nodes": [
        {
          "id": "promotion",
          "text": "You will be named Ironleaf Warden.\n\nYou will receive authority.\n\nAnd you will receive enemies—inside the council and beyond the walls.\n\nNow tell me: do you pursue the retreating host, or stay and rebuild?",
          "choices": [
            { "label": "Accept the title and authority.", "effects": [{ "type": "addItem", "itemId": "title_ironleaf_warden", "qty": 1 }, { "type": "addItem", "itemId": "council_signet_temp", "qty": 1 }] },
            { "label": "Choose pursuit as the next chapter.", "effects": [{ "type": "flag", "key": "pursuit_arc_confirmed", "value": true }, { "type": "addItem", "itemId": "order_to_pursue", "qty": 1 }] }
          ]
        }
      ]
    }
  },
  {
    "id": "npc_captain_harl_epilogue",
    "name": "Captain Harl",
    "role": "Guard Captain (Street Consequences)",
    "portraitPrompt": "fantasy character portrait, guard captain exhausted, soot on cheek, helmet under arm, painterly, no text",
    "dialogue": {
      "greeting": "We held the wall. The streets… depended on you more than you know.",
      "nodes": [
        {
          "id": "consequences",
          "text": "Reports:\n\n- If arson damage is high: districts burned and panic lingers.\n- If you stopped infiltrators: civilians are shaken but alive.\n\nEither way, the enemy retreated.\n\nQuestion is: do we let them regroup?",
          "choices": [
            { "label": "Ask for a small squad escort (one use).", "effects": [{ "type": "flag", "key": "escort_token_available", "value": true }] },
            { "label": "Take the Ironleaf cloak.", "effects": [{ "type": "addItem", "itemId": "warden_cloak_ironleaf", "qty": 1 }] }
          ]
        }
      ]
    }
  }
]

/content/quests_city_epilogue.json
[
  {
    "id": "q_city_epilogue",
    "name": "City Epilogue: Titles, Ash, and Decisions",
    "giverNpcId": "npc_councilor_vayne_epilogue",
    "startAreaId": "ce_dawn_square",
    "objective": { "type": "setFlag", "key": "city_epilogue_complete", "value": true },
    "grantsOnStart": [],
    "rewards": { "gold": 12, "xp": 45, "items": [{ "itemId": "title_ironleaf_warden", "qty": 1 }] },
    "cooldownMinutes": 99999
  },
  {
    "id": "q_pursuit_orders",
    "name": "Pursuit Orders: Beyond the Walls",
    "giverNpcId": "npc_councilor_vayne_epilogue",
    "startAreaId": "ce_council_afterbattle",
    "objective": { "type": "setFlag", "key": "pursuit_arc_started", "value": true },
    "grantsOnStart": [],
    "rewards": { "gold": 0, "xp": 25, "items": [{ "itemId": "order_to_pursue", "qty": 1 }] },
    "cooldownMinutes": 99999
  }
]

/content/areas_city_epilogue.json
[
  {
    "id": "ce_dawn_square",
    "title": "Dawn Square: Smoke and Applause",
    "x": 2, "y": -1, "floorId": "city",
    "tileStyle": "square",
    "cover": "low",
    "blocksLOS": false,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, dawn in city square, soot in air, civilians cheering and grieving, guards tired, cinematic, no text",
    "description": "Dawn finds the city standing.\n\nSome cheer because they must.\n\nSome weep because they can.\n\nYour name moves through the crowd like a rumor becoming fact.",
    "choices": [
      { "id": "to_council", "label": "Go to the council for aftermath orders.", "goToAreaId": "ce_council_afterbattle" },
      { "id": "to_guild", "label": "Visit the Armourers’ Guild for veteran crafting access.", "goToAreaId": "ce_armourers_guild" },
      { "id": "to_scribes", "label": "Visit the Scribes’ Conclave for veteran spell access.", "goToAreaId": "ce_scribes_conclave" }
    ]
  },
  {
    "id": "ce_council_afterbattle",
    "title": "Council Afterbattle: The Next Knife",
    "x": 2, "y": 0, "floorId": "city",
    "tileStyle": "council",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, council chamber with scorched maps and wax seals, morning light, cinematic, no text",
    "description": "The council speaks in numbers:\n\nCasualties.\nSupplies.\nRepair time.\n\nVayne speaks in outcomes:\n\n\"They retreated. They will return—unless we make retreat expensive.\"",
    "actionsAvailable": {
      "talk": {
        "text": "Politics begins the moment the swords stop.",
        "choices": [
          { "id": "vayne", "label": "Talk to Councilor Vayne.", "effects": [{ "type": "openDialogue", "npcId": "npc_councilor_vayne_epilogue" }] },
          { "id": "start_epilogue", "label": "Complete the epilogue formalities.", "effects": [{ "type": "startJob", "jobId": "q_city_epilogue" }, { "type": "flag", "key": "city_epilogue_complete", "value": true }, { "type": "completeJob", "jobId": "q_city_epilogue" }] },
          { "id": "start_pursuit", "label": "Accept pursuit orders.", "effects": [{ "type": "startJob", "jobId": "q_pursuit_orders" }, { "type": "flag", "key": "pursuit_arc_started", "value": true }, { "type": "completeJob", "jobId": "q_pursuit_orders" }] }
        ]
      }
    },
    "choices": [
      { "id": "to_harl", "label": "Report to Captain Harl (street consequences).", "goToAreaId": "ce_barracks_report" },
      { "id": "to_depart", "label": "Depart the city to pursue the enemy retreat.", "requirements": [{ "type": "flagEquals", "key": "pursuit_arc_started", "value": true }], "goToAreaId": "pa_outside_gate" }
    ]
  },
  {
    "id": "ce_barracks_report",
    "title": "Barracks Report: Ash Ledger",
    "x": 1, "y": -1, "floorId": "city",
    "tileStyle": "barracks",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, barracks desk with casualty lists, soot-stained captain, cinematic, no text",
    "description": "Captain Harl’s desk is a battlefield of paper.\n\nA city can be saved and still wounded.\n\nHe looks up as you arrive.",
    "actionsAvailable": {
      "talk": {
        "text": "Harl speaks plainly: consequences are a kind of enemy.",
        "choices": [
          { "id": "harl", "label": "Talk to Captain Harl.", "effects": [{ "type": "openDialogue", "npcId": "npc_captain_harl_epilogue" }] }
        ]
      }
    },
    "choices": [
      { "id": "back", "label": "Return to the council.", "goToAreaId": "ce_council_afterbattle" }
    ]
  },
  {
    "id": "ce_armourers_guild",
    "title": "Armourers’ Guild: Veteran Work",
    "x": 0, "y": -1, "floorId": "city",
    "tileStyle": "forge",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, busy forge with armor pieces and guildmaster, sparks, cinematic, no text",
    "description": "The guild doesn’t applaud.\n\nIt measures.\n\nHammer marks. Stitch lines. Fit.\n\nThis is where veterans become harder to kill.",
    "actionsAvailable": {
      "talk": {
        "text": "Orrow judges you with a craftsman’s eyes.",
        "choices": [
          { "id": "orrow", "label": "Talk to Guildmaster Orrow.", "effects": [{ "type": "openDialogue", "npcId": "npc_guildmaster_orrow" }] }
        ]
      }
    },
    "choices": [
      { "id": "back", "label": "Return to Dawn Square.", "goToAreaId": "ce_dawn_square" }
    ]
  },
  {
    "id": "ce_scribes_conclave",
    "title": "Scribes’ Conclave: Ink That Bites",
    "x": 0, "y": 0, "floorId": "city",
    "tileStyle": "scribes",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, scribe hall with scroll racks and glowing runes, quiet intensity, cinematic, no text",
    "description": "The air smells like ink and burnt lavender.\n\nQuiet people doing loud work.\n\nLuvara doesn’t waste words.",
    "actionsAvailable": {
      "talk": {
        "text": "Luvara offers sanctioned power.",
        "choices": [
          { "id": "luvara", "label": "Talk to Prefect Luvara.", "effects": [{ "type": "openDialogue", "npcId": "npc_scribe_prefect_luvara" }] }
        ]
      }
    },
    "choices": [
      { "id": "back", "label": "Return to Dawn Square.", "goToAreaId": "ce_dawn_square" }
    ]
  }
]

/content/items_veteran_progression.json
[
  {
    "id": "sword_gatebiter",
    "name": "Gate-Biter (Named Sword)",
    "type": "weapon_sword",
    "stackable": false,
    "value": 0,
    "description": "A blade that earned its name at the gate. Slightly better at breaking enemy morale when you win fights decisively."
  },
  {
    "id": "bow_wallwhisper",
    "name": "Wall-Whisper (Named Bow)",
    "type": "weapon_bow",
    "stackable": false,
    "value": 0,
    "description": "A bow tuned for quick shots in cramped streets and battlements. Improves ranged ‘shoot-and-retreat’ options."
  },
  {
    "id": "shield_ironleaf_boss",
    "name": "Ironleaf Boss Shield",
    "type": "shield",
    "stackable": false,
    "value": 0,
    "description": "A shield with a reinforced boss designed for ward etching. Reduces chip damage in long fights."
  },
  {
    "id": "ring_emberward",
    "name": "Ring of Ember-Ward",
    "type": "accessory_ring",
    "stackable": false,
    "value": 0,
    "description": "A small ward against fire and pitch burns. Makes arson/pitch encounters less punishing."
  },
  {
    "id": "amulet_clearsight",
    "name": "Amulet of Clear Sight",
    "type": "accessory_amulet",
    "stackable": false,
    "value": 0,
    "description": "Helps you notice hidden doors, traps, and false choices. Improves Investigate outcomes."
  },
  {
    "id": "boots_quietstep",
    "name": "Quietstep Boots",
    "type": "armor_feet",
    "stackable": false,
    "value": 0,
    "description": "Soft soles and reinforced heel. Helps you avoid patrols and reduces the chance of triggering camp alarms."
  },
  {
    "id": "scroll_emergency_ward",
    "name": "Emergency Ward Scroll",
    "type": "consumable",
    "stackable": true,
    "value": 0,
    "description": "Single-use ward. Cancel one hazard consequence (fire, pitch, collapse, or panic surge)."
  },
  {
    "id": "veteran_kit_field_suture",
    "name": "Field Suture Kit",
    "type": "tool",
    "stackable": true,
    "value": 10,
    "description": "Lets you reduce post-fight penalties after a hard combat (once per chapter)."
  }
]

/content/spells_veteran_tiers.json
[
  {
    "id": "spell_tier2_lanternflare",
    "name": "Lanternflare",
    "tier": 2,
    "school": "Light",
    "cost": { "mana": 2 },
    "description": "A burst of light that disrupts stealth and weakens ambushes. Best used before entering unknown areas.",
    "effects": [
      { "type": "flag", "key": "stealth_enemies_revealed_next_area", "value": true }
    ]
  },
  {
    "id": "spell_tier2_ironlung",
    "name": "Ironlung",
    "tier": 2,
    "school": "Body",
    "cost": { "mana": 2 },
    "description": "Resist smoke and choking fumes. Strong in pitch pits, fires, and sewer encounters.",
    "effects": [
      { "type": "flag", "key": "smoke_resistance_active", "value": true }
    ]
  },
  {
    "id": "spell_tier3_chainbind",
    "name": "Chainbind",
    "tier": 3,
    "school": "Force",
    "cost": { "mana": 3 },
    "description": "Briefly binds an enemy or disables a mechanism. Can be used to interrupt a special action (ram swing, ladder set, plant charge).",
    "effects": [
      { "type": "flag", "key": "interrupt_next_enemy_special", "value": true }
    ]
  },
  {
    "id": "spell_tier3_wardline",
    "name": "Wardline",
    "tier": 3,
    "school": "Ward",
    "cost": { "mana": 3 },
    "description": "Draws a defensive line that reduces incoming damage in the next combat.",
    "effects": [
      { "type": "flag", "key": "combat_damage_reduction_next", "value": true }
    ]
  },
  {
    "id": "spell_tier4_dawnshard",
    "name": "Dawnshard",
    "tier": 4,
    "school": "Radiance",
    "cost": { "mana": 4 },
    "description": "A focused radiance strike. Strong against trolls, cultists, and ‘boss belief’ enemies.",
    "effects": [
      { "type": "flag", "key": "bonus_damage_vs_boss_next", "value": true }
    ]
  }
]

PURSUIT ARC (retreat → passes → under-fortress)
/content/enemies_pursuit_arc.json
[
  {
    "id": "orc_rearguard",
    "name": "Orc Rearguard",
    "kind": "humanoid",
    "skill": 12,
    "stamina": 16,
    "meta": { "special": "hold_the_line" },
    "loot": [{ "itemId": "gold_coin", "min": 3, "max": 16 }],
    "tags": ["orc", "pursuit"]
  },
  {
    "id": "goblin_runner",
    "name": "Goblin Runner",
    "kind": "humanoid",
    "skill": 9,
    "stamina": 9,
    "meta": { "special": "flee_and_signal" },
    "loot": [{ "itemId": "gold_coin", "min": 0, "max": 8 }],
    "tags": ["goblin", "pursuit", "runner"]
  },
  {
    "id": "warg_scout",
    "name": "Warg Scout",
    "kind": "monster",
    "skill": 11,
    "stamina": 14,
    "meta": { "special": "pounce" },
    "loot": [{ "itemId": "gold_coin", "min": 1, "max": 8 }],
    "tags": ["warg", "pursuit"]
  },
  {
    "id": "hobgoblin_bannerless_captain",
    "name": "Hobgoblin Captain (Bannerless)",
    "kind": "humanoid",
    "skill": 13,
    "stamina": 20,
    "meta": { "special": "discipline_break" },
    "loot": [{ "itemId": "gold_coin", "min": 6, "max": 22 }],
    "tags": ["boss", "pursuit"]
  },

  {
    "id": "pa_road_rearguard_group",
    "name": "Retreat Road Rearguard",
    "kind": "group",
    "members": [{ "enemyId": "orc_rearguard", "count": 1 }, { "enemyId": "goblin_runner", "count": 1 }],
    "meta": { "pursuit": { "speed": 1, "startDistance": 3, "morale": 10 } },
    "tags": ["group", "pursuit"]
  },
  {
    "id": "pa_warg_pack",
    "name": "Warg Pack",
    "kind": "group",
    "members": [{ "enemyId": "warg_scout", "count": 2 }],
    "meta": { "pursuit": { "speed": 1, "startDistance": 2, "morale": 9 } },
    "tags": ["group", "pursuit", "warg"]
  }
]

/content/npcs_pursuit_arc.json
[
  {
    "id": "npc_scout_kess_pursuit",
    "name": "Lieutenant Kess",
    "role": "Scout (Pursuit Lead)",
    "portraitPrompt": "fantasy character portrait, scout lieutenant in wind, hills behind, tired eyes, painterly, no text",
    "dialogue": {
      "greeting": "They’re retreating like wounded wolves. Still dangerous. Still clever.",
      "nodes": [
        {
          "id": "brief",
          "text": "Trail signs:\n\n- A runner carrying signals to an underground hold.\n- Wargs scouting the flanks.\n- A disciplined captain trying to keep order without the standard.\n\nIf we catch the runner, we choose the next battlefield.\nIf we fail, they vanish into stone.",
          "choices": [
            { "label": "Commit to hunting the runner first.", "effects": [{ "type": "flag", "key": "pursuit_target", "value": "runner" }] },
            { "label": "Commit to breaking the captain’s rearguard first.", "effects": [{ "type": "flag", "key": "pursuit_target", "value": "rearguard" }] }
          ]
        }
      ]
    }
  },
  {
    "id": "npc_farmer_marta",
    "name": "Marta of the Ridge Farms",
    "role": "Civilian Witness",
    "portraitPrompt": "fantasy character portrait, farm woman in cloak, windblown hair, bruised but resolute, painterly, no text",
    "dialogue": {
      "greeting": "They took my boy to haul timber. Said the ‘stone city’ below would pay for him.",
      "nodes": [
        {
          "id": "clue",
          "text": "I saw them vanish into a crack in the hills.\n\nNot a cave.\n\nA doorway shaped like old teeth.\n\nIf you go… bring a lantern. The dark down there is greedy.",
          "choices": [
            { "label": "Promise to look for captives.", "effects": [{ "type": "flag", "key": "captives_promised", "value": true }] }
          ]
        }
      ]
    }
  }
]

/content/quests_pursuit_arc.json
[
  {
    "id": "q_pursuit_arc",
    "name": "Pursuit: Do Not Let Them Regroup",
    "giverNpcId": "npc_scout_kess_pursuit",
    "startAreaId": "pa_outside_gate",
    "objective": { "type": "setFlag", "key": "pursuit_arc_complete", "value": true },
    "grantsOnStart": [],
    "rewards": { "gold": 22, "xp": 95, "items": [{ "itemId": "boots_quietstep", "qty": 1 }] },
    "cooldownMinutes": 99999
  }
]

/content/areas_pursuit_arc.json
[
  {
    "id": "pa_outside_gate",
    "title": "Outside the Gate: The Retreat Trail",
    "x": 10, "y": -10, "floorId": "overland",
    "tileStyle": "road",
    "cover": "low",
    "blocksLOS": false,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, city gate behind, muddy road ahead with retreat tracks, dawn haze, cinematic, no text",
    "description": "The enemy retreats.\n\nNot fleeing.\n\nRetreating.\n\nThere’s discipline in the tracks—until there isn’t.\n\nKess kneels, reading mud like scripture.",
    "actionsAvailable": {
      "talk": {
        "text": "Kess offers two immediate priorities.",
        "choices": [
          { "id": "kess", "label": "Talk to Lieutenant Kess.", "effects": [{ "type": "openDialogue", "npcId": "npc_scout_kess_pursuit" }] },
          { "id": "start", "label": "Start: Pursuit.", "effects": [{ "type": "startJob", "jobId": "q_pursuit_arc" }] }
        ]
      }
    },
    "choices": [
      { "id": "to_farms", "label": "Head toward the ridge farms for witnesses.", "goToAreaId": "pa_ridge_farms" },
      { "id": "to_roadfight", "label": "Press the trail immediately.", "goToAreaId": "pa_rearguard_contact" }
    ]
  },
  {
    "id": "pa_ridge_farms",
    "title": "Ridge Farms: Smoke from Small Fires",
    "x": 11, "y": -11, "floorId": "overland",
    "tileStyle": "farms",
    "cover": "low",
    "blocksLOS": false,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, farmstead with broken fence, smoke from barn corner, frightened villagers, cinematic, no text",
    "description": "The farms look raided, not destroyed.\n\nLike the enemy took what it needed and left fear behind.\n\nA woman steps forward, jaw clenched.",
    "actionsAvailable": {
      "talk": {
        "text": "Marta knows what she saw.",
        "choices": [{ "id": "marta", "label": "Talk to Marta.", "effects": [{ "type": "openDialogue", "npcId": "npc_farmer_marta" }] }]
      }
    },
    "choices": [
      { "id": "to_contact", "label": "Follow the trail toward the rearguard.", "goToAreaId": "pa_rearguard_contact" }
    ]
  },
  {
    "id": "pa_rearguard_contact",
    "title": "Retreat Road: Rearguard Contact",
    "x": 12, "y": -10, "floorId": "overland",
    "tileStyle": "road",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, road ambush with broken carts, orc rearguard blocking path, goblin runner ready to bolt, cinematic, no text",
    "description": "A rearguard blocks the road.\n\nA goblin runner watches the hills.\n\nIf the runner escapes, the enemy disappears into stone.\n\nIf the rearguard holds, you lose time and blood.",
    "choices": [
      {
        "id": "shoot_runner",
        "label": "1) Focus fire on the runner (ranged option).",
        "effects": [
          {
            "type": "skillCheck",
            "skill": "skill",
            "dc": 9,
            "onPass": [{ "type": "flag", "key": "runner_stopped", "value": true }, { "type": "addXP", "amount": 14 }],
            "onFail": [{ "type": "flag", "key": "runner_escaped", "value": true }]
          }
        ],
        "goToAreaId": "pa_road_fight"
      },
      { "id": "fight_group", "label": "2) Fight through the rearguard.", "goToAreaId": "pa_road_fight" }
    ]
  },
  {
    "id": "pa_road_fight",
    "title": "Road Fight: Break the Block",
    "x": 13, "y": -10, "floorId": "overland",
    "tileStyle": "road",
    "cover": "low",
    "blocksLOS": false,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, melee on muddy road, runner darting, cinematic, no text",
    "description": "Steel on mud.\n\nBreath on cold air.\n\nIf morale is still shaken from the stolen standard, their discipline frays faster.",
    "choices": [
      {
        "id": "fight",
        "label": "Fight the rearguard group.",
        "effects": [
          {
            "type": "startThreat",
            "threat": { "threatId": "t_pa_rearguard", "enemyGroupId": "pa_road_rearguard_group", "distance": 3, "direction": "n", "speed": 1, "targetAreaId": "pa_road_fight", "hazards": [] }
          }
        ],
        "goToAreaId": "pa_hills_flank"
      }
    ]
  },
  {
    "id": "pa_hills_flank",
    "title": "Hills Flank: Wargs in the Mist",
    "x": 14, "y": -11, "floorId": "overland",
    "tileStyle": "hills",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, misty hills, warg eyes glowing, sparse trees, cinematic, no text",
    "description": "The trail bends into hills.\n\nYou hear breathing that isn’t yours.\n\nWargs scout the flank—testing you.",
    "choices": [
      {
        "id": "fight_wargs",
        "label": "Fight the warg pack.",
        "effects": [
          {
            "type": "startThreat",
            "threat": { "threatId": "t_pa_wargs", "enemyGroupId": "pa_warg_pack", "distance": 2, "direction": "n", "speed": 1, "targetAreaId": "pa_hills_flank", "hazards": [] }
          }
        ],
        "goToAreaId": "pa_crack_in_hills"
      },
      {
        "id": "sneak_past",
        "label": "Slip past quietly (luck check).",
        "effects": [
          {
            "type": "skillCheck",
            "skill": "luck",
            "dc": 10,
            "onPass": [{ "type": "flag", "key": "wargs_avoided", "value": true }, { "type": "addXP", "amount": 12 }],
            "onFail": [{ "type": "takeDamage", "amount": 1 }]
          }
        ],
        "goToAreaId": "pa_crack_in_hills"
      }
    ]
  },
  {
    "id": "pa_crack_in_hills",
    "title": "Crack in the Hills: The Stone Doorway",
    "x": 15, "y": -12, "floorId": "overland",
    "tileStyle": "cliff",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, narrow rock crack shaped like a doorway, old carvings like teeth, lantern glow, cinematic, no text",
    "description": "The hills split.\n\nA doorway shaped like old teeth waits in shadow.\n\nIf the runner escaped, you hear distant horns below.\n\nIf not, the under-fortress is unaware… for now.",
    "choices": [
      { "id": "enter", "label": "Enter the under-fortress approach tunnels.", "goToAreaId": "uf_approach_entry" }
    ]
  }
]

UNDER-FORTRESS (new biome + systems)
/content/items_under_fortress.json
[
  {
    "id": "undercoin_bonewhite",
    "name": "Bonewhite Undercoin",
    "type": "currency",
    "stackable": true,
    "value": 0,
    "description": "A pale coin used in goblin markets beneath the hills. Some doors open to it faster than to steel."
  },
  {
    "id": "lockcharm_shiverkey",
    "name": "Shiver-Key Charm",
    "type": "tool",
    "stackable": false,
    "value": 0,
    "description": "A charm that chills a lock’s mechanism. Improves opening checks in the under-fortress."
  },
  {
    "id": "crystal_map_shard",
    "name": "Crystal Map Shard",
    "type": "quest",
    "stackable": true,
    "value": 0,
    "description": "A shard that glows near true routes. Collect enough and you can ‘solve’ the under-fortress layout."
  },
  {
    "id": "prisoner_token",
    "name": "Prisoner Token",
    "type": "quest",
    "stackable": true,
    "value": 0,
    "description": "A stamped token taken from guards. Proof for negotiating releases… or forging access."
  },
  {
    "id": "crystal_nexus_key",
    "name": "Crystal Nexus Key",
    "type": "quest",
    "stackable": false,
    "value": 0,
    "description": "A resonant key used to open the sealed chamber where the enemy’s war-sight is kept."
  }
]

/content/areas_under_fortress.json
[
  {
    "id": "uf_approach_entry",
    "title": "Under-Fortress Entry: The Throat of Stone",
    "x": 40, "y": -20, "floorId": "under",
    "tileStyle": "under_tunnel",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, descending stone throat tunnel, wet walls, lantern in darkness, cinematic, no text",
    "description": "The air changes.\n\nColder.\n\nOlder.\n\nThe walls feel shaped by hands that hated daylight.\n\nAhead: faint torchlight, and the sound of distant iron on stone.",
    "choices": [
      { "id": "to_market", "label": "Follow the torchlight toward voices (possible market).", "goToAreaId": "uf_goblin_market" },
      { "id": "to_guardpost", "label": "Take the narrower route toward a guardpost (riskier, faster).", "goToAreaId": "uf_guardpost" }
    ]
  },
  {
    "id": "uf_goblin_market",
    "title": "Goblin Market: Quiet Violence",
    "x": 41, "y": -20, "floorId": "under",
    "tileStyle": "under_market",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, underground market with goblins trading, hanging lanterns, strange coins, guarded stalls, cinematic, no text",
    "description": "A market in the dark.\n\nNot friendly.\n\nJust functional.\n\nYou can buy information with undercoin, trade favors, or start a fight that turns the whole cavern against you.",
    "choices": [
      {
        "id": "trade",
        "label": "Trade for Bonewhite Undercoin (requires a city coin sacrifice).",
        "effects": [{ "type": "addItem", "itemId": "undercoin_bonewhite", "qty": 3 }],
        "goToAreaId": "uf_choice_objectives"
      },
      {
        "id": "investigate",
        "label": "Investigate whispers of ‘a princess’ and ‘a crystal key’.",
        "effects": [{ "type": "flag", "key": "uf_rumors_heard", "value": true }, { "type": "addXP", "amount": 12 }],
        "goToAreaId": "uf_choice_objectives"
      }
    ]
  },
  {
    "id": "uf_guardpost",
    "title": "Guardpost: Iron and Habit",
    "x": 40, "y": -21, "floorId": "under",
    "tileStyle": "under_guard",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, underground guardpost with iron bars and torchlight, disciplined captain silhouette, cinematic, no text",
    "description": "A disciplined captain holds this post.\n\nNot a goblin.\n\nA hobgoblin trying to make retreat look like strategy.\n\nWithout a banner, he uses fear instead.",
    "choices": [
      {
        "id": "boss",
        "label": "Fight the Hobgoblin Captain.",
        "effects": [{ "type": "startCombat", "enemyGroup": [{ "enemyId": "hobgoblin_bannerless_captain", "count": 1 }] }],
        "goToAreaId": "uf_choice_objectives"
      }
    ]
  },
  {
    "id": "uf_choice_objectives",
    "title": "Choice: What Ends the War Faster",
    "x": 42, "y": -21, "floorId": "under",
    "tileStyle": "under_crossroads",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, underground crossroads with two carved doorways, rune-lit paths, cinematic, no text",
    "description": "Two paths are offered by rumor and necessity:\n\n1) Prisoner Vault — captives (and a princess) used as leverage.\n2) Crystal Nexus — the enemy’s war-sight, their hidden advantage.\n\nBoth matter.\n\nBut you can’t do everything before they adapt.",
    "choices": [
      { "id": "to_prison", "label": "1) Go to the Prisoner Vault (rescue).", "goToAreaId": "uf_prison_vault_entry" },
      { "id": "to_nexus", "label": "2) Go to the Crystal Nexus (seize war-sight).", "goToAreaId": "uf_nexus_entry" }
    ]
  },
  {
    "id": "uf_prison_vault_entry",
    "title": "Prisoner Vault: The Caged Promise",
    "x": 43, "y": -22, "floorId": "under",
    "tileStyle": "under_prison",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, underground prison corridor, iron doors, muffled cries, lantern reflection, cinematic, no text",
    "description": "Iron doors. Old locks.\n\nYou smell fear.\n\nIf you promised to look for captives, this is where promises become real—or become shame.",
    "choices": [
      {
        "id": "open_cells",
        "label": "Attempt to open the cell block (mind check).",
        "effects": [
          {
            "type": "skillCheck",
            "skill": "mind",
            "dc": 10,
            "onPass": [{ "type": "flag", "key": "uf_cells_opened", "value": true }, { "type": "addItem", "itemId": "prisoner_token", "qty": 2 }, { "type": "addXP", "amount": 18 }],
            "onFail": [{ "type": "takeDamage", "amount": 1 }]
          }
        ],
        "goToAreaId": "uf_prison_choice"
      }
    ]
  },
  {
    "id": "uf_prison_choice",
    "title": "Prison Choice: Save Many or Save One",
    "x": 44, "y": -22, "floorId": "under",
    "tileStyle": "under_prison",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, prison junction with two doors, one ornate, one crowded with hands through bars, cinematic, no text",
    "description": "Two doors:\n\n- The crowded cells (many captives).\n- The ornate cell (a high-value prisoner — ‘princess’ by rumor).\n\nTime is a weapon.\n\nChoose.",
    "choices": [
      {
        "id": "many",
        "label": "1) Free the many (city morale, future allies).",
        "effects": [{ "type": "flag", "key": "uf_rescued_many", "value": true }, { "type": "addXP", "amount": 20 }],
        "goToAreaId": "uf_return_to_surface"
      },
      {
        "id": "one",
        "label": "2) Rescue the high-value prisoner (political leverage).",
        "effects": [{ "type": "flag", "key": "uf_rescued_princess", "value": true }, { "type": "addXP", "amount": 22 }],
        "goToAreaId": "uf_return_to_surface"
      }
    ]
  },
  {
    "id": "uf_nexus_entry",
    "title": "Crystal Nexus: The Enemy’s Sight",
    "x": 43, "y": -21, "floorId": "under",
    "tileStyle": "under_crystal",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, crystal-lined tunnel, pale glow, runes, cold mist, cinematic, no text",
    "description": "Crystal threads the stone.\n\nYou feel it in your teeth.\n\nIf the enemy has war-sight, they will always strike first.\n\nUnless you take it.",
    "choices": [
      {
        "id": "find_key",
        "label": "Search for a resonant key (Investigate).",
        "effects": [{ "type": "skillCheck", "skill": "mind", "dc": 10, "onPass": [{ "type": "addItem", "itemId": "crystal_nexus_key", "qty": 1 }, { "type": "addXP", "amount": 18 }], "onFail": [{ "type": "takeDamage", "amount": 1 }] }],
        "goToAreaId": "uf_nexus_chamber"
      }
    ]
  },
  {
    "id": "uf_nexus_chamber",
    "title": "Nexus Chamber: Turn the Tide",
    "x": 44, "y": -21, "floorId": "under",
    "tileStyle": "under_crystal",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, large crystal chamber with sealed dais, keyhole glowing, reflections like stars, cinematic, no text",
    "description": "The chamber hums.\n\nThis is not treasure.\n\nThis is advantage.\n\nYou can claim it, shatter it, or re-tune it to feed the city instead.",
    "choices": [
      {
        "id": "claim",
        "label": "1) Claim the nexus power (dangerous, strongest).",
        "requirements": [{ "type": "hasItem", "itemId": "crystal_nexus_key", "qty": 1 }],
        "effects": [{ "type": "flag", "key": "uf_nexus_claimed", "value": true }, { "type": "addXP", "amount": 26 }],
        "goToAreaId": "uf_return_to_surface"
      },
      {
        "id": "shatter",
        "label": "2) Shatter it (deny the enemy forever).",
        "effects": [{ "type": "flag", "key": "uf_nexus_shattered", "value": true }, { "type": "addXP", "amount": 22 }],
        "goToAreaId": "uf_return_to_surface"
      },
      {
        "id": "retune",
        "label": "3) Re-tune it for the city (mind check).",
        "effects": [
          {
            "type": "skillCheck",
            "skill": "mind",
            "dc": 11,
            "onPass": [{ "type": "flag", "key": "uf_nexus_retuned", "value": true }, { "type": "addXP", "amount": 30 }],
            "onFail": [{ "type": "takeDamage", "amount": 2 }]
          }
        ],
        "goToAreaId": "uf_return_to_surface"
      }
    ]
  },
  {
    "id": "uf_return_to_surface",
    "title": "Return Route: Veteran Steps",
    "x": 42, "y": -19, "floorId": "under",
    "tileStyle": "under_tunnel",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, climbing back through tunnels toward faint daylight, lantern low, cinematic, no text",
    "description": "You return with something the enemy didn’t expect:\n\n- freed captives,\n- political leverage,\n- or a stolen advantage made of crystal.\n\nYou are no longer a novice.\n\nYou are a factor.",
    "effectsOnEnter": [
      { "type": "flag", "key": "pursuit_arc_complete", "value": true },
      { "type": "completeJob", "jobId": "q_pursuit_arc" },
      { "type": "addXP", "amount": 18 }
    ],
    "choices": [
      {
        "id": "unlock_next",
        "label": "Begin the next chapter: Mountain Fortress and the War’s True Heart.",
        "effects": [{ "type": "flag", "key": "mountain_fortress_arc_unlocked", "value": true }],
        "goToAreaId": "pa_outside_gate"
      }
    ]
  }
]


If you want the next “continue” to hit hard, the natural next stage is:

Mountain Fortress Arc → Waterfall Cave → Underground Lair Finale

the enemy retreats to a narrow-path mountain hold

you infiltrate via a secret waterfall cave

the final chamber contains the real war brain (a relic / mind-scry engine / bound oracle)

your prior outcomes decide who shows up with you:

if you freed captives: allied militia + informants

if you rescued the “princess”: political mandate + elite escort

if you retuned/claimed the nexus: spell-tier unlock + new map reveals

Say continue and I’ll generate that full mountain/waterfall/lair chapter with the same file set format.

continue
Thought for 11s

Locked in — Mountain Fortress Arc → Secret Waterfall Cave → Underground Lair Finale (narrow paths, ranged “shoot & retreat” options, infiltration routes, and a proper war-brain end boss with endings that depend on what you did in the under-fortress).

You’ll get 13 drop-in files:

/content/items_mountain_fortress_arc.json

/content/enemies_mountain_fortress_arc.json

/content/npcs_mountain_fortress_arc.json

/content/quests_mountain_fortress_arc.json

/content/areas_mountain_fortress_arc.json

/content/items_waterfall_cave.json

/content/enemies_waterfall_cave.json

/content/areas_waterfall_cave.json

/content/items_underground_lair_finale.json

/content/enemies_underground_lair_finale.json

/content/npcs_underground_lair_finale.json

/content/quests_underground_lair_finale.json

/content/areas_underground_lair_finale.json

/content/items_mountain_fortress_arc.json
[
  {
    "id": "climbing_spikes_set",
    "name": "Climbing Spikes Set",
    "type": "tool",
    "stackable": false,
    "value": 18,
    "description": "Iron spikes with leather straps. Enables safer narrow-path routes and reduces fall risk."
  },
  {
    "id": "rope_coil_war",
    "name": "War-Rope Coil",
    "type": "tool",
    "stackable": false,
    "value": 12,
    "description": "A tough rope coil issued to scouts. Useful for bridges, cliffs, and hauling doors shut."
  },
  {
    "id": "frost_salve",
    "name": "Frost Salve",
    "type": "consumable",
    "stackable": true,
    "value": 8,
    "description": "Reduces cold penalties and helps steady hands for ranged fire on windy ledges."
  },
  {
    "id": "echo_stone",
    "name": "Echo-Stone",
    "type": "tool",
    "stackable": true,
    "value": 10,
    "description": "Thrown into tunnels, it mimics footsteps. Great for distractions."
  },
  {
    "id": "fortress_badge_stolen",
    "name": "Stolen Fortress Badge",
    "type": "quest",
    "stackable": false,
    "value": 0,
    "description": "A stamped badge used by fortress servants and porters. Lets you bluff past some checks."
  },
  {
    "id": "cold_iron_keyring",
    "name": "Cold-Iron Keyring",
    "type": "quest",
    "stackable": false,
    "value": 0,
    "description": "Keys taken from a quartermaster. Opens inner service doors and an old cistern hatch."
  },
  {
    "id": "ward_nails_bundle",
    "name": "Ward Nails Bundle",
    "type": "tool",
    "stackable": true,
    "value": 14,
    "description": "Nails etched with simple ward marks. Used to pin doors, disrupt summoning circles, or brace cracked stone."
  }
]

/content/enemies_mountain_fortress_arc.json
[
  {
    "id": "goblin_cliff_archer",
    "name": "Goblin Cliff Archer",
    "kind": "humanoid",
    "skill": 10,
    "stamina": 10,
    "meta": { "ranged": true, "range": 3, "damage": "1d6", "ammoType": "arrow", "special": "harry_and_fallbait" },
    "loot": [{ "itemId": "gold_coin", "min": 1, "max": 8 }],
    "tags": ["goblin", "mountain", "ranged"]
  },
  {
    "id": "orc_pass_reaver",
    "name": "Orc Pass Reaver",
    "kind": "humanoid",
    "skill": 13,
    "stamina": 18,
    "meta": { "special": "ledge_charge" },
    "loot": [{ "itemId": "gold_coin", "min": 3, "max": 16 }],
    "tags": ["orc", "mountain"]
  },
  {
    "id": "troll_scree_hunter",
    "name": "Scree Troll Hunter",
    "kind": "monster",
    "skill": 12,
    "stamina": 24,
    "meta": { "special": "rockslide" },
    "loot": [{ "itemId": "gold_coin", "min": 4, "max": 20 }],
    "tags": ["troll", "mountain"]
  },
  {
    "id": "hobgoblin_sergeant",
    "name": "Hobgoblin Sergeant",
    "kind": "humanoid",
    "skill": 14,
    "stamina": 18,
    "meta": { "special": "whip_order" },
    "loot": [{ "itemId": "fortress_badge_stolen", "min": 0, "max": 1 }],
    "tags": ["hobgoblin", "fortress", "elite"]
  },

  {
    "id": "mf_pass_harriers",
    "name": "Pass Harriers",
    "kind": "group",
    "members": [{ "enemyId": "goblin_cliff_archer", "count": 2 }, { "enemyId": "orc_pass_reaver", "count": 1 }],
    "meta": { "pursuit": { "speed": 1, "startDistance": 3, "morale": 10 } },
    "tags": ["group", "mountain", "pursuit"]
  },
  {
    "id": "mf_fortress_patrol",
    "name": "Fortress Patrol",
    "kind": "group",
    "members": [{ "enemyId": "hobgoblin_sergeant", "count": 1 }, { "enemyId": "orc_pass_reaver", "count": 1 }],
    "meta": { "pursuit": { "speed": 1, "startDistance": 3, "morale": 11 } },
    "tags": ["group", "fortress", "pursuit"]
  }
]

/content/npcs_mountain_fortress_arc.json
[
  {
    "id": "npc_kess_mountain",
    "name": "Lieutenant Kess",
    "role": "Scout (Mountain Approach)",
    "portraitPrompt": "fantasy character portrait, scout lieutenant on mountain ridge, cloak snapping in wind, distant fortress silhouette, painterly, no text",
    "dialogue": {
      "greeting": "This is where the war learns to breathe again. Don’t let it.",
      "nodes": [
        {
          "id": "routes",
          "text": "Two ways to the fortress:\n\n1) The Narrow Pass — faster, watched by archers.\n2) The Goat Path — slower, safer if you can climb.\n\nAnd there’s a rumor:\nA waterfall that hides an old smuggler’s throat into the deep.\n\nPick your risk.",
          "choices": [
            { "label": "Take the Narrow Pass (combat likely).", "effects": [{ "type": "flag", "key": "mf_route", "value": "pass" }] },
            { "label": "Take the Goat Path (climb checks).", "effects": [{ "type": "flag", "key": "mf_route", "value": "goat" }] }
          ]
        }
      ]
    }
  },
  {
    "id": "npc_porter_jan",
    "name": "Jan the Porter",
    "role": "Reluctant Servant (Inside the Fortress)",
    "portraitPrompt": "fantasy character portrait, frightened porter with bundle of keys on belt, fortress kitchens behind, painterly, no text",
    "dialogue": {
      "greeting": "I haul their barrels. I don’t want their war.",
      "nodes": [
        {
          "id": "deal",
          "text": "If you don’t kill me, I’ll tell you three things:\n\n- The quartermaster keeps cold-iron keys.\n- The cistern hatch leads to older stone.\n- The waterfall cave is real… but it listens.\n\nWill you spare me?",
          "choices": [
            { "label": "Spare him (gain info, less alarm).", "effects": [{ "type": "flag", "key": "jan_spared", "value": true }] },
            { "label": "Threaten him for the keyring (risk alarm).", "effects": [{ "type": "flag", "key": "jan_threatened", "value": true }] }
          ]
        }
      ]
    }
  }
]

/content/quests_mountain_fortress_arc.json
[
  {
    "id": "q_mountain_fortress_arc",
    "name": "Mountain Fortress: Cut Off the Retreat",
    "giverNpcId": "npc_kess_mountain",
    "startAreaId": "mf_ridge_overlook",
    "objective": { "type": "setFlag", "key": "mountain_fortress_arc_complete", "value": true },
    "grantsOnStart": [],
    "rewards": {
      "gold": 26,
      "xp": 110,
      "items": [{ "itemId": "climbing_spikes_set", "qty": 1 }, { "itemId": "ward_nails_bundle", "qty": 2 }]
    },
    "cooldownMinutes": 99999
  }
]

/content/areas_mountain_fortress_arc.json
[
  {
    "id": "mf_ridge_overlook",
    "title": "Ridge Overlook: Fortress in the Cloudline",
    "x": 60, "y": -30, "floorId": "mountain",
    "tileStyle": "ridge",
    "cover": "low",
    "blocksLOS": false,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, mountain ridge overlook, fortress silhouette in cloudline, winding pass below, cinematic, no text",
    "description": "The fortress sits like a clenched fist in the mountains.\n\nThe retreat trail leads into it.\n\nIf you let them rest here, the war resets.\n\nKess points at the pass like it insulted him personally.",
    "actionsAvailable": {
      "talk": {
        "text": "Kess lays out routes and risks.",
        "choices": [
          { "id": "kess", "label": "Talk to Lieutenant Kess.", "effects": [{ "type": "openDialogue", "npcId": "npc_kess_mountain" }] },
          { "id": "start", "label": "Start: Mountain Fortress arc.", "effects": [{ "type": "startJob", "jobId": "q_mountain_fortress_arc" }] }
        ]
      }
    },
    "choices": [
      {
        "id": "route_pass",
        "label": "1) Take the Narrow Pass (archers, chase options).",
        "effects": [{ "type": "flag", "key": "mf_route", "value": "pass" }],
        "goToAreaId": "mf_narrow_pass"
      },
      {
        "id": "route_goat",
        "label": "2) Take the Goat Path (climb checks).",
        "effects": [{ "type": "flag", "key": "mf_route", "value": "goat" }],
        "goToAreaId": "mf_goat_path"
      }
    ]
  },

  {
    "id": "mf_narrow_pass",
    "title": "Narrow Pass: Arrows and Wind",
    "x": 61, "y": -31, "floorId": "mountain",
    "tileStyle": "pass",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, narrow cliff pass, goblin archers above, wind whipping cloak, cinematic, no text",
    "description": "The path is one body wide.\n\nAbove, goblin archers test range.\n\nThis is where veterans use distance like a weapon:\nshoot, retreat, reposition — and make the enemy chase on bad footing.",
    "choices": [
      {
        "id": "shoot_and_fall_back",
        "label": "Shoot, then retreat one area as they close (ranged tactic).",
        "requirements": [
          { "type": "hasAnyItem", "itemIds": ["training_bow", "hunting_bow", "bow_wallwhisper"], "qty": 1 },
          { "type": "hasAmmo", "ammoType": "arrow", "minCount": 1 }
        ],
        "effects": [{ "type": "flag", "key": "mf_ranged_retreat_used", "value": true }, { "type": "addXP", "amount": 10 }],
        "goToAreaId": "mf_pass_skirmish"
      },
      { "id": "fight", "label": "Hold position and fight the harriers.", "goToAreaId": "mf_pass_skirmish" },
      {
        "id": "brace_climb",
        "label": "Use climbing spikes to bypass the worst of the pass (luck check).",
        "requirements": [{ "type": "hasItem", "itemId": "climbing_spikes_set", "qty": 1 }],
        "effects": [
          { "type": "skillCheck", "skill": "luck", "dc": 10, "onPass": [{ "type": "flag", "key": "mf_pass_bypassed", "value": true }, { "type": "addXP", "amount": 12 }], "onFail": [{ "type": "takeDamage", "amount": 1 }] }
        ],
        "goToAreaId": "mf_fortress_outworks"
      }
    ]
  },

  {
    "id": "mf_pass_skirmish",
    "title": "Pass Skirmish: Make Them Misstep",
    "x": 62, "y": -31, "floorId": "mountain",
    "tileStyle": "pass",
    "cover": "low",
    "blocksLOS": false,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, cliff skirmish, arrows, slipping stones, cinematic, no text",
    "description": "A reaver rushes.\n\nArchers keep distance.\n\nOne shove near the edge ends fights quickly.\n\nBut risks ending you too.",
    "choices": [
      {
        "id": "fight_threat",
        "label": "Fight the pass harriers.",
        "effects": [
          { "type": "startThreat", "threat": { "threatId": "t_mf_pass", "enemyGroupId": "mf_pass_harriers", "distance": 3, "direction": "n", "speed": 1, "targetAreaId": "mf_pass_skirmish", "hazards": [] } }
        ],
        "goToAreaId": "mf_fortress_outworks"
      }
    ]
  },

  {
    "id": "mf_goat_path",
    "title": "Goat Path: Stone Teeth and Thin Air",
    "x": 61, "y": -29, "floorId": "mountain",
    "tileStyle": "goat",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, steep goat path with climbing spikes, fog, distant fortress, cinematic, no text",
    "description": "The goat path is a slow argument with gravity.\n\nOne slip becomes a lesson.\n\nTwo slips becomes a memorial.",
    "choices": [
      {
        "id": "climb_check",
        "label": "Climb carefully (body check).",
        "effects": [
          { "type": "skillCheck", "skill": "body", "dc": 10, "onPass": [{ "type": "flag", "key": "mf_goat_climb_success", "value": true }, { "type": "addXP", "amount": 14 }], "onFail": [{ "type": "takeDamage", "amount": 2 }] }
        ],
        "goToAreaId": "mf_fortress_outworks"
      }
    ]
  },

  {
    "id": "mf_fortress_outworks",
    "title": "Fortress Outworks: Smoke Vents and Barrels",
    "x": 63, "y": -30, "floorId": "fortress",
    "tileStyle": "outworks",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, fortress outer works, smoke vents, barrels, guard lanterns, cinematic, no text",
    "description": "The outworks smell like tar, stew, and wet iron.\n\nYou spot:\n\n- A service door used by porters.\n- A smoke vent big enough for a desperate crawl.\n- A watchpath where patrols march like metronomes.",
    "choices": [
      {
        "id": "porter_bluff",
        "label": "Bluff as a porter (mind check).",
        "effects": [
          { "type": "skillCheck", "skill": "mind", "dc": 10, "onPass": [{ "type": "flag", "key": "mf_bluff_success", "value": true }, { "type": "addItem", "itemId": "fortress_badge_stolen", "qty": 1 }, { "type": "addXP", "amount": 12 }], "onFail": [{ "type": "flag", "key": "mf_alarm_level", "value": 1 }] }
        ],
        "goToAreaId": "mf_service_corridor"
      },
      {
        "id": "vent_crawl",
        "label": "Crawl through the smoke vent (luck check).",
        "effects": [
          { "type": "skillCheck", "skill": "luck", "dc": 10, "onPass": [{ "type": "flag", "key": "mf_vent_success", "value": true }, { "type": "addXP", "amount": 14 }], "onFail": [{ "type": "takeDamage", "amount": 1 }] }
        ],
        "goToAreaId": "mf_kitchens"
      },
      { "id": "patrol_fight", "label": "Ambush a patrol for keys.", "goToAreaId": "mf_patrol_fight" }
    ]
  },

  {
    "id": "mf_patrol_fight",
    "title": "Patrol Clash: Take Their Access",
    "x": 64, "y": -30, "floorId": "fortress",
    "tileStyle": "outworks",
    "cover": "low",
    "blocksLOS": false,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, fortress patrol fight under lanterns, snow flurries, cinematic, no text",
    "description": "A sergeant barks orders.\n\nA reaver watches your hands.\n\nWin cleanly and you take keys.\n\nLose loudly and the whole fortress wakes up.",
    "choices": [
      {
        "id": "fight_patrol",
        "label": "Fight the fortress patrol.",
        "effects": [
          { "type": "startThreat", "threat": { "threatId": "t_mf_patrol", "enemyGroupId": "mf_fortress_patrol", "distance": 3, "direction": "n", "speed": 1, "targetAreaId": "mf_patrol_fight", "hazards": [] } }
        ],
        "goToAreaId": "mf_service_corridor"
      }
    ]
  },

  {
    "id": "mf_kitchens",
    "title": "Kitchens: Stew and Secrets",
    "x": 65, "y": -29, "floorId": "fortress",
    "tileStyle": "kitchens",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, fortress kitchens with cauldrons and hooks, porter in shadows, cinematic, no text",
    "description": "Even monsters need soup.\n\nA porter freezes when he sees you.\n\nHis belt carries keys.\n\nHis eyes carry fear.",
    "actionsAvailable": {
      "talk": {
        "text": "The porter can become a door instead of a problem.",
        "choices": [{ "id": "jan", "label": "Talk to Jan the Porter.", "effects": [{ "type": "openDialogue", "npcId": "npc_porter_jan" }] }]
      }
    },
    "choices": [
      {
        "id": "take_keys_soft",
        "label": "Ask for the keyring (mind check).",
        "effects": [
          { "type": "skillCheck", "skill": "mind", "dc": 10, "onPass": [{ "type": "addItem", "itemId": "cold_iron_keyring", "qty": 1 }, { "type": "addXP", "amount": 12 }], "onFail": [{ "type": "flag", "key": "mf_alarm_level", "value": 1 }] }
        ],
        "goToAreaId": "mf_service_corridor"
      },
      { "id": "to_service", "label": "Slip into the service corridor.", "goToAreaId": "mf_service_corridor" }
    ]
  },

  {
    "id": "mf_service_corridor",
    "title": "Service Corridor: The Fortress’s Veins",
    "x": 66, "y": -30, "floorId": "fortress",
    "tileStyle": "service",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, narrow corridor with pipes and doors, damp stone, cinematic, no text",
    "description": "The fortress has two hearts:\n\n- the upper halls where orders are shouted,\n- and the lower stone where old things listen.\n\nA cistern hatch is marked with older runes.\n\nYou hear distant water… like a waterfall that shouldn’t be inside a mountain.",
    "choices": [
      {
        "id": "cistern",
        "label": "Open the cistern hatch (requires keyring or hard check).",
        "effects": [
          {
            "type": "conditional",
            "when": [{ "key": "cold_iron_keyring", "op": "hasItem", "value": true }],
            "then": [{ "type": "addXP", "amount": 8 }],
            "else": [{ "type": "skillCheck", "skill": "body", "dc": 11, "onPass": [{ "type": "addXP", "amount": 10 }], "onFail": [{ "type": "takeDamage", "amount": 1 }] }]
          }
        ],
        "goToAreaId": "wf_outer_falls"
      },
      { "id": "upper", "label": "Go upward toward the command hall (later).", "effects": [{ "type": "flag", "key": "mf_command_hall_unlocked", "value": true }], "goToAreaId": "wf_outer_falls" }
    ]
  }
]

WATERFALL CAVE (secret entry)
/content/items_waterfall_cave.json
[
  {
    "id": "waterproof_torch_wrap",
    "name": "Waterproof Torch Wrap",
    "type": "tool",
    "stackable": true,
    "value": 8,
    "description": "Keeps a torch lit through spray. Essential for the waterfall cave."
  },
  {
    "id": "cave_rune_chalk",
    "name": "Cave Rune Chalk",
    "type": "tool",
    "stackable": true,
    "value": 6,
    "description": "Marks safe footholds and routes. Reduces navigation errors in echoing caves."
  },
  {
    "id": "shard_of_listening",
    "name": "Shard of Listening",
    "type": "quest",
    "stackable": false,
    "value": 0,
    "description": "A crystal fragment that vibrates near hidden doors and ‘listening stone’. Useful against the lair’s secrets."
  }
]

/content/enemies_waterfall_cave.json
[
  {
    "id": "cave_bat_swarm",
    "name": "Cave Bat Swarm",
    "kind": "monster",
    "skill": 9,
    "stamina": 12,
    "meta": { "special": "blind_flurry" },
    "loot": [],
    "tags": ["cave", "swarm"]
  },
  {
    "id": "slime_slick",
    "name": "Slick Slime",
    "kind": "monster",
    "skill": 10,
    "stamina": 14,
    "meta": { "special": "corrode" },
    "loot": [],
    "tags": ["cave", "slime"]
  },
  {
    "id": "deep_listener",
    "name": "Deep Listener",
    "kind": "monster",
    "skill": 12,
    "stamina": 18,
    "meta": { "special": "echo_sense" },
    "loot": [{ "itemId": "shard_of_listening", "min": 0, "max": 1 }],
    "tags": ["cave", "guardian"]
  }
]

/content/areas_waterfall_cave.json
[
  {
    "id": "wf_outer_falls",
    "title": "The Outer Falls: Water in a Throat of Stone",
    "x": 70, "y": -40, "floorId": "cave",
    "tileStyle": "waterfall",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, hidden waterfall inside mountain cistern, spray and lantern light, narrow ledge behind falls, cinematic, no text",
    "description": "A waterfall inside the mountain.\n\nSpray steals light.\n\nBut behind the curtain of water, a ledge runs into darkness.\n\nThis is not natural.\n\nThis is a door that pretends to be stone.",
    "choices": [
      {
        "id": "wrap_torch",
        "label": "Wrap your torch against the spray (if available).",
        "requirements": [{ "type": "hasItem", "itemId": "waterproof_torch_wrap", "qty": 1 }],
        "effects": [{ "type": "addXP", "amount": 6 }, { "type": "flag", "key": "wf_light_secure", "value": true }],
        "goToAreaId": "wf_ledge_entry"
      },
      {
        "id": "bare_torch",
        "label": "Go behind the falls with an unprotected flame (risk).",
        "effects": [{ "type": "skillCheck", "skill": "luck", "dc": 10, "onPass": [{ "type": "flag", "key": "wf_light_secure", "value": true }], "onFail": [{ "type": "flag", "key": "wf_light_lost", "value": true }] }],
        "goToAreaId": "wf_ledge_entry"
      }
    ]
  },
  {
    "id": "wf_ledge_entry",
    "title": "Behind the Falls: Slippery Truth",
    "x": 71, "y": -40, "floorId": "cave",
    "tileStyle": "ledge",
    "cover": "low",
    "blocksLOS": false,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, narrow ledge behind waterfall, hands gripping stone, spray, cinematic, no text",
    "description": "The ledge is thin.\n\nThe drop is honest.\n\nYou can move carefully, or move fast and risk it.\n\nA faint vibration in the stone suggests something ‘listens’ deeper in.",
    "choices": [
      {
        "id": "careful",
        "label": "Move carefully (body check).",
        "effects": [{ "type": "skillCheck", "skill": "body", "dc": 10, "onPass": [{ "type": "addXP", "amount": 12 }], "onFail": [{ "type": "takeDamage", "amount": 2 }] }],
        "goToAreaId": "wf_echo_chamber"
      },
      {
        "id": "fast",
        "label": "Move fast to beat patrol timing (luck check).",
        "effects": [{ "type": "skillCheck", "skill": "luck", "dc": 10, "onPass": [{ "type": "flag", "key": "wf_patrol_avoided", "value": true }, { "type": "addXP", "amount": 14 }], "onFail": [{ "type": "takeDamage", "amount": 1 }] }],
        "goToAreaId": "wf_echo_chamber"
      }
    ]
  },
  {
    "id": "wf_echo_chamber",
    "title": "Echo Chamber: The Cave Hears You",
    "x": 72, "y": -41, "floorId": "cave",
    "tileStyle": "echo",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, cavern echo chamber with wet stone and ripples, lantern reflections, bats swirling, cinematic, no text",
    "description": "Your steps return to you a heartbeat later.\n\nEchoes stack.\n\nIf you make noise, something will answer.\n\nYou can distract with an echo-stone, or proceed and accept what follows.",
    "choices": [
      {
        "id": "echo_stone",
        "label": "Throw an echo-stone to mislead whatever listens.",
        "requirements": [{ "type": "hasItem", "itemId": "echo_stone", "qty": 1 }],
        "effects": [{ "type": "removeItem", "itemId": "echo_stone", "qty": 1 }, { "type": "flag", "key": "wf_listener_confused", "value": true }, { "type": "addXP", "amount": 12 }],
        "goToAreaId": "wf_guardian_turn"
      },
      { "id": "proceed", "label": "Proceed without a distraction.", "goToAreaId": "wf_guardian_turn" }
    ]
  },
  {
    "id": "wf_guardian_turn",
    "title": "Guardian Turn: Bats, Slime, or Listener",
    "x": 73, "y": -41, "floorId": "cave",
    "tileStyle": "turn",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, tunnel fork with shadowy movement, slime sheen and bat silhouettes, cinematic, no text",
    "description": "The cave presents three dangers like a test:\n\n- A bat swarm in a low tunnel.\n- A slime slick in a wet crawl.\n- A deeper passage where the stone seems to listen.\n\nPick your poison.",
    "choices": [
      { "id": "bats", "label": "Take the low tunnel (bats).", "effects": [{ "type": "startCombat", "enemyGroup": [{ "enemyId": "cave_bat_swarm", "count": 1 }] }], "goToAreaId": "wf_hidden_door" },
      { "id": "slime", "label": "Take the wet crawl (slime).", "effects": [{ "type": "startCombat", "enemyGroup": [{ "enemyId": "slime_slick", "count": 1 }] }], "goToAreaId": "wf_hidden_door" },
      { "id": "listener", "label": "Take the listening passage (harder, better rewards).", "effects": [{ "type": "startCombat", "enemyGroup": [{ "enemyId": "deep_listener", "count": 1 }] }], "goToAreaId": "wf_hidden_door" }
    ]
  },
  {
    "id": "wf_hidden_door",
    "title": "Hidden Door: Stone That Pretends",
    "x": 74, "y": -42, "floorId": "cave",
    "tileStyle": "door",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, hidden stone door with faint seams, crystal shard glow, cinematic, no text",
    "description": "A door disguised as rock.\n\nIf you have a Shard of Listening, it vibrates at the seam.\n\nBeyond it: old air, and the sense you’re about to step into the war’s true heart.",
    "choices": [
      {
        "id": "open",
        "label": "Open the hidden door (mind check; easier with shard).",
        "effects": [
          {
            "type": "conditional",
            "when": [{ "key": "shard_of_listening", "op": "hasItem", "value": true }],
            "then": [{ "type": "skillCheck", "skill": "mind", "dc": 9, "onPass": [{ "type": "addXP", "amount": 16 }], "onFail": [{ "type": "takeDamage", "amount": 1 }] }],
            "else": [{ "type": "skillCheck", "skill": "mind", "dc": 11, "onPass": [{ "type": "addXP", "amount": 16 }], "onFail": [{ "type": "takeDamage", "amount": 1 }] }]
          }
        ],
        "goToAreaId": "ul_threshold"
      }
    ]
  }
]

UNDERGROUND LAIR FINALE (the “war brain”)
/content/items_underground_lair_finale.json
[
  {
    "id": "oracle_chain_link",
    "name": "Oracle Chain Link",
    "type": "quest",
    "stackable": true,
    "value": 0,
    "description": "A link from the bound oracle’s chains. Needed to either free it safely or rebind it for the city."
  },
  {
    "id": "war_map_tablet",
    "name": "War-Map Tablet",
    "type": "quest",
    "stackable": false,
    "value": 0,
    "description": "A carved slate showing enemy routes, caches, and fallback tunnels. Huge advantage in later battles."
  },
  {
    "id": "relic_heartspike",
    "name": "Heartspike Relic",
    "type": "quest",
    "stackable": false,
    "value": 0,
    "description": "A cruel relic used to keep the oracle obedient. Destroying it weakens the lair’s boss effects."
  },
  {
    "id": "crown_token_safekeep",
    "name": "Safekeep Token",
    "type": "quest",
    "stackable": false,
    "value": 0,
    "description": "A token bearing noble marks. If you rescued a high-value prisoner earlier, this gains political force."
  }
]

/content/enemies_underground_lair_finale.json
[
  {
    "id": "cult_warder",
    "name": "Warder of the Chain",
    "kind": "humanoid",
    "skill": 13,
    "stamina": 18,
    "meta": { "special": "ward_pulse" },
    "loot": [{ "itemId": "oracle_chain_link", "min": 1, "max": 2 }],
    "tags": ["cult", "lair"]
  },
  {
    "id": "stonebound_ogre",
    "name": "Stonebound Ogre",
    "kind": "monster",
    "skill": 12,
    "stamina": 28,
    "meta": { "special": "slam_quake" },
    "loot": [{ "itemId": "gold_coin", "min": 6, "max": 26 }],
    "tags": ["lair", "brute"]
  },
  {
    "id": "oracle_echo",
    "name": "Oracle Echo",
    "kind": "monster",
    "skill": 14,
    "stamina": 20,
    "meta": { "special": "predictive_strike" },
    "loot": [],
    "tags": ["lair", "psychic"]
  },
  {
    "id": "warbrain_overseer",
    "name": "Warbrain Overseer",
    "kind": "humanoid",
    "skill": 15,
    "stamina": 26,
    "meta": { "special": "command_resonance" },
    "loot": [{ "itemId": "relic_heartspike", "min": 1, "max": 1 }, { "itemId": "war_map_tablet", "min": 1, "max": 1 }],
    "tags": ["boss", "lair"]
  },

  {
    "id": "ul_guard_pack",
    "name": "Lair Guard Pack",
    "kind": "group",
    "members": [{ "enemyId": "cult_warder", "count": 2 }, { "enemyId": "stonebound_ogre", "count": 1 }],
    "meta": { "pursuit": { "speed": 1, "startDistance": 3, "morale": 12 } },
    "tags": ["group", "lair"]
  }
]

/content/npcs_underground_lair_finale.json
[
  {
    "id": "npc_bound_oracle",
    "name": "The Bound Oracle",
    "role": "War-Sight Engine (Not Quite a Person)",
    "portraitPrompt": "fantasy character portrait, chained oracle figure fused with crystal and stone, pale glow, sorrowful eyes, runes on chains, painterly, no text",
    "dialogue": {
      "greeting": "I am the map they bleed through.",
      "nodes": [
        {
          "id": "truth",
          "text": "They chained me to predict.\n\nTo choose.\n\nTo win.\n\nIf you free me, I may flee… or I may repay.\n\nIf you bind me for the city, you make the city dangerous.\n\nIf you destroy me, you end the advantage—forever.\n\nChoose with clean hands, if you can.",
          "choices": [
            { "label": "Ask how to break the Heartspike safely.", "effects": [{ "type": "flag", "key": "oracle_heartspike_hint", "value": true }] },
            { "label": "Ask how to rebind it for the city without cruelty.", "effects": [{ "type": "flag", "key": "oracle_rebind_hint", "value": true }] }
          ]
        }
      ]
    }
  }
]

/content/quests_underground_lair_finale.json
[
  {
    "id": "q_underground_lair_finale",
    "name": "Underground Lair: End the Enemy’s War-Sight",
    "giverNpcId": "npc_kess_mountain",
    "startAreaId": "ul_threshold",
    "objective": { "type": "setFlag", "key": "underground_lair_finale_complete", "value": true },
    "grantsOnStart": [],
    "rewards": { "gold": 50, "xp": 160, "items": [{ "itemId": "amulet_clearsight", "qty": 1 }] },
    "cooldownMinutes": 99999
  }
]

/content/areas_underground_lair_finale.json
[
  {
    "id": "ul_threshold",
    "title": "Lair Threshold: Old Air, New Lies",
    "x": 80, "y": -50, "floorId": "lair",
    "tileStyle": "threshold",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, ancient threshold with runes, cavern beyond, torchlight, cinematic, no text",
    "description": "The door closes behind you with the patience of stone.\n\nThis place is older than the war.\n\nBut it has learned the war’s language.\n\nYou feel watched—not by eyes, but by outcomes.",
    "choices": [
      {
        "id": "start",
        "label": "Enter the lair and finish this.",
        "effects": [{ "type": "startJob", "jobId": "q_underground_lair_finale" }],
        "goToAreaId": "ul_guard_gate"
      }
    ]
  },

  {
    "id": "ul_guard_gate",
    "title": "Guard Gate: Chains and Warders",
    "x": 81, "y": -50, "floorId": "lair",
    "tileStyle": "gate",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, lair gate with chains and ward glyphs, cult warders, hulking ogre, cinematic, no text",
    "description": "A warded gate.\n\nTwo warders chant.\n\nAn ogre waits like a boulder that hates you.\n\nIf you have ward nails, you might disrupt the chant.\n\nOtherwise: steel.",
    "choices": [
      {
        "id": "disrupt",
        "label": "Disrupt the ward chant with ward nails (mind check).",
        "requirements": [{ "type": "hasItem", "itemId": "ward_nails_bundle", "qty": 1 }],
        "effects": [
          { "type": "removeItem", "itemId": "ward_nails_bundle", "qty": 1 },
          { "type": "skillCheck", "skill": "mind", "dc": 10, "onPass": [{ "type": "flag", "key": "ul_chant_disrupted", "value": true }, { "type": "addXP", "amount": 16 }], "onFail": [{ "type": "takeDamage", "amount": 1 }] }
        ],
        "goToAreaId": "ul_gate_fight"
      },
      { "id": "fight", "label": "Fight through the gate defenders.", "goToAreaId": "ul_gate_fight" }
    ]
  },

  {
    "id": "ul_gate_fight",
    "title": "Gate Fight: Break the Lock by Force",
    "x": 82, "y": -50, "floorId": "lair",
    "tileStyle": "gate",
    "cover": "low",
    "blocksLOS": false,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, brutal fight at rune gate, chains snapping, ogre swing, cinematic, no text",
    "description": "A warder raises a hand.\n\nThe ogre swings.\n\nWin, and the lair opens.\n\nLose, and you become another lesson built into the stone.",
    "choices": [
      {
        "id": "fight_guard_pack",
        "label": "Fight the lair guard pack.",
        "effects": [
          { "type": "startThreat", "threat": { "threatId": "t_ul_guard", "enemyGroupId": "ul_guard_pack", "distance": 3, "direction": "n", "speed": 1, "targetAreaId": "ul_gate_fight", "hazards": [] } }
        ],
        "goToAreaId": "ul_oracle_antechamber"
      }
    ]
  },

  {
    "id": "ul_oracle_antechamber",
    "title": "Oracle Antechamber: The War’s Quiet Room",
    "x": 83, "y": -51, "floorId": "lair",
    "tileStyle": "antechamber",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, quiet chamber with hanging chains and crystal reflections, eerie calm, cinematic, no text",
    "description": "Silence here isn’t peace.\n\nIt’s a held breath.\n\nA crystal reflection shows you moving a half-second before you do.\n\nThat’s when you understand: the enemy isn’t only strong.\n\nIt’s *informed*.",
    "choices": [
      {
        "id": "investigate",
        "label": "Investigate the reflection (mind check).",
        "effects": [
          { "type": "skillCheck", "skill": "mind", "dc": 10, "onPass": [{ "type": "flag", "key": "ul_predictive_pattern_seen", "value": true }, { "type": "addXP", "amount": 14 }], "onFail": [{ "type": "takeDamage", "amount": 1 }] }
        ],
        "goToAreaId": "ul_overseer_chamber"
      },
      { "id": "push_on", "label": "Push on before it learns you.", "goToAreaId": "ul_overseer_chamber" }
    ]
  },

  {
    "id": "ul_overseer_chamber",
    "title": "Overseer Chamber: The Warbrain Keeper",
    "x": 84, "y": -51, "floorId": "lair",
    "tileStyle": "boss",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, boss chamber with war map tablet, overseer with crystal-studded staff, oracle chains in background, cinematic, no text",
    "description": "The Overseer doesn’t roar.\n\nIt *calculates*.\n\nA Heartspike relic hums in its grip.\n\nBehind it, chains descend into a deeper chamber.\n\nThat’s where the oracle is kept.",
    "choices": [
      {
        "id": "bossfight",
        "label": "Fight the Warbrain Overseer.",
        "effects": [{ "type": "startCombat", "enemyGroup": [{ "enemyId": "warbrain_overseer", "count": 1 }] }],
        "goToAreaId": "ul_oracle_chamber"
      }
    ]
  },

  {
    "id": "ul_oracle_chamber",
    "title": "Oracle Chamber: Chains of Advantage",
    "x": 85, "y": -52, "floorId": "lair",
    "tileStyle": "oracle",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, chained oracle fused with crystal, runes glowing, water dripping, solemn mood, cinematic, no text",
    "description": "The oracle is not a treasure.\n\nIt is a prisoner forced to make wars efficient.\n\nIf you claimed or retuned the Crystal Nexus earlier, the chamber responds to you.\n\nIf you shattered it, the chamber feels… blind.\n\nThe oracle lifts its eyes.",
    "actionsAvailable": {
      "talk": {
        "text": "The oracle offers truth with a cost.",
        "choices": [{ "id": "oracle", "label": "Talk to the Bound Oracle.", "effects": [{ "type": "openDialogue", "npcId": "npc_bound_oracle" }] }]
      }
    },
    "choices": [
      {
        "id": "destroy",
        "label": "1) Destroy the oracle’s war-sight (end the advantage forever).",
        "effects": [
          {
            "type": "conditional",
            "when": [{ "key": "relic_heartspike", "op": "hasItem", "value": true }],
            "then": [
              { "type": "flag", "key": "oracle_destroyed", "value": true },
              { "type": "flag", "key": "enemy_warsight_denied", "value": true },
              { "type": "addXP", "amount": 34 }
            ],
            "else": [
              { "type": "skillCheck", "skill": "body", "dc": 12, "onPass": [{ "type": "flag", "key": "oracle_destroyed", "value": true }, { "type": "flag", "key": "enemy_warsight_denied", "value": true }, { "type": "addXP", "amount": 30 }], "onFail": [{ "type": "takeDamage", "amount": 3 }] }
            ]
          }
        ],
        "goToAreaId": "ul_epilogue_choice"
      },
      {
        "id": "free",
        "label": "2) Free the oracle (risk: it may leave or demand repayment).",
        "effects": [
          { "type": "skillCheck", "skill": "mind", "dc": 12, "onPass": [{ "type": "flag", "key": "oracle_freed", "value": true }, { "type": "addXP", "amount": 36 }], "onFail": [{ "type": "takeDamage", "amount": 2 }] }
        ],
        "goToAreaId": "ul_epilogue_choice"
      },
      {
        "id": "rebind_city",
        "label": "3) Rebind the oracle for the city (powerful, morally sharp).",
        "effects": [
          {
            "type": "conditional",
            "when": [{ "key": "uf_nexus_retuned", "op": "==", "value": true }],
            "then": [{ "type": "flag", "key": "oracle_rebound_for_city", "value": true }, { "type": "flag", "key": "city_warsight_gained", "value": true }, { "type": "addXP", "amount": 40 }],
            "else": [{ "type": "skillCheck", "skill": "mind", "dc": 13, "onPass": [{ "type": "flag", "key": "oracle_rebound_for_city", "value": true }, { "type": "flag", "key": "city_warsight_gained", "value": true }, { "type": "addXP", "amount": 34 }], "onFail": [{ "type": "takeDamage", "amount": 2 }] }]
          }
        ],
        "goToAreaId": "ul_epilogue_choice"
      }
    ]
  },

  {
    "id": "ul_epilogue_choice",
    "title": "Aftermath: The War Tilts",
    "x": 86, "y": -52, "floorId": "lair",
    "tileStyle": "after",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, cavern exit with dawn light, broken chains, map tablet in hand, cinematic, no text",
    "description": "You leave with proof:\n\n- a war-map tablet,\n- chain links,\n- and a decision that changes the next year of history.\n\nIf you rescued many captives earlier, allies now whisper your name with trust.\n\nIf you rescued a high-value prisoner, the council will move like a blade.\n\nIf you took or retuned the nexus, magic will shift toward you.\n\nThe war will not end quietly.\n\nBut it may end *soon*.",
    "effectsOnEnter": [
      { "type": "flag", "key": "underground_lair_finale_complete", "value": true },
      { "type": "completeJob", "jobId": "q_underground_lair_finale" },
      {
        "type": "conditional",
        "when": [{ "key": "uf_rescued_many", "op": "==", "value": true }],
        "then": [{ "type": "flag", "key": "allies_from_captives", "value": true }],
        "else": []
      },
      {
        "type": "conditional",
        "when": [{ "key": "uf_rescued_princess", "op": "==", "value": true }],
        "then": [{ "type": "flag", "key": "political_mandate_strong", "value": true }],
        "else": []
      }
    ],
    "choices": [
      {
        "id": "return_city",
        "label": "Return to the city for the Veteran Council Finale (titles, betrayals, final campaign hook).",
        "effects": [{ "type": "flag", "key": "veteran_council_finale_unlocked", "value": true }]
      },
      {
        "id": "hunt_warlord",
        "label": "Begin the last hunt: chase the enemy warlord to the final fortress-heart (campaign climax).",
        "effects": [{ "type": "flag", "key": "final_warlord_hunt_unlocked", "value": true }]
      }
    ]
  }
]


If you say continue again, I’ll deliver the Veteran Council Finale + Final Warlord Hunt as the true campaign climax:

a political “knife-room” in the council (betrayal / scapegoat / promotion paths)

the enemy warlord’s fortress-heart (ritual chamber + final duel + army outcome)

and a clean “Fighting Fantasy” style ending matrix driven by your flags:

oracle_destroyed / oracle_freed / city_warsight_gained

uf_rescued_many / uf_rescued_princess

siege_engines_total_sabotage / enemy_morale_shaken

second_mouth_collapsed (if you did it)

Just say continue.

continue

Absolutely — here’s the Veteran Council Finale (political knife-room, betrayals, upgrades, city state consequences) and the Final Warlord Hunt (fortress-heart, ritual chamber, duel, skirmish impact, and an endings matrix driven by your flags).

You’ll get 12 drop-in files:

/content/items_veteran_council_finale.json

/content/npcs_veteran_council_finale.json

/content/enemies_veteran_council_finale.json

/content/quests_veteran_council_finale.json

/content/areas_veteran_council_finale.json

/content/items_final_warlord_hunt.json

/content/npcs_final_warlord_hunt.json

/content/enemies_final_warlord_hunt.json

/content/quests_final_warlord_hunt.json

/content/areas_final_warlord_hunt.json

/content/endings_matrix.json

/content/campaign_flags_reference.json

VETERAN COUNCIL FINALE
/content/items_veteran_council_finale.json
[
  {
    "id": "badge_ironleaf_full",
    "name": "Ironleaf Warden Badge (Full)",
    "type": "quest",
    "stackable": false,
    "value": 0,
    "description": "Your full authority. Opens armories, lets you requisition limited gear, and forces minor officials to stop wasting your time."
  },
  {
    "id": "writ_requisition",
    "name": "Requisition Writ",
    "type": "tool",
    "stackable": true,
    "value": 0,
    "description": "A sealed writ allowing you to claim supplies or specialist services once per chapter."
  },
  {
    "id": "seal_council_major",
    "name": "Major Council Seal",
    "type": "quest",
    "stackable": false,
    "value": 0,
    "description": "Proof of council backing. Improves diplomacy outcomes and deters some guards from ‘mistakes’."
  },
  {
    "id": "ledger_blackwax",
    "name": "Blackwax Ledger",
    "type": "quest",
    "stackable": false,
    "value": 0,
    "description": "A ledger of bribes, sabotage, and quiet betrayals. Dangerous to hold. More dangerous to ignore."
  },
  {
    "id": "blade_fitting_sunsteel",
    "name": "Sunsteel Blade Fitting",
    "type": "craft_component",
    "stackable": false,
    "value": 0,
    "description": "A rare fitting used to upgrade a named weapon into a veteran-tier heirloom."
  },
  {
    "id": "scroll_decree_safeconduct",
    "name": "Decree of Safe Conduct",
    "type": "quest",
    "stackable": false,
    "value": 0,
    "description": "A decree that lets you move through the city during lockdown and bring a small escort."
  }
]

/content/npcs_veteran_council_finale.json
[
  {
    "id": "npc_councilor_vayne_finale",
    "name": "Councilor Vayne",
    "role": "War Council (Knife Room)",
    "portraitPrompt": "fantasy character portrait, tired councilor with sharp eyes, candlelit war room, maps and seals, painterly, no text",
    "dialogue": {
      "greeting": "You brought back the war’s hidden organs. Now the city must decide how to use them.",
      "nodes": [
        {
          "id": "opening",
          "text": "We have three crises:\n\n1) The Warlord is rallying survivors.\n2) Someone inside the city profited from the siege.\n3) The streets still whisper panic.\n\nYou may choose only two actions before dawn.\n\nChoose like a veteran.\n\nChoose like a knife.",
          "choices": [
            { "label": "Prioritise the Warlord hunt (military focus).", "effects": [{ "type": "flag", "key": "council_priority", "value": "warlord" }] },
            { "label": "Prioritise rooting out betrayal (internal stability).", "effects": [{ "type": "flag", "key": "council_priority", "value": "traitor" }] },
            { "label": "Prioritise calming the city (morale, riots, fires).", "effects": [{ "type": "flag", "key": "council_priority", "value": "morale" }] }
          ]
        }
      ]
    }
  },
  {
    "id": "npc_councilor_mirelda",
    "name": "Councilor Mirelda",
    "role": "Civic Order (Morale / Curfews)",
    "portraitPrompt": "fantasy character portrait, stern councilor woman in civic robes, city watch banners, painterly, no text",
    "dialogue": {
      "greeting": "Victory is not a feast. It is a duty. And duty requires order.",
      "nodes": [
        {
          "id": "order",
          "text": "Give me a safe-conduct decree and I can lock the city down without cruelty.\n\nRefuse, and the watch will do it anyway—just with panic and clubs.\n\nWhat do you want the streets to remember?",
          "choices": [
            { "label": "Approve humane lockdown (needs council seal).", "effects": [{ "type": "flag", "key": "city_lockdown_humane", "value": true }] },
            { "label": "Refuse (risk unrest, but fewer abuses).", "effects": [{ "type": "flag", "key": "city_lockdown_refused", "value": true }] }
          ]
        }
      ]
    }
  },
  {
    "id": "npc_master_warden_sell",
    "name": "Master Warden Sell",
    "role": "Internal Affairs (The Traitor Thread)",
    "portraitPrompt": "fantasy character portrait, thin master warden with iron chain insignia, shadowed archive behind, painterly, no text",
    "dialogue": {
      "greeting": "There is always a second battle after the siege: the battle over truth.",
      "nodes": [
        {
          "id": "ledger",
          "text": "I can trace sabotage… if you can bring me proof.\n\nA ledger. A seal. A confession.\n\nBut be warned:\nSome truths kill more cleanly than swords.\n\nIf you proceed, you may end up with enemies in silk.",
          "choices": [
            { "label": "Commit to hunting the saboteur.", "effects": [{ "type": "flag", "key": "traitor_hunt_committed", "value": true }] },
            { "label": "Keep focus on the Warlord; ignore internal rot for now.", "effects": [{ "type": "flag", "key": "traitor_hunt_ignored", "value": true }] }
          ]
        }
      ]
    }
  },
  {
    "id": "npc_guildmaster_orrow_finale",
    "name": "Guildmaster Orrow",
    "role": "Armourers’ Guild (Heirloom Upgrade)",
    "portraitPrompt": "fantasy character portrait, guildmaster at forge holding gleaming blade fitting, sparks, painterly, no text",
    "dialogue": {
      "greeting": "If you’re going after the Warlord, you don’t go with beginner steel.",
      "nodes": [
        {
          "id": "upgrade",
          "text": "I can upgrade ONE named weapon into an heirloom.\n\nBring:\n- a Sunsteel Blade Fitting,\n- and proof you’ll use it for the city.\n\nWhich weapon do you offer?",
          "choices": [
            { "label": "Upgrade Gate-Biter.", "effects": [{ "type": "flag", "key": "heirloom_upgrade", "value": "gatebiter" }] },
            { "label": "Upgrade Wall-Whisper.", "effects": [{ "type": "flag", "key": "heirloom_upgrade", "value": "wallwhisper" }] },
            { "label": "Save the fitting for later.", "effects": [{ "type": "flag", "key": "heirloom_upgrade", "value": "none" }] }
          ]
        }
      ]
    }
  }
]

/content/enemies_veteran_council_finale.json
[
  {
    "id": "silkblade_assassin",
    "name": "Silkblade Assassin",
    "kind": "humanoid",
    "skill": 14,
    "stamina": 16,
    "meta": { "special": "quiet_cut" },
    "loot": [{ "itemId": "gold_coin", "min": 8, "max": 24 }],
    "tags": ["city", "assassin"]
  },
  {
    "id": "riot_mob",
    "name": "Panic Mob",
    "kind": "group",
    "members": [{ "enemyId": "silkblade_assassin", "count": 1 }],
    "meta": { "special": "chaos_cover" },
    "tags": ["city", "chaos"]
  }
]

/content/quests_veteran_council_finale.json
[
  {
    "id": "q_veteran_council_finale",
    "name": "Veteran Council Finale: The Knife Room",
    "giverNpcId": "npc_councilor_vayne_finale",
    "startAreaId": "vcf_war_room",
    "objective": { "type": "setFlag", "key": "veteran_council_finale_complete", "value": true },
    "grantsOnStart": [],
    "rewards": {
      "gold": 30,
      "xp": 90,
      "items": [
        { "itemId": "badge_ironleaf_full", "qty": 1 },
        { "itemId": "seal_council_major", "qty": 1 },
        { "itemId": "writ_requisition", "qty": 2 }
      ]
    },
    "cooldownMinutes": 99999
  }
]

/content/areas_veteran_council_finale.json
[
  {
    "id": "vcf_war_room",
    "title": "War Room: Candle Smoke and Cold Decisions",
    "x": 5, "y": 5, "floorId": "city",
    "tileStyle": "war_room",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, candlelit war room, maps pinned, exhausted council, rain at windows, cinematic, no text",
    "description": "The council chamber is not a throne room.\n\nIt is a sickbed for the city.\n\nMaps are pinned like wounds.\n\nPeople argue like surgeons.\n\nYou enter and the room sharpens.",
    "choices": [
      {
        "id": "start",
        "label": "Begin the Knife Room council session.",
        "effects": [{ "type": "startJob", "jobId": "q_veteran_council_finale" }],
        "goToAreaId": "vcf_vayne_hearing"
      }
    ]
  },

  {
    "id": "vcf_vayne_hearing",
    "title": "Vayne’s Hearing: Choose Two Before Dawn",
    "x": 6, "y": 5, "floorId": "city",
    "tileStyle": "hearing",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, councilor addressing room, sealed evidence on table, cinematic, no text",
    "description": "Vayne leans on the table.\n\n\"You can do only two things before dawn.\n\n- Prepare the Warlord Hunt.\n- Root out the traitor.\n- Stabilise the streets.\n\nPick.\n\nAnd live with it.\"",
    "actionsAvailable": {
      "talk": {
        "text": "The council is a battlefield without blood—until there is.",
        "choices": [
          { "id": "vayne", "label": "Talk to Councilor Vayne.", "effects": [{ "type": "openDialogue", "npcId": "npc_councilor_vayne_finale" }] }
        ]
      }
    },
    "choices": [
      { "id": "prepare_hunt", "label": "1) Prepare the Warlord Hunt.", "effects": [{ "type": "flag", "key": "vcf_action_hunt", "value": true }], "goToAreaId": "vcf_armoury_choice" },
      { "id": "traitor", "label": "2) Root out the traitor.", "effects": [{ "type": "flag", "key": "vcf_action_traitor", "value": true }], "goToAreaId": "vcf_archive_thread" },
      { "id": "morale", "label": "3) Stabilise the streets.", "effects": [{ "type": "flag", "key": "vcf_action_morale", "value": true }], "goToAreaId": "vcf_street_crisis" }
    ]
  },

  {
    "id": "vcf_armoury_choice",
    "title": "Armoury: Heirloom or Supplies",
    "x": 7, "y": 5, "floorId": "city",
    "tileStyle": "armoury",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, armoury racks, named weapons on table, guildmaster smith, cinematic, no text",
    "description": "Orrow offers you a choice:\n\n- Upgrade one named weapon into an heirloom.\n- Or take extra supplies for the hunt.\n\nA veteran knows the difference between strength and endurance.",
    "actionsAvailable": {
      "talk": {
        "text": "Orrow can make a legend out of steel.",
        "choices": [{ "id": "orrow", "label": "Talk to Guildmaster Orrow.", "effects": [{ "type": "openDialogue", "npcId": "npc_guildmaster_orrow_finale" }] }]
      }
    },
    "choices": [
      {
        "id": "take_fitting",
        "label": "Take a Sunsteel Blade Fitting.",
        "effects": [{ "type": "addItem", "itemId": "blade_fitting_sunsteel", "qty": 1 }, { "type": "addXP", "amount": 10 }],
        "goToAreaId": "vcf_back_to_hearing"
      },
      {
        "id": "take_supplies",
        "label": "Take extra requisition writs instead.",
        "effects": [{ "type": "addItem", "itemId": "writ_requisition", "qty": 2 }, { "type": "addXP", "amount": 8 }],
        "goToAreaId": "vcf_back_to_hearing"
      }
    ]
  },

  {
    "id": "vcf_archive_thread",
    "title": "Archive Thread: The Smell of Blackwax",
    "x": 6, "y": 6, "floorId": "city",
    "tileStyle": "archive",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, shadowy archives with ledgers and seals, master warden, cinematic, no text",
    "description": "Master Warden Sell pulls down a ledger bound in blackwax.\n\n\"This is where betrayals live,\" he says.\n\n\"They hide in numbers and polite signatures.\"",
    "actionsAvailable": {
      "talk": {
        "text": "Sell offers truth with consequences.",
        "choices": [{ "id": "sell", "label": "Talk to Master Warden Sell.", "effects": [{ "type": "openDialogue", "npcId": "npc_master_warden_sell" }] }]
      }
    },
    "choices": [
      {
        "id": "find_ledger",
        "label": "Investigate the sabotage trail (mind check).",
        "effects": [
          { "type": "skillCheck", "skill": "mind", "dc": 11, "onPass": [{ "type": "addItem", "itemId": "ledger_blackwax", "qty": 1 }, { "type": "flag", "key": "traitor_evidence_found", "value": true }, { "type": "addXP", "amount": 18 }], "onFail": [{ "type": "flag", "key": "traitor_coverup_deepens", "value": true }] }
        ],
        "goToAreaId": "vcf_assassin_interrupt"
      }
    ]
  },

  {
    "id": "vcf_street_crisis",
    "title": "Street Crisis: Rumours Become Knives",
    "x": 5, "y": 6, "floorId": "city",
    "tileStyle": "streets",
    "cover": "low",
    "blocksLOS": false,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, tense city street at night, watch lanterns, frightened crowd, cinematic, no text",
    "description": "The city hasn’t slept since the siege.\n\nRumours run faster than messengers.\n\nA spark in the wrong district becomes a riot.\n\nMirelda offers a decree.\n\nThe streets wait to see if you’ll be kind—or strong.",
    "actionsAvailable": {
      "talk": {
        "text": "Mirelda wants authority to keep order.",
        "choices": [{ "id": "mirelda", "label": "Talk to Councilor Mirelda.", "effects": [{ "type": "openDialogue", "npcId": "npc_councilor_mirelda" }] }]
      }
    },
    "choices": [
      {
        "id": "issue_decree",
        "label": "Issue a Decree of Safe Conduct (cost: major seal).",
        "requirements": [{ "type": "hasItem", "itemId": "seal_council_major", "qty": 1 }],
        "effects": [{ "type": "addItem", "itemId": "scroll_decree_safeconduct", "qty": 1 }, { "type": "addXP", "amount": 14 }],
        "goToAreaId": "vcf_back_to_hearing"
      },
      { "id": "ignore", "label": "Return to the council without intervening.", "goToAreaId": "vcf_back_to_hearing" }
    ]
  },

  {
    "id": "vcf_assassin_interrupt",
    "title": "Assassin Interrupt: Truth Bleeds",
    "x": 7, "y": 6, "floorId": "city",
    "tileStyle": "attack",
    "cover": "low",
    "blocksLOS": false,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, assassin lunging among shelves of ledgers, candle flare, cinematic, no text",
    "description": "As you touch the ledger, the candle snuffs.\n\nA whisper behind you:\n\n\"Put it back.\"",
    "choices": [
      {
        "id": "fight_assassin",
        "label": "Fight the Silkblade Assassin.",
        "effects": [{ "type": "startCombat", "enemyGroup": [{ "enemyId": "silkblade_assassin", "count": 1 }] }],
        "goToAreaId": "vcf_back_to_hearing"
      },
      {
        "id": "chase",
        "label": "Chase the assassin into the streets (risk losing the ledger).",
        "effects": [{ "type": "skillCheck", "skill": "luck", "dc": 11, "onPass": [{ "type": "flag", "key": "assassin_caught", "value": true }, { "type": "addXP", "amount": 18 }], "onFail": [{ "type": "flag", "key": "ledger_stolen", "value": true }] }],
        "goToAreaId": "vcf_back_to_hearing"
      }
    ]
  },

  {
    "id": "vcf_back_to_hearing",
    "title": "Return: Dawn Approaches",
    "x": 6, "y": 4, "floorId": "city",
    "tileStyle": "return",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, council doors with dawn light leaking under, cinematic, no text",
    "description": "You return to the war room.\n\nDawn is not gentle.\n\nIt exposes what you chose—and what you didn’t.",
    "choices": [
      {
        "id": "finalize",
        "label": "Finalize council decisions (locks outcomes).",
        "effects": [
          { "type": "flag", "key": "veteran_council_finale_complete", "value": true },
          { "type": "completeJob", "jobId": "q_veteran_council_finale" }
        ],
        "goToAreaId": "fwh_departure"
      }
    ]
  }
]

FINAL WARLORD HUNT
/content/items_final_warlord_hunt.json
[
  {
    "id": "heirloom_gatebiter_sunsteel",
    "name": "Gate-Biter, Sunsteel Heirloom",
    "type": "weapon_sword",
    "stackable": false,
    "value": 0,
    "description": "A veteran heirloom blade. Cuts through fear as well as flesh."
  },
  {
    "id": "heirloom_wallwhisper_sunsteel",
    "name": "Wall-Whisper, Sunsteel Heirloom",
    "type": "weapon_bow",
    "stackable": false,
    "value": 0,
    "description": "A veteran heirloom bow. The string sings only for targets that matter."
  },
  {
    "id": "signal_flare_scroll",
    "name": "Signal Flare Scroll",
    "type": "consumable",
    "stackable": true,
    "value": 0,
    "description": "Calls allies to a nearby area once (if allies_from_captives or political_mandate_strong is true)."
  },
  {
    "id": "warlord_trophy_helm",
    "name": "Warlord’s Helm Trophy",
    "type": "quest",
    "stackable": false,
    "value": 0,
    "description": "Proof of the warlord’s defeat. Changes the ending and unlocks post-campaign content."
  }
]

/content/npcs_final_warlord_hunt.json
[
  {
    "id": "npc_kess_final",
    "name": "Lieutenant Kess",
    "role": "Hunt Lead (Final)",
    "portraitPrompt": "fantasy character portrait, scout lieutenant grim, snowfall, torchlight on armor, painterly, no text",
    "dialogue": {
      "greeting": "We end this now, or we end it later with more graves.",
      "nodes": [
        {
          "id": "prep",
          "text": "The Warlord’s survivors are rallying at the fortress-heart.\n\nExpect:\n- chokepoints,\n- skirmish lines,\n- and a ritual meant to turn desperation into power.\n\nIf you carry the war-map tablet, we’ll avoid the worst traps.\n\nIf you have the oracle’s advantage, we’ll see ambushes before they breathe.\n\nIf you destroyed it… we fight honest.\n\nReady?",
          "choices": [
            { "label": "Ready.", "effects": [{ "type": "flag", "key": "fwh_ready", "value": true }] }
          ]
        }
      ]
    }
  }
]

/content/enemies_final_warlord_hunt.json
[
  {
    "id": "orc_warlord",
    "name": "Orc Warlord of the Broken Host",
    "kind": "humanoid",
    "skill": 16,
    "stamina": 30,
    "meta": { "special": "rage_bannerless" },
    "loot": [{ "itemId": "warlord_trophy_helm", "min": 1, "max": 1 }],
    "tags": ["boss", "warlord"]
  },
  {
    "id": "warlord_guard",
    "name": "Warlord’s Guard",
    "kind": "humanoid",
    "skill": 14,
    "stamina": 18,
    "meta": { "special": "intercept" },
    "loot": [{ "itemId": "gold_coin", "min": 6, "max": 22 }],
    "tags": ["elite"]
  },
  {
    "id": "goblin_firebrand",
    "name": "Goblin Firebrand",
    "kind": "humanoid",
    "skill": 12,
    "stamina": 12,
    "meta": { "special": "pitch_bomb" },
    "loot": [],
    "tags": ["goblin", "fire"]
  },
  {
    "id": "fwh_skirmish_line",
    "name": "Fortress-Heart Skirmish Line",
    "kind": "group",
    "members": [{ "enemyId": "warlord_guard", "count": 2 }, { "enemyId": "goblin_firebrand", "count": 1 }],
    "meta": { "pursuit": { "speed": 1, "startDistance": 3, "morale": 13 } },
    "tags": ["group", "final"]
  }
]

/content/quests_final_warlord_hunt.json
[
  {
    "id": "q_final_warlord_hunt",
    "name": "Final Warlord Hunt: Fortress-Heart",
    "giverNpcId": "npc_kess_final",
    "startAreaId": "fwh_departure",
    "objective": { "type": "setFlag", "key": "final_warlord_hunt_complete", "value": true },
    "grantsOnStart": [],
    "rewards": { "gold": 120, "xp": 220, "items": [{ "itemId": "signal_flare_scroll", "qty": 1 }] },
    "cooldownMinutes": 99999
  }
]

/content/areas_final_warlord_hunt.json
[
  {
    "id": "fwh_departure",
    "title": "Departure: Snow Road to the Fortress-Heart",
    "x": 100, "y": -70, "floorId": "overland",
    "tileStyle": "snow_road",
    "cover": "low",
    "blocksLOS": false,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, snowy road with torches, fortress lights in distance, cinematic, no text",
    "description": "Dawn is ash-grey.\n\nSnow falls like quiet judgment.\n\nThe fortress-heart burns with firelight ahead.\n\nIf the Warlord completes the rally and ritual, the next siege will be worse.\n\nKess checks your gear without a word.",
    "actionsAvailable": {
      "talk": {
        "text": "Last brief before the end.",
        "choices": [
          { "id": "kess", "label": "Talk to Kess.", "effects": [{ "type": "openDialogue", "npcId": "npc_kess_final" }] },
          { "id": "start", "label": "Start the Final Warlord Hunt.", "effects": [{ "type": "startJob", "jobId": "q_final_warlord_hunt" }] }
        ]
      }
    },
    "choices": [
      { "id": "approach", "label": "Approach the fortress-heart.", "goToAreaId": "fwh_outer_chokepoint" }
    ]
  },

  {
    "id": "fwh_outer_chokepoint",
    "title": "Outer Chokepoint: The Last Skirmish",
    "x": 101, "y": -70, "floorId": "final_fortress",
    "tileStyle": "chokepoint",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, narrow gate chokepoint, shields, firebrands with pitch, cinematic, no text",
    "description": "A chokepoint held by survivors.\n\nPitch bombs arc like angry stars.\n\nIf you earned allies, you can call them.\n\nIf you carry the war-map tablet, you can bypass a flank.\n\nOtherwise: break the line.",
    "choices": [
      {
        "id": "call_allies",
        "label": "Use Signal Flare Scroll to call allies (if available).",
        "requirements": [{ "type": "hasItem", "itemId": "signal_flare_scroll", "qty": 1 }],
        "effects": [
          { "type": "removeItem", "itemId": "signal_flare_scroll", "qty": 1 },
          { "type": "conditional",
            "when": [{ "key": "allies_from_captives", "op": "==", "value": true }],
            "then": [{ "type": "flag", "key": "fwh_allies_arrived", "value": true }, { "type": "addXP", "amount": 18 }],
            "else": []
          },
          { "type": "conditional",
            "when": [{ "key": "political_mandate_strong", "op": "==", "value": true }],
            "then": [{ "type": "flag", "key": "fwh_elite_escort_arrived", "value": true }, { "type": "addXP", "amount": 18 }],
            "else": []
          }
        ],
        "goToAreaId": "fwh_inner_ramp"
      },
      {
        "id": "bypass",
        "label": "Bypass via known flank route (requires War-Map Tablet).",
        "requirements": [{ "type": "hasItem", "itemId": "war_map_tablet", "qty": 1 }],
        "effects": [{ "type": "flag", "key": "fwh_flank_bypass", "value": true }, { "type": "addXP", "amount": 16 }],
        "goToAreaId": "fwh_inner_ramp"
      },
      {
        "id": "fight_line",
        "label": "Fight through the skirmish line.",
        "effects": [{ "type": "startThreat", "threat": { "threatId": "t_fwh_line", "enemyGroupId": "fwh_skirmish_line", "distance": 3, "direction": "n", "speed": 1, "targetAreaId": "fwh_outer_chokepoint", "hazards": [] } }],
        "goToAreaId": "fwh_inner_ramp"
      }
    ]
  },

  {
    "id": "fwh_inner_ramp",
    "title": "Inner Ramp: Shoot and Retreat",
    "x": 102, "y": -71, "floorId": "final_fortress",
    "tileStyle": "ramp",
    "cover": "low",
    "blocksLOS": false,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, steep inner ramp, enemy closing, archer vantage points, cinematic, no text",
    "description": "The ramp is steep and exposed.\n\nEnemies surge from above.\n\nThis is where ranged veterans shine:\n\n- fire from distance,\n- retreat to widen space,\n- set spikes,\n- force the enemy to climb into bad footing.",
    "choices": [
      {
        "id": "ranged_tactic",
        "label": "Shoot and fall back one area (requires bow + arrows).",
        "requirements": [
          { "type": "hasAnyItem", "itemIds": ["training_bow", "hunting_bow", "bow_wallwhisper", "heirloom_wallwhisper_sunsteel"], "qty": 1 },
          { "type": "hasAmmo", "ammoType": "arrow", "minCount": 1 }
        ],
        "effects": [{ "type": "flag", "key": "fwh_ranged_spacing_used", "value": true }, { "type": "addXP", "amount": 14 }],
        "goToAreaId": "fwh_ritual_gate"
      },
      {
        "id": "spikes",
        "label": "Set spikes, then ready bow (if you have spikes).",
        "requirements": [{ "type": "hasItem", "itemId": "spikes_bundle", "qty": 1 }],
        "effects": [{ "type": "flag", "key": "fwh_spikes_set", "value": true }, { "type": "addXP", "amount": 12 }],
        "goToAreaId": "fwh_ritual_gate"
      },
      { "id": "push", "label": "Push up the ramp by force.", "goToAreaId": "fwh_ritual_gate" }
    ]
  },

  {
    "id": "fwh_ritual_gate",
    "title": "Ritual Gate: The Fortress-Heart Beats",
    "x": 103, "y": -71, "floorId": "final_fortress",
    "tileStyle": "ritual",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, ritual gate with runes, chanting echoes, red glow, cinematic, no text",
    "description": "The gate hums.\n\nA ritual is underway.\n\nIf you destroyed the oracle, the ritual is blind and sloppy.\n\nIf the enemy still has war-sight, they anticipate your approach.\n\nIf the city has war-sight, you can interrupt at the perfect moment.",
    "choices": [
      {
        "id": "interrupt",
        "label": "Interrupt the ritual at the key moment (if city_warsight_gained).",
        "requirements": [{ "type": "flagEquals", "key": "city_warsight_gained", "value": true }],
        "effects": [{ "type": "flag", "key": "fwh_ritual_interrupted_clean", "value": true }, { "type": "addXP", "amount": 20 }],
        "goToAreaId": "fwh_warlord_chamber"
      },
      {
        "id": "rush",
        "label": "Rush the gate before it completes (luck check).",
        "effects": [{ "type": "skillCheck", "skill": "luck", "dc": 12, "onPass": [{ "type": "flag", "key": "fwh_ritual_rushed", "value": true }, { "type": "addXP", "amount": 18 }], "onFail": [{ "type": "takeDamage", "amount": 2 }] }],
        "goToAreaId": "fwh_warlord_chamber"
      },
      {
        "id": "sabotage",
        "label": "Sabotage the runes with ward nails (mind check).",
        "requirements": [{ "type": "hasItem", "itemId": "ward_nails_bundle", "qty": 1 }],
        "effects": [
          { "type": "removeItem", "itemId": "ward_nails_bundle", "qty": 1 },
          { "type": "skillCheck", "skill": "mind", "dc": 12, "onPass": [{ "type": "flag", "key": "fwh_runes_sabotaged", "value": true }, { "type": "addXP", "amount": 18 }], "onFail": [{ "type": "takeDamage", "amount": 1 }] }
        ],
        "goToAreaId": "fwh_warlord_chamber"
      }
    ]
  },

  {
    "id": "fwh_warlord_chamber",
    "title": "Warlord Chamber: The Final Duel",
    "x": 104, "y": -72, "floorId": "final_fortress",
    "tileStyle": "boss",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, warlord on dais, broken banners, firelight, trophy weapons, cinematic, no text",
    "description": "The Warlord stands before a broken banner.\n\nNot because he lacks a banner.\n\nBecause he wants you to believe he needs none.\n\nHe raises his weapon.\n\nThe fortress-heart beats once.\n\nThen again.\n\nAnd the fight begins.",
    "choices": [
      {
        "id": "bossfight",
        "label": "Fight the Orc Warlord.",
        "effects": [{ "type": "startCombat", "enemyGroup": [{ "enemyId": "orc_warlord", "count": 1 }] }],
        "goToAreaId": "fwh_aftermath"
      }
    ]
  },

  {
    "id": "fwh_aftermath",
    "title": "Aftermath: The Helm in Your Hands",
    "x": 105, "y": -72, "floorId": "final_fortress",
    "tileStyle": "after",
    "cover": "full",
    "blocksLOS": true,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, hero holding warlord helm trophy, dawn light through cracked stone, cinematic, no text",
    "description": "The Warlord falls.\n\nThe host breaks.\n\nYou stand in the quiet after violence.\n\nThe war does not end in one room…\n\nBut it can tilt hard enough that the next battle becomes survivable.\n\nYou take the Warlord’s helm.\n\nProof.\n\nWeight.\n\nEnding.",
    "effectsOnEnter": [
      { "type": "flag", "key": "final_warlord_hunt_complete", "value": true },
      { "type": "completeJob", "jobId": "q_final_warlord_hunt" }
    ],
    "choices": [
      { "id": "ending", "label": "View your ending.", "goToAreaId": "ending_resolve" }
    ]
  },

  {
    "id": "ending_resolve",
    "title": "Ending Resolve: What the City Remembers",
    "x": 0, "y": 0, "floorId": "meta",
    "tileStyle": "ending",
    "cover": "none",
    "blocksLOS": false,
    "imagePrompt": "fantasy illustration, inked linework + painterly color, city skyline at sunrise, banners repaired, smoke fading, cinematic, no text",
    "description": "Your choices decide what the city becomes next:\n\n- a brave city,\n- a clever city,\n- a cruel city,\n- or a broken city pretending.\n\n(Use endings_matrix.json to compute your outcome.)",
    "choices": []
  }
]

ENDINGS + FLAGS
/content/endings_matrix.json
{
  "endings": [
    {
      "id": "ending_sunrise_justice",
      "title": "Sunrise of Justice",
      "requires": [
        { "flag": "final_warlord_hunt_complete", "equals": true },
        { "flag": "traitor_evidence_found", "equals": true },
        { "flag": "oracle_freed", "equals": true }
      ],
      "text": "The Warlord falls, the traitor is named, and the oracle walks free.\n\nThe city wins without becoming what it fought.\n\nPeople tell the story the way stories should be told:\nwith scars, and pride, and fewer lies."
    },
    {
      "id": "ending_sunrise_power",
      "title": "Sunrise of Power",
      "requires": [
        { "flag": "final_warlord_hunt_complete", "equals": true },
        { "flag": "city_warsight_gained", "equals": true }
      ],
      "text": "The city gains war-sight.\n\nBattles become shorter.\n\nVictories become cheaper.\n\nBut the council begins to speak in probabilities.\n\nAnd people start to wonder what it costs to be safe."
    },
    {
      "id": "ending_sunrise_ashes",
      "title": "Sunrise in Ashes",
      "requires": [
        { "flag": "final_warlord_hunt_complete", "equals": true },
        { "flag": "city_lockdown_refused", "equals": true },
        { "flag": "traitor_hunt_ignored", "equals": true }
      ],
      "text": "You win the war outside the walls.\n\nInside the walls, rot continues.\n\nPanic becomes habit.\n\nThe city survives—\nbut it never feels safe again.\n\nNot really."
    },
    {
      "id": "ending_sunrise_blind",
      "title": "Sunrise of the Blind War",
      "requires": [
        { "flag": "final_warlord_hunt_complete", "equals": true },
        { "flag": "oracle_destroyed", "equals": true }
      ],
      "text": "You end war-sight.\n\nForever.\n\nThe enemy cannot predict.\n\nNeither can you.\n\nThe next wars will be honest.\n\nAnd honesty is expensive."
    },
    {
      "id": "ending_sunrise_bloodsilk",
      "title": "Sunrise of Bloodsilk",
      "requires": [
        { "flag": "final_warlord_hunt_complete", "equals": true },
        { "flag": "ledger_stolen", "equals": true }
      ],
      "text": "You win.\n\nBut the ledger vanishes.\n\nThe traitor remains.\n\nSomeone in silk smiles behind a curtained window.\n\nThe city will need you again.\n\nSooner than you think."
    }
  ],
  "defaultEndingId": "ending_sunrise_blind"
}

/content/campaign_flags_reference.json
{
  "flags": [
    { "key": "uf_rescued_many", "meaning": "Freed many captives; grants ally support and morale benefits." },
    { "key": "uf_rescued_princess", "meaning": "Rescued high-value prisoner; grants political mandate and elite escort potential." },

    { "key": "uf_nexus_claimed", "meaning": "Claimed nexus; personal power, higher magic volatility." },
    { "key": "uf_nexus_shattered", "meaning": "Destroyed nexus; denies enemy and city. Honest war." },
    { "key": "uf_nexus_retuned", "meaning": "Retuned nexus; enables cleaner city_warsight outcome later." },

    { "key": "oracle_destroyed", "meaning": "Destroyed war-sight engine; denies advantage permanently." },
    { "key": "oracle_freed", "meaning": "Freed oracle; possible future ally, moral high ground." },
    { "key": "oracle_rebound_for_city", "meaning": "Bound oracle for city; strong advantage, moral cost." },
    { "key": "city_warsight_gained", "meaning": "City gains war-sight; improves ritual interrupts and strategy." },
    { "key": "enemy_warsight_denied", "meaning": "Enemy war-sight denied; enemy tactics degrade in later content." },

    { "key": "traitor_evidence_found", "meaning": "You secured proof of internal sabotage." },
    { "key": "ledger_stolen", "meaning": "The ledger was lost; traitor thread unresolved." },

    { "key": "city_lockdown_humane", "meaning": "Order restored with minimal abuse." },
    { "key": "city_lockdown_refused", "meaning": "No decree; unrest risk, fewer official abuses." },

    { "key": "allies_from_captives", "meaning": "Allies arrive if called in final approach." },
    { "key": "political_mandate_strong", "meaning": "Elite escort may arrive if called in final approach." },

    { "key": "final_warlord_hunt_complete", "meaning": "Campaign climax finished." }
  ]
}

QUICK NOTE: Heirloom upgrade hook (optional)

If you want, the engine can resolve heirloom_upgrade like this:

if heirloom_upgrade == "gatebiter" → add heirloom_gatebiter_sunsteel

if heirloom_upgrade == "wallwhisper" → add heirloom_wallwhisper_sunsteel

(You can do it automatically on entering fwh_departure.)

If you want the Copilot prompt now (the thing you asked for originally) that tells it to build the whole mobile game + content pipeline + Leonardo prompt export + map reveal + action system + flag-driven endings, say “Copilot prompt now” and I’ll paste a single, massive, structured prompt you can drop straight into Copilot Chat / Workspace.

Copilot prompt now, but copy all Leonardo prompts with their associated ID into a list in order from the beginning of the campaign to the end so I can start creating the artwork and upload it to github, what folder will I use? Leave all the prompts in the files as we might find an art AI that can create our page illustrations on the fly.
Thought for 28s
Where to put the artwork in GitHub

Use one canonical folder for page illustrations and one for NPC portraits:

Page illustrations: frontend/public/assets/illustrations/pages/

NPC portraits: frontend/public/assets/illustrations/portraits/

File naming convention (recommended):

Pages: frontend/public/assets/illustrations/pages/<AREA_ID>.png

Portraits: frontend/public/assets/illustrations/portraits/<NPC_ID>.png

The game should:

First try to load the PNG by ID.

If missing, show a nice placeholder and still show/store the imagePrompt / portraitPrompt (so later you can swap in “generate on the fly” AI).