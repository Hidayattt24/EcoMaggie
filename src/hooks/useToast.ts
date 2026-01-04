"use client";

import { useState, useCallback } from "react";
import type { ToastType } from "@/components/ui/Toast";

interface ToastState {
  isVisible: boolean;
  type: ToastType;
  title: string;
  message?: string;
}

export function useToast() {
  const [toast, setToast] = useState<ToastState>({
    isVisible: false,
    type: "info",
    title: "",
    message: "",
  });

  const showToast = useCallback(
    (type: ToastType, title: string, message?: string) => {
      setToast({
        isVisible: true,
        type,
        title,
        message,
      });
    },
    []
  );

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, isVisible: false }));
  }, []);

  // Convenience methods
  const success = useCallback(
    (title: string, message?: string) => showToast("success", title, message),
    [showToast]
  );

  const error = useCallback(
    (title: string, message?: string) => showToast("error", title, message),
    [showToast]
  );

  const warning = useCallback(
    (title: string, message?: string) => showToast("warning", title, message),
    [showToast]
  );

  const info = useCallback(
    (title: string, message?: string) => showToast("info", title, message),
    [showToast]
  );

  return {
    toast,
    showToast,
    hideToast,
    success,
    error,
    warning,
    info,
  };
}
