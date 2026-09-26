import { z } from "zod";
import { NIGERIAN_STATES } from "@/lib/nigeria";

/**
 * International phone number, already composed by `PhoneField` as
 * "+<dial code><local digits>" (e.g. "+2348012345678", "+15551234567").
 * A general E.164 sanity check, not full per-country validation — that
 * needs real metadata (e.g. libphonenumber-js), which isn't wired in.
 */
export const phoneSchema = z
  .string()
  .trim()
  .min(1, "Enter a phone number")
  .refine((value) => /^\+[1-9]\d{6,14}$/.test(value), {
    message: "Enter a valid phone number, including your country code",
  });

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Za-z]/, "Password must include a letter")
  .regex(/\d/, "Password must include a number");

export const emailSchema = z
  .string()
  .trim()
  .min(1, "Enter an email")
  .email("Enter a valid email");

export const otpSchema = z.object({
  code: z
    .string()
    .trim()
    .length(6, "Enter the 6-digit code")
    .regex(/^\d{6}$/, "Enter the 6-digit code"),
});

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Enter your password"),
});

export const profileSchema = z
  .object({
    firstName: z.string().trim().min(1, "Enter your first name"),
    lastName: z.string().trim().min(1, "Enter your last name"),
    email: emailSchema,
    phone: phoneSchema,
    provider: z.enum(["email", "google"]),
    password: z.string().optional(),
    confirmPassword: z.string().optional(),
    acceptTerms: z.boolean().refine((v) => v === true, {
      message: "Accept the terms to continue",
    }),
  })
  .superRefine((data, ctx) => {
    if (data.provider === "email") {
      const pwd = passwordSchema.safeParse(data.password ?? "");
      if (!pwd.success) {
        ctx.addIssue({
          code: "custom",
          message: pwd.error.issues[0]?.message ?? "Enter a password",
          path: ["password"],
        });
      }
      if (!(data.confirmPassword ?? "").length) {
        ctx.addIssue({
          code: "custom",
          message: "Confirm your password",
          path: ["confirmPassword"],
        });
      } else if (data.password !== data.confirmPassword) {
        ctx.addIssue({
          code: "custom",
          message: "Passwords do not match",
          path: ["confirmPassword"],
        });
      }
    }
  });

export const profileEmailSchema = profileSchema;
export const profileGoogleSchema = profileSchema;

export type ProfileEmailValues = z.infer<typeof profileSchema>;
export type ProfileGoogleValues = z.infer<typeof profileSchema>;
export type ProfileValues = z.infer<typeof profileSchema>;

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const ownerRoleSchema = z.enum(["Owner", "Manager", "Partner"]);

export const businessSchema = z
  .object({
    businessName: z.string().trim().min(1, "Enter a business name"),
    storeHandle: z
      .string()
      .trim()
      .toLowerCase()
      .min(3, "Handle must be at least 3 characters")
      .max(24, "Keep the handle under 24 characters")
      .regex(/^[a-z0-9]+$/, "Use only lowercase letters and numbers"),
    usePersonalEmail: z.boolean(),
    businessEmail: z.string().trim().optional(),
    usePersonalPhone: z.boolean(),
    businessPhone: z.string().trim().optional(),
    logoDataUrl: z.string().optional(),
    socialImageUrl: z.string().optional(),
    hasPhysicalAddress: z.boolean(),
    street: z.string().trim().optional(),
    city: z.string().trim().optional(),
    state: z.string().optional(),
    description: z
      .string()
      .trim()
      .min(10, "Add a short description (at least 10 characters)")
      .max(500, "Keep the description under 500 characters"),
    useProfileOwner: z.boolean(),
    ownerFirstName: z.string().trim().optional(),
    ownerLastName: z.string().trim().optional(),
    ownerEmail: z.string().trim().optional(),
    ownerPhone: z.string().trim().optional(),
    ownerRole: ownerRoleSchema,
    isRegistered: z.boolean(),
    cacNumber: z.string().trim().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.usePersonalEmail) {
      const parsed = emailSchema.safeParse(data.businessEmail ?? "");
      if (!parsed.success) {
        ctx.addIssue({
          code: "custom",
          message: parsed.error.issues[0]?.message ?? "Enter a valid email",
          path: ["businessEmail"],
        });
      }
    }

    if (!data.usePersonalPhone) {
      const parsed = phoneSchema.safeParse(data.businessPhone ?? "");
      if (!parsed.success) {
        ctx.addIssue({
          code: "custom",
          message: parsed.error.issues[0]?.message ?? "Enter a valid phone",
          path: ["businessPhone"],
        });
      }
    }

    if (data.hasPhysicalAddress) {
      if (!data.street?.trim()) {
        ctx.addIssue({
          code: "custom",
          message: "Enter a street address",
          path: ["street"],
        });
      }
      if (!data.city?.trim()) {
        ctx.addIssue({
          code: "custom",
          message: "Enter a city",
          path: ["city"],
        });
      }
      if (
        !data.state ||
        !NIGERIAN_STATES.includes(data.state as (typeof NIGERIAN_STATES)[number])
      ) {
        ctx.addIssue({
          code: "custom",
          message: "Select a state",
          path: ["state"],
        });
      }
    }

    if (!data.useProfileOwner) {
      if (!data.ownerFirstName?.trim()) {
        ctx.addIssue({
          code: "custom",
          message: "Enter a first name",
          path: ["ownerFirstName"],
        });
      }
      if (!data.ownerLastName?.trim()) {
        ctx.addIssue({
          code: "custom",
          message: "Enter a last name",
          path: ["ownerLastName"],
        });
      }
      const emailParsed = emailSchema.safeParse(data.ownerEmail ?? "");
      if (!emailParsed.success) {
        ctx.addIssue({
          code: "custom",
          message: emailParsed.error.issues[0]?.message ?? "Enter a valid email",
          path: ["ownerEmail"],
        });
      }
      const phoneParsed = phoneSchema.safeParse(data.ownerPhone ?? "");
      if (!phoneParsed.success) {
        ctx.addIssue({
          code: "custom",
          message: phoneParsed.error.issues[0]?.message ?? "Enter a valid phone",
          path: ["ownerPhone"],
        });
      }
    }

    if (data.isRegistered) {
      const cac = data.cacNumber?.trim() ?? "";
      if (!/^(RC|BN)\s?\d{5,8}$/i.test(cac)) {
        ctx.addIssue({
          code: "custom",
          message: "Enter a CAC number like RC123456 or BN123456",
          path: ["cacNumber"],
        });
      }
    }
  });

export type SignInValues = z.infer<typeof signInSchema>;
export type BusinessValues = z.infer<typeof businessSchema>;
export type OtpValues = z.infer<typeof otpSchema>;
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export const DEMO_OTP = "123456";
