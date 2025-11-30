// app/logout/page.tsx

import { cookies } from "next/headers";
import { redirect } from "next/navigation";


export default function LogoutPage() {
  async function logout() {
        "use server";

        const cookieStore = await cookies();
        cookieStore.delete("session");
        redirect("/login");
    }   

    return (
        <form action={logout}>
            <button type="submit">Log Out</button>
        </form>
    );
}