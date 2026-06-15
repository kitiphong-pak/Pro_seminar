import { motion, AnimatePresence } from "framer-motion";
import { Fact, Pill, BadgeRow, SectionCard, EmptyLine, CloseBtn } from "./UIComponents";
import { InfoTip } from "./Tooltip";
import { analyzeSummary, labelGrind, labelBeanType } from "./utils";

export function SummaryModal({ data, onClose, imageUrl }) {
  const img = imageUrl || data?.imageUrl || "simulator/espresso-shot.png";
  const { good, issues, next } = analyzeSummary(data || {});

  const tTarget = data?.targetTimeSec ?? null;
  const tActual = data?.actualTimeSec ?? null;
  const tDelta = tTarget != null && tActual != null ? tActual - tTarget : null;
  const tDeltaTxt =
    tDelta == null ? "—" : tDelta === 0 ? "ตรงเป้า" : tDelta > 0 ? `+${tDelta} วิ` : `${tDelta} วิ`;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[60] grid place-items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onKeyDown={(e) => { if (e.key === "Escape") onClose?.(); }}
        tabIndex={-1}
      >
        <div className="absolute inset-0 bg-black/45" onClick={onClose} />

        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="summary-title"
          initial={{ y: 18, opacity: 0, scale: 0.98 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 12, opacity: 0, scale: 0.98 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
          className="relative z-[61] w-[min(1100px,96vw)] max-h-[90vh] overflow-hidden rounded-[24px] bg-white shadow-2xl ring-1 ring-black/5 flex flex-col"
        >
          <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white/95 backdrop-blur px-4 py-3">
            <div id="summary-title" className="font-semibold">สรุปผล</div>
            <CloseBtn onClick={onClose} />
          </div>

          <div className="overflow-auto px-4 md:px-6 py-5 space-y-6">
            <section aria-label="ภาพรวม">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-[24px] border border-neutral-200 bg-white p-4">
                  <div className="relative w-full overflow-hidden rounded-2xl bg-gradient-to-b from-neutral-50 to-neutral-100 aspect-[4/3] sm:aspect-[16/10]">
                    <img
                      src={img}
                      alt="ผลลัพธ์เครื่องดื่ม"
                      className="absolute inset-0 m-auto max-h-[95%] max-w-[95%] object-contain p-2"
                    />
                  </div>
                  <div className="mt-3">
                    <div className="text-2xl font-extrabold leading-tight">ชงสำเร็จ!</div>
                    {data?.headline && <div className="text-[#2a1c14]/80">{data.headline}</div>}
                    {data?.subline && <div className="text-xs text-[#2a1c14]/60">{data.subline}</div>}
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <Pill>สไตล์ {data?.intent ?? "-"}</Pill>
                      <Pill>ความเข้ม {data?.strength ?? "-"}</Pill>
                      <Pill>สัดส่วน 1:{data?.ratio ?? "-"}</Pill>
                    </div>
                  </div>
                </div>

                <div className="rounded-[24px] border border-neutral-200 bg-white p-4 md:p-5">
                  <h3 className="text-lg font-semibold text-[#7a4112] mb-3">ผลลัพธ์ที่ได้</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <Fact
                      label={<>เวลา (วิ)<InfoTip title="เวลา">เวลาตั้งแต่เริ่มไหลจนกดหยุด</InfoTip></>}
                      value={tActual != null ? `${tActual}` : "—"}
                      hint={`เป้าหมาย ${tTarget ?? "—"} • ${data?.timing ?? tDeltaTxt}`}
                    />
                    <Fact
                      label={<>สัดส่วน<InfoTip title="สัดส่วน (น้ำ:กาแฟ)">1:x ยิ่ง x มาก → ใส/เบา</InfoTip></>}
                      value={`1:${data?.ratio ?? "-"}`}
                    />
                    <Fact
                      label={<>ปริมาณ (มล.)<InfoTip title="ปริมาณ">ประมาณการผลลัพธ์ในถ้วย</InfoTip></>}
                      value={data?.yieldMl != null ? `${data?.yieldMl}` : "—"}
                    />
                    <Fact
                      label={<>TDS (ประมาณ)<InfoTip title="TDS">เปอร์เซ็นต์ของแข็งที่ละลาย</InfoTip></>}
                      value={data?.tdsPct != null ? `~${data.tdsPct}%` : "—"}
                    />
                    <Fact
                      label={<>การสกัด<InfoTip title="ระดับการสกัด">อ่อน/มาก/กำลังดี</InfoTip></>}
                      value={data?.extraction ?? "-"}
                    />
                    <Fact
                      label={<>คาเฟอีน<InfoTip title="คาเฟอีนโดยประมาณ">ขึ้นกับสายพันธุ์/โดส</InfoTip></>}
                      value={`${data?.caffeineMg ?? "-"} มก.`}
                    />
                    <Fact
                      label={<>แคลอรี<InfoTip title="แคลอรี">กาแฟดำ (ไม่ใส่น้ำตาล/นม)</InfoTip></>}
                      value={`${data?.caloriesKcal ?? "-"} kcal`}
                    />
                    <Fact
                      label={<>ไฟ (/10)<InfoTip title="ไฟ">เร่งอุณหภูมิ/แรงดัน</InfoTip></>}
                      value={data?.heatLevel != null ? `${data.heatLevel}` : "—"}
                    />
                  </div>
                </div>
              </div>
            </section>

            <div className="h-px bg-neutral-200/80" />

            <section aria-label="สิ่งที่ทำไป">
              <h3 className="text-lg font-semibold text-[#7a4112] mb-3">ข้อมูลที่ทำไป</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <BadgeRow label="วิธีชง" value={
                  data?.method === "espresso" ? "เอสเพรสโซ" :
                  data?.method === "drip" ? "ดริป" :
                  data?.method === "frenchpress" ? "เฟรนช์เพรส" : "โมก้าพอต"
                }/>
                <BadgeRow label="ชนิดเมล็ด" value={labelBeanType(data?.beanType, null) || data?.beanLabel || data?.beanType || "-"} />
                <BadgeRow label="เป้าหมายเวลา" value={tTarget != null ? `${tTarget} วิ` : "—"} />
              </div>
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <BadgeRow label="ปริมาณผงกาแฟ" value={`${data?.doseGram ?? "-"} กรัม`} />
                <BadgeRow label="น้ำ" value={`${data?.waterMl ?? "-"} มล.`} />
                <BadgeRow label="บด" value={labelGrind(data?.grind) ?? "-"} />
                <BadgeRow label="ไฟ" value={data?.heatLevel != null ? `${data.heatLevel}/10` : "—"} />
              </div>
            </section>

            <div className="h-px bg-neutral-200/80" />

            <section aria-label="คำแนะนำ">
              <h3 className="text-lg font-semibold text-[#7a4112] mb-3">คำแนะนำ</h3>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <SectionCard title="สิ่งที่ทำได้ดี">
                  {good?.length ? (
                    <ul className="list-inside list-disc space-y-1 text-sm">
                      {good.map((t, i) => <li key={i}>{t}</li>)}
                    </ul>
                  ) : <EmptyLine />}
                </SectionCard>

                <SectionCard title="จุดที่น่าปรับ" tone="warn">
                  {issues?.length ? (
                    <ul className="list-inside list-disc space-y-1 text-sm">
                      {issues.map((t, i) => <li key={i}>{t}</li>)}
                    </ul>
                  ) : <EmptyLine />}
                </SectionCard>

                <SectionCard title="แผนช็อตถัดไป">
                  {next?.length ? (
                    <ol className="list-inside list-decimal space-y-1 text-sm">
                      {next.map((t, i) => <li key={i}>{t}</li>)}
                    </ol>
                  ) : <EmptyLine />}
                </SectionCard>
              </div>
            </section>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
