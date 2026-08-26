import { useEffect, useMemo, useState, useCallback } from "react";
import Navbar from "../components/Navbar";
import BackToTop from "../components/BackToTop";
import { updateUserAchievement } from "../api/achievementApi";
import AOS from "aos";
import "aos/dist/aos.css";
import { useAuth } from "../contexts/AuthContext";
import { fetchProcessSteps } from "../api/contentApi";
import FetchError from "../components/FetchError";

const SkeletonBlock = ({ className }) => (
  <div className={`animate-pulse bg-gray-200 rounded-xl ${className}`} />
);

function Process() {
  const [selectedIcon, setSelectedIcon] = useState("cherry");
  const [icons, setIcons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fetchSignal, setFetchSignal] = useState(0);
  const { user } = useAuth();
  const uid = user?.uid ?? null;

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchProcessSteps()
      .then(setIcons)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [fetchSignal]);

  useEffect(() => {
    AOS.init({ duration: 800, once: true, easing: "ease-out" });
  }, []);

  useEffect(() => {
    if (!uid) return;
    const onScroll = () => {
      const H = document.documentElement.scrollHeight;
      const vh = window.innerHeight;
      if (window.scrollY + vh >= H - 100) {
        updateUserAchievement(uid, "content", "process_coffee", true);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [uid]);

  const currentIndex = useMemo(
    () => Math.max(0, icons.findIndex((i) => i.name === selectedIcon)),
    [selectedIcon, icons]
  );

  const goStep = useCallback(
    (dir) => {
      const next = (currentIndex + dir + icons.length) % icons.length;
      setSelectedIcon(icons[next].name);
      window.scrollTo({ top: 200, behavior: "smooth" });
    },
    [currentIndex, icons]
  );

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight") goStep(1);
      if (e.key === "ArrowLeft") goStep(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goStep]);

  if (error) return (
    <div className="bg-[#f3f1ec] dark:bg-dark-brown min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow flex items-center justify-center">
        <FetchError onRetry={() => setFetchSignal((s) => s + 1)} />
      </div>
    </div>
  );

  if (loading) return (
    <div className="bg-[#f3f1ec] dark:bg-dark-brown min-h-screen flex flex-col">
      <Navbar />
      <div className="h-[34vh] animate-pulse bg-gray-300" />
      <div className="mx-auto max-w-7xl w-full px-4 md:px-8 py-8 space-y-6">
        <div className="flex items-center justify-between gap-4 max-w-3xl mx-auto">
          {[...Array(4)].map((_, i) => <SkeletonBlock key={i} className="h-14 w-14 rounded-full" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <SkeletonBlock className="lg:col-span-6 h-80" />
          <SkeletonBlock className="lg:col-span-6 h-80" />
        </div>
      </div>
    </div>
  );

  const active = icons[currentIndex];
  const progressPct = icons.length > 1 ? (currentIndex / (icons.length - 1)) * 100 : 0;

  return (
    <div className="bg-[#f3f1ec] dark:bg-dark-brown">
      <Navbar />
      <BackToTop />

      {/* HERO */}
      <header className="relative isolate overflow-hidden" data-aos="fade-up">
        <img src={active.img} alt="" className="absolute inset-0 h-[34vh] w-full object-cover transition-all duration-500" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 md:px-8 h-[34vh] flex items-end pb-10">
          <div className="text-white">
            <span className="inline-block rounded-full bg-white/20 backdrop-blur text-white text-xs font-medium px-4 py-1 mb-3 tracking-widest uppercase">
              Coffee Process
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight drop-shadow">กระบวนการกาแฟ</h1>
            <p className="mt-1 text-white/90 drop-shadow-sm">ไล่ดูทีละขั้น ตั้งแต่เก็บผลเชอร์รี่ คั่ว บด จนถึงการสกัด</p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 md:px-8 py-8">

        {/* STEP INDICATOR */}
        <section className="relative mb-8" data-aos="fade-up">
          {/* เส้นพื้นหลัง — top ปรับตามขนาดปุ่ม (mobile=20px, sm+=28px) */}
          <div className="absolute left-1/2 top-[20px] sm:top-[28px] -translate-x-1/2 h-1.5 w-full max-w-3xl bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#6f4e37] to-[#c47a3a] rounded-full transition-[width] duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          {/* จุด (ปุ่ม) */}
          <ul className="relative z-10 mx-auto flex w-full max-w-3xl items-start justify-between">
            {icons.map((icon, idx) => {
              const isActive = icon.name === selectedIcon;
              const isDone = idx < currentIndex;
              return (
                <li key={icon.id} className="flex flex-col items-center gap-1.5 sm:gap-2">
                  <button
                    onClick={() => setSelectedIcon(icon.name)}
                    className={[
                      "relative grid place-items-center size-10 sm:size-14 rounded-full border-2 transition-all duration-200 shadow-sm",
                      isActive
                        ? "bg-white dark:bg-[#2b2015] border-[#6f4e37] dark:border-beige ring-2 sm:ring-4 ring-[#6f4e37]/25 dark:ring-beige/25 scale-110 shadow-md"
                        : isDone
                        ? "bg-[#6f4e37]/10 dark:bg-beige/10 border-[#6f4e37]/50 dark:border-beige/50 hover:border-[#6f4e37] dark:hover:border-beige"
                        : "bg-white/90 dark:bg-white/5 border-black/10 dark:border-brown-superlight/20 hover:border-[#6f4e37]/40 dark:hover:border-beige/40",
                    ].join(" ")}
                    aria-current={isActive ? "step" : undefined}
                    aria-label={icon.alt}
                    title={icon.alt}
                  >
                    <img src={icon.image} alt="" className="h-5 w-5 sm:h-8 sm:w-8 object-contain" />
                    {/* step number badge */}
                    <span
                      className={[
                        "absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 rounded-full text-[9px] sm:text-[10px] flex items-center justify-center font-bold shadow",
                        isActive ? "bg-[#6f4e37] dark:bg-beige text-white dark:text-dark-brown" : "bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-brown-superlight/50",
                      ].join(" ")}
                    >
                      {idx + 1}
                    </span>
                  </button>
                  <span
                    className={[
                      "text-[10px] sm:text-[11px] md:text-xs text-center max-w-[52px] sm:max-w-[64px] leading-tight",
                      isActive ? "text-[#6f4e37] dark:text-beige font-bold" : "text-black/50 dark:text-brown-superlight/50",
                    ].join(" ")}
                  >
                    {icon.alt}
                  </span>
                </li>
              );
            })}
          </ul>

          <div className="mt-3 text-center text-xs text-black/50 dark:text-brown-superlight/50 font-medium">
            ขั้นตอน {currentIndex + 1} / {icons.length}
          </div>
        </section>

        {/* ปุ่มนำทาง */}
        <div className="mb-7 flex items-center justify-center gap-3" data-aos="fade-up">
          <button
            onClick={() => goStep(-1)}
            className="flex items-center gap-2 rounded-full border border-black/10 dark:border-brown-superlight/20 bg-white dark:bg-white/5 px-5 py-2.5 text-sm font-medium text-[#2a1c14] dark:text-brown-superlight hover:bg-[#f7efe6] dark:hover:bg-white/10 hover:border-[#7b4b29]/30 dark:hover:border-beige/30 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-200 ease-smooth shadow-sm"
          >
            <span className="text-base">←</span> ย้อนกลับ
          </button>
          <span className="text-xs text-black/30 dark:text-brown-superlight/30 hidden md:block">หรือกดแป้น ← →</span>
          <button
            onClick={() => goStep(1)}
            className="flex items-center gap-2 rounded-full bg-[#6f4e37] text-white px-5 py-2.5 text-sm font-medium hover:bg-[#5c3a1e] hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:scale-95 transition-all duration-200 ease-smooth shadow-md"
          >
            ถัดไป <span className="text-base">→</span>
          </button>
        </div>

        {/* การ์ดเนื้อหา */}
        <section key={selectedIcon} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch animate-fade-in-up">
          {/* รูป */}
          <figure className="lg:col-span-6">
            <div className="relative h-full w-full min-h-[300px] rounded-2xl overflow-hidden shadow-xl ring-1 ring-black/5">
              <img
                src={active.img}
                alt={active.alt}
                className="h-full w-full object-cover hover:scale-105 transition-transform duration-700"
              />
              <span className="absolute bottom-3 left-3 rounded-full bg-black/50 backdrop-blur text-white px-3 py-1 text-[11px]">
                {active.alt}
              </span>
            </div>
          </figure>

          {/* ข้อความ */}
          <article className="lg:col-span-6">
            <div className="h-full bg-white dark:bg-[#2b2015] rounded-2xl shadow-md ring-1 ring-black/5 dark:ring-brown-superlight/10 p-6 flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <span className="flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br from-[#f7efe6] to-[#ede0d0] dark:from-white/10 dark:to-white/5 text-[#6f4e37] dark:text-beige font-bold text-lg shadow-sm">
                  {currentIndex + 1}
                </span>
                <div className="border-l-4 border-[#6f4e37] dark:border-beige pl-4">
                  <p className="text-[10px] uppercase tracking-widest text-[#6f4e37]/60 dark:text-beige/60">Step {currentIndex + 1}</p>
                  <h2 className="text-xl md:text-2xl font-bold text-[#2a1c14] dark:text-brown-superlight">{active.alt}</h2>
                </div>
              </div>
              <p className="leading-8 text-neutral-700 dark:text-brown-superlight/80 flex-1">{active.content}</p>

              {/* mini progress dots */}
              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-white/10 flex gap-1.5">
                {icons.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => { setSelectedIcon(icons[i].name); }}
                    className={[
                      "h-1.5 rounded-full transition-all duration-300",
                      i === currentIndex ? "bg-[#6f4e37] dark:bg-beige w-6" : i < currentIndex ? "bg-[#6f4e37]/40 dark:bg-beige/40 w-3" : "bg-gray-200 dark:bg-white/10 w-3",
                    ].join(" ")}
                    aria-label={`ขั้นที่ ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </article>
        </section>
      </div>

    </div>
  );
}

export default Process;
