import { cache } from "react";
import { createClient } from "@/utils/supabase/server";

export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

export const getUserProfile = cache(async (userId: string) => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();
  return data;
});

export const getUserFamily = cache(async (userId: string) => {
  const supabase = await createClient();
  const { data: membership } = await supabase
    .from("family_members")
    .select("*, families(*)")
    .eq("user_id", userId)
    .single();
  return membership;
});

export const getUserFamilies = cache(async (userId: string) => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("family_members")
    .select("*, families(*)")
    .eq("user_id", userId)
    .order("joined_at");
  return data ?? [];
});

export const getFamilyMembers = cache(async (familyId: string) => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("family_members")
    .select("*, users(*)")
    .eq("family_id", familyId)
    .order("joined_at");
  return data ?? [];
});

export const getActiveSprint = cache(async (familyId: string) => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("family_sprints")
    .select("*, sprint_themes(*)")
    .eq("family_id", familyId)
    .eq("status", "active")
    .order("started_at", { ascending: false })
    .limit(1)
    .single();
  return data;
});

export const getSprintActivities = cache(async (themeId: string) => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("activities")
    .select("*")
    .eq("theme_id", themeId)
    .order("week_number")
    .order("sort_order");
  return data ?? [];
});

export const getThemeWeeks = cache(async (themeId: string) => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("theme_weeks")
    .select("*")
    .eq("theme_id", themeId)
    .order("week_number");
  return data ?? [];
});

export const getSprintResponses = cache(async (sprintId: string) => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("responses")
    .select("*, users(id, display_name, avatar_url)")
    .eq("sprint_id", sprintId)
    .order("created_at", { ascending: false });
  return data ?? [];
});

export async function getResponseDetails(responseId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("responses")
    .select(
      "*, users(id, display_name, avatar_url), comments(*, users(id, display_name)), reactions(*)"
    )
    .eq("id", responseId)
    .single();
  return data;
}

export const getSprintThemes = cache(async () => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("sprint_themes")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");
  return data ?? [];
});

export const getFamilyXP = cache(async (familyId: string) => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("family_xp")
    .select("*")
    .eq("family_id", familyId)
    .single();
  return data;
});

export const getUserStreak = cache(async (familyId: string, userId: string) => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("streaks")
    .select("*")
    .eq("family_id", familyId)
    .eq("user_id", userId)
    .single();
  return data;
});

export async function getUserBadges(userId: string, familyId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_badges")
    .select("*, badges(*)")
    .eq("user_id", userId)
    .eq("family_id", familyId)
    .order("earned_at", { ascending: false });
  return data ?? [];
}

export async function getCompletedSprints(familyId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("family_sprints")
    .select("*, sprint_themes(*), memory_books(*)")
    .eq("family_id", familyId)
    .eq("status", "completed")
    .order("completed_at", { ascending: false });
  return data ?? [];
}

export async function getMemoryBook(sprintId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("memory_books")
    .select("*")
    .eq("sprint_id", sprintId)
    .single();
  return data;
}

export async function getWeekVotes(sprintId: string, weekNumber: number) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("week_votes")
    .select("*, users(id, display_name, avatar_url)")
    .eq("sprint_id", sprintId)
    .eq("week_number", weekNumber);
  return data ?? [];
}

export async function getFamilyPhotos(familyId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("family_photos")
    .select("*, users(id, display_name, avatar_url)")
    .eq("family_id", familyId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

/**
 * Returns a per-member completion status for the given week:
 * which members have responded to all activities in the week,
 * and which have voted to advance.
 */
export async function getWeekProgressionStatus(
  sprintId: string,
  familyId: string,
  themeId: string,
  weekNumber: number
) {
  const supabase = await createClient();

  // Get all family members
  const { data: members } = await supabase
    .from("family_members")
    .select("user_id, users(id, display_name, avatar_url)")
    .eq("family_id", familyId);

  // Get activities for this week
  const { data: weekActivities } = await supabase
    .from("activities")
    .select("id")
    .eq("theme_id", themeId)
    .eq("week_number", weekNumber);

  // Get responses for this sprint + week's activities
  const activityIds = (weekActivities ?? []).map((a) => a.id);
  const { data: responses } = await supabase
    .from("responses")
    .select("user_id, activity_id")
    .eq("sprint_id", sprintId)
    .in("activity_id", activityIds.length > 0 ? activityIds : ["__none__"]);

  // Get votes for this week
  const { data: votes } = await supabase
    .from("week_votes")
    .select("user_id")
    .eq("sprint_id", sprintId)
    .eq("week_number", weekNumber);

  const totalActivities = activityIds.length;
  const voteSet = new Set((votes ?? []).map((v) => v.user_id));

  // Build per-member status
  const memberStatus = (members ?? []).map((m) => {
    const userResponses = (responses ?? []).filter(
      (r) => r.user_id === m.user_id
    );
    const respondedActivities = new Set(
      userResponses.map((r) => r.activity_id)
    );
    const completedAll = totalActivities > 0 && respondedActivities.size >= totalActivities;
    const hasVoted = voteSet.has(m.user_id);
    return {
      userId: m.user_id,
      user: m.users,
      completedAll,
      completedCount: respondedActivities.size,
      hasVoted,
    };
  });

  const allCompleted = memberStatus.every((m) => m.completedAll);
  const allVoted = memberStatus.every((m) => m.hasVoted);
  const canAdvance = allCompleted && allVoted && memberStatus.length > 0;

  return {
    memberStatus,
    totalActivities,
    allCompleted,
    allVoted,
    canAdvance,
  };
}

export async function getDisbandVoteStatus(
  sprintId: string,
  familyId: string
) {
  const supabase = await createClient();

  // Get all family members
  const { data: members } = await supabase
    .from("family_members")
    .select("user_id, users(id, display_name, avatar_url)")
    .eq("family_id", familyId);

  // Get disband votes for this sprint
  const { data: votes } = await supabase
    .from("disband_votes")
    .select("user_id")
    .eq("sprint_id", sprintId);

  const voteSet = new Set((votes ?? []).map((v) => v.user_id));

  const memberStatus = (members ?? []).map((m) => {
    const u = m.users as unknown as { id: string; display_name: string | null; avatar_url: string | null } | null;
    return {
      userId: m.user_id,
      displayName: u?.display_name ?? null,
      avatarUrl: u?.avatar_url ?? null,
      hasVoted: voteSet.has(m.user_id),
    };
  });

  const allVoted = memberStatus.length > 0 && memberStatus.every((m) => m.hasVoted);
  const votedCount = memberStatus.filter((m) => m.hasVoted).length;

  return { memberStatus, votedCount, totalMembers: memberStatus.length, allVoted };
}

// ── Proposals ───────────────────────────────────────────────

export async function getProposals(
  sprintId: string,
  activityId: string,
  currentUserId?: string
) {
  const supabase = await createClient();
  const { data: proposals } = await supabase
    .from("proposals")
    .select("*, users(id, display_name, avatar_url), proposal_votes(*)")
    .eq("sprint_id", sprintId)
    .eq("activity_id", activityId)
    .order("created_at");

  return (proposals ?? []).map((p) => ({
    ...p,
    vote_count: (p.proposal_votes ?? []).length,
    user_voted: currentUserId
      ? (p.proposal_votes ?? []).some(
          (v: { user_id: string }) => v.user_id === currentUserId
        )
      : false,
  }));
}

export async function getUserProposalVoteCount(
  sprintId: string,
  activityId: string,
  userId: string
) {
  const supabase = await createClient();

  // Get all proposals for this activity
  const { data: proposals } = await supabase
    .from("proposals")
    .select("id")
    .eq("sprint_id", sprintId)
    .eq("activity_id", activityId);

  if (!proposals || proposals.length === 0) return 0;

  const proposalIds = proposals.map((p) => p.id);
  const { data: votes } = await supabase
    .from("proposal_votes")
    .select("id")
    .eq("user_id", userId)
    .in("proposal_id", proposalIds);

  return votes?.length ?? 0;
}

export async function getWinningProposal(sprintId: string, activityId: string) {
  const proposals = await getProposals(sprintId, activityId);
  if (proposals.length === 0) return null;
  return proposals.reduce((best, p) =>
    (p.vote_count ?? 0) > (best.vote_count ?? 0) ? p : best
  );
}

// ── Survey Results ──────────────────────────────────────────

export async function getSurveyResults(sprintId: string, activityId: string) {
  const supabase = await createClient();
  const { data: responses } = await supabase
    .from("responses")
    .select("content")
    .eq("sprint_id", sprintId)
    .eq("activity_id", activityId);

  const allAnswers: Record<string, string | string[]>[] = [];
  for (const r of responses ?? []) {
    if (r.content) {
      try {
        allAnswers.push(JSON.parse(r.content));
      } catch {
        // skip non-JSON responses
      }
    }
  }

  // Aggregate answers
  const aggregated: Record<string, Record<string, number>> = {};
  for (const answers of allAnswers) {
    for (const [key, value] of Object.entries(answers)) {
      if (!aggregated[key]) aggregated[key] = {};
      const values = Array.isArray(value) ? value : [value];
      for (const v of values) {
        aggregated[key][v] = (aggregated[key][v] ?? 0) + 1;
      }
    }
  }

  return { aggregated, totalResponses: allAnswers.length };
}

// ── Sprint Summary ──────────────────────────────────────────

export async function getSprintSummary(sprintId: string) {
  const supabase = await createClient();

  const { data: sprint } = await supabase
    .from("family_sprints")
    .select("*, sprint_themes(*)")
    .eq("id", sprintId)
    .single();

  if (!sprint) return null;

  const { data: activities } = await supabase
    .from("activities")
    .select("*")
    .eq("theme_id", sprint.theme_id)
    .order("week_number")
    .order("sort_order");

  const { data: responses } = await supabase
    .from("responses")
    .select("*, users(id, display_name, avatar_url), reactions(*)")
    .eq("sprint_id", sprintId)
    .order("created_at");

  const { data: proposals } = await supabase
    .from("proposals")
    .select("*, users(id, display_name, avatar_url), proposal_votes(*)")
    .eq("sprint_id", sprintId);

  const theme = sprint.sprint_themes as {
    name: string;
    icon?: string;
  } | null;

  const weekTitles: Record<number, string> = {
    1: "Familieherinnering",
    2: "Familie-uitstap",
    3: "Jeugdherinnering",
    4: "Familiemenu",
    5: "Dagvlog",
    6: "Familiefeest",
  };

  const weeks = Array.from({ length: 6 }, (_, i) => {
    const weekNum = i + 1;
    const weekActivities = (activities ?? []).filter(
      (a) => a.week_number === weekNum
    );
    const weekResponses = (responses ?? []).filter((r) =>
      weekActivities.some((a) => a.id === r.activity_id)
    );

    // Top responses by reaction count
    const topResponses = weekResponses
      .map((r) => ({
        content: r.content,
        userName:
          (r.users as { display_name?: string } | null)?.display_name ??
          "Unknown",
        reactionCount: (r.reactions ?? []).length,
      }))
      .sort((a, b) => b.reactionCount - a.reactionCount)
      .slice(0, 3);

    // Winning proposal for voting weeks
    const weekProposals = (proposals ?? []).filter((p) =>
      weekActivities.some((a) => a.id === p.activity_id)
    );
    let winningProposal;
    if (weekProposals.length > 0) {
      const winner = weekProposals.reduce((best, p) => {
        const bestVotes = (best.proposal_votes ?? []).length;
        const pVotes = (p.proposal_votes ?? []).length;
        return pVotes > bestVotes ? p : best;
      });
      winningProposal = {
        title: winner.title,
        description: winner.description,
        userName:
          (winner.users as { display_name?: string } | null)?.display_name ??
          "Unknown",
        voteCount: (winner.proposal_votes ?? []).length,
      };
    }

    return {
      weekNumber: weekNum,
      title: weekTitles[weekNum] ?? `Week ${weekNum}`,
      highlights: {
        topResponses,
        winningProposal,
      },
    };
  });

  return {
    sprintId: sprint.id,
    themeName: theme?.name ?? "Unknown",
    themeIcon: theme?.icon ?? "🎉",
    weeks,
  };
}
