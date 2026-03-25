import { redirect } from "next/navigation";
import {
  getCurrentUser,
  getUserFamily,
  getSprintThemes,
} from "@/lib/queries";
import StartSprintButton from "./start-sprint-button";

export default async function NewSprintPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const membership = await getUserFamily(user.id);
  if (!membership?.families) redirect("/dashboard");

  const family = membership.families as { id: string; name: string };
  const themes = await getSprintThemes();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-night">
          Choose a sprint theme
        </h1>
        <p className="text-clay text-[14px] mt-1">
          Each sprint lasts 6 weeks with 3 activities unlocking per week.
        </p>
      </div>

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
              <span className="text-3xl">{theme.icon ?? "🎯"}</span>
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
  );
}
