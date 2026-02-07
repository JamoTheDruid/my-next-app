// app/(marketing)/lawn-care/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Lawn Care",
    description: "Professional lawn care services to keep your yard healthy and beautiful.",
};

export default function NativesPage() {
    return (
        <div style={{ padding: "2rem" }}>
            <h1>Come and meet your Neighbors</h1>
            <h2>The Horseshoe Crab</h2>
            <h2>North American Beaver</h2>
            <p>
                We specialize in creating beautiful, sustainable landscapes using native plants that thrive in your local environment. Our expert team is dedicated to helping you connect with nature through thoughtful design and eco-friendly practices.
            </p>
        </div>
    );
}