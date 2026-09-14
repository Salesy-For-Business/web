"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthGate, AuthShell, PasswordField, SubmitButton } from "@/components/auth";
import {
  resetPasswordSchema,
  type ResetPasswordValues,
} from "@/lib/auth-schemas";
import { delayMs, useAuthStore } from "@/lib/auth-store";
import { fieldErrorClass } from "@/components/auth/styles";

function ResetForm() {
  const router = useRouter();
  const resetPassword = useAuthStore((s) => s.resetPassword);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  async function onSubmit(values: ResetPasswordValues) {
    setFormError(null);
    await delayMs();
    const result = resetPassword(values.password);
    if (!result.ok) {
      setFormError(result.error);
      return;
    }
    router.push("/signin");
  }

  return (
    <AuthShell
      title="Set a new password"
      description="Choose a password you’ll remember. Then sign in with it."
      footer={
        <Link href="/signin" className="font-medium text-link hover:text-link-hover">
          Back to sign in
        </Link>
      }
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <PasswordField
          label="New password"
          autoComplete="new-password"
          hint="At least 8 characters, with a letter and a number."
          error={errors.password?.message}
          {...register("password")}
        />
        <PasswordField
          label="Confirm password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />
        {formError ? (
          <p className={fieldErrorClass} role="alert">
            {formError}
          </p>
        ) : null}
        <SubmitButton loading={isSubmitting}>Update password</SubmitButton>
      </form>
    </AuthShell>
  );
}

export default function ResetPasswordClient() {
  return (
    <AuthGate allow="any" require={{ resetReady: true }}>
      <ResetForm />
    </AuthGate>
  );
}
