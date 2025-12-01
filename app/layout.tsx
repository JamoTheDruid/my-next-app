// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { raleway } from "./fonts";
import React from "react";
import { getCurrentUser } from "@/lib/user";
import Link from "next/link";

// Role-specific nav components

function CustomerNav() {
  return (
    <nav className="nav nav--customer">
      <div className="nav-inner">
        <span className="nav-logo">Druidic</span>
        <ul className="nav-links">
          <li><a href=".">My Services</a></li>
          <li><a href=".">Invoices</a></li>
          <li><a href=".">Support</a></li>
        </ul>
        <div className="nav-meta">
          <a href="/account" className="nav-cta">Account</a>
        </div>
      </div>
    </nav>
  );
}

function EmployeeNav() {
  return (
    <nav className="nav nav--employee">
      <div className="nav-inner">
        <span className="nav-logo">Druidic · Staff</span>
        <ul className="nav-links">
          <li><a href=".">Jobs Today</a></li>
          <li><a href=".">Schedule</a></li>
          <li><a href=".">Customers</a></li>
        </ul>
        <div className="nav-meta">
          <a href="/profile" className="nav-cta">Profile</a>
        </div>
      </div>
    </nav>
  );
}

function ArchdruidNav() {
  return (
    <nav className="nav nav--manager">
      <div className="nav-inner">
        <span className="nav-logo"><a href=".">Druidic · Admin</a></span>
        <ul className="nav-links">
          <li><a href="/admin/overview">Overview</a></li>
          <li><a href="/admin/teams">Teams</a></li>
          <li><a href="/admin/reports">Reports</a></li>
          <li><a href="/admin/settings">Settings</a></li>
        </ul>
        <div className="nav-meta">
          <a href="/profile" className="nav-cta">Profile</a>
        </div>
      </div>
    </nav>
  );
}

function GuestNav() {
  return (
    <nav className="nav nav--guest">
      <div className="nav-inner">
        <Link href="/">Druidic</Link>
        <ul className="nav-links">
          <li><Link href="/">Services</Link></li>
          <li><Link href="/">About</Link></li>
        </ul>
        <div className="nav-meta">
          <a href="/login" className="nav-cta">Log in</a>
        </div>
      </div>
    </nav>
  );
}

// Metadata
export const metadata: Metadata = {
  title:  {
    default: "Druidic Native Landscaping",
    template: "%s · Druidic Native Landscaping",
  },
  description: "Professional native landscaping services to connect you with nature.",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Druidic Native Landscaping",
    description: "Professional native landscaping services to connect you with nature.",
    url: "https://www.druidic-llc.com",
    siteName: "Druidic Native Landscaping",
    /*images: [
      {
        url: "insert imape path here",
        width: 1200,
        height: 630,
        alt: "Druidic Native Landscaping",
      },
    ],*/
    //Later, if you want to go advanced, we can add 
    //a dynamic openGraph.images with a generated OG image
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Druidic Native Landscaping",
    description: "Professional native landscaping services to connect you with nature.",
    //images: ["insert image path here"],
  },
  // Optional but nice:
  metadataBase: new URL("https://www.druidic-llc.com"),
};

// Root layout: async so we can await role resolution
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  let Nav: React.ReactNode;
  switch (user?.role) {
    case "CUSTOMER":
      Nav = <CustomerNav />;
      break;
    case "EMPLOYEE":
      Nav = <EmployeeNav />;
      break;
    case "ADMIN":
      Nav = <ArchdruidNav />;
      break;
    default:
      Nav = <GuestNav />;
  }

  return (
    <html lang="en" className={raleway.variable}>
      <body>
        {Nav}
        <main>{children}</main>
      </body>
    </html>
  );
}
