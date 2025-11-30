// app/customers/page.tsx
import Link from "next/link";
import { db } from "@/lib/db";

export default async function Customers() {
    const customers = await db.customer.findMany({
        orderBy: { createdAt: "desc" },
    });
    
    return (
        <div style={{ padding: "1rem" }}>
            <h1>All Customers</h1>
            
            <p>
                <Link href="/customers/new">Add New Customer</Link>
            </p>

            {customers.length === 0 ? (
                <p>No customers found.</p>
            ) : (
            <ul>
                {customers.map((customer) => (
                    <li key={customer.id}>
                        <Link href={`/customers/${customer.id}`}>{customer.name}</Link>
                    </li>
                ))}
            </ul>
            )}
        </div>
    );
}