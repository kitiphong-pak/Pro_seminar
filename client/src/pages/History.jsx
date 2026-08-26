import { useEffect, useState, useCallback } from "react";
import { Coffee } from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";
import { updateUserAchievement } from "../api/achievementApi";
import Navbar from "../components/Navbar";
import { useAuth } from "../contexts/AuthContext";
import { fetchHistory } from "../api/contentApi";
import FetchError from "../components/FetchError";

const SkeletonBlock = ({ className }) => (
  <div className={`animate-pulse bg-gray-200 rounded-xl ${className}`} />
);

function History() {
  const [progress, setProgress] = useState(0);
  const [historyData, setHistoryData] = useState(null);
  const [error, setError] = useState(null);
  const [fetchSignal, setFetchSignal] = useState(0);
  const { user } = useAuth();
  const uid = user?.uid ?? null;

  useEffect(() => {
    setError(null);
    fetchHistory()
      .then(setHistoryData)
      .catch(() => setError(true));
  }, [fetchSignal]);

  const scrollToId = useCallback((id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  useEffect(() => {
    if (!uid) return;
    const handleScroll = () => {
      if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 100)
        updateUserAchievement(uid, "content", "history_coffee");
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [uid]);

  useEffect(() => {
    AOS.init({ duration: 900, once: true, offset: 100, easing: "ease-out" });
    const refreshT = setTimeout(() => AOS.refresh(), 300);
    const onScroll = () => {
      const doc = document.documentElement;
      const total = doc.scrollHeight - window.innerHeight;
      setProgress(Math.max(0, Math.min(100, total > 0 ? (window.scrollY / total) * 100 : 0)));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { clearTimeout(refreshT); window.removeEventListener("scroll", onScroll); };
  }, []);

  if (error) return (
    <div className="min-h-screen bg-[#f3f1ec] dark:bg-dark-brown flex flex-col">
      <Navbar />
      <div className="flex-grow flex items-center justify-center">
        <FetchError onRetry={() => setFetchSignal((s) => s + 1)} />
      </div>
    </div>
  );

  if (!historyData) return (
    <div className="min-h-screen bg-[#f3f1ec] dark:bg-dark-brown flex flex-col">
      <Navbar />
      <div className="h-1 bg-gray-200 dark:bg-white/10" />
      <div className="h-28 bg-[#e8dfd6] dark:bg-[#2b2015] animate-pulse" />
      <SkeletonBlock className="w-full h-80 rounded-none" />
      <div className="mx-auto max-w-6xl w-full px-4 py-10 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <SkeletonBlock className="lg:col-span-7 h-48" />
          <SkeletonBlock className="lg:col-span-5 h-48" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <SkeletonBlock key={i} className="h-56" />)}
        </div>
      </div>
    </div>
  );

  const [origins, arab, firstcafe, europe, modern] = historyData.sections;

  return (
    <div className="min-h-screen bg-[#f3f1ec] dark:bg-dark-brown flex flex-col">
      {/* Reading progress bar */}
      <div className="fixed top-0 left-0 right-0 z-40 h-1 bg-gray-200/50 dark:bg-white/10">
        <div
          className="h-full bg-gradient-to-r from-[#7b4b29] to-[#c47a3a] origin-left transition-[width] duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>

      <Navbar />

      {/* HERO */}
      <header className="relative isolate bg-[#e8dfd6] dark:bg-[#2b2015] pt-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-16 -right-10 h-56 w-56 rounded-full bg-[#7b4b29]/10 blur-3xl" />
          <div className="absolute -bottom-16 -left-10 h-56 w-56 rounded-full bg-[#5c4033]/10 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-[#c47a3a]/5 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 md:px-8 py-10 text-center">
          <span className="inline-block rounded-full bg-[#7b4b29]/10 dark:bg-beige/10 text-[#7b4b29] dark:text-beige text-xs font-medium px-4 py-1 mb-3 tracking-widest uppercase" data-aos="fade-down">
            Coffee History
          </span>
          <h1 className="text-3xl lg:text-5xl font-extrabold text-[#3d2010] dark:text-brown-superlight leading-tight" data-aos="fade-down" data-aos-delay="50">
            ประวัติศาสตร์ของกาแฟ
          </h1>
          <p className="mt-3 text-[#2a1c14]/70 dark:text-brown-superlight/70 max-w-xl mx-auto" data-aos="fade-down" data-aos-delay="100">
            จากตำนานแพะของ Kaldi สู่ร้านกาแฟยุโรป และวัฒนธรรมกาแฟทั่วโลก
          </p>
          {/* TOC */}
          <div className="mt-6 flex flex-wrap justify-center gap-2" data-aos="zoom-in" data-aos-delay="150">
            {[
              ...historyData.sections.map((s) => ({ id: s.id, label: s.label })),
              { id: "continents", label: "แหล่งกำเนิดตามทวีป" },
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => scrollToId(s.id)}
                className="rounded-full border border-[#7b4b29]/30 dark:border-beige/30 bg-white/80 dark:bg-white/10 backdrop-blur px-4 py-1.5 text-xs md:text-sm text-[#5c4033] dark:text-brown-superlight hover:bg-[#7b4b29] dark:hover:bg-beige hover:text-white dark:hover:text-dark-brown hover:border-[#7b4b29] dark:hover:border-beige hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-200 ease-smooth shadow-sm"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="flex-1 mb-4">
        {/* รูปนำ */}
        <div className="relative overflow-hidden">
          <img src={historyData.heroImage} className="w-full h-80 md:h-[26rem] object-cover" alt="Coffee History" data-aos="zoom-in" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#f3f1ec] dark:from-dark-brown via-transparent to-transparent" />
        </div>

        {/* SECTION 1 • เอธิโอเปีย */}
        <section id="origins" className="mx-auto max-w-6xl px-4 md:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 order-2 lg:order-1" data-aos="fade-right">
              <div className="border-l-4 border-[#7b4b29]/40 dark:border-beige/50 pl-5 mb-4">
                <p className="text-xs uppercase tracking-widest text-[#7b4b29]/60 dark:text-beige/70">Chapter 01</p>
                <h2 className="text-xl md:text-2xl font-bold text-[#3d2010] dark:text-brown-superlight mt-1">{origins.title}</h2>
              </div>
              <p className="text-[#2a1c14]/80 dark:text-brown-superlight/80 leading-8 indent-8 bg-white/60 dark:bg-white/5 rounded-2xl p-5 shadow-sm">
                {origins.content}
              </p>
            </div>
            <figure className="lg:col-span-5 order-1 lg:order-2" data-aos="fade-left">
              <div className="rounded-2xl overflow-hidden shadow-xl ring-1 ring-black/5">
                <img src={origins.sideImage} alt={origins.sideImageAlt} className="w-full h-72 object-cover hover:scale-105 transition-transform duration-500" />
              </div>
              <figcaption className="mt-2 text-xs text-[#2a1c14]/50 dark:text-brown-superlight/50 text-center italic">{origins.figcaption}</figcaption>
            </figure>
          </div>
        </section>

        {/* รูปคั่น */}
        <div className="relative overflow-hidden">
          <img src={arab.bannerBefore} className="w-full h-72 md:h-96 object-cover" alt="Coffee History 2" data-aos="zoom-in" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#f3f1ec] dark:from-dark-brown via-transparent to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#f3f1ec] dark:from-dark-brown via-transparent to-transparent" />
        </div>

        {/* SECTION 2 • คาบสมุทรอาหรับ */}
        <section id="arab" className="mx-auto max-w-6xl px-4 md:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 order-2 lg:order-1" data-aos="fade-left">
              <div className="border-l-4 border-[#7b4b29]/40 dark:border-beige/50 pl-5 mb-4">
                <p className="text-xs uppercase tracking-widest text-[#7b4b29]/60 dark:text-beige/70">Chapter 02</p>
                <h2 className="text-xl md:text-2xl font-bold text-[#3d2010] dark:text-brown-superlight mt-1">{arab.title}</h2>
              </div>
              <p className="text-[#2a1c14]/80 dark:text-brown-superlight/80 leading-8 indent-8 bg-white/60 dark:bg-white/5 rounded-2xl p-5 shadow-sm">
                {arab.content}
              </p>
            </div>
            <figure className="lg:col-span-5 order-1 lg:order-2" data-aos="fade-right">
              <div className="rounded-2xl overflow-hidden shadow-xl ring-1 ring-black/5">
                <img src={arab.sideImage} className="w-full h-72 object-cover hover:scale-105 transition-transform duration-500" alt={arab.sideImageAlt} />
              </div>
              <figcaption className="mt-2 text-xs text-[#2a1c14]/50 dark:text-brown-superlight/50 text-center italic">{arab.figcaption}</figcaption>
            </figure>
          </div>
        </section>

        {/* SECTION 3 • ร้านกาแฟแรก */}
        <section id="firstcafe" className="mx-auto max-w-6xl px-4 py-8">
          <div className="flex flex-col lg:flex-row items-center gap-8 rounded-3xl bg-gradient-to-br from-[#f7efe6] to-[#ede0d0] dark:from-[#2b2015] dark:to-[#20170e] shadow-md ring-1 ring-[#7b4b29]/10 dark:ring-beige/10 p-8 md:p-12" data-aos="fade-up">
            <div className="lg:w-3/5">
              <div className="border-l-4 border-[#7b4b29] dark:border-beige pl-5 mb-4">
                <p className="text-xs uppercase tracking-widest text-[#7b4b29]/60 dark:text-beige/70">Chapter 03</p>
                <h2 className="text-xl md:text-2xl font-bold text-[#3d2010] dark:text-brown-superlight mt-1">{firstcafe.title}</h2>
              </div>
              <p className="text-[#2a1c14]/80 dark:text-brown-superlight/80 leading-8">{firstcafe.content}</p>
            </div>
            <div className="lg:w-2/5 shrink-0">
              <div className="rounded-2xl overflow-hidden shadow-lg">
                <img src={firstcafe.sideImage} className="w-full object-cover hover:scale-105 transition-transform duration-500" alt={firstcafe.sideImageAlt} />
              </div>
            </div>
          </div>
        </section>

        {/* รูปคั่น */}
        <div className="relative overflow-hidden my-6">
          <img src={europe.bannerBefore} className="w-full h-72 md:h-96 object-cover" alt="Coffee History 4" data-aos="zoom-in" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#f3f1ec] dark:from-dark-brown via-transparent to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#f3f1ec] dark:from-dark-brown via-transparent to-transparent" />
        </div>

        {/* SECTION 4 • ยุโรป */}
        <section id="europe" className="mx-auto max-w-6xl px-4 md:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 order-2 lg:order-1" data-aos="fade-right">
              <div className="border-l-4 border-[#7b4b29]/40 dark:border-beige/50 pl-5 mb-4">
                <p className="text-xs uppercase tracking-widest text-[#7b4b29]/60 dark:text-beige/70">Chapter 04</p>
                <h2 className="text-xl md:text-2xl font-bold text-[#3d2010] dark:text-brown-superlight mt-1">{europe.title}</h2>
              </div>
              <p className="text-[#2a1c14]/80 dark:text-brown-superlight/80 leading-8 indent-8 bg-white/60 dark:bg-white/5 rounded-2xl p-5 shadow-sm">
                {europe.content}
              </p>
            </div>
            <figure className="lg:col-span-5 order-1 lg:order-2" data-aos="fade-left">
              <div className="rounded-2xl overflow-hidden shadow-xl ring-1 ring-black/5">
                <img src={europe.sideImage} className="w-full h-72 object-cover hover:scale-105 transition-transform duration-500" alt={europe.sideImageAlt} />
              </div>
              <figcaption className="mt-2 text-xs text-[#2a1c14]/50 dark:text-brown-superlight/50 text-center italic">{europe.figcaption}</figcaption>
            </figure>
          </div>
        </section>

        {/* SECTION 5 • ปัจจุบัน */}
        <section id="modern" className="mx-auto max-w-6xl px-4 md:px-8 py-8">
          <div className="rounded-3xl bg-gradient-to-br from-[#3d2010] to-[#6f4e37] p-8 lg:p-10 shadow-xl text-white" data-aos="fade-up">
            <div className="flex items-center gap-3 mb-4">
              <Coffee className="size-7 text-white/80" strokeWidth={1.5} />
              <div>
                <p className="text-xs uppercase tracking-widest text-white/50">Chapter 05</p>
                <h2 className="text-xl md:text-2xl font-bold">{modern.title}</h2>
              </div>
            </div>
            <p className="leading-8 text-white/85 indent-8">{modern.content}</p>
          </div>
        </section>

        {/* หัวข้อทวีป */}
        <div className="text-center mb-8 mt-14 px-4" data-aos="fade-up">
          <span className="inline-block rounded-full bg-[#7b4b29]/10 dark:bg-beige/10 text-[#7b4b29] dark:text-beige text-xs font-medium px-4 py-1 mb-3 tracking-widest uppercase">Origins</span>
          <h2 className="text-2xl lg:text-3xl font-extrabold text-[#3d2010] dark:text-brown-superlight">แหล่งกำเนิดกาแฟแต่ละทวีป</h2>
          <div className="mx-auto mt-3 h-1 w-16 bg-gradient-to-r from-[#7b4b29] to-[#c47a3a] rounded-full" />
        </div>

        {/* การ์ดตามทวีป — Timeline */}
        <section id="continents" className="mx-auto max-w-5xl px-4 md:px-8 pb-16">
          <div className="relative">
            {/* เส้น timeline กลาง */}
            <div className="hidden md:block absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#7b4b29]/30 via-[#c47a3a]/50 to-[#7b4b29]/10" />

            <div className="space-y-12 md:space-y-16">
              {historyData.continents.map((c, idx) => {
                const isLeft = idx % 2 === 0;
                return (
                  <div key={c.name} className="relative" data-aos={isLeft ? "fade-right" : "fade-left"}>
                    {/* จุด timeline */}
                    <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-10 h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#7b4b29] to-[#c47a3a] shadow-lg ring-4 ring-[#f3f1ec] dark:ring-dark-brown">
                      <span className="text-white text-xs font-bold">{idx + 1}</span>
                    </div>

                    <div className={`md:grid md:grid-cols-2 md:gap-10 items-center ${isLeft ? "" : "md:[&>*:first-child]:order-2 md:[&>*:last-child]:order-1"}`}>
                      {/* รูป */}
                      <div className={`group mb-5 md:mb-0 ${isLeft ? "md:pr-6" : "md:pl-6"}`}>
                        <div className="rounded-2xl overflow-hidden shadow-xl ring-1 ring-black/5">
                          <img
                            src={c.image}
                            alt={c.imageAlt}
                            className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      </div>

                      {/* เนื้อหา */}
                      <div className={isLeft ? "md:pl-6" : "md:pr-6"}>
                        <div className="bg-white dark:bg-[#2b2015] rounded-2xl shadow-md ring-1 ring-black/5 dark:ring-brown-superlight/10 p-6 hover:shadow-lg transition-shadow duration-300">
                          {/* mobile dot */}
                          <div className="md:hidden flex items-center gap-2 mb-3">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#7b4b29] to-[#c47a3a] text-white text-xs font-bold shadow">
                              {idx + 1}
                            </span>
                            <div className="h-px flex-1 bg-gradient-to-r from-[#7b4b29]/30 to-transparent" />
                          </div>
                          <h3 className="text-xl font-bold text-[#3d2010] dark:text-brown-superlight mb-3 flex items-center gap-2">
                            <span className="h-3 w-3 rounded-full bg-gradient-to-br from-[#7b4b29] to-[#c47a3a] inline-block shrink-0" />
                            {c.name}
                          </h3>
                          <p className="text-gray-600 dark:text-brown-superlight/70 leading-relaxed text-sm">{c.content}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

    </div>
  );
}

export default History;
