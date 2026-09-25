import type { ReactNode } from "react";
import { Header, Footer } from "@/components/landing";

export type LegalSection = {
  id: string;
  title: string;
  body: ReactNode;
};

/**
 * Shared shell for /privacy and /terms — same header/footer as the rest of
 * the marketing site, a jump-to-section contents list (these documents run
 * long), and numbered sections with anchor targets.
 */
export function LegalPage({
  title,
  updated,
  intro,
  sections,
}: {
  title: string;
  updated: string;
  intro: ReactNode;
  sections: LegalSection[];
}) {
  return (
    <div className="flex flex-1 flex-col bg-background">
      <Header />
      <main className="flex-1 px-6 py-16 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-3xl">
          <p className="text-[13px] font-medium uppercase tracking-[0.16em] text-muted">
            Legal
          </p>
          <h1 className="mt-3 font-display text-[36px] leading-11 tracking-tight text-heading sm:text-[44px]">
            {title}
          </h1>
          <p className="mt-3 text-[14px] text-muted">Last updated: {updated}</p>
          <div className="mt-6 flex flex-col gap-3 text-[15px] leading-7 text-foreground">
            {intro}
          </div>

          <nav
            aria-label="Sections on this page"
            className="mt-10 rounded-xl border border-border bg-surface p-5"
          >
            <p className="text-[13px] font-medium uppercase tracking-wide text-muted">
              On this page
            </p>
            <ol className="mt-3 grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
              {sections.map((section, index) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="text-[14px] text-link hover:text-link-hover hover:underline"
                  >
                    {index + 1}. {section.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="mt-10 flex flex-col gap-10">
            {sections.map((section, index) => (
              <section key={section.id} id={section.id} className="scroll-mt-24">
                <h2 className="font-display text-[22px] tracking-tight text-heading">
                  {index + 1}. {section.title}
                </h2>
                <div className="mt-3 flex flex-col gap-3 text-[15px] leading-7 text-foreground">
                  {section.body}
                </div>
              </section>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
