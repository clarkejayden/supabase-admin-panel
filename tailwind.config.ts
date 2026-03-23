import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-space-grotesk)", "ui-sans-serif", "system-ui"]
      },
      colors: {
        border: "#1e293b",
        input: "#1e293b",
        ring: "#3b82f6",
        background: "#020617",
        foreground: "#ffffff",
        card: "#0f172a",
        primary: {
          DEFAULT: "#0a2540",
          foreground: "#ffffff"
        },
        secondary: {
          DEFAULT: "#020c1b",
          foreground: "#ffffff"
        },
        muted: {
          DEFAULT: "#0f172a",
          foreground: "#94a3b8"
        },
        accent: {
          DEFAULT: "#3b82f6",
          foreground: "#ffffff"
        },
        destructive: {
          DEFAULT: "#ef4444",
          foreground: "#ffffff"
        }
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.375rem"
      },
      boxShadow: {
        card: "0 20px 40px -30px rgba(3, 7, 18, 0.9)"
      }
    }
  },
  plugins: []
};

export default config;
