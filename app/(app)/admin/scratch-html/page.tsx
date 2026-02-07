// app/(admin)/scratch-html/page.tsx
import { getCurrentUser } from "@/lib/user";
import styles from "@/app/page.module.css"

export default async function ScratchPage() {
  const user = await getCurrentUser();

  return (
    <div style={{ padding: "1rem" }}>
            <video 
            autoPlay 
            muted 
            loop 
            playsInline 
            className={styles.heroVideo}>
                <source src="/serene-waterfall.mp4" />
            </video>
    </div>
  );
}
