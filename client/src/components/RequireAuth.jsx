import { Navigate, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import { useAuth } from "../contexts/AuthContext";

/**
 * ครอบ route ที่ต้องเข้าสู่ระบบก่อน
 * - ระหว่างเช็ค token: แสดงตัวโหลด (กันเด้งไป /login ทั้งที่ login อยู่)
 * - ถ้ายังไม่ได้ login: พาไป /login แล้วจำหน้าเดิมไว้ใน state.from
 */
const RequireAuth = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f3f1ec] animate-fade-in">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-4 border-[#7b4b29]/30 border-t-[#7b4b29] animate-spin" />
          <p className="text-[#7b4b29] text-sm">กำลังตรวจสอบสิทธิ์...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  return children;
};

RequireAuth.propTypes = { children: PropTypes.node };

export default RequireAuth;
