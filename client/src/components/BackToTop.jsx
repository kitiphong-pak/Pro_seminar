import { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";

const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => setIsVisible(window.scrollY > 300);
    window.addEventListener("scroll", toggleVisibility, { passive: true });
    toggleVisibility();
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="กลับขึ้นด้านบน"
      aria-hidden={!isVisible}
      tabIndex={isVisible ? 0 : -1}
      className={[
        "fixed bottom-6 right-6 z-50 p-3 rounded-full shadow-lg",
        "bg-[#4b2f1a] text-white cursor-pointer select-none",
        "transition-opacity duration-300 hover:bg-[#3d2010]",
        // ตอนซ่อน ต้องปิด pointer-events ด้วย ไม่งั้นปุ่มล่องหนจะบังมุมขวาล่าง
        // ทำให้กดโดนของที่อยู่ข้างใต้ไม่ได้ และเลือกข้อความตรงนั้นไม่ได้
        isVisible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
      ].join(" ")}
    >
      <ChevronUp size={24} className="pointer-events-none" />
    </button>
  );
};

export default BackToTop;
