"use client";

import { useState } from "react";

export function CopyButton({
  text,
  label = "Copy",
  theme = "light",
}: {
  text: string;
  label?: string;
  theme?: "light" | "dark";
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={
        theme === "dark"
          ? "shrink-0 rounded-md px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#9aa0a6] transition hover:bg-white/10 hover:text-white"
          : "shrink-0 rounded-md px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted ring-1 ring-border transition hover:bg-accent-soft hover:text-accent-hover"
      }
    >
      {copied ? "Copied" : label}
    </button>
  );
}
