import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export function SmartTooltip({ anchorRef, children, placement = "auto" }) {
  const tipRef = useRef(null);
  const [style, setStyle] = useState({ opacity: 0 });

  const compute = () => {
    const a = anchorRef.current;
    const t = tipRef.current;
    if (!a || !t) return;
    const r = a.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const gap = 10;
    let place = placement;
    if (place === "auto") place = r.top > vh / 2 ? "top" : "bottom";
    const tw = t.offsetWidth;
    const th = t.offsetHeight;
    let top = 0;
    let left = Math.min(vw - tw - 8, Math.max(8, r.left + r.width / 2 - tw / 2));
    if (place === "top" && r.top - th - gap < 8) place = "bottom";
    else if (place === "bottom" && r.bottom + th + gap > vh - 8) place = "top";
    if (place === "top") top = r.top - th - gap;
    if (place === "bottom") top = r.bottom + gap;
    if (place === "left") { left = r.left - tw - gap; top = Math.min(vh - th - 8, Math.max(8, r.top + r.height / 2 - th / 2)); }
    if (place === "right") { left = r.right + gap; top = Math.min(vh - th - 8, Math.max(8, r.top + r.height / 2 - th / 2)); }
    setStyle({ position: "fixed", top, left, opacity: 1, zIndex: 9999 });
  };

  useLayoutEffect(() => {
    compute();
    const obs = new ResizeObserver(compute);
    if (tipRef.current) obs.observe(tipRef.current);
    return () => obs.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return createPortal(
    <div ref={tipRef} style={style} className="max-w-[320px] rounded-xl border border-neutral-200 bg-white p-3 text-xs text-[#2a1c14] shadow-xl" role="tooltip">
      {children}
    </div>,
    document.body
  );
}

export function InfoButton({ text, placement = "auto", className = "" }) {
  const btnRef = useRef(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const close = (e) => { if (!btnRef.current?.contains(e.target)) setOpen(false); };
    const off = () => setOpen(false);
    document.addEventListener("click", close);
    window.addEventListener("scroll", off, true);
    window.addEventListener("resize", off);
    return () => { document.removeEventListener("click", close); window.removeEventListener("scroll", off, true); window.removeEventListener("resize", off); };
  }, [open]);

  return (
    <>
      <button ref={btnRef} type="button"
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)} onBlur={() => setOpen(false)}
        className={"inline-grid place-items-center h-5 w-5 rounded-full border text-[11px] leading-none border-neutral-300 text-[#2a1c14]/80 bg-white hover:bg-neutral-50 " + className}
        aria-label="ดูคำอธิบาย"
      >i</button>
      {open && <SmartTooltip anchorRef={btnRef} placement={placement}>{text}</SmartTooltip>}
    </>
  );
}

function TooltipBubble({ anchorRef, title, children, placement = "auto" }) {
  const tipRef = useRef(null);
  const [style, setStyle] = useState({ opacity: 0 });

  const compute = () => {
    const a = anchorRef.current, t = tipRef.current;
    if (!a || !t) return;
    const r = a.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const gap = 10;
    const pad = 8;
    const maxW = Math.min(320, vw - pad * 2);
    t.style.maxWidth = `${maxW}px`;
    const tw = t.offsetWidth;
    const th = t.offsetHeight;
    let placeV = placement === "auto" ? (r.top > vh / 2 ? "top" : "bottom") : placement;
    let left = r.left + r.width / 2 - tw / 2;
    left = Math.min(vw - tw - pad, Math.max(pad, left));
    const tooRight = left + tw > vw - pad - 4;
    const tooLeft  = left < pad + 4;
    if (tooRight && r.left > vw * 0.60) left = Math.max(pad, r.right - tw);
    else if (tooLeft && r.right < vw * 0.40) left = Math.min(vw - tw - pad, r.left);
    let top;
    if (placeV === "top") {
      top = r.top - th - gap;
      if (top < pad) { placeV = "bottom"; top = r.bottom + gap; }
    } else {
      top = r.bottom + gap;
      if (top + th > vh - pad) { placeV = "top"; top = r.top - th - gap; }
    }
    top = Math.min(vh - th - pad, Math.max(pad, top));
    setStyle({ position: "fixed", top, left, opacity: 1, zIndex: 99999, pointerEvents: "auto" });
  };

  useLayoutEffect(() => {
    compute();
    const obs = new ResizeObserver(compute);
    if (tipRef.current) obs.observe(tipRef.current);
    window.addEventListener("scroll", compute, true);
    window.addEventListener("resize", compute);
    return () => { obs.disconnect(); window.removeEventListener("scroll", compute, true); window.removeEventListener("resize", compute); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return createPortal(
    <div ref={tipRef} role="tooltip" className="rounded-xl border border-neutral-200 bg-white p-3 text-xs text-[#2a1c14] shadow-xl" style={style}>
      {title && <div className="mb-1 font-semibold">{title}</div>}
      <div className="leading-relaxed">{children}</div>
    </div>,
    document.body
  );
}

export function InfoTip({ title, children, placement = "auto" }) {
  const btnRef = useRef(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (!btnRef.current?.contains(e.target)) setOpen(false); };
    const off = () => setOpen(false);
    document.addEventListener("click", onDoc);
    window.addEventListener("scroll", off, true);
    window.addEventListener("resize", off);
    return () => { document.removeEventListener("click", onDoc); window.removeEventListener("scroll", off, true); window.removeEventListener("resize", off); };
  }, [open]);

  return (
    <>
      <button ref={btnRef} type="button"
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)} onBlur={() => setOpen(false)}
        className="ml-1 inline-grid place-items-center h-4 w-4 rounded-full border border-neutral-300 bg-white text-[10px] leading-none text-[#2a1c14]/80 hover:bg-neutral-50"
        aria-label="ดูคำอธิบาย" title="ดูคำอธิบาย"
      >i</button>
      {open && <TooltipBubble anchorRef={btnRef} placement={placement} title={title}>{children}</TooltipBubble>}
    </>
  );
}
