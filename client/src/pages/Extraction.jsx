import { useEffect, useState, useCallback } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BackToTop from "../components/BackToTop";
import AOS from "aos";
import "aos/dist/aos.css";
import { updateUserAchievement } from "../firebase/firebaseAchievements";
import { useAuth } from "../contexts/AuthContext";

function Extraction() {
  const [activeId, setActiveId] = useState("moka");
  const [tocOpen, setTocOpen] = useState(false);
  const { user } = useAuth();
  const uid = user?.uid ?? null;

  // AOS
  useEffect(() => {
    AOS.init({ duration: 800, once: true, easing: "ease-out" });
  }, []);

  // Achievement เมื่อเลื่อนเกือบสุด
  useEffect(() => {
    if (!uid) return;
    const onScroll = () => {
      const H = document.documentElement.scrollHeight;
      const vh = window.innerHeight;
      if (window.scrollY + vh >= H - 100) {
        updateUserAchievement(uid, "content", "extraction_coffee", true);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [uid]);

  // สารบัญ
  const navItems = [
    { id: "moka", title: "โมก้าพอต (MOKA POT)" },
    { id: "drip", title: "กาแฟดริป (Drip)" },
    { id: "french", title: "เฟรนช์เพรส (French Press)" },
    { id: "espresso", title: "เครื่องเอสเปรสโซ่ (Espresso)" },
    { id: "colddrip", title: "ดริปเย็น (Cold drip)" },
    { id: "aeropress", title: "กาแฟแอโรเพรส (Aeropress)" },
    { id: "siphon", title: "กาแฟไซฟอน (Siphon)" },
    { id: "coldbrew", title: "กาแฟสกัดเย็น (Cold brew)" },
    { id: "nitro", title: "กาแฟไนโตร (Nitro Cold Brew)" },
  ];

  // ไปยังหัวข้อ
  const scrollToId = useCallback((id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    setTocOpen(false);
  }, []);

  // scroll spy
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] }
    );
    navItems.forEach((n) => {
      const el = document.getElementById(n.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []); // navItems IDs คงที่

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

      {/* โครง: Sidebar (เดสก์ท็อป) + Content */}
      <div className="mx-auto max-w-7xl px-4 md:px-8 py-8 lg:grid lg:grid-cols-[260px_1fr] lg:gap-10">
        {/* Sidebar – เดสก์ท็อป */}
        <aside className="hidden lg:block">
          <div className="sticky top-20 rounded-2xl border border-black/5 bg-white shadow">
            <div className="px-4 py-3 border-b text-sm font-semibold text-[#2a1c14]">
              สารบัญวิธีชง
            </div>
            <nav className="p-2">
              <ul className="space-y-1">
                {navItems.map((n) => (
                  <li key={n.id}>
                    <button
                      onClick={() => scrollToId(n.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition
                      ${
                        activeId === n.id
                          ? "bg-[#2a1c14] text-white"
                          : "text-[#2a1c14] hover:bg-black/5"
                      }`}
                    >
                      {n.title}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </aside>

        {/* Content */}
        <main className="space-y-10">
          {/* (1) Moka Pot */}
          <section id="moka" className="scroll-mt-24" data-aos="fade-right">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              <figure className="lg:col-span-6">
                <div className="relative h-full w-full min-h-[320px] rounded-2xl overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.14)]">
                  <img src="/extraction/extraction2.png" alt="Moka Pot" className="h-full w-full object-cover" />
                  <span className="absolute bottom-3 left-3 rounded-full bg-white/85 px-3 py-1 text-[11px] text-neutral-700">
                    Moka Pot
                  </span>
                </div>
              </figure>
              <article className="lg:col-span-6">
                <div className="h-full bg-white rounded-2xl shadow p-6 flex flex-col">
                  <h2 className="text-xl md:text-2xl font-bold mb-4">โมก้าพอต (MOKA POT)</h2>
                  <p className="text-gray-700 leading-relaxed">
                    โมก้าพอต (Moka Pot)
                    เป็นอุปกรณ์ชงกาแฟที่ใช้แรงดันไอน้ำผ่านผงกาแฟบดหยาบถึงปานกลาง
                    แบ่งออกเป็น 3 ส่วน: ส่วนล่างใส่น้ำ, ส่วนกลางใส่ผงกาแฟ,
                    และส่วนบนเก็บน้ำกาแฟที่สกัดออกมา
                    กาแฟที่ได้มีความเข้มข้นใกล้เคียงกับเอสเปรสโซ
                    แต่มีกลิ่นและรสชาติที่เป็นเอกลักษณ์
                    เหมาะสำหรับผู้ที่ต้องการกาแฟเข้มข้นโดยไม่ต้องใช้เครื่องชงแรงดันสูง
                  </p>
                </div>
              </article>
            </div>
          </section>

          {/* (2) Drip */}
          <section id="drip" className="scroll-mt-24" data-aos="fade-left">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              <figure className="lg:col-span-6 order-2 lg:order-1">
                <div className="relative h-full w-full min-h-[320px] rounded-2xl overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.14)]">
                  <img src="/extraction/extraction3.jpg" alt="Drip Coffee" className="h-full w-full object-cover" />
                  <span className="absolute bottom-3 left-3 rounded-full bg-white/85 px-3 py-1 text-[11px] text-neutral-700">
                    Drip
                  </span>
                </div>
              </figure>
              <article className="lg:col-span-6 order-1 lg:order-2">
                <div className="h-full bg-white rounded-2xl shadow p-6 flex flex-col">
                  <h2 className="text-xl md:text-2xl font-bold mb-4">กาแฟดริป (Drip)</h2>
                  <p className="text-gray-700 leading-relaxed">
                    กาแฟดริป (Drip)
                    เป็นวิธีชงกาแฟแบบกรองที่ใช้น้ำร้อนรินผ่านผงกาแฟบดกลางถึงละเอียดลงบนกระดาษกรองหรือฟิลเตอร์
                    วิธีนี้ช่วยดึงรสชาติและกลิ่นหอมของกาแฟออกมาอย่างช้าๆ
                    ทำให้ได้กาแฟที่มีรสชาติสะอาด นุ่มนวล
                    และสามารถควบคุมระดับความเข้มข้นได้
                    เหมาะสำหรับผู้ที่ชื่นชอบกาแฟที่มีความซับซ้อนของรสชาติและต้องการสัมผัสโน้ตรสชาติของเมล็ดกาแฟแต่ละชนิดอย่างเต็มที่
                  </p>
                </div>
              </article>
            </div>
          </section>

          {/* (3) French Press */}
          <section id="french" className="scroll-mt-24" data-aos="fade-right">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              <figure className="lg:col-span-6">
                <div className="relative h-full w-full min-h-[320px] rounded-2xl overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.14)]">
                  <img src="/extraction/extraction4.jpg" alt="French Press" className="h-full w-full object-cover" />
                  <span className="absolute bottom-3 left-3 rounded-full bg-white/85 px-3 py-1 text-[11px] text-neutral-700">
                    French Press
                  </span>
                </div>
              </figure>
              <article className="lg:col-span-6">
                <div className="h-full bg-white rounded-2xl shadow p-6 flex flex-col">
                  <h2 className="text-xl md:text-2xl font-bold mb-4">เฟรนช์เพรส (French Press)</h2>
                  <p className="text-gray-700 leading-relaxed">
                    เฟรนช์เพรส (French Press) เป็นวิธีชงกาแฟแบบแช่ (Immersion
                    Brewing) ที่ใช้น้ำร้อนแช่กับผงกาแฟบดหยาบประมาณ 4 นาที
                    ก่อนกดลูกสูบที่มีตัวกรองโลหะลงเพื่อแยกกากกาแฟออก
                    วิธีนี้ทำให้กาแฟมีเนื้อสัมผัสเข้มข้น
                    มีน้ำมันกาแฟและกลิ่นหอมเต็มที่ เนื่องจากไม่มีการใช้กระดาษกรอง
                    เหมาะสำหรับผู้ที่ชอบกาแฟที่มีบอดี้หนักและรสชาติเต็มอิ่ม
                  </p>
                </div>
              </article>
            </div>
          </section>

          {/* (4) Espresso */}
          <section id="espresso" className="scroll-mt-24" data-aos="fade-left">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              <figure className="lg:col-span-6 order-2 lg:order-1">
                <div className="relative h-full w-full min-h-[320px] rounded-2xl overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.14)]">
                  <img src="/extraction/extraction5.jpg" alt="Espresso" className="h-full w-full object-cover" />
                  <span className="absolute bottom-3 left-3 rounded-full bg-white/85 px-3 py-1 text-[11px] text-neutral-700">
                    Espresso
                  </span>
                </div>
              </figure>
              <article className="lg:col-span-6 order-1 lg:order-2">
                <div className="h-full bg-white rounded-2xl shadow p-6 flex flex-col">
                  <h2 className="text-xl md:text-2xl font-bold mb-4">เครื่องเอสเปรสโซ่ (Espresso)</h2>
                  <p className="text-gray-700 leading-relaxed">
                    เครื่องเอสเปรสโซ่ (Espresso Machine)
                    เป็นอุปกรณ์ชงกาแฟที่ใช้แรงดันสูง (9 บาร์ขึ้นไป)
                    ดันน้ำร้อนผ่านผงกาแฟบดละเอียด ทำให้ได้กาแฟที่เข้มข้น มีกลิ่นหอม
                    และมีครีม่า (Crema) บนผิวหน้า กาแฟเอสเปรสโซ่สามารถดื่มแบบเพียว ๆ
                    หรือใช้เป็นเบสสำหรับเมนูกาแฟอื่น ๆ เช่น ลาเต้ คาปูชิโน่
                    และอเมริกาโน่
                  </p>
                </div>
              </article>
            </div>
          </section>

          {/* (5) Cold drip */}
          <section id="colddrip" className="scroll-mt-24" data-aos="fade-right">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              <figure className="lg:col-span-6">
                <div className="relative h-full w-full min-h-[320px] rounded-2xl overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.14)]">
                  <img src="/extraction/extraction6.jpg" alt="Cold drip" className="h-full w-full object-cover" />
                  <span className="absolute bottom-3 left-3 rounded-full bg-white/85 px-3 py-1 text-[11px] text-neutral-700">
                    Cold drip
                  </span>
                </div>
              </figure>
              <article className="lg:col-span-6">
                <div className="h-full bg-white rounded-2xl shadow p-6 flex flex-col">
                  <h2 className="text-xl md:text-2xl font-bold mb-4">ดริปเย็น (Cold drip)</h2>
                  <p className="text-gray-700 leading-relaxed">
                    ดริปเย็น (Cold Drip) เป็นวิธีการสกัดกาแฟแบบช้า
                    โดยใช้น้ำเย็นค่อยๆ หยดผ่านผงกาแฟบดหยาบเป็นเวลาหลายชั่วโมง (ปกติ
                    3-12 ชั่วโมง) เพื่อดึงรสชาติและความหวานตามธรรมชาติของกาแฟออกมา
                    โดยไม่ต้องใช้ความร้อน กาแฟที่ได้จะมีรสชาตินุ่มนวล กลมกล่อม
                    มีความเปรี้ยวต่ำ
                    และมักให้รสชาติที่ชัดเจนของโน๊ตผลไม้หรือช็อกโกแลต
                    นิยมดื่มแบบเย็นหรือใส่น้ำแข็งเพื่อเพิ่มความสดชื่น
                  </p>
                </div>
              </article>
            </div>
          </section>

          {/* (6) Aeropress */}
          <section id="aeropress" className="scroll-mt-24" data-aos="fade-left">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              <figure className="lg:col-span-6 order-2 lg:order-1">
                <div className="relative h-full w-full min-h-[320px] rounded-2xl overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.14)]">
                  <img src="/extraction/extraction7.jpg" alt="Aeropress" className="h-full w-full object-cover" />
                  <span className="absolute bottom-3 left-3 rounded-full bg-white/85 px-3 py-1 text-[11px] text-neutral-700">
                    Aeropress
                  </span>
                </div>
              </figure>
              <article className="lg:col-span-6 order-1 lg:order-2">
                <div className="h-full bg-white rounded-2xl shadow p-6 flex flex-col">
                  <h2 className="text-xl md:text-2xl font-bold mb-4">กาแฟแอโรเพรส (Aeropress)</h2>
                  <p className="text-gray-700 leading-relaxed">
                    กาแฟแอโรเพรส (Aeropress)
                    เป็นวิธีชงกาแฟที่ใช้แรงดันอากาศในการสกัด
                    โดยใส่ผงกาแฟบดและน้ำร้อนลงในกระบอก
                    จากนั้นใช้แรงกดดันลูกสูบเพื่อดันน้ำกาแฟผ่านตัวกรอง
                    กาแฟที่ได้มีรสชาติเข้มข้น นุ่มนวล และมีบอดี้ที่สมดุล
                    จุดเด่นของแอโรเพรสคือสามารถปรับเปลี่ยนสูตรการชงได้หลากหลาย
                    ทั้งความเข้มข้น เวลาแช่ และอุณหภูมิ
                    ทำให้เป็นที่นิยมในหมู่คอกาแฟที่ชื่นชอบการทดลองรสชาติใหม่ๆ
                  </p>
                </div>
              </article>
            </div>
          </section>

          {/* (7) Siphon */}
          <section id="siphon" className="scroll-mt-24" data-aos="fade-right">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              <figure className="lg:col-span-6">
                <div className="relative h-full w-full min-h-[320px] rounded-2xl overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.14)]">
                  <img src="/extraction/extraction6.jpg" alt="Siphon" className="h-full w-full object-cover" />
                  <span className="absolute bottom-3 left-3 rounded-full bg-white/85 px-3 py-1 text-[11px] text-neutral-700">
                    Siphon
                  </span>
                </div>
              </figure>
              <article className="lg:col-span-6">
                <div className="h-full bg-white rounded-2xl shadow p-6 flex flex-col">
                  <h2 className="text-xl md:text-2xl font-bold mb-4">กาแฟไซฟอน (Siphon)</h2>
                  <p className="text-gray-700 leading-relaxed">
                    กาแฟไซฟอน (Siphon)
                    เป็นวิธีการชงกาแฟแบบสูญญากาศที่ใช้หลักการแรงดันไอน้ำและสุญญากาศในการสกัดกาแฟ
                    ประกอบด้วยภาชนะสองส่วนคือ ส่วนล่างสำหรับใส่น้ำและให้ความร้อน
                    และส่วนบนสำหรับใส่ผงกาแฟบด เมื่อน้ำร้อนเกิดแรงดัน
                    ไอน้ำจะดันน้ำขึ้นไปผสมกับผงกาแฟด้านบน หลังจากนั้นเมื่อลดความร้อน
                    น้ำกาแฟจะถูกดูดกลับลงมาผ่านตัวกรอง กาแฟไซฟอนให้รสชาติที่สะอาด
                    ซับซ้อน และมีความหอมชัดเจน
                    นิยมใช้สำหรับการชงกาแฟพิเศษที่ต้องการดึงรสชาติออกมาอย่างละเอียดอ่อน
                  </p>
                </div>
              </article>
            </div>
          </section>

          {/* (8) Cold Brew */}
          <section id="coldbrew" className="scroll-mt-24" data-aos="fade-left">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              <figure className="lg:col-span-6 order-2 lg:order-1">
                <div className="relative h-full w-full min-h-[320px] rounded-2xl overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.14)]">
                  <img src="/extraction/extraction9.jpg" alt="Cold brew" className="h-full w-full object-cover" />
                  <span className="absolute bottom-3 left-3 rounded-full bg-white/85 px-3 py-1 text-[11px] text-neutral-700">
                    Cold brew
                  </span>
                </div>
              </figure>
              <article className="lg:col-span-6 order-1 lg:order-2">
                <div className="h-full bg-white rounded-2xl shadow p-6 flex flex-col">
                  <h2 className="text-xl md:text-2xl font-bold mb-4">กาแฟสกัดเย็น (Cold brew)</h2>
                  <p className="text-gray-700 leading-relaxed">
                    กาแฟสกัดเย็น (Cold Brew)
                    เป็นวิธีการชงกาแฟที่ใช้เวลาและอุณหภูมิต่ำ
                    โดยนำผงกาแฟบดแช่ในน้ำเย็นหรือน้ำที่อุณหภูมิห้องนาน 12-24 ชั่วโมง
                    จากนั้นกรองเอากากกาแฟออก กาแฟที่ได้จะมีรสชาติที่นุ่มนวล
                    หวานธรรมชาติ และมีความเป็นกรดต่ำกว่าการชงด้วยน้ำร้อน
                    สามารถดื่มได้ทั้งแบบเพียว ๆ หรือเติมนมและไซรัปเพื่อเพิ่มรสชาติ
                    นอกจากนี้ยังสามารถเก็บในตู้เย็นได้นานหลายวันโดยไม่เสียรสชาติ
                  </p>
                </div>
              </article>
            </div>
          </section>

          {/* (9) Nitro */}
          <section id="nitro" className="scroll-mt-24" data-aos="fade-right">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              <figure className="lg:col-span-6">
                <div className="relative h-full w-full min-h-[320px] rounded-2xl overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.14)]">
                  <img src="/extraction/extraction10.jpg" alt="Nitro Cold Brew" className="h-full w-full object-cover" />
                  <span className="absolute bottom-3 left-3 rounded-full bg-white/85 px-3 py-1 text-[11px] text-neutral-700">
                    Nitro Cold Brew
                  </span>
                </div>
              </figure>
              <article className="lg:col-span-6">
                <div className="h-full bg-white rounded-2xl shadow p-6 flex flex-col">
                  <h2 className="text-xl md:text-2xl font-bold mb-4">กาแฟไนโตร (Nitro Cold Brew)</h2>
                  <p className="text-gray-700 leading-relaxed">
                    กาแฟไนโตร (Nitro Cold Brew) เป็นกาแฟสกัดเย็น (Cold Brew)
                    ที่ผ่านการอัดก๊าซไนโตรเจนเพื่อเพิ่มเนื้อสัมผัสและความนุ่มนวล
                    กาแฟที่ได้จะมีฟองครีมนุ่มละเอียดคล้ายเบียร์สด รสชาตินุ่มนวล
                    หวานธรรมชาติ และมีความเป็นกรดต่ำ
                    มักเสิร์ฟแบบไม่ใส่น้ำแข็งในแก้วทรงสูงเพื่อให้เห็นเลเยอร์ของฟองครีมด้านบน
                    นิยมดื่มแบบเพียว ๆ เพื่อสัมผัสเนื้อสัมผัสที่เป็นเอกลักษณ์
                  </p>
                </div>
              </article>
            </div>
          </section>

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

      {/* ปุ่มสารบัญ (มือถือ) */}
      <button
        onClick={() => setTocOpen(true)}
        className="lg:hidden fixed right-4 bottom-4 z-30 rounded-full bg-[#2a1c14] text-white px-4 py-3 shadow"
        aria-label="สารบัญ"
      >
        สารบัญ
      </button>

      {/* Modal สารบัญ (มือถือ) */}
      {tocOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setTocOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 rounded-t-2xl bg-white shadow-xl p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-[#2a1c14]">สารบัญวิธีชง</div>
              <button
                className="text-sm text-[#2a1c14]/70 hover:text-[#2a1c14]"
                onClick={() => setTocOpen(false)}
              >
                ปิด
              </button>
            </div>
            <div className="mt-3 grid grid-cols-1 divide-y">
              {navItems.map((n) => (
                <button
                  key={n.id}
                  onClick={() => scrollToId(n.id)}
                  className={`w-full text-left py-3 ${
                    activeId === n.id ? "text-[#2a1c14] font-semibold" : "text-neutral-700"
                  }`}
                >
                  {n.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default Extraction;
