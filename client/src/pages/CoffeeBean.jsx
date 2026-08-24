import { useState, useEffect, useMemo } from "react";
import Navbar from "../components/Navbar";
import { fetchBeans } from "../api/contentApi";
import { useSearchParams } from "react-router-dom";
import BackToTop from "../components/BackToTop";
import FetchError from "../components/FetchError";

function CoffeeBeans() {
  const [activeFilter, setActiveFilter] = useState("กาแฟทั้งหมด"); // หมวด
  const [roastFilter, setRoastFilter] = useState("ทั้งหมด");        // ระดับคั่ว
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // อ่าน/เขียน query string
  const [searchParams, setSearchParams] = useSearchParams();

  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fetchSignal, setFetchSignal] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchBeans()
      .then(setMenuItems)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [fetchSignal]);

  // map จาก type (อังกฤษจากหน้า Home) -> ชื่อปุ่มภาษาไทย
  const TYPE_MAP = useMemo(
    () => ({
      instant: "กาแฟชงดื่ม",
      capsule: "กาแฟแคปซูล",
      fresh: "กาแฟคั่ว", // หรือ "กาแฟคั่วบด" แล้วแต่ข้อมูล
    }),
    []
  );

  // เมื่อเข้าหน้านี้/เปลี่ยน query → ตั้งฟิลเตอร์เริ่มต้นให้ตรงกับ type
  useEffect(() => {
    const t = (searchParams.get("type") || "").toLowerCase();
    if (t in TYPE_MAP) setActiveFilter(TYPE_MAP[t]);
    else setActiveFilter("กาแฟทั้งหมด");
  }, [searchParams, TYPE_MAP]);

  // สร้างหมวดหมู่จากข้อมูลจริง + ใส่ "ทั้งหมด" นำหน้า
  const categories = useMemo(() => {
    const set = new Set(["กาแฟทั้งหมด"]);
    menuItems.forEach((i) => {
      if (Array.isArray(i.type)) i.type.forEach((t) => t && set.add(t));
      else if (i.type) set.add(i.type);
    });
    return Array.from(set);
  }, [menuItems]);

  // ตัวเลือก "ระดับคั่ว" แบบเรียบง่าย (จับคำในข้อความ)
  const roastOptions = ["ทั้งหมด", "คั่วอ่อน", "คั่วกลาง", "คั่วเข้ม"];

  // ปุ่มควิกฟิลเตอร์ 3 กล่อง (เชื่อมกับ ?type=)
  const quicks = [
    { key: "instant", label: "สำเร็จรูป / ชงดื่ม", sub: "รวดเร็ว สะดวก" },
    { key: "capsule", label: "แคปซูล", sub: "คงที่ ได้มาตรฐาน" },
    { key: "fresh", label: "คั่ว / คั่วบด", sub: "หอมสด ใหม่" },
  ];

  // ปุ่มฟิลเตอร์ (เลิกใช้ชุดเดิม → ใช้ categories ที่ derive)
  const handleFilterChange = (filterTh) => {
    setActiveFilter(filterTh);

    // sync กลับ URL
    const reverseMap = {
      "กาแฟชงดื่ม": "instant",
      "กาแฟแคปซูล": "capsule",
      "กาแฟคั่ว": "fresh",
      "กาแฟคั่วบด": "fresh",
    };
    const t = reverseMap[filterTh];
    if (t) setSearchParams({ type: t });
    else setSearchParams({});
  };

  // ควิกฟิลเตอร์: กดครั้งแรก = ตั้งฟิลเตอร์, กดซ้ำ = ล้างฟิลเตอร์ (ทั้งหมด)
  const handleQuick = (key) => {
    if (isQuickActive(key)) {
      // ยกเลิกฟิลเตอร์
      setSearchParams({});
      setActiveFilter("กาแฟทั้งหมด");
    } else {
      // ตั้งค่าฟิลเตอร์ตามปุ่มที่เลือก
      setSearchParams({ type: key });
      setActiveFilter(TYPE_MAP[key] || "กาแฟทั้งหมด");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // เปิด/ปิดรายละเอียด
  const handleItemClick = (item) => {
    setSelectedItem(item);
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  };
  const handleBack = () => {
    setSelectedItem(null);
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  };

  // กรอง + ค้นหา
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      // หมวด
      const matchCat =
        activeFilter === "กาแฟทั้งหมด" ||
        (Array.isArray(item.type)
          ? item.type.includes(activeFilter)
          : item.type === activeFilter);

      // ระดับคั่ว (ถ้าเลือก "ทั้งหมด" ให้ผ่าน)
      const r = (item.roast || "").toLowerCase();
      const matchRoast =
        roastFilter === "ทั้งหมด" ||
        r.includes(roastFilter.replace("คั่ว", "").trim().toLowerCase()); // อ่อน/กลาง/เข้ม

      // ค้นหาจากชื่อ
      const matchSearch = (item.name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      return matchCat && matchRoast && matchSearch;
    });
  }, [menuItems, activeFilter, roastFilter, searchTerm]);

  // อ่าน order แรก (ถ้ามี) เพื่อทำปุ่ม "ซื้อผ่าน"
  const firstOrderOf = (item) => {
    const o = item.order?.[0];
    if (!o) return null;
    const [[name, url]] = Object.entries(o);
    return { name, url };
  };

  // เช็คว่าปุ่ม quick ตัวไหนกำลัง active อยู่ (จาก URL หรือจาก activeFilter)
  const isQuickActive = (key) => {
    const current = (searchParams.get("type") || "").toLowerCase();
    return current === key || activeFilter === TYPE_MAP[key];
  };

  if (error) return (
    <div className="min-h-screen bg-[#f3f1ec] flex flex-col">
      <Navbar />
      <div className="flex-grow flex items-center justify-center">
        <FetchError onRetry={() => setFetchSignal((s) => s + 1)} />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f3f1ec] flex flex-col">
      <Navbar />
      <BackToTop />

      {/* HERO */}
      {!selectedItem && (
        <header className="relative isolate overflow-hidden">
          <div className="absolute inset-0 bg-[url('/home1.jpg')] bg-cover bg-center" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/35 to-black/0" />
          <div className="relative mx-auto max-w-7xl px-4 md:px-8 h-[28vh] md:h-[32vh] flex items-center">
            <div className="text-white">
              <p className="uppercase tracking-widest text-xs text-white/80">
                Bean Guide
              </p>
              <h1 className="text-2xl md:text-4xl font-extrabold leading-tight">
                เลือกเมล็ดกาแฟให้ตรงกับสไตล์การชง
              </h1>
              <p className="mt-1 text-white/90">
                กรองตามชนิด ระดับคั่ว และราคา เจอเมล็ดที่ต้องการได้เร็วขึ้น
              </p>
            </div>
          </div>
        </header>
      )}

      <main className="mx-auto max-w-7xl px-4 md:px-8 py-6 w-full">
        {selectedItem ? (
          // -------------------- รายละเอียดสินค้า --------------------
          <div className="bg-white rounded-2xl shadow p-5 md:p-8">
            <button
              onClick={handleBack}
              className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm hover:bg-black/5 transition mb-4"
            >
              ← ย้อนกลับ
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* รูป */}
              <div className="lg:col-span-5">
                <figure className="rounded-xl overflow-hidden shadow">
                  <img
                    className="w-full h-auto object-cover"
                    src={selectedItem.img}
                    alt={selectedItem.name}
                  />
                </figure>
              </div>

              {/* เนื้อหา */}
              <div className="lg:col-span-7">
                <h2 className="text-2xl md:text-3xl font-bold text-[#2a1c14]">
                  {selectedItem.name}
                </h2>

                {/* badges */}
                <div className="mt-2 flex flex-wrap gap-2">
                  {(Array.isArray(selectedItem.type)
                    ? selectedItem.type
                    : [selectedItem.type]
                  )
                    .filter(Boolean)
                    .map((t) => (
                      <span
                        key={t}
                        className="rounded-full border border-black/10 bg-black/5 px-3 py-1 text-xs text-[#2a1c14]"
                      >
                        {t}
                      </span>
                    ))}
                  {selectedItem.roast && (
                    <span className="rounded-full border border-[#6f4e37]/20 bg-[#6f4e37]/10 px-3 py-1 text-xs text-[#6f4e37]">
                      {selectedItem.roast}
                    </span>
                  )}
                </div>

                <div className="mt-6 space-y-5 text-neutral-800 leading-relaxed">
                  {selectedItem.details && (
                    <>
                      <h3 className="font-semibold text-[#2a1c14]">
                        รายละเอียดกาแฟ
                      </h3>
                      <p>{selectedItem.details}</p>
                    </>
                  )}

                  {selectedItem.tests && (
                    <>
                      <h3 className="font-semibold text-[#2a1c14]">รสชาติ</h3>
                      <p>{selectedItem.tests}</p>
                    </>
                  )}

                  {selectedItem.tips && (
                    <>
                      <h3 className="font-semibold text-[#2a1c14]">เพิ่มเติม</h3>
                      <p>{selectedItem.tips}</p>
                    </>
                  )}

                  {selectedItem.price && (
                    <>
                      <h3 className="font-semibold text-[#2a1c14]">ราคา</h3>
                      <p>{selectedItem.price}</p>
                    </>
                  )}
                </div>

                {/* ช่องทางสั่งซื้อ */}
                {selectedItem.order?.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-semibold text-[#2a1c14] mb-2">
                      ช่องทางการสั่งซื้อ
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedItem.order.map((platform, idx) => {
                        const [[name, url]] = Object.entries(platform);
                        return (
                          <a
                            key={idx}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-full bg-[#6f4e37] text-white px-4 py-2 text-sm hover:opacity-90 transition"
                          >
                            ซื้อผ่าน {name}
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          // -------------------- หน้าเลือกสินค้า --------------------
          <section className="bg-white rounded-2xl shadow p-4 md:p-6">
            {/* Quick Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
              {quicks.map((q) => {
                const active = isQuickActive(q.key);
                return (
                  <button
                    key={q.key}
                    onClick={() => handleQuick(q.key)}
                    className={`group relative overflow-hidden rounded-xl border px-4 py-4 text-left transition
                      ${active
                        ? "border-[#6f4e37]/40 ring-2 ring-[#6f4e37]/40 bg-black/10"
                        : "border-black/10 bg-black/5 hover:bg-black/10"}`}
                  >
                    <div className="font-semibold text-[#2a1c14]">{q.label}</div>
                    <div className="text-xs text-black/60">{q.sub}</div>
                    <div className={`absolute right-3 top-1/2 -translate-y-1/2 transition
                      ${active ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
                      →
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Controls: Search + Category + Roast */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Search */}
              <div className="md:col-span-1">
                <label className="block text-xs text-black/60 mb-1">
                  ค้นหาเมล็ดกาแฟ
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="พิมพ์ชื่อแบรนด์/รุ่น..."
                    className="w-full pl-10 pr-3 py-2 rounded-md border border-black/10 focus:outline-none focus:ring-2 focus:ring-[#6f4e37]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-black/40">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M21 21l-4.35-4.35M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </span>
                </div>
              </div>

              {/* Category */}
              <div className="md:col-span-1">
                <label className="block text-xs text-black/60 mb-1">
                  หมวดหมู่
                </label>
                <div className="relative">
                  <select
                    value={activeFilter}
                    onChange={(e) => handleFilterChange(e.target.value)}
                    className="w-full appearance-none rounded-md border border-black/10 bg-white py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-[#6f4e37]"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-black/40">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </span>
                </div>
              </div>

              {/* Roast */}
              <div className="md:col-span-1">
                <label className="block text-xs text-black/60 mb-1">
                  ระดับการคั่ว
                </label>
                <div className="relative">
                  <select
                    value={roastFilter}
                    onChange={(e) => setRoastFilter(e.target.value)}
                    className="w-full appearance-none rounded-md border border-black/10 bg-white py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-[#6f4e37]"
                  >
                    {roastOptions.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-black/40">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </span>
                </div>
              </div>
            </div>

            {/* สรุปจำนวนผลลัพธ์ */}
            {!loading && (
              <div className="mb-3 text-sm text-black/60">
                พบผลลัพธ์ {filteredItems.length} รายการ
              </div>
            )}

            {/* Empty state */}
            {!loading && filteredItems.length === 0 && (
              <div className="py-16 text-center text-black/60">
                <div className="text-lg font-semibold">ไม่พบเมล็ดกาแฟที่ตรงเงื่อนไข</div>
                <div className="mt-1 text-sm">ลองเปลี่ยนคำค้นหรือปรับตัวกรองดูนะ</div>
              </div>
            )}

            {/* Skeleton loading */}
            {loading && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="rounded-2xl bg-[#e0d8ce] animate-pulse h-52" />
                ))}
              </div>
            )}

            {/* Grid การ์ด */}
            {!loading && <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {filteredItems.map((item, index) => {
              // ------ เพิ่ม: สร้างแท็กไว้แสดงด้านขวาล่าง ------
              const tagsFromType = Array.isArray(item.type) ? item.type : (item.type ? [item.type] : []);
              const tagsFromTests = item.tests ? item.tests.split(/\s+/) : []; // เช่น "ขมเข้ม หอม กลมกล่อม"
              const previewTags = [...tagsFromType, ...tagsFromTests].slice(0, 3); // เอา 2–3 คำพอ

              return (
                <button
                  key={item.id ?? index}
                  type="button"
                  onClick={() => handleItemClick(item)}
                  className="relative overflow-hidden rounded-2xl bg-white shadow hover:shadow-lg transition text-left w-full"
                >
                  {/* รูป + ชื่อ (คงของเดิมไว้) */}
                  <div className="h-40 w-full">
                    <img src={item.img} alt={item.name} className="h-full w-full object-cover" />
                  </div>

                  {/* แถบไล่สี + ชื่อบนรูป ถ้ามี */}
                  <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/55 to-transparent" />
                  <div className="absolute left-3 top-3 text-white font-semibold drop-shadow">
                    {item.name}
                  </div>

                  {/* เนื้อหาด้านล่างการ์ด */}
                  <div className="p-4">
                    {/* คำบรรยายสั้น (คงของเดิมได้) */}
                    {item.tests && (
                      <p className="text-sm text-neutral-700 line-clamp-1 mb-3">{item.tests}</p>
                    )}

                    {/* แถวล่าง: ราคาซ้าย / แท็กขวา  ——> แทนที่ปุ่ม "ซื้อผ่าน ..." */}
                    <div className="mt-1 flex items-center justify-between gap-3">
                      <span className="text-sm text-neutral-500">{item.price}</span>
                    </div>
                  </div>
                </button>
              );
            })}
            </div>}
          </section>
        )}
      </main>

    </div>
  );
}

export default CoffeeBeans;
