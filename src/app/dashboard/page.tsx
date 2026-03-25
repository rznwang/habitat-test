import { redirect } from "next/navigation";
import Link from "next/link";
import {
  getCurrentUser,
  getUserProfile,
  getUserFamily,
  getActiveSprint,
  getFamilyMembers,
  getFamilyXP,
  getUserStreak,
} from "@/lib/queries";

function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="h-2 w-full rounded-full bg-linen overflow-hidden">
      <div
        className="h-full rounded-full bg-sage transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [profile, membership] = await Promise.all([
    getUserProfile(user.id),
    getUserFamily(user.id),
  ]);

  // No family yet — onboarding
  if (!membership?.families) {
    return (
      <div className="flex flex-col items-center gap-6 py-12">
        <h1 className="font-display text-2xl font-semibold text-night">
          Welcome{profile?.display_name ? `, ${profile.display_name}` : ""}!
        </h1>
        <p className="text-clay text-center max-w-sm">
          Create a family space or join one via an invite link to get started.
        </p>
        <div className="flex gap-3">
          <Link
            href="/dashboard/family/create"
            className="flex h-11 items-center rounded-[12px] bg-umber px-6 text-cream text-[14px] font-semibold hover:bg-bark transition-colors"
          >
            Create a family
          </Link>
          <Link
            href="/dashboard/family/join"
            className="flex h-11 items-center rounded-[12px] border border-latte px-6 text-bark text-[14px] font-semibold hover:bg-linen transition-colors"
          >
            Join with invite
          </Link>
        </div>
        {!profile?.display_name && (
          <Link
            href="/dashboard/profile"
            className="text-[13px] text-clay hover:text-bark transition-colors"
          >
            Set up your profile first →
          </Link>
        )}
      </div>
    );
  }

  const family = membership.families as { id: string; name: string };
  const [activeSprint, members, xp, streak] = await Promise.all([
    getActiveSprint(family.id),
    getFamilyMembers(family.id),
    getFamilyXP(family.id),
    getUserStreak(family.id, user.id),
  ]);

  // Calculate sprint progress
  let sprintWeek = 0;
  let sprintProgress = 0;
  if (activeSprint) {
    const start = new Date(activeSprint.started_at);
    const now = new Date();
    const daysPassed = Math.floor(
      (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );
    sprintWeek = Math.min(Math.floor(daysPassed / 7) + 1, 6);
    sprintProgress = Math.min((daysPassed / 42) * 100, 100);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Greeting */}
      <div>
        <h1 className="font-display text-2xl font-semibold text-night">
          {family.name}
        </h1>
        <p className="text-clay text-[14px] mt-1">
          {members.length} member{members.length !== 1 ? "s" : ""} •{" "}
          {xp?.total_xp ?? 0} XP
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-[16px] border border-latte bg-linen p-4 text-center">
          <p className="text-2xl font-semibold text-night">
            {streak?.current_streak ?? 0}
          </p>
          <p className="text-[12px] text-clay mt-1">Week streak</p>
        </div>
        <div className="rounded-[16px] border border-latte bg-linen p-4 text-center">
          <p className="text-2xl font-semibold text-night">
            {xp?.total_xp ?? 0}
          </p>
          <p className="text-[12px] text-clay mt-1">Family XP</p>
        </div>
        <div className="rounded-[16px] border border-latte bg-linen p-4 text-center">
          <p className="text-2xl font-semibold text-night">{members.length}</p>
          <p className="text-[12px] text-clay mt-1">Members</p>
        </div>
      </div>

      {/* Active sprint card */}
      {activeSprint ? (
        <Link
          href="/dashboard/sprint"
          className="rounded-[16px] border border-latte bg-linen p-5 hover:shadow-[0_2px_8px_rgba(74,63,53,0.06)] transition-shadow"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[12px] font-medium text-clay uppercase tracking-[0.04em]">
                Active Sprint
              </p>
              <p className="text-[17px] font-semibold text-night mt-1">
                {activeSprint.sprint_themes?.icon}{" "}
                {activeSprint.sprint_themes?.name}
              </p>
            </div>
            <span className="text-[13px] font-medium text-sage">
              Week {sprintWeek}/6
            </span>
          </div>
          <ProgressBar value={sprintProgress} max={100} />
          <p className="text-[12px] text-clay mt-2">
            {Math.round(sprintProgress)}% complete
          </p>
        </Link>
      ) : (
        <div className="rounded-[16px] border border-latte bg-linen p-5 text-center">
          <p className="text-[15px] text-clay mb-3">No active sprint</p>
          <Link
            href="/dashboard/sprint/new"
            className="inline-flex h-10 items-center rounded-[12px] bg-umber px-5 text-cream text-[14px] font-semibold hover:bg-bark transition-colors"
          >
            Start a sprint
          </Link>
        </div>
      )}

      {/* Family members */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[12px] font-medium text-clay uppercase tracking-[0.04em]">
            Family members
          </h2>
          <Link
            href="/dashboard/family"
            className="text-[12px] text-sage hover:text-olive transition-colors"
          >
            Manage →
          </Link>
        </div>
        <div className="flex flex-wrap gap-2">
          {members.map((m) => {
            const u = m.users as { display_name?: string; email?: string } | null;
            return (
              <span
                key={m.id}
                className="inline-flex items-center gap-1.5 rounded-full border border-latte bg-cream px-3 py-1.5 text-[13px] text-bark"
              >
                <span className="h-5 w-5 rounded-full bg-sage/30 flex items-center justify-center text-[10px] font-semibold text-olive">
                  {(u?.display_name ?? u?.email ?? "?")[0]?.toUpperCase()}
                </span>
                {u?.display_name ?? u?.email ?? "Unknown"}
                {m.role === "admin" && (
                  <span className="text-[10px] text-clay">admin</span>
                )}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
