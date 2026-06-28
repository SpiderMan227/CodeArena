/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0a0a0c',       // Premium deep space dark background
          card: '#121216',     // Card/Container dark background
          border: '#1f1f2e',   // Modern card border color
          accent: '#6366f1',   // Indigo accent color
        },
        "secondary-container": "#00a572",
        "on-primary": "#002a78",
        "on-primary-fixed": "#00174b",
        "secondary-fixed-dim": "#4edea3",
        "surface-dim": "#0b1326",
        "on-tertiary-fixed": "#07006c",
        "on-tertiary-fixed-variant": "#2f2ebe",
        "tertiary-fixed": "#e1e0ff",
        "primary-container": "#2563eb",
        "surface-variant": "#2d3449",
        "on-secondary": "#003824",
        "surface-container": "#171f33",
        "on-secondary-fixed": "#002113",
        "error-container": "#93000a",
        "tertiary-container": "#585be6",
        "tertiary-fixed-dim": "#c0c1ff",
        "surface-container-lowest": "#060e20",
        "on-tertiary-container": "#f1eeff",
        "background": "#0b1326",
        "on-secondary-container": "#00311f",
        "on-surface": "#dae2fd",
        "secondary-fixed": "#6ffbbe",
        "surface-container-low": "#131b2e",
        "secondary": "#4edea3",
        "on-tertiary": "#1000a9",
        "surface": "#0b1326",
        "primary-fixed": "#dbe1ff",
        "inverse-primary": "#0053db",
        "inverse-on-surface": "#283044",
        "surface-tint": "#b4c5ff",
        "inverse-surface": "#dae2fd",
        "tertiary": "#c0c1ff",
        "on-primary-fixed-variant": "#003ea8",
        "primary": "#b4c5ff",
        "on-error": "#690005",
        "surface-container-highest": "#2d3449",
        "on-background": "#dae2fd",
        "surface-container-high": "#222a3d",
        "error": "#ffb4ab",
        "primary-fixed-dim": "#b4c5ff",
        "outline-variant": "#434655",
        "surface-bright": "#31394d",
        "on-surface-variant": "#c3c6d7",
        "on-secondary-fixed-variant": "#005236",
        "on-primary-container": "#eeefff",
        "outline": "#8d90a0",
        "on-error-container": "#ffdad6"
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
      spacing: {
        "2xl": "3rem",
        "gutter": "1.5rem",
        "margin-desktop": "2.5rem",
        "md": "1rem",
        "xl": "2rem",
        "lg": "1.5rem",
        "xs": "0.25rem",
        "base": "4px",
        "sm": "0.5rem",
        "margin-mobile": "1rem"
      },
      fontFamily: {
        "label-md": ["JetBrains Mono"],
        "code-sm": ["JetBrains Mono"],
        "code-md": ["JetBrains Mono"],
        "body-md": ["Hanken Grotesk"],
        "body-sm": ["Hanken Grotesk"],
        "headline-md": ["Hanken Grotesk"],
        "headline-lg": ["Hanken Grotesk"],
        "body-lg": ["Hanken Grotesk"],
        "headline-xl": ["Hanken Grotesk"]
      },
      fontSize: {
        "label-md": ["12px", { lineHeight: "16px", letterSpacing: "0.05em", fontWeight: "600" }],
        "code-sm": ["12px", { lineHeight: "18px", fontWeight: "450" }],
        "code-md": ["14px", { lineHeight: "22px", fontWeight: "450" }],
        "body-md": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "body-sm": ["14px", { lineHeight: "20px", fontWeight: "400" }],
        "headline-md": ["24px", { lineHeight: "32px", fontWeight: "600" }],
        "headline-lg": ["32px", { lineHeight: "40px", letterSpacing: "-0.01em", fontWeight: "600" }],
        "body-lg": ["18px", { lineHeight: "28px", fontWeight: "400" }],
        "headline-xl": ["40px", { lineHeight: "48px", letterSpacing: "-0.02em", fontWeight: "700" }]
      }
    },
  },
  plugins: [],
}
