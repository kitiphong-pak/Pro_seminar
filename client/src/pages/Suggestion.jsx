import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import menuItems from "../data/menuItems.json";

// ---------- Decision Tree ----------
const decisionTree = {
  question: "คุณชอบกาแฟรสอะไร?",
  key: "flavor",
  options: [
    {
      label: "ขม",
      value: "ขม",
      next: {
        question: "คุณชอบกาแฟที่มีนมมากน้อยแค่ไหน?",
        key: "milk",
        options: [
          {
            label: "มาก",
            value: "มาก",
            next: {
              question: "คุณต้องการกาแฟที่มีความเข้มข้นแบบไหน?",
              key: "intensity",
              options: [
                { label: "เข้ม", value: "เข้ม", next: { result: "ลาเต้" } },
                { label: "กลาง", value: "กลาง", next: { result: "ลาเต้" } },
                { label: "เบา", value: "เบา", next: { result: "แฟลตไวท์" } },
              ],
            },
          },
          {
            label: "น้อย",
            value: "น้อย",
            next: {
              question: "คุณต้องการกาแฟอุณหภูมิแบบไหน?",
              key: "temperature",
              options: [
                { label: "ร้อน", value: "ร้อน", next: { result: "เอสเพรสโซ" } },
                { label: "เย็น", value: "เย็น", next: { result: "อเมริกาโนเย็น" } },
                { label: "อุ่น", value: "อุ่น", next: { result: "คาปูชิโน" } },
              ],
            },
          },
          { label: "ปานกลาง", value: "ปานกลาง", next: { result: "แฟลตไวท์" } },
        ],
      },
    },
    {
      label: "หวาน",
      value: "หวาน",
      next: {
        question: "คุณต้องการระดับคาเฟอีนเท่าไหร่?",
        key: "caffeineLevel",
        options: [
          { label: "สูง", value: "สูง", next: { result: "มักคิอาโต" } },
          {
            label: "ปานกลาง",
            value: "ปานกลาง",
            next: {
              question: "คุณชอบเพิ่มช็อกโกแลตในกาแฟหรือไม่?",
              key: "chocolate",
              options: [
                { label: "ใช่", value: "ใช่", next: { result: "มอคค่า" } },
                { label: "ไม่", value: "ไม่", next: { result: "มอคค่า" } },
              ],
            },
          },
          {
            label: "ต่ำ",
            value: "ต่ำ",
            next: {
              question: "คุณชอบกาแฟที่มีนมมากหรือน้อย?",
              key: "milkSweet",
              options: [
                { label: "มาก", value: "มาก", next: { result: "อัฟฟอกาโต" } },
                { label: "น้อย", value: "น้อย", next: { result: "คอร์ทาโด" } },
              ],
            },
          },
          { label: "ไม่แน่ใจ", value: "ไม่แน่ใจ", next: { result: "ริสเตรตโต" } },
        ],
      },
    },
    {
      label: "กลมกล่อม",
      value: "กลมกล่อม",
      next: {
        question: "คุณชอบฟองนมกาแฟแบบไหน?",
        key: "foam",
        options: [
          { label: "หนา", value: "หนา", next: { result: "คาปูชิโน" } },
          { label: "บาง", value: "บาง", next: { result: "คาปูชิโน" } },
        ],
      },
    },
    {
      label: "เปรี้ยว",
      value: "เปรี้ยว",
      next: {
        question: "คุณชอบกาแฟเปรี้ยวระดับไหน?",
        key: "sourIntensity",
        options: [
          { label: "จัด", value: "จัด", next: { result: "เอสเพรสโซ" } },
          { label: "ปานกลาง", value: "ปานกลาง", next: { result: "ลาเต้ซิตริค" } },
          { label: "เบาๆ", value: "เบาๆ", next: { result: "อเมริกาโนเปรี้ยว" } },
        ],
      },
    },
  ],
};

// ---------- Helpers ----------
const longestDepth = (node) => {
  if (!node) return 0;
  if ("result" in node) return 0;
  if (!node.options) return 1;
  return 1 + Math.max(...node.options.map((o) => longestDepth(o.next)));
};

const toArray = (t) => (Array.isArray(t) ? t : t ? [t] : []);

const getTagsFromItem = (item) => {
  const t = toArray(item.type);
  const tests = (item.tests || "").split(/[,\s]+/).filter(Boolean);
  const unique = [...new Set([...t, ...tests])];
  return unique.slice(0, 3);
};

export default function Suggestion() {
  const [currentNode, setCurrentNode] = useState(decisionTree);
  const [path, setPath] = useState([]); // เก็บ node ที่ผ่านมา
  const [answers, setAnswers] = useState({}); // เก็บคำตอบแบบ key:value
  const [result, setResult] = useState("");
  const [currentSelection, setCurrentSelection] = useState(null);
  const navigate = useNavigate();

  const maxSteps = useMemo(() => longestDepth(decisionTree), []);
  const stepsDone = result ? maxSteps : path.length + 1; // ประมาณความคืบหน้าในโครงคำถาม

  // จัดการคีย์บอร์ด: Enter = Next, Esc/Backspace = Back
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Enter" && currentSelection && !result) handleNextOption();
      if ((e.key === "Escape" || e.key === "Backspace") && path.length > 0 && !result) handleBack();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [currentSelection, path, result]);

  const handleOptionSelect = (option) => {
    setCurrentSelection(option);
  };

  const handleNextOption = () => {
    if (!currentSelection) return;
    setAnswers((prev) => ({ ...prev, [currentNode.key]: currentSelection.value }));
    setPath((prev) => [...prev, currentNode]);

    if (currentSelection.next.result) {
      setResult(currentSelection.next.result);
      setCurrentNode(null);
    } else {
      setCurrentNode(currentSelection.next);
    }
    setCurrentSelection(null);
  };

  const handleBack = () => {
    if (path.length === 0) return;
    const prev = path[path.length - 1];
    setPath((p) => p.slice(0, p.length - 1));
    setCurrentNode(prev);
    setCurrentSelection(null);
    setResult("");
  };

  const resetAll = () => {
    setCurrentNode(decisionTree);
    setPath([]);
    setAnswers({});
    setResult("");
    setCurrentSelection(null);
  };

  // หาเมนูที่แนะนำ
  const recommendedItem = result ? menuItems.find((i) => i.name === result) : null;

  // เมนูใกล้เคียง (type ซ้อนกันอย่างน้อยหนึ่งตัว)
  const relatedItems = useMemo(() => {
    if (!recommendedItem) return [];
    const baseTypes = toArray(recommendedItem.type);
    return menuItems
      .filter(
        (i) =>
          i.name !== recommendedItem.name &&
          toArray(i.type).some((t) => baseTypes.includes(t))
      )
      .slice(0, 3);
  }, [recommendedItem]);

  const handleViewDetails = (item) => navigate("/coffee_menu", { state: item });

  return (
    <div className="min-h-screen bg-[url('/background.jpg')] bg-cover bg-center bg-white/80 bg-blend-overlay">
      <Navbar />

      {/* Decor */}
      <div className="pointer-events-none fixed -top-16 -left-16 h-48 w-48 rounded-full bg-[#d4a373]/25 blur-2xl" />
      <div className="pointer-events-none fixed -bottom-16 -right-16 h-64 w-64 rounded-full bg-[#6f4e37]/15 blur-2xl" />

      <main className="mx-auto max-w-5xl px-4 py-10">
        <div className="relative rounded-3xl bg-white/90 backdrop-blur shadow-[0_20px_60px_rgba(0,0,0,0.12)] p-6 md:p-8">

          {/* Stepper + Progress */}
          {!result && (
            <>
              <div className="mb-6">
                <div className="flex items-center justify-between text-xs text-neutral-600">
                  {Array.from({ length: maxSteps }).map((_, i) => (
                    <span key={i} className={`h-2 flex-1 mx-1 rounded-full ${i < stepsDone ? "bg-[#6f4e37]" : "bg-neutral-200"}`} />
                  ))}
                </div>
                <div className="mt-2 text-sm text-neutral-600">
                  ขั้นตอนที่ {Math.min(stepsDone, maxSteps)} / {maxSteps}
                </div>
              </div>

              {/* สรุปคำตอบที่เลือกแล้ว (breadcrumb) */}
              {Object.keys(answers).length > 0 && (
                <div className="mb-5 flex flex-wrap gap-2">
                  {Object.entries(answers).map(([k, v], idx) => (
                    <span key={idx} className="rounded-full border border-[#6f4e37]/25 bg-[#6f4e37]/5 px-3 py-1 text-xs text-[#2a1c14]">
                      {k}: <span className="font-semibold">{v}</span>
                    </span>
                  ))}
                </div>
              )}
            </>
          )}

          {/* คำถาม & ตัวเลือก */}
          {!result ? (
            <>
              <h2 className="text-center text-2xl md:text-3xl font-bold text-[#2a1c14]">
                {currentNode ? currentNode.question : "กรุณาตอบคำถาม"}
              </h2>

              {currentNode && (
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentNode.options.map((op) => {
                    const active = currentSelection?.value === op.value;
                    return (
                      <button
                        key={op.value}
                        onClick={() => handleOptionSelect(op)}
                        className={`group rounded-2xl border px-4 py-4 text-left transition
                          ${active
                            ? "border-[#6f4e37] bg-[#6f4e37] text-white shadow-md"
                            : "border-black/10 bg-white text-[#2a1c14] hover:bg-black/5"}`}
                      >
                        <span className="block font-semibold">{op.label}</span>
                        {op.next?.result && (
                          <span className={`mt-1 block text-xs ${active ? "text-white/90" : "text-neutral-500"}`}>
                            ผลลัพธ์ปลายทาง: {op.next.result}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="mt-6 flex items-center justify-between">
                <div>
                  {path.length > 0 && (
                    <button
                      onClick={handleBack}
                      className="rounded-full border border-black/10 bg-white px-5 py-2 text-sm text-[#2a1c14] hover:bg-black/5"
                    >
                      ย้อนกลับ
                    </button>
                  )}
                </div>
                <div className="ml-auto flex gap-2">
                  <button
                    onClick={resetAll}
                    className="rounded-full border border-black/10 bg-white px-5 py-2 text-sm text-[#2a1c14] hover:bg-black/5"
                  >
                    เริ่มใหม่
                  </button>
                  <button
                    onClick={handleNextOption}
                    disabled={!currentSelection}
                    className={`rounded-full px-6 py-2 text-sm font-semibold text-white shadow
                      ${currentSelection ? "bg-[#6f4e37] hover:opacity-90" : "bg-neutral-400 cursor-not-allowed"}`}
                  >
                    ถัดไป
                  </button>
                </div>
              </div>
            </>
          ) : (
            // ---------- ผลลัพธ์ ----------
            <div className="text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-[#2a1c14]">กาแฟที่แนะนำสำหรับคุณ</h2>

              <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* รูป */}
                <figure className="lg:col-span-5">
                  <div className="relative h-72 md:h-80 rounded-2xl overflow-hidden shadow-[0_12px_32px_rgba(0,0,0,0.12)]">
                    <img
                      src={recommendedItem?.img || "/defult-coffeecup.png"}
                      alt={recommendedItem?.name || "Coffee"}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                    <figcaption className="absolute bottom-4 left-4 right-4 text-left text-white">
                      <span className="rounded-full bg-white/85 px-3 py-1 text-[11px] text-neutral-800">
                        {recommendedItem?.cafeid || "แนะนำ"}
                      </span>
                      <h3 className="mt-2 text-xl md:text-2xl font-bold drop-shadow">{result}</h3>
                    </figcaption>
                  </div>
                </figure>

                {/* รายละเอียด */}
                <article className="lg:col-span-7 text-left">
                  <div className="rounded-xl bg-[#faf6f3] p-4">
                    <h3 className="font-semibold text-[#2a1c14]">รายละเอียด</h3>
                    <p className="mt-1 text-neutral-700">
                      {recommendedItem?.details || "ไม่มีข้อมูล"}
                    </p>
                  </div>

                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="rounded-xl border border-black/10 bg-white p-4">
                      <div className="text-xs text-neutral-500">ระดับความเข้ม</div>
                      <div className="mt-1 font-semibold text-[#2a1c14]">{recommendedItem?.cafeid || "-"}</div>
                    </div>
                    <div className="rounded-xl border border-black/10 bg-white p-4">
                      <div className="text-xs text-neutral-500">คาเฟอีน</div>
                      <div className="mt-1 font-semibold text-[#2a1c14]">{recommendedItem?.caffeine || "-"}</div>
                    </div>
                    <div className="rounded-xl border border-black/10 bg-white p-4">
                      <div className="text-xs text-neutral-500">แคลอรี่</div>
                      <div className="mt-1 font-semibold text-[#2a1c14]">{recommendedItem?.calories || "-"}</div>
                    </div>
                  </div>

                  {/* แท็กจาก type/tests */}
                  {recommendedItem && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {getTagsFromItem(recommendedItem).map((t, i) => (
                        <span
                          key={`${t}-${i}`}
                          className="rounded-full border border-[#6f4e37]/25 bg-[#6f4e37]/5 px-2.5 py-1 text-[11px] text-[#6f4e37]"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-6 flex flex-wrap gap-3">
                    {recommendedItem && (
                      <button
                        onClick={() => handleViewDetails(recommendedItem)}
                        className="rounded-full bg-[#6f4e37] px-6 py-3 text-sm font-semibold text-white shadow hover:opacity-90"
                      >
                        ดูข้อมูลเมนูนี้
                      </button>
                    )}
                    <button
                      onClick={resetAll}
                      className="rounded-full border border-black/10 bg-white px-6 py-3 text-sm text-[#2a1c14] hover:bg-black/5"
                    >
                      เลือกใหม่
                    </button>
                  </div>
                </article>
              </div>

              {/* เมนูใกล้เคียง */}
              {relatedItems.length > 0 && (
                <div className="mt-10 text-left">
                  <h3 className="text-lg md:text-xl font-bold text-[#2a1c14] mb-3">เมนูใกล้เคียง</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {relatedItems.map((it, i) => (
                      <button
                        key={`${it.name}-${i}`}
                        type="button"
                        className="group relative overflow-hidden rounded-2xl bg-white shadow hover:shadow-xl transition text-left w-full"
                        onClick={() => it && handleViewDetails(it)}
                      >
                        <div className="relative h-40 w-full">
                          <img
                            src={it.img}
                            alt={it.name}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                          {it.cafeid && (
                            <span className="absolute left-3 top-3 rounded-full bg-white/85 px-2.5 py-1 text-[11px] text-neutral-800">
                              {it.cafeid}
                            </span>
                          )}
                          <div className="absolute bottom-3 left-3 right-3 text-white drop-shadow">
                            <h4 className="font-semibold leading-tight line-clamp-2">{it.name}</h4>
                          </div>
                        </div>
                        <div className="p-3 flex flex-wrap justify-end gap-2">
                          {getTagsFromItem(it).map((t, idx) => (
                            <span key={`${t}-${idx}`} className="rounded-full border border-[#6f4e37]/25 bg-[#6f4e37]/5 px-2 py-0.5 text-[10px] text-[#6f4e37]">
                              {t}
                            </span>
                          ))}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
