"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

// ── Family ──────────────────────────────────────────────────

export async function createFamily(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const name = String(formData.get("name")).trim();
  if (!name) return { error: "Family name is required" };

  // Create family
  const { data: family, error } = await supabase
    .from("families")
    .insert({ name, created_by: user.id })
    .select()
    .single();

  if (error) return { error: error.message };

  // Add creator as admin
  await supabase.from("family_members").insert({
    family_id: family.id,
    user_id: user.id,
    role: "admin",
    household: "main",
  });

  // Initialize XP
  await supabase.from("family_xp").insert({ family_id: family.id });

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const display_name = String(formData.get("display_name")).trim();
  if (!display_name) return { error: "Display name is required" };

  const bio = String(formData.get("bio") ?? "").trim();

  const { error } = await supabase
    .from("users")
    .update({ display_name, bio: bio || null })
    .eq("id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/dashboard");
}

export async function uploadAvatar(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const file = formData.get("avatar") as File | null;
  if (!file || file.size === 0) return { error: "No file selected" };

  // Validate file type
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowed.includes(file.type)) {
    return { error: "Only JPEG, PNG, WebP, and GIF images are allowed" };
  }

  // Validate file size (2MB max)
  if (file.size > 2 * 1024 * 1024) {
    return { error: "Image must be under 2 MB" };
  }

  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${user.id}/avatar.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, file, { upsert: true });

  if (uploadError) return { error: uploadError.message };

  const {
    data: { publicUrl },
  } = supabase.storage.from("avatars").getPublicUrl(path);

  const { error: updateError } = await supabase
    .from("users")
    .update({ avatar_url: publicUrl })
    .eq("id", user.id);

  if (updateError) return { error: updateError.message };
  revalidatePath("/dashboard");
  return { url: publicUrl };
}

// ── Invites ──────────────────────────────────────────────────

export async function createInvite(familyId: string, email?: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const expires_at = new Date(
    Date.now() + 7 * 24 * 60 * 60 * 1000
  ).toISOString();

  const { data, error } = await supabase
    .from("invites")
    .insert({
      family_id: familyId,
      created_by: user.id,
      email: email || null,
      expires_at,
    })
    .select()
    .single();

  if (error) return { error: error.message };
  return { token: data.token };
}

export async function acceptInvite(token: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: invite, error: fetchErr } = await supabase
    .from("invites")
    .select("*")
    .eq("token", token)
    .is("used_at", null)
    .single();

  if (fetchErr || !invite) return { error: "Invalid or expired invite" };
  if (invite.expires_at && new Date(invite.expires_at) < new Date())
    return { error: "Invite has expired" };

  // Check if already a member
  const { data: existing } = await supabase
    .from("family_members")
    .select("id")
    .eq("family_id", invite.family_id)
    .eq("user_id", user.id)
    .single();

  if (existing) return { error: "You are already a member of this family" };

  // Add member
  await supabase.from("family_members").insert({
    family_id: invite.family_id,
    user_id: user.id,
    role: "member",
    household: "extended",
  });

  // Mark invite used
  await supabase
    .from("invites")
    .update({ used_at: new Date().toISOString() })
    .eq("id", invite.id);

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

// ── Sprint ──────────────────────────────────────────────────

export async function startSprint(familyId: string, themeId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("family_sprints")
    .insert({
      family_id: familyId,
      theme_id: themeId,
      started_at: today,
    })
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  return { sprintId: data.id };
}

// ── Activity Responses ──────────────────────────────────────

export async function uploadResponsePhoto(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const file = formData.get("photo") as File | null;
  if (!file || file.size === 0) return { error: "No photo selected" };

  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowed.includes(file.type)) {
    return { error: "Only JPEG, PNG, WebP, and GIF images are allowed" };
  }

  if (file.size > 5 * 1024 * 1024) {
    return { error: "Image must be under 5 MB" };
  }

  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${user.id}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("responses")
    .upload(path, file, { upsert: false });

  if (uploadError) return { error: uploadError.message };

  const {
    data: { publicUrl },
  } = supabase.storage.from("responses").getPublicUrl(path);

  return { url: publicUrl };
}

export async function submitResponse(
  sprintId: string,
  activityId: string,
  type: string,
  content: string,
  isAnonymous: boolean
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from("responses").insert({
    sprint_id: sprintId,
    activity_id: activityId,
    user_id: user.id,
    type,
    content,
    is_anonymous: isAnonymous,
  });

  if (error) return { error: error.message };
  revalidatePath(`/dashboard/sprint`);
  return { success: true };
}

// ── Comments & Reactions ────────────────────────────────────

export async function addComment(responseId: string, content: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const sanitized = content.trim();
  if (!sanitized) return { error: "Comment cannot be empty" };

  const { error } = await supabase.from("comments").insert({
    response_id: responseId,
    user_id: user.id,
    content: sanitized,
  });

  if (error) return { error: error.message };
  return { success: true };
}

export async function toggleReaction(responseId: string, emoji: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Check if reaction already exists
  const { data: existing } = await supabase
    .from("reactions")
    .select("id")
    .eq("response_id", responseId)
    .eq("user_id", user.id)
    .eq("emoji", emoji)
    .single();

  if (existing) {
    await supabase.from("reactions").delete().eq("id", existing.id);
  } else {
    await supabase.from("reactions").insert({
      response_id: responseId,
      user_id: user.id,
      emoji,
    });
  }

  return { success: true };
}

// ── Family Photos ───────────────────────────────────────────

export async function uploadFamilyPhoto(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const file = formData.get("photo") as File | null;
  if (!file || file.size === 0) return { error: "No photo selected" };

  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowed.includes(file.type)) {
    return { error: "Only JPEG, PNG, WebP, and GIF images are allowed" };
  }

  if (file.size > 5 * 1024 * 1024) {
    return { error: "Image must be under 5 MB" };
  }

  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${user.id}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("family-photos")
    .upload(path, file, { upsert: false });

  if (uploadError) return { error: uploadError.message };

  const {
    data: { publicUrl },
  } = supabase.storage.from("family-photos").getPublicUrl(path);

  return { url: publicUrl };
}

export async function addFamilyPhoto(
  familyId: string,
  imageUrl: string,
  caption: string | null
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from("family_photos").insert({
    family_id: familyId,
    user_id: user.id,
    image_url: imageUrl,
    caption: caption?.trim() || null,
  });

  if (error) return { error: error.message };
  revalidatePath("/dashboard/family/photos");
  return { success: true };
}

export async function deleteFamilyPhoto(photoId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("family_photos")
    .delete()
    .eq("id", photoId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/family/photos");
  return { success: true };
}

// ── Week Progression ────────────────────────────────────────

export async function voteToAdvanceWeek(sprintId: string, weekNumber: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Verify sprint exists and user is a family member
  const { data: sprint } = await supabase
    .from("family_sprints")
    .select("id, family_id, current_week, theme_id")
    .eq("id", sprintId)
    .eq("status", "active")
    .single();

  if (!sprint) return { error: "Sprint not found" };
  if (sprint.current_week !== weekNumber) return { error: "Invalid week" };

  const { data: membership } = await supabase
    .from("family_members")
    .select("id")
    .eq("family_id", sprint.family_id)
    .eq("user_id", user.id)
    .single();

  if (!membership) return { error: "Not a family member" };

  // Check user has completed all activities for this week
  const { data: weekActivities } = await supabase
    .from("activities")
    .select("id")
    .eq("theme_id", sprint.theme_id)
    .eq("week_number", weekNumber);

  const activityIds = (weekActivities ?? []).map((a) => a.id);

  if (activityIds.length > 0) {
    const { data: userResponses } = await supabase
      .from("responses")
      .select("activity_id")
      .eq("sprint_id", sprintId)
      .eq("user_id", user.id)
      .in("activity_id", activityIds);

    const respondedSet = new Set(
      (userResponses ?? []).map((r) => r.activity_id)
    );
    if (respondedSet.size < activityIds.length) {
      return { error: "You must complete all activities before voting to advance" };
    }
  }

  // Insert vote (upsert in case of re-vote)
  const { error: voteError } = await supabase.from("week_votes").upsert(
    {
      sprint_id: sprintId,
      user_id: user.id,
      week_number: weekNumber,
    },
    { onConflict: "sprint_id,user_id,week_number" }
  );

  if (voteError) return { error: voteError.message };

  // Check if all members have voted and completed
  await tryAdvanceWeek(sprintId, sprint.family_id, sprint.theme_id, weekNumber);

  revalidatePath("/dashboard/sprint");
  return { success: true };
}

export async function removeAdvanceVote(sprintId: string, weekNumber: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  await supabase
    .from("week_votes")
    .delete()
    .eq("sprint_id", sprintId)
    .eq("user_id", user.id)
    .eq("week_number", weekNumber);

  revalidatePath("/dashboard/sprint");
  return { success: true };
}

async function tryAdvanceWeek(
  sprintId: string,
  familyId: string,
  themeId: string,
  weekNumber: number
) {
  const supabase = await createClient();

  // Get all family members
  const { data: members } = await supabase
    .from("family_members")
    .select("user_id")
    .eq("family_id", familyId);

  if (!members || members.length === 0) return;

  // Get activities for this week
  const { data: weekActivities } = await supabase
    .from("activities")
    .select("id")
    .eq("theme_id", themeId)
    .eq("week_number", weekNumber);

  const activityIds = (weekActivities ?? []).map((a) => a.id);

  // Check all members completed all activities
  for (const member of members) {
    if (activityIds.length > 0) {
      const { data: responses } = await supabase
        .from("responses")
        .select("activity_id")
        .eq("sprint_id", sprintId)
        .eq("user_id", member.user_id)
        .in("activity_id", activityIds);

      const respondedSet = new Set(
        (responses ?? []).map((r) => r.activity_id)
      );
      if (respondedSet.size < activityIds.length) return;
    }
  }

  // Check all members have voted
  const { data: votes } = await supabase
    .from("week_votes")
    .select("user_id")
    .eq("sprint_id", sprintId)
    .eq("week_number", weekNumber);

  const voteSet = new Set((votes ?? []).map((v) => v.user_id));
  for (const member of members) {
    if (!voteSet.has(member.user_id)) return;
  }

  // All conditions met — advance the week
  if (weekNumber < 6) {
    await supabase
      .from("family_sprints")
      .update({ current_week: weekNumber + 1 })
      .eq("id", sprintId);
  } else {
    // Week 6 completed — mark sprint as completed
    await supabase
      .from("family_sprints")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("id", sprintId);
  }
}

// ── Disband Sprint ──────────────────────────────────────────

export async function voteToDisbandSprint(sprintId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Verify sprint exists and is active
  const { data: sprint } = await supabase
    .from("family_sprints")
    .select("id, family_id")
    .eq("id", sprintId)
    .eq("status", "active")
    .single();

  if (!sprint) return { error: "Sprint not found" };

  // Verify user is a family member
  const { data: membership } = await supabase
    .from("family_members")
    .select("id")
    .eq("family_id", sprint.family_id)
    .eq("user_id", user.id)
    .single();

  if (!membership) return { error: "Not a family member" };

  // Insert vote (upsert in case of re-vote)
  const { error: voteError } = await supabase.from("disband_votes").upsert(
    {
      sprint_id: sprintId,
      user_id: user.id,
    },
    { onConflict: "sprint_id,user_id" }
  );

  if (voteError) return { error: voteError.message };

  // Check if all members have voted to disband
  await tryDisbandSprint(sprintId, sprint.family_id);

  revalidatePath("/dashboard/sprint");
  return { success: true };
}

export async function removeDisbandVote(sprintId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  await supabase
    .from("disband_votes")
    .delete()
    .eq("sprint_id", sprintId)
    .eq("user_id", user.id);

  revalidatePath("/dashboard/sprint");
  return { success: true };
}

async function tryDisbandSprint(sprintId: string, familyId: string) {
  const supabase = await createClient();

  // Get all family members
  const { data: members } = await supabase
    .from("family_members")
    .select("user_id")
    .eq("family_id", familyId);

  if (!members || members.length === 0) return;

  // Check all members have voted to disband
  const { data: votes } = await supabase
    .from("disband_votes")
    .select("user_id")
    .eq("sprint_id", sprintId);

  const voteSet = new Set((votes ?? []).map((v) => v.user_id));
  for (const member of members) {
    if (!voteSet.has(member.user_id)) return;
  }

  // All members voted — abandon the sprint
  await supabase
    .from("family_sprints")
    .update({
      status: "abandoned",
      completed_at: new Date().toISOString(),
    })
    .eq("id", sprintId);
}

// ── Proposals ───────────────────────────────────────────────

export async function submitProposal(
  sprintId: string,
  activityId: string,
  formData: FormData
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { error: "Title is required" };

  const description = String(formData.get("description") ?? "").trim() || null;
  const photo_url = String(formData.get("photo_url") ?? "").trim() || null;
  const link_url = String(formData.get("link_url") ?? "").trim() || null;
  const budget_note = String(formData.get("budget_note") ?? "").trim() || null;
  const servingsStr = formData.get("servings");
  const servings = servingsStr ? parseInt(String(servingsStr), 10) || null : null;

  const { error } = await supabase.from("proposals").insert({
    sprint_id: sprintId,
    activity_id: activityId,
    user_id: user.id,
    title,
    description,
    photo_url,
    link_url,
    budget_note,
    servings,
  });

  if (error) {
    if (error.code === "23505") return { error: "Je hebt al een voorstel ingediend" };
    return { error: error.message };
  }

  // Also submit as a response so progression system counts it
  await supabase.from("responses").upsert(
    {
      sprint_id: sprintId,
      activity_id: activityId,
      user_id: user.id,
      type: "text",
      content: title,
      is_anonymous: false,
    },
    { onConflict: "sprint_id,activity_id,user_id" }
  );

  revalidatePath("/dashboard/sprint");
  return { success: true };
}

export async function voteForProposal(proposalId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Check user hasn't exceeded vote limit (2 per activity)
  const { data: proposal } = await supabase
    .from("proposals")
    .select("activity_id, sprint_id")
    .eq("id", proposalId)
    .single();

  if (!proposal) return { error: "Proposal not found" };

  const { data: existingVotes } = await supabase
    .from("proposal_votes")
    .select("id, proposal_id")
    .eq("user_id", user.id);

  // Count votes for proposals in the same activity
  const { data: activityProposals } = await supabase
    .from("proposals")
    .select("id")
    .eq("activity_id", proposal.activity_id)
    .eq("sprint_id", proposal.sprint_id);

  const activityProposalIds = new Set(
    (activityProposals ?? []).map((p) => p.id)
  );
  const votesForActivity = (existingVotes ?? []).filter((v) =>
    activityProposalIds.has(v.proposal_id)
  );

  if (votesForActivity.length >= 2) {
    return { error: "Je mag maximaal 2 stemmen uitbrengen" };
  }

  const { error } = await supabase.from("proposal_votes").insert({
    proposal_id: proposalId,
    user_id: user.id,
  });

  if (error) {
    if (error.code === "23505") return { error: "Je hebt al op dit voorstel gestemd" };
    return { error: error.message };
  }

  revalidatePath("/dashboard/sprint");
  return { success: true };
}

export async function removeProposalVote(proposalId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  await supabase
    .from("proposal_votes")
    .delete()
    .eq("proposal_id", proposalId)
    .eq("user_id", user.id);

  revalidatePath("/dashboard/sprint");
  return { success: true };
}

// ── Video Upload ────────────────────────────────────────────

export async function uploadResponseVideo(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const file = formData.get("video") as File | null;
  if (!file || file.size === 0) return { error: "No video selected" };

  const allowed = ["video/mp4", "video/webm", "video/quicktime"];
  if (!allowed.includes(file.type)) {
    return { error: "Only MP4, WebM, and MOV videos are allowed" };
  }

  if (file.size > 50 * 1024 * 1024) {
    return { error: "Video must be under 50 MB" };
  }

  const ext = file.name.split(".").pop() ?? "mp4";
  const path = `${user.id}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("responses")
    .upload(path, file, { upsert: false });

  if (uploadError) return { error: uploadError.message };

  const {
    data: { publicUrl },
  } = supabase.storage.from("responses").getPublicUrl(path);

  return { url: publicUrl };
}

// ── Survey ──────────────────────────────────────────────────

export async function submitSurveyResponse(
  sprintId: string,
  activityId: string,
  answers: Record<string, string | string[]>
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const content = JSON.stringify(answers);

  const { error } = await supabase.from("responses").insert({
    sprint_id: sprintId,
    activity_id: activityId,
    user_id: user.id,
    type: "text",
    content,
    is_anonymous: false,
  });

  if (error) return { error: error.message };
  revalidatePath("/dashboard/sprint");
  return { success: true };
}
