import { useEffect, useMemo, useRef, useState, lazy, Suspense } from "react";
import Navbar from "../components/Navbar";
import { EquipmentPaletteImages, GuideOverlay } from "./Espresso-method/moka";

import { BASE_FLAVOR_INTENTS, FALLBACK_WORKFLOWS, loadMokaSpec } from "./espresso-component/constants";
import { methodLabel, grindOptionsFor, grindLabel, guideSteps, analyzeSummary } from "./espresso-component/utils";
import { makeSummaryForUser } from "./espresso-component/summary";
import { Label, Card, Slider, Toggle, FlavorSelect, HeaderChipButton } from "./espresso-component/UIComponents";
import { InfoTip } from "./espresso-component/Tooltip";
import { SummaryModal } from "./espresso-component/SummaryModal";
import { NextHint } from "./espresso-component/NextHint";
import { RecipeCoach } from "./espresso-component/RecipeCoach";

const MokaInteractive        = lazy(() => import("./Espresso-method/moka"));
const EspressoInteractive    = lazy(() => import("./Espresso-method/espresso"));
const DripInteractive        = lazy(() => import("./Espresso-method/drip"));
const FrenchPressInteractive = lazy(() => import("./Espresso-method/frenchpress"));

export default function BrewSimulator() {
  const [recipeId, setRecipeId] = useState(null);
  const [recipe, setRecipe]     = useState(null);
  const [method, setMethod]     = useState("moka");
  const [intent, setIntent]     = useState("balanced");

  const [mokaSpec, setMokaSpec] = useState(null);
  useEffect(() => {
    if (method === "moka" && !mokaSpec) loadMokaSpec().then(setMokaSpec);
  }, [method, mokaSpec]);

  const INTENT_OPTIONS = useMemo(() => {
    if (method === "moka" && mokaSpec?.flavorGuides) {
      return Object.entries(mokaSpec.flavorGuides).map(([id, g]) => ({ id, label: g?.label || id }));
    }
    return BASE_FLAVOR_INTENTS;
  }, [method, mokaSpec]);

  const [assembly, setAssembly] = useState({ base: false, funnel: false, top: false });
  const isAssembled = useMemo(() => assembly.base && assembly.funnel && assembly.top, [assembly]);

  const [grind, setGrind]           = useState("medium-fine");
  const [dose, setDose]             = useState(0);
  const [water, setWater]           = useState(0);
  const [heat, setHeat]             = useState(6);
  const [targetTime, setTargetTime] = useState(110);
  const [preheat, setPreheat]       = useState(false);
  const [overpack, setOverpack]     = useState(false);
  const [cupPreheated, setCupPreheated] = useState(false);
  const [beanType, setBeanType]     = useState("arabica");

  useEffect(() => {
    try {
      const rid = localStorage.getItem("recipeId");
      const m   = localStorage.getItem("brewingMethod") || "moka";
      const bt  = localStorage.getItem("beanType")      || "arabica";
      const rec = JSON.parse(localStorage.getItem("recipe") || "null");
      // ถ้า user เคยเลือก intent ไว้ใช้อัน นั้น ไม่งั้นใช้ defaultFlavorIntent ของเมนู
      const fi  = localStorage.getItem("flavorIntent") || rec?.defaultFlavorIntent || "balanced";
      setRecipeId(rid || null);
      setRecipe(rec);
      setMethod(m);
      setIntent(fi);
      setBeanType(bt);
    } catch {}
  }, []);

  useEffect(() => {
    const v   = recipe?.methodProfiles?.[method]?.variables;
    const avg = (arr) => Array.isArray(arr) ? Math.round((arr[0] + arr[arr.length - 1]) / 2) : null;

    if (method === "espresso") {
      setTargetTime(avg(v?.time_s) ?? 28);
      setGrind("fine");
      setHeat((h) => Math.max(6, h));
      if (dose === 0)  setDose(avg(v?.dose_g)   ?? 18);
      if (water === 0) setWater(avg(v?.water_ml) ?? 36);
    } else if (method === "drip") {
      setTargetTime(avg(v?.total_time_s) ?? 190);
      setGrind("medium-coarse");
      if (dose === 0)  setDose(avg(v?.dose_g)   ?? 16);
      if (water === 0) setWater(avg(v?.water_ml) ?? 300);
    } else if (method === "frenchpress") {
      setTargetTime(avg(v?.immersion_time_s) ?? 240);
      setGrind("coarse");
      if (dose === 0)  setDose(avg(v?.dose_g)   ?? 18);
      if (water === 0) setWater(avg(v?.water_ml) ?? 320);
    } else {
      setTargetTime(avg(v?.time_s) ?? 110);
      if (grind !== "medium-fine" && grind !== "fine") setGrind("medium-fine");
      if (dose === 0)  setDose(avg(v?.dose_g)   ?? 17);
      if (water === 0) setWater(avg(v?.water_ml) ?? 105);
    }
    setIsBrewing(false); setProgress(0); setElapsedMs(0); setPressure(0);
    setAssembly({ base: false, funnel: false, top: false });
    setFlow((prev) => Object.fromEntries(Object.keys(prev || {}).map(k => [k, false])));
  }, [method, recipe]);

  const [isBrewing, setIsBrewing]   = useState(false);
  const [progress, setProgress]     = useState(0);
  const [temp, setTemp]             = useState(25);
  const [pressure, setPressure]     = useState(0);
  const [elapsedMs, setElapsedMs]   = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [brewResult, setBrewResult] = useState(null);
  const [summary, setSummary]       = useState(null);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);


  const workflowForMethod = useMemo(() => {
    if (method === "moka" && mokaSpec?.workflow) return mokaSpec.workflow;
    return FALLBACK_WORKFLOWS[method] ?? { steps: [], requiresToStart: [] };
  }, [method, mokaSpec]);

  const [flow, setFlow] = useState({});
  useEffect(() => {
    const init = Object.fromEntries((workflowForMethod.steps ?? []).map((s) => [s.id, false]));
    setFlow(init);
    setAssembly({ base: false, funnel: false, top: false });
  }, [workflowForMethod]);

  const SAFETY_VALVE_ML = useMemo(() => (
    method === "moka" ? (mokaSpec?.ingredients?.safetyValveMl ?? 120) : 120
  ), [method, mokaSpec]);

  const waterReady  = method === "moka" ? !!flow.fill_water : (water > 0 && water < SAFETY_VALVE_ML);
  const coffeeReady = method === "moka" ? !!flow.add_coffee  : dose > 0;

  const requiredSteps  = workflowForMethod.requiresToStart ?? [];
  const stepsForMethod = workflowForMethod.steps ?? [];

  const intervalRef = useRef(null);
  const startAtRef  = useRef(null);
  const elapsedRef  = useRef(0);

  useEffect(() => () => intervalRef.current && clearInterval(intervalRef.current), []);

  useEffect(() => {
    if (method !== "moka" && water > 0) markFlow("fill_water", true);
  }, [method, water]);

  useEffect(() => {
    if (method !== "moka" && dose > 0) {
      if (method === "espresso") markFlow("dose", true);
      else markFlow("add_coffee", true);
    }
  }, [method, dose]);

  useEffect(() => {
    if (method === "moka") {
      if (assembly.base)   markFlow("place_base",    true);
      if (assembly.funnel) markFlow("insert_funnel", true);
      if (assembly.top)    markFlow("attach_top",    true);
    }
  }, [method, assembly]);

  useEffect(() => {
    if (preheat && (method === "espresso" || method === "frenchpress")) markFlow("preheat", true);
  }, [method, preheat]);

  const equipmentTokens = useMemo(() => {
    if (method === "moka" && mokaSpec?.equipmentTokens) return mokaSpec.equipmentTokens;
    const wf = FALLBACK_WORKFLOWS[method];
    if (!wf?.steps) return [];
    return wf.steps
      .filter((s) => ["place_base","insert_funnel","attach_top","lock_in","place_cup","rinse_filter","preheat"].includes(s.id))
      .map((s) => ({ id: s.id, label: s.label, map: null }));
  }, [method, mokaSpec]);

  const handlePlaceToken = (id) => {
    if (method !== "moka" || !mokaSpec?.assemblyMap?.[id]) { markFlow(id, true); return; }
    const key = mokaSpec.assemblyMap[id];
    const can = { base: true, funnel: assembly.base && waterReady, top: assembly.base && assembly.funnel && coffeeReady };
    if (!can[key]) return;
    markFlow(id, true);
    setAssembly(prev => ({ ...prev, [key]: true }));
  };

  const [guideOpen, setGuideOpen] = useState(false);
  const [guideStep, setGuideStep] = useState(0);
  const steps = useMemo(() => guideSteps(method, intent), [method, intent]);
  useEffect(() => { setGuideOpen(true); setGuideStep(0); }, [method]);

  const markFlow     = (id, done = true) => setFlow((prev) => ({ ...prev, [id]: !!done }));
  const canStartBrew = requiredSteps.every((id) => flow[id]);

  const BEAN_OPTIONS = useMemo(() => {
    const specOpts = method === "moka" ? mokaSpec?.ingredients?.beanOptions : null;
    if (Array.isArray(specOpts) && specOpts.length) return specOpts;
    return [{ id: "arabica", label: "อาราบิก้า" }, { id: "robusta", label: "โรบัสต้า" }];
  }, [method, mokaSpec]);

  const startBrew = () => {
    setSummary(null);
    if (!canStartBrew) return;
    if (water <= 0) return;
    if (method === "moka" && water >= SAFETY_VALVE_ML) return;
    if (dose <= 0)  return;
    if (method === "moka" && !isAssembled) return;

    setIsBrewing(true);
    setElapsedMs(0);
    startAtRef.current = Date.now();
    elapsedRef.current = 0;
    setIsFinished(false);
    setBrewResult(null);

    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      const now     = Date.now();
      const elapsed = (now - startAtRef.current) / 1000;
      elapsedRef.current = elapsed;
      setElapsedMs(Math.round(elapsed * 1000));

      const p = Math.min(140, Math.round((elapsed / Math.max(1, targetTime)) * 100));
      setProgress(Math.min(100, p));

      const heatFactor  = heat / 10;
      const startT      = preheat ? 65 : 25;
      const targetT     = method === "espresso" ? 93 : 92 + (heat > 8 ? 3 : 0);
      const k           = (preheat ? 0.8 : 0.5) * heatFactor;
      const curTemp     = Math.min(targetT, startT + (targetT - startT) * (1 - Math.exp(-k * elapsed)));

      let flowResistance = 1.0;
      if (grind === "fine")        flowResistance += 0.45;
      if (grind === "medium-fine") flowResistance += 0.25;
      if (overpack) flowResistance += 0.35;
      const maxBar      = method === "espresso" ? 9.0 : 3.0;
      const curPressure = Math.max(0, Math.min(maxBar, ((curTemp - 70) / 10) * heatFactor * flowResistance));

      setTemp(curTemp);
      setPressure(curPressure);
    }, 100);
  };

  const stopBrew = () => finishBrew();

  const finishBrew = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsBrewing(false);

    const actualSec = Math.round(elapsedRef.current || 0);
    setElapsedMs(actualSec * 1000);
    const tol = Math.max(5, Math.round(targetTime * 0.08));
    let timing = "ตรงเวลา";
    if (actualSec < targetTime - tol) timing = "เร็วกว่ากำหนด";
    else if (actualSec > targetTime + tol) timing = "ช้ากว่ากำหนด";

    const summaryObj = makeSummaryForUser(
      { method, intent, grind, dose, water, heat, targetTime, actualTimeSec: actualSec, preheat, overpack, cupPreheated, beanType },
      mokaSpec
    );
    const insight = analyzeSummary(summaryObj);
    setSummary({ ...summaryObj, ...insight });
    setIsSummaryOpen(true);

    setBrewResult({ totalSeconds: actualSec, yieldMl: summaryObj.yieldMl, grind, dose, notes: timing });
    setIsFinished(true);
  };

  const toggleWater = () => {
    if (method !== "moka") { markFlow("fill_water", true); return; }
    if (!assembly.base) return;
    setFlow(prev => {
      const next = !prev.fill_water;
      if (next) return { ...prev, fill_water: true };
      setAssembly(a => ({ ...a, funnel: false, top: false }));
      return { ...prev, fill_water: false, add_coffee: false, attach_top: false, insert_funnel: false };
    });
  };

  const toggleCoffee = () => {
    if (method !== "moka") { markFlow("add_coffee", true); return; }
    if (!assembly.base || !waterReady || !assembly.funnel) return;
    setFlow(prev => {
      const next = !prev.add_coffee;
      if (next) return { ...prev, add_coffee: true };
      setAssembly(a => ({ ...a, top: false }));
      return { ...prev, add_coffee: false, attach_top: false };
    });
  };

  const waterBtnClass = `px-3 py-1.5 rounded-full border text-sm shrink-0 transition-colors ${
    method === "moka" && waterReady
      ? "bg-[#6f4e37] text-white border-[#6f4e37] hover:bg-[#5b3e2c]"
      : "bg-white text-[#2a1c14] border-amber-300 hover:bg-amber-50"
  }`;

  const coffeeBtnClass = `px-3 py-1.5 rounded-full border text-sm shrink-0 transition-colors ${
    method === "moka" && coffeeReady
      ? "bg-[#6f4e37] text-white border-[#6f4e37] hover:bg-[#5b3e2c]"
      : "bg-white text-[#2a1c14] border-neutral-300 hover:bg-neutral-50"
  } ${method === "moka" && !assembly.funnel ? "opacity-50 cursor-not-allowed" : ""}`;

  const resetAll = () => {
    try { clearInterval(intervalRef.current); } catch {}
    setIsBrewing(false); setIsFinished(false); setBrewResult(null); setIsSummaryOpen(false);
    setGuideStep(0); setGuideOpen(true);
    setElapsedMs(0); setProgress(0); setTemp(25); setPressure(0);
    setAssembly({ base: false, funnel: false, top: false });
    setFlow((prev) => Object.fromEntries(Object.keys(prev || {}).map(k => [k, false])));
    setDose(0); setWater(0);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden w-full text-[#2a1c14] bg-amber-50/80">
      <Navbar />

      <main className="flex-1 min-h-0 flex flex-col overflow-hidden mx-auto w-full max-w-[1980px] px-4 md:px-6 py-2">
        <header className="shrink-0 mb-3 mt-2 flex items-center justify-between gap-3 flex-wrap">
          <h1 className="text-[32px] font-extrabold text-[#7a4112] leading-none">
            {recipeId ? `${recipeId} — ` : ""}
            {methodLabel(method)} Simulator
          </h1>

          <div className="flex items-center flex-wrap gap-2">
            <span className="text-xs text-[#3e2a1f]/70">รสชาติ:</span>
            <FlavorSelect
              value={intent}
              onChange={(e) => { setIntent(e.target.value); localStorage.setItem("flavorIntent", e.target.value); }}
              options={INTENT_OPTIONS}
            />
            <HeaderChipButton onClick={() => setGuideOpen(true)}>
              <span className="text-[#845f45]">📖</span> คู่มือ
            </HeaderChipButton>
            <HeaderChipButton onClick={() => setIsSummaryOpen(true)}>
              <span className="text-[#845f45]">📊</span> สรุป
            </HeaderChipButton>
          </div>
        </header>

        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3 overflow-hidden">
          {/* ซ้าย: โค้ช + คลังอุปกรณ์ */}
          <section className="lg:col-span-3 flex flex-col gap-3 overflow-hidden">
            <Card
              title="เมนู & แนวรสชาติ"
              action={<span className="text-xs text-[#2a1c14]/60">{INTENT_OPTIONS.find((x) => x.id === intent)?.label || "แนวรสชาติ"}</span>}
            >
              <RecipeCoach
                recipe={recipe}
                method={method}
              />
            </Card>

            <Card title="อุปกรณ์ (ลากไปวางที่ภาพจำลอง)">
              <EquipmentPaletteImages tokens={equipmentTokens} onQuickPlace={handlePlaceToken} />
            </Card>
          </section>

          {/* กลาง: อุปกรณ์จำลอง */}
          <section className="lg:col-span-6 min-h-0 overflow-hidden flex flex-col">
            <Card
              title={`${methodLabel(method)} — ภาพจำลอง`}
              className="flex-1 min-h-0 relative"
              action={
                <NextHint
                  method={method}
                  flow={flow}
                  requiredSteps={requiredSteps}
                  stepsForMethod={stepsForMethod}
                  canStartBrew={canStartBrew}
                  isBrewing={isBrewing}
                  targetTime={targetTime}
                  methodSpec={method === "moka" ? mokaSpec : null}
                />
              }
            >
              <Suspense fallback={<div className="p-6 text-sm">กำลังโหลดอุปกรณ์…</div>}>
                {method === "moka" && (
                  <MokaInteractive
                    progress={progress} pressure={pressure} temp={temp}
                    heat={heat} setHeat={setHeat} onHeatChange={setHeat}
                    assembly={assembly} setAssembly={setAssembly} isAssembled={isAssembled}
                    isBrewing={isBrewing} onStart={startBrew} onStop={stopBrew}
                    spec={mokaSpec || undefined} onFlowMark={(id) => markFlow(id, true)}
                    elapsedMs={elapsedMs} targetTime={targetTime}
                    waterFilled={waterReady} coffeeFilled={coffeeReady}
                    isFinished={isFinished} onReset={resetAll} brewResult={brewResult}
                  />
                )}
                {method === "espresso" && (
                  <EspressoInteractive
                    progress={progress} pressure={pressure} temp={temp}
                    isBrewing={isBrewing} onStart={startBrew} onStop={stopBrew}
                  />
                )}
                {method === "drip" && (
                  <DripInteractive
                    progress={progress} temp={temp}
                    isBrewing={isBrewing} onStart={startBrew} onStop={stopBrew}
                  />
                )}
                {method === "frenchpress" && (
                  <FrenchPressInteractive
                    progress={progress} temp={temp}
                    isBrewing={isBrewing} onStart={startBrew} onStop={stopBrew}
                  />
                )}
              </Suspense>
            </Card>
          </section>

          {/* ขวา: วัตถุดิบ */}
          <section className="lg:col-span-3 flex flex-col gap-3 overflow-hidden">
            <Card
              title="โซนกาแฟ"
              action={
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#2a1c14]/70">ชนิดกาแฟ:</span>
                  <select
                    value={beanType}
                    onChange={(e) => { setBeanType(e.target.value); localStorage.setItem("beanType", e.target.value); }}
                    className="rounded-xl border px-2.5 py-1.5 bg-white text-sm shrink-0"
                    aria-label="ชนิดกาแฟ"
                  >
                    {BEAN_OPTIONS.map((opt) => (
                      <option key={opt.id} value={opt.id}>{opt.label || opt.id}</option>
                    ))}
                  </select>
                </div>
              }
            >
              <div className="mt-1">
                <div className="flex items-center justify-between gap-2">
                  <Label>ความละเอียดบด</Label>
                  <InfoTip title="ความละเอียดบดคืออะไร?">
                    ยิ่งบด "ละเอียด" น้ำไหลยาก → เวลาไหลยาวขึ้น รสเข้ม/หนา<br/>
                    ยิ่งบด "หยาบ"  น้ำไหลง่าย → เวลาไหลสั้น รสบาง/ใส<br/><br/>
                    เริ่มจากค่าที่แนะนำของแต่ละวิธี แล้วค่อยปรับทีละครึ่งสเต็ปครับ
                  </InfoTip>
                </div>

                <div role="radiogroup" aria-label="เลือกระดับความละเอียดของการบด" className="mt-1.5 grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {grindOptionsFor(method, mokaSpec).map((g) => {
                    const active = grind === g;
                    return (
                      <button
                        key={g} role="radio" aria-checked={active} onClick={() => setGrind(g)}
                        className={"w-full px-2 py-1.5 rounded-xl border text-sm transition " + (
                          active
                            ? "bg-[#6f4e37]/10 border-[#6f4e37] text-[#6f4e37] font-medium"
                            : "border-neutral-300 hover:border-neutral-400 text-[#2a1c14]"
                        )}
                      >
                        {grindLabel(g)}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-3">
                <Slider
                  label={`ปริมาณกาแฟ — ${dose} กรัม`}
                  min={method === "moka" ? (mokaSpec?.ingredients?.dose?.min ?? 12) : 12}
                  max={method === "moka" ? (mokaSpec?.ingredients?.dose?.max ?? 22) : 22}
                  step={0.5} value={dose} onChange={(v) => setDose(v)}
                />
                <div className="mt-2">
                  {method === "espresso" ? (
                    <button
                      onClick={() => markFlow("tamp", true)}
                      className="px-3 py-1.5 rounded-full border border-amber-300 text-sm bg-white hover:bg-amber-50"
                    >
                      ทำเครื่องหมายว่า "แทมป์แล้ว"
                    </button>
                  ) : (
                    <button
                      onClick={toggleCoffee} className={coffeeBtnClass}
                      disabled={method === "moka" && !assembly.funnel}
                      aria-pressed={method === "moka" && coffeeReady}
                    >
                      {method === "moka" ? (coffeeReady ? "เทผงกาแฟออก" : "ใส่ผงกาแฟ") : "ใส่ผงกาแฟ"}
                    </button>
                  )}
                </div>
              </div>
            </Card>

            <Card title="โซนน้ำ">
              <Slider
                label={`ปริมาณน้ำ — ${water} มล.`}
                min={method === "espresso" ? 25 : method === "moka" ? (mokaSpec?.ingredients?.water?.min ?? 80) : 80}
                max={method === "espresso" ? 60 : method === "moka" ? (mokaSpec?.ingredients?.water?.max ?? 130) : 130}
                step={1} value={water} onChange={(v) => setWater(v)}
              />
              {method !== "espresso" && (
                <div className="mt-2 flex items-center justify-between gap-3">
                  <button onClick={toggleWater} className={waterBtnClass} aria-pressed={method === "moka" && waterReady}>
                    {method === "moka" ? (waterReady ? "เทน้ำออก" : "เติมน้ำ") : "เติมน้ำ"}
                  </button>
                  <div className="shrink-0">
                    <Toggle
                      checked={preheat}
                      onChange={(v) => setPreheat(v)}
                      label={
                        <span className="inline-flex items-center gap-1 whitespace-nowrap">
                          พรีฮีตน้ำ/อุปกรณ์
                          <InfoTip title="พรีฮีตน้ำ/อุปกรณ์คืออะไร?">
                            อุ่นน้ำและอุปกรณ์ให้ร้อนก่อนเริ่มชง เพื่อลดการสูญเสียความร้อนช่วงแรก
                            ทำให้การสกัดเสถียรขึ้น รสสะอาดขึ้น และเวลาไหลใกล้เคียงเป้าที่ตั้งไว้มากขึ้น
                            <br /><br />
                            <b>เมื่อควรเปิด:</b> ต้องการความนิ่งของรส/เวลา โดยเฉพาะเมื่อใช้น้ำเย็นหรืออุณหภูมิห้องต่ำ
                            <br />
                            <b>ข้อควรระวัง:</b> ถ้าไฟแรงมากอยู่แล้ว อาจทำให้ไหลเร็วขึ้นเล็กน้อย—ปรับไฟลดลง 0.5–1 ระดับได้
                          </InfoTip>
                        </span>
                      }
                    />
                  </div>
                </div>
              )}
            </Card>

            <Card title="ตัวเลือกเพิ่มเติม">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <Toggle
                  checked={overpack} onChange={setOverpack}
                  label={
                    <span className="inline-flex items-center gap-1 whitespace-nowrap">
                      อัดผงกาแฟ
                      <InfoTip title="อัดผงกาแฟคืออะไร?">
                        กดผงกาแฟแน่นกว่าปกติให้แน่นและต้านแรงไหลมากขึ้น
                        ทำให้ไหลช้าลงและรสเข้มหนาขึ้น แต่เสี่ยง "ขม/ไหม้" ถ้ามากเกินไป
                      </InfoTip>
                    </span>
                  }
                />
                <Toggle
                  checked={cupPreheated} onChange={setCupPreheated}
                  label={
                    <span className="inline-flex items-center gap-1 whitespace-nowrap">
                      อุ่นแก้วก่อนเสิร์ฟ
                      <InfoTip title="ทำไมต้องอุ่นแก้ว?">
                        แก้วที่อุ่นช่วยรักษาอุณหภูมิเครื่องดื่มให้คงที่นานขึ้น
                        ลดการสูญเสียความร้อนทันทีที่ชงเสร็จ ทำให้รสชาติสมดุลขึ้น
                      </InfoTip>
                    </span>
                  }
                />
              </div>

              {method === "espresso" && (
                <div className="mt-3">
                  <button
                    onClick={() => markFlow("lock_in", true)}
                    className="mr-2 px-3 py-1.5 rounded-full border text-sm bg-white hover:bg-neutral-50"
                  >
                    ล็อกพอร์ตาฯ
                  </button>
                  <button
                    onClick={() => markFlow("place_cup", true)}
                    className="px-3 py-1.5 rounded-full border text-sm bg-white hover:bg-neutral-50"
                  >
                    วางแก้ว
                  </button>
                </div>
              )}
            </Card>
          </section>
        </div>
      </main>

      {isSummaryOpen && (
        <SummaryModal
          data={summary}
          onClose={() => setIsSummaryOpen(false)}
          imageUrl="./public/simulator/เอสเพรสโซ.png"
        />
      )}

      <GuideOverlay
        open={guideOpen}
        onClose={() => setGuideOpen(false)}
        step={guideStep}
        onNext={() => setGuideStep((s) => Math.min(s + 1, steps.length - 1))}
        onPrev={() => setGuideStep((s) => Math.max(s - 1, 0))}
        steps={steps}
      />
    </div>
  );
}
