import { useState } from "react";
import { methodLabel } from "./utils";

const METHOD_STEPS = {
  moka: [
    "เติมน้ำร้อนลงในหม้อส่วนล่าง (อย่าเกินวาล์วนิรภัย)",
    "ใส่ผงกาแฟบดละเอียด-กลางลงในกรวยกรอง (อย่ากดแน่น)",
    "ประกอบหม้อให้แน่นสนิท",
    "วางบนไฟกลาง-เล็ก",
    "รอกาแฟไหลขึ้น ได้ยินเสียงกุรกุร",
    "ลดไฟหรือยกลงทันที เพื่อเลี่ยงกาแฟไหม้",
    "เทใส่แก้ว เสิร์ฟ",
  ],
  espresso: [
    "อุ่นเครื่องและ flush ด้วยน้ำร้อน (ถ้าทำได้)",
    "บดกาแฟละเอียด ตวง 7–9 กรัม",
    "ใส่ผงลงพอร์ทาฟิลเตอร์ แทมป์ให้แน่นสม่ำเสมอ",
    "ล็อคพอร์ทาฟิลเตอร์เข้าเครื่อง",
    "สกัด 25–30 วินาที ได้ประมาณ 25–30 มล.",
    "เทใส่แก้ว เสิร์ฟทันที",
  ],
  drip: [
    "พับกระดาษกรองใส่ดริปเปอร์ ล้างด้วยน้ำร้อน",
    "ใส่กาแฟบดกลาง–หยาบ",
    "เทน้ำ ~30 กรัมเพื่อ bloom รอ 30 วิ",
    "เทน้ำทีละส่วน 2–3 พัลส์ วนเป็นวงกลม",
    "รอน้ำซึมผ่านหมด รวมเวลา ~3 นาที",
    "ยกดริปเปอร์ออก เสิร์ฟ",
  ],
  frenchpress: [
    "อุ่นแก้วเฟรนช์เพรสด้วยน้ำร้อน แล้วเททิ้ง",
    "ใส่กาแฟบดหยาบ",
    "เทน้ำร้อน 90–94°C คนเบาๆ",
    "ปิดฝา รอแช่ 3–5 นาที",
    "กด plunger ลงช้าๆ สม่ำเสมอ",
    "เทใส่แก้วทันที (อย่าทิ้งค้างไว้) เสิร์ฟ",
  ],
};

export function RecipeCoach({ recipe, method }) {
  const [tipOpen, setTipOpen] = useState(false);

  const profile   = recipe?.methodProfiles?.[method];
  const note      = profile?.notes || null;
  const steps     = profile?.steps || METHOD_STEPS[method] || recipe?.stepsAll || [];

  return (
    <div className="space-y-3">
      {/* Recipe header */}
      {recipe && (
        <div className="flex items-center gap-3">
          {recipe.img && (
            <img
              src={recipe.img}
              alt={recipe.name}
              className="h-11 w-11 rounded-xl object-cover shrink-0 border border-amber-100"
            />
          )}
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-widest text-amber-700/70">กำลังทำเมนู</div>
            <div className="text-sm font-bold text-[#7a4112] leading-tight truncate">{recipe.name}</div>
            <div className="text-xs text-[#2a1c14]/60">วิธีชง: {methodLabel(method)}</div>
          </div>
        </div>
      )}

      {/* Ingredients */}
      {recipe?.ingredients?.length > 0 && (
        <div>
          <div className="text-xs font-semibold text-[#2a1c14]/70 mb-1">ส่วนผสม</div>
          <ul className="space-y-0.5">
            {recipe.ingredients.map((ing, i) => (
              <li key={i} className="text-xs text-[#2a1c14]/70 flex gap-1.5">
                <span className="text-amber-500 shrink-0">•</span>
                <span>{ing}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Steps — always visible */}
      {steps.length > 0 && (
        <div>
          <div className="text-xs font-semibold text-[#2a1c14]/70 mb-1">
            ขั้นตอน ({methodLabel(method)})
          </div>
          <ol className="space-y-1">
            {steps.map((step, i) => (
              <li key={i} className="flex gap-1.5 text-xs text-[#2a1c14]/70">
                <span className="shrink-0 font-semibold text-amber-600">{i + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Tip — hidden by default */}
      {note && (
        <div>
          <button
            type="button"
            onClick={() => setTipOpen((v) => !v)}
            className="flex items-center gap-1 text-xs font-semibold text-amber-700 hover:text-amber-900"
          >
            <span>{tipOpen ? "▾" : "▸"}</span>
            <span>{tipOpen ? "ซ่อนทิป" : "ดูทิป"}</span>
          </button>
          {tipOpen && (
            <div className="mt-1 rounded-xl bg-amber-50 border border-amber-100 px-3 py-2 text-xs text-[#7a4112] leading-relaxed">
              {note}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
