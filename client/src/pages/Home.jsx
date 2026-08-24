import { useState, useEffect, useRef } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import Navbar from "../components/Navbar";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "../assets/css/home.css";

const MENU_PATH = "/coffee_menu";

const Home = () => {
  const navigate = useNavigate();
  const { user, isLoading: loading } = useAuth();
  const scrollerRef = useRef(null);

  const goMenuItem = (name) => {
    navigate(MENU_PATH, { state: { name } });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const coffeeClick = () => {
    navigate("/coffee_bean");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goBeans = (type) => {
    navigate(`/coffee_bean?type=${encodeURIComponent(type)}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleClick = () => {
    navigate("/coffee_menu");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goBrew = () => {
    navigate("/brew");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollByCards = (dir = 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const step = window.innerWidth < 768 ? 240 : 320;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  useEffect(() => {
    AOS.init({ duration: 1000, once: true, easing: "ease-in-out", offset: 100 });
    const t = setTimeout(() => AOS.refresh(), 300);
    const el = scrollerRef.current;
    if (!el) return;
    const prevent = (e) => e.preventDefault();
    el.addEventListener("wheel", prevent, { passive: false });
    el.addEventListener("touchmove", prevent, { passive: false });
    return () => {
      clearTimeout(t);
      el.removeEventListener("wheel", prevent);
      el.removeEventListener("touchmove", prevent);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-beige-light flex flex-col items-center justify-center gap-5">
        <div className="relative size-12">
          <div className="absolute inset-0 rounded-full border-2 border-brown/10" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-brown animate-spin [animation-duration:0.9s]" />
          <div className="absolute inset-2 rounded-full border-2 border-transparent border-b-light-brown animate-spin [animation-duration:1.4s] [animation-direction:reverse]" />
        </div>
        <p className="text-brown/60 text-sm font-medium tracking-[0.15em] animate-pulse">กำลังชงกาแฟให้คุณ</p>
      </div>
    );
  }

  const cardData = [
    { title: "ประวัติกาแฟ",   path: "/history" },
    { title: "สายพันธุ์กาแฟ", path: "/geneCoffee" },
    { title: "การคั่วกาแฟ",   path: "/roasting" },
    { title: "การสกัดกาแฟ",   path: "/extraction" },
    { title: "การผลิตกาแฟ",   path: "/process" },
  ];

  const heroStats = [
    { value: "5",   label: "หมวดความรู้" },
    { value: "48",  label: "ประเทศกาแฟ" },
    { value: "20+", label: "เมนูกาแฟ" },
  ];

  const coffeeTypes = [
    { type: "instant", label: "สำเร็จรูป/ซอง", desc: "เร็ว ง่าย พกสะดวก" },
    { type: "capsule", label: "แคปซูล",       desc: "สะดวก รสชาติคงที่" },
    { type: "fresh",   label: "กาแฟสด",       desc: "หอมสดใหม่ ปรับแต่งได้" },
  ];

  const popularMenus = [
    { name: "Latte",     menuName: "ลาเต้",     desc: "นมนุ่ม หอมละมุน ดื่มง่าย" },
    { name: "Americano", menuName: "อเมริกาโน", desc: "เข้มใส ดื่มเพียวหรือเติมหวานได้" },
    { name: "Frappe",    menuName: "เฟรปเป้",   desc: "เย็นสดชื่น เนื้อสัมผัสแน่น" },
  ];

  return (
    <div className="bg-beige-light">
      <Navbar />

      {/* ─── Hero ─────────────────────────────────────────────────── */}
      <section
        className="relative isolate overflow-hidden bg-gradient-to-b from-beige-light via-beige-light to-white py-14 md:py-24 select-none"
        data-aos="fade-up"
      >
        <div className="pointer-events-none absolute -top-24 -right-20 h-72 w-72 rounded-full bg-light-brown/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-dark-brown/10 blur-2xl" />
        {/* subtle bean grid texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "radial-gradient(#20170E 1.2px, transparent 1.2px)", backgroundSize: "26px 26px" }}
        />

        <div className="relative mx-auto max-w-7xl px-4 md:px-8 flex flex-col items-center text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-brown/15 bg-white/70 backdrop-blur px-4 py-1.5 text-xs font-medium text-brown/80 shadow-sm">
            <span className="size-1.5 rounded-full bg-light-brown animate-pulse" />
            Coffee Bean Fusion
          </span>
          <h1 className="mt-5 font-extrabold text-4xl md:text-6xl text-dark-brown leading-[1.05] tracking-tight">
            ยินดีต้อนรับสู่<br className="hidden md:block" />
            <span className="bg-gradient-to-r from-brown via-light-brown to-brown bg-clip-text text-transparent">
              เว็บของคนรักกาแฟ
            </span>
          </h1>
          <p className="mt-4 max-w-2xl text-base md:text-lg font-medium text-brown/70">
            คลังความรู้ เมนู และซิมูเลเตอร์ฝึกชง ครบในที่เดียว
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button
              onClick={coffeeClick}
              className="group rounded-full bg-brown text-beige px-7 py-3.5 text-sm font-semibold shadow-lg shadow-brown/20 hover:bg-dark-brown hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brown/25 active:translate-y-0 transition-all duration-300 ease-out"
            >
              สำรวจเมล็ดกาแฟ
              <span className="inline-block ml-1.5 transition-transform duration-300 group-hover:translate-x-1">→</span>
            </button>
            <button
              onClick={handleClick}
              className="rounded-full border-2 border-brown/80 text-brown px-7 py-3.5 text-sm font-semibold hover:bg-brown hover:text-beige hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 ease-out"
            >
              ดูเมนูกาแฟ
            </button>
          </div>

          {/* Stat strip */}
          <div
            className="mt-11 inline-flex items-stretch divide-x divide-brown/10 rounded-2xl bg-white/50 backdrop-blur border border-brown/10 shadow-sm overflow-hidden"
            data-aos="fade-up"
            data-aos-delay="120"
          >
            {heroStats.map(({ value, label }) => (
              <div
                key={label}
                className="px-6 md:px-9 py-4 text-center transition-colors duration-300 hover:bg-white/60"
              >
                <div className="text-2xl md:text-3xl font-extrabold text-dark-brown tabular-nums">{value}</div>
                <div className="text-[11px] text-brown/55 mt-1 tracking-wide">{label}</div>
              </div>
            ))}
          </div>

          {/* Scroll cue — mouse indicator */}
          <div className="mt-12 flex flex-col items-center gap-2.5">
            <span className="text-[10px] uppercase tracking-[0.25em] text-brown/35">เลื่อนลง</span>
            <span className="relative flex h-9 w-5 justify-center rounded-full border border-brown/20 pt-2">
              <span className="h-1.5 w-1 rounded-full bg-brown/40 animate-bounce" />
            </span>
          </div>
        </div>
      </section>

      {/* ─── Knowledge Showcase ───────────────────────────────────── */}
      <section className="relative isolate select-none" data-aos="fade-up">
        <img
          src="/home1.jpg"
          alt=""
          className="absolute inset-0 h-[65vh] md:h-[78vh] w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/0" />
        <div className="absolute left-0 top-0 h-[3px] w-40 md:w-56 bg-white/70" />

        <div className="relative mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid h-[65vh] md:h-[78vh] grid-cols-1 md:grid-cols-2 items-center gap-10">
            {/* Left */}
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

            {/* Right: sliding cards */}
            <div className="relative">
              <div className="overflow-hidden">
                <div
                  ref={scrollerRef}
                  className="flex overflow-x-auto snap-x snap-mandatory gap-5 pt-1 pr-2 pb-6 -mb-6"
                  style={{ scrollbarWidth: "none" }}
                >
                  {cardData.map((card, index) => (
                    <Link
                      key={index}
                      to={card.path}
                      className="group relative w-[200px] md:w-[240px] shrink-0 snap-center rounded-2xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.25)] transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-[0_20px_45px_rgba(0,0,0,0.35)]"
                      data-aos="fade-up"
                      data-aos-delay={index * 100}
                    >
                      <img
                        src={card.img || `/home${index + 2}.jpg`}
                        alt={card.title}
                        className="h-[260px] md:h-[340px] w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-110"
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent transition-opacity duration-500 group-hover:from-black/80" />
                      <div className="absolute bottom-0 left-0 right-0 p-4 text-white transition-transform duration-500 ease-out group-hover:-translate-y-1">
                        <p className="text-[11px] uppercase tracking-widest opacity-80">Coffee Topic</p>
                        <h3 className="text-base md:text-lg font-semibold leading-tight">{card.title}</h3>
                      </div>
                      <div className="absolute inset-0 rounded-2xl ring-0 ring-white/0 group-hover:ring-2 group-hover:ring-white/30 transition" />
                    </Link>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex justify-center gap-3 text-white">
                <button
                  onClick={() => scrollByCards(-1)}
                  className="size-10 rounded-full border border-white/30 bg-white/10 backdrop-blur grid place-items-center hover:bg-white/25 hover:scale-110 active:scale-95 transition-all duration-300 ease-out"
                  aria-label="ก่อนหน้า"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5">
                    <path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <button
                  onClick={() => scrollByCards(1)}
                  className="size-10 rounded-full border border-white/30 bg-white/10 backdrop-blur grid place-items-center hover:bg-white/25 hover:scale-110 active:scale-95 transition-all duration-300 ease-out"
                  aria-label="ถัดไป"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5">
                    <path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute -bottom-10 left-1/2 h-20 w-[86%] -translate-x-1/2 rounded-[100%] bg-black/15 blur-2xl" />
      </section>

      {/* ─── Coffee Types ─────────────────────────────────────────── */}
      <section className="relative py-16 md:py-20 px-4 md:px-8 lg:px-10 bg-gradient-to-b from-white to-beige-light select-none">
        <div className="pointer-events-none absolute -top-12 right-6 h-24 w-24 rounded-full bg-beige/40 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-12 left-6 h-28 w-28 rounded-full bg-light-brown/10 blur-2xl" />

        <div className="relative mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-10">
            {/* Image card */}
            <div className="flex justify-center" data-aos="zoom-in">
              <div className="w-full max-w-sm rounded-2xl bg-white/80 backdrop-blur shadow-[0_12px_40px_rgba(0,0,0,0.12)] p-8">
                <img
                  src="/coffee.png"
                  alt="Coffee"
                  className="mx-auto w-36 h-36 object-contain drop-shadow-sm"
                />
                <div className="mt-5 text-center">
                  <p className="text-sm text-brown/70 leading-relaxed">
                    &quot;เริ่มต้นจากแก้วนี้&quot; คือพื้นฐานที่เข้าใจง่ายสำหรับทุกคน
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="text-center lg:text-left" data-aos="fade-left">
              <p className="uppercase tracking-widest text-xs text-light-brown/70">พื้นฐานกาแฟ</p>
              <h2 className="mt-2 text-2xl md:text-3xl font-bold text-dark-brown">กาแฟในชีวิตประจำวัน</h2>
              <p className="mt-3 text-brown/80 leading-relaxed">
                กาแฟมีหลายรูปแบบให้เลือกตามไลฟ์สไตล์:
                กาแฟซอง/สำเร็จรูป <span className="text-light-brown font-medium">สะดวก รวดเร็ว</span>,
                กาแฟแคปซูลให้รสชาติใกล้เคียงกาแฟสด,
                และกาแฟสดที่เด่นเรื่อง <span className="text-light-brown font-medium">กลิ่น–รสจากการบดใหม่</span>
              </p>

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
                {coffeeTypes.map(({ type, label, desc }) => (
                  <div
                    key={type}
                    role="button"
                    tabIndex={0}
                    onClick={() => goBeans(type)}
                    onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && goBeans(type)}
                    className="group relative cursor-pointer overflow-hidden rounded-xl border border-dark-brown/10 bg-white/80 p-4 text-left transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg hover:border-light-brown/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-light-brown/50"
                    aria-label={`ดู${label}`}
                  >
                    <span className="absolute left-0 top-0 h-full w-1 origin-top scale-y-0 bg-light-brown transition-transform duration-300 ease-out group-hover:scale-y-100" />
                    <div className="font-semibold text-dark-brown text-sm">{label}</div>
                    <p className="mt-2 text-sm text-brown/70">{desc}</p>
                    <span className="mt-3 inline-block text-xs font-medium text-light-brown opacity-0 -translate-x-1 transition-all duration-300 ease-out group-hover:opacity-100 group-hover:translate-x-0">
                      ดูเพิ่มเติม →
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-xl border border-light-brown/20 bg-beige-light p-4">
                <p className="text-sm text-brown/80 leading-relaxed">
                  <span className="font-semibold text-light-brown">TIP:</span>{" "}
                  ถ้าเริ่มต้นใหม่ ลองกาแฟสดแบบ &quot;ดริป/เฟรนช์เพรส&quot; ก่อน ใช้อุปกรณ์น้อยและราคาย่อมเยา
                </p>
              </div>

              <div className="mt-6 flex flex-wrap gap-3 justify-center lg:justify-start">
                <button
                  className="rounded-full bg-brown text-beige px-5 py-3 text-sm font-semibold shadow hover:bg-dark-brown transition"
                  onClick={coffeeClick}
                >
                  อ่านเพิ่มเติม
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Simulator Invite ─────────────────────────────────────── */}
      <section className="relative py-16 md:py-20 px-4 md:px-8 bg-brown overflow-hidden select-none" data-aos="fade-up">
        <div className="pointer-events-none absolute inset-0 bg-[url('/home1.jpg')] bg-cover bg-center opacity-10" />
        <div className="pointer-events-none absolute -top-16 -left-10 h-56 w-56 rounded-full bg-beige/5 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -right-10 h-56 w-56 rounded-full bg-beige/5 blur-3xl" />

        <div className="relative mx-auto max-w-4xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-beige/20 bg-beige/10 px-4 py-1.5 text-xs font-medium tracking-wide text-beige/80">
            Brew Simulator
          </span>
          <h2 className="mt-4 text-2xl md:text-4xl font-bold text-beige leading-tight">
            ลองชงกาแฟเสมือนจริง ด้วยตัวเอง
          </h2>
          <p className="mt-3 text-beige/70 max-w-xl mx-auto text-sm md:text-base leading-relaxed">
            เลือกอุปกรณ์ ปรับตัวแปรแต่ละขั้นตอน แล้วดูผล Flavor Profile กับค่าโภชนาการที่ได้ทันที
          </p>

          {/* 3-step flow */}
          <div className="mt-10 flex items-center justify-center gap-3 md:gap-6 flex-wrap">
            {[
              { n: "01", label: "เลือกอุปกรณ์" },
              { n: "02", label: "ทำตามขั้นตอน" },
              { n: "03", label: "ดูผลลัพธ์" },
            ].map((s, i, arr) => (
              <div key={s.n} className="flex items-center gap-3 md:gap-6">
                <div className="group flex flex-col items-center gap-2.5">
                  <div className="grid place-items-center size-14 md:size-16 rounded-2xl bg-beige/10 border border-beige/20 backdrop-blur font-extrabold text-lg md:text-xl text-beige transition-all duration-300 ease-out group-hover:bg-beige/20 group-hover:scale-105 group-hover:border-beige/40">
                    {s.n}
                  </div>
                  <span className="text-[11px] md:text-xs text-beige/70 font-medium">{s.label}</span>
                </div>
                {i < arr.length - 1 && (
                  <span className="mb-6 h-px w-6 md:w-12 bg-gradient-to-r from-beige/10 via-beige/40 to-beige/10" />
                )}
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <button
              onClick={goBrew}
              className="group rounded-full bg-beige text-brown px-8 py-3.5 text-sm font-bold shadow-lg hover:bg-white hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 transition-all duration-300 ease-out"
            >
              ลองชงกาแฟเลย
              <span className="inline-block ml-1.5 transition-transform duration-300 group-hover:translate-x-1">→</span>
            </button>
            <button
              onClick={handleClick}
              className="rounded-full border border-beige/30 text-beige px-7 py-3.5 text-sm font-semibold hover:bg-beige/10 hover:border-beige/50 transition-all duration-300 ease-out"
            >
              ดูเมนูทั้งหมด
            </button>
          </div>
        </div>
      </section>

      {/* ─── Menu Section ─────────────────────────────────────────── */}
      <section className="relative py-14 px-4 md:px-16 lg:px-32 bg-white select-none" data-aos="fade-up">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <p className="uppercase tracking-[0.18em] text-[11px] text-neutral-500">Menu</p>
            <h2 className="mt-1 text-3xl md:text-4xl font-bold text-dark-brown">เมนูกาแฟ</h2>
            <div className="mx-auto mt-3 h-px w-16 bg-neutral-300" />
            <p className="mt-4 text-brown/70 md:px-24">
              จัดหมวดหมู่ชัดเจน ค้นหาเมนูที่ต้องการได้ง่าย
            </p>
          </div>

          <div className="mt-8">
            <h3 className="text-center text-sm uppercase tracking-[0.14em] text-neutral-500">เมนูยอดนิยม</h3>
            <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
              {popularMenus.map(({ name, menuName, desc }, i) => (
                <article
                  key={name}
                  className="group rounded-xl border border-neutral-200 bg-white p-5 shadow-sm hover:shadow-lg hover:border-light-brown/25 hover:-translate-y-1 transition-all duration-300 ease-out"
                  data-aos="fade-up"
                  data-aos-delay={i * 60}
                >
                  <div className="flex items-center gap-3">
                    <div className="grid place-items-center h-11 w-11 rounded-xl bg-gradient-to-br from-beige to-brown-superlight text-brown font-bold text-lg shrink-0 transition-transform duration-300 ease-out group-hover:scale-110 group-hover:rotate-3">
                      {name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-dark-brown">{name}</h4>
                      <p className="text-sm text-brown/70">{desc}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => goMenuItem(menuName)}
                    className="mt-4 w-full rounded-full border border-dark-brown/20 bg-white px-3 py-2 text-sm font-medium text-dark-brown hover:bg-brown hover:text-beige hover:border-brown transition-all duration-300 ease-out"
                  >
                    ดูเมนูนี้
                  </button>
                </article>
              ))}
            </div>
          </div>

          <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="text-center lg:text-left">
              <p className="text-brown/70 leading-relaxed">
                ต้องการดูเมนูทั้งหมดหรือปรับแต่งตามความชอบ? ไปที่หน้ารวมเมนูเพื่อเลือกตามหมวดหมู่
              </p>
              <div className="mt-4 flex flex-wrap justify-center lg:justify-start">
                <button
                  className="rounded-full bg-dark-brown text-beige px-5 py-3 text-sm font-semibold shadow hover:bg-brown transition"
                  onClick={handleClick}
                >
                  ค้นหาเมนูทั้งหมด
                </button>
              </div>
            </div>

            <div>
              <figure
                className="relative w-full max-w-md ml-auto rounded-xl overflow-hidden shadow-[0_12px_32px_rgba(0,0,0,0.12)]"
                data-aos="zoom-in"
              >
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

    </div>
  );
};

export default Home;
