import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { OAuth2Client } from "google-auth-library";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT            = process.env.PORT            || 3001;
const MONGO_URI       = process.env.MONGO_URI       || "mongodb://localhost:27017/coffebeandb";
const JWT_SECRET      = process.env.JWT_SECRET;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not set. Add it to server/.env before starting the server.");
}

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

app.use(cors({ origin: "*" }));
app.use(express.json());

// ─── Avatar uploads — stored as a base64 data URI directly on the user document ──
// (Render's local disk is ephemeral; this avoids needing a separate file-storage service)
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 2 * 1024 * 1024 } });

// ─── MongoDB ──────────────────────────────────────────────────────────────────
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB connected:", MONGO_URI))
  .catch((err) => { console.error("MongoDB error:", err); process.exit(1); });

const Mixed = mongoose.Schema.Types.Mixed;

const userSchema = new mongoose.Schema({
  uid:          { type: String, required: true, unique: true },
  name:         String,
  displayName:  String,
  email:        { type: String, required: true, unique: true },
  passwordHash: String,
  photoURL:     String,
  lastLogin:    Date,
  createdAt:    { type: Date, default: Date.now },
  achievements: {
    simulator: { type: Mixed, default: {} },
    content:   { type: Mixed, default: {} },
    knowledge: { type: Mixed, default: {} },
  },
  quizScores: { type: Mixed, default: {} },
});

const User = mongoose.model("User", userSchema);

const toPublic = (user) => ({
  uid:          user.uid,
  name:         user.name,
  displayName:  user.displayName || user.name,
  email:        user.email,
  photoURL:     user.photoURL || null,
  achievements: user.achievements,
  quizScores:   user.quizScores,
  createdAt:    user.createdAt,
});

// ─── Auth ─────────────────────────────────────────────────────────────────────

app.post("/api/auth/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: "กรุณากรอกข้อมูลให้ครบ" });
  // ต้องตรงกับกฎฝั่ง client (Login.jsx / SignUp.jsx) — กันการสมัครผ่าน API ตรง ๆ
  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(String(password)))
    return res.status(400).json({
      error: "รหัสผ่านต้องมีอย่างน้อย 8 ตัว ประกอบด้วยตัวพิมพ์ใหญ่ ตัวพิมพ์เล็ก และตัวเลข",
    });
  try {
    if (await User.findOne({ email }))
      return res.status(409).json({ error: "อีเมลนี้ถูกใช้สมัครแล้ว" });
    const passwordHash = await bcrypt.hash(password, 10);
    const doc = new User({ name, displayName: name, email, passwordHash, createdAt: new Date(), lastLogin: new Date() });
    doc.uid = doc._id.toString();
    await doc.save();
    const token = jwt.sign({ uid: doc.uid }, JWT_SECRET, { expiresIn: "30d" });
    res.json({ token, user: toPublic(doc) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "กรุณากรอกอีเมลและรหัสผ่าน" });
  try {
    const user = await User.findOne({ email });
    if (!user || !user.passwordHash)
      return res.status(401).json({ error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });
    await User.updateOne({ _id: user._id }, { lastLogin: new Date() });
    const token = jwt.sign({ uid: user.uid }, JWT_SECRET, { expiresIn: "30d" });
    res.json({ token, user: toPublic(user) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/auth/google", async (req, res) => {
  const { credential } = req.body;
  if (!credential) return res.status(400).json({ error: "No credential" });
  try {
    const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: GOOGLE_CLIENT_ID });
    const { email, name, picture } = ticket.getPayload();
    let user = await User.findOne({ email });
    if (!user) {
      const doc = new User({ name, displayName: name, email, photoURL: picture, createdAt: new Date(), lastLogin: new Date() });
      doc.uid = doc._id.toString();
      await doc.save();
      user = doc;
    } else {
      await User.updateOne({ _id: user._id }, { lastLogin: new Date(), photoURL: picture });
      user.photoURL = picture;
    }
    const token = jwt.sign({ uid: user.uid }, JWT_SECRET, { expiresIn: "30d" });
    res.json({ token, user: toPublic(user) });
  } catch (e) {
    res.status(401).json({ error: "Google verification failed" });
  }
});

app.get("/api/auth/me", async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ error: "No token" });
    const { uid } = jwt.verify(token, JWT_SECRET);
    const user = await User.findOne({ uid });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(toPublic(user));
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
});

// ─── Auth middleware ─────────────────────────────────────────────────────────

/** ต้องแนบ Bearer token ที่ถูกต้อง */
const requireAuth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ error: "ต้องเข้าสู่ระบบก่อน" });
    req.auth = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "โทเคนไม่ถูกต้องหรือหมดอายุ" });
  }
};

/** แก้ไขได้เฉพาะข้อมูลของตัวเองเท่านั้น */
const requireSelf = (req, res, next) =>
  req.auth?.uid === req.params.uid
    ? next()
    : res.status(403).json({ error: "ไม่มีสิทธิ์แก้ไขข้อมูลของผู้ใช้อื่น" });

/** อนุญาตให้แก้ได้เฉพาะ field ที่ปลอดภัย — กันการเขียนทับ passwordHash / uid / email */
const EDITABLE_FIELDS = ["name", "displayName", "photoURL"];
const pickEditable = (body = {}) =>
  Object.fromEntries(
    Object.entries(body).filter(([k]) => EDITABLE_FIELDS.includes(k))
  );

// ─── User ─────────────────────────────────────────────────────────────────────

app.get("/api/users/:uid", async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.params.uid });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(toPublic(user));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/users/:uid", requireAuth, requireSelf, async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { uid: req.params.uid },
      { $set: { ...pickEditable(req.body), uid: req.params.uid } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.json(toPublic(user));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.patch("/api/users/:uid", requireAuth, requireSelf, async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { uid: req.params.uid },
      { $set: pickEditable(req.body) },
      { new: true }
    );
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(toPublic(user));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.patch("/api/users/:uid/achievements", requireAuth, requireSelf, async (req, res) => {
  try {
    const { category, achievementId, status = true } = req.body;
    if (!category || !achievementId)
      return res.status(400).json({ error: "category and achievementId required" });
    const user = await User.findOneAndUpdate(
      { uid: req.params.uid },
      { $set: { [`achievements.${category}.${achievementId}`]: status } },
      { new: true, upsert: true }
    );
    res.json(toPublic(user));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/users/:uid/quiz", requireAuth, requireSelf, async (req, res) => {
  try {
    const { quizId, score, max, title } = req.body;
    if (!quizId) return res.status(400).json({ error: "quizId required" });
    await User.findOneAndUpdate(
      { uid: req.params.uid },
      { $set: { [`quizScores.${quizId}`]: { score, max, title, submittedAt: new Date() } } },
      { upsert: true }
    );
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/users/:uid/avatar", requireAuth, requireSelf, upload.single("avatar"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const photoURL = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
    await User.findOneAndUpdate({ uid: req.params.uid }, { $set: { photoURL } });
    res.json({ photoURL });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── Content Schemas ─────────────────────────────────────────────────────────

const articleSchema = new mongoose.Schema(
  { title: String, post_date: String, author: String, category: [String], content: [Mixed], related_articles: Mixed },
  { collection: "articles" }
);
const Article = mongoose.model("Article", articleSchema);

const beanSchema = new mongoose.Schema(
  { name: String, type: [String], img: String, details: String, roast: String, tests: String, tips: String, price: String, order: [Mixed] },
  { collection: "beans" }
);
const Bean = mongoose.model("Bean", beanSchema);

const menuSchema = new mongoose.Schema({}, { strict: false, id: false, collection: "menus" });
const Menu = mongoose.model("Menu", menuSchema);

const quizSchema = new mongoose.Schema(
  { quizId: { type: String, unique: true }, title: String, questions: [Mixed] },
  { collection: "quizzes" }
);
const Quiz = mongoose.model("Quiz", quizSchema);

// ─── Content Routes ───────────────────────────────────────────────────────────

app.get("/api/articles", async (req, res) => {
  try { res.json(await Article.find().lean()); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.get("/api/beans", async (req, res) => {
  try { res.json(await Bean.find().lean()); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.get("/api/menus", async (req, res) => {
  try { res.json(await Menu.find().lean()); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.get("/api/quizzes/:id", async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ quizId: req.params.id }).lean();
    if (!quiz) return res.status(404).json({ error: "Quiz not found" });
    res.json(quiz);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── Knowledge Schemas ────────────────────────────────────────────────────────

const varietySchema = new mongoose.Schema({}, { strict: false, id: false, collection: "coffeeVarieties" });
const CoffeeVariety = mongoose.model("CoffeeVariety", varietySchema);

const roastingSchema = new mongoose.Schema({}, { strict: false, id: false, collection: "roastingLevels" });
const RoastingLevel = mongoose.model("RoastingLevel", roastingSchema);

const processSchema = new mongoose.Schema({}, { strict: false, id: false, collection: "processSteps" });
const ProcessStep = mongoose.model("ProcessStep", processSchema);

const countrySchema = new mongoose.Schema({}, { strict: false, id: false, collection: "coffeeCountries" });
const CoffeeCountry = mongoose.model("CoffeeCountry", countrySchema);

const historySchema = new mongoose.Schema({}, { strict: false, id: false, collection: "coffeeHistory" });
const CoffeeHistory = mongoose.model("CoffeeHistory", historySchema);

const extractionSchema = new mongoose.Schema({}, { strict: false, id: false, collection: "extractionMethods" });
const ExtractionMethod = mongoose.model("ExtractionMethod", extractionSchema);

const simEquipmentSchema = new mongoose.Schema({}, { strict: false, id: false, collection: "simEquipment" });
const SimEquipment = mongoose.model("SimEquipment", simEquipmentSchema);

const simMenuSchema = new mongoose.Schema({}, { strict: false, id: false, collection: "simMenus" });
const SimMenu = mongoose.model("SimMenu", simMenuSchema);

const simNutritionSchema = new mongoose.Schema({}, { strict: false, id: false, collection: "simNutrition" });
const SimNutrition = mongoose.model("SimNutrition", simNutritionSchema);

// ─── Knowledge Routes ─────────────────────────────────────────────────────────

app.get("/api/knowledge/varieties", async (req, res) => {
  try { res.json(await CoffeeVariety.find().lean()); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.get("/api/knowledge/roasting", async (req, res) => {
  try { res.json(await RoastingLevel.find().lean()); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.get("/api/knowledge/process", async (req, res) => {
  try { res.json(await ProcessStep.find().lean()); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.get("/api/knowledge/countries", async (req, res) => {
  try { res.json(await CoffeeCountry.find().lean()); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.get("/api/knowledge/history", async (req, res) => {
  try {
    const doc = await CoffeeHistory.findOne().lean();
    if (!doc) return res.status(404).json({ error: "History not found" });
    res.json(doc);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get("/api/knowledge/extraction", async (req, res) => {
  try { res.json(await ExtractionMethod.find().lean()); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── Simulator Routes ─────────────────────────────────────────────────────────

app.get("/api/sim/equipment", async (req, res) => {
  try { res.json(await SimEquipment.find().lean()); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.get("/api/sim/equipment/:id/menus", async (req, res) => {
  try {
    const eq = await SimEquipment.findOne({ id: req.params.id }).lean();
    if (!eq) return res.status(404).json({ error: "Equipment not found" });
    const menus = await SimMenu.find({ id: { $in: eq.compatibleMenuIds } }).lean();
    res.json(menus);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get("/api/sim/menus", async (req, res) => {
  try { res.json(await SimMenu.find().lean()); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.get("/api/sim/nutrition", async (req, res) => {
  try {
    const doc = await SimNutrition.findOne().lean();
    res.json(doc || {});
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
