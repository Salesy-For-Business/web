"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AuthGate,
  AuthShell,
  FileDropzone,
  PhoneField,
  SignupStepper,
  SubmitButton,
  TextField,
} from "@/components/auth";
import { businessSchema, type BusinessValues } from "@/lib/auth-schemas";
import { delayMs, useAuthStore, slugifyHandle, type AuthBusiness } from "@/lib/auth-store";
import { NIGERIAN_STATES } from "@/lib/nigeria";
import {
  fieldErrorClass,
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
  const completeBusiness = useAuthStore((s) => s.completeBusiness);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<BusinessValues>({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      businessName: "",
      usePersonalEmail: true,
      businessEmail: "",
      usePersonalPhone: true,
      businessPhone: "",
      logoDataUrl: undefined,
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

  async function onSubmit(values: BusinessValues) {
    if (!user) return;
    setFormError(null);
    await delayMs();

    const business: AuthBusiness = {
      businessName: values.businessName,
      businessEmail: values.usePersonalEmail
        ? user.email
        : (values.businessEmail ?? "").trim().toLowerCase(),
      businessPhone: values.usePersonalPhone
        ? user.phone
        : (values.businessPhone as string),
      logoDataUrl: values.logoDataUrl,
      hasPhysicalAddress: values.hasPhysicalAddress,
      street: values.hasPhysicalAddress ? values.street : undefined,
      city: values.hasPhysicalAddress ? values.city : undefined,
      state: values.hasPhysicalAddress ? values.state : undefined,
      description: values.description,
      ownerFirstName: values.useProfileOwner
        ? user.firstName
        : (values.ownerFirstName ?? ""),
      ownerLastName: values.useProfileOwner
        ? user.lastName
        : (values.ownerLastName ?? ""),
      ownerEmail: values.useProfileOwner
        ? user.email
        : (values.ownerEmail ?? "").trim().toLowerCase(),
      ownerPhone: values.useProfileOwner
        ? user.phone
        : (values.ownerPhone as string),
      ownerRole: values.ownerRole,
      isRegistered: values.isRegistered,
      cacNumber: values.isRegistered ? values.cacNumber?.trim() : undefined,
      plan: "free",
      storeHandle: slugifyHandle(values.businessName),
    };

    completeBusiness(business);
    router.push("/dashboard");
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

        {formError ? (
          <p className={fieldErrorClass} role="alert">
            {formError}
          </p>
        ) : null}

        <SubmitButton loading={isSubmitting}>Open my dashboard</SubmitButton>
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
