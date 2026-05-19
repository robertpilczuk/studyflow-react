/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans:  ["Inter", "sans-serif"],
        mono:  ["JetBrains Mono", "monospace"],
        head:  ["Plus Jakarta Sans", "sans-serif"],
      },
      colors: {
        bg: {
          DEFAULT: "#080A0F",
          2:       "#0F1117",
          3:       "#161820",
          4:       "#1E2028",
          5:       "#252830",
        },
        accent: {
          blue:   "#4F8EF7",
          indigo: "#7C6FF7",
          green:  "#34D399",
          amber:  "#FBBF24",
          coral:  "#FB7185",
          purple: "#A78BFA",
        }
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "16px",
      },
    },
  },
  plugins: [],
}
