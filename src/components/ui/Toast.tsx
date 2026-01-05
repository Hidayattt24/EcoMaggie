"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react";
import { useEffect } from "react";

export type ToastType = "success" | "error" | "warning" | "info";

interface ToastProps {
  type: ToastType;
  title: string;
  message?: string;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

const toastConfig = {
  success: {
    icon: CheckCircle,
    bgColor: "bg-gradient-to-r from-green-500 to-emerald-600",
    borderColor: "border-green-400",
    iconColor: "text-white",
  },
  error: {
    icon: XCircle,
    bgColor: "bg-gradient-to-r from-red-500 to-rose-600",
    borderColor: "border-red-400",
    iconColor: "text-white",
  },
  warning: {
    icon: AlertCircle,
    bgColor: "bg-gradient-to-r from-amber-500 to-orange-600",
    borderColor: "border-amber-400",
    iconColor: "text-white",
  },
  info: {
    icon: Info,
    bgColor: "bg-gradient-to-r from-blue-500 to-indigo-600",
    borderColor: "border-blue-400",
    iconColor: "text-white",
  },
};

export default function Toast({
  type,
  title,
  message,
  isVisible,
  onClose,
  duration = 5000,
}: ToastProps) {
  const config = toastConfig[type];
  const Icon = config.icon;

  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-4 z-[9999] w-[calc(100%-2rem)] sm:w-auto sm:max-w-md mx-auto sm:mx-0"
        >
          <div
            className={`${config.bgColor} text-white rounded-2xl shadow-2xl border-2 ${config.borderColor} overflow-hidden`}
          >
            <div className="p-3 sm:p-4 flex items-start gap-2.5 sm:gap-3">
              {/* Icon */}
              <div className="flex-shrink-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Icon
                    className={`h-5 w-5 sm:h-6 sm:w-6 ${config.iconColor}`}
                  />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm sm:text-base mb-0.5 sm:mb-1">
                  {title}
                </h3>
                {message && (
                  <p className="text-xs sm:text-sm text-white/90 leading-relaxed line-clamp-2">
                    {message}
                  </p>
                )}
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="flex-shrink-0 p-1 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>

            {/* Progress Bar */}
            {duration > 0 && (
              <motion.div
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: duration / 1000, ease: "linear" }}
                className="h-1 bg-white/30"
              />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
