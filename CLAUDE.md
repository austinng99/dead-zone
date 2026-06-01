# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the game

Open `index.html` directly in a browser — no build step, no server required:

```bash
open index.html          # macOS
# or just drag index.html into a browser window
```

To test headless (smoke check only — rAF-based game loop doesn't fully run):
```bash
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --headless=new --virtual-time-budget=3000 \
  --screenshot=/tmp/test.png "file://$(pwd)/index.html"
```

## Git workflow

```bash
git add index.html game.js     # stage changed files (never add .DS_Store or .claude/)
git commit -m "message"
git push                       # pushes to git@github.com:austinng99/dead-zone.git
```

## Architecture

Everything lives in two files: `index.html` (HTML shell + CSS) and `game.js` (~1100 lines, all game logic). Zero dependencies, zero build tools.

### State machine

`STATE` enum in `Game`: `MENU → PLAYING → LEVEL_COMPLETE → PLAYING` (repeat) or `→ GAME_OVER → MENU`. The `update()` method is a no-op in all non-PLAYING states. The `draw()` method always draws the game world and layers state-specific overlays on top.

### Game loop

`Game.loop(ts)` → `update(dt)` → `draw()` → `input.tick()` → `requestAnimationFrame`. `dt` is capped at 0.05s to prevent spiral-of-death on tab blur. `input.tick()` resets per-frame one-shot flags (`mouse.clicked`).

### Sprite system

Sprites are 2D arrays of palette indices (`0` = transparent). `drawSprite(ctx, grid, palette, x, y, scale)` renders them as scaled `fillRect` calls at `PS=3` (each logical pixel = 3×3 canvas pixels). Entities are drawn with `ctx.save() / ctx.translate(x,y) / ctx.rotate(angle + Math.PI/2) / drawSprite(...) / ctx.restore()` so the sprite always faces the direction of travel. Palette arrays are defined in `PAL` (`p`, `w`, `r`, `t` for player, walker, runner, tank).

### Entity lifecycle

All entity arrays (`bullets`, `particles`, `floatTexts`) are filtered each frame by an `alive`/`dead` flag — entities mark themselves dead and are garbage-collected at the filter step. `wave.enemies` is managed by `WaveManager` using the same pattern.

### Score flow

Enemy kills accumulate into `wave.pendingScore` inside `WaveManager.update()` (collected before the dead-enemy filter). `Game.update()` reads and resets `pendingScore` each frame: `this.score += this.wave.pendingScore; this.wave.pendingScore = 0`.

### WaveManager

`startWave(level)` builds a `spawnQueue` of `{type, speedMult}` objects. Each `update()` tick drains the queue one enemy at a time on a `spawnInterval` timer, spawning enemies 30px off a random canvas edge. `waveComplete` becomes `true` when both `spawnQueue` and `enemies` are empty. Beyond level 5, count and speedMult scale linearly via `getDef()`.

### Screen shake

`Renderer` stores `shakeX/shakeY` offsets updated by `updateShake(dt)`. `Game.draw()` wraps all rendering in `ctx.save() / ctx.translate(shakeX, shakeY) / ... / ctx.restore()`. Shake is triggered in `Game.update()` by detecting the transition `player.invincible: 0 → >0`.

### Collision detection

All collision is circle-circle via `circleCollide(ax, ay, ar, bx, by, br)`. Bullet-vs-enemy and enemy-vs-player checks both live in `WaveManager.update()`.

### High score

Persisted to `localStorage` under the key `deadzone_hs`. Written on game-over if `score > highScore`.
