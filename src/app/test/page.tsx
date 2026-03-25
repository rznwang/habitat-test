import { createClient } from "@/utils/supabase/server";

export default async function TestPage() {
  const supabase = await createClient();

  const { data: items, error } = await supabase
    .from("test_items")
    .select("*")
    .order("created_at", { ascending: true });

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-8 font-sans">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
          Supabase Connection Test
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 mb-8">
          Reading from the <code className="bg-zinc-200 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-sm">test_items</code> table
        </p>

        {error ? (
          <div className="rounded-lg border border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950 p-4">
            <p className="font-semibold text-red-700 dark:text-red-400">Connection error</p>
            <pre className="mt-2 text-sm text-red-600 dark:text-red-300 whitespace-pre-wrap">
              {error.message}
            </pre>
            <p className="mt-4 text-sm text-red-600 dark:text-red-300">
              Make sure you&apos;ve run the <code className="bg-red-100 dark:bg-red-900 px-1 rounded">supabase/seed.sql</code> script
              in the Supabase SQL Editor first.
            </p>
          </div>
        ) : (
          <>
            <div className="rounded-lg border border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-950 p-4 mb-6">
              <p className="font-semibold text-green-700 dark:text-green-400">
                ✓ Connected — {items?.length ?? 0} row(s) returned
              </p>
            </div>

            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-700">
                  <th className="py-2 pr-4 text-sm font-medium text-zinc-500 dark:text-zinc-400">ID</th>
                  <th className="py-2 pr-4 text-sm font-medium text-zinc-500 dark:text-zinc-400">Name</th>
                  <th className="py-2 pr-4 text-sm font-medium text-zinc-500 dark:text-zinc-400">Description</th>
                  <th className="py-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">Created</th>
                </tr>
              </thead>
              <tbody>
                {items?.map((item) => (
                  <tr key={item.id} className="border-b border-zinc-100 dark:border-zinc-800">
                    <td className="py-3 pr-4 text-zinc-900 dark:text-zinc-100">{item.id}</td>
                    <td className="py-3 pr-4 font-medium text-zinc-900 dark:text-zinc-100">{item.name}</td>
                    <td className="py-3 pr-4 text-zinc-600 dark:text-zinc-400">{item.description}</td>
                    <td className="py-3 text-zinc-500 dark:text-zinc-500 text-sm">
                      {new Date(item.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        <div className="mt-8">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-2">Add a new item</h2>
          <AddItemForm />
        </div>
      </div>
    </div>
  );
}

function AddItemForm() {
  async function addItem(formData: FormData) {
    "use server";
    const supabase = await createClient();
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;

    if (!name) return;

    await supabase.from("test_items").insert({ name, description });

    const { revalidatePath } = await import("next/cache");
    revalidatePath("/test");
  }

  return (
    <form action={addItem} className="flex flex-col gap-3">
      <input
        name="name"
        placeholder="Name"
        required
        className="rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-zinc-900 dark:text-zinc-100"
      />
      <input
        name="description"
        placeholder="Description (optional)"
        className="rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-zinc-900 dark:text-zinc-100"
      />
      <button
        type="submit"
        className="rounded-md bg-zinc-900 dark:bg-zinc-100 px-4 py-2 text-white dark:text-black font-medium hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors w-fit"
      >
        Add Item
      </button>
    </form>
  );
}
