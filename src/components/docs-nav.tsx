"use client";

import { useEffect, useState } from "react";

type NavItem = { id: string; label: string };

function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0] ?? "");

  useEffect(() => {
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) {
          setActive(visible.target.id);
        }
      },
      { rootMargin: "-28% 0px -62% 0px", threshold: [0, 0.25, 0.5] },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [ids]);

  return active;
}

function NavLink({
  item,
  active,
  compact,
}: {
  item: NavItem;
  active: boolean;
  compact?: boolean;
}) {
  return (
    <a
      href={`#${item.id}`}
      className={
        compact
          ? `shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
              active
                ? "bg-accent text-white shadow-sm shadow-accent/20"
                : "bg-surface text-muted ring-1 ring-border hover:text-foreground"
            }`
          : `relative block rounded-xl py-2 pl-3 pr-2 text-[13px] font-medium transition ${
              active
                ? "bg-accent-soft text-accent-hover"
                : "text-muted hover:bg-surface hover:text-foreground"
            }`
      }
    >
      {!compact && active ? (
        <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-accent" />
      ) : null}
      {item.label}
    </a>
  );
}

export function DocsNavMobile({ items }: { items: NavItem[] }) {
  const active = useActiveSection(items.map((i) => i.id));
  return (
    <nav className="mb-8 flex gap-2 overflow-x-auto overflow-y-hidden pb-1 lg:hidden">
      {items.map((item) => (
        <NavLink key={item.id} item={item} active={active === item.id} compact />
      ))}
    </nav>
  );
}

export function DocsNavDesktop({ items }: { items: NavItem[] }) {
  const active = useActiveSection(items.map((i) => i.id));
  return (
    <aside className="hidden w-48 shrink-0 lg:block">
      <nav className="sticky top-[5.25rem] rounded-2xl bg-surface/60 p-2 ring-1 ring-border/80 backdrop-blur-sm">
        <p className="px-3 pb-2 pt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
          On this page
        </p>
        <div className="space-y-0.5">
          {items.map((item) => (
            <NavLink key={item.id} item={item} active={active === item.id} />
          ))}
        </div>
      </nav>
    </aside>
  );
}
