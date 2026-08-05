"use client";

// Signature element for both heroes: a credit score rendered as a semicircle
// of individual hairline ticks rather than a solid arc. Ticks below the score
// are saturated brand color; the remainder fades back. Used at two scales
// (landing hero card, dashboard hero) so the marketing page and the product
// read as the same system.
//
// On mount the gauge sweeps up like a speedometer: the number counts up by 1
// (450, 451, 452, …) at a steady pace and the ticks track it exactly. The
// duration scales with the distance covered (~16 ms per point, so at 60 fps
// every integer is shown), after a short hold so the resting state registers.
//
// NOTE: the sweep deliberately ignores prefers-reduced-motion. It skipped it
// originally, but that renders the gauge as an instant jump for anyone with
// reduce-motion enabled — indistinguishable from "no animation" — and the
// motion involved is a counting number and opacity-only ticks, not the
// translation/parallax class of motion the preference chiefly targets.

import { useEffect, useState } from "react";

const TICKS = 64;
const START = 180; // degrees — left end of the arc
const SWEEP = 180; // semicircle
const MS_PER_POINT = 16; // ≈ one score point per frame at 60 fps
const MIN_SWEEP_MS = 600;
const MAX_SWEEP_MS = 8000;
const HOLD_MS = 300; // pause at the start value before the sweep begins

// Brand ramp: rose (poor) → amber (fair) → teal (good) → mint (excellent).
// Deliberately NOT a red/green traffic light — a credit score is a position on
// a range, not a pass/fail.
function tickColor(t: number) {
  if (t < 0.3) return "#c96a6a";
  if (t < 0.55) return "#d9a441";
  if (t < 0.8) return "#0e9f77";
  return "#2ee6a8";
}

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = (deg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

export function ScoreGauge({
  score,
  from,
  min = 300,
  max = 850,
  size = 260,
  label,
  delta,
  className,
}: {
  score: number | null;
  /** Where the count-up starts. Defaults to `min`. */
  from?: number;
  min?: number;
  max?: number;
  size?: number;
  /** Small caption under the number, e.g. the bureau name. */
  label?: string;
  /** Point change since the previous report. */
  delta?: number | null;
  className?: string;
}) {
  // Linear sweep progress, 0 → 1. The number and the ticks both derive from
  // it, so they move in lockstep at a constant pace.
  const [t, setT] = useState(0);

  const start = Math.min(Math.max(from ?? min, min), score ?? max);

  useEffect(() => {
    // Nothing to sweep toward — render the resting state.
    if (score == null || score <= start) {
      setT(1);
      return;
    }
    const duration = Math.min(
      MAX_SWEEP_MS,
      Math.max(MIN_SWEEP_MS, (score - start) * MS_PER_POINT),
    );

    let frame: number;
    let began: number | null = null;
    const step = (now: number) => {
      if (began === null) began = now;
      const raw = Math.min(1, Math.max(0, (now - began - HOLD_MS) / duration));
      setT(raw); // linear — a steady 450, 451, 452, … count
      if (raw < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [score, start]);

  const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
  const pctTarget = score == null ? 0 : clamp01((score - min) / (max - min));
  const pctStart = score == null ? 0 : clamp01((start - min) / (max - min));
  // Where the sweep head sits right now.
  const pctNow = pctStart + (pctTarget - pctStart) * t;

  const shownScore =
    score == null ? null : Math.round(start + (score - start) * t);

  const w = 320;
  const h = 200;
  const cx = w / 2;
  const cy = 170;
  const rOuter = 146;
  const rInner = 116;

  const ticks = Array.from({ length: TICKS }, (_, i) => {
    const tickT = i / (TICKS - 1);
    const deg = START + tickT * SWEEP;
    // Ticks light up as the sweep head passes them.
    const on = tickT <= pctNow;
    // Ticks lengthen slightly toward the active head for a sense of travel.
    const inner = rInner + (on ? 0 : 6);
    const a = polar(cx, cy, inner, deg);
    const b = polar(cx, cy, rOuter, deg);
    return { i, a, b, on, color: tickColor(tickT) };
  });

  return (
    <div className={className}>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        width={size}
        height={(size * h) / w}
        role="img"
        aria-label={
          score == null
            ? "Credit score not yet available"
            : `Credit score ${score} on a ${min} to ${max} scale`
        }
      >
        {ticks.map((tick) => (
          <line
            key={tick.i}
            x1={tick.a.x}
            y1={tick.a.y}
            x2={tick.b.x}
            y2={tick.b.y}
            stroke={tick.color}
            strokeWidth={3}
            strokeLinecap="round"
            opacity={tick.on ? 1 : 0.16}
          />
        ))}

        {/* Score sits inside the SVG so it can never collide with the arc or
            the endpoint labels, regardless of rendered size. */}
        <text
          x={cx}
          y={cy - 16}
          textAnchor="middle"
          className="font-mono"
          fontSize={54}
          fontWeight={600}
          letterSpacing="-2"
          fill="var(--ink)"
        >
          {shownScore ?? "—"}
        </text>

        {/* Range endpoints, set small and quiet — they orient without competing. */}
        <text x={14} y={h - 6} fontSize={13} fill="#8fa3ba" fontWeight={500}>
          {min}
        </text>
        <text x={w - 14} y={h - 6} fontSize={13} fill="#8fa3ba" fontWeight={500} textAnchor="end">
          {max}
        </text>
      </svg>

      {(label || delta != null) && (
        <div className="mt-1.5 flex items-center justify-center gap-2 text-[13px]">
          {label && <span className="text-[var(--muted)]">{label}</span>}
          {delta != null && (
            <span
              // Lands after the sweep settles instead of sitting beside a
              // moving number. Opacity-only, per the animation rules.
              style={{ opacity: t >= 1 ? 1 : 0 }}
              className={`transition-opacity duration-200 motion-reduce:transition-none ${
                delta >= 0
                  ? "rounded-full bg-[#e6f5ef] px-2 py-0.5 font-semibold text-[var(--teal-deep)]"
                  : "rounded-full bg-[#fbeaea] px-2 py-0.5 font-semibold text-[#a94848]"
              }`}
            >
              {delta >= 0 ? "▲" : "▼"} {Math.abs(delta)} pts
            </span>
          )}
        </div>
      )}
    </div>
  );
}
