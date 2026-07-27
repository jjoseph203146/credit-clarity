const RADIUS = 54;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function ScoreRing({
  score,
  max = 100,
  size = 116,
}: {
  score: number;
  max?: number;
  size?: number;
}) {
  const pct = Math.min(1, Math.max(0, score / max));
  const dashOffset = CIRCUMFERENCE * (1 - pct);

  return (
    <svg width={size} height={size} viewBox="0 0 128 128" role="img" aria-label={`Clarity Score ${score} of ${max}`}>
      <circle cx="64" cy="64" r={RADIUS} fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="10" />
      <circle
        cx="64"
        cy="64"
        r={RADIUS}
        fill="none"
        stroke="var(--mint)"
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={CIRCUMFERENCE}
        strokeDashoffset={dashOffset}
        transform="rotate(-90 64 64)"
      />
      <text
        x="64"
        y="60"
        textAnchor="middle"
        fill="#fff"
        fontSize="30"
        fontWeight="700"
        className="font-[family-name:var(--font-jetbrains-mono)]"
      >
        {score}
      </text>
      <text x="64" y="80" textAnchor="middle" fill="#8fa3ba" fontSize="12">
        / {max}
      </text>
    </svg>
  );
}
