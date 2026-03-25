import { redirect } from "next/navigation";
import { getCurrentUser, getUserProfile, getUserFamilies } from "@/lib/queries";
import ProfileForm from "./profile-form";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [profile, familyMemberships] = await Promise.all([
    getUserProfile(user.id),
    getUserFamilies(user.id),
  ]);

  const families = familyMemberships.map((m) => {
    const fam = m.families as { id: string; name: string } | null;
    return {
      id: fam?.id ?? m.family_id,
      name: fam?.name ?? "Unknown",
      role: m.role as string,
    };
  });

  return (
    <div className="flex flex-col items-center gap-6 py-8">
      <h1 className="font-display text-2xl font-semibold text-night">
        Your Profile
      </h1>
      <p className="text-clay text-[14px]">{user.email}</p>

      <ProfileForm
        currentName={profile?.display_name ?? ""}
        currentBio={profile?.bio ?? ""}
        currentAvatarUrl={profile?.avatar_url ?? null}
        families={families}
      />
    </div>
  );
}
