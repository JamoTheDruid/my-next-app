"use server";
//app/(app)/admin/customers/actions.ts


import { Prisma } from "@prisma/client";
import db from "@/lib/db";
import { z } from "zod";
import { parsePhoneNumberFromString } from "libphonenumber-js";

type CustomerFieldErrors = Partial<{
  name: string;
  email: string;
  tel: string;
  address: string;
  form: string;
}>;

/*
function collapseSpaces(s: string) {
  return s.trim().replace(/\s+/g, " ");
}

function normalizeEmail(s: string) {
  return s.trim().toLowerCase();
}
*/

function normalizePhoneE164(
  raw: string | undefined,
  defaultCountry: "US" | "CA" = "US"
): { value: string | null; error?: string } {
  if (!raw) return { value: null };

  const s = raw.trim();
  if (!s) return { value: null };

  const phone = parsePhoneNumberFromString(s, defaultCountry);
  if (!phone || !phone.isValid()) {
    return { value: null, error: "Telephone number looks invalid" };
  }

  return { value: phone.number }; // E.164
}

const CustomerInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "Name is required" })
    .min(2, { message: "Name is too short" })
    .max(100, { message: "Name is too long" })
    .transform((v) => v.replace(/\s+/g, " ")),

  email: z
    .string()
    .trim()
    .min(1, { message: "Email is required" })
    .email({ message: "Enter a valid email address" })
    .max(254, { message: "Email is too long" })
    .transform((v) => v.toLowerCase()),

  tel: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v && v.length ? v : undefined)),

  address: z
    .string()
    .trim()
    .min(1, { message: "Address is required" })
    .max(200, { message: "Address is too long" })
    .transform((v) => v.replace(/\s+/g, " ")),
});

export type CustomerActionState = 
  | { ok: false; fieldErrors: CustomerFieldErrors }
  | { ok: true; };

export async function createCustomerFromForm(
  prevState: CustomerActionState | undefined,
  formData: FormData) {
  const fieldErrors: CustomerFieldErrors = {};

  // 1) Gather raw inputs
  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    tel: formData.get("tel"),
    address: formData.get("address"),
  };

  console.log("Raw input:", raw);

  // 2) Zod expects strings; coerce here (keep it predictable)
  const input = {
    name: typeof raw.name === "string" ? raw.name : "",
    email: typeof raw.email === "string" ? raw.email : "",
    tel: typeof raw.tel === "string" ? raw.tel : undefined,
    address: typeof raw.address === "string" ? raw.address : "",
  };

  // 3) Validate + basic normalization via Zod (no throws)
  const parsed = CustomerInputSchema.safeParse(input);

  if (!parsed.success) {
    // Convert zod issues into fieldErrors
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string") {
        // only keep first error per field (avoids overwriting)
        if (!fieldErrors[key as keyof CustomerFieldErrors]) {
          fieldErrors[key as keyof CustomerFieldErrors] = issue.message;
        }
      }
    }

    return { ok: false as const, fieldErrors };
  }

  // 4) Telephone: real validation + E.164 normalization
  const phone = normalizePhoneE164(parsed.data.tel, "US");
  if (phone.error) {
    fieldErrors.tel = phone.error;
    return { ok: false as const, fieldErrors };
  }
  console.log("Validation successful");

  // 5) Create-only insert
  try {
    /*const customer = */
    await db.customer.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        telephone: phone.value,                // string | null
        addressRaw: parsed.data.address || null,  // if you made address optional
      },
    });

    return { ok: true as const/*, customer */ };
  } catch (err) {
    // Duplicate email -> field error
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002" &&
      Array.isArray(err.meta?.target) &&
      err.meta?.target.includes("email")
    ) {
      return {
        ok: false as const,
        fieldErrors: { email: "A customer with this email already exists." },
      };
    }

    // Unknown error -> generic friendly message (don't leak internals)
    return {
      ok: false as const,
      fieldErrors: { form: "Something went wrong while saving. Please try again." },
    };
  }
}