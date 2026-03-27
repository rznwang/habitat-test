"use client";

import { useState, useEffect } from "react";

export default function ChallengeIntroModal({
  weekNumber,
  title,
  introText,
  icon,
}: {
  weekNumber: number;
  title: string;
  introText: string;
  icon: string;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const key = `challenge-intro-week-${weekNumber}`;
    const dismissed = sessionStorage.getItem(key);
    if (!dismissed) {
      setOpen(true);
    }
  }, [weekNumber]);

  function dismiss() {
    const key = `challenge-intro-week-${weekNumber}`;
    sessionStorage.setItem(key, "1");
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-night/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-[20px] bg-cream border border-latte shadow-[0_8px_32px_rgba(74,63,53,0.15)] p-6 flex flex-col gap-4 animate-in fade-in zoom-in-95">
        {/* Icon */}
        <div className="text-center text-5xl">{icon}</div>

        {/* Week badge */}
        <div className="flex justify-center">
          <span className="inline-flex items-center rounded-full bg-sage/20 px-3 py-1 text-[12px] font-semibold text-olive">
            Week {weekNumber}
          </span>
        </div>

        {/* Title */}
        <h2 className="font-display text-xl font-semibold text-night text-center leading-snug">
          {title}
        </h2>

        {/* Intro text */}
        <p className="text-[14px] text-bark leading-[1.7] text-center">
          {introText}
        </p>

        {/* CTA */}
        <button
          onClick={dismiss}
          className="mt-2 h-12 w-full rounded-[12px] bg-umber text-cream text-[15px] font-semibold hover:bg-bark transition-colors cursor-pointer"
        >
          Begin! 🚀
        </button>
      </div>
    </div>
  );
}
