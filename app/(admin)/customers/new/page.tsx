import { redirect } from "next/navigation";
import { db } from "@/lib/db";

async function createCustomer(formData: FormData) {
    "use server";

    const name = formData.get("name");
    const phoneNumber = formData.get("phoneNumber");
    const email = formData.get("email");

    // Basic validation
    if (typeof name !== "string" || name.trim().length === 0) {
        // In a real app, you'd return an error instead of throwing
        throw new Error("Title is required");
    }

    await db.customer.create({
        data: {
            name: name.trim(),
            phoneNumber: typeof phoneNumber === "string" ? phoneNumber.trim() : "",
            email: typeof email === "string" ? email.trim() : "",
        },
    });

    redirect("/customers");
}

export default function NewCustomerPage() {
    return (
        <div style={{ padding: "1rem"}}>
            <h1>Add New Customer</h1>

            <form action={createCustomer}>
                <div style={{ marginBottom: "0.5rem" }}>
                    <label>
                        Name<br />
                        <input
                            type="text"
                            name="name"
                            required
                            style={{ width: "100%", maxWidth: "400px" }}
                            />
                    </label>
                </div>
                <div style={{ marginBottom: "0.5rem" }}>
                    <label>
                        Phone Number<br />
                        <input
                            type="text"
                            name="phoneNumber"
                            style={{ width: "100%",  maxWidth: "400px" }}
                            />
                    </label>
                </div>
                <div style={{ marginBottom: "0.5rem" }}>
                    <label>
                        Email<br />
                        <input
                            type="text"
                            name="email"
                            style={{ width: "100%", maxWidth: "400px" }}
                            />
                    </label>
                </div>


                    <button type="submit">Add Customer</button>
            </form>
        </div>
        
    );
}