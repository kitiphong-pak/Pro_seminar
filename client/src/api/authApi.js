const BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

const getToken = () => localStorage.getItem("authToken");

/** อ่าน JSON เสมอ แล้วคืน { error } เมื่อ status ไม่ใช่ 2xx
 *  (หน้า Login/SignUp อ่านค่า res.error อยู่แล้ว จึงคงรูปแบบเดิมไว้) */
const json = async (r) => {
  const data = await r.json().catch(() => null);
  if (!r.ok) return { error: data?.error || `HTTP ${r.status}` };
  return data;
};

export const apiRegister = (name, email, password) =>
  fetch(`${BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  }).then(json);

export const apiLogin = (email, password) =>
  fetch(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  }).then(json);

export const getMe = (token) =>
  fetch(`${BASE}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token || getToken()}` },
  })
    .then((r) => (r.ok ? r.json() : null))
    .catch(() => null);

export const apiGoogleAuth = (credential) =>
  fetch(`${BASE}/api/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ credential }),
  }).then(json);
