"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
  useGooglePendingQuery,
  useSignupMutation,
} from "@/lib/auth/queries";
import { profileSchema, type ProfileValues } from "@/lib/auth-schemas";
import { googleErrorMessage } from "@/lib/auth-store";
import { fieldErrorClass } from "@/components/auth/styles";

function SignupProfileForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const signup = useSignupMutation();
  const googlePending = useGooglePendingQuery(
    searchParams.get("google") === "1",
  );

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
  const firstName = watch("firstName");
  const lastName = watch("lastName");
  const googleMode = provider === "google";
  const loading = isSubmitting || signup.isPending;

  useEffect(() => {
    const message = googleErrorMessage(searchParams.get("error"));
    if (message) toast.error(message);
  }, [searchParams]);

  // Google verified this identity server-side before redirecting back here
  // with ?google=1 — prefill and lock name/email, still collect phone.
  useEffect(() => {
    if (!googlePending.data) return;
    reset({
      firstName: googlePending.data.firstName,
      lastName: googlePending.data.lastName,
      email: googlePending.data.email,
      phone: "",
      provider: "google",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    });
  }, [googlePending.data, reset]);

  useEffect(() => {
    if (googlePending.isError) {
      toast.error("Your Google sign-in expired. Continue with Google again.");
    }
  }, [googlePending.isError]);

  function onGoogle() {
    // Full top-level navigation — Google's consent screen isn't reachable
    // via fetch/XHR. The callback redirects back here with ?google=1 once
    // it has verified the identity.
    window.location.href = "/api/auth/google/start?intent=signup";
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
            loading={googlePending.isFetching}
            disabled={loading}
            onClick={onGoogle}
          />
          <AuthDivider />
        </>
      ) : (
        <p className="mb-6 rounded-lg border border-border bg-surface px-4 py-3 text-[14px] text-muted">
          Continuing as{" "}
          <span className="font-medium text-heading">
            {firstName} {lastName}
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
              router.replace("/signup");
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
