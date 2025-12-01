// app/(marketing)/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Welcome",
    description: "Professional native landscaping services to connect you with nature.",
};

export default function MarketingPage() {
    return (
        <div style={{ padding: "2rem" }}>
            <h1>Welcome to Druidic Native Landscaping</h1>
            <p>
                We specialize in creating beautiful, sustainable landscapes using native plants that thrive in your local environment. Our expert team is dedicated to helping you connect with nature through thoughtful design and eco-friendly practices.
            </p>
        </div>
    );
}