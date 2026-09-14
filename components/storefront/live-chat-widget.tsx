"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/auth-store";
import {
  mountLiveChatSnippet,
  unmountLiveChatSnippet,
} from "@/lib/live-chat";

/**
 * Loads the seller’s pasted chat widget on the storefront when enabled.
 * Demo store uses the signed-in seller’s Settings so they can preview.
 */
export function LiveChatWidget() {
  const hydrated = useAuthStore((s) => s.hydrated);
  const business = useAuthStore((s) => s.business);
  const enabled = business?.liveChatEnabled ?? false;
  const snippet = business?.liveChatSnippet ?? "";

  useEffect(() => {
    if (!hydrated) return;
    if (enabled && snippet.trim()) {
      mountLiveChatSnippet(snippet);
    } else {
      unmountLiveChatSnippet();
    }
    return () => {
      unmountLiveChatSnippet();
    };
  }, [hydrated, enabled, snippet]);

  return null;
}
