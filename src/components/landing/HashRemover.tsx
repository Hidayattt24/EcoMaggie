"use client";

import { useEffect } from "react";

export default function HashRemover() {
  useEffect(() => {
    // Remove hash from URL on initial load
    if (window.location.hash) {
      // Use replaceState to remove hash without triggering navigation
      window.history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search
      );
    }
  }, []);

  return null;
}
