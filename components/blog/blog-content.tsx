"use client";

import MarkdownPreview from "@uiw/react-markdown-preview";
import "@uiw/react-markdown-preview/markdown.css";

/** Renders a post's Markdown body. A plain client component (not dynamically
 * imported) — unlike the admin editor, this doesn't touch the DOM at import
 * time, so it still server-renders for SEO; only hydration happens client-side. */
export function BlogContent({ markdown }: { markdown: string }) {
  return (
    <div data-color-mode="light">
      <MarkdownPreview
        source={markdown}
        className="blog-content"
        style={{ background: "transparent", color: "inherit" }}
      />
    </div>
  );
}
