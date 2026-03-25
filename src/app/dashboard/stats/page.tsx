import { redirect } from "next/navigation";
import {
  getCurrentUser,
  getUserFamily,
  getFamilyMembers,
  getFamilyXP,
  getUserStreak,
  getUserBadges,
} from "@/lib/queries";
import { createClient } from "@/utils/supabase/server";

export default async function GamificationPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const membership = await getUserFamily(user.id);
  if (!membership?.families) redirect("/dashboard");

  const family = membership.families as { id: string; name: string };

  const [members, xp, streak, badges] = await Promise.all([
    getFamilyMembers(family.id),
    getFamilyXP(family.id),
    getUserStreak(family.id, user.id),
    getUserBadges(user.id, family.id),
  ]);

  // Get all members' streaks for leaderboard
  const supabase = await createClient();
  const { data: allStreaks } = await supabase
    .from("streaks")
    .select("*, users(id, display_name)")
    .eq("family_id", family.id)
    .order("current_streak", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl font-semibold text-night">
        Family Stats
      </h1>

      {/* XP Card */}
      <div className="rounded-[16px] border border-latte bg-linen p-5 text-center">
        <p className="text-4xl font-bold text-night">{xp?.total_xp ?? 0}</p>
        <p className="text-[13px] text-clay mt-1">Family XP</p>
        <div className="mt-3 h-3 w-full rounded-full bg-cream overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-sage to-olive transition-all duration-500"
            style={{
              width: `${Math.min(((xp?.total_xp ?? 0) % 1000) / 10, 100)}%`,
            }}
          />
        </div>
        <p className="text-[11px] text-clay mt-1">
          {(xp?.total_xp ?? 0) % 1000}/1000 to next level
        </p>
      </div>

      {/* Your streak */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-[16px] border border-latte bg-linen p-4 text-center">
          <p className="text-3xl font-bold text-night">
            {streak?.current_streak ?? 0}
          </p>
          <p className="text-[12px] text-clay mt-1">Current streak</p>
        </div>
        <div className="rounded-[16px] border border-latte bg-linen p-4 text-center">
          <p className="text-3xl font-bold text-night">
            {streak?.longest_streak ?? 0}
          </p>
          <p className="text-[12px] text-clay mt-1">Best streak</p>
        </div>
      </div>

      {/* Leaderboard */}
      {allStreaks && allStreaks.length > 0 && (
        <div>
          <h2 className="text-[12px] font-medium text-clay uppercase tracking-[0.04em] mb-3">
            Streak Leaderboard
          </h2>
          <div className="flex flex-col gap-2">
            {allStreaks.map((s, i) => {
              const u = s.users as { id: string; display_name?: string } | null;
              return (
                <div
                  key={s.id}
                  className={`flex items-center gap-3 rounded-[12px] border p-3 ${
                    u?.id === user.id
                      ? "border-sage/40 bg-sage/10"
                      : "border-latte bg-linen"
                  }`}
                >
                  <span className="text-[14px] font-bold text-clay w-6 text-center">
                    {i + 1}
                  </span>
                  <div className="h-7 w-7 rounded-full bg-sage/30 flex items-center justify-center text-[11px] font-semibold text-olive">
                    {(u?.display_name ?? "?")[0]?.toUpperCase()}
                  </div>
                  <span className="flex-1 text-[14px] text-night">
                    {u?.display_name ?? "Unknown"}
                    {u?.id === user.id && (
                      <span className="text-[11px] text-olive ml-1">(you)</span>
                    )}
                  </span>
                  <span className="text-[14px] font-semibold text-night">
                    {s.current_streak}🔥
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Badges */}
      <div>
        <h2 className="text-[12px] font-medium text-clay uppercase tracking-[0.04em] mb-3">
          Your Badges ({badges.length})
        </h2>
        {badges.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {badges.map((ub) => {
              const badge = ub.badges as {
                label: string;
                description?: string;
                icon?: string;
              } | null;
              return (
                <div
                  key={ub.id}
                  className="rounded-[14px] border border-latte bg-linen p-4 text-center"
                >
                  <span className="text-2xl">{badge?.icon ?? "🏅"}</span>
                  <p className="text-[13px] font-semibold text-night mt-2">
                    {badge?.label ?? "Badge"}
                  </p>
                  {badge?.description && (
                    <p className="text-[11px] text-clay mt-1">
                      {badge.description}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-[14px] border border-latte/60 bg-linen/60 p-6 text-center">
            <p className="text-2xl mb-2">🏅</p>
            <p className="text-[13px] text-clay">
              Complete activities to earn badges!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
