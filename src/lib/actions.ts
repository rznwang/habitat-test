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

  revalidatePath("/");
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
  revalidatePath("/");
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
  revalidatePath("/");
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

  revalidatePath("/");
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
  revalidatePath(`/sprint/${sprintId}`);
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
