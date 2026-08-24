import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/css/SignUp.css";
import { useAuth } from "../contexts/AuthContext";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PW_RE    = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export default function CoffeeAuth() {
  const [mode, setMode]           = useState("login");
  const [showPw, setShowPw]       = useState(false);
  const [error, setError]         = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { login, register, loginWithGoogle } = useAuth();
  const googleBtnLoginRef  = useRef(null);
  const googleBtnSignupRef = useRef(null);

  const handleGoogleCallback = async (response) => {
    try {
      await loginWithGoogle(response.credential);
      navigate("/");
    } catch (err) {
      setError(err.message || "Google sign-in ไม่สำเร็จ");
    }
  };

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (!window.google) return;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleCallback,
      });
      if (googleBtnLoginRef.current) {
        window.google.accounts.id.renderButton(googleBtnLoginRef.current, {
          theme: "outline", size: "large", width: "100%", text: "signin_with",
        });
      }
      if (googleBtnSignupRef.current) {
        window.google.accounts.id.renderButton(googleBtnSignupRef.current, {
          theme: "outline", size: "large", width: "100%", text: "signup_with",
        });
      }
    };
    document.head.appendChild(script);
    return () => { if (document.head.contains(script)) document.head.removeChild(script); };
  }, []);

  const switchTo = (m) => { setError(""); setMode(m); };

  // ====== Sign In ======
  const onSignIn = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const f = new FormData(e.currentTarget);
    const email    = String(f.get("email")    || "").trim();
    const password = String(f.get("password") || "");
    if (!email || !password) { setError("กรุณากรอกอีเมลและรหัสผ่านให้ครบ"); setSubmitting(false); return; }
    if (!EMAIL_RE.test(email)) { setError("รูปแบบอีเมลไม่ถูกต้อง"); setSubmitting(false); return; }
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.message || "เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setSubmitting(false);
    }
  };

  // ====== Sign Up ======
  const onSignUp = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const f = new FormData(e.currentTarget);
    const name     = String(f.get("name")     || "").trim();
    const email    = String(f.get("email")    || "").trim();
    const password = String(f.get("password") || "");
    if (!name || !email || !password) { setError("กรุณากรอกข้อมูลให้ครบทุกช่อง"); setSubmitting(false); return; }
    if (!EMAIL_RE.test(email)) { setError("รูปแบบอีเมลไม่ถูกต้อง"); setSubmitting(false); return; }
    if (!PW_RE.test(password)) { setError("รหัสผ่านต้องมีอย่างน้อย 8 ตัว ประกอบด้วยตัวพิมพ์ใหญ่ ตัวพิมพ์เล็ก และตัวเลข"); setSubmitting(false); return; }
    try {
      await register(name, email, password);
      navigate("/");
    } catch (err) {
      setError(err.message || "เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setSubmitting(false);
    }
  };

  const EyeIcon = ({ open = false }) =>
    open ? (
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M3.53 2.47 2.47 3.53l3.06 3.06A12.6 12.6 0 0 0 1.64 12S4.73 18 12 18c2.1 0 3.94-.47 5.47-1.26l3 3 .96-.96-17.9-16.3ZM12 16c-4.74 0-7.34-3.63-8.28-5 .6-.9 1.98-2.66 3.92-3.94l2.08 2.09A4 4 0 0 0 12 16Zm0-10c4.74 0 7.34 3.63 8.28 5-.44.66-1.3 1.82-2.56 2.9l-1.46-1.46c.71-.57 1.33-1.3 1.74-1.84C16.6 8 14.52 6 12 6a5.9 5.9 0 0 0-1.75.26L8.7 4.7C9.7 4.25 10.81 4 12 4Zm0 3a3 3 0 0 1 3 3c0 .38-.07.73-.19 1.06l-3.87-3.87c.33-.12.68-.19 1.06-.19Z"/>
      </svg>
    ) : (
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M12 5c-7.27 0-10.36 6-10.36 6S4.73 17 12 17s10.36-6 10.36-6S19.27 5 12 5Zm0 10c-4.74 0-7.34-3.63-8.28-5C4.66 8.02 7.26 6 12 6s7.34 2.02 8.28 4c-.94 1.37-3.54 5-8.28 5Zm0-8a4 4 0 1 0 .001 8.001A4 4 0 0 0 12 7Zm0 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4Z"/>
      </svg>
    );

  return (
    <div className={`coffee-auth container coffee ${mode === "signup" ? "right-panel-active" : ""}`}>
      {/* ===== Sign Up ===== */}
      <div className="form-container sign-up-container">
        <form onSubmit={onSignUp}>
          <h1>สร้างบัญชี</h1>
          <input name="name"     type="text"     placeholder="ชื่อเล่น" autoComplete="name" />
          <input name="email"    type="email"    placeholder="อีเมล"    autoComplete="email" />
          <div className="pwwrap">
            <input name="password" type={showPw ? "text" : "password"} placeholder="รหัสผ่าน" autoComplete="new-password" />
            <button type="button" className="eye" aria-label="toggle password" onClick={() => setShowPw((s) => !s)}>
              <EyeIcon open={showPw} />
            </button>
          </div>
          <button className="btn" type="submit" disabled={submitting}>
            {submitting && mode === "signup" ? "กำลังสมัคร…" : "Sign Up"}
          </button>
          {error && mode === "signup" && <div className="error">{error}</div>}
          <div className="google-divider"><span>หรือ</span></div>
          <div ref={googleBtnSignupRef} className="google-btn-wrap" />
        </form>
      </div>

      {/* ===== Sign In ===== */}
      <div className="form-container sign-in-container">
        <form onSubmit={onSignIn}>
          <h1>เข้าสู่ระบบ</h1>
          <input name="email"    type="email"    placeholder="อีเมล"    autoComplete="email" />
          <div className="pwwrap">
            <input name="password" type={showPw ? "text" : "password"} placeholder="รหัสผ่าน" autoComplete="current-password" />
            <button type="button" className="eye" aria-label="toggle password" onClick={() => setShowPw((s) => !s)}>
              <EyeIcon open={showPw} />
            </button>
          </div>
          <button className="btn" type="submit" disabled={submitting}>
            {submitting && mode === "login" ? "กำลังเข้าสู่ระบบ…" : "Sign In"}
          </button>
          {error && mode === "login" && <div className="error">{error}</div>}
          <div className="google-divider"><span>หรือ</span></div>
          <div ref={googleBtnLoginRef} className="google-btn-wrap" />
        </form>
      </div>

      {/* ===== Overlay ===== */}
      <div className="overlay-container">
        <div className="overlay">
          <div className="overlay-panel overlay-left">
            <h1>ยินดีต้อนรับกลับ!</h1>
            <p>จิบเอสเปรสโซ่แก้วโปรด แล้วเข้าสู่ระบบเพื่อชงเมนูต่อ</p>
            <button className="cta" onClick={() => switchTo("login")}>Sign In</button>
          </div>
          <div className="overlay-panel overlay-right">
            <h1>สวัสดี นักชง!</h1>
            <p>สมัครสมาชิกเพื่อบันทึกสูตรกาแฟและแชร์รสชาติที่คุณชอบ</p>
            <button className="cta" onClick={() => switchTo(mode === "signup" ? "login" : "signup")}>
              {mode === "signup" ? "Sign In" : "Sign Up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
