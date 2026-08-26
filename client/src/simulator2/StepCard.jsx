import { useEffect, useRef, useState, useCallback } from "react";
import { Coffee, Lightbulb } from "lucide-react";
import { DragDoseInteraction, PressInteraction, PourInteraction } from "./interactions";

// ─── Illustration area ────────────────────────────────────────────────────────

function StepIllustration({ step, equipment, dropRef, isDropActive, isOver, fillPct = 0 }) {
  const [imgFailed, setImgFailed] = useState(false);
  const showImg = !!equipment?.image && !imgFailed;

  // Steam lines for heat/brew steps
  const showSteam = ["brew", "heat", "steam_milk", "steam_milk_mocha", "steam_foam", "steep"].includes(step.id);

  return (
    <div
      ref={dropRef}
      className={[
        "relative rounded-3xl overflow-hidden h-52 sm:h-64 lg:h-full lg:min-h-[340px]",
        "bg-gradient-to-br from-[#f0e4d0] via-[#e8d5b0] to-[#d4b896]",
        "flex flex-col items-center justify-center select-none transition-all duration-200",
        isOver ? "ring-4 ring-[#7b4b29] scale-[1.015]" : isDropActive ? "ring-4 ring-[#7b4b29]/35" : "",
      ].join(" ")}
    >
      {/* กาแฟที่ตักใส่ไปแล้ว — ค่อย ๆ สูงขึ้นในตัวอุปกรณ์ */}
      {fillPct > 0 && (
        <div
          className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#3d2010]/85 to-[#7b4b29]/55 pointer-events-none"
          style={{ height: `${fillPct * 100}%`, transition: "height .45s cubic-bezier(.2,.8,.2,1)" }}
        />
      )}
      {/* Decorative circles */}
      <div className="absolute -top-14 -right-14 w-44 h-44 rounded-full bg-white/15" />
      <div className="absolute -bottom-10 -left-10 w-36 h-36 rounded-full bg-white/10" />
      <div className="absolute top-1/3 left-1/4 w-16 h-16 rounded-full bg-white/10" />

      {/* อุปกรณ์จริง — เบลอรูปตัวเองเป็นพื้นหลังเหมือนการ์ดเลือกอุปกรณ์ */}
      {showImg && (
        <>
          <img
            src={equipment.image}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover blur-xl scale-125 opacity-40"
          />
          <img
            src={equipment.image}
            alt=""
            onError={() => setImgFailed(true)}
            className="absolute inset-0 w-full h-full object-contain object-center p-8 sm:p-10 drop-shadow-lg"
            style={{ animation: "brewFloat 3.5s ease-in-out infinite" }}
          />
        </>
      )}

      <div className="relative z-10 flex flex-col items-center gap-3 mt-auto">
        {showSteam && (
          <div className="flex gap-3 mb-1 h-7">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-1 rounded-full bg-[#7b4b29]/25"
                style={{
                  height: "24px",
                  animation: `brewSteamRise 1.6s ease-in-out ${i * 0.4}s infinite`,
                }}
              />
            ))}
          </div>
        )}

        {!showImg && <Coffee className="size-14 text-[#7b4b29]/40" strokeWidth={1.5} />}
      </div>

      {/* ป้ายบอกจุดวางขณะลาก */}
      {isDropActive && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#3d2010]/25 backdrop-blur-[1px] pointer-events-none">
          <span className="rounded-full bg-white/90 px-4 py-2 text-sm font-bold text-[#3d2010] shadow-lg">
            {isOver ? "ปล่อยเพื่อใส่กาแฟ" : "ลากมาวางที่อุปกรณ์นี้"}
          </span>
        </div>
      )}

      {/* Corner badge */}
      <div className="absolute top-3 right-3 bg-white/50 backdrop-blur rounded-full px-2 py-0.5 text-[10px] text-[#7b4b29]/60">
        {step.interactionType === "timer" ? "จับเวลา" :
         step.interactionType === "slider" ? "ปรับได้" :
         step.interactionType === "choice" ? "เลือก" :
         step.interactionType === "drag" ? "ลากวาง" :
         step.interactionType === "press" ? "กดค้าง" :
         step.interactionType === "pour" ? "เทค้าง" : "กด"}
      </div>
    </div>
  );
}

// ─── Slider ───────────────────────────────────────────────────────────────────

const SLIDER_FEEDBACK = {
  coffeeAmount: (pct) =>
    pct > 0.65 ? { text: "เข้มจัด" } : pct > 0.35 ? { text: "สมดุล" } : { text: "เบา" },
  waterTemp: (pct) =>
    pct > 0.65 ? { text: "ร้อนมาก" } : pct > 0.35 ? { text: "เหมาะสม" } : { text: "อุ่น" },
  milkAmount: (pct) =>
    pct > 0.65 ? { text: "นมเยอะ" } : pct > 0.35 ? { text: "กลาง" } : { text: "นมน้อย" },
  chocolateAmount: (pct) =>
    pct > 0.65 ? { text: "หวานมาก" } : pct > 0.35 ? { text: "พอดี" } : { text: "ช็อกน้อย" },
  waterAmount: (pct) =>
    pct > 0.65 ? { text: "น้ำมาก" } : pct > 0.35 ? { text: "พอดี" } : { text: "น้ำน้อย" },
  waterRatio: (pct) =>
    pct > 0.65 ? { text: "เจือจางมาก" } : pct > 0.35 ? { text: "กลาง" } : { text: "เข้มกว่า" },
  pourSpeed: (pct) =>
    pct > 0.65 ? { text: "เทเร็ว" } : pct > 0.35 ? { text: "พอดี" } : { text: "เทช้า" },
  foamAmount: (pct) =>
    pct > 0.65 ? { text: "ฟองมาก" } : { text: "นิดหน่อย" },
};

function SliderInteraction({ step, value, onChange }) {
  const pct = (value - step.min) / (step.max - step.min);
  const feedbackFn = SLIDER_FEEDBACK[step.variable];
  const feedback = feedbackFn ? feedbackFn(pct) : null;

  return (
    <div className="space-y-4">
      {/* Value display */}
      <div className="flex items-end justify-center gap-1">
        <span className="text-4xl font-extrabold text-[#3d2010] dark:text-brown-superlight tabular-nums leading-none">
          {Number.isInteger(step.step ?? 1) ? value : value.toFixed(1)}
        </span>
        <span className="text-sm text-[#5c4033]/60 dark:text-brown-superlight/60 mb-1">{step.unit?.split("(")[0].trim()}</span>
      </div>

      {/* Feedback badge */}
      {feedback && (
        <div className="flex justify-center">
          <span className="bg-[#f0e4d0] dark:bg-white/10 text-[#5c3a1e] dark:text-beige text-xs font-semibold px-3 py-1 rounded-full transition-all duration-300">
            {feedback.text}
          </span>
        </div>
      )}

      {/* Track */}
      <div className="relative px-1">
        <input
          type="range"
          min={step.min}
          max={step.max}
          step={step.step ?? 1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2.5 rounded-full appearance-none cursor-pointer focus:outline-none"
          style={{
            background: `linear-gradient(to right, #7b4b29 0%, #c47a3a ${pct * 100}%, #e0d8ce ${pct * 100}%, #e0d8ce 100%)`,
          }}
        />
        <div className="flex justify-between mt-1.5 text-[10px] text-[#5c4033]/40 dark:text-brown-superlight/40">
          <span>{step.min}</span>
          <span>{step.max}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Button ───────────────────────────────────────────────────────────────────

function ButtonInteraction({ step, done, onDone }) {
  return (
    <button
      onClick={!done ? onDone : undefined}
      className={[
        "w-full py-4 rounded-2xl text-base font-bold transition-all duration-300 relative overflow-hidden",
        done
          ? "bg-green-50 text-green-700 border-2 border-green-200 cursor-default"
          : "bg-[#7b4b29] text-white hover:bg-[#5c3a1e] active:scale-[.97] shadow-lg",
      ].join(" ")}
      style={!done ? { animation: "brewPulseRing 2.2s ease-in-out infinite" } : {}}
    >
      {done ? (
        <span style={{ animation: "brewCheckPop 0.4s ease-out forwards" }} className="inline-block">
          ✓ {step.label}
        </span>
      ) : (
        step.label
      )}
    </button>
  );
}

// ─── Timer ────────────────────────────────────────────────────────────────────

function TimerInteraction({ step, done, onDone }) {
  const [started, setStarted] = useState(false);
  const [remaining, setRemaining] = useState(step.duration);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!started || done) return;
    intervalRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) { clearInterval(intervalRef.current); onDone(); return 0; }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [started]);

  const pct = ((step.duration - remaining) / step.duration) * 100;
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const timeStr = mins > 0 ? `${mins}:${String(secs).padStart(2, "0")}` : `${secs}`;
  const radius = 44;
  const circ = 2 * Math.PI * radius;

  const ringColor = done ? "#16a34a" : pct > 70 ? "#c47a3a" : "#7b4b29";

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Circular countdown */}
      <div
        className="relative"
        style={started && !done ? { animation: "brewPulseRing 1.8s ease-in-out infinite" } : {}}
      >
        <svg width="110" height="110" className="-rotate-90">
          <circle cx="55" cy="55" r={radius} fill="none" stroke="#e0d8ce" strokeWidth="7" />
          <circle
            cx="55" cy="55" r={radius} fill="none"
            stroke={ringColor} strokeWidth="7"
            strokeDasharray={circ}
            strokeDashoffset={circ * (1 - pct / 100)}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.9s linear, stroke 0.5s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-extrabold text-[#3d2010] dark:text-brown-superlight tabular-nums">
            {done ? "✓" : timeStr}
          </span>
          <span className="text-[10px] text-[#5c4033]/50 dark:text-brown-superlight/50">{done ? "เสร็จ" : step.unit}</span>
        </div>
      </div>

      <p className="text-sm text-[#5c4033]/70 dark:text-brown-superlight/70 text-center">
        {done ? "เสร็จแล้ว!" : started ? `กำลังนับถอยหลัง…` : `รวมเวลา ${step.duration} ${step.unit}`}
      </p>

      <div className="flex gap-3">
        {!started && !done && (
          <button
            onClick={() => setStarted(true)}
            className="px-8 py-3 bg-[#7b4b29] text-white rounded-full text-sm font-bold hover:bg-[#5c3a1e] transition shadow-md active:scale-95"
          >
            เริ่ม ▶
          </button>
        )}
        {!done && (
          <button
            onClick={() => { clearInterval(intervalRef.current); onDone(); }}
            className="px-6 py-3 border-2 border-[#7b4b29]/20 dark:border-beige/30 text-[#7b4b29] dark:text-beige rounded-full text-sm hover:bg-[#f7efe6] dark:hover:bg-white/10 transition"
          >
            ข้าม
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Choice ───────────────────────────────────────────────────────────────────

function ChoiceInteraction({ step, value, onChange }) {
  return (
    <div className={`grid gap-3 ${step.options.length > 2 ? "grid-cols-1" : "grid-cols-2"}`}>
      {step.options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={String(opt.value)}
            onClick={() => onChange(opt.value)}
            className={[
              "relative p-4 rounded-2xl border-2 text-sm font-semibold text-left transition-all duration-200 active:scale-[.97]",
              active
                ? "bg-[#7b4b29] text-white border-[#7b4b29] shadow-lg scale-[1.02]"
                : "bg-white dark:bg-white/5 text-[#3d2010] dark:text-brown-superlight border-[#e0d8ce] dark:border-white/10 hover:border-[#7b4b29]/40 dark:hover:border-beige/40 hover:bg-[#f7efe6] dark:hover:bg-white/10 hover:scale-[1.01]",
            ].join(" ")}
          >
            {active && (
              <span
                className="absolute top-2 right-2 text-white text-xs bg-white/20 rounded-full w-5 h-5 flex items-center justify-center"
                style={{ animation: "brewCheckPop 0.35s ease-out forwards" }}
              >
                ✓
              </span>
            )}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── Main StepCard ────────────────────────────────────────────────────────────

export default function StepCard({ step, stepNumber, totalSteps, variables, onVariableChange, onStepDone, stepDone, equipment }) {
  const value = variables[step.variable] ?? step.default;

  /* ภาพอุปกรณ์ (ซ้าย) กับช้อนที่ลาก (ขวา) อยู่คนละคอลัมน์
     จึงต้องยกสถานะการลากมาไว้ที่นี่เพื่อให้ทั้งสองฝั่งเห็นตรงกัน */
  const illustrationRef = useRef(null);
  const [dragState, setDragState] = useState({ dragging: false, over: false });
  const handleDragState = useCallback((st) => setDragState(st), []);

  const isDrag = step.interactionType === "drag";
  const fillPct = isDrag
    ? Math.min(1, Math.max(0, ((value ?? 0) - (step.min ?? 0)) / ((step.max ?? 1) - (step.min ?? 0))))
    : 0;

  return (
    <div
      className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6"
      style={{ animation: "brewSlideIn 0.35s ease-out both" }}
    >
      {/* Illustration — เป็นจุดวางของขั้นตอนแบบลากด้วย */}
      <div style={{ animation: "brewFadeUp 0.4s ease-out 0.05s both" }}>
        <StepIllustration
          step={step}
          equipment={equipment}
          dropRef={illustrationRef}
          isDropActive={isDrag && dragState.dragging}
          isOver={isDrag && dragState.over}
          fillPct={fillPct}
        />
      </div>

      {/* Interaction card */}
      <div
        className="bg-white dark:bg-[#2b2015] rounded-3xl shadow-lg ring-1 ring-black/5 dark:ring-brown-superlight/10 overflow-hidden flex flex-col"
        style={{ animation: "brewFadeUp 0.4s ease-out 0.12s both" }}
      >
        {/* Header stripe */}
        <div className="bg-gradient-to-r from-[#4b2f1a] to-[#7b4b29] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex-none w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-extrabold text-sm">
              {stepNumber}
            </div>
            <div>
              <p className="text-white/50 text-[10px] uppercase tracking-widest">ขั้นที่ {stepNumber} / {totalSteps}</p>
              <h2 className="text-white font-bold text-base leading-tight">{step.title}</h2>
            </div>
          </div>
        </div>

        <div className="p-5 flex flex-col gap-4 flex-grow">
          {/* Description */}
          <div className="bg-[#f7efe6] dark:bg-white/5 rounded-2xl px-4 py-3 text-sm text-[#3d2010] dark:text-brown-superlight leading-relaxed">
            {step.description}
          </div>

          {/* Hint */}
          <div className="flex items-start gap-2 text-xs text-[#7b4b29]/65 dark:text-beige/70 bg-[#fffaf3] dark:bg-white/5 rounded-xl px-3 py-2 border border-[#e8c88a]/40 dark:border-beige/25">
            <Lightbulb className="mt-0.5 flex-none size-3.5" strokeWidth={2} />
            <span>{step.hint}</span>
          </div>

          {/* Interaction */}
          <div className="flex-grow flex flex-col justify-center py-2">
            {step.interactionType === "slider" && (
              <SliderInteraction step={step} value={value} onChange={(v) => onVariableChange(step.variable, v)} />
            )}
            {step.interactionType === "button" && (
              <ButtonInteraction step={step} done={stepDone} onDone={onStepDone} />
            )}
            {step.interactionType === "timer" && (
              <TimerInteraction step={step} done={stepDone} onDone={onStepDone} />
            )}
            {step.interactionType === "drag" && (
              <DragDoseInteraction
                step={step}
                value={value}
                onChange={(v) => onVariableChange(step.variable, v)}
                dropRef={illustrationRef}
                onDragState={handleDragState}
              />
            )}
            {step.interactionType === "press" && (
              <PressInteraction step={step} done={stepDone} onDone={onStepDone} />
            )}
            {step.interactionType === "pour" && (
              <PourInteraction
                step={step}
                value={value}
                onChange={(v) => onVariableChange(step.variable, v)}
                done={stepDone}
                onDone={onStepDone}
              />
            )}
            {step.interactionType === "choice" && (
              <ChoiceInteraction step={step} value={value} onChange={(v) => onVariableChange(step.variable, v)} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
