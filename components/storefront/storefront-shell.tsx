"use client";

import { StorefrontProvider } from "@/components/storefront/store-context";
import {
  StorefrontFooter,
  StorefrontHeader,
} from "@/components/storefront/shell";
import { LiveChatWidget } from "@/components/storefront/live-chat-widget";
import type { Storefront } from "@/lib/storefront";

export function StorefrontShell({
  store,
  children,
}: {
  store: Storefront;
  children: React.ReactNode;
}) {
  return (
    <StorefrontProvider store={store}>
      <div className="flex min-h-full flex-col bg-background">
        <StorefrontHeader />
        <main className="mx-auto w-full max-w-6xl min-h-dvh flex-1 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          {children}
        </main>
        <StorefrontFooter />
        <LiveChatWidget />
      </div>
    </StorefrontProvider>
  );
}
