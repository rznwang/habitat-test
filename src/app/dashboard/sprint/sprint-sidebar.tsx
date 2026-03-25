import { redirect } from "next/navigation";
import Link from "next/link";
import {
  getCurrentUser,
  getUserFamily,
  getActiveSprint,
  getSprintActivities,
  getSprintResponses,
} from "@/lib/queries";

export default async function SprintSidebar({
  currentActivityId,
  sprintId,
}: {
  currentActivityId?: string;
  sprintId: string;
}) {
  const user = await getCurrentUser();
  if (!user) return null;

  const membership = await getUserFamily(user.id);
  if (!membership?.families) return null;

  const family = membership.families as { id: string };
  const sprint = await getActiveSprint(family.id);
  if (!sprint || sprint.id !== sprintId) return null;

  const activities = await getSprintActivities(sprint.theme_id);
  const responses = await getSprintResponses(sprint.id);

  // Use explicit current_week from sprint (progression-based)
  const currentWeek = sprint.current_week ?? 1;
  const progress = Math.min(((currentWeek - 1) / 6) * 100, 100);

  const userRespondedSet = new Set(
    responses.filter((r) => r.user_id === user.id).map((r) => r.activity_id)
  );

  const responseCountMap = new Map<string, number>();
  for (const r of responses) {
    responseCountMap.set(
      r.activity_id,
      (responseCountMap.get(r.activity_id) ?? 0) + 1
    );
  }

  const typeIcons: Record<string, string> = {
    question: "💬",
    photo: "📷",
    poll: "📊",
    dare: "🎯",
    draw: "🎨",
    story: "📖",
    confession: "🤫",
    voice: "🎤",
  };

  const weeks = Array.from({ length: 6 }, (_, i) => i + 1);

  return (
    <aside className="w-72 shrink-0 hidden lg:flex flex-col gap-4 sticky top-[72px] h-[calc(100vh-88px)] overflow-y-auto pr-2 pb-8">
      {/* Sprint header */}
      <div>
        <Link
          href="/dashboard/sprint"
          className="text-[11px] font-medium text-clay hover:text-bark transition-colors uppercase tracking-[0.04em]"
        >
          ← Sprint overview
        </Link>
        <p className="text-[15px] font-semibold text-night mt-2">
          {sprint.sprint_themes?.icon} {sprint.sprint_themes?.name}
        </p>
        <p className="text-[11px] text-clay mt-0.5">
          Week {currentWeek}/6 • {Math.round(progress)}%
        </p>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 w-full rounded-full bg-linen overflow-hidden">
        <div
          className="h-full rounded-full bg-sage transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Week list */}
      <nav className="flex flex-col gap-3">
        {weeks.map((week) => {
          const weekActivities = activities.filter(
            (a) => a.week_number === week
          );
          const isUnlocked = week <= currentWeek;

          return (
            <div key={week} className="flex flex-col gap-1">
              <p
                className={`text-[11px] font-semibold uppercase tracking-[0.04em] ${
                  !isUnlocked
                    ? "text-clay/40"
                    : week === currentWeek
                      ? "text-olive"
                      : "text-clay"
                }`}
              >
                Week {week}
                {!isUnlocked && " 🔒"}
                {week === currentWeek && " •"}
              </p>

              {weekActivities.map((activity) => {
                const isCurrent = activity.id === currentActivityId;
                const userDone = userRespondedSet.has(activity.id);
                const count = responseCountMap.get(activity.id) ?? 0;

                return (
                  <Link
                    key={activity.id}
                    href={
                      isUnlocked
                        ? `/dashboard/sprint/activity/${activity.id}?sprint=${sprintId}`
                        : "#"
                    }
                    className={`flex items-center gap-2 rounded-[10px] px-2.5 py-2 text-[12px] transition-all ${
                      isCurrent
                        ? "bg-sage/15 border border-sage/30 text-night font-medium"
                        : isUnlocked
                          ? "hover:bg-linen text-bark"
                          : "text-clay/40 cursor-not-allowed"
                    }`}
                  >
                    <span className="text-sm shrink-0">
                      {typeIcons[activity.type] ?? "📌"}
                    </span>
                    <span className="truncate flex-1">{activity.prompt}</span>
                    <span className="shrink-0 flex items-center gap-1">
                      {count > 0 && (
                        <span className="text-[10px] text-clay">{count}</span>
                      )}
                      {userDone && <span className="text-sage text-xs">✓</span>}
                    </span>
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
