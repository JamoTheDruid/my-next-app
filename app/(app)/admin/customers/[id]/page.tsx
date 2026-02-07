// app/admin/customers/[id]/page.tsx
import db from "@/lib/db";
import { notFound } from "next/navigation";
import styles from "./page.module.css";
import { UserContactEditor } from "./UserContactEditor";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function CustomerPage({ params }: Props) {
    const { id } = await params;
    if (!id) return notFound();

    const customer = await db.customer.findUnique({ 
        where: { id: id },
        include: { projects: true, properties: true, finances: true }
    });
    if (!customer) return notFound();
  
    return (
        <div className={styles.container}>
        <div className={styles.section}>
            <div className={styles.sectionTitle}>Contact</div>
            <UserContactEditor user={customer} />
            <div>Status</div>
            <div>Delete</div>
        </div>

        <div className={styles.section}>
            <div className={styles.sectionTitle}>Projects</div>
            <div>{customer.projects.length}</div>
            <button className={styles.button}>Add Project</button>
        </div>
        <div className={styles.section}>
            <div className={styles.sectionTitle}>Properties</div>
            <div>{customer.properties.length}</div>
            <button className={styles.button}>Add Property</button>
        </div>
        <div className={styles.section}>
            <div className={styles.sectionTitle}>Finances</div>
            <div>{customer.finances.length}</div>
            <button className={styles.button}>Add Finance Record</button>
        </div>
        </div>
    );
}
