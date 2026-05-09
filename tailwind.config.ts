import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  // Tailwind JIT only generates classes that appear as static
  // strings in source. Platform gradient strings live in
  // `src/lib/seo-data.ts` and are interpolated via
  // `${platform.gradient}` into `bg-gradient-to-r ...`. JIT cannot
  // see these so the resulting `from-blue-600`, `to-blue-700`,
  // `from-gray-800`, `to-black`, etc. were getting purged — making
  // the H1 platform name invisible (text-transparent + missing
  // gradient = transparent text). Safelist every gradient stop
  // referenced from dynamic data so the classes survive purging.
  safelist: [
    // Gradient direction utilities (already static elsewhere but
    // listed defensively).
    "bg-gradient-to-r",
    "bg-gradient-to-br",
    // Per-platform gradient stops (must mirror seo-data.ts).
    "from-red-600",
    "to-red-700",
    "from-cyan-500",
    "to-pink-500",
    "from-purple-600",
    "via-pink-600",
    "to-orange-500",
    "from-gray-800",
    "to-black",
    "from-blue-600",
    "to-blue-700",
    "from-orange-500",
    "to-orange-600",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
};

export default config;
