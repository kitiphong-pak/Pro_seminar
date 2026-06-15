import { useState, useEffect, useRef } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import { updateProfile } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db } from "../firebase/firebase";
import { useAuth } from "../contexts/AuthContext";
import articles from "../data/article.json";

// ---------- UI helpers ----------
const StatCard = ({ icon, label, value, sub }) => (
  <div className="rounded-2xl bg-white/90 backdrop-blur shadow-md p-4 md:p-5 hover:shadow-lg transition">
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 grid place-items-center rounded-xl bg-brown/10 text-brown">{icon}</div>
      <div>
        <p className="text-sm text-neutral-600">{label}</p>
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-extrabold text-[#2a1c14]">{value}</p>
          {sub ? <span className="text-xs text-neutral-500">{sub}</span> : null}
        </div>
      </div>
    </div>
  </div>
);

const ProgressLine = ({ percent }) => (
  <div className="w-full h-2.5 rounded-full bg-neutral-200 overflow-hidden">
    <div
      className="h-full bg-gradient-to-r from-[#8b5e34] via-[#6f4e37] to-[#3e2a1f] transition-all"
      style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
    />
  </div>
);

const Pill = ({ children }) => (
  <span className="inline-flex items-center gap-2 rounded-full bg-white/80 border border-neutral-200 px-3 py-1 text-xs text-neutral-700">
    {children}
  </span>
);

const Profile = () => {
  const { user, isLoading: loading } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [saveError, setSaveError] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editedEmail, setEditedEmail] = useState("");

  const [activeTab, setActiveTab] = useState("overview");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const modalRef = useRef(null);

  // focus trap inside edit modal
  useEffect(() => {
    if (!isEditing || !modalRef.current) return;
    const el = modalRef.current;
    el.focus();
    const focusable = el.querySelectorAll(
      'button, input, [href], select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const trap = (e) => {
      if (e.key !== "Tab") return;
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    el.addEventListener("keydown", trap);
    return () => el.removeEventListener("keydown", trap);
  }, [isEditing]);

  const onPickFile = () => fileInputRef.current?.click();

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    try {
      const storage = getStorage();
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const path = `users/${user.uid}/avatar_${Date.now()}.${ext}`;
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, file, { contentType: file.type });
      const url = await getDownloadURL(storageRef);

      // อัปเดตโปรไฟล์ใน Auth
      await updateProfile(user, { photoURL: url });

      // อัปเดตใน Firestore
      const refDoc = doc(db, "users", user.uid);
      await updateDoc(refDoc, { photoURL: url });

      setProfileData({ ...profileData, photoURL: url });
    } catch {
      alert("อัปโหลดรูปไม่สำเร็จ ลองใหม่อีกครั้ง");
    } finally {
      setUploading(false);
      if (e.target) e.target.value = "";
    }
  };

  // load profile data from Firestore when user is available
  useEffect(() => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    getDoc(userRef).then((snap) => {
      if (snap.exists()) setProfileData(snap.data());
    });
  }, [user]);

  // edit popup
  const openEditPopup = () => {
    if (profileData) {
      setEditedName(profileData.name || profileData.displayName || "");
      setEditedEmail(profileData.email || "");
    }
    setIsEditing(true);
  };

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaveError("");
    if (!editedName.trim()) { setSaveError("กรุณากรอกชื่อ"); return; }
    if (editedEmail && !EMAIL_RE.test(editedEmail)) { setSaveError("รูปแบบอีเมลไม่ถูกต้อง"); return; }
    try {
      const ref = doc(db, "users", user.uid);
      await updateDoc(ref, { name: editedName, email: editedEmail });
      setProfileData({ ...profileData, name: editedName, email: editedEmail });
      setIsEditing(false);
    } catch (e) {
      setSaveError("บันทึกไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-beige-light">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="h-40 rounded-2xl bg-neutral-200 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-28 rounded-xl bg-neutral-200 animate-pulse" />
            ))}
          </div>
          <div className="h-48 rounded-2xl bg-neutral-200 animate-pulse mt-6" />
        </div>
        <Footer />
      </div>
    );
  }

  const achievements = profileData?.achievements ?? {};

  // progress per category
  const contentTotal = 5;
  const contentCompleted = achievements.content
    ? Math.min(Object.keys(achievements.content).length, contentTotal)
    : 0;
  const contentPct = (contentCompleted / contentTotal) * 100;

  const simulatorTotal = 1;
  const simulatorCompleted =
    achievements.simulator && Object.keys(achievements.simulator).length > 0 ? 1 : 0;
  const simulatorPct = (simulatorCompleted / simulatorTotal) * 100;

  const knowledgeTotal = articles.length || 0;
  const knowledgeCompleted = achievements.knowledge
    ? Object.keys(achievements.knowledge).length
    : 0;
  const knowledgePct = knowledgeTotal ? (knowledgeCompleted / knowledgeTotal) * 100 : 0;

  // คะแนนรวมคิดเฉพาะ achievements
  const totalAchievementScore =
    (achievements.content ? Object.keys(achievements.content).length : 0) +
    (achievements.simulator ? Object.keys(achievements.simulator).length : 0) +
    (achievements.knowledge ? Object.keys(achievements.knowledge).length : 0);

  const overallScore = totalAchievementScore;
  const rank =
    overallScore >= 20 ? "Gold Bean" : overallScore >= 10 ? "Silver Bean" : "Bronze Bean";

  const contentMap = {
    history_coffee: {
      label: "ประวัติการณ์กาแฟ",
      icon: "nav/icons8-history-80-b.png",
      link: "/history",
    },
    gene_coffee: {
      label: "สายพันธุ์กาแฟ",
      icon: "nav/icons8-coffee-beans-48-b.png",
      link: "/geneCoffee",
    },
    roasting_coffee: {
      label: "ระดับการคั่ว",
      icon: "nav/icons8-coffee-bag-50 (1).png",
      link: "/roasting",
    },
    extraction_coffee: {
      label: "เทคนิคการสกัด",
      icon: "nav/icons8-vietnamese-coffee-50-b.png",
      link: "/extraction",
    },
    process_coffee: {
      label: "กระบวนการผลิต",
      icon: "nav/icons8-coffee-cup-50-b.png",
      link: "/process",
    },
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f3f1ec]">
      <Navbar />

      {/* HERO */}
      <header className="relative">
        <img
          src="/profile/cover.jpg"
          onError={(e) => (e.currentTarget.src = "/home1.jpg")}
          className="h-48 md:h-56 w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 to-black/0" />
        <div className="max-w-6xl mx-auto px-4">
          <div className="-mb-12 md:-mb-16" />
        </div>
      </header>

      {/* TOP CARD */}
      <main className="flex-1">
        <section className="max-w-6xl mx-auto px-4">
          <div className="relative -mt-14 md:-mt-16 rounded-2xl bg-white/90 backdrop-blur shadow-xl p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
              <div className="relative">
                <img
                  src={profileData?.photoURL || "/coffeebean.png"}
                  alt="avatar"
                  className="h-24 w-24 md:h-28 md:w-28 rounded-full object-cover ring-4 ring-white shadow-lg"
                />
                <span className="absolute -bottom-1 -right-1 rounded-full bg-[#6f4e37] text-white text-[10px] px-2 py-0.5 shadow">
                  {rank}
                </span>
              </div>

              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-extrabold text-[#2a1c14]">
                  {profileData?.name || profileData?.displayName || "ผู้ใช้งาน"}
                </h1>
                <p className="text-sm md:text-base text-neutral-600">{profileData?.email}</p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <Pill>คะแนนรวม: <span className="font-bold text-[#2a1c14]">{overallScore}</span></Pill>
                  <Pill>Achievements: <span className="font-bold">{totalAchievementScore}</span></Pill>
                </div>
              </div>

              <div className="md:text-right">
                <button
                  onClick={openEditPopup}
                  className="rounded-full bg-[#6f4e37] text-white px-5 py-2 text-sm font-semibold shadow hover:opacity-90 transition"
                >
                  แก้ไขโปรไฟล์
                </button>
              </div>
            </div>

            {/* สรุปสั้นๆ */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
              <StatCard
                icon={<img src="/nav/icons8-coffee-bean-32.png" className="h-6" />}
                label="ความรู้ (บทความ)"
                value={`${contentCompleted}/${contentTotal}`}
                sub={`${contentPct.toFixed(0)}%`}
              />
              <StatCard
                icon={<img src="/nav/icons8-vietnamese-coffee-50-b.png" className="h-6" />}
                label="ซิมมูเลเตอร์"
                value={`${simulatorCompleted}/${simulatorTotal}`}
                sub={`${simulatorPct.toFixed(0)}%`}
              />
              <StatCard
                icon={<img src="/nav/icons8-article-50.png" className="h-6" />}
                label="บทความน่ารู้"
                value={`${knowledgeCompleted}/${knowledgeTotal}`}
                sub={`${knowledgePct.toFixed(0)}%`}
              />
            </div>
          </div>
        </section>

        {/* Tabs (ตัด Quizzes ออก) */}
        <div className="max-w-6xl mx-auto px-4 mt-8">
          <div className="rounded-full bg-white/70 backdrop-blur border border-neutral-200 shadow-sm inline-flex">
            {[
              { key: "overview", label: "ภาพรวม" },
              { key: "achievements", label: "ความสำเร็จ" },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`px-5 md:px-6 py-2 text-sm md:text-base rounded-full transition ${
                  activeTab === t.key
                    ? "bg-[#6f4e37] text-white"
                    : "text-[#2a1c14] hover:bg-neutral-100"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab: Overview (เหลือเฉพาะ Progress) */}
        {activeTab === "overview" && (
          <section className="max-w-6xl mx-auto px-4 mt-6">
            <div className="rounded-2xl bg-white/90 backdrop-blur shadow-md p-5">
              <h3 className="text-lg font-bold text-[#2a1c14]">ความคืบหน้า</h3>
              <div className="mt-4 space-y-5">
                <div>
                  <div className="flex justify-between text-sm text-neutral-600">
                    <span>บทความ</span>
                    <span>{contentCompleted}/{contentTotal} • {contentPct.toFixed(1)}%</span>
                  </div>
                  <ProgressLine percent={contentPct} />
                </div>
                <div>
                  <div className="flex justify-between text-sm text-neutral-600">
                    <span>ซิมมูเลเตอร์</span>
                    <span>{simulatorCompleted}/{simulatorTotal} • {simulatorPct.toFixed(1)}%</span>
                  </div>
                  <ProgressLine percent={simulatorPct} />
                </div>
                <div>
                  <div className="flex justify-between text-sm text-neutral-600">
                    <span>บทความน่ารู้</span>
                    <span>{knowledgeCompleted}/{knowledgeTotal} • {knowledgePct.toFixed(1)}%</span>
                  </div>
                  <ProgressLine percent={knowledgePct} />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Tab: Achievements */}
        {activeTab === "achievements" && (
          <section className="max-w-6xl mx-auto px-4 mt-6">
            {/* Content achievements */}
            <div className="rounded-2xl bg-white/90 backdrop-blur shadow-md p-5">
              <h2 className="text-xl font-bold text-[#2a1c14]">ความสำเร็จจากบทความ</h2>
              {achievements.content && Object.keys(achievements.content).length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                  {Object.keys(achievements.content).map((key) => {
                    const m = contentMap[key];
                    return (
                      <div key={key} className="rounded-xl bg-white border border-neutral-200 hover:shadow-md transition">
                        <Link to={m?.link || "#"} className="flex items-center gap-3 p-4">
                          <img src={m?.icon || "nav/icons8-coffee-bean-32.png"} className="w-7 h-7" />
                          <div>
                            <p className="font-semibold text-[#2a1c14]">{m?.label || key}</p>
                            <span className="text-xs text-neutral-500">คลิกเพื่ออ่านต่อ</span>
                          </div>
                        </Link>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-neutral-600 mt-2">ยังไม่มีความสำเร็จหมวดบทความ</p>
              )}
            </div>

            {/* Knowledge & Simulator */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <div className="rounded-2xl bg-white/90 backdrop-blur shadow-md p-5">
                <h3 className="text-lg font-bold text-[#2a1c14]">บทความน่ารู้</h3>
                {achievements.knowledge && Object.keys(achievements.knowledge).length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                    {Object.keys(achievements.knowledge).map((k) => (
                      <div key={k} className="rounded-lg bg-white border border-neutral-200 p-3 flex items-center gap-2">
                        <img src="nav/icons8-coffee-bean-32.png" className="w-6 h-6" />
                        <span className="text-sm text-[#2a1c14]">{k}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-neutral-600 mt-2">ยังไม่มีความสำเร็จหมวดนี้</p>
                )}
              </div>

              <div className="rounded-2xl bg-white/90 backdrop-blur shadow-md p-5">
                <h3 className="text-lg font-bold text-[#2a1c14]">ซิมมูเลเตอร์</h3>
                {simulatorCompleted ? (
                  <div className="rounded-lg bg-white border border-neutral-200 p-4 flex items-center gap-3">
                    <img src="nav/icons8-vietnamese-coffee-50-b.png" className="w-7 h-7" />
                    <div>
                      <p className="font-semibold text-[#2a1c14]">ทำแบบจำลองสำเร็จแล้ว</p>
                      <span className="text-xs text-neutral-600">เยี่ยมมาก! ลองปรับสูตรอื่น ๆ ต่อได้</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-neutral-600 mt-2">ยังไม่มีความสำเร็จซิมมูเลเตอร์</p>
                )}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Modal Edit */}
      {isEditing && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
          <div
            ref={modalRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-modal-title"
            className="w-full max-w-md rounded-2xl bg-white shadow-xl outline-none"
          >
            <div className="p-5 border-b">
              <h3 id="edit-modal-title" className="text-lg font-bold text-[#2a1c14]">แก้ไขโปรไฟล์</h3>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm text-neutral-700 mb-1">รูปโปรไฟล์</label>
                <div className="flex items-center gap-3">
                  <img
                    src={profileData?.photoURL || "/coffeebean.png"}
                    onError={(e) => (e.currentTarget.src = "/coffeebean.png")}
                    className="h-12 w-12 rounded-full object-cover ring-2 ring-neutral-200"
                    alt="avatar"
                  />
                  <button
                    onClick={onPickFile}
                    className="rounded-full bg-neutral-100 border px-3 py-1.5 text-sm hover:bg-neutral-200 disabled:opacity-60"
                    disabled={uploading}
                    type="button"
                  >
                    {uploading ? "กำลังอัปโหลด…" : "อัปโหลดรูปใหม่"}
                  </button>
                  {/* input ซ่อน (ย้ายมาไว้ใน modal) */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
                <p className="text-xs text-neutral-500 mt-1">แนะนำไฟล์ JPG/PNG ≤ 5MB</p>
              </div>
              <div>
                <label className="block text-sm text-neutral-700 mb-1">ชื่อ</label>
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6f4e37]"
                />
              </div>
              <div>
                <label className="block text-sm text-neutral-700 mb-1">อีเมล</label>
                <input
                  type="email"
                  value={editedEmail}
                  onChange={(e) => setEditedEmail(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6f4e37]"
                />
              </div>
            </div>
            <div className="p-5 border-t">
              {saveError && (
                <p className="text-red-600 text-sm mb-3">{saveError}</p>
              )}
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => { setIsEditing(false); setSaveError(""); }}
                  className="rounded-full bg-neutral-200 px-4 py-2 text-sm hover:bg-neutral-300"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleSaveProfile}
                  className="rounded-full bg-[#6f4e37] text-white px-5 py-2 text-sm font-semibold hover:opacity-90"
                >
                  บันทึก
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Profile;
