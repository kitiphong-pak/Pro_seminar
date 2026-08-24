import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import "../assets/css/SignUp.css";
import { useAuth } from '../contexts/AuthContext';

function SignUp() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [conPassword, setConPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { register } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== conPassword) { setErrorMessage("รหัสผ่านไม่ตรงกัน"); return; }
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
        if (!passwordRegex.test(password)) { setErrorMessage("รหัสผ่านต้องประกอบด้วยตัวพิมพ์ใหญ่ ตัวพิมพ์เล็ก และตัวเลขอย่างน้อย 8 ตัว"); return; }
        setLoading(true);
        try {
            await register(name, email, password);
            navigate('/');
        } catch (error) {
            setErrorMessage(error.message || "เกิดข้อผิดพลาดในการสมัครสมาชิก กรุณาลองใหม่อีกครั้ง");
        } finally {
            setLoading(false);
        }
    };

    return (
      <div className="signup-page">
        <div className="signup-card">

          {/* ฝั่งแบรนด์ — พื้นหลังไล่สีกาแฟ ไม่ใช้รูปภาพ */}
          <aside className="signup-brand">
            <span className="signup-brand__badge">Coffee Bean Fusion</span>
            <h2 className="signup-brand__title">เริ่มต้นเส้นทาง<br />คนรักกาแฟ</h2>
            <p className="signup-brand__desc">
              สมัครสมาชิกเพื่อเก็บความคืบหน้าการเรียนรู้ สะสมความสำเร็จ
              และบันทึกสูตรกาแฟที่คุณชอบ
            </p>
            <ul className="signup-brand__list">
              <li>คลังความรู้กาแฟ 5 หมวด</li>
              <li>ข้อมูลกาแฟจาก 48 ประเทศ</li>
              <li>ซิมูเลเตอร์ฝึกชงกาแฟ</li>
            </ul>
          </aside>

          {/* ฝั่งฟอร์ม */}
          <div className="signup-form">
            <h1 className="signup-form__title">สร้างบัญชี</h1>
            <p className="signup-form__sub">กรอกข้อมูลด้านล่างเพื่อเริ่มใช้งาน</p>

            <form onSubmit={handleSubmit} noValidate>
              <label className="signup-field">
                <span>ชื่อผู้ใช้</span>
                <input
                  type="text"
                  placeholder="ชื่อที่ใช้แสดง"
                  autoComplete="nickname"
                  onChange={(e) => setName(e.target.value)}
                  value={name}
                  required
                />
              </label>

              <label className="signup-field">
                <span>อีเมล</span>
                <input
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                  required
                />
              </label>

              <label className="signup-field">
                <span>รหัสผ่าน</span>
                <input
                  type="password"
                  placeholder="อย่างน้อย 8 ตัว"
                  autoComplete="new-password"
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                  required
                />
                <small className="signup-hint">
                  ต้องมีตัวพิมพ์ใหญ่ ตัวพิมพ์เล็ก และตัวเลข อย่างน้อย 8 ตัวอักษร
                </small>
              </label>

              <label className="signup-field">
                <span>ยืนยันรหัสผ่าน</span>
                <input
                  type="password"
                  placeholder="พิมพ์รหัสผ่านอีกครั้ง"
                  autoComplete="new-password"
                  onChange={(e) => setConPassword(e.target.value)}
                  value={conPassword}
                  required
                />
              </label>

              {errorMessage && <div className="signup-error">{errorMessage}</div>}

              <button type="submit" className="signup-submit" disabled={loading}>
                {loading ? "กำลังสมัคร..." : "สมัครสมาชิก"}
              </button>
            </form>

            <p className="signup-foot">
              มีบัญชีอยู่แล้ว? <Link to="/login">เข้าสู่ระบบ</Link>
            </p>
          </div>

        </div>
      </div>
    );
}

export default SignUp;
