"use client";

import { submitResponse, uploadResponsePhoto, uploadResponseVideo } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

export default function ResponseForm({
  sprintId,
  activityId,
  activityType,
  isAnonymous,
  showVideoUpload,
}: {
  sprintId: string;
  activityId: string;
  activityType: string;
  isAnonymous: boolean;
  showVideoUpload?: boolean;
}) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const responseType =
    showVideoUpload && videoFile
      ? "video"
      : activityType === "photo"
        ? "image"
        : activityType === "voice"
          ? "audio"
          : activityType === "draw"
            ? "drawing"
            : "text";

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

  function handleVideoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ["video/mp4", "video/webm", "video/quicktime"];
    if (!allowed.includes(file.type)) {
      setError("Enkel MP4, WebM en MOV video's zijn toegestaan");
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setError("Video moet kleiner zijn dan 50 MB");
      return;
    }

    setError(null);
    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
  }

  function clearVideo() {
    setVideoFile(null);
    if (videoPreview) URL.revokeObjectURL(videoPreview);
    setVideoPreview(null);
    if (videoInputRef.current) videoInputRef.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (responseType === "image") {
      if (!photoFile) {
        setError("Please take or select a photo");
        setLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append("photo", photoFile);
      const uploadResult = await uploadResponsePhoto(formData);

      if (uploadResult.error) {
        setError(uploadResult.error);
        setLoading(false);
        return;
      }

      const result = await submitResponse(
        sprintId,
        activityId,
        responseType,
        uploadResult.url!,
        isAnonymous
      );

      if (result?.error) {
        setError(result.error);
        setLoading(false);
      } else {
        clearPhoto();
        router.refresh();
      }
    } else if (responseType === "video") {
      if (!videoFile) {
        setError("Selecteer een video");
        setLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append("video", videoFile);
      const uploadResult = await uploadResponseVideo(formData);

      if (uploadResult.error) {
        setError(uploadResult.error);
        setLoading(false);
        return;
      }

      const result = await submitResponse(
        sprintId,
        activityId,
        "video",
        uploadResult.url!,
        isAnonymous
      );

      if (result?.error) {
        setError(result.error);
        setLoading(false);
      } else {
        clearVideo();
        router.refresh();
      }
    } else {
      if (!content.trim()) return;

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
  }

  const placeholders: Record<string, string> = {
    question: "Type your answer…",
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

      {responseType === "image" ? (
        <div className="flex flex-col gap-3">
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
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 h-24 rounded-[10px] border-2 border-dashed border-latte bg-cream flex flex-col items-center justify-center gap-1 text-clay hover:border-umber hover:text-umber transition-colors cursor-pointer"
              >
                <span className="text-2xl">📸</span>
                <span className="text-[12px] font-medium">Take Photo</span>
              </button>
              {showVideoUpload && (
                <button
                  type="button"
                  onClick={() => videoInputRef.current?.click()}
                  className="flex-1 h-24 rounded-[10px] border-2 border-dashed border-latte bg-cream flex flex-col items-center justify-center gap-1 text-clay hover:border-umber hover:text-umber transition-colors cursor-pointer"
                >
                  <span className="text-2xl">🎬</span>
                  <span className="text-[12px] font-medium">Upload Vlog</span>
                </button>
              )}
            </div>
          )}
          {videoPreview && (
            <div className="relative">
              <video
                src={videoPreview}
                controls
                className="w-full max-h-64 rounded-[10px] border border-latte bg-night"
              />
              <button
                type="button"
                onClick={clearVideo}
                className="absolute top-2 right-2 h-7 w-7 rounded-full bg-night/60 text-cream flex items-center justify-center text-sm hover:bg-night/80 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            capture="environment"
            onChange={handlePhotoSelect}
            className="hidden"
          />
          {showVideoUpload && (
            <input
              ref={videoInputRef}
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              onChange={handleVideoSelect}
              className="hidden"
            />
          )}
          {showVideoUpload && !videoPreview && !photoPreview && (
            <p className="text-[12px] text-clay text-center">
              💡 Tip: hou je vlog kort en spontaan (1-3 minuten)
            </p>
          )}
        </div>
      ) : responseType === "text" || responseType === "drawing" ? (
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
        disabled={loading || (responseType === "image" ? !photoFile : responseType === "video" ? !videoFile : !content.trim())}
        className="self-end h-10 rounded-[10px] bg-umber px-5 text-[14px] font-semibold text-cream hover:bg-bark transition-colors disabled:opacity-50 cursor-pointer"
      >
        {loading ? "Submitting…" : "Submit"}
      </button>
    </form>
  );
}
