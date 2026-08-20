export function money(value: string | number | null | undefined) {
  const amount = Number(value ?? 0);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2
  }).format(amount);
}

export function percent(value: number) {
  if (!Number.isFinite(value)) return "0%";
  return `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(value)}%`;
}

export function expectedReturn(
  amount: string | number | null | undefined,
  targetAmount: string | number | null | undefined,
  expectedSalePrice: string | number | null | undefined
) {
  const contribution = Number(amount ?? 0);
  const target = Number(targetAmount ?? 0);
  const salePrice = Number(expectedSalePrice ?? 0);

  if (!Number.isFinite(contribution) || !Number.isFinite(target) || !Number.isFinite(salePrice) || target <= 0 || salePrice <= 0) {
    return null;
  }

  return (contribution / target) * salePrice;
}

export function numeric(value: FormDataEntryValue | null) {
  const normalized = String(value ?? "").replace(/[$,]/g, "").trim();
  const amount = Number(normalized);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Enter an amount greater than zero.");
  }
  return amount.toFixed(2);
}
