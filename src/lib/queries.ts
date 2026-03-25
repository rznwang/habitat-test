import { createClient } from "@/utils/supabase/server";

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getUserProfile(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();
  return data;
}

export async function getUserFamily(userId: string) {
  const supabase = await createClient();
  const { data: membership } = await supabase
    .from("family_members")
    .select("*, families(*)")
    .eq("user_id", userId)
    .single();
  return membership;
}

export async function getUserFamilies(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("family_members")
    .select("*, families(*)")
    .eq("user_id", userId)
    .order("joined_at");
  return data ?? [];
}

export async function getFamilyMembers(familyId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("family_members")
    .select("*, users(*)")
    .eq("family_id", familyId)
    .order("joined_at");
  return data ?? [];
}

export async function getActiveSprint(familyId: string) {
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
}

export async function getSprintActivities(themeId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("activities")
    .select("*")
    .eq("theme_id", themeId)
    .order("week_number")
    .order("sort_order");
  return data ?? [];
}

export async function getSprintResponses(sprintId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("responses")
    .select("*, users(id, display_name, avatar_url)")
    .eq("sprint_id", sprintId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

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

export async function getSprintThemes() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("sprint_themes")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");
  return data ?? [];
}

export async function getFamilyXP(familyId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("family_xp")
    .select("*")
    .eq("family_id", familyId)
    .single();
  return data;
}

export async function getUserStreak(familyId: string, userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("streaks")
    .select("*")
    .eq("family_id", familyId)
    .eq("user_id", userId)
    .single();
  return data;
}

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
    const u = m.users as { id: string; display_name: string | null; avatar_url: string | null } | null;
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
