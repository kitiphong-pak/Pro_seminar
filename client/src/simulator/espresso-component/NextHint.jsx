import { STEP_LABELS } from "./constants";
import { renderStepTip } from "./renderStepTip";
import { InfoTip } from "./Tooltip";

export function NextHint({ method, flow, requiredSteps, stepsForMethod, canStartBrew, isBrewing, targetTime, methodSpec }) {
  const labelOf = (id) => stepsForMethod?.find((s) => s.id === id)?.label || STEP_LABELS[id] || id;
  const nextId = (requiredSteps || []).find((id) => !flow?.[id]);

  let main = "", tipTitle = "", tipBodyNode = null;

  if (isBrewing) {
    main = `กำลังชง… เล็งหยุดที่ ~${targetTime} วิ`;
    tipTitle = "กำลังชง";
    tipBodyNode = (
      <div className="text-sm space-y-1.5">
        <div><b>ทำยังไง:</b> จับเวลาแล้วกด "หยุด" ใกล้เป้าหมาย</div>
        <div><b>ทิป:</b> เกินเป้าหมาย → เข้ม/ขม • ต่ำกว่าเป้า → ใส/เปรี้ยว</div>
      </div>
    );
  } else if (nextId) {
    main = `ขั้นตอนถัดไป: ${labelOf(nextId)}`;
    tipTitle = labelOf(nextId);
    tipBodyNode = renderStepTip(nextId);
  } else if (canStartBrew) {
    main = "พร้อมเริ่มชงแล้ว";
    tipTitle = "เริ่มชง";
    tipBodyNode = (
      <div className="text-sm space-y-1.5">
        <div><b>ทำยังไง:</b> กด "ตั้งไฟ / เริ่ม" ให้ระบบจับเวลา</div>
        <div><b>ทิป:</b> ตั้งเป้าเวลาให้เหมาะกับเมธอดเพื่อรสที่ตั้งใจ</div>
      </div>
    );
  } else {
    main = "ตั้งค่าวัตถุดิบให้ครบก่อนเริ่ม";
    tipTitle = "ต้องทำอะไรบ้าง";
    tipBodyNode = (
      <div className="text-sm space-y-1.5">
        <div>เลือกบด/โดสกาแฟ เติมน้ำ (อย่าเกินวาล์ว) และประกอบชิ้นส่วนตามลำดับ</div>
        <div>ครบแล้วปุ่มเริ่มจะพร้อมใช้งาน</div>
      </div>
    );
  }

  return (
    <div className="mb-2 rounded-xl border border-amber-200 bg-amber-50/60 backdrop-blur px-3 py-1">
      <div className="text-sm font-medium inline-flex items-center gap-1 text-[#7a4112]">
        {main}
        <InfoTip title={tipTitle}>{tipBodyNode}</InfoTip>
      </div>
    </div>
  );
}
