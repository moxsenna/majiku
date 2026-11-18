import type { Config } from "tailwindcss";

// Token Bunayo · Arah B "Papan Kelas". Nilai ada di src/app/globals.css (ekspor dari design/_kit/kit.css).
const krayon = (name: string) => ({
  DEFAULT: `hsl(var(--${name}))`,
  soft: `hsl(var(--${name}-soft))`,
  ink: `hsl(var(--${name}-ink))`,
});

export default {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        display: ["var(--font-display)"],
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
      colors: {
        border: {
          DEFAULT: "hsl(var(--border))",
          subtle: "hsl(var(--border-subtle))",
        },
        input: "hsl(var(--input))",
        placeholder: "hsl(var(--placeholder))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        surface: "hsl(var(--surface))",
        kanvas: "hsl(var(--kanvas))",
        disabled: "hsl(var(--disabled))",
        scrim: "hsl(var(--scrim) / <alpha-value>)",
        skeleton: {
          DEFAULT: "hsl(var(--skeleton))",
          light: "hsl(var(--skeleton-light))",
        },
        foreground: {
          DEFAULT: "hsl(var(--foreground))",
          2: "hsl(var(--foreground-2))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          hover: "hsl(var(--primary-hover))",
          soft: "hsl(var(--primary-soft))",
        },
        // Nama shadcn lama tanpa padanan di Arah B → nada netral kit (dibersihkan per layar)
        secondary: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
          soft: "hsl(var(--destructive-soft))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        highlight: {
          DEFAULT: "hsl(var(--highlight))",
          foreground: "hsl(var(--highlight-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          ring: "hsl(var(--success-ring))",
          foreground: "hsl(var(--primary-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--primary-foreground))",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          foreground: "hsl(var(--primary-foreground))",
        },
        "nav-active": {
          DEFAULT: "hsl(var(--nav-active))",
          foreground: "hsl(var(--nav-active-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          border: "hsl(var(--sidebar-border))",
          // alias lama
          primary: "hsl(var(--nav-active))",
          "primary-foreground": "hsl(var(--nav-active-foreground))",
          accent: "hsl(var(--muted))",
          "accent-foreground": "hsl(var(--foreground))",
          ring: "hsl(var(--ring))",
        },
        "brand-blue": "hsl(var(--brand-blue))",
        "brand-yellow": "hsl(var(--brand-yellow))",
        "brand-green": "hsl(var(--brand-green))",
        "brand-leaf": "hsl(var(--brand-leaf))",
        tomat: krayon("tomat"),
        matahari: krayon("matahari"),
        daun: krayon("daun"),
        langit: krayon("langit"),
        anggur: krayon("anggur"),
        permen: krayon("permen"),
      },
      borderRadius: {
        xs: "var(--radius-xs)",
        input: "var(--radius-input)",
        DEFAULT: "var(--radius)",
        sheet: "var(--radius-sheet)",
        full: "var(--radius-full)",
        // Alias kelas shadcn lama → token terdekat (dibersihkan per layar)
        sm: "var(--radius-input)",
        md: "var(--radius-input)",
        lg: "var(--radius)",
        xl: "var(--radius)",
        "2xl": "var(--radius-sheet)",
        "3xl": "var(--radius-sheet)",
      },
      height: {
        btn: "var(--btn-h)",
        "btn-sm": "var(--btn-h-sm)",
        "btn-lg": "var(--btn-h-lg)",
        input: "var(--input-h)",
        chip: "var(--chip-h)",
        touch: "var(--touch)",
      },
      minHeight: {
        touch: "var(--touch)",
        btn: "var(--btn-h)",
      },
      minWidth: {
        touch: "var(--touch)",
      },
      width: {
        btn: "var(--btn-h)",
        "btn-sm": "var(--btn-h-sm)",
        "btn-lg": "var(--btn-h-lg)",
        touch: "var(--touch)",
        sidebar: "232px",
        rail: "76px",
      },
      boxShadow: {
        float: "var(--shadow-float)",
        sheet: "var(--shadow-sheet)",
        soft: "var(--shadow-soft)",
        focus: "0 0 0 4px hsl(var(--primary-soft))",
        // alias lama: kartu di halaman memakai garis, bukan bayangan
        sm: "var(--shadow-soft)",
        md: "var(--shadow-soft)",
        lg: "var(--shadow-float)",
        xl: "var(--shadow-float)",
        "2xl": "var(--shadow-float)",
        card: "var(--shadow-soft)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "sk-pulse": {
          "50%": { opacity: ".55" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "sk-pulse": "sk-pulse 1.6s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
