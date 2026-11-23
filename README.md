# Harbor Bay

[![make.fun GTA 6 bounty](https://make.fun/badge/gta6-01.svg)](https://make.fun/c/gta6-01)
[![make.fun rank](https://make.fun/badge/gta6-01/yangzishuo6-creator/gta6-open-world/rank.svg)](https://make.fun/c/gta6-01)
[![make.fun reward](https://make.fun/badge/gta6-01/yangzishuo6-creator/gta6-open-world/reward.svg)](https://make.fun/c/gta6-01)

The port authority buried a ledger. Nia knows where it is, and the courier they fired has one afternoon to get it on the air. Explore a 3D waterfront from Juniper Mile to Crown Heights, steal a ride, then outrun Port Patrol by street or by boardwalk.

## Play

Run `node serve.ts` and open `http://localhost:8080` in desktop Chrome. Harbor Bay runs from static files with no build step or external assets.

| Input | Action |
| --- | --- |
| WASD / arrows | Walk, steer, accelerate, or reverse |
| Mouse / left click | Aim and fire on foot |
| E | Interact, enter or exit a vehicle, or start an event |
| 1–4 | Fists, pistol, SMG, shotgun |
| Space | Sprint on foot or handbrake in a car |
| Q / F | Nia's radio jam / Ivo's field repair |
| R / M | Switch radio station / mute |
| Esc | Pause |

Follow the gold markers through six story missions. Cyan markers lead to the Coast Circuit street race and the Express Manifest courier sprint. Both events require a vehicle. Finishing stages and events earns XP, and their milestones save automatically. Use **Save & resume** in the pause menu for a manual checkpoint. **Continue** restores the checkpoint in the same browser.

## Source map

- `world/cityBuilder.js`, `world/props.js` and `world/atmosphere.js` build and light the city.
- `vehicles/vehicleController.js`, `vehicles/trafficSystem.js` and `actors/pedestrians.js` animate movement through the streets.
- `police/dispatch.js`, `police/helicopter.js` and `combat/weapons.js` handle pursuits and combat.
- `missions/storyMissions.js`, `missions/activities.js` and `missions/crew.js` handle jobs, rewards and crew abilities.
- `ui/` renders the HUD, minimap, dialogue and menus. `audio/radio.js` synthesizes the radio and effects.
- `core/` handles input, the chase camera and deterministic capture mode. `save/saveGame.js` handles checkpoints.

Open `/index.html?shot=chase`, `?shot=foot`, `?shot=mission` or `?shot=title` to render a fixed camera frame. Capture mode leaves the checkpoint untouched.

Run `MAKEFUN_OUTPUT_DIR=out node main.ts` to package the game, screenshots, and make.fun dossier.
