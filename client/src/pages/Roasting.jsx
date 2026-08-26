import { useEffect, useMemo, useState } from "react";
import { Lightbulb } from "lucide-react";
import Navbar from "../components/Navbar";
import { updateUserAchievement } from "../api/achievementApi";
import { useAuth } from "../contexts/AuthContext";
import { fetchRoasting } from "../api/contentApi";
import FetchError from "../components/FetchError";

const CoffeeInfo = () => {
  const [selectedRoast, setSelectedRoast] = useState("คั่วอ่อน (Light Roast)");
  const [roastings, setRoastings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fetchSignal, setFetchSignal] = useState(0);
  const { user } = useAuth();
  const uid = user?.uid ?? null;

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchRoasting()
      .then(setRoastings)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [fetchSignal]);

  const coffeeData = useMemo(() => {
    const obj = {};
    roastings.forEach((r) => { obj[r.key] = r; });
    return obj;
  }, [roastings]);

  const data = coffeeData[selectedRoast];
  const meterValue = data?.meterValue ?? 0;
  const recommendBrews = data?.recommendBrews ?? [];

  useEffect(() => {
    if (!uid) return;
    const onScroll = () => {
      const docH = document.documentElement.scrollHeight;
      const winH = window.innerHeight;
      if (window.scrollY + winH >= docH - 100)
        updateUserAchievement(uid, "content", "roasting_coffee", true);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [uid]);

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
        <div className="space-y-4 w-full max-w-3xl px-4">
          <div className="h-8 rounded-xl bg-[#e0d8ce] animate-pulse w-1/3 mx-auto" />
          <div className="flex gap-3 justify-center">
            {[...Array(4)].map((_, i) => <div key={i} className="h-10 w-32 rounded-full bg-[#e0d8ce] animate-pulse" />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 rounded-2xl bg-[#e0d8ce] animate-pulse" />
            <div className="h-64 rounded-2xl bg-[#e0d8ce] animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-[#f3f1ec] min-h-screen">
      <Navbar />

      {/* HERO */}
      <header className="bg-gradient-to-r from-[#4b2f1a] via-[#7b4b29] to-[#d9c4aa] py-10 text-center text-white">
        <p className="text-xs uppercase tracking-widest text-white/70 mb-2">Roasting Levels</p>
        <h1 className="text-3xl md:text-4xl font-extrabold">ระดับการคั่วกาแฟ</h1>
        <p className="mt-2 text-white/80 text-sm">รู้จักบุคลิกของกาแฟแต่ละระดับ ตั้งแต่สดชื่นผลไม้ไปจนถึงเข้มควันไฟ</p>
      </header>

      {/* Tabs */}
      <div className="sticky top-0 z-10 bg-[#f3f1ec]/95 backdrop-blur border-b border-black/10 shadow-sm">
        <div className="max-w-5xl mx-auto py-3">
          <div className="-mx-0 overflow-x-auto">
          <div className="px-4 flex gap-2 whitespace-nowrap">
          {Object.keys(coffeeData).map((label) => {
            const active = selectedRoast === label;
            return (
              <button
                key={label}
                onClick={() => setSelectedRoast(label)}
                className={[
                  "shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 ease-smooth",
                  active
                    ? "bg-[#5c3a1e] text-white border-[#5c3a1e] shadow"
                    : "bg-white text-[#3d2010] border-black/10 hover:border-[#7b4b29]/40 hover:bg-[#f7efe6]",
                ].join(" ")}
              >
                {label}
              </button>
            );
          })}
          </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 py-8 pb-14">
        <div key={selectedRoast} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fade-in-up">

          {/* รูป */}
          <figure className="lg:col-span-5">
            <div className="rounded-2xl overflow-hidden shadow-lg aspect-[4/3] group">
              <img
                src={data.img}
                alt={selectedRoast}
                className="w-full h-full object-cover transition-transform duration-500 ease-smooth group-hover:scale-105"
              />
            </div>
          </figure>

          {/* รายละเอียด */}
          <div className="lg:col-span-7 space-y-5">

            {/* ชื่อ + chips */}
            <div>
              <h2 className="text-2xl font-bold text-[#3d2010]">{selectedRoast}</h2>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="rounded-full bg-[#f0e4d0] text-[#5c3a1e] text-xs px-3 py-1">{data.alias}</span>
                <span className="rounded-full bg-[#f0e4d0] text-[#5c3a1e] text-xs px-3 py-1">{data.temperature}</span>
                <span className="rounded-full bg-[#f0e4d0] text-[#5c3a1e] text-xs px-3 py-1">คาเฟอีน{data.caffeineLevel}</span>
              </div>
            </div>

            {/* Roast Meter */}
            <div>
              <p className="text-xs font-semibold text-[#5c4033]/60 uppercase tracking-wider mb-2">ระดับการคั่ว</p>
              <div className="relative h-3 w-full rounded-full bg-gradient-to-r from-[#e8d5b0] via-[#9b6035] to-[#2a1208]">
                <span
                  className="absolute top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-white shadow ring-2 ring-[#7b4b29]/30 transition-[left] duration-500"
                  style={{ left: `calc(${meterValue}% - 10px)` }}
                />
              </div>
              <div className="grid grid-cols-4 text-[10px] text-[#5c4033]/40 mt-1">
                <span>Light</span><span className="text-center">Med-Light</span><span className="text-center">Medium</span><span className="text-right">Dark</span>
              </div>
            </div>

            {/* Flavor Profile */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-xs font-semibold text-[#5c4033]/60 uppercase tracking-wider mb-3">Flavor Profile</p>
              {[
                { label: "ความเปรี้ยว", value: data.acidity },
                { label: "บอดี้",        value: data.body },
                { label: "กลิ่นหอม",    value: data.aroma },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center gap-3 mb-2 last:mb-0">
                  <span className="text-xs text-[#5c4033]/70 w-20 shrink-0">{label}</span>
                  <div className="flex-1 h-2 rounded-full bg-[#ede5d8]">
                    <div
                      className="h-2 rounded-full bg-[#7b4b29] transition-[width] duration-500"
                      style={{ width: `${(value / 5) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-[#5c4033]/40 w-6 text-right">{value}/5</span>
                </div>
              ))}
            </div>

            {/* รสชาติ */}
            <div>
              <p className="text-sm font-semibold text-[#3d2010] mb-2">รสชาติ</p>
              <ul className="space-y-1">
                {data.taste.map((t, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[#2a1c14]/80">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#c47a3a] shrink-0" />{t}
                  </li>
                ))}
              </ul>
            </div>

            {/* ลักษณะ */}
            <div>
              <p className="text-sm font-semibold text-[#3d2010] mb-2">ลักษณะ</p>
              <ul className="space-y-1">
                {data.characteristics.map((c, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[#2a1c14]/80">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#7b4b29] shrink-0" />{c}
                  </li>
                ))}
              </ul>
            </div>

            {/* เหมาะกับ */}
            <div>
              <p className="text-sm font-semibold text-[#3d2010] mb-1">เหมาะกับ</p>
              <p className="text-sm text-[#2a1c14]/75 leading-6">{data.suitableFor}</p>
            </div>

            {/* แหล่งกาแฟ */}
            <div>
              <p className="text-sm font-semibold text-[#3d2010] mb-2">แหล่งกาแฟที่เหมาะ</p>
              <div className="flex flex-wrap gap-2">
                {(data.origins ?? []).map((o) => (
                  <span key={o} className="rounded-full bg-[#f0e4d0] text-[#5c3a1e] text-xs px-3 py-1">
                    {o}
                  </span>
                ))}
              </div>
            </div>

            {/* วิธีชง */}
            <div>
              <p className="text-sm font-semibold text-[#3d2010] mb-2">วิธีชงที่แนะนำ</p>
              <div className="flex flex-wrap gap-2">
                {recommendBrews.map((b) => (
                  <span key={b} className="rounded-full bg-[#3d2010] text-white text-sm px-4 py-1.5">
                    {b}
                  </span>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* เคล็ดลับ */}
        <div className="mt-6 flex items-start gap-2 rounded-xl bg-[#fff7ec] border border-[#e8c88a] p-4 text-sm text-[#7b4b29]">
          <Lightbulb className="mt-0.5 flex-none size-4" strokeWidth={2} />
          <p>
            <span className="font-semibold">เคล็ดลับ: </span>
            เลือกระดับคั่วให้เข้ากับวิธีชง คั่วอ่อนเหมาะกับดริปที่เน้นกลิ่นผลไม้ ส่วนคั่วเข้มเหมาะกับเอสเปรสโซหรือเมนูนมที่ต้องการบอดี้ชัด
          </p>
        </div>
      </main>

    </div>
  );
};

export default CoffeeInfo;
