import { BASE_FLAVOR_INTENTS } from "./constants";
import { clamp, round1 } from "./utils";

export function makeSummaryForUser(p, mokaSpec) {
  const intentLabel =
    mokaSpec?.flavorGuides?.[p.intent]?.label ||
    (BASE_FLAVOR_INTENTS.find((x) => x.id === p.intent)?.label ?? "รสชาติสมดุล");

  const isEsp = p.method === "espresso";
  const ratio   = round1(p.water / Math.max(1, p.dose));
  const effTime = p.actualTimeSec ?? p.targetTime;
  const strength =
    ratio <= (isEsp ? 2.0 : 6.0) ? "เข้ม" :
    ratio <= (isEsp ? 3.0 : 8.0) ? "กลาง" : "บาง/ใส";

  const tdsPct  = isEsp ? clamp(round1(14 / ratio), 6, 12) : clamp(round1(5.2 / ratio), 1.1, 3.2);
  const yieldMl = Math.round((isEsp ? 1.0 : 0.85) * p.water);
  const extraction =
    effTime < (isEsp ? 22 : 90)  ? "อ่อน" :
    effTime > (isEsp ? 35 : 140) ? "มาก"  : "กำลังดี";

  const tol = Math.max(5, Math.round((p.targetTime || effTime) * 0.08));
  let timing = "ตรงเป้า";
  if (p.actualTimeSec && p.targetTime) {
    if (p.actualTimeSec < p.targetTime - tol) timing = "เร็วกว่าเป้า";
    else if (p.actualTimeSec > p.targetTime + tol) timing = "ช้ากว่าเป้า";
  }

  const flavorTags =
    p.intent === "bright" ? ["ผลไม้/ซิตรัส", "หอมสด", "หวานปลายใส"] :
    p.intent === "bold"   ? ["ช็อกโกแลต", "นัตตี้", "เข้มหนา"] :
                            ["บาลานซ์", "คาราเมล", "นุ่มลื่น"];

  const nextTimeTips = [];
  if (extraction === "อ่อน") nextTimeTips.push("ยืดเวลาอีกนิด หรือเพิ่มไฟเล็กน้อย");
  if (extraction === "มาก")  nextTimeTips.push("หยุดให้เร็วขึ้น หรือ ลดไฟเล็กน้อย");
  if (p.heat >= 9)           nextTimeTips.push("ไฟแรงไปนิด ลองลดลง 1 ระดับ");
  if (p.overpack)            nextTimeTips.push("แน่นไปหน่อย ลองอัดเบาลง");

  const caffeineMg = Math.round(p.dose * (p.beanType === "robusta" ? 22 : 11));
  const caloriesKcal = Math.round((p.water / 100) * 2);

  return {
    intent: intentLabel, intentId: p.intent,
    ratio, strength, yieldMl, tdsPct, extraction,
    targetTimeSec: p.targetTime, actualTimeSec: effTime,
    timing, flavorTags,
    serve: isEsp ? "ดื่มเป็นช็อต หรือเติมนม 1:1–1:2" : "จิบเดี่ยว ๆ หรือเติมนมเล็กน้อยได้",
    headline: `ชงสำเร็จใน ~${effTime} วิ`,
    subline:  `สไตล์ ${intentLabel} • ความเข้ม ${strength} • สัดส่วน ~1:${ratio}`,
    moveTips: nextTimeTips,
    doseGram: p.dose, waterMl: p.water, heatLevel: p.heat, grind: p.grind, method: p.method,
    beanType: p.beanType || "arabica",
    beanLabel: p.beanType,
    caffeineMg, caloriesKcal,
  };
}
