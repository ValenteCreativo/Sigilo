"use client";

import { useState, useEffect, useCallback } from "react";

interface EncryptedTextProps {
  text: string;
  className?: string;
  delay?: number;
  speed?: number;
  trigger?: boolean;
  loop?: boolean;
  loopDelay?: number; // NEW: delay before restarting loop
}

const CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*";

export function EncryptedText({
  text,
  className = "",
  delay = 0,
  speed = 5,
  trigger = true,
  loop = true,
  loopDelay = 10000, // 
}: EncryptedTextProps) {
  const [displayText, setDisplayText] = useState(text);

  const decrypt = useCallback(() => {
    let iteration = 0;

    const interval = setInterval(() => {
      setDisplayText((prev) =>
        prev
          .split("")
          .map((_, index) => {
            if (index < iteration) return text[index];
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join("")
      );

      iteration += 0.5;

      if (iteration >= text.length) {
        clearInterval(interval);
        setDisplayText(text);

        // NEW — wait before starting loop again
        if (loop) {
          setTimeout(() => scramble(), loopDelay);
        }
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, loop, loopDelay]);

  const scramble = useCallback(() => {
    setDisplayText((prev) =>
      text
        .split("")
        .map((char) => {
          if (char === " ") return " ";
          return CHARS[Math.floor(Math.random() * CHARS.length)];
        })
        .join("")
    );

    setTimeout(decrypt, delay);
  }, [text, delay, decrypt]);

  useEffect(() => {
    if (!trigger) return;
    scramble();
  }, [trigger, scramble]);

  return (
    <span className={`font-mono tracking-wider ${className}`}>
      {displayText}
    </span>
  );
}
