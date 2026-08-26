import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);
const STORAGE_KEY = "theme";

// ค่าเริ่มต้นคือ light เสมอ ไม่สนใจ prefers-color-scheme ของเครื่อง
// (ตามที่ user ยืนยันไว้ — ธีมครีมเดิมต้องเป็นค่าเริ่มต้นของทุกคนก่อน จะมืดได้ก็ต่อเมื่อกดสลับเอง)
const getInitialTheme = () => {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved === "dark" ? "dark" : "light";
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
