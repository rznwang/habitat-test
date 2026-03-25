import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getCurrentUser } from "@/lib/queries";
import ResponseForm from "./response-form";
import ResponseCard from "./response-card";

export default async function ActivityPage({
  params,
  searchParams,
}: {
  params: Promise<{ activityId: string }>;
  searchParams: Promise<{ sprint?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { activityId } = await params;
  const { sprint: sprintId } = await searchParams;
  if (!sprintId) redirect("/dashboard/sprint");

  const supabase = await createClient();

  // Fetch activity
  const { data: activity } = await supabase
    .from("activities")
    .select("*")
    .eq("id", activityId)
    .single();

  if (!activity) redirect("/dashboard/sprint");

  // Fetch responses with users, reactions, comments
  const { data: responses } = await supabase
    .from("responses")
    .select(
      "*, users(id, display_name, avatar_url), reactions(*), comments(*, users(id, display_name))"
    )
    .eq("sprint_id", sprintId)
    .eq("activity_id", activityId)
    .order("created_at", { ascending: false });

  const userResponded = responses?.some((r) => r.user_id === user.id);

  const activityTypeLabels: Record<string, string> = {
    question: "Question",
    photo: "Photo Challenge",
    poll: "Poll",
    dare: "Dare",
    draw: "Draw & Guess",
    story: "Story Starter",
    confession: "Anonymous Confession",
    voice: "Voice Note",
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Activity header */}
      <div>
        <p className="text-[12px] font-medium text-clay uppercase tracking-[0.04em]">
          {activityTypeLabels[activity.type] ?? activity.type}
          {activity.is_anonymous && " • Anonymous"}
        </p>
        <h1 className="font-display text-xl font-semibold text-night mt-2">
          {activity.prompt}
        </h1>
      </div>

      {/* Response form */}
      {!userResponded && (
        <ResponseForm
          sprintId={sprintId}
          activityId={activityId}
          activityType={activity.type}
          isAnonymous={activity.is_anonymous}
        />
      )}

      {userResponded && (
        <div className="rounded-[12px] bg-sage/10 border border-sage/30 p-3 text-[13px] text-olive text-center">
          ✓ You&apos;ve submitted your response
        </div>
      )}

      {/* Responses */}
      <div className="flex flex-col gap-4">
        <h2 className="text-[12px] font-medium text-clay uppercase tracking-[0.04em]">
          Responses ({responses?.length ?? 0})
        </h2>

        {responses?.map((response) => (
          <ResponseCard
            key={response.id}
            response={response}
            currentUserId={user.id}
            isAnonymous={activity.is_anonymous}
            allowComments={activity.allow_comments}
          />
        ))}

        {(!responses || responses.length === 0) && (
          <p className="text-clay text-[14px] py-4 text-center">
            No responses yet. Be the first!
          </p>
        )}
      </div>
    </div>
  );
}
