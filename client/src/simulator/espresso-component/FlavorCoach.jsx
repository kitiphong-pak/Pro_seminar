import { methodRanges } from "./utils";

export function FlavorCoach({ intent, params, methodSpec }) {
  const intentLabel =
    methodSpec?.flavorGuides?.[intent]?.label ||
    (intent === "bright" ? "สว่าง สดฉ่ำ (Bright)" : intent === "bold" ? "เข้ม หนืด (Bold)" : "สมดุล (Balanced)");

  const t = methodSpec?.flavorGuides?.[intent]?.targets || {};
  const DEF = {
    bright:   { ratio: "1:6–1:7",    time: "90–105 วิ",  heat: "5–6/10" },
    balanced: { ratio: "1:5.5–1:6.5", time: "100–120 วิ", heat: "5–7/10" },
    bold:     { ratio: "1:5–1:5.5",   time: "110–130 วิ", heat: "6–7/10" },
  }[intent] || { ratio: "—", time: "—", heat: "—" };

  const ratioTxt = t.ratio || DEF.ratio;
  const timeTxt  = t.time  || DEF.time;
  const heatTxt  = t.heat  || DEF.heat;

  const BULLETS = {
    bright: [
      "โทนใส สดชื่น หวานปลาย",
      `ใช้น้ำมากขึ้น 20-30 มล.`,
      `ไฟ ${heatTxt} • เวลา ${timeTxt}`,
      "ถ้าเริ่มขม ให้ลดไฟลงนิดเดียว",
    ],
    balanced: [
      "รสกลมกล่อม ดื่มง่าย",
      `อัตราส่วน ${ratioTxt}`,
      `ไฟ ${heatTxt} • เวลา ${timeTxt}`,
      "ถ้าเปรี้ยวไป → เพิ่มเวลาเล็กน้อย / ถ้าขมไป → ลดไฟเล็กน้อย",
    ],
    bold: [
      "เข้มหนา กลิ่นช็อกโกแลต/นัตชัด",
      `ผงกาแฟ 16 กรัม : น้ำ 95 มล.`,
      `ไฟ ${heatTxt} • เวลา ${timeTxt}`,
      "ถ้าขมปลาย → ลดไฟครึ่ง-หนึ่งสเต็ป",
    ],
  }[intent] || [];

  const ranges = methodRanges(params.method, methodSpec);

  return (
    <div className="space-y-3 text-sm">
      <div className="rounded-xl bg-[#f9f7f4] p-3">
        <div className="font-semibold mb-1">{intentLabel}</div>
        <ul className="list-disc list-inside leading-relaxed">
          {BULLETS.map((x, i) => <li key={i}>{x}</li>)}
        </ul>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-3">
        <div className="font-semibold mb-1">ช่วงค่าที่แนะนำของวิธีนี้</div>
        <ul className="text-sm space-y-1">
          {ranges.map((r, i) => <li key={i}>{r}</li>)}
        </ul>
      </div>
    </div>
  );
}
