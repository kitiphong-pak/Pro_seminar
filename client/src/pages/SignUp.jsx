import 'bootstrap/dist/css/bootstrap.min.css';
import background from '../assets/background1.jpg';
import { useState } from 'react';
import { Link, useNavigate} from 'react-router-dom';
import "../assets/css/SignUp.css";
import { auth, db } from '../firebase/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

function SignUp() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [conPassword, setConPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        // ตรวจสอบความตรงกันของรหัสผ่าน
        if (password !== conPassword) {
            setErrorMessage("รหัสผ่านไม่ตรงกัน");
            return;
        }
    
        // ตรวจสอบรูปแบบของรหัสผ่าน
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
        if (!passwordRegex.test(password)) {
            setErrorMessage("รหัสผ่านต้องประกอบด้วยตัวพิมพ์ใหญ่ ตัวพิมพ์เล็ก และตัวเลขอย่างน้อย 8 ตัว");
            return;
        }

        setLoading(true);

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await setDoc(doc(db, "users", user.uid), {
                name,
                email,
                createdAt: new Date(),
            });

            navigate('/login');
        } catch (error) {
            if (error.code === "auth/email-already-in-use") {
                setErrorMessage("อีเมลนี้ได้ถูกใช้แล้ว");
            } else if (error.code === "auth/invalid-email") {
                setErrorMessage("อีเมลไม่ถูกต้อง");
            } else if (error.code === "auth/weak-password") {
                setErrorMessage("รหัสผ่านอ่อนเกินไป");
            } else {
                setErrorMessage("เกิดข้อผิดพลาดในการสมัครสมาชิก กรุณาลองใหม่อีกครั้ง");
            }
        } finally {
            setLoading(false);
        }

    };

    return (
      <div
        className="container-fluid vh-100 d-flex align-items-center"
        style={{
          backgroundImage: `url(${background})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          zIndex: -1,
        }}
      >
        <div className="row w-100">
          <div className="col-12 col-md-6 d-flex flex-column justify-content-center align-items-center">
            <h2 className="text-white mb-5 text-4xl font-bold">Register</h2>
            <form onSubmit={handleSubmit} className="w-75">
              <div className="form-group mb-3">
                <input
                  type="text"
                  className="form-control border-0 rounded-pill ps-4 text-lg"
                  placeholder="User Name"
                  style={{
                    backgroundColor: "rgba(224, 221, 223, 0.5)",
                    color: "white",
                  }}
                  onChange={(e) => setName(e.target.value)}
                  value={name}
                  required
                />
              </div>
              <div className="form-group mb-3">
                <input
                  type="email"
                  placeholder="Email"
                  className="form-control text-white border-0 rounded-pill ps-4 text-lg"
                  style={{
                    backgroundColor: "rgba(224, 221, 223, 0.5)",
                    color: "white",
                  }}
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                  required
                />
              </div>
              <div className="form-group mb-3">
                <input
                  type="password"
                  placeholder="Password"
                  className="form-control border-0 rounded-pill ps-4 text-lg"
                  style={{
                    backgroundColor: "rgba(224, 221, 223, 0.5)",
                    color: "white",
                  }}
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                  required
                />
              </div>
              <div className="form-group mb-4">
                <input
                  type="password"
                  placeholder="Confirm Password"
                  className="form-control border-0 rounded-pill ps-4 text-lg"
                  style={{
                    backgroundColor: "rgba(224, 221, 223, 0.5)",
                    color: "white",
                  }}
                  onChange={(e) => setConPassword(e.target.value)}
                  value={conPassword}
                  required
                />
              </div>
              {errorMessage && (
                <div className="alert alert-danger">{errorMessage}</div>
              )}
              <div style={{ display: "flex", justifyContent: "center" }}>
                <button
                  type="submit"
                  className="buttonHover btn btn-light btn-block rounded-pill w-25 text-lg"
                >
                  Register
                </button>
              </div>
            </form>
            <p className="text-white mt-4 mb-1 text-md">
              Already Have an Account?{" "}
              <Link to="/login" className="text-light text-md underline">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
}

export default SignUp;
