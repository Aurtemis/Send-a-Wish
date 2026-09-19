"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { clampAge, generateWishURL } from "@/utils/generateWishURL";

interface WishFormProps {
  onClose: () => void;
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  borderRadius: "10px",
  background: "rgba(255,248,232,0.8)",
  padding: "10px 14px",
  fontSize: "14px",
  color: "var(--text-dark)",
  border: "1.5px solid rgba(212,115,106,0.2)",
  outline: "none",
  fontFamily: "var(--font-sans)",
};

export default function WishForm({ onClose }: WishFormProps) {
  const [name, setName] = useState("");
  const [age, setAge] = useState(25);
  const [message, setMessage] = useState("");
  const [music, setMusic] = useState("");
  const [senderName, setSenderName] = useState("");
  const [link, setLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = generateWishURL(origin, {
      name: name.trim() || "Friend",
      age: clampAge(age),
      message: message.trim() || "Happy Birthday!",
      senderName: senderName.trim() || null,
    });
    setLink(url);
  };

  const copy = async () => {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center p-4"
      style={{ background: "rgba(92,51,32,0.25)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "440px",
          borderRadius: "20px",
          background: "linear-gradient(160deg, #FFF8E8 0%, #F5C5B5 100%)",
          padding: "28px",
          boxShadow: "0 24px 60px rgba(92,51,32,0.18)",
          border: "1px solid rgba(255,255,255,0.7)",
          maxHeight: "90vh",
          overflowY: "auto",
          paddingBottom: "env(safe-area-inset-bottom, 16px)",
        }}
      >
        {!link ? (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <h2 style={{ fontFamily: "var(--font-brusher)", fontSize: "28px", color: "var(--text-dark)", margin: 0 }}>
              Create a Birthday Wish
            </h2>

            <Field label="Recipient name">
              <input value={name} onChange={(e) => setName(e.target.value)}
                placeholder="To..." style={inputStyle} />
            </Field>

            <Field label="Birthday age">
              <input type="number" min={1} max={100} value={age}
                onChange={(e) => setAge(Number(e.target.value))} style={inputStyle} />
            </Field>

            <Field label="Birthday message">
              <textarea value={message} onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your message…" rows={4}
                style={{ ...inputStyle, resize: "vertical" }} />
            </Field>

            <Field label="Your name">
              <input value={senderName} onChange={(e) => setSenderName(e.target.value)}
                placeholder="From…" style={inputStyle} />
            </Field>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", paddingTop: "4px" }}>
              <button type="button" onClick={onClose}
                style={{ padding: "10px 20px", borderRadius: "9999px", background: "transparent",
                  border: "1.5px solid rgba(212,115,106,0.3)", color: "var(--text-mid)",
                  fontSize: "14px", cursor: "pointer", fontFamily: "var(--font-sans)" }}>
                Cancel
              </button>
              <button type="submit"
                style={{ padding: "10px 24px", borderRadius: "9999px",
                  background: "linear-gradient(135deg, var(--coral), var(--peach))",
                  color: "#fff", border: "none", fontSize: "14px", fontWeight: 600,
                  cursor: "pointer", fontFamily: "var(--font-sans)",
                  boxShadow: "0 4px 16px rgba(212,115,106,0.35)" }}>
                Generate Wish
              </button>
            </div>
          </form>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <h2 style={{ fontFamily: "var(--font-brusher)", fontSize: "28px", color: "var(--text-dark)", margin: 0 }}>
              Your wish is ready 🎉
            </h2>
            <p style={{ fontSize: "13px", color: "var(--text-mid)", margin: 0 }}>
              Share this link — opening it starts the birthday experience.
            </p>
            <div style={{ display: "flex", gap: "8px", alignItems: "center",
              background: "rgba(255,248,232,0.8)", borderRadius: "12px", padding: "10px 14px",
              border: "1.5px solid rgba(212,115,106,0.2)" }}>
              <input readOnly value={link}
                style={{ flex: 1, background: "transparent", border: "none", outline: "none",
                  fontSize: "13px", color: "var(--text-dark)", minWidth: 0, fontFamily: "var(--font-sans)" }} />
              <button onClick={copy}
                style={{ flexShrink: 0, padding: "6px 16px", borderRadius: "9999px",
                  background: "linear-gradient(135deg, var(--coral), var(--peach))",
                  color: "#fff", border: "none", fontSize: "12px", fontWeight: 600,
                  cursor: "pointer", fontFamily: "var(--font-sans)" }}>
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button onClick={() => setLink(null)}
                style={{ padding: "10px 20px", borderRadius: "9999px", background: "transparent",
                  border: "1.5px solid rgba(212,115,106,0.3)", color: "var(--text-mid)",
                  fontSize: "14px", cursor: "pointer", fontFamily: "var(--font-sans)" }}>
                Create another
              </button>
              <button onClick={onClose}
                style={{ padding: "10px 24px", borderRadius: "9999px",
                  background: "linear-gradient(135deg, var(--coral), var(--peach))",
                  color: "#fff", border: "none", fontSize: "14px", fontWeight: 600,
                  cursor: "pointer", fontFamily: "var(--font-sans)" }}>
                Done
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

function Field({ label, hint, children }: {
  label: string; hint?: string; children: React.ReactNode;
}) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <span style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase",
        letterSpacing: "0.12em", color: "var(--text-mid)", fontFamily: "var(--font-sans)" }}>
        {label}
      </span>
      {children}
      {hint && <span style={{ fontSize: "11px", color: "var(--text-light)", fontFamily: "var(--font-sans)" }}>{hint}</span>}
    </label>
  );
}