// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { raleway } from "./fonts";
import React from "react";
import { getCurrentUser } from "@/lib/user";

// 3. Role-specific nav components

function CustomerNav() {
  return (
    <nav className="nav nav--customer">
      <div className="nav-inner">
        <span className="nav-logo">Druidic</span>
        <ul className="nav-links">
          <li><a href="/dashboard">My Services</a></li>
          <li><a href="/invoices">Invoices</a></li>
          <li><a href="/support">Support</a></li>
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
          <li><a href="/jobs-today">Jobs Today</a></li>
          <li><a href="/schedule">Schedule</a></li>
          <li><a href="/customers">Customers</a></li>
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
          <li><a href="/overview">Overview</a></li>
          <li><a href="/teams">Teams</a></li>
          <li><a href="/reports">Reports</a></li>
          <li><a href="/settings">Settings</a></li>
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
        <span className="nav-logo">Druidic</span>
        <ul className="nav-links">
          <li><a href="/services">Services</a></li>
          <li><a href="/about">About</a></li>
        </ul>
        <div className="nav-meta">
          <a href="/login" className="nav-cta">Log in</a>
        </div>
      </div>
    </nav>
  );
}

// 4. Metadata
export const metadata: Metadata = {
  title: "Greatest App Ever Developed",
  description: "One foot in front of the other",
};

// 5. Root layout: async so we can await role resolution
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  let Nav: React.ReactNode;
  switch (user?.role) {
    case "USER":
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
