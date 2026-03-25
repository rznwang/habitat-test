"use client";

import { uploadFamilyPhoto, addFamilyPhoto } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

export default function PhotoUploadForm({ familyId }: { familyId: string }) {
  const router = useRouter();
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.type)) {
      setError("Only JPEG, PNG, WebP, and GIF images are allowed");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5 MB");
      return;
    }

    setError(null);
    setPhotoFile(file);
    const url = URL.createObjectURL(file);
    setPhotoPreview(url);
  }

  function clearPhoto() {
    setPhotoFile(null);
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!photoFile) {
      setError("Please select a photo");
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("photo", photoFile);
    const uploadResult = await uploadFamilyPhoto(formData);

    if (uploadResult.error) {
      setError(uploadResult.error);
      setLoading(false);
      return;
    }

    const result = await addFamilyPhoto(
      familyId,
      uploadResult.url!,
      caption || null
    );

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      clearPhoto();
      setCaption("");
      setLoading(false);
      router.refresh();
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[16px] border border-latte bg-linen p-4 flex flex-col gap-3"
    >
      <label className="text-[12px] font-medium text-clay uppercase tracking-[0.04em]">
        Add a photo
      </label>

      {photoPreview ? (
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photoPreview}
            alt="Photo preview"
            className="w-full max-h-64 object-cover rounded-[10px] border border-latte"
          />
          <button
            type="button"
            onClick={clearPhoto}
            className="absolute top-2 right-2 h-7 w-7 rounded-full bg-night/60 text-cream flex items-center justify-center text-sm hover:bg-night/80 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="h-24 rounded-[10px] border-2 border-dashed border-latte bg-cream flex flex-col items-center justify-center gap-1 text-clay hover:border-umber hover:text-umber transition-colors cursor-pointer"
        >
          <span className="text-2xl">📸</span>
          <span className="text-[12px] font-medium">Choose or take a photo</span>
        </button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        capture="environment"
        onChange={handlePhotoSelect}
        className="hidden"
      />

      <input
        type="text"
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        placeholder="Add a caption (optional)"
        maxLength={300}
        className="h-10 w-full rounded-[10px] border border-latte bg-cream px-4 text-[14px] text-bark placeholder:text-clay focus:outline-none focus:ring-2 focus:ring-umber"
      />

      {error && <p className="text-sm text-red-700">{error}</p>}

      <button
        type="submit"
        disabled={loading || !photoFile}
        className="self-end h-10 rounded-[10px] bg-umber px-5 text-[14px] font-semibold text-cream hover:bg-bark transition-colors disabled:opacity-50 cursor-pointer"
      >
        {loading ? "Uploading…" : "Upload"}
      </button>
    </form>
  );
}
