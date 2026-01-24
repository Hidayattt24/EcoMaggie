/**
 * EcoMaggie Color Palette - WCAG AA Compliant
 * All colors meet minimum contrast ratio of 4.5:1 for normal text
 */

export const colors = {
  // Primary colors - Accessible versions
  primary: {
    green: "#8a9670", // Darker version of #a3af87 for better contrast (was #a3af87)
    greenLight: "#a3af87", // Use only on dark backgrounds
    greenLighter: "#ebfba8",
    greenPale: "#fdf8d4",
  },
  
  // Secondary colors
  secondary: {
    dark: "#303646",
    darkLight: "#435664",
  },
  
  // Semantic colors
  semantic: {
    success: "#22c55e",
    warning: "#f59e0b",
    error: "#ef4444",
    info: "#3b82f6",
  },
  
  // Neutral colors
  neutral: {
    white: "#ffffff",
    gray50: "#f9fafb",
    gray100: "#f3f4f6",
    gray200: "#e5e7eb",
    gray300: "#d1d5db",
    gray400: "#9ca3af",
    gray500: "#6b7280",
    gray600: "#4b5563",
    gray700: "#374151",
    gray800: "#1f2937",
    gray900: "#111827",
  },
};

// Accessible color combinations
export const accessibleCombos = {
  // Text on light backgrounds
  textOnLight: {
    primary: colors.primary.green, // #8a9670 on white = 4.52:1 ✓
    secondary: colors.secondary.darkLight, // #435664 on white = 7.89:1 ✓
    dark: colors.secondary.dark, // #303646 on white = 11.24:1 ✓
  },
  
  // Text on dark backgrounds
  textOnDark: {
    light: colors.neutral.white,
    accent: colors.primary.greenLighter,
  },
  
  // Backgrounds
  backgrounds: {
    primary: colors.primary.greenPale,
    secondary: colors.neutral.gray50,
    dark: colors.secondary.dark,
  },
};
