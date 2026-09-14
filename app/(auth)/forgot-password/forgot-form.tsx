"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthGate, AuthShell, SubmitButton, TextField } from "@/components/auth";
import {
  forgotPasswordSchema,
  type ForgotPasswordValues,
} from "@/lib/auth-schemas";
import { delayMs, useAuthStore } from "@/lib/auth-store";
import { fieldErrorClass } from "@/components/auth/styles";

function ForgotForm() {
  const router = useRouter();
  const requestReset = useAuthStore((s) => s.requestReset);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: ForgotPasswordValues) {
    setFormError(null);
    await delayMs();
    const result = requestReset(values.email);
    if (!result.ok) {
      setFormError(result.error);
      return;
    }
    router.push("/forgot-password/verify");
  }

  return (
    <AuthShell
      title="Forgot password"
      description="Enter the email on your account. We’ll send a code so you can set a new password."
      footer={
        <Link href="/signin" className="font-medium text-link hover:text-link-hover">
          Back to sign in
        </Link>
      }
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />
        {formError ? (
          <p className={fieldErrorClass} role="alert">
            {formError}
          </p>
        ) : null}
        <SubmitButton loading={isSubmitting}>Send code</SubmitButton>
      </form>
    </AuthShell>
  );
}

export default function ForgotPasswordClient() {
  return (
    <AuthGate allow="any">
      <ForgotForm />
    </AuthGate>
  );
}
