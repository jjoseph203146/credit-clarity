"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type ToggleKey = "twoFa" | "emailNudge" | "smsNudge";

const SECURITY_ROWS: { key: ToggleKey; title: string; description: string }[] = [
  { key: "twoFa", title: "Two-factor authentication", description: "Code by SMS at each login" },
];

const NOTIFICATION_ROWS: { key: ToggleKey; title: string; description: string }[] = [
  {
    key: "emailNudge",
    title: "Email nudges",
    description: "Letter deadlines, plan reminders, re-upload windows",
  },
  { key: "smsNudge", title: "SMS reminders", description: "Only for time-critical deadlines" },
];

function ToggleSwitch({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onToggle}
      className={cn(
        "h-[26px] w-11 flex-none rounded-full p-[3px] transition-colors",
        on ? "bg-[var(--teal)]" : "bg-[#dbe3ec]",
      )}
    >
      <div
        className={cn(
          "h-5 w-5 rounded-full bg-white transition-transform",
          on ? "translate-x-[18px]" : "translate-x-0",
        )}
      />
    </button>
  );
}

// Security + notification-channel preferences. No `users` column backs these
// yet — this is local UI state only, same as the original prototype. The two
// groups never share a key, so each can hold its own independent state.
function ToggleGroup({ rows }: { rows: typeof SECURITY_ROWS }) {
  const [toggles, setToggles] = useState<Record<ToggleKey, boolean>>({
    twoFa: true,
    emailNudge: true,
    smsNudge: false,
  });
  const flip = (key: ToggleKey) => setToggles((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="flex flex-col gap-3.5">
      {rows.map((row) => (
        <div key={row.key} className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold">{row.title}</div>
            <div className="text-[12.5px] text-[var(--muted)]">{row.description}</div>
          </div>
          <ToggleSwitch on={toggles[row.key]} onToggle={() => flip(row.key)} />
        </div>
      ))}
    </div>
  );
}

export function SecuritySection() {
  return (
    <div className="flex flex-col gap-3.5">
      <ToggleGroup rows={SECURITY_ROWS} />
      <div className="text-[11.5px] leading-relaxed text-[var(--muted)]">
        We recommend using an authenticator app when available — SMS codes are better than
        nothing, but less resistant to interception.
      </div>
    </div>
  );
}

export function NotificationPreferences() {
  return <ToggleGroup rows={NOTIFICATION_ROWS} />;
}
