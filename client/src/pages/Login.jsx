import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/css/SignUp.css";

import { auth, db } from "../firebase/firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithRedirect,
  getRedirectResult,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export default function CoffeeAuth() {
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const switchTo = (m) => { setError(""); setMode(m); };

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const PW_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

  const toFriendly = (err) => {
    const c = err?.code || "";
    if (c.includes("auth/invalid-credential") || c.includes("auth/wrong-password")) return "อีเมลหรือรหัสผ่านไม่ถูกต้อง";
    if (c.includes("auth/user-not-found")) return "ไม่พบบัญชีอีเมลนี้";
    if (c.includes("auth/email-already-in-use")) return "อีเมลนี้ถูกใช้สมัครแล้ว";
    if (c.includes("auth/weak-password")) return "รหัสผ่านยังไม่ปลอดภัยพอ";
    if (c.includes("auth/popup-blocked")) return "เบราว์เซอร์บล็อกหน้าต่างป็อปอัป กรุณาอนุญาตหรือใช้โหมด redirect";
    if (c.includes("auth/popup-closed-by-user")) return "คุณปิดหน้าต่าง Google ก่อนเสร็จสิ้น";
    return err?.message || "เกิดข้อผิดพลาด กรุณาลองใหม่";
  };

  // รับผลลัพธ์กรณี Redirect (กันปัญหา COOP)
  useEffect(() => {
    (async () => {
      try {
        const res = await getRedirectResult(auth);
        if (res?.user) {
          const user = res.user;
          await setDoc(
            doc(db, "users", user.uid),
            {
              email: user.email,
              displayName: user.displayName || "",
              photoURL: user.photoURL || "",
              lastLogin: new Date(),
            },
            { merge: true }
          );
          setError("");
          navigate("/"); // สำเร็จแล้วพาหน้าไปที่ home
        }
      } catch (e) {
        setError(toFriendly(e));
      } finally {
        setSubmitting(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ====== Email/Password Sign In ======
  const onSignIn = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email") || "").trim();
    const password = String(f.get("password") || "");
    if (!email || !password) { setError("กรุณากรอกอีเมลและรหัสผ่านให้ครบถ้วน"); setSubmitting(false); return; }
    if (!EMAIL_RE.test(email)) { setError("รูปแบบอีเมลไม่ถูกต้อง"); setSubmitting(false); return; }

    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, "users", user.uid), { email: user.email, lastLogin: new Date() }, { merge: true });
      setError("");
      navigate("/");
    } catch (err) {
      setError(toFriendly(err));
    } finally {
      setSubmitting(false);
    }
  };

  // ====== Email/Password Sign Up ======
  const onSignUp = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const f = new FormData(e.currentTarget);
    const name = String(f.get("name") || "").trim();
    const email = String(f.get("email") || "").trim();
    const password = String(f.get("password") || "");

    if (!name || !email || !password) { setError("กรุณากรอกข้อมูลให้ครบทุกช่อง"); setSubmitting(false); return; }
    if (!EMAIL_RE.test(email)) { setError("รูปแบบอีเมลไม่ถูกต้อง"); setSubmitting(false); return; }
    if (!PW_RE.test(password)) { setError("รหัสผ่านต้องมีอย่างน้อย 8 ตัว ประกอบด้วยตัวพิมพ์ใหญ่ ตัวพิมพ์เล็ก และตัวเลข"); setSubmitting(false); return; }

    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      if (name) await updateProfile(user, { displayName: name });
      await setDoc(
        doc(db, "users", user.uid),
        { name, displayName: name, email, createdAt: new Date(), lastLogin: new Date() },
        { merge: true }
      );
      setError("");
      navigate("/"); // สมัครเสร็จล็อกอินแล้ว พาเข้าหน้า home
      // ถ้าต้องการให้กลับหน้า login แทน ให้ใช้: switchTo("login");
    } catch (err) {
      setError(toFriendly(err));
      setSubmitting(false);
    }
  };

  // ====== Google Sign In (Popup → Redirect fallback) ======
  const handleGoogle = async () => {
    setSubmitting(true);
    const provider = new GoogleAuthProvider();
    try {
      // ถ้าหน้าอยู่ใน cross-origin isolated (มี COOP/COEP) ใช้ redirect เลย
      if (window.crossOriginIsolated) {
        await signInWithRedirect(auth, provider);
        return; // รอผลใน useEffect
      }

      const { user } = await signInWithPopup(auth, provider);
      await setDoc(
        doc(db, "users", user.uid),
        {
          email: user.email,
          displayName: user.displayName || "",
          photoURL: user.photoURL || "",
          lastLogin: new Date(),
        },
        { merge: true }
      );
      setError("");
      navigate("/");
    } catch (err) {
      // ถ้า popup โดนบล็อก/ติด COOP → redirect แทน
      if (err?.code === "auth/popup-blocked" || err?.code === "auth/internal-error") {
        await signInWithRedirect(auth, provider);
        return; // รอผลใน useEffect
      }
      setError(toFriendly(err));
      setSubmitting(false);
    }
  };

  // ====== Icons ======
  const EyeIcon = ({ open=false }) => (
    open ? (
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M3.53 2.47 2.47 3.53l3.06 3.06A12.6 12.6 0 0 0 1.64 12S4.73 18 12 18c2.1 0 3.94-.47 5.47-1.26l3 3 .96-.96-17.9-16.3ZM12 16c-4.74 0-7.34-3.63-8.28-5 .6-.9 1.98-2.66 3.92-3.94l2.08 2.09A4 4 0 0 0 12 16Zm0-10c4.74 0 7.34 3.63 8.28 5-.44.66-1.3 1.82-2.56 2.9l-1.46-1.46c.71-.57 1.33-1.3 1.74-1.84C16.6 8 14.52 6 12 6a5.9 5.9 0 0 0-1.75.26L8.7 4.7C9.7 4.25 10.81 4 12 4Zm0 3a3 3 0 0 1 3 3c0 .38-.07.73-.19 1.06l-3.87-3.87c.33-.12.68-.19 1.06-.19Z"/>
      </svg>
    ) : (
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M12 5c-7.27 0-10.36 6-10.36 6S4.73 17 12 17s10.36-6 10.36-6S19.27 5 12 5Zm0 10c-4.74 0-7.34-3.63-8.28-5C4.66 8.02 7.26 6 12 6s7.34 2.02 8.28 4c-.94 1.37-3.54 5-8.28 5Zm0-8a4 4 0 1 0 .001 8.001A4 4 0 0 0 12 7Zm0 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4Z"/>
      </svg>
    )
  );

  // แก้ path SVG ให้เป็นของจริง ไม่มีอักขระแปลกปน
  const GoogleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.86 0 6.54 1.67 8.05 3.07l5.49-5.49C34.94 3.53 29.86 1.5 24 1.5 14.62 1.5 6.47 6.87 2.88 14.59l6.89 5.35C11.4 14.48 17.15 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.5 24.5c0-1.63-.15-2.82-.48-4.05H24v8.15h12.95c-.26 2.04-1.69 5.11-4.86 7.17l7.47 5.79c4.34-4 6.94-9.9 6.94-17.06z"/>
      <path fill="#FBBC05" d="M9.77 28.96A14.51 14.51 0 0 1 9 24c0-1.72.29-3.38.77-4.96l-6.89-5.35A22.41 22.41 0 0 0 1.5 24c0 3.64.87 7.08 2.38 10.12l5.89-5.16z"/>
      <path fill="#34A853" d="M24 46.5c6.6 0 12.15-2.17 16.2-5.9l-7.47-5.79c-2.07 1.4-4.86 2.37-8.73 2.37-6.85 0-12.6-4.98-14.23-11.69l-5.89 5.16C6.47 41.13 14.62 46.5 24 46.5z"/>
    </svg>
  );

  return (
    <div className={`coffee-auth container coffee ${mode === "signup" ? "right-panel-active" : ""}`}>
      {/* ===== Sign Up ===== */}
      <div className="form-container sign-up-container">
        <form onSubmit={onSignUp}>
          <h1>สร้างบัญชี</h1>
          <p className="hint">หรือเชื่อมต่อด้วย Google</p>
          <div className="social-container">
            <button type="button" className="social google" onClick={handleGoogle} disabled={submitting}>
              <GoogleIcon />
            </button>
          </div>

          <input name="name" type="text" placeholder="ชื่อเล่น / ร้านกาแฟ" autoComplete="name" />
          <input name="email" type="email" placeholder="อีเมล" autoComplete="email" />
          <div className="pwwrap">
            <input name="password" type={showPw ? "text" : "password"} placeholder="รหัสผ่าน" autoComplete="new-password" />
            <button type="button" className="eye" aria-label="toggle password" onClick={()=>setShowPw(s=>!s)}>
              <EyeIcon open={showPw} />
            </button>
          </div>
          <button className="btn" type="submit" disabled={submitting}>{submitting && mode==="signup" ? "กำลังสมัคร…" : "Sign Up"}</button>
          {error && mode==="signup" && <div className="error">{error}</div>}
        </form>
      </div>

      {/* ===== Sign In ===== */}
      <div className="form-container sign-in-container">
        <form onSubmit={onSignIn}>
          <h1>เข้าสู่ระบบ</h1>
          <p className="hint">Login with Email &amp; Password หรือ Google</p>
          <div className="social-container">
            <button type="button" className="social google" title="Sign in with Google" onClick={handleGoogle} disabled={submitting}>
              <GoogleIcon />
            </button>
          </div>
          <input name="email" type="email" placeholder="อีเมล" autoComplete="email" />
          <div className="pwwrap">
            <input name="password" type={showPw ? "text" : "password"} placeholder="รหัสผ่าน" autoComplete="current-password" />
            <button type="button" className="eye" aria-label="toggle password" onClick={()=>setShowPw(s=>!s)}>
              <EyeIcon open={showPw} />
            </button>
          </div>
          <a className="link" href="#forgot" onClick={(e)=>e.preventDefault()}>ลืมรหัสผ่าน?</a>
          <button className="btn" type="submit" disabled={submitting}>{submitting && mode==="login" ? "กำลังเข้าสู่ระบบ…" : "Sign In"}</button>
          {error && mode==="login" && <div className="error">{error}</div>}
        </form>
      </div>

      {/* ===== Overlay Panels ===== */}
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
            <button
              className="cta"
              onClick={() => switchTo(mode === "signup" ? "login" : "signup")}
            >
              {mode === "signup" ? "Sign In" : "Sign Up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
