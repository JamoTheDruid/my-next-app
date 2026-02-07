// app/(auth)/register/actions.ts
"use server";

import { registerUser } from "@/lib/auth";
import { createSession } from "@/lib/session";
import { redirect } from "next/navigation";

interface RegisterFormState {
    fieldErrors?: { email?: string };
    formError?: string;
}

export async function registerAction(
    prevState: RegisterFormState,
    formData: FormData
): Promise<RegisterFormState> {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const result = await registerUser(email, password);

    if (!result.ok) {
        return {
            fieldErrors: result.fieldErrors,
            formError: result.formError,
        };
    }

    await createSession({
        id: result.user.id,
        role: result.user.roleKeys,
    });

    redirect("/dashboard");
}