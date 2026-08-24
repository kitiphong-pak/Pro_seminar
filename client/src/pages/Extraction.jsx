import { useEffect, useState, useCallback } from "react";
import Navbar from "../components/Navbar";
import BackToTop from "../components/BackToTop";
import AOS from "aos";
import "aos/dist/aos.css";
import { updateUserAchievement } from "../api/achievementApi";
import { useAuth } from "../contexts/AuthContext";
import { fetchExtraction } from "../api/contentApi";
import FetchError from "../components/FetchError";

function Extraction() {
  const [methods, setMethods] = useState([]);
  const [activeId, setActiveId] = useState("");
  const [tocOpen, setTocOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fetchSignal, setFetchSignal] = useState(0);
  const { user } = useAuth();
  const uid = user?.uid ?? null;

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchExtraction()
      .then((data) => {
        setMethods(data);
        if (data.length > 0) setActiveId(data[0].id);
      })
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
      if (window.scrollY + vh >= H - 100)
        updateUserAchievement(uid, "content", "extraction_coffee", true);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [uid]);

  const scrollToId = useCallback((id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setTocOpen(false);
  }, []);

  // scroll spy
  useEffect(() => {
    if (!methods.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] }
    );
    methods.forEach((m) => {
      const el = document.getElementById(m.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [methods]);

  if (error) return (
    <div className="bg-[#f3f1ec] min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow flex items-center justify-center">
        <FetchError onRetry={() => setFetchSignal((s) => s + 1)} />
      </div>
    </div>
  );

  if (loading) return (
    <div className="bg-[#f3f1ec] min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow flex items-center justify-center">
        <div className="space-y-4 w-full max-w-4xl px-4">
          <div className="h-8 rounded-xl bg-[#e0d8ce] animate-pulse w-1/4" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-52 rounded-2xl bg-[#e0d8ce] animate-pulse" />
              <div className="h-52 rounded-2xl bg-[#e0d8ce] animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-[#f3f1ec] min-h-screen">
      <Navbar />
      <BackToTop />

      {/* HERO */}
      <header className="relative isolate overflow-hidden">
        <img
          src="/extraction/extraction.jpg"
          className="absolute inset-0 h-[36vh] w-full object-cover"
          alt="Coffee Extraction"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/35 to-black/0" />
        <div className="relative mx-auto max-w-7xl px-4 md:px-8 h-[36vh] flex items-center">
          <div className="text-white">
            <h1 className="text-3xl md:text-5xl font-extrabold">วิธีการสกัดกาแฟ</h1>
            <p className="mt-2 text-white/90">
              สำรวจวิธีชงหลัก ตั้งแต่ดริปที่สะอาดใสไปจนถึงเอสเปรสโซ่ที่เข้มข้น
            </p>
          </div>
        </div>
      </header>

      {/* Layout: Sidebar + Content */}
      <div className="mx-auto max-w-7xl px-4 md:px-8 py-8 lg:grid lg:grid-cols-[260px_1fr] lg:gap-10">

        {/* Sidebar – desktop */}
        <aside className="hidden lg:block">
          <div className="sticky top-20 rounded-2xl border border-black/5 bg-white shadow">
            <div className="px-4 py-3 border-b text-sm font-semibold text-[#2a1c14]">
              สารบัญวิธีชง
            </div>
            <nav className="p-2">
              <ul className="space-y-1">
                {methods.map((m) => (
                  <li key={m.id}>
                    <button
                      onClick={() => scrollToId(m.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                        activeId === m.id
                          ? "bg-[#2a1c14] text-white"
                          : "text-[#2a1c14] hover:bg-black/5"
                      }`}
                    >
                      {m.title}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </aside>

        {/* Content */}
        <main className="space-y-10">
          {methods.map((m, idx) => {
            const isRight = idx % 2 !== 0;
            return (
              <section
                key={m.id}
                id={m.id}
                className="scroll-mt-24"
                data-aos={isRight ? "fade-left" : "fade-right"}
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                  <figure className={`lg:col-span-6 ${isRight ? "order-2 lg:order-1" : ""}`}>
                    <div className="relative h-full w-full min-h-[320px] rounded-2xl overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.14)]">
                      <img
                        src={m.image}
                        alt={m.title}
                        className="h-full w-full object-cover"
                      />
                      <span className="absolute bottom-3 left-3 rounded-full bg-white/85 px-3 py-1 text-[11px] text-neutral-700">
                        {m.title}
                      </span>
                    </div>
                  </figure>
                  <article className={`lg:col-span-6 ${isRight ? "order-1 lg:order-2" : ""}`}>
                    <div className="h-full bg-white rounded-2xl shadow p-6 flex flex-col">
                      <h2 className="text-xl md:text-2xl font-bold mb-4 text-[#2a1c14]">
                        {m.title}
                      </h2>
                      <p className="text-gray-700 leading-relaxed flex-1">{m.description}</p>
                    </div>
                  </article>
                </div>
              </section>
            );
          })}

          {/* อ้างอิง */}
          <div className="pt-2 text-sm text-[#2a1c14]/80">
            ที่มา :{" "}
            <a
              className="underline decoration-dotted hover:opacity-80"
              href="https://www.koffeemart.com/article/12/วิธีการชงกาแฟ-9-แบบ-ที่เราควรรู้"
              target="_blank"
              rel="noreferrer"
            >
              https://www.koffeemart.com/article/12/วิธีการชงกาแฟ-9-แบบ-ที่เราควรรู้
            </a>
          </div>
        </main>
      </div>

      {/* ปุ่มสารบัญ – มือถือ */}
      <button
        onClick={() => setTocOpen(true)}
        className="lg:hidden fixed right-4 bottom-4 z-30 rounded-full bg-[#2a1c14] text-white px-4 py-3 shadow"
        aria-label="สารบัญ"
      >
        สารบัญ
      </button>

      {/* Modal สารบัญ – มือถือ */}
      {tocOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/40" onClick={() => setTocOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 rounded-t-2xl bg-white shadow-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-[#2a1c14]">สารบัญวิธีชง</span>
              <button className="text-sm text-[#2a1c14]/70" onClick={() => setTocOpen(false)}>ปิด</button>
            </div>
            <div className="grid grid-cols-1 divide-y">
              {methods.map((m) => (
                <button
                  key={m.id}
                  onClick={() => scrollToId(m.id)}
                  className={`w-full text-left py-3 text-sm ${
                    activeId === m.id ? "text-[#2a1c14] font-semibold" : "text-neutral-700"
                  }`}
                >
                  {m.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Extraction;
