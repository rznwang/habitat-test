"use client";

import { useTransition } from "react";
import { voteToAdvanceWeek, removeAdvanceVote } from "@/lib/actions";

interface MemberProgressProps {
  userId: string;
  displayName: string | null;
  avatarUrl: string | null;
  completedCount: number;
  totalActivities: number;
  completedAll: boolean;
  hasVoted: boolean;
}

export function WeekProgressionPanel({
  sprintId,
  weekNumber,
  currentUserId,
  memberStatus,
  totalActivities,
  allCompleted,
  allVoted,
  canAdvance,
  isCurrentWeek,
}: {
  sprintId: string;
  weekNumber: number;
  currentUserId: string;
  memberStatus: MemberProgressProps[];
  totalActivities: number;
  allCompleted: boolean;
  allVoted: boolean;
  canAdvance: boolean;
  isCurrentWeek: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  const currentUser = memberStatus.find((m) => m.userId === currentUserId);
  const userCompletedAll = currentUser?.completedAll ?? false;
  const userHasVoted = currentUser?.hasVoted ?? false;

  function handleVote() {
    startTransition(async () => {
      if (userHasVoted) {
        await removeAdvanceVote(sprintId, weekNumber);
      } else {
        await voteToAdvanceWeek(sprintId, weekNumber);
      }
    });
  }

  if (!isCurrentWeek) return null;

  const votedCount = memberStatus.filter((m) => m.hasVoted).length;
  const completedCount = memberStatus.filter((m) => m.completedAll).length;

  return (
    <div className="rounded-[14px] border border-latte bg-cream/50 p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-[13px] font-semibold text-night">
          Week {weekNumber} Progress
        </h3>
        <span className="text-[11px] text-clay">
          {completedCount}/{memberStatus.length} members done
        </span>
      </div>

      {/* Member status list */}
      <div className="flex flex-col gap-2">
        {memberStatus.map((m) => (
          <div key={m.userId} className="flex items-center gap-2">
            {m.avatarUrl ? (
              <img
                src={m.avatarUrl}
                alt=""
                className="h-6 w-6 rounded-full object-cover"
              />
            ) : (
              <div className="h-6 w-6 rounded-full bg-linen flex items-center justify-center text-[10px] text-clay">
                {(m.displayName ?? "?")[0]}
              </div>
            )}
            <span className="text-[12px] text-bark flex-1 truncate">
              {m.displayName ?? "Member"}
              {m.userId === currentUserId && " (you)"}
            </span>
            <span className="text-[11px] text-clay">
              {m.completedCount}/{totalActivities}
            </span>
            {m.completedAll ? (
              <span className="text-sage text-xs">✓</span>
            ) : (
              <span className="text-clay/40 text-xs">○</span>
            )}
            {m.hasVoted && (
              <span className="text-[10px] bg-sage/20 text-olive px-1.5 py-0.5 rounded-full">
                Ready
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Vote / status area */}
      {allCompleted ? (
        <div className="flex flex-col gap-2">
          <p className="text-[12px] text-olive">
            ✓ All members completed this week&apos;s activities!{" "}
            {allVoted
              ? "Advancing..."
              : `${votedCount}/${memberStatus.length} voted to advance.`}
          </p>
          <button
            onClick={handleVote}
            disabled={isPending}
            className={`h-10 rounded-[10px] text-[13px] font-semibold transition-colors ${
              userHasVoted
                ? "bg-linen text-clay border border-latte hover:bg-clay/10"
                : "bg-umber text-cream hover:bg-bark"
            } disabled:opacity-50`}
          >
            {isPending
              ? "..."
              : userHasVoted
                ? "Withdraw vote"
                : "Vote to advance →"}
          </button>
        </div>
      ) : (
        <p className="text-[12px] text-clay">
          All family members must complete every activity this week before the
          family can vote to advance.
          {!userCompletedAll &&
            ` You have ${currentUser?.completedCount ?? 0}/${totalActivities} done.`}
        </p>
      )}
    </div>
  );
}
