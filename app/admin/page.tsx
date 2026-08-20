import Link from "next/link";
import { Badge, ProgressBar } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { withTotals } from "@/lib/deals";
import { money, percent } from "@/lib/money";
import { createClient } from "@/lib/supabase/server";
import type { Deal, Participation } from "@/lib/types";

export default async function AdminDashboard() {
  await requireAdmin();
  const supabase = createClient();
  const { data: deals } = await supabase.from("deals").select("*").order("created_at", { ascending: false }).returns<Deal[]>();
  const { data: participations } = await supabase.from("participations").select("deal_id,amount,status").returns<Participation[]>();
  const rows = (deals ?? []).map((deal) => withTotals(deal, participations?.filter((p) => p.deal_id === deal.id) ?? []));

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-200">Command deck</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-950">Admin</h1>
        </div>
        <Link className="rounded-md bg-stone-950 px-4 py-2 text-white" href="/admin/deals/new">
          New pool
        </Link>
      </div>
      <div className="mt-6 overflow-hidden rounded-lg border border-stone-200 bg-white">
        {rows.length ? (
          <div className="divide-y divide-stone-200">
            {rows.map((deal) => {
              const progress = (deal.confirmed_amount / Number(deal.target_amount)) * 100;
              return (
                <Link key={deal.id} href={`/admin/deals/${deal.id}`} className="block p-4 transition hover:bg-stone-50">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold">{deal.title}</div>
                      <div className="mt-1 text-sm text-stone-600">
                        {money(deal.confirmed_amount)} confirmed · {money(deal.pending_amount)} pending · target {money(deal.target_amount)}
                      </div>
                    </div>
                    <Badge status={deal.status} />
                  </div>
                  <div className="mt-3">
                    <ProgressBar value={progress} />
                    <div className="mt-1 text-xs text-stone-500">{percent(progress)} funded</div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="p-6 text-stone-600">Create your first pool to get started.</p>
        )}
      </div>
    </div>
  );
}
