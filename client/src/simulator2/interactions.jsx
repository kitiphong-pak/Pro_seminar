import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import PropTypes from "prop-types";

/* =============================================================================
   Interaction แบบ "ลงมือทำ" สำหรับ Brew Simulator
   - drag  : ลากช้อนตักกาแฟไปวางในตะแกรง/ดริปเปอร์
   - press : กดค้างเพื่อออกแรง (tamp / กด plunger) ให้อยู่ในโซนเป้าหมาย
   - pour  : กดค้างเพื่อรินน้ำ/นม ระดับของเหลวจะค่อย ๆ เพิ่มแบบเรียลไทม์
   ใช้ Pointer Events ทั้งหมด จึงรองรับทั้งเมาส์และการแตะบนมือถือ
   ============================================================================= */

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const roundTo = (v, stepSize) => Math.round(v / stepSize) * stepSize;
const fmt = (v, stepSize) => (Number.isInteger(stepSize) ? Math.round(v) : Number(v.toFixed(1)));

// ไอคอนช้อนตักกาแฟ วาดเองแบบเส้น (lucide ไม่มีไอคอนนี้)
function ScoopIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <ellipse cx="9" cy="15" rx="6" ry="4" stroke="currentColor" strokeWidth="1.6" />
      <line x1="13.5" y1="11.5" x2="20" y2="5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

/* ─── 1. ลากวาง — ตักกาแฟลงตะแกรง ──────────────────────────────────────────── */

/**
 * ลากช้อนตักกาแฟไป "ใส่อุปกรณ์จริงที่แสดงอยู่ด้านซ้าย"
 * - dropRef      : ref ของกล่องภาพอุปกรณ์ (อยู่คนละคอลัมน์) ใช้เป็นจุดวาง
 * - onDragState  : รายงานสถานะขึ้นไปให้ StepCard เพื่อไฮไลต์อุปกรณ์
 * ช้อนที่ลอยตามเมาส์ render ผ่าน portal ไปที่ body เพราะการ์ดฝั่งขวามี
 * transform จาก animation ซึ่งจะทำให้ position:fixed อ้างอิงผิดกล่อง
 */
export function DragDoseInteraction({ step, value, onChange, dropRef, onDragState }) {
  const min = step.min ?? 0;
  const max = step.max ?? 20;
  const stepSize = step.step ?? 1;
  const perScoop = Math.max(stepSize, roundTo((max - min) / 5, stepSize));

  const [drag, setDrag] = useState(null); // {x,y} พิกัดบนหน้าจอขณะลาก
  const [over, setOver] = useState(false);
  const draggingRef = useRef(false);

  const pct = clamp((value - min) / (max - min), 0, 1);
  const unit = step.unit?.split("(")[0].trim() ?? "";

  const isOverTarget = (x, y) => {
    const t = dropRef?.current?.getBoundingClientRect();
    return !!t && x >= t.left && x <= t.right && y >= t.top && y <= t.bottom;
  };

  const report = (dragging, isOver) => onDragState?.({ dragging, over: isOver });

  const addScoop = () => onChange(clamp(fmt(value + perScoop, stepSize), min, max));

  const onPointerDown = (e) => {
    e.preventDefault();
    // capture ล้มเหลวได้ในบางเคส (เช่น pointer หลุดก่อน) ไม่ควรทำให้ทั้ง handler พัง
    try { e.currentTarget.setPointerCapture?.(e.pointerId); } catch { /* เพิกเฉย ยังลาก/กด/เทต่อได้แม้ capture ไม่ติด */ }
    draggingRef.current = true;
    setDrag({ x: e.clientX, y: e.clientY });
    setOver(false);
    report(true, false);
  };

  const onPointerMove = (e) => {
    if (!draggingRef.current) return;
    const o = isOverTarget(e.clientX, e.clientY);
    setDrag({ x: e.clientX, y: e.clientY });
    setOver(o);
    report(true, o);
  };

  const onPointerUp = (e) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    if (isOverTarget(e.clientX, e.clientY)) addScoop();
    setDrag(null);
    setOver(false);
    report(false, false);
  };

  useEffect(() => () => onDragState?.({ dragging: false, over: false }), [onDragState]);

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-center gap-1">
        <span className="text-4xl font-extrabold text-[#3d2010] tabular-nums leading-none">
          {fmt(value, stepSize)}
        </span>
        <span className="text-sm text-[#5c4033]/60 mb-1">{unit}</span>
      </div>

      <p className="text-center text-xs text-[#7b4b29]/70">
        ลากช้อนไปใส่อุปกรณ์ทางซ้าย ครั้งละ {perScoop} {unit}
      </p>

      {/* ช้อนตักกาแฟ (ลากได้) */}
      <div className="flex justify-center">
        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          role="button"
          tabIndex={0}
          aria-label={`ลากช้อนตักกาแฟไปใส่อุปกรณ์ หรือกด Enter เพื่อเพิ่มครั้งละ ${perScoop} ${unit}`}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") { e.preventDefault(); addScoop(); }
          }}
          className={[
            "select-none w-28 h-24 rounded-2xl border-2 border-dashed",
            "flex flex-col items-center justify-center gap-1",
            "bg-[#fffaf3] border-[#c9a274] cursor-grab active:cursor-grabbing",
            drag ? "opacity-30" : "hover:bg-[#f7efe6]",
          ].join(" ")}
          style={{
            touchAction: "none",
            animation: drag ? undefined : "brewFloat 2.6s ease-in-out infinite",
          }}
        >
          <ScoopIcon className="w-8 h-8 text-[#7b4b29]" />
          <span className="text-[10px] text-[#7b4b29]/70">
            {drag ? (over ? "ปล่อยเลย!" : "ลากไปที่อุปกรณ์") : "← ลากไปทางซ้าย"}
          </span>
        </div>
      </div>

      {/* ช้อนที่ลอยตามเมาส์ — ต้อง portal ออกไปนอกการ์ด */}
      {drag &&
        createPortal(
          <div
            className="pointer-events-none fixed z-[60]"
            style={{
              left: drag.x,
              top: drag.y,
              transform: `translate(-50%,-50%) scale(${over ? 1.25 : 1})`,
              filter: "drop-shadow(0 6px 10px rgba(0,0,0,.35))",
              transition: "transform .12s ease-out",
            }}
          >
            <ScoopIcon className="w-9 h-9 text-[#7b4b29]" />
          </div>,
          document.body
        )}

      {/* ปรับละเอียด + เทออก */}
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={min}
          max={max}
          step={stepSize}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          aria-label="ปรับปริมาณแบบละเอียด"
          className="flex-1 h-2 rounded-full appearance-none cursor-pointer focus:outline-none"
          style={{
            background: `linear-gradient(to right,#7b4b29 0%,#c47a3a ${pct * 100}%,#e0d8ce ${pct * 100}%,#e0d8ce 100%)`,
          }}
        />
        <button
          type="button"
          onClick={() => onChange(min)}
          className="flex-none text-xs text-[#7b4b29]/70 hover:text-[#7b4b29] underline"
        >
          เทออก
        </button>
      </div>
    </div>
  );
}

DragDoseInteraction.propTypes = {
  step: PropTypes.object.isRequired,
  value: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
  dropRef: PropTypes.object,
  onDragState: PropTypes.func,
};

/* ─── 2. กดค้างวัดแรง — tamp / กด plunger ─────────────────────────────────── */

// แรงไต่ขึ้นเร็วช่วงแรกแล้วค่อย ๆ อิ่มตัว เหมือนกดจริง
const forceAt = (heldMs) => clamp(100 * (1 - Math.exp(-heldMs / 900)), 0, 100);

export function PressInteraction({ step, done, onDone }) {
  const TARGET_LO = 55;
  const TARGET_HI = 82;

  const [force, setForce] = useState(0);
  const [holding, setHolding] = useState(false);
  const [verdict, setVerdict] = useState(null); // 'good' | 'weak' | 'hard'
  const rafRef = useRef(null);
  const startRef = useRef(0);
  const forceRef = useRef(0);   // ค่าแรงล่าสุด อ่านได้ทันทีตอนปล่อย
  const holdRef = useRef(false); // กันปล่อยซ้ำ/เริ่มซ้อน

  const stop = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }, []);

  useEffect(() => stop, [stop]);

  const begin = (e) => {
    if (done || holdRef.current) return;
    e.preventDefault();
    // capture ล้มเหลวได้ในบางเคส (เช่น pointer หลุดก่อน) ไม่ควรทำให้ทั้ง handler พัง
    try { e.currentTarget.setPointerCapture?.(e.pointerId); } catch { /* เพิกเฉย ยังลาก/กด/เทต่อได้แม้ capture ไม่ติด */ }
    stop();                    // กัน loop เดิมค้างแล้วแรงพุ่งเกิน
    forceRef.current = 0;
    setForce(0);
    setVerdict(null);
    holdRef.current = true;
    setHolding(true);
    startRef.current = performance.now();
    const tick = () => {
      const held = performance.now() - startRef.current;
      // แรงไต่ขึ้นเร็วช่วงแรกแล้วค่อย ๆ อิ่มตัว เหมือนกดจริง
      const f = forceAt(held);
      forceRef.current = f;
      setForce(f);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  const release = () => {
    if (!holdRef.current) return;
    holdRef.current = false;
    stop();
    setHolding(false);
    /* คำนวณจากเวลาที่กดค้างจริง — ถ้า rAF ถูกหยุด (สลับแท็บ/ประหยัดพลังงาน)
       ค่าจากเฟรมล่าสุดจะค้าง แต่เวลาที่ผ่านไปยังถูกต้องเสมอ */
    const f = forceAt(performance.now() - startRef.current);
    forceRef.current = f;
    setForce(f);
    if (f >= TARGET_LO && f <= TARGET_HI) {
      setVerdict("good");
      setTimeout(onDone, 420);
    } else {
      setVerdict(f < TARGET_LO ? "weak" : "hard");
    }
  };

  const msg = done
    ? { text: `✓ ${step.label ?? "เสร็จแล้ว"}`, cls: "text-green-700" }
    : verdict === "good"
    ? { text: "แรงกำลังดี! ผิวหน้าเรียบสม่ำเสมอ", cls: "text-green-700" }
    : verdict === "weak"
    ? { text: "เบาไป น้ำจะไหลเร็วและรสชืด ลองใหม่อีกครั้ง", cls: "text-amber-700" }
    : verdict === "hard"
    ? { text: "แน่นไป น้ำผ่านยากและจะขม ลองใหม่อีกครั้ง", cls: "text-amber-700" }
    : { text: "กดค้างไว้ แล้วปล่อยเมื่อแรงเข้าโซนเขียว", cls: "text-[#7b4b29]/70" };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* เกจวัดแรง */}
      <div className="relative w-full h-9 rounded-full bg-[#eee6dc] overflow-hidden ring-1 ring-black/5">
        <div
          className="absolute inset-y-0 bg-green-400/25 border-x-2 border-green-500/50"
          style={{ left: `${TARGET_LO}%`, width: `${TARGET_HI - TARGET_LO}%` }}
        />
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#7b4b29] to-[#c47a3a] opacity-80"
          style={{ width: `${force}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold text-[#3d2010] tabular-nums drop-shadow-sm">
            {Math.round(force)}%
          </span>
        </div>
      </div>

      <p className={`text-xs text-center h-8 ${msg.cls}`}>{msg.text}</p>

      <button
        type="button"
        disabled={done}
        onPointerDown={begin}
        onPointerUp={release}
        onPointerLeave={release}
        onPointerCancel={release}
        className={[
          "w-full py-5 rounded-2xl text-base font-bold select-none transition-colors",
          done
            ? "bg-green-50 text-green-700 border-2 border-green-200"
            : holding
            ? "bg-[#4b2f1a] text-white scale-[.98]"
            : "bg-[#7b4b29] text-white hover:bg-[#5c3a1e] shadow-lg",
        ].join(" ")}
        style={{ touchAction: "none" }}
      >
        {done ? `✓ ${step.label ?? "เสร็จแล้ว"}` : holding ? "กำลังกด… ปล่อยเมื่อพอดี" : "กดค้างไว้"}
      </button>
    </div>
  );
}

PressInteraction.propTypes = {
  step: PropTypes.object.isRequired,
  done: PropTypes.bool,
  onDone: PropTypes.func.isRequired,
};

/* ─── 3. เทค้าง — รินน้ำ/นม/ช็อกโกแลต ──────────────────────────────────────── */

export function PourInteraction({ step, value, onChange, done, onDone }) {
  // มี max เท่านั้นจึงถือเป็นตัวแปรตัวเลข — pour_milk/pour_cap มีแต่ variable ที่เป็นธงว่าทำเสร็จ
  const hasVar = step.variable != null && step.max != null;
  const min = hasVar ? step.min ?? 0 : 0;
  const max = hasVar ? step.max ?? 100 : 100;
  const stepSize = step.step ?? 1;
  const FILL_MS = 2600; // เทจากว่างจนเต็มพิสัย

  const [pouring, setPouring] = useState(false);
  const [level, setLevel] = useState(hasVar ? value : 0);
  const rafRef = useRef(null);
  const fullTimerRef = useRef(null);
  const startRef = useRef({ t: 0, level: 0 }); // เวลาและระดับตอนเริ่มกด
  const levelRef = useRef(hasVar ? value : 0);
  const pouringRef = useRef(false);

  // ระดับ ณ เวลาปัจจุบัน คิดจากเวลาที่กดค้าง ไม่ใช่จากจำนวนเฟรม
  const levelNow = () =>
    clamp(startRef.current.level + ((max - min) * (performance.now() - startRef.current.t)) / FILL_MS, min, max);

  useEffect(() => {
    if (hasVar) { levelRef.current = value; setLevel(value); }
  }, [value, hasVar]);

  useEffect(() => () => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    clearTimeout(fullTimerRef.current);
  }, []);

  const begin = (e) => {
    if (done || pouringRef.current) return;
    e.preventDefault();
    // capture ล้มเหลวได้ในบางเคส (เช่น pointer หลุดก่อน) ไม่ควรทำให้ทั้ง handler พัง
    try { e.currentTarget.setPointerCapture?.(e.pointerId); } catch { /* เพิกเฉย ยังลาก/กด/เทต่อได้แม้ capture ไม่ติด */ }
    pouringRef.current = true;
    setPouring(true);
    startRef.current = { t: performance.now(), level: levelRef.current };

    const tick = () => {
      const next = levelNow();
      levelRef.current = next;
      setLevel(next);
      if (next >= max) { finish(next); return; }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    // สำรอง: ถ้า rAF ไม่เดิน (แท็บถูกซ่อน) ก็ยังปิดงานตอนเต็มได้
    const msToFull = ((max - levelRef.current) / (max - min)) * FILL_MS;
    fullTimerRef.current = setTimeout(() => finish(max), Math.max(0, msToFull) + 30);
  };

  const finish = (lv) => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    clearTimeout(fullTimerRef.current);
    pouringRef.current = false;
    setPouring(false);
    const v = clamp(lv, min, max);
    levelRef.current = v;
    setLevel(v);
    if (hasVar) onChange(fmt(v, stepSize));
    else if (v >= max * 0.92) onDone?.();
  };

  const release = () => { if (pouringRef.current) finish(levelNow()); };

  const pct = clamp((level - min) / (max - min), 0, 1);
  const unit = step.unit?.split("(")[0].trim() ?? "";

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-end justify-center gap-1">
        <span className="text-4xl font-extrabold text-[#3d2010] tabular-nums leading-none">
          {hasVar ? fmt(level, stepSize) : `${Math.round(pct * 100)}`}
        </span>
        <span className="text-sm text-[#5c4033]/60 mb-1">{hasVar ? unit : "%"}</span>
      </div>

      {/* แก้ว + ของเหลว */}
      <div className="relative w-24 h-28 rounded-b-3xl rounded-t-lg border-4 border-[#d8cdc0] bg-white/70 overflow-hidden">
        <div
          className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#4b2f1a] via-[#7b4b29] to-[#a9713f]"
          style={{ height: `${pct * 100}%`, transition: pouring ? "none" : "height .3s ease-out" }}
        >
          <div className="absolute inset-x-0 top-0 h-1.5 bg-white/25" />
        </div>
        {pouring && (
          <div className="absolute left-1/2 top-0 w-1.5 h-full -translate-x-1/2 bg-[#a9713f]/60" />
        )}
      </div>

      <p className="text-xs text-center text-[#7b4b29]/70 h-8">
        {done
          ? "✓ เทเรียบร้อย"
          : pouring
          ? "กำลังเท… ปล่อยเพื่อหยุด"
          : pct > 0
          ? "กดค้างต่อเพื่อเทเพิ่ม"
          : "กดปุ่มค้างไว้เพื่อเริ่มเท"}
      </p>

      <div className="flex items-center gap-3 w-full">
        <button
          type="button"
          disabled={done}
          onPointerDown={begin}
          onPointerUp={release}
          onPointerLeave={release}
          onPointerCancel={release}
          className={[
            "flex-1 py-4 rounded-2xl text-base font-bold select-none transition-colors",
            done
              ? "bg-green-50 text-green-700 border-2 border-green-200"
              : pouring
              ? "bg-[#4b2f1a] text-white"
              : "bg-[#7b4b29] text-white hover:bg-[#5c3a1e] shadow-lg",
          ].join(" ")}
          style={{ touchAction: "none" }}
        >
          {done ? "✓ เสร็จแล้ว" : pouring ? "กำลังเท…" : "กดค้างเพื่อเท"}
        </button>
        {pct > 0 && !done && (
          <button
            type="button"
            onClick={() => { levelRef.current = min; setLevel(min); startRef.current = { t: performance.now(), level: min }; if (hasVar) onChange(min); }}
            className="flex-none text-xs text-[#7b4b29]/70 hover:text-[#7b4b29] underline"
          >
            เทออก
          </button>
        )}
      </div>
    </div>
  );
}

PourInteraction.propTypes = {
  step: PropTypes.object.isRequired,
  value: PropTypes.number,
  onChange: PropTypes.func,
  done: PropTypes.bool,
  onDone: PropTypes.func,
};
