"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { AuthGate, AuthShell, PasswordField, SubmitButton } from "@/components/auth";
import {
  getApiError,
  useResetPasswordMutation,
} from "@/lib/auth/queries";
import {
  resetPasswordSchema,
  type ResetPasswordValues,
} from "@/lib/auth-schemas";
import { useAuthStore } from "@/lib/auth-store";

function ResetForm() {
  const router = useRouter();
  const reset = useResetPasswordMutation();
  const clearOtpFlow = useAuthStore((s) => s.clearOtpFlow);
  const hydrateFromSession = useAuthStore((s) => s.hydrateFromSession);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const loading = isSubmitting || reset.isPending;

  async function onSubmit(values: ResetPasswordValues) {
    try {
      await reset.mutateAsync({
        password: values.password,
        confirmPassword: values.confirmPassword,
        resetVerified: true,
      });
      clearOtpFlow();
      hydrateFromSession({
        status: "anonymous",
        user: null,
        business: null,
      });
      toast.success("Password updated. Sign in with your new password.");
      router.push("/signin");
    } catch (err) {
      toast.error(getApiError(err, "Could not update password."));
    }
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
        <SubmitButton loading={loading}>Update password</SubmitButton>
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
