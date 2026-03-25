import { redirect } from "next/navigation";
import Link from "next/link";
import {
  getCurrentUser,
  getUserFamily,
  getFamilyMembers,
} from "@/lib/queries";
import InviteButton from "./invite-button";

export default async function FamilyPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const membership = await getUserFamily(user.id);
  if (!membership?.families) redirect("/dashboard");

  const family = membership.families as { id: string; name: string; created_by: string };
  const members = await getFamilyMembers(family.id);
  const isAdmin = membership.role === "admin";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-night">
          {family.name}
        </h1>
        {isAdmin && <InviteButton familyId={family.id} />}
      </div>

      <Link
        href="/dashboard/family/photos"
        className="flex items-center gap-3 rounded-[16px] border border-latte bg-linen p-4 hover:border-umber transition-colors"
      >
        <span className="text-2xl">📷</span>
        <div>
          <p className="text-[15px] font-medium text-night">Picture Book</p>
          <p className="text-[12px] text-clay">
            Shared family photo album
          </p>
        </div>
        <span className="ml-auto text-clay">&rarr;</span>
      </Link>

      <div className="flex flex-col gap-3">
        {members.map((m) => {
          const u = m.users as {
            id: string;
            display_name?: string;
            email?: string;
            avatar_url?: string;
          } | null;
          return (
            <div
              key={m.id}
              className="flex items-center gap-3 rounded-[16px] border border-latte bg-linen p-4"
            >
              <div className="h-10 w-10 rounded-full bg-sage/30 flex items-center justify-center text-sm font-semibold text-olive">
                {(u?.display_name ?? u?.email ?? "?")[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-medium text-night truncate">
                  {u?.display_name ?? u?.email ?? "Unknown"}
                </p>
                <p className="text-[12px] text-clay">
                  {m.role} • {m.household} household
                </p>
              </div>
              {u?.id === user.id && (
                <span className="text-[11px] bg-sage/20 text-olive px-2 py-0.5 rounded-full">
                  You
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
