import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getCurrentUser } from "@/lib/queries";

export default async function MemoryDetailPage({
  params,
}: {
  params: Promise<{ sprintId: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { sprintId } = await params;
  const supabase = await createClient();

  // Get sprint info
  const { data: sprint } = await supabase
    .from("family_sprints")
    .select("*, sprint_themes(*)")
    .eq("id", sprintId)
    .single();

  if (!sprint) redirect("/dashboard/memory");

  // Get all responses grouped by activity
  const { data: activities } = await supabase
    .from("activities")
    .select("*")
    .eq("theme_id", sprint.theme_id)
    .order("week_number")
    .order("sort_order");

  const { data: responses } = await supabase
    .from("responses")
    .select("*, users(id, display_name, avatar_url)")
    .eq("sprint_id", sprintId)
    .order("created_at");

  const theme = sprint.sprint_themes as {
    name: string;
    icon?: string;
  } | null;

  const responsesByActivity = new Map<string, typeof responses>();
  for (const r of responses ?? []) {
    const list = responsesByActivity.get(r.activity_id) ?? [];
    list.push(r);
    responsesByActivity.set(r.activity_id, list);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-[12px] font-medium text-clay uppercase tracking-[0.04em]">
          Memory Book
        </p>
        <h1 className="font-display text-2xl font-semibold text-night mt-1">
          {theme?.icon} {theme?.name}
        </h1>
        <p className="text-[13px] text-clay mt-1">
          {new Date(sprint.started_at).toLocaleDateString()} –{" "}
          {new Date(sprint.ends_at).toLocaleDateString()}
        </p>
      </div>

      {(activities ?? []).map((activity) => {
        const activityResponses =
          responsesByActivity.get(activity.id) ?? [];
        return (
          <div key={activity.id} className="flex flex-col gap-2">
            <div className="sticky top-14 z-10 bg-cream/90 backdrop-blur-sm py-2">
              <p className="text-[12px] font-medium text-clay uppercase tracking-[0.04em]">
                Week {activity.week_number} • {activity.type}
              </p>
              <p className="text-[15px] font-semibold text-night">
                {activity.prompt}
              </p>
            </div>

            {activityResponses.length > 0 ? (
              <div className="flex flex-col gap-2">
                {activityResponses.map((r) => {
                  const u = r.users as {
                    display_name?: string;
                  } | null;
                  const name =
                    activity.is_anonymous || r.is_anonymous
                      ? "Anonymous"
                      : u?.display_name ?? "Unknown";

                  return (
                    <div
                      key={r.id}
                      className="rounded-[12px] border border-latte bg-linen p-3"
                    >
                      <p className="text-[12px] font-medium text-clay mb-1">
                        {name}
                      </p>
                      {r.type === "image" && r.content ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={r.content}
                          alt="Response"
                          className="rounded-[8px] max-h-48 object-cover"
                        />
                      ) : (
                        <p className="text-[14px] text-bark whitespace-pre-wrap">
                          {r.content}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-[13px] text-clay/50 italic">
                No responses
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
