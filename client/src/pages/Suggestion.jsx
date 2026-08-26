import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import BackToTop from "../components/BackToTop";
import FetchError from "../components/FetchError";
import { fetchMenus } from "../api/contentApi";

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
  const [menuItems, setMenuItems] = useState([]);
  const [menuError, setMenuError] = useState(null);
  const [fetchSignal, setFetchSignal] = useState(0);
  const [currentNode, setCurrentNode] = useState(decisionTree);
  const [path, setPath] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState("");
  const [currentSelection, setCurrentSelection] = useState(null);

  useEffect(() => {
    setMenuError(null);
    fetchMenus()
      .then(setMenuItems)
      .catch(() => setMenuError(true));
  }, [fetchSignal]);
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
  }, [menuItems, recommendedItem]);

  const handleViewDetails = (item) => navigate("/coffee_menu", { state: item });

  return (
    <div className="min-h-screen bg-[#f3f1ec] dark:bg-dark-brown flex flex-col">
      <Navbar />
      <BackToTop />

      {/* HERO */}
      <header className="relative isolate overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#4b2f1a] via-[#7b4b29] to-[#d9c4aa]" />
        <div className="relative mx-auto max-w-5xl px-4 md:px-8 h-[22vh] flex items-center">
          <div className="text-white">
            <p className="uppercase tracking-widest text-xs text-white/70 mb-1">Coffee Suggestion</p>
            <h1 className="text-2xl md:text-4xl font-extrabold">ไม่รู้จะสั่งอะไร ให้เราช่วยเลือก</h1>
            <p className="mt-1 text-white/80 text-sm">ตอบคำถามสั้น ๆ 3 ข้อ แล้วรับคำแนะนำเมนูทันที</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10 flex-1 w-full">
        <div className="relative rounded-3xl bg-white/90 dark:bg-[#2b2015]/95 backdrop-blur shadow-[0_20px_60px_rgba(0,0,0,0.12)] p-6 md:p-8">

          {/* Stepper + Progress */}
          {!result && (
            <>
              <div className="mb-6">
                <div className="flex items-center justify-between text-xs text-neutral-600 dark:text-brown-superlight/60">
                  {Array.from({ length: maxSteps }).map((_, i) => (
                    <span key={i} className={`h-2 flex-1 mx-1 rounded-full transition-colors duration-300 ${i < stepsDone ? "bg-[#6f4e37]" : "bg-neutral-200 dark:bg-white/10"}`} />
                  ))}
                </div>
                <div className="mt-2 text-sm text-neutral-600 dark:text-brown-superlight/60">
                  ขั้นตอนที่ {Math.min(stepsDone, maxSteps)} / {maxSteps}
                </div>
              </div>

              {/* สรุปคำตอบที่เลือกแล้ว (breadcrumb) */}
              {Object.keys(answers).length > 0 && (
                <div className="mb-5 flex flex-wrap gap-2">
                  {Object.entries(answers).map(([k, v], idx) => (
                    <span key={idx} className="rounded-full border border-[#6f4e37]/25 dark:border-beige/30 bg-[#6f4e37]/5 dark:bg-beige/10 px-3 py-1 text-xs text-[#2a1c14] dark:text-beige animate-fade-in">
                      {k}: <span className="font-semibold">{v}</span>
                    </span>
                  ))}
                </div>
              )}
            </>
          )}

          {/* คำถาม & ตัวเลือก */}
          {!result ? (
            <div key={currentNode?.question ?? "no-question"}>
              <h2 className="text-center text-2xl md:text-3xl font-bold text-[#2a1c14] dark:text-brown-superlight animate-fade-in-up">
                {currentNode ? currentNode.question : "กรุณาตอบคำถาม"}
              </h2>

              {currentNode && (
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-fade-in-up">
                  {currentNode.options.map((op) => {
                    const active = currentSelection?.value === op.value;
                    return (
                      <button
                        key={op.value}
                        onClick={() => handleOptionSelect(op)}
                        className={`group rounded-2xl border px-4 py-4 text-left transition-all duration-200 ease-smooth active:scale-[.98]
                          ${active
                            ? "border-[#6f4e37] bg-[#6f4e37] text-white shadow-md scale-[1.02]"
                            : "border-black/10 dark:border-brown-superlight/20 bg-white dark:bg-white/5 text-[#2a1c14] dark:text-brown-superlight hover:bg-black/5 dark:hover:bg-white/10 hover:-translate-y-0.5 hover:shadow-sm"}`}
                      >
                        <span className="block font-semibold">{op.label}</span>
                        {op.next?.result && (
                          <span className={`mt-1 block text-xs ${active ? "text-white/90" : "text-neutral-500 dark:text-brown-superlight/50"}`}>
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
                      className="rounded-full border border-black/10 dark:border-brown-superlight/20 bg-white dark:bg-white/5 px-5 py-2 text-sm text-[#2a1c14] dark:text-brown-superlight transition-all duration-200 ease-smooth hover:bg-black/5 dark:hover:bg-white/10 active:scale-95"
                    >
                      ย้อนกลับ
                    </button>
                  )}
                </div>
                <div className="ml-auto flex gap-2">
                  <button
                    onClick={resetAll}
                    className="rounded-full border border-black/10 dark:border-brown-superlight/20 bg-white dark:bg-white/5 px-5 py-2 text-sm text-[#2a1c14] dark:text-brown-superlight transition-all duration-200 ease-smooth hover:bg-black/5 dark:hover:bg-white/10 active:scale-95"
                  >
                    เริ่มใหม่
                  </button>
                  <button
                    onClick={handleNextOption}
                    disabled={!currentSelection}
                    className={`rounded-full px-6 py-2 text-sm font-semibold text-white shadow transition-all duration-200 ease-smooth
                      ${currentSelection ? "bg-[#6f4e37] hover:opacity-90 hover:-translate-y-0.5 active:translate-y-0 active:scale-95" : "bg-neutral-400 dark:bg-white/10 cursor-not-allowed"}`}
                  >
                    ถัดไป
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // ---------- ผลลัพธ์ ----------
            <div className="text-center animate-fade-in-up">
              <h2 className="text-2xl md:text-3xl font-bold text-[#2a1c14] dark:text-brown-superlight">กาแฟที่แนะนำสำหรับคุณ</h2>

              {menuError && (
                <div className="mt-4">
                  <FetchError onRetry={() => setFetchSignal((s) => s + 1)} />
                </div>
              )}

              {!menuError && <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
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
                  <div className="rounded-xl bg-[#faf6f3] dark:bg-white/5 p-4">
                    <h3 className="font-semibold text-[#2a1c14] dark:text-brown-superlight">รายละเอียด</h3>
                    <p className="mt-1 text-neutral-700 dark:text-brown-superlight/80">
                      {recommendedItem?.details || "ไม่มีข้อมูล"}
                    </p>
                  </div>

                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="rounded-xl border border-black/10 dark:border-brown-superlight/15 bg-white dark:bg-white/5 p-4">
                      <div className="text-xs text-neutral-500 dark:text-brown-superlight/50">ระดับความเข้ม</div>
                      <div className="mt-1 font-semibold text-[#2a1c14] dark:text-brown-superlight">{recommendedItem?.cafeid || "-"}</div>
                    </div>
                    <div className="rounded-xl border border-black/10 dark:border-brown-superlight/15 bg-white dark:bg-white/5 p-4">
                      <div className="text-xs text-neutral-500 dark:text-brown-superlight/50">คาเฟอีน</div>
                      <div className="mt-1 font-semibold text-[#2a1c14] dark:text-brown-superlight">{recommendedItem?.caffeine || "-"}</div>
                    </div>
                    <div className="rounded-xl border border-black/10 dark:border-brown-superlight/15 bg-white dark:bg-white/5 p-4">
                      <div className="text-xs text-neutral-500 dark:text-brown-superlight/50">แคลอรี่</div>
                      <div className="mt-1 font-semibold text-[#2a1c14] dark:text-brown-superlight">{recommendedItem?.calories || "-"}</div>
                    </div>
                  </div>

                  {/* แท็กจาก type/tests */}
                  {recommendedItem && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {getTagsFromItem(recommendedItem).map((t, i) => (
                        <span
                          key={`${t}-${i}`}
                          className="rounded-full border border-[#6f4e37]/25 dark:border-beige/30 bg-[#6f4e37]/5 dark:bg-beige/10 px-2.5 py-1 text-[11px] text-[#6f4e37] dark:text-beige"
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
                        className="rounded-full bg-[#6f4e37] px-6 py-3 text-sm font-semibold text-white shadow transition-all duration-200 ease-smooth hover:opacity-90 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:scale-95"
                      >
                        ดูข้อมูลเมนูนี้
                      </button>
                    )}
                    <button
                      onClick={resetAll}
                      className="rounded-full border border-black/10 dark:border-brown-superlight/20 bg-white dark:bg-white/5 px-6 py-3 text-sm text-[#2a1c14] dark:text-brown-superlight transition-all duration-200 ease-smooth hover:bg-black/5 dark:hover:bg-white/10 active:scale-95"
                    >
                      เลือกใหม่
                    </button>
                  </div>
                </article>
              </div>}

              {/* เมนูใกล้เคียง */}
              {relatedItems.length > 0 && (
                <div className="mt-10 text-left">
                  <h3 className="text-lg md:text-xl font-bold text-[#2a1c14] dark:text-brown-superlight mb-3">เมนูใกล้เคียง</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {relatedItems.map((it, i) => (
                      <button
                        key={`${it.name}-${i}`}
                        type="button"
                        style={{ animationDelay: `${i * 60}ms` }}
                        className="group relative overflow-hidden rounded-2xl bg-white dark:bg-[#2b2015] shadow hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-smooth text-left w-full animate-fade-in-up"
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
                            <span key={`${t}-${idx}`} className="rounded-full border border-[#6f4e37]/25 dark:border-beige/30 bg-[#6f4e37]/5 dark:bg-beige/10 px-2 py-0.5 text-[10px] text-[#6f4e37] dark:text-beige">
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
