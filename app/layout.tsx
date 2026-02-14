// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import styles from "./page.module.css";
import { raleway, nunito } from "./fonts";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import type { RoleKey } from "@prisma/client";
import { MobileGridMenu } from "@/components/MobileGridMenu";

// IMPORTANT: Under Option 4, this should return something like:
// { userId, email, roleKeys: string[], sessionId } | null
import { getCurrentUser } from "@/lib/user";

// Metadata
export const metadata: Metadata = {
  title: {
    default: "Druidic Native Landscaping",
    template: "%s · Druidic Native Landscaping",
  },
  description:
    "Professional native landscaping services to connect you with nature.",
  icons: {
    icon: "/favicon-for-app/favicon.ico",
    shortcut: "/favicon-for-app/favicon.png",
    apple: "/favicon-for-app/apple-touch-icon.png",
  },
  manifest: "/favicon-for-app/manifest.json",
  openGraph: {
    title: "Druidic Native Landscaping",
    description:
      "Professional native landscaping services to connect you with nature.",
    url: "https://www.druidic-llc.com",
    siteName: "Druidic Native Landscaping",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Druidic Native Landscaping",
    description:
      "Professional native landscaping services to connect you with nature.",
  },
  metadataBase: new URL("https://www.druidic-llc.com"),
};

function NavLogo() {
  return (

    <div>
      <Link href="/" className={styles.dark}>
        <Image
          src="/Dark_Mode_Logo.png"
          alt="Druidic Native Landscaping"
          width={130}
          height={52}
          priority
        />
      </Link>
      <Link href="/" className={styles.light}>
        <Image
          src="/Light_Mode_Logo.png"
          alt="Druidic Native Landscaping"
          width={130}
          height={52}
          priority
        />
      </Link>
    </div>
    
  );
}

const navLinksByRole: Record<RoleKey, { href: string; label: string }[]> = {
  CUSTOMER: [
    { href: "/customer/account", label: "Account" },
    { href: "/customer/services", label: "My Services" },
    { href: "/customer/invoices", label: "Invoices" },
    { href: "/customer/support", label: "Support" },
  ],
  EMPLOYEE: [
    { href: "/employee/jobs", label: "Jobs Today" },
    { href: "/employee/schedule", label: "Schedule" },
    { href: "/employee/customers", label: "Customers" },
  ],
  MANAGER: [
    { href: "/admin/overview", label: "Overview" },
    { href: "/admin/teams", label: "Teams" },
    { href: "/admin/reports", label: "Reports" },
    { href: "/admin/settings", label: "Settings" },
    { href: "/admin/scratch-html", label: "Scratch" },
  ],
  ADMIN: [
    { href: "/admin/overview", label: "Overview" },
    { href: "/admin/leads", label: "Leads" },
    { href: "/admin/hr", label: "HR" },
    { href: "/admin/accounting", label: "Accounting" },
    { href: "/admin/crm", label: "CRM" },
  ],
  GUEST: [
    { href: "/home", label: "Home" },
    { href: "/lawn-care", label: "Lawn Care" },
    { href: "/native-plants", label: "Native Plants" }
  ],
} as const;

function pickEffectiveRole(roleKeys?: string[] | null): RoleKey {
  // Highest-privilege wins. Adjust order if you want different behavior.
  const precedence: RoleKey[] = ["ADMIN", "MANAGER", "EMPLOYEE", "CUSTOMER", "GUEST"];
  const set = new Set(roleKeys ?? []);

  for (const role of precedence) {
    if (set.has(role)) return role;
  }
  return "GUEST";
}

function NavTemplate({ role }: { role: RoleKey }) {
  const links = navLinksByRole[role];

  const accountHref = role === "GUEST" ? "/login" : "/profile";
  const accountLabel = role === "GUEST" ? "Log in" : "Account";

  return (
    <>
      {/* Desktop nav (hide on mobile with CSS) */}
      <nav className={`nav nav--desktop nav--${role.toLowerCase()}`}>
        <div className="nav-inner">
          <NavLogo />
          <ul className="nav-links">
            {links.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
          <div className="nav-meta">
            <Link href={accountHref} className="nav-cta">
              {accountLabel}
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile menu FAB + grid */}
      <MobileGridMenu
        role={role}
        links={links}
        accountHref={accountHref}
        accountLabel={accountLabel}
      />
    </>
  );
}

// Root layout: async so we can await server-side role resolution
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ctx = await getCurrentUser();
  const role = pickEffectiveRole(ctx?.roleKeys);

  return (
    <html lang="en" className={`${raleway.variable} ${nunito.variable}`}>
      <body>
        <NavTemplate role={role} />
        <main>{children}</main>
      </body>
    </html>
  );
}
