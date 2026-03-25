import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { count, error } = await supabase
    .from("test_items")
    .select("*", { count: "exact", head: true });

  const connected = !error;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream p-8">
      <main className="w-full max-w-lg flex flex-col items-center gap-8">
        <h1 className="font-display text-[32px] font-semibold tracking-[-0.01em] leading-[1.2] text-night">
          Family Bonds
        </h1>
        <p className="text-clay text-center text-[15px] leading-[1.6] tracking-[0.01em]">
          Signed in as {user.email}
        </p>

        <div className="w-full rounded-[16px] border border-latte bg-linen p-6 shadow-[0_2px_8px_rgba(74,63,53,0.06)]">
          <h2 className="text-[12px] font-medium text-clay uppercase tracking-[0.04em] mb-4">
            Status
          </h2>
          <div className="flex items-center gap-3">
            <span
              className={`h-3 w-3 rounded-full ${
                connected ? "bg-sage" : "bg-red-600"
              }`}
            />
            <span className="text-bark text-[15px]">
              {connected
                ? `Supabase connected — ${count} item(s) in test_items`
                : "Supabase not reachable"}
            </span>
          </div>
          {error && (
            <pre className="mt-3 text-sm text-red-700 whitespace-pre-wrap">
              {error.message}
            </pre>
          )}
        </div>

        <Link
          href="/test"
          className="flex h-12 w-full items-center justify-center rounded-[12px] bg-umber px-4 text-cream text-[15px] font-semibold tracking-[0.03em] transition-colors duration-200 ease-in-out hover:bg-bark"
        >
          Open test page
        </Link>

        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="text-[14px] text-clay hover:text-bark transition-colors duration-200 ease-in-out cursor-pointer"
          >
            Sign out
          </button>
        </form>
      </main>
    </div>
  );
}
