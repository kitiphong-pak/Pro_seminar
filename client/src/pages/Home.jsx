import { useState, useEffect, useRef } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import Navbar from "../components/Navbar";
import { Link, useNavigate, useRevalidator } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Footer from "../components/Footer";
import "../assets/css/home.css";

const MENU_PATH = "/coffee_menu"; // เปลี่ยนให้ตรงกับ route จริงของคุณ

const Home = () => {
  const navigate = useNavigate();
  const { user, isLoading: loading } = useAuth();
  const scrollerRef = useRef(null);


  // ไปหน้าเมนู พร้อมพารามิเตอร์ระบุเมนูยอดนิยมที่เลือก
  const goMenuItem = (name) => {
    navigate(MENU_PATH, { state: { name } });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // (ตัวเลือก) ปุ่มแบบจำลอง — ตอนนี้ผูกกับ quiz ไปก่อน
  // ถ้าคุณมีหน้าจำลองจริง เช่น /brew-simulator ค่อยเปลี่ยน path ทีหลังได้
  const simulateClick = () => {
    quizClick(); // ชี้ไปหน้า /quiz ชั่วคราว
    // หรือ: navigate("/brew-simulator");
  };

  useEffect(() => {
    // AOS แนะนำให้ init ครั้งเดียวพอ (React 18/StrictMode จะ render ซ้ำ)
    AOS.init({
      duration: 1000,
      once: true,              // ✅ เล่นแอนิเมชันครั้งเดียว
      easing: "ease-in-out",
      offset: 100,
    });

    // กัน layout กระตุกหลังรูปโหลด
    const t = setTimeout(() => AOS.refresh(), 300);

    const el = scrollerRef.current;
    if (!el) return;

    const prevent = (e) => e.preventDefault(); // กันล้อเมาส์/นิ้วปัด

    el.addEventListener("wheel", prevent, { passive: false });
    el.addEventListener("touchmove", prevent, { passive: false });

    return () => {
      clearTimeout(t);
      el.removeEventListener("wheel", prevent);
      el.removeEventListener("touchmove", prevent);
    };
  }, []);

  if (loading) {
    return <div className="text-center mt-10">กำลังโหลด...</div>; 
  }

  const cardData = [
    { title: "ประวัติกาแฟ", path: "/history" },
    { title: "สายพันธุ์กาแฟ", path: "/geneCoffee" },
    { title: "การคั่วกาแฟ", path: "/roasting" },
    { title: "การสกัดกาแฟ", path: "/extraction" },
    { title: "การผลิตกาแฟ", path: "/process" },
  ];

  const coffeeClick = () => {
    navigate("/coffee_bean");
    window.scrollTo({ top: 0, behavior: "smooth" }); // เลื่อนหน้าไปด้านบนอย่างนุ่มนวล
  };
  const goBeans = (type) => {
  navigate(`/coffee_bean?type=${encodeURIComponent(type)}`);
  window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const quizClick = () => {
    navigate("/quiz");
    window.scrollTo({ top: 0, behavior: "smooth" }); // เลื่อนหน้าไปด้านบนอย่างนุ่มนวล
  };

  const handleClick = () => {
    navigate("/coffee_menu");
    window.scrollTo({ top: 0, behavior: "smooth" }); // เลื่อนหน้าไปด้านบนอย่างนุ่มนวล
  };

  // console.log(userId);  

  const scrollByCards = (dir = 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const step = window.innerWidth < 768 ? 240 : 320; // ระยะเลื่อนต่อครั้ง
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  return (
    <div className="bg-[#f3f1ec]">
      <Navbar />

      {/* Header Section */}
      {/* Hero — Minimal Welcome */}
      <section
        className="relative isolate overflow-hidden bg-[#f3f1ec] h-[12vh] md:h-[24vh]"
        data-aos="fade-up"
      >
        {/* subtle decor (เบลอจาง ๆ) */}
        <div className="absolute -top-24 -right-20 h-72 w-72 rounded-full bg-[#b5835a]/10 blur-2xl" />
        <div className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-[#3e2a1f]/10 blur-2xl" />

        <div className="relative mx-auto h-full max-w-7xl px-4 md:px-8 flex flex-col items-center justify-center text-center">
          <p className="uppercase tracking-widest text-xs text-[#3e2a1f]/70">
            Welcome
          </p>

          <h1 className="mt-2 font-extrabold text-3xl md:text-5xl text-[#2a1c14]">
            ยินดีต้อนรับสู่เว็บของคนรักกาแฟ
          </h1>

          <p className="mt-2 max-w-2xl text-2xl font-extrabold md:text-2xl text-[#2a1c14]/80">
            เพราะเราเข้าใจคุณ
          </p>
        </div>
      </section>

      {/* Showcase • สไตล์เหมือนตัวอย่าง */}
      <section className="relative isolate" data-aos="fade-up">
        {/* พื้นหลัง (เปลี่ยนรูปได้) */}
        <img
          src="/home1.jpg"
          alt=""
          className="absolute inset-0 h-[68vh] md:h-[80vh] w-full object-cover"
        />
        {/* ไล่สีทับเพื่อให้อ่านง่าย */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/0" />
        {/* เส้นบางด้านบนให้ฟีลดีไซน์ */}
        <div className="absolute left-0 top-0 h-[3px] w-40 md:w-56 bg-white/70" />

        <div className="relative mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid h-[68vh] md:h-[80vh] grid-cols-1 md:grid-cols-2 items-center gap-10">
            {/* ซ้าย: หัวข้อใหญ่ */}
            <div className="text-white">
              <p className="uppercase tracking-widest text-[11px] md:text-xs text-white/80">
                Coffee Knowledge • Library
              </p>
              <h2 className="mt-1 leading-[0.95] font-extrabold text-5xl md:text-7xl">
                <span className="block">COFFEE</span>
                <span className="block">ENCYCLOPEDIA</span>
              </h2>
              <p className="mt-4 max-w-xl text-sm md:text-base text-white/85">
                เรียนรู้ตั้งแต่ประวัติ สายพันธุ์ การคั่ว การสกัด ไปจนถึงกระบวนการผลิต
                รวบรวมเป็นการ์ดให้เลื่อนดูได้แบบสไลด์
              </p>
            </div>

            {/* ขวา: การ์ดสไลด์ */}
            <div className="relative">
              <div className="overflow-hidden">
                <div
                  ref={scrollerRef}
                  className="flex overflow-x-auto snap-x snap-mandatory gap-5 pt-1 pr-2 pb-6 -mb-6 overflow-hidden"
                >
                  {cardData.map((card, index) => (
                    <Link
                      key={index}
                      to={card.path}
                      className="group relative w-[220px] md:w-[260px] shrink-0 snap-center rounded-2xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.25)] transition-transform duration-300 hover:-translate-y-1"
                      data-aos="fade-up"
                      data-aos-delay={index * 100}
                    >
                      <img
                        src={card.img || `/home${index + 2}.jpg`}
                        alt={card.title}
                        className="h-[300px] md:h-[360px] w-full object-cover"
                      />
                      {/* gradient ทับด้านล่าง */}
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                      {/* ข้อความบนการ์ด */}
                      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                        <p className="text-[11px] uppercase tracking-widest opacity-80">
                          {card.subtitle || "Coffee Topic"}
                        </p>
                        <h3 className="text-lg md:text-xl font-semibold leading-tight">
                          {card.title}
                        </h3>
                      </div>
                      {/* soft ring เวลาโฮเวอร์ */}
                      <div className="absolute inset-0 rounded-2xl ring-0 ring-white/0 group-hover:ring-2 group-hover:ring-white/30 transition" />
                    </Link>
                  ))}
                </div> 
              </div>
              {/* ปุ่มลูกศร (มือถือ) */}
              <div className="mt-4 flex justify-center gap-3 text-white no-scrollbar">
                <button
                  onClick={() => scrollByCards(-1)}
                  className="size-10 rounded-full border border-white/30 bg-white/10 backdrop-blur grid place-items-center"
                  aria-label="Prev"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5">
                    <path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <button
                  onClick={() => scrollByCards(1)}
                  className="size-10 rounded-full border border-white/30 bg-white/10 backdrop-blur grid place-items-center"
                  aria-label="Next"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5">
                    <path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* เงาลอยทั้งหน้าให้คล้ายตัวอย่าง */}
        <div className="pointer-events-none absolute -bottom-10 left-1/2 h-20 w-[86%] -translate-x-1/2 rounded-[100%] bg-black/15 blur-2xl" />
      </section>

      {/* Coffee Info Section — richer, but clean */}
      <section
        className="pt-48 pb-48 relative py-12 px-4 md:px-8 lg:px-10 bg-gradient-to-b from-white to-[#f7f3ee]"
      >
        {/* soft decor */}
        <div className="pointer-events-none absolute -top-12 right-6 h-24 w-24 rounded-full bg-[#d4a373]/15 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-12 left-6 h-28 w-28 rounded-full bg-[#6f4e37]/10 blur-2xl" />

        <div className="relative mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-10">
            {/* LEFT: image card */}
            <div className="flex justify-center">
              <div className="w-full max-w-sm rounded-2xl bg-white/80 backdrop-blur shadow-[0_12px_40px_rgba(0,0,0,0.12)] p-6">
                <img
                  src="/coffee.png"
                  alt="Coffee"
                  className="mx-auto w-28 h-28 object-contain drop-shadow-sm"
                  data-aos="zoom-in"
                />
                <div className="mt-4 text-center">
                  <p className="text-sm text-[#2a1c14]/70">
                    “เริ่มต้นจากแก้วนี้” — พื้นฐานที่เข้าใจง่ายสำหรับทุกคน
                  </p>
                </div>
              </div>
            </div>

            {/* RIGHT: content */}
            <div className="text-center lg:text-left">
              <p className="uppercase tracking-widest text-xs text-[#6f4e37]/70">พื้นฐานกาแฟ</p>
              <h2 className="mt-1 text-2xl md:text-3xl font-bold text-[#2a1c14]">กาแฟในชีวิตประจำวัน</h2>

              <p className="mt-3 text-[#2a1c14]/85">
                กาแฟมีหลายรูปแบบให้เลือกตามไลฟ์สไตล์:
                <span className="hidden lg:inline"> </span>
                กาแฟซอง/สำเร็จรูป <span className="text-[#6f4e37]">สะดวก รวดเร็ว</span>,
                กาแฟแคปซูลให้รสชาติใกล้เคียงกาแฟสด,
                และกาแฟสดที่เด่นเรื่อง <span className="text-[#6f4e37]">กลิ่น–รสจากการบดใหม่</span>.
                เลือกแบบที่ใช่ แล้วค่อยต่อยอดสู่เมล็ดและการชงที่ละเอียดขึ้น
              </p>

              {/* features mini-cards */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* สำเร็จรูป */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => goBeans("instant")}
                  onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && goBeans("instant")}
                  className="cursor-pointer rounded-xl border border-[#2a1c14]/10 bg-white/80 p-4 text-left hover:shadow-md transition hover-but"
                  aria-label="ดูเมล็ด/กาแฟแบบสำเร็จรูป"
                >
                  <div className="flex items-center gap-3 ">
                    <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#6f4e37]">
                      <path d="M3 7h12v10H3zM15 9h5a1 1 0 0 1 1 1v4a3 3 0 0 1-3 3h-3"
                        fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <div className="font-semibold text-[#2a1c14]">สำเร็จรูป/ซอง</div>
                  </div>
                  <p className="mt-2 text-sm text-[#2a1c14]/70">เร็ว ง่าย พกสะดวก</p>
                </div>

                {/* แคปซูล */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => goBeans("capsule")}
                  onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && goBeans("capsule")}
                  className="cursor-pointer rounded-xl border border-[#2a1c14]/10 bg-white/80 p-4 text-left hover:shadow-md transition hover-but"
                  aria-label="ดูเมล็ด/กาแฟแบบแคปซูล"
                >
                  <div className="flex items-center gap-3">
                    <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#6f4e37]">
                      <path d="M7 4h10v16H7zM4 8h16"
                        fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <div className="font-semibold text-[#2a1c14]">แคปซูล</div>
                  </div>
                  <p className="mt-2 text-sm text-[#2a1c14]/70">สะดวก รสชาติคงที่</p>
                </div>

                {/* กาแฟสด */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => goBeans("fresh")}
                  onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && goBeans("fresh")}
                  className="cursor-pointer rounded-xl border border-[#2a1c14]/10 bg-white/80 p-4 text-left hover:shadow-md transition hover-but"
                  aria-label="ดูเมล็ด/กาแฟสด"
                >
                  <div className="flex items-center gap-3">
                    <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#6f4e37]">
                      <path d="M4 17h12a4 4 0 0 0 0-8H4v8z"
                        fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <div className="font-semibold text-[#2a1c14]">กาแฟสด</div>
                  </div>
                  <p className="mt-2 text-sm text-[#2a1c14]/70">หอมสดใหม่ ปรับแต่งได้</p>
                </div>

              </div>


              {/* tip box */}
              <div className="mt-2 rounded-xl border border-[#6f4e37]/15 bg-[#fff7f0] p-4">
                <p className="text-sm text-[#2a1c14]/80">
                  <span className="font-semibold text-[#6f4e37]">TIP:</span> ถ้าเริ่มต้นใหม่
                  ลองกาแฟสดแบบ “ดริป/เฟรนช์เพรส” ก่อน — อุปกรณ์น้อย ราคาย่อมเยา
                </p>
              </div>

              {/* CTA */}
              <div className="mt-6 flex flex-wrap gap-3 justify-center lg:justify-center">
                <button
                  className="bg-[#8b4513] text-white px-5 py-3 rounded-full text-sm font-semibold shadow hover:opacity-90 transition"
                  onClick={coffeeClick}
                >
                  อ่านเพิ่มเติม
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Menu Section — formal, top-down with 3 popular items */}
      <section className="relative py-12 px-4 md:px-16 lg:px-32 bg-white" data-aos="fade-up">
        <div className="mx-auto max-w-6xl">
          {/* Heading สุภาพสไตล์ knowledge */}
          <div className="text-center">
            <p className="uppercase tracking-[0.18em] text-[11px] text-neutral-500">Menu</p>
            <h2 className="mt-1 text-3xl md:text-4xl font-bold text-[#2a1c14]">เมนูกาแฟ</h2>
            <div className="mx-auto mt-3 h-px w-16 bg-neutral-300" />
            <p className="mt-4 text-neutral-700 md:px-24">
              เลือกเมนูที่ใช่ในสไตล์คุณ — จัดหมวดหมู่ชัดเจน ค้นหาได้ง่าย
            </p>
          </div>

          {/* Popular 3 (บนลงล่าง) */}
          <div className="mt-8">
            <h3 className="text-center text-sm uppercase tracking-[0.14em] text-neutral-500">เมนูยอดนิยม</h3>

            <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Latte */}
              <article className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm hover:shadow-md transition" data-aos="fade-up" data-aos-delay="50">
                <div className="flex items-center gap-3">
                  <div className="grid place-items-center h-10 w-10 rounded-lg bg-[#f6f2ec] text-xl">🥛</div>
                  <div>
                    <h4 className="font-semibold text-[#2a1c14]">Latte</h4>
                    <p className="text-sm text-neutral-600">นมนุ่ม หอมละมุน ดื่มง่าย</p>
                  </div>
                </div>
                <button
                  onClick={() => goMenuItem("ลาเต้")}
                  className="mt-4 w-full rounded-full border border-[#2a1c14]/20 bg-white px-3 py-2 text-sm font-medium text-[#2a1c14] hover:bg-white/90"
                >
                  ดูเมนูนี้
                </button>
              </article>

              {/* Americano */}
              <article className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm hover:shadow-md transition" data-aos="fade-up" data-aos-delay="100">
                <div className="flex items-center gap-3">
                  <div className="grid place-items-center h-10 w-10 rounded-lg bg-[#f6f2ec] text-xl">☕️</div>
                  <div>
                    <h4 className="font-semibold text-[#2a1c14]">Americano</h4>
                    <p className="text-sm text-neutral-600">เข้มใส ดื่มเพียวหรือเติมหวานได้</p>
                  </div>
                </div>
                <button
                  onClick={() => goMenuItem("อเมริกาโน")}
                  className="mt-4 w-full rounded-full border border-[#2a1c14]/20 bg-white px-3 py-2 text-sm font-medium text-[#2a1c14] hover:bg-white/90"
                >
                  ดูเมนูนี้
                </button>
              </article>

              {/* Frappe */}
              <article className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm hover:shadow-md transition" data-aos="fade-up" data-aos-delay="150">
                <div className="flex items-center gap-3">
                  <div className="grid place-items-center h-10 w-10 rounded-lg bg-[#f6f2ec] text-xl">🧊</div>
                  <div>
                    <h4 className="font-semibold text-[#2a1c14]">Frappe</h4>
                    <p className="text-sm text-neutral-600">เย็นสดชื่น เนื้อสัมผัสแน่น</p>
                  </div>
                </div>
                <button
                  onClick={() => goMenuItem("เฟรปเป้")}
                  className="mt-4 w-full rounded-full border border-[#2a1c14]/20 bg-white px-3 py-2 text-sm font-medium text-[#2a1c14] hover:bg-white/90"
                >
                  ดูเมนูนี้
                </button>
              </article>
            </div>
          </div>

          {/* CTA รวม + แบบจำลอง */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            <div className="order-2 lg:order-1 text-center lg:text-left">
              <p className="text-neutral-700">
                ต้องการดูเมนูทั้งหมดหรือปรับแต่งตามความชอบ? ไปที่หน้ารวมเมนูเพื่อเลือกตามหมวดหมู่
              </p>
              <div className="mt-4 flex flex-wrap justify-center lg:justify-center">
                <button
                  className="rounded-full bg-[#2a1c14] text-white px-5 py-3 text-sm font-semibold shadow hover:opacity-90 transition"
                  onClick={handleClick}
                >ค้นหาเมนูทั้งหมด
                </button>
              </div>
            </div>

            {/* ภาพประกอบ (อยู่ล่างใน mobile, ขวาใน desktop) */}
            <div className="order-1 lg:order-2 self-start lg:self-start">
              <figure className="relative w-full max-w-md mr-auto rounded-xl overflow-hidden shadow-[0_12px_32px_rgba(0,0,0,0.12)]" data-aos="zoom-in">
                <div className="aspect-[5/4]">
                  <img src="/menucoffee.png" alt="ภาพประกอบเมนู" className="h-full w-full object-cover" />
                </div>
                <figcaption className="absolute bottom-3 right-3 rounded-full bg-white/85 px-3 py-1 text-[11px] text-neutral-700 backdrop-blur">
                  ภาพประกอบเมนู
                </figcaption>
              </figure>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Home;
