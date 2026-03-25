import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, getUserFamily } from "@/lib/queries";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const membership = await getUserFamily(user.id);

  return (
    <div className="flex min-h-screen flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-latte bg-cream/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link
            href="/dashboard"
            className="font-display text-lg font-semibold text-night"
          >
            Family Bonds
          </Link>

          <nav className="flex items-center gap-4 text-[13px] font-medium text-clay">
            {membership?.families && (
              <>
                <Link
                  href="/dashboard"
                  className="hover:text-bark transition-colors"
                >
                  Home
                </Link>
                <Link
                  href="/dashboard/sprint"
                  className="hover:text-bark transition-colors"
                >
                  Sprint
                </Link>
                <Link
                  href="/dashboard/family"
                  className="hover:text-bark transition-colors"
                >
                  Family
                </Link>
                <Link
                  href="/dashboard/stats"
                  className="hover:text-bark transition-colors"
                >
                  Stats
                </Link>
                <Link
                  href="/dashboard/memory"
                  className="hover:text-bark transition-colors"
                >
                  Memories
                </Link>
              </>
            )}
            <Link
              href="/dashboard/profile"
              className="hover:text-bark transition-colors"
            >
              Profile
            </Link>
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="hover:text-bark transition-colors cursor-pointer"
              >
                Sign out
              </button>
            </form>
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-4 py-8">{children}</div>
      </main>
    </div>
  );
}
