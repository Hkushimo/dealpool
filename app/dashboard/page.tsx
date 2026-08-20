import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { money } from "@/lib/money";
import { Badge } from "@/components/ui";

export default async function Dashboard() {
  const { user } = await requireUser();
  const supabase = createClient();
  const { data: rows } = await supabase
    .from("participations")
    .select("amount,status,deals(id,slug,title,status,target_amount)")
    .eq("user_id", user.id)
    .neq("status", "cancelled")
    .order("created_at", { ascending: false });

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-200">Participant console</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-950">Your deals</h1>
      <div className="mt-6 overflow-hidden rounded-lg border border-stone-200 bg-white">
        {rows?.length ? (
          <div className="divide-y divide-stone-200">
            {rows.map((row) => {
              const deal = Array.isArray(row.deals) ? row.deals[0] : row.deals;
              if (!deal) return null;
              return (
                <Link key={`${deal.id}-${row.amount}`} href={`/d/${deal.slug}`} className="block p-4 transition hover:bg-stone-50">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-medium">{deal.title}</div>
                      <div className="mt-1 text-sm text-stone-500">Your amount: {money(row.amount)}</div>
                    </div>
                    <Badge status={row.status} />
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="p-6 text-stone-600">Deals you join will appear here.</p>
        )}
      </div>
    </div>
  );
}
