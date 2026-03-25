import { redirect } from "next/navigation";
import { getCurrentUser, getUserProfile } from "@/lib/queries";
import ProfileForm from "./profile-form";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const profile = await getUserProfile(user.id);

  return (
    <div className="flex flex-col items-center gap-6 py-8">
      <h1 className="font-display text-2xl font-semibold text-night">
        Your Profile
      </h1>
      <p className="text-clay text-[14px]">{user.email}</p>

      <ProfileForm currentName={profile?.display_name ?? ""} />
    </div>
  );
}
