import { useEffect, useMemo, useRef, useState } from "react";
import Navbar from "../components/Navbar";
import { updateUserAchievement } from "../api/achievementApi";
import { useAuth } from "../contexts/AuthContext";
import { fetchVarieties } from "../api/contentApi";
import FetchError from "../components/FetchError";

const SkeletonBlock = ({ className }) => (
  <div className={`animate-pulse bg-gray-200 rounded-xl ${className}`} />
);

const ICON_GRADIENTS = [
  "from-amber-100 to-orange-200 text-orange-700",
  "from-yellow-100 to-amber-200 text-amber-700",
  "from-lime-100 to-green-200 text-green-700",
  "from-sky-100 to-blue-200 text-blue-700",
];

const CoffeeVariety = () => {
  const [selectedVariety, setSelectedVariety] = useState("Arabica");
  const [selectedSubVariety, setSelectedSubVariety] = useState("");
  const [varieties, setVarieties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fetchSignal, setFetchSignal] = useState(0);
  const detailRef = useRef(null);
  const { user } = useAuth();
  const uid = user?.uid ?? null;

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchVarieties()
      .then(setVarieties)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [fetchSignal]);

  const coffeeData = useMemo(() => {
    const obj = {};
    varieties.forEach((v) => { obj[v.key] = v; });
    return obj;
  }, [varieties]);

  const handleSubVarietyClick = (subVariety) => {
    setSelectedSubVariety(subVariety);
    setTimeout(() => {
      detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  useEffect(() => {
    if (!uid) return;
    const handleScroll = () => {
      const contentHeight = document.body.scrollHeight;
      const viewportHeight = window.innerHeight;
      if (window.scrollY + viewportHeight >= contentHeight - 100) {
        updateUserAchievement(uid, "content", "gene_coffee", true);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [uid]);

  if (error) return (
    <div className="bg-[#fcfaf7] dark:bg-dark-brown min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow flex items-center justify-center">
        <FetchError onRetry={() => setFetchSignal((s) => s + 1)} />
      </div>
    </div>
  );

  if (loading) return (
    <div className="bg-[#fcfaf7] dark:bg-dark-brown text-gray-800 font-sans min-h-screen flex flex-col">
      <Navbar />
      <div className="h-[40vh] animate-pulse bg-gray-300 dark:bg-white/10" />
      <div className="mx-auto max-w-7xl w-full px-4 md:px-8 py-8 space-y-6">
        <div className="flex gap-2 justify-center">
          {[...Array(4)].map((_, i) => <SkeletonBlock key={i} className="h-9 w-28" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <SkeletonBlock className="lg:col-span-5 h-72" />
          <SkeletonBlock className="lg:col-span-7 h-72" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => <SkeletonBlock key={i} className="h-40" />)}
        </div>
      </div>
    </div>
  );

  const current = coffeeData[selectedVariety] || Object.values(coffeeData)[0];
  const selectedDetail = current?.subVarieties?.find((s) => s.name === selectedSubVariety);

  return (
    <div className="bg-[#fcfaf7] dark:bg-dark-brown text-gray-800 font-sans">
      <Navbar />

      {/* HERO */}
      <header className="relative isolate overflow-hidden">
        <img src={current.image} alt="" className="absolute inset-0 h-[40vh] w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/35 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 md:px-8 h-[40vh] flex items-end pb-10">
          <div className="text-white">
            <span className="inline-block rounded-full bg-white/20 backdrop-blur text-white text-xs font-medium px-4 py-1 mb-3 tracking-widest uppercase">
              Coffee Genetics
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight drop-shadow">สายพันธุ์กาแฟ</h1>
            <p className="mt-2 text-white/90 drop-shadow-sm">ลักษณะเด่นและสายพันธุ์ย่อยของกาแฟหลัก 4 ตระกูล</p>
          </div>
        </div>
      </header>

      {/* Tabs สายพันธุ์ */}
      <div className="sticky top-0 z-20 bg-white/80 dark:bg-[#2b2015]/90 backdrop-blur border-b border-gray-100 dark:border-white/10 shadow-sm">
        <div className="mx-auto max-w-7xl py-3">
          <div className="overflow-x-auto">
            <div className="px-4 md:px-8 flex gap-2 whitespace-nowrap md:flex-wrap md:whitespace-normal md:justify-start">
              {Object.keys(coffeeData).map((variety) => {
                const active = selectedVariety === variety;
                return (
                  <button
                    key={variety}
                    onClick={() => {
                      setSelectedVariety(variety);
                      setSelectedSubVariety("");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className={[
                      "shrink-0 px-5 py-2 rounded-full text-sm font-semibold border transition-all duration-200 shadow-sm",
                      active
                        ? "bg-[#2a1c14] dark:bg-beige text-white dark:text-dark-brown border-[#2a1c14] dark:border-beige shadow-md scale-105"
                        : "bg-white dark:bg-white/5 text-[#2a1c14] dark:text-brown-superlight border-[#2a1c14]/20 dark:border-brown-superlight/20 hover:bg-[#f7efe6] dark:hover:bg-white/10 hover:border-[#7b4b29]/40 dark:hover:border-beige/40",
                    ].join(" ")}
                  >
                    {variety}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* เนื้อหาแต่ละสายพันธุ์ */}
      <div className="mx-auto max-w-7xl px-4 md:px-8 pb-12">
        {/* รูปใหญ่ + บทนำ */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <figure className="lg:col-span-5 self-stretch">
            <div className="relative h-full w-full min-h-[300px] rounded-2xl overflow-hidden shadow-xl ring-1 ring-black/5">
              <img
                src={current.image}
                alt={`${current.title} Coffee Beans`}
                className="h-full w-full object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
          </figure>

          <article className="lg:col-span-7">
            <div className="h-full bg-white dark:bg-[#2b2015] rounded-2xl shadow-md ring-1 ring-black/5 dark:ring-brown-superlight/10 p-6 flex flex-col">
              <div className="border-l-4 border-[#7b4b29] dark:border-beige pl-4 mb-4">
                <h2 className="text-2xl md:text-3xl font-bold text-[#7b4b29] dark:text-beige">{current.title}</h2>
              </div>
              <p className="text-gray-700 dark:text-brown-superlight/80 leading-8 text-justify indent-8 flex-1">{current.description}</p>
              <div className="mt-5 flex flex-wrap gap-2 pt-4 border-t border-gray-100 dark:border-white/10">
                <span className="rounded-full bg-[#f7efe6] dark:bg-white/10 text-[#7b4b29] dark:text-beige text-xs px-3 py-1 font-medium">ลักษณะเด่น</span>
                <span className="rounded-full bg-[#f0eadc] dark:bg-white/10 text-[#7b4b29] dark:text-beige text-xs px-3 py-1 font-medium">พื้นที่ปลูก</span>
                <span className="rounded-full bg-[#eee6d9] dark:bg-white/10 text-[#7b4b29] dark:text-beige text-xs px-3 py-1 font-medium">ระดับคาเฟอีน</span>
              </div>
            </div>
          </article>
        </div>

        {/* สายพันธุ์ย่อย */}
        <div className="mt-12 text-center">
          <span className="inline-block rounded-full bg-[#7b4b29]/10 dark:bg-beige/10 text-[#7b4b29] dark:text-beige text-xs font-medium px-4 py-1 mb-3 tracking-widest uppercase">Sub-varieties</span>
          <h3 className="text-xl md:text-2xl font-bold text-[#7b4b29] dark:text-beige">
            สายพันธุ์ย่อยของ {current.title}
          </h3>
          <div className="mx-auto mt-2 h-1 w-12 bg-gradient-to-r from-[#7b4b29] to-[#c47a3a] rounded-full" />
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {current.subVarieties.map((sub, idx) => {
            const active = selectedSubVariety === sub.name;
            const grad = ICON_GRADIENTS[idx % ICON_GRADIENTS.length];
            return (
              <button
                key={sub.name}
                onClick={() => handleSubVarietyClick(sub.name)}
                className={[
                  "group text-left bg-white dark:bg-[#2b2015] rounded-2xl border p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 focus:outline-none",
                  active ? "border-[#7b4b29] dark:border-beige ring-2 ring-[#7b4b29]/20 dark:ring-beige/20" : "border-gray-200 dark:border-white/10 hover:border-[#7b4b29]/30 dark:hover:border-beige/30",
                ].join(" ")}
                aria-expanded={active}
              >
                <div className="flex items-start gap-4">
                  <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${grad} grid place-items-center text-lg font-bold shrink-0 shadow-sm`}>
                    {sub.name[0]}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-base font-bold text-[#7b4b29] dark:text-beige group-hover:text-[#5c3a1e] dark:group-hover:text-beige/80 transition-colors">{sub.name}</h4>
                    <p className="mt-1 text-sm text-gray-600 dark:text-brown-superlight/60 line-clamp-3 leading-relaxed">{sub.description}</p>
                    <span className="mt-2 inline-flex items-center gap-1 text-xs text-[#7b4b29] dark:text-beige opacity-60 group-hover:opacity-100 transition-opacity">
                      อ่านรายละเอียด <span className="text-base leading-none">→</span>
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* แผงรายละเอียดสายพันธุ์ย่อย */}
        <div ref={detailRef} className="mt-6">
          {selectedDetail && (
            <div className="rounded-2xl bg-gradient-to-br from-[#fff8f0] to-white dark:from-[#2b2015] dark:to-[#20170e] border-l-4 border-[#7b4b29] dark:border-beige p-6 shadow-md ring-1 ring-[#7b4b29]/10 dark:ring-beige/10 animate-fade-in-up">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="uppercase tracking-widest text-[11px] text-[#7b4b29]/60 dark:text-beige/60 font-medium">Sub-variety</p>
                  <h4 className="text-2xl font-bold text-[#2a1c14] dark:text-brown-superlight mt-1">{selectedDetail.name}</h4>
                </div>
                <button
                  onClick={() => setSelectedSubVariety("")}
                  className="shrink-0 rounded-full bg-[#f7efe6] dark:bg-white/10 border border-[#7b4b29]/20 dark:border-beige/30 px-4 py-1.5 text-sm text-[#7b4b29] dark:text-beige hover:bg-[#7b4b29] dark:hover:bg-beige hover:text-white dark:hover:text-dark-brown transition-all duration-200"
                >
                  ✕ ปิด
                </button>
              </div>
              <p className="mt-4 text-gray-700 dark:text-brown-superlight/80 leading-8">{selectedDetail.description}</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default CoffeeVariety;
