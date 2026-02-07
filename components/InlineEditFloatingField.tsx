// components/InlineEditFloatingField.tsx
"use client";

import { useState, useTransition } from "react";
import styles from "./InlineEditFloatingField.module.css"

type FieldType = "name" | "addressRaw" | "email" | "tel";

type InlineEditFloatingFieldProps = {
    label: string;
    value: string | null;
    field: string; //"name" | "email" | "telephone" | "addressRaw";
    type?: FieldType;
    placeholder?: string;
    onSave: (nextValue: string) => Promise<{ ok: boolean; error?: string }>;
};

export function InlineEditFloatingField(props: InlineEditFloatingFieldProps) {
    const { label, value, field, type = "name", placeholder, onSave } = props;
    const [isEditing, setIsEditing] = useState(false);
    const [draft, setDraft] = useState(value || "");
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    function startEdit() {
    setError(null);
    setDraft(value ?? "");
    setIsEditing(true);
  }

  function cancelEdit() {
    setError(null);
    setDraft(value ?? "");
    setIsEditing(false);
  }

  function commitEdit() {
    const next = draft.trim();

    // If unchanged, just exit edit mode.
    if (next === (value ?? "").trim()) {
      setIsEditing(false);
      return;
    }

    startTransition(async () => {
      const res = await onSave(next);
      if (!res.ok) {
        setError(res.error ?? "Could not save.");
        return;
      }
      setError(null);
      setIsEditing(false);
    });
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      commitEdit();
    }
    if (e.key === "Escape") {
      e.preventDefault();
      cancelEdit();
    }
  }

  return (
    <div style={{ display: "grid", gap: 6 }}>

      {!isEditing ? (
        <div
          className={styles.field}
          onDoubleClick={startEdit}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter") startEdit();
          }}
          title="Double click to edit"
        >
          {value?.trim() ? value : <span style={{ opacity: 0.6 }}>{placeholder ?? "—"}</span>}
        </div>
      ) : (
        <div className={styles.inputContainer}>
        <input
          className={`${styles.fieldInput} ${styles.field}`}
          autoFocus
          type={type === "tel" ? "tel" : type === "email" ? "email" : type === "name" ? "name" : type === "addressRaw" ? "addressRaw" : "text"}
          inputMode={type === "tel" ? "tel" : type === "email" ? "email" : "text"}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={commitEdit}
          disabled={isPending}
        />
        </div>
      )}

      {error ? <div style={{ color: "crimson", fontSize: 12 }}>{error}</div> : null}
      {/* <div style={{ fontSize: 11, opacity: 0.6 }}>
        Tip: Enter saves • Esc cancels • click away saves
      </div> */}
    </div>
  );
}