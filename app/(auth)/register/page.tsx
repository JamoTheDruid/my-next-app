// app/(auth)/register/page.tsx
"use client";

import Link from "next/link";
import { useActionState } from "react";
import { registerAction } from "./actions";

export default function RegisterPage() {
  const [state, formAction] = useActionState(registerAction, {});

  return (
    <div style={{ padding: "1rem", maxWidth: 400 }}>
      <h1>Create Account</h1>

      {state?.formError && (
        <p style={{ color: "red" }}>{state.formError}</p>
      )}

      <form
        action={formAction}
        style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "1rem" }}
      >
        <label>
          Email
          <input name="email" type="email" required />
          {state?.fieldErrors?.email && (
            <span style={{ color: "red", fontSize: "0.9rem" }}>
              {state.fieldErrors.email}
            </span>
          )}
        </label>

        <label>
          Password
          <input name="password" type="password" required />
        </label>

        <button type="submit">Create account</button>
      </form>

      <p style={{ marginTop: "1rem" }}>
        Already have an account?{" "}
        <Link href="/login">Log in</Link>
      </p>
    </div>
  );
}
