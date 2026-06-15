import { BASE_FLAVOR_INTENTS } from "./constants";

export const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
export const round1 = (x) => Math.round(x * 10) / 10;

export function recipeEquals(a, b) {
  return (
    a?.grind === b?.grind &&
    Number(a?.dose) === Number(b?.dose) &&
    Number(a?.water) === Number(b?.water) &&
    Number(a?.heat) === Number(b?.heat) &&
    Number(a?.targetTime) === Number(b?.targetTime) &&
    Boolean(a?.preheat) === Boolean(b?.preheat) &&
    Boolean(a?.overpack) === Boolean(b?.overpack) &&
    (a?.beanType || "arabica") === (b?.beanType || "arabica")
  );
}

export function methodLabel(m) {
  return m === "espresso" ? "เอสเพรสโซ"
    : m === "drip" ? "ดริป"
    : m === "frenchpress" ? "เฟรนช์เพรส"
    : "โมก้าพอต";
}

export function grindOptionsFor(method, mokaSpec) {
  if (method === "moka") return mokaSpec?.ingredients?.grindOptions || ["fine", "medium-fine", "medium"];
  if (method === "espresso") return ["fine"];
  if (method === "drip") return ["medium-coarse", "medium", "medium-fine"];
  if (method === "frenchpress") return ["coarse", "medium-coarse"];
  return ["medium"];
}

export function grindLabel(g) {
  return ({ fine: "ละเอียด", "medium-fine": "กลาง-ละเอียด", medium: "กลาง", "medium-coarse": "กลาง-หยาบ", coarse: "หยาบ" }[g] || g);
}

export function labelGrind(g) {
  if (g === "fine") return "ละเอียด";
  if (g === "medium-fine") return "กลาง-ละเอียด";
  return "กลาง";
}

export function labelBeanType(id, methodSpec) {
  const specOpts = methodSpec?.ingredients?.beanOptions;
  if (Array.isArray(specOpts)) {
    const found = specOpts.find((x) => x.id === id);
    if (found?.label) return found.label;
  }
  return ({ arabica: "อาราบิก้า", robusta: "โรบัสต้า" }[id] || id || "-");
}

export function guideSteps(method, intent) {
  const intentWord = intent === "bright" ? "โทนสว่าง" : intent === "bold" ? "โทนเข้มหนา" : "สมดุล";
  return [
    { title: "โครงหน้าแบบจำลอง", desc: "หน้าจอแบ่งเป็น 4 ส่วนหลัก: คำแนะนำ, อุปกรณ์, ภาพจำลอง, และวัตถุดิบ.\nแต่ละส่วนมีการโต้ตอบของตัวเอง", image: "layout" },
    { title: "เลือกแนวรสชาติ", desc: "เลือกแนวรสชาติ เช่น เบาบางดื่มง่าย หรือเข้มข้น เพื่อให้ระบบแนะนำค่าการชงและไฟที่เหมาะสม", image: "flavor" },
    { title: "อ่านคำแนะนำจากผู้ช่วย", desc: "ช่องซ้ายบนจะแสดงรายละเอียดโทนรสชาติและค่าที่แนะนำ เช่น ปริมาณน้ำ กาแฟ เวลา และไฟ", image: "coach" },
    { title: "อุปกรณ์โมก้าพอต", desc: "ลากชิ้นส่วน เช่น ฐาน กรวย และส่วนบน ไปวางบนภาพจำลองตามลำดับ หรือคลิกเพื่อวางทันที", image: "equip" },
    { title: "ภาพจำลองเครื่องชง", desc: "บริเวณตรงกลางจะแสดงโมก้าพอตตามขั้นตอนที่ประกอบไว้ และเปลี่ยนภาพอัตโนมัติเมื่อชง", image: "moka" },
    { title: "โซนกาแฟ", desc: "เลือกความละเอียดของการบดหรือชนิดของกาแฟและปรับปริมาณที่ต้องการ แล้วกด 'ใส่ผงกาแฟ'", image: "coffee" },
    { title: "โซนน้ำ", desc: "เลื่อนสไลเดอร์เพื่อเติมน้ำ (ข้อสำคัญไม่ควรเกินวาล์วนิรภัยของฐานโมก้าพอท) และกดปุ่ม 'เติมน้ำ' เพื่อยืนยัน", image: "water" },
    { title: "ตัวเลือกเพิ่มเติม", desc: "สามารถเปิดตัวเลือกเสริม เช่น อัดผงกาแฟแน่น หรืออุ่นแก้วก่อนเสิร์ฟ เพื่อปรับผลลัพธ์", image: "extra" },
    { title: "ปรับระดับไฟ", desc: "ใช้ปุ่มครึ่งวงกลมเพื่อปรับความแรงของไฟ ระหว่าง 1–10 ระดับ ก่อนเริ่มชง", image: "knob" },
    { title: "จับเวลาและเริ่มชง", desc: "แสดงเวลาที่ผ่านไปเทียบกับเป้าหมาย และกดปุ่ม 'ตั้งไฟ / เริ่มชง' เพื่อเริ่มการสกัด", image: "timer" },
    { title: "ดูสรุปผลและคำแนะนำ", desc: "เมื่อหยุดเวลาแล้ว จะมีสรุปโปรไฟล์ สิ่งที่ทำได้ดี จุดที่น่าปรับ และแผนช็อตถัดไป", image: "summary" },
  ];
}

export function coachAdvice(p, intentId) {
  const tips = [];
  if (intentId === "bright") {
    if (p.method === "moka" || p.method === "espresso") {
      if (p.targetTime > 125) tips.push("ย่นเวลาเล็กน้อยเพื่อโทนสว่างขึ้น");
      if (p.heat >= 8) tips.push("ลดไฟลง ~1 ระดับเพื่อลดโทนไหม้/ขม");
    }
    if (p.method === "drip") tips.push("เพิ่มสัดส่วนน้ำ (1:16–1:17) เพื่อโปรไฟล์ใส");
  }
  if (intentId === "balanced") {
    if (p.heat < 5) tips.push("เพิ่มไฟเล็กน้อยเพื่อช่วยการสกัดให้สมดุล");
    if (p.targetTime < 90 || p.targetTime > 140) tips.push("เล็งเวลา ~90–130 วินาที");
  }
  if (intentId === "bold") {
    if (p.targetTime < 100 && p.method !== "espresso") tips.push("ยืดเวลาอีกนิดให้บอดี้หนาขึ้น");
    if (p.method === "espresso" && p.targetTime < 23) tips.push("เพิ่มเวลาเป็น ~25–30 วิ เพื่อความกลมกล่อม");
  }
  if (p.overpack) tips.push("ลดการอัดแน่น เพื่อลดแรงดันสูง/ขมจัด");
  if (!p.preheat && (p.method === "moka" || p.method === "drip")) tips.push("พรีฮีตน้ำ/อุปกรณ์ช่วยให้รสสะอาดขึ้น");
  return tips;
}

export function analyzeSummary(data) {
  const good = [];
  const issues = [];
  const actions = [];

  if (data.timing?.includes("เร็ว")) {
    issues.push("เวลาด่วนไปเล็กน้อย → รสอาจใส/เปรี้ยวกว่าที่ตั้งใจ");
    actions.push("ยืดเวลาอีก ~5–10 วิ หรือเพิ่มไฟเล็กน้อย");
  } else if (data.timing?.includes("ช้า")) {
    issues.push("เวลานานไป → รสอาจเข้ม/ขมปลาย");
    actions.push("หยุดให้เร็วขึ้น ~5–10 วิ หรือ ลดไฟเล็กน้อย");
  } else {
    good.push("เวลาใกล้เป้าที่ตั้งไว้");
  }

  if (data.strength === "เข้ม") {
    issues.push("เครื่องดื่มค่อนข้างเข้ม");
    actions.push("เพิ่มน้ำเล็กน้อย (อัตราส่วนยาวขึ้น) หรือหยุดเร็วขึ้นนิดเดียว");
  } else if (data.strength?.includes("บาง")) {
    issues.push("รสค่อนข้างใส/บาง");
    actions.push("ลดน้ำลงเล็กน้อย หรือยืดเวลาอีกนิด");
  } else if (data.strength === "กลาง") {
    good.push("ความเข้มพอดี ดื่มง่าย");
  }

  const heat = data?.heatLevel ?? null;
  if (typeof heat === "number") {
    if (heat >= 8) { issues.push("ไฟค่อนข้างแรง อาจมีโทนไหม้ปลาย"); actions.push("ลดไฟลง 1 ระดับ"); }
    else if (heat <= 4) { issues.push("ไฟอ่อน อาจสกัดไม่ทัน"); actions.push("เพิ่มไฟขึ้นเล็กน้อย"); }
    else good.push("ระดับไฟอยู่ในโซนปลอดภัย");
  }

  if (data.extraction === "อ่อน") {
    issues.push("การสกัดยังอ่อนไปนิด");
    actions.push("ยืดเวลา/เพิ่มไฟ หรือบดให้ละเอียดขึ้นครึ่งสเต็ป");
  } else if (data.extraction === "มาก") {
    issues.push("การสกัดค่อนข้างมาก");
    actions.push("หยุดเร็วขึ้น/ลดไฟ หรือบดหยาบขึ้นครึ่งสเต็ป");
  } else if (data.extraction === "กำลังดี") {
    good.push("ระดับการสกัดกำลังดี");
  }

  return { good, issues, next: Array.from(new Set(actions)).slice(0, 3) };
}

export function methodRanges(method, mokaSpec) {
  const node = (rows) => rows; // returns raw data; render in component
  if (method === "moka" && mokaSpec?.ingredients) {
    const g = mokaSpec.ingredients;
    const pick = (k, fallback) => {
      const o = g[k] || {};
      return { recMin: o.recMin ?? fallback[0], recMax: o.recMax ?? fallback[1], rec: o.rec ?? fallback[2] };
    };
    const dose  = pick("dose",  [16, 18, 17]);
    const water = pick("water", [95, 115, 105]);
    const heat  = pick("heat",  [5,  7,  6]);
    const time  = pick("time",  [90, 130, 110]);
    return [
      `กาแฟ: ${dose.recMin}–${dose.recMax} กรัม (แนะนำ ~${dose.rec})`,
      `น้ำ: ${water.recMin}–${water.recMax} มล. (ใต้ระดับวาล์ว)`,
      `ไฟ: ${heat.recMin}–${heat.recMax} /10 (แนะนำ ~${heat.rec})`,
      `เวลา: ${time.recMin}–${time.recMax} วิ (แนะนำ ~${time.rec})`,
    ];
  }
  if (method === "espresso") return ["กาแฟ: 16–22 กรัม", "ช็อตที่ได้: ~25–45 มล.", "อุณหภูมิ: 90–95°C", "ความดัน: 8–9.5 bar", "เวลา: 23–33 วิ"];
  if (method === "drip") return ["กาแฟ: 12–20 กรัม", "น้ำ: 200–360 มล.", "อุณหภูมิ: 91–94°C", "เวลาโดยรวม: 150–240 วิ"];
  if (method === "frenchpress") return ["กาแฟ: 16–22 กรัม", "น้ำ: 220–360 มล.", "อุณหภูมิ: 90–94°C", "แช่: 3–5 นาที"];
  return ["กาแฟ: 16–18 กรัม", "น้ำ: 95–115 มล.", "ไฟ: 5–7 /10", "เวลา: 90–130 วิ"];
}
