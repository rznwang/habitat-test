"use client";

import { submitSurveyResponse } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface SurveyQuestion {
  key: string;
  label: string;
  type: "single" | "multi" | "text";
  options?: string[];
}

// Survey config for each Week 6 activity (by sort_order)
const SURVEY_SECTIONS: Record<number, { title: string; questions: SurveyQuestion[] }> = {
  1: {
    title: "Thema & Sfeer",
    questions: [
      {
        key: "party_type",
        label: "Welk soort familiefeest wil je?",
        type: "single",
        options: [
          "Gezellig en klassiek",
          "Creatief en origineel",
          "Spelletjesnamiddag",
          "Barbecue",
          "Picknick",
          "Verkleedfeest",
          "Anders",
        ],
      },
      {
        key: "mood",
        label: "Welke sfeer past het best?",
        type: "single",
        options: ["Ontspannen", "Feestelijk", "Actief", "Nostalgisch", "Culinair"],
      },
    ],
  },
  2: {
    title: "Locatie & Eten",
    questions: [
      {
        key: "location",
        label: "Waar zou je het familiefeest willen houden?",
        type: "text",
      },
      {
        key: "indoor_outdoor",
        label: "Binnen of buiten?",
        type: "single",
        options: ["Binnen", "Buiten", "Beide / maakt niet uit"],
      },
      {
        key: "venue",
        label: "Bij iemand thuis of op verplaatsing?",
        type: "single",
        options: ["Bij iemand thuis", "Op verplaatsing", "Maakt niet uit"],
      },
      {
        key: "menu_essentials",
        label: "Wat mag zeker niet ontbreken op het menu?",
        type: "text",
      },
      {
        key: "potluck",
        label: "Wil je dat iedereen iets meebrengt?",
        type: "single",
        options: ["Ja", "Nee", "Maakt niet uit"],
      },
      {
        key: "budget_friendly",
        label: "Moet het budgetvriendelijk zijn?",
        type: "single",
        options: ["Ja, zeker", "Liever wel", "Maakt niet uit", "Nee, we pakken uit"],
      },
    ],
  },
  3: {
    title: "Activiteiten & Organisatie",
    questions: [
      {
        key: "activities",
        label: "Welke activiteiten wil je doen?",
        type: "multi",
        options: [
          "Quiz",
          "Wandeling",
          "Spelletjes",
          "Karaoke",
          "Kookmoment",
          "Herinneringen delen",
          "Fotohoekje",
          "Talentenshow",
        ],
      },
      {
        key: "preferred_date",
        label: "Welke datum of periode past voor jou?",
        type: "text",
      },
      {
        key: "help_organize",
        label: "Waarmee wil je helpen?",
        type: "multi",
        options: ["Eten", "Decoratie", "Muziek", "Spelletjes", "Foto/video", "Logistiek"],
      },
      {
        key: "dresscode",
        label: "Moeten we een dresscode hebben?",
        type: "single",
        options: ["Ja, leuk!", "Nee, liever niet", "Maakt niet uit"],
      },
      {
        key: "start_tradition",
        label: "Willen we een familietraditie starten?",
        type: "single",
        options: ["Ja!", "Misschien", "Nee"],
      },
      {
        key: "unforgettable",
        label: "Wat zou dit feest echt onvergetelijk maken?",
        type: "text",
      },
    ],
  },
};

export default function SurveyForm({
  sprintId,
  activityId,
  sortOrder,
}: {
  sprintId: string;
  activityId: string;
  sortOrder: number;
}) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const section = SURVEY_SECTIONS[sortOrder];
  if (!section) return null;

  function setSingleAnswer(key: string, value: string) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }

  function toggleMultiAnswer(key: string, value: string) {
    setAnswers((prev) => {
      const current = (prev[key] as string[]) ?? [];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [key]: next };
    });
  }

  function setTextAnswer(key: string, value: string) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await submitSurveyResponse(sprintId, activityId, answers);
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
      className="rounded-[16px] border border-latte bg-linen p-4 flex flex-col gap-5"
    >
      <div>
        <p className="text-[12px] font-medium text-clay uppercase tracking-[0.04em]">
          Feestvragenlijst
        </p>
        <h3 className="text-[15px] font-semibold text-night mt-1">
          {section.title}
        </h3>
      </div>

      {section.questions.map((q) => (
        <div key={q.key} className="flex flex-col gap-2">
          <label className="text-[14px] font-medium text-night">
            {q.label}
          </label>

          {q.type === "single" && q.options && (
            <div className="flex flex-wrap gap-2">
              {q.options.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setSingleAnswer(q.key, opt)}
                  className={`rounded-full px-4 py-2 text-[13px] border transition-colors cursor-pointer ${
                    answers[q.key] === opt
                      ? "bg-sage/20 border-sage/40 text-olive font-medium"
                      : "bg-cream border-latte text-bark hover:bg-sand/30"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}

          {q.type === "multi" && q.options && (
            <div className="flex flex-wrap gap-2">
              {q.options.map((opt) => {
                const selected = ((answers[q.key] as string[]) ?? []).includes(opt);
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => toggleMultiAnswer(q.key, opt)}
                    className={`rounded-full px-4 py-2 text-[13px] border transition-colors cursor-pointer ${
                      selected
                        ? "bg-sage/20 border-sage/40 text-olive font-medium"
                        : "bg-cream border-latte text-bark hover:bg-sand/30"
                    }`}
                  >
                    {selected ? "✓ " : ""}{opt}
                  </button>
                );
              })}
            </div>
          )}

          {q.type === "text" && (
            <textarea
              value={(answers[q.key] as string) ?? ""}
              onChange={(e) => setTextAnswer(q.key, e.target.value)}
              rows={2}
              className="w-full rounded-[10px] border border-latte bg-cream px-4 py-3 text-bark placeholder:text-clay focus:outline-none focus:ring-2 focus:ring-umber resize-none"
              placeholder="Typ je antwoord…"
            />
          )}
        </div>
      ))}

      {error && <p className="text-sm text-red-700">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="self-end h-10 rounded-[10px] bg-umber px-5 text-[14px] font-semibold text-cream hover:bg-bark transition-colors disabled:opacity-50 cursor-pointer"
      >
        {loading ? "Bezig…" : "Vul de feestvragenlijst in"}
      </button>
    </form>
  );
}
