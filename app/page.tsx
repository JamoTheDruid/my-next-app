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
        <div>
            <div className={styles.intro}>This website is in development...</div>
        </div>
    );
}