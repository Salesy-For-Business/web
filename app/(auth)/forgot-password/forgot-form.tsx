"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { AuthGate, AuthShell, SubmitButton, TextField } from "@/components/auth";
import {
  getApiError,
  useForgotPasswordMutation,
} from "@/lib/auth/queries";
import {
  forgotPasswordSchema,
  type ForgotPasswordValues,
} from "@/lib/auth-schemas";
import { useAuthStore } from "@/lib/auth-store";

function ForgotForm() {
  const router = useRouter();
  const forgot = useForgotPasswordMutation();
  const beginPasswordReset = useAuthStore((s) => s.beginPasswordReset);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const loading = isSubmitting || forgot.isPending;

  async function onSubmit(values: ForgotPasswordValues) {
    try {
      const data = await forgot.mutateAsync(values.email);
      beginPasswordReset(values.email);
      toast.success(data.message ?? "Check your email for a reset code.");
      router.push("/forgot-password/verify");
    } catch (err) {
      toast.error(getApiError(err, "Could not send reset code."));
    }
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
        <SubmitButton loading={loading}>Send code</SubmitButton>
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
