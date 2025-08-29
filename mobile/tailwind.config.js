/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Receep brand colors
        primary: {
          DEFAULT: "#0d9488", // teal-600
          50: "#f0fdfa",
          100: "#ccfbf1",
          500: "#14b8a6",
          600: "#0d9488",
          700: "#0f766e",
          900: "#134e4a",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#ea580c", // orange-600
          50: "#fff7ed",
          100: "#ffedd5",
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410c",
          900: "#9a3412",
          foreground: "#ffffff",
        },
        background: "#ffffff",
        foreground: "#0f172a", // slate-900
        card: {
          DEFAULT: "#ffffff",
          foreground: "#0f172a",
        },
        popover: {
          DEFAULT: "#ffffff",
          foreground: "#0f172a",
        },
        muted: {
          DEFAULT: "#f1f5f9", // slate-100
          foreground: "#64748b", // slate-500
        },
        accent: {
          DEFAULT: "#f1f5f9", // slate-100
          foreground: "#0f172a",
        },
        destructive: {
          DEFAULT: "#ef4444", // red-500
          foreground: "#ffffff",
        },
        border: "#e2e8f0", // slate-200
        input: "#e2e8f0",
        ring: "#0d9488", // primary
      },
      fontFamily: {
        sans: ["SF Pro Display", "Roboto", "sans-serif"],
      },
      fontSize: {
        xs: "12px",
        sm: "14px",
        base: "16px", // minimum as per design system
        lg: "18px",
        xl: "20px",
        "2xl": "24px",
        "3xl": "30px",
      },
      borderRadius: {
        lg: "12px",
        md: "8px",
        sm: "6px",
      },
    },
  },
  plugins: [],
};
