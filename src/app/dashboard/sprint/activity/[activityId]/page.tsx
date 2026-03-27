import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getCurrentUser, getProposals, getSurveyResults } from "@/lib/queries";
import ResponseForm from "./response-form";
import ResponseCard from "./response-card";
import ProposalForm from "./proposal-form";
import ProposalCard from "./proposal-card";
import SurveyForm from "./survey-form";
import SurveyResults from "./survey-results";
import SprintSidebar from "../../sprint-sidebar";

// Familiesprint theme ID
const FAMILIESPRINT_THEME_ID = "11111111-1111-1111-1111-111111111104";

// Activity IDs for proposal activities (week 2 & 4, sort_order 1 = propose, sort_order 2 = vote)
const PROPOSAL_ACTIVITY_IDS = new Set([
  "a4040404-0404-0404-0404-040404040201", // week 2 propose
  "a4040404-0404-0404-0404-040404040401", // week 4 propose
]);
const VOTE_ACTIVITY_IDS = new Set([
  "a4040404-0404-0404-0404-040404040202", // week 2 vote
  "a4040404-0404-0404-0404-040404040402", // week 4 vote
]);
const BUDGET_PROPOSAL_IDS = new Set([
  "a4040404-0404-0404-0404-040404040401", // week 4 propose (budget menu)
  "a4040404-0404-0404-0404-040404040402", // week 4 vote
]);

// Survey activity IDs (week 6)
const SURVEY_ACTIVITY_IDS = new Set([
  "a4040404-0404-0404-0404-040404040601",
  "a4040404-0404-0404-0404-040404040602",
  "a4040404-0404-0404-0404-040404040603",
]);

// Vlog activity (week 5, sort_order 1)
const VLOG_ACTIVITY_ID = "a4040404-0404-0404-0404-040404040501";

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

  const isProposalActivity = PROPOSAL_ACTIVITY_IDS.has(activityId);
  const isVoteActivity = VOTE_ACTIVITY_IDS.has(activityId);
  const isSurveyActivity = SURVEY_ACTIVITY_IDS.has(activityId);
  const isVlogActivity = activityId === VLOG_ACTIVITY_ID;
  const isBudgetActivity = BUDGET_PROPOSAL_IDS.has(activityId);

  // For vote activities, find the corresponding proposal activity to get proposals
  let proposalActivityId = activityId;
  if (isVoteActivity) {
    // Vote activities (sort_order 2) correspond to proposal activities (sort_order 1) in same week
    if (activityId === "a4040404-0404-0404-0404-040404040202") {
      proposalActivityId = "a4040404-0404-0404-0404-040404040201";
    } else if (activityId === "a4040404-0404-0404-0404-040404040402") {
      proposalActivityId = "a4040404-0404-0404-0404-040404040401";
    }
  }

  // Fetch proposals if this is a proposal or vote activity
  let proposals: Awaited<ReturnType<typeof getProposals>> = [];
  let userVoteCount = 0;
  if (isProposalActivity || isVoteActivity) {
    proposals = await getProposals(sprintId, proposalActivityId, user.id);
    // Count user's votes across all proposals for this activity
    const { data: allProposals } = await supabase
      .from("proposals")
      .select("id")
      .eq("sprint_id", sprintId)
      .eq("activity_id", proposalActivityId);
    if (allProposals && allProposals.length > 0) {
      const { data: votes } = await supabase
        .from("proposal_votes")
        .select("id")
        .eq("user_id", user.id)
        .in("proposal_id", allProposals.map((p) => p.id));
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

  const totalVotes = proposals.reduce((sum, p) => sum + (p.vote_count ?? 0), 0);
  const maxVotes = Math.max(...proposals.map((p) => p.vote_count ?? 0), 0);
  const winnerProposal = proposals.length > 0 && totalVotes > 0
    ? proposals.reduce((best, p) => ((p.vote_count ?? 0) > (best.vote_count ?? 0) ? p : best))
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
    <div className="flex gap-8">
      <SprintSidebar currentActivityId={activityId} sprintId={sprintId} />

      <div className="flex-1 min-w-0 flex flex-col gap-6">
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

      {/* Proposal form (for propose activities) */}
      {isProposalActivity && !userProposed && (
        <ProposalForm
          sprintId={sprintId}
          activityId={activityId}
          showBudgetFields={isBudgetActivity}
          showTripSuggestions={activityId === "a4040404-0404-0404-0404-040404040201"}
        />
      )}

      {isProposalActivity && userProposed && (
        <div className="rounded-[12px] bg-sage/10 border border-sage/30 p-3 text-[13px] text-olive text-center">
          ✓ Je hebt je voorstel ingediend
        </div>
      )}

      {/* Proposal cards (for both propose and vote activities) */}
      {(isProposalActivity || isVoteActivity) && proposals.length > 0 && (
        <div className="flex flex-col gap-4">
          <h2 className="text-[12px] font-medium text-clay uppercase tracking-[0.04em]">
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
              isWinner={winnerProposal?.id === proposal.id && totalVotes > 0}
            />
          ))}
          {isVoteActivity && userVoteCount > 0 && (
            <div className="rounded-[12px] bg-sage/10 border border-sage/30 p-3 text-[13px] text-olive text-center">
              ✓ Je hebt {userVoteCount} stem{userVoteCount !== 1 ? "men" : ""} uitgebracht (max 2)
            </div>
          )}
        </div>
      )}

      {/* Survey form (for week 6 survey activities) */}
      {isSurveyActivity && !userResponded && (
        <SurveyForm
          sprintId={sprintId}
          activityId={activityId}
          sortOrder={activity.sort_order}
        />
      )}

      {isSurveyActivity && userResponded && (
        <div className="rounded-[12px] bg-sage/10 border border-sage/30 p-3 text-[13px] text-olive text-center">
          ✓ Je hebt de vragenlijst ingevuld
        </div>
      )}

      {/* Survey results */}
      {isSurveyActivity && surveyData && surveyData.totalResponses > 0 && (
        <SurveyResults
          aggregated={surveyData.aggregated}
          totalResponses={surveyData.totalResponses}
        />
      )}

      {/* Standard response form (for non-proposal, non-survey activities) */}
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
        <div className="rounded-[12px] bg-sage/10 border border-sage/30 p-3 text-[13px] text-olive text-center">
          ✓ You&apos;ve submitted your response
        </div>
      )}

      {/* Vote activities also need a response for progression */}
      {isVoteActivity && !userResponded && userVoteCount > 0 && (
        <ResponseForm
          sprintId={sprintId}
          activityId={activityId}
          activityType="question"
          isAnonymous={false}
        />
      )}

      {/* Responses */}
      {!isSurveyActivity && (
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
      )}
      </div>
    </div>
  );
}
