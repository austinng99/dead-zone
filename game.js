// ─────────────────────────────────────────────
//  DEAD ZONE — Top-Down Shooter
// ─────────────────────────────────────────────

const CANVAS_W = 800;
const CANVAS_H = 600;
const PS = 3; // pixel scale for sprites

// ── Color Palette (CGA-inspired) ──────────────
const C = {
  black:   '#0d0d0d',
  dgray:   '#1a1a2e',
  gray:    '#2a2a3e',
  lgray:   '#555577',
  white:   '#e8e8ff',
  cream:   '#d4b896',
  skin:    '#c8956c',
  brown:   '#7a4a2a',
  red:     '#cc2222',
  dred:    '#881111',
  orange:  '#dd7722',
  yellow:  '#ddcc22',
  green:   '#22aa44',
  dgreen:  '#115522',
  cyan:    '#22cccc',
  blue:    '#2255cc',
  purple:  '#882299',
  dpurple: '#441155',
  flash:   '#ffffff',
};

// ── Sprite Definitions (pixel art — 0 = transparent) ──
const PAL = {
  // player palette: 0=transparent,1=darkbody,2=body,3=skin,4=hair,5=gun,6=gunlight,7=boot
  p: [null, C.brown, '#6b8cba', C.skin, '#3a2a1a', '#444444', '#888888', '#2a2020'],
  // walker palette: 0=transparent,1=dark,2=main,3=accent,4=eye
  w: [null, C.dred,  C.red,    '#ff5555', '#ffaa00'],
  // runner palette
  r: [null, '#7a3300', C.orange, '#ffaa44', '#ff2200'],
  // tank palette
  t: [null, C.dpurple, C.purple, '#cc44ff', '#ff00ff'],
};

// Player — top-down, 12×14 grid, 4 walk frames
// Each row = 1 pixel row, each number = palette index
const SPR_PLAYER = [
  // frame 0 (stand)
  [
    [0,0,0,4,4,4,0,0,0,0,0,0],
    [0,0,4,4,4,4,4,0,0,0,0,0],
    [0,0,3,3,3,3,0,0,5,5,0,0],
    [0,2,2,3,3,2,2,0,5,6,5,0],
    [0,2,2,2,2,2,2,0,5,5,0,0],
    [0,2,2,2,2,2,2,0,0,0,0,0],
    [0,1,2,2,2,2,1,0,0,0,0,0],
    [0,0,2,2,2,2,0,0,0,0,0,0],
    [0,0,1,2,0,2,1,0,0,0,0,0],
    [0,0,7,2,0,2,7,0,0,0,0,0],
    [0,0,7,7,0,7,7,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0],
  ],
  // frame 1 (walk a)
  [
    [0,0,0,4,4,4,0,0,0,0,0,0],
    [0,0,4,4,4,4,4,0,0,0,0,0],
    [0,0,3,3,3,3,0,0,5,5,0,0],
    [0,2,2,3,3,2,2,0,5,6,5,0],
    [0,2,2,2,2,2,2,0,5,5,0,0],
    [0,2,2,2,2,2,2,0,0,0,0,0],
    [0,1,2,2,2,2,1,0,0,0,0,0],
    [0,1,2,2,2,0,0,0,0,0,0,0],
    [0,7,2,0,0,0,2,1,0,0,0,0],
    [0,7,7,0,0,0,2,7,0,0,0,0],
    [0,0,0,0,0,0,7,7,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0],
  ],
  // frame 2 (stand mirror)
  [
    [0,0,0,4,4,4,0,0,0,0,0,0],
    [0,0,4,4,4,4,4,0,0,0,0,0],
    [0,0,3,3,3,3,0,0,5,5,0,0],
    [0,2,2,3,3,2,2,0,5,6,5,0],
    [0,2,2,2,2,2,2,0,5,5,0,0],
    [0,2,2,2,2,2,2,0,0,0,0,0],
    [0,1,2,2,2,2,1,0,0,0,0,0],
    [0,0,2,2,2,2,0,0,0,0,0,0],
    [0,0,1,2,0,2,1,0,0,0,0,0],
    [0,0,7,2,0,2,7,0,0,0,0,0],
    [0,0,7,7,0,7,7,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0],
  ],
  // frame 3 (walk b)
  [
    [0,0,0,4,4,4,0,0,0,0,0,0],
    [0,0,4,4,4,4,4,0,0,0,0,0],
    [0,0,3,3,3,3,0,0,5,5,0,0],
    [0,2,2,3,3,2,2,0,5,6,5,0],
    [0,2,2,2,2,2,2,0,5,5,0,0],
    [0,2,2,2,2,2,2,0,0,0,0,0],
    [0,1,2,2,2,2,1,0,0,0,0,0],
    [0,0,0,2,2,2,1,1,0,0,0,0],
    [0,1,2,0,0,0,2,7,0,0,0,0],
    [0,7,2,0,0,0,7,7,0,0,0,0],
    [0,7,7,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0],
  ],
];

// Walker enemy — 10×10, 3 walk frames
const SPR_WALKER = [
  [
    [0,0,1,2,2,2,1,0,0,0],
    [0,1,2,3,2,3,2,1,0,0],
    [0,2,2,2,2,2,2,2,0,0],
    [0,2,4,2,2,2,4,2,0,0],
    [0,2,2,2,2,2,2,2,0,0],
    [0,1,2,2,2,2,2,1,0,0],
    [0,0,1,2,2,2,1,0,0,0],
    [0,0,2,1,0,1,2,0,0,0],
    [0,0,2,0,0,0,2,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
  ],
  [
    [0,0,1,2,2,2,1,0,0,0],
    [0,1,2,3,2,3,2,1,0,0],
    [0,2,2,2,2,2,2,2,0,0],
    [0,2,4,2,2,2,4,2,0,0],
    [0,2,2,2,2,2,2,2,0,0],
    [0,1,2,2,2,2,2,1,0,0],
    [0,0,1,2,2,2,1,0,0,0],
    [0,2,2,0,0,2,0,2,0,0],
    [0,2,0,0,0,2,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
  ],
  [
    [0,0,1,2,2,2,1,0,0,0],
    [0,1,2,3,2,3,2,1,0,0],
    [0,2,2,2,2,2,2,2,0,0],
    [0,2,4,2,2,2,4,2,0,0],
    [0,2,2,2,2,2,2,2,0,0],
    [0,1,2,2,2,2,2,1,0,0],
    [0,0,1,2,2,2,1,0,0,0],
    [0,0,2,0,2,1,2,0,0,0],
    [0,0,0,0,2,0,2,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
  ],
];

// Runner enemy — 8×10, 2 frames
const SPR_RUNNER = [
  [
    [0,0,1,2,2,1,0,0],
    [0,1,2,3,3,2,1,0],
    [0,2,2,4,4,2,2,0],
    [0,2,2,2,2,2,2,0],
    [0,0,2,2,2,2,0,0],
    [0,0,2,2,2,2,0,0],
    [0,2,1,2,2,1,2,0],
    [0,2,0,0,0,0,2,0],
    [0,2,0,0,0,0,2,0],
    [0,0,0,0,0,0,0,0],
  ],
  [
    [0,0,1,2,2,1,0,0],
    [0,1,2,3,3,2,1,0],
    [0,2,2,4,4,2,2,0],
    [0,2,2,2,2,2,2,0],
    [0,0,2,2,2,2,0,0],
    [0,0,2,2,2,2,0,0],
    [0,1,2,2,2,2,1,0],
    [0,2,2,0,0,2,2,0],
    [0,2,0,0,0,0,2,0],
    [0,0,0,0,0,0,0,0],
  ],
];

// Tank enemy — 14×14, 2 frames
const SPR_TANK = [
  [
    [0,0,1,1,2,2,2,2,1,1,0,0,0,0],
    [0,1,2,2,3,3,3,3,2,2,1,0,0,0],
    [1,2,2,3,2,2,2,2,3,2,2,1,0,0],
    [1,2,3,2,4,2,2,4,2,3,2,1,0,0],
    [1,2,2,2,2,2,2,2,2,2,2,1,0,0],
    [1,2,2,2,2,2,2,2,2,2,2,1,0,0],
    [1,2,3,2,2,2,2,2,2,3,2,1,0,0],
    [1,2,2,3,2,2,2,2,3,2,2,1,0,0],
    [0,1,2,2,3,3,3,3,2,2,1,0,0,0],
    [0,0,1,1,2,2,2,2,1,1,0,0,0,0],
    [0,0,1,2,0,1,2,0,2,1,0,0,0,0],
    [0,0,2,0,0,0,2,0,0,2,0,0,0,0],
    [0,0,2,0,0,0,0,0,0,2,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  ],
  [
    [0,0,1,1,2,2,2,2,1,1,0,0,0,0],
    [0,1,2,2,3,3,3,3,2,2,1,0,0,0],
    [1,2,2,3,2,2,2,2,3,2,2,1,0,0],
    [1,2,3,2,4,2,2,4,2,3,2,1,0,0],
    [1,2,2,2,2,2,2,2,2,2,2,1,0,0],
    [1,2,2,2,2,2,2,2,2,2,2,1,0,0],
    [1,2,3,2,2,2,2,2,2,3,2,1,0,0],
    [1,2,2,3,2,2,2,2,3,2,2,1,0,0],
    [0,1,2,2,3,3,3,3,2,2,1,0,0,0],
    [0,0,1,1,2,2,2,2,1,1,0,0,0,0],
    [0,2,1,0,0,2,1,0,0,1,2,0,0,0],
    [0,2,0,0,0,2,0,0,0,0,2,0,0,0],
    [0,2,0,0,0,0,0,0,0,0,2,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  ],
];

// ── Input Manager ─────────────────────────────
class Input {
  constructor(canvas) {
    this.keys = {};
    this.mouse = { x: CANVAS_W / 2, y: CANVAS_H / 2, down: false, clicked: false };
    this._canvas = canvas;

    window.addEventListener('keydown', e => {
      this.keys[e.code] = true;
      e.preventDefault();
    });
    window.addEventListener('keyup', e => {
      this.keys[e.code] = false;
    });
    canvas.addEventListener('mousemove', e => {
      const r = canvas.getBoundingClientRect();
      const scaleX = CANVAS_W / r.width;
      const scaleY = CANVAS_H / r.height;
      this.mouse.x = (e.clientX - r.left) * scaleX;
      this.mouse.y = (e.clientY - r.top) * scaleY;
    });
    canvas.addEventListener('mousedown', e => {
      if (e.button === 0) { this.mouse.down = true; this.mouse.clicked = true; }
    });
    canvas.addEventListener('mouseup', e => {
      if (e.button === 0) this.mouse.down = false;
    });
  }

  isDown(code) { return !!this.keys[code]; }

  consumeClick() {
    const c = this.mouse.clicked;
    this.mouse.clicked = false;
    return c;
  }

  tick() {
    // clicked is reset after each frame read
    this.mouse.clicked = false;
  }
}

// ── Utility ───────────────────────────────────
function lerp(a, b, t) { return a + (b - a) * t; }
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
function rand(lo, hi) { return lo + Math.random() * (hi - lo); }
function randInt(lo, hi) { return Math.floor(rand(lo, hi + 1)); }

function dist(ax, ay, bx, by) {
  const dx = ax - bx, dy = ay - by;
  return Math.sqrt(dx * dx + dy * dy);
}

function angle(ax, ay, bx, by) {
  return Math.atan2(by - ay, bx - ax);
}

function circleCollide(ax, ay, ar, bx, by, br) {
  return dist(ax, ay, bx, by) < ar + br;
}

// Draw a pixel-art sprite from a 2D array using a palette
function drawSprite(ctx, grid, palette, x, y, scale = PS, alpha = 1) {
  const prevAlpha = ctx.globalAlpha;
  ctx.globalAlpha = alpha;
  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      const idx = grid[row][col];
      if (idx === 0) continue;
      ctx.fillStyle = palette[idx];
      ctx.fillRect(
        Math.floor(x + col * scale),
        Math.floor(y + row * scale),
        scale, scale
      );
    }
  }
  ctx.globalAlpha = prevAlpha;
}

// ── Particle ──────────────────────────────────
class Particle {
  constructor(x, y, vx, vy, color, life, size = 3) {
    this.x = x; this.y = y;
    this.vx = vx; this.vy = vy;
    this.color = color;
    this.life = life;
    this.maxLife = life;
    this.size = size;
  }

  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.vx *= 0.92;
    this.vy *= 0.92;
    this.life -= dt;
  }

  draw(ctx) {
    const a = Math.max(0, this.life / this.maxLife);
    ctx.globalAlpha = a;
    ctx.fillStyle = this.color;
    const s = this.size * a;
    ctx.fillRect(this.x - s / 2, this.y - s / 2, s, s);
    ctx.globalAlpha = 1;
  }

  get dead() { return this.life <= 0; }
}

// Floating score text
class FloatText {
  constructor(x, y, text, color) {
    this.x = x; this.y = y;
    this.text = text;
    this.color = color;
    this.life = 1.2;
    this.maxLife = 1.2;
  }

  update(dt) { this.y -= 30 * dt; this.life -= dt; }

  draw(ctx) {
    const a = this.life / this.maxLife;
    ctx.globalAlpha = a;
    ctx.fillStyle = this.color;
    ctx.font = '8px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.fillText(this.text, this.x, this.y);
    ctx.globalAlpha = 1;
  }

  get dead() { return this.life <= 0; }
}

// ── Bullet ────────────────────────────────────
class Bullet {
  constructor(x, y, angle, speed, damage, owner) {
    this.x = x; this.y = y;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.damage = damage;
    this.owner = owner; // 'player' or 'enemy'
    this.radius = 4;
    this.alive = true;
    this.trail = [];
  }

  update(dt) {
    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > 6) this.trail.shift();
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    if (this.x < -20 || this.x > CANVAS_W + 20 || this.y < -20 || this.y > CANVAS_H + 20) {
      this.alive = false;
    }
  }

  draw(ctx) {
    // Trail
    for (let i = 0; i < this.trail.length; i++) {
      const a = (i / this.trail.length) * 0.5;
      ctx.globalAlpha = a;
      ctx.fillStyle = C.yellow;
      const s = 2 + i * 0.5;
      ctx.fillRect(this.trail[i].x - s / 2, this.trail[i].y - s / 2, s, s);
    }
    ctx.globalAlpha = 1;
    // Bullet body
    ctx.fillStyle = C.yellow;
    ctx.fillRect(this.x - 4, this.y - 2, 8, 4);
    ctx.fillStyle = C.flash;
    ctx.fillRect(this.x - 2, this.y - 1, 4, 2);
  }
}

// ── Player ────────────────────────────────────
const PLAYER_SPEED = 180;
const PLAYER_MAX_HP = 100;
const PLAYER_FIRE_RATE = 0.15; // seconds between shots
const PLAYER_BULLET_SPEED = 520;
const PLAYER_BULLET_DAMAGE = 25;
const PLAYER_RADIUS = 16;

class Player {
  constructor(x, y) {
    this.x = x; this.y = y;
    this.vx = 0; this.vy = 0;
    this.angle = 0;
    this.hp = PLAYER_MAX_HP;
    this.maxHp = PLAYER_MAX_HP;
    this.fireCooldown = 0;
    this.animFrame = 0;
    this.animTimer = 0;
    this.animSpeed = 0.12;
    this.moving = false;
    this.alive = true;
    this.invincible = 0; // hit invincibility frames
    this.radius = PLAYER_RADIUS;
  }

  update(dt, input, bullets, particles) {
    if (!this.alive) return;

    // Movement
    let dx = 0, dy = 0;
    if (input.isDown('ArrowLeft')  || input.isDown('KeyA')) dx -= 1;
    if (input.isDown('ArrowRight') || input.isDown('KeyD')) dx += 1;
    if (input.isDown('ArrowUp')    || input.isDown('KeyW')) dy -= 1;
    if (input.isDown('ArrowDown')  || input.isDown('KeyS')) dy += 1;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len > 0) { dx /= len; dy /= len; }
    this.vx = dx * PLAYER_SPEED;
    this.vy = dy * PLAYER_SPEED;
    this.x = clamp(this.x + this.vx * dt, this.radius, CANVAS_W - this.radius);
    this.y = clamp(this.y + this.vy * dt, this.radius, CANVAS_H - this.radius);

    this.moving = (dx !== 0 || dy !== 0);

    // Aim at mouse
    this.angle = angle(this.x, this.y, input.mouse.x, input.mouse.y);

    // Walk animation
    if (this.moving) {
      this.animTimer += dt;
      if (this.animTimer >= this.animSpeed) {
        this.animTimer = 0;
        this.animFrame = (this.animFrame + 1) % SPR_PLAYER.length;
      }
    } else {
      this.animFrame = 0;
    }

    // Shooting
    this.fireCooldown = Math.max(0, this.fireCooldown - dt);
    if (input.mouse.down && this.fireCooldown <= 0) {
      this.shoot(bullets, particles, input.mouse.x, input.mouse.y);
    }

    // Invincibility
    if (this.invincible > 0) this.invincible -= dt;
  }

  shoot(bullets, particles, mx, my) {
    this.fireCooldown = PLAYER_FIRE_RATE;
    const a = angle(this.x, this.y, mx, my);
    const gunOffX = Math.cos(a) * 20;
    const gunOffY = Math.sin(a) * 20;
    bullets.push(new Bullet(this.x + gunOffX, this.y + gunOffY, a, PLAYER_BULLET_SPEED, PLAYER_BULLET_DAMAGE, 'player'));
    // Muzzle flash
    for (let i = 0; i < 6; i++) {
      const pa = a + rand(-0.5, 0.5);
      const spd = rand(60, 160);
      particles.push(new Particle(
        this.x + gunOffX, this.y + gunOffY,
        Math.cos(pa) * spd, Math.sin(pa) * spd,
        Math.random() < 0.5 ? C.yellow : C.orange,
        0.2, rand(2, 5)
      ));
    }
  }

  takeDamage(dmg, particles) {
    if (this.invincible > 0) return;
    this.hp = Math.max(0, this.hp - dmg);
    this.invincible = 0.6;
    // Blood/damage particles
    for (let i = 0; i < 10; i++) {
      const a = rand(0, Math.PI * 2);
      const spd = rand(40, 120);
      particles.push(new Particle(
        this.x, this.y,
        Math.cos(a) * spd, Math.sin(a) * spd,
        C.red, 0.5, rand(3, 6)
      ));
    }
    if (this.hp <= 0) this.alive = false;
  }

  draw(ctx) {
    if (!this.alive) return;
    // Flash when invincible
    if (this.invincible > 0 && Math.floor(this.invincible * 10) % 2 === 0) return;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle + Math.PI / 2);
    const frame = SPR_PLAYER[this.animFrame];
    const sprW = frame[0].length * PS;
    const sprH = frame.length * PS;
    drawSprite(ctx, frame, PAL.p, -sprW / 2, -sprH / 2);
    ctx.restore();
  }
}

// ── Enemy ─────────────────────────────────────
const ENEMY_TYPES = {
  walker: {
    sprite: SPR_WALKER, palette: PAL.w,
    speed: 70, hp: 50, damage: 15, radius: 14, score: 10,
    cols: 10, rows: 10,
  },
  runner: {
    sprite: SPR_RUNNER, palette: PAL.r,
    speed: 130, hp: 25, damage: 10, radius: 11, score: 20,
    cols: 8, rows: 10,
  },
  tank: {
    sprite: SPR_TANK, palette: PAL.t,
    speed: 45, hp: 150, damage: 30, radius: 20, score: 50,
    cols: 14, rows: 14,
  },
};

class Enemy {
  constructor(x, y, type, speedMult = 1) {
    const def = ENEMY_TYPES[type];
    this.x = x; this.y = y;
    this.type = type;
    this.def = def;
    this.speed = def.speed * speedMult;
    this.hp = def.hp;
    this.maxHp = def.hp;
    this.damage = def.damage;
    this.radius = def.radius;
    this.score = def.score;
    this.alive = true;
    this.angle = 0;
    this.animFrame = 0;
    this.animTimer = 0;
    this.animSpeed = type === 'runner' ? 0.08 : 0.15;
    this.hitFlash = 0;
  }

  update(dt, player) {
    if (!this.alive) return;
    // Move toward player
    const a = angle(this.x, this.y, player.x, player.y);
    this.angle = a;
    this.x += Math.cos(a) * this.speed * dt;
    this.y += Math.sin(a) * this.speed * dt;
    // Animation
    this.animTimer += dt;
    if (this.animTimer >= this.animSpeed) {
      this.animTimer = 0;
      this.animFrame = (this.animFrame + 1) % this.def.sprite.length;
    }
    if (this.hitFlash > 0) this.hitFlash -= dt;
  }

  takeDamage(dmg, particles, floatTexts) {
    this.hp -= dmg;
    this.hitFlash = 0.08;
    // Hit sparks
    for (let i = 0; i < 5; i++) {
      const a = rand(0, Math.PI * 2);
      const spd = rand(50, 150);
      particles.push(new Particle(
        this.x, this.y,
        Math.cos(a) * spd, Math.sin(a) * spd,
        Math.random() < 0.5 ? C.yellow : C.orange,
        0.3, rand(2, 4)
      ));
    }
    if (this.hp <= 0) {
      this.die(particles, floatTexts);
    }
  }

  die(particles, floatTexts) {
    this.alive = false;
    // Death explosion
    const colors = [C.red, C.orange, C.yellow, C.dred];
    for (let i = 0; i < 20; i++) {
      const a = rand(0, Math.PI * 2);
      const spd = rand(30, 200);
      particles.push(new Particle(
        this.x, this.y,
        Math.cos(a) * spd, Math.sin(a) * spd,
        colors[Math.floor(Math.random() * colors.length)],
        rand(0.4, 1.0), rand(3, 8)
      ));
    }
    floatTexts.push(new FloatText(this.x, this.y - 10, `+${this.score}`, C.yellow));
  }

  draw(ctx) {
    if (!this.alive) return;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle + Math.PI / 2);

    const frame = this.def.sprite[this.animFrame];
    const sprW = this.def.cols * PS;
    const sprH = this.def.rows * PS;
    const ox = -sprW / 2;
    const oy = -sprH / 2;

    if (this.hitFlash > 0) {
      // White flash on hit
      ctx.globalAlpha = 0.7;
      drawSprite(ctx, frame, Array(8).fill(C.flash), ox, oy);
      ctx.globalAlpha = 1;
    } else {
      drawSprite(ctx, frame, this.def.palette, ox, oy);
    }

    ctx.restore();

    // Health bar (only if damaged)
    if (this.hp < this.maxHp) {
      const bw = this.def.radius * 2;
      const bx = this.x - this.def.radius;
      const by = this.y - this.def.radius - 8;
      ctx.fillStyle = C.dred;
      ctx.fillRect(bx, by, bw, 4);
      ctx.fillStyle = C.green;
      ctx.fillRect(bx, by, bw * (this.hp / this.maxHp), 4);
    }
  }
}

// ── Wave Manager ──────────────────────────────
const WAVE_DEFS = [
  { count: 10, types: ['walker'],                         speedMult: 1.0  },
  { count: 18, types: ['walker', 'runner'],               speedMult: 1.2  },
  { count: 25, types: ['walker', 'runner', 'tank'],       speedMult: 1.4  },
  { count: 35, types: ['walker', 'runner', 'tank'],       speedMult: 1.6  },
  { count: 45, types: ['walker', 'runner', 'tank'],       speedMult: 1.8  },
];

class WaveManager {
  constructor() {
    this.level = 1;
    this.enemies = [];
    this.spawnQueue = [];
    this.spawnTimer = 0;
    this.spawnInterval = 0.6;
    this.waveComplete = false;
    this.pendingScore = 0;
  }

  getDef(level) {
    const idx = Math.min(level - 1, WAVE_DEFS.length - 1);
    const def = WAVE_DEFS[idx];
    // Scale up beyond level 5
    if (level > 5) {
      return {
        ...def,
        count: def.count + (level - 5) * 5,
        speedMult: Math.min(def.speedMult + (level - 5) * 0.1, 3.0),
      };
    }
    return def;
  }

  startWave(level) {
    this.level = level;
    this.enemies = [];
    this.spawnQueue = [];
    this.waveComplete = false;
    const def = this.getDef(level);
    for (let i = 0; i < def.count; i++) {
      const typeIdx = Math.floor(Math.random() * def.types.length);
      this.spawnQueue.push({ type: def.types[typeIdx], speedMult: def.speedMult });
    }
    this.spawnTimer = 0;
    // Faster spawn at higher levels
    this.spawnInterval = Math.max(0.2, 0.7 - level * 0.05);
  }

  spawnEnemy(type, speedMult) {
    // Spawn outside canvas bounds
    const side = randInt(0, 3);
    let ex, ey;
    switch (side) {
      case 0: ex = rand(0, CANVAS_W); ey = -30; break;
      case 1: ex = CANVAS_W + 30; ey = rand(0, CANVAS_H); break;
      case 2: ex = rand(0, CANVAS_W); ey = CANVAS_H + 30; break;
      case 3: ex = -30; ey = rand(0, CANVAS_H); break;
    }
    this.enemies.push(new Enemy(ex, ey, type, speedMult));
  }

  update(dt, player, bullets, particles, floatTexts) {
    // Spawn queued enemies
    if (this.spawnQueue.length > 0) {
      this.spawnTimer -= dt;
      if (this.spawnTimer <= 0) {
        this.spawnTimer = this.spawnInterval;
        const next = this.spawnQueue.shift();
        this.spawnEnemy(next.type, next.speedMult);
      }
    }

    // Update enemies
    for (const e of this.enemies) {
      if (!e.alive) continue;
      e.update(dt, player);

      // Enemy vs player collision
      if (player.alive && circleCollide(e.x, e.y, e.radius, player.x, player.y, player.radius)) {
        player.takeDamage(e.damage, particles);
      }
    }

    // Bullet vs enemy collision
    for (const b of bullets) {
      if (!b.alive || b.owner !== 'player') continue;
      for (const e of this.enemies) {
        if (!e.alive) continue;
        if (circleCollide(b.x, b.y, b.radius, e.x, e.y, e.radius)) {
          e.takeDamage(b.damage, particles, floatTexts);
          b.alive = false;
          break;
        }
      }
    }

    // Collect scores from enemies that just died
    for (const e of this.enemies) {
      if (!e.alive) this.pendingScore += e.score;
    }
    // Clean up dead enemies
    this.enemies = this.enemies.filter(e => e.alive);

    // Wave complete?
    if (this.spawnQueue.length === 0 && this.enemies.length === 0) {
      this.waveComplete = true;
    }
  }

  get aliveCount() { return this.enemies.filter(e => e.alive).length; }
  get remainingToSpawn() { return this.spawnQueue.length; }
}

// ── Renderer / HUD ────────────────────────────
class Renderer {
  constructor(ctx) {
    this.ctx = ctx;
    this.shakeX = 0;
    this.shakeY = 0;
    this.shakeTimer = 0;
  }

  shake(intensity = 6, duration = 0.18) {
    this.shakeIntensity = intensity;
    this.shakeTimer = duration;
  }

  updateShake(dt) {
    if (this.shakeTimer > 0) {
      this.shakeTimer -= dt;
      this.shakeX = rand(-this.shakeIntensity, this.shakeIntensity);
      this.shakeY = rand(-this.shakeIntensity, this.shakeIntensity);
    } else {
      this.shakeX = 0;
      this.shakeY = 0;
    }
  }

  drawBackground(ctx) {
    ctx.fillStyle = C.black;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    // Dot grid
    ctx.fillStyle = '#1a1a2e';
    for (let gx = 0; gx < CANVAS_W; gx += 32) {
      for (let gy = 0; gy < CANVAS_H; gy += 32) {
        ctx.fillRect(gx, gy, 2, 2);
      }
    }
  }

  drawHUD(ctx, player, wave, score, level) {
    // Health bar
    const bw = 160, bh = 14;
    const bx = 14, by = CANVAS_H - 36;
    ctx.fillStyle = '#111';
    ctx.fillRect(bx - 2, by - 2, bw + 4, bh + 4);
    ctx.fillStyle = C.dred;
    ctx.fillRect(bx, by, bw, bh);
    const hpRatio = player.hp / player.maxHp;
    const hpColor = hpRatio < 0.25
      ? (Math.floor(Date.now() / 150) % 2 === 0 ? C.red : C.orange)
      : hpRatio < 0.5 ? C.orange : C.green;
    ctx.fillStyle = hpColor;
    ctx.fillRect(bx, by, Math.floor(bw * hpRatio), bh);
    // HP label
    ctx.fillStyle = C.white;
    ctx.font = '7px "Press Start 2P"';
    ctx.textAlign = 'left';
    ctx.fillText(`HP ${player.hp}`, bx + 4, by + 10);

    // Score
    ctx.fillStyle = C.yellow;
    ctx.font = '10px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.fillText(`SCORE: ${score}`, CANVAS_W / 2, 24);

    // Level & wave info
    ctx.fillStyle = C.cyan;
    ctx.font = '8px "Press Start 2P"';
    ctx.textAlign = 'right';
    ctx.fillText(`LVL ${level}`, CANVAS_W - 14, 24);

    const remaining = wave.aliveCount + wave.remainingToSpawn;
    ctx.fillStyle = C.lgray;
    ctx.font = '7px "Press Start 2P"';
    ctx.fillText(`ENEMIES: ${remaining}`, CANVAS_W - 14, 40);
  }

  drawMenu(ctx, highScore) {
    this.drawBackground(ctx);

    // Scanlines
    ctx.globalAlpha = 0.04;
    ctx.fillStyle = '#000';
    for (let y = 0; y < CANVAS_H; y += 4) {
      ctx.fillRect(0, y, CANVAS_W, 2);
    }
    ctx.globalAlpha = 1;

    // Title
    ctx.fillStyle = C.red;
    ctx.font = 'bold 36px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.shadowColor = C.dred;
    ctx.shadowBlur = 20;
    ctx.fillText('DEAD ZONE', CANVAS_W / 2, 160);
    ctx.shadowBlur = 0;

    ctx.fillStyle = C.orange;
    ctx.font = '12px "Press Start 2P"';
    ctx.fillText('TOP-DOWN SHOOTER', CANVAS_W / 2, 200);

    // Blink prompt
    if (Math.floor(Date.now() / 500) % 2 === 0) {
      ctx.fillStyle = C.white;
      ctx.font = '10px "Press Start 2P"';
      ctx.fillText('PRESS ENTER TO START', CANVAS_W / 2, 300);
    }

    // Controls
    ctx.fillStyle = C.lgray;
    ctx.font = '7px "Press Start 2P"';
    ctx.fillText('WASD / ARROWS: MOVE', CANVAS_W / 2, 360);
    ctx.fillText('MOUSE: AIM   CLICK: SHOOT', CANVAS_W / 2, 380);

    // High score
    if (highScore > 0) {
      ctx.fillStyle = C.yellow;
      ctx.font = '8px "Press Start 2P"';
      ctx.fillText(`BEST: ${highScore}`, CANVAS_W / 2, 430);
    }
  }

  drawLevelComplete(ctx, level, score) {
    ctx.fillStyle = 'rgba(0,0,0,0.65)';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    ctx.fillStyle = C.green;
    ctx.font = '24px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.fillText('WAVE CLEAR!', CANVAS_W / 2, CANVAS_H / 2 - 50);

    ctx.fillStyle = C.yellow;
    ctx.font = '12px "Press Start 2P"';
    ctx.fillText(`SCORE: ${score}`, CANVAS_W / 2, CANVAS_H / 2);

    if (Math.floor(Date.now() / 500) % 2 === 0) {
      ctx.fillStyle = C.white;
      ctx.font = '9px "Press Start 2P"';
      ctx.fillText('PRESS ENTER FOR NEXT WAVE', CANVAS_W / 2, CANVAS_H / 2 + 50);
    }
  }

  drawGameOver(ctx, score, level, highScore) {
    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    ctx.fillStyle = C.red;
    ctx.font = '28px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.shadowColor = C.dred;
    ctx.shadowBlur = 16;
    ctx.fillText('GAME OVER', CANVAS_W / 2, CANVAS_H / 2 - 70);
    ctx.shadowBlur = 0;

    ctx.fillStyle = C.white;
    ctx.font = '10px "Press Start 2P"';
    ctx.fillText(`SCORE: ${score}`, CANVAS_W / 2, CANVAS_H / 2 - 20);
    ctx.fillText(`LEVEL REACHED: ${level}`, CANVAS_W / 2, CANVAS_H / 2 + 10);

    if (highScore > 0) {
      ctx.fillStyle = C.yellow;
      ctx.fillText(`BEST: ${highScore}`, CANVAS_W / 2, CANVAS_H / 2 + 40);
    }

    if (Math.floor(Date.now() / 500) % 2 === 0) {
      ctx.fillStyle = C.white;
      ctx.font = '9px "Press Start 2P"';
      ctx.fillText('PRESS ENTER TO PLAY AGAIN', CANVAS_W / 2, CANVAS_H / 2 + 90);
    }
  }

  drawPaused(ctx) {
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    ctx.fillStyle = C.cyan;
    ctx.font = '24px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSED', CANVAS_W / 2, CANVAS_H / 2);
    ctx.fillStyle = C.lgray;
    ctx.font = '8px "Press Start 2P"';
    ctx.fillText('ESC TO RESUME', CANVAS_W / 2, CANVAS_H / 2 + 40);
  }
}

// ── Game ──────────────────────────────────────
const STATE = { MENU: 0, PLAYING: 1, LEVEL_COMPLETE: 2, GAME_OVER: 3, PAUSED: 4 };

class Game {
  constructor() {
    this.canvas = document.getElementById('game');
    this.canvas.width = CANVAS_W;
    this.canvas.height = CANVAS_H;
    this.ctx = this.canvas.getContext('2d');
    this.input = new Input(this.canvas);
    this.renderer = new Renderer(this.ctx);
    this.state = STATE.MENU;
    this.score = 0;
    this.level = 1;
    this.highScore = parseInt(localStorage.getItem('deadzone_hs') || '0', 10);
    this.player = null;
    this.wave = null;
    this.bullets = [];
    this.particles = [];
    this.floatTexts = [];
    this.prevTime = null;
    // ESC key for pause
    window.addEventListener('keydown', e => {
      if (e.code === 'Escape') this.togglePause();
    });
    window.addEventListener('keydown', e => {
      if (e.code === 'Enter') this.handleEnter();
    });
  }

  handleEnter() {
    if (this.state === STATE.MENU) {
      this.startGame();
    } else if (this.state === STATE.LEVEL_COMPLETE) {
      this.nextLevel();
    } else if (this.state === STATE.GAME_OVER) {
      this.state = STATE.MENU;
    }
  }

  togglePause() {
    if (this.state === STATE.PLAYING) this.state = STATE.PAUSED;
    else if (this.state === STATE.PAUSED) this.state = STATE.PLAYING;
  }

  startGame() {
    this.score = 0;
    this.level = 1;
    this.bullets = [];
    this.particles = [];
    this.floatTexts = [];
    this.player = new Player(CANVAS_W / 2, CANVAS_H / 2);
    this.wave = new WaveManager();
    this.wave.startWave(this.level);
    this.state = STATE.PLAYING;
  }

  nextLevel() {
    this.level++;
    this.bullets = [];
    this.particles = [];
    this.floatTexts = [];
    this.wave.startWave(this.level);
    this.state = STATE.PLAYING;
    this.player.hp = Math.min(this.player.maxHp, this.player.hp + 20);
  }

  update(dt) {
    if (this.state !== STATE.PLAYING) return;

    this.renderer.updateShake(dt);

    // Watch for player damage for screen shake
    const prevInvincible = this.player.invincible;

    this.player.update(dt, this.input, this.bullets, this.particles);

    // Trigger shake when player just got hit
    if (this.player.invincible > 0 && prevInvincible <= 0) {
      this.renderer.shake(7, 0.2);
    }

    // Update bullets
    for (const b of this.bullets) b.update(dt);
    this.bullets = this.bullets.filter(b => b.alive);

    // Update wave
    this.wave.update(dt, this.player, this.bullets, this.particles, this.floatTexts);

    // Collect score from kills this frame
    this.score += this.wave.pendingScore;
    this.wave.pendingScore = 0;

    // Particles
    for (const p of this.particles) p.update(dt);
    this.particles = this.particles.filter(p => !p.dead);

    // Float texts
    for (const t of this.floatTexts) t.update(dt);
    this.floatTexts = this.floatTexts.filter(t => !t.dead);

    // Wave complete
    if (this.wave.waveComplete) {
      this.state = STATE.LEVEL_COMPLETE;
    }

    // Player dead
    if (!this.player.alive) {
      if (this.score > this.highScore) {
        this.highScore = this.score;
        localStorage.setItem('deadzone_hs', this.highScore);
      }
      this.state = STATE.GAME_OVER;
    }
  }

  draw() {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(this.renderer.shakeX, this.renderer.shakeY);

    if (this.state === STATE.MENU) {
      this.renderer.drawMenu(ctx, this.highScore);
      ctx.restore();
      return;
    }

    // Game world
    this.renderer.drawBackground(ctx);

    // Entities
    for (const e of this.wave.enemies) e.draw(ctx);
    for (const b of this.bullets) b.draw(ctx);
    this.player.draw(ctx);
    for (const p of this.particles) p.draw(ctx);
    for (const t of this.floatTexts) t.draw(ctx);

    // HUD
    this.renderer.drawHUD(ctx, this.player, this.wave, this.score, this.level);

    // Overlays
    if (this.state === STATE.LEVEL_COMPLETE) {
      this.renderer.drawLevelComplete(ctx, this.level, this.score);
    } else if (this.state === STATE.GAME_OVER) {
      this.renderer.drawGameOver(ctx, this.score, this.level, this.highScore);
    } else if (this.state === STATE.PAUSED) {
      this.renderer.drawPaused(ctx);
    }

    ctx.restore();
  }

  loop(ts) {
    if (this.prevTime === null) this.prevTime = ts;
    const dt = Math.min((ts - this.prevTime) / 1000, 0.05);
    this.prevTime = ts;
    this.update(dt);
    this.draw();
    this.input.tick();
    requestAnimationFrame(ts => this.loop(ts));
  }

  start() {
    requestAnimationFrame(ts => this.loop(ts));
  }
}

// ── Bootstrap ─────────────────────────────────
window.addEventListener('load', () => {
  new Game().start();
});
