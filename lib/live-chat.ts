export type LiveChatProviderId =
  | "smartsupp"
  | "tawk"
  | "crisp"
  | "tidio"
  | "jivo"
  | "other";

export type LiveChatProvider = {
  id: LiveChatProviderId;
  name: string;
  signupUrl: string;
  hint: string;
};

export const LIVE_CHAT_PROVIDERS: LiveChatProvider[] = [
  {
    id: "smartsupp",
    name: "Smartsupp",
    signupUrl: "https://www.smartsupp.com/",
    hint: "Copy the chat code from Smartsupp → Settings → Chat box → Chat code.",
  },
  {
    id: "tawk",
    name: "Tawk.to",
    signupUrl: "https://www.tawk.to/",
    hint: "Copy the widget code from Tawk.to → Administration → Channels → Chat Widget.",
  },
  {
    id: "crisp",
    name: "Crisp",
    signupUrl: "https://crisp.chat/",
    hint: "Copy the website embed script from Crisp → Settings → Workspace Settings → Setup Instructions.",
  },
  {
    id: "tidio",
    name: "Tidio",
    signupUrl: "https://www.tidio.com/",
    hint: "Copy the installation code from Tidio → Settings → Installation.",
  },
  {
    id: "jivo",
    name: "JivoChat",
    signupUrl: "https://www.jivochat.com/",
    hint: "Copy the embed code from JivoChat → Manage → Install on website.",
  },
  {
    id: "other",
    name: "Other widget",
    signupUrl: "",
    hint: "Paste any live chat provider’s embed / widget <script> snippet.",
  },
];

export function liveChatProviderLabel(id: LiveChatProviderId | null | undefined) {
  return LIVE_CHAT_PROVIDERS.find((p) => p.id === id)?.name ?? "Live chat";
}

export function getLiveChatProvider(id: LiveChatProviderId) {
  return LIVE_CHAT_PROVIDERS.find((p) => p.id === id) ?? LIVE_CHAT_PROVIDERS.at(-1)!;
}

/**
 * Mount pasted widget HTML by re-creating <script> tags (browsers ignore
 * scripts inserted via innerHTML). Tags elements with data-salesy-livechat
 * so we can tear them down when disabled.
 */
export function mountLiveChatSnippet(snippet: string) {
  unmountLiveChatSnippet();

  const trimmed = snippet.trim();
  if (!trimmed) return;

  const wrap = document.createElement("div");
  wrap.id = "salesy-live-chat-root";
  wrap.setAttribute("data-salesy-livechat", "root");
  wrap.style.display = "none";
  document.body.appendChild(wrap);

  const parsed = new DOMParser().parseFromString(trimmed, "text/html");
  const nodes = [
    ...Array.from(parsed.head.childNodes),
    ...Array.from(parsed.body.childNodes),
  ];

  for (const node of nodes) {
    if (node.nodeName.toLowerCase() === "script") {
      const srcEl = node as HTMLScriptElement;
      const script = document.createElement("script");
      script.setAttribute("data-salesy-livechat", "script");
      for (const attr of Array.from(srcEl.attributes)) {
        script.setAttribute(attr.name, attr.value);
      }
      if (srcEl.textContent) script.text = srcEl.textContent;
      document.body.appendChild(script);
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const clone = (node as Element).cloneNode(true) as HTMLElement;
      clone.setAttribute("data-salesy-livechat", "node");
      wrap.appendChild(clone);
    }
  }
}

export function unmountLiveChatSnippet() {
  document
    .querySelectorAll("[data-salesy-livechat]")
    .forEach((el) => el.remove());
}
