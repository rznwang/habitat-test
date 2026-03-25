"use client";

import { startSprint } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function StartSprintButton({
  familyId,
  themeId,
}: {
  familyId: string;
  themeId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleStart() {
    setLoading(true);
    const result = await startSprint(familyId, themeId);
    if (result?.error) {
      alert(result.error);
      setLoading(false);
    } else {
      router.push("/dashboard/sprint");
      router.refresh();
    }
  }

  return (
    <button
      onClick={handleStart}
      disabled={loading}
      className="h-9 rounded-[8px] bg-umber px-4 text-[13px] font-medium text-cream hover:bg-bark transition-colors disabled:opacity-50 cursor-pointer shrink-0"
    >
      {loading ? "Starting…" : "Start"}
    </button>
  );
}
