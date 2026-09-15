import type { Metadata } from "next";
import { Google_Sans, Google_Sans_Flex, Roboto_Mono } from "next/font/google";
import { AuthSessionSync } from "@/components/auth/auth-session-sync";
import { InlineScript } from "@/components/inline-script";
import { AppToaster } from "@/components/providers/app-toaster";
import { QueryProvider } from "@/components/providers/query-provider";
import { THEME_INIT_SCRIPT } from "@/lib/theme";
import "./globals.css";

const googleSans = Google_Sans({
  variable: "--font-google-sans",
  subsets: ["latin"],
  display: "swap",
  fallback: ["Roboto", "Arial", "Helvetica", "sans-serif"],
});

const googleSansFlex = Google_Sans_Flex({
  variable: "--font-google-sans-flex",
  subsets: ["latin"],
  display: "swap",
  fallback: ["Arial", "Helvetica", "sans-serif"],
  axes: ["opsz"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Salesy — Create an online store",
  description:
    "Salesy is an ecommerce platform for entrepreneurs to create online stores with a shareable unique URL.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-theme="light"
      data-theme-preference="system"
      className={`${googleSans.variable} ${googleSansFlex.variable} ${robotoMono.variable} h-full scroll-smooth antialiased`}
      suppressHydrationWarning
    >
      <head>
        <InlineScript html={THEME_INIT_SCRIPT} />
      </head>
      <body className="min-h-full flex flex-col font-sans" suppressHydrationWarning>
        <QueryProvider>
          <AuthSessionSync />
          <AppToaster />
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
