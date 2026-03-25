import { redirect } from "next/navigation";
import Link from "next/link";
import {
  getCurrentUser,
  getUserFamily,
  getCompletedSprints,
} from "@/lib/queries";

export default async function MemoryPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const membership = await getUserFamily(user.id);
  if (!membership?.families) redirect("/dashboard");

  const family = membership.families as { id: string; name: string };
  const completedSprints = await getCompletedSprints(family.id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-night">
          Memory Book
        </h1>
        <p className="text-clay text-[14px] mt-1">
          A digital scrapbook from your completed sprints.
        </p>
      </div>

      {completedSprints.length === 0 ? (
        <div className="rounded-[16px] border border-latte bg-linen p-8 text-center">
          <p className="text-3xl mb-3">📖</p>
          <p className="text-[15px] text-clay">
            Complete your first sprint to unlock your first memory book!
          </p>
          <Link
            href="/dashboard/sprint"
            className="inline-flex h-10 items-center rounded-[12px] bg-umber px-5 text-cream text-[14px] font-semibold hover:bg-bark transition-colors mt-4"
          >
            Go to Sprint
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {completedSprints.map((sprint) => {
            const theme = sprint.sprint_themes as {
              name: string;
              icon?: string;
              description?: string;
            } | null;
            const book = Array.isArray(sprint.memory_books)
              ? sprint.memory_books[0]
              : sprint.memory_books;

            return (
              <div
                key={sprint.id}
                className="rounded-[16px] border border-latte bg-linen p-5"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[16px] font-semibold text-night">
                      {theme?.icon} {theme?.name}
                    </p>
                    <p className="text-[12px] text-clay mt-1">
                      {new Date(sprint.started_at).toLocaleDateString()} –{" "}
                      {new Date(sprint.ends_at).toLocaleDateString()}
                    </p>
                  </div>

                  {book?.pdf_url ? (
                    <a
                      href={book.pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-9 rounded-[8px] bg-sage px-4 text-[13px] font-medium text-cream hover:bg-olive transition-colors inline-flex items-center"
                    >
                      View PDF
                    </a>
                  ) : (
                    <span className="text-[12px] text-clay bg-cream px-3 py-1.5 rounded-full border border-latte">
                      {book ? "Generating…" : "Pending"}
                    </span>
                  )}
                </div>

                {theme?.description && (
                  <p className="text-[13px] text-clay mt-3">
                    {theme.description}
                  </p>
                )}

                <Link
                  href={`/dashboard/memory/${sprint.id}`}
                  className="text-[13px] text-sage hover:text-olive transition-colors mt-3 inline-block"
                >
                  View all responses →
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
