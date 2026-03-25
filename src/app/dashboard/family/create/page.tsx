"use client";

import { createFamily } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CreateFamilyPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const result = await createFamily(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
    // redirect happens in server action on success
  }

  return (
    <div className="flex flex-col items-center gap-6 py-8">
      <h1 className="font-display text-2xl font-semibold text-night">
        Create your family space
      </h1>
      <p className="text-clay text-[14px] text-center max-w-sm">
        Give your family a name. You can invite members after creating it.
      </p>

      <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col gap-4">
        <input
          name="name"
          type="text"
          placeholder="e.g. The Wilsons"
          required
          className="h-12 w-full rounded-[10px] border border-latte bg-linen px-4 text-bark placeholder:text-clay focus:outline-none focus:ring-2 focus:ring-umber"
        />

        {error && <p className="text-sm text-red-700">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="flex h-12 w-full items-center justify-center rounded-[12px] bg-umber px-4 text-cream text-[15px] font-semibold hover:bg-bark transition-colors disabled:opacity-50 cursor-pointer"
        >
          {loading ? "Creating…" : "Create family"}
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
