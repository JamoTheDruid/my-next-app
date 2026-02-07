// app/users/[id]/UserContactEditor.tsx
"use client";

import { InlineEditFloatingField } from "@/components/InlineEditFloatingField";
import { updateUserField } from "./actions";

type UserContact = {
  id: string;
  name: string | null;
  email: string | null;
  telephone?: string | null;
  addressRaw?: string | null;
};

export function UserContactEditor({ user }: { user: UserContact }) {
  return (
    <div style={{ display: "grid", gap: 16, maxWidth: 560 }}>
      <InlineEditFloatingField
        label="Name"
        field="name"
        value={user.name}
        type="name"
        placeholder="Name"
        // ✅ define handler inside a Client Component (allowed)
        onSave={(next) => updateUserField({ userId: user.id, field: "name", value: next })}
      />

      <InlineEditFloatingField
        label="Email"
        field="email"
        value={user.email}
        type="email"
        placeholder="Email"
        onSave={(next) => updateUserField({ userId: user.id, field: "email", value: next })}
      />

      <InlineEditFloatingField
        label="Phone"
        field="telephone"
        value={user.telephone || ""}
        type="tel"
        placeholder="Phone"
        onSave={(next) => updateUserField({ userId: user.id, field: "telephone", value: next })}
      />

      <InlineEditFloatingField
        label="Address"
        field="address"
        value={user.addressRaw || ""}
        type="addressRaw"
        placeholder="Address"
        onSave={(next) => updateUserField({ userId: user.id, field: "addressRaw", value: next })}
      />
    </div>
  );
}
