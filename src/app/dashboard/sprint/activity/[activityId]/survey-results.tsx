interface SurveyResultsProps {
  aggregated: Record<string, Record<string, number>>;
  totalResponses: number;
}

const QUESTION_LABELS: Record<string, string> = {
  party_type: "Soort feest",
  mood: "Sfeer",
  location: "Locatie",
  indoor_outdoor: "Binnen/buiten",
  venue: "Thuis of op verplaatsing",
  menu_essentials: "Op het menu",
  potluck: "Iedereen brengt iets mee",
  budget_friendly: "Budgetvriendelijk",
  activities: "Activiteiten",
  preferred_date: "Voorkeursdatum",
  help_organize: "Helpen met",
  dresscode: "Dresscode",
  start_tradition: "Familietraditie starten",
  unforgettable: "Onvergetelijk maken",
};

export default function SurveyResults({
  aggregated,
  totalResponses,
}: SurveyResultsProps) {
  if (totalResponses === 0) {
    return (
      <p className="text-clay text-[14px] py-4 text-center">
        Nog geen antwoorden ontvangen.
      </p>
    );
  }

  return (
    <div className="rounded-[16px] border border-latte bg-linen p-4 flex flex-col gap-5">
      <div>
        <p className="text-[12px] font-medium text-clay uppercase tracking-[0.04em]">
          Resultaten
        </p>
        <p className="text-[13px] text-clay mt-0.5">
          {totalResponses} familieli{totalResponses !== 1 ? "eden" : "d"} {totalResponses !== 1 ? "hebben" : "heeft"} geantwoord
        </p>
      </div>

      {Object.entries(aggregated).map(([key, counts]) => {
        const label = QUESTION_LABELS[key] ?? key;
        const entries = Object.entries(counts).sort(([, a], [, b]) => b - a);
        const maxCount = entries.length > 0 ? entries[0][1] : 0;

        return (
          <div key={key} className="flex flex-col gap-1.5">
            <p className="text-[14px] font-medium text-night">{label}</p>
            {entries.map(([value, count]) => {
              const percentage = totalResponses > 0 ? (count / totalResponses) * 100 : 0;
              const isTop = count === maxCount;

              return (
                <div key={value} className="flex flex-col gap-0.5">
                  <div className="flex items-center justify-between text-[13px]">
                    <span className={isTop ? "font-medium text-night" : "text-bark"}>
                      {isTop && "⭐ "}{value}
                    </span>
                    <span className="text-clay">{count}×</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-latte/50 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isTop ? "bg-sage" : "bg-umber/40"
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
