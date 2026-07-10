"use client";

import { useEffect } from "react";

export default function PwaRegister() {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      process.env.NODE_ENV === "production" // Register only in production to prevent caching issues in development
    ) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => console.log("[PWA] Service worker registered:", reg.scope))
          .catch((err) => console.error("[PWA] Service worker registration failed:", err));
      });
    }
  }, []);

  return null;
}
