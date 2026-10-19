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
        void: "#0A0B0F",
        surface: "#1A1D27",
        border: "#2A2D3E",
        gold: "#C8AA6E",
        primary: "#E8E8EA",
        muted: "#5A5C6E",
        rep: {
          exalted: "#C8AA6E",
          revered: "#4B9CD3",
          honored: "#6B9E5E",
          friendly: "#A0A832",
          neutral: "#8C8C8C",
        },
      },
    },
  },
  plugins: [],
};
