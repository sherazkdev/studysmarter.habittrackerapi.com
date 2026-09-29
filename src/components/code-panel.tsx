import { CopyButton } from "@/components/copy-button";

type CodePanelProps = {
  title: string;
  code: string;
  variant?: "dark" | "light";
};

export function CodePanel({ title, code, variant = "dark" }: CodePanelProps) {
  const isDark = variant === "dark";
  return (
    <div
      className={
        isDark
          ? "doc-code-panel overflow-hidden rounded-2xl bg-[#15171a] shadow-inner shadow-black/20 ring-1 ring-[#2a2f38]"
          : "doc-code-panel-light overflow-hidden rounded-2xl bg-[#f8f9fb] ring-1 ring-border"
      }
    >
      <div
        className={
          isDark
            ? "flex items-center justify-between gap-3 border-b border-[#2a2f38] px-4 py-2.5"
            : "flex items-center justify-between gap-3 border-b border-border bg-surface px-4 py-2.5"
        }
      >
        <div className="flex min-w-0 items-center gap-3">
          {isDark ? (
            <span className="flex gap-1.5" aria-hidden>
              <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
            </span>
          ) : null}
          <span
            className={
              isDark
                ? "truncate text-[11px] font-semibold uppercase tracking-wide text-[#9aa0a6]"
                : "truncate text-[11px] font-semibold uppercase tracking-wide text-muted"
            }
          >
            {title}
          </span>
        </div>
        <CopyButton text={code} theme={isDark ? "dark" : "light"} />
      </div>
      <pre
        className={
          isDark
            ? "docs-code max-h-[340px] overflow-auto p-4 text-[13px] leading-[1.65] text-[#e8eaed]"
            : "docs-code max-h-[340px] overflow-auto p-4 text-[13px] leading-[1.65] text-[#344054]"
        }
      >
        {code}
      </pre>
    </div>
  );
}
