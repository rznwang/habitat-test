"use client";

import { uploadFamilyPhoto, addFamilyPhoto } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import ImageCropper from "./image-cropper";

export default function PhotoUploadForm({ familyId }: { familyId: string }) {
  const router = useRouter();
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [rawImageUrl, setRawImageUrl] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

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
    // Open cropper with the raw image
    const url = URL.createObjectURL(file);
    setRawImageUrl(url);
    setShowCropper(true);
  }

  function handleCropDone(blob: Blob) {
    // Clean up raw image URL
    if (rawImageUrl) URL.revokeObjectURL(rawImageUrl);
    setRawImageUrl(null);
    setShowCropper(false);

    // Create a File from the cropped blob
    const croppedFile = new File([blob], "photo.jpg", { type: "image/jpeg" });
    setPhotoFile(croppedFile);
    const previewUrl = URL.createObjectURL(blob);
    setPhotoPreview(previewUrl);
  }

  function handleCropCancel() {
    if (rawImageUrl) URL.revokeObjectURL(rawImageUrl);
    setRawImageUrl(null);
    setShowCropper(false);
    // Reset file inputs
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  }

  function clearPhoto() {
    setPhotoFile(null);
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
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
    <>
      {showCropper && rawImageUrl && (
        <ImageCropper
          src={rawImageUrl}
          aspectRatio={4 / 5}
          onCrop={handleCropDone}
          onCancel={handleCropCancel}
        />
      )}

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
              className="w-full aspect-[4/5] object-cover rounded-[10px] border border-latte"
            />
            <div className="absolute top-2 right-2 flex gap-1.5">
              <button
                type="button"
                onClick={() => {
                  // Re-open cropper with the current preview
                  setRawImageUrl(photoPreview);
                  setShowCropper(true);
                }}
                className="h-7 w-7 rounded-full bg-night/60 text-cream flex items-center justify-center text-sm hover:bg-night/80 transition-colors cursor-pointer"
                title="Re-crop"
              >
                ✂
              </button>
              <button
                type="button"
                onClick={clearPhoto}
                className="h-7 w-7 rounded-full bg-night/60 text-cream flex items-center justify-center text-sm hover:bg-night/80 transition-colors cursor-pointer"
                title="Remove"
              >
                ✕
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="h-24 rounded-[10px] border-2 border-dashed border-latte bg-cream flex flex-col items-center justify-center gap-1 text-clay hover:border-umber hover:text-umber transition-colors cursor-pointer"
            >
              <span className="text-2xl">📷</span>
              <span className="text-[12px] font-medium">Take Photo</span>
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="h-24 rounded-[10px] border-2 border-dashed border-latte bg-cream flex flex-col items-center justify-center gap-1 text-clay hover:border-umber hover:text-umber transition-colors cursor-pointer"
            >
              <span className="text-2xl">🖼️</span>
              <span className="text-[12px] font-medium">Choose Photo</span>
            </button>
          </div>
        )}

        {/* Camera input — opens native camera on mobile */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handlePhotoSelect}
          className="hidden"
        />

        {/* Library input — opens photo library / file picker */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
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
    </>
  );
}
