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
