import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import BackToTop from "../components/BackToTop";
import FetchError from "../components/FetchError";
import { fetchMenus } from "../api/contentApi";

function CoffeeBeans() {
  const [activeFilter, setActiveFilter] = useState("กาแฟทั้งหมด");
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const mainRef = useRef(null);
  const [searchParams] = useSearchParams();

  const navigate = useNavigate();
  const location = useLocation();
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fetchSignal, setFetchSignal] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchMenus()
      .then(setMenuItems)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [fetchSignal]);

  // ----- Utils -----
  const scrollToTopWithOffset = () => {
    if (!mainRef.current) return;
    const offset = -70;
    const y = mainRef.current.getBoundingClientRect().top + window.pageYOffset + offset;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  // เอา tests/type มาทำ tag สั้น ๆ
  const getTags = (item) => {
    const t = Array.isArray(item.type)
      ? item.type
      : item.type
      ? [item.type]
      : [];
    const tests = (item.tests || "")
      .split(/[,\s]+/)
      .filter(Boolean);
    const unique = [...new Set([...t, ...tests])];
    return unique.slice(0, 3);
  };

  // init จาก state หรือ ?item=
  useEffect(() => {
    const fromState = location.state;
    const fromQuery = (searchParams.get("item") || "").toLowerCase();

    let candidate = null;
    if (fromState && (fromState.id || fromState.img || fromState.ingredients))
      candidate = fromState;
    if (!candidate && fromState?.name) {
      candidate =
        menuItems.find(
          (i) => i.name.toLowerCase() === String(fromState.name).toLowerCase()
        ) || null;
    }
    if (!candidate && fromQuery) {
      candidate =
        menuItems.find((i) => i.name.toLowerCase() === fromQuery) || null;
    }

    if (candidate) {
      setSelectedItem(candidate);
      scrollToTopWithOffset();
    }
  }, [location.state, searchParams, menuItems]);

  const filterButtons = [
    "กาแฟทั้งหมด",
    "กาแฟร้อน",
    "กาแฟเย็น",
    "กาแฟปั่น",
    "กาแฟนม",
    "กาแฟผลไม้",
  ];

  // กดซ้ำ = ยกเลิกฟิลเตอร์
  const handleFilterChange = (filter) =>
    setActiveFilter((prev) => (prev === filter ? "กาแฟทั้งหมด" : filter));

  const handleItemClick = (item) => {
    setSelectedItem(item);
    scrollToTopWithOffset();
  };

  const handleBack = () => {
    setSelectedItem(null);
    scrollToTopWithOffset();
  };

  // NEW: ส่ง recipe → หน้าเลือกวิธี พร้อม state
  const handleTryIt = () => {
    if (!selectedItem) return;
    navigate("/brew", { state: { menuName: selectedItem.name } });
  };

  const filteredItems = menuItems.filter((item) => {
    const matchesFilter =
      activeFilter === "กาแฟทั้งหมด" ||
      (Array.isArray(item.type) ? item.type.includes(activeFilter) : item.type === activeFilter);
    const matchesSearch = !searchTerm.trim() || item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const hasActive = activeFilter !== "กาแฟทั้งหมด" || !!searchTerm;
  const clearAll = () => {
    setActiveFilter("กาแฟทั้งหมด");
    setSearchTerm("");
  };

  if (error) return (
    <div className="flex flex-col min-h-screen bg-[#f3f1ec]">
      <Navbar />
      <div className="flex-grow flex items-center justify-center">
        <FetchError onRetry={() => setFetchSignal((s) => s + 1)} />
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#f3f1ec]">
      <Navbar />
      <BackToTop />

      {/* HERO — แสดงเฉพาะตอน list view */}
      {!selectedItem && (
        <header className="relative isolate overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#4b2f1a] via-[#7b4b29] to-[#d9c4aa]" />
          <div className="relative mx-auto max-w-7xl px-4 md:px-8 h-[22vh] flex items-center">
            <div className="text-white">
              <p className="uppercase tracking-widest text-xs text-white/70 mb-1">Menu</p>
              <h1 className="text-2xl md:text-4xl font-extrabold">เมนูกาแฟ</h1>
              <p className="mt-1 text-white/80 text-sm">กรองตามหมวดหมู่ ดูสูตรทำแบบละเอียดทุกเมนู</p>
            </div>
          </div>
        </header>
      )}

      <main ref={mainRef} className="flex-1 lg:p-6 sm:p-0">
        {/* =============== DETAIL VIEW =============== */}
        {selectedItem ? (
          <div className="bg-white rounded-2xl shadow-md p-5 md:p-6">
            {/* แถบปุ่มหลักของหน้า — ย้อนกลับ + ลองชง อยู่กล่องเดียวกัน */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#faf6f3] ring-1 ring-black/5 px-3 py-3 sm:px-4">
              <button
                onClick={handleBack}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#6f4e37]/25 bg-white px-4 py-2 text-sm font-medium text-[#6f4e37] transition hover:bg-[#6f4e37] hover:text-white"
              >
                <span aria-hidden="true">←</span>
                ย้อนกลับ
              </button>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="hidden sm:inline text-sm text-neutral-500">
                  เปิดแบบจำลองการชงแบบทีละขั้นตอน
                </span>
                <button
                  onClick={handleTryIt}
                  className="inline-flex items-center gap-2 rounded-full bg-[#6f4e37] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#6f4e37]/25 transition hover:bg-[#5b3f2c] hover:shadow-xl active:scale-[.98]"
                >
                  <span aria-hidden="true">☕</span>
                  ลองชงเมนูนี้
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <figure className="lg:col-span-5">
                <div className="relative h-72 md:h-96 rounded-2xl overflow-hidden shadow-[0_12px_32px_rgba(0,0,0,0.12)]">
                  <img
                    src={selectedItem.img}
                    alt={selectedItem.name}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  {selectedItem.cafeid && (
                    <span className="absolute left-4 top-4 rounded-full bg-white/85 backdrop-blur px-3 py-1 text-[11px] text-neutral-800">
                      {selectedItem.cafeid}
                    </span>
                  )}
                  <figcaption className="absolute bottom-4 left-4 right-4 text-white">
                    <h1 className="text-xl md:text-2xl font-bold drop-shadow">
                      {selectedItem.name}
                    </h1>
                  </figcaption>
                </div>
              </figure>

              <div className="lg:col-span-7 space-y-6">
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(selectedItem.type) &&
                    selectedItem.type.map((t, i) => (
                      <span
                        key={i}
                        className="rounded-full border border-[#2a1c14]/15 bg-white px-3 py-1 text-xs text-[#2a1c14]"
                      >
                        {t}
                      </span>
                    ))}
                  {!Array.isArray(selectedItem.type) && selectedItem.type && (
                    <span className="rounded-full border border-[#2a1c14]/15 bg-white px-3 py-1 text-xs text-[#2a1c14]">
                      {selectedItem.type}
                    </span>
                  )}
                  {selectedItem.caffeine && (
                    <span className="rounded-full bg-[#f1e9e2] px-3 py-1 text-xs text-[#2a1c14]">
                      คาเฟอีน: {selectedItem.caffeine}
                    </span>
                  )}
                  {selectedItem.calories && (
                    <span className="rounded-full bg-[#f1e9e2] px-3 py-1 text-xs text-[#2a1c14]">
                      แคลอรี่: {selectedItem.calories}
                    </span>
                  )}
                </div>

                <section>
                  <h2 className="text-lg md:text-xl font-bold text-[#2a1c14]">
                    รายละเอียดเมนู
                  </h2>
                  <p className="mt-2 text-neutral-700 leading-relaxed">
                    {selectedItem.details}
                  </p>
                </section>

                {(selectedItem.tests || selectedItem.cafeid) && (
                  <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedItem.tests && (
                      <div className="rounded-xl bg-[#faf6f3] p-4">
                        <h3 className="font-semibold text-[#2a1c14]">
                          โปรไฟล์รสชาติ
                        </h3>
                        <p className="text-neutral-700 mt-1">
                          {selectedItem.tests}
                        </p>
                      </div>
                    )}
                    {selectedItem.cafeid && (
                      <div className="rounded-xl bg-[#faf6f3] p-4">
                        <h3 className="font-semibold text-[#2a1c14]">
                          ระดับความเข้ม
                        </h3>
                        <p className="text-neutral-700 mt-1">
                          {selectedItem.cafeid}
                        </p>
                      </div>
                    )}
                  </section>
                )}

                <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-[#2a1c14]">
                      วัตถุดิบในการทำ
                    </h3>
                    <ol className="mt-2 list-decimal pl-5 space-y-1 text-neutral-700">
                      {selectedItem.ingredients?.map((ing, i) => (
                        <li key={i}>{ing}</li>
                      ))}
                    </ol>
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#2a1c14]">
                      ขั้นตอนการทำ
                    </h3>
                    <ol className="mt-2 list-decimal pl-5 space-y-1 text-neutral-700">
                      {selectedItem.stepsAll?.map((st, i) => (
                        <li key={i}>{st}</li>
                      ))}
                    </ol>
                  </div>
                </section>

              </div>
            </div>
          </div>
        ) : (
          /* =============== LIST VIEW =============== */
          <section className="rounded-2xl bg-white shadow-md transition hover:shadow-lg">
            <div className="p-4 md:p-6 lg:p-7">

              {/* Heading + Reset */}
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[#2a1c14]">
                  เมนูกาแฟทั้งหมด
                  <span className="ml-2 text-sm text-neutral-500">
                    (พบ {filteredItems.length} เมนู)
                  </span>
                </h2>
                {hasActive && (
                  <button
                    onClick={clearAll}
                    className="text-sm rounded-full border border-black/10 px-3 py-1.5 text-[#2a1c14] hover:bg-black/5"
                  >
                    ล้างทั้งหมด
                  </button>
                )}
              </div>

              {/* Toolbar 2 ชั้น */}
              <div className="mb-6 space-y-3">
                {/* แถวบน: Search + Suggestion */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  {/* Search */}
                  <div className="relative w-full sm:max-w-md">
                    <input
                      type="text"
                      placeholder="ค้นหาเมนู..."
                      className="w-full rounded-full border border-black/10 bg-black/5 pl-10 pr-10 py-2.5
                                 focus:outline-none focus:ring-2 focus:ring-[#6f4e37]/30"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      aria-label="ค้นหาเมนู"
                    />
                    {/* icon search */}
                    <svg
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    {/* clear */}
                    {searchTerm && (
                      <button
                        type="button"
                        aria-label="ล้างคำค้นหา"
                        onClick={() => setSearchTerm("")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 grid place-items-center
                                   h-7 w-7 rounded-full text-neutral-500 hover:bg-black/10"
                      >
                        ×
                      </button>
                    )}
                  </div>

                  {/* Suggestion */}
                  <button
                    className="rounded-full bg-[#b5835a] px-4 py-2 text-white hover:opacity-90 shadow-sm self-end sm:self-auto"
                    onClick={() => navigate("/suggestion")}
                  >
                    แนะนำกาแฟที่คุณต้องชอบ
                  </button>
                </div>

                {/* แถวล่าง: filter chips (เลื่อนแนวนอน) */}
                <div className="-mx-2 overflow-x-auto">
                  <div className="px-2 inline-flex gap-2 whitespace-nowrap">
                    {filterButtons.map((f) => (
                      <button
                        key={f}
                        onClick={() => handleFilterChange(f)}
                        className={`shrink-0 rounded-full border px-4 py-1.5 text-sm transition
                          ${
                            activeFilter === f
                              ? "bg-[#6f4e37] text-white border-[#6f4e37] shadow"
                              : "bg-white text-[#2a1c14] border-black/10 hover:bg-black/5"
                          }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Grid cards */}
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="rounded-2xl bg-[#e0d8ce] animate-pulse h-56" />
                  ))}
                </div>
              ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
                {filteredItems.map((item, idx) => {
                  const tags = getTags(item);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleItemClick(item)}
                      className="group relative overflow-hidden rounded-2xl bg-white shadow hover:shadow-xl transition text-left w-full"
                    >
                      {/* รูป */}
                      <div className="relative h-44 w-full">
                        <img
                          src={item.img}
                          alt={item.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                        {item.cafeid && (
                          <span className="absolute left-3 top-3 rounded-full bg-white/85 px-2.5 py-1 text-[11px] text-neutral-800">
                            {item.cafeid}
                          </span>
                        )}
                        <div className="absolute bottom-3 left-3 right-3 text-white drop-shadow">
                          <h3 className="font-semibold leading-tight line-clamp-2">
                            {item.name}
                          </h3>
                        </div>
                      </div>

                      {/* เนื้อหาล่างการ์ด */}
                      <div className="p-4">
                        {item.tests && (
                          <p className="text-sm text-neutral-700 line-clamp-1 mb-3">
                            {item.tests}
                          </p>
                        )}

                        <div className="mt-1 flex items-center justify-between gap-3">
                          <span className="text-xs text-neutral-500">
                            {item.calories || ""}
                          </span>

                          <div className="flex flex-wrap justify-end gap-2">
                            {tags.map((t, i) => (
                              <span
                                key={`${t}-${i}`}
                                className="rounded-full border border-[#6f4e37]/25 bg-[#6f4e37]/5 px-2.5 py-1 text-[11px] text-[#6f4e37]"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              )}

              <div className="h-4 md:h-6" />
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default CoffeeBeans;
