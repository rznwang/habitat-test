"use client";

import { deleteFamilyPhoto } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function PhotoCard({
  photo,
  currentUserId,
}: {
  photo: {
    id: string;
    image_url: string;
    caption: string | null;
    created_at: string;
    user_id: string;
    users?: { id: string; display_name?: string; avatar_url?: string } | null;
  };
  currentUserId: string;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const isOwner = photo.user_id === currentUserId;
  const name = photo.users?.display_name ?? "Unknown";

  async function handleDelete() {
    if (!confirm("Delete this photo?")) return;
    setDeleting(true);
    await deleteFamilyPhoto(photo.id);
    router.refresh();
  }

  return (
    <div className="rounded-[16px] border border-latte bg-linen overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photo.image_url}
        alt={photo.caption ?? "Family photo"}
        className="w-full aspect-[4/5] object-cover"
      />
      <div className="p-3">
        {photo.caption && (
          <p className="text-[14px] text-bark mb-1">{photo.caption}</p>
        )}
        <div className="flex items-center justify-between">
          <p className="text-[12px] text-clay">
            {name} &middot;{" "}
            {new Date(photo.created_at).toLocaleDateString()}
          </p>
          {isOwner && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="text-[12px] text-clay hover:text-red-600 transition-colors cursor-pointer disabled:opacity-50"
            >
              {deleting ? "…" : "Delete"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
