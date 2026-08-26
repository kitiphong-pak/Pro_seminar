// tailwind.config.js (ESM)
export default {
  // สลับ dark mode ด้วย [data-theme="dark"] บน <html> (ตั้งค่าใน ThemeContext.jsx)
  // ไม่ใช้ prefers-color-scheme เพราะค่าเริ่มต้นต้องเป็น light เสมอ ต้องกดสลับเองเท่านั้น
  darkMode: ["selector", '[data-theme="dark"]'],
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  safelist: ["hover:bg-light-brown", "hover:text-beige"],
  theme: {
    extend: {
      colors: {
        "dark-brown": "#20170E",
        brown: "#4e3629",
        "light-brown": "#7a5647",
        "light-brown2": "rgba(114, 59, 27, 0.55)",
        beige: "#FFE2B4",
        "beige-light": "#f3f1ec",
        "brown-superlight": "#efdfc3",
        "brown-light": "rgba(123, 53, 0, 0.1)"
      },
      fontFamily: {
        main: ['"Mainfont"', "system-ui", "sans-serif"]
      },
      transitionTimingFunction: {
        // เส้นโค้ง ease-out ที่นุ่มกว่า default ของ Tailwind — ใช้กับ hover/press ทั่วเว็บ
        smooth: "cubic-bezier(0.22, 1, 0.36, 1)"
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" }
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.97)" },
          "100%": { opacity: "1", transform: "scale(1)" }
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        }
      },
      animation: {
        // both = คงสไตล์ตอนจบให้แล้วเสร็จค้างอยู่ ไม่กระพริบกลับ
        "fade-in": "fadeIn 0.45s ease-out both",
        "fade-in-up": "fadeInUp 0.5s cubic-bezier(0.22,1,0.36,1) both",
        "scale-in": "scaleIn 0.3s cubic-bezier(0.22,1,0.36,1) both",
        "slide-down": "slideDown 0.3s cubic-bezier(0.22,1,0.36,1) both"
      }
    },
    screens: {
      sm: "640px",
      md: "768px",
      lg: "1024px"
    }
  },
  plugins: []
};
