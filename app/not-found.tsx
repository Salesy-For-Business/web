import type { Metadata } from "next";
import Link from "next/link";
import { Footer, Header } from "@/components/landing";

export const metadata: Metadata = {
  title: "Page not found — Salesy",
  robots: { index: false, follow: false },
};

const shortcuts = [
  { href: "/#features", label: "Features" },
  { href: "/#pricing", label: "Plans" },
  { href: "/#faq", label: "FAQ" },
];

export default function NotFound() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      <Header />
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center sm:px-10">
        <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-muted">
          404
        </p>
        <h1 className="mt-4 max-w-xl text-pretty text-5xl leading-14 sm:text-[56px] sm:leading-16">
          We can’t find that page
        </h1>
        <p className="mt-5 max-w-md text-base leading-7 text-muted">
          The link may be broken, or the page may have moved. Head home, or
          open a store and keep selling.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex h-12 items-center rounded-lg border border-primary bg-primary px-6 text-[15px] font-medium text-white hover:bg-primary-hover"
          >
            Back to home
          </Link>
          <Link
            href="/#start"
            className="inline-flex h-12 items-center rounded-lg border border-border px-6 text-[15px] font-medium text-link hover:bg-surface hover:text-link"
          >
            Start your store
          </Link>
        </div>
        <ul className="mt-16 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[14px]">
          {shortcuts.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="text-muted hover:text-link">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </main>
      <Footer />
    </div>
  );
}
