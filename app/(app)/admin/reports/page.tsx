// app/(admin)/scratch-html/page.tsx
import { getCurrentUser } from "@/lib/user";
import styles from "@/app/page.module.css"

export default async function ReportsPage() {
  const user = await getCurrentUser();

  return (
    <div style={{ padding: "1rem" }}>
        <div>Reports</div>
    </div>
  );
}
