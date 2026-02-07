import db from "@/lib/db";
import Image from "next/image";
import styles from "./page.module.css";

export default async function LeadsPage() {



    return (
        <div>
            <div className="imageWrapper" style={{ padding: "1rem" }}>
                <Image 
                className="backgroundImage" 
                alt="Botanical Artpiece made with AI" 
                src="/Beaver.png"
                fill
                priority
                ></Image>
            </div>
            <div className={styles.leadsContainer}>
                
            </div>
        </div>
    )
}