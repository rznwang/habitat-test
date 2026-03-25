import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser, getUserFamily, getFamilyPhotos } from "@/lib/queries";
import PhotoUploadForm from "./photo-upload-form";
import PhotoCard from "./photo-card";

export default async function PhotosPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const membership = await getUserFamily(user.id);
  if (!membership?.families) redirect("/dashboard");

  const family = membership.families as { id: string; name: string };
  const photos = await getFamilyPhotos(family.id);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/dashboard/family"
            className="text-[12px] font-medium text-clay hover:text-bark transition-colors"
          >
            &larr; Back to Family
          </Link>
          <h1 className="font-display text-2xl font-semibold text-night mt-1">
            📷 Picture Book
          </h1>
          <p className="text-clay text-[14px] mt-1">
            {family.name}&apos;s shared photo album
          </p>
        </div>
      </div>

      <PhotoUploadForm familyId={family.id} />

      {photos.length === 0 ? (
        <div className="rounded-[16px] border border-latte bg-linen p-8 text-center">
          <p className="text-3xl mb-3">🖼️</p>
          <p className="text-[15px] text-clay">
            No photos yet. Upload the first one!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {photos.map((photo) => (
            <PhotoCard
              key={photo.id}
              photo={photo}
              currentUserId={user.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
