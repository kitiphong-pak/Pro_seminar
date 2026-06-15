import { useState, useEffect, useMemo } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Articles from "../data/article.json";
import BackToTop from "../components/BackToTop";
import { updateUserAchievement } from "../firebase/firebaseAchievements";
import { useAuth } from "../contexts/AuthContext";

const articles = Articles;

function ArticlesPage() {
  const [activeFilter, setActiveFilter] = useState("บทความทั้งหมด");
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [readProgress, setReadProgress] = useState(0);
  const { user } = useAuth();
  const uid = user?.uid ?? null;

  // สร้างรายการหมวดหมู่จากข้อมูลจริง + ใส่ "บทความทั้งหมด" นำหน้า
  const categories = useMemo(() => {
    const set = new Set();
    articles.forEach((a) => {
      const c = a.category;
      if (Array.isArray(c)) c.forEach((x) => x && set.add(x));
      else if (typeof c === "string" && c.trim()) set.add(c.trim());
    });
    return ["บทความทั้งหมด", ...Array.from(set)];
  }, []);

  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      const title = (article.title || "").toLowerCase();
      const matchesSearch = title.includes(searchTerm.toLowerCase());
      const cat = article.category;
      const matchesFilter =
        activeFilter === "บทความทั้งหมด" ||
        (Array.isArray(cat) ? cat.includes(activeFilter) : cat === activeFilter);
      return matchesSearch && matchesFilter;
    });
  }, [searchTerm, activeFilter]);

  // บันทึก achievement + แถบ progress ตอนอ่านบทความ
  useEffect(() => {
    if (!selectedArticle || !uid) return;
    const onScroll = () => {
      const H = document.documentElement.scrollHeight;
      const vh = window.innerHeight;
      const y = window.scrollY;
      setReadProgress(Math.min(100, Math.max(0, (y / (H - vh)) * 100)));
      if (y + vh >= H - 100) {
        const achievementId = selectedArticle.id || selectedArticle.title;
        updateUserAchievement(uid, "knowledge", achievementId, true);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [selectedArticle, uid]);

  useEffect(() => {
    if (selectedArticle) window.scrollTo({ top: 0, behavior: "smooth" });
  }, [selectedArticle]);

  const handleArticleClick = (article) => setSelectedArticle(article);
  const handleBack = () => {
    setSelectedArticle(null);
    setReadProgress(0);
  };

  const firstImageOf = (a) =>
    a.content?.find?.((c) => c.type === "image")?.src || "";
  const firstParagraphOf = (a) =>
    a.content?.find?.((c) => c.type === "paragraph")?.text || "";

  return (
    <div className="min-h-screen bg-[#f3f1ec]">
      <Navbar />
      <BackToTop />

      {/* HERO */}
      {!selectedArticle && (
        <header className="relative isolate overflow-hidden">
          <div className="absolute inset-0 bg-[url('/home1.jpg')] bg-cover bg-center" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/35 to-black/0" />
          <div className="relative mx-auto max-w-7xl px-4 md:px-8 h-[34vh] flex items-center">
            <div className="text-white">
              <p className="uppercase tracking-widest text-xs text-white/80">
                Articles • Knowledge
              </p>
              <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">
                บทความกาแฟ
              </h1>
              <p className="mt-1 text-white/90">
                รวมเรื่องน่าอ่าน ตั้งแต่พื้นฐานจนถึงเทคนิคเชิงลึก
              </p>
            </div>
          </div>
        </header>
      )}

      <main className="mx-auto max-w-9xl px-4 md:px-8 py-6">
        {selectedArticle ? (
          <>
            {/* Reading progress bar */}
            <div className="fixed top-0 left-0 right-0 z-40 h-1 bg-black/5">
              <div
                className="h-full bg-[#6f4e37]"
                style={{ width: `${readProgress}%` }}
              />
            </div>

            {/* บทความ */}
            <article className="bg-white rounded-2xl shadow p-4 md:p-8">
              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={handleBack}
                  className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm hover:bg-black/5 transition"
                >
                  ← กลับ
                </button>
                <div className="text-xs md:text-sm text-black/60">
                  {selectedArticle.post_date && <>• {selectedArticle.post_date} </>}
                  {selectedArticle.author && <>• {selectedArticle.author}</>}
                </div>
              </div>

              <h2 className="text-center text-2xl md:text-3xl font-bold mt-4 mb-2 text-[#2a1c14]">
                {selectedArticle.title}
              </h2>

              {/* แท็กหมวด */}
              <div className="mt-2 mb-6 flex flex-wrap justify-center gap-2">
                {(Array.isArray(selectedArticle.category)
                  ? selectedArticle.category
                  : [selectedArticle.category]
                )
                  .filter(Boolean)
                  .map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-black/10 bg-black/5 px-3 py-1 text-xs text-[#2a1c14]"
                    >
                      {tag}
                    </span>
                  ))}
              </div>

              {/* เนื้อหาเดิมครบถ้วน */}
              <div className="prose max-w-none prose-p:leading-7 prose-img:rounded-lg prose-headings:text-[#2a1c14]">
                {selectedArticle.content?.map((content, index) => {
                  if (content.type === "paragraph") {
                    return (
                      <p
                        key={index}
                        className="text-gray-700 text-base leading-7 mb-4 px-1 md:!px-10 lg:!px-24 whitespace-pre-line"
                      >
                        {content.text}
                      </p>
                    );
                  }
                  if (content.type === "image") {
                    return (
                      <img
                        key={index}
                        className="mx-auto w-full sm:w-4/5 md:w-3/5 h-auto mb-6 rounded-xl shadow"
                        src={content.src}
                        alt={content.alt || ""}
                      />
                    );
                  }
                  if (content.type === "subheading") {
                    return (
                      <h3
                        key={index}
                        className="text-lg font-semibold mb-3 px-1 md:!px-10 lg:!px-24"
                      >
                        {content.text}
                      </h3>
                    );
                  }
                  return null;
                })}
              </div>

              {selectedArticle.related_articles && (
                <div className="px-1 md:!px-10 lg:!px-24 mt-10 text-sm text-[#2a1c14]/80">
                  ที่มา :{" "}
                  <a
                    href={selectedArticle.related_articles}
                    className="underline decoration-dotted hover:opacity-80"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {selectedArticle.related_articles}
                  </a>
                </div>
              )}
            </article>
          </>
        ) : (
          <section className="bg-white rounded-2xl shadow p-4 md:p-6">
            {/* Controls: Search + Dropdown */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
              {/* Search */}
              <div className="w-full md:w-2/3">
                <label className="block text-xs text-black/60 mb-1">
                  ค้นหาบทความ
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="พิมพ์คำค้น (เช่น espresso, latte)..."
                    className="w-full pl-10 pr-3 py-2 rounded-md border border-black/10 focus:outline-none focus:ring-2 focus:ring-[#6f4e37]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {/* ไอคอนค้นหา (SVG) */}
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-black/40">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M21 21l-4.35-4.35M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </span>
                </div>
              </div>

              {/* Dropdown หมวดหมู่ */}
              <div className="w-full md:w-1/3">
                <label htmlFor="category" className="block text-xs text-black/60 mb-1">
                  หมวดบทความ
                </label>
                <div className="relative">
                  <select
                    id="category"
                    value={activeFilter}
                    onChange={(e) => setActiveFilter(e.target.value)}
                    className="w-full appearance-none rounded-md border border-black/10 bg-white py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-[#6f4e37]"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  {/* ไอคอนลูกศร (SVG) */}
                  <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-black/40">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </span>
                </div>
              </div>
            </div>

            {/* Empty state */}
            {filteredArticles.length === 0 && (
              <div className="py-16 text-center text-black/60">
                <div className="text-lg font-semibold">ไม่พบบทความ</div>
                <div className="mt-1 text-sm">
                  ลองเปลี่ยนคำค้นหรือเลือกหมวดหมู่อื่นดูนะ
                </div>
              </div>
            )}

            {/* Grid: 1/2/3 คอลัมน์ */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map((article) => {
                const cover = firstImageOf(article);
                const excerpt = firstParagraphOf(article);
                return (
                  <div
                    key={article.id}
                    role="button"
                    onClick={() => handleArticleClick(article)}
                    className="group relative rounded-2xl overflow-hidden shadow hover:shadow-lg transition cursor-pointer bg-white"
                  >
                    {/* ภาพ */}
                    <div className="relative h-52">
                      <img
                        src={cover}
                        alt={article.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                      <div className="absolute left-2 top-2 flex flex-wrap gap-1">
                        {(Array.isArray(article.category)
                          ? article.category
                          : [article.category]
                        )
                          .filter(Boolean)
                          .slice(0, 2)
                          .map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full bg-white/85 backdrop-blur px-2 py-0.5 text-[11px] text-[#2a1c14]"
                            >
                              {tag}
                            </span>
                          ))}
                      </div>
                      <div className="absolute bottom-2 left-2 right-2">
                        <h3 className="text-white font-semibold line-clamp-2 drop-shadow">
                          {article.title}
                        </h3>
                      </div>
                    </div>

                    {/* เนื้อโดยย่อ */}
                    <div className="p-4">
                      <p className="text-sm text-black/70 line-clamp-2 min-h-[2.5em]">
                        {excerpt}
                      </p>
                      <div className="mt-3 flex items-center justify-between text-[12px] text-black/50">
                        <span>{article.author}</span>
                        <span>{article.post_date}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default ArticlesPage;
