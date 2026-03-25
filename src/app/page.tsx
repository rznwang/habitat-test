import Link from "next/link";
import { createClient } from "@/utils/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("test_items")
    .select("*", { count: "exact", head: true });

  const connected = !error;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-black p-8">
      <main className="w-full max-w-lg flex flex-col items-center gap-8">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Habitat
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-center">
          Next.js + Supabase
        </p>

        <div className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
          <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-4">
            Status
          </h2>
          <div className="flex items-center gap-3">
            <span
              className={`h-3 w-3 rounded-full ${
                connected ? "bg-green-500" : "bg-red-500"
              }`}
            />
            <span className="text-zinc-900 dark:text-zinc-100">
              {connected
                ? `Supabase connected — ${count} item(s) in test_items`
                : "Supabase not reachable"}
            </span>
          </div>
          {error && (
            <pre className="mt-3 text-sm text-red-500 whitespace-pre-wrap">
              {error.message}
            </pre>
          )}
        </div>

        <Link
          href="/test"
          className="flex h-12 w-full items-center justify-center rounded-full bg-zinc-900 dark:bg-zinc-100 px-5 text-white dark:text-black font-medium transition-colors hover:bg-zinc-700 dark:hover:bg-zinc-300"
        >
          Open Test Page
        </Link>
      </main>
    </div>
  );
}
