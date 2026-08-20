import { createDeal } from "@/app/actions";
import { requireAdmin } from "@/lib/auth";

export default async function NewDeal() {
  await requireAdmin();

  return (
    <div className="mx-auto max-w-2xl rounded-lg border border-stone-200 bg-white p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-200">Admin console</p>
      <h1 className="mt-2 text-2xl font-semibold text-stone-950">Create pool</h1>
      <form action={createDeal} className="mt-6 space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-stone-700">Title</span>
          <input className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2" name="title" required />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-stone-700">Description</span>
          <textarea className="mt-1 min-h-32 w-full rounded-md border border-stone-300 px-3 py-2" name="description" />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-stone-700">Funding target</span>
            <input className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2" name="target_amount" inputMode="decimal" required />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-stone-700">Expected sale price</span>
            <input className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2" name="expected_sale_price" inputMode="decimal" />
          </label>
        </div>
        <button className="rounded-md bg-stone-950 px-5 py-2.5 text-white">Create pool</button>
      </form>
    </div>
  );
}
