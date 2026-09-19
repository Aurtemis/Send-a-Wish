"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import GreetingCard from "./GreetingCard";

interface EnvelopeProps {
  name: string;
  age: number;
  message: string;
  senderName?: string | null;
  isOpen: boolean;
  onOpen: () => void;
}

export default function Envelope({
  name,
  age,
  message,
  senderName,
  isOpen,
  onOpen,
}: EnvelopeProps) {
  return (
    <div className="relative flex flex-col items-center">
      <AnimatePresence mode="wait">
        {!isOpen ? (
          <motion.button
            key="envelope"
            type="button"
            onClick={onOpen}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: [0, -8, 0],
              transition: {
                opacity: { duration: 0.4 },
                scale: { duration: 0.4 },
                y: {
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5,
                },
              },
            }}
            exit={{
              opacity: 0,
              scale: 0.5,
              y: -40,
              rotate: 15,
              transition: { duration: 0.4, ease: "easeIn" },
            }}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            className="relative flex flex-col items-center"
            aria-label="Open your birthday message"
          >
            <div className="relative drop-shadow-2xl" style={{
              width: "min(280px, 76vw)",
              height: "min(220px, 60vw)",
            }}>
              <Image
                src="/envelope.png"
                alt="Birthday envelope"
                fill
                className="object-contain"
                priority
              />
            </div>
            <p className="mt-4 text-sm tracking-wide text-[#f6ecd9]/80">
              ✨ A birthday message for you — tap to open
            </p>
          </motion.button>
        ) : (
          <motion.div
            key="card"
            initial={{ opacity: 0, scale: 0.7, y: 60, rotateX: -25 }}
            animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformOrigin: "bottom center", perspective: 1200 }}
          >
            <GreetingCard
              name={name}
              age={age}
              message={message}
              senderName={senderName}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}