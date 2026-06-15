import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const NotFound = () => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <main className="flex-grow flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-6xl font-bold text-dark-brown mb-4">404</h1>
      <p className="text-xl text-brown mb-8">ไม่พบหน้าที่คุณต้องการ</p>
      <Link
        to="/"
        className="px-6 py-3 bg-dark-brown text-beige rounded-full hover:bg-brown transition-colors"
      >
        กลับหน้าหลัก
      </Link>
    </main>
    <Footer />
  </div>
);

export default NotFound;
