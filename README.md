# Harbor Bay

[![make.fun GTA 6 bounty](https://make.fun/badge/gta6-01.svg)](https://make.fun/c/gta6-01)
[![make.fun rank](https://make.fun/badge/gta6-01/yangzishuo6-creator/gta6-open-world/rank.svg)](https://make.fun/c/gta6-01)
[![make.fun reward](https://make.fun/badge/gta6-01/yangzishuo6-creator/gta6-open-world/reward.svg)](https://make.fun/c/gta6-01)

The port authority buried a ledger. Nia knows where it is, and the courier they fired has one afternoon to get it on the air.

## Play

Run `node serve.ts` and open `http://localhost:8080` in desktop Chrome. Harbor Bay runs from static files with no build step or external assets.

| Input | Action |
| --- | --- |
| WASD / arrows | Walk, steer, accelerate, or reverse |
| E | Talk, collect, take a vehicle, or get out |
| Space | Dash on foot or handbrake in a car |
| Left click | Fire the pulse tool on foot to disable a patrol temporarily |
| Esc / M | Pause / toggle sound |

Follow the gold objective markers through the story. The radar also tracks patrols, the Beacon Market mechanic, and a repeatable timed courier sprint in Crown Heights. Story milestones and payouts save in the browser. Recovering after a pursuit returns you to Juniper Mile and can cost up to $75.

## Source map

- `city.js` and `city-art.js` lay out and draw the waterfront.
- `traffic.js` runs pedestrians, traffic, collisions, and vehicle handling.
- `contracts.js` owns story progression, activities, and checkpoints.
- `pursuit.js` runs dispatch, patrols, and the pulse tool.
- `scene.js`, `actor-art.js`, `interface.js`, and `audio.js` present the game.

Run `MAKEFUN_OUTPUT_DIR=out node main.ts` to package the game, screenshots, and make.fun dossier.
