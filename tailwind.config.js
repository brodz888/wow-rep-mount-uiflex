/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        body: ["var(--font-body)", "sans-serif"],
        display: ["var(--font-display)", "sans-serif"],
      },
      colors: {
        void: "var(--bg-void)",
        surface: "var(--surface-raised)",
        border: "var(--surface-border)",
        gold: "var(--accent-gold)",
        primary: "var(--text-primary)",
        muted: "var(--text-muted)",
      },
    },
  },
  plugins: [],
};
