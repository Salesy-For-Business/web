"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { api, getApiError, type ApiOk } from "@/lib/api/client";
import type { AuthBusiness, AuthStatus, AuthUser } from "@/lib/auth-store";
import type {
  BusinessValues,
  ProfileValues,
  SignInValues,
} from "@/lib/auth-schemas";

export const authKeys = {
  session: ["auth", "session"] as const,
  handle: (handle: string) => ["business", "handle", handle] as const,
};

export type SessionPayload = {
  status: AuthStatus;
  user: AuthUser | null;
  business: AuthBusiness | null;
};

async function fetchSession() {
  const { data } = await api.get<ApiOk<SessionPayload>>("/auth/me");
  return {
    status: data.status,
    user: data.user,
    business: data.business,
  } satisfies SessionPayload;
}

export function useAuthSession(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: authKeys.session,
    queryFn: fetchSession,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: true,
    retry: 1,
    enabled: options?.enabled ?? true,
  });
}

export function useHandleAvailability(handle: string, enabled: boolean) {
  const normalized = handle.trim().toLowerCase();
  return useQuery({
    queryKey: authKeys.handle(normalized),
    queryFn: async () => {
      const { data } = await api.get<
        ApiOk<{ handle: string; available: boolean; message: string }>
      >("/business/handle", { params: { handle: normalized } });
      return data;
    },
    enabled: enabled && normalized.length >= 3,
    staleTime: 15_000,
    retry: false,
  });
}

/** The name/email Google verified for a signup in progress — read back
 * after the OAuth redirect so the form can prefill and finish collecting
 * the phone number. 404s once expired or if there's nothing pending. */
export function useGooglePendingQuery(enabled: boolean) {
  return useQuery({
    queryKey: ["auth", "google-pending"],
    queryFn: async () => {
      const { data } = await api.get<
        ApiOk<{ firstName: string; lastName: string; email: string }>
      >("/auth/google/pending");
      return data;
    },
    enabled,
    retry: false,
    staleTime: Infinity,
  });
}

export function useSignupMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: ProfileValues) => {
      const { data } = await api.post<
        ApiOk<{ next: AuthStatus; user?: AuthUser; message?: string }>
      >("/auth/signup", values);
      return data;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: authKeys.session });
    },
    onError: () => undefined,
  });
}

export function useSignInMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: SignInValues) => {
      const { data } = await api.post<
        ApiOk<{
          next: AuthStatus;
          user: AuthUser;
          business: AuthBusiness | null;
        }>
      >("/auth/signin", values);
      return data;
    },
    onSuccess: async (data) => {
      qc.setQueryData(authKeys.session, {
        status: data.next,
        user: data.user,
        business: data.business,
      } satisfies SessionPayload);
    },
  });
}

export function useVerifyOtpMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      code: string;
      purpose?: "signup" | "reset";
    }) => {
      const { data } = await api.post<
        ApiOk<{
          next: string;
          user?: AuthUser;
          resetReady?: boolean;
        }>
      >("/auth/verify-otp", input);
      return data;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: authKeys.session });
    },
  });
}

export function useCompleteBusinessMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: BusinessValues) => {
      const { data } = await api.post<
        ApiOk<{
          next: AuthStatus;
          user: AuthUser;
          business: AuthBusiness;
        }>
      >("/business", values);
      return data;
    },
    onSuccess: (data) => {
      qc.setQueryData(authKeys.session, {
        status: data.next,
        user: data.user,
        business: data.business,
      } satisfies SessionPayload);
    },
  });
}

export function useSignOutMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await api.post("/auth/signout");
    },
    onSuccess: () => {
      qc.setQueryData(authKeys.session, {
        status: "anonymous",
        user: null,
        business: null,
      } satisfies SessionPayload);
    },
  });
}

export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: async (email: string) => {
      const { data } = await api.post<ApiOk<{ message: string }>>(
        "/auth/forgot-password",
        { email },
      );
      return data;
    },
  });
}

export function useResetPasswordMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      password: string;
      confirmPassword: string;
      resetVerified: boolean;
    }) => {
      const { data } = await api.post<ApiOk<{ next: AuthStatus }>>(
        "/auth/reset-password",
        input,
      );
      return data;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: authKeys.session });
    },
  });
}

export { getApiError };
