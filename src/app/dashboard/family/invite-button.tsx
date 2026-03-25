"use client";

import { createInvite } from "@/lib/actions";
import { useState } from "react";

export default function InviteButton({ familyId }: { familyId: string }) {
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleCreate() {
    setLoading(true);
    const result = await createInvite(familyId);
    if (result.token) {
      const link = `${window.location.origin}/dashboard/family/join?token=${result.token}`;
      setInviteLink(link);
    }
    setLoading(false);
  }

  async function handleCopy() {
    if (!inviteLink) return;
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (inviteLink) {
    return (
      <div className="flex items-center gap-2">
        <input
          readOnly
          value={inviteLink}
          className="h-9 rounded-[8px] border border-latte bg-cream px-3 text-[12px] text-bark w-56 truncate"
        />
        <button
          onClick={handleCopy}
          className="h-9 rounded-[8px] bg-sage px-3 text-[12px] font-medium text-cream hover:bg-olive transition-colors cursor-pointer"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleCreate}
      disabled={loading}
      className="h-9 rounded-[8px] bg-umber px-4 text-[13px] font-medium text-cream hover:bg-bark transition-colors disabled:opacity-50 cursor-pointer"
    >
      {loading ? "…" : "Invite member"}
    </button>
  );
}
