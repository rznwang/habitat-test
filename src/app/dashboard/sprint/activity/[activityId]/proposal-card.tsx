"use client";

import { voteForProposal, removeProposalVote } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface ProposalData {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  photo_url: string | null;
  link_url: string | null;
  budget_note: string | null;
  servings: number | null;
  created_at: string;
  vote_count: number;
  user_voted: boolean;
  users?: { id: string; display_name?: string; avatar_url?: string };
}

export default function ProposalCard({
  proposal,
  currentUserId,
  maxVotes,
  totalVotes,
  userVoteCount,
  isWinner,
}: {
  proposal: ProposalData;
  currentUserId: string;
  maxVotes: number;
  totalVotes: number;
  userVoteCount: number;
  isWinner?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const displayName = proposal.users?.display_name ?? "Unknown";
  const initial = (displayName[0] ?? "?").toUpperCase();
  const votePercentage = totalVotes > 0 ? (proposal.vote_count / totalVotes) * 100 : 0;
  const canVote = !proposal.user_voted && userVoteCount < 2;

  async function handleVote() {
    setLoading(true);
    if (proposal.user_voted) {
      await removeProposalVote(proposal.id);
    } else {
      await voteForProposal(proposal.id);
    }
    setLoading(false);
    router.refresh();
  }

  return (
    <div
      className={`rounded-[14px] border p-4 flex flex-col gap-3 transition-all ${
        isWinner
          ? "border-sage bg-sage/10 ring-2 ring-sage/30"
          : "border-latte bg-linen"
      }`}
    >
      {/* Winner badge */}
      {isWinner && (
        <div className="flex items-center gap-1.5 text-[12px] font-semibold text-olive">
          <span>👑</span> Winnaar!
        </div>
      )}

      {/* Author */}
      <div className="flex items-center gap-2">
        <div className="h-7 w-7 rounded-full bg-sage/30 flex items-center justify-center text-[11px] font-semibold text-olive">
          {initial}
        </div>
        <span className="text-[13px] font-medium text-night">{displayName}</span>
        {proposal.user_id === currentUserId && (
          <span className="text-[11px] text-clay bg-linen px-2 py-0.5 rounded-full">jij</span>
        )}
      </div>

      {/* Title */}
      <h3 className="text-[16px] font-semibold text-night">{proposal.title}</h3>

      {/* Description */}
      {proposal.description && (
        <p className="text-[14px] text-bark leading-[1.6]">{proposal.description}</p>
      )}

      {/* Photo */}
      {proposal.photo_url && (
        <div className="rounded-[10px] overflow-hidden border border-latte">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={proposal.photo_url}
            alt={proposal.title}
            className="w-full max-h-48 object-cover"
          />
        </div>
      )}

      {/* Link */}
      {proposal.link_url && (
        <a
          href={proposal.link_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[13px] text-umber underline hover:text-bark transition-colors"
        >
          🔗 Meer info
        </a>
      )}

      {/* Budget details */}
      {proposal.budget_note && (
        <div className="rounded-[10px] bg-cream border border-latte p-3">
          <p className="text-[12px] font-medium text-clay uppercase tracking-[0.04em] mb-1">
            💰 Budget
          </p>
          <p className="text-[13px] text-bark">{proposal.budget_note}</p>
          {proposal.servings && (
            <p className="text-[12px] text-clay mt-1">
              👥 Voor {proposal.servings} personen
            </p>
          )}
        </div>
      )}

      {/* Vote bar + button */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <div className="h-2 w-full rounded-full bg-latte/50 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isWinner ? "bg-sage" : "bg-umber/60"
              }`}
              style={{ width: `${votePercentage}%` }}
            />
          </div>
          <p className="text-[11px] text-clay mt-0.5">
            {proposal.vote_count} stem{proposal.vote_count !== 1 ? "men" : ""}
          </p>
        </div>

        <button
          onClick={handleVote}
          disabled={loading || (!proposal.user_voted && !canVote)}
          className={`h-9 rounded-[10px] px-4 text-[13px] font-semibold transition-colors cursor-pointer disabled:opacity-50 ${
            proposal.user_voted
              ? "bg-sage/20 border border-sage/40 text-olive hover:bg-sage/30"
              : "bg-umber text-cream hover:bg-bark"
          }`}
        >
          {loading
            ? "…"
            : proposal.user_voted
              ? "✓ Gestemd"
              : "Stem"}
        </button>
      </div>
    </div>
  );
}
