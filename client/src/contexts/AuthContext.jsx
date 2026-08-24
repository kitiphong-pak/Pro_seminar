import { createContext, useContext, useEffect, useState } from "react";
import { apiLogin, apiRegister, apiGoogleAuth, getMe } from "../api/authApi";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(undefined); // undefined = กำลังโหลด, null = ไม่ได้ login

  // โหลด session จาก localStorage เมื่อ app เริ่ม
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) { setUser(null); return; }
    getMe(token).then((userData) => {
      if (userData && !userData.error) setUser(userData);
      else { localStorage.removeItem("authToken"); setUser(null); }
    });
  }, []);

  const login = async (email, password) => {
    const res = await apiLogin(email, password);
    if (res.error) throw new Error(res.error);
    localStorage.setItem("authToken", res.token);
    setUser(res.user);
  };

  const register = async (name, email, password) => {
    const res = await apiRegister(name, email, password);
    if (res.error) throw new Error(res.error);
    localStorage.setItem("authToken", res.token);
    setUser(res.user);
  };

  const loginWithGoogle = async (credential) => {
    const res = await apiGoogleAuth(credential);
    if (res.error) throw new Error(res.error);
    localStorage.setItem("authToken", res.token);
    setUser(res.user);
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    setUser(null);
  };

  const updateUserData = (updates) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : prev));
  };

  return (
    <AuthContext.Provider value={{ user, isLoading: user === undefined, login, logout, register, loginWithGoogle, updateUserData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
