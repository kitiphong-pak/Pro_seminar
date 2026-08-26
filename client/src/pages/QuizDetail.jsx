import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Navbar from "../components/Navbar";
import BackToTop from "../components/BackToTop";
import { fetchQuiz } from "../api/contentApi";
import { saveQuizScore } from "../api/userApi";
import { useNavigate } from 'react-router-dom';

const QuizDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const uid = user?.uid ?? null;
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [showScore, setShowScore] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    fetchQuiz(id)
      .then((data) => {
        if (data?.error) { setLoadError(true); return; }
        setQuiz(data);
        setSelectedAnswers(new Array(data.questions.length).fill(null));
      })
      .catch(() => setLoadError(true));
  }, [id]);

  if (loadError || (!quiz && loadError === false && quiz === null)) {
    if (!quiz && !loadError) return (
      <div className="min-h-screen bg-beige-light dark:bg-dark-brown flex flex-col">
        <Navbar />
        <div className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
          <p className="text-dark-brown dark:text-brown-superlight animate-fade-in">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-beige-light dark:bg-dark-brown flex flex-col">
        <Navbar />
        <div className="flex-grow container mx-auto px-4 py-8 text-dark-brown dark:text-brown-superlight">
          <p>ไม่พบแบบทดสอบ</p>
        </div>
      </div>
    );
  }

  if (!quiz) return null;

  // ฟังก์ชันเลือกคำตอบในแต่ละข้อ
  const handleSelect = (option) => {
    const newSelected = [...selectedAnswers];
    newSelected[currentQuestion] = option;
    setSelectedAnswers(newSelected);
  };

  // คำนวณคะแนนเมื่อส่งคำตอบ
  const calculateScore = () => {
    let count = 0;
    quiz.questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.answer) {
        count++;
      }
    });
    setScore(count);
    return count;
  };

  const saveScoreToDb = async (finalScore) => {
    if (!uid) return;
    try {
      await saveQuizScore(uid, id, finalScore, quiz.questions.length, quiz.title);
      console.log("✅ บันทึกคะแนนลง MongoDB แล้ว");
    } catch (error) {
      console.error("❌ เกิดข้อผิดพลาดในการบันทึกคะแนน:", error);
    }
  };

  // ฟังก์ชันสำหรับปุ่มถัดไปหรือส่งคำตอบ
  const handleNext = () => {
    if (selectedAnswers[currentQuestion] === null) {
      alert("กรุณาเลือกคำตอบก่อน");
      return;
    }
    if (currentQuestion === quiz.questions.length - 1) {
      const finalScore = calculateScore();
      setShowScore(true);
      saveScoreToDb(finalScore);
    } else {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  // ฟังก์ชันสำหรับปุ่มย้อนกลับ
  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  // คำนวณเปอร์เซ็นต์ความคืบหน้า
  const progressPercent = Math.round(
    ((currentQuestion + 1) / quiz.questions.length) * 100
  );

  return (
    <div>
      <Navbar />
      <BackToTop />
      <div className="min-h-screen bg-[url('../public/background.jpg')] bg-cover bg-center bg-white/85 dark:bg-black/60 bg-blend-overlay flex flex-col items-center justify-center px-4">
        <div className="bg-beige-light dark:bg-[#2b2015] backdrop-blur-sm rounded-3xl shadow-xl p-8 w-full max-w-4xl relative mt-4 mb-3">
          {!showScore ? (
            <>
              <h2 className="text-center text-2xl md:text-3xl font-bold text-dark-brown dark:text-brown-superlight mb-4">
                {quiz.title}
              </h2>
              {/* Progress Bar */}
              <div className="mb-6">
                <div className="w-full bg-gray-200 dark:bg-white/10 rounded-full h-3">
                  <div
                    className="bg-dark-brown dark:bg-beige h-3 rounded-full transition-[width] duration-500 ease-smooth"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
                <p className="text-right text-sm text-dark-brown dark:text-brown-superlight mt-1">
                  {progressPercent}% (คำถาม {currentQuestion + 1} /{" "}
                  {quiz.questions.length})
                </p>
              </div>
              <div key={currentQuestion} className="mb-4 animate-fade-in-up">
                <p className="text-lg text-dark-brown dark:text-brown-superlight">
                  {quiz.questions[currentQuestion].question}
                </p>
              </div>
              <div key={`opts-${currentQuestion}`} className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in-up">
                {quiz.questions[currentQuestion].options.map(
                  (option, index) => (
                    <button
                      key={index}
                      onClick={() => handleSelect(option)}
                      className={`p-4 rounded-3xl transition-all duration-200 ease-smooth text-left font-medium border bg-white dark:bg-white/5 text-dark-brown dark:text-brown-superlight border-dark-brown dark:border-brown-superlight/30 hover:-translate-y-0.5 active:translate-y-0 active:scale-[.98] ${
                        selectedAnswers[currentQuestion] === option
                          ? "!bg-brown !text-beige shadow-md"
                          : "hover:bg-light-brown hover:text-beige hover:shadow-sm"
                      }`}
                    >
                      {option}
                    </button>
                  )
                )}
              </div>
              <div className="flex justify-between mt-6">
                {currentQuestion > 0 && (
                  <button
                    onClick={handleBack}
                    className="bg-dark-brown dark:bg-beige text-beige dark:text-dark-brown py-2 px-4 rounded-3xl hover:bg-brown dark:hover:bg-brown-superlight transition-all duration-200 ease-smooth active:scale-95"
                  >
                    ย้อนกลับ
                  </button>
                )}
                <button
                  onClick={handleNext}
                  disabled={selectedAnswers[currentQuestion] === null}
                  className="ml-auto bg-dark-brown dark:bg-beige text-beige dark:text-dark-brown py-2 px-4 rounded-3xl hover:bg-brown dark:hover:bg-brown-superlight transition-all duration-200 ease-smooth active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                >
                  {currentQuestion === quiz.questions.length - 1
                    ? "ส่งคำตอบ"
                    : "ถัดไป"}
                </button>
              </div>
            </>
          ) : (
            <div className="text-center animate-fade-in-up">
              <h1 className="text-2xl font-bold text-dark-brown dark:text-brown-superlight mb-4">
                คะแนนของคุณ: {score} / {quiz.questions.length} (
                {Math.round((score / quiz.questions.length) * 100)}%)
              </h1>
              {/* แสดงรายละเอียดคำตอบแต่ละข้อ */}
              <div className="text-left mt-6 ">
                {quiz.questions.map((q, idx) => {
                  const isCorrect = selectedAnswers[idx] === q.answer;
                  return (
                    <div
                      key={idx}
                      style={{ animationDelay: `${Math.min(idx, 8) * 60}ms` }}
                      className="mb-6 p-6 border border-gray-300 dark:border-brown-superlight/15 rounded-3xl bg-white dark:bg-white/5 shadow-md animate-fade-in-up"
                    >
                      <p className="font-bold text-dark-brown dark:text-brown-superlight text-lg">
                        {idx + 1}. {q.question}
                      </p>
                      <div className="mt-2">
                        <p className="text-dark-brown dark:text-brown-superlight">
                          คำตอบของคุณ:{" "}
                          <span
                            className={
                              isCorrect
                                ? "text-green-600 font-bold"
                                : "text-red-600 font-bold"
                            }
                          >
                            {selectedAnswers[idx]} {isCorrect ? "✓" : "✗"}
                          </span>
                        </p>
                        {!isCorrect && (
                          <p className="mt-1 text-dark-brown dark:text-brown-superlight">
                            คำตอบที่ถูกต้อง:{" "}
                            <span className="font-bold">{q.answer}</span>
                          </p>
                        )}
                      </div>
                      {q.explanation && (
                        <div className="mt-3 p-3 bg-beige-light/60 dark:bg-white/10 backdrop-blur-md rounded-md">
                          <p className="text-dark-brown dark:text-brown-superlight">
                            คำอธิบาย: {q.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              {/* ปุ่มแอคชั่นหลังแสดงคะแนนและเฉลย */}
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-6">
                {/* ปุ่มทำแบบทดสอบอีกครั้ง */}
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-2 bg-light-brown text-beige font-semibold rounded-full shadow-lg hover:shadow-xl hover:bg-brown hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-300 ease-smooth"
                >
                  ทำแบบทดสอบอีกครั้ง
                </button>
                {/* ปุ่มเสร็จสิ้น กลับหน้า /quiz */}
                <button
                  onClick={() => navigate("/quiz")}
                  className="px-6 py-2 bg-dark-brown dark:bg-beige text-beige dark:text-dark-brown font-semibold rounded-full shadow-lg hover:shadow-xl hover:bg-brown dark:hover:bg-brown-superlight hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-300 ease-smooth"
                >
                  เสร็จสิ้น
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizDetail;
