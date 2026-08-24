import "dotenv/config";
import mongoose from "mongoose";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/coffebeandb";
const Mixed = mongoose.Schema.Types.Mixed;
const dataDir = path.join(__dirname, "data");
const CoffeeVariety = mongoose.model("CoffeeVariety", new mongoose.Schema({}, { strict: false, id: false, collection: "coffeeVarieties" }));
const RoastingLevel = mongoose.model("RoastingLevel", new mongoose.Schema({}, { strict: false, id: false, collection: "roastingLevels" }));
const ProcessStep   = mongoose.model("ProcessStep",   new mongoose.Schema({}, { strict: false, id: false, collection: "processSteps" }));
const CoffeeCountry = mongoose.model("CoffeeCountry", new mongoose.Schema({}, { strict: false, id: false, collection: "coffeeCountries" }));
const CoffeeHistory = mongoose.model("CoffeeHistory", new mongoose.Schema({}, { strict: false, id: false, collection: "coffeeHistory" }));
const ExtractionMethod = mongoose.model("ExtractionMethod", new mongoose.Schema({}, { strict: false, id: false, collection: "extractionMethods" }));
const SimEquipment     = mongoose.model("SimEquipment",     new mongoose.Schema({}, { strict: false, id: false, collection: "simEquipment" }));
const SimMenu          = mongoose.model("SimMenu",          new mongoose.Schema({}, { strict: false, id: false, collection: "simMenus" }));
const SimNutrition     = mongoose.model("SimNutrition",     new mongoose.Schema({}, { strict: false, id: false, collection: "simNutrition" }));

const Article = mongoose.model("Article", new mongoose.Schema(
  { title: String, post_date: String, author: String, category: [String], content: [Mixed], related_articles: Mixed },
  { collection: "articles" }
));
const Bean = mongoose.model("Bean", new mongoose.Schema(
  { name: String, type: [String], img: String, details: String, roast: String, tests: String, tips: String, price: String, order: [Mixed] },
  { collection: "beans" }
));
const Menu = mongoose.model("Menu", new mongoose.Schema({}, { strict: false, id: false, collection: "menus" }));
const Quiz = mongoose.model("Quiz", new mongoose.Schema(
  { quizId: String, title: String, questions: [Mixed] },
  { collection: "quizzes" }
));

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected:", MONGO_URI);

  const articles = JSON.parse(readFileSync(path.join(dataDir, "article.json"), "utf8"));
  await Article.deleteMany({});
  await Article.insertMany(articles);
  console.log(`✅ articles: ${articles.length}`);

  const beans = JSON.parse(readFileSync(path.join(dataDir, "beanItems.json"), "utf8"));
  await Bean.deleteMany({});
  await Bean.insertMany(beans);
  console.log(`✅ beans: ${beans.length}`);

  const menus = JSON.parse(readFileSync(path.join(dataDir, "menuItems.json"), "utf8"));
  await Menu.deleteMany({});
  await Menu.insertMany(menus);
  console.log(`✅ menus: ${menus.length}`);

  const quizRaw = JSON.parse(readFileSync(path.join(dataDir, "quiz.json"), "utf8"));
  const quizDocs = Object.entries(quizRaw).map(([id, data]) => ({ quizId: id, ...data }));
  await Quiz.deleteMany({});
  await Quiz.insertMany(quizDocs);
  console.log(`✅ quizzes: ${quizDocs.length}`);

  const varieties = JSON.parse(readFileSync(path.join(dataDir, "geneCoffee.json"), "utf8"));
  await CoffeeVariety.deleteMany({});
  await CoffeeVariety.insertMany(varieties);
  console.log(`✅ coffeeVarieties: ${varieties.length}`);

  const roastings = JSON.parse(readFileSync(path.join(dataDir, "roastingLevels.json"), "utf8"));
  await RoastingLevel.deleteMany({});
  await RoastingLevel.insertMany(roastings);
  console.log(`✅ roastingLevels: ${roastings.length}`);

  const steps = JSON.parse(readFileSync(path.join(dataDir, "processSteps.json"), "utf8"));
  await ProcessStep.deleteMany({});
  await ProcessStep.insertMany(steps);
  console.log(`✅ processSteps: ${steps.length}`);

  const countries = JSON.parse(readFileSync(path.join(dataDir, "coffeeCountries.json"), "utf8"));
  await CoffeeCountry.deleteMany({});
  await CoffeeCountry.insertMany(countries);
  console.log(`✅ coffeeCountries: ${countries.length}`);

  const historyRaw = JSON.parse(readFileSync(path.join(dataDir, "coffeeHistory.json"), "utf8"));
  await CoffeeHistory.deleteMany({});
  await CoffeeHistory.insertMany([historyRaw]);
  console.log(`✅ coffeeHistory: 1 document (${historyRaw.sections.length} sections, ${historyRaw.continents.length} continents)`);

  const extraction = JSON.parse(readFileSync(path.join(dataDir, "extractionMethods.json"), "utf8"));
  await ExtractionMethod.deleteMany({});
  await ExtractionMethod.insertMany(extraction);
  console.log(`✅ extractionMethods: ${extraction.length}`);

  const simEq = JSON.parse(readFileSync(path.join(dataDir, "simEquipment.json"), "utf8"));
  await SimEquipment.deleteMany({});
  await SimEquipment.insertMany(simEq);
  console.log(`✅ simEquipment: ${simEq.length}`);

  const simMenus = JSON.parse(readFileSync(path.join(dataDir, "simMenus.json"), "utf8"));
  await SimMenu.deleteMany({});
  await SimMenu.insertMany(simMenus);
  console.log(`✅ simMenus: ${simMenus.length}`);

  const simNutr = JSON.parse(readFileSync(path.join(dataDir, "simNutrition.json"), "utf8"));
  await SimNutrition.deleteMany({});
  await SimNutrition.insertMany([simNutr]);
  console.log(`✅ simNutrition: 1 document`);

  await mongoose.disconnect();
  console.log("Seed complete!");
}

seed().catch((e) => { console.error(e); process.exit(1); });
