import { useState } from "react";
import { methodLabel } from "./utils";

export function RecipeCard({ recipe, method }) {
  const [stepsOpen, setStepsOpen] = useState(false);

  if (!recipe) return null;

  const profile = recipe.methodProfiles?.[method];
  const note    = profile?.notes || null;

  return (
    <div className="rounded-2xl border border-amber-200 bg-white/90 backdrop-blur p-4 shadow-[0_12px_28px_rgba(180,83,9,0.10)] mb-4 space-y-3">
      {/* Header: ชื่อเมนู + วิธีที่เลือก */}
      <div className="flex items-start gap-3">
        {recipe.img && (
          <img
            src={recipe.img}
            alt={recipe.name}
            className="h-14 w-14 rounded-xl object-cover shrink-0 border border-amber-100"
          />
        )}
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-widest text-amber-700/70">กำลังทำเมนู</div>
          <div className="font-bold text-[#7a4112] text-base leading-tight">{recipe.name}</div>
          <div className="text-xs text-[#2a1c14]/60 mt-0.5">วิธีชง: {methodLabel(method)}</div>
        </div>
      </div>

      {/* Notes จาก methodProfile */}
      {note && (
        <div className="rounded-xl bg-amber-50 border border-amber-100 px-3 py-2 text-xs text-[#7a4112] leading-relaxed">
          <span className="font-semibold">ทิปของเมนูนี้: </span>{note}
        </div>
      )}

      {/* ส่วนผสม */}
      {Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0 && (
        <div>
          <div className="text-xs font-semibold text-[#2a1c14]/80 mb-1">ส่วนผสม</div>
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

      {/* ขั้นตอนจริง (collapsible) */}
      {Array.isArray(recipe.stepsAll) && recipe.stepsAll.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setStepsOpen((v) => !v)}
            className="flex items-center gap-1 text-xs font-semibold text-[#7a4112] hover:text-[#5b3e2c]"
          >
            <span>{stepsOpen ? "▾" : "▸"}</span>
            <span>ขั้นตอนอ้างอิง ({recipe.stepsAll.length} ขั้น)</span>
          </button>

          {stepsOpen && (
            <ol className="mt-2 space-y-1 pl-1">
              {recipe.stepsAll.map((step, i) => (
                <li key={i} className="flex gap-2 text-xs text-[#2a1c14]/70">
                  <span className="shrink-0 font-semibold text-amber-600">{i + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
    </div>
  );
}
