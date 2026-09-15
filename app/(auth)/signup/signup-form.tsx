"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  AuthDivider,
  AuthGate,
  AuthShell,
  GoogleButton,
  PasswordField,
  PhoneField,
  SignupStepper,
  SubmitButton,
  TextField,
} from "@/components/auth";
import {
  getApiError,
  useSignupMutation,
} from "@/lib/auth/queries";
import { profileSchema, type ProfileValues } from "@/lib/auth-schemas";
import { delayMs, MOCK_GOOGLE, useAuthStore } from "@/lib/auth-store";
import { fieldErrorClass } from "@/components/auth/styles";

function SignupProfileForm() {
  const router = useRouter();
  const signup = useSignupMutation();
  const beginGoogleSignup = useAuthStore((s) => s.beginGoogleSignup);
  const [googleLoading, setGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      provider: "email",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
  });

  const provider = watch("provider");
  const googleMode = provider === "google";
  const loading = isSubmitting || signup.isPending;

  async function onGoogle() {
    setGoogleLoading(true);
    await delayMs(400);
    const profile = beginGoogleSignup();
    reset({
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      phone: "",
      provider: "google",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    });
    setGoogleLoading(false);
  }

  async function onSubmit(values: ProfileValues) {
    try {
      const data = await signup.mutateAsync(values);
      if (data.next === "pendingBusiness") {
        toast.success("Account ready. Set up your business next.");
        router.push("/signup/business");
      } else {
        toast.success(data.message ?? "Check your email for a verification code.");
        router.push("/signup/verify");
      }
    } catch (err) {
      toast.error(getApiError(err, "Could not create your account."));
    }
  }

  return (
    <AuthShell
      title="Create your account"
      description="Tell us who you are. Next you’ll set up the business behind your store."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/signin" className="font-medium text-link hover:text-link-hover">
            Sign in
          </Link>
        </>
      }
    >
      <SignupStepper current={1} />

      {!googleMode ? (
        <>
          <GoogleButton
            label="Continue with Google"
            loading={googleLoading}
            disabled={loading}
            onClick={() => void onGoogle()}
          />
          <AuthDivider />
        </>
      ) : (
        <p className="mb-6 rounded-lg border border-border bg-surface px-4 py-3 text-[14px] text-muted">
          Continuing as{" "}
          <span className="font-medium text-heading">
            {MOCK_GOOGLE.firstName} {MOCK_GOOGLE.lastName}
          </span>{" "}
          via Google. Add your phone to finish this step.
        </p>
      )}

      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <input type="hidden" {...register("provider")} />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="First name"
            autoComplete="given-name"
            error={errors.firstName?.message}
            readOnly={googleMode}
            {...register("firstName")}
          />
          <TextField
            label="Last name"
            autoComplete="family-name"
            error={errors.lastName?.message}
            readOnly={googleMode}
            {...register("lastName")}
          />
        </div>
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          readOnly={googleMode}
          {...register("email")}
        />
        <Controller
          name="phone"
          control={control}
          render={({ field }) => (
            <PhoneField
              label="Phone number"
              error={errors.phone?.message}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              name={field.name}
            />
          )}
        />
        {!googleMode ? (
          <>
            <PasswordField
              label="Password"
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
          </>
        ) : null}

        <Controller
          name="acceptTerms"
          control={control}
          render={({ field }) => (
            <label className="flex items-start gap-3 text-[14px] leading-5 text-foreground">
              <input
                type="checkbox"
                className="mt-0.5 size-4 rounded border-border text-primary focus:ring-primary"
                checked={field.value}
                onChange={(e) => field.onChange(e.target.checked)}
                onBlur={field.onBlur}
                ref={field.ref}
                name={field.name}
              />
              <span>
                I agree to the{" "}
                <Link href="/terms" className="font-medium text-link hover:text-link-hover">
                  Terms
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="font-medium text-link hover:text-link-hover">
                  Privacy Policy
                </Link>
                .
              </span>
            </label>
          )}
        />
        {errors.acceptTerms ? (
          <p className={fieldErrorClass} role="alert">
            {errors.acceptTerms.message}
          </p>
        ) : null}

        <SubmitButton loading={loading}>
          {googleMode ? "Continue to business" : "Continue"}
        </SubmitButton>
        {googleMode ? (
          <button
            type="button"
            className="text-[14px] font-medium text-link hover:text-link-hover"
            onClick={() => {
              setValue("provider", "email");
              setValue("firstName", "");
              setValue("lastName", "");
              setValue("email", "");
              setValue("phone", "");
              setValue("password", "");
              setValue("confirmPassword", "");
              setValue("acceptTerms", false);
            }}
          >
            Use email instead
          </button>
        ) : null}
      </form>
    </AuthShell>
  );
}

export default function SignupPageClient() {
  return (
    <AuthGate allow={["anonymous"]}>
      <SignupProfileForm />
    </AuthGate>
  );
}
