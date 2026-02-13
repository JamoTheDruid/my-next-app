// app/page.tsx
import type { Metadata } from "next";
import styles from "./page.module.css"
import Image from "next/image"
import Link from "next/link"

export const metadata: Metadata = {
    title: "Druidic",
    description: "Welcome page for Druidic Native Landscaping - A conservation and sustainability focused landscaping company",
};

export default function HomePage() {
    return (
        <div className={styles.parent}>
            <Image 
                src="/Home_Candidate.jpg" 
                alt="Monarch Butterfly Feeding from a Swamp Milkweed" 
                className={styles.homeImage + " " + styles.light} 
                fill
                sizes="100vw"
                priority
            />
            <Image 
                src="/Home_Dark_C1.jpg" 
                alt="Moon Garden" 
                className={styles.homeImage + " " + styles.dark} 
                fill
                sizes="100vw"
                priority
            />
            <div className={styles.intro}>This website is in development...</div>
        </div>
    );
}