import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { getCurrentUser, getProposals, getSurveyResults } from "@/lib/queries";
import ResponseForm from "./response-form";
import ResponseCard from "./response-card";
import ProposalForm from "./proposal-form";
import ProposalCard from "./proposal-card";
import SurveyForm from "./survey-form";
import SurveyResults from "./survey-results";
import {
  ChevronLeftIcon,
  ActivityTypeIcon,
  CheckIcon,
} from "../../icons";
import { SoftBlob } from "../../illustrations";

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

  // Fetch activity with layout field
  const { data: activity } = await supabase
    .from("activities")
    .select("*")
    .eq("id", activityId)
    .single();

  if (!activity) redirect("/dashboard/sprint");

  // Determine activity mode from layout field (data-driven) with fallback to ID matching
  const layout = activity.layout as string | null;
  const isProposalActivity = layout === "proposal";
  const isSurveyActivity = layout === "survey";
  const isVlogActivity = layout === "immersive-video";
  const isBudgetActivity =
    isProposalActivity && activity.week_number === 4;

  // Fetch proposals if this is a proposal layout activity
  let proposals: Awaited<ReturnType<typeof getProposals>> = [];
  let userVoteCount = 0;
  if (isProposalActivity) {
    proposals = await getProposals(sprintId, activityId, user.id);
    const { data: allProposals } = await supabase
      .from("proposals")
      .select("id")
      .eq("sprint_id", sprintId)
      .eq("activity_id", activityId);
    if (allProposals && allProposals.length > 0) {
      const { data: votes } = await supabase
        .from("proposal_votes")
        .select("id")
        .eq("user_id", user.id)
        .in(
          "proposal_id",
          allProposals.map((p) => p.id)
        );
      userVoteCount = votes?.length ?? 0;
    }
  }

  // Fetch survey results if this is a survey activity
  let surveyData: Awaited<ReturnType<typeof getSurveyResults>> | null = null;
  if (isSurveyActivity) {
    surveyData = await getSurveyResults(sprintId, activityId);
  }

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
  const userProposed = proposals.some((p) => p.user_id === user.id);

  const totalVotes = proposals.reduce(
    (sum, p) => sum + (p.vote_count ?? 0),
    0
  );
  const maxVotes = Math.max(
    ...proposals.map((p) => p.vote_count ?? 0),
    0
  );
  const winnerProposal =
    proposals.length > 0 && totalVotes > 0
      ? proposals.reduce((best, p) =>
          (p.vote_count ?? 0) > (best.vote_count ?? 0) ? p : best
        )
      : null;

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
    <div className="relative flex flex-col gap-6 -mx-4 -mt-2">
      {/* Background illustration */}
      <SoftBlob className="absolute -top-10 -right-16 w-72 h-72" />

      {/* Back navigation */}
      <div className="px-4 pt-4">
        <Link
          href="/dashboard/sprint"
          className="inline-flex items-center gap-1.5 text-[13px] text-clay hover:text-bark transition-colors"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          <span>Sprint overview</span>
        </Link>
      </div>

      {/* Activity header */}
      <div className="px-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linen text-clay">
            <ActivityTypeIcon type={activity.type} className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-clay uppercase tracking-[0.06em]">
              {activityTypeLabels[activity.type] ?? activity.type}
              {activity.is_anonymous && " · Anonymous"}
            </p>
            <p className="text-[11px] text-clay/60">
              Week {activity.week_number}
            </p>
          </div>
        </div>
        <h1 className="font-display text-[20px] font-semibold text-night leading-snug">
          {activity.prompt}
        </h1>
      </div>

      <div className="px-4 flex flex-col gap-6">
        {/* Proposal form (for proposal layout activities) */}
        {isProposalActivity && !userProposed && (
          <ProposalForm
            sprintId={sprintId}
            activityId={activityId}
            showBudgetFields={isBudgetActivity}
            showTripSuggestions={activity.week_number === 2}
          />
        )}

        {isProposalActivity && userProposed && (
          <div className="rounded-[14px] bg-sage/8 border border-sage/20 p-4 flex items-center gap-2 justify-center">
            <CheckIcon className="h-4 w-4 text-olive" />
            <span className="text-[13px] text-olive font-medium">
              Je hebt je voorstel ingediend
            </span>
          </div>
        )}

        {/* Proposal cards */}
        {isProposalActivity && proposals.length > 0 && (
          <div className="flex flex-col gap-4">
            <h2 className="text-[12px] font-semibold text-clay uppercase tracking-[0.06em]">
              Voorstellen ({proposals.length})
            </h2>
            {proposals.map((proposal) => (
              <ProposalCard
                key={proposal.id}
                proposal={proposal}
                currentUserId={user.id}
                maxVotes={maxVotes}
                totalVotes={totalVotes}
                userVoteCount={userVoteCount}
                isWinner={
                  winnerProposal?.id === proposal.id && totalVotes > 0
                }
              />
            ))}
            {userVoteCount > 0 && (
              <div className="rounded-[14px] bg-sage/8 border border-sage/20 p-4 flex items-center gap-2 justify-center">
                <CheckIcon className="h-4 w-4 text-olive" />
                <span className="text-[13px] text-olive font-medium">
                  Je hebt {userVoteCount} stem
                  {userVoteCount !== 1 ? "men" : ""} uitgebracht (max 2)
                </span>
              </div>
            )}
          </div>
        )}

        {/* Survey form */}
        {isSurveyActivity && !userResponded && (
          <SurveyForm
            sprintId={sprintId}
            activityId={activityId}
            sortOrder={activity.sort_order}
          />
        )}

        {isSurveyActivity && userResponded && (
          <div className="rounded-[14px] bg-sage/8 border border-sage/20 p-4 flex items-center gap-2 justify-center">
            <CheckIcon className="h-4 w-4 text-olive" />
            <span className="text-[13px] text-olive font-medium">
              Je hebt de vragenlijst ingevuld
            </span>
          </div>
        )}

        {/* Survey results */}
        {isSurveyActivity &&
          surveyData &&
          surveyData.totalResponses > 0 && (
            <SurveyResults
              aggregated={surveyData.aggregated}
              totalResponses={surveyData.totalResponses}
            />
          )}

        {/* Standard response form */}
        {!isProposalActivity && !isSurveyActivity && !userResponded && (
          <ResponseForm
            sprintId={sprintId}
            activityId={activityId}
            activityType={activity.type}
            isAnonymous={activity.is_anonymous}
            showVideoUpload={isVlogActivity}
          />
        )}

        {!isProposalActivity && !isSurveyActivity && userResponded && (
          <div className="rounded-[14px] bg-sage/8 border border-sage/20 p-4 flex items-center gap-2 justify-center">
            <CheckIcon className="h-4 w-4 text-olive" />
            <span className="text-[13px] text-olive font-medium">
              You&apos;ve submitted your response
            </span>
          </div>
        )}

        {/* Responses */}
        {!isSurveyActivity && (
          <div className="flex flex-col gap-4">
            <h2 className="text-[12px] font-semibold text-clay uppercase tracking-[0.06em]">
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
              <p className="text-clay text-[14px] py-6 text-center">
                No responses yet. Be the first!
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
