// app/admin/overview/page.tsx
import { getCurrentUser } from "@/lib/user";
import styles from "./page.module.css";
import Image from "next/image";

export default async function OverviewPage() {
  const user = await getCurrentUser();

  return (
    <div>
      <div className="imageWrapper">
        <Image 
        className="backgroundImage"
        alt="Botanical Artpiece made with AI" 
        src="/Monarch.png"
        fill
        priority
        ></Image>
      </div>
      <div>
        <div>Crews Status</div>
        <div>Todays Schedules</div>
        <div>Calendar</div>
        <div>Financial Statement's</div>
      </div>
    </div>
  );
}
