import { noise3 } from "./noise";
import type { Env, Instance } from "./types";

// A living elevation map: contour lines of a slowly evolving noise field,
// drawn with marching squares. The cursor (or a finger) raises a hill the
// lines bend around; it rises and sinks smoothly.
const CELL = 12;
const LEVELS = 14;
const SCALE = 0.0022;
const FPS = 40; // redraws per second; the field moves slowly, so full frame rate is unnecessary
const HILL_RADIUS = 90;
const HILL_HEIGHT = 0.35;

export function createTopo(env: Env): Instance {
  const { ctx } = env;
  let cols = 0, rows = 0;
  let field = new Float32Array(0);
  let z = Math.random() * 100;
  let hx = 0, hy = 0, hill = 0; // smoothed hill position and height (0..1)
  let since = Infinity;

  const sample = () => {
    const W = cols + 1;
    const h = HILL_HEIGHT * hill;
    const r2 = 2 * HILL_RADIUS * HILL_RADIUS;
    for (let r = 0; r <= rows; r++) {
      for (let c = 0; c <= cols; c++) {
        const x = c * CELL, y = r * CELL;
        let v = (noise3(x * SCALE, y * SCALE, z) + noise3(x * SCALE * 2.3, y * SCALE * 2.3, z * 1.7) * 0.35) * 0.5 + 0.5;
        if (h > 0.001) {
          const dx = x - hx, dy = y - hy;
          v += h * Math.exp(-(dx * dx + dy * dy) / r2);
        }
        field[r * W + c] = v;
      }
    }
  };

  const draw = () => {
    ctx.clearRect(0, 0, env.w, env.h);
    ctx.lineWidth = 1;
    const W = cols + 1;
    for (let l = 1; l < LEVELS; l++) {
      const iso = l / LEVELS;
      const major = l % 4 === 0;
      ctx.strokeStyle = major ? env.colors.accent : env.colors.dot;
      ctx.globalAlpha = major ? 0.4 : env.dark ? 0.3 : 0.26;
      ctx.beginPath();
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const a = field[r * W + c], b = field[r * W + c + 1];
          const d = field[(r + 1) * W + c], e = field[(r + 1) * W + c + 1];
          const idx = (a > iso ? 8 : 0) | (b > iso ? 4 : 0) | (e > iso ? 2 : 0) | (d > iso ? 1 : 0);
          if (idx === 0 || idx === 15) continue;
          const x = c * CELL, y = r * CELL;
          const top = [x + CELL * ((iso - a) / (b - a)), y];
          const right = [x + CELL, y + CELL * ((iso - b) / (e - b))];
          const bottom = [x + CELL * ((iso - d) / (e - d)), y + CELL];
          const left = [x, y + CELL * ((iso - a) / (d - a))];
          const seg = (p: number[], q: number[]) => {
            ctx.moveTo(p[0], p[1]);
            ctx.lineTo(q[0], q[1]);
          };
          switch (idx) {
            case 1: case 14: seg(left, bottom); break;
            case 2: case 13: seg(bottom, right); break;
            case 3: case 12: seg(left, right); break;
            case 4: case 11: seg(top, right); break;
            case 6: case 9: seg(top, bottom); break;
            case 7: case 8: seg(left, top); break;
            case 5: seg(left, top); seg(bottom, right); break;
            case 10: seg(top, right); seg(left, bottom); break;
          }
        }
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  };

  return {
    reset() {
      cols = Math.ceil(env.w / CELL);
      rows = Math.ceil(env.h / CELL);
      field = new Float32Array((cols + 1) * (rows + 1));
      since = Infinity; // redraw on the next frame
    },
    still() {
      hill = 0;
      sample();
      draw();
    },
    frame(dt) {
      since += dt;
      // A few ms of slack so frame-timing jitter doesn't skip an extra frame.
      if (since < 1000 / FPS - 5) return;
      const step = Math.min(since, 100);
      since = 0;

      z += step * 0.000035;
      const { x, y, active } = env.mouse;
      // A fresh hill appears where the pointer is; otherwise it glides after it.
      if (active && hill < 0.05) {
        hx = x;
        hy = y;
      } else if (active) {
        const k = Math.min(1, step * 0.004);
        hx += (x - hx) * k;
        hy += (y - hy) * k;
      }
      hill += ((active ? 1 : 0) - hill) * Math.min(1, step * (active ? 0.004 : 0.0025));

      sample();
      draw();
    },
  };
}
