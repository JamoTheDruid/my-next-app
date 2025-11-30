// app/posts/[id]/page.tsx
import { db } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";

interface Props {
    params:  
        Promise<{ id: string }>;
}

export default async function CustomerPage({ params }: Props) {

    const { id } = await params;
    console.log("Raw id:", id, "Type:", typeof id);

    if (!id) {
    notFound();
    }
    
    const customer = await db.customer.findUnique({
        where: { id: Number(id) },
    });


    if (!customer) notFound();

    return (
        <div>
            <h1>{customer.name}</h1>
            <h2>{customer.phoneNumber}</h2>
            <h2>{customer.email}</h2>

            <p>
                <Link href="/customers">Back to Customers</Link>
            </p>
        </div>
    );
}