import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Receep Design System Utilities
export const colors = {
  primary: "#0d9488", // teal-600
  secondary: "#ea580c", // orange-600
  background: "#ffffff",
  card: "#ffffff",
  text: "#0f172a",
  textMuted: "#64748b",
  border: "#e2e8f0",
  success: "#10b981", // emerald-500
  error: "#ef4444", // red-500
  warning: "#f59e0b", // amber-500
  white: "#ffffff",
  black: "#000000",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const borderRadius = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
} as const;

export const fontSize = {
  xs: 12,
  sm: 14,
  base: 16, // minimum as per design system
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 30,
} as const;

export const shadows = {
  sm: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
} as const;
