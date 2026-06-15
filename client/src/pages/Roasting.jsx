import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { updateUserAchievement } from "../firebase/firebaseAchievements";
import { useAuth } from "../contexts/AuthContext";

const CoffeeInfo = () => {
  const [selectedRoast, setSelectedRoast] = useState("คั่วอ่อน (Light Roast)");
  const { user } = useAuth();
  const uid = user?.uid ?? null;

  const coffeeData = {
    "คั่วอ่อน (Light Roast)": {
      alias: "Cinnamon Roast, New England Roast",
      color: "เมล็ดกาแฟสีอ่อน มักมีสีระหว่างน้ำตาลอ่อนถึงสีน้ำตาลกลาง",
      taste: [
        "รสชาติที่สดชื่นและเปรี้ยว มักจะมีโน้ตของผลไม้ เช่น เบอร์รี่และกลิ่นดอกไม้",
        "ความหวานที่น้อยกว่าระดับการคั่วที่สูงขึ้น",
        "สามารถสะท้อนลักษณะความเป็นธรรมชาติของกาแฟได้ดี",
      ],
      characteristics: [
        "ไม่มีน้ำมันบนผิวเมล็ด",
        "เมล็ดกาแฟจะไม่เกิดการแตก (first crack)",
        "เหมาะสำหรับกาแฟพิเศษ (Specialty Coffee)",
        "เหมาะสำหรับการชงแบบ Pour Over หรือ Aeropress",
      ],
      img: "/roasting/roasting1.png",
    },
    "คั่วกลาง (Medium Roast)": {
      alias: "City Roast, Breakfast Roast",
      color: "เมล็ดกาแฟมีสีน้ำตาลกลาง",
      taste: [
        "รสชาติสมดุลระหว่างความเปรี้ยว ความหวาน และความขม",
        "มักมีโน้ตของช็อกโกแลตและถั่ว",
        "ยังคงมีความสดชื่นในระดับหนึ่ง แต่รสชาติความคั่วจะเด่นขึ้น",
      ],
      characteristics: [
        "มีน้ำมันเล็กน้อยบนผิวเมล็ด",
        "เหมาะสำหรับการชงด้วยวิธีหลากหลาย เช่น Drip, French Press หรือ Espresso",
        "เหมาะสำหรับการดื่มในแบบที่ไม่มีส่วนผสม เช่น กาแฟดำ",
        "เป็นที่นิยมในหมู่นักดื่มกาแฟที่ชอบรสชาติกาแฟแบบสมดุล",
      ],
      img: "/roasting/roasting2.JPG",
    },
    "คั่วเข้ม (Dark Roast)": {
      alias: "Full City Roast, Vienna Roast",
      color: "เมล็ดกาแฟมีสีน้ำตาลเข้มถึงดำ",
      taste: [
        "รสชาติขมเข้มข้นและมีความคั่วเด่นชัด",
        "โน้ตของคาราเมลและช็อกโกแลตเข้ม",
        "ความเปรี้ยวลดลงแทบหมดไป แต่ความหวานจากการคั่วจะเด่นขึ้น",
      ],
      characteristics: [
        "ผิวเมล็ดมันเนื่องจากมีน้ำมันออกมา",
        "เหมาะสำหรับการชงกาแฟเอสเพรสโซ และกาแฟที่มีส่วนผสม เช่น ลาเต้หรือคาปูชิโน่",
        "ให้รสชาติหนักแน่น เหมาะสำหรับผู้ที่ชอบกาแฟเข้มข้น",
        "บางครั้งจะมีกลิ่นหอมคล้ายควันหรือถ่านเล็กน้อย",
      ],
      img: "/roasting/roasting3.PNG",
    },
    "คั่วเข้มมาก (Very Dark Roast)": {
      alias: "French Roast, Italian Roast",
      color: "เมล็ดกาแฟมีสีน้ำตาลเข้มถึงดำสนิท",
      taste: [
        "รสชาติขมเข้มข้นมาก เน้นรสคั่วอย่างชัดเจน",
        "โน้ตของคาราเมลไหม้และความเผ็ดร้อนเล็กน้อยจากการคั่วนาน",
        "ไม่มีรสชาติผลไม้หรือความเปรี้ยวหลงเหลืออยู่",
      ],
      characteristics: [
        "ผิวเมล็ดมันมากเนื่องจากมีน้ำมันออกมาเยอะ",
        "เหมาะสำหรับการชงกาแฟเอสเพรสโซแบบเข้มข้น หรือกาแฟแบบอเมริกาโน่",
        "รสชาติของเมล็ดกาแฟดั้งเดิมจะถูกกลบด้วยรสคั่วที่โดดเด่น",
        "บางครั้งอาจมีกลิ่นหอมควันไฟที่ชัดเจน",
      ],
      img: "/roasting/roasting4.PNG",
    },
  };

  const data = coffeeData[selectedRoast];

  // แผนภาพ Roast Meter (ตำแหน่งตัวชี้ 0 → 100)
  const meterValue = useMemo(() => {
    if (selectedRoast.includes("อ่อน")) return 15;
    if (selectedRoast.includes("กลาง")) return 45;
    if (selectedRoast.includes("เข้มมาก")) return 88;
    return 68; // เข้ม
  }, [selectedRoast]);

  // วิธีชงที่เหมาะ
  const recommendBrews = useMemo(() => {
    if (selectedRoast.includes("อ่อน")) return ["Pour Over", "Aeropress", "Chemex"];
    if (selectedRoast.includes("กลาง")) return ["Drip", "French Press", "Espresso"];
    if (selectedRoast.includes("เข้มมาก")) return ["Espresso Ristretto", "Americano", "Mocha"];
    return ["Espresso", "Latte", "Cappuccino"];
  }, [selectedRoast]);

  // บันทึก Achievement เมื่อเลื่อนเกือบสุด
  useEffect(() => {
    if (!uid) return;
    const onScroll = () => {
      const docH = document.documentElement.scrollHeight;
      const winH = window.innerHeight;
      if (window.scrollY + winH >= docH - 100) {
        updateUserAchievement(uid, "content", "roasting_coffee", true);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [uid]);

  return (
    <div className="bg-[#f3f1ec] min-h-screen">
      <Navbar />

      {/* HERO */}
      <header className="relative isolate overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#6f4e37] via-[#8b5e3c] to-[#d9c4aa]" />
        <div className="relative mx-auto max-w-6xl px-4 md:px-8 py-10 text-center text-white">
          <h1 className="text-2xl md:text-4xl font-extrabold">ระดับการคั่วกาแฟ</h1>
          <p className="mt-2 opacity-90">รู้จักบุคลิกของกาแฟแต่ละระดับ—ตั้งแต่สดชื่นผลไม้ จนถึงเข้มควันไฟ</p>
        </div>
      </header>

      {/* Tabs ระดับคั่ว */}
      <div className="sticky top-0 z-10 bg-[#f3f1ec]/90 backdrop-blur border-b border-brown/10">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-3 flex gap-2 flex-wrap justify-center">
          {Object.keys(coffeeData).map((label) => {
            const active = selectedRoast === label;
            return (
              <button
                key={label}
                onClick={() => window.requestAnimationFrame(() => setSelectedRoast(label))}
                className={[
                  "px-4 py-2 rounded-full text-sm font-medium border transition shadow-sm",
                  active
                    ? "bg-[#8b4513] text-white border-[#8b4513]"
                    : "bg-white text-[#2a1c14] border-[#2a1c14]/20 hover:bg-white/90",
                ].join(" ")}
                aria-pressed={active}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 md:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* รูป */}
          <figure className="lg:col-span-5 self-stretch">
            <div className="relative h-full w-full min-h-[300px] rounded-2xl overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.14)]">
              <img
                src={data.img}
                alt={`${selectedRoast} Coffee Beans`}
                className="h-full w-full object-cover"
              />
              <span className="absolute bottom-3 left-3 rounded-full bg-white/85 px-3 py-1 text-[11px] text-neutral-700 backdrop-blur">
                ภาพตัวอย่างเมล็ด
              </span>
            </div>
          </figure>

          {/* การ์ดรายละเอียด */}
          <section className="lg:col-span-7 self-stretch">
            <div className="h-full bg-white rounded-2xl shadow p-6 flex flex-col">
              <h2 className="text-2xl md:text-3xl font-bold text-center text-[#5c4033]">
                {selectedRoast}
              </h2>

              {/* Roast Meter */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-[#2a1c14]/70">
                  <span>Light</span>
                  <span>Dark</span>
                </div>
                <div className="relative mt-1 h-2 w-full rounded-full bg-gradient-to-r from-[#d7ccc8] via-[#8d6e63] to-[#4e342e]">
                  <span
                    className="absolute -top-1.5 h-5 w-5 rounded-full bg-white shadow ring-2 ring-[#2a1c14]/20 transition-[left] duration-300"
                    style={{ left: `calc(${meterValue}% - 10px)` }}
                    aria-hidden="true"
                  />
                </div>
              </div>

              {/* Alias / สี */}
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-full bg-[#f7efe6] text-[#7b4b29] text-xs px-3 py-1">
                  ชื่อเรียกอื่น: {data.alias}
                </span>
                <span className="rounded-full bg-[#efe7da] text-[#7b4b29] text-xs px-3 py-1">
                  สี: {data.color}
                </span>
              </div>

              {/* รสชาติ */}
              <div className="mt-6">
                <p className="font-semibold text-[#2a1c14] mb-2">รสชาติ</p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 list-disc list-inside text-[#2a1c14]/90">
                  {data.taste.map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
              </div>

              {/* ลักษณะ */}
              <div className="mt-6">
                <p className="font-semibold text-[#2a1c14] mb-2">ลักษณะ</p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 list-disc list-inside text-[#2a1c14]/90">
                  {data.characteristics.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>

              {/* วิธีชงที่เหมาะ */}
              <div className="mt-6">
                <p className="font-semibold text-[#2a1c14] mb-2">วิธีชงที่แนะนำ</p>
                <div className="flex flex-wrap gap-2">
                  {recommendBrews.map((b) => (
                    <span
                      key={b}
                      className="rounded-full border border-[#2a1c14]/20 px-3 py-1 text-sm text-[#2a1c14] bg-white"
                    >
                      {b}
                    </span>
                  ))}
                </div>
              </div>

              {/* ทิปเล็ก ๆ */}
              <div className="mt-6 rounded-xl bg-[#fff7ec] text-[#7b4b29] p-4 text-sm">
                เคล็ดลับ: เลือกระดับคั่วให้เข้ากับวิธีชง—คั่วอ่อนเหมาะกับการดริปที่เน้นกลิ่นผลไม้
                ส่วนคั่วเข้มเหมาะกับเอสเพรสโซหรือเมนูนมที่ต้องการบอดี้ชัด ๆ
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CoffeeInfo;
