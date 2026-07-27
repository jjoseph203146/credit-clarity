"use client";

import { useState, useTransition } from "react";
import { NotificationRow } from "@/components/app/notification-row";
import type { Tone } from "@/lib/demo-data";
import type { Notification, NotificationKind } from "@/lib/supabase/types";
import { markNotificationRead, markAllNotificationsRead } from "@/app/(app)/notifications/actions";

const KIND_ICON: Record<NotificationKind, string> = {
  deadline: "✉",
  task_overdue: "!",
  reupload_window: "↻",
  payment: "$",
  system: "✓",
};

const KIND_TONE: Record<NotificationKind, Tone> = {
  deadline: "good",
  task_overdue: "warn",
  reupload_window: "neutral",
  payment: "neutral",
  system: "good",
};

function relativeTime(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 60) return `${Math.max(minutes, 0)}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.round(days / 7);
  return `${weeks}w ago`;
}

interface NotificationListProps {
  notifications: Notification[];
}

export function NotificationList({ notifications: initial }: NotificationListProps) {
  const [notifications, setNotifications] = useState(initial);
  const [isPending, startTransition] = useTransition();

  const unread = notifications.filter((n) => !n.read_at);
  const allRead = notifications.length === 0 || unread.length === 0;

  const handleRowClick = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read_at: n.read_at ?? new Date().toISOString() } : n)),
    );
    startTransition(() => {
      void markNotificationRead(id);
    });
  };

  const handleMarkAll = () => {
    const now = new Date().toISOString();
    setNotifications((prev) => prev.map((n) => ({ ...n, read_at: n.read_at ?? now })));
    startTransition(() => {
      void markAllNotificationsRead();
    });
  };

  return (
    <div className="max-w-[760px] px-9 pb-[72px] pt-7">
      <div className="mb-5 flex items-end justify-between">
        <h1 className="text-2xl font-semibold tracking-[-.02em]">Notifications</h1>
        {!allRead && (
          <button
            type="button"
            onClick={handleMarkAll}
            disabled={isPending}
            className="text-[13px] font-semibold text-[var(--teal)] disabled:opacity-60"
          >
            Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 || allRead ? (
        <div className="rounded-[18px] border border-dashed border-[#c7d2df] bg-white px-8 py-14 text-center">
          <div className="mx-auto mb-3.5 flex h-[52px] w-[52px] items-center justify-center rounded-2xl bg-[#e6f5ef] text-xl font-bold text-[#0b7d5e]">
            ✓
          </div>
          <div className="mb-1 text-base font-semibold">All caught up</div>
          <div className="text-[13.5px] text-[var(--muted)]">
            We&apos;ll nudge you when a letter deadline, task, or re-upload window comes due.
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {notifications.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => handleRowClick(n.id)}
              className="w-full text-left"
              style={{ opacity: n.read_at ? 0.55 : 1 }}
            >
              <NotificationRow
                id={n.id}
                icon={n.kind ? KIND_ICON[n.kind] : "•"}
                tone={n.kind ? KIND_TONE[n.kind] : "neutral"}
                title={n.title}
                description={n.body ?? ""}
                when={relativeTime(n.created_at)}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
