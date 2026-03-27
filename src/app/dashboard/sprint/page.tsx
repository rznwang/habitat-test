import { redirect } from "next/navigation";
import Link from "next/link";
import {
  getCurrentUser,
  getUserFamily,
  getActiveSprint,
  getSprintActivities,
  getSprintResponses,
  getWeekProgressionStatus,
  getDisbandVoteStatus,
  getThemeWeeks,
} from "@/lib/queries";
import { WeekProgressionPanel } from "./week-progression-panel";
import { DisbandSprintPanel } from "./disband-sprint-panel";
import {
  WeekIcon,
  ActivityTypeIcon,
  CheckIcon,
  LockIcon,
  ArrowRightIcon,
  SparklesIcon,
} from "./icons";
import { FloatingLeaves, SoftBlob } from "./illustrations";

export default async function SprintPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const membership = await getUserFamily(user.id);
  if (!membership?.families) redirect("/dashboard");

  const family = membership.families as { id: string; name: string };
  const sprint = await getActiveSprint(family.id);

  if (!sprint) {
    return (
      <div className="relative flex flex-col items-center gap-6 py-16">
        <SoftBlob className="absolute -top-10 -right-10 w-60 h-60 opacity-50" />
        <SparklesIcon className="h-10 w-10 text-sage" />
        <h1 className="font-display text-2xl font-semibold text-night">
          No active sprint
        </h1>
        <p className="text-clay text-[14px] text-center max-w-sm">
          Start a 6-week sprint to unlock weekly activities for your family.
        </p>
        <Link
          href="/dashboard/sprint/new"
          className="flex h-11 items-center gap-2 rounded-[12px] bg-umber px-6 text-cream text-[14px] font-semibold hover:bg-bark transition-colors"
        >
          Choose a theme
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  const [activities, responses, themeWeeks] = await Promise.all([
    getSprintActivities(sprint.theme_id),
    getSprintResponses(sprint.id),
    getThemeWeeks(sprint.theme_id),
  ]);

  const currentWeek = sprint.current_week ?? 1;

  const [progression, disbandStatus] = await Promise.all([
    getWeekProgressionStatus(
      sprint.id,
      family.id,
      sprint.theme_id,
      currentWeek
    ),
    getDisbandVoteStatus(sprint.id, family.id),
  ]);

  const weekMeta = new Map(themeWeeks.map((tw) => [tw.week_number, tw]));
  const weeks = Array.from({ length: 6 }, (_, i) => i + 1);

  // Map responses by activity
  const responsesByActivity = new Map<string, number>();
  for (const r of responses) {
    responsesByActivity.set(
      r.activity_id,
      (responsesByActivity.get(r.activity_id) ?? 0) + 1
    );
  }

  const userRespondedActivities = new Set(
    responses.filter((r) => r.user_id === user.id).map((r) => r.activity_id)
  );

  const currentWeekMeta = weekMeta.get(currentWeek);
  const currentWeekActivities = activities.filter(
    (a) => a.week_number === currentWeek
  );

  // Get the first activity with a challenge_intro for the current week
  const currentWeekIntro = currentWeekActivities.find(
    (a) => a.challenge_intro
  );

  return (
    <div className="relative flex flex-col gap-0 -mx-4 -mt-2">
      {/* Background illustrations */}
      <FloatingLeaves className="absolute top-0 right-0 w-[400px] h-[400px]" />
      <SoftBlob className="absolute bottom-40 -left-20 w-80 h-80" />

      {/* ── Hero: Current Week ────────────────────────────── */}
      <section className="relative px-4 pt-6 pb-8">
        {/* Sprint label */}
        <div className="flex items-center gap-2 mb-6">
          <span className="text-[11px] font-semibold text-clay uppercase tracking-[0.06em]">
            {sprint.sprint_themes?.name}
          </span>
          <span className="text-clay/30">·</span>
          <span className="text-[11px] text-clay">
            Week {currentWeek} of 6
          </span>
        </div>

        {/* Week icon + title */}
        <div className="flex items-start gap-4 mb-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-sage/15 text-olive">
            <WeekIcon week={currentWeek} className="h-7 w-7" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-[22px] font-semibold text-night leading-tight">
              {currentWeekMeta?.title ?? `Week ${currentWeek}`}
            </h1>
            {currentWeekMeta?.subtitle && (
              <p className="text-[14px] text-clay mt-1.5 leading-relaxed">
                {currentWeekMeta.subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Challenge intro (if new — inline instead of modal) */}
        {currentWeekIntro?.challenge_intro && (
          <div className="rounded-[14px] bg-sage/8 border border-sage/15 px-4 py-3.5 mb-5">
            <p className="text-[13px] text-olive/90 leading-relaxed">
              {currentWeekIntro.challenge_intro}
            </p>
          </div>
        )}

        {/* Current week activities — hero cards */}
        <div className="flex flex-col gap-3">
          {currentWeekActivities.map((activity) => {
            const respCount = responsesByActivity.get(activity.id) ?? 0;
            const userDone = userRespondedActivities.has(activity.id);

            return (
              <Link
                key={activity.id}
                href={`/dashboard/sprint/activity/${activity.id}?sprint=${sprint.id}`}
                className="group flex items-center gap-4 rounded-[16px] border border-latte bg-cream p-5 transition-all hover:shadow-[0_4px_16px_rgba(74,63,53,0.08)] hover:border-sand"
              >
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors ${
                    userDone
                      ? "bg-sage/20 text-olive"
                      : "bg-linen text-clay group-hover:bg-sand/30 group-hover:text-bark"
                  }`}
                >
                  {userDone ? (
                    <CheckIcon className="h-5 w-5" />
                  ) : (
                    <ActivityTypeIcon type={activity.type} className="h-5 w-5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-medium text-night leading-snug">
                    {activity.prompt}
                  </p>
                  <p className="text-[12px] text-clay mt-1">
                    {respCount} response{respCount !== 1 ? "s" : ""}
                    {activity.is_anonymous && " · anonymous"}
                  </p>
                </div>
                <ArrowRightIcon className="h-4 w-4 text-clay/40 shrink-0 group-hover:text-bark transition-colors" />
              </Link>
            );
          })}
        </div>

        {/* Week progression panel */}
        <div className="mt-4">
          <WeekProgressionPanel
            sprintId={sprint.id}
            weekNumber={currentWeek}
            currentUserId={user.id}
            memberStatus={progression.memberStatus.map((m) => {
              const u = m.user as unknown as {
                id: string;
                display_name: string | null;
                avatar_url: string | null;
              } | null;
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
            momentLabel={currentWeekMeta?.moment_label ?? undefined}
          />
        </div>
      </section>

      {/* ── Divider ───────────────────────────────────────── */}
      <div className="px-4">
        <div className="h-px bg-latte/60" />
      </div>

      {/* ── Timeline: All Weeks ───────────────────────────── */}
      <section className="px-4 pt-6 pb-8">
        <h2 className="text-[11px] font-semibold text-clay uppercase tracking-[0.06em] mb-4">
          Sprint Timeline
        </h2>

        <div className="flex flex-col gap-0">
          {weeks.map((week) => {
            const meta = weekMeta.get(week);
            const weekActivities = activities.filter(
              (a) => a.week_number === week
            );
            const isUnlocked = week <= currentWeek;
            const isCurrent = week === currentWeek;
            const isPast = week < currentWeek;

            // Count user completions for this week
            const userCompletedCount = weekActivities.filter((a) =>
              userRespondedActivities.has(a.id)
            ).length;
            const allDone =
              weekActivities.length > 0 &&
              userCompletedCount === weekActivities.length;

            return (
              <div key={week} className="flex gap-4">
                {/* Timeline track */}
                <div className="flex flex-col items-center w-8 shrink-0">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors ${
                      isCurrent
                        ? "border-sage bg-sage/15 text-olive"
                        : isPast
                          ? "border-sage bg-sage text-cream"
                          : "border-latte bg-linen text-clay/40"
                    }`}
                  >
                    {isPast ? (
                      <CheckIcon className="h-3.5 w-3.5" />
                    ) : isCurrent ? (
                      <span className="h-2 w-2 rounded-full bg-olive" />
                    ) : (
                      <LockIcon className="h-3 w-3" />
                    )}
                  </div>
                  {/* Connector line */}
                  {week < 6 && (
                    <div
                      className={`w-0.5 flex-1 min-h-[16px] ${
                        isPast ? "bg-sage" : "bg-latte/40"
                      }`}
                    />
                  )}
                </div>

                {/* Week content */}
                <div
                  className={`flex-1 min-w-0 pb-5 ${
                    !isUnlocked ? "opacity-50" : ""
                  }`}
                >
                  <div className="flex items-center gap-2 mb-0.5">
                    <div
                      className={`${
                        isCurrent ? "text-olive" : isPast ? "text-sage" : "text-clay/50"
                      }`}
                    >
                      <WeekIcon week={week} className="h-4 w-4" />
                    </div>
                    <span
                      className={`text-[12px] font-semibold ${
                        isCurrent
                          ? "text-night"
                          : isPast
                            ? "text-bark"
                            : "text-clay/60"
                      }`}
                    >
                      Week {week}
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] font-medium text-olive bg-sage/20 px-1.5 py-0.5 rounded-full">
                        Current
                      </span>
                    )}
                    {isPast && allDone && (
                      <span className="text-[10px] font-medium text-sage bg-sage/10 px-1.5 py-0.5 rounded-full">
                        Complete
                      </span>
                    )}
                  </div>

                  <p
                    className={`text-[13px] leading-snug ${
                      isCurrent
                        ? "text-night font-medium"
                        : isPast
                          ? "text-bark"
                          : "text-clay/60"
                    }`}
                  >
                    {meta?.title ?? `Week ${week}`}
                  </p>

                  {/* Past week: show compact activity summary */}
                  {isPast && (
                    <div className="flex items-center gap-2 mt-1.5">
                      {weekActivities.map((a) => (
                        <Link
                          key={a.id}
                          href={`/dashboard/sprint/activity/${a.id}?sprint=${sprint.id}`}
                          className="flex items-center gap-1 text-[11px] text-clay hover:text-bark transition-colors"
                        >
                          <ActivityTypeIcon
                            type={a.type}
                            className="h-3 w-3"
                          />
                          <span>
                            {responsesByActivity.get(a.id) ?? 0} responses
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Future: just show lock message */}
                  {!isUnlocked && (
                    <p className="text-[11px] text-clay/40 mt-1">
                      Unlocks after Week {week - 1}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Disband sprint ────────────────────────────────── */}
      <div className="px-4 pb-8">
        <DisbandSprintPanel
          sprintId={sprint.id}
          currentUserId={user.id}
          memberStatus={disbandStatus.memberStatus}
          votedCount={disbandStatus.votedCount}
          totalMembers={disbandStatus.totalMembers}
          allVoted={disbandStatus.allVoted}
        />
      </div>
    </div>
  );
}
