"use client";

import dynamic from "next/dynamic";
import { SiteHeader } from "@/components/site-header";
import "swagger-ui-react/swagger-ui.css";
import "./swagger-docs.css";

const SwaggerUI = dynamic(() => import("swagger-ui-react"), { ssr: false });

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader active="docs" />
      <div className="swagger-docs-root border-t border-border">
        <div className="border-b border-border bg-gradient-to-r from-accent-soft/40 to-surface px-5 py-8">
          <div className="mx-auto max-w-[1280px]">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-accent">Swagger UI</p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight">Interactive API reference</h1>
            <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-muted">
              Authorize with your client <code className="docs-code rounded-md bg-surface px-1.5 py-0.5 text-xs ring-1 ring-border">x-api-key</code>, then try tutor endpoints. Spec:{" "}
              <a href="/api/openapi" className="font-semibold text-accent hover:text-accent-hover">
                /api/openapi
              </a>
            </p>
          </div>
        </div>
        <SwaggerUI
          url="/api/openapi"
          docExpansion="list"
          persistAuthorization
          deepLinking
          displayRequestDuration
          tryItOutEnabled
          defaultModelsExpandDepth={1}
        />
      </div>
    </div>
  );
}
