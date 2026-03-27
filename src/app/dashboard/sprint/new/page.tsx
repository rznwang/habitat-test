import { redirect } from "next/navigation";
import Link from "next/link";
import {
  getCurrentUser,
  getUserFamily,
  getSprintThemes,
} from "@/lib/queries";
import StartSprintButton from "./start-sprint-button";
import { ChevronLeftIcon, SparklesIcon } from "../icons";
import { FloatingLeaves } from "../illustrations";

export default async function NewSprintPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const membership = await getUserFamily(user.id);
  if (!membership?.families) redirect("/dashboard");

  const family = membership.families as { id: string; name: string };
  const themes = await getSprintThemes();

  return (
    <div className="relative flex flex-col gap-6 -mx-4 -mt-2">
      <FloatingLeaves className="absolute -top-6 -right-10 w-56 h-56" />

      <div className="px-4 pt-4">
        <Link
          href="/dashboard/sprint"
          className="inline-flex items-center gap-1.5 text-[13px] text-clay hover:text-bark transition-colors"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          <span>Back</span>
        </Link>
      </div>

      <div className="px-4">
        <h1 className="font-display text-2xl font-semibold text-night">
          Choose a sprint theme
        </h1>
        <p className="text-clay text-[14px] mt-1">
          Each sprint lasts 6 weeks with 1–2 activities per week.
        </p>
      </div>

      <div className="px-4">
        {themes.length === 0 ? (
          <p className="text-clay text-[14px] py-8 text-center">
            No themes available yet. Check back soon!
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {themes.map((theme) => (
              <div
                key={theme.id}
                className="flex items-center gap-4 rounded-[16px] border border-latte bg-linen p-5"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sage/10 text-sage">
                  <SparklesIcon className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[16px] font-semibold text-night">
                    {theme.name}
                  </p>
                  {theme.description && (
                    <p className="text-[13px] text-clay mt-1">
                      {theme.description}
                    </p>
                  )}
                </div>
                <StartSprintButton
                  familyId={family.id}
                  themeId={theme.id}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
