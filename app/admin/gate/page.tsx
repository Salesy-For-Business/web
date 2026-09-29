"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { ShieldCheck } from "lucide-react";
import {
  fieldErrorClass,
  fieldLabelClass,
  inputClass,
  primaryButtonClass,
} from "@/components/auth/styles";
import { useAdminMeQuery, useVerifyAdminPinMutation, getApiError } from "@/lib/admin/queries";
import { landingPathForRole } from "@/lib/admin/nav";

export default function AdminGatePage() {
  const router = useRouter();
  const { data, isPending, isError, isFetched } = useAdminMeQuery();
  const ready = isFetched || isError || !isPending;
  const verify = useVerifyAdminPinMutation();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ready) return;
    if (isError || !data?.isModerator) {
      router.replace("/dashboard");
      return;
    }
    if (data.gateVerified && data.moderatorRole) {
      router.replace(landingPathForRole(data.moderatorRole));
    }
  }, [ready, isError, data, router]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      await verify.mutateAsync(code);
      const role = data?.moderatorRole;
      router.replace(role ? landingPathForRole(role) : "/admin");
    } catch (err) {
      setError(getApiError(err, "Incorrect code."));
    }
  }

  if (!ready || (data?.isModerator && data.gateVerified)) {
    return (
      <div className="flex flex-1 items-center justify-center py-24 text-[14px] text-muted">
        Loading…
      </div>
    );
  }

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-16">
      <form
        onSubmit={onSubmit}
        noValidate
        className="w-full max-w-sm rounded-xl border border-border bg-background p-6"
      >
        <div className="flex size-10 items-center justify-center rounded-full bg-tonal text-link">
          <ShieldCheck className="size-5" aria-hidden />
        </div>
        <h1 className="mt-4 text-[20px] leading-7 text-heading">Admin access</h1>
        <p className="mt-2 text-[14px] leading-6 text-muted">
          Enter the shared 6-digit admin code to continue.
        </p>

        <div className="mt-5">
          <label htmlFor="admin-pin" className={fieldLabelClass}>
            6-digit code
          </label>
          <input
            id="admin-pin"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            className={clsx(inputClass, "text-center tracking-[0.4em]")}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          />
        </div>

        {error ? (
          <p className={fieldErrorClass} role="alert">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={verify.isPending || code.length !== 6}
          className={clsx(primaryButtonClass, "mt-5")}
        >
          {verify.isPending ? "Verifying…" : "Continue"}
        </button>
      </form>
    </div>
  );
}
