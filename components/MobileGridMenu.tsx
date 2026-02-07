"use client";

import * as React from "react";
import Link from "next/link";
import type { Role, RoleKey } from "@prisma/client";

type LinkItem = { href: string; label: string };

export function MobileGridMenu({
  role,
  links,
  accountHref,
  accountLabel,
}: {
  role: RoleKey;
  links: LinkItem[];
  accountHref: string;
  accountLabel: string;
}) {
  const [open, setOpen] = React.useState(false);
  const panelId = "mobile-grid-menu";

  // Close on Escape
  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  // Lock scroll while open
  React.useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      {/* Backdrop + grid panel */}
      {open ? (
        <div
          className="mgm-backdrop"
          role="presentation"
          onClick={() => setOpen(false)}
        >
          <div
            className={`mgm-panel mgm-panel--${role.toLowerCase()}`}
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            id={panelId}
            onClick={(e) => e.stopPropagation()} // prevent backdrop click
          >
            <div className="mgm-header">
              <div className="mgm-title">Menu</div>
              <button
                type="button"
                className="mgm-close"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>

            <div className="mgm-grid">
              {links.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="mgm-tile"
                  onClick={() => setOpen(false)}
                >
                  <span className="mgm-tileLabel">{item.label}</span>
                </Link>
              ))}

              {/* account/login tile */}
              <Link
                href={accountHref}
                className="mgm-tile mgm-tile--primary"
                onClick={() => setOpen(false)}
              >
                <span className="mgm-tileLabel">{accountLabel}</span>
              </Link>
            </div>
          </div>
        </div>
      ) : null}

      {/* Bottom-right hamburger FAB */}
      <button
        type="button"
        className="mgm-fab"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen(true)}
      >
        <span className="mgm-fabIcon" aria-hidden="true">
          ☰
        </span>
        <span className="mgm-srOnly">Open menu</span>
      </button>
    </>
  );
}
