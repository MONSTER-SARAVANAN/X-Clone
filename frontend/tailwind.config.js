// tailwind.config.js  (ESM)
import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: {} },
  plugins: [daisyui],

  daisyui: {
    themes: [
      "light",                 // builtin
      {
        black: {               // your custom theme
          primary:   "#1d9bf0",   // X‑blue
          secondary: "#181818",
          accent:    "#f4a261",
          neutral:   "#191d24",
          "base-100": "#000000",
          info:      "#3abff8",
          success:   "#36d399",
          warning:   "#fbbd23",
          error:     "#f87272",
        },
      },
    ],
  },
};
