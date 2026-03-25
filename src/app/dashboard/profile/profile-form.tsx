"use client";

import { updateProfile, uploadAvatar } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

interface ProfileFormProps {
  currentName: string;
  currentBio: string;
  currentAvatarUrl: string | null;
  families: { id: string; name: string; role: string }[];
}

export default function ProfileForm({
  currentName,
  currentBio,
  currentAvatarUrl,
  families,
}: ProfileFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(currentAvatarUrl);
  const [uploading, setUploading] = useState(false);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("avatar", file);
    const result = await uploadAvatar(formData);

    if (result?.error) {
      setError(result.error);
    } else if (result?.url) {
      setAvatarUrl(result.url);
    }
    setUploading(false);
    router.refresh();
  }

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

  const initials = (currentName || "?")[0]?.toUpperCase();

  return (
    <div className="w-full max-w-sm flex flex-col gap-6">
      {/* Avatar */}
      <div className="flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="relative h-24 w-24 rounded-full overflow-hidden border-2 border-latte bg-linen hover:border-umber transition-colors cursor-pointer group"
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Profile photo"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-sage/30 text-2xl font-semibold text-olive">
              {initials}
            </div>
          )}
          <div className="absolute inset-0 bg-bark/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-cream"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleAvatarChange}
          className="hidden"
        />
        <p className="text-[12px] text-clay">
          {uploading ? "Uploading…" : "Click to change photo"}
        </p>
      </div>

      {/* Profile form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
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
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-medium text-clay uppercase tracking-[0.04em]">
            About you
          </label>
          <textarea
            name="bio"
            defaultValue={currentBio}
            rows={3}
            maxLength={300}
            placeholder="A short description about yourself…"
            className="w-full rounded-[10px] border border-latte bg-linen px-4 py-3 text-bark placeholder:text-clay focus:outline-none focus:ring-2 focus:ring-umber resize-none"
          />
          <p className="text-[11px] text-clay text-right">Max 300 characters</p>
        </div>

        {error && <p className="text-sm text-red-700">{error}</p>}
        {saved && <p className="text-sm text-olive">Profile updated!</p>}

        <button
          type="submit"
          disabled={loading}
          className="flex h-12 w-full items-center justify-center rounded-[12px] bg-umber px-4 text-cream text-[15px] font-semibold hover:bg-bark transition-colors disabled:opacity-50 cursor-pointer"
        >
          {loading ? "Saving…" : "Save"}
        </button>
      </form>

      {/* Family groups */}
      <div className="flex flex-col gap-3">
        <h2 className="text-[12px] font-medium text-clay uppercase tracking-[0.04em]">
          Family groups
        </h2>
        {families.length === 0 ? (
          <p className="text-[14px] text-clay">
            You haven&apos;t joined any family groups yet.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {families.map((f) => (
              <div
                key={f.id}
                className="flex items-center justify-between rounded-[12px] border border-latte bg-linen px-4 py-3"
              >
                <span className="text-[15px] font-medium text-night">
                  {f.name}
                </span>
                <span className="text-[11px] bg-sage/20 text-olive px-2 py-0.5 rounded-full capitalize">
                  {f.role}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
