"use client";

import { updateProfile } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ProfileForm({
  currentName,
}: {
  currentName: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSaved(false);

    const formData = new FormData(e.currentTarget);
    const result = await updateProfile(formData);
    if (result?.error) {
      setError(result.error);
    } else {
      setSaved(true);
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-sm flex flex-col gap-4"
    >
      <label className="text-[12px] font-medium text-clay uppercase tracking-[0.04em]">
        Display name
      </label>
      <input
        name="display_name"
        type="text"
        defaultValue={currentName}
        required
        className="h-12 w-full rounded-[10px] border border-latte bg-linen px-4 text-bark placeholder:text-clay focus:outline-none focus:ring-2 focus:ring-umber"
      />

      {error && <p className="text-sm text-red-700">{error}</p>}
      {saved && (
        <p className="text-sm text-olive">Profile updated!</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="flex h-12 w-full items-center justify-center rounded-[12px] bg-umber px-4 text-cream text-[15px] font-semibold hover:bg-bark transition-colors disabled:opacity-50 cursor-pointer"
      >
        {loading ? "Saving…" : "Save"}
      </button>
    </form>
  );
}
