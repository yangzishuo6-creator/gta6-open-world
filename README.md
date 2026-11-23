# Harbor Bay

[![make.fun · gta6-01](https://make.fun/badge/gta6-01.svg)](https://make.fun/bounty/gta6-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-01)
[![rank](https://make.fun/badge/gta6-01/yangzishuo6-creator/gta6-open-world/rank.svg)](https://make.fun/bounty/gta6-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-01)
[![reward](https://make.fun/badge/gta6-01/yangzishuo6-creator/gta6-open-world/reward.svg)](https://make.fun/bounty/gta6-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-01)

Harbor Bay is an offline third-person crime game set on the Juniper Mile waterfront. Fixer Nia and mechanic Ivo help you steal a Port Authority ledger that links a missing freighter to a string of payoffs. Follow the six-mission case, race down Bayfront, run courier jobs along the promenade, or take your chances with Port Patrol.

![Aster Veloce pursued by Port Patrol on Bayfront](screenshots/1-chase.jpg)

## Play

Run `node serve.ts` with Node.js 22 or newer and open `http://localhost:8080` in desktop Chrome. Choose **New Game** to meet Nia. **Continue** restores your last saved location and story stage. The game saves after stage transitions and allows manual saves from the pause menu.

| Input | Action |
| --- | --- |
| W, A, S, D | Move or drive |
| Shift / Space | Sprint / handbrake |
| E | Enter, steal, or exit a nearby car |
| Right mouse | Aim and turn the foot camera |
| Left mouse | Fire while on foot |
| 1–4 | Sidearm, Compact, Scatter, Carbine |
| Q / F | Nia's diversion / Ivo's repair or armour |
| R / C | Start the Juniper Circuit in a car / start the Pier Courier on foot |
| R on foot / Shift in a race | Reload / nitro |
| H / B at Ivo’s garage | Save progress / restock ammo for $120 |
| T | Cycle radio stations |
| M / Esc | Open the city atlas or resume |

## Source map

| Path under `game/src/` | Job |
| --- | --- |
| `main.js`, `core/` | Browser loop, input, chase camera, scripted captures |
| `world/` | Street grid, façades, coastal props, atmosphere and ocean |
| `vehicles/`, `actors/` | Car models, arcade driving, traffic and pedestrians |
| `police/`, `combat/` | Cruiser cover, roadblocks, air support, weapons and street effects |
| `missions/` | Ledger case, activities and crew cooldowns |
| `ui/` | HUD, local map, dialogue portraits, title and interactive city atlas |
| `audio/`, `save/` | Synth radio, sound effects, garage services and local progression |

Run `MAKEFUN_OUTPUT_DIR=out node main.ts` to package the game and screenshots and generate `out/dossier.json`.
