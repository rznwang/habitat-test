import { createClient } from "@/utils/supabase/server";

export default async function TestPage() {
  const supabase = await createClient();

  const { data: items, error } = await supabase
    .from("test_items")
    .select("*")
    .order("created_at", { ascending: true });

  return (
    <div className="min-h-screen bg-cream p-8 font-sans">
      <div className="mx-auto max-w-[520px]">
        <h1 className="font-display text-[26px] font-medium tracking-normal leading-[1.25] text-night mb-2">
          Supabase connection test
        </h1>
        <p className="text-clay text-[15px] leading-[1.6] tracking-[0.01em] mb-8">
          Reading from the <code className="bg-sand px-1.5 py-0.5 rounded text-[13px]">test_items</code> table
        </p>

        {error ? (
          <div className="rounded-[16px] border border-red-300 bg-red-50 p-4">
            <p className="font-semibold text-red-700">Connection error</p>
            <pre className="mt-2 text-sm text-red-600 whitespace-pre-wrap">
              {error.message}
            </pre>
            <p className="mt-4 text-sm text-red-600">
              Make sure you&apos;ve run the <code className="bg-red-100 px-1 rounded">supabase/seed.sql</code> script
              in the Supabase SQL Editor first.
            </p>
          </div>
        ) : (
          <>
            <div className="rounded-[16px] border border-sage bg-mist/30 p-4 mb-6">
              <p className="font-semibold text-olive">
                Connected — {items?.length ?? 0} row(s) returned
              </p>
            </div>

            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-latte">
                  <th className="py-2 pr-4 text-[12px] font-medium text-clay uppercase tracking-[0.04em]">ID</th>
                  <th className="py-2 pr-4 text-[12px] font-medium text-clay uppercase tracking-[0.04em]">Name</th>
                  <th className="py-2 pr-4 text-[12px] font-medium text-clay uppercase tracking-[0.04em]">Description</th>
                  <th className="py-2 text-[12px] font-medium text-clay uppercase tracking-[0.04em]">Created</th>
                </tr>
              </thead>
              <tbody>
                {items?.map((item) => (
                  <tr key={item.id} className="border-b border-linen">
                    <td className="py-3 pr-4 text-bark">{item.id}</td>
                    <td className="py-3 pr-4 font-medium text-night">{item.name}</td>
                    <td className="py-3 pr-4 text-clay">{item.description}</td>
                    <td className="py-3 text-clay text-[13px]">
                      {new Date(item.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        <div className="mt-8">
          <h2 className="font-display text-[20px] font-medium text-night mb-2">Add a new item</h2>
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
        className="rounded-[10px] border border-latte bg-linen px-3 py-2 text-bark placeholder:text-clay focus:outline-none focus:ring-2 focus:ring-umber"
      />
      <input
        name="description"
        placeholder="Description (optional)"
        className="rounded-[10px] border border-latte bg-linen px-3 py-2 text-bark placeholder:text-clay focus:outline-none focus:ring-2 focus:ring-umber"
      />
      <button
        type="submit"
        className="rounded-[12px] bg-umber px-4 py-2 text-cream font-semibold text-[15px] tracking-[0.03em] hover:bg-bark transition-colors duration-200 ease-in-out w-fit cursor-pointer"
      >
        Add item
      </button>
    </form>
  );
}
