import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../contexts/AuthContext";

const quizzes = [
  {
    id: 1,
    title: "แบบทดสอบความรู้ทั่วไป",
    description: "ทดสอบความรู้ทั่วไปของคุณ",
  },
  {
    id: 2,
    title: "เทคนิคและกระบวนการชงกาแฟ",
    description: "ทดสอบความรู้ทางเทคนิคและกระบวนการชงกาแฟ",
  },
];

const Quiz = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-beige-light dark:bg-dark-brown flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-dark-brown dark:text-brown-superlight animate-fade-in-up">
          รายการแบบทดสอบ
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz, i) => (
            <Link
              key={quiz.id}
              to={`/quiz/${quiz.id}`}
              onClick={(e) => {
                if (!user) {
                  e.preventDefault();
                  navigate("/login");
                }
              }}
              style={{ animationDelay: `${i * 60}ms` }}
              className="block p-6 bg-white dark:bg-[#2b2015] border border-black/5 dark:border-brown-superlight/10 text-dark-brown dark:text-brown-superlight rounded-2xl shadow-sm transition-all duration-200 ease-smooth hover:bg-light-brown hover:text-beige dark:hover:bg-beige dark:hover:text-dark-brown hover:shadow-lg hover:-translate-y-1 active:translate-y-0 active:scale-[0.98] animate-fade-in-up"
            >
              <h2 className="text-xl font-semibold mb-2">{quiz.title}</h2>
              <p>{quiz.description}</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Quiz;
