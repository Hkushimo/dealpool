import Link from "next/link";
import { notFound } from "next/navigation";
import { joinDeal } from "@/app/actions";
import { Badge, ProgressBar, Stat, statusText } from "@/components/ui";
import { getUserProfile } from "@/lib/auth";
import { getDealBySlug } from "@/lib/deals";
import { expectedReturn, money, percent } from "@/lib/money";

export default async function DealPage({
  params,
  searchParams
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ joined?: string }>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const result = await getDealBySlug(slug);
  if (!result) notFound();

  const { user } = await getUserProfile();
  const { deal, participations } = result;
  const progress = (deal.confirmed_amount / Number(deal.target_amount)) * 100;
  const myParticipation = user ? participations.find((p) => p.user_id === user.id && p.status !== "cancelled") : null;
  const myShare =
    myParticipation?.status === "confirmed" && deal.confirmed_amount > 0
      ? (Number(myParticipation.amount) / deal.confirmed_amount) * 100
      : null;
  const myExpectedReturn = myParticipation
    ? expectedReturn(myParticipation.amount, deal.target_amount, deal.expected_sale_price)
    : null;

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-200">Deal terminal</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-950">{deal.title}</h1>
          </div>
          <Badge status={deal.status} />
        </div>
        {deal.description ? <p className="mt-4 whitespace-pre-wrap leading-7 text-stone-700">{deal.description}</p> : null}
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
        {deal.expected_sale_price ? (
          <p className="mt-4 text-sm text-stone-600">Expected sale price: {money(deal.expected_sale_price)}</p>
        ) : null}
      </section>

      <section className="rounded-lg border border-stone-200 bg-white p-5">
        <h2 className="text-xl font-semibold text-stone-950">Your participation</h2>
        {!user ? (
          <div className="mt-4 rounded-md border border-stone-200 bg-stone-50 p-4 text-stone-700">
            <p>Log in or create an account before participating.</p>
            <div className="mt-4 flex gap-3">
              <Link className="rounded-md bg-stone-950 px-4 py-2 text-white" href={`/login?next=${encodeURIComponent(`/d/${slug}`)}`}>
                Log in
              </Link>
              <Link className="rounded-md border border-stone-300 bg-white px-4 py-2 text-stone-950" href={`/signup?next=${encodeURIComponent(`/d/${slug}`)}`}>
                Sign up
              </Link>
            </div>
          </div>
        ) : myParticipation ? (
          <div className="mt-4 grid gap-3 rounded-md border border-stone-200 bg-stone-50 p-4 sm:grid-cols-4">
            <div>
              <div className="text-sm text-stone-500">Amount</div>
              <div className="font-semibold text-stone-950">{money(myParticipation.amount)}</div>
            </div>
            {myExpectedReturn !== null ? (
              <div>
                <div className="text-sm text-stone-500">Expected return</div>
                <div className="font-semibold text-stone-950">{money(myExpectedReturn)}</div>
              </div>
            ) : null}
            <div>
              <div className="text-sm text-stone-500">Status</div>
              <div className="font-semibold text-stone-950">{statusText(myParticipation.status)}</div>
            </div>
            {myShare !== null ? (
              <div>
                <div className="text-sm text-stone-500">Your share</div>
                <div className="font-semibold text-stone-950">{percent(myShare)}</div>
              </div>
            ) : null}
          </div>
        ) : (
          <form action={joinDeal.bind(null, deal.id, slug)} className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input
              className="min-w-0 flex-1 rounded-md border border-stone-300 px-3 py-2"
              name="amount"
              inputMode="decimal"
              placeholder="Amount"
              required
            />
            <button className="rounded-md bg-stone-950 px-5 py-2.5 text-white">Join Deal</button>
          </form>
        )}
        {query.joined ? <p className="mt-3 text-sm text-blue-200">Your commitment was recorded and is awaiting payment confirmation.</p> : null}
      </section>

      <section className="rounded-lg border border-stone-200 bg-white">
        <div className="border-b border-stone-200 p-5">
          <h2 className="text-xl font-semibold text-stone-950">Participants</h2>
        </div>
        <div className="divide-y divide-stone-200">
          {participations.length ? (
            participations.map((participation) => (
              <div key={participation.id} className="flex items-center justify-between gap-4 p-4">
                <div>
                  <div className="font-medium text-stone-950">
                    {participation.users?.username || participation.users?.display_name || "Participant"}
                  </div>
                  <div className="text-sm text-stone-500">
                    {money(participation.amount)}
                    {deal.expected_sale_price ? ` -> ${money(expectedReturn(participation.amount, deal.target_amount, deal.expected_sale_price))} expected` : ""}
                  </div>
                </div>
                <Badge status={participation.status} />
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
