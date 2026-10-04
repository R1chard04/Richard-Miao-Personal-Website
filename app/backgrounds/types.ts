export type Env = {
  ctx: CanvasRenderingContext2D;
  w: number;
  h: number;
  dark: boolean;
  colors: { dot: string; accent: string };
  // Cursor, or a finger on touch screens. Inactive when neither is on the page.
  mouse: { x: number; y: number; active: boolean };
};

// A background animation. The runner owns the canvas, sizing, colors, cursor,
// pausing, and reduced motion; the animation only draws.
export type Instance = {
  // Canvas size or colors changed; rebuild any size-dependent state.
  reset(): void;
  // Advance by dt milliseconds and draw.
  frame(dt: number): void;
  // Draw a single static picture for reduced motion.
  still(): void;
};
