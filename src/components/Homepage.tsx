"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import WishForm from "./WishForm";

export default function Homepage() {
  const [open, setOpen] = useState(false);

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 text-center"
      style={{ background: "linear-gradient(135deg, #FFF8E8 0%, #F5C5B5 40%, #E8D9FF 100%)" }}
    >
      {/* Soft blob decorations */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div style={{
          position: "absolute", top: "-10%", left: "-10%",
          width: "45%", height: "45%", borderRadius: "60% 40% 70% 30% / 50% 60% 40% 50%",
          background: "rgba(242,169,138,0.35)", filter: "blur(40px)",
        }} />
        <div style={{
          position: "absolute", bottom: "-10%", right: "-5%",
          width: "50%", height: "50%", borderRadius: "40% 60% 30% 70% / 60% 40% 60% 40%",
          background: "rgba(232,217,255,0.45)", filter: "blur(40px)",
        }} />
        <div style={{
          position: "absolute", bottom: "10%", left: "5%",
          width: "30%", height: "30%", borderRadius: "50% 50% 60% 40% / 40% 60% 40% 60%",
          background: "rgba(221,244,255,0.4)", filter: "blur(30px)",
        }} />
        <div style={{
          position: "absolute", top: "20%", right: "10%",
          width: "25%", height: "25%", borderRadius: "60% 40% 50% 50% / 50% 50% 60% 40%",
          background: "rgba(223,247,230,0.4)", filter: "blur(25px)",
        }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 flex flex-col items-center"
      >

        <h1 style={{
          fontFamily: "var(--font-brusher)",
          fontSize: "clamp(52px, 10vw, 86px)",
          color: "var(--text-dark)",
          lineHeight: 1.1,
          marginBottom: "16px",
        }}>
          ClapWish
        </h1>

        <p style={{
          fontFamily: "var(--font-sans)",
          fontSize: "clamp(14px, 2vw, 16px)",
          color: "var(--text-mid)",
          maxWidth: "380px",
          lineHeight: 1.7,
          marginBottom: "40px",
        }}>
          Light a candle, send a wish!
        </p>

        <motion.button
          type="button"
          onClick={() => setOpen(true)}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          style={{
            fontFamily: "var(--font-sans)",
            fontWeight: 600,
            fontSize: "15px",
            padding: "14px 36px",
            borderRadius: "9999px",
            background: "linear-gradient(135deg, var(--coral), var(--peach))",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            boxShadow: "0 8px 32px rgba(212,115,106,0.35)",
            letterSpacing: "0.02em",
          }}
        >
          🎂 Create a Birthday Wish
        </motion.button>
      </motion.div>

      <AnimatePresence>{open && <WishForm onClose={() => setOpen(false)} />}</AnimatePresence>
    </main>
  );
}