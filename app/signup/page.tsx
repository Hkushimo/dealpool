import Link from "next/link";
import { signUp } from "@/app/actions";

export default async function Signup({
  searchParams
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;
  const next = params.next ?? "/dashboard";

  return (
    <div className="mx-auto max-w-md rounded-lg border border-stone-200 bg-white p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">Private invite</p>
      <h1 className="mt-2 text-2xl font-semibold text-stone-950">Create account</h1>
      {params.error ? <p className="mt-3 rounded-md border border-red-300/25 bg-red-500/10 p-3 text-sm text-red-200">{params.error}</p> : null}
      <form action={signUp} className="mt-6 space-y-4">
        <input type="hidden" name="next" value={next} />
        <label className="block">
          <span className="text-sm font-medium text-stone-700">Username</span>
          <input
            className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2"
            name="username"
            autoComplete="username"
            pattern="[A-Za-z0-9_]{3,32}"
            title="Use 3-32 letters, numbers, or underscores."
            required
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-stone-700">Password</span>
          <input className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2" name="password" type="password" autoComplete="new-password" required minLength={6} />
        </label>
        <button className="w-full rounded-md bg-stone-950 px-4 py-2.5 text-white">Sign up</button>
      </form>
      <p className="mt-4 text-sm text-stone-600">
        Already have an account? <Link className="font-medium text-stone-950" href={`/login?next=${encodeURIComponent(next)}`}>Log in</Link>
      </p>
    </div>
  );
}
