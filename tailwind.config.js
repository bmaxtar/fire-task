/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#5EE3AF",
        secondary: "#4BC9F0",
        gray_1: "#E6E8EC",
        grey_text: "#777E90",
        success: "#5EE3AF",
      },
    },
  },
  plugins: [],
};
