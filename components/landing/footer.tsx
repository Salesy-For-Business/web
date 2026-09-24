"use client";

import Link from "next/link";
import { HomeHashLink } from "@/components/landing/home-hash-link";
import { AccountNavLink } from "@/components/landing/account-nav-link";
import { Logo } from "@/components/logo";

const productLinks = [
  { hash: "features", label: "Features" },
  { hash: "pricing", label: "Plans" },
  { hash: "faq", label: "FAQ" },
];

const legalLinks = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

export default function Footer() {
  return (
    <footer className="border-t border-border bg-background px-6 py-16 sm:px-10 lg:px-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 lg:flex-row lg:justify-between">
        <div className="max-w-xs">
          <Link href="/" className="hover:opacity-90">
            <Logo />
          </Link>
          <p className="mt-3 text-[14px] leading-6 text-muted">
            An online store with a unique, shareable URL — built for how you
            already take orders.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 sm:gap-16">
          <div>
            <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-muted">
              Product
            </p>
            <ul className="mt-4 flex flex-col gap-3">
              {productLinks.map((link) => (
                <li key={link.hash}>
                  <HomeHashLink
                    hash={link.hash}
                    className="text-[14px] text-foreground hover:text-link"
                  >
                    {link.label}
                  </HomeHashLink>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-muted">
              Company
            </p>
            <ul className="mt-4 flex flex-col gap-3">
              <li>
                <Link
                  href="/blog"
                  className="text-[14px] text-foreground hover:text-link"
                >
                  Blog
                </Link>
              </li>
              <li>
                <AccountNavLink className="text-[14px] text-foreground hover:text-link" />
              </li>
            </ul>
          </div>
          <div>
            <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-muted">
              Legal
            </p>
            <ul className="mt-4 flex flex-col gap-3">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[14px] text-foreground hover:text-link"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-12 flex max-w-6xl flex-col gap-2 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[13px] text-muted">
          © {new Date().getFullYear()} Salesy. All rights reserved.
        </p>
        <p className="text-[13px] text-muted">Made for sellers.</p>
      </div>
    </footer>
  );
}
