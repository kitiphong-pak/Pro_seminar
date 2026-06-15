import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BackToTop from "../components/BackToTop";
import quiz from "../data/quiz.json";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useNavigate } from 'react-router-dom';

const quizData = quiz;

const QuizDetail = () => {
  const { id } = useParams();
  const quiz = quizData[id];
  const { user } = useAuth();
  const uid = user?.uid ?? null;
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState(
    new Array(quiz?.questions.length).fill(null)
  );
  const [showScore, setShowScore] = useState(false);
  const [score, setScore] = useState(0);


  if (!quiz) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow container mx-auto px-4 py-8">
          <p>ไม่พบแบบทดสอบ</p>
        </div>
        <Footer />
      </div>
    );
  }

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

  // ฟังก์ชันบันทึกคะแนนลง Firestore
  const saveScoreToFirestore = async (finalScore) => {
    if (!uid) {
      console.error("ผู้ใช้ยังไม่ได้ล็อกอิน");
      return;
    }
    try {
      await setDoc(
        doc(db, "users", uid, "quiz", id),
        {
          score: finalScore,
          max: quiz.questions.length, // จำนวนคำถามทั้งหมด
          title: quiz.title, // ชื่อแบบทดสอบ
        },
        { merge: true }
      );
      console.log(
        "✅ บันทึกคะแนน จำนวนคำถาม และชื่อแบบทดสอบลง Firestore แล้ว!"
      );
    } catch (error) {
      console.error("❌ เกิดข้อผิดพลาดในการบันทึกคะแนน: ", error);
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
      saveScoreToFirestore(finalScore);
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
      <div className="min-h-screen bg-[url('../public/background.jpg')] bg-cover bg-center bg-white/85 bg-blend-overlay flex flex-col items-center justify-center px-4">
        <div className="bg-beige-light backdrop-blur-sm rounded-3xl shadow-xl p-8 w-full max-w-4xl relative mt-4 mb-3">
          {!showScore ? (
            <>
              <h2 className="text-center text-2xl md:text-3xl font-bold text-dark-brown mb-4">
                {quiz.title}
              </h2>
              {/* Progress Bar */}
              <div className="mb-6">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-dark-brown h-3 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
                <p className="text-right text-sm text-dark-brown mt-1">
                  {progressPercent}% (คำถาม {currentQuestion + 1} /{" "}
                  {quiz.questions.length})
                </p>
              </div>
              <div className="mb-4">
                <p className="text-lg text-dark-brown">
                  {quiz.questions[currentQuestion].question}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {quiz.questions[currentQuestion].options.map(
                  (option, index) => (
                    <button
                      key={index}
                      onClick={() => handleSelect(option)}
                      className={`p-4 rounded-3xl transition-colors text-left font-medium border bg-white text-dark-brown border-dark-brown ${
                        selectedAnswers[currentQuestion] === option
                          ? "!bg-brown !text-beige"
                          : "hover:bg-light-brown hover:text-beige"
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
                    className="bg-dark-brown text-beige py-2 px-4 rounded-3xl hover:bg-brown transition-colors"
                  >
                    ย้อนกลับ
                  </button>
                )}
                <button
                  onClick={handleNext}
                  disabled={selectedAnswers[currentQuestion] === null}
                  className="ml-auto bg-dark-brown text-beige py-2 px-4 rounded-3xl hover:bg-brown transition-colors disabled:opacity-50"
                >
                  {currentQuestion === quiz.questions.length - 1
                    ? "ส่งคำตอบ"
                    : "ถัดไป"}
                </button>
              </div>
            </>
          ) : (
            <div className="text-center">
              <h1 className="text-2xl font-bold text-dark-brown mb-4">
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
                      className="mb-6 p-6 border border-gray-300 rounded-3xl bg-white shadow-md"
                    >
                      <p className="font-bold text-dark-brown text-lg">
                        {idx + 1}. {q.question}
                      </p>
                      <div className="mt-2">
                        <p className="text-dark-brown">
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
                          <p className="mt-1 text-dark-brown">
                            คำตอบที่ถูกต้อง:{" "}
                            <span className="font-bold">{q.answer}</span>
                          </p>
                        )}
                      </div>
                      {q.explanation && (
                        <div className="mt-3 p-3 bg-beige-light/60 backdrop-blur-md rounded-md">
                          <p className="text-dark-brown">
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
                  className="px-6 py-2 bg-light-brown text-beige font-semibold rounded-full shadow-lg hover:shadow-xl hover:bg-brown transition-all duration-300"
                >
                  ทำแบบทดสอบอีกครั้ง
                </button>
                {/* ปุ่มเสร็จสิ้น กลับหน้า /quiz */}
                <button
                  onClick={() => navigate("/quiz")}
                  className="px-6 py-2 bg-dark-brown text-beige font-semibold rounded-full shadow-lg hover:shadow-xl hover:bg-brown transition-all duration-300"
                >
                  เสร็จสิ้น
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default QuizDetail;
