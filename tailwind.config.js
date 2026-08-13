// tailwind.config.js
import { fontFamily } from "tailwindcss/defaultTheme";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}", // add ts/tsx if you use TypeScript
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
        mono: ["var(--font-mono)", ...fontFamily.mono],
      },
      colors: {
        background: "oklch(var(--background))",
        foreground: "oklch(var(--foreground))",
        card: "oklch(var(--card))",
        "card-foreground": "oklch(var(--card-foreground))",
        popover: "oklch(var(--popover))",
        "popover-foreground": "oklch(var(--popover-foreground))",
        primary: "oklch(var(--primary))",
        "primary-foreground": "oklch(var(--primary-foreground))",
        "primary-dark-hover": "oklch(var(--primary-dark-hover))",
        secondary: "oklch(var(--secondary))",
        "secondary-foreground": "oklch(var(--secondary-foreground))",
        muted: "oklch(var(--muted))",
        "muted-foreground": "oklch(var(--muted-foreground))",
        accent: "oklch(var(--accent))",
        "accent-foreground": "oklch(var(--accent-foreground))",
        destructive: "oklch(var(--destructive))",
        border: "oklch(var(--border))",
        input: "oklch(var(--input))",
        ring: "oklch(var(--ring))",
        // Additional optional colors
        "chart-1": "oklch(var(--chart-1))",
        "chart-2": "oklch(var(--chart-2))",
        "chart-3": "oklch(var(--chart-3))",
        "chart-4": "oklch(var(--chart-4))",
        "chart-5": "oklch(var(--chart-5))",
        sidebar: "oklch(var(--sidebar))",
        "sidebar-foreground": "oklch(var(--sidebar-foreground))",
        "sidebar-primary": "oklch(var(--sidebar-primary))",
        "sidebar-primary-foreground": "oklch(var(--sidebar-primary-foreground))",
        "sidebar-accent": "oklch(var(--sidebar-accent))",
        "sidebar-accent-foreground": "oklch(var(--sidebar-accent-foreground))",
        "sidebar-border": "oklch(var(--sidebar-border))",
        "sidebar-ring": "oklch(var(--sidebar-ring))",
      },
      borderRadius: {
        sm: "calc(var(--radius) - 4px)",
        md: "calc(var(--radius) - 2px)",
        lg: "var(--radius)",
        xl: "calc(var(--radius) + 4px)",
      },
    },
  },
  darkMode: "class", // already used via .dark class
  // plugins: [require("tailwindcss-animate")],
};