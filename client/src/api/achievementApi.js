import { updateAchievement } from "./userApi";

/**
 * อัปเดตค่าความสำเร็จของผู้ใช้ใน MongoDB
 * @param {string} userId - id ของผู้ใช้
 * @param {string} category - "simulator" | "content" | "knowledge"
 * @param {string} achievementId - เช่น "espresso", "history_coffee"
 * @param {boolean} status
 */
export async function updateUserAchievement(userId, category, achievementId, status = true) {
  if (!userId) {
    console.error("❌ ไม่มี userId ไม่สามารถบันทึกได้");
    return;
  }
  try {
    await updateAchievement(userId, category, achievementId, status);
    console.log(`✅ อัปเดตความสำเร็จ: ${category}/${achievementId}`);
  } catch (error) {
    console.error("❌ เกิดข้อผิดพลาด:", error);
  }
}
