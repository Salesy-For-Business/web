"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { Logo } from "@/components/logo";

export function AuthShell({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      <header className="flex items-center justify-between px-6 py-5 sm:px-10 sticky top-0 z-50 bg-background/80 backdrop-blur-sm">
        <Link href="/" className="hover:opacity-90">
          <Logo />
        </Link>
        <ThemeToggle />
      </header>

      <main className="flex flex-1 flex-col items-center px-6 pb-16 pt-6 sm:px-10 sm:pt-10">
        <div className="w-full max-w-md">
          <h1 className="text-pretty text-[32px] leading-10 sm:text-[40px] sm:leading-[1.15]">
            {title}
          </h1>
          {description ? (
            <p className="mt-3 text-base leading-7 text-muted">{description}</p>
          ) : null}
          <div className="mt-8">{children}</div>
          {footer ? <div className="mt-8 text-center text-[14px] text-muted">{footer}</div> : null}
        </div>
      </main>
    </div>
  );
}
