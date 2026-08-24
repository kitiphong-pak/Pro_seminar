const BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

/**
 * แปลง response เป็น JSON และโยน error เมื่อ status ไม่ใช่ 2xx
 * (ถ้าไม่เช็ค r.ok ตัว error object จะถูกส่งต่อไปให้ .map()/.filter() จนหน้าเว็บพัง
 *  แทนที่จะไปเข้า .catch() แล้วแสดงหน้า FetchError)
 */
const json = async (r) => {
  const data = await r.json().catch(() => null);
  if (!r.ok) throw new Error(data?.error || `HTTP ${r.status}`);
  return data;
};

/** การันตีว่าได้ array เสมอ — กันกรณี backend ส่งรูปแบบอื่นกลับมา */
const jsonArray = async (r) => {
  const data = await json(r);
  return Array.isArray(data) ? data : [];
};

const getArray = (path) => fetch(`${BASE}${path}`).then(jsonArray);
const getOne   = (path) => fetch(`${BASE}${path}`).then(json);

export const fetchArticles = () => getArray("/api/articles");
export const fetchBeans    = () => getArray("/api/beans");
export const fetchMenus    = () => getArray("/api/menus");
export const fetchQuiz       = (id) => getOne(`/api/quizzes/${id}`);
export const fetchVarieties  = () => getArray("/api/knowledge/varieties");
export const fetchRoasting   = () => getArray("/api/knowledge/roasting");
export const fetchProcessSteps = () => getArray("/api/knowledge/process");
export const fetchCountries  = () => getArray("/api/knowledge/countries");
export const fetchHistory    = () => getOne("/api/knowledge/history");
export const fetchExtraction = () => getArray("/api/knowledge/extraction");

export const fetchSimEquipment       = () => getArray("/api/sim/equipment");
export const fetchSimMenusByEquipment = (id) => getArray(`/api/sim/equipment/${id}/menus`);
export const fetchSimNutrition       = () => getOne("/api/sim/nutrition");
