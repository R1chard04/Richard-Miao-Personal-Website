"use client";
import { useEffect, useRef } from "react";
import type { Env } from "./backgrounds/types";
import { createTopo } from "./backgrounds/topo";

// How long the hill lingers after a finger lifts on touch screens.
const TOUCH_LINGER_MS = 1200;

// Runs the topographic background on a fixed canvas: sizing, theme colors,
// pointer and touch input, pausing while the tab is hidden, and a still frame
// for reduced motion.
export function Background() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const still = matchMedia("(prefers-reduced-motion: reduce)");
    const dark = matchMedia("(prefers-color-scheme: dark)");

    const env: Env = {
      ctx, w: 0, h: 0, dark: false,
      colors: { dot: "#888", accent: "#e8825a" },
      mouse: { x: 0, y: 0, active: false },
    };
    const readColors = () => {
      const s = getComputedStyle(document.documentElement);
      env.colors = {
        dot: s.getPropertyValue("--muted").trim() || "#888",
        accent: s.getPropertyValue("--accent").trim() || "#e8825a",
      };
      const theme = document.documentElement.dataset.theme;
      env.dark = theme ? theme === "dark" : dark.matches;
    };

    const topo = createTopo(env);
    let raf = 0, last = 0;
    let linger: ReturnType<typeof setTimeout> | undefined;

    // The canvas is sized in CSS to the large viewport (100lvh), which stays put
    // while a phone's address bar slides in and out during scrolling.
    const size = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      env.w = canvas.clientWidth;
      env.h = canvas.clientHeight;
      canvas.width = env.w * dpr;
      canvas.height = env.h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      topo.reset();
    };

    const loop = (now: number) => {
      const dt = last ? Math.min(now - last, 64) : 0;
      last = now;
      topo.frame(dt);
      raf = requestAnimationFrame(loop);
    };

    const start = () => {
      cancelAnimationFrame(raf);
      last = 0;
      if (still.matches) topo.still();
      else if (!document.hidden) raf = requestAnimationFrame(loop);
    };

    const onResize = () => {
      if (canvas.clientWidth === env.w && canvas.clientHeight === env.h) return;
      size();
      start();
    };
    const onTheme = () => {
      readColors();
      topo.reset();
      start();
    };

    // A mouse raises the hill wherever it hovers. Touch has no hover, so a tap
    // or drag raises it under the finger and it sinks shortly after lifting.
    const point = (e: PointerEvent) => {
      clearTimeout(linger);
      env.mouse = { x: e.clientX, y: e.clientY, active: true };
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "mouse" || e.buttons) point(e);
    };
    const onLift = (e: PointerEvent) => {
      if (e.pointerType === "mouse") return;
      clearTimeout(linger);
      linger = setTimeout(() => (env.mouse.active = false), TOUCH_LINGER_MS);
    };
    const onLeave = () => {
      env.mouse.active = false;
    };

    readColors();
    size();
    start();

    const mo = new MutationObserver(onTheme);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    addEventListener("resize", onResize);
    addEventListener("pointermove", onMove);
    addEventListener("pointerdown", point);
    addEventListener("pointerup", onLift);
    addEventListener("pointercancel", onLift);
    document.documentElement.addEventListener("pointerleave", onLeave);
    document.addEventListener("visibilitychange", start);
    still.addEventListener("change", start);
    dark.addEventListener("change", onTheme);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(linger);
      mo.disconnect();
      removeEventListener("resize", onResize);
      removeEventListener("pointermove", onMove);
      removeEventListener("pointerdown", point);
      removeEventListener("pointerup", onLift);
      removeEventListener("pointercancel", onLift);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", start);
      still.removeEventListener("change", start);
      dark.removeEventListener("change", onTheme);
    };
  }, []);

  return <canvas ref={ref} className="backdrop" aria-hidden="true" />;
}
