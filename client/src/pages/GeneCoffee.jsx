import { useEffect, useRef, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { updateUserAchievement } from "../firebase/firebaseAchievements";
import { useAuth } from "../contexts/AuthContext";

const CoffeeVariety = () => {
  const [selectedVariety, setSelectedVariety] = useState("Arabica");
  const [selectedSubVariety, setSelectedSubVariety] = useState("");
  const detailRef = useRef(null);
  const { user } = useAuth();
  const uid = user?.uid ?? null;

  // ข้อมูลสายพันธุ์
  const coffeeData = {
    Arabica: {
      title: "Arabica",
      description:
        "อาราบิก้าเป็นสายพันธุ์กาแฟที่มีความสำคัญมากที่สุดในอุตสาหกรรมกาแฟ โดยประมาณ 60-70% ของกาแฟที่ผลิตและบริโภคทั่วโลกมาจากสายพันธุ์อาราบิก้านี้ เป็นพันธุ์ที่ปลูกในประเทศที่มีอากาศเย็น โดยเฉพาะในพื้นที่สูง มักปลูกที่ความสูง 1,000-2,000 เมตรเหนือระดับน้ำทะเล มีรสชาติที่นุ่มนวลและกลมกล่อม มีกลิ่นหอมที่โดดเด่น และมีกรดที่ดี ทำให้มีรสชาติที่ซับซ้อนและละเอียดอ่อน เหมาะสำหรับการทำกาแฟพิเศษ (Specialty Coffee) นอกจากนี้ยังเป็นกาแฟที่มีคาเฟอีนต่ำกว่า Robusta จึงเหมาะสำหรับผู้ที่ต้องการดื่มกาแฟที่ไม่เข้มจนเกินไป พื้นที่ปลูกหลักๆ ได้แก่ เอธิโอเปีย บราซิล โคลอมเบีย และหลายประเทศในเอเชียตะวันออกเฉียงใต้ เช่น เวียดนาม และอินโดนีเซีย",
      subVarieties: [
        { name: "Typica", description: "Typica เป็นสายพันธุ์ดั้งเดิมของอาราบิก้า ให้รสชาตินุ่มนวล หอม และมีความซับซ้อน มักพบในพื้นที่ปลูกกาแฟเก่าแก่ เช่น เอธิโอเปีย และลาตินอเมริกา แม้ว่าจะให้ผลผลิตต่ำ แต่คุณภาพของกาแฟที่ได้ถือว่ายอดเยี่ยม" },
        { name: "Bourbon", description: "Bourbon เป็นสายพันธุ์ที่พัฒนามาจาก Typica ให้รสชาติหวาน กลิ่นหอมซับซ้อน และมีบอดี้ปานกลาง นิยมปลูกในประเทศแถบละตินอเมริกา เช่น บราซิล เอลซัลวาดอร์ และกัวเตมาลา" },
        { name: "Caturra", description: "Caturra เป็นสายพันธุ์กลายพันธุ์จาก Bourbon ที่ค้นพบในบราซิล มีจุดเด่นที่ให้ผลผลิตสูง ทนทานต่อสภาพอากาศ และมีรสชาติที่ซับซ้อน มักปลูกในพื้นที่สูงของอเมริกาใต้" },
        { name: "Geisha", description: "Geisha เป็นหนึ่งในสายพันธุ์อาราบิก้าที่มีชื่อเสียงมากที่สุด มีกลิ่นหอมเฉพาะตัวคล้ายมะลิและผลไม้ ให้รสชาติที่มีความเปรี้ยวและหวาน มีความซับซ้อนสูง นิยมปลูกในปานามา เอธิโอเปีย และประเทศอื่นๆ ที่มีพื้นที่สูง" },
      ],
      image: "/gene/gene1.jpg",
    },
    Robusta: {
      title: "Robusta",
      description:
        "โรบัสต้าเป็นสายพันธุ์กาแฟที่ปลูกในเขตร้อนชื้น มีคาเฟอีนสูงกว่าสายพันธุ์อาราบิก้า โดยมีคาเฟอีนประมาณ 2-2.7% เมื่อเทียบกับอาราบิก้าที่มีคาเฟอีนเพียง 1-1.5% รสชาติของโรบัสต้าจะมีความขมเข้มข้น กลิ่นดิน และมีบอดี้หนัก นิยมใช้ในการผลิตกาแฟสำเร็จรูปและกาแฟเอสเปรสโซ เพราะให้ความเข้มข้นที่โดดเด่นและครีม่า (Crema) ที่หนา พื้นที่ปลูกหลักๆ ได้แก่ เวียดนาม บราซิล และประเทศในแอฟริกา เช่น ยูกันดา",
      subVarieties: [
        { name: "Robusta 11", description: "Robusta 11 เป็นสายพันธุ์ที่มีความทนทานต่อโรคสูง ให้รสชาติขมเข้ม นิยมใช้ในกาแฟสำเร็จรูปและกาแฟผสมที่ต้องการเพิ่มความเข้มข้น" },
        { name: "Conillon", description: "Conillon เป็นสายพันธุ์โรบัสต้าที่ปลูกมากในบราซิล มีรสชาติเข้ม กลิ่นดินเล็กน้อย และมีความทนทานต่อสภาพอากาศร้อน เหมาะสำหรับการผลิตกาแฟปริมาณมาก" },
        { name: "SL28", description: "SL28 เป็นพันธุ์ที่พัฒนาขึ้นในเคนยา แม้จะเป็นพันธุ์หลักของอาราบิก้า แต่ในบางพื้นที่มีการปลูกโรบัสต้าที่มีลักษณะคล้าย SL28 เพื่อให้ได้กาแฟที่มีรสชาติซับซ้อนและทนทานต่อโรค" },
      ],
      image: "/gene/gene2.jpg",
    },
    Liberica: {
      title: "Liberica",
      description:
        "ลิเบอริก้าเป็นสายพันธุ์กาแฟที่มีลักษณะเฉพาะ เมล็ดมีขนาดใหญ่และรูปทรงยาว ปลูกในพื้นที่เขตร้อน มีกลิ่นหอมที่เป็นเอกลักษณ์ รสชาติออกควัน มีความฝาดเล็กน้อย และความเปรี้ยวต่ำ เนื่องจากให้ผลผลิตต่ำและเติบโตได้ยาก จึงไม่ค่อยแพร่หลาย พบการปลูกมากในฟิลิปปินส์ มาเลเซีย และอินโดนีเซีย",
      subVarieties: [
        { name: "Excelsa", description: "Excelsa เป็นสายพันธุ์ย่อยของ Liberica ที่มีกลิ่นหอมเฉพาะตัว รสชาติเปรี้ยวหวาน นิยมใช้ในการผสมกาแฟเพื่อเพิ่มความซับซ้อนของรสชาติ" },
        { name: "Liberica 24", description: "Liberica 24 เป็นสายพันธุ์ที่ให้กลิ่นหอมยาวนาน รสชาติออกควันและฝาดเล็กน้อย นิยมปลูกในฟิลิปปินส์และมาเลเซีย" },
      ],
      image: "/gene/gene3.jpg",
    },
    Excelsa: {
      title: "Excelsa",
      description:
        "เอ็กเซลซ่าเป็นสายพันธุ์กาแฟที่ปลูกในเอเชียตะวันออกเฉียงใต้และบางส่วนของแอฟริกา มีลักษณะเด่นคือกลิ่นหอมคล้ายผลไม้และดอกไม้ รสชาติซับซ้อน มีความเปรี้ยวและหวานผสมกัน มักถูกนำมาใช้ในการผสมกาแฟเพื่อเพิ่มมิติของรสชาติ พบการปลูกมากในเวียดนามและฟิลิปปินส์",
      subVarieties: [
        { name: "SL34", description: "SL34 เป็นสายพันธุ์ที่ทนทานต่อสภาพแวดล้อม ให้รสชาติหอมหวาน ซับซ้อน มักปลูกในพื้นที่สูงของเคนยา" },
        { name: "SL28", description: "SL28 ให้รสชาติเปรี้ยวหวาน กลิ่นหอมคล้ายผลไม้ ปลูกได้ในพื้นที่ที่มีความแห้งแล้ง นิยมปลูกในแอฟริกา" },
      ],
      image: "/gene/gene4.jpg",
    },
  };

  // เลือกสายพันธุ์ย่อย + เลื่อนมาแผงรายละเอียด
  const handleSubVarietyClick = (subVariety) => {
    setSelectedSubVariety(subVariety);
    setTimeout(() => {
      detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  // บันทึก Achievement เมื่ออ่านเกือบจบ
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

  const current = coffeeData[selectedVariety];
  const selectedDetail = current.subVarieties.find((s) => s.name === selectedSubVariety);

  return (
    <div className="bg-[#fcfaf7] text-gray-800 font-sans">
      <Navbar />

      {/* HERO */}
      <header className="relative isolate overflow-hidden">
        <img
          src={current.image}
          alt=""
          className="absolute inset-0 h-[40vh] w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/30 to-black/0" />
        <div className="relative mx-auto max-w-7xl px-4 md:px-8 h-[40vh] flex items-center">
          <div className="text-white">
            <p className="uppercase tracking-[0.18em] text-xs opacity-80">Coffee Genetics</p>
            <h1 className="mt-1 text-3xl md:text-5xl font-extrabold">สายพันธุ์กาแฟ</h1>
            <p className="mt-2 text-white/90">สำรวจลักษณะเด่น และสายพันธุ์ย่อยของกาแฟหลัก 4 ตระกูล</p>
          </div>
        </div>
      </header>

      {/* Tabs สายพันธุ์ */}
      <div className="sticky top-0 z-20 bg-gradient-to-b from-white to-transparent pt-4 pb-2">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="flex flex-wrap gap-2 justify-center md:justify-start">
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
                    "px-4 py-2 rounded-full text-sm font-medium border transition shadow-sm",
                    active
                      ? "bg-[#2a1c14] text-white border-[#2a1c14]"
                      : "bg-white text-[#2a1c14] border-[#2a1c14]/20 hover:bg-white/90",
                  ].join(" ")}
                >
                  {variety}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* เนื้อหาแต่ละสายพันธุ์ */}
      <div className="mx-auto max-w-7xl px-4 md:px-8 pb-12">
        {/* รูปใหญ่ + บทนำ */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <figure className="lg:col-span-5 self-stretch">
            <div className="relative h-full w-full rounded-xl overflow-hidden shadow-lg">
              <img
                src={current.image}
                alt={`${current.title} Coffee Beans`}
                className="h-full w-full object-cover"
              />
            </div>
          </figure>

          <article className="lg:col-span-7">
            <div className="h-full bg-white rounded-xl shadow p-6">
              <h2 className="text-2xl md:text-3xl font-bold text-[#7b4b29] text-center">
                {current.title}
              </h2>
              <p className="mt-4 text-gray-700 leading-7 text-justify indent-8">
                {current.description}
              </p>

              {/* chips แนะนำ quick tags */}
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-full bg-[#f7efe6] text-[#7b4b29] text-xs px-3 py-1">ลักษณะเด่น</span>
                <span className="rounded-full bg-[#f0eadc] text-[#7b4b29] text-xs px-3 py-1">พื้นที่ปลูก</span>
                <span className="rounded-full bg-[#eee6d9] text-[#7b4b29] text-xs px-3 py-1">ระดับคาเฟอีน</span>
              </div>
            </div>
          </article>
        </div>

        {/* สายพันธุ์ย่อย */}
        <h3 className="mt-10 text-xl md:text-2xl font-bold text-center text-[#7b4b29]">
          สายพันธุ์ย่อยของ {current.title}
        </h3>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {current.subVarieties.map((sub) => {
            const active = selectedSubVariety === sub.name;
            return (
              <button
                key={sub.name}
                onClick={() => handleSubVarietyClick(sub.name)}
                className={[
                  "group text-left bg-white rounded-xl border p-5 shadow-sm hover:shadow-md transition focus:outline-none",
                  active ? "border-[#7b4b29] ring-2 ring-[#7b4b29]/20" : "border-gray-200",
                ].join(" ")}
                aria-expanded={active}
              >
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-[#f6f0e7] grid place-items-center text-[#7b4b29] font-semibold">
                    {sub.name[0]}
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-[#7b4b29]">{sub.name}</h4>
                    <p className="mt-1 text-sm text-gray-700 line-clamp-3">
                      {sub.description}
                    </p>
                    <span className="mt-2 inline-block text-xs text-[#2a1c14] opacity-70 group-hover:opacity-100">
                      อ่านรายละเอียด
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
            <div className="rounded-xl bg-white p-6 shadow border border-[#7b4b29]/15">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="uppercase tracking-widest text-[11px] text-[#7b4b29]/70">
                    Sub-variety
                  </p>
                  <h4 className="text-2xl font-bold text-[#2a1c14]">{selectedDetail.name}</h4>
                </div>
                <button
                  onClick={() => setSelectedSubVariety("")}
                  className="rounded-full border border-[#2a1c14]/20 px-3 py-1 text-sm text-[#2a1c14] hover:bg-[#f7efe6] transition"
                >
                  ปิด
                </button>
              </div>
              <p className="mt-3 text-gray-700 leading-7">{selectedDetail.description}</p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CoffeeVariety;
