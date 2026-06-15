import { useEffect, useState, useCallback } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { updateUserAchievement } from "../firebase/firebaseAchievements";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useAuth } from "../contexts/AuthContext";

function History() {
  const [progress, setProgress] = useState(0);
  const { user } = useAuth();
  const uid = user?.uid ?? null;

  // smooth scroll ไปหัวข้อย่อย
  const scrollToId = useCallback((id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  // เก็บ Achievement ตอนอ่านจบ
  useEffect(() => {
    if (!uid) return;
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const contentHeight = document.documentElement.scrollHeight;
      const viewportHeight = window.innerHeight;
      if (scrollY + viewportHeight >= contentHeight - 100) {
        updateUserAchievement(uid, "content", "history_coffee");
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [uid]);

  // AOS + Reading progress
  useEffect(() => {
    AOS.init({ duration: 900, once: true, offset: 100, easing: "ease-out" });
    const refreshT = setTimeout(() => AOS.refresh(), 300);

    const onScroll = () => {
      const doc = document.documentElement;
      const total = doc.scrollHeight - window.innerHeight;
      const p = total > 0 ? (window.scrollY / total) * 100 : 0;
      setProgress(Math.max(0, Math.min(100, p)));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      clearTimeout(refreshT);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#f3f1ec] flex flex-col">
      {/* Reading progress bar */}
      <div className="fixed top-0 left-0 right-0 z-40 h-1 bg-transparent">
        <div
          className="h-full bg-[#7b4b29] origin-left transition-[width] duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>

      <Navbar />

      {/* HERO + สารบัญ */}
      <header className="relative isolate bg-[#e8dfd6] pt-4">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-16 -right-10 h-40 w-40 rounded-full bg-[#7b4b29]/10 blur-2xl" />
          <div className="absolute -bottom-16 -left-10 h-44 w-44 rounded-full bg-[#5c4033]/10 blur-2xl" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 md:px-8 py-8 text-center">
          <h1 className="text-3xl lg:text-4xl font-bold text-[#5c4033]" data-aos="fade-down">
            ประวัติศาสตร์ของกาแฟ
          </h1>
          <p className="mt-3 text-[#2a1c14]/80" data-aos="fade-down" data-aos-delay="100">
            จากตำนานแพะของ Kaldi สู่ร้านกาแฟยุโรป—และวัฒนธรรมกาแฟทั่วโลก
          </p>

          {/* สารบัญย่อ */}
          <div className="mt-6 flex flex-wrap justify-center gap-2" data-aos="zoom-in">
            {[
              { id: "origins", label: "กำเนิดที่เอธิโอเปีย" },
              { id: "arab", label: "คาบสมุทรอาหรับ" },
              { id: "firstcafe", label: "ร้านกาแฟแรกของโลก" },
              { id: "europe", label: "สู่ยุโรป" },
              { id: "modern", label: "กาแฟยุคปัจจุบัน" },
              { id: "continents", label: "แหล่งกำเนิดตามทวีป" },
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => scrollToId(s.id)}
                className="rounded-full border border-[#2a1c14]/20 bg-white px-3 py-1 text-xs md:text-sm text-[#2a1c14] hover:bg-white/90 transition"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* รูปนำ */}
        <img
          src="/history/history1.jpg"
          className="w-full h-80 md:h-96 object-cover"
          alt="Coffee History 1"
          data-aos="zoom-in"
        />

        {/* SECTION 1 • เอธิโอเปีย */}
        <section id="origins" className="mx-auto max-w-6xl px-4 md:px-8 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* ข้อความ (คงเนื้อหาเดิมทั้งหมด) */}
            <div className="lg:col-span-7 order-2 lg:order-1" data-aos="fade-right">
              <p className="md:w-[90%] mx-auto px-5 py-4 rounded-lg  leading-relaxed first-letter:text-4xl first-letter:font-extrabold first-letter:text-[#7b4b29] first-letter:mr-1 first-letter:float-left">
                <b className="text-lg text-[#7b4b29]">
                  ตำนานต้นกำเนิดกาแฟเริ่มต้นที่ประเทศเอธิโอเปีย
                </b>
                <br />
                <br />
                <p className="indent-8">
                  เอธิโอเปียถือกันว่าเป็นศูนย์กลางของแหล่งกำเนิดกาแฟคุณอาจจะเคยพบเรื่องราวอันโด่งดังเกี่ยวกับการค้นพบ
                  กาแฟในเอธิโอเปียโดย Kaldi ผู้เลี้ยงแพะชาวเอธิโอเปียเมื่อราวปี ค.ศ. 800
                  เขาเดินไปหาแพะของเขาและ พบว่าพวกมันมีพฤติกรรมแปลกๆ
                  พวกมันรู้สึกกระปรี้กระเปร่าและตื่นเต้นหลังจากกินผลเบอร์รี่จากต้นไม้
                  ดังนั้นเขาจึงลองชิมผลเบอร์รี่เหล่านั้นด้วยตัวเอง
                  และหลังจากที่เขารู้สึกตื่นเต้นและตื่นตัวเช่นกัน
                  คัลดีก็เอาผลเบอร์รี่เหล่านี้ไปให้พระภิกษุ
                  พระภิกษุอุทานว่าเป็นฝีมือของปีศาจและโยนผลเบอร์รี่เหล่า นั้นลงในกองไฟ
                  เมื่อทำเช่นนั้น กลิ่นหอมอันแสนวิเศษก็ลอยออกมา
                  และผลเบอร์รี่เหล่านี้ก็ถูกกวาดออกจากกองไฟ
                  อย่างรวดเร็วและบดให้ละเอียดเป็นถ่าน พระภิกษุรู้ตัวว่าทำผิด
                  จึงใส่ผลเบอร์รี่ลงในเหยือกและเติมน้ำร้อนเพื่อ เก็บรักษา
                  พระภิกษุดื่มเครื่องดื่มชนิดใหม่ที่น่ารักนี้ต่อไป
                  และพบว่ามันช่วยให้พวกเขาตื่นตัวระหว่างการสวดมนต
                  ์และสวดมนต์ทุกคืนเมื่อข่าวแพร่กระจายไปทางตะวันออก
                  และกาแฟเดินทางมาถึงคาบสมุทรอาหรับ
                  การเดินทางครั้งนี้จึงได้นำเมล็ดกาแฟไปทั่วโลก
                </p>
              </p>
            </div>

            {/* ภาพ + caption */}
            <figure className="lg:col-span-5 order-1 lg:order-2" data-aos="fade-left">
              <div className="rounded-xl overflow-hidden shadow-lg">
                <img
                  src="/history/history2.jpg"
                  alt="Coffee History 2 (visual pair)"
                  className="w-full h-72 object-cover"
                />
              </div>
              <figcaption className="mt-2 text-xs text-[#2a1c14]/60 text-center">
                ภาพบรรยากาศโลกเก่ากับกาแฟยุคแรกเริ่ม
              </figcaption>
            </figure>
          </div>
        </section>

        {/* รูปคั่น */}
        <img
          src="/history/history2.jpg"
          className="w-full h-80 md:h-96 object-cover my-6"
          alt="Coffee History 2"
          data-aos="zoom-in"
        />

        {/* SECTION 2 • คาบสมุทรอาหรับ (คงเนื้อหาเดิม) */}
        <section id="arab" className="mx-auto max-w-6xl px-4 md:px-8 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-7 order-2 lg:order-1" data-aos="fade-left">
              <p className="md:w-[90%] mx-auto  px-5 py-4 rounded-lg  leading-relaxed">
                <b className="text-lg text-[#7b4b29] text-center">
                  กาแฟแพร่กระจายไปสู่คาบสมุทรอาหรับ
                </b>
                <br />
                <br />
                <p className="indent-8">
                  เมื่อถึงศตวรรษที่ 15 กาแฟก็เริ่มปลูกในเขตเยเมนของคาบสมุทรอาหรับ
                  และเมื่อถึงศตวรรษที่ 16 กาแฟก็เป็นที่รู้จักในเปอร์เซีย อียิปต์ ซีเรีย
                  และตุรกีกาแฟไม่เพียงแต่ได้รับความนิยมในบ้านเท่านั้น
                  แต่ยังได้รับความนิยมในร้านกาแฟสาธารณะหลายแห่งที่เรียกว่า qahveh khaneh
                  ซึ่งเริ่มมีให้เห็นในเมืองต่างๆ ทั่วตะวันออกใกล้
                  ร้านกาแฟเหล่านี้ได้รับความนิยมอย่างล้นหลามและผู้คนต่างมา
                  ใช้บริการเพื่อทำกิจกรรมทางสังคมต่างๆ ลูกค้าไม่เพียงแต่ดื่มกาแฟและพูดคุยกันเท่านั้น
                  แต่ยังฟังเพลง ดูการแสดง เล่นหมากรุก และติดตามข่าวสารด้วย
                  ร้านกาแฟจึงกลายเป็นศูนย์กลางที่สำคัญในการแลกเปลี่ยนข้อมูลอย่างรวดเร็ว
                  จนมักถูกเรียกว่า “โรงเรียนแห่งปัญญา”ในแต่ละปี
                  มีนักแสวงบุญนับพันคนเดินทางมาเยี่ยมเยียนนครเมกกะอันศักดิ์สิทธิ์จากทั่วทุกมุมโลก
                  ทำให้ความรู้เกี่ยวกับ “ไวน์แห่งอาหรับ” นี้เริ่มแพร่หลายออกไป 
                </p>  
              </p>
            </div>

            <figure className="lg:col-span-5 order-1 lg:order-2" data-aos="fade-right">
              <div className="rounded-xl overflow-hidden shadow-lg">
                <img
                  src="/history/history3.png"
                  className="w-full h-72 object-cover"
                  alt="Coffee History 3"
                />
              </div>
              <figcaption className="mt-2 text-xs text-[#2a1c14]/60 text-center">
                ร้าน qahveh khaneh: พื้นที่สาธารณะกับวัฒนธรรมกาแฟ
              </figcaption>
            </figure>
          </div>
        </section>

        {/* บล็อกร้านกาแฟแรกของโลก (คงเนื้อหาเดิมทั้งหมด) */}
        <section id="firstcafe" className="mx-auto max-w-6xl px-4 py-6">
          <div className="flex flex-col lg:flex-row items-center rounded-lg justify-center bg-[#f7efe6]  shadow p-5 md:px-12 lg:px-16" data-aos="fade-up">
            <div className="lg:w-1/2 text-center">
              <p className="px-5 py-4 leading-relaxed">
                <b style={{ color: "brown" }}>ร้านกาแฟแห่งแรกของโลก</b>
                <br />
                <br />
                  ร้านกาแฟแห่งแรกของโลกเปิดในกรุงคอนสแตนติโนเปิลในปี 1475
                  ซึ่งปัจจุบันรู้จักกันในชื่ออิสตันบูล
                  การดื่มกาแฟที่บ้านได้กลายเป็นส่วนหนึ่ง
                  ของกิจวัตรประจำวันและเพื่อแสดงการต้อนรับแขกภายนอก
                  โดยผู้คนในสมัยนั้นไปเยี่ยมชมร้านกาแฟไม่เพียงแต่ดื่มกาแฟเท่านั้น
                  แต่ยังเพื่อสนทนา ฟังเพลง ดูนักแสดง เล่นหมากรุก ซุบซิบ
                  และติดตามข่าวสาร หากไม่มีเทคโนโลยีสมัยใหม่ที่เรามีในปัจจุบัน
                  ร้านกาแฟก็อาจจะยังคงเป็นศูนย์กลางในการ
                  แลกเปลี่ยนและรวบรวมข้อมูลอย่างรวดเร็ว พวกเขามักถูกเรียกว่า
                  "โรงเรียนแห่งปัญญา" และในแต่ละปีมีผู้แสวงบุญหลายพันคนที่มาเยือนเมกกะ
                  จากทั่วทุกมุมโลก ความรู้เกี่ยวกับ "ไวน์แห่งอาราบี"
                  นี้ซึ่งเป็นที่รู้จักอย่างรวดเร็วก็เริ่มแพร่กระจาย
              </p>
            </div>
            <div className="lg:w-1/3 mt-4 lg:mt-0 lg:ml-6 self-start">
              <img
                src="/history/history3.png"
                className="w-full rounded-lg"
                alt="Coffee History 3"
              />
            </div>
          </div>
        </section>

        {/* รูปคั่น */}
        <img
          src="/history/history4.jpg"
          className="w-full h-80 md:h-96 object-cover my-6"
          alt="Coffee History 4"
          data-aos="zoom-in"
        />

        {/* SECTION 4 • ยุโรป (คงเนื้อหาเดิม) */}
        <section id="europe" className="mx-auto max-w-6xl px-4 md:px-8 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-7 order-2 lg:order-1" data-aos="fade-right">
              <p className="md:w-[90%] mx-auto px-5 py-4 rounded-lg leading-relaxed">
                <b className="text-lg text-[#7b4b29]">การแพร่กระจายกาแฟสู่ยุโรป</b>
                <br />
                <br />
                <p className="indent-8">
                  มันกลายเป็นที่นิยมอย่างรวดเร็ว แต่บางคนกลับแสดงความสงสัยและกลัว
                  เรียกมันว่า "สิ่งประดิษฐ์อันขมขื่นของซาตาน"
                  โดยเฉพาะในเวนิสที่นักบวชท้องถิ่นประณามกาแฟในปี 1615
                  จนพระสันตปาปาเคลเมนต์ที่ 8 ต้องเข้ามาชิมด้วยตนเอง
                  และทรงรับรองกาแฟเพราะทรงชื่นชอบเครื่องดื่มนี้ หลังจากนั้น
                  ร้านกาแฟกลายเป็นศูนย์กลางของกิจกรรมทางสังคมในหลายประเทศ เช่น อังกฤษ
                  ออสเตรีย ฝรั่งเศส และเยอรมนี โดยในอังกฤษมี "มหาวิทยาลัยเพนนี"
                  ที่ผู้คนสามารถดื่มกาแฟและสนทนากันได้ด้วยเงินเพียงเพนนีเดียว กาแฟค่อย ๆ
                  เข้ามาแทนที่เบียร์และไวน์เป็นเครื่องดื่มยามเช้า
                  ผู้ดื่มกาแฟรู้สึกตื่นตัวและทำงานได้ดีขึ้น ในลอนดอนมีร้านกาแฟมากกว่า
                  300 แห่งภายในกลางศตวรรษที่ 17
                  ซึ่งบางร้านกลายเป็นจุดเริ่มต้นของธุรกิจสำคัญ เช่น Lloyd's of London
                  ที่ก่อตั้งขึ้นจากร้านกาแฟของ Edward Lloyd
                </p>
              </p>
            </div>

            <figure className="lg:col-span-5 order-1 lg:order-2" data-aos="fade-left">
              <div className="rounded-xl overflow-hidden shadow-lg">
                <img
                  src="/history/history5.png"
                  className="w-full h-72 object-cover"
                  alt="Coffee History 5"
                />
              </div>
              <figcaption className="mt-2 text-xs text-[#2a1c14]/60 text-center">
                จากคอนแดมน์ในเวนิส สู่วัฒนธรรมร้านกาแฟทั่วยุโรป
              </figcaption>
            </figure>
          </div>
        </section>

        {/* SECTION 5 • ปัจจุบัน (คงเนื้อหาเดิม) */}
        <section id="modern" className="mx-auto max-w-6xl px-4 md:px-8 py-10">
          <div className="bg-white rounded-xl shadow p-5 lg:p-6" data-aos="fade-up">
            <p className="leading-relaxed">
              <b className="text-lg text-[#7b4b29]">กาแฟในยุคปัจจุบัน</b>
              <br />
              <br />
              <p className="indent-8">
                ในปัจจุบัน กาแฟเป็นหนึ่งในเครื่องดื่มที่ได้รับความนิยมที่สุดในโลก
                วัฒนธรรมการดื่มกาแฟขยายตัวไปทั่วโลก
                มีทั้งร้านกาแฟท้องถิ่นขนาดเล็กจนถึงเชนร้านกาแฟระดับโลก เช่น Starbucks
                และยังมีการพัฒนาวิธีการชงกาแฟใหม่ ๆ เช่น การดริปกาแฟแบบแฮนด์เมด
                การใช้เครื่องเอสเปรสโซ และการปรุงกาแฟสูตรพิเศษที่หลากหลาย เช่น
                กาแฟลาเต้ กาแฟคาปูชิโน่ กาแฟเย็น และเมนูสร้างสรรค์อื่น ๆ
              </p>  
            </p>
          </div>
        </section>

        {/* หัวข้อทวีป */}
        <div className="text-center mb-8 mt-12 px-4" data-aos="fade-up">
          <h1 className="text-2xl lg:text-3xl font-bold text-orange-700">
            แหล่งกำเนิดกาแฟแต่ละทวีป
          </h1>
          <div className="mx-auto mt-3 h-px w-16 bg-neutral-300" />
        </div>

        {/* การ์ดตามทวีป (คงเนื้อหาเดิมทั้งหมด) */}
        <section id="continents" className="mx-auto max-w-6xl px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" data-aos="zoom-in">
            <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
              <img src="/history/history6.png" alt="Africa" className="rounded-md" />
              <h2 className="mt-3 text-xl font-semibold text-orange-600">แอฟริกา</h2>
              <p className="text-gray-700 text-sm leading-relaxed indent-8">
                กาแฟมีต้นกำเนิดจากเอธิโอเปียในภูมิ ภาคที่เรียกว่า Kaffa
                ประมาณศตวรรษที่ 9 ตำนานเล่าว่า ชาวนาเธอดี้ (Kaldi)
                พบว่าแกะของเขามีพลังงานและกระปรี้กระเปร่าเมื่อกินลูกกาแฟ
                สันนิษฐานว่าการใช้เมล็ดกาแฟเริ่มต้นในพื้นที่นี้เป็นครั้งแรก
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
              <img src="/history/history7.png" alt="Asia" className="rounded-md" />
              <h2 className="mt-3 text-xl font-semibold text-orange-600">เอเชีย</h2>
              <p className="text-gray-700 text-sm leading-relaxed indent-8">
                การปลูกในเอเชียกาแฟเริ่มถูกนำ เข้ามาในเอเชียในศตวรรษที่ 17
                ในช่วงที่มีการค้าขายระหว่างประเทศ
                โดยเฉพาะในประเทศที่มีสภาพภูมิอากาศที่เหมาะสม เช่น อินโดนีเซีย
                เวียดนาม และไทย การปลูกในอินโดนีเซีย อินโดนีเซียเป็นหนึ่งในประเทศแรก
                ๆ ที่เริ่มปลูกกาแฟนอกทวีปแอฟริกา
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
              <img src="/history/history8.png" alt="America" className="rounded-md" />
              <h2 className="mt-3 text-xl font-semibold text-orange-600">อเมริกา</h2>
              <p className="text-gray-700 text-sm leading-relaxed indent-8">
                กาแฟถูกนำเข้ามาในอเมริกาใต้ใน ศตวรรษที่ 18 โดยเฉพาะจากบราซิลและ
                โคลอมเบีย จากนั้นกาแฟกลายเป็นพืช เศรษฐกิจที่สำคัญในภูมิภาคนี้
                บราซิลกลายเป็นผู้ผลิตกาแฟรายใหญ่ที่สุดในโลกในศตวรรษที่
                19โดยมีการพัฒนา การปลูกกาแฟและการส่งออกอย่าง รวดเร็ว
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
              <img src="/history/history9.png" alt="Europe" className="rounded-md" />
              <h2 className="mt-3 text-xl font-semibold text-orange-600">ยุโรป</h2>
              <p className="text-gray-700 text-sm leading-relaxed indent-8">
                การแพร่กระจาย กาแฟเข้าสู่ยุโรป ในศตวรรษที่ 17 โดยเริ่มจากประเทศใน
                ตะวันออกกลางและเข้าสู่พื้นที่ของอิตาลี ฝรั่งเศส และอังกฤษ
                กาแฟกลายเป็นที่ นิยมในหมู่ชนชั้นสูงและกลุ่มผู้มีอิทธิพล
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default History;
