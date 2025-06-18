export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: { sans: ["Inter", "sans-serif"] },
      colors: {
        glass: "rgba(255,255,255,0.7)",
        accent:  "#34d399", // verd menta per remarcar
        danger:  "#f87171", // vermell suau
      },
      boxShadow: {
        glass: "0 4px 30px rgba(0,0,0,0.08)",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};
