// app/(admin)/scratch-html/page.tsx
import { getCurrentUser } from "@/lib/user";
import styles from "@/app/(app)/admin/accounting/page.module.css"
import BalanceSheetCard from "@/components/BalanceSheetCard";
import { id } from "zod/locales";

export default async function ReportsPage() {
  const user = await getCurrentUser();

  const orgId = process.env.ORG_ID ?? "";

  return (
    <div style={{ padding: "1rem" }}>
        <div className={styles.cardGrid}>
          <BalanceSheetCard
            orgId={orgId}
            href={`./${id}`}
            title={"Balance Sheet"}
    />
            <div className={styles.card}>Balance Sheet</div>
            <div className={styles.card}>Income Statement</div>
            <div className={styles.card}>Cash Flow Statement</div>
            <div className={styles.card}>Trial Balance</div>
        </div>
    </div>
  );
}
  