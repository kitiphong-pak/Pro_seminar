const BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

const getToken = () => localStorage.getItem("authToken");

/** header สำหรับ request ที่ต้องยืนยันตัวตน */
const authHeaders = (extra = {}) => {
  const token = getToken();
  return token ? { ...extra, Authorization: `Bearer ${token}` } : extra;
};

/** โยน error เมื่อ HTTP status ไม่ใช่ 2xx เพื่อให้ .catch() ทำงานจริง */
const json = async (r) => {
  const data = await r.json().catch(() => null);
  if (!r.ok) throw new Error(data?.error || `HTTP ${r.status}`);
  return data;
};

/** สร้างหรืออัปเดต user (merge) */
export const upsertUser = (uid, data) =>
  fetch(`${BASE}/api/users/${uid}`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(data),
  }).then(json);

/** ดึงข้อมูล user — คืน null ถ้าไม่พบ */
export const getUser = async (uid) => {
  const r = await fetch(`${BASE}/api/users/${uid}`);
  return r.ok ? r.json() : null;
};

/** อัปเดต fields บางส่วนของ user */
export const updateUser = (uid, data) =>
  fetch(`${BASE}/api/users/${uid}`, {
    method: "PATCH",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(data),
  }).then(json);

/** อัปเดต achievement */
export const updateAchievement = (uid, category, achievementId, status = true) =>
  fetch(`${BASE}/api/users/${uid}/achievements`, {
    method: "PATCH",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ category, achievementId, status }),
  }).then(json);

/** บันทึกคะแนน quiz */
export const saveQuizScore = (uid, quizId, score, max, title) =>
  fetch(`${BASE}/api/users/${uid}/quiz`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ quizId, score, max, title }),
  }).then(json);

/** อัปโหลดรูปโปรไฟล์ — คืน photoURL แบบเต็ม */
export const uploadAvatar = async (uid, file) => {
  const formData = new FormData();
  formData.append("avatar", file);
  const r = await fetch(`${BASE}/api/users/${uid}/avatar`, {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });
  const { photoURL } = await json(r);
  return `${BASE}${photoURL}`;
};
