import { redirect } from "next/navigation";
import Link from "next/link";
import {
  getCurrentUser,
  getUserFamily,
  getActiveSprint,
  getSprintActivities,
  getSprintResponses,
  getWeekProgressionStatus,
} from "@/lib/queries";
import { WeekProgressionPanel } from "./week-progression-panel";

export default async function SprintPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const membership = await getUserFamily(user.id);
  if (!membership?.families) redirect("/dashboard");

  const family = membership.families as { id: string; name: string };
  const sprint = await getActiveSprint(family.id);

  if (!sprint) {
    return (
      <div className="flex flex-col items-center gap-6 py-12">
        <h1 className="font-display text-2xl font-semibold text-night">
          No active sprint
        </h1>
        <p className="text-clay text-[14px] text-center max-w-sm">
          Start a 6-week sprint to unlock weekly activities for your family.
        </p>
        <Link
          href="/dashboard/sprint/new"
          className="flex h-11 items-center rounded-[12px] bg-umber px-6 text-cream text-[14px] font-semibold hover:bg-bark transition-colors"
        >
          Choose a theme
        </Link>
      </div>
    );
  }

  const activities = await getSprintActivities(sprint.theme_id);
  const responses = await getSprintResponses(sprint.id);

  // Use explicit current_week from sprint (progression-based, not time-based)
  const currentWeek = sprint.current_week ?? 1;

  // Get progression status for current week
  const progression = await getWeekProgressionStatus(
    sprint.id,
    family.id,
    sprint.theme_id,
    currentWeek
  );

  // Group activities by week
  const weeks = Array.from({ length: 6 }, (_, i) => i + 1);

  // Map responses by activity
  const responsesByActivity = new Map<string, number>();
  for (const r of responses) {
    responsesByActivity.set(
      r.activity_id,
      (responsesByActivity.get(r.activity_id) ?? 0) + 1
    );
  }

  // Check if user already responded
  const userResponsedActivities = new Set(
    responses.filter((r) => r.user_id === user.id).map((r) => r.activity_id)
  );

  const activityTypeIcons: Record<string, string> = {
    question: "💬",
    photo: "📷",
    poll: "📊",
    dare: "🎯",
    draw: "🎨",
    story: "📖",
    confession: "🤫",
    voice: "🎤",
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Sprint header */}
      <div>
        <p className="text-[12px] font-medium text-clay uppercase tracking-[0.04em]">
          Active Sprint
        </p>
        <h1 className="font-display text-2xl font-semibold text-night mt-1">
          {sprint.sprint_themes?.icon} {sprint.sprint_themes?.name}
        </h1>
        <p className="text-clay text-[14px] mt-1">
          Week {currentWeek} of 6 •{" "}
          {sprint.sprint_themes?.description}
        </p>
      </div>

      {/* Sprint progress (week-based) */}
      <div className="h-2 w-full rounded-full bg-linen overflow-hidden">
        <div
          className="h-full rounded-full bg-sage transition-all duration-500"
          style={{ width: `${Math.min(((currentWeek - 1) / 6) * 100, 100)}%` }}
        />
      </div>

      {/* Weeks */}
      {weeks.map((week) => {
        const weekActivities = activities.filter(
          (a) => a.week_number === week
        );
        const isUnlocked = week <= currentWeek;

        return (
          <div key={week} className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <h2 className="text-[13px] font-semibold text-night">
                Week {week}
              </h2>
              {!isUnlocked && (
                <span className="text-[11px] text-clay bg-linen px-2 py-0.5 rounded-full">
                  🔒 Locked
                </span>
              )}
              {isUnlocked && week === currentWeek && (
                <span className="text-[11px] text-olive bg-sage/20 px-2 py-0.5 rounded-full">
                  Current
                </span>
              )}
            </div>

            {weekActivities.map((activity) => {
              const respCount =
                responsesByActivity.get(activity.id) ?? 0;
              const userDone = userResponsedActivities.has(activity.id);

              return (
                <Link
                  key={activity.id}
                  href={
                    isUnlocked
                      ? `/dashboard/sprint/activity/${activity.id}?sprint=${sprint.id}`
                      : "#"
                  }
                  className={`flex items-center gap-3 rounded-[14px] border p-4 transition-all ${
                    isUnlocked
                      ? "border-latte bg-linen hover:shadow-[0_2px_8px_rgba(74,63,53,0.06)] cursor-pointer"
                      : "border-latte/50 bg-linen/50 opacity-50 cursor-not-allowed"
                  }`}
                >
                  <span className="text-xl">
                    {activityTypeIcons[activity.type] ?? "📌"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-medium text-night truncate">
                      {activity.prompt}
                    </p>
                    <p className="text-[12px] text-clay mt-0.5">
                      {activity.type} •{" "}
                      {respCount} response{respCount !== 1 ? "s" : ""}
                      {activity.is_anonymous && " • anonymous"}
                    </p>
                  </div>
                  {userDone && (
                    <span className="text-sage text-lg">✓</span>
                  )}
                </Link>
              );
            })}

            {weekActivities.length === 0 && (
              <p className="text-[13px] text-clay/60 italic pl-1">
                No activities for this week yet
              </p>
            )}

            {/* Show progression panel for the current week */}
            {week === currentWeek && (
              <WeekProgressionPanel
                sprintId={sprint.id}
                weekNumber={currentWeek}
                currentUserId={user.id}
                memberStatus={progression.memberStatus.map((m) => {
                  const u = m.user as unknown as { id: string; display_name: string | null; avatar_url: string | null } | null;
                  return {
                    userId: m.userId,
                    displayName: u?.display_name ?? null,
                    avatarUrl: u?.avatar_url ?? null,
                    completedCount: m.completedCount,
                    totalActivities: progression.totalActivities,
                    completedAll: m.completedAll,
                    hasVoted: m.hasVoted,
                  };
                })}
                totalActivities={progression.totalActivities}
                allCompleted={progression.allCompleted}
                allVoted={progression.allVoted}
                canAdvance={progression.canAdvance}
                isCurrentWeek={true}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
