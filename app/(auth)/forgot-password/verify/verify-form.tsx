"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { AuthGate, AuthShell, OtpInput, SubmitButton } from "@/components/auth";
import { getApiError, useVerifyOtpMutation } from "@/lib/auth/queries";
import { otpSchema, type OtpValues } from "@/lib/auth-schemas";
import { useAuthStore } from "@/lib/auth-store";

function ResetVerifyForm() {
  const router = useRouter();
  const resetEmail = useAuthStore((s) => s.resetEmail);
  const markResetVerified = useAuthStore((s) => s.markResetVerified);
  const verifyOtp = useVerifyOtpMutation();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OtpValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { code: "" },
  });

  const loading = isSubmitting || verifyOtp.isPending;

  async function onSubmit(values: OtpValues) {
    try {
      await verifyOtp.mutateAsync({ code: values.code, purpose: "reset" });
      markResetVerified();
      toast.success("Code verified. Set a new password.");
      router.replace("/reset-password");
    } catch (err) {
      toast.error(getApiError(err, "Invalid or expired code."));
    }
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
        <SubmitButton loading={loading}>Continue</SubmitButton>
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
