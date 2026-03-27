import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/queries";
import { getSprintSummary } from "@/lib/queries";

export default async function SprintSummaryPage({
  params,
}: {
  params: Promise<{ sprintId: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { sprintId } = await params;
  const summary = await getSprintSummary(sprintId);

  if (!summary) redirect("/dashboard/memory");

  const weekIcons: Record<number, string> = {
    1: "🏖️",
    2: "🗺️",
    3: "👶",
    4: "👨‍🍳",
    5: "🎬",
    6: "🎉",
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="text-center py-6">
        <p className="text-5xl mb-3">🎊</p>
        <h1 className="font-display text-3xl font-bold text-night">
          Gefeliciteerd!
        </h1>
        <p className="text-[15px] text-bark mt-2 max-w-md mx-auto leading-[1.7]">
          Jullie hebben de {summary.themeIcon} {summary.themeName} voltooid!
          Hier is een overzicht van alle mooie momenten.
        </p>
      </div>

      {/* Week summaries */}
      {summary.weeks.map((week) => (
        <div
          key={week.weekNumber}
          className="rounded-[16px] border border-latte bg-linen p-5 flex flex-col gap-3"
        >
          <div className="flex items-center gap-2">
            <span className="text-2xl">{weekIcons[week.weekNumber] ?? "📌"}</span>
            <div>
              <p className="text-[12px] font-medium text-clay uppercase tracking-[0.04em]">
                Week {week.weekNumber}
              </p>
              <h2 className="text-[17px] font-semibold text-night">
                {week.title}
              </h2>
            </div>
          </div>

          {/* Winning proposal */}
          {week.highlights.winningProposal && (
            <div className="rounded-[12px] bg-sage/10 border border-sage/30 p-3 flex flex-col gap-1">
              <p className="text-[12px] font-semibold text-olive">
                👑 Winnaar
              </p>
              <p className="text-[15px] font-semibold text-night">
                {week.highlights.winningProposal.title}
              </p>
              {week.highlights.winningProposal.description && (
                <p className="text-[13px] text-bark">
                  {week.highlights.winningProposal.description}
                </p>
              )}
              <p className="text-[12px] text-clay">
                Voorgesteld door {week.highlights.winningProposal.userName} •{" "}
                {week.highlights.winningProposal.voteCount} stemmen
              </p>
            </div>
          )}

          {/* Top responses */}
          {week.highlights.topResponses.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-[12px] font-medium text-clay uppercase tracking-[0.04em]">
                Mooiste bijdragen
              </p>
              {week.highlights.topResponses.map((resp, i) => (
                <div
                  key={i}
                  className="rounded-[10px] bg-cream border border-latte p-3"
                >
                  <p className="text-[13px] text-bark whitespace-pre-wrap line-clamp-3">
                    {resp.content}
                  </p>
                  <p className="text-[11px] text-clay mt-1">
                    {resp.userName}
                    {resp.reactionCount > 0 && ` • ${resp.reactionCount} reacties`}
                  </p>
                </div>
              ))}
            </div>
          )}

          {week.highlights.topResponses.length === 0 &&
            !week.highlights.winningProposal && (
              <p className="text-[13px] text-clay/50 italic">
                Geen bijdragen deze week
              </p>
            )}
        </div>
      ))}

      {/* Closing */}
      <div className="text-center py-6">
        <p className="text-[15px] text-bark max-w-md mx-auto leading-[1.7]">
          Wat een reis! Bedankt dat jullie als familie dichter bij elkaar zijn
          gekomen. Tot de volgende sprint! 💛
        </p>
      </div>
    </div>
  );
}
