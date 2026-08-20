import Link from "next/link";
import { redirect } from "next/navigation";
import { openPoolFromCode } from "@/app/actions";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { expectedReturn, money } from "@/lib/money";
import { Badge } from "@/components/ui";

export default async function Dashboard() {
  const { user, profile } = await requireUser();
  if (profile?.is_admin) redirect("/admin");

  const supabase = createClient();
  const { data: rows } = await supabase
    .from("participations")
    .select("amount,status,deals(id,slug,title,status,target_amount,expected_sale_price)")
    .eq("user_id", user.id)
    .neq("status", "cancelled")
    .order("created_at", { ascending: false });

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">Participant console</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-950">Your pools</h1>
      <form action={openPoolFromCode} className="mt-6 rounded-lg border border-amber-300/25 bg-amber-500/10 p-4">
        <label className="block">
          <span className="text-sm font-medium text-amber-100">Join with pool code</span>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <input
              className="min-w-0 flex-1 rounded-md border border-amber-300/25 bg-white px-3 py-2"
              name="code"
              placeholder="Paste code or pool link"
              required
            />
            <button className="rounded-md bg-stone-950 px-5 py-2.5 text-white">Open pool</button>
          </div>
        </label>
      </form>
      <div className="mt-6 overflow-hidden rounded-lg border border-stone-200 bg-white">
        {rows?.length ? (
          <div className="divide-y divide-stone-200">
            {rows.map((row) => {
              const deal = Array.isArray(row.deals) ? row.deals[0] : row.deals;
              if (!deal) return null;
              const projectedReturn = expectedReturn(row.amount, deal.target_amount, deal.expected_sale_price);
              return (
                <Link key={`${deal.id}-${row.amount}`} href={`/d/${deal.slug}`} className="block p-4 transition hover:bg-stone-50">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-medium">{deal.title}</div>
                      <div className="mt-1 text-sm text-stone-500">Your amount: {money(row.amount)}</div>
                      {projectedReturn !== null ? (
                        <div className="mt-1 text-sm text-stone-500">Expected return: {money(projectedReturn)}</div>
                      ) : null}
                    </div>
                    <Badge status={row.status} />
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="p-6 text-stone-600">Pools you join will appear here.</p>
        )}
      </div>
    </div>
  );
}
