import { useEffect, useMemo, useRef, useState } from "react";
import Navbar from "../components/Navbar";
import FetchError from "../components/FetchError";
import StepCard from "./StepCard";
import { fetchSimEquipment, fetchSimMenusByEquipment, fetchSimNutrition } from "../api/contentApi";

// ─── Flavor calculation ───────────────────────────────────────────────────────

function applyFlavorImpact(flavor, step, value) {
  if (!step.flavorImpact || !step.variable) return flavor;
  const { min, max } = step;
  const d = step.default ?? (min + max) / 2;
  if (typeof min !== "number" || typeof max !== "number") return flavor;
  const n = value >= d
    ? max > d ? (value - d) / (max - d) : 0
    : min < d ? (value - d) / (d - min) : 0;
  const result = { ...flavor };
  for (const [k, w] of Object.entries(step.flavorImpact)) {
    result[k] = Math.max(0, Math.min(5, (result[k] ?? 0) + w * n));
  }
  return result;
}

function calcFlavor(equipment, menu, variables) {
  let f = { ...menu.flavorBase };
  for (const step of [...(equipment?.steps ?? []), ...(menu?.addOnSteps ?? [])]) {
    f = applyFlavorImpact(f, step, variables[step.variable] ?? step.default);
  }
  return f;
}

function calcNutrition(menu, variables, nut) {
  const b = { ...menu.nutritionBase };
  const milkMl = variables.milkAmount ?? 0;
  if (milkMl && nut.milk_per_100ml) {
    const r = milkMl / 100;
    b.calories += nut.milk_per_100ml.calories * r;
    b.fat = (b.fat ?? 0) + nut.milk_per_100ml.fat * r;
  }
  const choc = variables.chocolateAmount ?? 0;
  if (choc && nut.chocolate_sauce_per_tbsp) {
    b.calories += nut.chocolate_sauce_per_tbsp.calories * choc;
    b.fat = (b.fat ?? 0) + nut.chocolate_sauce_per_tbsp.fat * choc;
  }
  if (variables.hasWhippedCream && nut.whipped_cream_per_tbsp) {
    b.calories += nut.whipped_cream_per_tbsp.calories * 2;
    b.fat = (b.fat ?? 0) + nut.whipped_cream_per_tbsp.fat * 2;
  }
  if (variables.waterRatio) b.water = (b.water ?? 30) + 30 * variables.waterRatio;
  return {
    calories: Math.round(b.calories ?? 0),
    caffeine: Math.round(b.caffeine ?? 0),
    fat: Math.round((b.fat ?? 0) * 10) / 10,
    water: Math.round(b.water ?? 0),
  };
}

function getRecommendation(f) {
  if (f.bitterness > 3.8) return "กาแฟขมเกิน ลองลดปริมาณกาแฟหรือลดอุณหภูมิน้ำลง 2–3°C";
  if (f.sourness > 3.8)   return "กาแฟเปรี้ยวเกิน ลองเพิ่มอุณหภูมิน้ำหรือชงนานขึ้น";
  if (f.sweetness > 4.5)  return "หวานไปนิดหน่อย ลองลดนมหรือซอสช็อกโกแลตลง";
  if (f.body < 1.5)       return "บอดี้เบาไปหน่อย ลองเพิ่มปริมาณกาแฟหรือบดให้ละเอียดขึ้น";
  return "สูตรนี้สมดุลดี ลองจดไว้ใช้ครั้งหน้า";
}

const FLAVOR_META = [
  { key: "sweetness",  label: "ความหวาน",    color: "#d97706" },
  { key: "bitterness", label: "ความขม",       color: "#7b4b29" },
  { key: "sourness",   label: "ความเปรี้ยว",  color: "#16a34a" },
  { key: "body",       label: "บอดี้",         color: "#7c3aed" },
  { key: "aroma",      label: "กลิ่นหอม",     color: "#db2777" },
];

// ─── Progress indicator ───────────────────────────────────────────────────────

function SimProgress({ steps, currentIdx }) {
  if (!steps.length) return null;
  return (
    <div className="relative flex items-start justify-between max-w-2xl mx-auto px-2">
      <div className="absolute top-4 left-6 right-6 h-0.5 bg-[#e0d8ce]" />
      <div
        className="absolute top-4 left-6 h-0.5 bg-gradient-to-r from-[#7b4b29] to-[#c47a3a] transition-[width] duration-500"
        style={{ width: `calc(${steps.length > 1 ? (currentIdx / (steps.length - 1)) * 100 : 0}% - ${steps.length > 1 ? 48 / steps.length : 0}px)` }}
      />
      {steps.map((step, i) => {
        const done = i < currentIdx;
        const active = i === currentIdx;
        return (
          <div key={step.id} className="relative z-10 flex flex-col items-center gap-1.5">
            <div className={[
              "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300",
              done   ? "bg-[#7b4b29] border-[#7b4b29] text-white scale-95" :
              active ? "bg-white border-[#7b4b29] text-[#7b4b29] ring-4 ring-[#7b4b29]/20 scale-110 shadow-sm" :
                       "bg-white border-[#e0d8ce] text-[#c5bab3]",
            ].join(" ")}>
              {done ? "✓" : i + 1}
            </div>
            <span className={[
              "text-[9px] text-center leading-tight max-w-[44px]",
              active ? "text-[#7b4b29] font-bold" : "text-[#c5bab3]",
            ].join(" ")}>
              {step.title.length > 10 ? step.title.slice(0, 10) + "…" : step.title}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Animated flavor bar ──────────────────────────────────────────────────────

function FlavorBar({ label, value, color, delayMs }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), delayMs);
    return () => clearTimeout(t);
  }, [delayMs]);
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-[#5c4033]/70 w-24 shrink-0">{label}</span>
      <div className="flex-1 h-3 rounded-full bg-[#f0e8df] overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: ready ? `${(value / 5) * 100}%` : "0%",
            background: color,
            transition: `width 0.9s cubic-bezier(0.34,1.56,0.64,1)`,
          }}
        />
      </div>
      <span className="text-xs font-bold w-8 text-right" style={{ color }}>{value.toFixed(1)}</span>
    </div>
  );
}

// ─── Result screen ────────────────────────────────────────────────────────────

function ResultScreen({ equipment, menu, flavor, nutrition, onRestart }) {
  const rec = getRecommendation(flavor);
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6" style={{ animation: "brewFadeUp 0.5s ease-out both" }}>
      {/* Trophy header */}
      <div className="text-center space-y-1">
        <div className="text-6xl" style={{ animation: "brewFloat 3s ease-in-out infinite" }}>☕</div>
        <h1 className="text-2xl font-extrabold text-[#3d2010] mt-2">{menu.nameTh} สำเร็จ!</h1>
        <p className="text-sm text-[#5c4033]/60">ชงด้วย {equipment.nameTh}</p>
      </div>

      {/* Flavor profile */}
      <div className="bg-white rounded-3xl shadow-md ring-1 ring-black/5 p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-bold text-[#3d2010]">Flavor Profile</span>
          <span className="text-[10px] text-[#5c4033]/40 bg-[#f0e8df] px-2 py-0.5 rounded-full">คะแนน 0–5</span>
        </div>
        {FLAVOR_META.map(({ key, label, color }, i) => (
          <FlavorBar key={key} label={label} value={flavor[key] ?? 0} color={color} delayMs={i * 120} />
        ))}
      </div>

      {/* Nutrition */}
      <div className="bg-white rounded-3xl shadow-md ring-1 ring-black/5 p-6">
        <p className="text-sm font-bold text-[#3d2010] mb-4">โภชนาการ (ต่อแก้ว)</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          {[
            { label: "แคลอรี่", value: nutrition.calories, unit: "kcal", emoji: "🔥" },
            { label: "คาเฟอีน", value: nutrition.caffeine, unit: "mg",   emoji: "⚡" },
            { label: "ไขมัน",   value: nutrition.fat,      unit: "g",    emoji: "🥛" },
            { label: "น้ำ",     value: nutrition.water,    unit: "ml",   emoji: "💧" },
          ].map((item, i) => (
            <div
              key={item.label}
              className="bg-[#f7efe6] rounded-2xl p-3"
              style={{ animation: `brewFadeUp 0.4s ease-out ${i * 0.08}s both` }}
            >
              <div className="text-xl mb-1">{item.emoji}</div>
              <p className="text-lg font-extrabold text-[#3d2010]">{item.value}</p>
              <p className="text-[10px] text-[#5c4033]/50">{item.unit}</p>
              <p className="text-[10px] text-[#5c4033]/40">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendation */}
      <div
        className="bg-[#fff7ec] border border-[#e8c88a] rounded-2xl px-5 py-4 text-sm text-[#7b4b29] leading-relaxed"
        style={{ animation: "brewFadeUp 0.5s ease-out 0.5s both" }}
      >
        <p className="font-bold mb-1">💡 ครั้งต่อไปลองปรับ:</p>
        <p>{rec}</p>
      </div>

      {/* Restart */}
      <button
        onClick={onRestart}
        className="w-full py-4 rounded-2xl bg-[#7b4b29] text-white font-extrabold text-base hover:bg-[#5c3a1e] transition shadow-lg active:scale-[.98]"
        style={{ animation: "brewFadeUp 0.5s ease-out 0.6s both" }}
      >
        ☕ ชงอีกครั้ง
      </button>
    </div>
  );
}

// ─── Equipment card ───────────────────────────────────────────────────────────

function EquipmentCard({ eq, onSelect, selecting }) {
  const isSelecting = selecting === eq.id;
  // ถ้ารูปโหลดไม่ขึ้น ให้ตกกลับไปใช้ emoji เหมือนเดิม
  const [imgFailed, setImgFailed] = useState(false);
  const showImg = !!eq.image && !imgFailed;
  return (
    <button
      onClick={() => onSelect(eq)}
      className={[
        "group bg-white rounded-3xl shadow-md ring-1 text-left overflow-hidden transition-all duration-300 active:scale-[.97]",
        isSelecting
          ? "ring-[#7b4b29] shadow-xl scale-[1.03] bg-[#fdf7f2]"
          : "ring-black/5 hover:ring-[#7b4b29]/40 hover:shadow-xl hover:scale-[1.01]",
      ].join(" ")}
    >
      {/* รูปอุปกรณ์จริง */}
      <div className="relative h-44 bg-gradient-to-br from-[#f0e4d0] to-[#d9c4aa] flex items-center justify-center overflow-hidden">
        <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-white/15" />
        <div className="absolute -bottom-6 -left-6 w-20 h-20 rounded-full bg-white/10" />

        {showImg ? (
          <>
            {/* ฉากหลังเบลอจากรูปเดียวกัน — เติมกรอบให้เต็มโดยไม่ต้องครอปตัวอุปกรณ์ */}
            <img
              src={eq.image}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover blur-xl scale-125 opacity-45"
            />
            {/* object-contain เพราะรูปอุปกรณ์เป็นแนวตั้ง/จัตุรัส
               ถ้าใช้ cover จะครอปจนเครื่องชงโดนตัดหัวตัดท้าย */}
            <img
              src={eq.image}
              alt={eq.nameTh}
              onError={() => setImgFailed(true)}
              className={[
                "absolute inset-0 w-full h-full object-contain object-center p-2 drop-shadow-lg",
                "transition-transform duration-500",
                isSelecting ? "scale-105" : "group-hover:scale-[1.04]",
              ].join(" ")}
            />
            <span className="absolute bottom-2 left-2.5 text-lg bg-white/70 backdrop-blur rounded-full w-8 h-8 flex items-center justify-center shadow-sm">
              {eq.emoji}
            </span>
          </>
        ) : (
          <span
            className="text-5xl relative z-10"
            style={isSelecting ? { animation: "brewFloat 0.8s ease-in-out" } : {}}
          >
            {eq.emoji}
          </span>
        )}
        {isSelecting && (
          <div className="absolute inset-0 bg-[#7b4b29]/10 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-[#7b4b29] border-t-transparent" style={{ animation: "brewSpinSlow 0.7s linear infinite" }} />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 space-y-2">
        <h3 className="font-extrabold text-[#3d2010] text-base">{eq.nameTh}</h3>
        <p className="text-xs text-[#5c4033]/65 leading-relaxed">{eq.description}</p>
        <div className="flex flex-wrap gap-1.5 pt-1">
          <span className="bg-[#f0e4d0] text-[#5c3a1e] text-[10px] px-2.5 py-0.5 rounded-full font-medium">🌀 {eq.grind}</span>
          <span className="bg-[#f0e4d0] text-[#5c3a1e] text-[10px] px-2.5 py-0.5 rounded-full font-medium">🌡 {eq.waterTemp}</span>
        </div>
        <div className="flex items-center gap-1 pt-1">
          <span className="text-[10px] text-[#5c4033]/40">{eq.steps?.length ?? 0} ขั้นตอน</span>
          {eq.resultType === "espresso" && (
            <span className="ml-auto text-[10px] bg-[#3d2010] text-white px-2 py-0.5 rounded-full">เมนูต่อยอดได้</span>
          )}
        </div>
      </div>
    </button>
  );
}

// ─── Menu card ────────────────────────────────────────────────────────────────

const MENU_EMOJI = {
  espresso: "☕",  americano: "🥤",  latte: "🥛",
  cappuccino: "☕", mocha: "🍫",      macchiato: "☕",
  drip_coffee: "🫗", french_press_coffee: "🧉", moka_coffee: "☕",
};

function MenuCard({ menu, onSelect }) {
  return (
    <button
      onClick={() => onSelect(menu)}
      className="bg-white rounded-2xl shadow ring-1 ring-black/5 overflow-hidden text-left hover:ring-[#7b4b29]/40 hover:shadow-md transition-all active:scale-[.97] group"
    >
      <div className="h-24 bg-gradient-to-br from-[#f0e4d0] to-[#d9c4aa] flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[#7b4b29]/0 group-hover:bg-[#7b4b29]/5 transition" />
        <span className="text-4xl" style={{ animation: "brewFloat 4s ease-in-out infinite" }}>
          {MENU_EMOJI[menu.id] || "☕"}
        </span>
      </div>
      <div className="p-3">
        <p className="font-bold text-[#3d2010] text-sm">{menu.nameTh}</p>
        {menu.addOnSteps?.length > 0 && (
          <p className="text-[10px] text-[#5c4033]/45 mt-0.5">+{menu.addOnSteps.length} ขั้นตอนเพิ่ม</p>
        )}
      </div>
    </button>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function BrewSimulator() {
  const [equipmentList, setEquipmentList] = useState([]);
  const [menuList, setMenuList] = useState([]);
  const [nutritionData, setNutritionData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [fetchSignal, setFetchSignal] = useState(0);

  const [phase, setPhase] = useState("equipment_select");
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [variables, setVariables] = useState({});
  const [stepDone, setStepDone] = useState(false);
  const [selecting, setSelecting] = useState(null); // equipment id being selected (brief animation)

  const topRef = useRef(null);

  useEffect(() => {
    setLoading(true); setError(false);
    Promise.all([fetchSimEquipment(), fetchSimNutrition()])
      .then(([eq, nut]) => { setEquipmentList(eq); setNutritionData(nut); })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [fetchSignal]);

  const initDefaults = (steps = []) => {
    const d = {};
    for (const s of steps) {
      if (s.variable && s.default !== undefined) d[s.variable] = s.default;
    }
    return d;
  };

  const handleSelectEquipment = (eq) => {
    setSelecting(eq.id);
    setTimeout(() => {
      setSelectedEquipment(eq);
      setVariables(initDefaults(eq.steps));
      setCurrentStepIdx(0);
      setStepDone(false);
      setSelecting(null);
      setPhase("brew_steps");
      topRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 500);
  };

  const handleSelectMenu = (menu) => {
    setSelectedMenu(menu);
    setVariables((p) => ({ ...p, ...initDefaults(menu.addOnSteps) }));
    setCurrentStepIdx(0);
    setStepDone(false);
    setPhase(menu.addOnSteps?.length > 0 ? "addon_steps" : "result");
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleVariableChange = (key, val) => setVariables((p) => ({ ...p, [key]: val }));

  const currentSteps =
    phase === "brew_steps"  ? (selectedEquipment?.steps ?? []) :
    phase === "addon_steps" ? (selectedMenu?.addOnSteps ?? []) : [];

  const allProgressSteps = [
    ...(selectedEquipment?.steps ?? []),
    ...(selectedMenu?.addOnSteps ?? []),
  ];
  const progressIdx =
    phase === "brew_steps"  ? currentStepIdx :
    phase === "addon_steps" ? (selectedEquipment?.steps?.length ?? 0) + currentStepIdx : -1;

  const currentStep = currentSteps[currentStepIdx];

  const isStepReady = useMemo(() => {
    if (!currentStep) return false;
    const t = currentStep.interactionType;
    // interaction ที่ "ตั้งค่า" ไปต่อได้ทันที ส่วนที่ "ต้องลงมือ" ต้องรอ stepDone
    const isValueType =
      t === "slider" || t === "choice" || t === "drag" ||
      (t === "pour" && currentStep.max != null);
    return isValueType ? true : stepDone;
  }, [currentStep, stepDone]);

  const handleNext = () => {
    if (currentStepIdx < currentSteps.length - 1) {
      setCurrentStepIdx((i) => i + 1);
      setStepDone(false);
      topRef.current?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    if (phase === "brew_steps") {
      if (selectedEquipment?.resultType === "espresso") {
        fetchSimMenusByEquipment(selectedEquipment.id).then(setMenuList).catch(() => setMenuList([]));
        setPhase("menu_select");
      } else {
        fetchSimMenusByEquipment(selectedEquipment.id)
          .then((m) => { if (m[0]) { setSelectedMenu(m[0]); setPhase("result"); } })
          .catch(() => {});
      }
    } else if (phase === "addon_steps") {
      setPhase("result");
    }
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleRestart = () => {
    setPhase("equipment_select");
    setSelectedEquipment(null);
    setSelectedMenu(null);
    setMenuList([]);
    setCurrentStepIdx(0);
    setVariables({});
    setStepDone(false);
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleBack = () => {
    if (phase === "brew_steps" && currentStepIdx === 0) { handleRestart(); return; }
    if (phase === "brew_steps") { setCurrentStepIdx((i) => i - 1); setStepDone(false); return; }
    if (phase === "menu_select") { setPhase("brew_steps"); setCurrentStepIdx((selectedEquipment?.steps?.length ?? 1) - 1); return; }
    if (phase === "addon_steps" && currentStepIdx === 0) { setPhase("menu_select"); return; }
    if (phase === "addon_steps") { setCurrentStepIdx((i) => i - 1); setStepDone(false); }
  };

  const flavor = useMemo(() => {
    if (!selectedEquipment || !selectedMenu) return null;
    return calcFlavor(selectedEquipment, selectedMenu, variables);
  }, [selectedEquipment, selectedMenu, variables]);

  const nutrition = useMemo(() => {
    if (!selectedMenu) return null;
    return calcNutrition(selectedMenu, variables, nutritionData);
  }, [selectedMenu, variables, nutritionData]);

  if (loading) return (
    <div className="bg-[#f3f1ec] min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow flex items-center justify-center">
        <div className="space-y-4 w-full max-w-lg px-4">
          <div className="h-5 rounded-full bg-[#e0d8ce] animate-pulse w-1/2 mx-auto" />
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-48 rounded-3xl bg-[#e0d8ce] animate-pulse" />)}
          </div>
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="bg-[#f3f1ec] min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow flex items-center justify-center">
        <FetchError onRetry={() => setFetchSignal((s) => s + 1)} />
      </div>
    </div>
  );

  return (
    <div className="bg-[#f3f1ec] min-h-screen" ref={topRef}>
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <header className="bg-gradient-to-r from-[#3d2010] via-[#7b4b29] to-[#c47a3a] py-7 text-center text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 50%, white 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="relative z-10">
          <p className="text-xs uppercase tracking-[0.2em] text-white/50 mb-1">Brew Simulator</p>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">ลองชงกาแฟ</h1>
          <p className="mt-1 text-white/60 text-sm">เลือกอุปกรณ์ → ทำตามขั้นตอน → ดูผล Flavor Profile</p>
        </div>
      </header>

      {/* ── Phase breadcrumb ──────────────────────────────────────── */}
      {phase !== "equipment_select" && (
        <div className="sticky top-0 z-30 bg-[#f3f1ec]/90 backdrop-blur border-b border-black/5 shadow-sm">
          <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
            <button onClick={handleBack} className="text-[#7b4b29] hover:text-[#3d2010] transition text-sm font-medium flex items-center gap-1">
              ← ย้อนกลับ
            </button>
            <div className="flex-1 min-w-0 flex items-center gap-2 overflow-hidden text-xs text-[#5c4033]/50 whitespace-nowrap">
              <span>{selectedEquipment?.emoji} {selectedEquipment?.nameTh}</span>
              {selectedMenu && <><span>/</span><span>{selectedMenu?.nameTh}</span></>}
            </div>
          </div>
        </div>
      )}

      <main className="max-w-3xl mx-auto w-full px-4 py-8">

        {/* ── Equipment select ─────────────────────────────────────── */}
        {phase === "equipment_select" && (
          <div className="space-y-6" style={{ animation: "brewFadeUp 0.4s ease-out both" }}>
            <div className="text-center">
              <h2 className="text-xl font-bold text-[#3d2010]">เลือกอุปกรณ์ที่จะใช้ชง</h2>
              <p className="text-sm text-[#5c4033]/60 mt-1">แต่ละอุปกรณ์ให้รสชาติที่แตกต่างกัน</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {equipmentList.map((eq) => (
                <EquipmentCard key={eq.id} eq={eq} onSelect={handleSelectEquipment} selecting={selecting} />
              ))}
            </div>
          </div>
        )}

        {/* ── Brew Steps ───────────────────────────────────────────── */}
        {(phase === "brew_steps" || phase === "addon_steps") && currentStep && (
          <div className="space-y-5">
            {/* Phase label */}
            <div className="text-center">
              <span className="bg-[#3d2010] text-white text-[10px] uppercase tracking-widest px-3 py-1 rounded-full">
                {phase === "brew_steps" ? `ระดับ 1: ชง ${selectedEquipment?.nameTh}` : `ระดับ 2: ทำ ${selectedMenu?.nameTh}`}
              </span>
            </div>

            {/* Progress */}
            <SimProgress
              steps={allProgressSteps.length > 0 ? allProgressSteps : currentSteps}
              currentIdx={progressIdx >= 0 ? progressIdx : currentStepIdx}
            />

            {/* Step card — key triggers remount → animation */}
            <div key={`${phase}-${currentStepIdx}`}>
              <StepCard
                step={currentStep}
                stepNumber={currentStepIdx + 1}
                totalSteps={currentSteps.length}
                variables={variables}
                onVariableChange={handleVariableChange}
                onStepDone={() => setStepDone(true)}
                stepDone={stepDone}
                equipment={selectedEquipment}
              />
            </div>

            {/* Next button */}
            <button
              onClick={handleNext}
              disabled={!isStepReady}
              className={[
                "w-full py-4 rounded-2xl text-base font-extrabold transition-all duration-300",
                isStepReady
                  ? "bg-gradient-to-r from-[#7b4b29] to-[#a0622a] text-white shadow-lg hover:shadow-xl active:scale-[.98]"
                  : "bg-[#e0d8ce] text-[#c5bab3] cursor-not-allowed",
              ].join(" ")}
              style={isStepReady ? { animation: "brewPulseRing 3s ease-in-out infinite" } : {}}
            >
              {currentStepIdx < currentSteps.length - 1
                ? "ถัดไป →"
                : phase === "brew_steps" && selectedEquipment?.resultType === "espresso"
                ? "เลือกเมนู →"
                : "ดูผลลัพธ์ →"}
            </button>
          </div>
        )}

        {/* ── Menu select ──────────────────────────────────────────── */}
        {phase === "menu_select" && (
          <div className="space-y-6" style={{ animation: "brewFadeUp 0.4s ease-out both" }}>
            <div className="text-center">
              <p className="text-xs text-[#5c4033]/50 uppercase tracking-widest mb-1">ระดับ 2</p>
              <h2 className="text-xl font-bold text-[#3d2010]">เลือกเมนูที่จะทำ</h2>
              <p className="text-sm text-[#5c4033]/50 mt-1">Espresso ที่ชงแล้วรองรับเมนูเหล่านี้</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {menuList.map((menu) => (
                <MenuCard key={menu.id} menu={menu} onSelect={handleSelectMenu} />
              ))}
            </div>
          </div>
        )}

        {/* ── Result ───────────────────────────────────────────────── */}
        {phase === "result" && flavor && nutrition && (
          <ResultScreen
            equipment={selectedEquipment}
            menu={selectedMenu}
            flavor={flavor}
            nutrition={nutrition}
            onRestart={handleRestart}
          />
        )}

      </main>
    </div>
  );
}
