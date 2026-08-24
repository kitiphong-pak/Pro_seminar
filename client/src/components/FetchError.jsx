export default function FetchError({ onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-center px-4">
      <div className="text-5xl opacity-50">☕</div>
      <p className="text-[#5c4033] font-semibold text-lg">โหลดข้อมูลไม่สำเร็จ</p>
      <p className="text-sm text-[#5c4033]/60">ตรวจสอบการเชื่อมต่อ แล้วลองใหม่อีกครั้ง</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 rounded-full bg-[#7b4b29] text-white px-6 py-2 text-sm hover:opacity-90 transition"
        >
          ลองใหม่
        </button>
      )}
    </div>
  );
}
