"use client";

import { submitResponse } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ResponseForm({
  sprintId,
  activityId,
  activityType,
  isAnonymous,
}: {
  sprintId: string;
  activityId: string;
  activityType: string;
  isAnonymous: boolean;
}) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const responseType =
    activityType === "photo"
      ? "image"
      : activityType === "voice"
        ? "audio"
        : activityType === "draw"
          ? "drawing"
          : "text";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    setError(null);

    const result = await submitResponse(
      sprintId,
      activityId,
      responseType,
      content.trim(),
      isAnonymous
    );

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setContent("");
      router.refresh();
    }
  }

  const placeholders: Record<string, string> = {
    question: "Type your answer…",
    photo: "Paste an image URL…",
    poll: "Type your vote…",
    dare: "Describe what you did…",
    draw: "Describe your drawing…",
    story: "Continue the story…",
    confession: "Share anonymously…",
    voice: "Paste an audio URL…",
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[16px] border border-latte bg-linen p-4 flex flex-col gap-3"
    >
      <label className="text-[12px] font-medium text-clay uppercase tracking-[0.04em]">
        Your response
        {isAnonymous && (
          <span className="ml-2 normal-case text-olive">🤫 Anonymous</span>
        )}
      </label>

      {responseType === "text" || responseType === "drawing" ? (
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholders[activityType] ?? "Type your response…"}
          rows={3}
          required
          className="w-full rounded-[10px] border border-latte bg-cream px-4 py-3 text-bark placeholder:text-clay focus:outline-none focus:ring-2 focus:ring-umber resize-none"
        />
      ) : (
        <input
          type="url"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholders[activityType] ?? "Paste URL…"}
          required
          className="h-12 w-full rounded-[10px] border border-latte bg-cream px-4 text-bark placeholder:text-clay focus:outline-none focus:ring-2 focus:ring-umber"
        />
      )}

      {error && <p className="text-sm text-red-700">{error}</p>}

      <button
        type="submit"
        disabled={loading || !content.trim()}
        className="self-end h-10 rounded-[10px] bg-umber px-5 text-[14px] font-semibold text-cream hover:bg-bark transition-colors disabled:opacity-50 cursor-pointer"
      >
        {loading ? "Submitting…" : "Submit"}
      </button>
    </form>
  );
}
