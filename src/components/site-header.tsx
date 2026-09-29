import Link from "next/link";

type SiteHeaderProps = {
  active?: "home" | "docs";
};

export function SiteHeader({ active = "home" }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-border/70 bg-surface/85 backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5">
        <Link
          href="/"
          className="group flex items-center gap-3 rounded-xl py-1 pr-2 transition hover:bg-background/80"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-accent via-accent to-accent-hover text-sm font-bold text-white shadow-md shadow-accent/30 ring-2 ring-white">
            S
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight tracking-tight text-foreground">
              Study Smarter
            </p>
            <p className="text-[11px] font-medium text-muted">API · Groq tutor backend</p>
          </div>
        </Link>
        <nav className="flex flex-wrap items-center gap-1.5 text-sm font-semibold sm:gap-2">
          <Link
            href="/"
            className={
              active === "home"
                ? "rounded-full bg-accent-soft px-3.5 py-2 text-accent-hover ring-1 ring-accent/20"
                : "rounded-full px-3.5 py-2 text-muted transition hover:bg-background hover:text-foreground"
            }
          >
            Docs
          </Link>
          <Link
            href="/docs"
            className={
              active === "docs"
                ? "rounded-full bg-accent px-4 py-2 text-white shadow-md shadow-accent/25 ring-2 ring-accent/20"
                : "rounded-full px-4 py-2 text-foreground ring-1 ring-border transition hover:bg-accent-soft hover:text-accent-hover"
            }
          >
            Swagger
          </Link>
          <a
            href="/api/openapi"
            className="hidden rounded-full px-3.5 py-2 text-muted ring-1 ring-border transition hover:bg-surface hover:text-foreground sm:inline-block"
          >
            OpenAPI
          </a>
        </nav>
      </div>
    </header>
  );
}
