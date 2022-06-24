module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        main: {
          "00": "#0B161E",
          "01": "#122431",
          "02": "#54987F",
          "03": "#01f9c6"
        },
        sides: {
          "00": "#1A3243",
          "01": "#193345",
          "02": "#2B4C63",
          "03": "#4B7B9D",
        },
        neon: {
          cyan: "#01f9c6",
          lime: "#ccff00"
        }
      }
    },
  },
  plugins: [],
}