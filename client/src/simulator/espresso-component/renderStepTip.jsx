import { STEP_LABELS, STEP_HINTS } from "./constants";

export function renderStepTip(id) {
  const L = STEP_LABELS[id] || id;
  const H = STEP_HINTS[id] || {};
  return (
    <div className="space-y-1.5">
      <div className="font-medium">{L}</div>
      {H.how   && <div className="text-sm"><b>ทำยังไง:</b> {H.how}</div>}
      {H.why   && <div className="text-sm"><b>ทำไม:</b> {H.why}</div>}
      {H.doNow && <div className="text-sm"><b>ทำตอนนี้:</b> {H.doNow}</div>}
    </div>
  );
}
