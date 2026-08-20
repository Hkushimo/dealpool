"use client";

import { useMemo, useState } from "react";
import { expectedReturn, money } from "@/lib/money";

function parseAmount(value: string) {
  const amount = Number(value.replace(/[$,]/g, "").trim());
  return Number.isFinite(amount) && amount > 0 ? amount : null;
}

export function JoinPoolForm({
  action,
  targetAmount,
  expectedSalePrice
}: {
  action: (formData: FormData) => void | Promise<void>;
  targetAmount: string;
  expectedSalePrice: string | null;
}) {
  const [amount, setAmount] = useState("");
  const projectedReturn = useMemo(() => {
    const parsedAmount = parseAmount(amount);
    if (!parsedAmount) return null;
    return expectedReturn(parsedAmount, targetAmount, expectedSalePrice);
  }, [amount, targetAmount, expectedSalePrice]);

  return (
    <form action={action} className="mt-4 space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          className="min-w-0 flex-1 rounded-md border border-stone-300 px-3 py-2"
          name="amount"
          inputMode="decimal"
          placeholder="Amount"
          required
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
        />
        <button className="rounded-md bg-stone-950 px-5 py-2.5 text-white">Join pool</button>
      </div>
      {projectedReturn !== null ? (
        <div className="rounded-md border border-amber-300/25 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
          Expected return: <span className="font-semibold text-white">{money(projectedReturn)}</span>
        </div>
      ) : expectedSalePrice ? (
        <p className="text-sm text-stone-500">Enter an amount to preview your expected return.</p>
      ) : null}
    </form>
  );
}
