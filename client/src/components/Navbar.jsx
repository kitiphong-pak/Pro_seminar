import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";
const resolvePhoto = (url) => {
  if (!url) return "/coffeebean.png";
  if (url.startsWith("http")) return url;
  return `${API_BASE}${url}`;
};

export default function Navbar() {
  // ความสูง Navbar เดิม (เป็น % ของ viewport)
  const NAVBAR_HEIGHT_PERCENT = 12;

  const [showKnowledgeMenu, setShowKnowledgeMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // NEW: ควบคุมโหมด "Navbar ลอย" + แสดงไอคอนกลางบน
  const [showFloatingNav, setShowFloatingNav] = useState(false);
  const [showTopIcon, setShowTopIcon] = useState(false);

  const knowledgeMenuRef = useRef(null);
  const profileMenuRef = useRef(null);
  const navbarRef = useRef(null);
  const navigate = useNavigate();

  const location = useLocation();
  const { user, logout } = useAuth();

  // ปิดเมนูเมื่อคลิกนอก
  useEffect(() => {
    function handleClickOutside(event) {
      if (navbarRef.current && !navbarRef.current.contains(event.target)) {
        setShowMenu(false);
        setShowKnowledgeMenu(false);
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setShowProfileMenu(false);
    navigate("/login");
  };

  // NEW: แสดงไอคอนเมื่อเลื่อนลงพ้น threshold และไม่ได้เปิด navbar ลอยอยู่
  useEffect(() => {
    const onScroll = () => {
      const threshold = 120; // px
      setShowTopIcon(window.scrollY > threshold && !showFloatingNav);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [showFloatingNav]);

  // NEW: ปิด navbar ลอยเมื่อเปลี่ยนเส้นทาง หรือกด ESC
  useEffect(() => {
    setShowFloatingNav(false);
    setShowMenu(false);
    setShowKnowledgeMenu(false);
    setShowProfileMenu(false);
  }, [location.pathname]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setShowFloatingNav(false);
        setShowKnowledgeMenu(false);
        setShowProfileMenu(false);
        setShowMenu(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // เส้นทาง active
  const knowledgeRoutes = [
    "/history",
    "/geneCoffee",
    "/roasting",
    "/extraction",
    "/process",
    "/worldCoffee",
    "/articles",
  ];
  const isKnowledgeActive = knowledgeRoutes.some((r) => location.pathname === r);
  const isCoffeeBeanActive = location.pathname === "/coffee_bean";
  const isCoffeeMenuActive = location.pathname === "/coffee_menu";

  // หน้าแรกให้พื้นหลัง navbar โปร่งใส จะได้กลืนไปกับ hero
  // (พื้นหลังหน้า Home เป็น bg-beige-light สีเดียวกับจุดเริ่มของ gradient ใน hero)
  const isHome = location.pathname === "/";

  // คลาสสำหรับโหมดลอย (fixed) vs ปกติ (relative)
  const wrapperBase = "z-50 relative" ;
  const wrapperStyle = { height: `${NAVBAR_HEIGHT_PERCENT}%`, width: "100%" };

  return (
    <>
      {/* NEW: ไอคอนกลางบนสุด (กดเพื่อดึง Navbar ลงมา) */}
      {showTopIcon && (
        <button
          aria-label="Open navigation"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed top-2 left-1/2 -translate-x-1/2 z-[9999] bg-white/70 backdrop-blur rounded-full p-1 shadow hover:scale-105 transition"
        >
          <img
            src="./nav/icon-1.png" // วาง icon-1.png ใน public root หรือปรับพาธตามที่ใช้
            alt="Open Navbar"
            className="w-10 h-10"
          />
        </button>
      )}

      <div
        ref={navbarRef}
        style={wrapperStyle}
        className={`${wrapperBase} ${showFloatingNav ? "animate-slide-down" : ""}`}
      >
        <header
          className={`flex justify-between items-center select-none ${
            isHome ? "bg-transparent" : "bg-white shadow-lg"
          } ${showFloatingNav ? "rounded-b-xl" : ""}`}
          style={{ padding: "1rem 1.25rem", height: "100%" }}
        >
          {/* โลโก้ */}
          <div className="font-main font-bold text-brown text-3xl md:text-2xl lg:text-3xl leading-none">
            <Link to="/">Coffee Bean Fusion</Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-6 ">
            <ul className="flex items-center space-x-12 text-brown">
              {/* คลังความรู้กาแฟ */}
              <li
                className={`relative group ${
                  isKnowledgeActive ? "border-b-2 border-light-brown" : ""
                }`}
                ref={knowledgeMenuRef}
              >
                <button
                  type="button"
                  aria-haspopup="true"
                  aria-expanded={showKnowledgeMenu}
                  className="cursor-pointer select-none hover:text-light-brown transition duration-300"
                  onClick={() => setShowKnowledgeMenu((prev) => !prev)}
                >
                  คลังความรู้กาแฟ
                </button>
                {showKnowledgeMenu && (
                  <ul className="absolute left-0 z-10 bg-brown shadow-lg mt-2 rounded-md w-60 text-beige text-sm transition duration-300">
                    <li>
                      <Link
                        to="/history"
                        className="flex items-center p-3 hover:bg-dark-brown transition duration-200"
                      >
                        <img
                          src="nav/icons8-history-80.png"
                          alt="history icon"
                          className="w-6 h-6 mr-2"
                        />
                        <span>ประวัติศาสตร์กาแฟ</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/geneCoffee"
                        className="flex items-center p-3 hover:bg-dark-brown transition duration-200"
                      >
                        <img
                          src="nav/icons8-coffee-beans-48 (2).png"
                          alt="history icon"
                          className="w-6 h-6 mr-2"
                        />
                        สายพันธุ์กาแฟ
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/roasting"
                        className="flex items-center p-3 hover:bg-dark-brown transition duration-200"
                      >
                        <img
                          src="nav/icons8-coffee-bag-50.png"
                          alt="history icon"
                          className="w-6 h-6 mr-2"
                        />
                        ระดับของการคั่วกาแฟ
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/extraction"
                        className="flex items-center p-3 hover:bg-dark-brown transition duration-200"
                      >
                        <img
                          src="nav/icons8-vietnamese-coffee-50.png"
                          alt="history icon"
                          className="w-6 h-6 mr-2"
                        />
                        เทคนิคการสกัดกาแฟ
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/process"
                        className="flex items-center p-3 hover:bg-dark-brown transition duration-200"
                      >
                        <img
                          src="nav/icons8-coffee-cup-50.png"
                          alt="history icon"
                          className="w-6 h-6 mr-2"
                        />
                        กระบวนการผลิตกาแฟ
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/worldCoffee"
                        className="flex items-center p-3 hover:bg-dark-brown transition duration-200"
                      >
                        <img
                          src="nav/icons8-map-80 (1).png"
                          alt="history icon"
                          className="w-6 h-6 mr-2"
                        />
                        แผนที่แหล่งผลิตกาแฟโลก
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/articles"
                        className="flex items-center p-3 hover:bg-dark-brown transition duration-200"
                      >
                        <img
                          src="nav/icons8-article-50.png"
                          alt="history icon"
                          className="w-6 h-6 mr-2"
                        />
                        บทความน่ารู้
                      </Link>
                    </li>
                  </ul>
                )}
              </li>

              {/* เมล็ดกาแฟ */}
              <li
                className={`cursor-pointer hover:text-light-brown transition duration-300 ${
                  isCoffeeBeanActive ? "border-b-2 border-light-brown" : ""
                }`}
              >
                <Link to="/coffee_bean">เมล็ดกาแฟ</Link>
              </li>

              {/* เมนูกาแฟ */}
              <li
                className={`cursor-pointer hover:text-light-brown transition duration-300 ${
                  isCoffeeMenuActive ? "border-b-2 border-light-brown" : ""
                }`}
              >
                <Link to="/coffee_menu">เมนูกาแฟ</Link>
              </li>

              {/* เมนูโปรไฟล์ */}
              <li className="relative group" ref={profileMenuRef}>
                <button
                  type="button"
                  aria-haspopup="true"
                  aria-expanded={showProfileMenu}
                  aria-label="เมนูโปรไฟล์"
                  className="block rounded-full hover:opacity-80 transition duration-300"
                  onClick={() => setShowProfileMenu((prev) => !prev)}
                >
                  <img
                    src={resolvePhoto(user?.photoURL)}
                    alt=""
                    onError={(e) => { e.currentTarget.src = "/coffeebean.png"; }}
                    className="w-10 h-10 rounded-full"
                  />
                </button>
                {showProfileMenu && (
                  <ul className="absolute right-0 z-10 bg-brown shadow-lg mt-2 rounded-md w-48 text-beige text-sm transition duration-300">
                    {user ? (
                      <>
                        <li className="p-3 hover:bg-dark-brown transition duration-200">
                          <Link to="/profile">โปรไฟล์ของฉัน</Link>
                        </li>
                        <li>
                          <button
                            type="button"
                            className="w-full text-left p-3 hover:bg-red-500 transition duration-200"
                            onClick={handleLogout}
                          >
                            ออกจากระบบ
                          </button>
                        </li>
                      </>
                    ) : (
                      <li className="p-3 hover:bg-dark-brown transition duration-200">
                        <Link to="/login">เข้าสู่ระบบ</Link>
                      </li>
                    )}
                  </ul>
                )}
              </li>
            </ul>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            className="lg:hidden text-brown focus:outline-none text-2xl transition-transform duration-200 ease-smooth active:scale-90"
            onClick={() => setShowMenu((prev) => !prev)}
          >
            ☰
          </button>

          {/* Mobile Menu */}
          {showMenu && (
            <div className="absolute top-full left-0 w-full bg-brown shadow-lg p-6 lg:hidden z-50 rounded-b-xl animate-slide-down">
              <ul className="space-y-4 text-beige">
                <li>
                  <span className="block text-lg font-semibold">
                    คลังความรู้กาแฟ
                  </span>
                  <ul className="mt-2 bg-dark-brown rounded-lg shadow-inner divide-y divide-gray-700">
                    <li>
                      <Link
                        to="/history"
                        className="block p-3 hover:bg-brown transition duration-200"
                        onClick={() => setShowMenu(false)}
                      >
                        ประวัติศาสตร์กาแฟ
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/geneCoffee"
                        className="block p-3 hover:bg-brown transition duration-200"
                        onClick={() => setShowMenu(false)}
                      >
                        สายพันธุ์กาแฟ
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/roasting"
                        className="block p-3 hover:bg-brown transition duration-200"
                        onClick={() => setShowMenu(false)}
                      >
                        ระดับของการคั่วกาแฟ
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/extraction"
                        className="block p-3 hover:bg-brown transition duration-200"
                        onClick={() => setShowMenu(false)}
                      >
                        เทคนิคการสกัดกาแฟ
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/process"
                        className="block p-3 hover:bg-brown transition duration-200"
                        onClick={() => setShowMenu(false)}
                      >
                        กระบวนการผลิตกาแฟ
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/worldCoffee"
                        className="block p-3 hover:bg-brown transition duration-200"
                        onClick={() => setShowMenu(false)}
                      >
                        แผนที่แหล่งผลิตกาแฟโลก
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/articles"
                        className="block p-3 hover:bg-brown transition duration-200"
                        onClick={() => setShowMenu(false)}
                      >
                        บทความน่ารู้
                      </Link>
                    </li>
                  </ul>
                </li>
                <li className="hover:bg-brown text-lg pt-3 rounded transition duration-200 font-semibold">
                  <Link to="/coffee_bean" onClick={() => setShowMenu(false)}>
                    เมล็ดกาแฟ
                  </Link>
                </li>
                <li className="hover:bg-brown text-lg pt-3 rounded transition duration-200 font-semibold">
                  <Link to="/coffee_menu" onClick={() => setShowMenu(false)}>
                    เมนูกาแฟ
                  </Link>
                </li>
                {/* Mobile Profile Menu */}
                <li>
                  <span className="block text-lg font-semibold">โปรไฟล์</span>
                  <ul className="mt-2 bg-dark-brown rounded-lg shadow-inner divide-y divide-gray-700">
                    {user ? (
                      <>
                        <li>
                          <Link
                            to="/profile"
                            onClick={() => setShowMenu(false)}
                            className="block p-3 hover:bg-brown transition duration-200"
                          >
                            โปรไฟล์ของฉัน
                          </Link>
                        </li>
                        <li>
                          <button
                            type="button"
                            className="w-full text-left block p-3 hover:bg-red-500 transition duration-200"
                            onClick={() => {
                              handleLogout();
                              setShowMenu(false);
                            }}
                          >
                            ออกจากระบบ
                          </button>
                        </li>
                      </>
                    ) : (
                      <li>
                        <Link
                          to="/login"
                          onClick={() => setShowMenu(false)}
                          className="block p-3 hover:bg-brown transition duration-200"
                        >
                          เข้าสู่ระบบ
                        </Link>
                      </li>
                    )}
                  </ul>
                </li>
              </ul>
            </div>
          )}
        </header>
      </div>
    </>
  );
}
