import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Study Smarter API — Swagger",
  description: "Interactive OpenAPI documentation for the Study Smarter tutor backend.",
};

export default function DocsLayout({ children }: LayoutProps<"/docs">) {
  return <div className="docs-shell">{children}</div>;
}
