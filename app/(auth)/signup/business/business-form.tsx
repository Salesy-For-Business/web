"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import {
  AuthGate,
  AuthShell,
  FileDropzone,
  PhoneField,
  SignupStepper,
  SubmitButton,
  TextField,
} from "@/components/auth";
import {
  getApiError,
  useCompleteBusinessMutation,
  useHandleAvailability,
} from "@/lib/auth/queries";
import { businessSchema, type BusinessValues } from "@/lib/auth-schemas";
import { slugifyHandle, useAuthStore } from "@/lib/auth-store";
import { NIGERIAN_STATES } from "@/lib/nigeria";
import {
  fieldErrorClass,
  fieldHintClass,
  fieldLabelClass,
  inputClass,
  textareaClass,
} from "@/components/auth/styles";
import clsx from "clsx";

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-border px-4 py-3">
      <div>
        <p className="text-[14px] font-medium text-heading">{label}</p>
        {description ? (
          <p className="mt-0.5 text-[13px] text-muted">{description}</p>
        ) : null}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={clsx(
          "relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors",
          checked ? "bg-primary" : "bg-border",
        )}
      >
        <span
          className={clsx(
            "absolute top-0.5 left-0.5 size-5 rounded-full bg-white transition-transform",
            checked && "translate-x-5",
          )}
        />
      </button>
    </div>
  );
}

function BusinessForm() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const hydrateFromSession = useAuthStore((s) => s.hydrateFromSession);
  const completeBusiness = useCompleteBusinessMutation();
  const [debouncedHandle, setDebouncedHandle] = useState("");

  const {
    register,
    handleSubmit,
    control,
    setValue,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<BusinessValues>({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      businessName: "",
      storeHandle: "",
      usePersonalEmail: true,
      businessEmail: "",
      usePersonalPhone: true,
      businessPhone: "",
      logoDataUrl: undefined,
      socialImageUrl: undefined,
      hasPhysicalAddress: false,
      street: "",
      city: "",
      state: "",
      description: "",
      useProfileOwner: true,
      ownerFirstName: "",
      ownerLastName: "",
      ownerEmail: "",
      ownerPhone: "",
      ownerRole: "Owner",
      isRegistered: false,
      cacNumber: "",
    },
  });

  const usePersonalEmail = useWatch({ control, name: "usePersonalEmail" });
  const usePersonalPhone = useWatch({ control, name: "usePersonalPhone" });
  const hasPhysicalAddress = useWatch({ control, name: "hasPhysicalAddress" });
  const useProfileOwner = useWatch({ control, name: "useProfileOwner" });
  const isRegistered = useWatch({ control, name: "isRegistered" });
  const businessName = useWatch({ control, name: "businessName" });
  const storeHandle = useWatch({ control, name: "storeHandle" }) ?? "";

  useEffect(() => {
    if (!businessName?.trim() || storeHandle.trim()) return;
    setValue("storeHandle", slugifyHandle(businessName), {
      shouldValidate: false,
    });
  }, [businessName, storeHandle, setValue]);

  useEffect(() => {
    const handle = storeHandle.trim().toLowerCase();
    const timer = window.setTimeout(() => setDebouncedHandle(handle), 350);
    return () => window.clearTimeout(timer);
  }, [storeHandle]);

  const handleCheck = useHandleAvailability(
    debouncedHandle,
    debouncedHandle.length >= 3,
  );

  useEffect(() => {
    if (!handleCheck.isSuccess) return;
    if (!handleCheck.data.available) {
      setError("storeHandle", {
        type: "manual",
        message:
          handleCheck.data.message ||
          "That store handle is already registered. Choose another.",
      });
    } else {
      clearErrors("storeHandle");
    }
  }, [handleCheck.isSuccess, handleCheck.data, setError, clearErrors]);

  const loading = isSubmitting || completeBusiness.isPending;
  const handleUnavailable =
    handleCheck.isSuccess && handleCheck.data.available === false;
  const handleAvailable =
    handleCheck.isSuccess && handleCheck.data.available === true;
  const handleChecking =
    debouncedHandle.length >= 3 &&
    (handleCheck.isFetching || handleCheck.isPending);

  async function onSubmit(values: BusinessValues) {
    if (!user) return;
    if (handleUnavailable) {
      setError("storeHandle", {
        type: "manual",
        message: "That store handle is already registered. Choose another.",
      });
      toast.error("That store handle is already registered. Choose another.");
      return;
    }

    try {
      const data = await completeBusiness.mutateAsync(values);
      hydrateFromSession({
        status: data.next,
        user: data.user,
        business: data.business,
      });
      toast.success("Store created. Welcome to your dashboard.");
      router.push("/dashboard");
    } catch (err) {
      const message = getApiError(
        err,
        "Could not save your business. Try again.",
      );
      if (/already registered|handle/i.test(message)) {
        setError("storeHandle", { type: "manual", message });
      }
      toast.error(message);
    }
  }

  return (
    <AuthShell
      title="Your business"
      description="A few details so buyers know who they’re ordering from."
    >
      <SignupStepper current={2} />

      <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <TextField
          label="Business name"
          autoComplete="organization"
          error={errors.businessName?.message}
          placeholder="e.g Quest Store"
          {...register("businessName")}
        />

        <div>
          <label htmlFor="storeHandle" className={fieldLabelClass}>
            Store URL
          </label>
          <div
            className={clsx(
              "flex h-12 w-full overflow-hidden rounded-lg border bg-surface",
              errors.storeHandle
                ? "border-red-500"
                : "border-border focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30",
            )}
          >
            <span className="flex shrink-0 items-center border-r border-border bg-surface px-3 text-[13px] text-muted sm:text-[14px]">
              https://salesy.link/
            </span>
            <input
              id="storeHandle"
              autoComplete="off"
              spellCheck={false}
              placeholder="newstore"
              aria-invalid={errors.storeHandle ? true : undefined}
              className="min-w-0 flex-1 border-0 bg-background px-3 text-[16px] text-foreground outline-none placeholder:text-muted"
              value={storeHandle}
              onChange={(e) => {
                const next = e.target.value
                  .toLowerCase()
                  .replace(/[^a-z0-9]/g, "")
                  .slice(0, 24);
                setValue("storeHandle", next, { shouldValidate: true });
              }}
            />
          </div>
          <div className="mt-1.5 flex min-h-5 items-center gap-1.5" aria-live="polite">
            {errors.storeHandle ? (
              <>
                <X className="size-3.5 shrink-0 text-red-600 dark:text-red-500" aria-hidden />
                <p className="text-[13px] text-red-600 dark:text-red-500" role="alert">
                  {errors.storeHandle.message}
                </p>
              </>
            ) : debouncedHandle.length >= 3 ? (
              <>
                {handleChecking ? (
                  <>
                    <Loader2
                      className="size-3.5 shrink-0 animate-spin text-muted"
                      aria-hidden
                    />
                    <p className={fieldHintClass}>Checking availability…</p>
                  </>
                ) : handleAvailable ? (
                  <>
                    <Check
                      className="size-3.5 shrink-0 text-emerald-600"
                      aria-hidden
                    />
                    <p className="text-[13px] text-emerald-700 dark:text-emerald-400">
                      Handle is available.
                    </p>
                  </>
                ) : handleUnavailable ? (
                  <>
                    <X
                      className="size-3.5 shrink-0 text-red-600 dark:text-red-500"
                      aria-hidden
                    />
                    <p className="text-[13px] text-red-600 dark:text-red-500">
                      Already registered. Choose another.
                    </p>
                  </>
                ) : null}
              </>
            ) : (
              <p className={fieldHintClass}>
                Letters and numbers only. At least 3 characters.
              </p>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <Controller
            name="usePersonalEmail"
            control={control}
            render={({ field }) => (
              <ToggleRow
                label="Use my personal email"
                description={user?.email}
                checked={field.value}
                onChange={field.onChange}
              />
            )}
          />
          {!usePersonalEmail ? (
            <TextField
              label="Business email"
              type="email"
              error={errors.businessEmail?.message}
              {...register("businessEmail")}
            />
          ) : null}
        </div>

        <div className="space-y-3">
          <Controller
            name="usePersonalPhone"
            control={control}
            render={({ field }) => (
              <ToggleRow
                label="Use my personal phone"
                description={user?.phone}
                checked={field.value}
                onChange={field.onChange}
              />
            )}
          />
          {!usePersonalPhone ? (
            <Controller
              name="businessPhone"
              control={control}
              render={({ field }) => (
                <PhoneField
                  label="Business phone"
                  error={errors.businessPhone?.message}
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  name={field.name}
                />
              )}
            />
          ) : null}
        </div>

        <Controller
          name="logoDataUrl"
          control={control}
          render={({ field }) => (
            <FileDropzone
              value={field.value}
              onChange={field.onChange}
              error={errors.logoDataUrl?.message}
            />
          )}
        />

        <Controller
          name="socialImageUrl"
          control={control}
          render={({ field }) => (
            <FileDropzone
              label="Social share image (optional)"
              hint="Shown when your store link is shared on WhatsApp, X, or Facebook. Falls back to your logo, then your first product photo. Landscape images (1200×630) look best."
              value={field.value}
              onChange={field.onChange}
              error={errors.socialImageUrl?.message}
            />
          )}
        />

        <Controller
          name="hasPhysicalAddress"
          control={control}
          render={({ field }) => (
            <ToggleRow
              label="I have a physical address"
              description="Optional. Share a shop or warehouse location."
              checked={field.value}
              onChange={field.onChange}
            />
          )}
        />

        {hasPhysicalAddress ? (
          <div className="flex flex-col gap-4">
            <TextField
              label="Street address"
              autoComplete="street-address"
              error={errors.street?.message}
              {...register("street")}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                label="City"
                autoComplete="address-level2"
                error={errors.city?.message}
                {...register("city")}
              />
              <div>
                <label htmlFor="state" className={fieldLabelClass}>
                  State
                </label>
                <select
                  id="state"
                  className={inputClass}
                  aria-invalid={errors.state ? true : undefined}
                  {...register("state")}
                >
                  <option value="">Select state</option>
                  {NIGERIAN_STATES.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
                {errors.state ? (
                  <p className={fieldErrorClass} role="alert">
                    {errors.state.message}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}

        <div>
          <label htmlFor="description" className={fieldLabelClass}>
            Business description
          </label>
          <textarea
            id="description"
            rows={4}
            placeholder="What do you sell, and who is it for?"
            className={textareaClass}
            aria-invalid={errors.description ? true : undefined}
            {...register("description")}
          />
          {errors.description ? (
            <p className={fieldErrorClass} role="alert">
              {errors.description.message}
            </p>
          ) : null}
        </div>

        <Controller
          name="useProfileOwner"
          control={control}
          render={({ field }) => (
            <ToggleRow
              label="I’m the owner on file"
              description={
                user
                  ? `${user.firstName} ${user.lastName} · ${user.email}`
                  : undefined
              }
              checked={field.value}
              onChange={(value) => {
                field.onChange(value);
                if (!value && user) {
                  setValue("ownerFirstName", user.firstName);
                  setValue("ownerLastName", user.lastName);
                  setValue("ownerEmail", user.email);
                  setValue("ownerPhone", user.phone.replace(/^\+234/, ""));
                }
              }}
            />
          )}
        />

        {!useProfileOwner ? (
          <div className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                label="Owner first name"
                error={errors.ownerFirstName?.message}
                {...register("ownerFirstName")}
              />
              <TextField
                label="Owner last name"
                error={errors.ownerLastName?.message}
                {...register("ownerLastName")}
              />
            </div>
            <TextField
              label="Owner email"
              type="email"
              error={errors.ownerEmail?.message}
              {...register("ownerEmail")}
            />
            <Controller
              name="ownerPhone"
              control={control}
              render={({ field }) => (
                <PhoneField
                  label="Owner phone"
                  error={errors.ownerPhone?.message}
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  name={field.name}
                />
              )}
            />
            <div>
              <label htmlFor="ownerRole" className={fieldLabelClass}>
                Role
              </label>
              <select id="ownerRole" className={inputClass} {...register("ownerRole")}>
                <option value="Owner">Owner</option>
                <option value="Manager">Manager</option>
                <option value="Partner">Partner</option>
              </select>
            </div>
          </div>
        ) : null}

        <Controller
          name="isRegistered"
          control={control}
          render={({ field }) => (
            <ToggleRow
              label="Business is registered with CAC"
              description="If yes, we’ll need your RC or BN number."
              checked={field.value}
              onChange={field.onChange}
            />
          )}
        />

        {isRegistered ? (
          <TextField
            label="CAC number"
            placeholder="RC123456 or BN123456"
            error={errors.cacNumber?.message}
            {...register("cacNumber")}
          />
        ) : null}

        <SubmitButton loading={loading} disabled={handleUnavailable}>
          Open my dashboard
        </SubmitButton>
      </form>
    </AuthShell>
  );
}

export default function BusinessPageClient() {
  return (
    <AuthGate allow={["pendingBusiness"]} require={{ hasUser: true }}>
      <BusinessForm />
    </AuthGate>
  );
}
