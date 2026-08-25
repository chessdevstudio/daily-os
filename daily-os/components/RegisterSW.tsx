"use client";

import { useEffect } from "react";

export default function RegisterSW() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Installation silencieuse : l'app fonctionne même sans SW.
      });
    }
  }, []);
  return null;
}
