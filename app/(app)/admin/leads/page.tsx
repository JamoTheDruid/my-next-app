import db from "@/lib/db";
import styles from "./page.module.css";
import { AngiLead } from "@prisma/client";
import ClickableRow from "@/components/ClickableRow";

export default async function LeadsPage() {
    
    const leads = await db.angiLead.findMany({
            orderBy: { createdAt: "desc"}
        });

    return (
        <div>
            <div style={{ padding: "1rem" }}>Leads</div>

            <table className={styles.leadsContainer}>
                <thead>
                    <tr className={styles.row}>
                        <th>Name</th>
                        <th>Phone Number</th>
                        <th>Ext.</th>
                        <th>Address</th>
                        <th>City</th>
                        <th>Task</th>
                        <th>Comments</th>
                    </tr>
                </thead>

                <tbody>
                    {leads.map((lead: AngiLead) => (
                        <ClickableRow key={lead.id} id={lead.id} className={styles.tableBodyRow}>
                            <td className={styles.cell}>{lead.name}</td>
                            <td className={styles.cell}>{lead.primaryPhone}</td>
                            <td className={styles.cell}>{lead.phoneExt}</td>
                            <td className={styles.cell}>{lead.address}</td>
                            <td className={styles.cell}>{lead.city}</td>
                            <td className={styles.cell}>{lead.taskName}</td>
                            <td className={styles.cell}>{lead.comments}</td>
                        </ClickableRow>
                    ))}
                </tbody>
            </table>
        </div>
    );
}