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

function VerifyForm() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
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
    router.push("/signup/business");
  }

  return (
    <AuthShell
      title="Check your email"
      description={`We sent a 6-digit code to ${user?.email ?? "your inbox"}. Enter it below to verify your account.`}
      footer={
        <Link href="/signup" className="font-medium text-link hover:text-link-hover">
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
        <SubmitButton loading={isSubmitting}>Verify email</SubmitButton>
      </form>
    </AuthShell>
  );
}

export default function SignupVerifyClient() {
  return (
    <AuthGate allow={["pendingVerify"]} require={{ otpPurpose: "signup", hasUser: true }}>
      <VerifyForm />
    </AuthGate>
  );
}
