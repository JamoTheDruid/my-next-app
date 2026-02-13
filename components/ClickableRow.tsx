"use client";

import { useRouter } from "next/navigation";
import type React from "react";

type ClickableRowProps = React.ComponentPropsWithoutRef<"tr"> & {
  id: string;
};

export default function ClickableRow({
  id,
  children,
  onClick,
  ...trProps
}: ClickableRowProps) {
  const router = useRouter();

  return (
    <tr
      {...trProps}
      onClick={(e) => {
        onClick?.(e); // preserve any custom onClick
        router.push(`/admin/leads/${id}`);
      }}
      style={{ cursor: "pointer", ...(trProps.style ?? {}) }}
    >
      {children}
    </tr>
  );
}
