import Link from "next/link";
import { Store } from "lucide-react";
import { Logo } from "@/components/logo";

/**
 * Shown when `/{storeHandle}` does not match a store (or the store was removed).
 * Used by `app/[storeHandle]/not-found.tsx` via `notFound()`.
 */
export function StorefrontMissing({ handle }: { handle?: string }) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      <header className="border-b border-border px-6 py-5 sm:px-10">
        <Link href="/" className="hover:opacity-90">
          <Logo />
        </Link>
      </header>
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center px-6 py-20 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-surface text-muted">
          <Store className="size-7" aria-hidden />
        </div>
        <h1 className="mt-6 font-display text-[32px] leading-10 tracking-tight text-heading sm:text-[40px] sm:leading-[1.15]">
          This storefront doesn’t exist
        </h1>
        <p className="mt-4 text-[15px] leading-6 text-muted">
          {handle ? (
            <>
              We couldn’t find a store at{" "}
              <span className="font-medium text-heading">/{handle}</span>. It
              may have been removed, or the link is incorrect.
            </>
          ) : (
            <>
              Sorry — this storefront doesn’t exist or has been removed. Check
              the link and try again.
            </>
          )}
        </p>
        <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center">
          <Link
            href="/demo"
            className="inline-flex h-12 items-center justify-center rounded-lg border border-primary bg-primary px-6 text-[15px] font-medium text-white hover:bg-primary-hover"
          >
            View demo store
          </Link>
          <Link
            href="/"
            className="inline-flex h-12 items-center justify-center rounded-lg border border-border px-6 text-[15px] font-medium text-link hover:bg-surface"
          >
            Back to Salesy
          </Link>
        </div>
        <p className="mt-10 text-[13px] text-muted">
          Own this handle?{" "}
          <Link href="/signup" className="text-link hover:underline">
            Create your store
          </Link>
        </p>
      </main>
    </div>
  );
}
