// app/dashboard/page.tsx
import { getCurrentUser } from "@/lib/user";
import styles from "./page.module.css";
import Image from "next/image";

export default async function TeamsPage() {
  const user = await getCurrentUser();

  return (
      <div className="imageWrapper">
        <Image 
        className="backgroundImage" 
        alt="Botanical Artpiece made with AI" 
        src="/Beaver.png"
        fill
        priority
        ></Image>
      </div>
  );
}
