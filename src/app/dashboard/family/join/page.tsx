"use client";

import { acceptInvite } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function JoinFamilyPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result = await acceptInvite(token.trim());
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
    // redirect happens in server action on success
  }

  return (
    <div className="flex flex-col items-center gap-6 py-8">
      <h1 className="font-display text-2xl font-semibold text-night">
        Join a family
      </h1>
      <p className="text-clay text-[14px] text-center max-w-sm">
        Paste the invite code shared with you by a family member.
      </p>

      <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col gap-4">
        <input
          type="text"
          placeholder="Paste invite code"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          required
          className="h-12 w-full rounded-[10px] border border-latte bg-linen px-4 text-bark placeholder:text-clay focus:outline-none focus:ring-2 focus:ring-umber"
        />

        {error && <p className="text-sm text-red-700">{error}</p>}

        <button
          type="submit"
          disabled={loading || !token.trim()}
          className="flex h-12 w-full items-center justify-center rounded-[12px] bg-umber px-4 text-cream text-[15px] font-semibold hover:bg-bark transition-colors disabled:opacity-50 cursor-pointer"
        >
          {loading ? "Joining…" : "Join family"}
        </button>
      </form>

      <button
        onClick={() => router.back()}
        className="text-[13px] text-clay hover:text-bark transition-colors cursor-pointer"
      >
        ← Go back
      </button>
    </div>
  );
}
