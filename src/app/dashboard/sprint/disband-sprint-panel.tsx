"use client";

import { useState, useTransition } from "react";
import { voteToDisbandSprint, removeDisbandVote } from "@/lib/actions";

interface DisbandMemberStatus {
  userId: string;
  displayName: string | null;
  avatarUrl: string | null;
  hasVoted: boolean;
}

export function DisbandSprintPanel({
  sprintId,
  currentUserId,
  memberStatus,
  votedCount,
  totalMembers,
  allVoted,
}: {
  sprintId: string;
  currentUserId: string;
  memberStatus: DisbandMemberStatus[];
  votedCount: number;
  totalMembers: number;
  allVoted: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [isExpanded, setIsExpanded] = useState(false);

  const currentUser = memberStatus.find((m) => m.userId === currentUserId);
  const userHasVoted = currentUser?.hasVoted ?? false;

  function handleVote() {
    startTransition(async () => {
      if (userHasVoted) {
        await removeDisbandVote(sprintId);
      } else {
        await voteToDisbandSprint(sprintId);
      }
    });
  }

  return (
    <div className="rounded-[14px] border border-red-200 bg-red-50/50 p-4 flex flex-col gap-3">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full text-left"
      >
        <h3 className="text-[13px] font-semibold text-red-900">
          Disband Sprint
        </h3>
        <span className="text-[11px] text-red-400">
          {isExpanded ? "▲" : "▼"}
        </span>
      </button>

      {isExpanded && (
        <>
          <p className="text-[12px] text-red-700/70">
            If the entire family agrees, this sprint will be abandoned. All
            members must vote to disband.
          </p>

          {/* Member vote status */}
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
                  <div className="h-6 w-6 rounded-full bg-red-100 flex items-center justify-center text-[10px] text-red-400">
                    {(m.displayName ?? "?")[0]}
                  </div>
                )}
                <span className="text-[12px] text-red-900/70 flex-1 truncate">
                  {m.displayName ?? "Member"}
                  {m.userId === currentUserId && " (you)"}
                </span>
                {m.hasVoted ? (
                  <span className="text-[10px] bg-red-200/60 text-red-700 px-1.5 py-0.5 rounded-full">
                    Voted
                  </span>
                ) : (
                  <span className="text-red-300 text-xs">○</span>
                )}
              </div>
            ))}
          </div>

          {/* Vote area */}
          <div className="flex flex-col gap-2">
            <p className="text-[12px] text-red-700/60">
              {allVoted
                ? "All members agreed. Disbanding..."
                : `${votedCount}/${totalMembers} voted to disband.`}
            </p>
            <button
              onClick={handleVote}
              disabled={isPending}
              className={`h-10 rounded-[10px] text-[13px] font-semibold transition-colors ${
                userHasVoted
                  ? "bg-white text-red-600 border border-red-200 hover:bg-red-50"
                  : "bg-red-600 text-white hover:bg-red-700"
              } disabled:opacity-50`}
            >
              {isPending
                ? "..."
                : userHasVoted
                  ? "Withdraw vote"
                  : "Vote to disband"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
