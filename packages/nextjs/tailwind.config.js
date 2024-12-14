/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}", "./utils/**/*.{js,ts,jsx,tsx}"],
  plugins: [require("daisyui")],
  darkTheme: "dark",
  darkMode: ["selector", "[data-theme='dark']"],
  // DaisyUI theme colors
  daisyui: {
    themes: [
      {
        light: {
          primary: "#E0E5EC",            // 浅灰蓝
          "primary-content": "#6C7A89",   // 深蓝灰
          secondary: "#AEB8C4",          // 灰蓝
          "secondary-content": "#3C4A59", // 深蓝
          accent: "#FFB347",             // 橙黄色
          "accent-content": "#6C4C1F",   // 深棕
          neutral: "#F8F9FA",            // 浅白
          "neutral-content": "#A3B1C6",  // 蓝灰
          "base-100": "#FFFFFF",         // 白色
          "base-200": "#F4F4F4",         // 浅灰
          "base-300": "#E0E5EC",         // 浅灰蓝
          "base-content": "#6C7A89",     // 深蓝灰
          info: "#3498DB",               // 蓝色
          success: "#2ECC71",            // 绿色
          warning: "#F1C40F",            // 黄色
          error: "#E74C3C",              // 红色
        }
        
      },
      {
        dark: {
          primary: "#2C2C2C",            // 深灰黑
          "primary-content": "#A3B1C6",   // 蓝灰
          secondary: "#3C3C3C",          // 黑灰
          "secondary-content": "#D1D5DB", // 浅蓝灰
          accent: "#FFA726",             // 橙色
          "accent-content": "#D87C00",   // 深橙
          neutral: "#121212",            // 黑色
          "neutral-content": "#F0F0F0",  // 浅白
          "base-100": "#1A1A1A",         // 深黑
          "base-200": "#242424",         // 深灰
          "base-300": "#2C2C2C",         // 深灰黑
          "base-content": "#E0E0E0",     // 浅白
          info: "#3498DB",               // 蓝色
          success: "#27AE60",            // 绿色
          warning: "#F39C12",            // 黄色
          error: "#E74C3C",              // 红色
        }
        
      },
    ],
  },
  theme: {
    extend: {
      fontFamily: {
        "space-grotesk": ["Space Grotesk", "sans-serif"],
      },
      boxShadow: {
        center: "0 0 12px -2px rgb(0 0 0 / 0.05)",
      },
      animation: {
        "pulse-fast": "pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
};
