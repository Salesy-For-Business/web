"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthGate, AuthShell, OtpInput, SubmitButton } from "@/components/auth";
import { otpSchema, type OtpValues } from "@/lib/auth-schemas";
import { delayMs, useAuthStore } from "@/lib/auth-store";
import { fieldErrorClass } from "@/components/auth/styles";

function ResetVerifyForm() {
  const router = useRouter();
  const resetEmail = useAuthStore((s) => s.resetEmail);
  const verifyOtp = useAuthStore((s) => s.verifyOtp);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OtpValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { code: "" },
  });

  async function onSubmit(values: OtpValues) {
    setFormError(null);
    await delayMs();
    const result = verifyOtp(values.code);
    if (!result.ok) {
      setFormError(result.error);
      return;
    }
    router.replace("/reset-password");
  }

  return (
    <AuthShell
      title="Enter the code"
      description={`We sent a 6-digit code to ${resetEmail ?? "your email"}.`}
      footer={
        <Link
          href="/forgot-password"
          className="font-medium text-link hover:text-link-hover"
        >
          Use a different email
        </Link>
      }
    >
      <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Controller
          name="code"
          control={control}
          render={({ field }) => (
            <OtpInput
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={errors.code?.message}
            />
          )}
        />
        {formError ? (
          <p className={fieldErrorClass} role="alert">
            {formError}
          </p>
        ) : null}
        <SubmitButton loading={isSubmitting}>Continue</SubmitButton>
      </form>
    </AuthShell>
  );
}

export default function ForgotVerifyClient() {
  return (
    <AuthGate allow="any" require={{ otpPurpose: "reset" }}>
      <ResetVerifyForm />
    </AuthGate>
  );
}
