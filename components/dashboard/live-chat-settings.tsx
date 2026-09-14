"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import {
  fieldErrorClass,
  fieldHintClass,
  fieldLabelClass,
  inputClass,
  primaryButtonClass,
  textareaClass,
} from "@/components/auth/styles";
import { delayMs, useAuthStore } from "@/lib/auth-store";
import {
  getLiveChatProvider,
  LIVE_CHAT_PROVIDERS,
  type LiveChatProviderId,
} from "@/lib/live-chat";

export function LiveChatSettings() {
  const business = useAuthStore((s) => s.business);
  const setLiveChat = useAuthStore((s) => s.setLiveChat);

  const [enabled, setEnabled] = useState(business?.liveChatEnabled ?? false);
  const [provider, setProvider] = useState<LiveChatProviderId>(
    business?.liveChatProvider ?? "smartsupp",
  );
  const [snippet, setSnippet] = useState(business?.liveChatSnippet ?? "");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!business) return;
    setEnabled(business.liveChatEnabled);
    setProvider(business.liveChatProvider);
    setSnippet(business.liveChatSnippet);
  }, [business]);

  const meta = getLiveChatProvider(provider);

  async function onSave(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    await delayMs(400);
    const result = setLiveChat({ enabled, provider, snippet });
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSuccess(
      enabled
        ? `Live chat on — ${meta.name} will show on your storefront.`
        : "Live chat turned off on your storefront.",
    );
  }

  if (!business) return null;

  return (
    <section className="rounded-xl border border-border bg-background p-6">
      <h2 className="text-[18px] leading-7">Live chat</h2>
      <p className="mt-2 text-[14px] leading-5 text-muted">
        Create a free account with a chat provider, copy their widget code, then
        paste it here. Buyers will see the chat bubble on your storefront.
      </p>

      <form className="mt-5 flex flex-col gap-4" onSubmit={onSave} noValidate>
        <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border px-4 py-3 hover:bg-surface">
          <input
            type="checkbox"
            className="mt-1 size-4 accent-primary"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
          />
          <span>
            <span className="block text-[14px] font-medium text-heading">
              Enable live chat on storefront
            </span>
            <span className="mt-0.5 block text-[13px] text-muted">
              Off by default. Turn on after you paste a valid widget snippet.
            </span>
          </span>
        </label>

        <div>
          <label htmlFor="live-chat-provider" className={fieldLabelClass}>
            Chat provider
          </label>
          <select
            id="live-chat-provider"
            className={inputClass}
            value={provider}
            onChange={(e) =>
              setProvider(e.target.value as LiveChatProviderId)
            }
          >
            {LIVE_CHAT_PROVIDERS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <p className={fieldHintClass}>
            {meta.hint}{" "}
            {meta.signupUrl ? (
              <a
                href={meta.signupUrl}
                target="_blank"
                rel="noreferrer"
                className="text-link underline-offset-2 hover:underline"
              >
                Open {meta.name}
              </a>
            ) : null}
          </p>
        </div>

        <div>
          <label htmlFor="live-chat-snippet" className={fieldLabelClass}>
            Widget code
          </label>
          <textarea
            id="live-chat-snippet"
            className={clsx(textareaClass, "min-h-36 font-mono text-[13px]")}
            placeholder={`Paste the ${meta.name} <script>…</script> snippet here`}
            value={snippet}
            onChange={(e) => setSnippet(e.target.value)}
            spellCheck={false}
          />
        </div>

        {error ? (
          <p className={fieldErrorClass} role="alert">
            {error}
          </p>
        ) : null}
        {success ? (
          <p className="text-[13px] text-green-700 dark:text-green-500" role="status">
            {success}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className={clsx(primaryButtonClass, "w-auto min-w-40 px-6")}
        >
          {loading ? "Saving…" : "Save live chat"}
        </button>
      </form>
    </section>
  );
}
