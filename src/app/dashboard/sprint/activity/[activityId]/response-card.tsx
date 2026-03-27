"use client";

import { toggleReaction, addComment } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface ResponseUser {
  id: string;
  display_name?: string;
  avatar_url?: string;
}

interface ReactionData {
  id: string;
  user_id: string;
  emoji: string;
}

interface CommentData {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  users?: { id: string; display_name?: string };
}

interface ResponseData {
  id: string;
  user_id: string;
  type: string;
  content: string | null;
  is_anonymous: boolean;
  created_at: string;
  users?: ResponseUser;
  reactions?: ReactionData[];
  comments?: CommentData[];
}

const EMOJI_OPTIONS = ["❤️", "😂", "🔥", "👏", "😮", "💯"];

export default function ResponseCard({
  response,
  currentUserId,
  isAnonymous,
  allowComments,
}: {
  response: ResponseData;
  currentUserId: string;
  isAnonymous: boolean;
  allowComments: boolean;
}) {
  const router = useRouter();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const displayName =
    isAnonymous || response.is_anonymous
      ? "Anonymous"
      : response.users?.display_name ?? "Unknown";

  const initial =
    isAnonymous || response.is_anonymous
      ? "?"
      : (displayName[0] ?? "?").toUpperCase();

  // Group reactions by emoji
  const reactionCounts = new Map<string, { count: number; userReacted: boolean }>();
  for (const r of response.reactions ?? []) {
    const existing = reactionCounts.get(r.emoji) ?? {
      count: 0,
      userReacted: false,
    };
    existing.count++;
    if (r.user_id === currentUserId) existing.userReacted = true;
    reactionCounts.set(r.emoji, existing);
  }

  async function handleReaction(emoji: string) {
    await toggleReaction(response.id, emoji);
    router.refresh();
  }

  async function handleComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmitting(true);
    await addComment(response.id, commentText.trim());
    setCommentText("");
    setSubmitting(false);
    router.refresh();
  }

  const timeAgo = getTimeAgo(response.created_at);

  return (
    <div className="rounded-[14px] border border-latte bg-linen p-4 flex flex-col gap-3">
      {/* Author */}
      <div className="flex items-center gap-2">
        <div className="h-7 w-7 rounded-full bg-sage/30 flex items-center justify-center text-[11px] font-semibold text-olive">
          {initial}
        </div>
        <span className="text-[13px] font-medium text-night">{displayName}</span>
        <span className="text-[11px] text-clay ml-auto">{timeAgo}</span>
      </div>

      {/* Content */}
      <div className="text-[14px] text-bark leading-[1.6]">
        {response.type === "image" && response.content ? (
          <div className="rounded-[10px] overflow-hidden bg-cream border border-latte">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={response.content}
              alt="Response"
              className="w-full max-h-64 object-cover"
            />
          </div>
        ) : response.type === "video" && response.content ? (
          <div className="rounded-[10px] overflow-hidden bg-night border border-latte">
            <video
              src={response.content}
              controls
              preload="metadata"
              className="w-full max-h-80"
            />
          </div>
        ) : (
          <p className="whitespace-pre-wrap">{response.content}</p>
        )}
      </div>

      {/* Reactions */}
      <div className="flex flex-wrap items-center gap-1.5">
        {EMOJI_OPTIONS.map((emoji) => {
          const data = reactionCounts.get(emoji);
          return (
            <button
              key={emoji}
              onClick={() => handleReaction(emoji)}
              className={`h-7 rounded-full px-2 text-[13px] flex items-center gap-1 transition-colors cursor-pointer ${
                data?.userReacted
                  ? "bg-sage/20 border border-sage/40"
                  : "bg-cream border border-latte hover:bg-sand/30"
              }`}
            >
              {emoji}
              {data && data.count > 0 && (
                <span className="text-[11px] text-clay">{data.count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Comments */}
      {allowComments && (
        <div>
          <button
            onClick={() => setShowComments(!showComments)}
            className="text-[12px] text-clay hover:text-bark transition-colors cursor-pointer"
          >
            {(response.comments?.length ?? 0) > 0
              ? `${response.comments!.length} comment${response.comments!.length !== 1 ? "s" : ""}`
              : "Add a comment"}
          </button>

          {showComments && (
            <div className="mt-2 flex flex-col gap-2">
              {response.comments?.map((comment) => (
                <div key={comment.id} className="flex gap-2 text-[13px]">
                  <span className="font-medium text-night shrink-0">
                    {comment.users?.display_name ?? "Unknown"}:
                  </span>
                  <span className="text-bark">{comment.content}</span>
                </div>
              ))}

              <form onSubmit={handleComment} className="flex gap-2 mt-1">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment…"
                  className="flex-1 h-8 rounded-[8px] border border-latte bg-cream px-3 text-[13px] text-bark placeholder:text-clay focus:outline-none focus:ring-1 focus:ring-umber"
                />
                <button
                  type="submit"
                  disabled={submitting || !commentText.trim()}
                  className="h-8 rounded-[8px] bg-umber px-3 text-[12px] font-medium text-cream hover:bg-bark transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Send
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function getTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const secs = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (secs < 60) return "just now";
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
}
