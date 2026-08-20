import Link from "next/link";
import { getUserProfile } from "@/lib/auth";

export default async function Home() {
  const { user, profile } = await getUserProfile();

  return (
    <section className="py-12">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-200">Private pools</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-stone-950 sm:text-6xl">
          Invest and break bread together.
        </h1>
        <p className="mt-5 text-lg leading-8 text-stone-700">
          Create a shareable pool, let friends commit amounts, and confirm contributions only after
          you receive payment outside the app.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          {user ? (
            <>
              <Link className="rounded-md bg-stone-950 px-4 py-2.5 text-white" href="/dashboard">
                Go to dashboard
              </Link>
              {profile?.is_admin ? (
                <Link className="rounded-md border border-stone-300 bg-white px-4 py-2.5 text-stone-950" href="/admin/deals/new">
                  Create pool
                </Link>
              ) : null}
            </>
          ) : (
            <>
              <Link className="rounded-md bg-stone-950 px-4 py-2.5 text-white" href="/login">
                Log in
              </Link>
              <Link className="rounded-md border border-stone-300 bg-white px-4 py-2.5 text-stone-950" href="/signup">
                Create account
              </Link>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
