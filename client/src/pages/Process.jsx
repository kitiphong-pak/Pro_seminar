import { useEffect, useMemo, useState, useCallback } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BackToTop from "../components/BackToTop";
import { updateUserAchievement } from "../firebase/firebaseAchievements";
import AOS from "aos";
import "aos/dist/aos.css";
import { useAuth } from "../contexts/AuthContext";

function Process() {
  const [selectedIcon, setSelectedIcon] = useState("cherry");
  const { user } = useAuth();
  const uid = user?.uid ?? null;

  // ข้อมูลขั้นตอน (ของเดิม)
  const icons = [
    {
      id: 1,
      name: "cherry",
      image: "/process/process1.png",
      alt: "การเตรียมเมล็ดกาแฟ",
      img: "/process/process5.jpg",
      content:
        "การเก็บเมล็ดกาแฟเป็นขั้นตอนแรกที่สำคัญต่อคุณภาพของกาแฟในอนาคต โดยทั่วไปจะรอให้ผลกาแฟสุกเต็มที่จนเปลือกผลเปลี่ยนเป็นสีแดงสดหรือเหลือง (ขึ้นอยู่กับสายพันธุ์) ก่อนจะเก็บเกี่ยว ซึ่งสามารถทำได้สองวิธีหลัก ๆ ได้แก่ การเก็บด้วยมือ (Hand Picking) ที่เน้นการเก็บผลเชอร์รี่สุกทีละลูก เพื่อคัดเลือกเฉพาะผลที่มีคุณภาพสูง และ การเก็บด้วยเครื่องจักร (Mechanical Harvesting) ซึ่งเหมาะสำหรับฟาร์มขนาดใหญ่ที่ต้องการความรวดเร็ว อย่างไรก็ตาม วิธีการเก็บที่เหมาะสมจะขึ้นอยู่กับเป้าหมายด้านคุณภาพ รสชาติ และปริมาณของผลผลิต รวมถึงลักษณะภูมิประเทศของพื้นที่ปลูกอีกด้วย",
    },
    {
      id: 2,
      name: "roast",
      image: "/process/process2.png",
      alt: "การคั่วกาแฟ",
      img: "/process/process6.jpg",
      content:
        "เมล็ดกาแฟดิบที่ผ่านกระบวนการแปรรูปและอบแห้งจะถูกนำมาคั่วเพื่อดึงกลิ่นและรสชาติที่ซ่อนอยู่ในเมล็ดออกมา การคั่วเป็นกระบวนการที่ซับซ้อนและต้องการความแม่นยำ โดยเริ่มจากการให้ความร้อนแก่เมล็ดกาแฟในอุณหภูมิที่เหมาะสม ซึ่งส่วนใหญ่จะอยู่ระหว่าง 180-250 องศาเซลเซียส ความร้อนจะกระตุ้นการเปลี่ยนแปลงทางเคมี เช่น การเกิด Maillard Reaction ที่ทำให้เมล็ดกาแฟมีสีน้ำตาลและปลดปล่อยน้ำมันที่ช่วยสร้างกลิ่นหอมออกมา ระดับการคั่วที่แตกต่างกัน เช่น คั่วอ่อน (Light Roast) ที่ยังคงรสชาติเปรี้ยวและกลิ่นเฉพาะของเมล็ดไว้มากที่สุด คั่วกลาง (Medium Roast) ที่ให้สมดุลระหว่างรสเปรี้ยวและขม หรือ คั่วเข้ม (Dark Roast) ที่เน้นความเข้มและกลิ่นที่มีลักษณะไหม้เล็กน้อย ล้วนส่งผลต่อรสชาติของกาแฟเมื่อชง",
    },
    {
      id: 3,
      name: "process",
      image: "/process/process3.png",
      alt: "การบดกาแฟ",
      img: "/process/process7.jpg",
      content:
        "การบดกาแฟเป็นขั้นตอนที่ต้องการความละเอียดและความแม่นยำ เพราะระดับความละเอียดของผงกาแฟส่งผลโดยตรงต่อการสกัดรสชาติในกระบวนการชง การบดสามารถแบ่งออกได้หลายระดับ เช่น บดหยาบ (Coarse Grind) ที่เหมาะสำหรับการชงแบบ French Press หรือ Cold Brew บดปานกลาง (Medium Grind) ที่นิยมใช้สำหรับการดริปหรือเครื่องชงไฟฟ้า และ บดละเอียด (Fine Grind) ที่ใช้กับการชง Espresso ซึ่งต้องการแรงดันสูงในการสกัดกาแฟ นอกจากนี้ การเลือกใช้เครื่องบดคุณภาพสูง เช่น เครื่องบดแบบ Burr Grinder จะช่วยให้ได้ขนาดของผงกาแฟที่สม่ำเสมอ และส่งผลให้รสชาติของกาแฟในถ้วยสมดุลมากยิ่งขึ้น",
    },
    {
      id: 4,
      name: "brew",
      image: "/process/process4.png",
      alt: "การสกัดกาแฟ",
      img: "/process/process8.jpg",
      content:
        "ขั้นตอนสุดท้ายคือการสกัดกาแฟ ซึ่งมีวิธีการหลากหลายตามวัฒนธรรมและความนิยม เช่น การสกัดกาแฟแบบ Espresso ที่ใช้แรงดันสูงและอุณหภูมิน้ำที่เหมาะสมในการสกัดกาแฟภายในเวลาอันสั้น การดริป (Pour Over) ที่เน้นความพิถีพิถันในการรินน้ำร้อนผ่านผงกาแฟในรูปแบบวงกลม เพื่อควบคุมการสกัดให้ได้รสชาติที่ละเอียดอ่อน การสกัดกาแฟแบบ French Press ที่ใช้น้ำร้อนแช่ผงกาแฟในระยะเวลาหนึ่งก่อนกดกรอง การสกัดกาแฟ Cold Brew ที่ใช้น้ำเย็นแช่กาแฟในระยะเวลานานเพื่อดึงรสชาติที่นุ่มนวลและหวานเป็นธรรมชาติ และวิธีการอื่น ๆ อีกมากมาย โดยการเลือกวิธีการชงที่เหมาะสมกับระดับการบดกาแฟและชนิดของเมล็ด จะช่วยให้ได้รสชาติกาแฟที่ตรงใจผู้ดื่มมากที่สุด",
    },
  ];

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
        updateUserAchievement(uid, "content", "process_coffee", true);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [uid]);

  // ดัชนีขั้นตอนปัจจุบัน + ฟังก์ชันนำทาง
  const currentIndex = useMemo(
    () => Math.max(0, icons.findIndex((i) => i.name === selectedIcon)),
    [selectedIcon]
  );

  const goStep = useCallback(
    (dir) => {
      const next = (currentIndex + dir + icons.length) % icons.length;
      setSelectedIcon(icons[next].name);
      // เลื่อนขึ้นให้เห็นการ์ดชัด (โดยเว้นเผื่อ navbar)
      window.scrollTo({ top: 200, behavior: "smooth" });
    },
    [currentIndex, icons]
  );

  // รองรับคีย์บอร์ด ← →
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight") goStep(1);
      if (e.key === "ArrowLeft") goStep(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goStep]);

  const active = icons[currentIndex];

  return (
    <div className="bg-[#f3f1ec]">
      <Navbar />
      <BackToTop />

      {/* HERO */}
      <header className="relative isolate overflow-hidden" data-aos="fade-up">
        <img
          src={active.img}
          alt=""
          className="absolute inset-0 h-[34vh] w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/35 to-black/0" />
        <div className="relative mx-auto max-w-7xl px-4 md:px-8 h-[34vh] flex items-center">
          <div className="text-white">
            <p className="uppercase tracking-widest text-xs text-white/80">
              Coffee • Process
            </p>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">
              กระบวนการกาแฟ
            </h1>
            <p className="mt-1 text-white/90">
              ไล่ดูทีละขั้น — ตั้งแต่เก็บผลเชอร์รี่ คั่ว บด จนถึงการสกัด
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 md:px-8 py-8">
        {/* STEP INDICATOR */}
        <section className="relative mb-8" data-aos="fade-up">
          {/* เส้นเชื่อม */}
          <div className="absolute left-1/2 top-[30px] -translate-x-1/2 h-1 w-full max-w-3xl bg-black/10 rounded-full" />
          {/* จุด (ปุ่ม) */}
          <ul className="relative z-10 mx-auto flex w-full max-w-3xl items-center justify-between gap-3">
            {icons.map((icon, idx) => {
              const isActive = icon.name === selectedIcon;
              return (
                <li key={icon.id} className="flex flex-col items-center">
                  <button
                    onClick={() => setSelectedIcon(icon.name)}
                    className={`grid place-items-center size-14 rounded-full border-2 transition
                      ${
                        isActive
                          ? "bg-white border-[#6f4e37] ring-4 ring-[#6f4e37]/25"
                          : "bg-white/90 border-black/10 hover:border-[#6f4e37]/40"
                      }`}
                    aria-current={isActive ? "step" : undefined}
                    aria-label={icon.alt}
                    title={icon.alt}
                  >
                    <img
                      src={icon.image}
                      alt=""
                      className="h-8 w-8 object-contain"
                    />
                  </button>
                  <span
                    className={`mt-2 text-[11px] md:text-xs text-center ${
                      isActive ? "text-[#6f4e37] font-semibold" : "text-black/60"
                    }`}
                  >
                    {icon.alt}
                  </span>
                </li>
              );
            })}
          </ul>

          {/* ป้ายสถานะขวาบน */}
          <div className="mt-4 text-center text-xs text-black/60">
            ขั้นตอน {currentIndex + 1} / {icons.length}
          </div>
        </section>

        {/* ปุ่มนำทาง */}
        <div className="mb-6 flex items-center justify-center gap-3" data-aos="fade-up">
          <button
            onClick={() => goStep(-1)}
            className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm hover:bg-white/80"
          >
            ขั้นหน้า
          </button>
          <button
            onClick={() => goStep(1)}
            className="rounded-full bg-[#6f4e37] text-white px-4 py-2 text-sm hover:opacity-90 shadow"
          >
            ไปขั้นถัดไป
          </button>
        </div>

        {/* การ์ดเนื้อหา (รูปซ้าย • ข้อความขวา ตลอด) */}
        <section
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch"
          data-aos="fade-up"
        >
          {/* รูป (ซ้าย) */}
          <figure className="lg:col-span-6">
            <div className="relative h-full w-full min-h-[300px] rounded-2xl overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.14)]">
              <img
                src={active.img}
                alt={active.alt}
                className="h-full w-full object-cover"
              />
              <span className="absolute bottom-3 left-3 rounded-full bg-white/85 px-3 py-1 text-[11px] text-neutral-700">
                {active.alt}
              </span>
            </div>
          </figure>

          {/* ข้อความ (ขวา) */}
          <article className="lg:col-span-6">
            <div className="h-full bg-white rounded-2xl shadow p-6 flex flex-col">
              <h2 className="text-xl md:text-2xl font-bold text-[#2a1c14]">
                {active.alt}
              </h2>
              <p className="mt-3 leading-relaxed text-neutral-700">
                {active.content}
              </p>
            </div>
          </article>
        </section>
      </div>

      <Footer />
    </div>
  );
}

export default Process;
