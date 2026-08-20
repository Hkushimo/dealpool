import Link from "next/link";
import { notFound } from "next/navigation";
import {
  cancelParticipation,
  confirmParticipation,
  editParticipationAmount,
  updateDealStatus
} from "@/app/actions";
import { CopyLink } from "@/components/copy-link";
import { Badge, ProgressBar, Stat } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { getDealById } from "@/lib/deals";
import { expectedReturn, money, percent } from "@/lib/money";

export default async function AdminDealPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const result = await getDealById(id);
  if (!result) notFound();

  const { deal, participations } = result;
  const progress = (deal.confirmed_amount / Number(deal.target_amount)) * 100;
  const origin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const shareUrl = `${origin}/d/${deal.slug}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/admin" className="text-sm text-stone-500 hover:text-stone-950">
            Back to admin
          </Link>
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-sky-200">Pool control</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-950">{deal.title}</h1>
        </div>
        <Badge status={deal.status} />
      </div>

      <section className="rounded-lg border border-blue-300/25 bg-blue-500/10 p-4">
        <div className="text-sm font-medium text-blue-100">Pool link</div>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <input readOnly value={shareUrl} className="min-w-0 flex-1 rounded-md border border-blue-300/25 bg-white px-3 py-2 text-sm" />
          <CopyLink value={shareUrl} />
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Target" value={money(deal.target_amount)} />
        <Stat label="Confirmed" value={money(deal.confirmed_amount)} />
        <Stat label="Pending" value={money(deal.pending_amount)} />
        <Stat label="Remaining" value={money(deal.remaining_amount)} />
      </section>

      <section className="rounded-lg border border-stone-200 bg-white p-5">
        <div className="mb-3 flex justify-between text-sm">
          <span className="font-medium text-stone-950">Funding progress</span>
          <span className="text-stone-600">{percent(progress)}</span>
        </div>
        <ProgressBar value={progress} />
        <form action={updateDealStatus.bind(null, deal.id)} className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="block">
            <span className="text-sm font-medium text-stone-700">Pool status</span>
            <select className="mt-1 rounded-md border border-stone-300 px-3 py-2" name="status" defaultValue={deal.status}>
              <option value="open">Open</option>
              <option value="funded">Funded</option>
              <option value="purchased">Purchased</option>
              <option value="sold">Sold</option>
              <option value="closed">Closed</option>
            </select>
          </label>
          <button className="rounded-md bg-stone-950 px-4 py-2 text-white">Update status</button>
        </form>
      </section>

      <section className="rounded-lg border border-stone-200 bg-white">
        <div className="border-b border-stone-200 p-5">
          <h2 className="text-xl font-semibold text-stone-950">Participations</h2>
        </div>
        <div className="divide-y divide-stone-200">
          {participations.length ? (
            participations.map((participation) => (
              <div key={participation.id} className="grid gap-4 p-4 lg:grid-cols-[1fr_auto] lg:items-center">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-stone-950">
                      {participation.users?.username || participation.users?.display_name || "Participant"}
                    </span>
                    <Badge status={participation.status} />
                  </div>
                  <div className="mt-1 text-sm text-stone-500">
                    {participation.users?.username ? `@${participation.users.username}` : ""}
                  </div>
                  {deal.expected_sale_price ? (
                    <div className="mt-2 text-sm text-stone-500">
                      {money(participation.amount)} in, {money(expectedReturn(participation.amount, deal.target_amount, deal.expected_sale_price))} expected return
                    </div>
                  ) : null}
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <form action={editParticipationAmount.bind(null, participation.id, deal.id)} className="flex gap-2">
                    <input
                      className="w-32 rounded-md border border-stone-300 px-3 py-2"
                      name="amount"
                      defaultValue={Number(participation.amount).toFixed(2)}
                      inputMode="decimal"
                    />
                    <button className="rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-stone-950">Save</button>
                  </form>
                  {participation.status === "pending" ? (
                    <>
                      <form action={confirmParticipation.bind(null, participation.id, deal.id)}>
                        <button className="w-full rounded-md bg-stone-950 px-3 py-2 text-sm text-white">Confirm</button>
                      </form>
                      <form action={cancelParticipation.bind(null, participation.id, deal.id)}>
                        <button className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-stone-950">Cancel</button>
                      </form>
                    </>
                  ) : null}
                </div>
              </div>
            ))
          ) : (
            <p className="p-5 text-stone-600">No participations yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}
