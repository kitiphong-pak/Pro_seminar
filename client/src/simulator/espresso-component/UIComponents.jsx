export function Label({ children }) {
  return <div className="text-sm text-[#2a1c14] font-medium">{children}</div>;
}

export function Card({ title, children, action = null, className = "" }) {
  return (
    <div className={`rounded-2xl border border-amber-200 bg-white/90 backdrop-blur p-4 shadow-[0_12px_28px_rgba(180,83,9,0.10)] flex flex-col ${className}`}>
      <div className="shrink-0 mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#7a4112]">{title}</h3>
        {action}
      </div>
      <div className="flex-1 min-h-0">{children}</div>
    </div>
  );
}

export function Slider({ label, min, max, step = 1, value, onChange, disabled = false }) {
  return (
    <div className={disabled ? "opacity-60" : ""}>
      <Label>{label}</Label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full mt-1 accent-[#6f4e37]"
        disabled={disabled}
      />
      <div className="flex justify-between text-xs text-[#2a1c14]/60">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

export function Toggle({ checked, onChange, label }) {
  return (
    <label className="inline-flex items-center gap-2 select-none cursor-pointer">
      <span className={"h-5 w-10 rounded-full transition relative " + (checked ? "bg-[#2a1c14]/70" : "bg-neutral-300")}>
        <span className={"absolute top-0.5 h-4 w-4 rounded-full bg-white shadow " + (checked ? "left-5" : "left-1")} />
      </span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="hidden" />
      <span className="text-sm">{label}</span>
    </label>
  );
}

export function Chip({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[#6f4e37]/20 bg-[#6f4e37]/10 px-2.5 py-1 text-xs text-[#2a1c14]">
      {children}
    </span>
  );
}

export function Pill({ children }) {
  return (
    <span className="inline-block rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-0.5 text-xs">
      {children}
    </span>
  );
}

export function BadgeRow({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white px-3 py-2">
      <span className="text-[#2a1c14]/70 text-sm">{label}</span>
      <span className="font-semibold text-[#7a4112]">{String(value)}</span>
    </div>
  );
}

export function Fact({ icon, label, value, hint }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white px-3 py-2.5">
      <div className="text-[11px] text-[#2a1c14]/60 flex items-center gap-1">
        {icon ? <span>{icon}</span> : null}
        <span className="inline-flex items-center">{label}</span>
      </div>
      <div className="text-lg font-semibold leading-tight">{value}</div>
      {hint && <div className="text-[11px] text-[#2a1c14]/60 mt-0.5">{hint}</div>}
    </div>
  );
}

export function SectionCard({ title, children, tone }) {
  const cls =
    tone === "warn"
      ? "rounded-xl border border-yellow-200 bg-yellow-50 p-3"
      : "rounded-xl border border-neutral-200 bg-white p-3";
  return (
    <div className={cls}>
      <div className="font-semibold mb-1">{title}</div>
      {children}
    </div>
  );
}

export function ExplainLine({ term, meaning, eg }) {
  return (
    <div>
      <b>{term}</b> — {meaning}
      {eg ? <span className="block">ตัวอย่าง: {eg}</span> : null}
    </div>
  );
}

export function EmptyLine() {
  return <div className="text-sm text-[#2a1c14]/60">—</div>;
}

export function Collapsible({ title, children, defaultOpen = false }) {
  return (
    <details open={defaultOpen} className="rounded-xl border border-neutral-200 bg-white p-3 group">
      <summary className="cursor-pointer list-none flex items-center justify-between">
        <span className="font-semibold">{title}</span>
        <span className="text-xs text-[#2a1c14]/60 group-open:hidden">กดเพื่อดู</span>
        <span className="text-xs text-[#2a1c14]/60 hidden group-open:inline">กดเพื่อซ่อน</span>
      </summary>
      <div className="mt-2">{children}</div>
    </details>
  );
}

export function Explain({ term, eg, children }) {
  return (
    <div>
      <span className="font-medium">{term}</span>{" "}
      <span>— {children}</span>
      {eg && <div className="mt-0.5">เช่น: {eg}</div>}
    </div>
  );
}

export function Quick({ label, value, hint }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white px-3 py-2">
      <div className="text-[11px] text-[#2a1c14]/60">{label}</div>
      <div className="text-base font-semibold leading-none">{value}</div>
      {hint && <div className="text-[11px] text-[#2a1c14]/60 mt-0.5">{hint}</div>}
    </div>
  );
}

export function CloseBtn({ onClick, className = "", label = "ปิด" }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={"group grid place-items-center h-9 w-9 rounded-full border border-neutral-200 bg-white/90 hover:bg-neutral-100 shadow-sm " + className}
      title={label}
    >
      <span className="text-xl leading-none text-[#2a1c14]/70 group-hover:text-[#2a1c14]">×</span>
    </button>
  );
}

export function HeaderChipButton({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1 rounded-full border bg-white/90 px-3 py-1.5 text-sm shadow-sm border-[#e6ddd5] hover:bg-[#fff8f2] hover:shadow transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e4c9ad]"
    >
      {children}
    </button>
  );
}

export function FlavorSelect({ value, onChange, options }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        className="appearance-none rounded-full border bg-white/95 pl-3 pr-9 py-1.5 text-sm shadow-sm border-[#e6ddd5] hover:bg-[#fff8f2] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e4c9ad]"
      >
        {options.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
      </select>
      <svg
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#845f45]"
        viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"
      >
        <path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.24a.75.75 0 0 1-1.06 0L5.21 8.29a.75.75 0 0 1 .02-1.08z"/>
      </svg>
    </div>
  );
}
