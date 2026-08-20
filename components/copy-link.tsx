"use client";

import { useState } from "react";

export function CopyLink({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button type="button" className="rounded-md bg-stone-950 px-4 py-2 text-white" onClick={copy}>
      {copied ? "Copied" : "Copy link"}
    </button>
  );
}
