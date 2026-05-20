/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg:        "#0A0A0A",
        "bg-elev": "#161616",
        "bg-deep": "#000000",
        "bg-line": "#1F1F1F",
        fg:        "#FFFFFF",
        accent:    "#E83A2C",
        "accent-2":"#FF5A48",
      },
      fontFamily: {
        display: ["Anton", "Archivo Black", "Impact", "sans-serif"],
        sans:    ["Inter", "system-ui", "sans-serif"],
        mono:    ["Geist Mono", "JetBrains Mono", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};
