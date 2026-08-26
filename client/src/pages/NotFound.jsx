import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

const NotFound = () => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <main className="flex-grow flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-6xl font-bold text-dark-brown mb-4 animate-fade-in-up">404</h1>
      <p className="text-xl text-brown mb-8 animate-fade-in-up [animation-delay:80ms]">
        ไม่พบหน้าที่คุณต้องการ
      </p>
      <Link
        to="/"
        className="px-6 py-3 bg-dark-brown text-beige rounded-full shadow-md transition-all duration-200 ease-smooth hover:bg-brown hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-95 animate-fade-in-up [animation-delay:160ms]"
      >
        กลับหน้าหลัก
      </Link>
    </main>
  </div>
);

export default NotFound;
