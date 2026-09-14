"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEMO_OTP } from "@/lib/auth-schemas";
import type { LiveChatProviderId } from "@/lib/live-chat";

export type AuthStatus =
  | "anonymous"
  | "pendingVerify"
  | "pendingBusiness"
  | "signedIn";

export type AuthProvider = "email" | "google";

export type OtpPurpose = "signup" | "reset" | null;

export type AuthUser = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  /** Simulated credential for demo re-login only. */
  password: string | null;
  provider: AuthProvider;
  emailVerified: boolean;
};

export type AuthPlan = "free" | "boutique" | "pro";

export type AuthBusiness = {
  businessName: string;
  businessEmail: string;
  businessPhone: string;
  logoDataUrl?: string;
  hasPhysicalAddress: boolean;
  street?: string;
  city?: string;
  state?: string;
  description: string;
  ownerFirstName: string;
  ownerLastName: string;
  ownerEmail: string;
  ownerPhone: string;
  ownerRole: "Owner" | "Manager" | "Partner";
  isRegistered: boolean;
  cacNumber?: string;
  /** Demo plan — defaults to Free on signup. */
  plan: AuthPlan;
  /** salesy.link/{handle} */
  storeHandle: string;
  /** Live chat widget on the public storefront. */
  liveChatEnabled: boolean;
  /** Which provider the seller set up. */
  liveChatProvider: LiveChatProviderId;
  /** Pasted embed / widget snippet from the provider. */
  liveChatSnippet: string;
};

/** 4-digit payout / transaction PIN (demo storage). */
export const PAYOUT_PIN_LENGTH = 4;

export function isValidPayoutPin(pin: string) {
  return new RegExp(`^\\d{${PAYOUT_PIN_LENGTH}}$`).test(pin);
}

type AuthState = {
  status: AuthStatus;
  user: AuthUser | null;
  business: AuthBusiness | null;
  otpPurpose: OtpPurpose;
  /** After OTP verify for reset, allow password form. */
  resetReady: boolean;
  resetEmail: string | null;
  /** Demo-only transaction PIN for withdrawals. Null until set. */
  payoutPin: string | null;
  hydrated: boolean;
  setHydrated: (value: boolean) => void;
  signUpProfile: (input: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string | null;
    provider: AuthProvider;
  }) => { ok: true } | { ok: false; error: string };
  verifyOtp: (code: string) => { ok: true } | { ok: false; error: string };
  completeBusiness: (business: AuthBusiness) => void;
  signIn: (
    email: string,
    password: string,
  ) => { ok: true; next: AuthStatus } | { ok: false; error: string };
  signInGoogle: () => { ok: true; next: AuthStatus };
  beginGoogleSignup: () => {
    firstName: string;
    lastName: string;
    email: string;
  };
  requestReset: (
    email: string,
  ) => { ok: true } | { ok: false; error: string };
  resetPassword: (
    password: string,
  ) => { ok: true } | { ok: false; error: string };
  setPayoutPin: (
    pin: string,
    confirm: string,
  ) => { ok: true } | { ok: false; error: string };
  changePayoutPin: (
    current: string,
    next: string,
    confirm: string,
  ) => { ok: true } | { ok: false; error: string };
  verifyPayoutPin: (pin: string) => { ok: true } | { ok: false; error: string };
  setLiveChat: (input: {
    enabled: boolean;
    provider: LiveChatProviderId;
    snippet: string;
  }) => { ok: true } | { ok: false; error: string };
  signOut: () => void;
  clearOtpFlow: () => void;
};

export const MOCK_GOOGLE = {
  firstName: "Adaeze",
  lastName: "Okonkwo",
  email: "adaeze.okonkwo@gmail.com",
};

export function delayMs(ms = 700) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function slugifyHandle(name: string) {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 24);
  return slug || "mystore";
}

export function planLabel(plan: AuthPlan) {
  if (plan === "boutique") return "Boutique";
  if (plan === "pro") return "Pro";
  return "Free";
}

/** Salesy platform fee rate — Free only. Boutique and Pro: no commission. */
export function salesyFeeRate(plan: AuthPlan) {
  return plan === "free" ? 0.05 : 0;
}

export function productListingLimit(plan: AuthPlan) {
  return plan === "free" ? 5 : Infinity;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      status: "anonymous",
      user: null,
      business: null,
      otpPurpose: null,
      resetReady: false,
      resetEmail: null,
      payoutPin: null,
      hydrated: false,
      setHydrated: (value) => set({ hydrated: value }),

      signUpProfile: ({ firstName, lastName, email, phone, password, provider }) => {
        const normalized = email.trim().toLowerCase();
        const { user, status } = get();

        if (
          user &&
          user.email === normalized &&
          (status === "signedIn" || status === "pendingBusiness") &&
          user.emailVerified
        ) {
          return {
            ok: false,
            error: "An account with this email already exists. Sign in instead.",
          };
        }

        const isGoogle = provider === "google";
        set({
          status: isGoogle ? "pendingBusiness" : "pendingVerify",
          user: {
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: normalized,
            phone,
            password: isGoogle ? null : password,
            provider,
            emailVerified: isGoogle,
          },
          business: null,
          otpPurpose: isGoogle ? null : "signup",
          resetEmail: null,
          resetReady: false,
        });
        return { ok: true };
      },

      verifyOtp: (code) => {
        if (code !== DEMO_OTP) {
          return {
            ok: false,
            error: "That code is incorrect. Try 123456 for this demo.",
          };
        }

        const { otpPurpose, user, resetEmail } = get();
        if (otpPurpose === "signup" && user) {
          set({
            status: "pendingBusiness",
            user: { ...user, emailVerified: true },
            otpPurpose: null,
          });
          return { ok: true };
        }

        if (otpPurpose === "reset" && resetEmail) {
          set({ resetReady: true });
          return { ok: true };
        }

        return { ok: false, error: "No verification in progress." };
      },

      completeBusiness: (business) => {
        set({
          business: {
            ...business,
            plan: business.plan ?? "free",
            storeHandle:
              business.storeHandle || slugifyHandle(business.businessName),
            liveChatEnabled: business.liveChatEnabled ?? false,
            liveChatProvider: business.liveChatProvider ?? "smartsupp",
            liveChatSnippet: business.liveChatSnippet ?? "",
          },
          status: "signedIn",
          otpPurpose: null,
        });
      },

      signIn: (email, password) => {
        const { user, business } = get();
        const normalized = email.trim().toLowerCase();

        if (!user || user.email !== normalized) {
          return {
            ok: false,
            error: "No account found for that email. Create a store first.",
          };
        }

        if (user.provider === "google") {
          return {
            ok: false,
            error: "This account uses Google. Continue with Google instead.",
          };
        }

        if (user.password !== password) {
          return { ok: false, error: "Incorrect email or password." };
        }

        if (!user.emailVerified) {
          set({ status: "pendingVerify", otpPurpose: "signup" });
          return { ok: true, next: "pendingVerify" };
        }

        if (!business) {
          set({ status: "pendingBusiness" });
          return { ok: true, next: "pendingBusiness" };
        }

        set({ status: "signedIn" });
        return { ok: true, next: "signedIn" };
      },

      signInGoogle: () => {
        const { user, business } = get();
        const googleEmail = MOCK_GOOGLE.email.toLowerCase();

        if (user?.email === googleEmail && user.provider === "google") {
          if (!business) {
            set({ status: "pendingBusiness" });
            return { ok: true, next: "pendingBusiness" };
          }
          set({ status: "signedIn" });
          return { ok: true, next: "signedIn" };
        }

        set({
          status: "pendingBusiness",
          user: {
            firstName: MOCK_GOOGLE.firstName,
            lastName: MOCK_GOOGLE.lastName,
            email: googleEmail,
            phone: "",
            password: null,
            provider: "google",
            emailVerified: true,
          },
          business: null,
          otpPurpose: null,
          resetReady: false,
          resetEmail: null,
        });
        return { ok: true, next: "pendingBusiness" };
      },

      beginGoogleSignup: () => MOCK_GOOGLE,

      requestReset: (email) => {
        const { user } = get();
        const normalized = email.trim().toLowerCase();

        if (!user || user.email !== normalized) {
          return { ok: false, error: "No account found for that email." };
        }

        if (user.provider === "google") {
          return {
            ok: false,
            error: "This account uses Google. Sign in with Google instead.",
          };
        }

        set({
          otpPurpose: "reset",
          resetEmail: normalized,
          resetReady: false,
        });
        return { ok: true };
      },

      resetPassword: (password) => {
        const { user, resetEmail, resetReady } = get();
        if (!user || !resetEmail || user.email !== resetEmail || !resetReady) {
          return { ok: false, error: "Reset session expired. Start again." };
        }

        set({
          user: { ...user, password },
          resetEmail: null,
          resetReady: false,
          otpPurpose: null,
          status: "anonymous",
        });
        return { ok: true };
      },

      setPayoutPin: (pin, confirm) => {
        if (!isValidPayoutPin(pin)) {
          return {
            ok: false,
            error: `PIN must be exactly ${PAYOUT_PIN_LENGTH} digits.`,
          };
        }
        if (pin !== confirm) {
          return { ok: false, error: "PINs do not match." };
        }
        if (get().payoutPin) {
          return {
            ok: false,
            error: "A payout PIN is already set. Change it from Settings.",
          };
        }
        set({ payoutPin: pin });
        return { ok: true };
      },

      changePayoutPin: (current, next, confirm) => {
        const { payoutPin } = get();
        if (!payoutPin) {
          return { ok: false, error: "Create a payout PIN first." };
        }
        if (current !== payoutPin) {
          return { ok: false, error: "Current PIN is incorrect." };
        }
        if (!isValidPayoutPin(next)) {
          return {
            ok: false,
            error: `New PIN must be exactly ${PAYOUT_PIN_LENGTH} digits.`,
          };
        }
        if (next !== confirm) {
          return { ok: false, error: "New PINs do not match." };
        }
        if (next === current) {
          return { ok: false, error: "Choose a different PIN." };
        }
        set({ payoutPin: next });
        return { ok: true };
      },

      verifyPayoutPin: (pin) => {
        const { payoutPin } = get();
        if (!payoutPin) {
          return { ok: false, error: "Create a payout PIN before withdrawing." };
        }
        if (!isValidPayoutPin(pin) || pin !== payoutPin) {
          return { ok: false, error: "Incorrect payout PIN." };
        }
        return { ok: true };
      },

      setLiveChat: ({ enabled, provider, snippet }) => {
        const { business } = get();
        if (!business) {
          return { ok: false, error: "Finish business setup first." };
        }
        const trimmed = snippet.trim();
        if (enabled && !trimmed) {
          return {
            ok: false,
            error: "Paste your chat widget code before turning live chat on.",
          };
        }
        set({
          business: {
            ...business,
            liveChatEnabled: enabled,
            liveChatProvider: provider,
            liveChatSnippet: trimmed,
          },
        });
        return { ok: true };
      },

      signOut: () => {
        set({
          status: "anonymous",
          otpPurpose: null,
          resetEmail: null,
          resetReady: false,
        });
      },

      clearOtpFlow: () =>
        set({ otpPurpose: null, resetEmail: null, resetReady: false }),
    }),
    {
      name: "salesy-auth",
      partialize: (state) => ({
        status: state.status,
        user: state.user,
        business: state.business,
        resetEmail: state.resetEmail,
        resetReady: state.resetReady,
        otpPurpose: state.otpPurpose,
        payoutPin: state.payoutPin,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.business) {
          const business = state.business;
          state.business = {
            ...business,
            plan: business.plan ?? "free",
            storeHandle:
              business.storeHandle ||
              slugifyHandle(business.businessName || "mystore"),
            liveChatEnabled: business.liveChatEnabled ?? false,
            liveChatProvider: business.liveChatProvider ?? "smartsupp",
            liveChatSnippet: business.liveChatSnippet ?? "",
          };
        }
        state?.setHydrated(true);
      },
    },
  ),
);
