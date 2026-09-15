"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  AuthDivider,
  AuthGate,
  AuthShell,
  GoogleButton,
  PasswordField,
  SubmitButton,
  TextField,
} from "@/components/auth";
import { getApiError, useSignInMutation } from "@/lib/auth/queries";
import { signInSchema, type SignInValues } from "@/lib/auth-schemas";
import { delayMs, useAuthStore } from "@/lib/auth-store";

function SignInForm() {
  const router = useRouter();
  const signIn = useSignInMutation();
  const signInGoogle = useAuthStore((s) => s.signInGoogle);
  const [googleLoading, setGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const loading = isSubmitting || signIn.isPending;

  function routeFor(next: string) {
    if (next === "pendingVerify") router.push("/signup/verify");
    else if (next === "pendingBusiness") router.push("/signup/business");
    else router.push("/dashboard");
  }

  async function onSubmit(values: SignInValues) {
    try {
      const data = await signIn.mutateAsync(values);
      toast.success("Signed in");
      routeFor(data.next);
    } catch (err) {
      toast.error(getApiError(err, "Could not sign in."));
    }
  }

  async function onGoogle() {
    setGoogleLoading(true);
    await delayMs();
    const result = signInGoogle();
    setGoogleLoading(false);
    toast.success("Signed in");
    routeFor(result.next);
  }

  return (
    <AuthShell
      title="Sign in"
      description="Welcome back. Open your store dashboard and keep selling."
      footer={
        <>
          New to Salesy?{" "}
          <Link href="/signup" className="font-medium text-link hover:text-link-hover">
            Create a store
          </Link>
        </>
      }
    >
      <GoogleButton
        label="Continue with Google"
        loading={googleLoading}
        disabled={loading}
        onClick={() => void onGoogle()}
      />
      <AuthDivider />
      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />
        <PasswordField
          label="Password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register("password")}
        />
        <div className="-mt-1 text-right">
          <Link
            href="/forgot-password"
            className="text-[14px] font-medium text-link hover:text-link-hover"
          >
            Forgot password?
          </Link>
        </div>
        <SubmitButton loading={loading}>Sign in</SubmitButton>
      </form>
    </AuthShell>
  );
}

export default function SignInPageClient() {
  return (
    <AuthGate allow={["anonymous"]}>
      <SignInForm />
    </AuthGate>
  );
}
