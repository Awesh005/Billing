import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Stitch-inspired: Obsidian Synthesis design system
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "var(--card-bg)",
          foreground: "var(--foreground)",
        },
        sidebar: "var(--sidebar-bg)",
        border: "var(--border-color)",
        input: "var(--input-border)",
        ring: "hsl(var(--ring))",
        // Custom tokens
        surface: {
          DEFAULT: "var(--surface-bg)",
          low: "var(--surface-hover)",
          mid: "var(--surface-bg)",
          high: "var(--nav-hover-bg)",
          highest: "var(--border-color)",
          bright: "var(--card-border)",
        },
        obsidian: {
          50: "#eaf8ff",
          100: "#b7eaff",
          200: "#4cd6ff",
          300: "#00D1FF",
          400: "#00b8e0",
          500: "#007fa0",
        },
        emerald: {
          glow: "#00FFC2",
          dim: "#00e1ab",
          container: "#36ffc4",
        },
        violet: {
          glow: "#7000FF",
          container: "#e1d2ff",
        },
        danger: "#ff4d6d",
        warning: "#ffd60a",
        success: "#00FFC2",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Space Grotesk", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      backgroundImage: {
        "gradient-primary": "linear-gradient(135deg, #4cd6ff, #00e1ab)",
        "gradient-hero": "linear-gradient(135deg, #101319 0%, #1a1f2e 50%, #101319 100%)",
        "gradient-card": "linear-gradient(135deg, rgba(76, 214, 255, 0.05), rgba(0, 225, 171, 0.05))",
        "gradient-glow": "radial-gradient(ellipse at center, rgba(76, 214, 255, 0.15) 0%, transparent 70%)",
        "gradient-sidebar": "linear-gradient(180deg, #0b0e13 0%, #101319 100%)",
      },
      boxShadow: {
        glow: "0 0 20px rgba(76, 214, 255, 0.15)",
        "glow-emerald": "0 0 20px rgba(0, 255, 194, 0.15)",
        card: "0 4px 24px rgba(0, 0, 0, 0.4)",
        float: "0 8px 32px rgba(0, 0, 0, 0.5)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-in": "slideIn 0.3s ease-out",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "count-up": "countUp 0.5s ease-out",
      },
      keyframes: {
        fadeIn: { from: { opacity: "0", transform: "translateY(8px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        slideIn: { from: { opacity: "0", transform: "translateX(-16px)" }, to: { opacity: "1", transform: "translateX(0)" } },
        pulseGlow: { "0%, 100%": { boxShadow: "0 0 16px rgba(76, 214, 255, 0.1)" }, "50%": { boxShadow: "0 0 32px rgba(76, 214, 255, 0.3)" } },
        countUp: { from: { opacity: "0", transform: "scale(0.9)" }, to: { opacity: "1", transform: "scale(1)" } },
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
} satisfies Config;
