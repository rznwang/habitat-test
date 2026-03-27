"use client";

import { submitProposal, uploadResponsePhoto } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

const TRIP_SUGGESTIONS = [
  "Wandeling van de Twee Kastelen in de Lessevallei in Dinant",
  "Wandeling naar het Zwin / Het Swin",
  "Bezoek aan de zoo",
  "Picknick in een natuurgebied",
  "Boottocht",
  "Fietstocht met afsluiter op een terras",
];

export default function ProposalForm({
  sprintId,
  activityId,
  showBudgetFields,
  showTripSuggestions,
}: {
  sprintId: string;
  activityId: string;
  showBudgetFields?: boolean;
  showTripSuggestions?: boolean;
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [budgetNote, setBudgetNote] = useState("");
  const [servings, setServings] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleSuggestionClick(suggestion: string) {
    setTitle(suggestion);
  }

  async function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.type)) {
      setError("Enkel JPEG, PNG, WebP en GIF afbeeldingen zijn toegestaan");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Afbeelding moet kleiner zijn dan 5 MB");
      return;
    }

    setError(null);
    setPhotoPreview(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append("photo", file);
    const result = await uploadResponsePhoto(formData);
    if (result.error) {
      setError(result.error);
      setPhotoPreview(null);
    } else {
      setPhotoUrl(result.url ?? null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.set("title", title.trim());
    formData.set("description", description.trim());
    if (photoUrl) formData.set("photo_url", photoUrl);
    if (linkUrl.trim()) formData.set("link_url", linkUrl.trim());
    if (budgetNote.trim()) formData.set("budget_note", budgetNote.trim());
    if (servings) formData.set("servings", servings);

    const result = await submitProposal(sprintId, activityId, formData);
    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.refresh();
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[16px] border border-latte bg-linen p-4 flex flex-col gap-3"
    >
      <label className="text-[12px] font-medium text-clay uppercase tracking-[0.04em]">
        Jouw voorstel
      </label>

      {/* Trip suggestions */}
      {showTripSuggestions && (
        <div className="flex flex-col gap-1.5">
          <p className="text-[12px] text-clay">💡 Inspiratie nodig? Klik op een idee:</p>
          <div className="flex flex-wrap gap-1.5">
            {TRIP_SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => handleSuggestionClick(s)}
                className="text-[12px] rounded-full border border-sage/30 bg-sage/10 px-3 py-1 text-olive hover:bg-sage/20 transition-colors cursor-pointer"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Title */}
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={showBudgetFields ? "Naam van het gerecht of menu…" : "Naam van de uitstap…"}
        required
        className="h-11 w-full rounded-[10px] border border-latte bg-cream px-4 text-bark placeholder:text-clay focus:outline-none focus:ring-2 focus:ring-umber"
      />

      {/* Description */}
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Korte beschrijving…"
        rows={3}
        className="w-full rounded-[10px] border border-latte bg-cream px-4 py-3 text-bark placeholder:text-clay focus:outline-none focus:ring-2 focus:ring-umber resize-none"
      />

      {/* Budget fields */}
      {showBudgetFields && (
        <>
          <textarea
            value={budgetNote}
            onChange={(e) => setBudgetNote(e.target.value)}
            placeholder="Waarom past dit binnen low budget?"
            rows={2}
            className="w-full rounded-[10px] border border-latte bg-cream px-4 py-3 text-bark placeholder:text-clay focus:outline-none focus:ring-2 focus:ring-umber resize-none"
          />
          <input
            type="number"
            value={servings}
            onChange={(e) => setServings(e.target.value)}
            placeholder="Voor hoeveel personen?"
            min={1}
            max={50}
            className="h-11 w-full rounded-[10px] border border-latte bg-cream px-4 text-bark placeholder:text-clay focus:outline-none focus:ring-2 focus:ring-umber"
          />
        </>
      )}

      {/* Link */}
      <input
        type="url"
        value={linkUrl}
        onChange={(e) => setLinkUrl(e.target.value)}
        placeholder="Link (optioneel)…"
        className="h-11 w-full rounded-[10px] border border-latte bg-cream px-4 text-bark placeholder:text-clay focus:outline-none focus:ring-2 focus:ring-umber"
      />

      {/* Photo */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="h-10 rounded-[10px] border border-dashed border-latte bg-cream px-4 text-[13px] text-clay hover:border-umber hover:text-umber transition-colors cursor-pointer"
        >
          📷 Foto toevoegen
        </button>
        {photoPreview && (
          <div className="h-10 w-10 rounded-[8px] overflow-hidden border border-latte">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photoPreview} alt="Preview" className="h-full w-full object-cover" />
          </div>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handlePhotoSelect}
        className="hidden"
      />

      {error && <p className="text-sm text-red-700">{error}</p>}

      <button
        type="submit"
        disabled={loading || !title.trim()}
        className="self-end h-10 rounded-[10px] bg-umber px-5 text-[14px] font-semibold text-cream hover:bg-bark transition-colors disabled:opacity-50 cursor-pointer"
      >
        {loading ? "Bezig…" : showBudgetFields ? "Stel jouw menu voor" : "Stel een uitstap voor"}
      </button>
    </form>
  );
}
