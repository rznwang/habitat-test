"use client";

import { useTransition } from "react";
import { voteToAdvanceWeek, removeAdvanceVote } from "@/lib/actions";
import { CheckIcon, SparklesIcon } from "./icons";

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
  momentLabel,
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
  momentLabel?: string;
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
    <div className="rounded-[16px] border border-latte bg-cream/60 backdrop-blur-sm p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SparklesIcon className="h-4 w-4 text-olive" />
          <h3 className="text-[13px] font-semibold text-night">
            {allCompleted ? "Unlock the moment" : "Family progress"}
          </h3>
        </div>
        <span className="text-[11px] text-clay">
          {completedCount}/{memberStatus.length} done
        </span>
      </div>

      {/* Member avatars row */}
      <div className="flex items-center gap-3">
        {memberStatus.map((m) => (
          <div key={m.userId} className="flex flex-col items-center gap-1">
            <div className="relative">
              {m.avatarUrl ? (
                <img
                  src={m.avatarUrl}
                  alt=""
                  className={`h-9 w-9 rounded-full object-cover ring-2 ${
                    m.completedAll
                      ? "ring-sage"
                      : "ring-latte"
                  }`}
                />
              ) : (
                <div
                  className={`h-9 w-9 rounded-full flex items-center justify-center text-[12px] font-medium ring-2 ${
                    m.completedAll
                      ? "bg-sage/20 text-olive ring-sage"
                      : "bg-linen text-clay ring-latte"
                  }`}
                >
                  {(m.displayName ?? "?")[0]}
                </div>
              )}
              {/* Completion indicator */}
              {m.completedAll && (
                <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-sage flex items-center justify-center">
                  <CheckIcon className="h-2.5 w-2.5 text-cream" />
                </div>
              )}
            </div>
            <span className="text-[10px] text-clay truncate max-w-[56px]">
              {m.userId === currentUserId
                ? "You"
                : m.displayName?.split(" ")[0] ?? "Member"}
            </span>
            <div className="flex gap-0.5">
              {Array.from({ length: totalActivities }, (_, i) => (
                <div
                  key={i}
                  className={`h-1 w-3 rounded-full ${
                    i < m.completedCount ? "bg-sage" : "bg-latte"
                  }`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Vote / status area */}
      {allCompleted ? (
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-2">
            <CheckIcon className="h-3.5 w-3.5 text-olive" />
            <p className="text-[12px] text-olive font-medium">
              Everyone&apos;s done!{" "}
              {allVoted
                ? "Advancing..."
                : `${votedCount}/${memberStatus.length} ready to unlock.`}
            </p>
          </div>
          {momentLabel && (
            <p className="text-[12px] text-bark/70 italic">
              {momentLabel}
            </p>
          )}
          <button
            onClick={handleVote}
            disabled={isPending}
            className={`h-11 rounded-[12px] text-[13px] font-semibold transition-all ${
              userHasVoted
                ? "bg-linen text-clay border border-latte hover:bg-clay/10"
                : "bg-umber text-cream hover:bg-bark shadow-[0_2px_8px_rgba(74,63,53,0.12)]"
            } disabled:opacity-50`}
          >
            {isPending
              ? "..."
              : userHasVoted
                ? "Withdraw vote"
                : momentLabel
                  ? `Unlock: ${momentLabel}`
                  : "Unlock the moment"}
          </button>
        </div>
      ) : (
        <p className="text-[12px] text-clay leading-relaxed">
          Complete all activities to unlock this week&apos;s moment.
          {!userCompletedAll &&
            ` You have ${currentUser?.completedCount ?? 0}/${totalActivities} done.`}
        </p>
      )}
    </div>
  );
}
